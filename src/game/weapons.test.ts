import { describe, expect, it } from 'vitest';
import { BASIC_SWORD, getWeapon, WEAPONS } from './weapons';

describe('weapon registry', () => {
  it('defines the basic sword used by the player', () => {
    expect(BASIC_SWORD).toEqual({
      id: 'basic_sword',
      name: 'Basic Sword',
      damage: 18,
      range: 56,
      cooldownMs: 360,
      textureKey: 'weapon-basic-sword',
      assetPath: 'assets/weapons/basic-sword.png',
      swingMs: 140,
    });
  });

  it('looks up weapons by id', () => {
    expect(getWeapon('basic_sword')).toBe(BASIC_SWORD);
    expect(WEAPONS.basic_sword).toBe(BASIC_SWORD);
  });
});
