import cron from 'node-cron';

import { PlcVariable } from '@/models/plc-variable.model';

const randomTemperature = async function(){
    const plcVariable = await PlcVariable.find({type: 'May_tinh_Nhiet_Muc'});
    for (const variable of plcVariable){
        variable.value = Math.round((Math.random() * 20 + 45) * 100) / 100
        await variable.save();
    }
}
const randomElectricity = async function(){
    const plcVariable = await PlcVariable.find({type: 'May_tinh_Chinh_luu_R'});
    for (const variable of plcVariable){
        variable.value = Math.round((Math.random() * 20 + 50));
        await variable.save();
    }
}

export const cronjob = function(){

    const task = cron.schedule('* * * * * *', async function () {
        console.log("running cronjob")
        await randomTemperature();
        await randomElectricity();
        
    })
    return task; 

}


