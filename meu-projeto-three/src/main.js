import * as THREE from 'three';
import './style.css';

const app = document.querySelector('#app');

const hud = document.createElement('div');
hud.className = 'hud';
hud.innerHTML = `
  <div class="tag">FASE 1</div>
  <div class="info">WASD / setas para mover · Espaço para atacar · R para reiniciar · Chegue à porta</div>
`;
app.appendChild(hud);

const panel = document.createElement('div');
panel.className = 'panel';
panel.innerHTML = `
  <div class="bars">
    <div class="bar-box">
      <label>JOGADOR</label>
      <div class="bar"><div id="playerBar" class="fill health"></div></div>
    </div>
    <div class="bar-box">
      <label>NPC</label>
      <div class="bar"><div id="npcBar" class="fill danger"></div></div>
    </div>
  </div>
`;
app.appendChild(panel);

const status = document.createElement('div');
status.className = 'status';
status.textContent = 'A cena está pronta.';
app.appendChild(status);

const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xf4efe9, 1);
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf4efe9);

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 40);
camera.position.set(0, 2.3, 8.8);
camera.lookAt(0, 0.5, 0);

const ambient = new THREE.AmbientLight(0xffffff, 1.8);
scene.add(ambient);

const keyLight = new THREE.DirectionalLight(0xfff5d5, 1.35);
keyLight.position.set(4, 6, 4);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xcfe7ff, 0.8);
fillLight.position.set(-5, 4, -3);
scene.add(fillLight);

const phaseConfig = [
  {
    label: 'FASE 1',
    roomColor: 0xf4efe9,
    playerSpawn: new THREE.Vector3(-2.2, 0, 0.6),
    npcSpawn: new THREE.Vector3(4.7, 0, -1.2),
    goalPos: new THREE.Vector3(5.55, 0, 2.82),
    bounds: { minX: -5.7, maxX: 5.8, minZ: -3.7, maxZ: 3.3 },
    npcSpeed: 2.3,
    npcDamage: 18,
  },
  {
    label: 'FASE 2',
    roomColor: 0xeae1dd,
    playerSpawn: new THREE.Vector3(-2.8, 0, 1.4),
    npcSpawn: new THREE.Vector3(4.9, 0, 0.8),
    goalPos: new THREE.Vector3(5.7, 0, -2.5),
    bounds: { minX: -5.7, maxX: 5.8, minZ: -3.6, maxZ: 3.2 },
    npcSpeed: 2.9,
    npcDamage: 24,
  },
];

const goalRing = new THREE.Mesh(
  new THREE.TorusGeometry(0.5, 0.08, 10, 28),
  new THREE.MeshStandardMaterial({ color: 0x9af2bf, emissive: 0x9af2bf, emissiveIntensity: 0.7 })
);
goalRing.rotation.x = Math.PI / 2;
scene.add(goalRing);

const goalLight = new THREE.PointLight(0x8fe9bf, 0.9, 6, 2);
goalLight.position.set(5.55, 1.2, 2.82);
scene.add(goalLight);

const floor = new THREE.Mesh(
  new THREE.BoxGeometry(16, 0.4, 12),
  new THREE.MeshStandardMaterial({ color: 0xd8d0c0, roughness: 1 })
);
floor.position.set(0, -1.9, 0);
scene.add(floor);

const wallA = new THREE.Mesh(
  new THREE.BoxGeometry(13, 3.4, 0.2),
  new THREE.MeshStandardMaterial({ color: 0xe8e2d8, roughness: 1 })
);
wallA.position.set(0, 0.3, -5.7);
scene.add(wallA);

const wallB = new THREE.Mesh(
  new THREE.BoxGeometry(0.2, 3.4, 9.4),
  new THREE.MeshStandardMaterial({ color: 0xe8e2d8, roughness: 1 })
);
wallB.position.set(-7.1, 0.3, 0);
scene.add(wallB);

const doorFrame = new THREE.Mesh(
  new THREE.BoxGeometry(1.8, 2.8, 0.2),
  new THREE.MeshStandardMaterial({ color: 0x876b52, roughness: 1 })
);
doorFrame.position.set(5.7, -0.05, 2.6);
scene.add(doorFrame);

const door = new THREE.Mesh(
  new THREE.BoxGeometry(1.3, 2.3, 0.1),
  new THREE.MeshStandardMaterial({ color: 0x5d4032, roughness: 0.9 })
);
door.position.set(5.7, -0.05, 2.72);
scene.add(door);

