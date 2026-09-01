import * as THREE from 'three';

// Blood Monster Frames (from src/Vilão/Blood Monster_A)
import idle1 from './Vilão/Blood Monster_A/parado.png';
import idle2 from './Vilão/Blood Monster_A/parado2.png';
import idle3 from './Vilão/Blood Monster_A/parado3.png';
import idle4 from './Vilão/Blood Monster_A/parado4.png';

import run1 from './Vilão/Blood Monster_A/andando.png';
import run2 from './Vilão/Blood Monster_A/andando2.png';
import run3 from './Vilão/Blood Monster_A/andando3.png';
import run4 from './Vilão/Blood Monster_A/andando4.png';
import run5 from './Vilão/Blood Monster_A/andando5.png';
import run6 from './Vilão/Blood Monster_A/andando6.png';
import run7 from './Vilão/Blood Monster_A/andando7.png';
import run8 from './Vilão/Blood Monster_A/andando8.png';

import attack1 from './Vilão/Blood Monster_A/ataque.png';
import attack2 from './Vilão/Blood Monster_A/ataque2.png';
import attack3 from './Vilão/Blood Monster_A/ataque3.png';
import attack4 from './Vilão/Blood Monster_A/ataque4.png';
import attack5 from './Vilão/Blood Monster_A/ataque5.png';
import attack6 from './Vilão/Blood Monster_A/ataque6.png';
import attack7 from './Vilão/Blood Monster_A/ataque7.png';
import attack8 from './Vilão/Blood Monster_A/ataque8.png';

const textureLoader = new THREE.TextureLoader();

function loadTex(imgSrc) {
  const tex = textureLoader.load(imgSrc);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  return tex;
}

const enemyTextures = {
  idle: [loadTex(idle1), loadTex(idle2), loadTex(idle3), loadTex(idle4)],
  run: [
    loadTex(run1), loadTex(run2), loadTex(run3), loadTex(run4),
    loadTex(run5), loadTex(run6), loadTex(run7), loadTex(run8)
  ],
  attack: [
    loadTex(attack1), loadTex(attack2), loadTex(attack3), loadTex(attack4),
    loadTex(attack5), loadTex(attack6), loadTex(attack7), loadTex(attack8)
  ],
};

export class Enemy {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.startX = options.x || 0;
    this.startZ = options.z || 0;
    this.name = options.name || 'Blood Monster';
    this.patrolRadius = options.patrolRadius || 3.0;
    this.speed = options.speed || 1.8;
    this.chaseSpeed = options.chaseSpeed || 3.8;
    this.damage = options.damage || 25;
    this.attackRange = 1.0;
    this.attackCooldown = 0;

    this.state = 'PATROL'; // 'PATROL' | 'CHASE' | 'ATTACK'
    this.direction = 1; // 1 = right, -1 = left
    this.isAttacking = false;
    this.attackTimer = 0;
    this.alertTimer = 0;

    this.soundTarget = null;
    this.patrolTarget = {
      x: this.startX + (Math.random() - 0.5) * this.patrolRadius * 2,
      z: this.startZ + (Math.random() - 0.5) * this.patrolRadius * 2,
    };
    this.patrolWaitTimer = 1.0;

    // Sprite Size (4.0 x 4.0)
    const geo = new THREE.PlaneGeometry(4.0, 4.0);
    this.material = new THREE.MeshBasicMaterial({
      map: enemyTextures.idle[0],
      transparent: true,
      alphaTest: 0.04,
      side: THREE.DoubleSide,
    });

    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.position.set(0, 1.9, 0);

    // Menacing red aura point light
    this.glowLight = new THREE.PointLight(0xff0033, 1.8, 5.0);
    this.glowLight.position.set(0, 1.8, 0.5);

    this.group = new THREE.Group();
    this.group.position.set(this.startX, 0, this.startZ);
    this.group.add(this.mesh);
    this.group.add(this.glowLight);

