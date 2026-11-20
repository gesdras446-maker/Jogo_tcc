import * as THREE from 'three';

export function createAct3Environment(scene) {
  const act3Group = new THREE.Group();

  // Dimensões globais do Ato 3 expandido (acomoda 6 piscinas de ácido em sequência + abismo de lava + santuário)
  const bounds = {
    minX: -44.0,
    maxX: 158.0,
    minZ: -10.0,
    maxZ: 10.0,
  };

  const obstacles = [];
  const lavaHazards = [];
  const acidHazards = [];
  const interactiveObjects = [];
  const animatedLights = [];
  const safePathZones = []; // Zonas de caminho seguro onde o jogador não toma dano de ácido

  // Monstro de sangue removido da área de ácido a pedido do usuário. Apenas o guardião final no santuário.
  const enemySpawnPoints = [
    { x: 142.0, z: 2.0, name: 'Guardião Cego do Portal', patrolRadius: 3.5 },
  ];

  // ========================================================
  // 1. PROCEDURAL TEXTURES & MATERIALS
  // ========================================================

  // A. Chão de Basalto Vulcânico Escuro (com fissuras magmáticas avermelhadas)
  const basaltCanvas = document.createElement('canvas');
  basaltCanvas.width = 256;
  basaltCanvas.height = 256;
  const bctx = basaltCanvas.getContext('2d');
  bctx.fillStyle = '#16191f';
  bctx.fillRect(0, 0, 256, 256);

  // Linhas sutis de magma nas fissuras
  bctx.strokeStyle = '#2d140e';
  bctx.lineWidth = 3;
  for (let i = 0; i < 256; i += 32) {
    bctx.beginPath();
    bctx.moveTo(i, 0);
    bctx.lineTo(i, 256);
    bctx.stroke();
    bctx.beginPath();
    bctx.moveTo(0, i);
    bctx.lineTo(256, i);
    bctx.stroke();
  }

  // Fissuras quentes
  bctx.strokeStyle = '#ff3700';
  bctx.lineWidth = 1;
  bctx.globalAlpha = 0.35;
  for (let i = 0; i < 12; i++) {
    bctx.beginPath();
    let cx = Math.random() * 256;
    let cy = Math.random() * 256;
    bctx.moveTo(cx, cy);
    for (let step = 0; step < 4; step++) {
      cx += (Math.random() - 0.5) * 40;
      cy += (Math.random() - 0.5) * 40;
      bctx.lineTo(cx, cy);
    }
    bctx.stroke();
  }
  bctx.globalAlpha = 1.0;

  const basaltTex = new THREE.CanvasTexture(basaltCanvas);
  basaltTex.wrapS = THREE.RepeatWrapping;
  basaltTex.wrapT = THREE.RepeatWrapping;
  basaltTex.repeat.set(16, 4);

  const basaltMat = new THREE.MeshStandardMaterial({
    map: basaltTex,
    roughness: 0.85,
    metalness: 0.2,
  });

  // B. Rio de Lava Fervente (Brilho intenso amarelo, laranja e vermelho)
  const lavaCanvas = document.createElement('canvas');
  lavaCanvas.width = 256;
  lavaCanvas.height = 256;
  const lctx = lavaCanvas.getContext('2d');
  const lavaGrad = lctx.createLinearGradient(0, 0, 256, 256);
  lavaGrad.addColorStop(0, '#ff1a00');
  lavaGrad.addColorStop(0.3, '#ff6a00');
  lavaGrad.addColorStop(0.7, '#ffc400');
  lavaGrad.addColorStop(1, '#ff3700');
  lctx.fillStyle = lavaGrad;
  lctx.fillRect(0, 0, 256, 256);

  // Bolhas incandescentes de lava
  for (let i = 0; i < 40; i++) {
    const lx = Math.random() * 256;
    const ly = Math.random() * 256;
    const lr = 4 + Math.random() * 16;
    const bGrad = lctx.createRadialGradient(lx, ly, 1, lx, ly, lr);
    bGrad.addColorStop(0, '#ffffff');
    bGrad.addColorStop(0.4, '#ffee55');
    bGrad.addColorStop(1, 'transparent');
    lctx.fillStyle = bGrad;
    lctx.beginPath();
    lctx.arc(lx, ly, lr, 0, Math.PI * 2);
    lctx.fill();
  }

  const lavaTex = new THREE.CanvasTexture(lavaCanvas);
  lavaTex.wrapS = THREE.RepeatWrapping;
  lavaTex.wrapT = THREE.RepeatWrapping;
  lavaTex.repeat.set(4, 4);

  const lavaMat = new THREE.MeshBasicMaterial({
    map: lavaTex,
  });

  // C. Piscina Original 1: Ácido Verdejante com Bolhas
  const acidCanvas = document.createElement('canvas');
  acidCanvas.width = 512;
  acidCanvas.height = 512;
  const actx = acidCanvas.getContext('2d');
  actx.fillStyle = '#004d40';
  actx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 60; i++) {
    const ax = Math.random() * 512;
    const ay = Math.random() * 512;
    const ar = 8 + Math.random() * 28;
    const aGrad = actx.createRadialGradient(ax, ay, 2, ax, ay, ar);
    aGrad.addColorStop(0, '#00e676');
    aGrad.addColorStop(0.5, '#00b0ff');
    aGrad.addColorStop(1, 'transparent');
    actx.fillStyle = aGrad;
    actx.beginPath();
    actx.arc(ax, ay, ar, 0, Math.PI * 2);
    actx.fill();
  }
  const acidTex = new THREE.CanvasTexture(acidCanvas);
  const acidMat = new THREE.MeshBasicMaterial({
    map: acidTex,
  });

  // ========================================================
  // 2. GEOMETRIA DOS PISOS E PLATAFORMAS (EXPANDIDO)
  // ========================================================

  // A. Plataforma da Câmara 1 (Do Spawn X = -44 até o início do Abismo de Lava X = 108)
  const chamber1Floor = new THREE.Mesh(
    new THREE.BoxGeometry(152, 0.5, 18),
    basaltMat
  );
  chamber1Floor.position.set(32, -0.25, 0);
  act3Group.add(chamber1Floor);

  // B. Abismo do Rio de Lava Fervente (X: 108 até 132, Largura = 24m, Z: -12 até +12)
  const lavaChasm = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 24),
    lavaMat
  );
  lavaChasm.rotation.x = -Math.PI / 2;
  lavaChasm.position.set(120, -0.15, 0);
  act3Group.add(lavaChasm);

  // Área de Lava: MATA INSTANTANEAMENTE se o jogador entrar nela
  lavaHazards.push({
    minX: 108.0,
    maxX: 132.0,
    minZ: -10.0,
    maxZ: 10.0,
    instantKill: true,
  });

  // C. Ilha do Santuário Final (X: 132 até 158, Comprimento = 26m, Centro X = 145)
  const exitIsland = new THREE.Mesh(
    new THREE.BoxGeometry(26, 0.5, 18),
    basaltMat
  );
  exitIsland.position.set(145, -0.25, 0);
  act3Group.add(exitIsland);

  // ========================================================
  // 3. AS 6 PISCINAS DE ÁCIDO (TAMANHO IDÊNTICO: 20m x 18m)
  // ========================================================
  // Piscina 1: X: -20 a 0   (Centro X = -10) -> O Losango
  // Piscina 2: X: 0 a 20    (Centro X = 10)  -> O Olho Cósmico de Cthulhu
  // Piscina 3: X: 20 a 40   (Centro X = 30)  -> O Crânio Arcano
  // Piscina 4: X: 40 a 60   (Centro X = 50)  -> Os Tentáculos do Abismo
  // Piscina 5: X: 60 a 80   (Centro X = 70)  -> O Sol Cósmico com Raios
  // Piscina 6: X: 80 a 100  (Centro X = 90)  -> As Órbitas Concéntricas / Espirais

  // PISCINA 1
  const pool1Mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 18),
    acidMat
  );
  pool1Mesh.rotation.x = -Math.PI / 2;
  pool1Mesh.position.set(-10, 0.02, 0);
  act3Group.add(pool1Mesh);

  // PISCINAS 2 A 6: Texturas de fundo líquidas personalizadas para acompanhar cada formato
  const poolConfigs = [
    {
      centerX: 10,
      name: 'eye',
      bg: '#002f24',
      glow: '#00e676',
      accent: '#69f0ae',
    },
    {
      centerX: 30,
      name: 'skull',
      bg: '#1a0033',
      glow: '#d500f9',
      accent: '#ea80fc',
    },
    {
      centerX: 50,
      name: 'tentacles',
      bg: '#003333',
      glow: '#00e5ff',
      accent: '#18ffff',
    },
    {
      centerX: 70,
      name: 'sun',
      bg: '#331a00',
      glow: '#ff9100',
      accent: '#ffd180',
    },
    {
      centerX: 90,
      name: 'orbits',
      bg: '#0d2818',
      glow: '#76ff03',
      accent: '#ccff90',
    },
  ];

  poolConfigs.forEach((cfg) => {
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 512;
    pCanvas.height = 512;
    const pctx = pCanvas.getContext('2d');

    pctx.fillStyle = cfg.bg;
    pctx.fillRect(0, 0, 512, 512);

    for (let b = 0; b < 50; b++) {
      const bx = Math.random() * 512;
      const by = Math.random() * 512;
      const br = 6 + Math.random() * 24;
      const bGrad = pctx.createRadialGradient(bx, by, 2, bx, by, br);
      bGrad.addColorStop(0, cfg.accent);
      bGrad.addColorStop(0.5, cfg.glow);
      bGrad.addColorStop(1, 'transparent');
      pctx.fillStyle = bGrad;
      pctx.beginPath();
      pctx.arc(bx, by, br, 0, Math.PI * 2);
      pctx.fill();
    }

    // Desenho de ressonância no fundo
    pctx.strokeStyle = cfg.glow;
    pctx.lineWidth = 6;
    pctx.beginPath();
    pctx.arc(256, 256, 180, 0, Math.PI * 2);
    pctx.stroke();

    const pTex = new THREE.CanvasTexture(pCanvas);
    const pMat = new THREE.MeshBasicMaterial({ map: pTex });

    const pMesh = new THREE.Mesh(new THREE.PlaneGeometry(20, 18), pMat);
    pMesh.rotation.x = -Math.PI / 2;
    pMesh.position.set(cfg.centerX, 0.02, 0);
    act3Group.add(pMesh);
  });

  // ========================================================
  // 4. CAMINHOS DE PEDRA PRETA NO FORMATO EXATO DOS DESENHOS
  // ========================================================
  const pathMat = new THREE.MeshStandardMaterial({
    color: 0x141619,
    roughness: 0.9,
    metalness: 0.2,
  });

  const pathGroup = new THREE.Group();

  // Utilitário para adicionar trecho reto de caminho seguro e registrar sua zona
  function addPathSegment(x1, z1, x2, z2, width = 1.6) {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.hypot(dx, dz);
    if (len < 0.01) return;

    const angle = Math.atan2(dz, dx);
    const midX = (x1 + x2) / 2;
    const midZ = (z1 + z2) / 2;

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(len + 0.2, width), pathMat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.rotation.z = -angle;
    mesh.position.set(midX, 0.035, midZ);
    pathGroup.add(mesh);

    // Vértice circular de junção nas pontas para eliminar qualquer fresta visual
    const j1 = new THREE.Mesh(new THREE.CircleGeometry(width / 2, 16), pathMat);
    j1.rotation.x = -Math.PI / 2;
    j1.position.set(x1, 0.035, z1);
    pathGroup.add(j1);

    const j2 = new THREE.Mesh(new THREE.CircleGeometry(width / 2, 16), pathMat);
    j2.rotation.x = -Math.PI / 2;
    j2.position.set(x2, 0.035, z2);
    pathGroup.add(j2);

    safePathZones.push({
      type: 'segment',
      x1,
      z1,
      x2,
      z2,
      width: width + 0.35, // tolerância generosa para jogabilidade suave
    });
  }

  // Utilitário para adicionar plataforma/ilha circular
  function addPathCircle(cx, cz, radius) {
    const mesh = new THREE.Mesh(new THREE.CircleGeometry(radius, 24), pathMat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(cx, 0.036, cz);
    pathGroup.add(mesh);

    safePathZones.push({
      type: 'circle',
      cx,
      cz,
      radius: radius + 0.3,
    });
  }

  // --- 1. PISCINA 1: CAMINHO EM FORMA DE LOSANGO (X: -20 a 0) ---
  addPathSegment(-20.0, 0.0, -13.0, 0.0, 1.6); // Entrada
  addPathSegment(-13.0, 0.0, -10.0, -3.5, 1.6); // Losango Superior-Esquerdo
  addPathSegment(-10.0, -3.5, -7.0, 0.0, 1.6);  // Losango Superior-Direito
  addPathSegment(-13.0, 0.0, -10.0, 3.5, 1.6);  // Losango Inferior-Esquerdo
  addPathSegment(-10.0, 3.5, -7.0, 0.0, 1.6);   // Losango Inferior-Direito
  addPathSegment(-7.0, 0.0, 0.0, 0.0, 1.6);     // Saída

  // --- 2. PISCINA 2: CAMINHO EM FORMA DE OLHO CÓSMICO (X: 0 a 20, Centro X = 10) ---
  addPathSegment(0.0, 0.0, 3.0, 0.0, 1.6); // Entrada

  // Pálpebra Superior (Curva em arco)
  addPathSegment(3.0, 0.0, 6.5, -3.2, 1.6);
  addPathSegment(6.5, -3.2, 10.0, -4.6, 1.6);
  addPathSegment(10.0, -4.6, 13.5, -3.2, 1.6);
  addPathSegment(13.5, -3.2, 17.0, 0.0, 1.6);

  // Pálpebra Inferior (Curva em arco)
  addPathSegment(3.0, 0.0, 6.5, 3.2, 1.6);
  addPathSegment(6.5, 3.2, 10.0, 4.6, 1.6);
  addPathSegment(10.0, 4.6, 13.5, 3.2, 1.6);
  addPathSegment(13.5, 3.2, 17.0, 0.0, 1.6);

  // Pupila Central Circular + Pontes Verticais da Íris
  addPathCircle(10.0, 0.0, 2.2);
  addPathSegment(10.0, -4.6, 10.0, 4.6, 1.5); // Travessa vertical através da pupila

  addPathSegment(17.0, 0.0, 20.0, 0.0, 1.6); // Saída

  // --- 3. PISCINA 3: CAMINHO EM FORMA DE CRÂNIO ARCANO (X: 20 a 40, Centro X = 30) ---
  addPathSegment(20.0, 0.0, 22.5, 0.0, 1.6); // Entrada

  // Calota Craniana Superior
  addPathSegment(22.5, 0.0, 25.0, -4.8, 1.6);
  addPathSegment(25.0, -4.8, 31.0, -4.8, 1.6);
  addPathSegment(31.0, -4.8, 33.5, -3.2, 1.6);

  // Calota Craniana Inferior
  addPathSegment(22.5, 0.0, 25.0, 4.8, 1.6);
  addPathSegment(25.0, 4.8, 31.0, 4.8, 1.6);
  addPathSegment(31.0, 4.8, 33.5, 3.2, 1.6);

  // Ponte Nasal Central (deixa as órbitas dos olhos abertas com ácido)
  addPathSegment(25.0, 0.0, 33.5, 0.0, 1.6);

  // Travessa do Maxilar
  addPathSegment(33.5, -3.2, 33.5, 3.2, 1.6);

  // 4 Dentes do Crânio
  addPathSegment(33.5, -2.4, 37.0, -2.4, 1.3);
  addPathSegment(33.5, -0.8, 37.0, -0.8, 1.3);
  addPathSegment(33.5, 0.8, 37.0, 0.8, 1.3);
  addPathSegment(33.5, 2.4, 37.0, 2.4, 1.3);

  // Barra final dos dentes unindo na saída
  addPathSegment(37.0, -2.4, 37.0, 2.4, 1.6);
  addPathSegment(37.0, 0.0, 40.0, 0.0, 1.6); // Saída

  // --- 4. PISCINA 4: CAMINHO EM FORMA DE TENTÁCULOS DO ABISMO (X: 40 a 60, Centro X = 50) ---
  addPathSegment(40.0, 0.0, 42.5, 0.0, 1.6); // Entrada

  // Núcleo Central de Cthulhu
  addPathCircle(50.0, 0.0, 2.4);

  // Tentáculo 1 (Superior-Esquerdo ondulado)
  addPathSegment(42.5, 0.0, 45.0, -4.6, 1.5);
  addPathSegment(45.0, -4.6, 50.0, -6.0, 1.5);
  addPathSegment(50.0, -6.0, 50.0, -2.4, 1.5);

  // Tentáculo 2 (Superior-Direito ondulado)
  addPathSegment(50.0, -6.0, 55.0, -4.6, 1.5);
  addPathSegment(55.0, -4.6, 57.5, 0.0, 1.5);

  // Tentáculo 3 (Inferior-Esquerdo ondulado)
  addPathSegment(42.5, 0.0, 45.0, 4.6, 1.5);
  addPathSegment(45.0, 4.6, 50.0, 6.0, 1.5);
  addPathSegment(50.0, 6.0, 50.0, 2.4, 1.5);

  // Tentáculo 4 (Inferior-Direito ondulado)
  addPathSegment(50.0, 6.0, 55.0, 4.6, 1.5);
  addPathSegment(55.0, 4.6, 57.5, 0.0, 1.5);

  // Tentáculo Central direto
  addPathSegment(42.5, 0.0, 57.5, 0.0, 1.6);
  addPathSegment(57.5, 0.0, 60.0, 0.0, 1.6); // Saída

  // --- 5. PISCINA 5: CAMINHO EM FORMA DE SOL COM RAIOS (X: 60 a 80, Centro X = 70) ---
  addPathSegment(60.0, 0.0, 63.5, 0.0, 1.6); // Entrada

  // Núcleo do Sol Central
  addPathCircle(70.0, 0.0, 2.6);

  // Anel Circular da Corona Solar (12 segmentos formando o anel de raio 5.4m)
  const sunR = 5.4;
  for (let s = 0; s < 12; s++) {
    const a1 = (s * Math.PI) / 6;
    const a2 = ((s + 1) * Math.PI) / 6;
    addPathSegment(
      70.0 + Math.cos(a1) * sunR,
      Math.sin(a1) * sunR,
      70.0 + Math.cos(a2) * sunR,
      Math.sin(a2) * sunR,
      1.5
    );
  }

  // 6 Raios Solares Curvos irradiando para as extremidades da piscina
  addPathSegment(70.0 + Math.cos(Math.PI * 0.25) * sunR, Math.sin(Math.PI * 0.25) * sunR, 76.5, 6.5, 1.4);
  addPathSegment(70.0 + Math.cos(Math.PI * 0.5) * sunR, Math.sin(Math.PI * 0.5) * sunR, 70.0, 7.6, 1.4);
  addPathSegment(70.0 + Math.cos(Math.PI * 0.75) * sunR, Math.sin(Math.PI * 0.75) * sunR, 63.5, 6.5, 1.4);
  addPathSegment(70.0 + Math.cos(Math.PI * 1.25) * sunR, Math.sin(Math.PI * 1.25) * sunR, 63.5, -6.5, 1.4);
  addPathSegment(70.0 + Math.cos(Math.PI * 1.5) * sunR, Math.sin(Math.PI * 1.5) * sunR, 70.0, -7.6, 1.4);
  addPathSegment(70.0 + Math.cos(Math.PI * 1.75) * sunR, Math.sin(Math.PI * 1.75) * sunR, 76.5, -6.5, 1.4);

  // Raios conectores internos entre o Núcleo e o Anel
  addPathSegment(63.5, 0.0, 76.5, 0.0, 1.6);
  addPathSegment(70.0, -sunR, 70.0, sunR, 1.5);

  addPathSegment(76.5, 0.0, 80.0, 0.0, 1.6); // Saída

  // --- 6. PISCINA 6: CAMINHO EM FORMA DE ÓRBITAS CONCÊNTRICAS / ESPIRAIS (X: 80 a 100, Centro X = 90) ---
  addPathSegment(80.0, 0.0, 83.0, 0.0, 1.6); // Entrada

  // Núcleo Central
  addPathCircle(90.0, 0.0, 1.6);

  // Anel Orbital Interno (raio 3.2m - 8 segmentos)
  const orbR1 = 3.2;
  for (let s = 0; s < 8; s++) {
    const a1 = (s * Math.PI) / 4;
    const a2 = ((s + 1) * Math.PI) / 4;
    addPathSegment(
      90.0 + Math.cos(a1) * orbR1,
      Math.sin(a1) * orbR1,
      90.0 + Math.cos(a2) * orbR1,
      Math.sin(a2) * orbR1,
      1.4
    );
  }

  // Anel Orbital Externo (raio 5.8m - 12 segmentos)
  const orbR2 = 5.8;
  for (let s = 0; s < 12; s++) {
    const a1 = (s * Math.PI) / 6;
    const a2 = ((s + 1) * Math.PI) / 6;
    addPathSegment(
      90.0 + Math.cos(a1) * orbR2,
      Math.sin(a1) * orbR2,
      90.0 + Math.cos(a2) * orbR2,
      Math.sin(a2) * orbR2,
      1.4
    );
  }

  // Travessas orbitais cruzadas conectando os anéis
  addPathSegment(83.0, 0.0, 97.0, 0.0, 1.6);
  addPathSegment(90.0, -orbR2, 90.0, orbR2, 1.4);
  addPathSegment(90.0 - 4.1, -4.1, 90.0 + 4.1, 4.1, 1.3);
  addPathSegment(90.0 - 4.1, 4.1, 90.0 + 4.1, -4.1, 1.3);

  addPathSegment(97.0, 0.0, 100.0, 0.0, 1.6); // Saída

  act3Group.add(pathGroup);

  // ========================================================
  // 5. A PONTE DE MAGMA ASCENDENTE (X = 120, LARGURA 4.4, COMPRIMENTO 24)
  // ========================================================
  const bridgeWidth = 4.4;
  const bridgeLength = 24.0;
  const bridgeMat = new THREE.MeshStandardMaterial({
    color: 0x3e2723,
    roughness: 0.75,
    metalness: 0.3,
  });

  const bridgeMesh = new THREE.Mesh(
    new THREE.BoxGeometry(bridgeLength, 0.45, bridgeWidth),
    bridgeMat
  );
  bridgeMesh.position.set(120, -2.5, 0); // Submersa na lava inicialmente
  act3Group.add(bridgeMesh);

  // Guarda-corpos da ponte
  const railMat = new THREE.MeshStandardMaterial({ color: 0x1f140e, metalness: 0.8 });
  const railNorth = new THREE.Mesh(new THREE.BoxGeometry(bridgeLength, 0.6, 0.2), railMat);
  railNorth.position.set(0, 0.45, -bridgeWidth / 2 + 0.1);
  bridgeMesh.add(railNorth);

  const railSouth = new THREE.Mesh(new THREE.BoxGeometry(bridgeLength, 0.6, 0.2), railMat);
  railSouth.position.set(0, 0.45, bridgeWidth / 2 - 0.1);
  bridgeMesh.add(railSouth);

  // ATENÇÃO: NÃO colocamos barreira invisível na borda da lava!
  // O jogador consegue cair livremente na lava, sofrendo morte instantânea!
  const bridge = {
    mesh: bridgeMesh,
    isRaised: false,
    isRaising: false,
    currentY: -2.5,
    targetY: 0.05,
    raise() {
      if (this.isRaised) return;
      this.isRaising = true;
    },
    update(dt) {
      if (this.isRaising && !this.isRaised) {
        this.currentY = THREE.MathUtils.lerp(this.currentY, this.targetY, dt * 3.5);
        this.mesh.position.y = this.currentY;
        if (Math.abs(this.currentY - this.targetY) < 0.05) {
          this.currentY = this.targetY;
          this.mesh.position.y = this.targetY;
          this.isRaised = true;
          this.isRaising = false;
        }
      }
    },
  };

  // ========================================================
  // 6. PAREDES DE CONTENÇÃO VULCÂNICAS (EXPANDIDAS DE -45 ATÉ 159)
  // ========================================================
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x1c212b,
    roughness: 0.95,
  });

  // Parede Norte (Z = -10.0, Comprimento = 204m, Centro X = 57)
  const northWall = new THREE.Mesh(new THREE.BoxGeometry(204, 8, 2), wallMat);
  northWall.position.set(57, 4, -10.0);
  act3Group.add(northWall);
  obstacles.push({ minX: -45, maxX: 159, minZ: -11, maxZ: -9.0 });

  // Parede Sul (Z = +10.0, Comprimento = 204m, Centro X = 57)
  const southWall = new THREE.Mesh(new THREE.BoxGeometry(204, 8, 2), wallMat);
  southWall.position.set(57, 4, 10.0);
  act3Group.add(southWall);
  obstacles.push({ minX: -45, maxX: 159, minZ: 9.0, maxZ: 11 });

  // Parede Oeste (Entrada: X = -44.5)
  const westWall = new THREE.Mesh(new THREE.BoxGeometry(2, 8, 20), wallMat);
  westWall.position.set(-44.5, 4, 0);
  act3Group.add(westWall);
  obstacles.push({ minX: -45.5, maxX: -43.5, minZ: -10, maxZ: 10 });

  // Parede Leste (Fundo do Santuário Final: X = 158.5)
  const eastWall = new THREE.Mesh(new THREE.BoxGeometry(2, 8, 20), wallMat);
  eastWall.position.set(158.5, 4, 0);
  act3Group.add(eastWall);
  obstacles.push({ minX: 157.5, maxX: 159.5, minZ: -10, maxZ: 10 });

  // ========================================================
  // 7. OS 4 ALVOS RÚNICOS SUSPENSOS SOBRE A LAVA (X ENTRE 108 E 132)
  // ========================================================
  const targetConfigs = [
    { id: 1, name: 'Fogo', symbol: '🔥', x: 113.0, z: -6.5, color: 0xff3d00, glowColor: '#ff5722' },
    { id: 2, name: 'Sangue', symbol: '🩸', x: 117.0, z: 6.5, color: 0xd50000, glowColor: '#ff1744' },
    { id: 3, name: 'Raio', symbol: '⚡', x: 123.0, z: -6.5, color: 0x00e5ff, glowColor: '#00b0ff' },
    { id: 4, name: 'Vazio', symbol: '👁️', x: 127.0, z: 6.5, color: 0xd500f9, glowColor: '#e040fb' },
  ];

  const targetMeshes = [];

  targetConfigs.forEach((tc) => {
    const pylonGroup = new THREE.Group();
    pylonGroup.position.set(tc.x, 0, tc.z);

    const baseMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 1.1, 3.5, 8),
      new THREE.MeshStandardMaterial({ color: 0x272b36, roughness: 0.8 })
    );
    baseMesh.position.y = 0.5;
    pylonGroup.add(baseMesh);

    const orbGeo = new THREE.OctahedronGeometry(0.7, 0);
    const orbMat = new THREE.MeshStandardMaterial({
      color: tc.color,
      emissive: tc.color,
      emissiveIntensity: 0.8,
      metalness: 0.8,
      roughness: 0.2,
    });
    const orbMesh = new THREE.Mesh(orbGeo, orbMat);
    orbMesh.position.set(0, 3.2, 0);
    pylonGroup.add(orbMesh);

    const pLight = new THREE.PointLight(tc.color, 2.5, 8);
    pLight.position.set(0, 3.4, 0);
    pylonGroup.add(pLight);

    act3Group.add(pylonGroup);

    targetMeshes.push({
      cfg: tc,
      group: pylonGroup,
      orb: orbMesh,
      light: pLight,
      hit: false,
    });
  });

  // ========================================================
  // 8. OBJETOS INTERATIVOS E PUZZLES
  // ========================================================

  // A. Altar da Relíquia dos Antigos (Quebra-Cabeça estilo Ruínas de Alph)
  const relicAltarGroup = new THREE.Group();
  relicAltarGroup.position.set(-26.0, 0, 0);

  const altarBase = new THREE.Mesh(
    new THREE.BoxGeometry(3.0, 1.2, 3.0),
    new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.7 })
  );
  altarBase.position.y = 0.6;
  relicAltarGroup.add(altarBase);

  const tabletGeo = new THREE.BoxGeometry(1.6, 0.2, 1.6);
  const tabletMat = new THREE.MeshStandardMaterial({
    color: 0xffd54f,
    emissive: 0xffa000,
    emissiveIntensity: 0.4,
    roughness: 0.4,
  });
  const tabletMesh = new THREE.Mesh(tabletGeo, tabletMat);
  tabletMesh.position.set(0, 1.4, 0);
  relicAltarGroup.add(tabletMesh);

  const altarLight = new THREE.PointLight(0xffb300, 3.0, 6);
  altarLight.position.set(0, 2.0, 0);
  relicAltarGroup.add(altarLight);

  act3Group.add(relicAltarGroup);
  obstacles.push({ minX: -27.8, maxX: -24.2, minZ: -1.8, maxZ: 1.8 });

  interactiveObjects.push({
    id: 'relic_puzzle_altar',
    type: 'relic_puzzle',
    x: -26.0,
    z: 0,
    radius: 3.5,
    prompt: '[E] Reconstruir Quebra-Cabeça da Relíquia',
  });

  // B. Balista Rúnica / Terminal de Tiro ao Alvo (Movida para logo após a 6ª piscina: X = 104)
  const ballistaGroup = new THREE.Group();
  ballistaGroup.position.set(104.0, 0, 0);

  const bBase = new THREE.Mesh(
    new THREE.CylinderGeometry(1.0, 1.2, 1.4, 8),
    new THREE.MeshStandardMaterial({ color: 0x455a64, roughness: 0.6, metalness: 0.5 })
  );
  bBase.position.y = 0.7;
  ballistaGroup.add(bBase);

  const bowCross = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.3, 2.4),
    new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.5 })
  );
  bowCross.position.set(0, 1.6, 0);
  ballistaGroup.add(bowCross);

  const bowAim = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.2, 0.2),
    new THREE.MeshStandardMaterial({ color: 0xffb300, emissive: 0xff6f00, emissiveIntensity: 0.6 })
  );
  bowAim.position.set(0.6, 1.6, 0);
  ballistaGroup.add(bowAim);

  const ballistaLight = new THREE.PointLight(0xff9100, 2.5, 7);
  ballistaLight.position.set(0, 2.2, 0);
  ballistaGroup.add(ballistaLight);

  act3Group.add(ballistaGroup);
  obstacles.push({ minX: 102.7, maxX: 105.3, minZ: -1.4, maxZ: 1.4 });

  interactiveObjects.push({
    id: 'target_shooting_ballista',
    type: 'target_shooting',
    x: 104.0,
    z: 0,
    radius: 3.2,
    prompt: '[E] Mirar Balista Rúnica (Tiro ao Alvo)',
  });

  // ========================================================
  // 9. AS ESCOLHAS DO DESTINO FINAL (NO SANTUÁRIO: X = 153)
  // ========================================================

  // 1. ESCOLHA 1: A PORTA ANCESTRAL (Z = -5.0, X = 153.0) -> Final #1
  const doorArchGroup = new THREE.Group();
  doorArchGroup.position.set(153.0, 0, -5.0);

  const doorArchMat = new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.7, metalness: 0.2 });
  const doorPostL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 4.2, 0.8), doorArchMat);
  doorPostL.position.set(0, 2.1, -1.6);
  doorArchGroup.add(doorPostL);

  const doorPostR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 4.2, 0.8), doorArchMat);
  doorPostR.position.set(0, 2.1, 1.6);
  doorArchGroup.add(doorPostR);

  const doorLintel = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.8, 4.0), doorArchMat);
  doorLintel.position.set(0, 4.2, 0);
  doorArchGroup.add(doorLintel);

  const doorPlankMat = new THREE.MeshStandardMaterial({ color: 0x4e342e, roughness: 0.8 });
  const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.8, 2.6), doorPlankMat);
  doorLeaf.position.set(0, 2.0, 0);
  doorArchGroup.add(doorLeaf);

  const lockMat = new THREE.MeshStandardMaterial({ color: 0xff3d00, emissive: 0xd50000, emissiveIntensity: 0.5 });
  const lockMesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.6), lockMat);
  lockMesh.position.set(-0.2, 2.0, 0);
  doorArchGroup.add(lockMesh);

  const doorLight = new THREE.PointLight(0xff5722, 2.0, 6);
  doorLight.position.set(-0.5, 2.2, 0);
  doorArchGroup.add(doorLight);

  act3Group.add(doorArchGroup);
  obstacles.push({ minX: 152.1, maxX: 153.9, minZ: -6.8, maxZ: -3.2 });

  interactiveObjects.push({
    id: 'door_choice',
    type: 'locked_demo_ending',
    endingId: 1,
    choiceName: 'A Porta Ancestral',
    x: 153.0,
    z: -5.0,
    radius: 3.2,
    prompt: '[E] A Porta Ancestral',
    dialogueSpeaker: 'A PORTA ANCESTRAL',
    dialogueText: 'Esse caminho não está disponível nesse momento.',
  });

  // 2. ESCOLHA 2: O BUEIRO FÉTIDO SUBTERRÂNEO (Z = +5.0, X = 153.0) -> Final #2
  const manholeGroup = new THREE.Group();
  manholeGroup.position.set(153.0, 0, 5.0);

  const manholeRim = new THREE.Mesh(
    new THREE.CylinderGeometry(1.6, 1.8, 0.25, 16),
    new THREE.MeshStandardMaterial({ color: 0x263238, roughness: 0.9 })
  );
  manholeRim.position.y = 0.12;
  manholeGroup.add(manholeRim);

  const manholeCover = new THREE.Mesh(
    new THREE.CylinderGeometry(1.3, 1.3, 0.28, 16),
    new THREE.MeshStandardMaterial({ color: 0x1a2327, metalness: 0.8, roughness: 0.4 })
  );
  manholeCover.position.y = 0.15;
  manholeGroup.add(manholeCover);

  const manholeLock = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.3, 0.4),
    new THREE.MeshStandardMaterial({ color: 0xd50000, emissive: 0x8b0000, emissiveIntensity: 0.5 })
  );
  manholeLock.position.set(0, 0.35, 0);
  manholeGroup.add(manholeLock);

  const manholeGlow = new THREE.Mesh(
    new THREE.RingGeometry(0.8, 1.4, 16),
    new THREE.MeshBasicMaterial({ color: 0x00e676, side: THREE.DoubleSide, transparent: true, opacity: 0.4 })
  );
  manholeGlow.rotation.x = -Math.PI / 2;
  manholeGlow.position.y = 0.3;
  manholeGroup.add(manholeGlow);

  const manholeLight = new THREE.PointLight(0x00e676, 1.8, 6);
  manholeLight.position.set(0, 1.0, 0);
  manholeGroup.add(manholeLight);

  act3Group.add(manholeGroup);
  obstacles.push({ minX: 152.1, maxX: 153.9, minZ: 4.1, maxZ: 5.9 });

  interactiveObjects.push({
    id: 'manhole_choice',
    type: 'locked_demo_ending',
    endingId: 2,
    choiceName: 'O Bueiro Fétido',
    x: 153.0,
    z: 5.0,
    radius: 3.2,
    prompt: '[E] O Bueiro Fétido',
    dialogueSpeaker: 'O BUEIRO FÉTIDO',
    dialogueText: 'Esse caminho não está disponível nesse momento.',
  });

  // 3. ESCOLHA 3: O CULTISTA SUPREMO & RITUAL DE CTHULHU (Z = 0.0, X = 153.0) -> Final #4
  const cultistShrineGroup = new THREE.Group();
  cultistShrineGroup.position.set(153.0, 0, 0);

  const cultistCircle = new THREE.Mesh(
    new THREE.RingGeometry(1.8, 2.5, 32),
    new THREE.MeshBasicMaterial({ color: 0xd500f9, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
  );
  cultistCircle.rotation.x = -Math.PI / 2;
  cultistCircle.position.y = 0.04;
  cultistShrineGroup.add(cultistCircle);

  const cultistPedestal = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 1.2, 1.6),
    new THREE.MeshStandardMaterial({ color: 0x12002b, roughness: 0.5, metalness: 0.6 })
  );
  cultistPedestal.position.y = 0.6;
  cultistShrineGroup.add(cultistPedestal);

  const cultistBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.9, 2.4, 12),
    new THREE.MeshStandardMaterial({ color: 0x240046, roughness: 0.8 })
  );
  cultistBody.position.y = 2.4;
  cultistShrineGroup.add(cultistBody);

  const cultistHood = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0x3c096c, roughness: 0.8 })
  );
  cultistHood.position.set(0, 3.8, 0);
  cultistShrineGroup.add(cultistHood);

  const cultistEyeL = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xff1744 })
  );
  cultistEyeL.position.set(-0.4, 3.75, -0.2);
  cultistShrineGroup.add(cultistEyeL);

  const cultistEyeR = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xff1744 })
  );
  cultistEyeR.position.set(-0.4, 3.75, 0.2);
  cultistShrineGroup.add(cultistEyeR);

  const cultistLight = new THREE.PointLight(0xd500f9, 4.0, 10);
  cultistLight.position.set(-0.5, 3.2, 0);
  cultistShrineGroup.add(cultistLight);

  act3Group.add(cultistShrineGroup);
  obstacles.push({ minX: 151.8, maxX: 154.2, minZ: -1.2, maxZ: 1.2 });

  interactiveObjects.push({
    id: 'cultist_choice',
    type: 'ending_choice',
    endingId: 4,
    choiceName: 'O Cultista Supremo',
    x: 153.0,
    z: 0.0,
    radius: 3.5,
    prompt: '[E] Juntar-se ao Cultista (Virar Receptáculo de Cthulhu)',
  });

  // ========================================================
  // 10. ILUMINAÇÃO AMBIENTE DINÂMICA
  // ========================================================
  const lavaLight1 = new THREE.PointLight(0xff3d00, 4.0, 22);
  lavaLight1.position.set(120, 3.5, -5);
  act3Group.add(lavaLight1);
  animatedLights.push({ light: lavaLight1, baseIntensity: 4.0, speed: 6.0 });

  const lavaLight2 = new THREE.PointLight(0xff5722, 4.0, 22);
  lavaLight2.position.set(120, 3.5, 5);
  act3Group.add(lavaLight2);
  animatedLights.push({ light: lavaLight2, baseIntensity: 4.0, speed: 7.5 });

  const acidLight1 = new THREE.PointLight(0x00e676, 3.5, 24);
  acidLight1.position.set(-10, 2.8, 0);
  act3Group.add(acidLight1);
  animatedLights.push({ light: acidLight1, baseIntensity: 3.5, speed: 4.0 });

  const acidLight2 = new THREE.PointLight(0x00e5ff, 3.5, 24);
  acidLight2.position.set(40, 2.8, 0);
  act3Group.add(acidLight2);
  animatedLights.push({ light: acidLight2, baseIntensity: 3.5, speed: 4.5 });

  const acidLight3 = new THREE.PointLight(0xd500f9, 3.5, 24);
  acidLight3.position.set(80, 2.8, 0);
  act3Group.add(acidLight3);
  animatedLights.push({ light: acidLight3, baseIntensity: 3.5, speed: 4.2 });

  scene.add(act3Group);

  return {
    group: act3Group,
    bounds,
    spawnPos: { x: -38.0, z: 0.0 },
    obstacles,
    lavaHazards,
    acidHazards,
    safePathZones,
    bridge,
    targets: targetMeshes,
    interactiveObjects,
    animatedLights,
    enemySpawnPoints,

    // Função de verificação precisa se o jogador está sobre qualquer trecho de caminho seguro
    isPlayerOnSafePath(px, pz) {
      for (let i = 0; i < safePathZones.length; i++) {
        const z = safePathZones[i];
        if (z.type === 'circle') {
          const d2 = (px - z.cx) ** 2 + (pz - z.cz) ** 2;
          if (d2 <= z.radius ** 2) return true;
        } else if (z.type === 'segment') {
          const dx = z.x2 - z.x1;
          const dz = z.z2 - z.z1;
          const l2 = dx * dx + dz * dz;
          let t = l2 > 0 ? ((px - z.x1) * dx + (pz - z.z1) * dz) / l2 : 0;
          t = Math.max(0, Math.min(1, t));
          const projX = z.x1 + t * dx;
          const projZ = z.z1 + t * dz;
          const d2 = (px - projX) ** 2 + (pz - projZ) ** 2;
          const hw = z.width / 2;
          if (d2 <= hw * hw) return true;
        }
      }
      return false;
    },

    update(dt, elapsed) {
      bridge.update(dt);

      targetMeshes.forEach((tm, i) => {
        tm.orb.rotation.y += dt * 1.5;
        tm.orb.position.y = 3.2 + Math.sin(elapsed * 2.5 + i * 1.2) * 0.25;
      });

      animatedLights.forEach((al) => {
        if (al.light) {
          al.light.intensity = al.baseIntensity + Math.sin(elapsed * al.speed) * 0.8;
        }
      });
    },
  };
}