const table = new THREE.Mesh(
  new THREE.BoxGeometry(2.7, 0.7, 1.5),
  new THREE.MeshStandardMaterial({ color: 0x9d7353, roughness: 1 })
);
table.position.set(-3.2, -1.4, 1.8);
scene.add(table);

const chair = new THREE.Mesh(
  new THREE.BoxGeometry(0.9, 1.1, 0.9),
  new THREE.MeshStandardMaterial({ color: 0x8c7c62, roughness: 1 })
);
chair.position.set(-2.6, -1.2, 0.9);
scene.add(chair);

const crate = new THREE.Mesh(
  new THREE.BoxGeometry(1.2, 1.2, 1.2),
  new THREE.MeshStandardMaterial({ color: 0x7c5f47, roughness: 1 })
);
crate.position.set(-4.8, -1.05, -2.2);
scene.add(crate);

const lamp = new THREE.Mesh(
  new THREE.CylinderGeometry(0.12, 0.12, 2.5, 8),
  new THREE.MeshStandardMaterial({ color: 0x9a8a6d, metalness: 0.3, roughness: 0.8 })
);
lamp.position.set(3.5, 0.1, -2.8);
scene.add(lamp);

const lampBulb = new THREE.Mesh(
  new THREE.SphereGeometry(0.16, 12, 12),
  new THREE.MeshStandardMaterial({ color: 0xffefbb, emissive: 0xf0d2a4, emissiveIntensity: 1.4 })
);
lampBulb.position.set(3.5, 1.7, -2.8);
scene.add(lampBulb);

const playerBar = document.querySelector('#playerBar');
const npcBar = document.querySelector('#npcBar');

const state = {
  playerHp: 100,
  npcHp: 100,
  gameOver: false,
  win: false,
  attackCooldown: 0,
  attackFlash: 0,
  phaseIndex: 0,
};

const PIXEL_SIZE = 32;
const keys = {};

function drawPixel(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
}

function drawRect(ctx, x, y, w, h, color) {
  for (let yy = 0; yy < h; yy += 1) {
    for (let xx = 0; xx < w; xx += 1) {
      drawPixel(ctx, x + xx, y + yy, color);
    }
  }
}

function buildFrames(kind, variant = 'normal') {
  const result = [];

  for (let frameIndex = 0; frameIndex < 4; frameIndex += 1) {
    const canvas = document.createElement('canvas');
    canvas.width = PIXEL_SIZE;
    canvas.height = PIXEL_SIZE;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const skin = kind === 'male' ? '#f3d8b4' : '#f1dfc1';
    const skinDark = '#d7a578';
    const hair = kind === 'male' ? '#2f201d' : variant === 'evil' ? '#421a1d' : '#6d4b3b';
    const shirt = kind === 'male' ? '#d4bb8c' : variant === 'evil' ? '#3b1111' : '#dfe4d2';
    const pants = kind === 'male' ? '#7d4d39' : variant === 'evil' ? '#201818' : '#5f4337';
    const shoes = kind === 'male' ? '#332923' : '#342323';
    const eye = '#80d7ff';
    const accent = variant === 'evil' ? '#8d1d1d' : '#d8b779';
    const blood = '#7d1717';

    const legSwing = [0, 1, 0, -1][frameIndex];
    const armSwing = [0, -1, 0, 1][frameIndex];

    drawRect(ctx, 10, 28, 12, 2, 'rgba(0,0,0,0.18)');
    drawRect(ctx, 10, 18, 12, 8, shirt);
    drawRect(ctx, 12, 13, 8, 5, shirt);
    drawRect(ctx, 13, 12, 6, 2, accent);

    drawRect(ctx, 7 + armSwing, 18, 3, 7, skin);
    drawRect(ctx, 22 - armSwing, 18, 3, 7, skin);

    drawRect(ctx, 11 + legSwing, 21, 4, 8, pants);
    drawRect(ctx, 17 - legSwing, 21, 4, 8, pants);
    drawRect(ctx, 11 + legSwing, 28, 4, 2, shoes);
    drawRect(ctx, 17 - legSwing, 28, 4, 2, shoes);

    drawRect(ctx, 10, 5, 12, 10, skin);
    drawRect(ctx, 9, 4, 14, 3, hair);
    drawRect(ctx, 8, 6, 16, 2, hair);

    if (kind === 'male') {
      drawRect(ctx, 11, 8, 2, 1, eye);
      drawRect(ctx, 19, 8, 2, 1, eye);
      drawRect(ctx, 15, 10, 2, 1, '#d89d7a');
      drawRect(ctx, 12, 7, 8, 1, '#1f1918');
      drawRect(ctx, 9, 13, 2, 2, '#5a3b36');
      drawRect(ctx, 21, 13, 2, 2, '#5a3b36');
      drawRect(ctx, 8, 15, 2, 3, '#5a3b36');
      drawRect(ctx, 22, 15, 2, 3, '#5a3b36');
    } else {
      drawRect(ctx, 12, 8, 2, 1, eye);
      drawRect(ctx, 18, 8, 2, 1, eye);
      drawRect(ctx, 15, 10, 2, 1, skinDark);

      if (variant === 'normal') {
        drawRect(ctx, 12, 12, 8, 2, '#c9ab80');
        drawRect(ctx, 14, 15, 4, 3, '#e6d4b2');
      } else {
        drawRect(ctx, 10, 12, 2, 2, blood);
        drawRect(ctx, 20, 12, 2, 2, blood);
        drawRect(ctx, 14, 12, 4, 2, blood);
        drawRect(ctx, 12, 9, 2, 1, '#f4d2d2');
        drawRect(ctx, 18, 9, 2, 1, '#f4d2d2');
      }
    }

    if (kind === 'male') {
      drawRect(ctx, 12, 13, 8, 2, '#d7b381');
    }

    if (kind === 'female' && variant === 'evil') {
      drawRect(ctx, 9, 15, 2, 2, '#571b1b');
      drawRect(ctx, 21, 15, 2, 2, '#571b1b');
      drawRect(ctx, 13, 15, 6, 1, '#3f1010');
      drawRect(ctx, 22, 12, 1, 9, '#8a5a2b');
      drawRect(ctx, 23, 11, 2, 2, '#dfe7f0');
      drawRect(ctx, 21, 19, 3, 1, '#3a2318');
    }

    result.push(canvas);
  }

  return result;
}

function makeSlashTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 32, 32);
  ctx.strokeStyle = '#fff5d6';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(18, 7);
  ctx.lineTo(8, 15);
  ctx.lineTo(18, 24);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(18, 7);
  ctx.lineTo(25, 15);
  ctx.lineTo(16, 25);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  return tex;
}

function makeHitTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 32, 32);
  ctx.fillStyle = '#ffb0b0';
  for (let i = 0; i < 14; i += 1) {
    const x = 16 + Math.cos(i * 0.9) * (8 + i * 0.5);
    const y = 16 + Math.sin(i * 0.9) * (8 + i * 0.5);
    ctx.fillRect(x, y, 2, 2);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  return tex;
}

function createActor(kind, x, z, role = 'npc') {
  const normalFrames = buildFrames(kind, 'normal');
  const evilFrames = kind === 'female' ? buildFrames(kind, 'evil') : normalFrames;

  const material = new THREE.SpriteMaterial({ map: normalFrames[0], transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(role === 'player' ? 1.9 : 1.7, role === 'player' ? 2.3 : 2.1, 1);
  sprite.position.set(0, 0.2, 0.08);

  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.add(sprite);
  scene.add(group);

  return {
    kind,
    role,
    group,
    sprite,
    normalFrames,
    evilFrames,
    state: 'normal',
    moving: false,
    direction: 1,
    frame: 0,
    speed: role === 'player' ? 2.5 : 2.2,
    hp: 100,
  };
}

const player = createActor('male', -2.2, 0.6, 'player');
const npc = createActor('female', 4.7, -1.2, 'npc');

const slashTexture = makeSlashTexture();
const hitTexture = makeHitTexture();

const slashSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: slashTexture, transparent: true, depthTest: false }));
slashSprite.scale.set(1.8, 1.2, 1);
slashSprite.visible = false;
slashSprite.position.set(0, 0.8, 0.1);
scene.add(slashSprite);

const hitBursts = [];

function spawnHitBurst(position) {
  const mat = new THREE.SpriteMaterial({ map: hitTexture, transparent: true, depthTest: false, color: 0xffc2c2 });
  const sprite = new THREE.Sprite(mat);
  sprite.position.copy(position);
  sprite.position.y += 0.8;
  sprite.scale.set(1.2, 1.2, 1);
  sprite.userData.life = 0.25;
  scene.add(sprite);
  hitBursts.push(sprite);
}

const goalPos = new THREE.Vector3();

