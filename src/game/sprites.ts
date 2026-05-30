import Phaser from 'phaser';

type PixelRect = {
  x: number;
  y: number;
  w: number;
  h: number;
  color: number;
};

function drawTexture(
  scene: Phaser.Scene,
  key: string,
  width: number,
  height: number,
  rects: PixelRect[],
): void {
  if (scene.textures.exists(key)) {
    return;
  }

  const graphics = scene.make.graphics({ x: 0, y: 0 }, false);
  graphics.clear();
  for (const rect of rects) {
    graphics.fillStyle(rect.color, 1);
    graphics.fillRect(rect.x, rect.y, rect.w, rect.h);
  }
  graphics.generateTexture(key, width, height);
  graphics.destroy();
}

export function createPixelTextures(scene: Phaser.Scene): void {
  drawTexture(scene, 'tile-grass', 32, 32, [
    { x: 0, y: 0, w: 32, h: 32, color: 0x2f8f3a },
    { x: 3, y: 5, w: 3, h: 3, color: 0x3fb950 },
    { x: 18, y: 11, w: 3, h: 4, color: 0x256d2b },
    { x: 25, y: 24, w: 4, h: 3, color: 0x44b957 },
  ]);

  drawTexture(scene, 'tile-path', 32, 32, [
    { x: 0, y: 0, w: 32, h: 32, color: 0x9b7653 },
    { x: 4, y: 8, w: 5, h: 3, color: 0xba9066 },
    { x: 20, y: 18, w: 6, h: 3, color: 0x76563d },
  ]);

  drawTexture(scene, 'tree', 48, 58, [
    { x: 18, y: 34, w: 12, h: 22, color: 0x6b3f22 },
    { x: 6, y: 18, w: 36, h: 24, color: 0x14532d },
    { x: 12, y: 8, w: 24, h: 22, color: 0x166534 },
    { x: 18, y: 2, w: 16, h: 18, color: 0x22c55e },
    { x: 10, y: 28, w: 8, h: 6, color: 0x0f3f24 },
  ]);

  drawTexture(scene, 'rock', 40, 30, [
    { x: 4, y: 10, w: 32, h: 16, color: 0x64748b },
    { x: 10, y: 4, w: 20, h: 22, color: 0x94a3b8 },
    { x: 22, y: 8, w: 10, h: 8, color: 0x475569 },
  ]);

  drawTexture(scene, 'shadow', 36, 14, [
    { x: 4, y: 4, w: 28, h: 6, color: 0x0f172a },
    { x: 8, y: 2, w: 20, h: 10, color: 0x0f172a },
  ]);

  drawTexture(scene, 'hero', 28, 34, [
    { x: 9, y: 1, w: 12, h: 6, color: 0xef4444 },
    { x: 7, y: 7, w: 16, h: 8, color: 0xffd7a3 },
    { x: 10, y: 9, w: 3, h: 3, color: 0x111827 },
    { x: 17, y: 9, w: 3, h: 3, color: 0x111827 },
    { x: 8, y: 16, w: 14, h: 12, color: 0x1f2937 },
    { x: 5, y: 18, w: 5, h: 9, color: 0x334155 },
    { x: 21, y: 18, w: 5, h: 9, color: 0x334155 },
    { x: 10, y: 28, w: 5, h: 5, color: 0x111827 },
    { x: 17, y: 28, w: 5, h: 5, color: 0x111827 },
    { x: 12, y: 17, w: 7, h: 5, color: 0xe5e7eb },
  ]);

  drawTexture(scene, 'hero-attack', 46, 34, [
    { x: 9, y: 1, w: 12, h: 6, color: 0xef4444 },
    { x: 7, y: 7, w: 16, h: 8, color: 0xffd7a3 },
    { x: 8, y: 16, w: 14, h: 12, color: 0x1f2937 },
    { x: 22, y: 17, w: 7, h: 5, color: 0x334155 },
    { x: 29, y: 15, w: 12, h: 4, color: 0xf8fafc },
    { x: 10, y: 28, w: 5, h: 5, color: 0x111827 },
    { x: 17, y: 28, w: 5, h: 5, color: 0x111827 },
  ]);

  drawTexture(scene, 'slime', 30, 24, [
    { x: 4, y: 10, w: 22, h: 10, color: 0x38bdf8 },
    { x: 8, y: 5, w: 14, h: 16, color: 0x0ea5e9 },
    { x: 10, y: 10, w: 3, h: 3, color: 0x082f49 },
    { x: 18, y: 10, w: 3, h: 3, color: 0x082f49 },
    { x: 12, y: 17, w: 8, h: 2, color: 0xbae6fd },
  ]);

  drawTexture(scene, 'boss', 56, 54, [
    { x: 8, y: 16, w: 40, h: 30, color: 0x7f1d1d },
    { x: 14, y: 8, w: 28, h: 36, color: 0xdc2626 },
    { x: 4, y: 12, w: 12, h: 8, color: 0xf97316 },
    { x: 40, y: 12, w: 12, h: 8, color: 0xf97316 },
    { x: 18, y: 21, w: 5, h: 5, color: 0x111827 },
    { x: 34, y: 21, w: 5, h: 5, color: 0x111827 },
    { x: 22, y: 36, w: 14, h: 4, color: 0xfef2f2 },
  ]);

  drawTexture(scene, 'slash', 34, 28, [
    { x: 6, y: 18, w: 5, h: 4, color: 0xf8fafc },
    { x: 11, y: 14, w: 7, h: 4, color: 0xf8fafc },
    { x: 18, y: 10, w: 7, h: 4, color: 0xe0f2fe },
    { x: 25, y: 6, w: 4, h: 4, color: 0xbae6fd },
  ]);
}

