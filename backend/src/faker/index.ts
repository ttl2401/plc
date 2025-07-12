import 'module-alias/register';
import { connectMongoDB, disconnectMongoDB } from '@/config/mongodb';
import { checkInfluxDB, closeInfluxDB} from '@/config/influxdb';
import {glob } from 'glob';
import path from 'path';

async function faker(): Promise<void> {
  try {
    await connectMongoDB();
    await checkInfluxDB();

 
    const pattern = path.resolve(__dirname, '../faker/*.faker.ts');
    const files = (await glob(pattern)).sort();
   
    if (files.length) {
      for (let i = 0; i < files.length; i++) {
        const faker = await import(files[i]);   
        const result = await faker.faker();
      }
    } else {
      console.log('No faker imported');
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