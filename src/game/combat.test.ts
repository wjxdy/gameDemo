import { describe, expect, it } from 'vitest';
import {
  applyDamage,
  canAttackAt,
  isAlive,
  isInAttackRange,
} from './combat';

describe('combat helpers', () => {
  it('clamps damage so health never drops below zero', () => {
    expect(applyDamage(12, 5)).toBe(7);
    expect(applyDamage(12, 40)).toBe(0);
  });

  it('treats actors with positive health as alive', () => {
    expect(isAlive(1)).toBe(true);
    expect(isAlive(0)).toBe(false);
    expect(isAlive(-3)).toBe(false);
  });

  it('checks attack range using squared distance', () => {
    expect(isInAttackRange({ x: 0, y: 0 }, { x: 3, y: 4 }, 5)).toBe(true);
    expect(isInAttackRange({ x: 0, y: 0 }, { x: 6, y: 0 }, 5)).toBe(false);
  });

  it('allows attacks only after cooldown has elapsed', () => {
    expect(canAttackAt(1000, 500, 400)).toBe(true);
    expect(canAttackAt(1000, 700, 400)).toBe(false);
  });
});

