import * as THREE from 'three';

import { createDungeonEnvironment } from './Dungeon.js';
import { Enemy } from './Enemy.js';
import { Npc } from './Npc.js';
import { Player } from './Player.js';
import { createStreetEnvironment } from './Street.js';
import './style.css';

const app = document.querySelector('#app');
app.innerHTML = `
  <!-- Top Right Menu Trigger -->
  <button class="btn-top-menu" id="openMenuBtn">⚙️ MENU (ESC)</button>

  <!-- Dungeon HUD (Health, Stealth Meter & Seals Inventory) -->
  <div class="dungeon-hud hidden" id="dungeonHud">
    <div class="hud-health-card">
      <div class="hud-health-header">
        <span>❤️ VIDA</span>
        <span id="healthValue">100 / 100</span>
      </div>
      <div class="hud-health-bar-bg">
        <div class="hud-health-bar-fill" id="healthBarFill"></div>
      </div>
    </div>

    <div class="hud-stealth-card">
      <span>👂 RUÍDO (SOM):</span>
      <span class="stealth-status silent" id="stealthStatus">🔇 PARADO (SILENCIOSO)</span>
    </div>

    <div class="hud-inventory-card">
      <div class="hud-inventory-title">📜 SELOS PARA ABRIR O PORTÃO</div>
      <div class="hud-items-row">
        <div class="hud-item-slot" id="slotBronzeKey">🗝️ Chave [ ]</div>
        <div class="hud-item-slot" id="slotCthulhuRune">🔮 Runa [ ]</div>
        <div class="hud-item-slot" id="slotCultistEmblem">📜 Emblema [ ]</div>
      </div>
    </div>
  </div>

  <!-- Floating Interaction Prompt Box -->
  <div class="interaction-prompt hidden" id="interactionPrompt">
    [E] Investigar
  </div>

  <!-- CUSTOM DIALOGUE BOX (MATCHING ATTACHED IMAGE) -->
  <div class="dialogue-box-container" id="dialogueContainer">
    <div class="dialogue-speaker-tab" id="dialogueSpeaker">NARRADOR</div>
    <div class="dialogue-content-box">
      <div class="dialogue-inner-frame"></div>
      <div class="dialogue-text" id="dialogueText">
        Uma noite sob o viaduto... Algo parece estar te observando nas sombras dos prédios e árvores.
      </div>
      <div class="dialogue-spiral-icon">🌀</div>
    </div>
  </div>

  <!-- CINEMATIC EYE-OPENING WAKE UP OVERLAY (PISCAR DE OLHOS) -->
  <div class="eye-wake-overlay hidden" id="eyeWakeOverlay">
    <div class="eyelid eyelid-top" id="eyelidTop"></div>
    <div class="eyelid eyelid-bottom" id="eyelidBottom"></div>
    <div class="wake-blur-layer" id="wakeBlurLayer"></div>
  </div>

  <!-- PUZZLE 1: Terminal de Alavancas em Código Binário -->
  <div class="puzzle-modal-overlay hidden" id="binaryModal">
    <div class="puzzle-card">
      <div class="puzzle-title">⚙️ TERMINAL DE ALAVANCAS BINÁRIAS</div>
      <p class="puzzle-desc">
        Configure as 4 alavancas no código binário equivalente ao número sagrado dos Antigos.<br>
        <em>Dica: Pressione nas alavancas para alternar entre 0 e 1.</em>
      </p>

      <div class="binary-switches-grid">
        <div class="binary-switch-col">
          <button class="binary-switch-btn" id="btnBin0">0</button>
          <span class="binary-switch-label">(8) Chave A</span>
        </div>
        <div class="binary-switch-col">
          <button class="binary-switch-btn" id="btnBin1">0</button>
          <span class="binary-switch-label">(4) Chave B</span>
        </div>
        <div class="binary-switch-col">
          <button class="binary-switch-btn" id="btnBin2">0</button>
          <span class="binary-switch-label">(2) Chave C</span>
        </div>
        <div class="binary-switch-col">
          <button class="binary-switch-btn" id="btnBin3">0</button>
          <span class="binary-switch-label">(1) Chave D</span>
        </div>
      </div>

      <div style="color: #ffa726; font-size: 15px; font-weight: bold;" id="binaryValueDisplay">
        Valor Decimal Atual: 0
      </div>

      <div class="puzzle-actions">
        <button class="puzzle-btn primary" id="btnSubmitBinary">⚡ Ativar Mecanismo</button>
        <button class="puzzle-btn secondary" id="btnCloseBinary">Fechar</button>
      </div>
    </div>
  </div>

  <!-- PUZZLE 2: Painel de Cores & Símbolos Rúnicos -->
  <div class="puzzle-modal-overlay hidden" id="colorModal">
    <div class="puzzle-card">
      <div class="puzzle-title">🔮 CRISTAIS RÚNICOS ELEMENTAIS</div>
      <p class="puzzle-desc">
        Toque nos 4 cristais elementais na ordem correta da criação de Cthulhu.<br>
        <small id="colorSequenceDisplay">Sequência: [ Nenhuma ]</small>
      </p>

      <div class="color-crystals-grid">
        <button class="color-crystal-btn red" id="btnColorRed">🌋 Chama Primordial</button>
        <button class="color-crystal-btn blue" id="btnColorBlue">🌊 Maré do Abismo</button>
        <button class="color-crystal-btn yellow" id="btnColorYellow">☀️ Luz da Aurora</button>
        <button class="color-crystal-btn green" id="btnColorGreen">🌿 Raiz da Floresta</button>
      </div>

      <div class="puzzle-actions">
        <button class="puzzle-btn secondary" id="btnResetColorSeq">🔄 Limpar Sequência</button>
        <button class="puzzle-btn secondary" id="btnCloseColorModal">Fechar</button>
      </div>
    </div>
  </div>

  <!-- PUZZLE 3: Cofre Numérico de 3 Dígitos -->
  <div class="puzzle-modal-overlay hidden" id="safeModal">
    <div class="puzzle-card">
      <div class="puzzle-title">🔒 COFRE DE COMBINAÇÃO NUMÉRICA</div>
      <p class="puzzle-desc">
        Gire os 3 seletores numéricos para encontrar o segredo inscrito nos monumentos sagrados.
      </p>

      <div class="safe-dials-row">
        <div class="safe-dial-col">
          <button class="safe-dial-btn" id="btnDialUp0">▲</button>
          <div class="safe-dial-display" id="dialVal0">0</div>
          <button class="safe-dial-btn" id="btnDialDown0">▼</button>
        </div>
        <div class="safe-dial-col">
          <button class="safe-dial-btn" id="btnDialUp1">▲</button>
          <div class="safe-dial-display" id="dialVal1">0</div>
          <button class="safe-dial-btn" id="btnDialDown1">▼</button>
        </div>
        <div class="safe-dial-col">
          <button class="safe-dial-btn" id="btnDialUp2">▲</button>
          <div class="safe-dial-display" id="dialVal2">0</div>
          <button class="safe-dial-btn" id="btnDialDown2">▼</button>
        </div>
      </div>

      <div class="puzzle-actions">
        <button class="puzzle-btn primary" id="btnUnlockSafe">🔓 Abrir Cofre</button>
        <button class="puzzle-btn secondary" id="btnCloseSafe">Fechar</button>
      </div>
    </div>
  </div>

  <!-- Controls & How To Play Overlay -->
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
            <span class="key-desc">W, A, S, D ou Setas para andar</span>
          </div>
        </div>

        <div class="control-key-card">
          <div class="keys-display">
            <span class="key-cap single">SHIFT</span>
          </div>
          <div class="key-info">
            <span class="key-title">Passos Silenciosos (Furtividade)</span>
            <span class="key-desc">Segure SHIFT para andar em silêncio! Os monstros são cegos e só te ouvem caso faça barulho!</span>
          </div>
        </div>

        <div class="control-key-card">
          <div class="keys-display">
            <span class="key-cap single">E</span>
          </div>
          <div class="key-info">
            <span class="key-title">Interagir / Investigar</span>
            <span class="key-desc">Aproxime-se de objetos, alavancas, cofres ou monumentos e pressione E</span>
          </div>
        </div>
      </div>

      <div class="controls-story-box">
        ⚠️ <strong>Atenção:</strong> Cuidado com os buracos profundos e armadilhas de espinhos!
      </div>

      <button class="btn-start-game" id="btnStartGame">
        <span>▶️ INICIAR JORNADA</span>
        <small>(Ou pressione ESPAÇO para começar)</small>
      </button>
    </div>
  </div>

  <!-- Knockout Screen Overlay (Tela de Nocaute / Blackout) -->
  <div class="knockout-overlay hidden" id="knockoutOverlay">
    <div class="knockout-title">💥 VOCÊ FOI NOCAUTEADO!</div>
    <div class="knockout-text" id="knockoutText">
      Sua visão escurece enquanto o golpe fatal te derruba desacordado no chão do calabouço...<br><br>
      O cultista te arrasta de volta para a cela de sacrifício.
    </div>
    <button class="knockout-btn" id="btnWakeUpCell">👁️ Despertar na Cela (Tentar Novamente)</button>
  </div>

  <!-- Victory Screen Overlay -->
  <div class="victory-overlay hidden" id="victoryOverlay">
    <div class="victory-title">🏆 FUGA CONCLUÍDA!</div>
    <div class="victory-text" id="victoryText">
      PARABÉNS! Você quebrou os selos arcanos, enganou os monstros de sangue e escapou com vida das profundezas do calabouço de Cthulhu!
    </div>
    <div class="victory-buttons">
      <button class="victory-btn primary" id="btnPlayAgain">🔄 Jogar Novamente</button>
      <button class="victory-btn" id="btnVictoryMenu">🏠 Menu Principal</button>
    </div>
  </div>

  <!-- Main Menu / Pause Menu / Settings Overlay -->
  <div class="menu-overlay" id="menuOverlay">
    <div class="menu-card" id="mainMenuCard">
      <div class="menu-title" id="menuTitle">CALABOUÇO</div>
      <div class="menu-subtitle" id="menuSubtitle">MENU PRINCIPAL</div>
      
      <div class="menu-buttons">
        <button class="menu-btn primary" id="btnNewGame">⚔️ Novo Jogo</button>
        <button class="menu-btn" id="btnContinue">💾 Continuar</button>
        <button class="menu-btn primary" id="btnResumeGame" style="display: none;">▶️ Voltar ao Jogo</button>
        <button class="menu-btn" id="btnRestartAct" style="display: none;">🔄 Reiniciar Ato</button>
        <button class="menu-btn" id="btnSaveGame" style="display: none;">💾 Salvar Jogo</button>
        <button class="menu-btn" id="btnSettings">⚙️ Configurações</button>
        <button class="menu-btn danger" id="btnReturnToMainMenu" style="display: none;">🏠 Menu Principal</button>
      </div>
    </div>

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

// Sound State & LocalStorage
const soundState = {
  masterVolume: Number(localStorage.getItem('game_volume')) || 80,
  sfxVolume: Number(localStorage.getItem('game_sfx')) || 100,
  isMuted: localStorage.getItem('game_muted') === 'true',
};

const AudioContextClass = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx && AudioContextClass) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playSound(type) {
  if (soundState.isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const masterVol = (soundState.masterVolume / 100) * (soundState.sfxVolume / 100);
  const now = ctx.currentTime;

  if (type === 'hit') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.2);
    gain.gain.setValueAtTime(0.4 * masterVol, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  } else if (type === 'fall') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.7);
    gain.gain.setValueAtTime(0.5 * masterVol, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.7);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.7);
  } else if (type === 'wakeup') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(65, now);
    osc.frequency.exponentialRampToValueAtTime(130, now + 0.4);
    gain.gain.setValueAtTime(0.45 * masterVol, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.6);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.6);
  } else if (type === 'dialogue_blip') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320 + Math.random() * 40, now);
    gain.gain.setValueAtTime(0.06 * masterVol, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.03);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.03);
  } else if (type === 'vanish') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.8);
    gain.gain.setValueAtTime(0.35 * masterVol, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.8);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.8);
  } else if (type === 'switch') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.setValueAtTime(800, now + 0.05);
    gain.gain.setValueAtTime(0.2 * masterVol, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  } else if (type === 'crystal') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.25);
    gain.gain.setValueAtTime(0.35 * masterVol, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  } else if (type === 'pickup') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(660, now + 0.08);
    osc.frequency.setValueAtTime(880, now + 0.16);
    gain.gain.setValueAtTime(0.35 * masterVol, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  } else if (type === 'gate_unlock') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.linearRampToValueAtTime(180, now + 0.6);
    gain.gain.setValueAtTime(0.4 * masterVol, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.6);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.6);
  } else if (type === 'victory') {
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.14);
      gain.gain.setValueAtTime(0.35 * masterVol, now + i * 0.14);
      gain.gain.linearRampToValueAtTime(0, now + i * 0.14 + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.14);
      osc.stop(now + i * 0.14 + 0.45);
    });
  }
}

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

const eyeWakeOverlayEl = document.querySelector('#eyeWakeOverlay');
const eyelidTopEl = document.querySelector('#eyelidTop');
const eyelidBottomEl = document.querySelector('#eyelidBottom');
const wakeBlurLayerEl = document.querySelector('#wakeBlurLayer');

const knockoutOverlayEl = document.querySelector('#knockoutOverlay');
const btnWakeUpCellEl = document.querySelector('#btnWakeUpCell');

const victoryOverlayEl = document.querySelector('#victoryOverlay');
const btnPlayAgainEl = document.querySelector('#btnPlayAgain');
const btnVictoryMenuEl = document.querySelector('#btnVictoryMenu');

const dialogueContainerEl = document.querySelector('#dialogueContainer');
const dialogueSpeakerEl = document.querySelector('#dialogueSpeaker');
const dialogueTextEl = document.querySelector('#dialogueText');

const dungeonHudEl = document.querySelector('#dungeonHud');
const healthValueEl = document.querySelector('#healthValue');
const healthBarFillEl = document.querySelector('#healthBarFill');
const stealthStatusEl = document.querySelector('#stealthStatus');

const slotBronzeKeyEl = document.querySelector('#slotBronzeKey');
const slotCthulhuRuneEl = document.querySelector('#slotCthulhuRune');
const slotCultistEmblemEl = document.querySelector('#slotCultistEmblem');

const interactionPromptEl = document.querySelector('#interactionPrompt');

// Puzzle Modals DOM
const binaryModalEl = document.querySelector('#binaryModal');
const btnSubmitBinaryEl = document.querySelector('#btnSubmitBinary');
const btnCloseBinaryEl = document.querySelector('#btnCloseBinary');
const binaryValueDisplayEl = document.querySelector('#binaryValueDisplay');

const colorModalEl = document.querySelector('#colorModal');
const colorSequenceDisplayEl = document.querySelector('#colorSequenceDisplay');
const btnResetColorSeqEl = document.querySelector('#btnResetColorSeq');
const btnCloseColorModalEl = document.querySelector('#btnCloseColorModal');

const safeModalEl = document.querySelector('#safeModal');
const btnUnlockSafeEl = document.querySelector('#btnUnlockSafe');
const btnCloseSafeEl = document.querySelector('#btnCloseSafe');

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

// Renderer Setup with Context Loss Prevention & Recovery
let renderer;
try {
  renderer = new THREE.WebGLRenderer({
    antialias: false,
    powerPreference: 'high-performance',
    failIfMajorPerformanceCaveat: false,
  });
} catch (e) {
  console.warn('Falha ao criar WebGLRenderer, usando fallback:', e);
  renderer = new THREE.WebGLRenderer({ antialias: false });
}

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = false;
app.appendChild(renderer.domElement);

// Context Loss Prevention: Inform browser we handle context loss to prevent domain blocking!
renderer.domElement.addEventListener(
  'webglcontextlost',
  (event) => {
    event.preventDefault();
    console.warn('⚠️ WebGL context perdido! Prevenindo bloqueio do navegador...');
  },
  false
);

renderer.domElement.addEventListener(
  'webglcontextrestored',
  () => {
    console.log('✅ WebGL context restaurado com sucesso!');
  },
  false
);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0c10);

const hemiLight = new THREE.HemisphereLight(0xdbe7ff, 0x18202d, 0.4);
scene.add(hemiLight);

const camera = new THREE.PerspectiveCamera(
  44,
  window.innerWidth / window.innerHeight,
  0.1,
  140
);
camera.position.set(0, 15.0, 9.0);
camera.lookAt(0, 0, 0.2);

const cameraAngle = { x: -Math.atan2(camera.position.z, camera.position.y) };

// Build Environments
const streetEnv = createStreetEnvironment(scene);
const dungeonEnv = createDungeonEnvironment(scene);

streetEnv.group.visible = true;
dungeonEnv.group.visible = false;

let currentAct = 1;

// Create Player and NPC
const player = new Player(scene, streetEnv.startPlayerX, 0.0);
const initialSpot = streetEnv.hidingSpots[0];
const npc = new Npc(scene, initialSpot.x, initialSpot.z);

let dungeonEnemies = [];

function spawnDungeonEnemies() {
  if (dungeonEnemies.length === 0) {
    dungeonEnv.enemySpawnPoints.forEach((sp) => {
      const enemy = new Enemy(scene, {
        x: sp.x,
        z: sp.z,
        name: sp.name,
        patrolRadius: sp.patrolRadius,
      });
      dungeonEnemies.push(enemy);
    });
  } else {
    dungeonEnemies.forEach((e) => e.reset());
  }
}

// Quest & Inventory State
const questState = {
  hasBronzeKey: false,
  hasCthulhuRune: false,
  hasCultistEmblem: false,
  gateOpen: false,
  activePedestals: 0,
  binaryBits: [0, 0, 0, 0],
  colorSequence: [],
  safeDials: [0, 0, 0],
};

function updateHUD() {
  if (currentAct === 2) {
    dungeonHudEl.classList.remove('hidden');
    healthValueEl.textContent = `${Math.round(player.hp)} / ${player.maxHp}`;
    const pct = Math.max(0, (player.hp / player.maxHp) * 100);
    healthBarFillEl.style.width = `${pct}%`;

    if (player.isSneaking && player.moving) {
      stealthStatusEl.className = 'stealth-status silent';
      stealthStatusEl.textContent = '🔇 FURTIVO (SILENCIOSO)';
    } else if (player.moving) {
      stealthStatusEl.className = 'stealth-status walking';
      stealthStatusEl.textContent = '🚶 PASSOS NORMAIS (AUDÍVEL)';
    } else {
      stealthStatusEl.className = 'stealth-status silent';
      stealthStatusEl.textContent = '🔇 PARADO (SILENCIOSO)';
    }

    if (questState.hasBronzeKey) {
      slotBronzeKeyEl.classList.add('acquired');
      slotBronzeKeyEl.textContent = '🗝️ Chave [✓]';
    } else {
      slotBronzeKeyEl.classList.remove('acquired');
      slotBronzeKeyEl.textContent = '🗝️ Chave [ ]';
    }

    if (questState.hasCthulhuRune) {
      slotCthulhuRuneEl.classList.add('acquired');
      slotCthulhuRuneEl.textContent = '🔮 Runa [✓]';
    } else {
      slotCthulhuRuneEl.classList.remove('acquired');
      slotCthulhuRuneEl.textContent = '🔮 Runa [ ]';
    }

    if (questState.hasCultistEmblem) {
      slotCultistEmblemEl.classList.add('acquired');
      slotCultistEmblemEl.textContent = '📜 Emblema [✓]';
    } else {
      slotCultistEmblemEl.classList.remove('acquired');
      slotCultistEmblemEl.textContent = '📜 Emblema [ ]';
    }
  } else {
    dungeonHudEl.classList.add('hidden');
  }
}

let interactTimer = 0;
let isGameOver = false;
let isGameStarted = false;
let isKidnapped = false;
let isKnockedOut = false;
let isVictory = false;
let isWakingUp = false;
let lastNarrativeZone = -1;
let currentPromptObject = null;
let typewriterTimeout = null;

// Typewriter Dialogue Effect
function typeWriterDialogue(speaker, fullText, onComplete) {
  if (typewriterTimeout) {
    clearTimeout(typewriterTimeout);
    typewriterTimeout = null;
  }

  dialogueSpeakerEl.textContent = speaker;
  dialogueTextEl.textContent = '';
  dialogueContainerEl.classList.remove('hidden');

  let idx = 0;
  const speed = 25;

  function typeNextChar() {
    if (idx < fullText.length) {
      dialogueTextEl.textContent += fullText[idx];
      idx++;
      if (idx % 4 === 0 && fullText[idx - 1] !== ' ') {
        playSound('dialogue_blip');
      }
      typewriterTimeout = setTimeout(typeNextChar, speed);
    } else {
      typewriterTimeout = null;
      if (onComplete) onComplete();
    }
  }
  typeNextChar();
}

function setAct(act) {
  currentAct = act;
  isGameOver = false;
  isKnockedOut = false;
  isVictory = false;
  knockoutOverlayEl.classList.add('hidden');
  victoryOverlayEl.classList.add('hidden');
  binaryModalEl.classList.add('hidden');
  colorModalEl.classList.add('hidden');
  safeModalEl.classList.add('hidden');

  if (act === 1) {
    streetEnv.group.visible = true;
    dungeonEnv.group.visible = false;
    hemiLight.intensity = 0.35;

    player.reset(streetEnv.startPlayerX, 0.0);
    const startSpot = streetEnv.hidingSpots[0];
    npc.group.position.set(startSpot.x, 0, startSpot.z);
    npc.currentSpot = startSpot;
    npc.lastSpotId = startSpot.id;
    npc.material.opacity = 1.0;
    npc.isTeleporting = false;
    npc.isVanishing = false;
    npc.hasVanished = false;

    isKidnapped = false;
    lastNarrativeZone = -1;

    camera.position.set(streetEnv.startPlayerX, 15.0, 9.0);

    typeWriterDialogue(
      'NARRADOR',
      'Uma noite escura e fria... As lâmpadas dos postes iluminam a calçada, mas vultos se movem nas sombras.'
    );

    dungeonEnemies.forEach((e) => e.destroy());
    dungeonEnemies = [];
  } else {
    streetEnv.group.visible = false;
    dungeonEnv.group.visible = true;
    hemiLight.intensity = 0.9;

    player.reset(dungeonEnv.spawnPos.x, dungeonEnv.spawnPos.z);
    npc.resetDungeon(dungeonEnv.altarPos.x, dungeonEnv.altarPos.z);

    camera.position.set(dungeonEnv.spawnPos.x, 15.0, 9.0);
    spawnDungeonEnemies();
  }
  updateHUD();
}

// Cinematic Eye-Opening Wake Up Sequence
function performEyeWakeUpTransition() {
  isWakingUp = true;
  eyeWakeOverlayEl.classList.remove('hidden');

  eyelidTopEl.style.height = '50%';
  eyelidBottomEl.style.height = '50%';
  wakeBlurLayerEl.style.opacity = '1';

  setAct(2);
  playSound('wakeup');

  setTimeout(() => {
    eyelidTopEl.style.height = '28%';
    eyelidBottomEl.style.height = '28%';
    wakeBlurLayerEl.style.opacity = '0.7';

    setTimeout(() => {
      eyelidTopEl.style.height = '48%';
      eyelidBottomEl.style.height = '48%';

      setTimeout(() => {
        eyelidTopEl.style.height = '0%';
        eyelidBottomEl.style.height = '0%';
        wakeBlurLayerEl.style.opacity = '0';

        setTimeout(() => {
          eyeWakeOverlayEl.classList.add('hidden');
          isWakingUp = false;

          // Deliver villain speech gradually, then make him vanish!
          triggerVillainWakeUpSpeech();
        }, 600);
      }, 350);
    }, 450);
  }, 350);
}

function triggerKidnapping() {
  if (isKidnapped) return;
  isKidnapped = true;
  playSound('hit');
  performEyeWakeUpTransition();
}

// Exactly the speech requested by the user, with typewriter effect + Cultist vanishing!
function triggerVillainWakeUpSpeech() {
  const speech =
    'olá olá, meu caro sacrifício eu sou ... e eu te sequestrei para poder fazer o meu ritual e reviver o meu mestre Cthulhu o impronunciável a e caso você esteja se perguntando aonde você esta você esta no meu calabouço';

  typeWriterDialogue('CULTISTA (SEQUESTRADOR)', speech, () => {
    // After speaking his dialogue, cultist announces his ritual and vanishes into shadows!
    setTimeout(() => {
      npc.startVanish();
      playSound('vanish');

      setTimeout(() => {
        typeWriterDialogue(
          'NARRADOR',
          'O cultista desapareceu nas sombras em direção às profundezas do calabouço... Ache os 3 selos e escape!',
          () => {
            setTimeout(() => {
              dialogueContainerEl.classList.add('hidden');
            }, 3500);
          }
        );
      }, 1000);
    }, 2800);
  });
}

function triggerKnockout(reason = 'Você perdeu a consciência...') {
  if (isKnockedOut) return;
  isKnockedOut = true;
  player.isFalling = false;
  player.fallTimer = 0;
  playSound('hit');

  knockoutOverlayEl.classList.remove('hidden');
  document.querySelector('#knockoutText').innerHTML = `
    ${reason}<br><br>
    Sua visão se apaga na mais profunda escuridão... O cultista te arrasta de volta à cela de sacrifício.
  `;
}

btnWakeUpCellEl.addEventListener('click', () => {
  knockoutOverlayEl.classList.add('hidden');
  isKnockedOut = false;
  resetPuzzles(false);
  performEyeWakeUpTransition();
});

function triggerVictory() {
  if (isVictory) return;
  isVictory = true;
  playSound('victory');
  victoryOverlayEl.classList.remove('hidden');
}

btnPlayAgainEl.addEventListener('click', () => {
  questState.hasBronzeKey = false;
  questState.hasCthulhuRune = false;
  questState.hasCultistEmblem = false;
  questState.gateOpen = false;
  questState.activePedestals = 0;
  resetPuzzles(true);
  setAct(1);
  closeMenu();
});

btnVictoryMenuEl.addEventListener('click', () => {
  victoryOverlayEl.classList.add('hidden');
  isGameStarted = false;
  resetPuzzles(true);
  setAct(1);
  openMenu();
});

// Menu System Logic
function checkSaveData() {
  const save = localStorage.getItem('dungeon_save');
  btnContinueEl.disabled = !save;
}
checkSaveData();

function saveProgress() {
  if (player.isFalling || isKnockedOut || player.hp <= 0) return;
  const saveData = {
    currentAct,
    playerPos: { x: player.group.position.x, z: player.group.position.z },
    playerHp: player.hp,
    questState,
  };
  localStorage.setItem('dungeon_save', JSON.stringify(saveData));
  checkSaveData();
}

function loadProgress() {
  const saveStr = localStorage.getItem('dungeon_save');
  if (!saveStr) return false;
  try {
    const data = JSON.parse(saveStr);
    if (data.questState) {
      Object.assign(questState, data.questState);
    }
    // Sync 3D binary levers with loaded or restored state
    if (dungeonEnv && dungeonEnv.binaryLevers && questState.binaryBits) {
      dungeonEnv.binaryLevers.forEach((bl, i) => {
        bl.state = questState.binaryBits[i] || 0;
        const color = bl.state === 1 ? 0x00e676 : 0xff1744;
        if (bl.bulbMat) bl.bulbMat.color.setHex(color);
        if (bl.light && bl.light.color) bl.light.color.setHex(color);
      });
    }
    updateBinaryModalUI();
    updateColorSequenceUI();
    updateSafeDialsUI();

    setAct(data.currentAct || 1);
    player.group.position.set(data.playerPos.x, 0, data.playerPos.z);
    player.hp = data.playerHp;
    return true;
  } catch (e) {
    return false;
  }
}

function updateMenuMode() {
  if (isGameStarted) {
    menuTitleEl.textContent = 'JOGO PAUSADO';
    menuSubtitleEl.textContent = 'MENU DE PAUSA';

    btnNewGameEl.style.display = 'none';
    btnContinueEl.style.display = 'none';

    btnResumeGameEl.style.display = 'flex';
    btnRestartActEl.style.display = 'flex';
    btnSaveGameEl.style.display = 'flex';
    btnReturnToMainMenuEl.style.display = 'flex';
  } else {
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
  controlsOverlayEl.classList.remove('hidden');
});

function startGameFromControls() {
  controlsOverlayEl.classList.add('hidden');
  questState.hasBronzeKey = false;
  questState.hasCthulhuRune = false;
  questState.hasCultistEmblem = false;
  questState.gateOpen = false;
  questState.activePedestals = 0;
  resetPuzzles(true);
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

btnResumeGameEl.addEventListener('click', closeMenu);

btnRestartActEl.addEventListener('click', () => {
  if (currentAct === 2) {
    questState.hasBronzeKey = false;
    questState.hasCthulhuRune = false;
    questState.hasCultistEmblem = false;
    questState.gateOpen = false;
    questState.activePedestals = 0;
    resetPuzzles(true);
  }
  setAct(currentAct);
  isGameOver = false;
  closeMenu();
  typeWriterDialogue('SISTEMA', 'Ato reiniciado!');
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
  resetPuzzles(true);
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

  if (
    !controlsOverlayEl.classList.contains('hidden') &&
    (e.code === 'Space' || e.code === 'Enter')
  ) {
    e.preventDefault();
    startGameFromControls();
    return;
  }

  if (e.code === 'Escape') {
    if (!binaryModalEl.classList.contains('hidden')) {
      binaryModalEl.classList.add('hidden');
      return;
    }
    if (!colorModalEl.classList.contains('hidden')) {
      colorModalEl.classList.add('hidden');
      return;
    }
    if (!safeModalEl.classList.contains('hidden')) {
      safeModalEl.classList.add('hidden');
      return;
    }

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
    !knockoutOverlayEl.classList.contains('hidden') ||
    !victoryOverlayEl.classList.contains('hidden') ||
    !controlsOverlayEl.classList.contains('hidden') ||
    !binaryModalEl.classList.contains('hidden') ||
    !colorModalEl.classList.contains('hidden') ||
    !safeModalEl.classList.contains('hidden') ||
    isWakingUp
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

// PUZZLE 1: BINARY LEVERS
function updateBinaryModalUI() {
  const bits = questState.binaryBits;
  [0, 1, 2, 3].forEach((i) => {
    const btn = document.querySelector(`#btnBin${i}`);
    if (!btn) return;
    btn.textContent = bits[i];
    if (bits[i] === 1) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const decimalVal = bits[0] * 8 + bits[1] * 4 + bits[2] * 2 + bits[3] * 1;
  if (binaryValueDisplayEl) {
    binaryValueDisplayEl.textContent = `Código: [ ${bits.join(' ')} ] = Valor Decimal: ${decimalVal}`;
  }
}

