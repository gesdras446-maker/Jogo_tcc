import * as THREE from 'three';

export function createStreetEnvironment(scene) {
  const streetGroup = new THREE.Group();

  const streetLength = 90;
  const streetWidth = 20; // Z from -10 to +10

  // ========================================================
  // 1. FLOOR & SIDEWALKS GEOMETRY
  // ========================================================

  // A. Street Road Surface (Dark wet asphalt in the middle: Z from -4.0 to +4.0)
  const roadCanvas = document.createElement('canvas');
  roadCanvas.width = 2048;
  roadCanvas.height = 512;
  const rctx = roadCanvas.getContext('2d');

  // Dark wet asphalt base
  rctx.fillStyle = '#161920';
  rctx.fillRect(0, 0, 2048, 512);

  // Wet rain puddles
  rctx.fillStyle = '#202634';
  for (let i = 0; i < 60; i++) {
    const px = Math.random() * 2048;
    const py = 40 + Math.random() * 432;
    const pw = 40 + Math.random() * 110;
    const ph = 15 + Math.random() * 45;
    rctx.beginPath();
    rctx.ellipse(px, py, pw / 2, ph / 2, 0, 0, Math.PI * 2);
    rctx.fill();
  }

  // White road dashed center line (Z = 0)
  rctx.fillStyle = '#e0e6ed';
  for (let x = 20; x < 2048; x += 60) {
    rctx.fillRect(x, 250, 36, 6);
  }

  // Crosswalks (Pedestrian crossings at X = -30, X = 0, X = 30)
  const crosswalkXs = [240, 1024, 1800];
  crosswalkXs.forEach((cx) => {
    rctx.fillStyle = '#e8ecf2';
    for (let y = 30; y < 480; y += 32) {
      rctx.fillRect(cx, y, 70, 18);
    }
  });

  const roadTex = new THREE.CanvasTexture(roadCanvas);
  roadTex.colorSpace = THREE.SRGBColorSpace;
  const roadMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(streetLength, 8.0),
    new THREE.MeshStandardMaterial({
      map: roadTex,
      roughness: 0.3,
      metalness: 0.25,
    })
  );
  roadMesh.rotation.x = -Math.PI / 2;
  roadMesh.position.set(0, 0, 0);
  roadMesh.receiveShadow = true;
  streetGroup.add(roadMesh);

  // B. Sidewalk Texture (Tile pattern with curb line)
  const swCanvas = document.createElement('canvas');
  swCanvas.width = 1024;
  swCanvas.height = 256;
  const swctx = swCanvas.getContext('2d');

  // Concrete sidewalk base
  swctx.fillStyle = '#2b303c';
  swctx.fillRect(0, 0, 1024, 256);

  // Sidewalk stone tiles grid
  swctx.strokeStyle = '#1e222a';
  swctx.lineWidth = 2;
  for (let x = 0; x < 1024; x += 32) {
    swctx.beginPath();
    swctx.moveTo(x, 0);
    swctx.lineTo(x, 256);
    swctx.stroke();
  }
  for (let y = 0; y < 256; y += 32) {
    swctx.beginPath();
    swctx.moveTo(0, y);
    swctx.lineTo(1024, y);
    swctx.stroke();
  }

  const swTex = new THREE.CanvasTexture(swCanvas);
  swTex.wrapS = THREE.RepeatWrapping;
  swTex.wrapT = THREE.RepeatWrapping;
  swTex.repeat.set(3, 1);
  swTex.colorSpace = THREE.SRGBColorSpace;

  const sidewalkMat = new THREE.MeshStandardMaterial({
    map: swTex,
    roughness: 0.7,
    metalness: 0.1,
  });

  const curbMat = new THREE.MeshStandardMaterial({
    color: 0x485162,
    roughness: 0.8,
  });

  // Back Sidewalk (Calçada de Trás: Z from -4.0 to -10.0, elevated Y = 0.12)
  const backSidewalk = new THREE.Mesh(
    new THREE.BoxGeometry(streetLength, 0.25, 6.0),
    sidewalkMat
  );
  backSidewalk.position.set(0, 0.125, -7.0);
  backSidewalk.receiveShadow = true;
  streetGroup.add(backSidewalk);

  // Back Sidewalk Curb
  const backCurb = new THREE.Mesh(
    new THREE.BoxGeometry(streetLength, 0.28, 0.25),
    curbMat
  );
  backCurb.position.set(0, 0.14, -4.0);
  streetGroup.add(backCurb);

  // Front Sidewalk (Calçada da Frente: Z from +4.0 to +10.0, elevated Y = 0.12)
  const frontSidewalk = new THREE.Mesh(
    new THREE.BoxGeometry(streetLength, 0.25, 6.0),
    sidewalkMat
  );
  frontSidewalk.position.set(0, 0.125, 7.0);
  frontSidewalk.receiveShadow = true;
  streetGroup.add(frontSidewalk);

  // Front Sidewalk Curb
  const frontCurb = new THREE.Mesh(
    new THREE.BoxGeometry(streetLength, 0.28, 0.25),
    curbMat
  );
  frontCurb.position.set(0, 0.14, 4.0);
  streetGroup.add(frontCurb);

  // ========================================================
  // 2. REAL CITY BUILDINGS (PRÉDIOS DETALHADOS)
  // ========================================================

  const bldgTypes = [
    {
      x: -40,
      w: 8.5,
      h: 12,
      wallColor: 0x4a2e2b, // Red brick apartment
      roofColor: 0x2b1d1c,
      signText: 'RESIDENCIAL',
      signColor: '#ffa726',
      hasAwning: false,
      hasFireEscape: true,
    },
    {
      x: -30,
      w: 9.0,
      h: 15,
      wallColor: 0x263238, // Blue-gray commercial
      roofColor: 0x1a2327,
      signText: 'MERCADO 24H',
      signColor: '#29b6f6',
      hasAwning: true,
      awningColor: 0x1565c0,
      hasFireEscape: false,
    },
    {
      x: -19,
      w: 8.0,
      h: 11,
      wallColor: 0x3e2723, // Brown townhouse
      roofColor: 0x271916,
      signText: 'FARMÁCIA',
      signColor: '#66bb6a',
      hasAwning: true,
      awningColor: 0x2e7d32,
      hasFireEscape: true,
    },
    {
      x: -9,
      w: 9.5,
      h: 16,
      wallColor: 0x37474f, // Office tower
      roofColor: 0x212b30,
      signText: 'BAR & SINUCA',
      signColor: '#ff1744',
      hasAwning: true,
      awningColor: 0xb71c1c,
      hasFireEscape: false,
    },
    {
      x: 2,
      w: 9.0,
      h: 13,
      wallColor: 0x42332c, // Brick apartments
      roofColor: 0x2b211c,
      signText: 'HOTEL CENTRAL',
      signColor: '#ffd54f',
      hasAwning: false,
      hasFireEscape: true,
    },
    {
      x: 13,
      w: 10.0,
      h: 10,
      wallColor: 0x2b3834, // Commercial warehouse
      roofColor: 0x1b2421,
      signText: 'OFICINA',
      signColor: '#ff9100',
      hasAwning: false,
      hasFireEscape: false,
    },
    {
      x: 24,
      w: 8.5,
      h: 14,
      wallColor: 0x3d2c38, // Purple-brick tenement
      roofColor: 0x271c24,
      signText: 'PENSIO',
      signColor: '#ab47bc',
      hasAwning: true,
      awningColor: 0x6a1b9a,
      hasFireEscape: true,
    },
    {
      x: 35,
      w: 9.5,
      h: 12,
      wallColor: 0x2c333a, // Old abandoned building
      roofColor: 0x1b2024,
      signText: 'GALPÃO',
      signColor: '#90a4ae',
      hasAwning: false,
      hasFireEscape: false,
    },
    {
      x: 45,
      w: 8.0,
      h: 13,
      wallColor: 0x37302a, // End lot
      roofColor: 0x241f1b,
      signText: 'SAÍDA',
      signColor: '#ef5350',
      hasAwning: false,
      hasFireEscape: false,
    },
  ];

  const winMatWarm = new THREE.MeshBasicMaterial({ color: 0xffd54f });
  const winMatDim = new THREE.MeshBasicMaterial({ color: 0xff9800 });
  const winMatOff = new THREE.MeshStandardMaterial({ color: 0x10141d, roughness: 0.9 });
  const winMatCyan = new THREE.MeshBasicMaterial({ color: 0x80deea });

  bldgTypes.forEach((bldgCfg) => {
    const bldgGroup = new THREE.Group();
    bldgGroup.position.set(bldgCfg.x, 0, -9.5);

    // Main Building Body (placed directly behind the back sidewalk)
    const bldgMat = new THREE.MeshStandardMaterial({
      color: bldgCfg.wallColor,
      roughness: 0.85,
    });
    const mainBody = new THREE.Mesh(
      new THREE.BoxGeometry(bldgCfg.w, bldgCfg.h, 4.0),
      bldgMat
    );
    mainBody.position.set(0, bldgCfg.h / 2, 0);
    mainBody.castShadow = true;
    mainBody.receiveShadow = true;
    bldgGroup.add(mainBody);

    // Roof Parapet / Trim
    const roofTrim = new THREE.Mesh(
      new THREE.BoxGeometry(bldgCfg.w + 0.5, 0.5, 4.4),
      new THREE.MeshStandardMaterial({ color: bldgCfg.roofColor, roughness: 0.9 })
    );
    roofTrim.position.set(0, bldgCfg.h + 0.25, 0);
    bldgGroup.add(roofTrim);

    // Ground Floor Storefront Entrance (Térreo com porta e vitrines)
    const entranceMat = new THREE.MeshStandardMaterial({ color: 0x1a1d24, roughness: 0.7 });
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 2.8, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.6 })
    );
    door.position.set(0, 1.4, 2.05);
    bldgGroup.add(door);

    // Shop Windows on Ground Floor
    const shopWinMat = new THREE.MeshBasicMaterial({ color: 0xffecb3 });
    const shopWinL = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.0), shopWinMat);
    shopWinL.position.set(-2.4, 1.6, 2.02);
    bldgGroup.add(shopWinL);

    const shopWinR = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.0), shopWinMat);
    shopWinR.position.set(2.4, 1.6, 2.02);
    bldgGroup.add(shopWinR);

    // Fabric Awning / Canopy (Toldo)
    if (bldgCfg.hasAwning) {
      const awning = new THREE.Mesh(
        new THREE.BoxGeometry(bldgCfg.w - 1.2, 0.2, 1.4),
        new THREE.MeshStandardMaterial({ color: bldgCfg.awningColor, roughness: 0.7 })
      );
      awning.position.set(0, 3.2, 2.6);
      awning.rotation.x = 0.2;
      bldgGroup.add(awning);
    }

    // Upper Floors Windows Grid with Frames
    const winGeo = new THREE.PlaneGeometry(0.7, 0.9);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x212121 });

    for (let wy = 4.2; wy < bldgCfg.h - 1.2; wy += 1.8) {
      for (let wx = -bldgCfg.w / 2 + 1.2; wx < bldgCfg.w / 2 - 1.0; wx += 1.6) {
        // Window Frame
        const frame = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.05, 0.1), frameMat);
        frame.position.set(wx, wy, 2.02);
        bldgGroup.add(frame);

        // Glass pane (random lit / unlit)
        const rand = Math.random();
        let wMat = winMatOff;
        if (rand > 0.45) wMat = winMatWarm;
        else if (rand > 0.25) wMat = winMatDim;
        else if (rand > 0.15) wMat = winMatCyan;

        const winPane = new THREE.Mesh(winGeo, wMat);
        winPane.position.set(wx, wy, 2.08);
        bldgGroup.add(winPane);
      }
    }

    // Fire Escape (Escada de Incêndio Metálica nos prédios de apartamento)
    if (bldgCfg.hasFireEscape) {
      const ironMat = new THREE.MeshStandardMaterial({ color: 0x1f2421, metalness: 0.8 });
      for (let fy = 4.0; fy < bldgCfg.h - 1.0; fy += 3.6) {
        // Balcony Platform
        const platform = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 1.0), ironMat);
        platform.position.set(bldgCfg.w / 2 - 1.6, fy, 2.45);
        bldgGroup.add(platform);

        // Balcony Railing
        const rail = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.7, 0.08), ironMat);
        rail.position.set(bldgCfg.w / 2 - 1.6, fy + 0.35, 2.9);
        bldgGroup.add(rail);

        // Ladder
        const ladder = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.4, 0.08), ironMat);
        ladder.position.set(bldgCfg.w / 2 - 2.5, fy + 1.8, 2.8);
        ladder.rotation.z = -0.15;
        bldgGroup.add(ladder);
      }
    }

    // Luminous Shop / Building Neon Sign
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 256;
    signCanvas.height = 64;
    const sctx = signCanvas.getContext('2d');
    sctx.fillStyle = '#0a0d12';
    sctx.fillRect(0, 0, 256, 64);
    sctx.strokeStyle = bldgCfg.signColor;
    sctx.lineWidth = 4;
    sctx.strokeRect(4, 4, 248, 56);
    sctx.fillStyle = bldgCfg.signColor;
    sctx.font = 'bold 24px monospace';
    sctx.textAlign = 'center';
    sctx.fillText(bldgCfg.signText, 128, 40);

    const signTex = new THREE.CanvasTexture(signCanvas);
    const signMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 0.8),
      new THREE.MeshBasicMaterial({ map: signTex })
    );
    signMesh.position.set(0, 3.5, 2.15);
    bldgGroup.add(signMesh);

    // Subtle colored sign light
    const signLight = new THREE.PointLight(bldgCfg.signColor, 1.4, 6);
    signLight.position.set(0, 3.5, 2.8);
    bldgGroup.add(signLight);

    streetGroup.add(bldgGroup);
  });

  // ========================================================
  // 3. TREES & BUSHES (CORRETAMENTE NA CALÇADA)
  // ========================================================

  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.9 });
  const crownMatA = new THREE.MeshStandardMaterial({ color: 0x1b382b, roughness: 0.85 });
  const crownMatB = new THREE.MeshStandardMaterial({ color: 0x2d533e, roughness: 0.8 });

  function createSidewalkTree(x, z, height = 5.2) {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, 0.25, z); // On top of elevated sidewalk

    // Trunk
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.3, height * 0.6, 8),
      trunkMat
    );
    trunk.position.set(0, (height * 0.6) / 2, 0);
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // Tree Grate / Planter on Sidewalk
    const grate = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.05, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x212121, roughness: 0.9 })
    );
    grate.position.set(0, 0.02, 0);
    treeGroup.add(grate);

    // Foliage Crown
    const crown1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.5, 1), crownMatA);
    crown1.position.set(0, height * 0.65, 0);
    crown1.castShadow = true;
    treeGroup.add(crown1);

    const crown2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2, 1), crownMatB);
    crown2.position.set(0.2, height * 0.82, 0.1);
    treeGroup.add(crown2);

    const crown3 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.85, 1), crownMatA);
    crown3.position.set(-0.1, height * 0.96, -0.1);
    treeGroup.add(crown3);

    streetGroup.add(treeGroup);
    return treeGroup;
  }

  // Place Trees strictly on the BACK Sidewalk (Z = -6.2, behind curb Z = -4.0)
  const backTreeXs = [-43, -35, -25, -14, -4, 7, 18, 29, 39];
  backTreeXs.forEach((tx) => {
    createSidewalkTree(tx, -6.2, 5.0 + (Math.abs(tx) % 3) * 0.4);
  });

  // Place a few Trees on Front Sidewalk (Z = 6.8)
  const frontTreeXs = [-32, -10, 12, 34];
  frontTreeXs.forEach((tx) => {
    createSidewalkTree(tx, 6.8, 4.8);
  });

  // Detailed 3D Bushes (Moitas) on the Sidewalk
  const bushMatDark = new THREE.MeshStandardMaterial({ color: 0x143324, roughness: 0.85 });
  const bushMatLight = new THREE.MeshStandardMaterial({ color: 0x1e4632, roughness: 0.8 });

  function createSidewalkBush(x, z, scale = 1.0) {
    const bushGroup = new THREE.Group();
    bushGroup.position.set(x, 0.25, z); // On elevated sidewalk

    const clusters = [
      { r: 0.65 * scale, ox: 0, oy: 0.45 * scale, oz: 0, mat: bushMatDark },
      { r: 0.5 * scale, ox: -0.4 * scale, oy: 0.38 * scale, oz: 0.1 * scale, mat: bushMatLight },
      { r: 0.55 * scale, ox: 0.4 * scale, oy: 0.4 * scale, oz: -0.1 * scale, mat: bushMatDark },
    ];

    clusters.forEach((c) => {
      const b = new THREE.Mesh(new THREE.DodecahedronGeometry(c.r, 1), c.mat);
      b.position.set(c.ox, c.oy, c.oz);
      b.castShadow = true;
      bushGroup.add(b);
    });

    streetGroup.add(bushGroup);
    return bushGroup;
  }

  // Place Bushes strictly on the Back Sidewalk (Z from -5.0 to -6.8)
  const bushConfigs = [
    { x: -41, z: -5.4, s: 1.2 },
    { x: -37, z: -6.0, s: 1.4 },
    { x: -33, z: -5.2, s: 1.1 },
    { x: -27, z: -5.8, s: 1.3 },
    { x: -23, z: -5.4, s: 1.5 },
    { x: -16, z: -5.8, s: 1.2 },
    { x: -12, z: -5.2, s: 1.4 },
    { x: -6, z: -5.6, s: 1.3 },
    { x: 0, z: -5.3, s: 1.5 },
    { x: 5, z: -5.8, s: 1.2 },
    { x: 10, z: -5.4, s: 1.4 },
    { x: 16, z: -5.7, s: 1.3 },
    { x: 21, z: -5.3, s: 1.5 },
    { x: 27, z: -5.8, s: 1.4 },
    { x: 32, z: -5.3, s: 1.2 },
    { x: 37, z: -5.7, s: 1.5 },
    { x: 42, z: -5.4, s: 1.3 },
    // Front Sidewalk Bushes
    { x: -25, z: 6.2, s: 1.2 },
    { x: -5, z: 6.2, s: 1.2 },
    { x: 18, z: 6.2, s: 1.2 },
    { x: 38, z: 6.2, s: 1.2 },
  ];
  bushConfigs.forEach((bc) => createSidewalkBush(bc.x, bc.z, bc.s));

  // ========================================================
  // 4. AUTHENTIC STREET LIGHTING (ILUMINADA PELOS POSTES)
  // ========================================================

  // Dark atmospheric midnight blue ambient light (creates high contrast between lampposts and dark shadows!)
  const darkNightAmbient = new THREE.AmbientLight(0x0e1422, 0.45);
  streetGroup.add(darkNightAmbient);

  const poleMat = new THREE.MeshStandardMaterial({ color: 0x1f2428, metalness: 0.85 });
  const bulbGlowMat = new THREE.MeshBasicMaterial({ color: 0xffe082 });

  // Street Lampposts placed along Back Sidewalk curb (Z = -4.5) every 11 units
  const lampXs = [-38, -26, -14, -2, 10, 22, 34, 43];
  lampXs.forEach((lx) => {
    const lampGroup = new THREE.Group();
    lampGroup.position.set(lx, 0.25, -4.6);

    // Pole Base
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 0.6, 8), poleMat);
    base.position.set(0, 0.3, 0);
    lampGroup.add(base);

    // Vertical Pole
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 5.6, 8), poleMat);
    pole.position.set(0, 3.1, 0);
    lampGroup.add(pole);

    // Curved Arm reaching over the street
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 1.4), poleMat);
    arm.position.set(0, 5.8, 0.6);
    arm.rotation.x = -0.15;
    lampGroup.add(arm);

    // Lamp Lantern Head
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.3, 8), poleMat);
    head.position.set(0, 5.7, 1.2);
    head.rotation.x = Math.PI;
    lampGroup.add(head);

    // Glowing Bulb Mesh
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), bulbGlowMat);
    bulb.position.set(0, 5.55, 1.2);
    lampGroup.add(bulb);

    // Warm street light casting vivid pool of light on the road & sidewalk
    const streetLight = new THREE.PointLight(0xffb84d, 3.8, 14);
    streetLight.position.set(0, 5.4, 1.2);
    streetLight.castShadow = true;
    lampGroup.add(streetLight);

    streetGroup.add(lampGroup);
  });

  scene.add(streetGroup);

  // ========================================================
  // 5. STALKER HIDING SPOTS (PONTOS DE ESPREITA ALEATÓRIOS)
  // ========================================================
  // Multiple diverse hiding spots behind trees, bushes, and building corners
  const hidingSpots = [
    { id: 1, x: -42.0, z: -6.4, type: 'tree_bush', name: 'Atrás da Árvore Inicial' },
    { id: 2, x: -37.0, z: -6.2, type: 'bush_cluster', name: 'Escondido na Moita da Farmácia' },
    { id: 3, x: -33.5, z: -7.5, type: 'building_alley', name: 'No Beco do Mercado' },
    { id: 4, x: -28.0, z: -6.4, type: 'tree_trunk', name: 'Atrás da Árvore Comercial' },
    { id: 5, x: -23.0, z: -6.0, type: 'bush_cluster', name: 'Atrás da Moita do Sobrado' },
    { id: 6, x: -17.5, z: -7.6, type: 'building_alley', name: 'Na Sombra do Beco Escuro' },
    { id: 7, x: -13.0, z: -6.2, type: 'tree_bush', name: 'Atrás da Árvore do Bar' },
    { id: 8, x: -8.0, z: -6.0, type: 'bush_cluster', name: 'Escondido na Moita do Bar' },
    { id: 9, x: -2.5, z: -7.5, type: 'building_corner', name: 'No Canto do Prédio Central' },
    { id: 10, x: 3.0, z: -6.4, type: 'tree_trunk', name: 'Atrás da Árvore do Hotel' },
    { id: 11, x: 8.5, z: -6.2, type: 'bush_cluster', name: 'Atrás da Moita do Hotel' },
    { id: 12, x: 14.0, z: -7.5, type: 'building_alley', name: 'No Beco da Oficina' },
    { id: 13, x: 19.5, z: -6.4, type: 'tree_bush', name: 'Atrás da Árvore da Pensão' },
    { id: 14, x: 25.5, z: -6.0, type: 'bush_cluster', name: 'Escondido na Moita da Pensão' },
    { id: 15, x: 31.0, z: -7.5, type: 'building_corner', name: 'Na Sombra do Galpão Abandonado' },
    { id: 16, x: 37.0, z: -6.4, type: 'tree_bush', name: 'Atrás da Última Árvore' },
    { id: 17, x: 41.5, z: -2.0, type: 'ambush', name: 'Ponto de Emboscada Final' },
  ];

  return {
    group: streetGroup,
    bounds: {
      minX: -44.0,
      maxX: 44.0,
      minZ: -3.8, // Walking area in the street road & sidewalks
      maxZ: 4.5,
    },
    hidingSpots,
    startPlayerX: -41.0,
    triggerKidnapX: 39.5,
  };
}
