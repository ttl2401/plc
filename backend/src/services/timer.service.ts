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


  async getProductCodesFromInflux({
    from,
    to,
    tank,
    page = 1,
    limit = 10,
    search,
  }: {
    from?: number;   // unix second
    to?: number;     // unix second
    tank?: string;
    page?: number;
    limit?: number;
    search?: string;
  }) {
    // 1. Filter timeIn trên _value
    let timeInValueFilter = '';
    if (from) timeInValueFilter += ` and r._value >= ${from}`;
    if (to) timeInValueFilter += ` and r._value <= ${to}`;
    let tankFilter = tank ? ` and r.tank == "${tank}"` : '';
    let searchFilter = search ? ` and r.code =~ /${search}/` : '';
  
    // 2. Query ra các code và min(timeIn) (phân trang)
    const fluxQuery = `
      from(bucket: "${bucket}")
        |> range(start: -300d)
        |> filter(fn: (r) => r._measurement == "information_process"${tankFilter}${searchFilter})
        |> filter(fn: (r) => r._field == "timeIn"${timeInValueFilter})
        |> group(columns: ["code"])
        |> reduce(
            identity: {timeIn: 9999999999, code: ""},
            fn: (r, accumulator) => ({
              timeIn: if r._value < accumulator.timeIn then r._value else accumulator.timeIn,
              code: r.code,
            })
          )
        |> filter(fn: (r) => r.timeIn < 9999999999)
        |> keep(columns: ["code", "timeIn"])
    `;
  
    const codeArr: Array<{ code: string; timeIn: number }> = [];
    await new Promise<void>((resolve, reject) => {
      queryApi.queryRows(fluxQuery, {
        next(row, tableMeta) {
          const o = tableMeta.toObject(row);
          codeArr.push({ code: o.code, timeIn: o.timeIn });
        },
        error: reject,
        complete: resolve,
      });
    });
  
    // 3. Phân trang
    codeArr.sort((a, b) => a.timeIn - b.timeIn);
    const total = codeArr.length;
    let paged: typeof codeArr;
    if (!limit || limit === 0) {
      paged = codeArr; // Lấy hết
    } else {
      const start = (page - 1) * limit;
      paged = codeArr.slice(start, start + limit);
    }
    const pagedCodes = paged.map((c) => c.code);
  
    // 4. Query tất cả tanks của các code này
    const codeListString = JSON.stringify(pagedCodes); // ["code1","code2"]
    const fluxDetailQuery = `
      from(bucket: "${bucket}")
        |> range(start: -300d)
        |> filter(fn: (r) => r._measurement == "information_process")
        |> filter(fn: (r) => contains(value: r.code, set: ${codeListString}))
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
        |> keep(columns: ["_time", "code", "tank", "slot", "timeIn", "timeOut"])
    `;
    const raw: any[] = [];
    await new Promise<void>((resolve, reject) => {
      queryApi.queryRows(fluxDetailQuery, {
        next(row, tableMeta) {
          const o = tableMeta.toObject(row)
          raw.push(o)
        },
        error: reject,
        complete: resolve,
      });
    });
  
    // 5. Gom group như đoạn cũ
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
        tankInfo.code = `${tankInfo.code}_tank_${row.slot}`;
        tankInfo.model = 'Tank';
      }
      
      if (!map.has(row.code)) {
        map.set(row.code, [])
      }
      map.get(row.code)!.push(tankInfo)
    }
    const result = pagedCodes.map(code => ({
      code,
      tanks: (map.get(code) || []).sort((a, b) => a.timeIn - b.timeIn)
    }));
  
    return {
      total,
      page,
      limit,
      result // [{code, tanks}]
    };
  }
}

export const temperatureService = new TimerService(); 