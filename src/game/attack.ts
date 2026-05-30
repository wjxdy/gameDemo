import type { Facing, Point } from './types';

export type WeaponSwingConfig = {
  x: number;
  y: number;
  startAngle: number;
  endAngle: number;
  flipX: boolean;
};

export function getAttackPoint(origin: Point, facing: Facing, range: number): Point {
  if (facing === 'left') {
    return { x: origin.x - range, y: origin.y };
  }
  if (facing === 'right') {
    return { x: origin.x + range, y: origin.y };
  }
  if (facing === 'up') {
    return { x: origin.x, y: origin.y - range };
  }
  return { x: origin.x, y: origin.y + range };
}

export function getWeaponSwingConfig(facing: Facing): WeaponSwingConfig {
  if (facing === 'left') {
    return { x: -30, y: 0, startAngle: -35, endAngle: -125, flipX: false };
  }
  if (facing === 'right') {
    return { x: 30, y: 0, startAngle: 35, endAngle: 125, flipX: true };
  }
  if (facing === 'up') {
    return { x: 0, y: -30, startAngle: -120, endAngle: -20, flipX: false };
  }
  return { x: 0, y: 30, startAngle: 120, endAngle: 20, flipX: true };
}

