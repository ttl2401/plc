/**
 * CRONJOB SYNC PLC PARAMETER TEMPERATURE AND ELECTRICITY
 */

import cron from 'node-cron';

import { temperatureVariableControl, electricityVariableControl } from '@/config/plc.variable';
import { listTankMonitorWithTemperatureAndElectric } from '@/config/constant';
import { PlcVariable } from '@/models/plc-variable.model';
import { MappingTankProductCarrier, IMappingTankProductCarrier } from '@/models/mapping-current-tank-product-carrier.model';
import { PLCService } from '@/services/plc.service';
import { Point } from '@influxdata/influxdb-client'
import { writeApi, queryApi } from '@/config/influxdb'

const plcService = new PLCService();

type ControlItem = {
    name: string;
    dbNumber?: number;
    dataType?: string;
    tankId: number;              // đã lọc chỉ còn item có tankId
};
  
type RespItem = {
    name: string;
    value: number;               // giá đọc từ PLC
    dbNumber?: number;
    dataType?: string;
};

type TankMerged = {
    tankId: number;
    valueTemperature: number | null;
    valueElectricity: number | null;
};
  

function buildNameToTankId(control: ControlItem[]): Record<string, number> {
    const idx: Record<string, number> = Object.create(null); // không prototype
    for (let i = 0; i < control.length; i++) {
      const it = control[i]!;
      idx[it.name] = it.tankId;
    }
    return idx;
}

function mergeTemperatureAndElectricity(
    tempControl: ControlItem[],
    tempResp: RespItem[],
    elecControl: ControlItem[],
    elecResp: RespItem[],
    includeTankIds: number[] = []
  ): TankMerged[] {
    // name -> tankId
    const tempNameToTankId = buildNameToTankId(tempControl);
    const elecNameToTankId = buildNameToTankId(elecControl);
  
    // tankId -> value
    const tempByTank: Record<number, number> = Object.create(null);
    for (let i = 0; i < tempResp.length; i++) {
      const r = tempResp[i]!;
      const tankId = tempNameToTankId[r.name];
      if (tankId !== undefined && Number.isFinite(r.value)) {
        tempByTank[tankId] = r.value;
      }
    }
  
    const elecByTank: Record<number, number> = Object.create(null);
    for (let i = 0; i < elecResp.length; i++) {
      const r = elecResp[i]!;
      const tankId = elecNameToTankId[r.name];
      if (tankId !== undefined && Number.isFinite(r.value)) {
        elecByTank[tankId] = r.value;
      }
    }
  
    // Hợp nhất danh sách tankId: từ temp, elec và includeTankIds
    const seen: Record<number, 1> = Object.create(null);
    const tankIds: number[] = [];
  
    // từ tempByTank
    for (const k in tempByTank) {
      const id = (k as unknown as number);
      if (seen[id] === undefined) { seen[id] = 1; tankIds.push(id); }
    }
    // từ elecByTank
    for (const k in elecByTank) {
      const id = (k as unknown as number);
      if (seen[id] === undefined) { seen[id] = 1; tankIds.push(id); }
    }
    // từ includeTankIds
    for (let i = 0; i < includeTankIds.length; i++) {
      const id = includeTankIds[i]!;
      if (typeof id === 'number' && Number.isFinite(id) && seen[id] === undefined) {
        seen[id] = 1; tankIds.push(id);
      }
    }
  
  
    // Build output
    const out: TankMerged[] = new Array(tankIds.length);
    for (let i = 0; i < tankIds.length; i++) {
      const id = tankIds[i]!;
      const vt = tempByTank[id];
      const ve = elecByTank[id];
      out[i] = {
        tankId: id,
        valueTemperature: vt === undefined ? null : vt,
        valueElectricity: ve === undefined ? null : ve,
      };
    }
    return out;
}

function toTankMap(
    rows: IMappingTankProductCarrier[]
  ): Record<number, { productCode: string | null; carrierPick: number | null }> {
    const map: Record<number, { productCode: string | null; carrierPick: number | null }> = {};
    for (const r of rows) {
      map[r.tankId] = {
        productCode: r.productCode ?? null,
        carrierPick: r.carrierPick ?? null,
      };
    }
    return map;
}


