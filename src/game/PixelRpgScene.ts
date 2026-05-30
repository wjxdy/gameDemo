import Phaser from 'phaser';
import {
  ENEMY_ATTACK_COOLDOWN_MS,
  ENEMY_ATTACK_RANGE,
  PLAYER_ATTACK_COOLDOWN_MS,
  PLAYER_ATTACK_RANGE,
  PLAYER_DAMAGE,
  PLAYER_MAX_HEALTH,
  PLAYER_SPEED,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from './constants';
import { applyDamage, canAttackAt, isAlive, isInAttackRange } from './combat';
import { createPixelTextures } from './sprites';
import type { EnemyConfig, Facing, GameOutcome, Point } from './types';

type EnemyActor = {
  sprite: Phaser.Physics.Arcade.Sprite;
  hp: number;
  maxHp: number;
  damage: number;
  speed: number;
  chaseRadius: number;
  lastAttackAt: number;
  kind: EnemyConfig['kind'];
  hpBar: Phaser.GameObjects.Graphics;
};

const HERO_DISPLAY_SIZE = 40;
const MINIMAP = {
  x: 760,
  y: 18,
  width: 176,
  height: 112,
};

export class PixelRpgScene extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'A' | 'D' | 'S' | 'W', Phaser.Input.Keyboard.Key>;
  private attackKey!: Phaser.Input.Keyboard.Key;
  private player!: Phaser.Physics.Arcade.Sprite;
  private obstacles!: Phaser.Physics.Arcade.StaticGroup;
  private enemies: EnemyActor[] = [];
  private facing: Facing = 'down';
  private playerHp = PLAYER_MAX_HEALTH;
  private lastPlayerAttackAt = -PLAYER_ATTACK_COOLDOWN_MS;
  private outcome: GameOutcome = 'playing';
  private hpText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private bossText!: Phaser.GameObjects.Text;
  private overlay!: Phaser.GameObjects.Container;
  private minimap!: Phaser.GameObjects.Graphics;

  constructor() {
    super('PixelRpgScene');
  }

  preload(): void {
    this.load.image('hero', '/assets/hero.png');
    this.load.spritesheet('hero-walk', '/assets/hero_walk_16.png', {
      frameWidth: 28,
      frameHeight: 28,
    });
    createPixelTextures(this);
  }

  create(): void {
    this.outcome = 'playing';
    this.playerHp = PLAYER_MAX_HEALTH;
    this.lastPlayerAttackAt = -PLAYER_ATTACK_COOLDOWN_MS;
    this.enemies = [];

    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBackgroundColor('#14532d');

    this.createMap();
    this.createAnimations();
    this.createPlayer();
    this.createEnemies();
    this.createUi();
    this.createInput();
  }

  update(time: number): void {
    if (this.outcome !== 'playing') {
      return;
    }

    this.updatePlayerMovement();
    if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
      this.performPlayerAttack(time);
    }
    this.updateEnemies(time);
    this.updateUi();
  }

  private createMap(): void {
    for (let y = 0; y < WORLD_HEIGHT; y += 32) {
      for (let x = 0; x < WORLD_WIDTH; x += 32) {
        const onMainPath = y > 570 && y < 750 && x > 120 && x < 1840;
        const onBossPath = x > 1650 && x < 1890 && y > 740 && y < 1090;
        const key = onMainPath || onBossPath ? 'tile-path' : 'tile-grass';
        this.add.image(x + 16, y + 16, key).setOrigin(0.5);
      }
    }

    this.obstacles = this.physics.add.staticGroup();
    const treePositions: Point[] = [
      { x: 90, y: 95 },
      { x: 170, y: 120 },
      { x: 360, y: 115 },
      { x: 760, y: 110 },
      { x: 1180, y: 145 },
      { x: 1450, y: 130 },
      { x: 1720, y: 120 },
      { x: 2040, y: 170 },
      { x: 210, y: 940 },
      { x: 520, y: 990 },
      { x: 910, y: 960 },
      { x: 1320, y: 930 },
      { x: 1510, y: 980 },
      { x: 1860, y: 1220 },
      { x: 2040, y: 1160 },
      { x: 320, y: 1240 },
      { x: 760, y: 1260 },
      { x: 1160, y: 1240 },
      { x: 430, y: 360 },
      { x: 680, y: 320 },
      { x: 960, y: 360 },
      { x: 1320, y: 350 },
      { x: 1710, y: 420 },
    ];

    for (const pos of treePositions) {
      const tree = this.obstacles.create(pos.x, pos.y, 'tree');
      tree.setSize(32, 24).setOffset(8, 32).refreshBody();
    }

    const rockPositions: Point[] = [
      { x: 430, y: 505 },
      { x: 610, y: 815 },
      { x: 1010, y: 500 },
      { x: 1240, y: 825 },
      { x: 1480, y: 500 },
      { x: 1760, y: 890 },
      { x: 1980, y: 720 },
      { x: 720, y: 1040 },
      { x: 1080, y: 1080 },
    ];

    for (const pos of rockPositions) {
      const rock = this.obstacles.create(pos.x, pos.y, 'rock');
      rock.setSize(32, 20).setOffset(4, 7).refreshBody();
    }

    this.add
      .rectangle(1930, 1030, 320, 250, 0x7f1d1d, 0.18)
      .setStrokeStyle(3, 0xef4444, 0.55);
    this.add.text(1800, 870, 'BOSS GROVE', {
      color: '#fecaca',
      fontFamily: 'monospace',
      fontSize: '18px',
    });
  }

  private createPlayer(): void {
    this.add.image(180, 660, 'shadow').setDepth(8).setDisplaySize(42, 16);
    this.player = this.physics.add.sprite(180, 660, 'hero-walk', 0).setDepth(10);
    this.player.setDisplaySize(HERO_DISPLAY_SIZE, HERO_DISPLAY_SIZE);
    this.player.setCollideWorldBounds(true);
    this.player.body?.setSize(20, 22).setOffset(10, 14);
    this.physics.add.collider(this.player, this.obstacles);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
  }

  private createAnimations(): void {
    if (this.anims.exists('hero-walk')) {
      return;
    }

    this.anims.create({
      key: 'hero-walk',
      frames: this.anims.generateFrameNumbers('hero-walk', { start: 0, end: 15 }),
      frameRate: 10,
      repeat: -1,
    });
  }

  private createEnemies(): void {
    const configs: EnemyConfig[] = [
      { kind: 'slime', x: 620, y: 640, maxHealth: 45, damage: 8, speed: 80, chaseRadius: 250 },
      { kind: 'slime', x: 900, y: 840, maxHealth: 45, damage: 8, speed: 80, chaseRadius: 250 },
      { kind: 'slime', x: 1180, y: 560, maxHealth: 55, damage: 10, speed: 75, chaseRadius: 260 },
      { kind: 'slime', x: 1520, y: 700, maxHealth: 55, damage: 10, speed: 78, chaseRadius: 270 },
      { kind: 'slime', x: 1760, y: 980, maxHealth: 65, damage: 11, speed: 74, chaseRadius: 280 },
      { kind: 'boss', x: 1940, y: 1040, maxHealth: 180, damage: 18, speed: 62, chaseRadius: 360 },
    ];

    for (const config of configs) {
      const spriteKey = config.kind === 'boss' ? 'boss' : 'slime';
      const sprite = this.physics.add.sprite(config.x, config.y, spriteKey).setDepth(9);
      sprite.setCollideWorldBounds(true);
      sprite.body?.setSize(config.kind === 'boss' ? 42 : 22, config.kind === 'boss' ? 34 : 16);
      this.physics.add.collider(sprite, this.obstacles);
      const hpBar = this.add.graphics().setDepth(20);
      this.enemies.push({
        sprite,
        hp: config.maxHealth,
        maxHp: config.maxHealth,
        damage: config.damage,
        speed: config.speed,
        chaseRadius: config.chaseRadius,
        lastAttackAt: 0,
        kind: config.kind,
        hpBar,
      });
    }
  }

  private createUi(): void {
    this.hpText = this.add
      .text(18, 16, '', {
        color: '#f8fafc',
        fontFamily: 'monospace',
        fontSize: '20px',
        backgroundColor: '#111827',
        padding: { x: 10, y: 6 },
      })
      .setScrollFactor(0)
      .setDepth(100);

    this.statusText = this.add
      .text(18, 58, 'WASD/Arrow: Move  Space: Attack', {
        color: '#cbd5e1',
        fontFamily: 'monospace',
        fontSize: '16px',
        backgroundColor: '#111827',
        padding: { x: 10, y: 6 },
      })
      .setScrollFactor(0)
      .setDepth(100);

    this.bossText = this.add
      .text(18, 100, '', {
        color: '#fecaca',
        fontFamily: 'monospace',
        fontSize: '16px',
        backgroundColor: '#111827',
        padding: { x: 10, y: 6 },
      })
      .setScrollFactor(0)
      .setDepth(100);

    this.minimap = this.add.graphics().setScrollFactor(0).setDepth(110);

    this.overlay = this.add.container(480, 320).setScrollFactor(0).setDepth(200).setVisible(false);
    const panel = this.add.rectangle(0, 0, 500, 190, 0x020617, 0.9).setStrokeStyle(3, 0x94a3b8);
    const title = this.add
      .text(0, -42, '', {
        color: '#f8fafc',
        fontFamily: 'monospace',
        fontSize: '30px',
      })
      .setOrigin(0.5)
      .setName('title');
    const hint = this.add
      .text(0, 32, 'Press R to restart', {
        color: '#cbd5e1',
        fontFamily: 'monospace',
        fontSize: '18px',
      })
      .setOrigin(0.5);
    this.overlay.add([panel, title, hint]);
  }

  private createInput(): void {
    if (!this.input.keyboard) {
      throw new Error('Keyboard input is required for this demo.');
    }
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D') as Record<
      'A' | 'D' | 'S' | 'W',
      Phaser.Input.Keyboard.Key
    >;
    this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.input.keyboard.on('keydown-R', () => {
      if (this.outcome !== 'playing') {
        this.scene.restart();
      }
    });
  }

  private updatePlayerMovement(): void {
    const left = this.cursors.left.isDown || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;
    const up = this.cursors.up.isDown || this.wasd.W.isDown;
    const down = this.cursors.down.isDown || this.wasd.S.isDown;
    const velocity = new Phaser.Math.Vector2(0, 0);

    if (left) {
      velocity.x -= 1;
      this.facing = 'left';
    }
    if (right) {
      velocity.x += 1;
      this.facing = 'right';
    }
    if (up) {
      velocity.y -= 1;
      this.facing = 'up';
    }
    if (down) {
      velocity.y += 1;
      this.facing = 'down';
    }

    velocity.normalize().scale(PLAYER_SPEED);
    this.player.setVelocity(velocity.x, velocity.y);
    this.player.setFlipX(this.facing === 'right');
    if (velocity.lengthSq() > 0) {
      this.player.play('hero-walk', true);
    } else {
      this.player.stop();
      this.player.setFrame(0);
    }
  }

  private performPlayerAttack(time: number): void {
    if (!canAttackAt(time, this.lastPlayerAttackAt, PLAYER_ATTACK_COOLDOWN_MS)) {
      return;
    }
    this.lastPlayerAttackAt = time;
    this.player.setDisplaySize(43, 43);
    this.time.delayedCall(100, () =>
      this.player.setDisplaySize(HERO_DISPLAY_SIZE, HERO_DISPLAY_SIZE),
    );

    const attackPoint = this.getAttackPoint();
    const slash = this.add.image(attackPoint.x, attackPoint.y, 'slash').setDepth(30);
    slash.setAngle(this.facing === 'up' ? -35 : this.facing === 'down' ? 145 : 0);
    slash.setFlipX(this.facing === 'left');
    this.tweens.add({
      targets: slash,
      alpha: 0,
      duration: 150,
      onComplete: () => slash.destroy(),
    });

    for (const enemy of this.enemies) {
      if (!isAlive(enemy.hp)) {
        continue;
      }
      const target = this.spritePoint(enemy.sprite);
      if (isInAttackRange(attackPoint, target, PLAYER_ATTACK_RANGE)) {
        enemy.hp = applyDamage(enemy.hp, PLAYER_DAMAGE);
        enemy.sprite.setTint(0xffffff);
        this.time.delayedCall(80, () => enemy.sprite.clearTint());
        if (!isAlive(enemy.hp)) {
          enemy.sprite.disableBody(true, true);
          enemy.hpBar.clear();
          if (enemy.kind === 'boss') {
            this.finishGame('victory');
          }
        }
      }
    }
  }

  private updateEnemies(time: number): void {
    for (const enemy of this.enemies) {
      if (!isAlive(enemy.hp)) {
        continue;
      }

      const enemyPoint = this.spritePoint(enemy.sprite);
      const playerPoint = this.spritePoint(this.player);
      const distance = Phaser.Math.Distance.Between(
        enemyPoint.x,
        enemyPoint.y,
        playerPoint.x,
        playerPoint.y,
      );

      if (distance < enemy.chaseRadius) {
        this.physics.moveToObject(enemy.sprite, this.player, enemy.speed);
      } else {
        enemy.sprite.setVelocity(0, 0);
      }

      if (
        isInAttackRange(enemyPoint, playerPoint, ENEMY_ATTACK_RANGE) &&
        canAttackAt(time, enemy.lastAttackAt, ENEMY_ATTACK_COOLDOWN_MS)
      ) {
        enemy.lastAttackAt = time;
        this.playerHp = applyDamage(this.playerHp, enemy.damage);
        this.cameras.main.shake(90, 0.004);
        this.player.setTint(0xffd4d4);
        this.time.delayedCall(90, () => this.player.clearTint());
        if (!isAlive(this.playerHp)) {
          this.finishGame('defeat');
        }
      }

      this.drawEnemyHealth(enemy);
    }
  }

  private updateUi(): void {
    this.hpText.setText(`HP ${this.playerHp}/${PLAYER_MAX_HEALTH}`);
    const remainingMonsters = this.enemies.filter(
      (enemy) => enemy.kind === 'slime' && isAlive(enemy.hp),
    ).length;
    const totalMonsters = this.enemies.filter((enemy) => enemy.kind === 'slime').length;
    this.statusText.setText(
      `Monsters ${remainingMonsters}/${totalMonsters}  Space: Attack  R: Restart after end`,
    );
    const boss = this.enemies.find((enemy) => enemy.kind === 'boss');
    if (boss && isAlive(boss.hp)) {
      this.bossText.setText(`Boss HP ${boss.hp}/${boss.maxHp}`);
    } else {
      this.bossText.setText('');
    }
    this.drawMinimap();
  }

  private drawMinimap(): void {
    this.minimap.clear();
    this.minimap.fillStyle(0x020617, 0.78).fillRect(
      MINIMAP.x,
      MINIMAP.y,
      MINIMAP.width,
      MINIMAP.height,
    );
    this.minimap.lineStyle(2, 0x94a3b8, 0.95).strokeRect(
      MINIMAP.x,
      MINIMAP.y,
      MINIMAP.width,
      MINIMAP.height,
    );

    const bossX = this.mapToMinimapX(1770);
    const bossY = this.mapToMinimapY(905);
    const bossW = (320 / WORLD_WIDTH) * MINIMAP.width;
    const bossH = (250 / WORLD_HEIGHT) * MINIMAP.height;
    this.minimap.fillStyle(0x7f1d1d, 0.75).fillRect(bossX, bossY, bossW, bossH);

    for (const enemy of this.enemies) {
      if (!isAlive(enemy.hp)) {
        continue;
      }
      const color = enemy.kind === 'boss' ? 0xef4444 : 0x38bdf8;
      const size = enemy.kind === 'boss' ? 5 : 3;
      this.minimap.fillStyle(color, 1).fillCircle(
        this.mapToMinimapX(enemy.sprite.x),
        this.mapToMinimapY(enemy.sprite.y),
        size,
      );
    }

    this.minimap.fillStyle(0xf8fafc, 1).fillCircle(
      this.mapToMinimapX(this.player.x),
      this.mapToMinimapY(this.player.y),
      4,
    );
  }

  private drawEnemyHealth(enemy: EnemyActor): void {
    enemy.hpBar.clear();
    if (!isAlive(enemy.hp)) {
      return;
    }
    const width = enemy.kind === 'boss' ? 58 : 34;
    const x = enemy.sprite.x - width / 2;
    const y = enemy.sprite.y - (enemy.kind === 'boss' ? 42 : 28);
    const pct = Phaser.Math.Clamp(enemy.hp / enemy.maxHp, 0, 1);
    enemy.hpBar.fillStyle(0x111827, 1).fillRect(x, y, width, 5);
    enemy.hpBar.fillStyle(enemy.kind === 'boss' ? 0xef4444 : 0x38bdf8, 1).fillRect(x, y, width * pct, 5);
  }

  private finishGame(outcome: Exclude<GameOutcome, 'playing'>): void {
    this.outcome = outcome;
    this.player.setVelocity(0, 0);
    for (const enemy of this.enemies) {
      enemy.sprite.setVelocity(0, 0);
    }
    const title = this.overlay.getByName('title') as Phaser.GameObjects.Text;
    title.setText(outcome === 'victory' ? 'Boss defeated' : 'You died');
    this.overlay.setVisible(true);
  }

  private getAttackPoint(): Point {
    const origin = this.spritePoint(this.player);
    const offset = 34;
    if (this.facing === 'left') {
      return { x: origin.x - offset, y: origin.y };
    }
    if (this.facing === 'right') {
      return { x: origin.x + offset, y: origin.y };
    }
    if (this.facing === 'up') {
      return { x: origin.x, y: origin.y - offset };
    }
    return { x: origin.x, y: origin.y + offset };
  }

  private spritePoint(sprite: Phaser.GameObjects.Components.Transform): Point {
    return { x: sprite.x, y: sprite.y };
  }

  private mapToMinimapX(worldX: number): number {
    return MINIMAP.x + (worldX / WORLD_WIDTH) * MINIMAP.width;
  }

  private mapToMinimapY(worldY: number): number {
    return MINIMAP.y + (worldY / WORLD_HEIGHT) * MINIMAP.height;
  }
}