function resetBinaryPuzzle() {
  questState.binaryBits = [0, 0, 0, 0];
  if (dungeonEnv && dungeonEnv.binaryLevers) {
    dungeonEnv.binaryLevers.forEach((bl) => {
      bl.state = 0;
      if (bl.bulbMat) bl.bulbMat.color.setHex(0xff1744);
      if (bl.light && bl.light.color) bl.light.color.setHex(0xff1744);
    });
  }
  updateBinaryModalUI();
}

function resetPuzzles(resetAll = true) {
  if (resetAll || !questState.hasBronzeKey) {
    resetBinaryPuzzle();
  }

  if (resetAll || !questState.hasCthulhuRune) {
    questState.colorSequence = [];
    updateColorSequenceUI();
  }

  if (resetAll || !questState.hasCultistEmblem) {
    questState.safeDials = [0, 0, 0];
    updateSafeDialsUI();
  }

  if (resetAll) {
    if (dungeonEnv && dungeonEnv.pedestals) {
      dungeonEnv.pedestals.forEach((ped) => {
        ped.active = false;
        if (ped.light) ped.light.intensity = 0;
      });
    }
    const gateObj =
      dungeonEnv &&
      dungeonEnv.interactiveObjects &&
      dungeonEnv.interactiveObjects.find((o) => o.id === 'escape_gate');
    if (gateObj && gateObj.isOpen) {
      gateObj.isOpen = false;
      gateObj.mesh.position.y = 1.8;
      if (dungeonEnv.obstacles && !dungeonEnv.obstacles.includes(gateObj.obstacle)) {
        dungeonEnv.obstacles.push(gateObj.obstacle);
      }
    }
  }
}

