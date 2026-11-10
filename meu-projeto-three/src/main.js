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
    <button class="btn-top-endings" id="topEndingsBtn">🏆 FINAIS (<span class="endings-counter-val">0/2</span>)</button>
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
      <span class="hud-stealth-label">RUÍDO (SOM):</span>
      <span class="stealth-status silent" id="stealthStatus">PARADO (SILENCIOSO)</span>
    </div>

    <div class="hud-inventory-card">
      <div class="hud-inventory-title">SELOS PARA ABRIR O PORTÃO</div>
      <div class="hud-items-row">
        <div class="hud-item-slot" id="slotBronzeKey">Chave [ ]</div>
        <div class="hud-item-slot" id="slotCthulhuRune">Runa [ ]</div>
        <div class="hud-item-slot" id="slotCultistEmblem">Emblema [ ]</div>
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

  <!-- PUZZLE 1: Terminal de Decodificação Binária com Dedos das Mãos -->
  <div class="puzzle-modal-overlay hidden" id="binaryModal">
    <div class="puzzle-card terminal-puzzle-card">
      <div class="puzzle-title">🖐️ TERMINAL DAS MÃOS (CÓDIGO BINÁRIO)</div>
      <p class="puzzle-desc">
        Decifre a <strong>Frequência Alvo</strong> através do Enigma Rúnico e posicione os 7 dedos das mãos (0 = Abaixado, 1 = Levantado) somando os pesos binários correspondentes.<br>
        <em>Dica: Pressione as setas ▲ e ▼ (ou clique diretamente no visor) para alternar cada dedo entre 0 e 1.</em>
      </p>

      <div class="terminal-puzzle-layout">
        <!-- COLUNA 1: DEDOS DAS MÃOS (7 CASAS BINÁRIAS) -->
        <div class="terminal-display-panel">
          <div class="terminal-panel-header">✋ DEDOS DAS MÃOS (7 CASAS BINÁRIAS)</div>

          <div class="hands-slots-wrapper">
            <!-- MÃO ESQUERDA (5 DEDOS) -->
            <div class="hand-group left-hand">
              <div class="hand-group-title">🖐️ MÃO ESQUERDA (5 DEDOS)</div>
              <div class="terminal-digits-row">
                <div class="terminal-digit-slot">
                  <span class="terminal-digit-tag">Mínimo</span>
                  <span class="terminal-bit-weight">64</span>
                  <button class="terminal-digit-btn" id="btnDigitUp0">▲</button>
                  <div class="terminal-digit-screen bit-off" id="digitVal0">0</div>
                  <button class="terminal-digit-btn" id="btnDigitDown0">▼</button>
                </div>
                <div class="terminal-digit-slot">
                  <span class="terminal-digit-tag">Anelar</span>
                  <span class="terminal-bit-weight">32</span>
                  <button class="terminal-digit-btn" id="btnDigitUp1">▲</button>
                  <div class="terminal-digit-screen bit-off" id="digitVal1">0</div>
                  <button class="terminal-digit-btn" id="btnDigitDown1">▼</button>
                </div>
                <div class="terminal-digit-slot">
                  <span class="terminal-digit-tag">Médio</span>
                  <span class="terminal-bit-weight">16</span>
                  <button class="terminal-digit-btn" id="btnDigitUp2">▲</button>
                  <div class="terminal-digit-screen bit-off" id="digitVal2">0</div>
                  <button class="terminal-digit-btn" id="btnDigitDown2">▼</button>
                </div>
                <div class="terminal-digit-slot">
                  <span class="terminal-digit-tag">Indicador</span>
                  <span class="terminal-bit-weight">8</span>
                  <button class="terminal-digit-btn" id="btnDigitUp3">▲</button>
                  <div class="terminal-digit-screen bit-off" id="digitVal3">0</div>
                  <button class="terminal-digit-btn" id="btnDigitDown3">▼</button>
                </div>
                <div class="terminal-digit-slot">
                  <span class="terminal-digit-tag">Polegar</span>
                  <span class="terminal-bit-weight">4</span>
                  <button class="terminal-digit-btn" id="btnDigitUp4">▲</button>
                  <div class="terminal-digit-screen bit-off" id="digitVal4">0</div>
                  <button class="terminal-digit-btn" id="btnDigitDown4">▼</button>
                </div>
              </div>
            </div>

            <!-- MÃO DIREITA (2 DEDOS) -->
            <div class="hand-group right-hand">
              <div class="hand-group-title">✌️ MÃO DIREITA (2 DEDOS)</div>
              <div class="terminal-digits-row">
                <div class="terminal-digit-slot">
                  <span class="terminal-digit-tag">Polegar</span>
                  <span class="terminal-bit-weight">2</span>
                  <button class="terminal-digit-btn" id="btnDigitUp5">▲</button>
                  <div class="terminal-digit-screen bit-off" id="digitVal5">0</div>
                  <button class="terminal-digit-btn" id="btnDigitDown5">▼</button>
                </div>
                <div class="terminal-digit-slot">
                  <span class="terminal-digit-tag">Indicador</span>
                  <span class="terminal-bit-weight">1</span>
                  <button class="terminal-digit-btn" id="btnDigitUp6">▲</button>
                  <div class="terminal-digit-screen bit-off" id="digitVal6">0</div>
                  <button class="terminal-digit-btn" id="btnDigitDown6">▼</button>
                </div>
              </div>
            </div>
          </div>

          <div class="terminal-status-box" id="binaryValueDisplay">
            Dedos: [ 0 - 0 - 0 - 0 - 0 - 0 - 0 ] &nbsp;|&nbsp; Aguardando Ativação
          </div>
        </div>

        <!-- COLUNA 2: ENIGMA DOS SÍMBOLOS ANCESTRAIS (AO LADO DO DISPLAY) -->
        <div class="terminal-table-panel">
          <div class="terminal-table-header">📜 ENIGMA DOS SÍMBOLOS ANCESTRAIS</div>

          <div class="terminal-table-intro">
            Deduz o valor de cada runa através das 3 inscrições sagradas:
          </div>

          <div class="enigma-equations-container" id="enigmaEquationsContainer">
            <!-- Inscrições preenchidas dinamicamente via JS -->
          </div>

          <div class="enigma-formula-wrapper">
            <span class="enigma-formula-label">⚡ FÓRMULA DA FREQUÊNCIA ALVO</span>
            <span class="enigma-formula-text" id="enigmaFormulaBox">( ᚱ × ᛉ ) + ᛏ</span>
          </div>

          <div class="terminal-hint-note">
            💡 <em>Descubra o valor de ᚱ, ᛉ e ᛏ pelas inscrições, resolva a Frequência Alvo e levante os dedos somando os pesos (+64, +32, +16, +8, +4, +2, +1)!</em>
          </div>
        </div>
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
        <button class="puzzle-btn secondary" id="btnScrambleRelic">🔄 Embaralhar</button>
        <button class="puzzle-btn secondary" id="btnCloseRelicModal">Fechar</button>
        <button class="puzzle-btn skip-demo" id="btnSkipRelic" title="Modo apresentação — pula o puzzle instantaneamente">⏭️ Pular (Demo)</button>
      </div>
    </div>
  </div>

  <!-- ATO 3 PUZZLE 2: Terminal de Disparo Rápido (Quick Time Event - QTE) -->
  <div class="target-modal-overlay hidden" id="targetShootingModal">
    <div class="qte-hud-container">
      <!-- TOP FLOATING HUD -->
      <div class="qte-floating-top">
        <div class="qte-title-badge">⚡ BALISTA RÚNICA: DISPARO RÁPIDO (QTE)</div>
        <div class="target-progress-bar-row">
          <span>Alvos Destruídos:</span>
          <div class="target-dots" id="targetDots">
            <div class="target-dot" id="tdot0"></div>
            <div class="target-dot" id="tdot1"></div>
            <div class="target-dot" id="tdot2"></div>
            <div class="target-dot" id="tdot3"></div>
          </div>
          <span id="targetProgressText">(0 / 4)</span>
        </div>
        <div class="qte-current-target-title" id="qteTargetName">PRONTO PARA MIRAR?</div>
        <div class="qte-hint-pill">🎯 Aperte a tecla exatamente quando o anel externo encolher até encostar no círculo central!</div>
      </div>

      <!-- CENTER QTE RING ARENA -->
      <div class="qte-center-arena">
        <div class="qte-circle-wrapper">
          <!-- Outer Shrinking Approach Ring -->
          <div class="qte-approach-ring" id="qtePulseRing"></div>
          <!-- Inner Target Reference Ring -->
          <div class="qte-inner-sweet-spot-ring"></div>
          <!-- Center Button with Key Display -->
          <button class="qte-big-key-btn" id="qteKeyBtn" type="button">
            <span class="qte-target-symbol" id="qteTargetIcon">🎯</span>
            <span class="qte-key-letter" id="qteKeyLetter">Q</span>
            <span class="qte-key-subtext">TECLE OU CLIQUE!</span>
          </button>
        </div>
      </div>

      <!-- BOTTOM FLOATING CONTROLS & FEEDBACK -->
      <div class="qte-floating-bottom">
        <div class="target-feedback-text" id="targetFeedbackText">
          Mire a balista e inicie o teste de reflexos rápidos para os disparos!
        </div>
        <div class="target-actions-clean">
          <button class="puzzle-btn primary" id="btnStartQte">🏹 Iniciar Disparos (QTE)</button>
          <button class="puzzle-btn secondary" id="btnResetTargets" style="display: none;">🔄 Tentar Novamente</button>
          <button class="puzzle-btn secondary" id="btnCloseTargetModal">Fechar</button>
          <button class="puzzle-btn skip-demo" id="btnSkipQte" title="Modo apresentação — pula o puzzle instantaneamente">⏭️ Pular (Demo)</button>
        </div>
      </div>
    </div>
  </div>

  <!-- PLACA DE PEDRA DO MONÓLITO ANCESTRAL (MODAL DE DICA) -->
  <div class="stone-plaque-modal-overlay hidden" id="stonePlaqueModal">
    <div class="stone-plaque-card">
      <div class="stone-plaque-header">
        <div class="stone-plaque-icon">🏛️</div>
        <div class="stone-plaque-title">MONÓLITO DAS LÂMINAS VELADAS</div>
        <div class="stone-plaque-subtitle">Inscrições ancestrais esculpidas na rocha negra</div>
      </div>
      <div class="stone-plaque-divider"></div>
      <div class="stone-plaque-content" id="stonePlaqueText">
        <!-- Inscrição poética gerada dinamicamente -->
      </div>
      <div class="stone-plaque-divider"></div>
      <div class="stone-plaque-actions">
        <button class="puzzle-btn primary" id="btnCloseStonePlaque">✕ Fechar Inscrição [ESC]</button>
      </div>
    </div>
  </div>

  <!-- Controls & How To Play Overlay (Pergaminho Antigo) -->
  <div class="controls-overlay hidden" id="controlsOverlay">
    <div class="controls-card">
      <button class="controls-close-btn" id="btnCloseControls" type="button" title="Voltar ao Menu">✕</button>

      <div class="controls-header">
        <h2 class="controls-title">COMANDOS</h2>
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
            <span class="key-cap single">C</span>
          </div>
          <div class="key-info">
            <span class="key-title">Modo Silencioso (Furtividade)</span>
            <span class="key-desc">Segure C para andar em silêncio (os monstros não ouvem seus passos)</span>
          </div>
        </div>

        <div class="control-key-card">
          <div class="keys-display">
            <span class="key-cap single">SHIFT</span>
          </div>
          <div class="key-info">
            <span class="key-title">Correr (Disparada Rápida)</span>
            <span class="key-desc">Segure SHIFT para correr rápido (passos altos alertam monstros)</span>
          </div>
        </div>

        <div class="control-key-card">
          <div class="keys-display">
            <span class="key-cap single">E</span>
          </div>
          <div class="key-info">
            <span class="key-title">Interagir / Investigar</span>
            <span class="key-desc">Pressione E para investigar objetos, alavancas e portas</span>
          </div>
        </div>
      </div>

      <div class="controls-click-hint">
        ▶ Clique na tela ou pressione ESPAÇO para começar
      </div>
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
      <div class="victory-icon-large" id="victoryIconLarge">🐙</div>
      <h2 class="victory-title" id="victoryTitle">🏆 FINAL #4: O RECEPTÁCULO DE CTHULHU</h2>
      <div class="victory-image-wrapper hidden" id="victoryImageWrapper">
        <img class="victory-image" id="victoryImage" src="/assets/cthulhu.png" alt="O Receptáculo de Cthulhu" />
      </div>
      <div class="victory-quote" id="victoryQuote">"A luz do mundo exterior penetra seus olhos uma vez mais..."</div>
      <div class="victory-text" id="victoryText">
        PARABÉNS! Você quebrou os selos arcanos e escapou com vida das profundezas cósmicas!
      </div>
      <div class="victory-buttons">
        <button class="victory-btn primary" id="btnPlayAgain">🔄 Jogar Novamente</button>
        <button class="victory-btn" id="btnVictoryViewEndings">🏆 Coleção de Finais (<span class="endings-counter-val">0/2</span>)</button>
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
        <button class="secret-ending-btn secondary" id="btnSecretViewEndings">🏆 Ver Coleção de Finais (<span class="endings-counter-val">0/2</span>)</button>
        <button class="secret-ending-btn secondary" id="btnSecretMainMenu">🏠 Menu Principal</button>
      </div>
    </div>
  </div>

  <!-- ENDINGS & ACHIEVEMENTS GALLERY MODAL (COLEÇÃO DEMO 2/4) -->
  <div class="endings-modal-overlay hidden" id="endingsModal">
    <div class="endings-modal-card">
      <div class="endings-modal-header">
        <div class="endings-modal-title">🏆 GALERIA DE FINAIS & CONQUISTAS</div>
        <div class="endings-progress-wrapper">
          <div class="endings-progress-text">
            <span>Progresso da Demo:</span>
            <span id="endingsProgressText">0 de 2 Descobertos (0%)</span>
          </div>
          <div class="endings-progress-bg">
            <div class="endings-progress-fill" id="endingsProgressFill"></div>
          </div>
          <div class="endings-demo-subtext">
            🎮 <strong>Versão Demo:</strong> 2 finais disponíveis para alcançar • 4 finais no jogo completo
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
        <button class="menu-btn" id="btnOpenEndingsMenu">🏆 Finais & Conquistas (<span class="endings-counter-val">0/2</span>)</button>
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
const btnCloseControlsEl = document.querySelector('#btnCloseControls');

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
// 4 ENDINGS ACHIEVEMENT & TRACKING SYSTEM (2 DISPONÍVEIS NA DEMO)
// ========================================================
const TOTAL_ENDINGS = 4;
const DEMO_TOTAL_ENDINGS = 2;
const DEMO_AVAILABLE_IDS = [3, 4];

