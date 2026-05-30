# Weapon Attack System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a visible four-direction sword attack and introduce a replaceable weapon model that can later power backpack equipment.

**Architecture:** Add deterministic weapon and attack-position helpers, then wire Phaser scene attack behavior to the equipped weapon. Keep the sword as an independent sprite layer so future equipment swaps can change weapon art and stats without redrawing the player. Generate the first basic sword as a small transparent pixel PNG asset.

**Tech Stack:** TypeScript, Phaser, Vite, Vitest, static PNG assets under `public/assets`.

---

## File Structure

- `src/game/weapons.ts`: weapon type, basic sword definition, weapon registry, and lookup helper.
- `src/game/attack.ts`: direction-based attack point and weapon swing presentation helpers that can be unit tested.
- `src/game/attack.test.ts`: tests for attack point and swing configuration.
- `src/game/weapons.test.ts`: tests for the weapon registry.
- `src/game/PixelRpgScene.ts`: loads weapon art, tracks equipped weapon, blocks walk animation during attack, spawns sword swing sprite, uses weapon stats for damage/range/cooldown.
- `public/assets/weapons/basic-sword.png`: first replaceable weapon asset.
- `src/game/constants.ts`: remove obsolete attack constants only after scene no longer imports them.

## Task 1: Add Weapon Model And Tests

**Files:**
- Create: `src/game/weapons.ts`
- Create: `src/game/weapons.test.ts`

- [ ] **Step 1: Write failing weapon tests**

Create `src/game/weapons.test.ts`:

```ts
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
      assetPath: '/assets/weapons/basic-sword.png',
      swingMs: 140,
    });
  });

  it('looks up weapons by id', () => {
    expect(getWeapon('basic_sword')).toBe(BASIC_SWORD);
    expect(WEAPONS.basic_sword).toBe(BASIC_SWORD);
  });
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `pnpm test src/game/weapons.test.ts`

Expected: fail because `src/game/weapons.ts` does not exist.

- [ ] **Step 3: Implement weapon registry**

Create `src/game/weapons.ts`:

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
```

- [ ] **Step 4: Run tests and verify pass**

Run: `pnpm test src/game/weapons.test.ts`

Expected: pass with 2 tests.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/game/weapons.ts src/game/weapons.test.ts
git commit -m "test: add weapon registry"
```

## Task 2: Add Attack Geometry Helpers

**Files:**
- Create: `src/game/attack.ts`
- Create: `src/game/attack.test.ts`

- [ ] **Step 1: Write failing attack helper tests**

Create `src/game/attack.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests and verify failure**

Run: `pnpm test src/game/attack.test.ts`

Expected: fail because `src/game/attack.ts` does not exist.

- [ ] **Step 3: Implement attack helpers**

Create `src/game/attack.ts`:

```ts
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
```

- [ ] **Step 4: Run tests and verify pass**

Run: `pnpm test src/game/attack.test.ts`

