import 'module-alias/register';
import { connectMongoDB, disconnectMongoDB } from '@/config/mongodb';
import { checkInfluxDB, closeInfluxDB} from '@/config/influxdb';

import { cronjob as randomDataCronjob } from './random-data.cronjob';


async function cronjob(): Promise<void> {
  try {
    await connectMongoDB();
    await checkInfluxDB();


    const task = randomDataCronjob();
    console.log('✅ Cron scheduled and DBs connected');
    

    const shutdown = async (signal: string) => {
        console.log(`\n${signal} received. Shutting down...`);
        try { task.stop(); } catch {}
        await closeInfluxDB();
        await disconnectMongoDB();
        process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    await new Promise<void>(() => {});

  } catch (error) {
    console.error('❌ Cronjob data error:', error);
  } finally {
    await disconnectMongoDB();
    await closeInfluxDB();
  }
}

cronjob().catch(async (e) => {
  console.error('❌ Cron main error:', e);
  try {
    await closeInfluxDB();
    await disconnectMongoDB();
  } finally {
    process.exit(1);
  }
}); 