// Simple mutex for async jobs that must not overlap
export function onceAtATime<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    opts: { onSkip?: () => void } = {}
  ) {
    let running = false;
  
    return async (...args: Parameters<T>): Promise<ReturnType<T> | void> => {
      if (running) {
        if (opts.onSkip) opts.onSkip();
        return; // silently skip when previous tick is still running
      }
      running = true;
      try {
        return await fn(...args);
      } finally {
        running = false;
      }
    };
  }
  