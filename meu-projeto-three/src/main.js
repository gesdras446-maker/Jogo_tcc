import * as THREE from 'three';

import { createDungeonEnvironment } from './Dungeon.js';
import { Enemy } from './Enemy.js';
import { Npc } from './Npc.js';
import { Player } from './Player.js';
import { createStreetEnvironment } from './Street.js';
import { createAct3Environment } from './Act3.js';
import './style.css';

const app = document.querySelector('#app');
app.innerHTML = `
  <!-- Top Right Actions Bar -->
  <div class="top-actions-bar">
    <button class="btn-top-endings" id="topEndingsBtn">🏆 FINAIS (<span class="endings-counter-val">0/4</span>)</button>
    <button class="btn-top-menu" id="openMenuBtn">⚙️ MENU (ESC)</button>
  </div>

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

  <!-- ATO 3 PUZZLE 1: Quebra-Cabeça da Relíquia dos Antigos (Estilo Ruínas de Alph) -->
  <div class="relic-puzzle-modal-overlay hidden" id="relicPuzzleModal">
    <div class="relic-puzzle-card">
      <div class="relic-header">
        <div class="relic-title">🏛️ QUEBRA-CABEÇA DA RELÍQUIA DOS ANTIGOS</div>
        <div class="relic-subtitle">Reorganize as 16 peças de pedra para reconstituir o fóssil sagrado de Cthulhu</div>
      </div>

      <div class="relic-game-wrapper">
        <!-- Corner target preview (Idêntico ao Kabuto nas Ruínas de Alph da imagem de referência!) -->
        <div class="relic-preview-corner">
          <span>ALVO 🎯</span>
          <canvas class="relic-preview-canvas" id="relicPreviewCanvas" width="72" height="72"></canvas>
        </div>

        <!-- 4x4 Grid Board -->
        <div class="relic-grid-board" id="relicGridBoard">
          <!-- 16 slots gerados dinamicamente com borda vermelha de seleção -->
        </div>
      </div>

      <div style="color: #ffd54f; font-size: 13.5px; font-weight: bold;" id="relicStatusText">
        Deslize as peças para o espaço vazio para montar a imagem!
      </div>

      <div class="relic-actions">
        <button class="puzzle-btn primary" id="btnSolveRelic">⚡ Encaixar Selo</button>
        <button class="puzzle-btn secondary" id="btnCloseRelicModal">Fechar</button>
      </div>
    </div>
  </div>

  <!-- ATO 3 PUZZLE 2: Terminal de Disparo Rápido (Quick Time Event - QTE) -->
  <div class="target-modal-overlay hidden" id="targetShootingModal">
    <div class="target-modal-card">
      <div class="target-header">
        <div class="target-title">⚡ BALISTA RÚNICA: QUICK TIME EVENT</div>
        <div class="target-clue-box" id="qteInstructionBox">
          🎯 <strong>Mecanismo de Disparo Rápido:</strong> Mire nos 4 Pilares! Pressione a tecla rúnica indicada antes que o tempo esgote para calibrar cada disparo!
        </div>
      </div>

      <div class="target-progress-bar-row">
        <span>Sequência de Impacto:</span>
        <div class="target-dots" id="targetDots">
          <div class="target-dot" id="tdot0"></div>
          <div class="target-dot" id="tdot1"></div>
          <div class="target-dot" id="tdot2"></div>
          <div class="target-dot" id="tdot3"></div>
        </div>
        <span id="targetProgressText">(0 / 4)</span>
      </div>

      <div class="qte-arena">
        <div class="qte-target-info" id="qteTargetInfo">
          <span class="qte-target-icon" id="qteTargetIcon">🔥</span>
          <span class="qte-target-name" id="qteTargetName">1º ALVO: PILAR DO FOGO</span>
        </div>

        <div class="qte-timer-track">
          <div class="qte-timer-fill" id="qteTimerFill"></div>
        </div>

        <div class="qte-key-container">
          <div class="qte-key-pulse-ring" id="qtePulseRing"></div>
          <button class="qte-big-key-btn" id="qteKeyBtn" type="button">
            <span class="qte-key-letter" id="qteKeyLetter">Q</span>
            <span class="qte-key-subtext">TECLE OU CLIQUE!</span>
          </button>
        </div>

        <div class="target-chasm-lava"></div>
      </div>

      <div style="color: #ffe0b2; font-size: 14px; font-weight: bold; min-height: 22px; text-align: center;" id="targetFeedbackText">
        Mire a balista e inicie o teste de reflexos rápidos para os 4 disparos!
      </div>

      <div class="target-actions">
        <button class="puzzle-btn primary" id="btnStartQte">🏹 Iniciar Disparos (QTE)</button>
        <button class="puzzle-btn secondary" id="btnResetTargets" style="display: none;">🔄 Tentar Novamente</button>
        <button class="puzzle-btn secondary" id="btnCloseTargetModal">Fechar</button>
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
            <span class="key-cap single">CTRL</span>
          </div>
          <div class="key-info">
            <span class="key-title">Correr (Disparada Rápida)</span>
            <span class="key-desc">Segure CTRL para correr velozmente! Cuidado: o som alto dos passos alertará os monstros!</span>
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

  <!-- Victory Screen Overlay (Customizável por final alcançado) -->
  <div class="victory-overlay hidden" id="victoryOverlay">
    <div class="victory-modal-card">
      <div class="victory-badge" id="victoryBadge">🏆 CONQUISTA DE FINAL DESBLOQUEADA!</div>
      <div class="victory-icon-large" id="victoryIconLarge">🚪</div>
      <div class="victory-title" id="victoryTitle">🏆 FINAL #1: ALÉM DA PORTA ANCESTRAL</div>
      <div class="victory-quote" id="victoryQuote">"A luz do mundo exterior penetra seus olhos uma vez mais..."</div>
      <div class="victory-text" id="victoryText">
        PARABÉNS! Você quebrou os selos arcanos e escapou com vida das profundezas cósmicas!
      </div>
      <div class="victory-buttons">
        <button class="victory-btn primary" id="btnPlayAgain">🔄 Jogar Novamente</button>
        <button class="victory-btn" id="btnVictoryViewEndings">🏆 Coleção de Finais (<span class="endings-counter-val">0/4</span>)</button>
        <button class="victory-btn" id="btnVictoryMenu">🏠 Menu Principal</button>
      </div>
    </div>
  </div>

  <!-- SECRET ENDING OVERLAY (#3 - EU SINTO QUE TEM ALGUMA COISA DE ERRADO COM AQUELE LADO) -->
  <div class="secret-ending-overlay hidden" id="secretEndingOverlay">
    <div class="secret-ending-card">
      <div class="secret-ending-badge">🏆 CONQUISTA DE FINAL DESBLOQUEADA!</div>
      <h2 class="secret-ending-title">
        FINAL #3
        <span>"Eu sinto que tem alguma coisa de errado com aquele lado"</span>
      </h2>
      
      <div class="secret-ending-image-wrapper">
        <img class="secret-ending-image" src="/ending_pixel_art.jpg" alt="Final #3: Eu sinto que tem alguma coisa de errado com aquele lado" />
      </div>

      <div class="secret-ending-quote">
        "Um arrepio gélido percorreu minha espinha ao encarar aquela escuridão... Decidi dar meia-volta. Há caminhos que nunca devem ser trilhados."
      </div>

      <p class="secret-ending-text">
        Seus instintos salvaram a sua vida! Ao invés de avançar para a armadilha do cultista nas sombras do galpão, você deu meia-volta na rua e retornou em segurança para a grande avenida iluminada. Você nunca saberá que rituais sombrios eram preparados para você... mas esta noite, você sobreviveu ileso.
      </p>

      <div class="secret-ending-actions">
        <button class="secret-ending-btn primary" id="btnSecretPlayAgain">🔄 Jogar Novamente</button>
        <button class="secret-ending-btn secondary" id="btnSecretViewEndings">🏆 Ver Coleção de Finais (<span class="endings-counter-val">0/4</span>)</button>
        <button class="secret-ending-btn secondary" id="btnSecretMainMenu">🏠 Menu Principal</button>
      </div>
    </div>
  </div>

  <!-- ENDINGS & ACHIEVEMENTS GALLERY MODAL (COLEÇÃO N/4) -->
  <div class="endings-modal-overlay hidden" id="endingsModal">
    <div class="endings-modal-card">
      <div class="endings-modal-header">
        <div class="endings-modal-title">🏆 GALERIA DE FINAIS & CONQUISTAS</div>
        <div class="endings-progress-wrapper">
          <div class="endings-progress-text">
            <span>Progresso Total:</span>
            <span id="endingsProgressText">0 de 4 Descobertos (0%)</span>
          </div>
          <div class="endings-progress-bg">
            <div class="endings-progress-fill" id="endingsProgressFill"></div>
          </div>
        </div>
      </div>

      <div class="endings-grid" id="endingsGrid">
        <!-- Rendered dynamically -->
      </div>

      <div class="endings-modal-footer">
        <button class="puzzle-btn secondary" id="btnCloseEndingsModal">Fechar</button>
      </div>
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
        <button class="menu-btn" id="btnOpenEndingsMenu">🏆 Finais & Conquistas (<span class="endings-counter-val">0/4</span>)</button>
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
const btnVictoryViewEndingsEl = document.querySelector('#btnVictoryViewEndings');

// Endings & Secret Ending DOM
const topEndingsBtnEl = document.querySelector('#topEndingsBtn');
const secretEndingOverlayEl = document.querySelector('#secretEndingOverlay');
const btnSecretPlayAgainEl = document.querySelector('#btnSecretPlayAgain');
const btnSecretViewEndingsEl = document.querySelector('#btnSecretViewEndings');
const btnSecretMainMenuEl = document.querySelector('#btnSecretMainMenu');
const btnOpenEndingsMenuEl = document.querySelector('#btnOpenEndingsMenu');
const endingsModalEl = document.querySelector('#endingsModal');
const btnCloseEndingsModalEl = document.querySelector('#btnCloseEndingsModal');

// ========================================================
// 4 ENDINGS ACHIEVEMENT & TRACKING SYSTEM (N/4)
// ========================================================
const TOTAL_ENDINGS = 4;
const ENDINGS_DATA = [
  {
    id: 1,
    number: '#1',
    title: 'Além da Porta Ancestral',
    desc: 'Ao cruzar o abismo de chamas, você abriu a pesada porta dos ancestrais e escapou com vida e sanidade preservadas para a luz da superfície.',
    icon: '🚪',
    image: null,
  },
  {
    id: 2,
    number: '#2',
    title: 'As Sombras do Bueiro',
    desc: 'Você optou por descer no bueiro fétido, rastejando pela imundície dos esgotos esquecidos até emergir em um beco sombrio da cidade.',
    icon: '🕳️',
    image: null,
  },
  {
    id: 3,
    number: '#3',
    title: 'Eu sinto que tem alguma coisa de errado com aquele lado',
    desc: 'Seus instintos salvaram a sua vida. Ao pressentir a emboscada na rua escura, você deu meia-volta e retornou em segurança.',
    icon: '🏃‍♂️',
    image: '/ending_pixel_art.jpg',
  },
  {
    id: 4,
    number: '#4',
    title: 'O Receptáculo de Cthulhu',
    desc: 'Você se prostrou perante o Cultista Supremo, aceitou o ritual profano e seu corpo tornou-se o novo receptáculo terreno do Grande Cthulhu!',
    icon: '🐙',
    image: null,
  },
];

function getUnlockedEndings() {
  try {
    const raw = localStorage.getItem('dungeon_unlocked_endings');
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}

function unlockEnding(id) {
  const current = getUnlockedEndings();
  if (!current.includes(id)) {
    current.push(id);
    localStorage.setItem('dungeon_unlocked_endings', JSON.stringify(current));
    playSound('victory');
  }
  updateEndingsUI();
}

function updateEndingsUI() {
  const unlocked = getUnlockedEndings();
  const count = unlocked.length;
  const countStr = `${count}/${TOTAL_ENDINGS}`;

  document.querySelectorAll('.endings-counter-val').forEach((el) => {
    el.textContent = countStr;
  });

  const progressPct = Math.round((count / TOTAL_ENDINGS) * 100);
  const endingsProgressTextEl = document.querySelector('#endingsProgressText');
  const endingsProgressFillEl = document.querySelector('#endingsProgressFill');
  if (endingsProgressTextEl) {
    endingsProgressTextEl.textContent = `${count} de ${TOTAL_ENDINGS} Descobertos (${progressPct}%)`;
  }
  if (endingsProgressFillEl) {
    endingsProgressFillEl.style.width = `${progressPct}%`;
  }

  const grid = document.querySelector('#endingsGrid');
  if (grid) {
    grid.innerHTML = ENDINGS_DATA.map((ending) => {
      const isUnlocked = unlocked.includes(ending.id);
      return `
        <div class="ending-item-card ${isUnlocked ? 'unlocked' : 'locked'}">
          <div class="ending-card-icon">${isUnlocked ? ending.icon : '🔒'}</div>
          <div class="ending-card-content">
            <div class="ending-card-tag">${ending.number} • ${isUnlocked ? '✓ DESBLOQUEADO' : 'BLOQUEADO'}</div>
            <div class="ending-card-name">${isUnlocked ? ending.title : '??? (Não Descoberto)'}</div>
            <div class="ending-card-desc">${isUnlocked ? ending.desc : 'Explore os cenários e tome diferentes decisões para descobrir este final.'}</div>
            ${isUnlocked && ending.image ? `<img class="ending-thumb-preview" src="${ending.image}" alt="${ending.title}" />` : ''}
          </div>
        </div>
      `;
    }).join('');
  }
}

function openEndingsModal() {
  updateEndingsUI();
  endingsModalEl.classList.remove('hidden');
}

function closeEndingsModal() {
  endingsModalEl.classList.add('hidden');
}

updateEndingsUI();

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

// ========================================================
// ATO 3 DOM: RELIC PUZZLE & TARGET SHOOTING
// ========================================================
const relicModalEl = document.querySelector('#relicPuzzleModal');
const relicGridBoardEl = document.querySelector('#relicGridBoard');
const relicPreviewCanvasEl = document.querySelector('#relicPreviewCanvas');
const relicStatusTextEl = document.querySelector('#relicStatusText');
const btnScrambleRelicEl = document.querySelector('#btnScrambleRelic');
const btnSolveRelicEl = document.querySelector('#btnSolveRelic');
const btnCloseRelicModalEl = document.querySelector('#btnCloseRelicModal');

const targetModalEl = document.querySelector('#targetShootingModal');
const targetFeedbackTextEl = document.querySelector('#targetFeedbackText');
const targetProgressTextEl = document.querySelector('#targetProgressText');
const btnResetTargetsEl = document.querySelector('#btnResetTargets');
const btnCloseTargetModalEl = document.querySelector('#btnCloseTargetModal');
const btnStartQteEl = document.querySelector('#btnStartQte');
const qteKeyBtnEl = document.querySelector('#qteKeyBtn');

// Master canvas for the authentic Cthulhu Fossil (Ruins of Alph style)
const masterRelicCanvas = document.createElement('canvas');
masterRelicCanvas.width = 256;
masterRelicCanvas.height = 256;

function drawMasterRelic() {
  const ctx = masterRelicCanvas.getContext('2d');
  // Ancient sandstone background
  ctx.fillStyle = '#bcaaa4';
  ctx.fillRect(0, 0, 256, 256);

  // Border and tablet framing
  ctx.strokeStyle = '#4e342e';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, 250, 250);

  // Sandstone speckles
  for (let i = 0; i < 350; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#8d6e63' : '#d7ccc8';
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
  }

  // Draw ancient Cthulhu Fossil Silhouette (matching user's reference image structure)
  ctx.fillStyle = '#3e2723';
  ctx.beginPath();
  ctx.ellipse(128, 105, 68, 55, 0, 0, Math.PI * 2);
  ctx.fill();

  // Carapace outer ridge
  ctx.fillStyle = '#4e342e';
  ctx.beginPath();
  ctx.ellipse(128, 92, 54, 38, 0, 0, Math.PI * 2);
  ctx.fill();

  // Glowing eyes
  ctx.fillStyle = '#ffd54f';
  ctx.beginPath();
  ctx.ellipse(108, 108, 10, 6, 0.2, 0, Math.PI * 2);
  ctx.ellipse(148, 108, 10, 6, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#d84315';
  ctx.beginPath();
  ctx.arc(108, 108, 3, 0, Math.PI * 2);
  ctx.arc(148, 108, 3, 0, Math.PI * 2);
  ctx.fill();

  // Tentacles reaching downward
  ctx.strokeStyle = '#3e2723';
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(90, 145);
  ctx.quadraticCurveTo(68, 185, 78, 215);
  ctx.moveTo(112, 150);
  ctx.quadraticCurveTo(105, 192, 114, 225);
  ctx.moveTo(144, 150);
  ctx.quadraticCurveTo(151, 192, 142, 225);
  ctx.moveTo(166, 145);
  ctx.quadraticCurveTo(188, 185, 178, 215);
  ctx.stroke();

  // Arcane carved glyph ridges
  ctx.strokeStyle = '#271916';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(128, 80, 28, 0.2, Math.PI - 0.2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(128, 65, 18, 0.2, Math.PI - 0.2);
  ctx.stroke();
}
drawMasterRelic();

// Render corner target preview (exactly like the Ruins of Alph reference image!)
if (relicPreviewCanvasEl) {
  const pctx = relicPreviewCanvasEl.getContext('2d');
  pctx.drawImage(masterRelicCanvas, 0, 0, 72, 72);
}

// 4x4 Sliding Puzzle (15-puzzle) — tile value -1 = empty slot
// Solved state: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,-1] (empty at bottom-right)
let relicTiles = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, -1];

function getEmptyIndex() {
  return relicTiles.indexOf(-1);
}

function getValidMoves(emptyIdx) {
  // Returns indices of tiles that can slide into the empty slot (adjacent horizontally/vertically)
  const row = Math.floor(emptyIdx / 4);
  const col = emptyIdx % 4;
  const moves = [];
  if (row > 0) moves.push(emptyIdx - 4); // tile above
  if (row < 3) moves.push(emptyIdx + 4); // tile below
  if (col > 0) moves.push(emptyIdx - 1); // tile to the left
  if (col < 3) moves.push(emptyIdx + 1); // tile to the right
  return moves;
}

function scrambleRelicTiles() {
  // Shuffle via many random valid moves (guarantees solvability)
  let emptyIdx = getEmptyIndex();
  let lastMoved = -1;
  for (let i = 0; i < 300; i++) {
    const moves = getValidMoves(emptyIdx).filter(m => m !== lastMoved);
    const chosen = moves[Math.floor(Math.random() * moves.length)];
    relicTiles[emptyIdx] = relicTiles[chosen];
    relicTiles[chosen] = -1;
    lastMoved = emptyIdx;
    emptyIdx = chosen;
  }
  if (relicStatusTextEl) {
    relicStatusTextEl.textContent = 'Deslize as peças para o espaço vazio para montar a imagem!';
    relicStatusTextEl.style.color = '#ffd54f';
  }
  renderRelicBoard();
}

function renderRelicBoard() {
  if (!relicGridBoardEl) return;
  relicGridBoardEl.innerHTML = '';

  const emptyIdx = getEmptyIndex();
  const validMoves = getValidMoves(emptyIdx);

  relicTiles.forEach((tileValue, gridIndex) => {
    const slotEl = document.createElement('div');
    const isEmpty = tileValue === -1;
    const canMove = validMoves.includes(gridIndex);

    slotEl.className = 'relic-tile-slot';
    if (isEmpty) {
      slotEl.classList.add('relic-empty-slot');
    } else if (canMove) {
      slotEl.classList.add('relic-can-move');
    }

    if (!isEmpty) {
      const tileCanvas = document.createElement('canvas');
      tileCanvas.className = 'relic-tile-canvas';
      tileCanvas.width = 64;
      tileCanvas.height = 64;
      const tctx = tileCanvas.getContext('2d');

      const srcCol = tileValue % 4;
      const srcRow = Math.floor(tileValue / 4);

      tctx.drawImage(
        masterRelicCanvas,
        srcCol * 64,
        srcRow * 64,
        64,
        64,
        0,
        0,
        64,
        64
      );

      tctx.strokeStyle = '#4e342e';
      tctx.lineWidth = 2;
      tctx.strokeRect(0, 0, 64, 64);

      slotEl.appendChild(tileCanvas);
    }

    if (!isEmpty) {
      slotEl.addEventListener('click', () => {
        onRelicTileClick(gridIndex);
      });
    }

    relicGridBoardEl.appendChild(slotEl);
  });
}

function onRelicTileClick(gridIndex) {
  if (questState.relicPuzzleSolved) return;

  const emptyIdx = getEmptyIndex();
  const validMoves = getValidMoves(emptyIdx);

  if (validMoves.includes(gridIndex)) {
    // Slide clicked tile into empty slot
    relicTiles[emptyIdx] = relicTiles[gridIndex];
    relicTiles[gridIndex] = -1;
    playSound('switch');
    renderRelicBoard();
    checkRelicPuzzleWin();
  }
}

function checkRelicPuzzleWin() {
  // Solved when tiles 0-14 are in order and -1 is at position 15
  const isComplete =
    relicTiles[15] === -1 &&
    relicTiles.slice(0, 15).every((val, idx) => val === idx);
  if (isComplete) {
    questState.relicPuzzleSolved = true;
    playSound('victory');
    if (relicStatusTextEl) {
      relicStatusTextEl.textContent = '✨ RELÍQUIA RECONSTITUÍDA COM SUCESSO! A BALISTA FOI ENERGIZADA!';
      relicStatusTextEl.style.color = '#00e676';
    }
    updateHUD();

    setTimeout(() => {
      relicModalEl.classList.add('hidden');
      typeWriterDialogue(
        'ALTAR DA RELÍQUIA',
        '🏛️ Com a relíquia encaixada perfeitamente, a Balista Rúnica estremece de poder! Vá até ela para disparar contra os 4 Alvos sobre o abismo de lava!'
      );
    }, 1200);
  }
}

btnSolveRelicEl.addEventListener('click', () => {
  relicTiles = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, -1];
  renderRelicBoard();
  checkRelicPuzzleWin();
});

btnCloseRelicModalEl.addEventListener('click', () => {
  relicModalEl.classList.add('hidden');
});

// ========================================================
// ATO 3 PUZZLE 2: BALISTA RÚNICA - QUICK TIME EVENT (QTE)
// ========================================================
const QTE_STEPS = [
  { id: 1, name: 'PILAR DO FOGO', symbol: '🔥', key: 'q', keyDisplay: 'Q', color: '#ff5722', duration: 2500 },
  { id: 2, name: 'PILAR DO SANGUE', symbol: '🩸', key: 'e', keyDisplay: 'E', color: '#ff1744', duration: 2300 },
  { id: 3, name: 'PILAR DO RAIO', symbol: '⚡', key: 'r', keyDisplay: 'R', color: '#00e5ff', duration: 2000 },
  { id: 4, name: 'PILAR DO VAZIO', symbol: '👁️', key: ' ', keyDisplay: 'ESPAÇO', color: '#d500f9', duration: 1800 },
];

let qteCurrentIndex = 0;
let qteActive = false;
let qteCanInput = false;
let qteTimerRaf = null;
let qteStartTime = 0;
let qteMaxDuration = 2500;

function updateQteUI() {
  [0, 1, 2, 3].forEach((i) => {
    const dot = document.querySelector(`#tdot${i}`);
    if (dot) {
      if (i < qteCurrentIndex) dot.classList.add('active');
      else dot.classList.remove('active');
    }
  });

  if (targetProgressTextEl) {
    targetProgressTextEl.textContent = `(${qteCurrentIndex} / 4)`;
  }
}