const ENDINGS_DATA = [
  {
    id: 1,
    number: '#1',
    title: 'Desbloqueado só na versão completa',
    desc: 'Este final não pode ser alcançado nesta versão demo. Estará disponível no lançamento da versão completa do jogo!',
    icon: '🚪',
    image: null,
    availableInDemo: false,
  },
  {
    id: 2,
    number: '#2',
    title: 'Desbloqueado só na versão completa',
    desc: 'Este final não pode ser alcançado nesta versão demo. Estará disponível no lançamento da versão completa do jogo!',
    icon: '🕳️',
    image: null,
    availableInDemo: false,
  },
  {
    id: 3,
    number: '#3',
    title: 'Eu sinto que tem alguma coisa de errado com aquele lado',
    desc: 'Seus instintos salvaram a sua vida. Ao pressentir a emboscada na rua escura, você deu meia-volta e retornou em segurança.',
    icon: '🏃‍♂️',
    image: '/ending_pixel_art.jpg',
    availableInDemo: true,
  },
  {
    id: 4,
    number: '#4',
    title: 'O Receptáculo de Cthulhu',
    desc: 'Você se prostrou perante o Cultista Supremo, aceitou o ritual profano e seu corpo tornou-se o novo receptáculo terreno do Grande Cthulhu!',
    icon: '🐙',
    image: '/assets/cthulhu.png',
    availableInDemo: true,
  },
];

function getUnlockedEndings() {
  try {
    const raw = localStorage.getItem('dungeon_unlocked_endings');
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    // Apenas os 2 finais permitidos na Demo podem ser considerados desbloqueados nesta demo!
    const valid = list.filter((id) => DEMO_AVAILABLE_IDS.includes(id));
    if (valid.length !== list.length) {
      localStorage.setItem('dungeon_unlocked_endings', JSON.stringify(valid));
    }
    return valid;
  } catch (e) {
    return [];
  }
}

