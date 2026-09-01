import * as THREE from 'three';

// Idle Frames (1 to 10)
import idle1 from './Player/Idle/IdleAnimation1.png';
import idle2 from './Player/Idle/IdleAnimation2.png';
import idle3 from './Player/Idle/IdleAnimation3.png';
import idle4 from './Player/Idle/IdleAnimation4.png';
import idle5 from './Player/Idle/IdleAnimation5.png';
import idle6 from './Player/Idle/IdleAnimation6.png';
import idle7 from './Player/Idle/IdleAnimation7.png';
import idle8 from './Player/Idle/IdleAnimation8.png';
import idle9 from './Player/Idle/IdleAnimation9.png';
import idle10 from './Player/Idle/IdleAnimation10.png';

// Down Walk Frames (1 to 6)
import down1 from './Player/DownWalk/DownWalk1.png';
import down2 from './Player/DownWalk/DownWalk2.png';
import down3 from './Player/DownWalk/DownWalk3.png';
import down4 from './Player/DownWalk/DownWalk4.png';
import down5 from './Player/DownWalk/DownWalk5.png';
import down6 from './Player/DownWalk/DownWalk6.png';

// Side Walk Frames (1 to 5)
import side1 from './Player/SideWalk/SideWalk1.png';
import side2 from './Player/SideWalk/SideWalk2.png';
import side3 from './Player/SideWalk/SideWalk3.png';
import side4 from './Player/SideWalk/SideWalk4.png';
import side5 from './Player/SideWalk/SideWalk5.png';

// Up Walk Frames (1 to 6)
import up1 from './Player/UpWalk/UpWalk1.png';
import up2 from './Player/UpWalk/UpWalk2.png';
import up3 from './Player/UpWalk/UpWalk3.png';
import up4 from './Player/UpWalk/UpWalk4.png';
import up5 from './Player/UpWalk/UpWalk5.png';
import up6 from './Player/UpWalk/UpWalk6.png';

// Death Frames (1 to 11)
import death1 from './Player/Death/RogueDeathAnimation1.png';
import death2 from './Player/Death/RogueDeathAnimation2.png';
import death3 from './Player/Death/RogueDeathAnimation3.png';
import death4 from './Player/Death/RogueDeathAnimation4.png';
import death5 from './Player/Death/RogueDeathAnimation5.png';
import death6 from './Player/Death/RogueDeathAnimation6.png';
import death7 from './Player/Death/RogueDeathAnimation7.png';
import death8 from './Player/Death/RogueDeathAnimation8.png';
import death9 from './Player/Death/RogueDeathAnimation9.png';
import death10 from './Player/Death/RogueDeathAnimation10.png';
import death11 from './Player/Death/RogueDeathAnimation11.png';

const textureLoader = new THREE.TextureLoader();

function loadTex(imgSrc) {
  const tex = textureLoader.load(imgSrc);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  return tex;
}

const playerTextures = {
  idle: [
    loadTex(idle1), loadTex(idle2), loadTex(idle3), loadTex(idle4), loadTex(idle5),
    loadTex(idle6), loadTex(idle7), loadTex(idle8), loadTex(idle9), loadTex(idle10)
  ],
  down: [
    loadTex(down1), loadTex(down2), loadTex(down3),
    loadTex(down4), loadTex(down5), loadTex(down6)
  ],
  side: [
    loadTex(side1), loadTex(side2), loadTex(side3),
    loadTex(side4), loadTex(side5)
  ],
  up: [
    loadTex(up1), loadTex(up2), loadTex(up3),
    loadTex(up4), loadTex(up5), loadTex(up6)
  ],
  death: [
    loadTex(death1), loadTex(death2), loadTex(death3), loadTex(death4),
    loadTex(death5), loadTex(death6), loadTex(death7), loadTex(death8),
    loadTex(death9), loadTex(death10), loadTex(death11)
  ]
};

export class Player {
  constructor(scene, x, z) {
    this.moving = false;
    this.isInteracting = false;
    this.isSneaking = false;
    this.isFalling = false;
    this.fallTimer = 0;
    this.fallDuration = 0.8;
    this.noiseLevel = 0; // 0 = silent, 1 = sneak, 2 = walk, 3 = loud/running
    this.facing = 'front'; // 'front' | 'side' | 'back'
    this.direction = 1; // 1 = right, -1 = left
    this.baseSpeed = 4.8;
    this.sneakSpeed = 2.2;
    this.hp = 100;
    this.maxHp = 100;
    this.deathTimer = 0;

    const geo = new THREE.PlaneGeometry(2.4, 2.4);
    this.material = new THREE.MeshBasicMaterial({
      map: playerTextures.idle[0],
      transparent: true,
      alphaTest: 0.05,
      side: THREE.DoubleSide,
    });

    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.position.set(0, 1.2, 0);

    this.group = new THREE.Group();
    this.group.position.set(x, 0, z);
    this.group.add(this.mesh);

    scene.add(this.group);
  }

  triggerHoleFall() {
    if (this.isFalling) return;
    this.isFalling = true;
    this.fallTimer = 0;
    this.moving = false;
  }

