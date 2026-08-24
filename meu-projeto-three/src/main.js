import * as THREE from 'three';

import { Npc } from './Npc.js';
import { Player } from './Player.js';
import { createDungeonRoom } from './Room.js';

import { createStreetEnvironment } from './Street.js';
import './style.css';

const app = document.querySelector('#app');
app.innerHTML = `
  <div class="rpg-banner">
    <div class="act-badge" id="actBadge">ATO 1: A RUA ESCURA</div>
    <div class="health-bar-container">
      <div class="health-bar">
        <div class="health-bar-fill" id="playerHealthFill"></div>
      </div>
    </div>
    <div>WASD: Mover | E: Interagir</div>
    <button class="btn-menu-trigger" id="openMenuBtn">⚙️ MENU (ESC)</button>
  </div>

  <div class="dialogue-box" id="dialogueBox">
    <div class="dialogue-speaker" id="dialogueSpeaker">NARRADOR</div>
    <div class="dialogue-text" id="dialogueText">Uma noite chuvosa e escura sob o viaduto... Alguém parece estar te observando nas sombras dos postes.</div>
  </div>

  <!-- Kidnapping Cutscene Overlay -->
  <div class="cutscene-overlay hidden" id="cutsceneOverlay">
    <div class="cutscene-title">⚠️ VOCÊ FOI SEQUESTRADO!</div>
    <div class="cutscene-text" id="cutsceneText">
      Enquanto você caminhava pela rua escura, a figura misteriosa avançou pelas sombras por trás de você...<br><br>
      Você sente um golpe forte e apaga! Ao abrir os olhos, percebe que foi levado e trancado no calabouço da casa dela...
    </div>
    <button class="cutscene-btn" id="btnWakeUp">👁️ Acordar no Calabouço</button>
  </div>

  <!-- Main Menu / Settings Overlay -->
  <div class="menu-overlay" id="menuOverlay">
    <div class="menu-card" id="mainMenuCard">
      <div class="menu-title">CALABOUÇO</div>
      <div class="menu-subtitle">MENU PRINCIPAL</div>
      
      <div class="menu-buttons">
        <button class="menu-btn primary" id="btnNewGame">⚔️ Novo Jogo</button>
        <button class="menu-btn" id="btnContinue">💾 Continuar</button>
        <button class="menu-btn" id="btnSettings">⚙️ Configurações</button>
        <button class="menu-btn" id="btnResumeGame" style="display: none;">▶️ Voltar ao Jogo</button>
      </div>
    </div>

    <!-- Settings Sub-Card -->
    <div class="menu-card" id="settingsCard" style="display: none;">
      <div class="menu-title">CONFIGURAÇÕES</div>
      <div class="menu-subtitle">AJUSTES DE ÁUDIO E SOM</div>

      <div class="settings-group">
        <div class="setting-row">
          <div class="setting-label">
            <span>🔊 Volume Geral</span>
            <span class="setting-value" id="volumeValue">80%</span>
          </div>
          <input type="range" min="0" max="100" value="80" class="setting-slider" id="volumeSlider" />
        </div>

        <div class="setting-row">
          <div class="setting-label">
            <span>🎵 Efeitos Sonoros</span>
            <span class="setting-value" id="sfxValue">100%</span>
          </div>
          <input type="range" min="0" max="100" value="100" class="setting-slider" id="sfxSlider" />
        </div>

        <div class="setting-row">
          <button class="setting-toggle active" id="btnMuteToggle">
            <span>Modo de Áudio:</span>
            <span id="muteStatusText">🔊 COM SOM</span>
          </button>
        </div>
      </div>

      <div class="menu-buttons">
        <button class="menu-btn" id="btnBackFromSettings">↩️ Voltar</button>
      </div>
    </div>
  </div>
`;

// DOM Elements
const menuOverlayEl = document.querySelector('#menuOverlay');
const mainMenuCardEl = document.querySelector('#mainMenuCard');
const settingsCardEl = document.querySelector('#settingsCard');
const openMenuBtnEl = document.querySelector('#openMenuBtn');

