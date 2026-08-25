import * as THREE from 'three';

export function createDungeonRoom(scene) {
  const roomGroup = new THREE.Group();

  // 1. Clean, Uniform Dungeon Floor (Smooth stone/wood texture without harsh lines or text)
  const floorCanvas = document.createElement('canvas');
  floorCanvas.width = 1024;
  floorCanvas.height = 640;
  const ctx = floorCanvas.getContext('2d');

  // Base warm earthy stone color
  ctx.fillStyle = '#4e382d';
  ctx.fillRect(0, 0, 1024, 640);

  // Soft subtle gradient to give uniform depth without stripes/lines
  const grad = ctx.createRadialGradient(512, 320, 100, 512, 320, 600);
  grad.addColorStop(0, '#5a4235');
  grad.addColorStop(1, '#3b291f');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 640);

  // Very fine, soft micro-texture for realism without any stripes or text
  ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
  for (let i = 0; i < 400; i++) {
    const rx = Math.random() * 1024;
    const ry = Math.random() * 640;
    const r = Math.random() * 3 + 1;
    ctx.beginPath();
    ctx.arc(rx, ry, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const floorTexture = new THREE.CanvasTexture(floorCanvas);
  floorTexture.colorSpace = THREE.SRGBColorSpace;
  floorTexture.magFilter = THREE.LinearFilter;
  floorTexture.minFilter = THREE.LinearFilter;

  // Floor Mesh
  const floorGeo = new THREE.PlaneGeometry(20, 12.5);
  const floorMat = new THREE.MeshStandardMaterial({
    map: floorTexture,
    roughness: 0.7,
    metalness: 0.1,
  });
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.receiveShadow = true;
  roomGroup.add(floorMesh);

  // 2. Brick Texture for Walls (Cleaner & well-lit)
  const wallCanvas = document.createElement('canvas');
  wallCanvas.width = 512;
  wallCanvas.height = 512;
  const wctx = wallCanvas.getContext('2d');
  wctx.fillStyle = '#634438';
  wctx.fillRect(0, 0, 512, 512);

  // Brick pattern with soft contrast
  wctx.strokeStyle = '#432a21';
  wctx.lineWidth = 4;
  const brickH = 64;
  const brickW = 128;
  for (let y = 0; y < 512; y += brickH) {
    wctx.beginPath();
    wctx.moveTo(0, y);
    wctx.lineTo(512, y);
    wctx.stroke();
    const offset = (y / brickH) % 2 === 0 ? 0 : brickW / 2;
    for (let x = offset; x < 512; x += brickW) {
      wctx.beginPath();
      wctx.moveTo(x, y);
      wctx.lineTo(x, y + brickH);
      wctx.stroke();
    }
  }

  const wallTexture = new THREE.CanvasTexture(wallCanvas);
  wallTexture.wrapS = THREE.RepeatWrapping;
  wallTexture.wrapT = THREE.RepeatWrapping;
  wallTexture.colorSpace = THREE.SRGBColorSpace;

  const wallMat = new THREE.MeshStandardMaterial({
    map: wallTexture,
    roughness: 0.75,
  });

  const wallThickness = 1.2;
  const wallHeight = 3.4;
  const halfW = 10;
  const halfH = 6.25;

  // Top Wall (North)
  const wallNorthGeo = new THREE.BoxGeometry(
    halfW * 2 + wallThickness * 2,
    wallHeight,
    wallThickness
  );
  const wallNorth = new THREE.Mesh(wallNorthGeo, wallMat);
  wallNorth.position.set(0, wallHeight / 2, -halfH - wallThickness / 2);
  roomGroup.add(wallNorth);

  // Bottom Wall (South)
  const wallSouth = new THREE.Mesh(wallNorthGeo, wallMat);
  wallSouth.position.set(0, wallHeight / 2, halfH + wallThickness / 2);
  roomGroup.add(wallSouth);

  // Left Wall (West)
  const wallWestGeo = new THREE.BoxGeometry(
    wallThickness,
    wallHeight,
    halfH * 2
  );
  const wallWest = new THREE.Mesh(wallWestGeo, wallMat);
  wallWest.position.set(-halfW - wallThickness / 2, wallHeight / 2, 0);
  roomGroup.add(wallWest);

  // Right Wall (East)
  const wallEast = new THREE.Mesh(wallWestGeo, wallMat);
  wallEast.position.set(halfW + wallThickness / 2, wallHeight / 2, 0);
  roomGroup.add(wallEast);

  // Wall Moldings / Borders
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x4a3026,
    roughness: 0.8,
  });
  const borderTop = new THREE.Mesh(
    new THREE.BoxGeometry(halfW * 2, 0.4, 0.4),
    frameMat
  );
  borderTop.position.set(0, wallHeight - 0.2, -halfH + 0.2);
  roomGroup.add(borderTop);

  // Doors
  const doorGeo = new THREE.BoxGeometry(2.4, 2.8, 0.2);
  const doorMat = new THREE.MeshStandardMaterial({
    color: 0x362117,
    roughness: 0.7,
  });
  const doorFrameMat = new THREE.MeshStandardMaterial({
    color: 0x8d6350,
    roughness: 0.6,
  });

  // North Door (Top)
  const doorNorthFrame = new THREE.Mesh(
    new THREE.BoxGeometry(3.0, 3.2, 0.4),
    doorFrameMat
  );
  doorNorthFrame.position.set(0, 1.6, -halfH + 0.1);
  roomGroup.add(doorNorthFrame);

  const doorNorth = new THREE.Mesh(doorGeo, doorMat);
  doorNorth.position.set(0, 1.4, -halfH + 0.2);
  roomGroup.add(doorNorth);

  // East Door (Right)
  const doorEastFrame = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 3.2, 3.0),
    doorFrameMat
  );
  doorEastFrame.position.set(halfW - 0.1, 1.6, 0);
  roomGroup.add(doorEastFrame);

  const doorEast = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 2.8, 2.4),
    doorMat
  );
  doorEast.position.set(halfW - 0.2, 1.4, 0);
  roomGroup.add(doorEast);

  // 3. Bright & Atmospheric Dungeon Lights (Enhanced Illumination)
  const ambientLight = new THREE.AmbientLight(0xffeedd, 2.2);
  roomGroup.add(ambientLight);

  const centerLight = new THREE.PointLight(0xffb76c, 3.2, 30);
  centerLight.position.set(0, 5.5, 0);
  roomGroup.add(centerLight);

  // Corner Torches / Lanterns
  const torchPositions = [
    { x: -7.5, y: 2.2, z: -5.5 },
    { x: 7.5, y: 2.2, z: -5.5 },
    { x: -7.5, y: 2.2, z: 5.5 },
    { x: 7.5, y: 2.2, z: 5.5 },
  ];
  torchPositions.forEach((tp) => {
    const torchLight = new THREE.PointLight(0xffaa44, 1.8, 14);
    torchLight.position.set(tp.x, tp.y, tp.z);
    roomGroup.add(torchLight);

    // Small glowing torch head
    const torchBulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffaa33 })
    );
    torchBulb.position.set(tp.x, tp.y, tp.z);
    roomGroup.add(torchBulb);
  });

  roomGroup.visible = false;
  scene.add(roomGroup);

  return {
    group: roomGroup,
    bounds: {
      minX: -halfW + 1.2,
      maxX: halfW - 1.2,
      minZ: -halfH + 1.2,
      maxZ: halfH - 1.2,
    },
  };
}