  update(keys, dt, bounds, cameraAngle, obstacles) {
    // Handle Falling in Hole Animation
    if (this.isFalling) {
      this.fallTimer += dt;
      const progress = Math.min(this.fallTimer / this.fallDuration, 1.0);

      // Shrink and drop down into hole
      const scale = Math.max(0.01, 1.0 - progress);
      this.mesh.scale.set(scale, scale, scale);
      this.mesh.position.y = 1.2 - progress * 2.2;
      this.mesh.rotation.z += dt * 14;

      if (cameraAngle) {
        this.mesh.rotation.x = cameraAngle.x;
      }
      return { finishedFall: progress >= 1.0 };
    }

    if (this.hp <= 0) {
      this.moving = false;
      this.deathTimer += dt;
      if (cameraAngle) {
        this.mesh.rotation.x = cameraAngle.x;
      }
      return { finishedFall: false };
    }

    this.deathTimer = 0;
    let moveX = 0;
    let moveZ = 0;

    if (keys['KeyD'] || keys['ArrowRight']) moveX += 1;
    if (keys['KeyA'] || keys['ArrowLeft']) moveX -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) moveZ += 1;
    if (keys['KeyW'] || keys['ArrowUp']) moveZ -= 1;

    // Shift key for sneak (passos silenciosos)
    this.isSneaking = Boolean(keys['ShiftLeft'] || keys['ShiftRight']);
    const currentSpeed = this.isSneaking ? this.sneakSpeed : this.baseSpeed;

    const len = Math.hypot(moveX, moveZ);
    if (len > 0) {
      this.moving = true;
      const stepX = (moveX / len) * currentSpeed * dt;
      const stepZ = (moveZ / len) * currentSpeed * dt;

      // Obstacle collision check with dungeon walls & pillars
      this.moveWithObstacles(stepX, stepZ, obstacles);

      // Determine directional facing
      if (Math.abs(moveX) > 0.1) {
        this.facing = 'side';
        this.direction = moveX > 0 ? 1 : -1;
      } else if (moveZ > 0.1) {
        this.facing = 'front';
      } else if (moveZ < -0.1) {
        this.facing = 'back';
      }

      // Calculate noise level (Furtividade)
      this.noiseLevel = this.isSneaking ? 1 : 2;
    } else {
      this.moving = false;
      this.noiseLevel = 0;
    }

    if (bounds) {
      this.group.position.x = THREE.MathUtils.clamp(
        this.group.position.x,
        bounds.minX,
        bounds.maxX
      );
      this.group.position.z = THREE.MathUtils.clamp(
        this.group.position.z,
        bounds.minZ,
        bounds.maxZ
      );
    }

    if (cameraAngle) {
      this.mesh.rotation.x = cameraAngle.x;
    }

    return { finishedFall: false };
  }

  moveWithObstacles(stepX, stepZ, obstacles) {
    const nextX = this.group.position.x + stepX;
    const nextZ = this.group.position.z + stepZ;

    let canMoveX = true;
    let canMoveZ = true;

    if (obstacles) {
      const radius = 0.5;
      for (const obs of obstacles) {
        if (
          nextX + radius > obs.minX &&
          nextX - radius < obs.maxX &&
          this.group.position.z + radius > obs.minZ &&
          this.group.position.z - radius < obs.maxZ
        ) {
          canMoveX = false;
        }
        if (
          this.group.position.x + radius > obs.minX &&
          this.group.position.x - radius < obs.maxX &&
          nextZ + radius > obs.minZ &&
          nextZ - radius < obs.maxZ
        ) {
          canMoveZ = false;
        }
      }
    }

    if (canMoveX) this.group.position.x = nextX;
    if (canMoveZ) this.group.position.z = nextZ;
  }

  animate(elapsed) {
    if (this.isFalling) return;

    if (this.hp <= 0) {
      const deathFrames = playerTextures.death;
      const deathIndex = Math.min(Math.floor(this.deathTimer * 8), deathFrames.length - 1);
      this.material.map = deathFrames[deathIndex];
      this.mesh.scale.x = 1;
      this.mesh.position.y = 1.2;
      return;
    }

    const animSpeed = this.isSneaking ? 5 : 9;

    if (this.moving) {
      if (this.facing === 'side') {
        const frames = playerTextures.side;
        const frameIndex = Math.floor(elapsed * animSpeed) % frames.length;
        this.material.map = frames[frameIndex];
        this.mesh.scale.x = this.direction > 0 ? -1 : 1;
      } else if (this.facing === 'back') {
        const frames = playerTextures.up;
        const frameIndex = Math.floor(elapsed * animSpeed) % frames.length;
        this.material.map = frames[frameIndex];
        this.mesh.scale.x = 1;
      } else {
        const frames = playerTextures.down;
        const frameIndex = Math.floor(elapsed * animSpeed) % frames.length;
        this.material.map = frames[frameIndex];
        this.mesh.scale.x = 1;
      }
    } else {
      if (this.facing === 'front') {
        const frames = playerTextures.idle;
        const frameIndex = Math.floor(elapsed * 8) % frames.length;
        this.material.map = frames[frameIndex];
        this.mesh.scale.x = 1;
      } else if (this.facing === 'side') {
        this.material.map = playerTextures.side[0];
        this.mesh.scale.x = this.direction > 0 ? -1 : 1;
      } else {
        this.material.map = playerTextures.up[0];
        this.mesh.scale.x = 1;
      }
    }

    // Walking bob effect
    const bob = this.moving ? Math.sin(elapsed * (this.isSneaking ? 10 : 18)) * (this.isSneaking ? 0.02 : 0.04) : 0;
    this.mesh.position.y = 1.2 + bob;
    this.mesh.scale.y = 1;
    this.mesh.rotation.z = 0;
  }

  reset(x, z) {
    this.group.position.set(x, 0, z);
    this.isFalling = false;
    this.fallTimer = 0;
    this.hp = 100;
    this.mesh.scale.set(1, 1, 1);
    this.mesh.position.y = 1.2;
    this.mesh.rotation.z = 0;
  }
}
