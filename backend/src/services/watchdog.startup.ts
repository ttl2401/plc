// backend/src/services/watchdog.startup.ts
import { PlcVariable } from '@/models/plc-variable.model'; // hoặc 'PLCVariables' nếu tên collection khác
import { plcService } from '@/services/singleton.service';

function toByteOffset(offset: any): number {
  // offset có thể là số (3) hoặc string kiểu "3.1" => lấy phần byte = 3
  if (typeof offset === 'string') {
    const n = Number(offset);
    if (Number.isFinite(n)) return Math.trunc(n);
  }
  if (typeof offset === 'number') return Math.trunc(offset);
  return 0;
}

/**
 * Đọc cấu hình từ MongoDB và bật watchdog đa-điểm.
 * - Mỗi DB chọn offset nhỏ nhất làm điểm probe (đọc 1 byte).
 * - batchSize = 1 để nhẹ nhàng; có thể tăng nếu cần.
 */
export async function initPlcWatchdogFromDB(opts?: {
  intervalMs?: number;         // mặc định 7000
  batchSize?: number;          // mỗi nhịp probe mấy điểm (1..3)
  maxConsecutiveFails?: number;// số nhịp lỗi liên tiếp trước khi Disconnect
}) {
  const docs = await PlcVariable.find({}, { dbNumber: 1, offset: 1 }).lean();

  const byDbMinByte = new Map<number, number>();
  for (const d of docs) {
    const db = Number((d as any).dbNumber);
    const byte = toByteOffset((d as any).offset);
    if (!Number.isFinite(db) || !Number.isFinite(byte)) continue;
    const prev = byDbMinByte.get(db);
    if (prev === undefined || byte < prev) byDbMinByte.set(db, byte);
  }

  const probes = [...byDbMinByte.entries()].map(([dbNumber, byteOffset]) => ({
    dbNumber,
    byteOffset,
    size: 1, // đọc 1 byte là đủ giữ phiên sống
  }));

  plcService.setWatchdogTargets(probes, {
    batchSize: opts?.batchSize ?? 1,
    maxConsecutiveFails: opts?.maxConsecutiveFails ?? 3,
  });

  plcService.startWatchdogMulti(opts?.intervalMs ?? 7000);

  console.log(`[WATCHDOG] enabled with ${probes.length} DB(s), interval=${opts?.intervalMs ?? 7000}ms, batch=${opts?.batchSize ?? 1}`);
}