function unlockEnding(id) {
  if (!DEMO_AVAILABLE_IDS.includes(id)) {
    return;
  }
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
  const countStr = `${count}/${DEMO_TOTAL_ENDINGS}`;

  document.querySelectorAll('.endings-counter-val').forEach((el) => {
    el.textContent = countStr;
  });

  const progressPct = Math.round((count / DEMO_TOTAL_ENDINGS) * 100);
  const endingsProgressTextEl = document.querySelector('#endingsProgressText');
  const endingsProgressFillEl = document.querySelector('#endingsProgressFill');
  if (endingsProgressTextEl) {
    endingsProgressTextEl.textContent = `${count} de ${DEMO_TOTAL_ENDINGS} Descobertos (${progressPct}%)`;
  }
  if (endingsProgressFillEl) {
    endingsProgressFillEl.style.width = `${progressPct}%`;
  }

  const grid = document.querySelector('#endingsGrid');
  if (grid) {
    grid.innerHTML = ENDINGS_DATA.map((ending) => {
      if (!ending.availableInDemo) {
        return `
          <div class="ending-item-card locked demo-locked">
            <div class="ending-card-icon">🔒</div>
            <div class="ending-card-content">
              <div class="ending-card-tag demo-tag">${ending.number} • 🔒 BLOQUEADO NA DEMO</div>
              <div class="ending-card-name">Desbloqueado só na versão completa</div>
              <div class="ending-card-desc">Este final não pode ser alcançado nesta versão demo. Estará disponível no lançamento da versão completa do jogo!</div>
            </div>
          </div>
        `;
      }

      const isUnlocked = unlocked.includes(ending.id);
      return `
        <div class="ending-item-card ${isUnlocked ? 'unlocked' : 'locked'}">
          <div class="ending-card-icon">${isUnlocked ? ending.icon : '🔒'}</div>
          <div class="ending-card-content">
            <div class="ending-card-tag ${isUnlocked ? '' : 'demo-avail'}">
              ${ending.number} • ${isUnlocked ? '✓ DESBLOQUEADO' : 'DISPONÍVEL NA DEMO'}
            </div>
            <div class="ending-card-name">
              ${isUnlocked ? ending.title : '??? (Não Descoberto)'}
              <span class="badge-demo-version">Demo</span>
            </div>
            <div class="ending-card-desc">
              ${isUnlocked ? ending.desc : 'Explore os cenários e tome diferentes decisões para descobrir este final da demo.'}
            </div>
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
// MONÓLITO ANCESTRAL: PLACA DE PEDRA (MODAL DE DICA)
// ========================================================
const stonePlaqueModalEl = document.querySelector('#stonePlaqueModal');
const stonePlaqueTextEl = document.querySelector('#stonePlaqueText');
const btnCloseStonePlaqueEl = document.querySelector('#btnCloseStonePlaque');

function openStonePlaqueModal(poemText) {
  if (!stonePlaqueModalEl) return;
  playSound('pickup');
  if (stonePlaqueTextEl) {
    stonePlaqueTextEl.innerHTML = '';
    const lines = (poemText || '').split('\n').map((l) => l.trim()).filter((l) => l.length > 0);

    const poemBlock = document.createElement('div');
    poemBlock.className = 'stone-plaque-poem-block';

    lines.forEach((line) => {
      const p = document.createElement('p');
      if (line.includes('📜')) {
        p.className = 'stone-poem-title';
      } else if (line.includes('Decifre')) {
        p.className = 'stone-poem-subtitle';
      } else if (line.includes('⚠️')) {
        p.className = 'stone-poem-warning';
      } else {
        p.className = 'stone-poem-line';
      }
      p.textContent = line;
      poemBlock.appendChild(p);
    });

    stonePlaqueTextEl.appendChild(poemBlock);
  }
  stonePlaqueModalEl.classList.remove('hidden');
}

function closeStonePlaqueModal() {
  if (!stonePlaqueModalEl) return;
  stonePlaqueModalEl.classList.add('hidden');
}

if (btnCloseStonePlaqueEl) {
  btnCloseStonePlaqueEl.addEventListener('click', closeStonePlaqueModal);
}
if (stonePlaqueModalEl) {
  stonePlaqueModalEl.addEventListener('click', (e) => {
    if (e.target === stonePlaqueModalEl) closeStonePlaqueModal();
  });
}

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
const btnSkipRelicEl = document.querySelector('#btnSkipRelic');

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
  // Dark eldritch volcanic basalt slab background
  ctx.fillStyle = '#2b2320';
  ctx.fillRect(0, 0, 256, 256);

  // Tablet border and deep perimeter relief carving (around outer rim only)
  ctx.strokeStyle = '#181210';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, 250, 250);

  // Weathered volcanic rock speckles and organic grain
  for (let i = 0; i < 450; i++) {
    ctx.fillStyle = i % 3 === 0 ? '#1a1412' : i % 3 === 1 ? '#3d322d' : '#4e3f38';
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 1.8, 1.8);
  }

  // 1. DRAGON / GARGOYLE WINGS (Left & Right Flanks)
  ctx.fillStyle = '#1c1512';
  ctx.strokeStyle = '#120d0b';
  ctx.lineWidth = 2;

  // Left Wing: Sharp skeletal crests & webbed membrane
  ctx.beginPath();
  ctx.moveTo(85, 105);
  ctx.quadraticCurveTo(50, 48, 15, 25); // Top wing tip
  ctx.quadraticCurveTo(32, 60, 20, 90);  // Upper claw finger
  ctx.quadraticCurveTo(40, 100, 24, 130); // Lower claw finger
  ctx.quadraticCurveTo(55, 132, 82, 128); // Wing base
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Left Wing Membrane Ribs
  ctx.beginPath();
  ctx.moveTo(15, 25);
  ctx.quadraticCurveTo(45, 75, 82, 115);
  ctx.moveTo(20, 90);
  ctx.quadraticCurveTo(50, 105, 82, 120);
  ctx.stroke();

  // Right Wing: Sharp skeletal crests & webbed membrane
  ctx.beginPath();
  ctx.moveTo(171, 105);
  ctx.quadraticCurveTo(206, 48, 241, 25); // Top wing tip
  ctx.quadraticCurveTo(224, 60, 236, 90);  // Upper claw finger
  ctx.quadraticCurveTo(216, 100, 232, 130); // Lower claw finger
  ctx.quadraticCurveTo(201, 132, 174, 128); // Wing base
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Right Wing Membrane Ribs
  ctx.beginPath();
  ctx.moveTo(241, 25);
  ctx.quadraticCurveTo(211, 75, 174, 115);
  ctx.moveTo(236, 90);
  ctx.quadraticCurveTo(206, 105, 174, 120);
  ctx.stroke();

  // 2. PETRIFIED CHITIN THORAX & SHOULDER PLATES
  ctx.fillStyle = '#211815';
  ctx.beginPath();
  ctx.moveTo(90, 110);
  ctx.lineTo(166, 110);
  ctx.lineTo(156, 155);
  ctx.lineTo(100, 155);
  ctx.closePath();
  ctx.fill();

  // 3. HORNS & BROW RIDGES
  ctx.fillStyle = '#17100e';
  // Left demonic horn curving upward-outward
  ctx.beginPath();
  ctx.moveTo(92, 68);
  ctx.quadraticCurveTo(60, 48, 48, 28);
  ctx.quadraticCurveTo(68, 52, 96, 60);
  ctx.closePath();
  ctx.fill();

  // Right demonic horn curving upward-outward
  ctx.beginPath();
  ctx.moveTo(164, 68);
  ctx.quadraticCurveTo(196, 48, 208, 28);
  ctx.quadraticCurveTo(188, 52, 160, 60);
  ctx.closePath();
  ctx.fill();

  // 4. ELDRITCH CEPHALOPOD CRANIUM / BULBOUS HEAD
  ctx.fillStyle = '#201614';
  ctx.beginPath();
  ctx.ellipse(128, 72, 48, 42, 0, 0, Math.PI * 2);
  ctx.fill();

  // Skull ridges / carved segments
  ctx.strokeStyle = '#120d0b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(128, 30);
  ctx.lineTo(128, 85);
  ctx.moveTo(112, 34);
  ctx.quadraticCurveTo(106, 55, 114, 76);
  ctx.moveTo(144, 34);
  ctx.quadraticCurveTo(150, 55, 142, 76);
  ctx.stroke();

  // 5. SINISTER FIERCE SLITTED EYES (TERRIFYING CTHULHU GLOW)
  // Eye sockets (deep carved shadows)
  ctx.fillStyle = '#0a0605';
  ctx.beginPath();
  ctx.ellipse(107, 78, 14, 8, -0.22, 0, Math.PI * 2);
  ctx.ellipse(149, 78, 14, 8, 0.22, 0, Math.PI * 2);
  ctx.fill();

  // Sinister Outer Eye Embers (Fiery Crimson Aura)
  ctx.fillStyle = '#ff1744';
  ctx.beginPath();
  ctx.ellipse(107, 78, 10, 5.5, -0.22, 0, Math.PI * 2);
  ctx.ellipse(149, 78, 10, 5.5, 0.22, 0, Math.PI * 2);
  ctx.fill();

  // Burning Amber / Golden Iris
  ctx.fillStyle = '#ffea00';
  ctx.beginPath();
  ctx.ellipse(107, 78, 6.5, 3.8, -0.22, 0, Math.PI * 2);
  ctx.ellipse(149, 78, 6.5, 3.8, 0.22, 0, Math.PI * 2);
  ctx.fill();

  // Predatory Vertical Slit Pupils
  ctx.fillStyle = '#0a0505';
  ctx.beginPath();
  ctx.ellipse(107, 78, 2.2, 5.2, -0.22, 0, Math.PI * 2);
  ctx.ellipse(149, 78, 2.2, 5.2, 0.22, 0, Math.PI * 2);
  ctx.fill();

  // Auxiliary Temple Eyes (Cosmic Eldritch Multiplicity)
  ctx.fillStyle = '#d50000';
  ctx.beginPath();
  ctx.ellipse(88, 68, 5, 3, -0.3, 0, Math.PI * 2);
  ctx.ellipse(168, 68, 5, 3, 0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffab00';
  ctx.beginPath();
  ctx.arc(88, 68, 1.6, 0, Math.PI * 2);
  ctx.arc(168, 68, 1.6, 0, Math.PI * 2);
  ctx.fill();

  // 6. WRITHING BEARD OF 8 THICK MENACING TENTACLES
  const tentacleDefs = [
    // Outer Left: coiling outward towards lower edge
    { sx: 104, sy: 104, c1x: 55, c1y: 135, c2x: 35, c2y: 190, ex: 38, ey: 242, w: 12 },
    // Mid-Left Outer: coiling down-left
    { sx: 112, sy: 108, c1x: 75, c1y: 155, c2x: 65, c2y: 205, ex: 74, ey: 248, w: 11 },
    // Mid-Left Inner: coiling center-left
    { sx: 120, sy: 112, c1x: 95, c1y: 165, c2x: 105, c2y: 215, ex: 102, ey: 250, w: 10 },
    // Center Left: twisting down
    { sx: 125, sy: 116, c1x: 114, c1y: 175, c2x: 120, c2y: 220, ex: 116, ey: 252, w: 9 },
    // Center Right: twisting down
    { sx: 131, sy: 116, c1x: 142, c1y: 175, c2x: 136, c2y: 220, ex: 140, ey: 252, w: 9 },
    // Mid-Right Inner: coiling center-right
    { sx: 136, sy: 112, c1x: 161, c1y: 165, c2x: 151, c2y: 215, ex: 154, ey: 250, w: 10 },
    // Mid-Right Outer: coiling down-right
    { sx: 144, sy: 108, c1x: 181, c1y: 155, c2x: 191, c2y: 205, ex: 182, ey: 248, w: 11 },
    // Outer Right: coiling outward towards lower edge
    { sx: 152, sy: 104, c1x: 201, c1y: 135, c2x: 221, c2y: 190, ex: 218, ey: 242, w: 12 },
  ];

  tentacleDefs.forEach((t) => {
    // Dark tentacle flesh
    ctx.strokeStyle = '#1b1311';
    ctx.lineWidth = t.w;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(t.sx, t.sy);
    ctx.bezierCurveTo(t.c1x, t.c1y, t.c2x, t.c2y, t.ex, t.ey);
    ctx.stroke();

    // Inner ridge highlight
    ctx.strokeStyle = '#2b1f1b';
    ctx.lineWidth = t.w * 0.45;
    ctx.beginPath();
    ctx.moveTo(t.sx, t.sy);
    ctx.bezierCurveTo(t.c1x, t.c1y, t.c2x, t.c2y, t.ex, t.ey);
    ctx.stroke();

    // Sucker nodes along tentacle curve
    [0.35, 0.62, 0.85].forEach((pct) => {
      // Approximate point on bezier curve
      const bx = (1 - pct) * (1 - pct) * t.sx + 2 * (1 - pct) * pct * t.c1x + pct * pct * t.ex;
      const by = (1 - pct) * (1 - pct) * t.sy + 2 * (1 - pct) * pct * t.c1y + pct * pct * t.ey;
      ctx.fillStyle = '#422f28';
      ctx.beginPath();
      ctx.arc(bx + 3, by, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#140c0a';
      ctx.beginPath();
      ctx.arc(bx + 3, by, 1.2, 0, Math.PI * 2);
      ctx.fill();
    });
  });
}
drawMasterRelic();

// Render corner target preview
if (relicPreviewCanvasEl) {
  const pctx = relicPreviewCanvasEl.getContext('2d');
  pctx.drawImage(masterRelicCanvas, 0, 0, 72, 72);
}

// 4x4 Grid 15-Puzzle Sliding Board (15 stone blocks + 1 empty slot)
// Solved state: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, -1]
let relicTiles = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, -1];

function getEmptyRelicIndex() {
  return relicTiles.indexOf(-1);
}

function isRelicAdjacent(idx1, idx2) {
  if (idx1 < 0 || idx2 < 0) return false;
  const r1 = Math.floor(idx1 / 4);
  const c1 = idx1 % 4;
  const r2 = Math.floor(idx2 / 4);
  const c2 = idx2 % 4;
  return (Math.abs(r1 - r2) === 1 && c1 === c2) || (Math.abs(c1 - c2) === 1 && r1 === r2);
}

function getRelicNeighbors(idx) {
  const neighbors = [];
  const r = Math.floor(idx / 4);
  const c = idx % 4;
  if (r > 0) neighbors.push(idx - 4);
  if (r < 3) neighbors.push(idx + 4);
  if (c > 0) neighbors.push(idx - 1);
  if (c < 3) neighbors.push(idx + 1);
  return neighbors;
}

function scrambleRelicTiles() {
  // Always begin from solved state to guarantee 100% mathematical solvability
  relicTiles = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, -1];
  let emptyIdx = 15;
  let lastMove = -1;

  // Perform 70 random valid sliding moves
  for (let i = 0; i < 70; i++) {
    const validNeighbors = getRelicNeighbors(emptyIdx).filter((n) => n !== lastMove);
    const chosen = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
    relicTiles[emptyIdx] = relicTiles[chosen];
    relicTiles[chosen] = -1;
    lastMove = emptyIdx;
    emptyIdx = chosen;
  }

  // Ensure it didn't accidentally stay solved
  if (relicTiles[15] === -1 && relicTiles.slice(0, 15).every((v, i) => v === i)) {
    const neighbors = getRelicNeighbors(15);
    const chosen = neighbors[0];
    relicTiles[15] = relicTiles[chosen];
    relicTiles[chosen] = -1;
  }

  if (relicStatusTextEl) {
    relicStatusTextEl.textContent = 'Deslize as peças de pedra para o espaço vazio para reconstituir o fóssil de Cthulhu!';
    relicStatusTextEl.style.color = '#ffd54f';
  }
  renderRelicBoard();
}

function moveRelicTile(tileIndex) {
  if (questState.relicPuzzleSolved) return;
  const emptyIdx = getEmptyRelicIndex();
  if (isRelicAdjacent(tileIndex, emptyIdx)) {
    relicTiles[emptyIdx] = relicTiles[tileIndex];
    relicTiles[tileIndex] = -1;
    playSound('switch');
    renderRelicBoard();
    checkRelicPuzzleWin();
  }
}

function renderRelicBoard() {
  if (!relicGridBoardEl) return;
  relicGridBoardEl.innerHTML = '';

  const emptyIdx = getEmptyRelicIndex();

  relicTiles.forEach((tileValue, gridIndex) => {
    const slotEl = document.createElement('div');
    slotEl.className = 'relic-tile-slot';

    if (tileValue === -1) {
      if (questState.relicPuzzleSolved) {
        // Quando resolvido, desenha a 16ª peça para exibir a imagem 100% completa
        const tileCanvas = document.createElement('canvas');
        tileCanvas.className = 'relic-tile-canvas';
        tileCanvas.width = 64;
        tileCanvas.height = 64;
        const tctx = tileCanvas.getContext('2d');
        tctx.drawImage(masterRelicCanvas, 3 * 64, 3 * 64, 64, 64, 0, 0, 64, 64);
        tctx.strokeStyle = '#221916';
        tctx.lineWidth = 1.5;
        tctx.strokeRect(0, 0, 64, 64);
        slotEl.appendChild(tileCanvas);
      } else {
        // Espaço vazio para onde os blocos deslizam
        slotEl.classList.add('relic-empty-slot');
        slotEl.title = 'Espaço vazio (arraste ou clique em um bloco adjacente para deslizar)';

        // Suporte para soltar bloco arrastado no espaço vazio
        slotEl.addEventListener('dragover', (e) => {
          e.preventDefault();
          slotEl.classList.add('drag-over');
        });
        slotEl.addEventListener('dragleave', () => {
          slotEl.classList.remove('drag-over');
        });
        slotEl.addEventListener('drop', (e) => {
          e.preventDefault();
          slotEl.classList.remove('drag-over');
          const draggedIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
          if (!isNaN(draggedIdx) && isRelicAdjacent(draggedIdx, gridIndex)) {
            moveRelicTile(draggedIdx);
          }
        });
      }
    } else {
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

      tctx.strokeStyle = '#221916';
      tctx.lineWidth = 1.5;
      tctx.strokeRect(0, 0, 64, 64);

      slotEl.appendChild(tileCanvas);

      // Se adjacente ao espaço vazio, permite deslizar por clique ou arrasto
      if (!questState.relicPuzzleSolved && isRelicAdjacent(gridIndex, emptyIdx)) {
        slotEl.classList.add('relic-can-move');
        slotEl.setAttribute('draggable', 'true');
        slotEl.title = 'Clique ou arraste para deslizar no espaço vazio!';

        slotEl.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', String(gridIndex));
        });

        slotEl.addEventListener('click', () => {
          moveRelicTile(gridIndex);
        });
      }
    }

    relicGridBoardEl.appendChild(slotEl);
  });
}

function checkRelicPuzzleWin() {
  const isComplete =
    relicTiles[15] === -1 && relicTiles.slice(0, 15).every((val, idx) => val === idx);

  if (isComplete) {
    questState.relicPuzzleSolved = true;
    renderRelicBoard(); // Revela a imagem completa com a última peça
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
        '🏛️ Com a relíquia de Cthulhu reconstituída perfeitamente, a Balista Rúnica estremece de poder! Vá até ela para disparar contra os 4 Alvos sobre o abismo de lava!'
      );
    }, 1200);
    return true;
  }
  return false;
}

btnSolveRelicEl.addEventListener('click', () => {
  // Encaixar Selo: alinha todas as peças e consagra o fóssil de Cthulhu
  relicTiles = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, -1];
  checkRelicPuzzleWin();
});

if (btnScrambleRelicEl) {
  btnScrambleRelicEl.addEventListener('click', scrambleRelicTiles);
}

if (btnSkipRelicEl) {
  btnSkipRelicEl.addEventListener('click', () => {
    relicTiles = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, -1];
    checkRelicPuzzleWin();
  });
}

btnCloseRelicModalEl.addEventListener('click', () => {
  relicModalEl.classList.add('hidden');
});

// ========================================================
// ========================================================
// ATO 3 PUZZLE 2: BALISTA RÚNICA - QUICK TIME EVENT (QTE)
// Mecânica de Círculo Aproximador (Approach Ring) com Teclas Aleatórias
// ========================================================
const QTE_KEY_POOL = [
  { key: 'q', code: 'KeyQ', display: 'Q' },
  { key: 'e', code: 'KeyE', display: 'E' },
  { key: 'r', code: 'KeyR', display: 'R' },
  { key: 'f', code: 'KeyF', display: 'F' },
  { key: ' ', code: 'Space', display: 'ESPAÇO' },
  { key: 'w', code: 'KeyW', display: 'W' },
  { key: 'a', code: 'KeyA', display: 'A' },
  { key: 's', code: 'KeyS', display: 'S' },
  { key: 'd', code: 'KeyD', display: 'D' },
];

const QTE_TARGET_STEPS = [
  { id: 1, name: '1º ALVO: PILAR DO FOGO', symbol: '🔥', color: '#ff5722', duration: 2300 },
  { id: 2, name: '2º ALVO: PULSO DE SANGUE', symbol: '🩸', color: '#ff1744', duration: 2150 },
  { id: 3, name: '3º ALVO: CONDUTOR DE RAIO', symbol: '⚡', color: '#00e5ff', duration: 2000 },
  { id: 4, name: 'DISPARO FINAL: OLHO DO VAZIO!', symbol: '👁️', color: '#76ff03', duration: 1900 },
];

let qteCurrentIndex = 0;
let qteActive = false;
let qteCanInput = false;
let qteTimerRaf = null;
let qteStartTime = 0;
let qteMaxDuration = 2200;
let currentQteKey = QTE_KEY_POOL[0];
let currentRingScale = 2.8;
let lastKeyDisplay = '';

function updateQteUI() {
  for (let i = 0; i < QTE_TARGET_STEPS.length; i++) {
    const dot = document.querySelector(`#tdot${i}`);
    if (dot) {
      if (i < qteCurrentIndex) dot.classList.add('active');
      else dot.classList.remove('active');
    }
  }

  if (targetProgressTextEl) {
    targetProgressTextEl.textContent = `(${qteCurrentIndex} / ${QTE_TARGET_STEPS.length})`;
  }
}

function openQteModal() {
  targetModalEl.classList.remove('hidden');
  qteActive = false;
  qteCanInput = false;
  qteCurrentIndex = 0;
  if (qteTimerRaf) cancelAnimationFrame(qteTimerRaf);
  updateQteUI();

  if (btnStartQteEl) {
    btnStartQteEl.style.display = 'inline-block';
    btnStartQteEl.textContent = '🏹 Iniciar Disparos (QTE)';
  }
  if (btnResetTargetsEl) btnResetTargetsEl.style.display = 'none';

  if (targetFeedbackTextEl) {
    targetFeedbackTextEl.textContent = 'Pressione [INICIAR DISPAROS] ou tecle [ESPAÇO] para começar!';
    targetFeedbackTextEl.style.color = '#ffe0b2';
  }

  const qteTargetNameEl = document.querySelector('#qteTargetName');
  const qteTargetIconEl = document.querySelector('#qteTargetIcon');
  const qteKeyLetterEl = document.querySelector('#qteKeyLetter');
  const qtePulseRingEl = document.querySelector('#qtePulseRing');
  const qteKeyBtnEl = document.querySelector('#qteKeyBtn');

  if (qteTargetNameEl) {
    qteTargetNameEl.textContent = 'PRONTO PARA MIRAR?';
    qteTargetNameEl.style.color = '#ff9100';
  }
  if (qteTargetIconEl) qteTargetIconEl.textContent = '🎯';
  if (qteKeyLetterEl) {
    qteKeyLetterEl.textContent = '▶';
    qteKeyLetterEl.style.color = '#ff7043';
  }
  if (qtePulseRingEl) {
    qtePulseRingEl.classList.add('idle');
    qtePulseRingEl.classList.remove('sweet-spot');
    qtePulseRingEl.style.transform = 'scale(1.0)';
    qtePulseRingEl.style.borderColor = '#ff7043';
  }
  if (qteKeyBtnEl) {
    qteKeyBtnEl.classList.remove('sweet-spot', 'hit-success', 'miss-error');
    qteKeyBtnEl.style.borderColor = '#ff7043';
  }
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
  if (qteCurrentIndex >= QTE_TARGET_STEPS.length) {
    onQteCompleteSuccess();
    return;
  }

  const step = QTE_TARGET_STEPS[qteCurrentIndex];
  qteCanInput = true;
  qteMaxDuration = step.duration;
  qteStartTime = performance.now();

  // Sorteia tecla aleatória para cada disparo
  const availableKeys = QTE_KEY_POOL.filter((k) => k.display !== lastKeyDisplay);
  currentQteKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];
  lastKeyDisplay = currentQteKey.display;

  const qteTargetIconEl = document.querySelector('#qteTargetIcon');
  const qteTargetNameEl = document.querySelector('#qteTargetName');
  const qteKeyLetterEl = document.querySelector('#qteKeyLetter');
  const qteKeyBtnEl = document.querySelector('#qteKeyBtn');
  const qtePulseRingEl = document.querySelector('#qtePulseRing');

  if (qteTargetIconEl) qteTargetIconEl.textContent = step.symbol;
  if (qteTargetNameEl) {
    qteTargetNameEl.textContent = `${qteCurrentIndex + 1}/${QTE_TARGET_STEPS.length} - ${step.name}`;
    qteTargetNameEl.style.color = step.color;
  }
  if (qteKeyLetterEl) {
    qteKeyLetterEl.textContent = currentQteKey.display;
    qteKeyLetterEl.style.color = step.color;
  }
  if (qteKeyBtnEl) {
    qteKeyBtnEl.classList.remove('sweet-spot', 'hit-success', 'miss-error');
    qteKeyBtnEl.style.borderColor = step.color;
  }
  if (qtePulseRingEl) {
    qtePulseRingEl.classList.remove('idle', 'sweet-spot');
    qtePulseRingEl.style.borderColor = step.color;
    qtePulseRingEl.style.transform = 'scale(2.8)';
  }

  if (targetFeedbackTextEl) {
    targetFeedbackTextEl.textContent = `⚡ Pressione [${currentQteKey.display}] quando o anel externo encostar no círculo!`;
    targetFeedbackTextEl.style.color = '#ffe0b2';
  }

  runQteTimerLoop();
}

function runQteTimerLoop() {
  if (qteTimerRaf) cancelAnimationFrame(qteTimerRaf);

  function tick(now) {
    if (!qteActive || !qteCanInput) return;

    const elapsed = now - qteStartTime;
    const progress = Math.min(1.0, elapsed / qteMaxDuration);

    // O anel externo começa em scale 2.8 e encolhe até 0.8
    currentRingScale = 2.8 - progress * 2.0;

    const qtePulseRingEl = document.querySelector('#qtePulseRing');
    const qteKeyBtnEl = document.querySelector('#qteKeyBtn');

    if (qtePulseRingEl) {
      qtePulseRingEl.style.transform = `scale(${currentRingScale})`;

      // Zona de acerto perfeito (sweet spot): anel externo coincidindo com o círculo do botão
      const inSweetSpot = currentRingScale >= 0.82 && currentRingScale <= 1.25;
      if (inSweetSpot) {
        qtePulseRingEl.classList.add('sweet-spot');
        if (qteKeyBtnEl) qteKeyBtnEl.classList.add('sweet-spot');
      } else {
        qtePulseRingEl.classList.remove('sweet-spot');
        if (qteKeyBtnEl) qteKeyBtnEl.classList.remove('sweet-spot');
      }
    }

    if (elapsed >= qteMaxDuration) {
      onQteMissError('timeout');
      return;
    }

    qteTimerRaf = requestAnimationFrame(tick);
  }

  qteTimerRaf = requestAnimationFrame(tick);
}

function handleQteInput(inputKey, inputCode = '', isMouseClick = false) {
  if (!qteActive || !qteCanInput) return;

  // Validação da tecla (se foi clique com o mouse no botão, consideramos a tecla correta)
  if (!isMouseClick) {
    const pressedKey = (inputKey || '').toLowerCase();
    const pressedCode = (inputCode || '').toLowerCase();

    const isMatch =
      currentQteKey.key === ' '
        ? pressedKey === ' ' || pressedKey === 'space' || pressedCode === 'space'
        : pressedKey === currentQteKey.key.toLowerCase() ||
        pressedCode === `key${currentQteKey.key.toLowerCase()}`;

    if (!isMatch) {
      onQteMissError('wrong_key');
      return;
    }
  }

  // Validação do timing do círculo que encolhe (deve acertar quando os anéis se encontram!)
  if (currentRingScale > 1.25) {
    onQteMissError('too_early');
    return;
  }
  if (currentRingScale < 0.82) {
    onQteMissError('too_late');
    return;
  }

  // Acerto perfeito no alinhamento dos círculos!
  onQteHitSuccess();
}

function onQteHitSuccess() {
  qteCanInput = false;
  if (qteTimerRaf) cancelAnimationFrame(qteTimerRaf);

  playSound('pickup');
  const step = QTE_TARGET_STEPS[qteCurrentIndex];

  // Acerta o alvo 3D respectivo
  if (act3Env && act3Env.targets) {
    const tIdx = qteCurrentIndex % act3Env.targets.length;
    const targetObj = act3Env.targets[tIdx];
    if (targetObj) {
      targetObj.hit = true;
      if (targetObj.orb) targetObj.orb.material.emissiveIntensity = 3.5;
      if (targetObj.light) targetObj.light.intensity = 4.5;
    }
  }

  const qteKeyBtnEl = document.querySelector('#qteKeyBtn');
  if (qteKeyBtnEl) {
    qteKeyBtnEl.classList.remove('sweet-spot');
    qteKeyBtnEl.classList.add('hit-success');
    setTimeout(() => qteKeyBtnEl.classList.remove('hit-success'), 400);
  }

  if (targetFeedbackTextEl) {
    targetFeedbackTextEl.textContent = `🎯 ACERTO PERFEITO! ${step.name} destruído!`;
    targetFeedbackTextEl.style.color = '#00e676';
  }

  qteCurrentIndex++;
  updateQteUI();

  if (qteCurrentIndex >= QTE_TARGET_STEPS.length) {
    setTimeout(onQteCompleteSuccess, 500);
  } else {
    setTimeout(promptNextQteTarget, 550);
  }
}

function onQteMissError(reason = 'wrong_key') {
  qteCanInput = false;
  qteActive = false;
  if (qteTimerRaf) cancelAnimationFrame(qteTimerRaf);
  playSound('hit');

  // Dano leve de coice (5 HP)
  const damageTaken = 5;
  player.hp = Math.max(1, player.hp - damageTaken);
  updateHUD();

  const qteKeyBtnEl = document.querySelector('#qteKeyBtn');
  const qtePulseRingEl = document.querySelector('#qtePulseRing');
  if (qteKeyBtnEl) {
    qteKeyBtnEl.classList.remove('sweet-spot');
    qteKeyBtnEl.classList.add('miss-error');
    setTimeout(() => qteKeyBtnEl.classList.remove('miss-error'), 450);
  }
  if (qtePulseRingEl) {
    qtePulseRingEl.classList.remove('sweet-spot');
    qtePulseRingEl.classList.add('idle');
  }

  if (targetFeedbackTextEl) {
    if (reason === 'too_early') {
      targetFeedbackTextEl.textContent = `⚠️ MUITO CEDO! Espere o anel externo encostar no círculo do botão!`;
    } else if (reason === 'too_late') {
      targetFeedbackTextEl.textContent = `⏱️ TARDE DEMAIS! O anel já havia encolhido demais!`;
    } else if (reason === 'timeout') {
      targetFeedbackTextEl.textContent = `⏱️ TEMPO ESGOTADO! O anel fechou antes do disparo!`;
    } else {
      targetFeedbackTextEl.textContent = `❌ TECLA INCORRETA! Era a tecla [${currentQteKey.display}]!`;
    }
    targetFeedbackTextEl.style.color = '#ff1744';
  }

  if (btnStartQteEl) btnStartQteEl.style.display = 'none';
  if (btnResetTargetsEl) {
    btnResetTargetsEl.style.display = 'inline-block';
    btnResetTargetsEl.textContent = '🔄 Tentar Novamente';
  }
}

function onQteCompleteSuccess() {
  qteActive = false;
  qteCanInput = false;
  questState.targetPuzzleSolved = true;
  playSound('gate_unlock');
  playSound('victory');

  if (targetFeedbackTextEl) {
    targetFeedbackTextEl.textContent = '🌟 TODOS OS 4 ALVOS DESTRUÍDOS! A PONTE DE BASALTO EMERGIU DA LAVA!';
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
    if (!qteActive) {
      startQteSequence();
      return;
    }
    if (qteCanInput && qteCurrentIndex < QTE_TARGET_STEPS.length) {
      handleQteInput('', '', true);
    }
  });
}

