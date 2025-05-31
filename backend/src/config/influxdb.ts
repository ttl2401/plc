import { InfluxDB } from '@influxdata/influxdb-client';
import dotenv from 'dotenv';

dotenv.config();

const INFLUX_URL = process.env.INFLUX_URL || 'http://localhost:8086';
const INFLUX_TOKEN = process.env.INFLUX_TOKEN || '';
const INFLUX_ORG = process.env.INFLUX_ORG || 'my-org';
const INFLUX_BUCKET = process.env.INFLUX_BUCKET || 'plc-data';

export const influxDB = new InfluxDB({
  url: INFLUX_URL,
  token: INFLUX_TOKEN,
});

export const queryApi = influxDB.getQueryApi(INFLUX_ORG);
export const writeApi = influxDB.getWriteApi(INFLUX_ORG, INFLUX_BUCKET, 'ns');

export const closeInfluxDB = async () => {
  try {
    await writeApi.close();
    console.log('InfluxDB connection closed successfully');
  } catch (error) {
    console.error('InfluxDB close error:', error);
  }
}; 