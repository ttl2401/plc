import 'module-alias/register';
import { connectMongoDB, disconnectMongoDB } from '@/config/mongodb';
import { checkInfluxDB, closeInfluxDB} from '@/config/influxdb';

import { cronjob as randomDataCronjob } from './random-data.cronjob';
import { cronjob as robotDataCronjob } from './robot-data.cronjob';
import { cronjob as syncCarrierIndexCronjob } from './sync-carrier-index.cronjob';
import { cronjob as mappingCarrierWithProductCodeCronjob } from './mapping-carrier-with-product-code.cronjob';
import { cronjob as syncPlcParameterMonitor } from './sync-plc-parameter-monitor.cronjob';


async function cronjob(): Promise<void> {
  try {
    await connectMongoDB();
    await checkInfluxDB();
    
    let task1:any;  
    if(process.env.NODE_ENV === 'development'){
      task1 = randomDataCronjob();
    }
    
    const task4 = mappingCarrierWithProductCodeCronjob();
    const task2 = await robotDataCronjob();
    // const task3 = syncCarrierIndexCronjob();
    const task5 = await syncPlcParameterMonitor();

    console.log('✅ Cron scheduled and DBs connected');
    const shutdown = async (signal: string) => {
        console.log(`\n${signal} received. Shutting down...`);
        try { 
          if(task1){
            task1.stop();
          }
          task2.stop();
          // task3.stop();
          task4.stop();
          task5.stop();
        } catch {}
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