    scene.add(this.group);
  }

  // Pure Sound-Hearing AI: Monster is 100% blind.
  // Only chases if player makes real noise (Noise >= 2).
  // If player is standing still or sneaking (Shift), monster NEVER chases!
  updateBlindMonster(playerPos, playerNoiseLevel, isPlayerSneaking, dt, elapsed, obstacles, cameraAngle) {
    if (this.attackCooldown > 0) {
      this.attackCooldown -= dt;
    }

    const dx = playerPos.x - this.group.position.x;
    const dz = playerPos.z - this.group.position.z;
    const distToPlayer = Math.hypot(dx, dz);

    let isMoving = false;
    let attackTriggered = false;

    // Hearing Thresholds:
    // Standing (Noise 0) or Sneaking (Shift / Noise 1): Inaudible! Hearing range = 0
    // Normal Walk (Noise 2): Audible within 3.5 units
    // Loud noise (Noise 3+ / Breaking urns / Spikes): Audible within 10.0 units
    let hearingRange = 0;
    if (isPlayerSneaking || playerNoiseLevel <= 1) {
      hearingRange = 0; // Completely silent! Monster cannot hear the player at all
    } else if (playerNoiseLevel === 2) {
      hearingRange = 3.5;
    } else if (playerNoiseLevel >= 3) {
      hearingRange = 10.0;
    }

    const makesNoise = playerNoiseLevel >= 2 && !isPlayerSneaking;
    const heardSound = makesNoise && distToPlayer <= hearingRange;

    // If player stops making noise, cancel active chase immediately!
    if (!makesNoise && this.state === 'CHASE') {
      this.state = 'PATROL';
      this.alertTimer = 0;
      this.soundTarget = null;
    }

    // 1. Attack Animation Handling
    if (this.isAttacking) {
      this.attackTimer -= dt;
      if (this.attackTimer <= 0) {
        this.isAttacking = false;
      }
    } else if (this.state === 'CHASE' && distToPlayer <= this.attackRange && this.attackCooldown <= 0) {
      // Melee Attack only when actively chasing the sound and reaching player
      this.state = 'ATTACK';
      this.isAttacking = true;
      this.attackTimer = 0.6;
      this.attackCooldown = 1.3;
      attackTriggered = true;
      this.direction = dx >= 0 ? 1 : -1;
    } else if (heardSound) {
      // Monster hears noise and rushes towards the sound origin!
      this.soundTarget = { x: playerPos.x, z: playerPos.z };
      this.state = 'CHASE';
      this.alertTimer = 2.5;
    }

    // 2. Movement Logic
    if (this.isAttacking) {
      isMoving = false;
    } else if (this.state === 'CHASE' && this.soundTarget && makesNoise) {
      // Move rapidly towards sound source
      const tdx = this.soundTarget.x - this.group.position.x;
      const tdz = this.soundTarget.z - this.group.position.z;
      const distToSound = Math.hypot(tdx, tdz);

      if (distToSound > 0.4) {
        const moveX = (tdx / distToSound) * this.chaseSpeed * dt;
        const moveZ = (tdz / distToSound) * this.chaseSpeed * dt;

        this.moveWithCollision(moveX, moveZ, obstacles);
        this.direction = tdx >= 0 ? 1 : -1;
        isMoving = true;
      }
    } else {
      // PATROL State: Blind wandering within patrol radius
      this.state = 'PATROL';

      if (this.patrolWaitTimer > 0) {
        this.patrolWaitTimer -= dt;
        isMoving = false;
      } else {
        const pdx = this.patrolTarget.x - this.group.position.x;
        const pdz = this.patrolTarget.z - this.group.position.z;
        const pdist = Math.hypot(pdx, pdz);

        if (pdist < 0.4) {
          this.patrolWaitTimer = 1.5 + Math.random() * 2.0;
          this.patrolTarget = {
            x: this.startX + (Math.random() - 0.5) * this.patrolRadius * 2,
            z: this.startZ + (Math.random() - 0.5) * this.patrolRadius * 2,
          };
        } else {
          const moveX = (pdx / pdist) * this.speed * dt;
          const moveZ = (pdz / pdist) * this.speed * dt;

          this.moveWithCollision(moveX, moveZ, obstacles);
          this.direction = pdx >= 0 ? 1 : -1;
          isMoving = true;
        }
      }
    }

    if (cameraAngle) {
      this.mesh.rotation.x = cameraAngle.x;
    }

    this.animate(elapsed, isMoving);

    return {
      attacked: attackTriggered,
      damage: this.damage,
      state: this.state,
      heardSound,
    };
  }

  moveWithCollision(moveX, moveZ, obstacles) {
    const nextX = this.group.position.x + moveX;
    const nextZ = this.group.position.z + moveZ;
    const enemyRadius = 0.5;

    let canMoveX = true;
    let canMoveZ = true;

    if (obstacles) {
      for (const obs of obstacles) {
        if (
          nextX + enemyRadius > obs.minX &&
          nextX - enemyRadius < obs.maxX &&
          this.group.position.z + enemyRadius > obs.minZ &&
          this.group.position.z - enemyRadius < obs.maxZ
        ) {
          canMoveX = false;
        }

        if (
          this.group.position.x + enemyRadius > obs.minX &&
          this.group.position.x - enemyRadius < obs.maxX &&
          nextZ + enemyRadius > obs.minZ &&
          nextZ - enemyRadius < obs.maxZ
        ) {
          canMoveZ = false;
        }
      }
    }

    if (canMoveX) this.group.position.x = nextX;
    if (canMoveZ) this.group.position.z = nextZ;
  }

  animate(elapsed, isMoving) {
    let animKey = 'idle';
    let speedMult = 6;

    if (this.isAttacking) {
      animKey = 'attack';
      speedMult = 8;
    } else if (isMoving) {
      animKey = 'run';
      speedMult = this.state === 'CHASE' ? 10 : 6;
    }

    const frames = enemyTextures[animKey] || enemyTextures.idle;
    const frameIdx = Math.floor(elapsed * speedMult) % frames.length;
    this.material.map = frames[frameIdx];

    this.mesh.scale.x = this.direction > 0 ? 1 : -1;
  }

  reset() {
    this.group.position.set(this.startX, 0, this.startZ);
    this.state = 'PATROL';
    this.isAttacking = false;
    this.attackCooldown = 0;
    this.alertTimer = 0;
    this.soundTarget = null;
  }

  destroy() {
    this.scene.remove(this.group);
  }
}