[0, 1, 2, 3].forEach((i) => {
  document.querySelector(`#btnBin${i}`).addEventListener('click', () => {
    questState.binaryBits[i] = questState.binaryBits[i] === 0 ? 1 : 0;
    playSound('switch');
    updateBinaryModalUI();

    const lever3D = dungeonEnv.binaryLevers[i];
    if (lever3D) {
      lever3D.state = questState.binaryBits[i];
      const color = lever3D.state === 1 ? 0x00e676 : 0xff1744;
      lever3D.bulbMat.color.setHex(color);
      lever3D.light.color.setHex(color);
    }
  });
});

btnSubmitBinaryEl.addEventListener('click', () => {
  const b = questState.binaryBits;
  if (b[0] === 1 && b[1] === 0 && b[2] === 1 && b[3] === 1) {
    questState.hasBronzeKey = true;
    playSound('victory');
    binaryModalEl.classList.add('hidden');
    typeWriterDialogue(
      'ENIGMA BINÁRIO RESOLVIDO!',
      '✨ O terminal emite um estrondo mecânico e revela a [CHAVE DE BRONZE]!'
    );
    updateHUD();
  } else {
    playSound('hit');
    typeWriterDialogue(
      'CÓDIGO INCORRETO',
      '❌ O mecanismo permaneceu travado. Leia a inscrição na parede para descobrir o número correto!'
    );
  }
});

