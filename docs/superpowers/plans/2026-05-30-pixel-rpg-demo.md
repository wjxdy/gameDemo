# Pixel RPG Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser-playable top-down pixel action RPG demo with movement, melee combat, monsters, one Boss, win/loss states, and pixel styling.

**Architecture:** Use Vite to serve a Phaser TypeScript game. Keep files small: app bootstrap, Phaser scene, game constants, entity types, sprite generation, and CSS are separate. Use Arcade Physics for collision/overlap and lightweight state machines for enemies and game end states.

**Tech Stack:** TypeScript, Vite, Phaser, Vitest for small deterministic logic tests.

---

## File Structure

- `package.json`: scripts and dependencies.
- `index.html`: browser entry point.
- `src/main.ts`: Phaser game bootstrap.
- `src/style.css`: page-level layout and pixel rendering styles.
- `src/game/constants.ts`: shared tuning values and map dimensions.
- `src/game/types.ts`: TypeScript types for actors, enemies, and game state.
- `src/game/sprites.ts`: generated pixel textures for player, monsters, Boss, tiles, and effects.
- `src/game/combat.ts`: deterministic combat helper functions.
- `src/game/PixelRpgScene.ts`: Phaser scene for map, input, entities, combat, UI, and restart flow.
- `src/game/combat.test.ts`: unit tests for deterministic combat helpers.

## Tasks

### Task 1: Scaffold the Vite Phaser project

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `src/main.ts`
- Create: `src/style.css`

- [ ] Add package scripts for `dev`, `build`, `test`, and `typecheck`.
- [ ] Add a Vite HTML entry with a `#game` mount node.
- [ ] Add Phaser bootstrap in `src/main.ts`.
- [ ] Add page CSS that centers the game and preserves pixel rendering.
- [ ] Run `pnpm install`.
- [ ] Run `pnpm typecheck`.
- [ ] Commit with `chore: scaffold phaser project`.

### Task 2: Add deterministic combat helpers

**Files:**
- Create: `src/game/constants.ts`
- Create: `src/game/types.ts`
- Create: `src/game/combat.ts`
- Create: `src/game/combat.test.ts`

- [ ] Write tests for clamping damage, alive/dead checks, and attack range checks.
- [ ] Implement the combat helpers.
- [ ] Run `pnpm test`.
- [ ] Commit with `test: add combat helper coverage`.

### Task 3: Generate pixel textures

**Files:**
- Create: `src/game/sprites.ts`

- [ ] Add generated textures for grass, trees, rocks, player, monster, Boss, attack effect, and shadow.
- [ ] Use nearest-neighbor rendering and low-resolution pixel shapes.
- [ ] Commit with `feat: add generated pixel sprites`.

### Task 4: Build the playable scene

**Files:**
- Create: `src/game/PixelRpgScene.ts`
- Modify: `src/main.ts`

- [ ] Create a forest map with blocked trees and rocks.
- [ ] Add player movement with WASD and arrow keys.
- [ ] Add facing direction and Space attack.
- [ ] Add three normal monsters with chase behavior.
- [ ] Add one Boss with higher health and damage.
- [ ] Add enemy damage, player damage, death, victory, and restart.
- [ ] Commit with `feat: build playable rpg scene`.

### Task 5: Verify and tune

**Files:**
- Modify: `src/game/PixelRpgScene.ts`
- Modify: `src/style.css`

- [ ] Run `pnpm typecheck`.
- [ ] Run `pnpm test`.
- [ ] Run `pnpm build`.
- [ ] Start `pnpm dev` and verify the game loads in a browser.
- [ ] Tune enemy speed, health, attack range, and UI text for first-play clarity.
- [ ] Commit with `fix: tune first playable demo`.

