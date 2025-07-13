import { Point } from '@influxdata/influxdb-client'
import { writeApi, queryApi } from '@/config/influxdb'
import { returnMessage, returnError } from '@/controllers/base.controller'
import { Request, Response, NextFunction } from 'express'

// Example data array
const data = [
  { timestamp: 1751658000, value1: 10, value2: 20, value3: 30 },
  { timestamp: 1751658001, value1: 11, value2: 21, value3: 31 },
]

// Write an array of points to InfluxDB
export const writeInflux = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Use req.body.data if provided, else default
    const points = (req.body?.data || data).map((item: { timestamp: number; value1: number; value2: number; value3: number }) => {
      const point = new Point('test_measurement')
        .timestamp(new Date(item.timestamp * 1000))
        .floatField('value1', item.value1)
        .floatField('value2', item.value2)
        .floatField('value3', item.value3)
      return point
    })
    points.forEach((point: Point) => writeApi.writePoint(point))
    await writeApi.flush()
    return res.status(200).json(returnMessage('Data written to InfluxDB', 'Write successful'))
  } catch (error: unknown) {
    return res.status(500).json(returnError(error as Error))
  }
}

// Read points from InfluxDB
export const readInflux = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Use measurement and range from query if provided, else default
    const measurement = req.query.measurement || 'test_measurement';
    const range = req.query.range || '-1d';
    const fluxQuery = `from(bucket: "${process.env.INFLUX_BUCKET || 'plc-influx'}")
      |> range(start: ${range})
      |> filter(fn: (r) => r._measurement == "${measurement}")
      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")`;
    const result: any[] = [];
    await new Promise<void>((resolve, reject) => {
      queryApi.queryRows(fluxQuery, {
        next(row, tableMeta) {
          const o = tableMeta.toObject(row);
          result.push(o);
        },
        error(error) {
          reject(error);
        },
        complete() {
          resolve();
        },
      });
    });
    return res.status(200).json(returnMessage(result, 'Read successful'));
  } catch (error: unknown) {
    return res.status(500).json(returnError(error as Error));
  }
}

