import { InfluxDB } from '@influxdata/influxdb-client';
import { INFLUXDB } from './index';

export const influxDB = new InfluxDB({
  url: INFLUXDB.URL,
  token: INFLUXDB.TOKEN,
});

export const queryApi = influxDB.getQueryApi(INFLUXDB.ORG);
export const writeApi = influxDB.getWriteApi(INFLUXDB.ORG, INFLUXDB.BUCKET, 'ns');

export const closeInfluxDB = async () => {
  try {
    await writeApi.close();
    console.log('InfluxDB connection closed successfully');
  } catch (error) {
    console.error('Error closing InfluxDB connection:', error);
  }
}; 