function openQteModal() {
  targetModalEl.classList.remove('hidden');
  qteActive = false;
  qteCanInput = false;
  qteCurrentIndex = 0;
  updateQteUI();
  if (btnStartQteEl) btnStartQteEl.style.display = 'inline-block';
  if (btnResetTargetsEl) btnResetTargetsEl.style.display = 'none';
  if (targetFeedbackTextEl) {
    targetFeedbackTextEl.textContent = 'Mire a balista e inicie o teste de reflexos rápidos para os 4 disparos!';
    targetFeedbackTextEl.style.color = '#ffe0b2';
  }
  const qteTargetNameEl = document.querySelector('#qteTargetName');
  const qteTargetIconEl = document.querySelector('#qteTargetIcon');
  const qteKeyLetterEl = document.querySelector('#qteKeyLetter');
  const qteTimerFillEl = document.querySelector('#qteTimerFill');
  if (qteTargetNameEl) qteTargetNameEl.textContent = '1º ALVO: PILAR DO FOGO';
  if (qteTargetIconEl) qteTargetIconEl.textContent = '🔥';
  if (qteKeyLetterEl) qteKeyLetterEl.textContent = 'Q';
  if (qteTimerFillEl) qteTimerFillEl.style.width = '100%';
}

function startQteSequence() {
  if (questState.targetPuzzleSolved) return;
  qteCurrentIndex = 0;
  qteActive = true;
  updateQteUI();
  if (btnStartQteEl) btnStartQteEl.style.display = 'none';
  if (btnResetTargetsEl) btnResetTargetsEl.style.display = 'none';
  promptNextQteTarget();
}

