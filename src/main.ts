import Phaser from 'phaser';
import { PixelRpgScene } from './game/PixelRpgScene';
import './style.css';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 960,
  height: 640,
  backgroundColor: '#0f172a',
  pixelArt: true,
  roundPixels: true,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  scene: [PixelRpgScene],
};

new Phaser.Game(config);
