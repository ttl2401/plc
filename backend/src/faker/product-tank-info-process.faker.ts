import { Product } from '@/models/product.model';
import { Point } from '@influxdata/influxdb-client'
import { writeApi, queryApi } from '@/config/influxdb'
import { listTankMonitorWithTemperature, listTankMonitorWithElectric, listTankMonitorWithTemperatureAndElectric } from '@/config/constant';
import { INFLUXDB } from '@/config/index';
const bucket = INFLUXDB.BUCKET;


/** sleep tiện dụng */
const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

/** random số nguyên trong [min,max] */
const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/** random số thực trong [min,max], làm tròn fixed chữ số thập phân */
const randFloat = (min: number, max: number, fixed = 2) => {
  const v = Math.random() * (max - min) + min;
  return parseFloat(v.toFixed(fixed));
};

/** áp dụng drift <= maxPct giữa 2 lần liên tiếp, kẹp theo [min,max] */
const driftFloat = (prev: number, min: number, max: number, maxPct = 0.05, fixed = 2) => {
  const delta = Math.min(Math.abs(prev) * maxPct, Math.abs(max - min)); // biên độ tối đa
  const low = Math.max(min, prev - delta);
  const high = Math.min(max, prev + delta);
  const v = Math.random() * (high - low) + low;
  return parseFloat(v.toFixed(fixed));
};

const driftInt = (prev: number, min: number, max: number, maxPct = 0.05) => {
  const delta = Math.max(1, Math.floor(Math.abs(prev) * maxPct)); // ít nhất 1 đơn vị
  const low = Math.max(min, prev - delta);
  const high = Math.min(max, prev + delta);
  return randInt(low, high);
};

async function existsCarrier(numberCarrier: any): Promise<boolean> {
    const flux = `
  from(bucket: "${bucket}")
    |> range(start: -5y)
    |> filter(fn: (r) => r._measurement == "info_tank_process" and r.carrier == "${numberCarrier}")
    |> limit(n:1)
  `;
    return new Promise<boolean>((resolve, reject) => {
      let found = false;
      queryApi.queryRows(flux, {
        next: () => { found = true; resolve(true); },  // thấy 1 dòng là đủ
        error: (e) => reject(e),
        complete: () => resolve(found),
      });
    });
  }
/**
 * Faker chạy tuần tự: mỗi product (thứ 3 chạy 2 lần), đi hết các tank trong union list,
 * mỗi tank ở 40–120 giây, mỗi giây ghi 1 point đo, rồi delay 15 giây sang tank kế tiếp.
 * - Temperature: 70.1..80 (float, 2 decimals)
 * - Electricity: 40..60 (int)
 * - Mỗi giây drift <= 5%
 * - Tag: code, tank, carrier; Field: temperature/electricity (chỉ field phù hợp)
 * - Timestamp: giây (writeApi phải set precision 's')
 */
const faker = async (): Promise<Boolean> => {
    
    // 1) Chuẩn bị danh sách tank
  //   Nếu bạn đã có sẵn listTankMonitorWithTemperatureAndElectric là union thì dùng trực tiếp.
  //   Bên dưới vẫn chủ động union để chắc chắn.
  const tempSet = new Set<number>(listTankMonitorWithTemperature);
  const elecSet = new Set<number>(listTankMonitorWithElectric);

  const unionSet = new Set<number>(listTankMonitorWithTemperatureAndElectric ?? []);
  for (const t of tempSet) unionSet.add(t);
  for (const t of elecSet) unionSet.add(t);

  const tankIds = Array.from(unionSet).sort((a, b) => a - b);

  // 2) Lấy 5 product đầu (có field code)
  const products = await Product.find(
    { code: { $exists: true, $ne: null } },
    { code: 1, _id: 0 }
  )
    .limit(5)
    .lean();

  if (!products || products.length === 0) {
    throw new Error('Không có product nào trong DB để faker.');
  }

  // 3) Lập danh sách chạy: product thứ 3 chạy 2 lần
  //    VD: [p1, p2, p3, p3, p4, p5]
  const runList: string[] = [];
  for (let i = 0; i < Math.min(5, products.length); i++) {
    const code = String((products[i] as any).code);
    if (i === 2) { // product thứ 3 (index 2) chạy 2 lần
      runList.push(code, code);
    } else {
      runList.push(code);
    }
  }

  // 4) Carrier: bắt đầu 1080, mỗi lần đổi product (mỗi entry trong runList) tăng 1
  let carrier = 1080;
  //* Kiểm tra đã có dữ liệu chưa
  if (await existsCarrier(carrier)) {
    return true; // đã có dữ liệu carrier=1080 -> thoát
  }

  // 5) Chạy lần lượt theo runList
  for (let runIdx = 0; runIdx < runList.length; runIdx++) {
    const productCode = runList[runIdx]!;
    const curCarrier = carrier++; // carrier cho lần chạy này

    // 6) Đi qua tất cả tank
    for (let ti = 0; ti < tankIds.length; ti++) {
      const tankId = tankIds[ti]!;
      const hasTemp = tempSet.has(tankId);
      const hasElec = elecSet.has(tankId);

      // Nếu vì lý do gì tank không thuộc temp hay elec thì bỏ (theo union thì hiếm khi xảy ra)
      if (!hasTemp && !hasElec) continue;

      // 7) Thời gian đứng tại hồ & khởi tạo giá trị ban đầu
      const durationSec = randInt(40, 120);

      let tempVal = hasTemp ? randFloat(70.1, 80.0, 2) : undefined;
      let elecVal = hasElec ? randInt(40, 60) : undefined;

      // 8) Ghi mỗi giây một point
      for (let sec = 0; sec < durationSec; sec++) {
        const nowSec = Math.floor(Date.now() / 1000);

        const p = new Point('info_tank_process')
          .tag('code', productCode)
          .tag('tank', String(tankId))
          .tag('carrier', String(curCarrier))
          .timestamp(nowSec);

        if (hasTemp && typeof tempVal === 'number' && Number.isFinite(tempVal)) {
          p.floatField('temperature', tempVal);
        }
        if (hasElec && typeof elecVal === 'number' && Number.isFinite(elecVal)) {
          p.intField('electricity', elecVal);
        }

        // đảm bảo có ít nhất 1 field (theo union thì luôn đúng)
        writeApi.writePoint(p);
        await writeApi.flush();

        // cập nhật giá trị cho giây kế tiếp theo drift 5%
        if (hasTemp && typeof tempVal === 'number') {
          tempVal = driftFloat(tempVal, 70.1, 80.0, 0.05, 2);
        }
        if (hasElec && typeof elecVal === 'number') {
          elecVal = driftInt(elecVal, 40, 60, 0.05);
        }

        await sleep(1000); // mỗi giây
      }

      // 9) xong một hồ -> nghỉ 15 giây trước khi qua hồ kế tiếp
      await sleep(15_000);
    }
  }
  
  return true;
}

export { faker }; 