Expected: pass with 8 test cases.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/game/attack.ts src/game/attack.test.ts
git commit -m "test: add attack geometry helpers"
```

## Task 3: Add Basic Sword Asset

**Files:**
- Create: `public/assets/weapons/basic-sword.png`

- [ ] **Step 1: Generate the sword PNG**

Create a transparent pixel-art sword PNG at `public/assets/weapons/basic-sword.png`. The image should be approximately 48 by 16 pixels, with a gray blade and dark handle. It must be readable when displayed around 52 pixels wide in game.

Use a script or image editor to create the PNG. Do not store the generated script unless it is useful for repeated asset creation.

- [ ] **Step 2: Inspect the PNG**

Run: `file public/assets/weapons/basic-sword.png`

Expected: PNG image with RGBA or indexed transparency.

- [ ] **Step 3: Commit**

Run:

```bash
git add public/assets/weapons/basic-sword.png
git commit -m "feat: add basic sword asset"
```

## Task 4: Wire Equipped Weapon Into The Scene

**Files:**
- Modify: `src/game/PixelRpgScene.ts`
- Modify: `src/game/constants.ts`

- [ ] **Step 1: Import weapon and attack helpers**

In `src/game/PixelRpgScene.ts`, import:

```ts
import { getAttackPoint, getWeaponSwingConfig } from './attack';
import { BASIC_SWORD, type Weapon } from './weapons';
```

Remove imports for `PLAYER_ATTACK_COOLDOWN_MS`, `PLAYER_ATTACK_RANGE`, and `PLAYER_DAMAGE` once their usages are replaced.

- [ ] **Step 2: Add equipped weapon and attack state**

Add fields to `PixelRpgScene`:

```ts
private equippedWeapon: Weapon = BASIC_SWORD;
private isPlayerAttacking = false;
```

Initialize attack cooldown with the weapon value:

```ts
private lastPlayerAttackAt = -BASIC_SWORD.cooldownMs;
```

In `create()`, reset:

```ts
this.equippedWeapon = BASIC_SWORD;
this.isPlayerAttacking = false;
this.lastPlayerAttackAt = -this.equippedWeapon.cooldownMs;
```

- [ ] **Step 3: Load weapon texture**

In `preload()`, add:

```ts
this.load.image(BASIC_SWORD.textureKey, BASIC_SWORD.assetPath);
```

- [ ] **Step 4: Prevent walk animation during attack**

In `updatePlayerMovement()`, keep velocity movement unchanged, but only play/stop walking animation when `!this.isPlayerAttacking`.

Use this structure:

```ts
if (!this.isPlayerAttacking) {
  if (velocity.lengthSq() > 0) {
    this.player.play('hero-walk', true);
  } else {
    this.player.stop();
    this.player.setFrame(0);
  }
}
```

- [ ] **Step 5: Use weapon stats for cooldown, range, and damage**

In `performPlayerAttack(time)`, replace cooldown check with:

```ts
if (!canAttackAt(time, this.lastPlayerAttackAt, this.equippedWeapon.cooldownMs)) {
  return;
}
```

Set `this.isPlayerAttacking = true` before visual playback.

Use `getAttackPoint(this.spritePoint(this.player), this.facing, this.equippedWeapon.range)` for damage targeting.

Replace `PLAYER_DAMAGE` with `this.equippedWeapon.damage`.

- [ ] **Step 6: Spawn visible sword swing**

Add a private method:

```ts
private playWeaponSwing(): void {
  const swing = getWeaponSwingConfig(this.facing);
  const sword = this.add
    .image(this.player.x + swing.x, this.player.y + swing.y, this.equippedWeapon.textureKey)
    .setDepth(35)
    .setDisplaySize(52, 18)
    .setAngle(swing.startAngle)
    .setFlipX(swing.flipX);

  this.tweens.add({
    targets: sword,
    angle: swing.endAngle,
    alpha: 0.85,
    duration: this.equippedWeapon.swingMs,
    ease: 'Quad.easeOut',
    onComplete: () => sword.destroy(),
  });
}
```

Call `this.playWeaponSwing()` from `performPlayerAttack()`.

- [ ] **Step 7: Clear attack state after swing**

In `performPlayerAttack(time)`, replace the current `setDisplaySize` delayed call with:

```ts
this.player.setDisplaySize(43, 43);
this.player.stop();
this.time.delayedCall(this.equippedWeapon.swingMs, () => {
  this.player.setDisplaySize(HERO_DISPLAY_SIZE, HERO_DISPLAY_SIZE);
  this.isPlayerAttacking = false;
});
```

- [ ] **Step 8: Remove obsolete constants**

In `src/game/constants.ts`, remove:

```ts
export const PLAYER_DAMAGE = 18;
export const PLAYER_ATTACK_RANGE = 48;
export const PLAYER_ATTACK_COOLDOWN_MS = 360;
```

Only remove them after `PixelRpgScene.ts` no longer imports them.

- [ ] **Step 9: Run verification**

Run:

```bash
pnpm typecheck
pnpm test
pnpm build
```

Expected: all pass. Build may still warn about Phaser bundle size; that warning is acceptable.

- [ ] **Step 10: Browser smoke test**

Open the dev server at `http://127.0.0.1:5173/`, press Space, and confirm a sword sprite appears and swings in the player's facing direction.

- [ ] **Step 11: Commit**

Run:

```bash
git add src/game/PixelRpgScene.ts src/game/constants.ts
git commit -m "feat: wire equipped sword attack"
```

## Task 5: Final Verification And Push

**Files:**
- No new files expected.

- [ ] **Step 1: Run full verification**

Run:

```bash
pnpm typecheck
pnpm test
pnpm build
git status --short
```

Expected: typecheck/test/build pass and only intentional files are modified before final commit, or no files are modified after final commit.

- [ ] **Step 2: Push commits**

Run:

```bash
git push
```

Expected: local `main` pushes to `origin/main`.

