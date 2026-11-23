// GrandeMonstro.js — Boss da fusão do Ato 3
// Animação: Blood Monsters convergem e se fundem no Grande Monstro
import * as THREE from 'three';

// Frames de caminhada dos Blood Monsters (fusão)
import bm1  from './Vilão/Blood Monster_A/andando.png';
import bm2  from './Vilão/Blood Monster_A/andando2.png';
import bm3  from './Vilão/Blood Monster_A/andando3.png';
import bm4  from './Vilão/Blood Monster_A/andando4.png';
import bm5  from './Vilão/Blood Monster_A/andando5.png';
import bm6  from './Vilão/Blood Monster_A/andando6.png';
import bm7  from './Vilão/Blood Monster_A/andando7.png';
import bm8  from './Vilão/Blood Monster_A/andando8.png';

// Frames do Grande Monstro
import gm2  from './Vilão/Grande Monstro/2.png';
import gm3  from './Vilão/Grande Monstro/3.png';
import gm4  from './Vilão/Grande Monstro/4.png';
import gm5  from './Vilão/Grande Monstro/5.png';
import gm6  from './Vilão/Grande Monstro/6.png';
import gm7  from './Vilão/Grande Monstro/7.png';
import gm8  from './Vilão/Grande Monstro/8.png';
import gm9  from './Vilão/Grande Monstro/9.png';
import gm10 from './Vilão/Grande Monstro/10.png';
import gm11 from './Vilão/Grande Monstro/11.png';
import gm12 from './Vilão/Grande Monstro/12.png';
import gmG  from './Vilão/Grande Monstro/Grande.png';

const BM_FRAMES = [bm1, bm2, bm3, bm4, bm5, bm6, bm7, bm8];
const GM_FRAMES = [gm2, gm3, gm4, gm5, gm6, gm7, gm8, gm9, gm10, gm11, gm12, gmG];

const FUSION_DURATION   = 4.0;   // segundos de animação de fusão
const CHASE_SPEED       = 5.5;   // unidades/s do Grande Monstro
const ATTACK_RANGE      = 2.0;   // distância para causar dano
const ATTACK_DAMAGE     = 30;    // dano por acerto
const ATTACK_COOLDOWN   = 1.2;   // segundos entre ataques
const GM_SIZE           = 5.5;   // tamanho do sprite do Grande Monstro
const BM_SIZE           = 3.5;   // tamanho dos sprites de Blood Monster na fusão
const GM_FRAME_RATE     = 8;     // fps de animação do Grande Monstro

// Posições iniciais dos 4 Blood Monsters ao redor do ponto de fusão
const BM_OFFSETS = [
  { x: -7, z: -7 },
  { x:  7, z: -7 },
  { x: -7, z:  7 },
  { x:  7, z:  7 },
];

