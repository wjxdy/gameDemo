# Pixel RPG Demo Design

## Goal

Build a browser-playable top-down pixel action RPG demo. The first version proves the core loop: explore a small map, fight monsters with a real-time attack button, survive, and defeat one Boss.

## Scope

The first version is single-player only. It uses one compact forest map, a player character based on the provided pixel reference, several basic monsters, one Boss, health bars, damage feedback, win/loss states, and restart controls.

Out of scope for the first version: multiplayer, login, accounts, large world maps, NPC dialogue, complex quests, inventory, equipment, shops, skill trees, persistent saves, and advanced custom art pipelines.

## Gameplay

The player moves with WASD or arrow keys in a top-down map. Pressing Space performs a short-range melee attack in the current facing direction. Normal monsters wander or chase when the player is close. A monster damages the player when close enough and its attack cooldown is ready. The Boss is stronger, has more health, and appears in a marked area of the same map.

The player wins by defeating the Boss. The player loses when health reaches zero. Both states show a simple overlay and allow restarting the demo.

## Visual Direction

The game uses a pixel-art style with crisp rendering and no texture smoothing. The provided character reference drives the hero look: dark outfit, red cap/accent, compact chibi proportions. The first implementation can use generated pixel sprites drawn from code or canvas, as long as the result matches the style and supports idle, movement, and attack feedback.

The map is a small forest clearing with grass, trees, rocks, paths, monster spawn points, and a Boss area. UI should be minimal: player health, Boss health when engaged, small status text, and restart/win/loss overlay.

## Technical Approach

Use Phaser with TypeScript and Vite. Phaser handles the game loop, scene lifecycle, input, physics overlap checks, sprites, camera, and rendering. Game-specific logic is split into focused modules for constants, entity types, sprite generation, game scene, and UI state.

The first build runs locally in the browser through Vite. It should be easy to iterate on controls, enemy tuning, and sprite art.

## Acceptance Criteria

- The project runs from the current folder with `pnpm dev`.
- The browser shows a playable top-down pixel RPG scene.
- The player moves with WASD and arrow keys.
- The player attacks with Space.
- At least three normal monsters can chase, take damage, damage the player, and die.
- One Boss can take damage, damage the player, and trigger victory when defeated.
- Player death triggers a loss overlay.
- Victory and loss states can restart the game.
- Pixel rendering remains crisp.