function setPhase(index) {
  state.phaseIndex = index;
  const config = phaseConfig[index];
  player.group.position.copy(config.playerSpawn);
  npc.group.position.copy(config.npcSpawn);
  player.direction = 1;
  npc.direction = -1;
  npc.speed = config.npcSpeed;
  state.playerHp = 100;
  state.npcHp = 100;
  state.attackCooldown = 0;
  state.attackFlash = 0;
  state.gameOver = false;
  state.win = false;
  scene.background = new THREE.Color(config.roomColor);
  renderer.setClearColor(config.roomColor, 1);
  goalPos.copy(config.goalPos);
  goalRing.position.set(goalPos.x, 0.2, goalPos.z);
  goalLight.position.set(goalPos.x, 1.2, goalPos.z);
  hud.querySelector('.tag').textContent = config.label;
  hud.querySelector('.info').textContent = `WASD / setas para mover · Espaço para atacar · R para reiniciar · Chegue à porta`;
  setStatus(`${config.label}: a NPC está te observando.`);
  updateBars();
}

function setStatus(text) {
  status.textContent = text;
}

function updateBars() {
  playerBar.style.width = `${Math.max(0, state.playerHp)}%`;
  npcBar.style.width = `${Math.max(0, state.npcHp)}%`;
}

function resetGame() {
  setPhase(state.phaseIndex);
}

function clampPosition(actor) {
  const config = phaseConfig[state.phaseIndex];
  actor.group.position.x = THREE.MathUtils.clamp(actor.group.position.x, config.bounds.minX, config.bounds.maxX);
  actor.group.position.z = THREE.MathUtils.clamp(actor.group.position.z, config.bounds.minZ, config.bounds.maxZ);
}

function tryAttack() {
  if (state.gameOver || state.win || state.attackCooldown > 0) return;

  const dx = npc.group.position.x - player.group.position.x;
  const dz = npc.group.position.z - player.group.position.z;
  const dist = Math.hypot(dx, dz);
  const facing = player.direction === 1 ? dx >= 0 : dx <= 0;

  if (dist < 1.9 && facing) {
    state.npcHp = Math.max(0, state.npcHp - 28);
    state.attackFlash = 0.2;
    state.attackCooldown = 0.55;
    setStatus('Você acertou o golpe!');
    npc.state = 'evil';
    slashSprite.visible = true;
    slashSprite.position.set(player.group.position.x + (player.direction * 0.9), player.group.position.y + 0.8, player.group.position.z);
    slashSprite.rotation.z = player.direction > 0 ? 0.7 : -0.7;
    slashSprite.scale.set(player.direction > 0 ? 1.8 : -1.8, 1.2, 1);
    spawnHitBurst(npc.group.position.clone());
  } else {
    state.attackCooldown = 0.25;
    setStatus('Seu ataque errou o alvo.');
    slashSprite.visible = true;
    slashSprite.position.set(player.group.position.x + (player.direction * 0.8), player.group.position.y + 0.8, player.group.position.z);
    slashSprite.rotation.z = player.direction > 0 ? 0.7 : -0.7;
    slashSprite.scale.set(player.direction > 0 ? 1.3 : -1.3, 0.9, 1);
  }

  updateBars();
}

window.addEventListener('keydown', (event) => {
  keys[event.code] = true;
  if (event.code === 'KeyE') {
    const dist = player.group.position.distanceTo(npc.group.position);
    if (dist < 2.1) {
      setStatus('Você viu a NPC de perto... ela te encarou.');
    } else {
      setStatus('Não há nada para interagir por perto.');
    }
  }

  if (event.code === 'Space') {
    tryAttack();
  }

  if (event.code === 'KeyR') {
    resetGame();
  }
});

