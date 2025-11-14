/**
 * CRONJOB MAPPING CARRIER ID WITH PRODUCT CODE
 */

import cron from 'node-cron';
import { PlcVariableConfig } from '@/models/plc-variable-config.model'

import { MappingCarrierCode } from '@/models/mapping-carrier-pick-product-code.model';

import { onceAtATime } from '@/utils/once-at-a-time';

async function doMappingCarrierWithProductCode() {
    

        const currentIndex = await PlcVariableConfig.findOne({key: 'carrier_index' });
        if(currentIndex?.value) {
            const currentMappingRec = await MappingCarrierCode.findOne({carrierPickId: currentIndex.value});
            /**
             * Check if already mapped or not
             */
            if(currentMappingRec){
                if(!currentMappingRec.productCode){
                    const currentPlatingCodeRec = await PlcVariableConfig.findOne({key: 'current_plating_product' });
                    if(currentPlatingCodeRec && currentPlatingCodeRec.value?.code){
                        currentMappingRec.productCode  = currentPlatingCodeRec.value.code;
                        await currentMappingRec.save();
                    }         
                    
                }
            }else {
                const currentPlatingCodeRec = await PlcVariableConfig.findOne({key: 'current_plating_product' });
                if(currentPlatingCodeRec && currentPlatingCodeRec.value?.code){
                    await MappingCarrierCode.create({
                        carrierPickId: currentIndex.value,
                        productCode: currentPlatingCodeRec.value.code
                    })
                } 
            }
            
        }
}

const job = onceAtATime(doMappingCarrierWithProductCode, {
    onSkip: () => {
        console.warn('[mapping-carrier-with-product-code] skip: previous tick still running');
    },
});

export const cronjob = function(){
    console.log("running cronjob Mapping Carrier ID with product code");
    const task = cron.schedule('* * * * * *', async function () {
        
        try {
            await job();
        }
        catch (e){
            console.error(`Error mapping carrier with product code with e `, e)
        }

    })
    return task; 

}


