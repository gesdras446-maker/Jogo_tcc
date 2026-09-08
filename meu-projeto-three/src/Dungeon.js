import * as THREE from 'three';

// Floors (Authentic textures from src/Estrutura_da_masmorra)
import texChao1 from './Estrutura_da_masmorra/Chao.png';
import texChao2 from './Estrutura_da_masmorra/Chao2.png';
import texChao3 from './Estrutura_da_masmorra/Chao3.png';
import texChao4 from './Estrutura_da_masmorra/Chao4.png';
import texChao5 from './Estrutura_da_masmorra/Chao5.png';
import texChao6 from './Estrutura_da_masmorra/Chao6.png';
import texChao7 from './Estrutura_da_masmorra/Chao7.png';
import texChao8 from './Estrutura_da_masmorra/Chao8.png';
import texChaoLama from './Estrutura_da_masmorra/Chaocomlama.png';
import texBuraco from './Estrutura_da_masmorra/Buraco.png';
import texAcabamento from './Estrutura_da_masmorra/Acabamento.png';

// Walls & Archs & Gates
import texParede1 from './Estrutura_da_masmorra/Parede.png';
import texParede2 from './Estrutura_da_masmorra/Parede2.png';
import texParede3 from './Estrutura_da_masmorra/Parede3.png';
import texParede4 from './Estrutura_da_masmorra/Parede4.png';
import texParede5 from './Estrutura_da_masmorra/Parede5.png';
import texParedeCadaveres from './Estrutura_da_masmorra/Parede_cadaveres.png';
import texParedeInteira from './Estrutura_da_masmorra/Parede_inteira.png';
import texColuna1 from './Estrutura_da_masmorra/Coluna.png';
import texColuna2 from './Estrutura_da_masmorra/Coluna2.png';
import texColuna3 from './Estrutura_da_masmorra/Coluna3.png';
import texGrade from './Estrutura_da_masmorra/Grade.png';
import texMonumento1 from './Estrutura_da_masmorra/Monumento.png';
import texMonumento2 from './Estrutura_da_masmorra/Monumento2.png';
import texMonumento3 from './Estrutura_da_masmorra/Monumento3.png';
import texEscadaCima from './Estrutura_da_masmorra/Escada_cima.png';
import texEscadaBaixo from './Estrutura_da_masmorra/Escada_baixo.png';

// Traps (Spikes)
import spike0 from './Estrutura_da_masmorra/Armardilha/spike_0.png';
import spike1 from './Estrutura_da_masmorra/Armardilha/spike_1.png';
import spike2 from './Estrutura_da_masmorra/Armardilha/spike_2.png';
import spike3 from './Estrutura_da_masmorra/Armardilha/spike_3.png';
import spike4 from './Estrutura_da_masmorra/Armardilha/spike_4.png';

// Decorations
import torch1 from './Estrutura_da_masmorra/decoraçao/torch_1.png';
import torch2 from './Estrutura_da_masmorra/decoraçao/torch_2.png';
import torch3 from './Estrutura_da_masmorra/decoraçao/torch_3.png';
import torch4 from './Estrutura_da_masmorra/decoraçao/torch_4.png';

import candleA1 from './Estrutura_da_masmorra/decoraçao/candleA_01.png';
import candleA2 from './Estrutura_da_masmorra/decoraçao/candleA_02.png';
import candleA3 from './Estrutura_da_masmorra/decoraçao/candleA_03.png';
import candleA4 from './Estrutura_da_masmorra/decoraçao/candleA_04.png';

import caixao1 from './Estrutura_da_masmorra/decoraçao/Caixao1.png';
import caixao2 from './Estrutura_da_masmorra/decoraçao/Caixao2.png';
import caixao3 from './Estrutura_da_masmorra/decoraçao/Caixao3.png';

import pote1 from './Estrutura_da_masmorra/decoraçao/Pote.png';
import pote2 from './Estrutura_da_masmorra/decoraçao/Pote2.png';
import pote3 from './Estrutura_da_masmorra/decoraçao/Pote3.png';
import pote4 from './Estrutura_da_masmorra/decoraçao/Pote4.png';
import poteQuebrado from './Estrutura_da_masmorra/decoraçao/Potequebrado.png';

import correnteA from './Estrutura_da_masmorra/decoraçao/CorrenteA.png';
import correnteB from './Estrutura_da_masmorra/decoraçao/CorrenteB.png';

const textureLoader = new THREE.TextureLoader();

function loadDungeonTex(imgSrc, repeatX = 1, repeatY = 1) {
  const tex = textureLoader.load(imgSrc);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  if (repeatX !== 1 || repeatY !== 1) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
  }
  return tex;
}

// Seamless Cropper: Automatically crops transparent border margins from sprite PNGs
// so that repeating them creates a 100% continuous, gap-free stone floor!
function loadCroppedTex(imgSrc, repeatX = 1, repeatY = 1) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const tempC = document.createElement('canvas');
    tempC.width = img.width;
    tempC.height = img.height;
    const tCtx = tempC.getContext('2d');
    tCtx.drawImage(img, 0, 0);

    const imgData = tCtx.getImageData(0, 0, img.width, img.height);
    const data = imgData.data;

    let minX = img.width, maxX = 0, minY = img.height, maxY = 0;
    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < img.width; x++) {
        const a = data[(y * img.width + x) * 4 + 3];
        if (a > 30) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (minX <= maxX && minY <= maxY) {
      const cropW = maxX - minX + 1;
      const cropH = maxY - minY + 1;
      canvas.width = cropW;
      canvas.height = cropH;
      ctx.drawImage(img, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
    } else {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    }

    texture.needsUpdate = true;
  };
  img.src = imgSrc;

  return texture;
}

