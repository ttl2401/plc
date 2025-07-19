import { LiquidWarningService } from '@/services/liquid-warning.service';
import { TankService } from '@/services/tank.service';
const liquidWarningService = new LiquidWarningService();
const tankService = new TankService();

import moment from 'moment';
const level = ['low', 'high'];

const faker = async (): Promise<Boolean> => {
    const tanks = await tankService.getAllActiveTanks();

    const tanksTotal = tanks.length;

    const today = moment().format('YYYY-MM-DD');
    const yesterday = moment().subtract(1, 'd').format('YYYY-MM-DD');
    let beginAt = moment();
    let yesterdayBeginAt = moment().subtract(1, 'd');
    for(let i = 0; i < 6; i++){
        yesterdayBeginAt.add(3, 'm');
        
        const payload = {
            date : yesterday,
            tank: tanks[Math.floor(Math.random() * tanksTotal)].key,
            warningAt: yesterdayBeginAt.toDate(),
            warningLevel: level[Math.floor(Math.random() * 2)]
        }
        await liquidWarningService.createLiquidWarning(payload);

    }


    for(let i = 0; i < 10; i++){
        beginAt.add(5, 'm');
        const payload = {
            date : today,
            tank: tanks[Math.floor(Math.random() * tanksTotal)].key,
            warningAt: beginAt.toDate(),
            warningLevel: level[Math.floor(Math.random() * 2)]
        }
        await liquidWarningService.createLiquidWarning(payload);

    }

    return true;
}

export { faker }; 