import * as THREE from 'three';

export function createStreetEnvironment(scene) {
  const streetGroup = new THREE.Group();

  // 1. Street Floor (Dark Wet Asphalt with Crosswalks & Puddles)
  const streetCanvas = document.createElement('canvas');
  streetCanvas.width = 1024;
  streetCanvas.height = 512;
  const ctx = streetCanvas.getContext('2d');

  // Dark wet asphalt base
  ctx.fillStyle = '#16191f';
  ctx.fillRect(0, 0, 1024, 512);

  // Sidewalks (Top and Bottom borders)
  ctx.fillStyle = '#2d323e';
  ctx.fillRect(0, 0, 1024, 70); // Top sidewalk
  ctx.fillRect(0, 440, 1024, 72); // Bottom sidewalk

  // Curb lines
  ctx.fillStyle = '#454d5e';
  ctx.fillRect(0, 66, 1024, 4);
  ctx.fillRect(0, 440, 1024, 4);

  // Wet reflections / Puddles
  ctx.fillStyle = '#202836';
  for (let i = 0; i < 30; i++) {
    const px = Math.random() * 1024;
    const py = 90 + Math.random() * 320;
    const pw = 40 + Math.random() * 90;
    const ph = 15 + Math.random() * 35;
    ctx.beginPath();
    ctx.ellipse(px, py, pw / 2, ph / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // White road lane markings (Dashed center line)
  ctx.fillStyle = '#d0d7de';
  for (let x = 20; x < 1024; x += 70) {
    ctx.fillRect(x, 250, 40, 6);
  }

  // Crosswalk (Pedestrian crossing at the end of street)
  ctx.fillStyle = '#e1e4e8';
  for (let y = 80; y < 430; y += 32) {
    ctx.fillRect(820, y, 90, 18);
  }

  const streetTexture = new THREE.CanvasTexture(streetCanvas);
  streetTexture.colorSpace = THREE.SRGBColorSpace;
  streetTexture.magFilter = THREE.LinearFilter;
  streetTexture.minFilter = THREE.LinearFilter;

  const floorGeo = new THREE.PlaneGeometry(36, 18);
  const floorMat = new THREE.MeshStandardMaterial({
    map: streetTexture,
    roughness: 0.3, // Glossy wet asphalt reflection
    metalness: 0.2,
  });
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.receiveShadow = true;
  streetGroup.add(floorMesh);

  // 2. Elevated Blue Industrial Overpass/Bridge (From reference image)
  const bridgeMat = new THREE.MeshStandardMaterial({
    color: 0x1f3c68, // Industrial blue
    roughness: 0.6,
    metalness: 0.5,
  });
  const pillarMat = new THREE.MeshStandardMaterial({
    color: 0x142744,
    roughness: 0.7,
  });

  // Top Deck Beam
  const deckMesh = new THREE.Mesh(
    new THREE.BoxGeometry(38, 1.2, 3),
    bridgeMat
  );
  deckMesh.position.set(0, 6.2, -6.5);
  streetGroup.add(deckMesh);

  // Deck Guardrail
  const railMesh = new THREE.Mesh(
    new THREE.BoxGeometry(38, 0.8, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x4a6572, metalness: 0.8 })
  );
  railMesh.position.set(0, 7.0, -5.2);
  streetGroup.add(railMesh);

  // Heavy Blue Support Arches / Pillars along the overpass
  for (let x = -16; x <= 16; x += 8) {
    const pillar = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 6.2, 1.6),
      pillarMat
    );
    pillar.position.set(x, 3.1, -6.5);
    streetGroup.add(pillar);

    // Arch bracing
    const arch = new THREE.Mesh(
      new THREE.BoxGeometry(6.4, 0.8, 1.2),
      bridgeMat
    );
    arch.position.set(x + 4, 5.2, -6.5);
    streetGroup.add(arch);
  }

  // 3. Background Buildings & Houses (Pixel art urban backdrop)
  const bldgMatA = new THREE.MeshStandardMaterial({ color: 0x181e28, roughness: 0.9 });
  const bldgMatB = new THREE.MeshStandardMaterial({ color: 0x221a24, roughness: 0.9 });

  const bldgPositions = [-14, -8, -2, 4, 10, 15];
  bldgPositions.forEach((bx, idx) => {
    const h = 7 + (idx % 3) * 2;
    const w = 4 + (idx % 2) * 2;
    const bldg = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, 2),
      idx % 2 === 0 ? bldgMatA : bldgMatB
    );
    bldg.position.set(bx, h / 2, -9);
    streetGroup.add(bldg);

    // Illuminated Windows
    const winGeo = new THREE.PlaneGeometry(0.5, 0.6);
    const winMat = new THREE.MeshBasicMaterial({ color: 0xffd54f });
    for (let wy = 2; wy < h - 1; wy += 1.8) {
      for (let wx = -w / 2 + 0.8; wx < w / 2 - 0.5; wx += 1.2) {
        if (Math.random() > 0.4) {
          const win = new THREE.Mesh(winGeo, winMat);
          win.position.set(bx + wx, wy, -7.9);
          streetGroup.add(win);
        }
      }
    }
  });

  // 4. Street Lamps (Postes de Luz) & Overhead Utility Cables
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x212121, metalness: 0.8 });
  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xffecb3,
    emissive: 0xffa000,
    emissiveIntensity: 2.0,
  });

  const lampPositions = [-12, -4, 4, 12];
  const streetLights = [];

  lampPositions.forEach((lx) => {
    // Pole
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.15, 6, 8),
      poleMat
    );
    pole.position.set(lx, 3, 7.5);
    streetGroup.add(pole);

    // Lamp Arm
    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.1, 0.1),
      poleMat
    );
    arm.position.set(lx + 0.4, 5.8, 7.5);
    streetGroup.add(arm);

    // Bulb
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 12, 12),
      bulbMat
    );
    bulb.position.set(lx + 0.9, 5.6, 7.5);
    streetGroup.add(bulb);

    // Warm Light Cone
    const pLight = new THREE.PointLight(0xffb74d, 2.2, 12);
    pLight.position.set(lx + 0.9, 5.4, 7.5);
    streetGroup.add(pLight);
    streetLights.push(pLight);
  });

  // 5. Pixel Art Trees (Árvores urbanas)
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.9 });
  const foliageMat = new THREE.MeshStandardMaterial({ color: 0x1b4332, roughness: 0.8 });

  const treePositions = [-15, -7, 1, 9, 16];
  treePositions.forEach((tx) => {
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.3, 3, 8),
      trunkMat
    );
    trunk.position.set(tx, 1.5, 7.5);
    streetGroup.add(trunk);

    const foliage = new THREE.Mesh(
      new THREE.DodecahedronGeometry(1.4),
      foliageMat
    );
    foliage.position.set(tx, 3.8, 7.5);
    streetGroup.add(foliage);
  });

  // 6. Neon Shop Sign ("CHICKEN / DINER" inspired by reference photo)
  const neonCanvas = document.createElement('canvas');
  neonCanvas.width = 256;
  neonCanvas.height = 64;
  const nctx = neonCanvas.getContext('2d');
  nctx.fillStyle = '#111';
  nctx.fillRect(0, 0, 256, 64);
  nctx.fillStyle = '#ff1744';
  nctx.font = 'bold 32px sans-serif';
  nctx.textAlign = 'center';
  nctx.fillText('CHICKEN ➔', 128, 44);

  const neonTex = new THREE.CanvasTexture(neonCanvas);
  const neonMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(3.6, 0.9),
    new THREE.MeshBasicMaterial({ map: neonTex })
  );
  neonMesh.position.set(6, 2.8, -4.8);
  streetGroup.add(neonMesh);

  // Neon Light Projection
  const neonLight = new THREE.PointLight(0xff1744, 2.5, 8);
  neonLight.position.set(6, 2.5, -4.2);
  streetGroup.add(neonLight);

  // Environment Ambient Light for Night
  const nightAmbient = new THREE.AmbientLight(0x283593, 0.7);
  streetGroup.add(nightAmbient);

  scene.add(streetGroup);

  return {
    group: streetGroup,
    bounds: {
      minX: -16.5,
      maxX: 16.5,
      minZ: -6.0,
      maxZ: 6.8,
    },
    triggerKidnapX: 13.5, // Trigger kidnapping sequence near end of street
  };
}