btnCloseTargetModalEl.addEventListener('click', () => {
  qteActive = false;
  qteCanInput = false;
  if (qteTimerRaf) cancelAnimationFrame(qteTimerRaf);
  targetModalEl.classList.add('hidden');
});

const btnSkipQteEl = document.querySelector('#btnSkipQte');
if (btnSkipQteEl) {
  btnSkipQteEl.addEventListener('click', () => {
    if (qteTimerRaf) cancelAnimationFrame(qteTimerRaf);
    qteActive = false;
    qteCanInput = false;
    qteCurrentIndex = QTE_TARGET_STEPS.length;
    if (act3Env && act3Env.targets) {
      act3Env.targets.forEach((t) => {
        t.hit = true;
        if (t.orb) t.orb.material.emissiveIntensity = 3.0;
        if (t.light) t.light.intensity = 4.0;
      });
    }
    for (let i = 0; i < QTE_TARGET_STEPS.length; i++) {
      const dot = document.querySelector(`#tdot${i}`);
      if (dot) dot.classList.add('active');
    }
    if (targetProgressTextEl) targetProgressTextEl.textContent = `(${QTE_TARGET_STEPS.length} / ${QTE_TARGET_STEPS.length})`;
    onQteCompleteSuccess();
  });
}

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
    logarithmicDepthBuffer: true,
  });
} catch (e) {
  console.warn('Falha ao criar WebGLRenderer, usando fallback:', e);
  renderer = new THREE.WebGLRenderer({ antialias: false, logarithmicDepthBuffer: true });
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
  0.5,
  160
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
  terminalBits: [0, 0, 0, 0, 0, 0, 0],
  targetDecimal: 75,
  binaryEnigma: null,
  colorSequence: [],
  safeDials: [0, 0, 0],
  relicPuzzleSolved: false,
  targetPuzzleSolved: false,
};