const btnNewGameEl = document.querySelector('#btnNewGame');
const btnContinueEl = document.querySelector('#btnContinue');
const btnSettingsEl = document.querySelector('#btnSettings');
const btnResumeGameEl = document.querySelector('#btnResumeGame');
const btnBackFromSettingsEl = document.querySelector('#btnBackFromSettings');

const volumeSliderEl = document.querySelector('#volumeSlider');
const volumeValueEl = document.querySelector('#volumeValue');
const sfxSliderEl = document.querySelector('#sfxSlider');
const sfxValueEl = document.querySelector('#sfxValue');
const btnMuteToggleEl = document.querySelector('#btnMuteToggle');
const muteStatusTextEl = document.querySelector('#muteStatusText');

const cutsceneOverlayEl = document.querySelector('#cutsceneOverlay');
const btnWakeUpEl = document.querySelector('#btnWakeUp');

const dialogueSpeakerEl = document.querySelector('#dialogueSpeaker');
const dialogueTextEl = document.querySelector('#dialogueText');
const playerHealthFillEl = document.querySelector('#playerHealthFill');
const actBadgeEl = document.querySelector('#actBadge');

// Sound State & LocalStorage
const soundState = {
  masterVolume: Number(localStorage.getItem('game_volume')) || 80,
  sfxVolume: Number(localStorage.getItem('game_sfx')) || 100,
  isMuted: localStorage.getItem('game_muted') === 'true',
};

function updateSoundUI() {
  volumeSliderEl.value = soundState.masterVolume;
  volumeValueEl.textContent = `${soundState.masterVolume}%`;

  sfxSliderEl.value = soundState.sfxVolume;
  sfxValueEl.textContent = `${soundState.sfxVolume}%`;

  if (soundState.isMuted) {
    btnMuteToggleEl.classList.remove('active');
    muteStatusTextEl.textContent = '🔇 MUDO';
  } else {
    btnMuteToggleEl.classList.add('active');
    muteStatusTextEl.textContent = '🔊 COM SOM';
  }

  localStorage.setItem('game_volume', soundState.masterVolume);
  localStorage.setItem('game_sfx', soundState.sfxVolume);
  localStorage.setItem('game_muted', soundState.isMuted);
}

volumeSliderEl.addEventListener('input', (e) => {
  soundState.masterVolume = Number(e.target.value);
  updateSoundUI();
});

sfxSliderEl.addEventListener('input', (e) => {
  soundState.sfxVolume = Number(e.target.value);
  updateSoundUI();
});

btnMuteToggleEl.addEventListener('click', () => {
  soundState.isMuted = !soundState.isMuted;
  updateSoundUI();
});

updateSoundUI();

// Renderer Setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0c10);

// Camera Setup
const camera = new THREE.PerspectiveCamera(
  42,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 14.2, 8.2);
camera.lookAt(0, 0, 0.2);

const cameraAngle = { x: -Math.atan2(camera.position.z, camera.position.y) };

// Build Act 1 (Street) and Act 2 (Dungeon Room) environments
const streetEnv = createStreetEnvironment(scene);
const roomEnv = createDungeonRoom(scene);

// Hide Dungeon Room initially
roomEnv.bounds; // Prepared
let currentAct = 1; // 1 = Street, 2 = Dungeon House

// Create Player and NPC
const player = new Player(scene, -12, 1);
const npc = new Npc(scene, -15, 1);

let interactTimer = 0;
let isGameOver = false;
let isGameStarted = false;
let isKidnapped = false;

