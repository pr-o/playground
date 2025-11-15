let timerId: ReturnType<typeof setInterval> | null = null;

type WorkerMessage = { type: 'start'; duration: number } | { type: 'cancel' };

const clearTimer = () => {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
};

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const data = event.data;
  if (data.type === 'cancel') {
    clearTimer();
    return;
  }

  clearTimer();
  let remaining = Math.max(0, Math.floor(data.duration));

  if (remaining <= 0) {
    self.postMessage({ status: 'finished', remainingSeconds: 0 });
    return;
  }

  self.postMessage({ status: 'running', remainingSeconds: remaining });

  timerId = setInterval(() => {
    remaining -= 1;
    if (remaining > 0) {
      self.postMessage({ status: 'running', remainingSeconds: remaining });
    } else {
      clearTimer();
      self.postMessage({ status: 'finished', remainingSeconds: 0 });
    }
  }, 1000);
};

export {};