function rollBinaryEnigma() {
  const symA = 'ᚱ'; // Runa Solar
  const symB = 'ᛉ'; // Runa Lunar
  const symC = 'ᛏ'; // Runa Sombria

  let attempts = 0;
  let chosen = null;

  while (attempts++ < 1000) {
    const a = Math.floor(Math.random() * 6) + 4; // 4 a 9
    const b = Math.floor(Math.random() * 8) + 5; // 5 a 12
    const c = Math.floor(Math.random() * 6) + 3; // 3 a 8

    // Pista 1 (descobre o valor de A)
    const eq1Types = [
      { text: `${symA} + ${symA}`, res: a + a },
      { text: `${symA} + ${symA} + ${symA}`, res: a * 3 },
      { text: `${symA} × ${symA}`, res: a * a },
    ];
    const eq1 = eq1Types[Math.floor(Math.random() * eq1Types.length)];

    // Pista 2 (usa A para descobrir B)
    const eq2Types = [
      { text: `${symA} + ${symB}`, res: a + b },
      { text: `${symA} × ${symB}`, res: a * b },
    ];
    if (b > a) {
      eq2Types.push({ text: `${symB} − ${symA}`, res: b - a });
    }
    const eq2 = eq2Types[Math.floor(Math.random() * eq2Types.length)];

    // Pista 3 (usa B ou A para descobrir C)
    const eq3Types = [
      { text: `${symB} + ${symC}`, res: b + c },
      { text: `${symA} + ${symC}`, res: a + c },
      { text: `${symA} × ${symC}`, res: a * c },
    ];
    if (b > c) {
      eq3Types.push({ text: `${symB} − ${symC}`, res: b - c });
    }
    const eq3 = eq3Types[Math.floor(Math.random() * eq3Types.length)];

    // Fórmulas para calcular a Frequência Alvo (7 bits: pesos 64, 32, 16, 8, 4, 2, 1)
    const formulaOptions = [
      { formula: `( ${symA} × ${symB} ) + ${symC}`, val: (a * b) + c },
      { formula: `( ${symA} × ${symB} ) − ${symC}`, val: (a * b) - c },
      { formula: `( ${symA} + ${symB} ) × ${symC}`, val: (a + b) * c },
      { formula: `( ${symB} × ${symC} ) + ( ${symA} × 2 )`, val: (b * c) + (a * 2) },
      { formula: `( ${symA} × ${symC} ) + ${symB}`, val: (a * c) + b },
      { formula: `( ${symA} × ${symB} ) + ( ${symC} × ${symC} )`, val: (a * b) + (c * c) },
    ];
    if (b > c) {
      formulaOptions.push({ formula: `( ${symB} − ${symC} ) × ( ${symA} + 2 )`, val: (b - c) * (a + 2) });
    }

    const form = formulaOptions[Math.floor(Math.random() * formulaOptions.length)];
    const target = form.val;

    // Alvo entre 20 e 118 com 2 a 5 bits ativos
    if (target >= 20 && target <= 118) {
      const bitCount = target.toString(2).split('1').length - 1;
      if (bitCount >= 2 && bitCount <= 5) {
        chosen = {
          targetDecimal: target,
          a, b, c,
          equations: [
            { expr: eq1.text, val: eq1.res, label: 'Inscrição I' },
            { expr: eq2.text, val: eq2.res, label: 'Inscrição II' },
            { expr: eq3.text, val: eq3.res, label: 'Inscrição III' },
          ],
          formulaText: form.formula,
        };
        break;
      }
    }
  }

  if (!chosen) {
    chosen = {
      targetDecimal: 75,
      a: 6, b: 9, c: 5,
      equations: [
        { expr: `${symA} + ${symA}`, val: 12, label: 'Inscrição I' },
        { expr: `${symA} + ${symB}`, val: 15, label: 'Inscrição II' },
        { expr: `${symB} − ${symC}`, val: 4, label: 'Inscrição III' },
      ],
      formulaText: `( ${symA} + ${symB} ) × ${symC}`,
    };
  }

  questState.targetDecimal = chosen.targetDecimal;
  questState.binaryEnigma = chosen;

  if (dungeonEnv && dungeonEnv.updateTerminalBoard) {
    dungeonEnv.updateTerminalBoard(questState.binaryEnigma);
  }
}
rollBinaryEnigma();