function promptNextQteTarget() {
  if (qteCurrentIndex >= QTE_STEPS.length) {
    onQteCompleteSuccess();
    return;
  }

  const step = QTE_STEPS[qteCurrentIndex];
  qteCanInput = true;
  qteMaxDuration = step.duration;
  qteStartTime = performance.now();

  const qteTargetIconEl = document.querySelector('#qteTargetIcon');
  const qteTargetNameEl = document.querySelector('#qteTargetName');
  const qteKeyLetterEl = document.querySelector('#qteKeyLetter');
  const qteKeyBtnEl = document.querySelector('#qteKeyBtn');
  const qtePulseRingEl = document.querySelector('#qtePulseRing');

  if (qteTargetIconEl) qteTargetIconEl.textContent = step.symbol;
  if (qteTargetNameEl) {
    qteTargetNameEl.textContent = `${qteCurrentIndex + 1}º ALVO: ${step.name}`;
    qteTargetNameEl.style.color = step.color;
  }
  if (qteKeyLetterEl) {
    qteKeyLetterEl.textContent = step.keyDisplay;
    qteKeyLetterEl.style.color = step.color;
  }
  if (qteKeyBtnEl) {
    qteKeyBtnEl.style.borderColor = step.color;
    qteKeyBtnEl.style.boxShadow = `0 0 25px ${step.color}88`;
  }
  if (qtePulseRingEl) {
    qtePulseRingEl.style.borderColor = step.color;
  }

  if (targetFeedbackTextEl) {
    targetFeedbackTextEl.textContent = `⚡ DISPARO ATIVO! Pressione [${step.keyDisplay}] ou clique no centro rápido!`;
    targetFeedbackTextEl.style.color = '#ffe0b2';
  }

  runQteTimerLoop();
}

