import { createId } from './id';
import { TAU, clamp } from './math';
import type { GameState, Particle, Pellet, Vector2 } from './types';

const BOOST_PARTICLE_COUNT = 2;
const BOOST_SPEED_BASE = 60;
const BOOST_SPEED_VARIANCE = 30;
const BOOST_LIFESPAN = 0.45;
const BOOST_RADIUS_FACTOR = 0.35;

const DAMPING = 0.82;

export const emitPelletBurst = (state: GameState, pellet: Pellet) => {
  const {
    particles: particleList,
    config: {
      particles: { burstPool, maxTrail },
      pellet: { radius },
    },
  } = state;

  const spawnCount = Math.max(4, Math.min(12, Math.floor(burstPool)));
  for (let i = 0; i < spawnCount; i += 1) {
    const angle = state.random() * TAU;
    const speed = 50 + state.random() * 90;
    const lifespan = 0.6 + state.random() * 0.4;
    const scale = 0.4 + state.random() * 0.8;
    const particle: Particle = {
      id: createId('particle'),
      position: { ...pellet.position },
      velocity: {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
      },
      life: 0,
      lifespan,
      radius: Math.max(radius * scale, 2),
      color: pellet.color,
      alpha: 1,
    };

    pushParticle(particleList, particle, maxTrail);
  }
};

export const emitBoostTrail = (state: GameState) => {
  const head = state.player.segments[0];
  if (!head) return;

  const {
    config: {
      particles: { maxTrail },
      snake: { segmentSpacing },
    },
    particles,
  } = state;

  const baseRadius = segmentSpacing * BOOST_RADIUS_FACTOR;

  for (let i = 0; i < BOOST_PARTICLE_COUNT; i += 1) {
    const offsetAngle = state.random() * TAU;
    const offsetRadius = segmentSpacing * 0.25 * state.random();
    const origin: Vector2 = {
      x: head.position.x + Math.cos(offsetAngle) * offsetRadius,
      y: head.position.y + Math.sin(offsetAngle) * offsetRadius,
    };

    const direction =
      head.angle + Math.PI + (state.random() - 0.5) * 0.6; /* slight spread */

    const speed = BOOST_SPEED_BASE + (state.random() - 0.5) * BOOST_SPEED_VARIANCE * 2;
    const particle: Particle = {
      id: createId('particle'),
      position: origin,
      velocity: {
        x: Math.cos(direction) * speed,
        y: Math.sin(direction) * speed,
      },
      life: 0,
      lifespan: BOOST_LIFESPAN + state.random() * 0.25,
      radius: Math.max(baseRadius * (0.7 + state.random() * 0.6), 2),
      color: state.player.color,
      alpha: 0.75,
    };

    pushParticle(particles, particle, maxTrail);
  }
};

export const updateParticles = (state: GameState, dt: number) => {
  const { particles } = state;

  let writeIndex = 0;
  for (let i = 0; i < particles.length; i += 1) {
    const particle = particles[i];
    particle.life += dt;

    if (particle.life >= particle.lifespan) {
      continue;
    }

    particle.position.x += particle.velocity.x * dt;
    particle.position.y += particle.velocity.y * dt;

    particle.velocity.x *= DAMPING;
    particle.velocity.y *= DAMPING;

    const progress = clamp(particle.life / particle.lifespan, 0, 1);
    particle.alpha = Math.max(0, 1 - progress);
    particle.radius = Math.max(particle.radius * (1 - dt * 1.2), 1.2);

    particles[writeIndex] = particle;
    writeIndex += 1;
  }

  if (writeIndex < particles.length) {
    particles.length = writeIndex;
  }
};

const pushParticle = (particles: Particle[], particle: Particle, maxTrail: number) => {
  if (particles.length >= maxTrail) {
    const overflow = particles.length - maxTrail + 1;
    particles.splice(0, overflow);
  }
  particles.push(particle);
};
