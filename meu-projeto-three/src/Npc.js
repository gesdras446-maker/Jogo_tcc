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
    this.isStalking = true;
    this.moving = false;
    this.direction = -1;
    this.speed = 3.6;
    this.hp = 100;

    // Stalker Teleport & Stealth State
    this.currentSpot = null;
    this.isTeleporting = false;
    this.teleportPhase = 'idle'; // 'vanish' | 'reappear' | 'idle'
    this.teleportTimer = 0;
    this.stalkerOpacity = 1.0;
    this.lastSpotId = null;

    // Body Mesh
    const geo = new THREE.PlaneGeometry(2.4, 2.4);
    this.material = new THREE.MeshBasicMaterial({
      map: npcTexture,
      transparent: true,
      alphaTest: 0.02,
      opacity: 1.0,
      side: THREE.DoubleSide,
    });

    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.position.set(0, 1.2, 0);

    // Eerie glowing red eyes for when lurking in shadows
    const eyeCanvas = document.createElement('canvas');
    eyeCanvas.width = 64;
    eyeCanvas.height = 64;
    const ectx = eyeCanvas.getContext('2d');
    ectx.fillStyle = '#ff1744';
    ectx.shadowColor = '#ff1744';
    ectx.shadowBlur = 8;
    ectx.beginPath();
    ectx.arc(22, 28, 5, 0, Math.PI * 2);
    ectx.arc(42, 28, 5, 0, Math.PI * 2);
    ectx.fill();
    const eyeTex = new THREE.CanvasTexture(eyeCanvas);

    this.eyeGlowMat = new THREE.MeshBasicMaterial({
      map: eyeTex,
      transparent: true,
      opacity: 0.9,
      depthTest: false,
    });

    this.eyeGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(0.9, 0.9),
      this.eyeGlowMat
    );
    this.eyeGlow.position.set(0, 1.6, 0.05);
    this.eyeGlow.visible = false;

    this.group = new THREE.Group();
    this.group.position.set(x, 0, z);
    this.group.add(this.mesh);
    this.group.add(this.eyeGlow);

    scene.add(this.group);
  }

  // Pick a random hiding spot ahead of the player
  pickRandomSpotAhead(playerX, hidingSpots) {
    if (!hidingSpots || hidingSpots.length === 0) return null;

    // Filter candidate spots that are ahead of the player (between +4 and +24 units ahead)
    let candidates = hidingSpots.filter((s) => {
      return s.x > playerX + 3.5 && s.x < playerX + 26.0 && s.id !== this.lastSpotId;
    });

    // If near the end, include the final spots
    if (candidates.length === 0) {
      candidates = hidingSpots.filter((s) => s.x > playerX + 1.0);
    }

    // Fallback to last available spot
    if (candidates.length === 0) {
      return hidingSpots[hidingSpots.length - 1];
    }

    // Random choice among candidate hiding spots
    const chosenIndex = Math.floor(Math.random() * candidates.length);
    return candidates[chosenIndex];
  }

  // Teleport the stalker with shadow vanish and reappear effect
  teleportToSpot(newSpot) {
    if (!newSpot) return;
    this.currentSpot = newSpot;
    this.lastSpotId = newSpot.id;
    this.isTeleporting = true;
    this.teleportPhase = 'vanish';
    this.teleportTimer = 0.25; // Vanish duration
  }

  // Act 1: Stalker AI with Random Teleportation and Hiding behind Buildings/Moitas/Trees
  updateStalker(playerPos, dt, elapsed, hidingSpots, cameraAngle) {
    this.isStalking = true;
    this.isSadistic = false;

    // Initial spot assignment
    if (!this.currentSpot && hidingSpots && hidingSpots.length > 0) {
      const initSpot = this.pickRandomSpotAhead(playerPos.x, hidingSpots) || hidingSpots[0];
      this.currentSpot = initSpot;
      this.lastSpotId = initSpot.id;
      this.group.position.set(initSpot.x, 0, initSpot.z);
    }

    // Handle Teleportation Animation
    if (this.isTeleporting) {
      this.teleportTimer -= dt;

      if (this.teleportPhase === 'vanish') {
        // Fade out into shadows
        this.stalkerOpacity = Math.max(0, this.stalkerOpacity - dt * 5.0);
        this.material.opacity = this.stalkerOpacity;
        this.eyeGlowMat.opacity = this.stalkerOpacity;

        if (this.teleportTimer <= 0) {
          // Instant relocation while invisible
          this.group.position.set(this.currentSpot.x, 0, this.currentSpot.z);
          this.teleportPhase = 'reappear';
          this.teleportTimer = 0.3;
        }
      } else if (this.teleportPhase === 'reappear') {
        // Fade in emerging from behind obstacle
        this.stalkerOpacity = Math.min(1.0, this.stalkerOpacity + dt * 4.0);
        this.material.opacity = this.stalkerOpacity;
        this.eyeGlowMat.opacity = this.stalkerOpacity;

        if (this.teleportTimer <= 0) {
          this.stalkerOpacity = 1.0;
          this.material.opacity = 1.0;
          this.eyeGlowMat.opacity = 0.9;
          this.isTeleporting = false;
          this.teleportPhase = 'idle';
        }
      }

      if (cameraAngle) {
        this.mesh.rotation.x = cameraAngle.x;
        this.eyeGlow.rotation.x = cameraAngle.x;
      }

      return {
        currentSpot: this.currentSpot,
        distToPlayer: 10,
      };
    }

    // Calculate distance to player
    const distToPlayer = Math.hypot(
      playerPos.x - this.group.position.x,
      playerPos.z - this.group.position.z
    );

    // Stalker faces the player
    this.direction = playerPos.x >= this.group.position.x ? 1 : -1;

    // Check if player is too close OR if player has walked past the hiding spot
    const playerPassedSpot = playerPos.x > this.group.position.x + 3.0;
    const playerApproachedSpot = distToPlayer < 3.2;

    if (playerPassedSpot || playerApproachedSpot) {
      // Trigger instant shadow teleport to a new random spot further ahead!
      const nextSpot = this.pickRandomSpotAhead(playerPos.x, hidingSpots);
      if (nextSpot && nextSpot.id !== this.currentSpot.id) {
        this.teleportToSpot(nextSpot);
      }
    }

    // Peeking Animation while lurking
    // Subtle peek out from behind tree/bush/building corner
    const peekOffset = (0.22 + Math.sin(elapsed * 2.5) * 0.08) * this.direction;
    this.mesh.position.x = THREE.MathUtils.lerp(this.mesh.position.x, peekOffset, dt * 4);
    this.eyeGlow.visible = true;

    if (cameraAngle) {
      this.mesh.rotation.x = cameraAngle.x;
      this.eyeGlow.rotation.x = cameraAngle.x;
    }

    return {
      currentSpot: this.currentSpot,
      distToPlayer,
    };
  }

  // Act 2: Dungeon Chase & Attack AI
  updateDungeon(playerPos, dt, elapsed, bounds, cameraAngle) {
    this.isStalking = false;
    this.eyeGlow.visible = false;
    this.material.opacity = 1.0;

    if (this.hp <= 0) {
      this.isSadistic = false;
      this.moving = false;
      return { attacking: false };
    }

    const dx = playerPos.x - this.group.position.x;
    const dz = playerPos.z - this.group.position.z;
    const dist = Math.hypot(dx, dz) || 1;

    if (dist < 6.5) {
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

      if (dist < 1.4) {
        return { attacking: true, damage: 30 * dt };
      }
      return { attacking: false };
    }

    // Idle wander in dungeon
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
    // Sprite horizontal flip
    this.mesh.scale.x = this.direction > 0 ? 1 : -1;
    this.eyeGlow.scale.x = this.direction > 0 ? 1 : -1;

    // Bobbing / breathing animation
    if (this.isStalking) {
      const breath = Math.sin(elapsed * 3.5) * 0.04;
      this.mesh.position.y = 1.2 + breath;
    } else {
      const bob = this.moving ? Math.sin(elapsed * 12) * 0.06 : 0;
      this.mesh.position.y = 1.2 + bob;
    }
  }
}
