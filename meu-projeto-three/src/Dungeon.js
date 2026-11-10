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
import texGradeBuraco from './Estrutura_da_masmorra/Grade_buraco.png';
import texCoredor from './Estrutura_da_masmorra/Coredor.png';
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
  tex.minFilter = THREE.LinearFilter;
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
  texture.minFilter = THREE.LinearFilter;
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
  const holeCamoTexture = loadDungeonTex(texGradeBuraco);  // Textura de buraco disfarçado (grade sobre o buraco)
  const corridorTexture = loadDungeonTex(texCoredor);       // Textura de corredor para variação visual
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
    mat.polygonOffset = true;
    mat.polygonOffsetFactor = 2;
    mat.polygonOffsetUnits = 2;
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set((minX + maxX) / 2, 0.0, (minZ + maxZ) / 2);
    dungeonGroup.add(mesh);
  }

  // 1. Chamber 1: Cela de Sacrifício
  createFloor(-50.0, -30.0, -10.0, 10.0, floorTexLama);

  // CORREDOR 1 (FORMATO U — LARGO COM NICHOS): Câmara 1 <-> Câmara 2
  // Trecho central largo (6u) com dois nichos laterais no meio
  createFloor(-30.0, -8.0, -2.0, 2.0, floorTex0);     // Faixa central (4u de largura)
  createFloor(-24.0, -18.0, -5.0, -2.0, floorTex0);   // Nicho norte (alargamento à esquerda)
  createFloor(-24.0, -18.0, 2.0, 5.0, floorTex0);     // Nicho sul (alargamento à direita)

  // 2. Chamber 2: Corredor das Alavancas Binárias
  createFloor(-8.0, 8.0, -6.5, 6.5, floorTex0);

  // CORREDOR 2 (RETO LARGO): Câmara 2 <-> Câmara 3 (5u de largura para diferenciar)
  createFloor(-2.5, 2.5, 6.5, 28.5, floorTex2);

  // 3. Chamber 3: Catacumbas dos Cristais
  createFloor(-12.0, 12.0, 28.5, 48.5, floorTex2);

  // CORREDOR 3 (FORMATO T — ALARGAMENTO CENTRAL): Câmara 2 <-> Câmara 4
  // Faixa central reta (4u de largura)
  createFloor(8.0, 30.0, -2.0, 2.0, floorTex4);       // Faixa central
  createFloor(16.0, 24.0, 2.0, 7.0, floorTex4);       // Câmara de descanso norte
  createFloor(16.0, 24.0, -7.0, -2.0, floorTex4);     // Câmara de descanso sul

  // 4. Chamber 4: Salão dos Espinhos
  createFloor(30.0, 46.0, -6.5, 6.5, floorTex4);

  // CORREDOR 4 (RETO): Câmara 4 <-> Câmara 5
  createFloor(46.0, 68.0, -2.0, 2.0, floorTex3);

  // 5. Chamber 5: Grande Altar de Cthulhu
  createFloor(68.0, 86.0, -12.0, 12.0, floorTex3);

  // 6. Chamber 6: Sala do Baú & Escadaria de Fuga
  createFloor(86.0, 98.0, -6.5, 6.5, floorTex1);

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
  stoneSideMat.polygonOffset = true;
  stoneSideMat.polygonOffsetFactor = 2;
  stoneSideMat.polygonOffsetUnits = 2;

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
      frontMat.polygonOffset = true; frontMat.polygonOffsetFactor = 1; frontMat.polygonOffsetUnits = 1;

      // Top cap face (+Y)
      const topTex = wallCapTexture.clone();
      topTex.repeat.set(repeatU, 1);
      const topMat = new THREE.MeshLambertMaterial({ map: topTex });
      topMat.polygonOffset = true; topMat.polygonOffsetFactor = 1; topMat.polygonOffsetUnits = 1;

      // End caps (+X, -X) get textured stone
      const endTex = wallFullTexture.clone();
      endTex.repeat.set(Math.max(1, Math.round(depth / 3.2)), 1);
      const endMat = new THREE.MeshLambertMaterial({ map: endTex });
      endMat.polygonOffset = true; endMat.polygonOffsetFactor = 1; endMat.polygonOffsetUnits = 1;

      // [right(+X), left(-X), top(+Y), bottom(-Y), front(+Z), back(-Z)]
      materials = [endMat, endMat, topMat, stoneSideMat, frontMat, frontMat];
    } else {
      // Vertical wall running along Z:
      // Right and left (+X, -X) are the main visible faces!
      const repeatU = Math.max(1, Math.round(depth / 3.2));
      const mainTex = frontTexture.clone();
      mainTex.repeat.set(repeatU, 1);
      const mainMat = new THREE.MeshLambertMaterial({ map: mainTex });
      mainMat.polygonOffset = true; mainMat.polygonOffsetFactor = 1; mainMat.polygonOffsetUnits = 1;

      // Top cap face (+Y)
      const topTex = wallCapTexture.clone();
      topTex.repeat.set(1, repeatU);
      const topMat = new THREE.MeshLambertMaterial({ map: topTex });
      topMat.polygonOffset = true; topMat.polygonOffsetFactor = 1; topMat.polygonOffsetUnits = 1;

      // End caps (+Z, -Z) get textured stone
      const endTex = wallFullTexture.clone();
      endTex.repeat.set(Math.max(1, Math.round(width / 3.2)), 1);
      const endMat = new THREE.MeshLambertMaterial({ map: endTex });
      endMat.polygonOffset = true; endMat.polygonOffsetFactor = 1; endMat.polygonOffsetUnits = 1;

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

  // 1. Chamber 1 (Cela de Sacrifício): X: -50 to -30, Z: -10 to 10
  createWall(-50.6, 0.0, W_THICK, 22.4, 3.8, wall1Texture);      // West Wall
  createWall(-40.0, 10.6, 20.0, W_THICK, 3.8, wall2Texture);     // North Wall (sólida)
  createWall(-40.0, -10.6, 20.0, W_THICK, 3.8, wall3Texture);    // South Wall (sólida)
  createWall(-29.4, 6.0, W_THICK, 8.0, 3.8, wall1Texture);       // East Wall (North wing: Z: 2.0 a 10.0)
  createWall(-29.4, -6.0, W_THICK, 8.0, 3.8, wall1Texture);      // East Wall (South wing: Z: -10.0 a -2.0)

  // CORREDOR 1 (FORMATO U — LARGO COM NICHOS): X: -30 a -8, Z: -2 a 2 + nichos em X: -24 a -18
  // Trecho antes dos nichos (X: -30 a -24, largura 6.0)
  createWall(-27.0, 2.6, 6.0, W_THICK, 3.8, wall3Texture);       // Parede norte oeste
  createWall(-27.0, -2.6, 6.0, W_THICK, 3.8, wall3Texture);      // Parede sul oeste
  // Trecho depois dos nichos (X: -18 a -8, largura 10.0)
  createWall(-13.0, 2.6, 10.0, W_THICK, 3.8, wall3Texture);      // Parede norte leste
  createWall(-13.0, -2.6, 10.0, W_THICK, 3.8, wall3Texture);      // Parede sul leste
  // Nicho norte (X: -24 a -18, Z: -5 a -2)
  createWall(-21.0, -5.6, 6.0, W_THICK, 3.8, wall3Texture);      // Fundo norte do nicho (Z=-5.6)
  createWall(-24.6, -3.5, W_THICK, 3.0, 3.8, wall3Texture);      // Parede lateral oeste do nicho norte
  createWall(-17.4, -3.5, W_THICK, 3.0, 3.8, wall3Texture);      // Parede lateral leste do nicho norte
  // Nicho sul (X: -24 a -18, Z: 2 a 5)
  createWall(-21.0, 5.6, 6.0, W_THICK, 3.8, wall3Texture);       // Fundo sul do nicho (Z=+5.6)
  createWall(-24.6, 3.5, W_THICK, 3.0, 3.8, wall3Texture);       // Parede lateral oeste do nicho sul
  createWall(-17.4, 3.5, W_THICK, 3.0, 3.8, wall3Texture);       // Parede lateral leste do nicho sul

  // 2. Chamber 2 (Corredor das Alavancas): X: -8 to 8, Z: -6.5 to 6.5
  createWall(0.0, -7.1, 16.0, W_THICK, 3.8, wallCorpsesTexture); // North Wall (sólida)
  createWall(-8.6, 4.25, W_THICK, 4.5, 3.8, wall1Texture);       // West Wall (North wing: Z: 2.0 a 6.5)
  createWall(-8.6, -4.25, W_THICK, 4.5, 3.8, wall1Texture);      // West Wall (South wing: Z: -6.5 a -2.0)
  createWall(-5.0, 7.1, 6.0, W_THICK, 3.8, wallCorpsesTexture);  // South Wall (West wing: X: -8 a -2.0)
  createWall(5.0, 7.1, 6.0, W_THICK, 3.8, wallCorpsesTexture);   // South Wall (East wing: X: 2.0 a 8)
  createWall(8.6, 4.25, W_THICK, 4.5, 3.8, wall1Texture);        // East Wall (North wing: Z: 2.0 a 6.5)
  createWall(8.6, -4.25, W_THICK, 4.5, 3.8, wall1Texture);       // East Wall (South wing: Z: -6.5 a -2.0)

  // CORREDOR 2 (RETO LARGO 5u): Z: 6.5 a 28.5, X: -2.5 a 2.5
  createWall(-3.1, 17.5, W_THICK, 22.0, 3.8, wallCorpsesTexture); // West Wall
  createWall(3.1, 17.5, W_THICK, 22.0, 3.8, wallCorpsesTexture);  // East Wall

  // 3. Chamber 3 (Catacumbas dos Cristais): X: -12 to 12, Z: 28.5 to 48.5
  createWall(-7.0, 27.9, 10.0, W_THICK, 3.8, wall5Texture);      // North Wall (West wing: X: -12 a -2.5)
  createWall(7.0, 27.9, 10.0, W_THICK, 3.8, wall5Texture);       // North Wall (East wing: X: 2.5 a 12)
  createWall(-12.6, 38.5, W_THICK, 20.0, 3.8, wallCorpsesTexture);// West Wall (sólida)
  createWall(12.6, 38.5, W_THICK, 20.0, 3.8, wallCorpsesTexture); // East Wall (sólida)
  createWall(0.0, 49.1, 24.0, W_THICK, 3.8, wall5Texture);       // South Wall (sólida)

  // CORREDOR 3 (FORMATO T — ALARGAMENTO CENTRAL): X: 8 a 30, Z: -2 a 2 + câmaras em X: 16-24
  // Faixa central (paredes antes e depois do alargamento)
  createWall(12.0, 2.6, 8.0, W_THICK, 3.8, wall2Texture);        // Parede norte oeste (X: 8-16)
  createWall(12.0, -2.6, 8.0, W_THICK, 3.8, wall2Texture);       // Parede sul oeste (X: 8-16)
  createWall(27.0, 2.6, 6.0, W_THICK, 3.8, wall2Texture);        // Parede norte leste (X: 24-30)
  createWall(27.0, -2.6, 6.0, W_THICK, 3.8, wall2Texture);       // Parede sul leste (X: 24-30)
  // Câmaras de descanso T (norte e sul)
  createWall(20.0, 7.6, 8.0, W_THICK, 3.8, wall2Texture);        // Parede norte câmara T (Z=+7)
  createWall(20.0, -7.6, 8.0, W_THICK, 3.8, wall2Texture);       // Parede sul câmara T (Z=-7)
  createWall(15.4, 4.5, W_THICK, 5.0, 3.8, wall2Texture);        // Parede oeste câmara T norte
  createWall(15.4, -4.5, W_THICK, 5.0, 3.8, wall2Texture);       // Parede oeste câmara T sul
  createWall(24.6, 4.5, W_THICK, 5.0, 3.8, wall2Texture);        // Parede leste câmara T norte
  createWall(24.6, -4.5, W_THICK, 5.0, 3.8, wall2Texture);       // Parede leste câmara T sul

  // 4. Chamber 4 (Salão dos Espinhos): X: 30 to 46, Z: -6.5 to 6.5
  createWall(38.0, -7.1, 16.0, W_THICK, 3.8, wall2Texture);      // North Wall (sólida)
  createWall(38.0, 7.1, 16.0, W_THICK, 3.8, wall2Texture);       // South Wall (sólida)
  createWall(29.4, 4.25, W_THICK, 4.5, 3.8, wall2Texture);       // West Wall (North wing: Z: 2.0 a 6.5)
  createWall(29.4, -4.25, W_THICK, 4.5, 3.8, wall2Texture);      // West Wall (South wing: Z: -6.5 a -2.0)
  createWall(46.6, 4.25, W_THICK, 4.5, 3.8, wall2Texture);       // East Wall (North wing: Z: 2.0 a 6.5)
  createWall(46.6, -4.25, W_THICK, 4.5, 3.8, wall2Texture);      // East Wall (South wing: Z: -6.5 a -2.0)

  // CORREDOR 4 (RETO): X: 46 a 68, Z: -2 a 2
  createWall(57.0, 2.6, 22.0, W_THICK, 3.8, wallCorpsesTexture); // North Wall
  createWall(57.0, -2.6, 22.0, W_THICK, 3.8, wallCorpsesTexture);// South Wall

  // 5. Chamber 5 (Grand Altar de Cthulhu): X: 68 to 86, Z: -12 to 12
  createWall(67.4, 7.0, W_THICK, 10.0, 3.8, wall1Texture);       // West Wall (North wing: Z: 2.0 a 12.0)
  createWall(67.4, -7.0, W_THICK, 10.0, 3.8, wall1Texture);      // West Wall (South wing: Z: -12.0 a -2.0)
  createWall(77.0, -12.6, 18.0, W_THICK, 4.2, wallCorpsesTexture);// North Wall (sólida)
  createWall(77.0, 12.6, 18.0, W_THICK, 4.2, wallCorpsesTexture);// South Wall (sólida)
  createWall(86.6, 7.0, W_THICK, 10.0, 3.8, wall5Texture);       // East Wall (North partition: Z: 2.0 a 12.0)
  createWall(86.6, -7.0, W_THICK, 10.0, 3.8, wall5Texture);      // East Wall (South partition: Z: -12.0 a -2.0)

  // 6. Chamber 6 (Sala do Baú & Escadaria de Fuga): X: 86 to 98, Z: -6.5 to 6.5
  createWall(92.0, -7.1, 12.0, W_THICK, 3.8, wall3Texture);      // North Wall
  createWall(92.0, 7.1, 12.0, W_THICK, 3.8, wall3Texture);       // South Wall
  createWall(98.6, 0.0, W_THICK, 13.0, 3.8, wall5Texture);       // East End Wall

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

  // Pillars in Grand Altar Chamber (nos cantos, bem longe do caminho central!)
  createPillar(72.0, -9.0);
  createPillar(72.0, 9.0);
  createPillar(82.0, -9.0);
  createPillar(82.0, 9.0);

  // ========================================================
  // 3. COMPACT RANDOMIZED SPIKE TRAPS (NOS CANTOS - FORA DA CÂMARA 4)
  // ========================================================
  const spikeCoords = [
    { x: -44.0, z: 6.0, phase: 0.6 },
    { x: -8.0, z: 42.0, phase: 0.1 },
    { x: 72.0, z: 6.0, phase: 0.7 },
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
  // 4. PITFALL / HOLE TRAPS — BURACOS DISFARÇADOS EM BLOCOS DE CHÃO (TILES DA GRADE)
  //    (Cada buraco ocupa EXATAMENTE um bloco de chão completo, com textura de chão quebrado/rachado)
  // ========================================================
  const brokenFloorTex = loadCroppedTex(texChao8, 1, 1); // Chão8 = pedra com rachaduras, disfarça o buraco na grade!

  // Coordenadas calculadas exatamente para os blocos da grade das câmaras:
  const holeTiles = [
    // Câmara 1 (Cela — Grade 6x6 tiles, cada bloco tem 3.333u x 3.333u):
    // Bloco Col 2, Row 1 (um dos "X" marcados pelo jogador):
    { x: -50.0 + 2.5 * (20.0 / 6), z: -10.0 + 1.5 * (20.0 / 6), w: 20.0 / 6, h: 20.0 / 6 },
    // Bloco Col 3, Row 4 (outro "X" marcado pelo jogador):
    { x: -50.0 + 3.5 * (20.0 / 6), z: -10.0 + 4.5 * (20.0 / 6), w: 20.0 / 6, h: 20.0 / 6 },

    // Câmara 3 (Catacumbas — Grade 8x6 tiles, cada bloco tem 3.0u x 3.333u):
    // Bloco Col 1, Row 2 (canto das catacumbas):
    { x: -12.0 + 1.5 * 3.0, z: 28.5 + 2.5 * (20.0 / 6), w: 3.0, h: 20.0 / 6 },
    // Bloco Col 6, Row 3:
    { x: -12.0 + 6.5 * 3.0, z: 28.5 + 3.5 * (20.0 / 6), w: 3.0, h: 20.0 / 6 },

    // Câmara 5 (Altar — Grade 6x8 tiles, cada bloco tem 3.0u x 3.0u):
    // Bloco Col 2, Row 2 (lateral longe do caminho central):
    { x: 68.0 + 2.5 * 3.0, z: -12.0 + 2.5 * 3.0, w: 3.0, h: 3.0 },
    // Bloco Col 3, Row 5:
    { x: 68.0 + 3.5 * 3.0, z: -12.0 + 5.5 * 3.0, w: 3.0, h: 3.0 },
  ];

  holeTiles.forEach((ht) => {
    // 1. Fundo do abismo (buraco negro sob o piso)
    const holeMat = new THREE.MeshBasicMaterial({
      map: loadDungeonTex(texBuraco),
      transparent: true,
      side: THREE.DoubleSide,
    });
    const holeMesh = new THREE.Mesh(new THREE.PlaneGeometry(ht.w, ht.h), holeMat);
    holeMesh.rotation.x = -Math.PI / 2;
    holeMesh.position.set(ht.x, 0.012, ht.z);
    dungeonGroup.add(holeMesh);

    // 2. Laje de chão quebrado/rachado (cobre EXATAMENTE 1 bloco inteiro de chão, perfeitamente alinhada)
    const brokenMat = new THREE.MeshLambertMaterial({
      map: brokenFloorTex,
      transparent: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const brokenMesh = new THREE.Mesh(new THREE.PlaneGeometry(ht.w, ht.h), brokenMat);
    brokenMesh.rotation.x = -Math.PI / 2;
    brokenMesh.position.set(ht.x, 0.02, ht.z);
    dungeonGroup.add(brokenMesh);

    traps.push({
      type: 'hole',
      x: ht.x,
      z: ht.z,
      w: ht.w,
      h: ht.h,
      halfW: ht.w / 2,
      halfH: ht.h / 2,
      radius: Math.min(ht.w, ht.h) * 0.45,
      brokenMesh,
      holeMesh,
      isFatal: true,
    });
  });

  // Lighting
  const dungeonAmbient = new THREE.AmbientLight(0xd4e2f0, 2.6);
  dungeonGroup.add(dungeonAmbient);

  const centerLights = [
    { x: -40, y: 4.5, z: 0, color: 0xffd180, intensity: 3.2, dist: 28 }, // Câmara 1
    { x: -19, y: 3.2, z: 0, color: 0x80d8ff, intensity: 2.2, dist: 20 }, // Corredor 1
    { x: 0, y: 4.5, z: 0, color: 0xffb74d, intensity: 3.0, dist: 26 },   // Câmara 2
    { x: 0, y: 3.2, z: 17.5, color: 0x80d8ff, intensity: 2.2, dist: 20 },  // Corredor 2
    { x: 0, y: 4.5, z: 38.5, color: 0x80d8ff, intensity: 3.2, dist: 28 }, // Câmara 3
    { x: 19, y: 3.2, z: 0, color: 0xffb74d, intensity: 2.2, dist: 20 },  // Corredor 3
    { x: 38, y: 4.5, z: 0, color: 0xffb74d, intensity: 3.0, dist: 26 },   // Câmara 4
    { x: 57, y: 3.2, z: 0, color: 0x80d8ff, intensity: 2.2, dist: 20 }, // Corredor 4
    { x: 77, y: 5.0, z: 0, color: 0xd1c4e9, intensity: 3.8, dist: 32 },   // Câmara 5
    { x: 92, y: 4.5, z: 0, color: 0xffecb3, intensity: 3.4, dist: 26 },   // Câmara 6
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

  // GROUND STANDING BRAZIERS (Tochas no chão com base de pedra nos cantos - livre de corredores!)
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

  createTorch(-50.0, 2.3, 0, Math.PI / 2);
  createTorch(-8.2, 2.3, -4.5, 0);
  createTorch(-12.0, 2.3, 35.0, Math.PI / 2);
  createTorch(12.0, 2.3, 35.0, -Math.PI / 2);
  createTorch(98.0, 2.3, 0, -Math.PI / 2);

  // Tochas nos corredores com formatos variados
  createTorch(-27.0, 2.3, 2.3, Math.PI);         // Corredor 1 U: parede norte oeste
  createTorch(-27.0, 2.3, -2.3, 0);              // Corredor 1 U: parede sul oeste
  createTorch(-21.0, 2.3, -3.2, Math.PI);        // Corredor 1 U: parede norte nicho norte
  createTorch(-21.0, 2.3, 5.4, 0);               // Corredor 1 U: parede sul nicho sul
  createTorch(-13.0, 2.3, 2.3, Math.PI);         // Corredor 1 U: parede norte leste
  createTorch(-13.0, 2.3, -2.3, 0);              // Corredor 1 U: parede sul leste
  createTorch(-2.8, 2.3, 17.5, Math.PI / 2);    // Corredor 2 (parede oeste)
  createTorch(2.8, 2.3, 17.5, -Math.PI / 2);    // Corredor 2 (parede leste)
  createTorch(12.0, 2.3, 2.3, Math.PI);          // Corredor 3 T: parede norte oeste
  createTorch(12.0, 2.3, -2.3, 0);               // Corredor 3 T: parede sul oeste
  createTorch(20.0, 2.3, 7.4, 0);                // Corredor 3 T: parede norte câmara T
  createTorch(20.0, 2.3, -7.4, Math.PI);         // Corredor 3 T: parede sul câmara T
  createTorch(27.0, 2.3, 2.3, Math.PI);          // Corredor 3 T: parede norte leste
  createTorch(27.0, 2.3, -2.3, 0);               // Corredor 3 T: parede sul leste
  createTorch(51.5, 2.3, 2.0, Math.PI);          // Corredor 4: trecho 1 norte
  createTorch(51.5, 2.3, -2.0, 0);               // Corredor 4: trecho 1 sul
  createTorch(63.0, 2.3, 2.0, Math.PI);          // Corredor 4: trecho 2 norte
  createTorch(63.0, 2.3, -2.0, 0);               // Corredor 4: trecho 2 sul

  // Tochas de chão posicionadas bem nos cantos das salas
  createGroundTorch(-48.0, -8.0);
  createGroundTorch(-7.2, -5.5); // Ao lado do Monumento II (fora da frente dele)
  createGroundTorch(-10.0, 31.0);
  createGroundTorch(10.0, 31.0);
  createGroundTorch(70.0, -10.0);
  createGroundTorch(84.0, -10.0);

  // Candles in Altar (Com base de pedra rente à base do altar - caminho 100% livre!)
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

  // Velas alinhadas diretamente nas extremidades do Altar, sem bloquear a entrada!
  createAltarCandle(75.0, -1.2);
  createAltarCandle(75.0, 1.2);
  createAltarCandle(79.0, -1.2);
  createAltarCandle(79.0, 1.2);

  // Chains
  const chainMat = new THREE.MeshBasicMaterial({
    map: chainTextures[0],
    transparent: true,
    side: THREE.DoubleSide,
  });
  const chainMeshL = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.8), chainMat);
  chainMeshL.position.set(-42, 2.0, -4.0);
  dungeonGroup.add(chainMeshL);

  const chainMeshR = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.8), chainMat);
  chainMeshR.position.set(-42, 2.0, 4.0);
  dungeonGroup.add(chainMeshR);

  // ========================================================
  // PUZZLE 1: BINARY TERMINAL (PEDESTAL ÚNICO JUNTO À PAREDE NORTE)
  // ========================================================
  // Pedestal rente à parede norte da Câmara 2, liberando totalmente a área de passagem central
  const pedX = 0.0;
  const pedZ = -5.8;

  const pedBase = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 1.2, 0.8),
    new THREE.MeshLambertMaterial({ map: column3Texture })
  );
  pedBase.position.set(pedX, 0.6, pedZ);
  dungeonGroup.add(pedBase);

  // Tablet / console top slab
  const pedTop = new THREE.Mesh(
    new THREE.BoxGeometry(1.7, 0.12, 0.9),
    new THREE.MeshStandardMaterial({ color: 0x212121, roughness: 0.6, metalness: 0.4 })
  );
  pedTop.position.set(pedX, 1.25, pedZ);
  dungeonGroup.add(pedTop);

  // Single solid collision obstacle for the pedestal
  obstacles.push({
    minX: pedX - 0.9,
    maxX: pedX + 0.9,
    minZ: pedZ - 0.5,
    maxZ: pedZ + 0.5,
  });

  // 7 indicator orbs aligned neatly on top of the single pedestal (7 casas / dedos das mãos)
  const binaryLevers = [];
  const bulbOffsets = [-0.60, -0.40, -0.20, 0.0, 0.20, 0.40, 0.60];

  bulbOffsets.forEach((offsetX, i) => {
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xff1744 });
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), bulbMat);
    bulb.position.set(pedX + offsetX, 1.38, pedZ);
    dungeonGroup.add(bulb);

    const blData = {
      id: i + 1,
      state: 0,
      bulbMat: bulbMat,
      light: {
        color: {
          setHex: (hex) => bulbMat.color.setHex(hex),
        },
        intensity: 1,
      },
    };
    binaryLevers.push(blData);
  });

  // Single interactive trigger for the 4-digit terminal puzzle
  interactiveObjects.push({
    id: 'binary_pedestal',
    type: 'binary_lever',
    x: pedX,
    z: pedZ,
    radius: 2.2,
    prompt: '[E] Acessar Terminal de Decodificação',
  });

  // ========================================================
  // PUZZLE 2: COLOR CRYSTALS (NOS 4 CANTOS DA CÂMARA 3 - CENTRO 100% LIVRE)
  // ========================================================
  const colorCrystals = [
    { id: 'red', name: '🌋 Chama Primordial', colorHex: 0xff1744, x: -9.0, z: 32.5, order: 1 },
    { id: 'blue', name: '🌊 Maré do Abismo', colorHex: 0x2979ff, x: -9.0, z: 44.5, order: 2 },
    { id: 'yellow', name: '☀️ Luz da Aurora', colorHex: 0xffea00, x: 9.0, z: 32.5, order: 3 },
    { id: 'green', name: '🌿 Raiz da Floresta', colorHex: 0x00e676, x: 9.0, z: 44.5, order: 4 },
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

    const cubeGeo = new THREE.BoxGeometry(0.55, 0.55, 0.55);
    const cubeMat = new THREE.MeshStandardMaterial({
      color: cc.colorHex,
      roughness: 0.35,
      metalness: 0.25,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 0,
    });
    const cubeMesh = new THREE.Mesh(cubeGeo, cubeMat);
    cubeMesh.position.set(cc.x, 1.9, cc.z);
    cubeMesh.rotation.y = Math.PI / 4;
    cubeMesh.rotation.x = Math.PI / 6;
    dungeonGroup.add(cubeMesh);

    const pointLight = new THREE.PointLight(cc.colorHex, 0, 6);
    pointLight.position.set(cc.x, 2.2, cc.z);
    dungeonGroup.add(pointLight);

    cc.gemMesh = cubeMesh;
    cc.gemMat = cubeMat;
    cc.pillarMesh = cPillar;
    cc.pointLight = pointLight;
    cc.isActive = false;

    interactiveObjects.push({
      id: `crystal_${cc.id}`,
      type: 'color_crystal',
      x: cc.x,
      z: cc.z,
      radius: 2.4,
      prompt: `[E] Tocar Pedestal: ${cc.name}`,
      data: cc,
    });
  });

  interactiveObjects.push({
    id: 'color_clue_plaque',
    type: 'lore_clue',
    x: 0.0,
    z: 48.0,
    radius: 2.2,
    prompt: '[E] Decifrar Cântico Poético das Catacumbas',
    clueSpeaker: 'CÂNTICO DAS CATACUMBAS',
    clueText: '🔮 "No princípio do cosmos, a Chama Primordial ardeu em fúria eterna... Das cinzas do firmamento, brotaram as Águas Abissais que inundaram a criação... Sobre as marés tempestuosas, ergueu-se a Luz da Aurora que rasgou a escuridão... E no calor sagrado de seus raios, as Raízes da Floresta fincaram-se no solo profundo."',
  });

  // Sarcophagi (nos cantos e rentes às paredes laterais)
  const sarcophagusData = [
    { x: -10.5, z: 38.5, id: 1, hasPotion: true }, // Câmara 3 (parede oeste)
    { x: 10.5, z: 38.5, id: 2, hasPotion: true },  // Câmara 3 (parede leste)
    { x: -47.0, z: -8.5, id: 3, hasPotion: true }, // Câmara 1 (parede sul, rente à parede) — fora do buraco
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

  // POTS IN ROOM CORNERS (Totalmente nos cantos, 0 obstrução de passagem)
  const potPositions = [
    { x: -48.0, z: 8.0, tex: potTextures[0] },
    { x: -48.0, z: -8.0, tex: potTextures[1] },
    { x: -6.0, z: 5.0, tex: potTextures[2] },
    { x: 6.0, z: 5.0, tex: potTextures[3] },
    { x: -10.0, z: 47.0, tex: potTextures[0] },
    { x: 10.0, z: 47.0, tex: potTextures[4] },
    { x: 32.0, z: 5.0, tex: potTextures[1] },
    { x: 70.0, z: 10.0, tex: potTextures[1] },
    { x: 84.0, z: 10.0, tex: potTextures[3] },
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
  // Posicionado na parede norte da Câmara 5 (fora de qualquer passagem!)
  chestGroup.position.set(77.0, 0.0, -9.5);
  chestGroup.rotation.y = 0;

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
    minX: 76.1,
    maxX: 77.9,
    minZ: -10.15,
    maxZ: -8.85,
  });

  interactiveObjects.push({
    id: 'numeric_safe',
    type: 'numeric_safe',
    x: 77.0,
    z: -9.5,
    radius: 2.2,
    prompt: '[E] Abrir Baú Trancado por Segredo Numérico',
    unlocked: false,
  });

  // 3 POETIC MONUMENT CLUES (COM BASES DE COLUNA DE PEDRA NOS CANTOS)
  const monumentClues = [
    {
      x: -46.0,
      z: 7.5,
      clue: '🏛️ Monumento I: "Contai os mares do mundo e as cabeças da Serpente Abissal que assolam os navegantes... Este número ímpar e sagrado inicia o segredo do baú."',
      tex: monument2Tex,
    },
    {
      x: -6.0,
      z: -5.0,
      clue: '🏛️ Monumento II: "Nem par, nem solitário; sou a trindade dos Anciões que dormem além das estrelas, o menor dos números primos ímpares..."',
      tex: monument3Tex,
    },
    {
      x: 71.0,
      z: -4.5,
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
  // 5. GRAND ALTAR & PEDESTALS (CENTRALIZADO COM RUNWAY LIVRE)
  // ========================================================
  const mainAltarBase = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 0.8, 1.6),
    new THREE.MeshLambertMaterial({ map: column2Texture })
  );
  mainAltarBase.position.set(77.0, 0.4, 0);
  dungeonGroup.add(mainAltarBase);

  const mainAltarMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(4.0, 5.2),
    new THREE.MeshBasicMaterial({
      map: monument1Tex,
      transparent: true,
      side: THREE.DoubleSide,
    })
  );
  mainAltarMesh.position.set(77.0, 2.6, 0);
  dungeonGroup.add(mainAltarMesh);

  // HITBOX FOR MAIN ALTAR
  obstacles.push({
    minX: 75.0,
    maxX: 79.0,
    minZ: -1.0,
    maxZ: 1.0,
  });

  // Pedestais posicionados na parede sul da Câmara 5 (Z = 9.5), deixando o meio livre!
  const pedestals = [
    { id: 1, name: 'Chave de Bronze (Binário)', requiredItem: 'bronze_key', x: 74.0, z: 9.5, active: false, tex: monument2Tex },
    { id: 2, name: 'Runa de Cthulhu (Cores)', requiredItem: 'cthulhu_rune', x: 77.0, z: 9.5, active: false, tex: monument3Tex },
    { id: 3, name: 'Emblema do Culto (Baú)', requiredItem: 'cultist_emblem', x: 80.0, z: 9.5, active: false, tex: monument2Tex },
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

  // 5 Colunas com espaçamento reduzido na Câmara 4 (X: 34.2 a 42.6)
  const SPIKE_COL_X = [34.2, 36.3, 38.4, 40.5, 42.6];
  const SPIKE_ROW_Z = [-4.4, -2.2, 0.0, 2.2, 4.4];   // 5 fileiras equilibradas em Z de -6.5 a +6.5

  // As 5 direções dos ventos: N = Norte | NE = Nordeste | E = Leste | SE = Sudeste | S = Sul
  const DIRECTION_DEFS = [
    { code: 'N', name: 'Norte', label: 'Norte', z: -4.4 },
    { code: 'NE', name: 'Nordeste', label: 'Nordeste', z: -2.2 },
    { code: 'E', name: 'Leste', label: 'Leste', z: 0.0 },
    { code: 'SE', name: 'Sudeste', label: 'Sudeste', z: 2.2 },
    { code: 'S', name: 'Sul', label: 'Sul', z: 4.4 },
  ];
  const ROW_LABELS = DIRECTION_DEFS.map((d) => d.name);

  // Gerador de caminho seguro aleatório 5x5 (5 passos, 1 fileira correta por coluna - SEMPRE ALEATÓRIO)
  let safePath = [
    Math.floor(Math.random() * 5),
    Math.floor(Math.random() * 5),
    Math.floor(Math.random() * 5),
    Math.floor(Math.random() * 5),
    Math.floor(Math.random() * 5),
  ];

  // Textura gótica de pedra lisa de cantaria (sem inscrições ou letras)
  function createDungeonSlabTex() {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#22252c';
    ctx.fillRect(0, 0, 256, 256);
    // Borda chanfrada de cantaria
    ctx.strokeStyle = '#14161b';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, 246, 246);
    ctx.strokeStyle = '#333842';
    ctx.lineWidth = 4;
    ctx.strokeRect(14, 14, 228, 228);
    // Rachaduras na pedra
    ctx.strokeStyle = '#2d323d';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(35, 40); ctx.lineTo(75, 90); ctx.lineTo(65, 145); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(180, 55); ctx.lineTo(150, 120); ctx.lineTo(205, 185); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(85, 205); ctx.lineTo(135, 230); ctx.stroke();

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  const dungeonSlabTex = createDungeonSlabTex();

  // Estrofes poéticas arcanas em poema contínuo (sem números, sem separadores artificiais)
  const POETIC_STANZAS = [
    // Coluna 1
    [
      'O sopro do abismo sussurra rente à muralha ao Norte...',
      'A névoa gélida rasteja na elevação voltada ao Nordeste...',
      'O corte reto rasga as sombras em linha direta ao Leste...',
      'A encosta suave acolhe o calor na descida ao Sudeste...',
      'A rocha primordial repousa firme no leito fundo ao Sul...'
    ],
    // Coluna 2
    [
      'Sombras densas buscam o refúgio das pedras ao Norte...',
      'A brisa fina viaja nas alturas onde o ar sopra ao Nordeste...',
      'A retidão sustenta o avanço cortando pelo meio ao Leste...',
      'O abrigo das pedras acolhe a passagem inclinada ao Sudeste...',
      'O peso da terra firme descansa nas margens ao Sul...'
    ],
    // Coluna 3
    [
      'A escuridão encontra o abraço frio da muralha ao Norte...',
      'As runas silenciosas ecoam na margem elevada ao Nordeste...',
      'A trilha justa divide o salão sem desvios ao Leste...',
      'O pulso da terra ressoa nas pedras acolhedoras ao Sudeste...',
      'A firmeza reside nas lajes aquecidas pelo leito ao Sul...'
    ],
    // Coluna 4
    [
      'O eco das correntes ressoa onde as pedras tocam o topo ao Norte...',
      'A corrente velada guia os passos pelas alturas ao Nordeste...',
      'O equilíbrio cruza o abismo mantendo a firmeza ao Leste...',
      'A terra vibra onde as pedras encontram o declive ao Sudeste...',
      'O solo firme sustenta o peso na borda profunda ao Sul...'
    ],
    // Coluna 5
    [
      'A salvação aguarda onde a passagem se ergue ao Norte.',
      'A saída sussurra onde a encosta alta alcança o Nordeste.',
      'A travessia vence o corredor cortando o coração de pedra ao Leste.',
      'O refúgio acolhe o salto seguro no declive ao Sudeste.',
      'O repouso derradeiro encerra a canção nas profundezas ao Sul.'
    ]
  ];

  function getPoemText() {
    return [
      '📜 CÂNTICO DAS LÂMINAS VELADAS',
      'Decifre os sussurros das pedras para que as lanças se recolham sob seus pés:',
      POETIC_STANZAS[0][safePath[0]],
      POETIC_STANZAS[1][safePath[1]],
      POETIC_STANZAS[2][safePath[2]],
      POETIC_STANZAS[3][safePath[3]],
      POETIC_STANZAS[4][safePath[4]],
      '⚠️ Quem ignorar a canção da rocha despencará no vazio sem retorno.'
    ].join('\n');
  }

  const pathTiles = [];

  SPIKE_COL_X.forEach((x, colIdx) => {
    SPIKE_ROW_Z.forEach((z, rowIdx) => {
      const isSafe = rowIdx === safePath[colIdx];

      // 1. Laje de pedra no piso (1.3m de largura x 2.0m de comprimento em Z) — pedra lisa sem marcas
      const slabMat = new THREE.MeshStandardMaterial({
        map: dungeonSlabTex,
        roughness: 0.85,
        metalness: 0.1,
        emissive: new THREE.Color(0x000000),
      });
      const slabMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 2.0), slabMat);
      slabMesh.rotation.x = -Math.PI / 2;
      slabMesh.position.set(x, 0.025, z);
      dungeonGroup.add(slabMesh);

      // 2. Buraco sem fundo (fica oculto sob a laje, abrindo apenas se o jogador errar!)
      const holeMat = new THREE.MeshLambertMaterial({
        map: holeTexture,
        transparent: true,
        side: THREE.DoubleSide,
      });
      const holeMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 1.95), holeMat);
      holeMesh.rotation.x = -Math.PI / 2;
      holeMesh.position.set(x, 0.03, z);
      holeMesh.visible = false;
      dungeonGroup.add(holeMesh);

      // 3. Espinhos estáticos afiados sobre o ladrilho
      const spikeGroup = new THREE.Group();
      const spikeMat = new THREE.MeshBasicMaterial({
        map: spikeFrames[4],
        transparent: true,
        side: THREE.DoubleSide,
      });

      const sMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 1.8), spikeMat);
      sMesh.rotation.x = -Math.PI / 2;
      sMesh.position.set(x, 0.04, z);
      spikeGroup.add(sMesh);

      dungeonGroup.add(spikeGroup);

      pathTiles.push({
        colIdx,
        rowIdx,
        x,
        z,
        halfW: 0.65,
        halfH: 1.0,
        name: ROW_LABELS[rowIdx],
        baseMesh: slabMesh,
        baseMat: slabMat,
        holeMesh,
        spikeGroup,
        isSafe,
        isStepped: false,
        isFallen: false,
      });
    });
  });

  // MONÓLITO ANCESTRAL DAS LÂMINAS VELADAS (Câmara 4, canto noroeste — antes dos espinhos)
  const poemMonumentGroup = new THREE.Group();
  poemMonumentGroup.position.set(31.5, 0, -5.5);

  // Plinto inferior de pedra
  const pmStep1 = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.35, 1.6),
    new THREE.MeshStandardMaterial({ color: 0x1f242d, roughness: 0.85 })
  );
  pmStep1.position.y = 0.175;
  poemMonumentGroup.add(pmStep1);

  // Plinto intermediário
  const pmStep2 = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 0.3, 1.3),
    new THREE.MeshStandardMaterial({ color: 0x282f3a, roughness: 0.8 })
  );
  pmStep2.position.y = 0.45;
  poemMonumentGroup.add(pmStep2);

  // Obelisco Monolítico em formato piramidal afilado
  const pmPillar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.58, 2.7, 4),
    new THREE.MeshStandardMaterial({
      color: 0x181c22,
      roughness: 0.35,
      metalness: 0.45,
    })
  );
  pmPillar.rotation.y = Math.PI / 4;
  pmPillar.position.y = 1.95;
  poemMonumentGroup.add(pmPillar);

  // Cristal de topo rúnico emite brilho místico
  const pmCrystal = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.28, 0),
    new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x00e5ff,
      emissiveIntensity: 2.2,
      roughness: 0.2,
    })
  );
  pmCrystal.position.y = 3.45;
  poemMonumentGroup.add(pmCrystal);

  // Luz mística do Monólito
  const pmLight = new THREE.PointLight(0x00e5ff, 2.2, 8);
  pmLight.position.set(0, 3.4, 0);
  poemMonumentGroup.add(pmLight);

  dungeonGroup.add(poemMonumentGroup);
  obstacles.push({ minX: 30.7, maxX: 32.3, minZ: -6.3, maxZ: -4.7 });

  const poemObject = {
    id: 'poem_clue_monument',
    type: 'stone_monolith_clue',
    clueSpeaker: 'MONÓLITO DAS LÂMINAS VELADAS',
    clueText: getPoemText(),
    x: 31.5,
    z: -5.5,
    radius: 2.8,
    prompt: '[E] Inspecionar Monólito Ancestral (Placa de Pedra)',
  };
  interactiveObjects.push(poemObject);

  function resetPathTiles() {
    pathTiles.forEach((tile) => {
      tile.isStepped = false;
      tile.isFallen = false;
      if (tile.baseMesh) tile.baseMesh.visible = true;
      if (tile.holeMesh) tile.holeMesh.visible = false;
      if (tile.spikeGroup) tile.spikeGroup.visible = true;
      if (tile.baseMat) tile.baseMat.emissive.setHex(0x000000);
    });
  }

  function rerollSafePath() {
    safePath = [
      Math.floor(Math.random() * 5),
      Math.floor(Math.random() * 5),
      Math.floor(Math.random() * 5),
      Math.floor(Math.random() * 5),
      Math.floor(Math.random() * 5),
    ];
    pathTiles.forEach((tile) => {
      tile.isSafe = tile.rowIdx === safePath[tile.colIdx];
    });
    poemObject.clueText = getPoemText();
    resetPathTiles();
  }

  const pathPuzzle = {
    tiles: pathTiles,
    getSafePath: () => safePath,
    getPoemText,
    resetPathTiles,
    rerollSafePath,
  };

  // Escape Gate (Impede o acesso à escadaria de fuga na Câmara 6 sem resolver os enigmas)
  const gateMat = new THREE.MeshBasicMaterial({
    map: gateTexture,
    transparent: true,
    side: THREE.DoubleSide,
  });
  const gateMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.8), gateMat);
  gateMesh.position.set(86.0, 1.9, 0);
  gateMesh.rotation.y = Math.PI / 2;
  dungeonGroup.add(gateMesh);

  const gateObstacle = {
    minX: 85.4,
    maxX: 86.6,
    minZ: -2.0,
    maxZ: 2.0,
  };
  obstacles.push(gateObstacle);

  interactiveObjects.push({
    id: 'escape_gate',
    type: 'gate',
    x: 86.0,
    z: 0,
    radius: 2.6,
    prompt: '[E] Abrir Grande Portão de Ferro',
    isOpen: false,
    mesh: gateMesh,
    obstacle: gateObstacle,
  });

  // Escape Stairs (Câmara 6)
  const stairsMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(4.0, 5.6),
    new THREE.MeshLambertMaterial({
      map: stairsUpTex,
      transparent: true,
      side: THREE.DoubleSide,
    })
  );
  stairsMesh.rotation.x = -Math.PI / 2;
  stairsMesh.position.set(94.0, 0.05, 0);
  dungeonGroup.add(stairsMesh);

  // Spawn Straw Bed in Cell (Câmara 1) — movida para o extremo oeste da cela (encostada na parede oeste)
  const spawnStairsMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2.8, 2.8),
    new THREE.MeshLambertMaterial({ map: stairsDownTex, transparent: true })
  );
  spawnStairsMesh.rotation.x = -Math.PI / 2;
  spawnStairsMesh.position.set(-49.0, 0.02, 0);
  dungeonGroup.add(spawnStairsMesh);

  dungeonGroup.visible = false;
  scene.add(dungeonGroup);

  const enemySpawnPoints = [
    { x: 0.0, z: -2.0, name: 'Blood Monster Alfa', patrolRadius: 3.0 },
    { x: -5.0, z: 38.5, name: 'Blood Monster das Catacumbas', patrolRadius: 4.0 },
    { x: 3.0, z: 38.5, name: 'Blood Monster Carniceiro', patrolRadius: 4.0 },
    { x: 44.0, z: 3.5, name: 'Blood Monster do Labirinto', patrolRadius: 2.0 },
    { x: 57.0, z: 0.0, name: 'Blood Monster das Sombras', patrolRadius: 3.0 },
    { x: 74.0, z: -5.0, name: 'Blood Monster Devorador', patrolRadius: 3.5 },
    { x: 80.0, z: 5.0, name: 'Blood Monster Guardião', patrolRadius: 3.5 },
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
    pathPuzzle,
    updateTerminalBoard: () => { },
    spawnPos: { x: -47.5, z: 0.0 },
    altarPos: { x: -44.0, z: 0.0 },
    exitPos: { x: 94.0, z: 0.0 },
    bounds: {
      minX: -51.5,
      maxX: 99.5,
      minZ: -13.5,
      maxZ: 50.0,
    },
  };
}
