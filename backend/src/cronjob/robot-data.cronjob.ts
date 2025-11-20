import cron from 'node-cron';
import { mappingRobotInLine, mappingTankNumberInLine } from '@/config/constant';

import { PlcVariableConfig } from '@/models/plc-variable-config.model';
import { RobotWorkingHistory } from '@/models/robot-working-history.model';
import { MappingCarrierCode } from '@/models/mapping-carrier-pick-product-code.model';
import { MappingTankProductCarrier } from '@/models/mapping-current-tank-product-carrier.model';

import { elementTankMonitorWithTemperatureAndElectric } from '@/config/constant';

import { plcService } from '@/services/singleton.service';

import { onceAtATime } from '@/utils/once-at-a-time';

const doRobotData = async () => {
        const variablesCarrierWithPLCValues = await plcService.readVariablesFromPLC({type: 'May_tinh_PLC_Send_Carrier'});
        for (const variable of variablesCarrierWithPLCValues){
            variable.value = variable.value ? Math.round(variable.value * 100) / 100 : 0;
        }
        const { objVariables, arrayValues} = plcService.toVariablesObject(variablesCarrierWithPLCValues);
        const Ho_Ma_vao_1: number = objVariables.Ho_Ma_vao_1 || 0;
        const Ho_Ma_vao_2: number = objVariables.Ho_Ma_vao2 || 0;
        const Ho_Ma_vao_3: number = objVariables.Ho_Ma_vao_3 || 0;
        const Ho_Ma_ra_1: number = objVariables.Ho_Ma_ra_1 || 0;
        const Ho_Ma_ra_2: number = objVariables.Ho_Ma_ra_2 || 0;
        const Ho_Ma_ra_3: number = objVariables.Ho_Ma_ra_3 || 0;
        const Ho_Ma_1 = Ho_Ma_vao_1 || Ho_Ma_ra_1;
        const Ho_Ma_2 = Ho_Ma_vao_2 || Ho_Ma_ra_2;
        const Ho_Ma_3 = Ho_Ma_vao_3 || Ho_Ma_ra_3;
        /**
         * ROBOT 1
         */
        console.log(`--objVariables----`, objVariables )
        console.log(`--arrayValues----`, arrayValues )
        if( Ho_Ma_1 > 0) {          
            const Carrier_Ma_1 = objVariables.Carrier_Ma_1 ? parseInt(objVariables.Carrier_Ma_1) : 0;
            // Mapping Carrier Index
            await mappingCarrierIndex(Carrier_Ma_1);

            console.log(`--Carrier_Ma_1---- ${Carrier_Ma_1}`)
            if (Carrier_Ma_1 > 0){
                const Carrier_Ma_vao_1 = objVariables.Carrier_Ma_vao_1 ? parseInt(objVariables.Carrier_Ma_vao_1) : 0;
                const Carrier_Ma_ra_1 = objVariables.Carrier_Ma_ra_1 ? parseInt(objVariables.Carrier_Ma_ra_1) : 0;
                let type = "enter";
                if (Carrier_Ma_ra_1 > 0){
                    type = "exit"
                }

                let productCode;
                // Store in History
                const query: any = {
                    robotKey : mappingRobotInLine[1]?.key,
                    carrierPick :  Carrier_Ma_1, // Id of item in line
                    tankId : Ho_Ma_1,
                    action : type
                }
                const checkHistory = await RobotWorkingHistory.findOne(query);

             
                // reset necessary info to 0
                await plcService.writeVariableToPLC('Carrier_Ma_1', 0, 1);

                if(!checkHistory){
                    query.tankKey = mappingTankNumberInLine[query.tankId]?.key;
                    const checkProductCode = await MappingCarrierCode.findOne({carrierPickId : query.carrierPick })
                    if(checkProductCode) {
                        query.productCode = checkProductCode.productCode;
                        productCode = checkProductCode.productCode;
                    }
                    await RobotWorkingHistory.create(query);
                    
                    // reset necessary info to 0
                    if (checkProductCode){
                        // Apply product settings to PLC
                        const isWritten = await writeProductSettingsToPLC();
                    }
                    


                }else {
                   
                    if (!checkHistory.productCode){
                        const checkProductCode = await MappingCarrierCode.findOne({carrierPickId : query.carrierPick })
                       
                        if(checkProductCode) {
                            checkHistory.productCode = checkProductCode.productCode;
                            productCode = checkProductCode.productCode;
                            await checkHistory.save();

                            // Apply product settings to PLC
                            const isWritten = await writeProductSettingsToPLC();
                        }
                    }
                }

                if(productCode){
                    await mappingTankWithProductAndCarrier(Ho_Ma_1, productCode, Carrier_Ma_1, type);
                }
            }
 
        }



        /**
         * ROBOT 2
         */
        if (Ho_Ma_2 > 0 ){
            const Carrier_Ma_2 = objVariables.Carrier_Ma_2 ? parseInt(objVariables.Carrier_Ma_2) : 0;
            console.log(`--Carrier_Ma_2---- ${Carrier_Ma_2}`)
            if (Carrier_Ma_2 > 0){
                const Carrier_Ma_vao_2 = objVariables.Carrier_Ma_vao_2 ? parseInt(objVariables.Carrier_Ma_vao_2) : 0;
                const Carrier_Ma_ra_2 = objVariables.Carrier_Ma_ra_2 ? parseInt(objVariables.Carrier_Ma_ra_2) : 0;
                let type = "enter";
                if (Carrier_Ma_ra_2 > 0){
                    type = "exit"
                }

                let productCode;
                // Store in History
                const query: any = {
                    robotKey : mappingRobotInLine[2]?.key,
                    carrierPick :  Carrier_Ma_2, // Id of item in line
                    tankId : Ho_Ma_2,
                    action : type
                }

                // reset necessary info to 0
                await plcService.writeVariableToPLC('Carrier_Ma_2', 0, 1)

                const checkHistory = await RobotWorkingHistory.findOne(query);
                
                if(!checkHistory){
                    query.tankKey = mappingTankNumberInLine[query.tankId]?.key;
                    const checkProductCode = await MappingCarrierCode.findOne({carrierPickId : query.carrierPick })
                    if(checkProductCode) {
                        query.productCode = checkProductCode.productCode;
                        productCode = checkProductCode.productCode;
                    }
                    await RobotWorkingHistory.create(query);

             

                }else {
                    if (!checkHistory.productCode){
                        const checkProductCode = await MappingCarrierCode.findOne({carrierPickId : query.carrierPick })
                        if(checkProductCode) {
                            checkHistory.productCode = checkProductCode.productCode;
                            productCode = checkProductCode.productCode;
                            await checkHistory.save();
            
                        }
                    }
                }
                if(productCode){
                    await mappingTankWithProductAndCarrier(Ho_Ma_2, productCode, Carrier_Ma_2, type);
                }
            }
        }


        /**
         * ROBOT 3
         */
        if (Ho_Ma_3 > 0 ){
            const Carrier_Ma_3 = objVariables.Carrier_Ma_3 ? parseInt(objVariables.Carrier_Ma_3) : 0;
            console.log(`--Carrier_Ma_3---- ${Carrier_Ma_3}`)
            if (Carrier_Ma_3 > 0){
                const Carrier_Ma_vao_3 = objVariables.Carrier_Ma_vao_3 ? parseInt(objVariables.Carrier_Ma_vao_3) : 0;
                const Carrier_Ma_ra_3 = objVariables.Carrier_Ma_ra_3 ? parseInt(objVariables.Carrier_Ma_ra_3) : 0;
                let type = "enter";
                if (Carrier_Ma_ra_3 > 0){
                    type = "exit"
                }

                let productCode;
                // Store in History
                const query: any = {
                    robotKey : mappingRobotInLine[3]?.key,
                    carrierPick :  Carrier_Ma_3, // Id of item in line
                    tankId : Ho_Ma_3,
                    action : type
                }

                // reset necessary info to 0
                await plcService.writeVariableToPLC('Carrier_Ma_3', 0, 1)

                const checkHistory = await RobotWorkingHistory.findOne(query);
                if(!checkHistory){
                    query.tankKey = mappingTankNumberInLine[query.tankId]?.key;
                    const checkProductCode = await MappingCarrierCode.findOne({carrierPickId : query.carrierPick })
                    if(checkProductCode) {
                        query.productCode = checkProductCode.productCode;
                        productCode = checkProductCode.productCode;
                    }
                    await RobotWorkingHistory.create(query);



                }else {
                    if (!checkHistory.productCode){
                        const checkProductCode = await MappingCarrierCode.findOne({carrierPickId : query.carrierPick })
                        if(checkProductCode) {
                            checkHistory.productCode = checkProductCode.productCode;
                            productCode = checkProductCode.productCode;
                            await checkHistory.save();
                        }
                    }
                }
                if(productCode){
                    await mappingTankWithProductAndCarrier(Ho_Ma_3, productCode, Carrier_Ma_3, type);
                }
            }
        }
}

