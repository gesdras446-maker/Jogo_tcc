import * as THREE from 'three';

import { Npc } from './Npc.js';
import { Player } from './Player.js';
import { createDungeonRoom } from './Room.js';
import { createStreetEnvironment } from './Street.js';
import './style.css';

const app = document.querySelector('#app');
app.innerHTML = `
  <!-- Top Right Menu Trigger -->
  <button class="btn-top-menu" id="openMenuBtn">⚙️ MENU (ESC)</button>

  <!-- Narrative Dialogue Box -->
  <div class="dialogue-box" id="dialogueBox">
    <div class="dialogue-speaker" id="dialogueSpeaker">NARRADOR</div>
    <div class="dialogue-text" id="dialogueText">Uma noite sob o viaduto... Algo parece estar te observando nas sombras dos prédios e árvores.</div>
  </div>

  <!-- Controls & How To Play Overlay (ONLY shown when clicking 'Novo Jogo') -->
  <div class="controls-overlay hidden" id="controlsOverlay">
    <div class="controls-card">
      <div class="controls-header">
        <div class="controls-badge">GUIA & COMANDOS</div>
        <h2 class="controls-title">COMO JOGAR</h2>
        <p class="controls-subtitle">Você caminha sozinho na calada da noite sob o viaduto... Fique atento aos seus arredores.</p>
      </div>

      <div class="controls-grid">
        <div class="control-key-card">
          <div class="keys-display">
            <span class="key-cap">W</span>
            <div class="keys-row">
              <span class="key-cap">A</span>
              <span class="key-cap">S</span>
              <span class="key-cap">D</span>
            </div>
          </div>
          <div class="key-info">
            <span class="key-title">Movimentação</span>
            <span class="key-desc">W, A, S, D ou Teclas de Seta para andar</span>
          </div>
        </div>

        <div class="control-key-card">
          <div class="keys-display">
            <span class="key-cap single">E</span>
          </div>
          <div class="key-info">
            <span class="key-title">Interagir / Investigar</span>
            <span class="key-desc">Aproxime-se e pressione E para interagir</span>
          </div>
        </div>

        <div class="control-key-card">
          <div class="keys-display">
            <span class="key-cap single">ESC</span>
          </div>
          <div class="key-info">
            <span class="key-title">Menu & Pausa</span>
            <span class="key-desc">Acesse opções de som, salvar ou reiniciar</span>
          </div>
        </div>
      </div>

      <div class="controls-story-box">
        ⚠️ <strong>Atenção:</strong> Um vulto misterioso foi avistado espreitando atrás das moitas, árvores e cantos de prédios...
      </div>

      <button class="btn-start-game" id="btnStartGame">
        <span>▶️ INICIAR JORNADA</span>
        <small>(Ou pressione ESPAÇO para começar)</small>
      </button>
    </div>
  </div>

  <!-- Kidnapping Cutscene Overlay -->
  <div class="cutscene-overlay hidden" id="cutsceneOverlay">
    <div class="cutscene-title">⚠️ VOCÊ FOI SEQUESTRADO!</div>
    <div class="cutscene-text" id="cutsceneText">
      Enquanto você caminhava pela rua deserta, a figura misteriosa avançou silenciosamente pelas sombras por trás de você...<br><br>
      Você sente um golpe súbito e tudo fica escuro! Ao abrir os olhos, percebe que foi trancado no calabouço pelo sequestrador...
    </div>
    <button class="cutscene-btn" id="btnWakeUp">👁️ Acordar no Calabouço</button>
  </div>

  <!-- Main Menu / Pause Menu / Settings Overlay -->
  <div class="menu-overlay" id="menuOverlay">
    <div class="menu-card" id="mainMenuCard">
      <div class="menu-title" id="menuTitle">CALABOUÇO</div>
      <div class="menu-subtitle" id="menuSubtitle">MENU PRINCIPAL</div>
      
      <div class="menu-buttons">
        <!-- Main Menu Mode Buttons -->
        <button class="menu-btn primary" id="btnNewGame">⚔️ Novo Jogo</button>
        <button class="menu-btn" id="btnContinue">💾 Continuar</button>

        <!-- Pause Mode Buttons -->
        <button class="menu-btn primary" id="btnResumeGame" style="display: none;">▶️ Voltar ao Jogo</button>
        <button class="menu-btn" id="btnRestartAct" style="display: none;">🔄 Reiniciar Ato</button>
        <button class="menu-btn" id="btnSaveGame" style="display: none;">💾 Salvar Jogo</button>

        <!-- Shared Buttons -->
        <button class="menu-btn" id="btnSettings">⚙️ Configurações</button>
        <button class="menu-btn danger" id="btnReturnToMainMenu" style="display: none;">🏠 Menu Principal</button>
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

const menuTitleEl = document.querySelector('#menuTitle');
const menuSubtitleEl = document.querySelector('#menuSubtitle');

const controlsOverlayEl = document.querySelector('#controlsOverlay');
const btnStartGameEl = document.querySelector('#btnStartGame');

const btnNewGameEl = document.querySelector('#btnNewGame');
const btnContinueEl = document.querySelector('#btnContinue');
const btnResumeGameEl = document.querySelector('#btnResumeGame');
const btnRestartActEl = document.querySelector('#btnRestartAct');
const btnSaveGameEl = document.querySelector('#btnSaveGame');
const btnSettingsEl = document.querySelector('#btnSettings');
const btnReturnToMainMenuEl = document.querySelector('#btnReturnToMainMenu');
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
scene.background = new THREE.Color(0x0e1118);

// Global scene light
const hemiLight = new THREE.HemisphereLight(0xdbe7ff, 0x18202d, 0.35);
scene.add(hemiLight);

// Camera Setup
const camera = new THREE.PerspectiveCamera(
  42,
  window.innerWidth / window.innerHeight,
  0.1,
  120
);
camera.position.set(0, 14.5, 8.5);
camera.lookAt(0, 0, 0.2);

const cameraAngle = { x: -Math.atan2(camera.position.z, camera.position.y) };

// Build Environments
const streetEnv = createStreetEnvironment(scene);
const roomEnv = createDungeonRoom(scene);

// Ensure proper initial visibility
streetEnv.group.visible = true;
roomEnv.group.visible = false;

let currentAct = 1; // 1 = Street, 2 = Dungeon House

// Create Player and NPC
const player = new Player(scene, streetEnv.startPlayerX, 0.0);
const initialSpot = streetEnv.hidingSpots[0];
const npc = new Npc(scene, initialSpot.x, initialSpot.z);

let interactTimer = 0;
let isGameOver = false;
let isGameStarted = false;
let isKidnapped = false;
let lastNarrativeZone = -1;

function setAct(act) {
  currentAct = act;
  if (act === 1) {
    streetEnv.group.visible = true;
    roomEnv.group.visible = false;
    hemiLight.intensity = 0.35;

    player.group.position.set(streetEnv.startPlayerX, 0, 0.0);
    const startSpot = streetEnv.hidingSpots[0];
    npc.group.position.set(startSpot.x, 0, startSpot.z);
    npc.currentSpot = startSpot;
    npc.lastSpotId = startSpot.id;
    npc.material.opacity = 1.0;
    npc.isTeleporting = false;

    player.hp = 100;
    npc.hp = 100;
    isKidnapped = false;
    lastNarrativeZone = -1;

    camera.position.x = streetEnv.startPlayerX;

    dialogueSpeakerEl.textContent = 'NARRADOR';
    dialogueTextEl.textContent =
      'Uma noite escura e fria... As lâmpadas dos postes iluminam a calçada, mas vultos se movem nas sombras.';
  } else {
    streetEnv.group.visible = false;
    roomEnv.group.visible = true;
    hemiLight.intensity = 1.0;

    player.group.position.set(0, 0, 2);
    npc.group.position.set(0, 0, -2);
    npc.material.opacity = 1.0;
    npc.isTeleporting = false;
    player.hp = 100;
    npc.hp = 100;

    camera.position.x = 0;

    dialogueSpeakerEl.textContent = 'JOGADOR';
    dialogueTextEl.textContent =
      'Onde estou?! Fui sequestrado e trancado nesta sala escura! Preciso achar uma saída...';
  }
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
    return true;
  } catch (e) {
    return false;
  }
}

function updateMenuMode() {
  if (isGameStarted) {
    // PAUSE MENU MODE
    menuTitleEl.textContent = 'JOGO PAUSADO';
    menuSubtitleEl.textContent = 'MENU DE PAUSA';

    btnNewGameEl.style.display = 'none';
    btnContinueEl.style.display = 'none';

    btnResumeGameEl.style.display = 'flex';
    btnRestartActEl.style.display = 'flex';
    btnSaveGameEl.style.display = 'flex';
    btnReturnToMainMenuEl.style.display = 'flex';
  } else {
    // MAIN TITLE MENU MODE
    menuTitleEl.textContent = 'CALABOUÇO';
    menuSubtitleEl.textContent = 'MENU PRINCIPAL';

    btnNewGameEl.style.display = 'flex';
    btnContinueEl.style.display = 'flex';

    btnResumeGameEl.style.display = 'none';
    btnRestartActEl.style.display = 'none';
    btnSaveGameEl.style.display = 'none';
    btnReturnToMainMenuEl.style.display = 'none';

    checkSaveData();
  }
}

function openMenu() {
  updateMenuMode();
  menuOverlayEl.classList.remove('hidden');
  mainMenuCardEl.style.display = 'flex';
  settingsCardEl.style.display = 'none';
}

function closeMenu() {
  menuOverlayEl.classList.add('hidden');
}

openMenuBtnEl.addEventListener('click', openMenu);

btnNewGameEl.addEventListener('click', () => {
  closeMenu();
  // ONLY show Controls / How to Play overlay when starting a brand new game
  controlsOverlayEl.classList.remove('hidden');
});

function startGameFromControls() {
  controlsOverlayEl.classList.add('hidden');
  setAct(1);
  isGameOver = false;
  isGameStarted = true;
  saveProgress();
}

btnStartGameEl.addEventListener('click', startGameFromControls);

btnContinueEl.addEventListener('click', () => {
  if (loadProgress()) {
    isGameOver = false;
    isGameStarted = true;
    closeMenu();
    controlsOverlayEl.classList.add('hidden');
  }
});

btnResumeGameEl.addEventListener('click', () => {
  closeMenu();
});

btnRestartActEl.addEventListener('click', () => {
  setAct(currentAct);
  isGameOver = false;
  closeMenu();
  dialogueSpeakerEl.textContent = 'SISTEMA';
  dialogueTextEl.textContent = 'Ato reiniciado!';
});

btnSaveGameEl.addEventListener('click', () => {
  saveProgress();
  btnSaveGameEl.textContent = '✅ Jogo Salvo!';
  setTimeout(() => {
    btnSaveGameEl.textContent = '💾 Salvar Jogo';
  }, 1200);
});

btnReturnToMainMenuEl.addEventListener('click', () => {
  isGameStarted = false;
  isGameOver = false;
  controlsOverlayEl.classList.add('hidden');
  setAct(1);
  openMenu();
});

btnSettingsEl.addEventListener('click', () => {
  mainMenuCardEl.style.display = 'none';
  settingsCardEl.style.display = 'flex';
});

btnBackFromSettingsEl.addEventListener('click', () => {
  settingsCardEl.style.display = 'none';
  mainMenuCardEl.style.display = 'flex';
});

// Key Listeners
const keys = {};
window.addEventListener('keydown', (e) => {
  keys[e.code] = true;

  // Space / Enter on Controls Modal starts the game
  if (
    !controlsOverlayEl.classList.contains('hidden') &&
    (e.code === 'Space' || e.code === 'Enter')
  ) {
    e.preventDefault();
    startGameFromControls();
    return;
  }

  if (e.code === 'Escape') {
    if (controlsOverlayEl.classList.contains('hidden')) {
      if (menuOverlayEl.classList.contains('hidden')) {
        openMenu();
      } else {
        closeMenu();
      }
    }
  }

  if (
    !menuOverlayEl.classList.contains('hidden') ||
    !cutsceneOverlayEl.classList.contains('hidden') ||
    !controlsOverlayEl.classList.contains('hidden')
  ) {
    return;
  }

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
    if (dist < 4.0) {
      dialogueSpeakerEl.textContent = 'SEQUESTRADOR (MISTERIOSO)';
      dialogueTextEl.textContent =
        'O que você está fazendo sozinho nesta rua escura a esta hora...? *ele sorri friamente nas sombras*';
      setTimeout(triggerKidnapping, 1400);
    } else {
      dialogueSpeakerEl.textContent = 'JOGADOR';
      dialogueTextEl.textContent =
        'A rua está deserta e silenciosa... Sinto que alguém está me observando de trás das moitas.';
    }
  } else {
    if (dist < 2.8) {
      dialogueSpeakerEl.textContent = 'VILÃO (SEQUESTRADOR)';
      dialogueTextEl.textContent =
        'HAHAHA! Agora você é meu convidado especial! Você nunca vai sair deste calabouço!';
    } else {
      dialogueSpeakerEl.textContent = 'JOGADOR';
      dialogueTextEl.textContent =
        'A porta está trancada! Preciso encontrar uma maneira de escapar do calabouço!';
    }
  }
}

function restartGame() {
  setAct(currentAct);
  isGameOver = false;
}

// Open Main Menu on initial load
openMenu();

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
    controlsOverlayEl.classList.contains('hidden') &&
    isGameStarted
  ) {
    const activeBounds = currentAct === 1 ? streetEnv.bounds : roomEnv.bounds;

    player.update(keys, dt, activeBounds, cameraAngle);
    player.animate(elapsed);

    if (currentAct === 1) {
      // Act 1: Stalker AI Hiding behind buildings, bushes and trees
      npc.updateStalker(
        player.group.position,
        dt,
        elapsed,
        streetEnv.hidingSpots,
        cameraAngle
      );
      npc.animate(elapsed);

      // Camera smoothly follows player along the extended avenue
      const targetCamX = THREE.MathUtils.clamp(
        player.group.position.x,
        streetEnv.bounds.minX + 6,
        streetEnv.bounds.maxX - 6
      );
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, 0.08);

      // Dynamic narrative suspense updates along the street walk
      const px = player.group.position.x;
      let zone = 0;
      if (px < -20) zone = 1;
      else if (px < 0) zone = 2;
      else if (px < 20) zone = 3;
      else zone = 4;

      if (zone !== lastNarrativeZone && interactTimer <= 0) {
        lastNarrativeZone = zone;
        dialogueSpeakerEl.textContent = 'NARRADOR';
        if (zone === 1) {
          dialogueTextEl.textContent =
            'Uma névoa fria desce sobre a rua... Você ouve galhos quebrando entre as árvores.';
        } else if (zone === 2) {
          dialogueTextEl.textContent =
            'Os postes piscam... Um vulto misterioso se moveu rapidamente atrás da moita do beco.';
        } else if (zone === 3) {
          dialogueTextEl.textContent =
            'As sombras dos pilares do viaduto se estendem... Alguém está te espiando fixamente.';
        } else if (zone === 4) {
          dialogueTextEl.textContent =
            'A rua está quase no fim, mas o silêncio se tornou ensurdecedor... CUIDADO!';
        }
      }

      // Trigger kidnapping sequence if player reaches ambush point
      if (player.group.position.x >= streetEnv.triggerKidnapX) {
        triggerKidnapping();
      }
    } else {
      // Act 2: Dungeon House Behavior
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0, 0.08);

      const npcResult = npc.updateDungeon(
        player.group.position,
        dt,
        elapsed,
        activeBounds,
        cameraAngle
      );
      npc.animate(elapsed);

      if (npcResult.attacking && player.hp > 0) {
        player.hp -= npcResult.damage;
        dialogueSpeakerEl.textContent = 'ALERTA!';
        dialogueTextEl.textContent =
          '🩸 O vilão te atacou no calabouço! Corra!';

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

requestAnimationFrame(animate);