btnCloseBinaryEl.addEventListener('click', () => {
  binaryModalEl.classList.add('hidden');
});

// PUZZLE 2: COLOR CRYSTALS
function updateColorSequenceUI() {
  const names = {
    red: '🌋 Chama',
    blue: '🌊 Abismo',
    yellow: '☀️ Aurora',
    green: '🌿 Raiz',
  };
  if (questState.colorSequence.length === 0) {
    colorSequenceDisplayEl.textContent = 'Sequência: [ Nenhuma ]';
  } else {
    colorSequenceDisplayEl.textContent = `Sequência: ${questState.colorSequence.map((c) => names[c]).join(' ➔ ')}`;
  }
}

function handleColorTouch(colorKey) {
  playSound('crystal');
  questState.colorSequence.push(colorKey);
  updateColorSequenceUI();

  if (questState.colorSequence.length === 4) {
    const seq = questState.colorSequence;
    if (seq[0] === 'red' && seq[1] === 'blue' && seq[2] === 'yellow' && seq[3] === 'green') {
      questState.hasCthulhuRune = true;
      playSound('victory');
      colorModalEl.classList.add('hidden');
      typeWriterDialogue(
        'ENIGMA DAS CORES RESOLVIDO!',
        '🔮 Os 4 cristais elementais ressoam em harmonia! A [RUNA DE CTHULHU] brilha diante de você!'
      );
      updateHUD();
    } else {
      playSound('hit');
      typeWriterDialogue(
        'SEQUÊNCIA INCORRETA',
        '❌ A ordem das cores estava em desarmonia. O cântico ancestral foi reiniciado!'
      );
      questState.colorSequence = [];
      updateColorSequenceUI();
    }
  }
}

