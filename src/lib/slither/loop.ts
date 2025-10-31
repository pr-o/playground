type GameLoopTick = (delta: number, stats: GameLoopStats) => void;

export type GameLoopStats = {
  frame: number;
  elapsed: number;
  delta: number;
};

export type GameLoopOptions = {
  fps?: number;
  autoStart?: boolean;
  maxStepsPerFrame?: number;
};

const DEFAULT_FPS = 60;
const DEFAULT_MAX_STEPS = 5;

export class GameLoop {
  private readonly stepMs: number;
  private readonly maxStepsPerFrame: number;
  private rafId: number | null = null;
  private running = false;
  private lastTime = 0;
  private accumulator = 0;
  private frame = 0;
  private elapsed = 0;
  private readonly ticks = new Set<GameLoopTick>();

  constructor(options: GameLoopOptions = {}) {
    if (typeof window === 'undefined') {
      throw new Error('GameLoop can only be instantiated in a browser environment.');
    }

    const fps = options.fps ?? DEFAULT_FPS;
    this.stepMs = 1000 / fps;
    this.maxStepsPerFrame = options.maxStepsPerFrame ?? DEFAULT_MAX_STEPS;

    if (options.autoStart) {
      this.start();
    }
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = this.now();
    this.accumulator = 0;
    this.rafId = window.requestAnimationFrame(this.handleFrame);
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    if (this.rafId !== null) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  destroy() {
    this.stop();
    this.ticks.clear();
  }

  isRunning(): boolean {
    return this.running;
  }

  onTick(fn: GameLoopTick): () => void {
    this.ticks.add(fn);
    return () => this.offTick(fn);
  }

  offTick(fn: GameLoopTick) {
    this.ticks.delete(fn);
  }

  step() {
    this.stepSimulation(this.stepMs);
  }

  private handleFrame = (time: number) => {
    if (!this.running) return;

    const delta = time - this.lastTime;
    this.lastTime = time;
    this.accumulator += delta;

    let steps = 0;
    while (this.accumulator >= this.stepMs && steps < this.maxStepsPerFrame) {
      this.stepSimulation(this.stepMs);
      this.accumulator -= this.stepMs;
      steps += 1;
    }

    this.rafId = window.requestAnimationFrame(this.handleFrame);
  };

  private stepSimulation(stepMs: number) {
    this.frame += 1;
    const deltaSeconds = stepMs / 1000;
    this.elapsed += deltaSeconds;

    const stats: GameLoopStats = {
      frame: this.frame,
      elapsed: this.elapsed,
      delta: deltaSeconds,
    };

    for (const tick of this.ticks) {
      tick(deltaSeconds, stats);
    }
  }

  private now(): number {
    if (typeof performance !== 'undefined') {
      return performance.now();
    }
    return Date.now();
  }
}

export type { GameLoopTick };
