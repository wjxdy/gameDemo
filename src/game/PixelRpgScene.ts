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

export class PixelRpgScene extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'a' | 'd' | 's' | 'w', Phaser.Input.Keyboard.Key>;
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

  constructor() {
    super('PixelRpgScene');
  }

  preload(): void {
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
        const key = y > 380 && y < 540 && x > 120 && x < 1320 ? 'tile-path' : 'tile-grass';
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
      { x: 210, y: 740 },
      { x: 520, y: 790 },
      { x: 910, y: 760 },
      { x: 1320, y: 730 },
      { x: 1510, y: 780 },
    ];

    for (const pos of treePositions) {
      const tree = this.obstacles.create(pos.x, pos.y, 'tree');
      tree.setSize(32, 24).setOffset(8, 32).refreshBody();
    }

    const rockPositions: Point[] = [
      { x: 430, y: 315 },
      { x: 610, y: 600 },
      { x: 1010, y: 305 },
      { x: 1240, y: 565 },
    ];

    for (const pos of rockPositions) {
      const rock = this.obstacles.create(pos.x, pos.y, 'rock');
      rock.setSize(32, 20).setOffset(4, 7).refreshBody();
    }

    this.add
      .rectangle(1350, 470, 280, 220, 0x7f1d1d, 0.18)
      .setStrokeStyle(3, 0xef4444, 0.55);
    this.add.text(1240, 345, 'BOSS GROVE', {
      color: '#fecaca',
      fontFamily: 'monospace',
      fontSize: '18px',
    });
  }

  private createPlayer(): void {
    this.add.image(150, 450, 'shadow').setDepth(8);
    this.player = this.physics.add.sprite(150, 450, 'hero').setDepth(10);
    this.player.setCollideWorldBounds(true);
    this.player.body?.setSize(18, 20).setOffset(5, 13);
    this.physics.add.collider(this.player, this.obstacles);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
  }

  private createEnemies(): void {
    const configs: EnemyConfig[] = [
      { kind: 'slime', x: 620, y: 420, maxHealth: 45, damage: 8, speed: 80, chaseRadius: 250 },
      { kind: 'slime', x: 820, y: 610, maxHealth: 45, damage: 8, speed: 80, chaseRadius: 250 },
      { kind: 'slime', x: 980, y: 300, maxHealth: 55, damage: 10, speed: 75, chaseRadius: 260 },
      { kind: 'boss', x: 1370, y: 470, maxHealth: 180, damage: 18, speed: 62, chaseRadius: 360 },
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
      'a' | 'd' | 's' | 'w',
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
    const left = this.cursors.left.isDown || this.wasd.a.isDown;
    const right = this.cursors.right.isDown || this.wasd.d.isDown;
    const up = this.cursors.up.isDown || this.wasd.w.isDown;
    const down = this.cursors.down.isDown || this.wasd.s.isDown;
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
    this.player.setFlipX(this.facing === 'left');
  }

  private performPlayerAttack(time: number): void {
    if (!canAttackAt(time, this.lastPlayerAttackAt, PLAYER_ATTACK_COOLDOWN_MS)) {
      return;
    }
    this.lastPlayerAttackAt = time;
    this.player.setTexture('hero-attack');
    this.time.delayedCall(130, () => this.player.setTexture('hero'));

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
    this.statusText.setText(`Monsters ${remainingMonsters}/3  Space: Attack  R: Restart after end`);
    const boss = this.enemies.find((enemy) => enemy.kind === 'boss');
    if (boss && isAlive(boss.hp)) {
      this.bossText.setText(`Boss HP ${boss.hp}/${boss.maxHp}`);
    } else {
      this.bossText.setText('');
    }
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
}