document.querySelector('#btnColorRed').addEventListener('click', () => handleColorTouch('red'));
document.querySelector('#btnColorBlue').addEventListener('click', () => handleColorTouch('blue'));
document.querySelector('#btnColorYellow').addEventListener('click', () => handleColorTouch('yellow'));
document.querySelector('#btnColorGreen').addEventListener('click', () => handleColorTouch('green'));

btnResetColorSeqEl.addEventListener('click', () => {
  questState.colorSequence = [];
  updateColorSequenceUI();
});

btnCloseColorModalEl.addEventListener('click', () => {
  colorModalEl.classList.add('hidden');
});

// PUZZLE 3: NUMERIC SAFE
function updateSafeDialsUI() {
  [0, 1, 2].forEach((i) => {
    document.querySelector(`#dialVal${i}`).textContent = questState.safeDials[i];
  });
}

[0, 1, 2].forEach((i) => {
  document.querySelector(`#btnDialUp${i}`).addEventListener('click', () => {
    questState.safeDials[i] = (questState.safeDials[i] + 1) % 10;
    playSound('switch');
    updateSafeDialsUI();
  });

  document.querySelector(`#btnDialDown${i}`).addEventListener('click', () => {
    questState.safeDials[i] = (questState.safeDials[i] + 9) % 10;
    playSound('switch');
    updateSafeDialsUI();
  });
});

