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


  async escapeRegex(src: string) {
    return src.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  }

  /**
   * Lấy danh sách dữ liệu theo cặp [code, carrier], có pagination.
   * Mỗi item chứa danh sách tanks: { tankId, timeIn, timeOut, temperature(avg), electricity(avg) }.
   *
   * @param opts.page số trang (1-based)
   * @param opts.limit số item / trang
   * @param opts.search lọc code (regex contains, optional)
   * @param opts.from timestamp (seconds) hoặc Flux duration (vd: -30d); mặc định -30d
   * @param opts.to   timestamp (seconds) hoặc now; mặc định now()
   */
  async getInformationByCodeCarrier(opts: {
    page?: number;
    limit?: number;
    search?: string;               // lọc code chứa chuỗi này (regex)
    from?: number | string;        // epoch-seconds hoặc Flux duration (vd: -7d)
    to?: number | string;          // epoch-seconds hoặc now()
  }) {
    const page  = Math.max(1, Number(opts.page ?? 1));
    const limit = Math.max(1, Number(opts.limit ?? 10));
    const search = (opts.search ?? '').trim();
  
    const rangeStart = typeof opts.from === 'number'
      ? `time(v: ${Number(opts.from)}s)`
      : (typeof opts.from === 'string' ? opts.from : '-30d');
    const rangeStop = typeof opts.to === 'number'
      ? `time(v: ${Number(opts.to)}s)`
      : (typeof opts.to === 'string' ? opts.to : 'now()');
  
    // 1) Lấy toàn bộ cặp DISTINCT [code, carrier] (1 dòng / 1 cặp), chú ý first(column:"_time")
    const rawSearch = String(opts.search ?? '').trim();

// 1) Nếu bạn muốn MATCH CHÍNH XÁC code:
const searchClause = rawSearch
  ? `|> filter(fn: (r) => r.code == "${rawSearch}")`
  : "";
    const pairsFlux = `
from(bucket: "${bucket}")
  |> range(start: ${rangeStart}, stop: ${rangeStop})
  |> filter(fn: (r) => r._measurement == "info_tank_process")
  ${searchClause}
  |> keep(columns: ["_time", "code", "carrier"])     // giữ duy nhất 3 cột, bỏ _field/_value
  |> group(columns: ["code", "carrier"])              // group theo cặp
  |> first(column: "_time")                           // lấy 1 dòng/1 cặp, không còn va schema
  |> keep(columns: ["code", "carrier"])               // chỉ trả về 2 cột cần dùng
`;
    type Pair = { code: string; carrier: string };
    const allPairs: Pair[] = [];
  
    await new Promise<void>((resolve, reject) => {
      queryApi.queryRows(pairsFlux, {
        next: (row, tm) => {
          const o = tm.toObject(row) as any;
          if (o.code != null && o.carrier != null) {
            allPairs.push({ code: String(o.code), carrier: String(o.carrier) });
          }
        },
        error: reject,
        complete: resolve,
      });
    });
  
    // 2) Pagination ở Node
    const totalDocs = allPairs.length;
    allPairs.sort((a, b) => (a.code === b.code ? a.carrier.localeCompare(b.carrier) : a.code.localeCompare(b.code)));
    const start = (page - 1) * limit;
    const slice = allPairs.slice(start, start + limit);
  
    // 3) Với mỗi cặp trên trang: tổng hợp theo tank bằng reduce (1 dòng / tank)
    const docs: Array<{
      code: string;
      carrier: string;
      tanks: Array<{ tankId: string; timeIn: number; timeOut: number; temperature: number; electricity: number }>;
    }> = [];
  
    for (const { code, carrier } of slice) {
      const fluxAggOnePair = `
from(bucket: "${bucket}")
  |> range(start: ${rangeStart}, stop: ${rangeStop})
  |> filter(fn: (r) => r._measurement == "info_tank_process" and r.code == "${code}" and r.carrier == "${carrier}")
  |> pivot(rowKey:["_time"], columnKey:["_field"], valueColumn:"_value")
  |> keep(columns: ["_time", "tank", "temperature", "electricity"])
  |> map(fn: (r) => ({ r with ts: uint(v: r._time) }))  // epoch ns (uint)
  |> group(columns: ["tank"])
  |> reduce(
      identity: {minTs: uint(v: now()), maxTs: uint(v: 0), sumT: 0.0, cntT: 0.0, sumE: 0.0, cntE: 0.0},
      fn: (r, accumulator) => ({
        minTs: if accumulator.minTs > r.ts then r.ts else accumulator.minTs,
        maxTs: if accumulator.maxTs < r.ts then r.ts else accumulator.maxTs,
        sumT: accumulator.sumT + (if exists r.temperature then float(v: r.temperature) else 0.0),
        cntT: accumulator.cntT + (if exists r.temperature then 1.0 else 0.0),
        sumE: accumulator.sumE + (if exists r.electricity then float(v: r.electricity) else 0.0),
        cntE: accumulator.cntE + (if exists r.electricity then 1.0 else 0.0),
      })
    )
  |> map(fn: (r) => ({
      tankId: r.tank,
      timeIn: int(v: r.minTs),     // ns -> int; bạn chia 1e9 ở Node để ra giây
      timeOut: int(v: r.maxTs),
      avgT: if r.cntT > 0.0 then r.sumT / r.cntT else 0.0,
      avgE: if r.cntE > 0.0 then r.sumE / r.cntE else 0.0,
    }))
  |> keep(columns: ["tankId", "timeIn", "timeOut", "avgT", "avgE"])
`;
  
      type Row = { tankId: string; timeIn: number; timeOut: number; avgT: number; avgE: number };
      const tanks: Array<{ tankId: string; timeIn: number; timeOut: number; temperature: number; electricity: number }> = [];
  
      await new Promise<void>((resolve, reject) => {
        queryApi.queryRows(fluxAggOnePair, {
          next: (row, tm) => {
            const o = tm.toObject(row) as any as Row;
            const timeInSec = Math.floor(Number(o.timeIn) / 1_000_000_000);
            const timeOutSec = Math.floor(Number(o.timeOut) / 1_000_000_000);
            tanks.push({
              tankId: String(o.tankId),
              timeIn: timeInSec,
              timeOut: timeOutSec,
              temperature: Number(Number(o.avgT).toFixed(2)), // float 2 số
              electricity: Math.round(Number(o.avgE)),        // int
            });
          },
          error: reject,
          complete: resolve,
        });
      });
  
      tanks.sort((a, b) => Number(a.tankId) - Number(b.tankId));
      docs.push({ code, carrier, tanks });
    }
  
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit));
    const pageClamped = Math.min(page, totalPages);
  
    return {
      docs,
      totalDocs,
      page: pageClamped,
      limit,
      totalPages,
      hasPrevPage: pageClamped > 1,
      hasNextPage: pageClamped < totalPages,
      prevPage: pageClamped > 1 ? pageClamped - 1 : null,
      nextPage: pageClamped < totalPages ? pageClamped + 1 : null,
      pagingCounter: (pageClamped - 1) * limit + 1,
    };
  }
}

export const temperatureService = new TemperatureService(); 