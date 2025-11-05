/**
 * CRONJOB SYNC TO INCREMENT INDEX OF PLATING PRODUCT
 */

import cron from 'node-cron';

import { PlcVariableConfig } from '@/models/plc-variable-config.model'

import { plcService } from '@/services/singleton.service';
import { onceAtATime } from '@/utils/once-at-a-time';

async function doSyncCarrierIndex() {

    console.log("running cronjob Sync Carrier Cronjob")

            const Ho_Ma_1 = await plcService.readVariableFromPLC("Ho_Ma_1", true);
            const Carrier_Ma_1 = await plcService.readVariableFromPLC("Carrier_Ma_1", true);
                
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

const job = onceAtATime(doSyncCarrierIndex, {
    onSkip: () => {
      // Lần chạy trước chưa xong → bỏ qua nhịp này để tránh đè lệnh PLC
      console.warn('[sync-carrier-index] skip: previous tick still running');
    },
});

export const cronjob = function(){

    const task = cron.schedule('* * * * * *', async function () {
        try {
            await job();
        }
        catch (e){
            console.error(`Error sync carrier index with e `, e)
        }

        
    })

    return task; 

}


