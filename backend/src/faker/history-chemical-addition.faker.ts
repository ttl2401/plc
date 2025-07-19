import { ACTIONS } from '@/models/history-chemical-addition.model';
import { HistoryChemicalAdditionService } from '@/services/history-chemical-addition.service';
const historyChemicalAdditionService = new HistoryChemicalAdditionService();

import moment from 'moment';


const faker = async (): Promise<Boolean> => {
    const today = moment().format('YYYY-MM-DD');
    const yesterday = moment().subtract(1, 'd').format('YYYY-MM-DD');
    let beginAt = moment();
    let yesterdayBeginAt = moment().subtract(1, 'd');
    for(let i = 0; i < 13; i++){
        
        const pumps = [];
        for (let j = 1; j<=3 ; j++){
            if(j == 1){
                yesterdayBeginAt.add(10, 's');
                pumps.push({
                    startedAt: yesterdayBeginAt.toDate(),
                    endedAt: yesterdayBeginAt.add(10, 's').toDate(),
                })
            }else {
                if(Math.floor(Math.random() * 2) == 0 ){
                    pumps.push({
                        startedAt: yesterdayBeginAt.toDate(),
                        endedAt: yesterdayBeginAt.add(10, 's').toDate(),
                    })
                }else {
                    pumps.push({
                        startedAt: null,
                        endedAt: null,
                    })
                }
            }
        }
        const payload = {
            date : yesterday,
            action : ACTIONS[Math.floor(Math.random() * 3)],
            pumps,
            ampereConsumption: Math.floor(Math.random() * 1001) + 1000
        }
        await historyChemicalAdditionService.createHistoryChemicalAddition(payload);

    }


    for(let i = 0; i < 20; i++){
        beginAt.add(10, 's');

        const pumps = [];
        for (let j = 1; j<=3 ; j++){
            if(j == 1){
                beginAt.add(10, 's');
                pumps.push({
                    startedAt: beginAt.toDate(),
                    endedAt: beginAt.add(10, 's').toDate(),
                })
            }else {
                if(Math.floor(Math.random() * 2) == 0 ){
                    pumps.push({
                        startedAt: beginAt.toDate(),
                        endedAt: beginAt.add(10, 's').toDate(),
                    })
                }else {
                    pumps.push({
                        startedAt: null,
                        endedAt: null,
                    })
                }
            }
        }

        const payload = {
            date : today,
            action : ACTIONS[Math.floor(Math.random() * 3)],
            pumps,
            ampereConsumption: Math.floor(Math.random() * 1001) + 1000
        }
        await historyChemicalAdditionService.createHistoryChemicalAddition(payload);

    }

    return true;
}

export { faker }; 