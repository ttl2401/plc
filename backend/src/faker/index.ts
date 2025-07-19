import 'module-alias/register';
import { connectMongoDB, disconnectMongoDB } from '@/config/mongodb';
import { checkInfluxDB, closeInfluxDB} from '@/config/influxdb';
import {glob } from 'glob';
import path from 'path';
import { faker as infoFaker } from './info.faker';
import { faker as historyOpFaker } from './history-operation.faker';
import { faker as historyChAddFaker } from './history-chemical-addition.faker';
import { faker as historyWtAddFaker } from './history-water-addition.faker';

async function faker(): Promise<void> {
  try {
    await connectMongoDB();
    await checkInfluxDB();

    // await infoFaker();
    // await historyOpFaker();
    // await historyChAddFaker();
    // await historyWtAddFaker();

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