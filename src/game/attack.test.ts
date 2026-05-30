import { describe, expect, it } from 'vitest';
import { getAttackPoint, getWeaponSwingConfig } from './attack';
import type { Facing } from './types';

describe('attack helpers', () => {
  it.each([
    ['left', { x: 44, y: 100 }],
    ['right', { x: 156, y: 100 }],
    ['up', { x: 100, y: 44 }],
    ['down', { x: 100, y: 156 }],
  ] satisfies Array<[Facing, { x: number; y: number }]>)(
    'computes %s attack point from range',
    (facing, expected) => {
      expect(getAttackPoint({ x: 100, y: 100 }, facing, 56)).toEqual(expected);
    },
  );

  it.each([
    ['left', { x: -30, y: 0, startAngle: -35, endAngle: -125, flipX: false }],
    ['right', { x: 30, y: 0, startAngle: 35, endAngle: 125, flipX: true }],
    ['up', { x: 0, y: -30, startAngle: -120, endAngle: -20, flipX: false }],
    ['down', { x: 0, y: 30, startAngle: 120, endAngle: 20, flipX: true }],
  ] satisfies Array<[
    Facing,
    { x: number; y: number; startAngle: number; endAngle: number; flipX: boolean },
  ]>)('computes %s sword swing config', (facing, expected) => {
    expect(getWeaponSwingConfig(facing)).toEqual(expected);
  });
});

