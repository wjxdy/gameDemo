export type Point = {
  x: number;
  y: number;
};

export type Facing = 'down' | 'left' | 'right' | 'up';

export type EnemyKind = 'slime' | 'boss';

export type EnemyConfig = {
  kind: EnemyKind;
  x: number;
  y: number;
  maxHealth: number;
  damage: number;
  speed: number;
  chaseRadius: number;
};

export type GameOutcome = 'playing' | 'victory' | 'defeat';

