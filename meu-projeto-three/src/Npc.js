import * as THREE from 'three';

// Vilão Frames (from src/Vilão)
import vilao1 from './Vilão/1.png';
import vilao2 from './Vilão/2.png';
import vilao3 from './Vilão/3.png';
import vilao4 from './Vilão/4.png';
import vilao5 from './Vilão/5.png';
import vilao6 from './Vilão/6.png';
import vilao7 from './Vilão/7.png';
import vilao8 from './Vilão/8.png';

const textureLoader = new THREE.TextureLoader();

function loadTex(imgSrc) {
  const tex = textureLoader.load(imgSrc);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  return tex;
}

const npcTextures = {
  front: [loadTex(vilao5)],
  side: [
    loadTex(vilao6), loadTex(vilao7), loadTex(vilao8),
    loadTex(vilao2), loadTex(vilao3), loadTex(vilao4)
  ],
  back: [loadTex(vilao1)],
};

export class Npc {
  constructor(scene, x, z) {
    this.isAttacking = false;
    this.isStalking = true;
    this.moving = false;
    this.facing = 'side'; // 'front' | 'side' | 'back'
    this.direction = -1; // 1 = right, -1 = left
    this.speed = 3.6;
    this.hp = 100;
    this.hasSpokenIntro = false;
    this.isVanishing = false;
    this.vanishTimer = 0;
    this.hasVanished = false;

    // Stalker Teleport & Stealth State
    this.currentSpot = null;
    this.isTeleporting = false;
    this.teleportPhase = 'idle'; // 'vanish' | 'reappear' | 'idle'
    this.teleportTimer = 0;
    this.stalkerOpacity = 1.0;
    this.lastSpotId = null;

    // Body Mesh
    const geo = new THREE.PlaneGeometry(2.6, 2.6);
    this.material = new THREE.MeshBasicMaterial({
      map: npcTextures.front[0],
      transparent: true,
      alphaTest: 0.02,
      opacity: 1.0,
      side: THREE.DoubleSide,
    });

    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.position.set(0, 1.3, 0);

    // Eerie Cultist Aura Light (Purple glow)
    this.cultLight = new THREE.PointLight(0xaa00ff, 1.8, 5.0);
    this.cultLight.position.set(0, 1.3, 0.5);

    this.group = new THREE.Group();
    this.group.position.set(x, 0, z);
    this.group.add(this.mesh);
    this.group.add(this.cultLight);

    scene.add(this.group);
  }

  // Pick a random hiding spot ahead of the player in Act 1
  pickRandomSpotAhead(playerX, hidingSpots) {
    if (!hidingSpots || hidingSpots.length === 0) return null;

    let candidates = hidingSpots.filter((s) => {
      return s.x > playerX + 3.5 && s.x < playerX + 26.0 && s.id !== this.lastSpotId;
    });

    if (candidates.length === 0) {
      candidates = hidingSpots.filter((s) => s.x > playerX + 1.0);
    }

    if (candidates.length === 0) {
      return hidingSpots[hidingSpots.length - 1];
    }

    const chosenIndex = Math.floor(Math.random() * candidates.length);
    return candidates[chosenIndex];
  }

  teleportToSpot(newSpot) {
    if (!newSpot) return;
    this.currentSpot = newSpot;
    this.lastSpotId = newSpot.id;
    this.isTeleporting = true;
    this.teleportPhase = 'vanish';
    this.teleportTimer = 0.25;
  }