// Coffin Sprite Loader: Rotates horizontal coffin sprites 90deg onto vertical 3D sarcophagi with zero distortion
function loadCoffinTex(imgSrc) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    canvas.width = img.height;
    canvas.height = img.width;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();

    texture.needsUpdate = true;
  };
  img.src = imgSrc;

  return texture;
}

// Generate Detailed Pixel-Art Chest (Baú) Textures
function createChestTextures() {
  const bodyCanvas = document.createElement('canvas');
  bodyCanvas.width = 64;
  bodyCanvas.height = 64;
  const bCtx = bodyCanvas.getContext('2d');

  bCtx.fillStyle = '#4e2f1d';
  bCtx.fillRect(0, 0, 64, 64);

  bCtx.fillStyle = '#3a2214';
  bCtx.fillRect(0, 16, 64, 3);
  bCtx.fillRect(0, 32, 64, 3);
  bCtx.fillRect(0, 48, 64, 3);

  bCtx.fillStyle = '#5c3924';
  for (let i = 0; i < 60; i++) {
    const rx = Math.floor(Math.random() * 64);
    const ry = Math.floor(Math.random() * 64);
    bCtx.fillRect(rx, ry, Math.floor(Math.random() * 6) + 2, 1);
  }

  bCtx.fillStyle = '#222831';
  bCtx.fillRect(0, 0, 6, 64);
  bCtx.fillRect(58, 0, 6, 64);
  bCtx.fillRect(0, 0, 64, 6);
  bCtx.fillRect(0, 58, 64, 6);

  bCtx.fillStyle = '#78909c';
  [3, 30, 60].forEach((px) => {
    [3, 60].forEach((py) => {
      bCtx.fillRect(px, py, 2, 2);
    });
  });

  const bodyTex = new THREE.CanvasTexture(bodyCanvas);
  bodyTex.colorSpace = THREE.SRGBColorSpace;
  bodyTex.magFilter = THREE.NearestFilter;
  bodyTex.minFilter = THREE.NearestFilter;

  const frontCanvas = document.createElement('canvas');
  frontCanvas.width = 64;
  frontCanvas.height = 64;
  const fCtx = frontCanvas.getContext('2d');
  fCtx.drawImage(bodyCanvas, 0, 0);

  fCtx.fillStyle = '#ffd54f';
  fCtx.fillRect(26, 20, 12, 18);

  fCtx.fillStyle = '#ffb300';
  fCtx.fillRect(28, 22, 8, 14);

  fCtx.fillStyle = '#101419';
  fCtx.fillRect(30, 25, 4, 4);
  fCtx.fillRect(31, 28, 2, 5);

  const frontTex = new THREE.CanvasTexture(frontCanvas);
  frontTex.colorSpace = THREE.SRGBColorSpace;
  frontTex.magFilter = THREE.NearestFilter;
  frontTex.minFilter = THREE.NearestFilter;

  return { bodyTex, frontTex };
}

