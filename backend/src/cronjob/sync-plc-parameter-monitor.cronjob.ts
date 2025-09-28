/**
 * CRONJOB SYNC PLC PARAMETER TEMPERATURE AND ELECTRICITY
 */

import cron from 'node-cron';

import { PlcVariable } from '@/models/plc-variable.model'
import { PLCService } from '@/services/plc.service';

const plcService = new PLCService();

export const cronjob = async function(){
    const typeTemperature = await PlcVariable.find({ type: 'May_tinh_Nhiet_Muc' }).sort({ name: 1 });
    const typeElectricity = await PlcVariable.find({ type: 'May_tinh_Chinh_luu_R' }).sort({ name: 1 });
    
    const task = cron.schedule('* * * * * *', async function () {
        try {
            console.log("running cronjob Sync Parameter Temperature and Electricity Cronjob");

            if (!plcService.isConnected()){
                return;
            }
            
            const variablesTemperature = await plcService.readVariablesFromPLC({type: 'May_tinh_Nhiet_Muc'}, typeTemperature);
            const variablesElectricity = await plcService.readVariablesFromPLC({type: 'May_tinh_Chinh_luu_R'}, typeElectricity);
            
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


