// Simple mutex for async jobs that must not overlap
export function onceAtATime<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  opts: { onSkip?: (runningForMs?: number) => void; timeoutMs?: number } = {}
) {
  let running = false;
  let startedAt: number | null = null;

  const wrapped = async (...args: Parameters<T>): Promise<ReturnType<T> | void> => {
    if (running) {
      if (opts.onSkip) {
        const runningFor = startedAt ? Date.now() - startedAt : undefined;
        opts.onSkip(runningFor);
      }
      return;
    }

    running = true;
    startedAt = Date.now();

    // Optional: timeout để tránh kẹt vĩnh viễn
    let timer: NodeJS.Timeout | undefined;
    if (opts.timeoutMs && opts.timeoutMs > 0) {
      timer = setTimeout(() => {
        console.error(
          `[onceAtATime] job still running after ${opts.timeoutMs}ms, forcing running=false`
        );
        running = false;          // giải phóng lock, dù job thật có thể vẫn đang chạy ngầm
      }, opts.timeoutMs);
    }

    try {
      return await fn(...args);
    } finally {
      if (timer) clearTimeout(timer);
      running = false;
      startedAt = null;
    }
  };

  // Cho phép bên ngoài đọc trạng thái
  (wrapped as any).isRunning = () => running;

  // Kiểu trả về: function + isRunning()
  return wrapped as T & { isRunning: () => boolean };
}
