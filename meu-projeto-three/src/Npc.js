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
      map: npcTextures.front[0],
      transparent: true,
      alphaTest: 0.02,
      opacity: 1.0,
      side: THREE.DoubleSide,
    });

    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.position.set(0, 1.2, 0);

    this.group = new THREE.Group();
    this.group.position.set(x, 0, z);
    this.group.add(this.mesh);

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
    this.isAttacking = false;
    this.moving = false;

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

    // Calculate distance to player
    const distToPlayer = Math.hypot(
      playerPos.x - this.group.position.x,
      playerPos.z - this.group.position.z
    );

    // Stalker faces towards the player
    const diffX = playerPos.x - this.group.position.x;
    if (Math.abs(diffX) > 1.2) {
      this.facing = 'side';
      this.direction = diffX > 0 ? 1 : -1;
    } else {
      this.facing = 'front';
    }

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

  // Act 2: Dungeon Chase & Attack AI
  updateDungeon(playerPos, dt, elapsed, bounds, cameraAngle) {
    this.isStalking = false;
    this.material.opacity = 1.0;

    if (this.hp <= 0) {
      this.isAttacking = false;
      this.moving = false;
      return { attacking: false };
    }

    const dx = playerPos.x - this.group.position.x;
    const dz = playerPos.z - this.group.position.z;
    const dist = Math.hypot(dx, dz) || 1;

    if (dist < 6.5) {
      this.isAttacking = true;
      const stepX = dx / dist;
      const stepZ = dz / dist;
      this.group.position.x += stepX * this.speed * dt;
      this.group.position.z += stepZ * this.speed * dt;
      this.moving = true;

      // Determine movement direction facing
      if (Math.abs(dx) > Math.abs(dz) * 0.75) {
        this.facing = 'side';
        this.direction = dx >= 0 ? 1 : -1;
      } else if (dz > 0) {
        this.facing = 'front';
      } else {
        this.facing = 'back';
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

      if (dist < 1.4) {
        return { attacking: true, damage: 30 * dt };
      }
      return { attacking: false };
    }

    // Idle wander in dungeon
    this.isAttacking = false;
    this.group.position.x += Math.sin(elapsed * 1.1) * 0.02;
    this.group.position.z += Math.cos(elapsed * 1.0) * 0.02;
    this.facing = 'side';
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
    const frames = npcTextures[this.facing] || npcTextures.front;

    // Cycle through frames at ~8 fps when moving, or use frame 0 when idle
    const frameIndex = this.moving ? Math.floor(elapsed * 8) % frames.length : 0;
    this.material.map = frames[frameIndex];

    // The sprite natively faces left in 6.png/7.png/8.png, flip (-1) when moving right (+1)
    if (this.facing === 'side') {
      this.mesh.scale.x = this.direction > 0 ? -1 : 1;
    } else {
      this.mesh.scale.x = 1;
    }

    // Bobbing / breathing animation
    if (this.isStalking) {
      const breath = Math.sin(elapsed * 3.5) * 0.04;
      this.mesh.position.y = 1.2 + breath;
    } else {
      const bob = this.moving ? Math.sin(elapsed * 14) * 0.05 : 0;
      this.mesh.position.y = 1.2 + bob;
    }
  }
}
