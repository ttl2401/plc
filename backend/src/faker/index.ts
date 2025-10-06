import 'module-alias/register';
import { connectMongoDB, disconnectMongoDB } from '@/config/mongodb';
import { checkInfluxDB, closeInfluxDB} from '@/config/influxdb';
import {glob } from 'glob';
import path from 'path';
import { faker as infoFaker } from './info.faker';
import { faker as historyOpFaker } from './history-operation.faker';
import { faker as historyChAddFaker } from './history-chemical-addition.faker';
import { faker as historyWtAddFaker } from './history-water-addition.faker';
import { faker as liquidWarnFaker } from './liquid-warning.faker';
import { faker as robotWorkingHistoryFaker } from './robot-working-history.faker';
import { faker as monitorTankTemperatureAndElectricityFaker } from './product-tank-info-process.faker';

async function faker(): Promise<void> {
  try {
    await connectMongoDB();
    await checkInfluxDB();

    // await infoFaker();
    // await historyOpFaker();
    // await historyChAddFaker();
    // await historyWtAddFaker();
    // await liquidWarnFaker();

    if(process.env.NODE_ENV === 'development'){
      await robotWorkingHistoryFaker();
    }
    if(process.env.NODE_ENV === 'development'){
      await monitorTankTemperatureAndElectricityFaker();
    }
    

  } catch (error) {
    console.error('❌ Faker data error:', error);
  } finally {
    await disconnectMongoDB();
    await closeInfluxDB();
  }
}

faker().catch((e) => {
  console.error(e);
  process.exit(1);
}); 