export const cronjob = async function(){
    const typeTemperature = await PlcVariable.find({ type: 'May_tinh_Nhiet_Muc' }).sort({ name: 1 });
    const typeElectricity = await PlcVariable.find({ type: 'May_tinh_Chinh_luu_R' }).sort({ name: 1 });
    
    const listTemperatureWithTankId: ControlItem[] = temperatureVariableControl.filter(e => e.tankId != null);
    const listElectricityWithTankId: ControlItem[] = electricityVariableControl.filter(e => e.tankId != null);

    const task = cron.schedule('* * * * * *', async function () {
        try {
            console.log("running cronjob Sync Parameter Temperature and Electricity Cronjob");

            if (!plcService.isConnected()){
              console.log("PLC not connected. Sync failed");
                return;
            }
            
            const variablesTemperature = await plcService.readVariablesFromPLC({type: 'May_tinh_Nhiet_Muc'}, typeTemperature);
            const variablesElectricity = await plcService.readVariablesFromPLC({type: 'May_tinh_Chinh_luu_R'}, typeElectricity);
            
            console.log("variablesTemperature", variablesTemperature);
            console.log("variablesElectricity", variablesElectricity);
            
            await storePlcVariablesToInflux(
                listTemperatureWithTankId, variablesTemperature, 
                listElectricityWithTankId, variablesElectricity,
                listTankMonitorWithTemperatureAndElectric
            );


            const opsTemp = variablesTemperature.map(({ name, type, value }) => ({
                updateOne: {
                  filter: { name, ...(type ? { type } : {}) },
                  update: { $set: { value, updatedAt: new Date() } },
                  upsert: false,
                },
            }));
            await PlcVariable.bulkWrite(opsTemp, { ordered: false });

            const opsElec = variablesElectricity.map(({ name, type, value }) => ({
                updateOne: {
                  filter: { name, ...(type ? { type } : {}) },
                  update: { $set: { value, updatedAt: new Date() } },
                  upsert: false,
                },
            }));
            await PlcVariable.bulkWrite(opsElec, { ordered: false });

        }
        catch (e){
            console.error(`Error sync carrier index with e `, e)
        }

        
    })

    return task; 

}



async function storePlcVariablesToInflux(
    listTemperatureWithTankId: ControlItem[], variablesTemperature: any[], 
    listElectricityWithTankId: ControlItem[], variablesElectricity: any[],
    listTankIds: number[]
){
    const ArrayMapAfterConvert = mergeTemperatureAndElectricity(
        listTemperatureWithTankId,
        variablesTemperature,
        listElectricityWithTankId,
        variablesElectricity,
        listTankIds, // đảm bảo có đủ các tank cần theo dõi
      );
    // Check Xem tank đang có product và carrier id nào
    const getCurrentTanksProductCarrier = await MappingTankProductCarrier.find({
        tankId : {
            $in : listTankIds
        }
    })

    const objectTankProductCarrierValues = toTankMap(getCurrentTanksProductCarrier);

    // Store to influxDB
    const points: Point[] = [];
    const nowSec = Math.floor(Date.now() / 1000);

    for (let i = 0; i < ArrayMapAfterConvert.length; i++) {
        const it = ArrayMapAfterConvert[i]!;
        const meta = objectTankProductCarrierValues[it.tankId];
        if (!meta || meta.productCode == null || meta.carrierPick == null) continue;

        // Mặc định 0 nếu không có/không hợp lệ
        const temp = (typeof it.valueTemperature === 'number' && Number.isFinite(it.valueTemperature))
        ? it.valueTemperature : 0;
        const elec = (typeof it.valueElectricity === 'number' && Number.isFinite(it.valueElectricity))
        ? it.valueElectricity : 0;

        const p = new Point("info_tank_process")
        .tag("code", meta.productCode)
        .tag("tank", String(it.tankId))
        .tag("carrier", String(meta.carrierPick))
        .floatField("temperature", temp)
        .floatField("electricity", elec)
        .timestamp(nowSec);

        points.push(p);
    }

    if (points.length > 0) {
        writeApi.writePoints(points);
        await writeApi.flush();
    }
}