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
    this.facing = 'front'; // 'front' | 'side' | 'back'
    this.direction = 1; // 1 = right, -1 = left
    this.speed = 4.5;
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

  update(keys, dt, bounds, cameraAngle) {
    if (this.hp <= 0) {
      this.moving = false;
      this.deathTimer += dt;
      if (cameraAngle) {
        this.mesh.rotation.x = cameraAngle.x;
      }
      return;
    }

    this.deathTimer = 0;
    let moveX = 0;
    let moveZ = 0;

    if (keys['KeyD'] || keys['ArrowRight']) moveX += 1;
    if (keys['KeyA'] || keys['ArrowLeft']) moveX -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) moveZ += 1;
    if (keys['KeyW'] || keys['ArrowUp']) moveZ -= 1;

    const len = Math.hypot(moveX, moveZ);
    if (len > 0) {
      this.group.position.x += (moveX / len) * this.speed * dt;
      this.group.position.z += (moveZ / len) * this.speed * dt;
      this.moving = true;

      // Determine directional facing
      if (Math.abs(moveX) > 0.1) {
        this.facing = 'side';
        this.direction = moveX > 0 ? 1 : -1;
      } else if (moveZ > 0.1) {
        this.facing = 'front';
      } else if (moveZ < -0.1) {
        this.facing = 'back';
      }
    } else {
      this.moving = false;
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
  }

  animate(elapsed) {
    if (this.hp <= 0) {
      const deathFrames = playerTextures.death;
      const deathIndex = Math.min(Math.floor(this.deathTimer * 8), deathFrames.length - 1);
      this.material.map = deathFrames[deathIndex];
      this.mesh.scale.x = 1;
      this.mesh.position.y = 1.2;
      return;
    }

    if (this.moving) {
      if (this.facing === 'side') {
        const frames = playerTextures.side;
        const frameIndex = Math.floor(elapsed * 9) % frames.length;
        this.material.map = frames[frameIndex];
        // SideWalk natively faces left, flip (-1) when moving right (+1)
        this.mesh.scale.x = this.direction > 0 ? -1 : 1;
      } else if (this.facing === 'back') {
        const frames = playerTextures.up;
        const frameIndex = Math.floor(elapsed * 9) % frames.length;
        this.material.map = frames[frameIndex];
        this.mesh.scale.x = 1;
      } else {
        const frames = playerTextures.down;
        const frameIndex = Math.floor(elapsed * 9) % frames.length;
        this.material.map = frames[frameIndex];
        this.mesh.scale.x = 1;
      }
    } else {
      // Idle state
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
    const bob = this.moving ? Math.sin(elapsed * 18) * 0.04 : 0;
    this.mesh.position.y = 1.2 + bob;
  }
}
