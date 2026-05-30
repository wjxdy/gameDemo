# Weapon Attack System Design

## Goal

Upgrade the current attack from a short visual flash into a visible weapon swing, while laying the foundation for future equipment, backpack, and loot systems.

## Player Experience

The player starts with a basic sword equipped. Pressing Space triggers a short attack state: the walking animation pauses, the character keeps facing the current direction, and a sword appears in front of the character with a quick swing motion. The attack works in four directions: left, right, up, and down.

The attack should feel like the character is using a weapon, not like an abstract hit effect. The sword is visible, placed near the character's hand/body, and disappears after the swing finishes.

## Scope

This feature includes:

- A basic sword weapon asset.
- A weapon data model with id, name, damage, range, cooldown, texture key, and swing timing.
- A default equipped weapon on the player.
- Attack damage and range read from the equipped weapon instead of hard-coded player constants.
- A four-direction weapon swing visual.
- A short player attack state that prevents movement animation from fighting the attack animation.

This feature does not include:

- Backpack UI.
- Equipment UI.
- Loot drops.
- Multiple usable weapons in the world.
- Saving equipped weapons.
- Separate full-body attack sprites for every direction.

## Architecture

Add a small weapon module that owns weapon definitions and lookup. The Phaser scene keeps a single `equippedWeapon` field for now. Combat logic remains in the scene for this phase, but attack values come from the equipped weapon rather than global player constants.

Weapon visuals are separate from the player sprite. The first implementation uses one basic sword texture and transforms it with position, rotation, and flipping for each facing direction. This keeps the system compatible with future weapon models: a later backpack can swap the equipped weapon object without changing the attack flow.

## Assets

Create a first basic sword asset at:

`public/assets/weapons/basic-sword.png`

The asset should be small pixel art, transparent background, and readable at the current character scale. It should work when rotated for all four directions.

If hand-drawn attack body frames are added later, they should be an enhancement, not a dependency for this feature. The first version should already make the attack feel weapon-based through sword movement.

## Attack Flow

1. Player presses Space.
2. Scene checks the equipped weapon cooldown.
3. Scene sets `isPlayerAttacking = true`.
4. Walking animation stops and the player holds the current frame/facing.
5. Scene computes the attack point from player position, facing direction, and weapon range.
6. Scene spawns the equipped weapon sprite in front of the player.
7. Scene plays a short swing tween based on facing direction.
8. Scene applies damage to enemies inside weapon range.
9. Scene destroys the weapon sprite and clears `isPlayerAttacking`.

## Data Model

Weapon definitions should be plain TypeScript objects:

```ts
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
```

The default weapon is:

```ts
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
```

## Testing

Add deterministic tests for the weapon registry and attack positioning helpers. Phaser rendering behavior will be verified with typecheck, production build, and browser smoke testing.

Acceptance criteria:

- Pressing Space shows a visible sword swing.
- The sword swing direction matches player facing.
- Damage, range, and cooldown come from the equipped weapon.
- The player can still move normally after the swing.
- Existing monster/Boss combat still works.
- `pnpm typecheck`, `pnpm test`, and `pnpm build` pass.