function updateHUD() {
  if (currentAct === 2 || currentAct === 3) {
    dungeonHudEl.classList.remove('hidden');
    healthValueEl.textContent = `${Math.round(player.hp)} / ${player.maxHp}`;
    const pct = Math.max(0, (player.hp / player.maxHp) * 100);
    healthBarFillEl.style.width = `${pct}%`;

    if (player.isSneaking && player.moving) {
      stealthStatusEl.className = 'stealth-status silent';
      stealthStatusEl.textContent = 'FURTIVO (SILENCIOSO)';
    } else if (player.moving) {
      stealthStatusEl.className = 'stealth-status walking';
      stealthStatusEl.textContent = 'PASSOS NORMAIS (AUDÍVEL)';
    } else {
      stealthStatusEl.className = 'stealth-status silent';
      stealthStatusEl.textContent = 'PARADO (SILENCIOSO)';
    }

    const titleEl = document.querySelector('.hud-inventory-title');
    if (currentAct === 3) {
      if (titleEl) titleEl.textContent = 'OBJETIVOS DO ABISMO DE LAVA';
      if (questState.relicPuzzleSolved) {
        slotBronzeKeyEl.classList.add('acquired');
        slotBronzeKeyEl.textContent = 'Relíquia [✓]';
      } else {
        slotBronzeKeyEl.classList.remove('acquired');
        slotBronzeKeyEl.textContent = 'Relíquia [ ]';
      }

      if (questState.targetPuzzleSolved) {
        slotCthulhuRuneEl.classList.add('acquired');
        slotCthulhuRuneEl.textContent = '4 Alvos [✓]';
      } else {
        slotCthulhuRuneEl.classList.remove('acquired');
        slotCthulhuRuneEl.textContent = '4 Alvos [ ]';
      }

      if (act3Env && act3Env.bridge && act3Env.bridge.isRaised) {
        slotCultistEmblemEl.classList.add('acquired');
        slotCultistEmblemEl.textContent = 'Ponte [✓]';
      } else {
        slotCultistEmblemEl.classList.remove('acquired');
        slotCultistEmblemEl.textContent = 'Ponte [ ]';
      }
    } else {
      if (titleEl) titleEl.textContent = 'SELOS PARA ABRIR O PORTÃO';
      if (questState.hasBronzeKey) {
        slotBronzeKeyEl.classList.add('acquired');
        slotBronzeKeyEl.textContent = 'Chave [✓]';
      } else {
        slotBronzeKeyEl.classList.remove('acquired');
        slotBronzeKeyEl.textContent = 'Chave [ ]';
      }

      if (questState.hasCthulhuRune) {
        slotCthulhuRuneEl.classList.add('acquired');
        slotCthulhuRuneEl.textContent = 'Runa [✓]';
      } else {
        slotCthulhuRuneEl.classList.remove('acquired');
        slotCthulhuRuneEl.textContent = 'Runa [ ]';
      }

      if (questState.hasCultistEmblem) {
        slotCultistEmblemEl.classList.add('acquired');
        slotCultistEmblemEl.textContent = 'Emblema [✓]';
      } else {
        slotCultistEmblemEl.classList.remove('acquired');
        slotCultistEmblemEl.textContent = 'Emblema [ ]';
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
let isActTransitioning = false;
let lastNarrativeZone = -1;
let currentPromptObject = null;
let typewriterTimeout = null;

// Typewriter Dialogue Effect
function typeWriterDialogue(speaker, fullText, onComplete) {
  if (typewriterTimeout) {
    clearTimeout(typewriterTimeout);
    typewriterTimeout = null;
  }

  const isCultist = speaker && (
    speaker.toUpperCase().includes('CULTISTA') ||
    speaker.toUpperCase().includes('SEQUESTRADOR') ||
    speaker.toUpperCase().includes('VILÃO')
  );

  if (isCultist) {
    dialogueContainerEl.classList.add('cultist-dialogue-mode');
  } else {
    dialogueContainerEl.classList.remove('cultist-dialogue-mode');
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
  isActTransitioning = false;
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
    npc.group.visible = true;
  } else if (act === 2) {
    streetEnv.group.visible = false;
    dungeonEnv.group.visible = true;
    act3Env.group.visible = false;
    npc.group.visible = true;
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
    npc.group.visible = false; // Cultista removido do meio da sala do Ato 3!
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

let isPlayerDying = false;
let pendingKnockoutReason = '';

function startPlayerDeath(reason = 'Você perdeu a consciência...') {
  if (isPlayerDying || isKnockedOut || player.isFalling) return;
  isPlayerDying = true;
  pendingKnockoutReason = reason;
  player.hp = 0;
  player.moving = false;
  player.deathTimer = 0;
  playSound('hit');
  updateHUD();
}

function triggerKnockout(reason = 'Você perdeu a consciência...') {
  if (isKnockedOut) return;
  isKnockedOut = true;
  isPlayerDying = false;
  player.isFalling = false;
  player.fallTimer = 0;
  player.moving = false;
  playSound('hit');

  knockoutOverlayEl.classList.remove('hidden');
  if (currentAct === 3) {
    document.querySelector('#knockoutText').innerHTML = `
      ${reason}<br><br>
      As cinzas e vapores do abismo nublam sua mente... Você recobra os sentidos no início da câmara vulcânica!
    `;
    btnWakeUpCellEl.textContent = '🔥 Levantar-se nas Cinzas';
  } else {
    document.querySelector('#knockoutText').innerHTML = `
      ${reason}<br><br>
      Sua visão se apaga na mais profunda escuridão... O cultista te arrasta de volta à cela de sacrifício.
    `;
    btnWakeUpCellEl.textContent = '👁️ Acordar na Cela';
  }
}

btnWakeUpCellEl.addEventListener('click', () => {
  knockoutOverlayEl.classList.add('hidden');
  isKnockedOut = false;
  isPlayerDying = false;
  if (currentAct === 3) {
    setAct(3);
  } else {
    resetPuzzles(false);
    performEyeWakeUpTransition();
  }
});

let act3ChoiceDialogShown = false;

function triggerEnding(endingId) {
  if (!DEMO_AVAILABLE_IDS.includes(endingId)) return;
  if (isVictory) return;
  isVictory = true;
  unlockEnding(endingId);
  playSound('victory');

  const ending = ENDINGS_DATA.find((e) => e.id === endingId) || ENDINGS_DATA[3];

  const victoryBadgeEl = document.querySelector('#victoryBadge');
  const victoryIconLargeEl = document.querySelector('#victoryIconLarge');
  const victoryTitleEl = document.querySelector('#victoryTitle');
  const victoryQuoteEl = document.querySelector('#victoryQuote');
  const victoryTextEl = document.querySelector('#victoryText');

  if (victoryBadgeEl) victoryBadgeEl.textContent = `🏆 CONQUISTA DE FINAL ${ending.number} DESBLOQUEADA!`;
  if (victoryIconLargeEl) victoryIconLargeEl.textContent = ending.icon;
  if (victoryTitleEl) victoryTitleEl.textContent = `FINAL ${ending.number}: ${ending.title.toUpperCase()}`;

  const victoryImageWrapperEl = document.querySelector('#victoryImageWrapper');
  const victoryImageEl = document.querySelector('#victoryImage');

  if (endingId === 4) {
    if (victoryImageWrapperEl && victoryImageEl) {
      victoryImageEl.src = '/assets/cthulhu.png';
      victoryImageWrapperEl.classList.remove('hidden');
    }
    if (victoryQuoteEl) victoryQuoteEl.textContent = '"Ph\'nglui mglw\'nafh Cthulhu R\'lyeh wgah\'nagl fhtagn... O despertar cósmico começou."';
    if (victoryTextEl) {
      victoryTextEl.innerHTML = `
        <strong>PACTO CONSUMADO!</strong> Você se prostrou perante o Cultista Supremo e abriu seu espírito ao Grande Cthulhu.<br><br>
        Tentáculos de energia cósmica envolveram seu corpo enquanto sua consciência mortal se dissolvia no infinito do cosmo. Você não é mais apenas um humano... você é o Receptáculo Sagrado que trará o reinado das profundezas à Terra!
      `;
    }
  } else {
    if (victoryImageWrapperEl) {
      victoryImageWrapperEl.classList.add('hidden');
    }
  }

  victoryOverlayEl.classList.remove('hidden');
}

function triggerVictory() {
  triggerEnding(4);
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
    if (dungeonEnv && dungeonEnv.updateTerminalBoard) {
      if (!questState.binaryEnigma || typeof questState.targetDecimal !== 'number') {
        rollBinaryEnigma();
      } else {
        dungeonEnv.updateTerminalBoard(questState.binaryEnigma);
      }
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

if (btnCloseControlsEl) {
  btnCloseControlsEl.addEventListener('click', (e) => {
    e.stopPropagation();
    controlsOverlayEl.classList.add('hidden');
    openMenu();
  });
}

// Click anywhere on overlay or card to start playing!
controlsOverlayEl.addEventListener('click', (e) => {
  if (e.target.closest('#btnCloseControls')) return;
  startGameFromControls();
});

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
  } else if (currentAct === 3) {
    act3ChoiceDialogShown = false;
    if (act3Env && act3Env.bridge) {
      act3Env.bridge.isRaised = false;
      act3Env.bridge.isRaising = false;
      act3Env.bridge.currentY = -2.5;
      act3Env.bridge.mesh.position.y = -2.5;
      if (!act3Env.obstacles.includes(act3Env.bridge.obstacle)) {
        act3Env.obstacles.push(act3Env.bridge.obstacle);
      }
    }
    if (act3Env && act3Env.targets) {
      act3Env.targets.forEach((t) => {
        t.hit = false;
        if (t.orb) t.orb.material.emissiveIntensity = 0.8;
      });
    }
  }
  isActTransitioning = false;
  isPlayerDying = false;
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
  if (!targetModalEl.classList.contains('hidden')) {
    if (e.code === 'Escape') {
      qteActive = false;
      qteCanInput = false;
      if (qteTimerRaf) cancelAnimationFrame(qteTimerRaf);
      targetModalEl.classList.add('hidden');
      return;
    }
    if (!qteActive) {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        startQteSequence();
        return;
      }
    } else if (qteCanInput) {
      e.preventDefault();
      handleQteInput(e.key, e.code);
      return;
    }
  }

  // Handle Stone Plaque Modal closing
  if (stonePlaqueModalEl && !stonePlaqueModalEl.classList.contains('hidden')) {
    if (e.code === 'Escape' || e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') {
      e.preventDefault();
      closeStonePlaqueModal();
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
    if (stonePlaqueModalEl && !stonePlaqueModalEl.classList.contains('hidden')) {
      closeStonePlaqueModal();
      return;
    }
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
    (stonePlaqueModalEl && !stonePlaqueModalEl.classList.contains('hidden')) ||
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

// Clique do mouse diretamente nos pedestais de cristais na masmorra
window.addEventListener('pointerdown', (event) => {
  if (currentAct !== 2 || isKnockedOut || isWakingUp) return;
  if (event.target.closest('button, .hud, .dialogue-box, .top-actions-bar, .modal-backdrop')) return;

  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  if (dungeonEnv && dungeonEnv.colorCrystals) {
    const targets = [];
    dungeonEnv.colorCrystals.forEach((cc) => {
      if (cc.gemMesh) targets.push(cc.gemMesh);
      if (cc.pillarMesh) targets.push(cc.pillarMesh);
    });
    const intersects = raycaster.intersectObjects(targets, true);
    if (intersects.length > 0) {
      const hitObj = intersects[0].object;
      const cc = dungeonEnv.colorCrystals.find(
        (c) => c.gemMesh === hitObj || c.pillarMesh === hitObj || c.gemMesh === hitObj.parent
      );
      if (cc) {
        const dist = Math.hypot(player.group.position.x - cc.x, player.group.position.z - cc.z);
        if (dist <= 4.0) {
          handleCrystalPedestalTouch(cc);
        } else {
          typeWriterDialogue('MUITO DISTANTE', 'Aproxime-se mais do pedestal para tocar no cubo elemental.');
        }
      }
    }
  }
});

// PUZZLE 1: TERMINAL DAS MÃOS (CÓDIGO BINÁRIO COM 7 DEDOS)
function updateBinaryModalUI() {
  if (!questState.terminalBits || questState.terminalBits.length !== 7) {
    questState.terminalBits = [0, 0, 0, 0, 0, 0, 0];
  }
  if (!questState.binaryEnigma || typeof questState.targetDecimal !== 'number') {
    rollBinaryEnigma();
  }

  const bits = questState.terminalBits;
  const weights = [64, 32, 16, 8, 4, 2, 1];
  let currentSum = 0;
  for (let i = 0; i < 7; i++) {
    if (bits[i] === 1) currentSum += weights[i];
  }

  // Preenche as 3 equações no modal
  const eqContainerEl = document.querySelector('#enigmaEquationsContainer');
  const formulaBoxEl = document.querySelector('#enigmaFormulaBox');

  if (eqContainerEl && questState.binaryEnigma && questState.binaryEnigma.equations) {
    eqContainerEl.innerHTML = questState.binaryEnigma.equations
      .map(
        (eq, idx) => `
        <div class="enigma-equation-row">
          <span class="enigma-eq-left">
            <span style="font-size: 11px; color: #78909c; margin-right: 6px;">[#${idx + 1}]</span>
            ${eq.expr.replace(/([ᚱᛉᛏ])/g, '<span class="rune-glyph">$1</span>')}
          </span>
          <span class="enigma-eq-val">= ${eq.val}</span>
        </div>
      `
      )
      .join('');
  }

  if (formulaBoxEl && questState.binaryEnigma) {
    formulaBoxEl.textContent = questState.binaryEnigma.formulaText;
  }

  [0, 1, 2, 3, 4, 5, 6].forEach((i) => {
    const valEl = document.querySelector(`#digitVal${i}`);
    if (valEl) {
      valEl.textContent = bits[i];
      if (bits[i] === 1 || questState.hasBronzeKey) {
        valEl.classList.add('bit-on');
        valEl.classList.remove('bit-off');
      } else {
        valEl.classList.add('bit-off');
        valEl.classList.remove('bit-on');
      }
    }

    // Sincroniza os 7 orbs no pedestal 3D
    if (dungeonEnv && dungeonEnv.binaryLevers && dungeonEnv.binaryLevers[i]) {
      const lever3D = dungeonEnv.binaryLevers[i];
      lever3D.state = bits[i];
      let orbColor = 0xff1744; // Vermelho (desligado)
      if (questState.hasBronzeKey || bits[i] === 1) {
        orbColor = 0x00e676; // Verde (ligado ou resolvido)
      }
      if (lever3D.bulbMat) lever3D.bulbMat.color.setHex(orbColor);
      if (lever3D.light && lever3D.light.color) lever3D.light.color.setHex(orbColor);
    }
  });

  if (binaryValueDisplayEl) {
    if (questState.hasBronzeKey) {
      binaryValueDisplayEl.innerHTML = `Dedos: [ <strong>${bits.join(' - ')}</strong> ] ➔ Decimal: [ <span style="color:#00e676;">${currentSum}</span> ] <span style="color:#69f0ae;">✓ RESOLVIDO (CHAVE DE BRONZE)</span>`;
    } else {
      binaryValueDisplayEl.innerHTML = `Dedos: [ <strong>${bits.join(' - ')}</strong> ] &nbsp;|&nbsp; <span style="color:#90a4ae;">Aguardando Ativação</span>`;
    }
  }
}

function resetBinaryPuzzle() {
  if (!questState.hasBronzeKey) {
    questState.terminalBits = [0, 0, 0, 0, 0, 0, 0];
    rollBinaryEnigma();
  }
  updateBinaryModalUI();
}

function resetPuzzles(resetAll = true) {
  if (resetAll || !questState.hasBronzeKey) {
    resetBinaryPuzzle();
  }

  if (resetAll || !questState.hasCthulhuRune) {
    questState.colorSequence = [];
    if (dungeonEnv && dungeonEnv.colorCrystals) {
      dungeonEnv.colorCrystals.forEach((c) => {
        c.isActive = false;
        if (c.gemMat) {
          c.gemMat.emissive.setHex(0x000000);
          c.gemMat.emissiveIntensity = 0;
        }
        if (c.pointLight) c.pointLight.intensity = 0;
      });
    }
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
    dungeonEnv.pathPuzzle.rerollSafePath();
  }

  if (dungeonEnv && dungeonEnv.traps) {
    dungeonEnv.traps.forEach((t) => {
      if (t.type === 'hole') {
        if (t.brokenMesh) t.brokenMesh.visible = true;
      }
    });
  }
}

// Eventos de clique para alternar os 7 dedos das mãos (0 ou 1)
[0, 1, 2, 3, 4, 5, 6].forEach((i) => {
  const toggleBit = () => {
    if (questState.hasBronzeKey) return;
    questState.terminalBits[i] = questState.terminalBits[i] === 1 ? 0 : 1;
    playSound('switch');
    updateBinaryModalUI();
  };

  const upBtn = document.querySelector(`#btnDigitUp${i}`);
  if (upBtn) upBtn.addEventListener('click', toggleBit);

  const downBtn = document.querySelector(`#btnDigitDown${i}`);
  if (downBtn) downBtn.addEventListener('click', toggleBit);

  const screenEl = document.querySelector(`#digitVal${i}`);
  if (screenEl) screenEl.addEventListener('click', toggleBit);
});

btnSubmitBinaryEl.addEventListener('click', () => {
  const bits = questState.terminalBits || [0, 0, 0, 0, 0, 0, 0];
  const weights = [64, 32, 16, 8, 4, 2, 1];
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    if (bits[i] === 1) sum += weights[i];
  }

  if (sum === questState.targetDecimal) {
    questState.hasBronzeKey = true;
    playSound('victory');
    binaryModalEl.classList.add('hidden');
    typeWriterDialogue(
      'TERMINAL DAS MÃOS DESBLOQUEADO!',
      `✨ Ressonância Perfeita! A posição dos 7 dedos [${bits.join(' ')}] sintetizou a Frequência Alvo ${questState.targetDecimal}! O pedestal ancestral abriu e revelou a [CHAVE DE BRONZE]!`
    );
    updateHUD();
    updateBinaryModalUI();
  } else {
    playSound('hit');
    typeWriterDialogue(
      'CIRCUITO TRAVADO (RESPOSTA INCORRETA)',
      `❌ A posição atual dos dedos gerou a frequência decimal ${sum}, mas o terminal requer a Frequência Alvo das runas sagradas. Deduza o valor de cada runa pelas 3 inscrições, resolva a fórmula e tente novamente!`
    );
  }
});

btnCloseBinaryEl.addEventListener('click', () => {
  binaryModalEl.classList.add('hidden');
});

// PUZZLE 2: COLOR CRYSTALS (ATIVAR CADA PEDESTAL NO MUNDO 3D - SEM POP-UP)
function handleCrystalPedestalTouch(cc) {
  if (questState.hasCthulhuRune) {
    typeWriterDialogue('PEDESTAL ELEMENTAL', '🔮 A Runa de Cthulhu já foi forjada e os 4 pedestais ressoam em harmonia eterna.');
    return;
  }

  // Se já está ativo nesta tentativa, avisa
  if (questState.colorSequence.includes(cc.id)) {
    typeWriterDialogue(cc.name, '✨ Este cubo elemental já está aceso e ressoando energia!');
    return;
  }

  // Acende o cubo no pedestal: brilha com emissivo forte e luz pontual
  playSound('crystal');
  questState.colorSequence.push(cc.id);
  cc.isActive = true;
  if (cc.gemMat) {
    cc.gemMat.emissive.setHex(cc.colorHex);
    cc.gemMat.emissiveIntensity = 2.5;
  }
  if (cc.pointLight) {
    cc.pointLight.intensity = 2.5;
  }

  // Ordem correta dada pelo Cântico das Catacumbas:
  // 1: Chama (red), 2: Abismo (blue), 3: Aurora (yellow), 4: Raiz (green)
  const expectedSequence = ['red', 'blue', 'yellow', 'green'];
  const currentIndex = questState.colorSequence.length - 1;

  // Verifica se o pedestal aceso é o correto nesta posição da sequência
  if (cc.id !== expectedSequence[currentIndex]) {
    // Errou a ordem!
    playSound('hit');
    typeWriterDialogue(
      'DESARMONIA ELEMENTAL',
      '❌ A ordem dos pedestais estava incorreta! A energia se desfez e os cubos se apagaram.'
    );
    setTimeout(() => {
      if (dungeonEnv && dungeonEnv.colorCrystals) {
        dungeonEnv.colorCrystals.forEach((c) => {
          c.isActive = false;
          if (c.gemMat) {
            c.gemMat.emissive.setHex(0x000000);
            c.gemMat.emissiveIntensity = 0;
          }
          if (c.pointLight) c.pointLight.intensity = 0;
        });
      }
      questState.colorSequence = [];
    }, 500);
    return;
  }

  // Acertou o passo atual!
  if (questState.colorSequence.length === 4) {
    // Todos os 4 pedestais ativados na ordem perfeita!
    questState.hasCthulhuRune = true;
    playSound('victory');
    typeWriterDialogue(
      'ENIGMA DOS CRISTAIS RESOLVIDO!',
      '🔮 Todos os 4 cubos elementais brilham em sintonia cósmica! A [RUNA DE CTHULHU] materializou-se sobre o altar!'
    );
    updateHUD();
  } else {
    typeWriterDialogue(
      cc.name,
      `✨ O cubo do pedestal começou a brilhar intensamente! (${questState.colorSequence.length}/4 cubos ativos)`
    );
  }
}

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
    } else if (obj.type === 'locked_demo_ending') {
      playSound('hit');
      player.moving = false;
      const speaker = obj.choiceName ? obj.choiceName.toUpperCase() : (obj.dialogueSpeaker || 'CAMINHO INDISPONÍVEL');
      typeWriterDialogue(
        speaker,
        'Esse caminho não está disponível nesse momento.',
        () => {
          setTimeout(() => {
            dialogueContainerEl.classList.add('hidden');
            isVictory = true;

            const victoryBadgeEl = document.querySelector('#victoryBadge');
            const victoryIconLargeEl = document.querySelector('#victoryIconLarge');
            const victoryTitleEl = document.querySelector('#victoryTitle');
            const victoryQuoteEl = document.querySelector('#victoryQuote');
            const victoryTextEl = document.querySelector('#victoryText');
            const victoryImageWrapperEl = document.querySelector('#victoryImageWrapper');

            if (victoryBadgeEl) victoryBadgeEl.textContent = '🔒 DEMO FINALIZADA';
            if (victoryIconLargeEl) victoryIconLargeEl.textContent = '⛔';
            if (victoryTitleEl) victoryTitleEl.textContent = speaker;
            if (victoryImageWrapperEl) victoryImageWrapperEl.classList.add('hidden');
            if (victoryQuoteEl) victoryQuoteEl.textContent = '"Esse caminho não está disponível nesse momento."';
            if (victoryTextEl) {
              victoryTextEl.innerHTML = `
                <strong>FIM DA DEMO:</strong> Esse caminho não está disponível nesse momento.<br><br>
                Você alcançou os limites desta versão demonstrativa. O restante deste caminho estará acessível na versão completa do jogo!
              `;
            }
            victoryOverlayEl.classList.remove('hidden');
          }, 900);
        }
      );
    } else if (obj.type === 'ending_choice') {
      triggerEnding(obj.endingId);
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
  } else if (obj.type === 'stone_monolith_clue') {
    openStonePlaqueModal(obj.clueText);
  } else if (obj.type === 'lore_clue') {
    playSound('pickup');
    typeWriterDialogue(obj.clueSpeaker || 'INSCRIÇÃO', obj.clueText);
  } else if (obj.type === 'color_crystal') {
    handleCrystalPedestalTouch(obj.data);
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
  isPlayerDying = false;
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
      const activeKeys = (isActTransitioning || isPlayerDying) ? {} : keys;
      const playerUpdateRes = player.update(
        activeKeys,
        dt,
        dungeonEnv.bounds,
        cameraAngle,
        dungeonEnv.obstacles
      );
      if (isActTransitioning || isPlayerDying) {
        player.moving = false;
      }
      player.animate(elapsed);

      // Checa se a animação de morte do personagem terminou
      if (isPlayerDying && playerUpdateRes && playerUpdateRes.finishedDeath) {
        isPlayerDying = false;
        triggerKnockout(pendingKnockoutReason);
      }

      if (playerUpdateRes && playerUpdateRes.finishedFall) {
        player.isFalling = false;
        triggerKnockout(player.fallReason || 'Você caiu no abismo sem fundo de um buraco da masmorra!');
        player.fallReason = null;
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

      // Animate Color Crystal Cubes (flutuação e rotação suave dos cubos)
      if (dungeonEnv && dungeonEnv.colorCrystals) {
        dungeonEnv.colorCrystals.forEach((cc) => {
          if (cc.gemMesh) {
            cc.gemMesh.rotation.y += dt * (cc.isActive ? 2.5 : 0.8);
            if (cc.isActive) {
              cc.gemMesh.position.y = 1.9 + Math.sin(elapsed * 4 + cc.order) * 0.08;
            } else {
              cc.gemMesh.position.y = 1.9;
            }
          }
        });
      }

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
          if (trap.isActive && distToSpike < trap.radius && !player.isFalling && !isPlayerDying) {
            player.hp -= trap.damage * dt;
            player.noiseLevel = 3;
            playSound('hit');
            updateHUD();

            if (player.hp <= 0) {
              player.hp = 0;
              startPlayerDeath('Você pisou em uma armadilha fatal de espinhos e caiu desacordado!');
            }
          }
        } else if (trap.type === 'hole') {
          const px = player.group.position.x;
          const pz = player.group.position.z;
          const inHole =
            trap.halfW && trap.halfH
              ? Math.abs(px - trap.x) <= trap.halfW * 0.75 &&
              Math.abs(pz - trap.z) <= trap.halfH * 0.75
              : Math.hypot(px - trap.x, pz - trap.z) < trap.radius;

          if (inHole && !player.isFalling && !isKnockedOut) {
            if (trap.brokenMesh) trap.brokenMesh.visible = false;
            if (trap.holeMesh) trap.holeMesh.visible = true;
            player.fallReason = 'O piso rachado cedeu sob seus passos e você despencou no abismo!';
            player.triggerHoleFall();
            playSound('fall');
          }
        }
      });

      // Check Chamber 4 Undertale Spike Corridor Puzzle (Corredor de Espinhos)
      if (
        dungeonEnv &&
        dungeonEnv.pathPuzzle &&
        !player.isFalling &&
        !isKnockedOut &&
        player.group.position.x >= 33.0 &&
        player.group.position.x <= 44.0 &&
        player.group.position.z >= -6.5 &&
        player.group.position.z <= 6.5
      ) {
        const px = player.group.position.x;
        const pz = player.group.position.z;

        // Verifica se o jogador pisou exatamente em uma das lajes das colunas
        // Se estiver no vão entre as colunas, o jogador pode circular livremente em diagonal!
        const tile = dungeonEnv.pathPuzzle.tiles.find(
          (t) =>
            Math.abs(px - t.x) <= (t.halfW || 0.65) &&
            Math.abs(pz - t.z) <= (t.halfH || 1.0)
        );

        if (tile) {
          if (tile.isSafe) {
            // Acertou a laje: espinhos somem e fica livre para passar!
            if (!tile.isStepped) {
              tile.isStepped = true;
              if (tile.spikeGroup) tile.spikeGroup.visible = false;
              if (tile.baseMat) {
                tile.baseMat.emissive.setHex(0x00e676);
                tile.baseMat.emissiveIntensity = 0.9;
              }
              playSound('pickup');
            }
          } else {
            // Errou o caminho: o piso abre um buraco sem fundo e o jogador cai!
            if (!tile.isFallen) {
              tile.isFallen = true;
              if (tile.spikeGroup) tile.spikeGroup.visible = false;
              if (tile.baseMesh) tile.baseMesh.visible = false;
              if (tile.holeMesh) tile.holeMesh.visible = true;
            }
            player.fallReason = 'Você pisou no ladrilho errado e despencou no abismo sob os espinhos!';
            player.triggerHoleFall();
            playSound('fall');
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

        if (res.attacked && !player.isFalling && !isPlayerDying) {
          player.hp -= res.damage;
          player.noiseLevel = 3;
          playSound('hit');
          typeWriterDialogue(
            'ALERTA!',
            `🩸 O ${enemy.name} ouviu seus passos e te atacou! Use C para andar em silêncio!`
          );
          updateHUD();

          if (player.hp <= 0) {
            player.hp = 0;
            startPlayerDeath(`O ${enemy.name} te atingiu com um golpe fulminante e você desmaiou!`);
          }
        }
      });

      // Check Act 2 Completion (Transition to Act 3: O Abismo de Lava)
      // O portão de ferro fica em X=86.0 e as escadas de fuga em X=94.0 na Câmara 6!
      if (
        player.group.position.x >= 92.0 &&
        Math.abs(player.group.position.z) < 3.0 &&
        !isVictory &&
        !player.isFalling &&
        !isActTransitioning
      ) {
        if (
          questState.activePedestals >= 3 &&
          questState.hasBronzeKey &&
          questState.hasCthulhuRune &&
          questState.hasCultistEmblem &&
          questState.gateOpen
        ) {
          isActTransitioning = true;
          player.moving = false;
          playSound('pickup');
          typeWriterDialogue(
            'DESCENDO AO ABISMO',
            '🚪 Você atravessou o Grande Portão e desceu as escadarias arcanas... O ar fica sufocante e rios de lava fervente se abrem à sua frente!',
            () => {
              setAct(3);
              isActTransitioning = false;
            }
          );
        } else {
          player.group.position.x = 84.0;
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

      const activeKeys = (isActTransitioning || isPlayerDying || !targetModalEl.classList.contains('hidden')) ? {} : keys;
      const playerUpdateRes = player.update(
        activeKeys,
        dt,
        act3Env.bounds,
        cameraAngle,
        act3Env.obstacles
      );
      if (isActTransitioning || isPlayerDying || !targetModalEl.classList.contains('hidden')) {
        player.moving = false;
      }
      player.animate(elapsed);

      // Checa se a animação de morte do personagem terminou
      if (isPlayerDying && playerUpdateRes && playerUpdateRes.finishedDeath) {
        isPlayerDying = false;
        triggerKnockout(pendingKnockoutReason);
      }

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
          const onBridge = (act3Env.bridge.isRaised || act3Env.bridge.isRaising) && Math.abs(player.group.position.z) <= 2.2;
          if (!onBridge && !isPlayerDying) {
            player.hp -= lh.damage * dt;
            player.noiseLevel = 3;
            playSound('hit');
            updateHUD();
            if (player.hp <= 0) {
              player.hp = 0;
              startPlayerDeath('Você caiu no rio de lava ardente e foi consumido pelas chamas!');
            }
          }
        }
      }

      // Check Acid Hazard in Chamber 1 (Ácido cobre todo o vão, seguro apenas na trilha preta)
      if (
        player.group.position.x >= -18.0 &&
        player.group.position.x <= -2.0 &&
        player.group.position.z >= -9.0 &&
        player.group.position.z <= 9.0
      ) {
        const px = player.group.position.x;
        const pz = player.group.position.z;
        let onSafePath = false;

        if (px >= -18.0 && px <= -13.0) {
          // Trilha reta da esquerda
          if (Math.abs(pz) <= 0.85) onSafePath = true;
        } else if (px >= -7.0 && px <= -2.0) {
          // Trilha reta da direita
          if (Math.abs(pz) <= 0.85) onSafePath = true;
        } else if (px > -13.0 && px < -7.0) {
          // Losango central: bifurcação para cima e para baixo
          const dx = Math.abs(px - (-10.0));
          const targetZ = 3.5 * (1.0 - dx / 3.0);
          // Caminho superior (-targetZ) ou caminho inferior (+targetZ)
          if (Math.abs(pz - (-targetZ)) <= 0.95 || Math.abs(pz - targetZ) <= 0.95) {
            onSafePath = true;
          }
        }

        if (!onSafePath && !isPlayerDying) {
          player.hp -= 25 * dt;
          player.noiseLevel = 2;
          playSound('hit');
          updateHUD();
          if (player.hp <= 0) {
            player.hp = 0;
            startPlayerDeath('Você caiu no ácido corrosivo e suas forças se esvaíram!');
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

        if (res.attacked && !player.isFalling && !isPlayerDying) {
          player.hp -= res.damage;
          player.noiseLevel = 3;
          playSound('hit');
          typeWriterDialogue(
            'ALERTA MAGMÁTICO!',
            `🩸 O ${enemy.name} ouviu seus passos sobre as pedras vulcânicas e atacou! Use C!`
          );
          updateHUD();

          if (player.hp <= 0) {
            player.hp = 0;
            startPlayerDeath(`O ${enemy.name} te atingiu com um golpe mortal e você desmaiou nas cinzas!`);
          }
        }
      });

      // Anúncio dramático das Escolhas ao cruzar a ponte e pisar no santuário final (X >= 27.5)
      if (
        player.group.position.x >= 27.5 &&
        act3Env.bridge.isRaised &&
        !act3ChoiceDialogShown &&
        !isVictory
      ) {
        act3ChoiceDialogShown = true;
        typeWriterDialogue(
          'ENCRUZILHADA DO DESTINO',
          '🔥 Você atravessou o abismo de chamas! No santuário sagrado você avista a Porta Ancestral à esquerda, o Bueiro Fétido à direita e o Cultista Supremo perante o altar ao centro!'
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