function setAct(act) {
  currentAct = act;
  if (act === 1) {
    actBadgeEl.textContent = 'ATO 1: A RUA ESCURA';
    actBadgeEl.style.background = '#ff9800';

    // Show street, hide room
    scene.children.forEach((child) => {
      if (child === roomEnv) child.visible = false;
    });

    player.group.position.set(-12, 0, 1);
    npc.group.position.set(-15, 0, 1);
    player.hp = 100;
    npc.hp = 100;
    isKidnapped = false;

    dialogueSpeakerEl.textContent = 'NARRADOR';
    dialogueTextEl.textContent =
      'Uma noite chuvosa e escura sob o viaduto... Alguém parece estar te observando nas sombras.';
  } else {
    actBadgeEl.textContent = 'ATO 2: O CALABOUÇO';
    actBadgeEl.style.background = '#e53935';

    // Move player and NPC inside dungeon room
    player.group.position.set(0, 0, 2);
    npc.group.position.set(0, 0, -2);
    player.hp = 100;
    npc.hp = 100;

    dialogueSpeakerEl.textContent = 'JOGADOR (NERD)';
    dialogueTextEl.textContent =
      'Onde estou?! Fui sequestrado e trancado nesta sala escura! Preciso achar uma saída...';
  }
  updateHUD();
}

function triggerKidnapping() {
  if (isKidnapped) return;
  isKidnapped = true;

  // Show kidnapping cutscene overlay
  cutsceneOverlayEl.classList.remove('hidden');
}

btnWakeUpEl.addEventListener('click', () => {
  cutsceneOverlayEl.classList.add('hidden');
  setAct(2);
});

// Menu System Logic
function checkSaveData() {
  const save = localStorage.getItem('dungeon_save');
  btnContinueEl.disabled = !save;
}
checkSaveData();

function saveProgress() {
  const saveData = {
    currentAct,
    playerPos: { x: player.group.position.x, z: player.group.position.z },
    playerHp: player.hp,
    npcPos: { x: npc.group.position.x, z: npc.group.position.z },
    npcHp: npc.hp,
  };
  localStorage.setItem('dungeon_save', JSON.stringify(saveData));
  checkSaveData();
}

function loadProgress() {
  const saveStr = localStorage.getItem('dungeon_save');
  if (!saveStr) return false;
  try {
    const data = JSON.parse(saveStr);
    setAct(data.currentAct || 1);
    player.group.position.set(data.playerPos.x, 0, data.playerPos.z);
    player.hp = data.playerHp;
    npc.group.position.set(data.npcPos.x, 0, data.npcPos.z);
    npc.hp = data.npcHp;
    updateHUD();
    return true;
  } catch (e) {
    return false;
  }
}

function openMenu() {
  menuOverlayEl.classList.remove('hidden');
  mainMenuCardEl.style.display = 'flex';
  settingsCardEl.style.display = 'none';

  if (isGameStarted) {
    btnResumeGameEl.style.display = 'flex';
  } else {
    btnResumeGameEl.style.display = 'none';
  }
}

function closeMenu() {
  menuOverlayEl.classList.add('hidden');
}

openMenuBtnEl.addEventListener('click', openMenu);

btnNewGameEl.addEventListener('click', () => {
  setAct(1);
  isGameOver = false;
  isGameStarted = true;
  saveProgress();
  closeMenu();
});

btnContinueEl.addEventListener('click', () => {
  if (loadProgress()) {
    isGameOver = false;
    isGameStarted = true;
    closeMenu();
  }
});

btnSettingsEl.addEventListener('click', () => {
  mainMenuCardEl.style.display = 'none';
  settingsCardEl.style.display = 'flex';
});

btnBackFromSettingsEl.addEventListener('click', () => {
  settingsCardEl.style.display = 'none';
  mainMenuCardEl.style.display = 'flex';
});

btnResumeGameEl.addEventListener('click', () => {
  closeMenu();
});

// Key Listeners
const keys = {};
window.addEventListener('keydown', (e) => {
  keys[e.code] = true;

  if (e.code === 'Escape') {
    if (menuOverlayEl.classList.contains('hidden')) {
      openMenu();
    } else {
      closeMenu();
    }
  }

  if (!menuOverlayEl.classList.contains('hidden') || !cutsceneOverlayEl.classList.contains('hidden')) return;

  if (e.code === 'KeyE') {
    handleInteraction();
  }

  if (e.code === 'KeyR') {
    restartGame();
  }
});