function runQteTimerLoop() {
  if (qteTimerRaf) cancelAnimationFrame(qteTimerRaf);

  function tick(now) {
    if (!qteActive || !qteCanInput) return;

    const elapsed = now - qteStartTime;
    const remainingPct = Math.max(0, 1 - elapsed / qteMaxDuration);
    const qteTimerFillEl = document.querySelector('#qteTimerFill');
    if (qteTimerFillEl) {
      qteTimerFillEl.style.width = `${remainingPct * 100}%`;
    }

    if (elapsed >= qteMaxDuration) {
      onQteTimeOut();
      return;
    }

    qteTimerRaf = requestAnimationFrame(tick);
  }

  qteTimerRaf = requestAnimationFrame(tick);
}

function handleQteInput(inputKey) {
  if (!qteActive || !qteCanInput) return;
  const step = QTE_STEPS[qteCurrentIndex];

  const pressed = inputKey.toLowerCase();
  const isMatch = (pressed === step.key) || 
                  (step.key === ' ' && (pressed === ' ' || pressed === 'space' || pressed === 'spacebar'));

  if (isMatch) {
    onQteHitSuccess();
  } else {
    onQteMissError();
  }
}

function onQteHitSuccess() {
  qteCanInput = false;
  if (qteTimerRaf) cancelAnimationFrame(qteTimerRaf);

  playSound('pickup');
  const step = QTE_STEPS[qteCurrentIndex];

  if (act3Env && act3Env.targets && act3Env.targets[qteCurrentIndex]) {
    act3Env.targets[qteCurrentIndex].hit = true;
    if (act3Env.targets[qteCurrentIndex].orb) {
      act3Env.targets[qteCurrentIndex].orb.material.emissiveIntensity = 2.5;
    }
  }

  const qteKeyBtnEl = document.querySelector('#qteKeyBtn');
  if (qteKeyBtnEl) {
    qteKeyBtnEl.classList.add('hit-success');
    setTimeout(() => qteKeyBtnEl.classList.remove('hit-success'), 350);
  }

  if (targetFeedbackTextEl) {
    targetFeedbackTextEl.textContent = `🎯 ACERTO PERFEITO! O ${step.name} acendeu em chamas sagradas!`;
    targetFeedbackTextEl.style.color = '#00e676';
  }

  qteCurrentIndex++;
  updateQteUI();

  if (qteCurrentIndex >= QTE_STEPS.length) {
    setTimeout(onQteCompleteSuccess, 500);
  } else {
    setTimeout(promptNextQteTarget, 600);
  }
}

