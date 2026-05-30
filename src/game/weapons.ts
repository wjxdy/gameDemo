export type Weapon = {
  id: string;
  name: string;
  damage: number;
  range: number;
  cooldownMs: number;
  textureKey: string;
  assetPath: string;
  swingMs: number;
};

export const BASIC_SWORD: Weapon = {
  id: 'basic_sword',
  name: 'Basic Sword',
  damage: 18,
  range: 56,
  cooldownMs: 360,
  textureKey: 'weapon-basic-sword',
  assetPath: '/assets/weapons/basic-sword.png',
  swingMs: 140,
};

export const WEAPONS = {
  basic_sword: BASIC_SWORD,
} as const;

export type WeaponId = keyof typeof WEAPONS;

export function getWeapon(id: WeaponId): Weapon {
  return WEAPONS[id];
}

