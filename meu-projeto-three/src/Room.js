import * as THREE from 'three';

export function createDungeonRoom(scene) {
  const roomGroup = new THREE.Group();

  // Floor Canvas with Isaac-style texture and control drawings on floor
  const floorCanvas = document.createElement('canvas');
  floorCanvas.width = 1024;
  floorCanvas.height = 640;
  const ctx = floorCanvas.getContext('2d');

  // Fill dark earthy brown floor background
  ctx.fillStyle = '#6e473b';
  ctx.fillRect(0, 0, 1024, 640);

  // Floor grid / stone tile pattern
  ctx.strokeStyle = '#5a382e';
  ctx.lineWidth = 4;
  const tileSize = 64;
  for (let x = 0; x <= 1024; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 640);
    ctx.stroke();
  }
  for (let y = 0; y <= 640; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // Add random floor speckles / cracks
  ctx.fillStyle = '#4a2c23';
  for (let i = 0; i < 150; i++) {
    const rx = Math.random() * 1024;
    const ry = Math.random() * 640;
    const rw = 4 + Math.random() * 12;
    const rh = 4 + Math.random() * 12;
    ctx.fillRect(rx, ry, rw, rh);
  }

  // Draw Isaac-style floor instructions ("MOVE", "ATTACK", "BOMB", "ITEM")
  ctx.fillStyle = '#3a2018';
  ctx.font = 'bold 36px monospace';
  ctx.textAlign = 'center';

  // MOVE
  ctx.fillText('MOVE', 220, 220);
  ctx.font = 'bold 24px monospace';
  ctx.fillText('W A S D', 220, 260);
  ctx.fillText('▲ ▼ ◄ ►', 220, 290);

  // ATTACK
  ctx.font = 'bold 36px monospace';
  ctx.fillText('ATTACK', 420, 220);
  ctx.font = 'bold 24px monospace';
  ctx.fillText('ESPAÇO', 420, 260);
  ctx.fillText('(Space)', 420, 290);

  // BOMB
  ctx.font = 'bold 36px monospace';
  ctx.fillText('BOMB', 620, 220);
  ctx.font = 'bold 24px monospace';
  ctx.fillText('E / B', 620, 260);

  // ITEM
  ctx.font = 'bold 36px monospace';
  ctx.fillText('ITEM', 820, 220);
  ctx.font = 'bold 24px monospace';
  ctx.fillText('Q / R', 820, 260);

  const floorTexture = new THREE.CanvasTexture(floorCanvas);
  floorTexture.colorSpace = THREE.SRGBColorSpace;
  floorTexture.magFilter = THREE.LinearFilter;
  floorTexture.minFilter = THREE.LinearFilter;

  // Floor Mesh
  const floorGeo = new THREE.PlaneGeometry(20, 12.5);
  const floorMat = new THREE.MeshStandardMaterial({
    map: floorTexture,
    roughness: 0.85,
    metalness: 0.1,
  });
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.receiveShadow = true;
  roomGroup.add(floorMesh);

  // Brick Texture for Walls
  const wallCanvas = document.createElement('canvas');
  wallCanvas.width = 512;
  wallCanvas.height = 512;
  const wctx = wallCanvas.getContext('2d');
  wctx.fillStyle = '#54362b';
  wctx.fillRect(0, 0, 512, 512);

  // Brick pattern
  wctx.strokeStyle = '#3d251d';
  wctx.lineWidth = 6;
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
    roughness: 0.9,
  });

  const wallThickness = 1.2;
  const wallHeight = 3.2;
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

  // Wall Moldings / Borders (Isaac style chunky stone frames)
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x3b241c,
    roughness: 0.95,
  });
  const borderTop = new THREE.Mesh(
    new THREE.BoxGeometry(halfW * 2, 0.4, 0.4),
    frameMat
  );
  borderTop.position.set(0, wallHeight - 0.2, -halfH + 0.2);
  roomGroup.add(borderTop);

  // Doors (Isaac style wooden / stone trapdoors)
  const doorGeo = new THREE.BoxGeometry(2.4, 2.8, 0.2);
  const doorMat = new THREE.MeshStandardMaterial({
    color: 0x2b1810,
    roughness: 0.8,
  });
  const doorFrameMat = new THREE.MeshStandardMaterial({
    color: 0x7c5443,
    roughness: 0.7,
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

  // Dungeon Lights (warm ambient & directional lights)
  const ambientLight = new THREE.AmbientLight(0xffdfc4, 1.2);
  roomGroup.add(ambientLight);

  const centerLight = new THREE.PointLight(0xffb570, 1.5, 25);
  centerLight.position.set(0, 6, 0);
  roomGroup.add(centerLight);

  scene.add(roomGroup);

  return {
    bounds: {
      minX: -halfW + 1.2,
      maxX: halfW - 1.2,
      minZ: -halfH + 1.2,
      maxZ: halfH - 1.2,
    },
  };
}
