import * as THREE from 'three';
import playerImg from './assets/Player.png';

const textureLoader = new THREE.TextureLoader();
const playerTexture = textureLoader.load(playerImg);
playerTexture.colorSpace = THREE.SRGBColorSpace;
playerTexture.magFilter = THREE.NearestFilter;
playerTexture.minFilter = THREE.NearestFilter;

export class Player {
  constructor(scene, x, z) {
    this.moving = false;
    this.isInteracting = false;
    this.direction = 1;
    this.speed = 4.5;
    this.hp = 100;
    this.maxHp = 100;

    const geo = new THREE.PlaneGeometry(2.4, 2.4);
    this.material = new THREE.MeshBasicMaterial({
      map: playerTexture,
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
      if (moveX !== 0) {
        this.direction = moveX > 0 ? 1 : -1;
      }
      this.moving = true;
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
    // Flip sprite horizontally when moving left
    this.mesh.scale.x = this.direction > 0 ? 1 : -1;

    // Walking bob effect
    const bob = this.moving ? Math.sin(elapsed * 12) * 0.06 : 0;
    this.mesh.position.y = 1.2 + bob;
  }
}