  // Act 1: Stalker AI
  updateStalker(playerPos, dt, elapsed, hidingSpots, cameraAngle) {
    this.isStalking = true;
    this.isAttacking = false;
    this.moving = false;
    this.group.visible = true;
    this.material.opacity = this.stalkerOpacity;

    if (!this.currentSpot && hidingSpots && hidingSpots.length > 0) {
      const initSpot = this.pickRandomSpotAhead(playerPos.x, hidingSpots) || hidingSpots[0];
      this.currentSpot = initSpot;
      this.lastSpotId = initSpot.id;
      this.group.position.set(initSpot.x, 0, initSpot.z);
    }

    if (this.isTeleporting) {
      this.teleportTimer -= dt;

      if (this.teleportPhase === 'vanish') {
        this.stalkerOpacity = Math.max(0, this.stalkerOpacity - dt * 5.0);
        this.material.opacity = this.stalkerOpacity;

        if (this.teleportTimer <= 0) {
          this.group.position.set(this.currentSpot.x, 0, this.currentSpot.z);
          this.teleportPhase = 'reappear';
          this.teleportTimer = 0.3;
        }
      } else if (this.teleportPhase === 'reappear') {
        this.stalkerOpacity = Math.min(1.0, this.stalkerOpacity + dt * 4.0);
        this.material.opacity = this.stalkerOpacity;

        if (this.teleportTimer <= 0) {
          this.stalkerOpacity = 1.0;
          this.material.opacity = 1.0;
          this.isTeleporting = false;
          this.teleportPhase = 'idle';
        }
      }

      if (cameraAngle) {
        this.mesh.rotation.x = cameraAngle.x;
      }

      return {
        currentSpot: this.currentSpot,
        distToPlayer: 10,
      };
    }

    const distToPlayer = Math.hypot(
      playerPos.x - this.group.position.x,
      playerPos.z - this.group.position.z
    );

    const diffX = playerPos.x - this.group.position.x;
    if (Math.abs(diffX) > 1.2) {
      this.facing = 'side';
      this.direction = diffX > 0 ? 1 : -1;
    } else {
      this.facing = 'front';
    }

    const playerPassedSpot = playerPos.x > this.group.position.x + 3.0;
    const playerApproachedSpot = distToPlayer < 3.2;

    if (playerPassedSpot || playerApproachedSpot) {
      const nextSpot = this.pickRandomSpotAhead(playerPos.x, hidingSpots);
      if (nextSpot && nextSpot.id !== this.currentSpot.id) {
        this.teleportToSpot(nextSpot);
      }
    }

    const peekOffset = (0.22 + Math.sin(elapsed * 2.5) * 0.08) * this.direction;
    this.mesh.position.x = THREE.MathUtils.lerp(this.mesh.position.x, peekOffset, dt * 4);

    if (cameraAngle) {
      this.mesh.rotation.x = cameraAngle.x;
    }

    return {
      currentSpot: this.currentSpot,
      distToPlayer,
    };
  }

  startVanish() {
    if (this.isVanishing || this.hasVanished) return;
    this.isVanishing = true;
    this.vanishTimer = 1.2;
  }

  // Act 2: Altar Ritual Overseer & Fade Vanish
  updateDungeonAltar(playerPos, dt, elapsed, cameraAngle) {
    if (this.hasVanished) {
      this.group.visible = false;
      return { distToPlayer: 999, isInRange: false };
    }

    this.isStalking = false;
    this.group.visible = true;

    // Handle smooth vanishing fade out after speech
    if (this.isVanishing) {
      this.vanishTimer -= dt;
      const opacity = Math.max(0, this.vanishTimer / 1.2);
      this.material.opacity = opacity;
      this.cultLight.intensity = opacity * 2.0;
      this.mesh.position.y += dt * 0.8; // Ascends / dissolves into smoke

      if (this.vanishTimer <= 0) {
        this.isVanishing = false;
        this.hasVanished = true;
        this.group.visible = false;
      }

      if (cameraAngle) {
        this.mesh.rotation.x = cameraAngle.x;
      }
      return { distToPlayer: 999, isInRange: false };
    }

    const dx = playerPos.x - this.group.position.x;
    const dz = playerPos.z - this.group.position.z;
    const dist = Math.hypot(dx, dz);

    if (Math.abs(dx) > 1.0) {
      this.facing = 'side';
      this.direction = dx >= 0 ? 1 : -1;
    } else {
      this.facing = 'front';
    }

    const levitate = Math.sin(elapsed * 3.0) * 0.15;
    this.mesh.position.y = 1.4 + levitate;
    this.cultLight.intensity = 1.5 + Math.sin(elapsed * 4.0) * 0.6;

    if (cameraAngle) {
      this.mesh.rotation.x = cameraAngle.x;
    }

    return {
      distToPlayer: dist,
      isInRange: dist < 3.0,
    };
  }

  resetDungeon(x, z) {
    this.group.position.set(x, 0, z);
    this.isVanishing = false;
    this.hasVanished = false;
    this.hasSpokenIntro = false;
    this.material.opacity = 1.0;
    this.mesh.position.y = 1.3;
    this.cultLight.intensity = 1.8;
    this.group.visible = true;
  }

  animate(elapsed) {
    if (this.hasVanished) return;

    const frames = npcTextures[this.facing] || npcTextures.front;
    const frameIndex = this.moving ? Math.floor(elapsed * 8) % frames.length : 0;
    this.material.map = frames[frameIndex];

    if (this.facing === 'side') {
      this.mesh.scale.x = this.direction > 0 ? -1 : 1;
    } else {
      this.mesh.scale.x = 1;
    }

    if (this.isStalking) {
      const breath = Math.sin(elapsed * 3.5) * 0.04;
      this.mesh.position.y = 1.3 + breath;
    }
  }
}