btnUnlockSafeEl.addEventListener('click', () => {
  const d = questState.safeDials;
  if (d[0] === 7 && d[1] === 3 && d[2] === 9) {
    questState.hasCultistEmblem = true;
    playSound('victory');
    safeModalEl.classList.add('hidden');
    typeWriterDialogue(
      'COFRE DESBLOQUEADO!',
      '🔓 O cofre de ferro pesado se abre! Dentro dele reluz o [EMBLEMA DO CULTO]!'
    );
    updateHUD();
  } else {
    playSound('hit');
    typeWriterDialogue(
      'COMBINAÇÃO INCORRETA',
      '❌ A tranca do cofre não cedeu. Examine os 3 Monumentos da masmorra para descobrir os 3 dígitos!'
    );
  }
});

btnCloseSafeEl.addEventListener('click', () => {
  safeModalEl.classList.add('hidden');
});

// INTERACTION HANDLER [E]
function handleInteraction() {
  if (isGameOver || isKnockedOut || isVictory || isWakingUp) return;

  player.isInteracting = true;
  interactTimer = 0.5;

  if (currentAct === 1) {
    const dx = npc.group.position.x - player.group.position.x;
    const dz = npc.group.position.z - player.group.position.z;
    const dist = Math.hypot(dx, dz);

    if (dist < 4.2) {
      typeWriterDialogue(
        'SEQUESTRADOR (MISTERIOSO)',
        'O que você está fazendo sozinho nesta rua escura a esta hora...? *ele sorri friamente nas sombras*',
        () => {
          setTimeout(triggerKidnapping, 1000);
        }
      );
    } else {
      typeWriterDialogue(
        'JOGADOR',
        'A rua está deserta e silenciosa... Sinto que alguém está me observando de trás das moitas.'
      );
    }
    return;
  }

  // Act 2: Check nearby interactive object
  if (!currentPromptObject) {
    if (!npc.hasVanished) {
      const cdx = npc.group.position.x - player.group.position.x;
      const cdz = npc.group.position.z - player.group.position.z;
      const cdist = Math.hypot(cdx, cdz);

      if (cdist < 4.0) {
        triggerVillainWakeUpSpeech();
        return;
      }
    }

    typeWriterDialogue(
      'JOGADOR',
      'Preciso resolver os enigmas (Alavancas Binárias, Cristais e Cofre) para abrir o Grande Portão!'
    );
    return;
  }

  const obj = currentPromptObject;

  if (obj.type === 'binary_lever') {
    updateBinaryModalUI();
    binaryModalEl.classList.remove('hidden');
  } else if (obj.type === 'lore_clue') {
    playSound('pickup');
    typeWriterDialogue(obj.clueSpeaker || 'INSCRIÇÃO', obj.clueText);
  } else if (obj.type === 'color_crystal') {
    updateColorSequenceUI();
    colorModalEl.classList.remove('hidden');
  } else if (obj.type === 'numeric_safe') {
    updateSafeDialsUI();
    safeModalEl.classList.remove('hidden');
  } else if (obj.type === 'coffin') {
    const sd = obj.data;
    if (!obj.searched) {
      obj.searched = true;
      if (sd.hasPotion) {
        player.hp = Math.min(player.maxHp, player.hp + 40);
        playSound('pickup');
        typeWriterDialogue(
          'CATACUMBAS',
          '🧪 Você encontrou uma Poção de Sangue Curativa dentro do sarcófago (+40 HP)!'
        );
      } else {
        typeWriterDialogue('CATACUMBAS', '💀 Este sarcófago contém apenas ossos e relíquias quebradas.');
      }
    } else {
      typeWriterDialogue('CATACUMBAS', 'Este sarcófago já foi vasculhado.');
    }
  } else if (obj.type === 'pot') {
    if (!obj.searched) {
      obj.searched = true;
      playSound('hit');
      player.hp = Math.min(player.maxHp, player.hp + 20);
      player.noiseLevel = 3;

      typeWriterDialogue(
        'ÂNFORA QUEBRADA',
        '🏺 A cerâmica se quebrou com estrondo (+20 HP)! CUIDADO: Os monstros ouviram o barulho!'
      );
    } else {
      typeWriterDialogue('ÂNFORA', 'Apenas cacos de cerâmica quebrada no chão.');
    }
  } else if (obj.type === 'pedestal') {
    const ped = obj.data;
    if (!ped.active) {
      if (
        (ped.requiredItem === 'bronze_key' && questState.hasBronzeKey) ||
        (ped.requiredItem === 'cthulhu_rune' && questState.hasCthulhuRune) ||
        (ped.requiredItem === 'cultist_emblem' && questState.hasCultistEmblem)
      ) {
        ped.active = true;
        ped.light.intensity = 2.5;
        questState.activePedestals++;
        playSound('pickup');

        typeWriterDialogue(
          'ALTAR DE CTHULHU',
          `🔮 Você inseriu o selo de [${ped.name}] no pedestal! Uma luz brilhante emana! (${questState.activePedestals}/3 pedestais ativos)`
        );

        if (questState.activePedestals === 3) {
          openEscapeGate();
        }
      } else {
        typeWriterDialogue(
          'PEDESTAL SAGRADO',
          `🔒 Este pedestal requer o item [${ped.name}] para ser ativado.`
        );
      }
    } else {
      typeWriterDialogue(
        'PEDESTAL SAGRADO',
        `✨ O pedestal de [${ped.name}] já está ativado e ressoando poder arcano!`
      );
    }
  } else if (obj.type === 'gate') {
    if (
      questState.activePedestals >= 3 &&
      questState.hasBronzeKey &&
      questState.hasCthulhuRune &&
      questState.hasCultistEmblem
    ) {
      openEscapeGate();
    } else {
      typeWriterDialogue(
        'GRANDE PORTÃO DE FERRO',
        `🔒 O portão está trancado por 3 selos arcanos. Você precisa resolver todos os 3 enigmas (Alavancas Binárias, Cristais Elementais e Baú Numérico) e ativar os 3 pedestais no Altar de Cthulhu (${questState.activePedestals}/3)!`
      );
    }
  }

  updateHUD();
}

