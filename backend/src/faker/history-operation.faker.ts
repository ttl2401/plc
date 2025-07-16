import { HistoryOperation, ACTIONS } from '@/models/history-operating.model';
import { HistoryOperatingService } from '@/services/history-operating.service';
const historyOperatingService = new HistoryOperatingService();

import moment from 'moment';


const faker = async (): Promise<Boolean> => {
    const today = moment().format('YYYY-MM-DD');
    const yesterday = moment().subtract(1, 'd').format('YYYY-MM-DD');
    let beginAt = moment();
    let yesterdayBeginAt = moment().subtract(1, 'd');
    for(let i = 0; i < 13; i++){
        yesterdayBeginAt.add(10, 's');
        const payload = {
            date : yesterday,
            action : ACTIONS[Math.floor(Math.random() * 2)],
            startedAt: yesterdayBeginAt.toDate(),
            endedAt: yesterdayBeginAt.add(10, 's').toDate()
        }
        await historyOperatingService.createHistoryOperation(payload);

    }


    for(let i = 0; i < 20; i++){
        beginAt.add(10, 's');
        const payload = {
            date : today,
            action : ACTIONS[Math.floor(Math.random() * 2)],
            startedAt: beginAt.toDate(),
            endedAt: beginAt.add(10, 's').toDate()
        }
        await historyOperatingService.createHistoryOperation(payload);

    }

    return true;
}

export { faker }; 