import cron from 'node-cron';
import { mappingRobotInLine, mappingTankNumberInLine } from '@/config/constant';
import { PLCService } from '@/services/plc.service';
import { PlcVariableConfig } from '@/models/plc-variable-config.model';
import { RobotWorkingHistory } from '@/models/robot-working-history.model';
import { MappingCarrierCode } from '@/models/mapping-carrier-pick-product-code.model';

const plcService = new PLCService();

export const cronjob = async function(){
    console.log("running cronjob Robot Data");

    await PlcVariableConfig.findOneAndUpdate(
        { key: "loading_position" },
        { value: 1 }, // Currently loading position only at position 1
        { new: true, upsert: true}
    );

    const task = cron.schedule('* * * * * *', async function () {
       
        const variablesCarrierWithPLCValues = await plcService.readVariablesFromPLC({type: 'May_tinh_PLC_Send_Carrier'});
        for (const variable of variablesCarrierWithPLCValues){
            variable.value = variable.value ? Math.round(variable.value * 100) / 100 : 0;
        }
        const objVariables = plcService.toVariablesObject(variablesCarrierWithPLCValues);
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
        if( Ho_Ma_1 > 0) {          
            const Carrier_Ma_1 = objVariables.Carrier_Ma_1 ? parseInt(objVariables.Carrier_Ma_1) : 0;
            // Mapping Carrier Index
            await mappingCarrierIndex(Carrier_Ma_1);
            if (Carrier_Ma_1 > 0){
                const Carrier_Ma_vao_1 = objVariables.Carrier_Ma_vao_1 ? parseInt(objVariables.Carrier_Ma_vao_1) : 0;
                const Carrier_Ma_ra_1 = objVariables.Carrier_Ma_ra_1 ? parseInt(objVariables.Carrier_Ma_ra_1) : 0;
                let type = "enter";
                if (Carrier_Ma_ra_1 > 0){
                    type = "exit"
                }

                // Store in History
                const query: any = {
                    robotKey : mappingRobotInLine[1],
                    carrierPick :  Carrier_Ma_1, // Id of item in line
                    tankId : Ho_Ma_1,
                    action : type
                }
                const checkHistory = await RobotWorkingHistory.findOne(query);
                if(!checkHistory){
                    query.tankKey = mappingTankNumberInLine[query.tankId]?.key;
                    const checkProductCode = await MappingCarrierCode.findOne({carrierPickId : query.carrierPick })
                    if(checkProductCode) {
                        query.productCode = checkProductCode.productCode;
                    }
                    await RobotWorkingHistory.create(query);

                    // reset necessary info to 0
                    await plcService.writeVariableToPLC('Carrier_Ma_1', 0)


                }else {
                    if (!checkHistory.productCode){
                        const checkProductCode = await MappingCarrierCode.findOne({carrierPickId : query.carrierPick })
                        if(checkProductCode) {
                            checkHistory.productCode = checkProductCode.productCode;
                            await checkHistory.save();
                        }
                    }
                }
            }
 
        }



        /**
         * ROBOT 2
         */
        if (Ho_Ma_2 > 0 ){
            const Carrier_Ma_2 = objVariables.Carrier_Ma_2 ? parseInt(objVariables.Carrier_Ma_2) : 0;
        
            if (Carrier_Ma_2 > 0){
                const Carrier_Ma_vao_2 = objVariables.Carrier_Ma_vao_2 ? parseInt(objVariables.Carrier_Ma_vao_2) : 0;
                const Carrier_Ma_ra_2 = objVariables.Carrier_Ma_ra_2 ? parseInt(objVariables.Carrier_Ma_ra_2) : 0;
                let type = "enter";
                if (Carrier_Ma_ra_2 > 0){
                    type = "exit"
                }

                // Store in History
                const query: any = {
                    robotKey : mappingRobotInLine[2],
                    carrierPick :  Carrier_Ma_2, // Id of item in line
                    tankId : Ho_Ma_2,
                    action : type
                }
                const checkHistory = await RobotWorkingHistory.findOne(query);
                if(!checkHistory){
                    query.tankKey = mappingTankNumberInLine[query.tankId]?.key;
                    const checkProductCode = await MappingCarrierCode.findOne({carrierPickId : query.carrierPick })
                    if(checkProductCode) {
                        query.productCode = checkProductCode.productCode;
                    }
                    await RobotWorkingHistory.create(query);

                    // reset necessary info to 0
                    await plcService.writeVariableToPLC('Carrier_Ma_2', 0)


                }else {
                    if (!checkHistory.productCode){
                        const checkProductCode = await MappingCarrierCode.findOne({carrierPickId : query.carrierPick })
                        if(checkProductCode) {
                            checkHistory.productCode = checkProductCode.productCode;
                            await checkHistory.save();
                        }
                    }
                }
            }
        }


        /**
         * ROBOT 3
         */
        if (Ho_Ma_3 > 0 ){
            const Carrier_Ma_3 = objVariables.Carrier_Ma_3 ? parseInt(objVariables.Carrier_Ma_3) : 0;
        
            if (Carrier_Ma_3 > 0){
                const Carrier_Ma_vao_3 = objVariables.Carrier_Ma_vao_3 ? parseInt(objVariables.Carrier_Ma_vao_3) : 0;
                const Carrier_Ma_ra_3 = objVariables.Carrier_Ma_ra_3 ? parseInt(objVariables.Carrier_Ma_ra_3) : 0;
                let type = "enter";
                if (Carrier_Ma_ra_3 > 0){
                    type = "exit"
                }

                // Store in History
                const query: any = {
                    robotKey : mappingRobotInLine[3],
                    carrierPick :  Carrier_Ma_3, // Id of item in line
                    tankId : Ho_Ma_3,
                    action : type
                }
                const checkHistory = await RobotWorkingHistory.findOne(query);
                if(!checkHistory){
                    query.tankKey = mappingTankNumberInLine[query.tankId]?.key;
                    const checkProductCode = await MappingCarrierCode.findOne({carrierPickId : query.carrierPick })
                    if(checkProductCode) {
                        query.productCode = checkProductCode.productCode;
                    }
                    await RobotWorkingHistory.create(query);

                    // reset necessary info to 0
                    await plcService.writeVariableToPLC('Carrier_Ma_3', 0)


                }else {
                    if (!checkHistory.productCode){
                        const checkProductCode = await MappingCarrierCode.findOne({carrierPickId : query.carrierPick })
                        if(checkProductCode) {
                            checkHistory.productCode = checkProductCode.productCode;
                            await checkHistory.save();
                        }
                    }
                }
            }
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