function onQteMissError() {
  qteCanInput = false;
  qteActive = false;
  if (qteTimerRaf) cancelAnimationFrame(qteTimerRaf);
  playSound('hit');

  const qteKeyBtnEl = document.querySelector('#qteKeyBtn');
  if (qteKeyBtnEl) {
    qteKeyBtnEl.classList.add('miss-error');
    setTimeout(() => qteKeyBtnEl.classList.remove('miss-error'), 450);
  }

  if (targetFeedbackTextEl) {
    targetFeedbackTextEl.textContent = '❌ TECLA INCORRETA! O tiro errou o pilar e o mecanismo travou!';
    targetFeedbackTextEl.style.color = '#ff1744';
  }

  if (btnResetTargetsEl) btnResetTargetsEl.style.display = 'inline-block';
}

function onQteTimeOut() {
  qteCanInput = false;
  qteActive = false;
  if (qteTimerRaf) cancelAnimationFrame(qteTimerRaf);
  playSound('hit');

  if (targetFeedbackTextEl) {
    targetFeedbackTextEl.textContent = '⏱️ TEMPO ESGOTADO! O pulso de magma passou e o disparo falhou!';
    targetFeedbackTextEl.style.color = '#ff9100';
  }

  if (btnResetTargetsEl) btnResetTargetsEl.style.display = 'inline-block';
}

function onQteCompleteSuccess() {
  qteActive = false;
  qteCanInput = false;
  questState.targetPuzzleSolved = true;
  playSound('gate_unlock');
  playSound('victory');

  if (targetFeedbackTextEl) {
    targetFeedbackTextEl.textContent = '🌟 TODOS OS 4 PILARES CALIBRADOS! A PONTE DE BASALTO EMERGIU DA LAVA!';
    targetFeedbackTextEl.style.color = '#00e676';
  }

  if (act3Env && act3Env.bridge) {
    act3Env.bridge.raise();
  }
  updateHUD();

  setTimeout(() => {
    targetModalEl.classList.add('hidden');
    typeWriterDialogue(
      'ESTRONDO SÍSMICO!',
      '🚪 Um estrondo colossal ecoa por todo o abismo! A Grande Ponte de Basalto ergueu-se das profundezas de lava fervente! O caminho até o santuário final além do abismo está aberto!'
    );
  }, 1300);
}

if (btnStartQteEl) {
  btnStartQteEl.addEventListener('click', startQteSequence);
}

if (btnResetTargetsEl) {
  btnResetTargetsEl.addEventListener('click', startQteSequence);
}

if (qteKeyBtnEl) {
  qteKeyBtnEl.addEventListener('click', () => {
    if (qteActive && qteCanInput && qteCurrentIndex < QTE_STEPS.length) {
      handleQteInput(QTE_STEPS[qteCurrentIndex].key);
    }
  });
}

btnCloseTargetModalEl.addEventListener('click', () => {
  qteActive = false;
  qteCanInput = false;
  if (qteTimerRaf) cancelAnimationFrame(qteTimerRaf);
  targetModalEl.classList.add('hidden');
});

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
const act3Env = createAct3Environment(scene);

streetEnv.group.visible = true;
dungeonEnv.group.visible = false;
act3Env.group.visible = false;

let currentAct = 1;

// Create Player and NPC
const player = new Player(scene, streetEnv.startPlayerX, 0.0);
const initialSpot = streetEnv.hidingSpots[0];
const npc = new Npc(scene, initialSpot.x, initialSpot.z);

let dungeonEnemies = [];
let act3Enemies = [];

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

