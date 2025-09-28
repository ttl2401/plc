/**
 * CRONJOB MAPPING CARRIER ID WITH PRODUCT CODE
 */

import cron from 'node-cron';
import { PlcVariableConfig } from '@/models/plc-variable-config.model'

import { MappingCarrierCode } from '@/models/mapping-carrier-pick-product-code.model';


export const cronjob = function(){

    const task = cron.schedule('* * * * * *', async function () {
        console.log("running cronjob Mapping Carrier ID with product code");

        const currentIndex = await PlcVariableConfig.findOne({key: 'carrier_index' });
        if(currentIndex?.value) {
            const currentMappingRec = await MappingCarrierCode.findOne({carrierPickId: currentIndex.value});
            /**
             * Check if already mapped or not
             */
            if(currentMappingRec){
                if(!currentMappingRec.productCode){
                    const currentPlatingCodeRec = await PlcVariableConfig.findOne({key: 'current_plating_product_code' });
                    if(currentPlatingCodeRec && currentPlatingCodeRec.value){
                        currentMappingRec.productCode  = currentPlatingCodeRec.value;
                        await currentMappingRec.save();
                    }         
                    
                }
            }else {
                const currentPlatingCodeRec = await PlcVariableConfig.findOne({key: 'current_plating_product_code' });
                if(currentPlatingCodeRec && currentPlatingCodeRec.value){
                    await MappingCarrierCode.create({
                        carrierPickId: currentIndex.value,
                        productCode: currentPlatingCodeRec.value
                    })
                } 
            }
            
        }
        
    })
    return task; 

}