function openEscapeGate() {
  const gateObj = dungeonEnv.interactiveObjects.find((o) => o.id === 'escape_gate');
  if (gateObj && !gateObj.isOpen) {
    gateObj.isOpen = true;
    questState.gateOpen = true;
    gateObj.mesh.position.y = 8.0;
    const idx = dungeonEnv.obstacles.indexOf(gateObj.obstacle);
    if (idx !== -1) dungeonEnv.obstacles.splice(idx, 1);

    playSound('gate_unlock');
    typeWriterDialogue(
      'PORTÃO DESBLOQUEADO!',
      '🚪 Com os 3 selos ativados, o Grande Portão de Ferro se abre com um estrondo! A escadaria de fuga está livre!'
    );
  }
}

function restartGame() {
  if (currentAct === 2) {
    questState.hasBronzeKey = false;
    questState.hasCthulhuRune = false;
    questState.hasCultistEmblem = false;
    questState.gateOpen = false;
    questState.activePedestals = 0;
    resetPuzzles(true);
  }
  setAct(currentAct);
}

// Open Main Menu on initial load
openMenu();

// Main Game Loop
let lastTime = performance.now();
let lastSavedSecond = -1;

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
    !isKnockedOut &&
    !isVictory &&
    !isWakingUp &&
    menuOverlayEl.classList.contains('hidden') &&
    knockoutOverlayEl.classList.contains('hidden') &&
    victoryOverlayEl.classList.contains('hidden') &&
    controlsOverlayEl.classList.contains('hidden') &&
    binaryModalEl.classList.contains('hidden') &&
    colorModalEl.classList.contains('hidden') &&
    safeModalEl.classList.contains('hidden') &&
    isGameStarted
  ) {
    if (currentAct === 1) {
      player.update(keys, dt, streetEnv.bounds, cameraAngle, null);
      player.animate(elapsed);

      npc.updateStalker(
        player.group.position,
        dt,
        elapsed,
        streetEnv.hidingSpots,
        cameraAngle
      );
      npc.animate(elapsed);

      const targetCamX = THREE.MathUtils.clamp(
        player.group.position.x,
        streetEnv.bounds.minX + 6,
        streetEnv.bounds.maxX - 6
      );
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, 0.08);

      const px = player.group.position.x;
      let zone = 0;
      if (px < -20) zone = 1;
      else if (px < 0) zone = 2;
      else if (px < 20) zone = 3;
      else zone = 4;

      if (zone !== lastNarrativeZone && interactTimer <= 0) {
        lastNarrativeZone = zone;
        if (zone === 1) {
          typeWriterDialogue(
            'NARRADOR',
            'Uma névoa fria desce sobre a rua... Você ouve galhos quebrando entre as árvores.'
          );
        } else if (zone === 2) {
          typeWriterDialogue(
            'NARRADOR',
            'Os postes piscam... Um vulto misterioso se moveu rapidamente atrás da moita do beco.'
          );
        } else if (zone === 3) {
          typeWriterDialogue(
            'NARRADOR',
            'As sombras dos pilares se estendem... Alguém está te espiando fixamente.'
          );
        } else if (zone === 4) {
          typeWriterDialogue(
            'NARRADOR',
            'A rua está quase no fim, mas o silêncio se tornou ensurdecedor... CUIDADO!'
          );
        }
      }

      if (player.group.position.x >= streetEnv.triggerKidnapX) {
        triggerKidnapping();
      }
    } else {
      // Act 2: Dungeon
      const playerUpdateRes = player.update(
        keys,
        dt,
        dungeonEnv.bounds,
        cameraAngle,
        dungeonEnv.obstacles
      );
      player.animate(elapsed);

      if (playerUpdateRes && playerUpdateRes.finishedFall) {
        player.isFalling = false;
        triggerKnockout('Você caiu no abismo sem fundo de um buraco da masmorra!');
      }

      const targetCamX = THREE.MathUtils.clamp(
        player.group.position.x,
        dungeonEnv.bounds.minX + 6,
        dungeonEnv.bounds.maxX - 6
      );
      const targetCamZ = THREE.MathUtils.clamp(
        player.group.position.z + 8.5,
        dungeonEnv.bounds.minZ + 8,
        dungeonEnv.bounds.maxZ + 8
      );
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, 0.08);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, 0.08);

      // Update Stalker (handles fade out vanish)
      npc.updateDungeonAltar(
        player.group.position,
        dt,
        elapsed,
        cameraAngle
      );
      npc.animate(elapsed);

      // Animated Lights (Torches & Candles flicker)
      dungeonEnv.animatedLights.forEach((al, i) => {
        const flicker = Math.sin(elapsed * 12 + i * 1.7) * 0.25 + Math.cos(elapsed * 8 + i * 2.3) * 0.15;
        al.light.intensity = al.baseIntensity + flicker;
      });

      // Update Traps
      dungeonEnv.traps.forEach((trap) => {
        if (trap.type === 'spike') {
          const cycle = (elapsed * 0.8 + trap.phase) % 1.0;
          let frameIdx = 0;
          if (cycle > 0.45 && cycle < 0.85) {
            frameIdx = Math.min(4, Math.floor(((cycle - 0.45) / 0.4) * 5));
            trap.isActive = frameIdx >= 2;
          } else {
            trap.isActive = false;
            frameIdx = 0;
          }

          if (trap.spikeFrames && trap.spikeFrames[frameIdx]) {
            trap.mat.map = trap.spikeFrames[frameIdx];
          }

          const distToSpike = Math.hypot(
            player.group.position.x - trap.x,
            player.group.position.z - trap.z
          );
          if (trap.isActive && distToSpike < trap.radius && !player.isFalling) {
            player.hp -= trap.damage * dt;
            player.noiseLevel = 3;
            playSound('hit');
            updateHUD();

            if (player.hp <= 0) {
              player.hp = 0;
              triggerKnockout('Você pisou em uma armadilha fatal de espinhos e caiu desacordado!');
            }
          }
        } else if (trap.type === 'hole') {
          const distToHole = Math.hypot(
            player.group.position.x - trap.x,
            player.group.position.z - trap.z
          );
          if (distToHole < trap.radius && !player.isFalling && !isKnockedOut) {
            player.triggerHoleFall();
            playSound('fall');
          }
        }
      });

      // Update Blind Blood Monsters
      dungeonEnemies.forEach((enemy) => {
        const res = enemy.updateBlindMonster(
          player.group.position,
          player.noiseLevel,
          player.isSneaking,
          dt,
          elapsed,
          dungeonEnv.obstacles,
          cameraAngle
        );

        if (res.attacked && !player.isFalling) {
          player.hp -= res.damage;
          player.noiseLevel = 3;
          playSound('hit');
          typeWriterDialogue(
            'ALERTA!',
            `🩸 O ${enemy.name} ouviu seus passos e te atacou! Use SHIFT para andar em silêncio!`
          );
          updateHUD();

          if (player.hp <= 0) {
            player.hp = 0;
            triggerKnockout(`O ${enemy.name} te atingiu com um golpe fulminante e você desmaiou!`);
          }
        }
      });

      // Check Victory Reach (Impede 100% o acesso à vitória sem ter resolvido todos os puzzles)
      if (
        player.group.position.x >= 44.0 &&
        Math.abs(player.group.position.z) < 3.0 &&
        !isVictory &&
        !player.isFalling
      ) {
        if (
          questState.activePedestals >= 3 &&
          questState.hasBronzeKey &&
          questState.hasCthulhuRune &&
          questState.hasCultistEmblem &&
          questState.gateOpen
        ) {
          triggerVictory();
        } else {
          player.group.position.x = 35.0;
          typeWriterDialogue(
            'SAÍDA BLOQUEADA',
            '🔒 Uma barreira intransponível bloqueia a saída! Você precisa resolver todos os 3 enigmas e abrir o portão de ferro para escapar!'
          );
        }
      }

      // Check Nearby Interactive Objects for Floating Prompt
      let closestObj = null;
      let closestDist = Infinity;

      for (const obj of dungeonEnv.interactiveObjects) {
        const dist = Math.hypot(
          player.group.position.x - obj.x,
          player.group.position.z - obj.z
        );
        if (dist < obj.radius && dist < closestDist) {
          closestDist = dist;
          closestObj = obj;
        }
      }

      if (!npc.hasVanished) {
        const cdist = Math.hypot(
          player.group.position.x - npc.group.position.x,
          player.group.position.z - npc.group.position.z
        );
        if (cdist < 3.2 && cdist < closestDist) {
          closestObj = {
            type: 'cultist',
            prompt: '[E] Falar com o Cultista de Cthulhu',
          };
        }
      }

      currentPromptObject = closestObj;
      if (closestObj) {
        interactionPromptEl.textContent = closestObj.prompt;
        interactionPromptEl.classList.remove('hidden');
      } else {
        interactionPromptEl.classList.add('hidden');
      }

      updateHUD();
    }

    const currentSec = Math.floor(elapsed);
    if (currentSec % 5 === 0 && currentSec !== lastSavedSecond) {
      lastSavedSecond = currentSec;
      saveProgress();
    }
  }

  renderer.render(scene, camera);
}

requestAnimationFrame(animate);
