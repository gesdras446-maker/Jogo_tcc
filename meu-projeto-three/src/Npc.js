import * as THREE from 'three';
import npcImg from './assets/coisa.png';

const textureLoader = new THREE.TextureLoader();
const npcTexture = textureLoader.load(npcImg);
npcTexture.colorSpace = THREE.SRGBColorSpace;
npcTexture.magFilter = THREE.NearestFilter;
npcTexture.minFilter = THREE.NearestFilter;

export class Npc {
  constructor(scene, x, z) {
    this.isSadistic = false;
    this.moving = false;
    this.direction = -1;
    this.speed = 3.6;
    this.hp = 100;

    // Body Mesh using updated coisa.png image
    const geo = new THREE.PlaneGeometry(2.4, 2.4);
    this.material = new THREE.MeshBasicMaterial({
      map: npcTexture,
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

  update(playerPos, dt, elapsed, bounds, cameraAngle) {
    if (this.hp <= 0) {
      this.isSadistic = false;
      this.moving = false;
      return { attacking: false };
    }

    const dx = playerPos.x - this.group.position.x;
    const dz = playerPos.z - this.group.position.z;
    const dist = Math.hypot(dx, dz) || 1;

    // Trigger chase mode when player comes close
    if (dist < 6.0) {
      this.isSadistic = true;

      const stepX = dx / dist;
      const stepZ = dz / dist;
      this.group.position.x += stepX * this.speed * dt;
      this.group.position.z += stepZ * this.speed * dt;
      this.direction = stepX >= 0 ? 1 : -1;
      this.moving = true;

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

      if (dist < 1.3) {
        return { attacking: true, damage: 30 * dt };
      }
      return { attacking: false };
    }

    // Normal peaceful wander mode
    this.isSadistic = false;
    this.group.position.x += Math.sin(elapsed * 1.1) * 0.02;
    this.group.position.z += Math.cos(elapsed * 1.0) * 0.02;
    this.direction = Math.sin(elapsed * 1.1) >= 0 ? 1 : -1;
    this.moving = true;

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

    return { attacking: false };
  }

  animate(elapsed) {
    // Flip sprite horizontally when changing movement direction
    this.mesh.scale.x = this.direction > 0 ? 1 : -1;

    // Walking bob animation
    const bob = this.moving ? Math.sin(elapsed * 12) * 0.06 : 0;
    this.mesh.position.y = 1.2 + bob;
  }
}
