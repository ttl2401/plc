/**
 * CRONJOB SYNC TO INCREMENT INDEX OF PLATING PRODUCT
 */

import cron from 'node-cron';

import { PlcVariableConfig } from '@/models/plc-variable-config.model'
import { PLCService } from '@/services/plc.service';


const pLCService = new PLCService();
export const cronjob = function(){

    const task = cron.schedule('* * * * * *', async function () {
        try {
            console.log("running cronjob Sync Carrier Cronjob")

            const Ho_Ma_1 = await pLCService.readVariableFromPLC("Ho_Ma_1", true);
            const Carrier_Ma_1 = await pLCService.readVariableFromPLC("Carrier_Ma_1", true);
                
            await PlcVariableConfig.findOneAndUpdate(
                { key: "loading_position" },
                { value: Ho_Ma_1 },
                { new: true, upsert: true}
            );

            await PlcVariableConfig.findOneAndUpdate(
                { key: "carrier_index" },
                { value: parseInt(Carrier_Ma_1) },
                { new: true, upsert: true}
            );
        }
        catch (e){
            console.error(`Error sync carrier index with e `, e)
        }

        
    })

    return task; 

}


