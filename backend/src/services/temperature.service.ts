import { queryApi } from '@/config/influxdb';
import { INFLUXDB } from '@/config/index';
const bucket = INFLUXDB.BUCKET;

export class TemperatureService {
  /**
   * Get temperature data for an array of codes, optionally filtered by time (ISO string or relative, e.g. -1h)
   * @param codes string[]
   * @param time string | undefined
   * @returns Promise<any[]>
   */
  async getTemperatureByCodes(codes: string[], time?: string): Promise<any[]> {
    if (!codes || codes.length === 0) return [];
    // Build filter for codes
    const codeFilter = codes.map(code => `r.code == "${code}"`).join(' or ');
    // Use time or default to -1d
    const range = time ? `|> range(start: ${time})` : '|> range(start: -1d)';
    const fluxQuery = `from(bucket: "${process.env.INFLUX_BUCKET || 'plc-influx'}")
      ${range}
      |> filter(fn: (r) => r._measurement == "temperature" and (${codeFilter}))
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
    // Map results by code
    const resultMap = new Map<string, any>();
    result.forEach(r => {
      if (r.code) resultMap.set(r.code, r);
    });
    // Ensure every code has a result
    return codes.map(code => resultMap.get(code) || { code });
  }



  /**
   * Retrieve temperature information from InfluxDB for an array of product codes.
   * @param productCodes string[] - Array of product codes
   * @returns Promise<any[]> - Array of temperature information objects
   */
  async getInformationTemperature(productCodes: string[]): Promise<any[]> {
    if (!Array.isArray(productCodes) || productCodes.length === 0) return [];

    // Build OR filter cho nhiều code
    const codeFilter = productCodes.map(code => `r.code == "${code}"`).join(' or ')

    // Flux query: lọc measurement và code, gom tank theo code
    const fluxQuery = `
      from(bucket: "${bucket}")
        |> range(start: -300d)
        |> filter(fn: (r) => r._measurement == "information_process")
        |> filter(fn: (r) => ${codeFilter})
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
        |> keep(columns: ["_time", "code", "tank", "temperature", "ampere", "slot", "timeIn", "timeOut"])
    `

    const raw: any[] = []

    await new Promise<void>((resolve, reject) => {
      queryApi.queryRows(fluxQuery, {
        next(row, tableMeta) {
          const o = tableMeta.toObject(row)
          raw.push(o)
        },
        error(err) {
          console.error('❌ Influx query error:', err)
          reject(err)
        },
        complete() {
          resolve()
        },
      })
    })

    // Gom theo code:
    const map = new Map<string, any[]>()

    for (const row of raw) {
      const tankInfo: any = {
        name: row.tank,
        timeIn: row.timeIn,
        timeOut: row.timeOut,
      }

      if (row.temperature !== undefined) tankInfo.temperature = row.temperature
      if (row.ampere !== undefined) tankInfo.ampere = row.ampere
      if (row.slot !== undefined) tankInfo.slot = row.slot

      if (!map.has(row.code)) {
        map.set(row.code, [])
      }
      map.get(row.code)!.push(tankInfo)
    }

    const result = Array.from(map.entries()).map(([code, tanks]) => ({
      code,
      tanks: tanks.sort((a, b) => a.timeIn - b.timeIn)
    }))
    return result
  };

  /**
   * Check product already has information or not
   * @param code code
   * @returns 
   */
  async isProductExistInInflux (code: string): Promise<boolean>  {
    const fluxQuery = `
      from(bucket: "${bucket}")
        |> range(start: -300d)
        |> filter(fn: (r) => r._measurement == "information_process")
        |> filter(fn: (r) => r.code == "${code}")
        |> limit(n: 1)
    `;
  
    return new Promise((resolve, reject) => {
      let found = false;
  
      queryApi.queryRows(fluxQuery, {
        next() {
          found = true;
        },
        error(err) {
          console.error(`❌ Influx query error for code ${code}:`, err);
          reject(err);
        },
        complete() {
          resolve(found);
        },
      });
    });
  };
}

export const temperatureService = new TemperatureService(); 