window.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function handleInteraction() {
  if (isGameOver) return;

  const dx = npc.group.position.x - player.group.position.x;
  const dz = npc.group.position.z - player.group.position.z;
  const dist = Math.hypot(dx, dz);

  player.isInteracting = true;
  interactTimer = 0.5;

  if (currentAct === 1) {
    if (dist < 3.2) {
      dialogueSpeakerEl.textContent = 'MULHER (MISTERIOSA)';
      dialogueTextEl.textContent =
        'O que você está fazendo sozinho nesta rua escura a esta hora...? *ela sorri de forma estranha*';
      // Trigger kidnapping when interacting close on the street
      setTimeout(triggerKidnapping, 1200);
    } else {
      dialogueSpeakerEl.textContent = 'JOGADOR (NERD)';
      dialogueTextEl.textContent =
        'A rua está deserta. Sinto que alguém está me seguindo... preciso ter cuidado!';
    }
  } else {
    if (dist < 2.8) {
      dialogueSpeakerEl.textContent = 'MULHER (SÁDICA)';
      dialogueTextEl.textContent =
        'HAHAHA! Agora você é meu convidado especial! Você nunca vai sair desta casa!';
    } else {
      dialogueSpeakerEl.textContent = 'JOGADOR (NERD)';
      dialogueTextEl.textContent =
        'A porta está trancada! Preciso encontrar uma maneira de escapar!';
    }
  }
}

function updateHUD() {
  const hpPercent = Math.max(0, (player.hp / player.maxHp) * 100);
  playerHealthFillEl.style.width = `${hpPercent}%`;

  if (hpPercent < 35) {
    playerHealthFillEl.classList.add('danger');
  } else {
    playerHealthFillEl.classList.remove('danger');
  }
}

function restartGame() {
  setAct(currentAct);
  isGameOver = false;
}

// Main Game Loop
let lastTime = performance.now();

function animate(currentTime) {
  requestAnimationFrame(animate);

  const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
  lastTime = currentTime;
  const elapsed = currentTime / 1000;

  if (interactTimer > 0) {
    interactTimer -= dt;
    if (interactTimer <= 0) {
      player.isInteracting = false;
    }
  }

  // Update Game Logic
  if (
    !isGameOver &&
    menuOverlayEl.classList.contains('hidden') &&
    cutsceneOverlayEl.classList.contains('hidden') &&
    isGameStarted
  ) {
    const activeBounds = currentAct === 1 ? streetEnv.bounds : roomEnv.bounds;

    player.update(keys, dt, activeBounds, cameraAngle);
    player.animate(elapsed);

    if (currentAct === 1) {
      // Act 1: NPC Stalking Behavior
      // NPC follows player from behind at a distance
      const targetX = player.group.position.x - 3.5;
      const targetZ = player.group.position.z;
      npc.group.position.x += (targetX - npc.group.position.x) * dt * 1.8;
      npc.group.position.z += (targetZ - npc.group.position.z) * dt * 1.8;
      npc.animate(elapsed);

      // Camera follows player smoothly along the street
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, player.group.position.x, 0.08);

      // Trigger kidnapping if player moves towards end of street
      if (player.group.position.x >= streetEnv.triggerKidnapX) {
        triggerKidnapping();
      }
    } else {
      // Act 2: Dungeon House Behavior
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0, 0.08);

      const npcResult = npc.update(
        player.group.position,
        dt,
        elapsed,
        activeBounds,
        cameraAngle
      );
      npc.animate(elapsed);

      if (npcResult.attacking && player.hp > 0) {
        player.hp -= npcResult.damage;
        updateHUD();
        dialogueSpeakerEl.textContent = 'ALERTA!';
        dialogueTextEl.textContent =
          '🩸 A garota sádica te atacou no calabouço! Cuidado!';

        if (player.hp <= 0) {
          player.hp = 0;
          isGameOver = true;
          dialogueSpeakerEl.textContent = 'GAME OVER';
          dialogueTextEl.textContent =
            '☠️ Você foi derrotado. Pressione R ou abra o menu (ESC) para tentar novamente.';
        }
      }
    }

    // Auto-save progress
    if (Math.floor(elapsed) % 5 === 0) {
      saveProgress();
    }
  }

  renderer.render(scene, camera);
}

updateHUD();
requestAnimationFrame(animate);
