// Create constant tank which use to know which product is current enter
// to store temperature and ampere

import { MappingTankProductCarrier } from '@/models/mapping-current-tank-product-carrier.model';

import { elementTankMonitorWithTemperatureAndElectric, listTankMonitorWithTemperatureAndElectric  } from '@/config/constant';

const migrate = async (): Promise<Boolean> => {
    for (let i of listTankMonitorWithTemperatureAndElectric ){
        const tankId = Number(i);     
        if (elementTankMonitorWithTemperatureAndElectric[i]){
            const tank = elementTankMonitorWithTemperatureAndElectric[i];
            const payload = {
                tankId,
                tankKey: tank.key
            }

            const exist = await MappingTankProductCarrier.findOne(payload);
            if(!exist){
                await MappingTankProductCarrier.create(payload);
            }
        }
    }

    return true;
};

export { migrate }; 