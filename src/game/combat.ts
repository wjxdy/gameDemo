import type { Point } from './types';

export function applyDamage(currentHealth: number, damage: number): number {
  return Math.max(0, currentHealth - Math.max(0, damage));
}

export function isAlive(health: number): boolean {
  return health > 0;
}

export function isInAttackRange(a: Point, b: Point, range: number): boolean {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy <= range * range;
}

export function canAttackAt(now: number, lastAttackAt: number, cooldownMs: number): boolean {
  return now - lastAttackAt >= cooldownMs;
}
