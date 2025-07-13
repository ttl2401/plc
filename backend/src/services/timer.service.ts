import { queryApi } from '@/config/influxdb';
import { INFLUXDB } from '@/config/index';
const bucket = INFLUXDB.BUCKET;

export class TimerService {
  

  /**
   * Retrieve timer information from InfluxDB for an array of product codes.
   * @param productCodes string[] - Array of product codes
   * @returns Promise<any[]> - Array of timer information objects
   */
  async getInformationTimer(productCodes: string[]): Promise<any[]> {
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
        |> keep(columns: ["_time", "code", "tank", "slot", "timeIn", "timeOut"])
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
        code: row.tank,
        model: 'TankGroup',
        timeIn: row.timeIn,
        timeOut: row.timeOut,
      }

      if (row.slot !== undefined) {
        tankInfo.slot = row.slot;
        tankInfo.code = `${tankInfo.code}_tank_${row.slot}`,
        tankInfo.model = 'Tank'
      }
      
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
  } 
}

export const temperatureService = new TimerService(); 