const job = onceAtATime( 
    doRobotData, {
    timeoutMs: 5000,
    onSkip: () => {
      console.warn('[read-robot-data] skip: previous tick still running');
    },
});

export const cronjob = async function(){
    console.log("running cronjob Robot Data");

    await PlcVariableConfig.findOneAndUpdate(
        { key: "loading_position" },
        { value: 1 }, 
        { new: true, upsert: true}
    );

    const task = cron.schedule('*/2 * * * * *', async function () {
       
        try {
            await job();
        }
        catch (e){
            console.error(`Error read robot data with e `, e)
        }

        
    })
    return task; 

}


const mappingCarrierIndex = async (Carrier_Ma_1: any) => {
    await PlcVariableConfig.findOneAndUpdate(
        { key: "carrier_index" },
        { value: Carrier_Ma_1 },
        { new: true, upsert: true}
    );
}

const mappingTankWithProductAndCarrier = async (tankId: number, productCode: string, carrierPick: number, type: string ) => {
    if (type == 'enter'){
        const checkExitTankWithProductAndCarrier = await MappingTankProductCarrier.findOne({
            tankId, productCode, carrierPick
        });
        if(!checkExitTankWithProductAndCarrier){
            const tankKey = elementTankMonitorWithTemperatureAndElectric[tankId]?.key;
            if(!tankKey){
                console.warn(`No Mapping Tank Key for Tank Id ${tankId}`)
            }
            await MappingTankProductCarrier.create({
                tankId, productCode, tankKey, carrierPick
            });
        }
    }else if(type == 'exit') {
        await MappingTankProductCarrier.findOneAndUpdate({tankId}, {
            productCode : null,
            carrierPick : null
        })
    }
}

const writeProductSettingsToPLC = async () => {
    const currentPlatingProduct = await PlcVariableConfig.findOne({key: 'current_plating_product' });
    if(currentPlatingProduct && currentPlatingProduct.value?.settings){
        const settings = currentPlatingProduct.value.settings;
        const arraySettings = Object.entries(settings).map(([name, value]) => ({
            name,
            value,
          }));
        await plcService.writeMultipleVariablesToPLC(arraySettings);
        return true;
    }
    return false;
}