import { ACTIONS } from '@/models/history-chemical-addition.model';
import {  Product  } from '@/models/product.model';
import { RobotWorkingHistoryService } from '@/services/robot-working-history.service';
import { mappingRobotInLine, mappingTankNumberInLine } from '@/config/constant';

const robotWorkingHistoryService = new RobotWorkingHistoryService();

import moment from 'moment';

function randomFrom(min: number, max: number): number {
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      throw new Error("min/max phải là số hợp lệ");
    }
    if (min > max) [min, max] = [max, min];
  
    const minInt = Math.ceil(min);
    const maxInt = Math.floor(max);
    if (minInt > maxInt) {
      throw new Error("Không có số nguyên nào trong khoảng đã cho");
    }
  
    return Math.floor(Math.random() * (maxInt - minInt + 1)) + minInt;
}

const sleep = async (s: number) => {
    return new Promise(resolve => setTimeout(resolve, s * 1000));
}


const faker = async (): Promise<Boolean> => {
    
   
    const products = await Product.find({}, null, {sort: {createdAt: -1}});
    let carrierPick = 1096;

    let checkIfAlreadyFaker = await robotWorkingHistoryService.getOneByQuery({ carrierPick: carrierPick });
    if(checkIfAlreadyFaker){
        return true;
    }
    
    for (let i = 0; i < 15; i++) {
        if(products[i]){
            const product = products[i];
            const productCode = product.code;
            
            let checkHistory = await robotWorkingHistoryService.getOneByQuery({ productCode: productCode, carrierPick: carrierPick });
            if(checkHistory){
                continue;
            }
            console.log(`Start plating product "${productCode}"...`)
            for (let j = 1; j <= 13; j++) {
                const payload: any = {
                        productCode: productCode,
                        robotKey: "robot_1",
                        carrierPick: carrierPick,
                        tankId: j,
                        tankKey: mappingTankNumberInLine[j]?.key,
                    }
                if (j == 1){
                    payload.action = "exit";
                    await robotWorkingHistoryService.create(payload);
                    const delay = randomFrom(3, 8);
                    await sleep(delay);
                }else if (j == 13){
                    payload.action = "enter";
                    await robotWorkingHistoryService.create(payload);
                    const delay = randomFrom(3, 8);
                    await sleep(delay);
                }else {
                    payload.action = "enter";
                    await robotWorkingHistoryService.create(payload);
                    let delay = randomFrom(3, 8);
                    await sleep(delay);

                    payload.action = "exit";
                    await robotWorkingHistoryService.create(payload);
                    delay = randomFrom(3, 8);
                    await sleep(delay);
                }
                
            }

            for (let j = 13; j <= 23; j++) {
                const payload: any = {
                        productCode: productCode,
                        robotKey: "robot_2",
                        carrierPick: carrierPick,
                        tankId: j,
                        tankKey: mappingTankNumberInLine[j]?.key,
                    }
                if (j == 13){
                    payload.action = "exit";
                    await robotWorkingHistoryService.create(payload);
                    const delay = randomFrom(3, 8);
                    await sleep(delay);
                }else if (j == 23){
                    payload.action = "enter";
                    await robotWorkingHistoryService.create(payload);
                    const delay = randomFrom(3, 8);
                    await sleep(delay);
                }else {
                    payload.action = "enter";
                    await robotWorkingHistoryService.create(payload);
                    let delay = randomFrom(3, 8);
                    await sleep(delay);

                    payload.action = "exit";
                    await robotWorkingHistoryService.create(payload);
                    delay = randomFrom(3, 8);
                    await sleep(delay);
                }
                
            }

            for (let j = 23; j <= 35; j++) {
                const payload: any = {
                        productCode: productCode,
                        robotKey: "robot_3",
                        carrierPick: carrierPick,
                        tankId: j,
                        tankKey: mappingTankNumberInLine[j]?.key,
                    }
                if (j == 23){
                    payload.action = "exit";
                    await robotWorkingHistoryService.create(payload);
                    const delay = randomFrom(3, 8);
                    await sleep(delay);
                }else if (j == 35){
                    payload.action = "enter";
                    await robotWorkingHistoryService.create(payload);
                    const delay = randomFrom(3, 8);
                    await sleep(delay);
                }else {
                    payload.action = "enter";
                    await robotWorkingHistoryService.create(payload);
                    let delay = randomFrom(3, 8);
                    await sleep(delay);

                    payload.action = "exit";
                    await robotWorkingHistoryService.create(payload);
                    delay = randomFrom(3, 8);
                    await sleep(delay);
                }
                
            }
            console.log(`End plating product "${productCode}"... Waiting for next product\n...`);

            carrierPick++;
        }
        
    }

    return true;
}

export { faker }; 