export class GrandeMonstro {
  /**
   * @param {THREE.Scene} scene
   * @param {number} fusionX  — centro X da fusão (onde os BMs convergem)
   * @param {number} fusionZ  — centro Z da fusão
   */
  constructor(scene, fusionX, fusionZ) {
    this.scene     = scene;
    this.fusionX   = fusionX;
    this.fusionZ   = fusionZ;
    this.state     = 'IDLE'; // IDLE → FUSING → CHASING → ATTACKING
    this.fusionTimer   = 0;
    this.attackTimer   = 0;
    this.gmFrameTimer  = 0;
    this.gmFrameIdx    = 0;
    this.bmFrameTimer  = 0;
    this.bmFrameIdx    = 0;
    this._destroyed    = false;

    const loader = new THREE.TextureLoader();

    // ── Blood Monster sprites (4 instâncias) ──────────────────────────
    this.bmTextures = BM_FRAMES.map((src) => {
      const t = loader.load(src);
      t.magFilter = THREE.NearestFilter;
      return t;
    });

    this.bmSprites = BM_OFFSETS.map((off) => {
      const mat = new THREE.SpriteMaterial({
        map: this.bmTextures[0],
        transparent: true,
        opacity: 1,
        depthWrite: false,
      });
      const sp = new THREE.Sprite(mat);
      sp.scale.set(BM_SIZE, BM_SIZE, 1);
      sp.position.set(fusionX + off.x, BM_SIZE / 2, fusionZ + off.z);
      scene.add(sp);
      return sp;
    });

    // Posições iniciais para lerp durante a fusão
    this.bmStartPos = BM_OFFSETS.map((off) => ({
      x: fusionX + off.x,
      z: fusionZ + off.z,
    }));

    // ── Grande Monstro sprite (inicialmente invisível) ─────────────────
    this.gmTextures = GM_FRAMES.map((src) => {
      const t = loader.load(src);
      t.magFilter = THREE.NearestFilter;
      return t;
    });

    this.gmMat = new THREE.SpriteMaterial({
      map: this.gmTextures[0],
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    this.gmSprite = new THREE.Sprite(this.gmMat);
    this.gmSprite.scale.set(GM_SIZE, GM_SIZE, 1);
    this.gmSprite.position.set(fusionX, GM_SIZE / 2, fusionZ);
    scene.add(this.gmSprite);

    // ── Flash de fusão (plano vermelho/branco semi-transparente) ────────
    const flashGeo = new THREE.PlaneGeometry(10, 10);
    this.flashMat  = new THREE.MeshBasicMaterial({
      color: 0xff2200,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    this.flashMesh = new THREE.Mesh(flashGeo, this.flashMat);
    this.flashMesh.rotation.x = -Math.PI / 2;
    this.flashMesh.position.set(fusionX, 0.05, fusionZ);
    scene.add(this.flashMesh);

    // posição atual do Grande Monstro (para chase)
    this.pos = new THREE.Vector3(fusionX, GM_SIZE / 2, fusionZ);
  }

  /** Inicia a sequência de fusão */
  startFusion() {
    this.state = 'FUSING';
    this.fusionTimer = 0;
  }

  /** Pausa a perseguição (quando o Cultista intervém na ponte) */
  pauseChase() {
    this.state = 'PAUSED';
  }

  /** Retoma a perseguição (se o jogador recusar o acordo) */
  resumeChase() {
    this.state = 'CHASING';
    this.attackTimer = 0;
  }

  /** Chamado a cada frame do game loop.
   *  Retorna { attacked: bool, damage: number } */
  update(playerPos, dt, elapsed) {
    if (this._destroyed) return { attacked: false, damage: 0 };

    // ── Animação do Blood Monster ──────────────────────────────────────
    this.bmFrameTimer += dt;
    if (this.bmFrameTimer >= 1 / GM_FRAME_RATE) {
      this.bmFrameTimer = 0;
      this.bmFrameIdx   = (this.bmFrameIdx + 1) % BM_FRAMES.length;
      const bmTex = this.bmTextures[this.bmFrameIdx];
      this.bmSprites.forEach((sp) => { sp.material.map = bmTex; sp.material.needsUpdate = true; });
    }

    // ── Animação do Grande Monstro ─────────────────────────────────────
    this.gmFrameTimer += dt;
    if (this.gmFrameTimer >= 1 / GM_FRAME_RATE) {
      this.gmFrameTimer = 0;
      this.gmFrameIdx   = (this.gmFrameIdx + 1) % GM_FRAMES.length;
      this.gmMat.map = this.gmTextures[this.gmFrameIdx];
      this.gmMat.needsUpdate = true;
    }

    // ── Máquina de estados ─────────────────────────────────────────────
    if (this.state === 'PAUSED') {
      // Parado obedecendo a ordem do Cultista
      return { attacked: false, damage: 0 };
    }

    if (this.state === 'FUSING') {
      this.fusionTimer += dt;
      const t = Math.min(this.fusionTimer / FUSION_DURATION, 1.0);

      // Fase 1 (0–50 %): Blood Monsters convergem
      if (t < 0.5) {
        const lerp = t / 0.5; // 0→1 durante a primeira metade
        this.bmSprites.forEach((sp, i) => {
          const start = this.bmStartPos[i];
          sp.position.x = start.x + (this.fusionX - start.x) * lerp;
          sp.position.z = start.z + (this.fusionZ - start.z) * lerp;
          // pulsar escala
          const pulse = 1.0 + 0.15 * Math.sin(elapsed * 10);
          sp.scale.set(BM_SIZE * pulse, BM_SIZE * pulse, 1);
          sp.material.opacity = 1;
        });
        this.gmMat.opacity = 0;
        this.flashMat.opacity = 0;
      }

      // Fase 2 (50–75 %): Flash + BMs desaparecem + GM aparece
      else if (t < 0.75) {
        const sub = (t - 0.5) / 0.25; // 0→1
        const flashPeak = Math.sin(sub * Math.PI); // sobe e desce
        this.flashMat.opacity = flashPeak * 0.85;

        this.bmSprites.forEach((sp) => {
          sp.material.opacity = 1 - sub;
          sp.position.x = this.fusionX;
          sp.position.z = this.fusionZ;
        });

        // Grande Monstro aparece e pulsa
        this.gmMat.opacity = sub;
        const gmPulse = 1.0 + 0.4 * sub;
        this.gmSprite.scale.set(GM_SIZE * gmPulse, GM_SIZE * gmPulse, 1);
      }

      // Fase 3 (75–100 %): GM estabiliza, flash some
      else {
        const sub = (t - 0.75) / 0.25; // 0→1
        this.bmSprites.forEach((sp) => { sp.material.opacity = 0; });
        this.gmMat.opacity = 1;
        this.flashMat.opacity = (1 - sub) * 0.3;
        this.gmSprite.scale.set(GM_SIZE, GM_SIZE, 1);
      }

      // Fim da fusão → começa perseguição
      if (t >= 1.0) {
        this.state = 'CHASING';
        this.flashMat.opacity = 0;
        this.bmSprites.forEach((sp) => { sp.visible = false; });
      }

      return { attacked: false, damage: 0 };
    }

    if (this.state === 'CHASING' || this.state === 'ATTACKING') {
      // Move em direção ao player
      const dx = playerPos.x - this.pos.x;
      const dz = playerPos.z - this.pos.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist > 0.1) {
        const speed = this.state === 'ATTACKING' ? CHASE_SPEED * 0.5 : CHASE_SPEED;
        const move  = Math.min(speed * dt, dist);
        this.pos.x += (dx / dist) * move;
        this.pos.z += (dz / dist) * move;
      }

      this.gmSprite.position.set(this.pos.x, GM_SIZE / 2, this.pos.z);

      // Verificar ataque
      this.attackTimer += dt;
      if (dist <= ATTACK_RANGE && this.attackTimer >= ATTACK_COOLDOWN) {
        this.attackTimer = 0;
        this.state = 'ATTACKING';
        return { attacked: true, damage: ATTACK_DAMAGE };
      }

      if (dist > ATTACK_RANGE) {
        this.state = 'CHASING';
      }
    }

    return { attacked: false, damage: 0 };
  }

  /** Remove todos os objetos da cena */
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    this.bmSprites.forEach((sp) => this.scene.remove(sp));
    this.scene.remove(this.gmSprite);
    this.scene.remove(this.flashMesh);
  }
}