function spawnAct3Enemies() {
  if (act3Enemies.length === 0) {
    act3Env.enemySpawnPoints.forEach((sp) => {
      const enemy = new Enemy(scene, {
        x: sp.x,
        z: sp.z,
        name: sp.name,
        patrolRadius: sp.patrolRadius,
      });
      act3Enemies.push(enemy);
    });
  } else {
    act3Enemies.forEach((e) => e.reset());
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
  relicPuzzleSolved: false,
  targetPuzzleSolved: false,
};

function updateHUD() {
  if (currentAct === 2 || currentAct === 3) {
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

    const titleEl = document.querySelector('.hud-inventory-title');
    if (currentAct === 3) {
      if (titleEl) titleEl.textContent = '🌋 OBJETIVOS DO ABISMO DE LAVA';
      if (questState.relicPuzzleSolved) {
        slotBronzeKeyEl.classList.add('acquired');
        slotBronzeKeyEl.textContent = '🏛️ Relíquia [✓]';
      } else {
        slotBronzeKeyEl.classList.remove('acquired');
        slotBronzeKeyEl.textContent = '🏛️ Relíquia [ ]';
      }

      if (questState.targetPuzzleSolved) {
        slotCthulhuRuneEl.classList.add('acquired');
        slotCthulhuRuneEl.textContent = '🎯 4 Alvos [✓]';
      } else {
        slotCthulhuRuneEl.classList.remove('acquired');
        slotCthulhuRuneEl.textContent = '🎯 4 Alvos [ ]';
      }

      if (act3Env && act3Env.bridge && act3Env.bridge.isRaised) {
        slotCultistEmblemEl.classList.add('acquired');
        slotCultistEmblemEl.textContent = '🌉 Ponte [✓]';
      } else {
        slotCultistEmblemEl.classList.remove('acquired');
        slotCultistEmblemEl.textContent = '🌉 Ponte [ ]';
      }
    } else {
      if (titleEl) titleEl.textContent = '📜 SELOS PARA ABRIR O PORTÃO';
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
let isSecretEnding = false;
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
  isSecretEnding = false;
  knockoutOverlayEl.classList.add('hidden');
  victoryOverlayEl.classList.add('hidden');
  secretEndingOverlayEl.classList.add('hidden');
  endingsModalEl.classList.add('hidden');
  binaryModalEl.classList.add('hidden');
  colorModalEl.classList.add('hidden');
  relicModalEl.classList.add('hidden');
  targetModalEl.classList.add('hidden');

  if (act === 1) {
    streetEnv.group.visible = true;
    dungeonEnv.group.visible = false;
    act3Env.group.visible = false;
    hemiLight.color.setHex(0xdbe7ff);
    hemiLight.groundColor.setHex(0x18202d);
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
    act3Enemies.forEach((e) => e.destroy());
    act3Enemies = [];
  } else if (act === 2) {
    streetEnv.group.visible = false;
    dungeonEnv.group.visible = true;
    act3Env.group.visible = false;
    hemiLight.color.setHex(0xdbe7ff);
    hemiLight.groundColor.setHex(0x18202d);
    hemiLight.intensity = 0.9;

    player.reset(dungeonEnv.spawnPos.x, dungeonEnv.spawnPos.z);
    npc.resetDungeon(dungeonEnv.altarPos.x, dungeonEnv.altarPos.z);

    camera.position.set(dungeonEnv.spawnPos.x, 15.0, 9.0);
    spawnDungeonEnemies();
    act3Enemies.forEach((e) => e.destroy());
    act3Enemies = [];
  } else if (act === 3) {
    streetEnv.group.visible = false;
    dungeonEnv.group.visible = false;
    act3Env.group.visible = true;
    hemiLight.color.setHex(0xff7043);
    hemiLight.groundColor.setHex(0x21100a);
    hemiLight.intensity = 0.85;

    player.reset(act3Env.spawnPos.x, act3Env.spawnPos.z);
    camera.position.set(act3Env.spawnPos.x, 15.0, 9.0);

    dungeonEnemies.forEach((e) => e.destroy());
    dungeonEnemies = [];
    spawnAct3Enemies();

    typeWriterDialogue(
      'ATO 3: O ABISMO DE LAVA',
      '🔥 O calor sufocante e rios de magma cercam este abismo! Decifre a Relíquia dos Antigos e acerte os alvos na ordem correta para erguer a ponte sagrada!'
    );
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

let act3ChoiceDialogShown = false;

function triggerEnding(endingId) {
  if (isVictory) return;
  isVictory = true;
  unlockEnding(endingId);
  playSound('victory');

  const ending = ENDINGS_DATA.find((e) => e.id === endingId) || ENDINGS_DATA[0];

  const victoryBadgeEl = document.querySelector('#victoryBadge');
  const victoryIconLargeEl = document.querySelector('#victoryIconLarge');
  const victoryTitleEl = document.querySelector('#victoryTitle');
  const victoryQuoteEl = document.querySelector('#victoryQuote');
  const victoryTextEl = document.querySelector('#victoryText');

  if (victoryBadgeEl) victoryBadgeEl.textContent = `🏆 CONQUISTA DE FINAL #${ending.id} DESBLOQUEADA!`;
  if (victoryIconLargeEl) victoryIconLargeEl.textContent = ending.icon;
  if (victoryTitleEl) victoryTitleEl.textContent = `FINAL ${ending.number}: ${ending.title.toUpperCase()}`;

  if (endingId === 1) {
    if (victoryQuoteEl) victoryQuoteEl.textContent = '"A pesada porta dos ancestrais rangeu... e a brisa da noite tocou sua pele mais uma vez."';
    if (victoryTextEl) {
      victoryTextEl.innerHTML = `
        <strong>PARABÉNS!</strong> Você escolheu abrir a Porta Ancestral e deixar para trás o covil das cinzas e magma.<br><br>
        Subindo degraus milenares de pedra, você alcançou os limites de uma floresta calma e silenciosa sob a luz do luar. Você escapou do abismo com vida, liberdade e sanidade preservadas!
      `;
    }
  } else if (endingId === 2) {
    if (victoryQuoteEl) victoryQuoteEl.textContent = '"O fedor nauseante de lodo e ferrugem inundou seus pulmões enquanto você rastejava na escuridão."';
    if (victoryTextEl) {
      victoryTextEl.innerHTML = `
        <strong>FUGA PELAS SOMBRAS!</strong> Você optou por descer na podridão dos bueiros subterrâneos.<br><br>
        Rastejando por horas a fio entre águas turvas e canos esquecidos, você finalmente emergiu por uma grade de drenagem nos fundos de um cais portuário. Você sobreviveu... mas os sussurros fétidos do esgoto jamais deixarão a sua mente.
      `;
    }
  } else if (endingId === 4) {
    if (victoryQuoteEl) victoryQuoteEl.textContent = '"Ph\'nglui mglw\'nafh Cthulhu R\'lyeh wgah\'nagl fhtagn... O despertar cósmico começou."';
    if (victoryTextEl) {
      victoryTextEl.innerHTML = `
        <strong>PACTO CONSUMADO!</strong> Você se prostrou perante o Cultista Supremo e abriu seu espírito ao Grande Cthulhu.<br><br>
        Tentáculos de energia cósmica envolveram seu corpo enquanto sua consciência mortal se dissolvia no infinito do cosmo. Você não é mais apenas um humano... você é o Receptáculo Sagrado que trará o reinado das profundezas à Terra!
      `;
    }
  }

  victoryOverlayEl.classList.remove('hidden');
}

function triggerVictory() {
  triggerEnding(1);
}

btnPlayAgainEl.addEventListener('click', () => {
  questState.hasBronzeKey = false;
  questState.hasCthulhuRune = false;
  questState.hasCultistEmblem = false;
  questState.gateOpen = false;
  questState.activePedestals = 0;
  act3ChoiceDialogShown = false;
  resetPuzzles(true);
  setAct(1);
  closeMenu();
});

btnVictoryMenuEl.addEventListener('click', () => {
  victoryOverlayEl.classList.add('hidden');
  isGameStarted = false;
  act3ChoiceDialogShown = false;
  resetPuzzles(true);
  setAct(1);
  openMenu();
});

// Secret Ending #3 Trigger & Actions
function triggerSecretEnding3() {
  if (isSecretEnding || isGameOver || isKidnapped || isKnockedOut) return;
  isSecretEnding = true;
  unlockEnding(3);

  player.moving = false;

  typeWriterDialogue(
    'JOGADOR (INTUIÇÃO)',
    'Eu sinto que tem alguma coisa de errado com aquele lado... Melhor dar meia-volta enquanto ainda há tempo!',
    () => {
      setTimeout(() => {
        playSound('victory');
        dialogueContainerEl.classList.add('hidden');
        secretEndingOverlayEl.classList.remove('hidden');
      }, 1500);
    }
  );
}

btnSecretPlayAgainEl.addEventListener('click', () => {
  secretEndingOverlayEl.classList.add('hidden');
  isSecretEnding = false;
  questState.hasBronzeKey = false;
  questState.hasCthulhuRune = false;
  questState.hasCultistEmblem = false;
  questState.gateOpen = false;
  questState.activePedestals = 0;
  resetPuzzles(true);
  setAct(1);
  isGameStarted = true;
  closeMenu();
});

btnSecretViewEndingsEl.addEventListener('click', openEndingsModal);
btnVictoryViewEndingsEl.addEventListener('click', openEndingsModal);
topEndingsBtnEl.addEventListener('click', openEndingsModal);
btnOpenEndingsMenuEl.addEventListener('click', openEndingsModal);
btnCloseEndingsModalEl.addEventListener('click', closeEndingsModal);

btnSecretMainMenuEl.addEventListener('click', () => {
  secretEndingOverlayEl.classList.add('hidden');
  isSecretEnding = false;
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
  // Handle QTE Keyboard Input
  if (qteActive && qteCanInput && !targetModalEl.classList.contains('hidden')) {
    const k = e.key.toLowerCase();
    if (['q', 'e', 'r', ' '].includes(k) || e.code === 'Space') {
      e.preventDefault();
      handleQteInput(e.key);
      return;
    }
  }

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
    if (!endingsModalEl.classList.contains('hidden')) {
      endingsModalEl.classList.add('hidden');
      return;
    }
    if (!secretEndingOverlayEl.classList.contains('hidden')) {
      return;
    }
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
    if (!relicModalEl.classList.contains('hidden')) {
      relicModalEl.classList.add('hidden');
      return;
    }
    if (!targetModalEl.classList.contains('hidden')) {
      qteActive = false;
      qteCanInput = false;
      if (qteTimerRaf) cancelAnimationFrame(qteTimerRaf);
      targetModalEl.classList.add('hidden');
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
    !secretEndingOverlayEl.classList.contains('hidden') ||
    !endingsModalEl.classList.contains('hidden') ||
    !controlsOverlayEl.classList.contains('hidden') ||
    !binaryModalEl.classList.contains('hidden') ||
    !colorModalEl.classList.contains('hidden') ||
    !safeModalEl.classList.contains('hidden') ||
    !relicModalEl.classList.contains('hidden') ||
    !targetModalEl.classList.contains('hidden') ||
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

  if (dungeonEnv && dungeonEnv.pathPuzzle) {
    dungeonEnv.pathPuzzle.resetPathTiles();
    if (resetAll) {
      dungeonEnv.pathPuzzle.rerollSafePath();
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

  // Act 3: Check nearby interactive object in the Magma Chasm
  if (currentAct === 3) {
    if (!currentPromptObject) {
      typeWriterDialogue(
        'JOGADOR',
        'Preciso reconstituir o Quebra-Cabeça da Relíquia no Altar e acertar a sequência dos 4 Alvos na Balista para erguer a Ponte de Basalto!'
      );
      return;
    }

    const obj = currentPromptObject;
    if (obj.type === 'relic_puzzle') {
      if (!questState.relicPuzzleSolved) {
        // Reset to solved state then scramble fresh each time the modal opens
        relicTiles = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, -1];
        scrambleRelicTiles();
      } else {
        renderRelicBoard();
      }
      relicModalEl.classList.remove('hidden');
    } else if (obj.type === 'target_shooting') {
      if (!questState.relicPuzzleSolved) {
        typeWriterDialogue(
          'BALISTA INATIVA',
          '🔒 A Balista Rúnica está sem energia! Monte primeiro o Quebra-Cabeça da Relíquia no Altar para energizar o disparo!'
        );
      } else {
        openQteModal();
      }
    } else if (obj.type === 'lore_clue') {
      playSound('pickup');
      typeWriterDialogue(obj.clueSpeaker || 'INSCRIÇÃO', obj.clueText);
    } else if (obj.type === 'healing_source') {
      if (!obj.searched) {
        obj.searched = true;
        player.hp = Math.min(player.maxHp, player.hp + 40);
        playSound('pickup');
        typeWriterDialogue(
          'FONTE DE SANGUE SAGRADO',
          '🧪 Você bebeu o sangue vital da fonte mágica (+40 HP)! Suas feridas foram restauradas!'
        );
        updateHUD();
      } else {
        typeWriterDialogue('FONTE SAGRADA', 'A fonte de sangue já foi consumida.');
      }
    } else if (obj.type === 'ending_choice') {
      triggerEnding(obj.endingId);
    } else if (obj.type === 'escape_portal') {
      triggerEnding(1);
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
    !isSecretEnding &&
    menuOverlayEl.classList.contains('hidden') &&
    knockoutOverlayEl.classList.contains('hidden') &&
    victoryOverlayEl.classList.contains('hidden') &&
    secretEndingOverlayEl.classList.contains('hidden') &&
    endingsModalEl.classList.contains('hidden') &&
    controlsOverlayEl.classList.contains('hidden') &&
    binaryModalEl.classList.contains('hidden') &&
    colorModalEl.classList.contains('hidden') &&
    safeModalEl.classList.contains('hidden') &&
    relicModalEl.classList.contains('hidden') &&
    targetModalEl.classList.contains('hidden') &&
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

      // Check Secret Ending #3 (Dar meia-volta e voltar para a rua/cidade)
      if (player.group.position.x <= streetEnv.triggerSecretEndingX && !isSecretEnding) {
        triggerSecretEnding3();
      }

      if (player.group.position.x >= streetEnv.triggerKidnapX) {
        triggerKidnapping();
      }
    } else if (currentAct === 2) {
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

      // Check Chamber 5 Tile Path Puzzle (Trilha das Lajes Rúnicas e Buracos)
      if (
        dungeonEnv &&
        dungeonEnv.pathPuzzle &&
        !player.isFalling &&
        !isKnockedOut &&
        player.group.position.x >= 20.5 &&
        player.group.position.x <= 34.0 &&
        player.group.position.z >= 1.0 &&
        player.group.position.z <= 9.0
      ) {
        for (const tile of dungeonEnv.pathPuzzle.tiles) {
          const distToTile = Math.hypot(
            player.group.position.x - tile.x,
            player.group.position.z - tile.z
          );
          if (distToTile < 1.05) {
            if (tile.isSafe) {
              if (!tile.isStepped) {
                tile.isStepped = true;
                tile.mat.emissive.setHex(0x00e676);
                playSound('pickup');
              }
            } else {
              // Laje falsa desmorona em buraco!
              if (!tile.isCollapsed) {
                tile.isCollapsed = true;
                tile.mesh.visible = false;
                player.triggerHoleFall();
                playSound('fall');
                break;
              }
            }
          }
        }
      }

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

      // Check Act 2 Completion (Transition to Act 3: O Abismo de Lava)
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
          typeWriterDialogue(
            'DESCENDO AO ABISMO',
            '🚪 Você atravessou o Grande Portão e desceu as escadarias arcanas... O ar fica sufocante e rios de lava fervente se abrem à sua frente!',
            () => {
              setAct(3);
            }
          );
        } else {
          player.group.position.x = 35.0;
          typeWriterDialogue(
            'SAÍDA BLOQUEADA',
            '🔒 Uma barreira intransponível bloqueia a saída! Você precisa resolver todos os 3 enigmas e abrir o portão de ferro para descer ao próximo nível!'
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
    } else if (currentAct === 3) {
      // Act 3: Volcanic Chasm & Magma River
      act3Env.update(dt, elapsed);

      const playerUpdateRes = player.update(
        keys,
        dt,
        act3Env.bounds,
        cameraAngle,
        act3Env.obstacles
      );
      player.animate(elapsed);

      const targetCamX = THREE.MathUtils.clamp(
        player.group.position.x,
        act3Env.bounds.minX + 6,
        act3Env.bounds.maxX - 6
      );
      const targetCamZ = THREE.MathUtils.clamp(
        player.group.position.z + 8.5,
        act3Env.bounds.minZ + 8,
        act3Env.bounds.maxZ + 8
      );
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, 0.08);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, 0.08);

      // Check Lava Hazards
      for (const lh of act3Env.lavaHazards) {
        if (
          player.group.position.x >= lh.minX &&
          player.group.position.x <= lh.maxX &&
          player.group.position.z >= lh.minZ &&
          player.group.position.z <= lh.maxZ
        ) {
          const onBridge = act3Env.bridge.isRaised && Math.abs(player.group.position.z) <= 2.2;
          if (!onBridge) {
            player.hp -= lh.damage * dt;
            player.noiseLevel = 3;
            playSound('hit');
            updateHUD();
            if (player.hp <= 0) {
              player.hp = 0;
              triggerKnockout('Você caiu no rio de lava ardente e foi consumido pelas chamas!');
            }
          }
        }
      }

      // Check Acid Hazards
      for (const ah of act3Env.acidHazards) {
        if (
          player.group.position.x >= ah.minX &&
          player.group.position.x <= ah.maxX &&
          player.group.position.z >= ah.minZ &&
          player.group.position.z <= ah.maxZ
        ) {
          player.hp -= ah.damage * dt;
          player.noiseLevel = 2;
          playSound('hit');
          updateHUD();
          if (player.hp <= 0) {
            player.hp = 0;
            triggerKnockout('Você pisou no poço de ácido corrosivo e suas forças se esvaíram!');
          }
        }
      }

      // Update Act 3 Blind Blood Monsters
      act3Enemies.forEach((enemy) => {
        const res = enemy.updateBlindMonster(
          player.group.position,
          player.noiseLevel,
          player.isSneaking,
          dt,
          elapsed,
          act3Env.obstacles,
          cameraAngle
        );

        if (res.attacked && !player.isFalling) {
          player.hp -= res.damage;
          player.noiseLevel = 3;
          playSound('hit');
          typeWriterDialogue(
            'ALERTA MAGMÁTICO!',
            `🩸 O ${enemy.name} ouviu seus passos sobre as pedras vulcânicas e atacou! Use SHIFT!`
          );
          updateHUD();

          if (player.hp <= 0) {
            player.hp = 0;
            triggerKnockout(`O ${enemy.name} te atingiu com um golpe mortal e você desmaiou nas cinzas!`);
          }
        }
      });

      // Anúncio dramático das 3 Escolhas ao cruzar a ponte e pisar no santuário final (X >= 27.5)
      if (
        player.group.position.x >= 27.5 &&
        act3Env.bridge.isRaised &&
        !act3ChoiceDialogShown &&
        !isVictory
      ) {
        act3ChoiceDialogShown = true;
        typeWriterDialogue(
          'ENCRUZILHADA DO DESTINO',
          '🔥 Você atravessou o abismo de chamas! Três caminhos se revelam no santuário: a Porta Ancestral à esquerda, o Bueiro Fétido à direita, ou o Cultista Supremo ao centro aguardando para o despertar de Cthulhu!'
        );
      }

      // Check Nearby Interactive Objects in Act 3
      let closestObj = null;
      let closestDist = Infinity;

      for (const obj of act3Env.interactiveObjects) {
        const dist = Math.hypot(
          player.group.position.x - obj.x,
          player.group.position.z - obj.z
        );
        if (dist < obj.radius && dist < closestDist) {
          closestDist = dist;
          closestObj = obj;
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