window.addEventListener('keyup', (event) => {
  keys[event.code] = false;
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function updatePlayer(dt) {
  if (state.gameOver || state.win) return;

  const moveX = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0);
  const moveZ = (keys.KeyS || keys.ArrowDown ? 1 : 0) - (keys.KeyW || keys.ArrowUp ? 1 : 0);
  const len = Math.hypot(moveX, moveZ);

  if (len > 0) {
    player.group.position.x += (moveX / len) * player.speed * dt;
    player.group.position.z += (moveZ / len) * player.speed * dt;
    player.direction = moveX >= 0 ? 1 : -1;
    player.moving = true;
  } else {
    player.moving = false;
  }

  clampPosition(player);
  player.sprite.scale.x = player.direction > 0 ? 1.9 : -1.9;
}

function updateNPC(dt, elapsed) {
  if (state.gameOver || state.win) return;

  const config = phaseConfig[state.phaseIndex];
  const dx = player.group.position.x - npc.group.position.x;
  const dz = player.group.position.z - npc.group.position.z;
  const dist = Math.hypot(dx, dz) || 1;

  if (state.npcHp <= 0) {
    npc.state = 'normal';
    npc.moving = false;
    return;
  }

  if (dist < 4.8) {
    npc.state = 'evil';
    setStatus('Ela te viu... a NPC mudou para a aparência sadica!');

    const stepX = dx / dist;
    const stepZ = dz / dist;
    npc.group.position.x += stepX * config.npcSpeed * dt * 1.8;
    npc.group.position.z += stepZ * config.npcSpeed * dt * 1.8;
    npc.direction = stepX >= 0 ? 1 : -1;
    npc.moving = true;

    if (dist < 1.15) {
      const damage = config.npcDamage * dt;
      state.playerHp = Math.max(0, state.playerHp - damage);
      updateBars();
      if (state.playerHp <= 0) {
        state.gameOver = true;
        setStatus('Ela te alcançou... você perdeu. Pressione R para reiniciar.');
      }
    }
  } else {
    npc.state = 'normal';
    npc.group.position.x = config.npcSpawn.x + Math.sin(elapsed * 0.9) * 1.4;
    npc.group.position.z = config.npcSpawn.z + Math.cos(elapsed * 0.8) * 1.5;
    npc.direction = Math.sin(elapsed * 0.8) >= 0 ? 1 : -1;
    npc.moving = true;
  }

  clampPosition(npc);
}

function updateSprite(actor, elapsed) {
  const activeFrames = actor.state === 'evil' ? actor.evilFrames : actor.normalFrames;

  if (actor.moving) {
    actor.frame = Math.floor(elapsed * 10) % activeFrames.length;
    actor.sprite.material.map = activeFrames[actor.frame];
  } else {
    actor.frame = 0;
    actor.sprite.material.map = activeFrames[0];
  }

  actor.sprite.material.needsUpdate = true;
  const bob = actor.moving ? Math.sin(elapsed * 12) * 0.1 : 0;
  actor.group.position.y = bob;
  actor.sprite.scale.x = actor.direction > 0 ? (actor.role === 'player' ? 1.9 : 1.7) : (actor.role === 'player' ? -1.9 : -1.7);
}

function checkGoal() {
  if (state.gameOver || state.win) return;

  if (player.group.position.distanceTo(goalPos) < 1.3) {
    if (state.phaseIndex < phaseConfig.length - 1) {
      state.phaseIndex += 1;
      setPhase(state.phaseIndex);
      setStatus(`Você passou para ${phaseConfig[state.phaseIndex].label}.`);
    } else {
      state.win = true;
      setStatus('Você conseguiu escapar da fase final! Pressione R para reiniciar.');
    }
  }
}

function updateHitBursts() {
  for (let i = hitBursts.length - 1; i >= 0; i -= 1) {
    const burst = hitBursts[i];
    burst.userData.life -= 0.016;
    burst.scale.multiplyScalar(1.05);
    burst.material.opacity = Math.max(0, burst.userData.life / 0.25);
    if (burst.userData.life <= 0) {
      scene.remove(burst);
      hitBursts.splice(i, 1);
    }
  }

  if (slashSprite.visible) {
    slashSprite.material.opacity -= 0.08;
    if (slashSprite.material.opacity <= 0) {
      slashSprite.visible = false;
      slashSprite.material.opacity = 1;
    }
  }
}

const clock = new THREE.Clock();
function animate() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const elapsed = clock.elapsedTime;

  if (state.attackCooldown > 0) state.attackCooldown -= dt;
  if (state.attackFlash > 0) state.attackFlash -= dt;

  updatePlayer(dt);
  updateNPC(dt, elapsed);
  checkGoal();

  updateSprite(player, elapsed);
  updateSprite(npc, elapsed);
  updateHitBursts();

  goalRing.rotation.z += 0.02;

  if (!state.gameOver && !state.win) {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, player.group.position.x * 0.25, 0.06);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 8.8, 0.04);
    camera.lookAt(player.group.position.x * 0.35, 0.2, 0);
  }

  if (state.attackFlash > 0) {
    player.sprite.material.color.setHex(0xfff6ce);
  } else {
    player.sprite.material.color.setHex(0xffffff);
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

setPhase(0);
updateBars();
animate();
