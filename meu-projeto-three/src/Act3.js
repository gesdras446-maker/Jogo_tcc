import * as THREE from 'three';

export function createAct3Environment(scene) {
  const act3Group = new THREE.Group();
  act3Group.visible = false;

  const bounds = {
    minX: -44.0,
    maxX: 44.0,
    minZ: -10.0,
    maxZ: 10.0,
  };

  const obstacles = [];
  const lavaHazards = [];
  const acidHazards = [];
  const interactiveObjects = [];
  const animatedLights = [];
  const enemySpawnPoints = [
    { x: -16.0, z: -3.0, name: 'Monstro Magmático Cego Alfa', patrolRadius: 4.5 },
    { x: 30.0, z: 2.0, name: 'Guardião Cego do Portal', patrolRadius: 3.5 },
  ];

  // ========================================================
  // 1. PROCEDURAL VOLCANIC BASALT TEXTURES
  // ========================================================
  // Basalt Floor Texture
  const basaltCanvas = document.createElement('canvas');
  basaltCanvas.width = 512;
  basaltCanvas.height = 512;
  const bctx = basaltCanvas.getContext('2d');
  bctx.fillStyle = '#171920';
  bctx.fillRect(0, 0, 512, 512);

  // Volcanic cracks and dark stone tiles
  bctx.strokeStyle = '#222733';
  bctx.lineWidth = 3;
  for (let x = 0; x < 512; x += 64) {
    bctx.beginPath();
    bctx.moveTo(x, 0);
    bctx.lineTo(x, 512);
    bctx.stroke();
  }
  for (let y = 0; y < 512; y += 64) {
    bctx.beginPath();
    bctx.moveTo(0, y);
    bctx.lineTo(512, y);
    bctx.stroke();
  }

  // Magma glowing fractures
  bctx.strokeStyle = 'rgba(255, 69, 0, 0.4)';
  bctx.lineWidth = 1.5;
  for (let i = 0; i < 20; i++) {
    const sx = Math.random() * 512;
    const sy = Math.random() * 512;
    bctx.beginPath();
    bctx.moveTo(sx, sy);
    bctx.lineTo(sx + (Math.random() - 0.5) * 40, sy + (Math.random() - 0.5) * 40);
    bctx.stroke();
  }

  const basaltTex = new THREE.CanvasTexture(basaltCanvas);
  basaltTex.wrapS = THREE.RepeatWrapping;
  basaltTex.wrapT = THREE.RepeatWrapping;
  basaltTex.repeat.set(8, 4);

  const basaltMat = new THREE.MeshStandardMaterial({
    map: basaltTex,
    roughness: 0.85,
    metalness: 0.15,
  });

  // Lava Texture
  const lavaCanvas = document.createElement('canvas');
  lavaCanvas.width = 512;
  lavaCanvas.height = 512;
  const lctx = lavaCanvas.getContext('2d');
  const lGrad = lctx.createRadialGradient(256, 256, 20, 256, 256, 300);
  lGrad.addColorStop(0, '#fff3e0');
  lGrad.addColorStop(0.2, '#ff9100');
  lGrad.addColorStop(0.6, '#ff3d00');
  lGrad.addColorStop(1, '#b71c1c');
  lctx.fillStyle = lGrad;
  lctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 40; i++) {
    lctx.fillStyle = 'rgba(255, 235, 59, 0.6)';
    lctx.beginPath();
    lctx.arc(Math.random() * 512, Math.random() * 512, 6 + Math.random() * 18, 0, Math.PI * 2);
    lctx.fill();
  }

  const lavaTex = new THREE.CanvasTexture(lavaCanvas);
  lavaTex.wrapS = THREE.RepeatWrapping;
  lavaTex.wrapT = THREE.RepeatWrapping;
  lavaTex.repeat.set(4, 2);

  const lavaMat = new THREE.MeshBasicMaterial({
    map: lavaTex,
  });

  // Acid Pool Texture
  const acidCanvas = document.createElement('canvas');
  acidCanvas.width = 256;
  acidCanvas.height = 256;
  const actx = acidCanvas.getContext('2d');
  actx.fillStyle = '#004d40';
  actx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 30; i++) {
    actx.fillStyle = 'rgba(0, 230, 118, 0.7)';
    actx.beginPath();
    actx.arc(Math.random() * 256, Math.random() * 256, 4 + Math.random() * 14, 0, Math.PI * 2);
    actx.fill();
  }
  const acidTex = new THREE.CanvasTexture(acidCanvas);
  const acidMat = new THREE.MeshBasicMaterial({
    map: acidTex,
  });

  // ========================================================
  // 2. CHAMBERS & PLATFORMS GEOMETRY
  // ========================================================

  // A. Entrance & Chamber 1 Platform (X: -44 to +6, Z: -9 to +9)
  const chamber1Floor = new THREE.Mesh(
    new THREE.BoxGeometry(50, 0.5, 18),
    basaltMat
  );
  chamber1Floor.position.set(-19, -0.25, 0);
  act3Group.add(chamber1Floor);

  // B. Large Boiling Lava River Chasm (X: +6 to +24, Z: -12 to +12)
  const lavaChasm = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 24),
    lavaMat
  );
  lavaChasm.rotation.x = -Math.PI / 2;
  lavaChasm.position.set(15, -0.15, 0);
  act3Group.add(lavaChasm);

  // Lava Hazard Area (damages player if stepped inside chasm when bridge is down)
  lavaHazards.push({
    minX: 6.0,
    maxX: 24.0,
    minZ: -10.0,
    maxZ: 10.0,
    damage: 35,
  });

  // C. Exit Island / Sanctuary Platform (X: +24 to +44, Z: -9 to +9)
  const exitIsland = new THREE.Mesh(
    new THREE.BoxGeometry(20, 0.5, 18),
    basaltMat
  );
  exitIsland.position.set(34, -0.25, 0);
  act3Group.add(exitIsland);

  // D. Toxic Acid Pool in Chamber 1 (X: -12 to -4, Z: -6 to -1)
  const acidPoolMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 5),
    acidMat
  );
  acidPoolMesh.rotation.x = -Math.PI / 2;
  acidPoolMesh.position.set(-8, 0.02, -3.5);
  act3Group.add(acidPoolMesh);

  // Border stone trim around acid pool
  const acidTrim = new THREE.Mesh(
    new THREE.RingGeometry(2.5, 3.2, 4),
    new THREE.MeshStandardMaterial({ color: 0x263238, roughness: 0.9 })
  );
  acidTrim.rotation.x = -Math.PI / 2;
  acidTrim.position.set(-8, 0.04, -3.5);
  act3Group.add(acidTrim);

  acidHazards.push({
    minX: -12.0,
    maxX: -4.0,
    minZ: -6.0,
    maxZ: -1.0,
    damage: 25,
  });

  // ========================================================
  // 3. THE RISING MAGMA BRIDGE
  // ========================================================
  // Starts submerged in lava at y = -2.5. Rises to y = 0.05 when targets are solved!
  const bridgeWidth = 4.4;
  const bridgeLength = 18.0;
  const bridgeMat = new THREE.MeshStandardMaterial({
    color: 0x3e2723,
    roughness: 0.75,
    metalness: 0.3,
  });

  const bridgeMesh = new THREE.Mesh(
    new THREE.BoxGeometry(bridgeLength, 0.45, bridgeWidth),
    bridgeMat
  );
  bridgeMesh.position.set(15, -2.5, 0); // Submerged initially
  act3Group.add(bridgeMesh);

  // Bridge Side Railings (emerge with bridge)
  const railMat = new THREE.MeshStandardMaterial({ color: 0x1f140e, metalness: 0.8 });
  const railNorth = new THREE.Mesh(new THREE.BoxGeometry(bridgeLength, 0.6, 0.2), railMat);
  railNorth.position.set(0, 0.45, -bridgeWidth / 2 + 0.1);
  bridgeMesh.add(railNorth);

  const railSouth = new THREE.Mesh(new THREE.BoxGeometry(bridgeLength, 0.6, 0.2), railMat);
  railSouth.position.set(0, 0.45, bridgeWidth / 2 - 0.1);
  bridgeMesh.add(railSouth);

  // Obstacle that blocks crossing while bridge is submerged
  const bridgeChasmObstacle = {
    minX: 6.0,
    maxX: 24.0,
    minZ: -bridgeWidth / 2,
    maxZ: bridgeWidth / 2,
  };
  obstacles.push(bridgeChasmObstacle);

  const bridge = {
    mesh: bridgeMesh,
    obstacle: bridgeChasmObstacle,
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
        this.currentY = THREE.MathUtils.lerp(this.currentY, this.targetY, dt * 2.5);
        this.mesh.position.y = this.currentY;
        if (Math.abs(this.currentY - this.targetY) < 0.05) {
          this.currentY = this.targetY;
          this.mesh.position.y = this.targetY;
          this.isRaised = true;
          this.isRaising = false;
          // Remove barrier obstacle so player can cross
          const idx = obstacles.indexOf(this.obstacle);
          if (idx !== -1) obstacles.splice(idx, 1);
        }
      }
    },
  };

  // ========================================================
  // 4. BOUNDARY VOLCANIC WALLS
  // ========================================================
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x1c212b,
    roughness: 0.95,
  });

  // North Wall (Z = -9.5)
  const northWall = new THREE.Mesh(new THREE.BoxGeometry(90, 8, 2), wallMat);
  northWall.position.set(0, 4, -10.0);
  act3Group.add(northWall);
  obstacles.push({ minX: -45, maxX: 45, minZ: -11, maxZ: -9.0 });

  // South Wall (Z = +9.5)
  const southWall = new THREE.Mesh(new THREE.BoxGeometry(90, 8, 2), wallMat);
  southWall.position.set(0, 4, 10.0);
  act3Group.add(southWall);
  obstacles.push({ minX: -45, maxX: 45, minZ: 9.0, maxZ: 11 });

  // West Wall (Entrance boundary: X = -44.5)
  const westWall = new THREE.Mesh(new THREE.BoxGeometry(2, 8, 20), wallMat);
  westWall.position.set(-44.5, 4, 0);
  act3Group.add(westWall);
  obstacles.push({ minX: -45.5, maxX: -43.5, minZ: -10, maxZ: 10 });

  // East Wall (Behind Exit Portal: X = 44.5)
  const eastWall = new THREE.Mesh(new THREE.BoxGeometry(2, 8, 20), wallMat);
  eastWall.position.set(44.5, 4, 0);
  act3Group.add(eastWall);
  obstacles.push({ minX: 43.5, maxX: 45.5, minZ: -10, maxZ: 10 });

  // ========================================================
  // 5. THE 4 TARGET RUNES SUSPENDED OVER THE LAVA
  // ========================================================
  // 1: Fogo (Red), 2: Sangue (Crimson), 3: Raio (Cyan), 4: Vazio (Purple)
  const targetConfigs = [
    { id: 1, name: 'Fogo', symbol: '🔥', x: 10.0, z: -6.5, color: 0xff3d00, glowColor: '#ff5722' },
    { id: 2, name: 'Sangue', symbol: '🩸', x: 14.0, z: 6.5, color: 0xd50000, glowColor: '#ff1744' },
    { id: 3, name: 'Raio', symbol: '⚡', x: 18.0, z: -6.5, color: 0x00e5ff, glowColor: '#00b0ff' },
    { id: 4, name: 'Vazio', symbol: '👁️', x: 21.0, z: 6.5, color: 0xd500f9, glowColor: '#e040fb' },
  ];

  const targetMeshes = [];

  targetConfigs.forEach((tc) => {
    const pylonGroup = new THREE.Group();
    pylonGroup.position.set(tc.x, 0, tc.z);

    // Stone Base emerging from lava
    const baseMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 1.1, 3.5, 8),
      new THREE.MeshStandardMaterial({ color: 0x272b36, roughness: 0.8 })
    );
    baseMesh.position.y = 0.5;
    pylonGroup.add(baseMesh);

    // Floating Orb / Target Crystal
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

    // Glowing Point Light
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
  // 6. INTERACTIVE ALTARS & PROPS
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

  // Floating ancient glyph tablet
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

  // B. Balista Rúnica / Terminal de Tiro ao Alvo
  const ballistaGroup = new THREE.Group();
  ballistaGroup.position.set(3.5, 0, 0);

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
  obstacles.push({ minX: 2.2, maxX: 4.8, minZ: -1.4, maxZ: 1.4 });

  interactiveObjects.push({
    id: 'target_shooting_ballista',
    type: 'target_shooting',
    x: 3.5,
    z: 0,
    radius: 3.2,
    prompt: '[E] Mirar Balista Rúnica (Tiro ao Alvo)',
  });

  // C. Inscrição da Sequência Sagrada (Monumento de Pista)
  const clueGroup = new THREE.Group();
  clueGroup.position.set(-8.0, 0, 5.0);

  const cMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 2.4, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x2e3542, roughness: 0.7 })
  );
  cMesh.position.y = 1.2;
  clueGroup.add(cMesh);

  act3Group.add(clueGroup);
  obstacles.push({ minX: -8.8, maxX: -7.2, minZ: 4.4, maxZ: 5.6 });

  interactiveObjects.push({
    id: 'target_clue_monument',
    type: 'lore_clue',
    clueSpeaker: 'INSCRIÇÃO DOS 4 PILARES',
    clueText:
      '📜 "Para que a Ponte de Basalto desperte das chamas, invoque os 4 Pilares na sagrada ordem: 1º FOGO 🔥, 2º SANGUE 🩸, 3º RAIO ⚡, 4º VAZIO 👁️!"',
    x: -8.0,
    z: 5.0,
    radius: 2.8,
    prompt: '[E] Ler Inscrição dos 4 Pilares',
  });

  // D. Fonte de Sangue Curativo (Recupera Vida)
  const fountainGroup = new THREE.Group();
  fountainGroup.position.set(-16.0, 0, 5.5);

  const fountainBasin = new THREE.Mesh(
    new THREE.CylinderGeometry(1.3, 1.5, 0.8, 12),
    new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.6 })
  );
  fountainBasin.position.y = 0.4;
  fountainGroup.add(fountainBasin);

  const bloodWater = new THREE.Mesh(
    new THREE.CylinderGeometry(1.1, 1.1, 0.1, 12),
    new THREE.MeshBasicMaterial({ color: 0xb71c1c })
  );
  bloodWater.position.y = 0.8;
  fountainGroup.add(bloodWater);

  act3Group.add(fountainGroup);
  obstacles.push({ minX: -17.5, maxX: -14.5, minZ: 4.2, maxZ: 6.8 });

  interactiveObjects.push({
    id: 'healing_fountain',
    type: 'healing_source',
    searched: false,
    x: -16.0,
    z: 5.5,
    radius: 3.0,
    prompt: '[E] Beber Sangue Vital da Fonte (+40 HP)',
  });

  // E. Grande Portal de Fuga dos Antigos (Na ilha final além da ponte)
  const portalGroup = new THREE.Group();
  portalGroup.position.set(38.0, 0, 0);

  // Arch pillars
  const pArchMat = new THREE.MeshStandardMaterial({ color: 0x263238, roughness: 0.6, metalness: 0.3 });
  const pLeft = new THREE.Mesh(new THREE.BoxGeometry(0.8, 5.0, 0.8), pArchMat);
  pLeft.position.set(0, 2.5, -2.2);
  portalGroup.add(pLeft);

  const pRight = new THREE.Mesh(new THREE.BoxGeometry(0.8, 5.0, 0.8), pArchMat);
  pRight.position.set(0, 2.5, 2.2);
  portalGroup.add(pRight);

  const pTop = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.8, 5.2), pArchMat);
  pTop.position.set(0, 5.2, 0);
  portalGroup.add(pTop);

  // Swirling Portal Energy Plane
  const pEnergyMat = new THREE.MeshBasicMaterial({
    color: 0x00e5ff,
    side: THREE.DoubleSide,
  });
  const portalEnergy = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 4.4), pEnergyMat);
  portalEnergy.position.set(0, 2.6, 0);
  portalEnergy.rotation.y = Math.PI / 2;
  portalGroup.add(portalEnergy);

  const portalLight = new THREE.PointLight(0x00e5ff, 4.0, 10);
  portalLight.position.set(0, 2.8, 0);
  portalGroup.add(portalLight);

  act3Group.add(portalGroup);
  obstacles.push({ minX: 37.2, maxX: 38.8, minZ: -2.8, maxZ: -1.6 });
  obstacles.push({ minX: 37.2, maxX: 38.8, minZ: 1.6, maxZ: 2.8 });

  interactiveObjects.push({
    id: 'escape_portal',
    type: 'escape_portal',
    x: 38.0,
    z: 0,
    radius: 3.5,
    prompt: '[E] Atravessar Portal Sagrado (Escapar com Vida!)',
  });

  // ========================================================
  // 7. AMBIENT VOLCANIC PARTICLES & LIGHTS
  // ========================================================
  const lavaLight1 = new THREE.PointLight(0xff3d00, 4.0, 22);
  lavaLight1.position.set(15, 3.5, -5);
  act3Group.add(lavaLight1);
  animatedLights.push({ light: lavaLight1, baseIntensity: 4.0, speed: 6.0 });

  const lavaLight2 = new THREE.PointLight(0xff5722, 4.0, 22);
  lavaLight2.position.set(15, 3.5, 5);
  act3Group.add(lavaLight2);
  animatedLights.push({ light: lavaLight2, baseIntensity: 4.0, speed: 7.5 });

  const acidLight = new THREE.PointLight(0x00e676, 3.0, 12);
  acidLight.position.set(-8, 2.0, -3.5);
  act3Group.add(acidLight);
  animatedLights.push({ light: acidLight, baseIntensity: 3.0, speed: 4.0 });

  scene.add(act3Group);

  return {
    group: act3Group,
    bounds,
    spawnPos: { x: -38.0, z: 0.0 },
    obstacles,
    lavaHazards,
    acidHazards,
    bridge,
    targets: targetMeshes,
    interactiveObjects,
    animatedLights,
    enemySpawnPoints,
    update(dt, elapsed) {
      bridge.update(dt);

      // Animate floating crystal targets
      targetMeshes.forEach((tm, i) => {
        tm.orb.rotation.y += dt * 1.5;
        tm.orb.position.y = 3.2 + Math.sin(elapsed * 2.5 + i * 1.2) * 0.25;
      });

      // Animate swirling portal
      if (portalEnergy) {
        portalLight.intensity = 3.5 + Math.sin(elapsed * 5) * 0.8;
      }
    },
  };
}