export function createDungeonEnvironment(scene) {
  const dungeonGroup = new THREE.Group();

  // Load all authentic floor textures cropped cleanly (zero black borders)
  const floorTexLama = loadCroppedTex(texChaoLama, 6, 6);
  const floorTex0 = loadCroppedTex(texChao1, 6, 6);
  const floorTex1 = loadCroppedTex(texChao2, 6, 6);
  const floorTex2 = loadCroppedTex(texChao3, 6, 6);
  const floorTex3 = loadCroppedTex(texChao4, 6, 6);
  const floorTex4 = loadCroppedTex(texChao5, 6, 6);
  const floorTex5 = loadCroppedTex(texChao6, 6, 6);
  const floorTex6 = loadCroppedTex(texChao7, 6, 6);
  const floorTex7 = loadCroppedTex(texChao8, 6, 6);

  const wallCapTexture = loadCroppedTex(texAcabamento, 4, 1);
  const wallCorpsesTexture = loadCroppedTex(texParedeCadaveres, 2, 1);
  const wallFullTexture = loadCroppedTex(texParedeInteira, 2, 1);
  const wall1Texture = loadCroppedTex(texParede1, 2, 1);
  const wall2Texture = loadCroppedTex(texParede2, 2, 1);
  const wall3Texture = loadCroppedTex(texParede3, 2, 1);
  const wall4Texture = loadCroppedTex(texParede4, 2, 1);
  const wall5Texture = loadCroppedTex(texParede5, 2, 1);

  const column1Texture = loadCroppedTex(texColuna1, 1, 1);
  const column2Texture = loadCroppedTex(texColuna2, 1, 1);
  const column3Texture = loadCroppedTex(texColuna3, 1, 1);

  const holeTexture = loadDungeonTex(texBuraco);
  const gateTexture = loadDungeonTex(texGrade);
  const monument1Tex = loadDungeonTex(texMonumento1);
  const monument2Tex = loadDungeonTex(texMonumento2);
  const monument3Tex = loadDungeonTex(texMonumento3);
  const stairsUpTex = loadDungeonTex(texEscadaCima);
  const stairsDownTex = loadDungeonTex(texEscadaBaixo);

  const spikeFrames = [
    loadDungeonTex(spike0),
    loadDungeonTex(spike1),
    loadDungeonTex(spike2),
    loadDungeonTex(spike3),
    loadDungeonTex(spike4),
  ];

  const torchFrames = [
    loadDungeonTex(torch1),
    loadDungeonTex(torch2),
    loadDungeonTex(torch3),
    loadDungeonTex(torch4),
  ];

  const candleFrames = [
    loadDungeonTex(candleA1),
    loadDungeonTex(candleA2),
    loadDungeonTex(candleA3),
    loadDungeonTex(candleA4),
  ];

  const coffinTextures = [
    loadCoffinTex(caixao1), // 0: Aberto com esqueleto
    loadCoffinTex(caixao2), // 1: Rachado
    loadCoffinTex(caixao3), // 2: Selado com runas
  ];

  const potTextures = [
    loadDungeonTex(pote1),
    loadDungeonTex(pote2),
    loadDungeonTex(pote3),
    loadDungeonTex(pote4),
    loadDungeonTex(poteQuebrado),
  ];

  const chainTextures = [
    loadDungeonTex(correnteA),
    loadDungeonTex(correnteB),
  ];

  const obstacles = [];
  const interactiveObjects = [];
  const traps = [];
  const animatedLights = [];

  // ========================================================
  // 1. FLOORS (USING AUTHENTIC TEXTURES WITH SEAMLESS CONTINUITY)
  // ========================================================
  function createFloor(minX, maxX, minZ, maxZ, floorTex) {
    const w = maxX - minX;
    const h = maxZ - minZ;
    const geo = new THREE.PlaneGeometry(w, h);

    const repeatU = Math.max(1, Math.round(w / 3.2));
    const repeatV = Math.max(1, Math.round(h / 3.2));
    const tex = floorTex.clone();
    tex.repeat.set(repeatU, repeatV);

    const mat = new THREE.MeshLambertMaterial({
      map: tex,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set((minX + maxX) / 2, 0.0, (minZ + maxZ) / 2);
    dungeonGroup.add(mesh);
  }

  // Floors using the authentic textures from Estrutura_da_masmorra!
  createFloor(-34.0, -14.0, -10.0, 10.0, floorTexLama); // Chamber 1: Muddy Stone Cell
  createFloor(-14.0, 2.0, -6.5, 6.5, floorTex0);       // Chamber 2: Stone Floor 1
  createFloor(-12.0, 12.0, 6.5, 25.5, floorTex2);      // Chamber 3: Catacombs Floor 3
  createFloor(2.0, 18.0, -6.5, 6.5, floorTex4);        // Chamber 4: Spike Gauntlet Floor 5
  createFloor(18.0, 36.0, -12.0, 12.0, floorTex3);     // Chamber 5: Grand Altar Floor 4
  createFloor(36.0, 48.0, -6.5, 6.5, floorTex1);       // Chamber 6: Chest & Escape Floor 2

  // ========================================================
  // 2. WALLS WITH TOP STONE CAP & AUTHENTIC STONE TEXTURING
  // ========================================================
  // Clean stone material for side and top caps
  const stoneTopMat = new THREE.MeshLambertMaterial({
    map: wallCapTexture,
  });

  const stoneSideMat = new THREE.MeshLambertMaterial({
    map: loadCroppedTex(texParedeInteira, 1, 1),
  });

  function createWall(x, z, width, depth, height = 3.8, frontTexture = wallFullTexture, isSolid = true) {
    const geo = new THREE.BoxGeometry(width, height, depth);

    let materials;
    if (width >= depth) {
      // Horizontal wall running along X:
      // Front and back (+Z, -Z) are the main visible faces
      const repeatU = Math.max(1, Math.round(width / 3.2));
      const frontTex = frontTexture.clone();
      frontTex.repeat.set(repeatU, 1);
      const frontMat = new THREE.MeshLambertMaterial({ map: frontTex });

      // Top cap face (+Y)
      const topTex = wallCapTexture.clone();
      topTex.repeat.set(repeatU, 1);
      const topMat = new THREE.MeshLambertMaterial({ map: topTex });

      // End caps (+X, -X) get textured stone
      const endTex = wallFullTexture.clone();
      endTex.repeat.set(Math.max(1, Math.round(depth / 3.2)), 1);
      const endMat = new THREE.MeshLambertMaterial({ map: endTex });

      // [right(+X), left(-X), top(+Y), bottom(-Y), front(+Z), back(-Z)]
      materials = [endMat, endMat, topMat, stoneSideMat, frontMat, frontMat];
    } else {
      // Vertical wall running along Z:
      // Right and left (+X, -X) are the main visible faces!
      const repeatU = Math.max(1, Math.round(depth / 3.2));
      const mainTex = frontTexture.clone();
      mainTex.repeat.set(repeatU, 1);
      const mainMat = new THREE.MeshLambertMaterial({ map: mainTex });

      // Top cap face (+Y)
      const topTex = wallCapTexture.clone();
      topTex.repeat.set(1, repeatU);
      const topMat = new THREE.MeshLambertMaterial({ map: topTex });

      // End caps (+Z, -Z) get textured stone
      const endTex = wallFullTexture.clone();
      endTex.repeat.set(Math.max(1, Math.round(width / 3.2)), 1);
      const endMat = new THREE.MeshLambertMaterial({ map: endTex });

      // [right(+X), left(-X), top(+Y), bottom(-Y), front(+Z), back(-Z)]
      materials = [mainMat, mainMat, topMat, stoneSideMat, endMat, endMat];
    }

    const mesh = new THREE.Mesh(geo, materials);
    mesh.position.set(x, height / 2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    dungeonGroup.add(mesh);

    if (isSolid) {
      obstacles.push({
        minX: x - width / 2,
        maxX: x + width / 2,
        minZ: z - depth / 2,
        maxZ: z + depth / 2,
      });
    }
    return mesh;
  }

  const W_THICK = 1.2;

  // ========================================================
  // CLEAN MODULAR ROOM WALLS (100% FLUSH JUNCTIONS / OPEN PASSAGES)
  // ========================================================

  // 1. Chamber 1 (Cela de Sacrifício): X: -34 to -14, Z: -10 to 10
  createWall(-34.6, 0.0, W_THICK, 20.0, 3.8, wall1Texture);      // West Wall
  createWall(-24.0, 10.6, 20.0, W_THICK, 3.8, wall2Texture);     // North Wall
  createWall(-24.0, -10.6, 20.0, W_THICK, 3.8, wall3Texture);    // South Wall
  createWall(-14.6, 8.55, W_THICK, 4.1, 3.8, wall1Texture);      // East Wall (North wing - flush at Z=6.5)
  createWall(-14.6, -8.55, W_THICK, 4.1, 3.8, wall1Texture);     // East Wall (South wing - flush at Z=-6.5)

  // 2. Chamber 2 (Corredor das Alavancas): X: -14 to 2, Z: -6.5 to 6.5
  // Corner seal between Chamber 1/2 and Chamber 3 (X = -14.5 to -12.1)
  createWall(-13.3, 7.1, 2.4, W_THICK, 3.8, wallCorpsesTexture);
  // (NOTE: X = -12.1 to 2.0 is 100% OPEN so the player can enter Chamber 3 / Puzzle de Cores freely!)
  createWall(-6.0, -7.1, 16.0, W_THICK, 3.8, wallCorpsesTexture);// South Wall (flush from X=-14 to X=2)

  // 3. Chamber 3 (Catacumbas dos Cristais): X: -12 to 12, Z: 6.5 to 25.5
  createWall(-12.6, 16.0, W_THICK, 18.0, 3.8, wallCorpsesTexture);// West Wall
  createWall(12.6, 16.0, W_THICK, 18.0, 3.8, wallCorpsesTexture); // East Wall
  createWall(0.0, 25.6, 24.0, W_THICK, 3.8, wall5Texture);       // North Wall
  createWall(7.3, 7.1, 10.6, W_THICK, 3.8, wall3Texture);        // South Partition (X: 2.0 to 12.6)

  // 4. Chamber 4 (Salão dos Espinhos): X: 2 to 18, Z: -6.5 to 6.5
  createWall(15.3, 7.1, 5.4, W_THICK, 3.8, wall2Texture);        // North Wall (X: 12.6 to 18.0)
  createWall(10.0, -7.1, 16.0, W_THICK, 3.8, wall2Texture);      // South Wall (X: 2.0 to 18.0, flush with Chamber 2)

  // 5. Chamber 5 (Grand Altar de Cthulhu): X: 18 to 36, Z: -12 to 12
  createWall(27.0, 12.6, 18.0, W_THICK, 4.2, wallCorpsesTexture);// North Wall
  createWall(27.0, -12.6, 18.0, W_THICK, 4.2, wallCorpsesTexture);// South Wall
  createWall(18.6, 9.85, W_THICK, 5.5, 3.8, wall1Texture);       // West Wall (North wing - flush at Z=7.1)
  createWall(18.6, -9.85, W_THICK, 5.5, 3.8, wall1Texture);      // West Wall (South wing - flush at Z=-7.1)
  createWall(36.0, 7.1, W_THICK, 11.0, 3.8, wall5Texture);       // East Wall (North partition - spans Z: 1.6 to 12.6)
  createWall(36.0, -7.1, W_THICK, 11.0, 3.8, wall5Texture);      // East Wall (South partition - spans Z: -12.6 to -1.6)

  // 6. Chamber 6 (Sala do Baú & Escadaria de Fuga): X: 36 to 48, Z: -6.5 to 6.5
  createWall(42.0, 7.1, 12.0, W_THICK, 3.8, wall3Texture);       // North Wall
  createWall(42.0, -7.1, 12.0, W_THICK, 3.8, wall3Texture);      // South Wall
  createWall(48.6, 0.0, W_THICK, 13.0, 3.8, wall5Texture);       // East End Wall

  // SOLID PILLARS (NO TRANSPARENT SIDES / CLEAN STONE TEXTURES)
  function createPillar(x, z) {
    const geo = new THREE.BoxGeometry(1.2, 3.8, 1.2);
    const colMat = new THREE.MeshLambertMaterial({
      map: column1Texture,
    });
    const materials = [
      colMat, colMat, stoneTopMat, stoneSideMat, colMat, colMat
    ];
    const mesh = new THREE.Mesh(geo, materials);
    mesh.position.set(x, 1.9, z);
    dungeonGroup.add(mesh);

    obstacles.push({
      minX: x - 0.6,
      maxX: x + 0.6,
      minZ: z - 0.6,
      maxZ: z + 0.6,
    });
  }

  // Pillars in Grand Altar Chamber
  createPillar(22.0, -7.0);
  createPillar(22.0, 7.0);
  createPillar(32.0, -7.0);
  createPillar(32.0, 7.0);

  // ========================================================
  // 3. COMPACT RANDOMIZED SPIKE TRAPS (TAMANHO: 1.3x1.3)
  // ========================================================
  const spikeCoords = [
    { x: 4.0, z: -4.5, phase: 0.0 },
    { x: 8.0, z: 4.5, phase: 0.4 },
    { x: 12.0, z: -2.0, phase: 0.8 },
    { x: 15.0, z: 3.5, phase: 0.2 },
    { x: -5.0, z: 18.0, phase: 0.6 },
    { x: 5.0, z: 21.0, phase: 0.1 },
    { x: 23.0, z: 4.5, phase: 0.7 },
  ];

  spikeCoords.forEach((sc) => {
    const sMat = new THREE.MeshBasicMaterial({
      map: spikeFrames[0],
      transparent: true,
      side: THREE.DoubleSide,
    });
    const sMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.3), sMat);
    sMesh.rotation.x = -Math.PI / 2;
    sMesh.position.set(sc.x, 0.03, sc.z);
    dungeonGroup.add(sMesh);

    traps.push({
      type: 'spike',
      mesh: sMesh,
      mat: sMat,
      spikeFrames,
      x: sc.x,
      z: sc.z,
      radius: 0.7,
      phase: sc.phase,
      isActive: false,
      damage: 35,
    });
  });

  // ========================================================
  // 4. PITFALL / HOLE TRAPS (DISTANTES EM CANTOS ESTRATÉGICOS)
  // ========================================================
  const holeCoords = [
    { x: -28.0, z: -5.5 }, // Cela de Sacrifício (espaço aberto sem encostar nas paredes)
    { x: 0.0, z: 16.0 },   // Catacumbas dos Cristais (centro aberto, longe das paredes e placas)
    { x: 6.0, z: -2.0 },   // Salão dos Espinhos (no corredor central, 3.3m de folga das paredes Z=±6.5)
    { x: 14.0, z: 2.0 },   // Salão dos Espinhos (no corredor central, 3.3m de folga das paredes Z=±6.5)
    { x: 32.0, z: -7.0 },  // Câmara do Grande Altar (área interna livre, sem encostar nas paredes)
  ];

  holeCoords.forEach((hc) => {
    const hMat = new THREE.MeshLambertMaterial({
      map: holeTexture,
      transparent: true,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const hMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), hMat);
    hMesh.rotation.x = -Math.PI / 2;
    hMesh.position.set(hc.x, 0.03, hc.z);
    dungeonGroup.add(hMesh);

    traps.push({
      type: 'hole',
      x: hc.x,
      z: hc.z,
      radius: 1.05,
      isFatal: true,
    });
  });

  // Lighting
  const dungeonAmbient = new THREE.AmbientLight(0xd4e2f0, 2.6);
  dungeonGroup.add(dungeonAmbient);

  const centerLights = [
    { x: -24, y: 4.5, z: 0, color: 0xffd180, intensity: 3.2, dist: 28 },
    { x: -6, y: 4.5, z: 0, color: 0xffb74d, intensity: 3.0, dist: 26 },
    { x: 0, y: 4.5, z: 15, color: 0x80d8ff, intensity: 3.2, dist: 28 },
    { x: 10, y: 4.5, z: 0, color: 0xffb74d, intensity: 3.0, dist: 26 },
    { x: 27, y: 5.0, z: 0, color: 0xd1c4e9, intensity: 3.8, dist: 32 },
    { x: 42, y: 4.5, z: 0, color: 0xffecb3, intensity: 3.4, dist: 26 },
  ];

  centerLights.forEach((cl) => {
    const light = new THREE.PointLight(cl.color, cl.intensity, cl.dist);
    light.position.set(cl.x, cl.y, cl.z);
    dungeonGroup.add(light);

    animatedLights.push({
      type: 'room',
      light,
      baseIntensity: cl.intensity,
    });
  });

  // Wall Torches (Self-illuminated authentic sprite meshes)
  function createTorch(x, y, z, rotY = 0) {
    const tMat = new THREE.MeshBasicMaterial({
      map: torchFrames[0],
      transparent: true,
      side: THREE.DoubleSide,
    });
    const tMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.0), tMat);
    tMesh.position.set(x, y, z);
    tMesh.rotation.y = rotY;
    dungeonGroup.add(tMesh);

    return { mesh: tMesh };
  }

  // GROUND STANDING BRAZIERS (Tochas no chão com base de coluna de pedra esculpida)
  function createGroundTorch(x, z) {
    const pedGeo = new THREE.CylinderGeometry(0.35, 0.45, 0.8, 12);
    const pedMat = new THREE.MeshLambertMaterial({ map: column1Texture });
    const pedMesh = new THREE.Mesh(pedGeo, pedMat);
    pedMesh.position.set(x, 0.4, z);
    dungeonGroup.add(pedMesh);

    obstacles.push({
      minX: x - 0.45,
      maxX: x + 0.45,
      minZ: z - 0.45,
      maxZ: z + 0.45,
    });

    const tMat = new THREE.MeshBasicMaterial({
      map: torchFrames[0],
      transparent: true,
      side: THREE.DoubleSide,
    });
    const tMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.8), tMat);
    tMesh.position.set(x, 1.3, z);
    dungeonGroup.add(tMesh);
  }

  createTorch(-34.0, 2.3, 0, Math.PI / 2);
  createTorch(-14.2, 2.3, -4.5, 0);
  createTorch(0, 2.3, 25.0, Math.PI);
  createTorch(10.0, 2.3, 9.8, Math.PI);
  createTorch(48.0, 2.3, 0, -Math.PI / 2);

  createGroundTorch(-6.0, -5.5);
  createGroundTorch(-9.0, 13.5);
  createGroundTorch(9.0, 13.5);
  createGroundTorch(23.0, -10.5);
  createGroundTorch(31.0, -10.5);

  // Candles in Altar (Com base de pedra texturizada & Hitbox Sólida!)
  function createAltarCandle(x, z) {
    const cBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.35, 0.6, 8),
      new THREE.MeshLambertMaterial({ map: column3Texture })
    );
    cBase.position.set(x, 0.3, z);
    dungeonGroup.add(cBase);

    obstacles.push({
      minX: x - 0.35,
      maxX: x + 0.35,
      minZ: z - 0.35,
      maxZ: z + 0.35,
    });

    const cMat = new THREE.MeshBasicMaterial({
      map: candleFrames[0],
      transparent: true,
      side: THREE.DoubleSide,
    });
    const cMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.3), cMat);
    cMesh.position.set(x, 0.9, z);
    dungeonGroup.add(cMesh);
  }

  createAltarCandle(24.0, -3.5);
  createAltarCandle(24.0, 3.5);
  createAltarCandle(30.0, -3.5);
  createAltarCandle(30.0, 3.5);

  // Chains
  const chainMat = new THREE.MeshBasicMaterial({
    map: chainTextures[0],
    transparent: true,
    side: THREE.DoubleSide,
  });
  const chainMeshL = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.8), chainMat);
  chainMeshL.position.set(-30, 2.0, -4.0);
  dungeonGroup.add(chainMeshL);

  const chainMeshR = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.8), chainMat);
  chainMeshR.position.set(-30, 2.0, 4.0);
  dungeonGroup.add(chainMeshR);

  // ========================================================
  // PUZZLE 1: BINARY LEVERS (ALAVANCAS)
  // ========================================================
  const binaryLevers = [
    { id: 1, x: -11.0, z: -4.0, state: 0, target: 1 },
    { id: 2, x: -8.0, z: -4.0, state: 0, target: 0 },
    { id: 3, x: -5.0, z: -4.0, state: 0, target: 1 },
    { id: 4, x: -2.0, z: -4.0, state: 0, target: 1 },
  ];

  binaryLevers.forEach((bl) => {
    const ped = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 1.2, 0.7),
      new THREE.MeshLambertMaterial({ map: column3Texture })
    );
    ped.position.set(bl.x, 0.6, bl.z);
    dungeonGroup.add(ped);

    obstacles.push({
      minX: bl.x - 0.45,
      maxX: bl.x + 0.45,
      minZ: bl.z - 0.45,
      maxZ: bl.z + 0.45,
    });

    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xff1744 });
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), bulbMat);
    bulb.position.set(bl.x, 1.35, bl.z);
    dungeonGroup.add(bulb);

    bl.bulbMat = bulbMat;
    bl.light = {
      color: {
        setHex: (hex) => bulbMat.color.setHex(hex),
      },
      intensity: 1,
    };

    interactiveObjects.push({
      id: `binary_lever_${bl.id}`,
      type: 'binary_lever',
      x: bl.x,
      z: bl.z,
      radius: 1.8,
      prompt: `[E] Alavanca Binária #${bl.id}`,
      data: bl,
    });
  });

  interactiveObjects.push({
    id: 'binary_clue_plaque',
    type: 'lore_clue',
    x: -6.5,
    z: -6.4,
    radius: 2.2,
    prompt: '[E] Ler Inscrição Arcana na Parede',
    clueSpeaker: 'INSCRIÇÃO DOS ANTIGOS',
    clueText: '📜 "Para invocar a Chave de Bronze, configure as 4 chaves no número sagrado 11 em Código Binário: [ 1 - 0 - 1 - 1 ] (8 + 2 + 1)"',
  });

  // ========================================================
  // PUZZLE 2: COLOR CRYSTALS (POETIC MYSTICAL CÂNTICO)
  // ========================================================
  const colorCrystals = [
    { id: 'red', name: '🌋 Chama Primordial', colorHex: 0xff1744, x: -7.5, z: 11.5, order: 1 },
    { id: 'blue', name: '🌊 Maré do Abismo', colorHex: 0x2979ff, x: -7.5, z: 20.5, order: 2 },
    { id: 'yellow', name: '☀️ Luz da Aurora', colorHex: 0xffea00, x: 7.5, z: 11.5, order: 3 },
    { id: 'green', name: '🌿 Raiz da Floresta', colorHex: 0x00e676, x: 7.5, z: 20.5, order: 4 },
  ];

  colorCrystals.forEach((cc) => {
    const cPillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.5, 1.6, 8),
      new THREE.MeshLambertMaterial({ map: column2Texture })
    );
    cPillar.position.set(cc.x, 0.8, cc.z);
    dungeonGroup.add(cPillar);

    obstacles.push({
      minX: cc.x - 0.5,
      maxX: cc.x + 0.5,
      minZ: cc.z - 0.5,
      maxZ: cc.z + 0.5,
    });

    const gemGeo = new THREE.OctahedronGeometry(0.35, 0);
    const gemMat = new THREE.MeshBasicMaterial({ color: cc.colorHex });
    const gemMesh = new THREE.Mesh(gemGeo, gemMat);
    gemMesh.position.set(cc.x, 1.9, cc.z);
    dungeonGroup.add(gemMesh);

    cc.gemMesh = gemMesh;
    cc.light = {
      color: {
        setHex: (hex) => gemMat.color.setHex(hex),
      },
      intensity: 1,
    };

    interactiveObjects.push({
      id: `crystal_${cc.id}`,
      type: 'color_crystal',
      x: cc.x,
      z: cc.z,
      radius: 2.0,
      prompt: `[E] Tocar ${cc.name}`,
      data: cc,
    });
  });

  interactiveObjects.push({
    id: 'color_clue_plaque',
    type: 'lore_clue',
    x: 0,
    z: 24.8,
    radius: 2.2,
    prompt: '[E] Decifrar Cântico Poético das Catacumbas',
    clueSpeaker: 'CÂNTICO DAS CATACUMBAS',
    clueText: '🔮 "No princípio do cosmos, a Chama Primordial ardeu em fúria eterna... Das cinzas do firmamento, brotaram as Águas Abissais que inundaram a criação... Sobre as marés tempestuosas, ergueu-se a Luz da Aurora que rasgou a escuridão... E no calor sagrado de seus raios, as Raízes da Floresta fincaram-se no solo profundo."',
  });

  // Sarcophagi
  const sarcophagusData = [
    { x: -9.0, z: 16.0, id: 1, hasPotion: true },
    { x: 9.0, z: 16.0, id: 2, hasPotion: true },
  ];

  sarcophagusData.forEach((sd) => {
    const cMat = new THREE.MeshStandardMaterial({
      map: coffinTextures[sd.id % coffinTextures.length],
      transparent: true,
      roughness: 0.7,
      side: THREE.DoubleSide,
    });
    const cMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.6), cMat);
    cMesh.rotation.x = -Math.PI / 2;
    cMesh.position.set(sd.x, 0.35, sd.z);
    dungeonGroup.add(cMesh);

    const baseMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 0.7, 2.4),
      new THREE.MeshLambertMaterial({ map: column2Texture })
    );
    baseMesh.position.set(sd.x, 0.35, sd.z);
    dungeonGroup.add(baseMesh);

    obstacles.push({
      minX: sd.x - 0.7,
      maxX: sd.x + 0.7,
      minZ: sd.z - 1.25,
      maxZ: sd.z + 1.25,
    });

    interactiveObjects.push({
      id: `coffin_${sd.id}`,
      type: 'coffin',
      x: sd.x,
      z: sd.z,
      radius: 2.2,
      searched: false,
      prompt: '[E] Investigar Sarcófago Antigo',
      data: sd,
    });
  });

  // POTS IN ROOM CORNERS
  const potPositions = [
    { x: -32.5, z: 8.5, tex: potTextures[0] },
    { x: -32.5, z: -8.5, tex: potTextures[1] },
    { x: -9.5, z: 8.5, tex: potTextures[2] },
    { x: 9.5, z: 8.5, tex: potTextures[3] },
    { x: 3.5, z: -8.5, tex: potTextures[0] },
    { x: 16.5, z: 8.5, tex: potTextures[4] },
    { x: 19.5, z: -10.5, tex: potTextures[1] },
    { x: 34.5, z: 10.5, tex: potTextures[2] },
  ];

  potPositions.forEach((pp, pidx) => {
    const pMat = new THREE.MeshBasicMaterial({
      map: pp.tex,
      transparent: true,
      side: THREE.DoubleSide,
    });
    const pMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.4), pMat);
    pMesh.position.set(pp.x, 0.7, pp.z);
    dungeonGroup.add(pMesh);

    obstacles.push({
      minX: pp.x - 0.5,
      maxX: pp.x + 0.5,
      minZ: pp.z - 0.5,
      maxZ: pp.z + 0.5,
    });

    interactiveObjects.push({
      id: `pot_${pidx}`,
      type: 'pot',
      x: pp.x,
      z: pp.z,
      radius: 1.6,
      searched: false,
      prompt: '[E] Quebrar / Vasculhar Ânfora (⚠️ Barulhento!)',
    });
  });

  // ========================================================
  // PUZZLE 3: CHEST (BAÚ 3D NO GRANDE ALTAR - FORA DA SAÍDA!)
  // ========================================================
  const { bodyTex, frontTex } = createChestTextures();

  const chestGroup = new THREE.Group();
  // Posicionado na alcova norte do Grande Altar de Cthulhu (fora da saída!)
  chestGroup.position.set(27.0, 0.0, 8.0);
  chestGroup.rotation.y = Math.PI;

  const chestBodyMat = [
    new THREE.MeshLambertMaterial({ map: bodyTex }),
    new THREE.MeshLambertMaterial({ map: bodyTex }),
    new THREE.MeshLambertMaterial({ map: bodyTex }),
    new THREE.MeshLambertMaterial({ map: bodyTex }),
    new THREE.MeshLambertMaterial({ map: frontTex }),
    new THREE.MeshLambertMaterial({ map: bodyTex }),
  ];

  const chestBase = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.8, 1.1),
    chestBodyMat
  );
  chestBase.position.set(0, 0.4, 0);
  chestGroup.add(chestBase);

  const lidGeo = new THREE.CylinderGeometry(0.55, 0.55, 1.6, 12, 1, false, 0, Math.PI);
  const lidMat = new THREE.MeshLambertMaterial({ map: bodyTex });
  const lidMesh = new THREE.Mesh(lidGeo, lidMat);
  lidMesh.rotation.z = Math.PI / 2;
  lidMesh.position.set(0, 0.8, 0);
  chestGroup.add(lidMesh);

  const latchMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.35, 0.1),
    new THREE.MeshLambertMaterial({ color: 0xffd700 })
  );
  latchMesh.position.set(0, 0.55, 0.58);
  chestGroup.add(latchMesh);

  dungeonGroup.add(chestGroup);

  obstacles.push({
    minX: 26.1,
    maxX: 27.9,
    minZ: 7.35,
    maxZ: 8.65,
  });

  interactiveObjects.push({
    id: 'numeric_safe',
    type: 'numeric_safe',
    x: 27.0,
    z: 8.0,
    radius: 2.2,
    prompt: '[E] Abrir Baú Trancado por Segredo Numérico',
    unlocked: false,
  });

  // 3 POETIC MONUMENT CLUES (COM BASES DE COLUNA DE PEDRA)
  const monumentClues = [
    {
      x: -30.0,
      z: 7.5,
      clue: '🏛️ Monumento I: "Contai os mares do mundo e as cabeças da Serpente Abissal que assolam os navegantes... Este número ímpar e sagrado inicia o segredo do baú."',
      tex: monument2Tex,
    },
    {
      x: 10.0,
      z: -8.5,
      clue: '🏛️ Monumento II: "Nem par, nem solitário; sou a trindade dos Anciões que dormem além das estrelas, o menor dos números primos ímpares..."',
      tex: monument3Tex,
    },
    {
      x: 32.0,
      z: -10.0,
      clue: '🏛️ Monumento III: "Sou o último dos dígitos antes do vazio das dezenas, o quadrado perfeito da sagrada trindade..."',
      tex: monument3Tex,
    },
  ];

  monumentClues.forEach((mc, idx) => {
    const mBase = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.4, 1.2),
      new THREE.MeshLambertMaterial({ map: column1Texture })
    );
    mBase.position.set(mc.x, 0.2, mc.z);
    dungeonGroup.add(mBase);

    const mMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.0, 3.0),
      new THREE.MeshBasicMaterial({ map: mc.tex, transparent: true, side: THREE.DoubleSide })
    );
    mMesh.position.set(mc.x, 1.7, mc.z);
    dungeonGroup.add(mMesh);

    obstacles.push({
      minX: mc.x - 0.9,
      maxX: mc.x + 0.9,
      minZ: mc.z - 0.7,
      maxZ: mc.z + 0.7,
    });

    interactiveObjects.push({
      id: `monument_clue_${idx + 1}`,
      type: 'lore_clue',
      x: mc.x,
      z: mc.z,
      radius: 2.2,
      prompt: `[E] Examinar Enigma no Monumento #${idx + 1}`,
      clueSpeaker: `MONUMENTO SAGRADO #${idx + 1}`,
      clueText: mc.clue,
    });
  });

  // ========================================================
  // 5. GRAND ALTAR & PEDESTALS (COM BASES DE PEDRA TEXTURIZADAS)
  // ========================================================
  const mainAltarBase = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 0.8, 1.6),
    new THREE.MeshLambertMaterial({ map: column2Texture })
  );
  mainAltarBase.position.set(27.0, 0.4, 0);
  dungeonGroup.add(mainAltarBase);

  const mainAltarMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(4.0, 5.2),
    new THREE.MeshBasicMaterial({
      map: monument1Tex,
      transparent: true,
      side: THREE.DoubleSide,
    })
  );
  mainAltarMesh.position.set(27.0, 2.6, 0);
  dungeonGroup.add(mainAltarMesh);

  // HITBOX FOR MAIN ALTAR
  obstacles.push({
    minX: 25.0,
    maxX: 29.0,
    minZ: -1.0,
    maxZ: 1.0,
  });

  const pedestals = [
    { id: 1, name: 'Chave de Bronze (Binário)', requiredItem: 'bronze_key', x: 25.0, z: -5.0, active: false, tex: monument2Tex },
    { id: 2, name: 'Runa de Cthulhu (Cores)', requiredItem: 'cthulhu_rune', x: 27.0, z: -6.0, active: false, tex: monument3Tex },
    { id: 3, name: 'Emblema do Culto (Baú)', requiredItem: 'cultist_emblem', x: 29.0, z: -5.0, active: false, tex: monument2Tex },
  ];

  pedestals.forEach((ped) => {
    const pedBase = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.9, 1.2),
      new THREE.MeshLambertMaterial({ map: column3Texture })
    );
    pedBase.position.set(ped.x, 0.45, ped.z);
    dungeonGroup.add(pedBase);

    // SOLID HITBOX FOR PEDESTAL
    obstacles.push({
      minX: ped.x - 0.8,
      maxX: ped.x + 0.8,
      minZ: ped.z - 0.7,
      maxZ: ped.z + 0.7,
    });

    const pMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.8, 2.6),
      new THREE.MeshBasicMaterial({
        map: ped.tex,
        transparent: true,
        side: THREE.DoubleSide,
      })
    );
    pMesh.position.set(ped.x, 1.6, ped.z);
    dungeonGroup.add(pMesh);

    ped.light = { intensity: 0 };

    interactiveObjects.push({
      id: `pedestal_${ped.id}`,
      type: 'pedestal',
      x: ped.x,
      z: ped.z,
      radius: 2.0,
      prompt: `[E] Inserir Selo no Pedestal #${ped.id}`,
      data: ped,
    });
  });

  // Escape Gate (Impede 100% o acesso à escadaria de fuga sem resolver os enigmas)
  const gateMat = new THREE.MeshBasicMaterial({
    map: gateTexture,
    transparent: true,
    side: THREE.DoubleSide,
  });
  const gateMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.8), gateMat);
  gateMesh.position.set(36.0, 1.9, 0);
  gateMesh.rotation.y = Math.PI / 2;
  dungeonGroup.add(gateMesh);

  const gateObstacle = {
    minX: 35.4,
    maxX: 36.6,
    minZ: -1.6,
    maxZ: 1.6,
  };
  obstacles.push(gateObstacle);

  interactiveObjects.push({
    id: 'escape_gate',
    type: 'gate',
    x: 36.0,
    z: 0,
    radius: 2.6,
    prompt: '[E] Abrir Grande Portão de Ferro',
    isOpen: false,
    mesh: gateMesh,
    obstacle: gateObstacle,
  });

  // Escape Stairs
  const stairsMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(4.0, 5.6),
    new THREE.MeshLambertMaterial({
      map: stairsUpTex,
      transparent: true,
      side: THREE.DoubleSide,
    })
  );
  stairsMesh.rotation.x = -Math.PI / 2;
  stairsMesh.position.set(46.0, 0.05, 0);
  dungeonGroup.add(stairsMesh);

  // Spawn Straw Bed in Cell
  const spawnStairsMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2.8, 2.8),
    new THREE.MeshLambertMaterial({ map: stairsDownTex, transparent: true })
  );
  spawnStairsMesh.rotation.x = -Math.PI / 2;
  spawnStairsMesh.position.set(-28.0, 0.02, 0);
  dungeonGroup.add(spawnStairsMesh);

  dungeonGroup.visible = false;
  scene.add(dungeonGroup);

  const enemySpawnPoints = [
    { x: -1.0, z: -1.5, name: 'Blood Monster Alfa', patrolRadius: 3.5 },
    { x: -4.0, z: 14.0, name: 'Blood Monster das Catacumbas', patrolRadius: 4.5 },
    { x: 4.0, z: 16.0, name: 'Blood Monster Carniceiro', patrolRadius: 4.0 },
    { x: 10.0, z: 0.0, name: 'Blood Monster do Labirinto', patrolRadius: 3.5 },
    { x: 23.0, z: -3.0, name: 'Blood Monster Devorador', patrolRadius: 3.5 },
    { x: 31.0, z: 3.0, name: 'Blood Monster Guardião', patrolRadius: 4.0 },
  ];

  return {
    group: dungeonGroup,
    obstacles,
    interactiveObjects,
    traps,
    animatedLights,
    enemySpawnPoints,
    binaryLevers,
    colorCrystals,
    pedestals,
    spawnPos: { x: -28.0, z: 0.0 },
    altarPos: { x: -20.0, z: 0.0 },
    exitPos: { x: 46.0, z: 0.0 },
    bounds: {
      minX: -33.5,
      maxX: 48.5,
      minZ: -11.5,
      maxZ: 24.5,
    },
  };
}
