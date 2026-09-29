'use strict';
(() => {
  // ============================================================
  // Constants
  // ============================================================
  const DT = 1 / 60;
  const GRAV_UP = 34, GRAV = 90, MAX_FALL = 22;
  const WALK = 6.2, RUN = 10, ACC = 20, ACC_RUN = 24, DEC = 16, SKID = 42, AIR_ACC = 15;
  const DASH_V = 17;
  const JUMP_V = 16.5, JUMP_V_RUN = 17.8, BOUNCE = 12, BOUNCE_HOLD = 16.5;
  const ENEMY_SPD = 2.2, SHELL_SPD = 13, ITEM_SPD = 3.6, FIRE_SPD = 15;
  const CAM_D = 14.2, CAM_Y = 7.3, FOV = 50;
  const CHAIN = [100, 200, 400, 500, 800, 1000, 2000, 4000, 5000, 8000];
  const SMALL_H = 0.95, BIG_H = 1.85, PW = 0.72;

  const THEMES = {
    over: { bg: ['#4f9cff', '#9fd2ff', '#dff2ff'], fog: 0xbfe2ff, hemi: [0xffffff, 0x5a7a4a, 1.3], sun: [0xfff4e0, 2.4], music: 'over', point: 0, weather: 'pollen', dust: 0xf4ead8 },
    under: { bg: ['#020308', '#0a0e1c', '#141a2c'], fog: 0x05070e, hemi: [0x90a8e0, 0x202038, 0.9], sun: [0x9aa8ff, 1.0], music: 'under', point: 30, weather: 'motes', dust: 0x8a9ac0 },
    sky: { bg: ['#3a2a6a', '#e0607a', '#ffb070', '#ffe0a0'], fog: 0xffb890, hemi: [0xffe0c0, 0x6a4a6a, 1.1], sun: [0xffc080, 2.2], music: 'sky', point: 0, weather: 'petals', dust: 0xfff0e0 },
    snow: { bg: ['#7aa8d8', '#bcd6ee', '#eef6ff'], fog: 0xdce8f4, fogNear: 30, fogFar: 100, hemi: [0xffffff, 0x8090a8, 1.3], sun: [0xffffff, 2.0], music: 'snow', point: 0, weather: 'snow' , dust: 0xffffff },
    desert: { bg: ['#2a78d8', '#80bcf0', '#ffe4a8'], fog: 0xf4dcae, fogNear: 40, fogFar: 130, hemi: [0xfff0d0, 0xa08050, 1.2], sun: [0xfff0c0, 2.8], music: 'desert', point: 0, weather: 'sand' , dust: 0xe8c890 },
    reef: { bg: ['#1a7ab0', '#0a4a80', '#021a3a'], fog: 0x0a4a78, fogNear: 14, fogFar: 60, hemi: [0x80d0ff, 0x103050, 1.1], sun: [0xa0e0ff, 1.8], music: 'reef', point: 10, weather: 'bubbles' , dust: 0xd8f4ff },
    haunted: { bg: ['#05030e', '#1a1030', '#3a2050'], fog: 0x1a1030, fogNear: 20, fogFar: 80, hemi: [0x8070c0, 0x100818, 0.6], sun: [0xa0b0ff, 1.0], music: 'haunted', point: 20, weather: 'fireflies' , dust: 0x9080b8 },
    moon: { bg: ['#000004', '#020210', '#0a0a24'], fog: 0x05050c, fogNear: 60, fogFar: 220, hemi: [0xc0c8ff, 0x202028, 0.7], sun: [0xffffff, 2.6], music: 'moon', point: 0, weather: 'moondust', dust: 0xd0d0da },
    candy: { bg: ['#ff8ac8', '#ffb8e0', '#ffe4f2'], fog: 0xffc8e6, fogNear: 34, fogFar: 120, hemi: [0xfff0f8, 0xa06080, 1.05], sun: [0xfff4f0, 2.0], music: 'candy', point: 0, weather: 'sprinkles', dust: 0xfff0f8 },
    crystal: { bg: ['#02010a', '#0a0620', '#160c30'], fog: 0x0a0620, fogNear: 18, fogFar: 70, hemi: [0x6050a0, 0x100820, 0.35], sun: [0x8070ff, 0.45], music: 'crystal', point: 45, pointColor: 0xd8d0ff, weather: 'glitter', dust: 0xa090d0 },
    airship: { bg: ['#40306a', '#d06a70', '#ffb070', '#ffe0b0'], fog: 0xffc0a0, fogNear: 40, fogFar: 150, hemi: [0xffe0c8, 0x6a4a6a, 1.15], sun: [0xffc890, 2.4], music: 'airship', point: 0, weather: 'wind', dust: 0xe8c8a0 },
    jungle: { bg: ['#4a7a5a', '#8ab890', '#c8e0c0'], fog: 0x8ab098, fogNear: 25, fogFar: 90, hemi: [0xe0ffe0, 0x2a4a20, 1.1], sun: [0xfff0d0, 1.8], music: 'jungle', point: 0, weather: 'rain', dust: 0xa08a60 },
    volcano: { bg: ['#1a0404', '#5a1408', '#b03a10'], fog: 0x4a1a10, fogNear: 30, fogFar: 110, hemi: [0xffa880, 0x3a1410, 1.15], sun: [0xffa070, 2.1], music: 'volcano', point: 14, weather: 'ash', lava: true, dust: 0x6a5a58 },
    fortress: { bg: ['#06020e', '#1a0830', '#300a40'], fog: 0x1a0828, fogNear: 30, fogFar: 90, hemi: [0xb080ff, 0x180818, 0.65], sun: [0xc090ff, 1.0], music: 'fortress', point: 14, weather: 'spirits', lava: true, dust: 0x8a7a9a },
    speedway: { bg: ['#1c5ad0', '#58a8ff', '#bfe6ff', '#fff2d0'], fog: 0xcfe6ff, fogNear: 45, fogFar: 150, hemi: [0xffffff, 0x6a6a5a, 1.25], sun: [0xfff0d8, 2.5], music: 'speedway', point: 0, weather: 'confetti', dust: 0xb0b0b8 },
    castle: { bg: ['#100000', '#300808', '#501008'], fog: 0x200404, fogNear: 30, fogFar: 90, hemi: [0xff9070, 0x200808, 0.7], sun: [0xff9060, 1.0], music: 'castle', point: 14, weather: 'embers', lava: true , dust: 0x9a8a80 },
  };

  const $ = id => document.getElementById(id);

  // ============================================================
  // Renderer / scene
  // ============================================================
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  // Render resolution: full (up to 2x) by default. adaptRes() lowers it a notch only while the GPU
  // can't keep 60 fps, and raises it again once there is room.
  const RES = { steps: [1, 0.85, 0.72, 0.6, 0.5], lvl: 0, t0: 0, frames: 0, good: 0, hold: 0, holdLen: 30, check: null, minDt: 1 };
  const applyRes = () => renderer.setPixelRatio(Math.max(0.75, Math.min(window.devicePixelRatio, 2) * RES.steps[RES.lvl]));
  applyRes();
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  $('game').appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 400);
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, 2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 20, bottom: -20, near: 1, far: 120 });
  sun.shadow.bias = -0.0008;
  sun.shadow.normalBias = 0.02;
  scene.add(sun, sun.target);
  const pLight = new THREE.PointLight(0xffc890, 0, 20, 1);
  scene.add(pLight);

  // Level point lights (torches, crystals, lava glow...): every light costs shading work on every pixel,
  // yet only the few near the camera can reach anything on screen. The originals are hidden and a small
  // pool, sized to the most that are ever in reach at once, takes over the nearest ones each frame.
  const lightPool = [];
  let levelLights = [];
  function setupLevelLights() {
    world.updateMatrixWorld(true);
    levelLights = [];
    world.traverse(o => {
      if (!o.isPointLight) return;
      const p = o.getWorldPosition(new THREE.Vector3());
      o.visible = false;
      levelLights.push({ l: o, x: p.x, y: p.y, z: p.z, reach: 0, dx: 0 });
    });
    sizeLightPool();
  }
  function sizeLightPool() {
    // widest possible view (boost FOV) at the deepest point the light can touch, plus camera sway
    const tanH = Math.tan(THREE.MathUtils.degToRad((FOV + 7) / 2)) * camera.aspect;
    for (const a of levelLights) {
      const d = a.l.distance || 1e4;
      a.reach = d + (CAM_D + d - a.z) * tanH + 2.5;
    }
    let need = 0;
    const w = levelLights.length ? L.w : 0;
    for (let cx = 0; cx <= w; cx += 0.5) {
      let n = 0;
      for (const a of levelLights) if (Math.abs(a.x - cx) < a.reach) n++;
      need = Math.max(need, n);
    }
    while (lightPool.length < need) { const p = new THREE.PointLight(0xffffff, 0); scene.add(p); lightPool.push(p); }
    while (lightPool.length > need) scene.remove(lightPool.pop());
  }
  const nearLights = [];
  function updateLevelLights(cx) {
    nearLights.length = 0;
    for (const a of levelLights) { a.dx = Math.abs(a.x - cx); if (a.dx < a.reach) nearLights.push(a); }
    nearLights.sort((a, b) => a.dx - b.dx);
    for (let i = 0; i < lightPool.length; i++) {
      const p = lightPool[i], a = nearLights[i];
      if (!a) { p.intensity = 0; continue; }
      const l = a.l;
      p.position.set(a.x, a.y, a.z);
      p.color.copy(l.color); p.intensity = l.intensity; p.distance = l.distance; p.decay = l.decay;
    }
  }

  let world = new THREE.Group();
  scene.add(world);

  let halfW = 14, visH = 16;
  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    applyRes();
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    visH = 2 * CAM_D * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    halfW = visH * camera.aspect / 2;
    sizeLightPool();
  }
  window.addEventListener('resize', resize);
  resize();

  // ============================================================
  // Input
  // ============================================================
  const keys = {}, pressed = {};
  const KEYMAP = {
    ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
    ArrowUp: 'jump', KeyW: 'jump', Space: 'jump', KeyZ: 'jump', KeyK: 'jump',
    ShiftLeft: 'run', ShiftRight: 'run', KeyX: 'run', KeyJ: 'run',
    ArrowDown: 'down', KeyS: 'down', Enter: 'start', KeyP: 'pause', Escape: 'pause', KeyM: 'mute', KeyL: 'levels',
  };
  function press(k) { if (!keys[k]) pressed[k] = true; keys[k] = true; }
  function release(k) { keys[k] = false; }
  window.addEventListener('keydown', e => {
    if (G.state === 'title' && G.selectOpen && !e.repeat && (e.code === 'ArrowUp' || e.code === 'ArrowDown')) {
      e.preventDefault(); changeSelect(e.code === 'ArrowUp' ? -3 : 3); return;
    }
    const k = KEYMAP[e.code]; if (!k) return;
    e.preventDefault();
    SFX.init();
    if (!e.repeat) press(k); else keys[k] = true;
  });
  window.addEventListener('keyup', e => { const k = KEYMAP[e.code]; if (k) { e.preventDefault(); release(k); } });
  window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

  // Touch buttons: show only when the primary input is a finger (phones/tablets). Windows laptops with
  // touchscreens report maxTouchPoints > 0, so instead toggle on actual use: touching shows them, typing hides them.
  const setTouchUI = on => document.body.classList.toggle('touch', on);
  setTouchUI(window.matchMedia('(pointer: coarse)').matches);
  window.addEventListener('pointerdown', e => { if (e.pointerType === 'touch') setTouchUI(true); }, true);
  window.addEventListener('keydown', () => setTouchUI(false), true);
  document.querySelectorAll('#touch button').forEach(btn => {
    const k = btn.dataset.k;
    btn.addEventListener('pointerdown', e => { e.preventDefault(); SFX.init(); press(k); btn.setPointerCapture(e.pointerId); });
    const up = e => { e.preventDefault(); release(k); };
    btn.addEventListener('pointerup', up); btn.addEventListener('pointercancel', up); btn.addEventListener('lostpointercapture', up);
  });
  $('title').addEventListener('pointerdown', () => { SFX.init(); pressed.start = true; });
  $('msg').addEventListener('pointerdown', () => { SFX.init(); pressed.start = true; });

  // ============================================================
  // Game state
  // ============================================================
  const G = {
    state: 'title', idx: 0, score: 0, coins: 0, lives: 3, time: 400, timeAcc: 0,
    top: 0, startIdx: 0, freeze: 0, freezeKind: null, reachedMid: false, paused: false, t: 0, timer: 0,
    flagPhase: null, flagT: 0, hurried: false,
  };
  try { G.top = +localStorage.getItem('mario25d-top') || 0; } catch (e) { /* storage unavailable */ }

  const P = {
    x: 3, y: 2, w: PW, h: SMALL_H, vx: 0, vy: 0, dir: 1, onGround: false, size: 0,
    inv: 0, star: 0, combo: 0, anim: 0, skid: false, riding: null, prevY: 0, hidden: false,
    dieJumped: false, throwT: 0, model: null,
  };

  let L = null;    // current level runtime
  let camX = 0;

  // ============================================================
  // Level building
  // ============================================================
  function solidAt(tx, ty) {
    if (tx < 0 || tx >= L.w) return true;
    if (ty < 0 || ty >= L.h) return false;
    return L.grid[ty][tx] !== ' ';
  }
  const key = (x, y) => y * 10000 + x;

  function applyTheme(th) {
    scene.background = TEX.gradient(th.bg);
    scene.fog = new THREE.Fog(th.fog, th.fogNear || 38, th.fogFar || 110);
    hemi.color.setHex(th.hemi[0]); hemi.groundColor.setHex(th.hemi[1]); hemi.intensity = th.hemi[2];
    sun.color.setHex(th.sun[0]); sun.intensity = th.sun[1];
    pLight.intensity = th.point;
    pLight.visible = th.point > 0;
    pLight.color.setHex(th.pointColor || 0xffc890);
  }

  function loadLevel(idx, fromMid) {
    $('toast').classList.remove('show');
    G.bcPhase = null; G.flagPhase = null; G.flash = 0; G.shake = 0;
    const oldWorld = world, oldBg = scene.background;
    scene.remove(world);
    world = new THREE.Group();
    scene.add(world);
    const def = LEVELS[idx].build();
    const th = THEMES[def.theme];
    const T = TEX.mats(def.theme);
    L = {
      idx, def, w: def.w, h: def.h, grid: def.grid, th, T, theme: def.theme,
      blocks: new Map(), enemies: [], items: [], coins: [], fireballs: [], fx: [], lifts: [],
      flagX: def.flagX, castleX: def.castleX, flag: null, castle: null, clouds: [],
      cannons: [], firebars: [], bridge: [], anims: [], weather: null, boss: null, axe: null, princess: null,
      phys: {
        water: def.water, ice: def.ice, wind: def.wind, meteors: def.meteors,
        g: def.lowgrav ? 0.5 : 1, jump: def.lowgrav ? 0.85 : 1, fall: def.lowgrav ? 0.6 : 1,
      },
    };
    applyTheme(th);
    buildStatic();
    buildDecor();
    for (const e of def.enemies) spawnEnemy(e.kind, e.x, e.y);
    for (const p of def.piranhas) spawnEnemy('piranha', p.x + 1 - 0.35, p.top);
    for (const p of def.podoboos) spawnEnemy('podoboo', p.x - 0.35, -1);
    for (const c of def.cannons) L.cannons.push({ x: c.x, y: c.y, t: 1 + Math.random() * 2 });
    for (const f of def.firebars) {
      const balls = [];
      for (let i = 0; i < f.len; i++) { const m = MODELS.fireball(); m.root.children.forEach(c => { c.castShadow = false; }); world.add(m.root); balls.push(m.root); }
      L.firebars.push({ x: f.x + 0.5, y: f.y + 0.5, len: f.len, speed: f.speed, a: Math.random() * 6, balls });
    }
    if (def.boss) {
      const b = spawnEnemy('bowser', def.boss.x, def.boss.y);
      b.hp = def.boss.hp || 5;
      L.boss = b;
    }
    if (def.axe) {
      const m = MODELS.axe();
      m.root.position.set(def.axe.x + 0.5, def.axe.y, 0);
      world.add(m.root);
      L.axe = { x: def.axe.x, y: def.axe.y, w: 1, h: 1.6, m };
    }
    if (def.princess) {
      const who = def.princess.who || 'princess';
      const m = who === 'toad' ? MODELS.toad() : MODELS.princess();
      m.root.position.set(def.princess.x + 0.5, def.princess.y, 0);
      m.root.rotation.y = -0.6;
      world.add(m.root);
      L.princess = { x: def.princess.x, m, who };
    }
    if (th.weather) L.weather = DECOR.weather(th.weather, world, P.x);
    for (const c of def.coins) {
      const m = MODELS.coin();
      m.root.position.set(c.x + 0.5, c.y, 0);
      world.add(m.root);
      L.coins.push({ x: c.x, y: c.y, m });
    }
    for (const lf of def.lifts) {
      const mesh = new THREE.Mesh(MODELS.boxGeo(lf.w, 0.35, 1.4), MODELS.mat(0xf0a030, { metalness: 0.4, roughness: 0.35 }));
      mesh.castShadow = true; mesh.receiveShadow = true;
      const rim = new THREE.Mesh(MODELS.boxGeo(lf.w + 0.04, 0.08, 1.44), MODELS.mat(0xffffff, { roughness: 0.4 }));
      rim.position.y = 0.16; mesh.add(rim);
      world.add(mesh);
      L.lifts.push({ x: lf.x, y: lf.y, w: lf.w, h: 0.35, bx: lf.x, by: lf.y, axis: lf.axis, range: lf.range, speed: lf.speed, t: 0, dx: 0, dy: 0, mesh });
    }
    // player
    if (!P.model) { P.model = MODELS.player(); P.model.root.traverse(o => { if (o.isMesh) o.castShadow = true; }); }
    world.add(P.model.root);
    let sx = def.start.x, sy = def.start.y;
    if (fromMid && def.mid != null) {
      sx = def.mid;
      let y = 0; while (y < L.h && !solidAt(sx, y)) y++;
      while (y < L.h && solidAt(sx, y)) y++;
      sy = y;
    }
    Object.assign(P, { z: 0, x: sx, y: sy, vx: 0, vy: 0, dir: 1, onGround: false, inv: 0, star: 0, combo: 0, riding: null, hidden: false, dieJumped: false, skid: false, duck: false, boost: 0 });
    P.h = P.size > 0 ? BIG_H : SMALL_H;
    P.model.setPalette(P.size === 2 ? 'fire' : 'normal');
    P.model.root.visible = true;
    P.model.body.rotation.set(0, 1.1, 0);
    camX = Math.max(halfW, P.x);
    clampCam();
    G.time = def.time || 400; G.timeAcc = 0; G.hurried = false; G.freeze = 0;
    G.windT = 0; DECOR.gust = 0; L.meteorT = 3;
    setupLevelLights();
    releaseOld(oldWorld, oldBg);
    warmShaders();
  }

  // Geometries and textures used by a subtree (sprites share one built-in geometry, left alone).
  function gpuRes(root, set = new Set()) {
    root.traverse(o => {
      if (o.geometry && !o.isSprite) set.add(o.geometry);
      const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
      for (const m of ms) for (const k in m) { const v = m[k]; if (v && v.isTexture) set.add(v); }
    });
    return set;
  }
  // Each (re)load rebuilds the world; free the GPU buffers the new one no longer uses so memory
  // doesn't pile up with every death or level. Cached resources re-upload by themselves if needed again.
  function releaseOld(oldWorld, oldBg) {
    const keep = gpuRes(world);
    keep.add(scene.background);
    const old = gpuRes(oldWorld);
    if (oldBg && oldBg.isTexture) old.add(oldBg);
    for (const r of old) if (!keep.has(r) && !Object.values(FXG).includes(r)) r.dispose();
  }
  // Compile every shader the level can need while it loads (behind the intro card), so the first
  // fireball, power-up or effect doesn't stall a frame in the middle of a run.
  function warmShaders() {
    const g = new THREE.Group();
    const add = o => g.add(o.root || o);
    for (const m of [MODELS.fireball(), MODELS.coin(), MODELS.mushroom(false), MODELS.mushroom(true), MODELS.flower(), MODELS.star(),
      MODELS.bullet(), MODELS.flame(), MODELS.meteor()]) add(m);
    add(new THREE.Mesh(MODELS.boxGeo(0.4, 0.4, 0.4), L.T.brick));
    add(new THREE.Mesh(FXG.puff, new THREE.MeshBasicMaterial({ transparent: true })));
    add(new THREE.Mesh(FXG.ball, new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false })));
    add(new THREE.Mesh(MODELS.geo('mRing', () => new THREE.RingGeometry(0.35, 0.55, 24).rotateX(-Math.PI / 2)),
      new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide })));
    add(new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })));
    add(new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.textTex('100'), transparent: true, depthTest: false })));
    world.add(g);
    renderer.compile(scene, camera);
    for (const r of gpuRes(g)) if (r.isTexture) renderer.initTexture(r);
    world.remove(g);
    // one real render builds what compile() can't: shadow-depth and sky shaders, level textures
    camera.position.set(camX - 1.2, CAM_Y + 3.4, CAM_D);
    camera.lookAt(camX, CAM_Y - 0.2, 0);
    sun.position.set(camX - 12, 30, 20); sun.target.position.set(camX, 0, 0);
    updateLevelLights(camX);
    renderer.render(scene, camera);
    // instanced crowds/schools get placed by their first animation tick: let their bounds be measured then
    world.traverse(o => { if (o.isInstancedMesh) { o.boundingSphere = null; o.boundingBox = null; } });
  }

  function buildStatic() {
    const { grid, w, h, T } = L;
    const lists = { grass: [], dirt: [], hard: [], tree: [] };
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const c = grid[y][x];
      if (c === ' ') continue;
      if (c === '#') {
        const above = y + 1 < h ? grid[y + 1][x] : ' ';
        (above === '#' ? lists.dirt : lists.grass).push([x, y]);
      } else if (c === 'X') lists.hard.push([x, y]);
      else if (c === 'K') {
        const m = MODELS.cannon(y + 1 >= h || grid[y + 1][x] !== 'K');
        m.position.set(x + 0.5, y, 0);
        m.traverse(o => { if (o.isMesh) o.castShadow = true; });
        world.add(m);
      } else if (c === 'R') {
        const m = MODELS.bridgePlank();
        m.position.set(x + 0.5, y, 0);
        world.add(m);
        L.bridge.push({ x, y, m });
      }
      else if (c === 'T') lists.tree.push([x, y]);
      else if (c === 'P') {
        const isTopLeft = (y + 1 >= h || grid[y + 1][x] !== 'P') && (x === 0 || grid[y][x - 1] !== 'P');
        if (isTopLeft) {
          let yy = y; while (yy >= 0 && grid[yy][x] === 'P') yy--;
          const bottom = yy + 1, top = y + 1;
          const p = MODELS.pipe(top - bottom);
          p.position.set(x + 1, bottom, 0);
          world.add(p);
        }
      } else {
        const m = new THREE.Mesh(MODELS.boxGeo(1, 1, 1), blockMat(c));
        m.position.set(x + 0.5, y + 0.5, 0);
        m.castShadow = true; m.receiveShadow = true;
        world.add(m);
        L.blocks.set(key(x, y), { x, y, type: c, mesh: m, bump: 0, coinsLeft: c === 'C' ? 8 : 0 });
      }
    }
    const mk = (list, geo, mat, z) => {
      if (!list.length) return;
      const im = new THREE.InstancedMesh(geo, mat, list.length);
      const m4 = new THREE.Matrix4();
      list.forEach(([x, y], i) => { m4.makeTranslation(x + 0.5, y + 0.5, z); im.setMatrixAt(i, m4); });
      im.castShadow = true; im.receiveShadow = true;
      world.add(im);
    };
    // visual-only ground extending past both level edges
    const floating = L.theme === 'sky' || L.theme === 'airship';
    if (!floating) for (let i = 1; i <= 24; i++) {
      if (grid[1][0] === '#') { lists.grass.push([-i, 1]); lists.dirt.push([-i, 0]); }
      if (grid[1][w - 1] === '#') { lists.grass.push([w - 1 + i, 1]); lists.dirt.push([w - 1 + i, 0]); }
    }
    // deep earth under each run of ground so the world doesn't float
    if (!floating) for (let x = 0; x < w;) {
      if (grid[0][x] !== '#') { x++; continue; }
      let x2 = x; while (x2 < w && grid[0][x2] === '#') x2++;
      const x0 = x === 0 ? -24 : x, x1 = x2 === w ? w + 24 : x2;
      const deep = new THREE.Mesh(MODELS.boxGeo(x1 - x0, 12, 4), T.dirt);
      deep.position.set((x0 + x1) / 2, -6, -0.5);
      deep.receiveShadow = true;
      world.add(deep);
      x = x2;
    }
    mk(lists.grass, MODELS.boxGeo(1, 1, 4), T.grass, -0.5);
    // chunky overhanging lip along the front edge of each ground run (diorama look)
    if (!TEX.isStone(L.theme)) {
      for (let x = -24; x < w + 24;) {
        const g = xx => xx < 0 ? grid[1][0] === '#' : xx >= w ? grid[1][w - 1] === '#' : grid[1][xx] === '#' && grid[2][xx] !== '#';
        if (!g(x)) { x++; continue; }
        let x2 = x; while (x2 < w + 24 && g(x2)) x2++;
        const len = x2 - x;
        const lip = new THREE.Mesh(MODELS.boxGeo(len + 0.1, 0.22, 0.16), T.grassTop);
        lip.position.set(x + len / 2, 1.9, 1.56);
        lip.castShadow = true; lip.receiveShadow = true;
        world.add(lip);
        const lipB = new THREE.Mesh(MODELS.boxGeo(len + 0.1, 0.16, 0.12), T.grassTop);
        lipB.position.set(x + len / 2, 1.93, -2.55);
        world.add(lipB);
        x = x2;
      }
    }
    mk(lists.dirt, MODELS.boxGeo(1, 1, 4), T.dirt, -0.5);
    mk(lists.hard, MODELS.boxGeo(1, 1, 1.6), T.hard, 0);
    mk(lists.tree, MODELS.boxGeo(1, 1, 2.4), T.tree, 0);
    // trunks under treetop platforms
    for (let y = 0; y < h; y++) {
      let x = 0;
      while (x < w) {
        if (grid[y][x] === 'T') {
          let x2 = x; while (x2 < w && grid[y][x2] === 'T') x2++;
          const len = x2 - x, tw = Math.max(0.8, len - 1.6), th = y + 8;
          const trunk = new THREE.Mesh(MODELS.boxGeo(tw, th, 1.2), T.bark);
          trunk.position.set(x + len / 2, y - th / 2, -0.4);
          trunk.receiveShadow = true;
          world.add(trunk);
          x = x2;
        } else x++;
      }
    }
    // flag + castle
    if (L.flagX != null) {
      const f = MODELS.flagpole(9.5);
      f.root.position.set(L.flagX + 0.5, 3, 0);
      world.add(f.root);
      L.flag = f;
    }
    if (L.castleX != null) {
      const c = MODELS.castle(T.castle);
      c.root.position.set(L.castleX + 2.5, 2, 0);
      world.add(c.root);
      c.flag.visible = false;
      L.castle = c;
    }
  }

  function blockMat(c) {
    const T = L.T;
    switch (c) {
      case 'B': case 'C': return T.brick;
      case '?': case 'M': case 'S': case 'L': return T.q;
      case 'U': return T.used;
      case 'J': return T.jelly;
      case 'D': return T.crumble;
      case 'A': return T.dash;
      default: return T.hard;
    }
  }

  function buildDecor() {
    const { theme, w } = L;
    const rnd = (() => { let s = 1234 + L.idx * 77; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();
    const groundAt = x => x >= 0 && x < w && L.grid[1][x] === '#' && L.grid[2][x] === ' ';
    if (theme === 'over') {
      const back = new THREE.Mesh(new THREE.BoxGeometry(w + 120, 1, 70), MODELS.mat(0x58b848, { roughness: 1 }));
      back.position.set(w / 2, 0.5, -2.5 - 35);
      back.receiveShadow = true;
      world.add(back);
      const mHill = MODELS.mat(0x46a84a, { roughness: 0.9 });
      const mHill2 = MODELS.mat(0x6cc460, { roughness: 0.9 });
      for (let x = -10; x < w + 20; x += 20 + rnd() * 18) {
        const h1 = MODELS.hill(rnd() < 0.5 ? mHill : mHill2, 2.5 + rnd() * 3.5);
        h1.position.set(x, 1, -8 - rnd() * 10);
        world.add(h1);
      }
      for (let x = -30; x < w + 40; x += 30 + rnd() * 30) {
        const h1 = MODELS.hill(mHill, 9 + rnd() * 8);
        h1.position.set(x, 1, -40 - rnd() * 15);
        world.add(h1);
      }
      const mB = MODELS.mat(0x2fa83c, { roughness: 0.8 });
      for (let x = 8; x < w; x += 9 + Math.floor(rnd() * 14)) {
        if (!groundAt(x) || !groundAt(x + 1) || !groundAt(x - 1)) continue;
        const b = MODELS.bush(mB, 1 + Math.floor(rnd() * 3));
        b.position.set(x + 0.5, 2, -1.9);
        world.add(b);
      }
      for (let x = 4; x < w + 20; x += 5 + rnd() * 9) {
        const t = MODELS.tree(2 + rnd() * 3);
        t.position.set(x, 1, -5 - rnd() * 14);
        world.add(t);
      }
      addClouds(0xffffff, 10, 16, -14, -30, 0.35);
    } else if (theme === 'under') {
      const wallTex = TEX.mats('under').brick.map.clone();
      wallTex.needsUpdate = true;
      wallTex.repeat.set((w + 60) / 2, 8);
      const wall = new THREE.Mesh(new THREE.PlaneGeometry(w + 60, 32), new THREE.MeshStandardMaterial({ map: wallTex, color: 0x6070a0, roughness: 1 }));
      wall.position.set(w / 2, 8, -3);
      wall.receiveShadow = true;
      world.add(wall);
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(w + 60, 4), MODELS.mat(0x10141c));
      floor.rotation.x = -Math.PI / 2; floor.position.set(w / 2, -4, -1);
      world.add(floor);
      const crystalG = new THREE.OctahedronGeometry(0.35, 0);
      const cols = [0x40e0ff, 0xa060ff, 0x40ffa0];
      for (let x = 3; x < w; x += 4 + rnd() * 7) {
        const c = new THREE.Mesh(crystalG, MODELS.mat(cols[Math.floor(rnd() * 3)], { emissive: cols[Math.floor(rnd() * 3)], emissiveIntensity: 1.2, roughness: 0.2 }));
        c.position.set(x, 3 + rnd() * 9, -2.8);
        c.scale.set(0.6, 1.2 + rnd(), 0.6);
        c.rotation.z = (rnd() - 0.5) * 0.8;
        world.add(c);
      }
      // torches
      for (let x = 12; x < w - 10; x += 24) {
        const torch = new THREE.PointLight(0xff8830, 6, 10, 1.5);
        torch.position.set(x, 8, -1.5);
        world.add(torch);
        const flame = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.5, 8), MODELS.mat(0xffa030, { emissive: 0xff6010, emissiveIntensity: 2 }));
        flame.position.set(x, 8, -2.7);
        world.add(flame);
        L.clouds.push({ m: flame, flicker: true, light: torch, base: 6 });
      }
    } else if (theme === 'sky') {
      const sunM = new THREE.Mesh(new THREE.SphereGeometry(12, 24, 16), new THREE.MeshBasicMaterial({ color: 0xffd080, fog: false }));
      sunM.position.set(w * 0.6, 4, -150);
      world.add(sunM);
      L.sunMesh = sunM;
      const mMt = MODELS.mat(0x6a4a8a, { roughness: 1 });
      const mMt2 = MODELS.mat(0x8a5a8a, { roughness: 1 });
      for (let x = -40; x < w + 60; x += 14 + rnd() * 18) {
        const hgt = 10 + rnd() * 16;
        const mt = new THREE.Mesh(new THREE.ConeGeometry(hgt * 0.8, hgt, 5), rnd() < 0.5 ? mMt : mMt2);
        mt.position.set(x, hgt / 2 - 8, -70 - rnd() * 30);
        world.add(mt);
      }
      addClouds(0xffd8c8, -3, 3, -10, -24, 0.2);
      addClouds(0xffe8d8, 11, 16, -20, -40, 0.25);
      const ground = new THREE.Mesh(new THREE.BoxGeometry(w + 200, 1, 200), MODELS.mat(0x5a3a6a, { roughness: 1 }));
      ground.position.set(w / 2, -9, -60);
      world.add(ground);
    }
    const ctx = {
      world, L, rnd, groundAt,
      anim: fn => L.anims.push(fn),
      camX: () => camX,
      dust: (x, y, n, sp, up, c) => dust(x, y, n, sp, up, c),
      sfx: name => SFX.fx[name] && SFX.fx[name](),
      flash: k => { G.flash = k; },
    };
    if (DECOR.themes[theme]) DECOR.themes[theme](ctx);
    DETAILS.build(theme, ctx);
  }
  function addClouds(color, y0, y1, z0, z1, emissive) {
    const mC = MODELS.mat(color, { emissive: color, emissiveIntensity: emissive, roughness: 1 });
    let s = 99 + L.idx;
    const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    for (let x = -10; x < L.w + 30; x += 7 + r() * 12) {
      const c = MODELS.cloud(mC);
      c.position.set(x, y0 + r() * (y1 - y0), z0 + r() * (z1 - z0));
      const sc = 0.8 + r() * 1.2;
      c.scale.setScalar(sc);
      world.add(c);
      L.clouds.push({ m: c, speed: 0.1 + r() * 0.25 });
    }
  }

  // ============================================================
  // Entities
  // ============================================================
  function spawnEnemy(kind, x, y) {
    let e;
    const base = { vx: -ENEMY_SPD, vy: 0, dir: -1, onGround: false, active: false, dead: false, squish: false, kickGrace: 0, chain: 0, anim: Math.random() * 6 };
    switch (kind) {
      case 'goomba': e = { kind, x, y, w: 0.86, h: 0.86, m: MODELS.goomba(), stompable: true }; break;
      case 'koopa': case 'red':
        e = { kind: 'koopa', red: kind === 'red', x, y, w: 0.86, h: 1.2, m: MODELS.koopa(kind === 'red'), state: 'walk', shellT: 0, edgeTurn: kind === 'red', stompable: true };
        break;
      case 'spiny': e = { kind, x, y, w: 0.86, h: 0.8, m: MODELS.spiny() }; break;
      case 'fish': case 'fishg':
        e = { kind: 'fish', x, y, w: 0.9, h: 0.75, m: MODELS.fish(kind === 'fishg'), free: true, baseY: y };
        base.vx = -(kind === 'fishg' ? 1.3 : 2.1);
        break;
      case 'boo':
        e = { kind, x, y, w: 0.85, h: 0.85, m: MODELS.boo(), free: true, fireproof: true, shy: false };
        base.vx = 0;
        break;
      case 'bullet':
        e = { kind, x, y, w: 0.95, h: 0.8, m: MODELS.bullet(), free: true, fireproof: true, stompable: true };
        break;
      case 'piranha':
        e = { kind, x, y, w: 0.7, h: 0.01, m: MODELS.piranha(), free: true, top: y, o: 0, cycle: Math.random() * 2 };
        base.vx = 0;
        break;
      case 'podoboo':
        e = { kind, x, y, w: 0.7, h: 0.75, m: MODELS.podoboo(), free: true, fireproof: true, starproof: true, cycle: Math.random() * 3 };
        base.vx = 0;
        break;
      case 'flame':
        e = { kind, x, y, w: 1.1, h: 0.45, m: MODELS.flame(), free: true, fireproof: true, starproof: true, targetY: y };
        break;
      case 'meteor':
        e = { kind, x, y, w: 0.8, h: 0.8, m: MODELS.meteor(), free: true, fireproof: true, starproof: true };
        base.vx = -2.5; base.vy = -10; base.active = true;
        break;
      case 'bowser':
        e = { kind, x, y, w: 1.7, h: 2.1, m: MODELS.bowser(), boss: true, starproof: true, hp: 5, homeX: x, fireT: 2.5, jumpT: 3, hurtT: 0 };
        base.vx = -1;
        break;
    }
    Object.assign(e, base, { vx: base.vx, vy: base.vy });
    if (e.m.root) e.m.root.traverse(o => { if (o.isMesh && o.castShadow === undefined) o.castShadow = true; });
    world.add(e.m.root);
    L.enemies.push(e);
    return e;
  }


  function boxSolid(x, y, w, h) {
    for (let ty = Math.floor(y + 0.01); ty <= Math.floor(y + h - 0.01); ty++)
      for (let tx = Math.floor(x + 0.01); tx <= Math.floor(x + w - 0.01); tx++)
        if (tx >= 0 && tx < L.w && solidAt(tx, ty)) return true;
    return false;
  }
  // projectiles pop when their nose enters a solid tile (cannons themselves excepted)
  function hitsWall(e) {
    const tx = Math.floor(e.x + (e.vx > 0 ? e.w : 0)), ty = Math.floor(e.y + e.h / 2);
    if (tx < 0 || tx >= L.w || ty < 0 || ty >= L.h) return false;
    const c = L.grid[ty][tx];
    return c !== ' ' && c !== 'K';
  }
  function overlap(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }

  function moveBody(b) {
    const r = { hitX: 0, head: null };
    b.x += b.vx * DT;
    const y0 = Math.floor(b.y + 0.001), y1 = Math.floor(b.y + b.h - 0.001);
    if (b.vx > 0) {
      const tx = Math.floor(b.x + b.w);
      for (let ty = y0; ty <= y1; ty++) if (solidAt(tx, ty)) { b.x = tx - b.w; r.hitX = 1; break; }
    } else if (b.vx < 0) {
      const tx = Math.floor(b.x);
      for (let ty = y0; ty <= y1; ty++) if (solidAt(tx, ty)) { b.x = tx + 1; r.hitX = -1; break; }
    }
    b.y += b.vy * DT;
    b.onGround = false;
    const x0 = Math.floor(b.x + 0.001), x1 = Math.floor(b.x + b.w - 0.001);
    if (b.vy <= 0) {
      const ty = Math.floor(b.y);
      for (let tx = x0; tx <= x1; tx++) if (solidAt(tx, ty)) { b.y = ty + 1; b.vy = 0; b.onGround = true; r.floor = { x: tx, y: ty }; break; }
    } else {
      const ty = Math.floor(b.y + b.h);
      let best = null, bd = 9;
      for (let tx = x0; tx <= x1; tx++) if (solidAt(tx, ty)) {
        const d = Math.abs(tx + 0.5 - (b.x + b.w / 2));
        if (d < bd) { bd = d; best = tx; }
      }
      if (best !== null) {
        // corner forgiveness: nudge the player around a block edge they barely clipped
        if (b === P && x0 !== x1 && bd > 0.55 && !solidAt(best === x0 ? x1 : x0, ty)) {
          const push = best === x0 ? (x0 + 1) - b.x : x1 - (b.x + b.w);
          if (Math.abs(push) < 0.3) { b.x += push; return r; }
        }
        b.y = ty - b.h; b.vy = 0; r.head = { x: best, y: ty };
      }
    }
    return r;
  }

  // ---------------- score / fx ----------------
  function addScore(n, x, y) {
    G.score += n;
    if (x !== undefined) popup(String(n), x, y);
  }
  function addCoin() {
    G.coins++;
    if (G.coins >= 100) { G.coins -= 100; oneUp(); }
    G.score += 200;
    SFX.fx.coin();
  }
  function oneUp(x, y) {
    G.lives++;
    SFX.fx.oneup();
    if (x !== undefined) popup('1UP', x, y, '#7cff6a');
  }
  function chainScore(i, x, y) {
    if (i >= CHAIN.length) oneUp(x, y);
    else addScore(CHAIN[i], x, y);
  }
  function popup(text, x, y, color = '#fff') {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.textTex(text, color), transparent: true, depthTest: false }));
    sp.scale.set(2, 0.5, 1);
    sp.position.set(x, y, 0.8);
    sp.renderOrder = 10;
    world.add(sp);
    L.fx.push({ type: 'popup', m: sp, t: 0, life: 0.9 });
  }
  function debris(x, y) {
    for (const [dx, dy] of [[-1, 1], [1, 1], [-1, 0], [1, 0]]) {
      const m = new THREE.Mesh(MODELS.boxGeo(0.4, 0.4, 0.4), L.T.brick);
      m.position.set(x + 0.5 + dx * 0.2, y + 0.5 + dy * 0.2, (Math.random() - 0.5) * 0.5);
      m.castShadow = true;
      world.add(m);
      L.fx.push({ type: 'debris', m, vx: dx * 3.5, vy: 9 + dy * 5, vz: (Math.random() - 0.5) * 4, t: 0, life: 2 });
    }
  }
  function puff(x, y, color = 0xffffff) {
    const m = new THREE.Mesh(FXG.puff, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 }));
    m.position.set(x, y, 0.3);
    world.add(m);
    L.fx.push({ type: 'puff', m, t: 0, life: 0.3 });
  }
  const FXG = { ball: new THREE.SphereGeometry(1, 8, 6), puff: new THREE.SphereGeometry(0.25, 10, 8), spark: new THREE.SphereGeometry(0.1, 6, 4) };
  const starTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d');
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,.8)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    g.fillStyle = '#fff';
    g.beginPath();
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, r = i % 2 ? 5 : 30; g.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r); }
    g.fill();
    return new THREE.CanvasTexture(c);
  })();
  function dust(x, y, n = 4, spread = 1, up = 1, color) {
    const col = color !== undefined ? color : (L.th.dust || 0xffffff);
    for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(FXG.ball, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.75, depthWrite: false }));
      const s0 = 0.09 + Math.random() * 0.09;
      m.scale.setScalar(s0);
      m.position.set(x + (Math.random() - 0.5) * 0.4, y + 0.08, 0.2 + (Math.random() - 0.5) * 0.5);
      world.add(m);
      L.fx.push({ type: 'dust', m, s0, vx: (Math.random() - 0.5) * 2.4 * spread, vy: up * (0.4 + Math.random() * 0.9), vz: (Math.random() - 0.5), t: 0, life: 0.4 + Math.random() * 0.25 });
    }
  }
  function sparkle(x, y, n = 6, color = 0xfff4a0, speed = 3, size = 0.55) {
    for (let i = 0; i < n; i++) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      const a = Math.random() * Math.PI * 2, v = speed * (0.4 + Math.random() * 0.6);
      sp.position.set(x, y, 0.5);
      sp.scale.setScalar(size * (0.6 + Math.random() * 0.6));
      world.add(sp);
      L.fx.push({ type: 'twinkle', m: sp, s0: sp.scale.x, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, life: 0.35 + Math.random() * 0.3 });
    }
  }
  function shake(a) { G.shake = Math.max(G.shake || 0, a); }
  function firework(x, y) {
    const cols = [0xff4040, 0xffe040, 0x40c0ff, 0x80ff60, 0xff80ff];
    const c = cols[Math.floor(Math.random() * cols.length)];
    for (let i = 0; i < 18; i++) {
      const a = i / 18 * Math.PI * 2;
      const m = new THREE.Mesh(FXG.spark, new THREE.MeshBasicMaterial({ color: c, transparent: true }));
      m.position.set(x, y, -1);
      world.add(m);
      L.fx.push({ type: 'spark', m, vx: Math.cos(a) * 5, vy: Math.sin(a) * 5, vz: 0, t: 0, life: 1.0 });
    }
    SFX.fx.firework();
  }
  function removeMesh(m) { if (m && m.parent) m.parent.remove(m); }

  // ---------------- blocks ----------------
  function hitBlock(tx, ty) {
    const b = L.blocks.get(key(tx, ty));
    if (!b) { SFX.fx.bump(); return; }
    switch (b.type) {
      case 'B':
        if (P.size > 0) { breakBlock(b); return; }
        bumpBlock(b); SFX.fx.bump(); break;
      case '?':
        coinPop(tx, ty); toUsed(b); bumpBlock(b); break;
      case 'C':
        coinPop(tx, ty); bumpBlock(b);
        if (--b.coinsLeft <= 0) toUsed(b);
        break;
      case 'M': spawnItem(P.size === 0 ? 'mushroom' : 'flower', tx, ty); toUsed(b); bumpBlock(b); break;
      case 'S': spawnItem('star', tx, ty); toUsed(b); bumpBlock(b); break;
      case 'L': spawnItem('oneup', tx, ty); toUsed(b); bumpBlock(b); break;
      default: SFX.fx.bump();
    }
  }
  function toUsed(b) { b.type = 'U'; b.mesh.material = L.T.used; }
  function bumpBlock(b) {
    b.bump = 0.2;
    dust(b.x + 0.5, b.y + 1, 2, 0.8, 0.8, 0xffffff);
    bumpAbove(b.x, b.y);
  }
  function bumpAbove(tx, ty) {
    const zone = { x: tx, y: ty + 1, w: 1, h: 0.4 };
    for (const e of L.enemies) {
      if (e.dead || e.squish || !e.active || e.free || e.boss) continue;
      if (overlap(zone, e)) { flipKill(e, e.x + e.w / 2 > tx + 0.5 ? 1 : -1); addScore(100, e.x + e.w / 2, e.y + 1.2); }
    }
    for (const it of L.items) {
      if (it.emerge > 0 || it.kind === 'coinpop' || it.kind === 'flower') continue;
      if (overlap(zone, it)) { it.vy = 10; it.vx = (it.x + it.w / 2 > tx + 0.5 ? 1 : -1) * Math.abs(it.vx || ITEM_SPD); }
    }
    for (const c of L.coins) {
      if (!c.taken && c.x === tx && c.y === ty + 1) { c.taken = true; removeMesh(c.m.root); coinPop(tx, ty + 1, true); }
    }
  }
  function breakBlock(b) {
    L.grid[b.y][b.x] = ' ';
    removeMesh(b.mesh);
    L.blocks.delete(key(b.x, b.y));
    debris(b.x, b.y);
    dust(b.x + 0.5, b.y + 0.3, 5, 1.4, 0.6, 0xc8a080);
    shake(0.18);
    bumpAbove(b.x, b.y);
    G.score += 50;
    SFX.fx.brk();
  }
  function coinPop(tx, ty, silentBump) {
    const m = MODELS.coin();
    m.root.position.set(tx + 0.5, ty + 1, 0);
    world.add(m.root);
    L.items.push({ kind: 'coinpop', x: tx + 0.2, y: ty + 1, w: 0.6, h: 0.6, vx: 0, vy: 15, t: 0, m, emerge: 0 });
    addCoin();
  }
  function spawnItem(kind, tx, ty) {
    let m;
    if (kind === 'mushroom') m = MODELS.mushroom(false);
    else if (kind === 'oneup') m = MODELS.mushroom(true);
    else if (kind === 'flower') m = MODELS.flower();
    else m = MODELS.star();
    world.add(m.root);
    L.items.push({ kind, x: tx + 0.1, y: ty, w: 0.8, h: 0.8, vx: 0, vy: 0, emerge: 1, m, t: 0, onGround: false });
    m.root.position.set(tx + 0.5, ty, 0);
    sparkle(tx + 0.5, ty + 1.2, 8, kind === 'star' ? 0xfff060 : 0xffffff, 3, 0.5);
    SFX.fx.appear();
  }

  // ---------------- player ----------------
  function setSize(s) {
    const was = P.size;
    P.size = s;
    const nh = s > 0 ? BIG_H : SMALL_H;
    P.h = nh; P.duck = false;
    P.model.setPalette(s === 2 ? 'fire' : 'normal');
    if (s > 0 && was === 0) { G.freeze = 0.9; G.freezeKind = 'grow'; }
    if (s === 0 && was > 0) { G.freeze = 0.9; G.freezeKind = 'shrink'; }
  }
  function hurt() {
    if (P.inv > 0 || P.star > 0 || G.state !== 'playing') return;
    if (P.size > 0) {
      setSize(0);
      P.inv = 2.5;
      SFX.fx.shrink();
    } else die();
  }
  function die() {
    if (G.state !== 'playing') return;
    G.state = 'dying'; G.timer = 0;
    P.dieJumped = false; P.vx = 0; P.vy = 0; P.star = 0; P.inv = 0;
    if (P.size > 0) { P.size = 0; P.h = SMALL_H; }
    P.duck = false;
    P.model.setPalette('normal');
    SFX.Music.stop();
    SFX.fx.die();
  }
  function throwFire() {
    const m = MODELS.fireball();
    world.add(m.root);
    const f = { x: P.x + P.w / 2 + P.dir * 0.4 - 0.17, y: P.y + P.h * 0.55, w: 0.34, h: 0.34, vx: P.dir * FIRE_SPD, vy: -4, m, t: 0 };
    L.fireballs.push(f);
    P.throwT = 0.18;
    SFX.fx.fire();
  }

  function updatePlayer() {
    const p = P, ph = L.phys;
    if (p.riding) { p.x += p.riding.dx; p.y = p.riding.y + p.riding.h; }
    // big Mario ducks while holding down (smaller hitbox; stays down under low ceilings)
    if (p.size > 0 && !ph.water) {
      if (keys.down && p.onGround) p.duck = true;
      else if (p.duck && !keys.down && !boxSolid(p.x, p.y, p.w, BIG_H)) p.duck = false;
    } else if (p.duck && !boxSolid(p.x, p.y, p.w, BIG_H)) p.duck = false;
    if (p.size > 0) p.h = p.duck ? SMALL_H : BIG_H;
    // ducking on the ground: slide to a stop, or crawl slowly when a low ceiling keeps Mario down
    const crawl = p.duck && p.onGround && boxSolid(p.x, p.y, p.w, BIG_H);
    const dirIn = p.duck && p.onGround && !crawl ? 0 : (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    const run = !!keys.run;
    let maxV = crawl ? 2 : run ? RUN : WALK, acc = run ? ACC_RUN : ACC, dec = DEC, skid = SKID, air = AIR_ACC;
    // dash panels: a burst of super speed that carries through jumps and duck-slides
    if (p.boost > 0) {
      p.boost -= DT;
      maxV = Math.max(maxV, DASH_V); dec = 1.5;
      if (Math.random() < 0.6) sparkle(p.x + p.w / 2 - Math.sign(p.vx) * 0.4, p.y + Math.random() * p.h, 1, 0xffe040, 1, 0.4);
    }
    if (ph.water) {
      maxV = p.onGround ? (run ? 3.6 : 2.8) : (run ? 4.8 : 3.8);
      acc = 9; dec = p.onGround ? 10 : 1.5; skid = 14; air = 7;
    }
    if (ph.ice && p.onGround) { acc *= 0.35; dec *= 0.2; skid *= 0.3; }
    const v0 = Math.abs(p.vx);
    if (p.onGround) {
      if (dirIn !== 0) {
        if (Math.sign(p.vx) === -dirIn && Math.abs(p.vx) > 0.8) { p.vx += dirIn * skid * DT; p.skid = true; }
        else { p.skid = false; p.vx += dirIn * acc * DT; }
        p.dir = dirIn;
      } else {
        p.skid = false;
        const d = dec * DT;
        p.vx = Math.abs(p.vx) <= d ? 0 : p.vx - Math.sign(p.vx) * d;
      }
    } else if (dirIn !== 0) {
      p.vx += dirIn * air * DT;
      if (ph.water) p.dir = dirIn;
    } else if (ph.water) {
      const d = dec * DT;
      p.vx = Math.abs(p.vx) <= d ? 0 : p.vx - Math.sign(p.vx) * d;
    }
    if (Math.abs(p.vx) > maxV) {
      // cap at top speed; anything above it (e.g. after a dash panel) bleeds off gradually
      p.vx = Math.sign(p.vx) * Math.max(maxV, Math.min(Math.abs(p.vx), v0 - (ph.water ? 20 : DEC) * DT));
    }
    if (ph.water) {
      if (pressed.jump) {
        p.vy = 6.2; p.onGround = false; p.riding = null; p.swimT = 0.35;
        SFX.fx.swim();
      }
      p.vy = Math.max(-4, p.vy - 13 * DT);
    } else {
      // coyote time + jump buffering make jumps feel responsive
      p.coyote = p.onGround ? 0.09 : Math.max(0, (p.coyote || 0) - DT);
      p.jumpBuf = pressed.jump ? 0.13 : Math.max(0, (p.jumpBuf || 0) - DT);
      if (p.jumpBuf > 0 && (p.onGround || p.coyote > 0)) {
        p.vy = (Math.abs(p.vx) > 8 ? JUMP_V_RUN : JUMP_V) * ph.jump;
        p.onGround = false; p.riding = null; p.coyote = 0; p.jumpBuf = 0;
        p.sq = -0.22;
        dust(p.x + p.w / 2, p.y, 3, 0.8, 0.4);
        SFX.fx.jump(p.size > 0);
      }
      const g = ((p.vy > 0 && keys.jump) ? GRAV_UP : GRAV) * ph.g;
      p.vy = Math.max(-MAX_FALL * ph.fall, p.vy - g * DT);
    }
    if (p.swimT > 0) p.swimT -= DT;
    if (pressed.run && p.size === 2 && L.fireballs.length < 2) throwFire();

    p.prevY = p.y;
    const wasGround = p.onGround;
    if (!p.onGround) p.airVy = Math.min(p.airVy || 0, p.vy); else p.airVy = 0;
    // wind gusts shove Mario backwards (applied as a temporary velocity so walls still collide)
    const windV = ph.wind ? -DECOR.gust * (p.onGround ? 2 : 2.8) : 0;
    p.vx += windV;
    const r = moveBody(p);
    if (!r.hitX) p.vx -= windV;
    if (r.floor && !ph.water) {
      const fb = L.blocks.get(key(r.floor.x, r.floor.y));
      if (fb && fb.type === 'J') {
        // jelly spring: hold jump for a super bounce
        p.vy = (keys.jump ? 25 : 21) * ph.jump; p.onGround = false; p.coyote = 0;
        fb.jelly = 1; p.sq = -0.3;
        sparkle(fb.x + 0.5, fb.y + 1, 5, 0x80ffb0, 3, 0.45);
        SFX.fx.spring();
      } else if (fb && fb.type === 'D' && !fb.crumbleT) { fb.crumbleT = DT; SFX.fx.crumble(); }
      else if (fb && fb.type === 'A') {
        if (p.boost <= 0.2) { SFX.fx.dash(); sparkle(fb.x + 0.5, fb.y + 1, 6, 0xffe040, 4, 0.5); }
        p.boost = 1.1; p.vx = Math.max(p.vx, DASH_V); p.dir = 1;
      }
    }
    const minX = camX - halfW + 0.2;
    if (p.x < minX) { p.x = minX; if (p.vx < 0) p.vx = 0; }
    if (r.hitX) p.vx = 0;
    if (r.head) hitBlock(r.head.x, r.head.y);
    if (ph.water && p.y + p.h > 13.3) { p.y = 13.3 - p.h; if (p.vy > 0) p.vy = 0; }
    p.riding = null;
    for (const lf of L.lifts) {
      const top = lf.y + lf.h;
      if (p.vy <= 0 && p.x + p.w > lf.x && p.x < lf.x + lf.w && p.prevY >= top - 0.4 && p.y <= top) {
        p.y = top; p.vy = 0; p.onGround = true; p.riding = lf;
      }
    }
    if (p.onGround) p.combo = 0;
    // landing squash + dust
    if (p.onGround && !wasGround && p.airVy < -7) {
      p.sq = Math.min(0.32, -p.airVy / 55);
      dust(p.x + p.w / 2, p.y, p.airVy < -15 ? 6 : 3, 1.3, 0.35);
    }
    p.sq = (p.sq || 0) * 0.84;
    p.fxT = (p.fxT || 0) - DT;
    if (p.onGround && p.fxT <= 0) {
      if (p.skid) { dust(p.x + p.w / 2 + p.dir * 0.3, p.y, 1, 0.6, 0.6); p.fxT = 0.05; }
      else if (Math.abs(p.vx) > 7.5 && !ph.water) { dust(p.x + p.w / 2 - Math.sign(p.vx) * 0.3, p.y, 1, 0.5, 0.5); p.fxT = 0.09; }
    }
    if (p.star > 0 && Math.random() < 0.35) sparkle(p.x + Math.random() * p.w, p.y + Math.random() * p.h, 1, [0xfff060, 0xff80ff, 0x80ffff, 0xffffff][Math.floor(Math.random() * 4)], 1, 0.45);
    if (L.theme === 'snow' && Math.random() < 0.012) dust(p.x + p.w / 2 + p.dir * 0.3, p.y + p.h * 0.8, 1, 0.3, 0.3, 0xffffff);
    if (ph.water && Math.random() < 0.025) dust(p.x + p.w / 2 + p.dir * 0.25, p.y + p.h * 0.85, 1, 0.2, 2.6, 0xe0f8ff);
    p.anim += Math.abs(p.vx) * DT * 1.7;
    if (p.throwT > 0) p.throwT -= DT;
  }

  // ---------------- enemies ----------------
  function flipKill(e, dir) {
    e.dead = true; e.deadT = 0; e.vy = 9; e.vx = dir * 2.5;
    sparkle(e.x + e.w / 2, e.y + e.h / 2, 6, 0xffffff, 4, 0.5);
    SFX.fx.kick();
  }
  function hittable(e) {
    if (!e.active || e.dead || e.squish || e.remove) return false;
    if (e.kind === 'piranha' && e.o < 0.15) return false;
    if (e.kind === 'podoboo' && e.y < -0.6) return false;
    return true;
  }
  function updateEnemies() {
    const actX = camX + halfW + 3;
    const gs = L.phys.water ? 0.35 : L.phys.g;
    for (const e of L.enemies) {
      if (!e.active) { if (e.x < actX) e.active = true; else continue; }
      e.anim += DT;
      if (e.dead) {
        e.vy -= 40 * gs * DT; e.y += e.vy * DT; e.x += e.vx * DT; e.deadT += DT;
        if (e.deadT > 2.5 || e.y < -6) e.remove = true;
        continue;
      }
      if (e.squish) { e.squishT -= DT; if (e.squishT <= 0) e.remove = true; continue; }
      if (e.free || e.boss) { updateSpecial(e); continue; }
      if (e.kind === 'koopa' && e.state === 'shell') {
        e.shellT += DT;
        if (e.shellT > 7) { e.state = 'walk'; e.h = 1.2; e.vx = e.dir * ENEMY_SPD; }
      }
      if (e.kickGrace > 0) e.kickGrace -= DT;
      e.vy = Math.max(-MAX_FALL, e.vy - GRAV * gs * DT);
      const pvx = e.vx;
      const r = moveBody(e);
      if (r.hitX) {
        e.vx = -pvx; e.dir = Math.sign(e.vx) || e.dir;
        if (e.state === 'slide' && Math.abs(e.x - camX) < halfW + 1) SFX.fx.bump();
      }
      if (e.edgeTurn && e.onGround && e.state === 'walk') {
        const ahead = e.vx > 0 ? Math.floor(e.x + e.w + 0.05) : Math.floor(e.x - 0.05);
        if (!solidAt(ahead, Math.floor(e.y) - 1)) { e.vx = -e.vx; e.dir = -e.dir; }
      }
      if (e.vx) e.dir = Math.sign(e.vx);
      if (e.y < -4 || (L.th.lava && e.y < 1)) e.remove = true;
      if (e.x < camX - halfW - 8 || (e.state === 'slide' && e.x > camX + halfW + 10)) e.remove = true;
    }
    // enemy vs enemy
    const es = L.enemies;
    for (let i = 0; i < es.length; i++) {
      const a = es[i];
      if (!a.active || a.dead || a.squish || a.remove || a.free || a.boss) continue;
      for (let j = i + 1; j < es.length; j++) {
        const b = es[j];
        if (!b.active || b.dead || b.squish || b.remove || b.free || b.boss) continue;
        if (!overlap(a, b)) continue;
        const aS = a.state === 'slide', bS = b.state === 'slide';
        if (aS || bS) {
          if (aS && bS) { flipKill(a, 1); flipKill(b, -1); continue; }
          const shell = aS ? a : b, victim = aS ? b : a;
          flipKill(victim, Math.sign(shell.vx) || 1);
          chainScore(shell.chain++, victim.x + 0.5, victim.y + 1.2);
        } else {
          if (a.x < b.x) { a.vx = -Math.abs(a.vx); b.vx = Math.abs(b.vx); }
          else { a.vx = Math.abs(a.vx); b.vx = -Math.abs(b.vx); }
        }
      }
    }
  }

  function updateSpecial(e) {
    const pc = P.x + P.w / 2, ec = e.x + e.w / 2;
    switch (e.kind) {
      case 'fish': {
        // swim a sine wave but never through reef rocks: turn around at walls, hold depth at ceilings/floors
        const stuck = boxSolid(e.x, e.y, e.w, e.h);
        const nx = e.x + e.vx * DT;
        if (!stuck && boxSolid(nx, e.y, e.w, e.h)) e.vx = -e.vx; else e.x = nx;
        const ny = e.baseY + Math.sin(e.anim * 1.8 + e.baseY) * 0.8;
        if (stuck || !boxSolid(e.x, ny, e.w, e.h)) e.y = ny;
        e.dir = Math.sign(e.vx) || -1;
        if (e.x < camX - halfW - 4) e.remove = true;
        break;
      }
      case 'boo': {
        const py = P.y + P.h / 2, by = e.y + e.h / 2;
        e.dir = pc < ec ? -1 : 1;
        const facing = (Math.sign(ec - pc) || 1) === P.dir && G.state === 'playing';
        e.shy = facing;
        if (facing || Math.abs(ec - pc) > halfW + 2 || G.state !== 'playing') { e.vx *= 0.9; e.vy *= 0.9; }
        else {
          const dx = pc - ec, dy = py - by, d = Math.hypot(dx, dy) || 1;
          e.vx += dx / d * 2.4 * DT; e.vy += dy / d * 2.4 * DT;
          const sp = Math.hypot(e.vx, e.vy);
          if (sp > 1.8) { e.vx *= 1.8 / sp; e.vy *= 1.8 / sp; }
        }
        if (boxSolid(e.x + e.vx * DT, e.y, e.w, e.h)) e.vx = 0; else e.x += e.vx * DT;
        if (boxSolid(e.x, e.y + e.vy * DT, e.w, e.h)) e.vy = 0; else e.y += e.vy * DT;
        break;
      }
      case 'bullet':
        e.x += e.vx * DT;
        e.dir = Math.sign(e.vx);
        if (hitsWall(e)) { e.remove = true; puff(e.x + e.w / 2, e.y + e.h / 2, 0x888888); SFX.fx.bump(); break; }
        if (Math.abs(e.x - camX) > halfW + 12) e.remove = true;
        break;
      case 'piranha': {
        const T = 4.6, near = Math.abs(pc - ec) < 1.9 && P.y < e.top + 4;
        const c = e.cycle;
        if (!(c < 1.6 && c + DT >= 1.6 && near)) e.cycle = (c + DT) % T;
        const k = e.cycle;
        e.o = k < 1.6 ? 0 : k < 2.3 ? (k - 1.6) / 0.7 : k < 3.8 ? 1 : k < 4.5 ? 1 - (k - 3.8) / 0.7 : 0;
        e.y = e.top; e.h = Math.max(0.01, e.o * 1.25);
        break;
      }
      case 'podoboo': {
        const T = 3.4;
        e.cycle = (e.cycle + DT) % T;
        const q = e.cycle;
        if (q < 1.8) {
          const u = q / 1.8;
          e.y = -1 + 8.5 * (1 - (2 * u - 1) * (2 * u - 1));
          e.falling = u > 0.5;
          if (q < DT * 1.5 && Math.abs(ec - camX) < halfW) puff(ec, 1.2, 0xff8020);
        } else e.y = -3;
        break;
      }
      case 'flame':
        e.x += e.vx * DT;
        if (hitsWall(e)) { e.remove = true; puff(e.x + e.w / 2, e.y + e.h / 2, 0xff8020); break; }
        e.y += Math.sign(e.targetY - e.y) * Math.min(Math.abs(e.targetY - e.y), 1.5 * DT);
        if (Math.abs(e.x - camX) > halfW + 6) e.remove = true;
        break;
      case 'meteor':
        e.x += e.vx * DT; e.y += e.vy * DT;
        if (e.y < 0.6 || boxSolid(e.x + 0.1, e.y, e.w - 0.2, e.h * 0.5)) {
          e.remove = true;
          const cx = e.x + e.w / 2;
          puff(cx, e.y + 0.3, 0xff7020); puff(cx, e.y + 0.6, 0x503030);
          dust(cx, e.y + 0.2, 8, 2.2, 1.2, 0x6a5048);
          sparkle(cx, e.y + 0.5, 8, 0xffa040, 5, 0.5);
          if (Math.abs(cx - camX) < halfW + 2) { shake(0.28); SFX.fx.boom(); }
        }
        break;
      case 'bowser': updateBowser(e); break;
    }
  }
  function spawnMeteor() {
    const tx = Math.floor(Math.min(L.flagX - 8, Math.max(camX - halfW + 3, P.x + P.vx * 1.1 + (Math.random() - 0.35) * 9)));
    let gy = -1;
    for (let y = L.h - 2; y >= 0; y--) if (solidAt(tx, y)) { gy = y + 1; break; }
    const fall = 16;
    spawnEnemy('meteor', tx + 0.1 + 4, Math.max(gy, 1) + fall);
    const ring = new THREE.Mesh(MODELS.geo('mRing', () => new THREE.RingGeometry(0.35, 0.55, 24).rotateX(-Math.PI / 2)),
      new THREE.MeshBasicMaterial({ color: 0xff2010, transparent: true, opacity: 0.8, depthWrite: false, side: THREE.DoubleSide }));
    ring.position.set(tx + 0.5, Math.max(gy, 1.1) + 0.03, 0);
    world.add(ring);
    L.fx.push({ type: 'marker', m: ring, t: 0, life: fall / 10 });
    SFX.fx.meteor();
  }

  function updateBowser(e) {
    const pc = P.x + P.w / 2, bc = e.x + e.w / 2;
    if (e.hurtT > 0) e.hurtT -= DT;
    if (e.mouthT > 0) e.mouthT -= DT;
    if (G.state === 'bossclear') {
      e.vx = 0;
      e.vy = Math.max(-MAX_FALL, e.vy - 40 * DT);
      moveBody(e);
      if (e.y < 1.5) e.falling = true;
      if (e.y < -5) e.remove = true;
      return;
    }
    e.dir = pc < bc ? -1 : 1;
    if (e.x < e.homeX - 3.5) e.vx = 1.1; else if (e.x > e.homeX + 1) e.vx = -1.1;
    e.jumpT -= DT;
    if (e.jumpT <= 0 && e.onGround) { e.vy = 11; e.jumpT = 2.2 + Math.random() * 2.5; }
    e.vy = Math.max(-MAX_FALL, e.vy - 40 * DT);
    const pvx = e.vx, wasG = e.onGround, fallV = e.vy;
    const r = moveBody(e);
    if (r.hitX) e.vx = -pvx;
    if (e.onGround && !wasG && fallV < -6) { shake(0.35); dust(e.x + e.w / 2, e.y, 8, 2, 0.5); SFX.fx.bump(); }
    if (Math.abs(pc - bc) < halfW + 1 && G.state === 'playing') {
      e.fireT -= DT;
      if (e.fireT <= 0) {
        e.fireT = 2 + Math.random() * 1.8;
        const f = spawnEnemy('flame', e.dir < 0 ? e.x - 1.1 : e.x + e.w, e.y + 1.5);
        f.active = true; f.vx = e.dir * 6; f.dir = e.dir;
        f.targetY = Math.min(6, Math.max(2.25, P.y + (Math.random() < 0.5 ? 0.2 : 1.1)));
        e.mouthT = 0.5;
        SFX.fx.bossfire();
      }
    }
    if (e.y < -4) e.remove = true;
  }

  function playerVsEnemies() {
    if (G.state !== 'playing' || G.freeze > 0) return;
    for (const e of L.enemies) {
      if (!hittable(e) || !overlap(P, e)) continue;
      const cx = e.x + e.w / 2;
      if (P.star > 0) {
        if (e.starproof) continue;
        flipKill(e, Math.sign(cx - (P.x + P.w / 2)) || 1); chainScore(P.combo++, cx, e.y + 1.2);
        continue;
      }
      const stomp = !L.phys.water && P.vy < 0 && P.prevY >= e.y + e.h * 0.45;
      if (e.kind === 'koopa') {
        if (e.state === 'shell') {
          const d = (P.x + P.w / 2) < cx ? 1 : -1;
          e.state = 'slide'; e.vx = d * SHELL_SPD; e.kickGrace = 0.3; e.chain = 0;
          SFX.fx.kick(); addScore(400, cx, e.y + 1);
          if (stomp) { P.vy = BOUNCE * L.phys.jump; P.y = Math.max(P.y, e.y + e.h); }
          continue;
        }
        if (stomp) {
          e.state = 'shell'; e.h = 0.85; e.vx = 0; e.shellT = 0;
          stompBounce(e);
          continue;
        }
        if (e.kickGrace > 0) continue;
        hurt();
        continue;
      }
      if (stomp && e.stompable) {
        if (e.kind === 'bullet') { flipKill(e, 0); e.vy = 0; e.vx = 0; }
        else { e.squish = true; e.squishT = 0.5; }
        stompBounce(e);
        continue;
      }
      hurt();
    }
  }
  function stompBounce(e) {
    P.vy = (keys.jump ? BOUNCE_HOLD : BOUNCE) * L.phys.jump;
    P.y = Math.max(P.y, e.y + e.h * 0.5);
    chainScore(P.combo++, e.x + e.w / 2, e.y + e.h + 0.5);
    sparkle(e.x + e.w / 2, e.y + e.h, 7, 0xffffff, 4, 0.45);
    dust(e.x + e.w / 2, e.y, 3, 1.5, 0.5);
    shake(0.06);
    SFX.fx.stomp();
  }

  // ---------------- items ----------------
  function updateItems() {
    for (const it of L.items) {
      it.t += DT;
      if (it.kind === 'coinpop') {
        it.vy -= 50 * DT; it.y += it.vy * DT;
        if (it.t > 0.55) { it.remove = true; popup('200', it.x + 0.3, it.y + 0.6); sparkle(it.x + 0.3, it.y + 0.4, 5, 0xffe070, 2.5, 0.5); }
        continue;
      }
      if (it.emerge > 0) {
        const d = Math.min(it.emerge, 1.4 * DT);
        it.y += d; it.emerge -= d;
        if (it.emerge <= 0) {
          if (it.kind === 'mushroom' || it.kind === 'oneup') it.vx = ITEM_SPD;
          if (it.kind === 'star') { it.vx = 4; it.vy = 10; }
        }
        continue;
      }
      if (it.kind !== 'flower') {
        const g = (it.kind === 'star' ? 40 : GRAV) * (L.phys.water ? 0.35 : L.phys.g);
        it.vy = Math.max(-MAX_FALL, it.vy - g * DT);
        const pvx = it.vx;
        const r = moveBody(it);
        if (r.hitX) it.vx = -pvx;
        if (it.kind === 'star' && it.onGround) it.vy = 12;
        if (it.y < -4) it.remove = true;
      }
      if (G.state === 'playing' && overlap(P, it)) collectItem(it);
    }
  }
  function collectItem(it) {
    it.remove = true;
    sparkle(P.x + P.w / 2, P.y + P.h / 2, 12, it.kind === 'oneup' ? 0x80ff80 : 0xfff4a0, 4.5, 0.6);
    const x = it.x + 0.4, y = it.y + 1.2;
    switch (it.kind) {
      case 'mushroom':
        addScore(1000, x, y);
        if (P.size === 0) { setSize(1); SFX.fx.powerup(); } else SFX.fx.powerup();
        break;
      case 'flower':
        addScore(1000, x, y);
        if (P.size === 0) setSize(1); else setSize(2);
        SFX.fx.powerup();
        break;
      case 'star':
        addScore(1000, x, y);
        P.star = 10;
        SFX.Music.play('star');
        break;
      case 'oneup':
        oneUp(x, y);
        break;
    }
  }

  function updateFireballs() {
    for (const f of L.fireballs) {
      f.t += DT;
      if (Math.random() < 0.5) dust(f.x + 0.17, f.y + 0.1, 1, 0.3, 0.3, 0xff9030);
      f.vy = Math.max(-MAX_FALL, f.vy - 60 * (L.phys.water ? 0.5 : L.phys.g) * DT);
      const r = moveBody(f);
      if (f.onGround) f.vy = 9;
      if (r.hitX || r.head || f.t > 3 || f.y < -2 || Math.abs(f.x - camX) > halfW + 2) {
        f.remove = true;
        if (r.hitX || r.head) puff(f.x + 0.17, f.y + 0.17, 0xffa040);
        continue;
      }
      for (const e of L.enemies) {
        if (!hittable(e)) continue;
        if (overlap(f, e)) {
          f.remove = true; puff(f.x + 0.17, f.y + 0.17, 0xffa040);
          if (e.boss) {
            e.hp--; e.hurtT = 0.3; SFX.fx.bosshit();
            if (e.hp <= 0) { flipKill(e, Math.sign(f.vx)); addScore(5000, e.x + 1, e.y + 2.6); SFX.fx.bossfall(); }
          } else if (!e.fireproof) {
            flipKill(e, Math.sign(f.vx));
            addScore(200, e.x + 0.5, e.y + 1.2);
          }
          break;
        }
      }
    }
  }
  function updateCoins() {
    const pb = { x: P.x, y: P.y, w: P.w, h: P.h };
    for (const c of L.coins) {
      if (c.taken) continue;
      if (overlap(pb, { x: c.x + 0.2, y: c.y + 0.1, w: 0.6, h: 0.8 })) {
        c.taken = true; addCoin();
        L.fx.push({ type: 'coinfly', m: c.m.root, vy: 7, t: 0, life: 0.35 });
        sparkle(c.x + 0.5, c.y + 0.5, 5, 0xffe070, 2.5, 0.5);
      }
    }
  }
  function updateLifts() {
    for (const lf of L.lifts) {
      lf.t += DT;
      const o = Math.sin(lf.t * lf.speed / lf.range) * lf.range;
      const nx = lf.axis === 'x' ? lf.bx + o : lf.bx;
      const ny = lf.axis === 'y' ? lf.by + o : lf.by;
      lf.dx = nx - lf.x; lf.dy = ny - lf.y;
      lf.x = nx; lf.y = ny;
    }
  }
  function updateBlocks() {
    for (const b of L.blocks.values()) {
      if (b.bump > 0) b.bump = Math.max(0, b.bump - DT);
      if (b.jelly > 0) b.jelly = Math.max(0, b.jelly - DT * 1.6);
      if (!b.crumbleT) continue;
      if (!b.fallen) {
        b.crumbleT += DT;
        if (b.crumbleT > 0.55) {
          // give way: drop out of the grid and tumble into the pit
          b.fallen = true; b.fy = b.y; b.fvy = 0; b.respawnT = 0;
          L.grid[b.y][b.x] = ' ';
          dust(b.x + 0.5, b.y, 4, 1, 0.3, 0xd8b070);
        }
      } else {
        b.fvy -= 30 * DT; b.fy += b.fvy * DT;
        b.mesh.visible = b.fy > -4;
        b.respawnT += DT;
        const zone = { x: b.x, y: b.y, w: 1, h: 1 };
        if (b.respawnT > 6 && !overlap(zone, P)) {
          b.fallen = false; b.crumbleT = 0; b.mesh.visible = true;
          b.mesh.rotation.set(0, 0, 0);
          L.grid[b.y][b.x] = 'D';
          puff(b.x + 0.5, b.y + 0.5, 0xf0d090);
        }
      }
    }
  }
  function updateFx() {
    for (const f of L.fx) {
      f.t += DT;
      if (f.type === 'dust') {
        f.m.position.x += f.vx * DT; f.m.position.y += f.vy * DT; f.m.position.z += f.vz * DT;
        f.vx *= 0.9; f.vy *= 0.94;
        f.m.scale.setScalar(f.s0 * (1 + f.t * 3));
        f.m.material.opacity = 0.75 * (1 - f.t / f.life);
      } else if (f.type === 'twinkle') {
        f.m.position.x += f.vx * DT; f.m.position.y += f.vy * DT;
        f.vx *= 0.9; f.vy *= 0.9;
        const k = 1 - f.t / f.life;
        f.m.scale.setScalar(f.s0 * k);
        f.m.material.rotation += 6 * DT;
      } else if (f.type === 'coinfly') {
        f.vy -= 30 * DT;
        f.m.position.y += f.vy * DT;
        f.m.rotation.y += 25 * DT;
        f.m.scale.setScalar(Math.max(0.01, 1 - f.t / f.life));
      } else if (f.type === 'popup') { f.m.position.y += 2 * DT; f.m.material.opacity = 1 - Math.max(0, (f.t - 0.6) / 0.3); }
      else if (f.type === 'debris') {
        f.vy -= 45 * DT;
        f.m.position.x += f.vx * DT; f.m.position.y += f.vy * DT; f.m.position.z += f.vz * DT;
        f.m.rotation.x += 8 * DT; f.m.rotation.z += 6 * DT;
      } else if (f.type === 'marker') {
        const k = f.t / f.life;
        f.m.scale.setScalar(1.6 - k * 0.8 + Math.sin(f.t * 20) * 0.08);
        f.m.material.opacity = 0.35 + k * 0.6;
      } else if (f.type === 'puff') {
        const s = 1 + f.t * 6; f.m.scale.setScalar(s); f.m.material.opacity = 0.9 * (1 - f.t / f.life);
      } else if (f.type === 'spark') {
        f.vy -= 4 * DT;
        f.m.position.x += f.vx * DT; f.m.position.y += f.vy * DT;
        f.m.material.opacity = 1 - f.t / f.life;
      }
      if (f.t >= f.life) f.remove = true;
    }
  }
  function sweep(arr, getMesh) {
    for (let i = arr.length - 1; i >= 0; i--) if (arr[i].remove) { removeMesh(getMesh(arr[i])); arr.splice(i, 1); }
  }

  // ============================================================
  // Camera
  // ============================================================
  function clampCam() {
    if (L.w < halfW * 2) { camX = L.w / 2; return; }
    camX = Math.min(Math.max(camX, halfW), L.w - halfW);
  }
  function updateCamera() {
    const target = P.x + P.w / 2 + 1 + Math.max(0, P.boost) * 3;
    if (target > camX) camX = target;
    clampCam();
  }

  // ============================================================
  // State flow
  // ============================================================
  function show(id, on) { $(id).classList.toggle('show', on); }
  function toTitle() {
    G.state = 'title';
    P.size = 0;
    G.idx = G.startIdx;
    loadLevel(G.startIdx, false);
    updateSelect();
    show('title', true); show('intro', false); show('msg', false);
    $('top-score').textContent = 'TOP - ' + String(G.top).padStart(6, '0');
    SFX.Music.stop();
  }
  function newGame() {
    G.score = 0; G.coins = 0; G.lives = 3; G.reachedMid = false;
    P.size = 0;
    show('title', false);
    irisTo(() => startIntro(G.startIdx));
  }
  function irisTo(fn) {
    G.state = 'transition';
    const el = $('iris');
    el.className = ''; void el.offsetWidth; el.className = 'close';
    setTimeout(() => { fn(); el.className = ''; }, 680);
  }
  function updateSelect() {
    document.querySelectorAll('#ls-grid button').forEach((b, i) => b.classList.toggle('on', i === G.startIdx));
  }
  function openSelect() {
    if (G.state !== 'title' || G.selectOpen) return;
    G.selectOpen = true;
    const grid = $('ls-grid');
    grid.innerHTML = '';
    LEVELS.forEach((lv, i) => {
      const def = lv.build(), bg = THEMES[def.theme].bg;
      const b = document.createElement('button');
      b.innerHTML = '<b>' + lv.name + '</b><span>' + lv.title + '</span>';
      b.style.background = 'linear-gradient(160deg, ' + bg.join(', ') + ')';
      b.addEventListener('pointerdown', e => {
        e.stopPropagation(); SFX.init();
        if (G.state !== 'title') return;
        if (G.startIdx === i) newGame(); else changeSelect(i - G.startIdx);
      });
      grid.appendChild(b);
    });
    $('title').classList.add('selecting');
    updateSelect();
    SFX.fx.oneup();
  }
  function closeSelect() {
    if (!G.selectOpen) return;
    G.selectOpen = false;
    $('title').classList.remove('selecting');
    SFX.fx.kick();
  }
  function changeSelect(d) {
    G.startIdx = (G.startIdx + d + LEVELS.length) % LEVELS.length;
    G.idx = G.startIdx;
    loadLevel(G.startIdx, false);
    updateSelect();
    SFX.fx.kick();
  }
  function startIntro(idx) {
    G.idx = idx;
    loadLevel(idx, G.reachedMid && G.midLevel === idx);
    G.state = 'intro'; G.timer = 2.4;
    $('intro-world').textContent = 'WORLD ' + LEVELS[idx].name;
    $('intro-name').textContent = LEVELS[idx].title;
    $('intro-hint').textContent = LEVELS[idx].hint || '';
    const bg = THEMES[L.theme].bg;
    $('intro').style.background = `radial-gradient(ellipse at 50% 60%, rgba(0,0,0,.35), rgba(0,0,0,.92)), linear-gradient(${bg.join(',')})`;
    $('intro-lives').textContent = G.lives;
    show('title', false); show('msg', false); show('intro', true);
    SFX.Music.stop();
  }
  function startPlaying() {
    show('intro', false);
    const el = $('iris'); el.className = ''; void el.offsetWidth; el.className = 'open';
    G.state = 'playing';
    SFX.Music.play(L.th.music);
  }
  function gameOver() {
    G.state = 'gameover'; G.timer = 5;
    $('msg-text').textContent = 'GAME OVER';
    $('msg-sub').innerHTML = 'SCORE ' + String(G.score).padStart(6, '0');
    show('msg', true);
    SFX.fx.gameover();
    saveTop();
  }
  function winGame() {
    G.state = 'win'; G.timer = 12;
    $('msg-text').innerHTML = 'THANK YOU MARIO!';
    $('msg-sub').innerHTML = 'YOU CONQUERED ALL ' + LEVELS.length + ' LEVELS AND RESCUED THE PRINCESS!<br>FINAL SCORE ' + String(G.score).padStart(6, '0') + '<br><br>PRESS ENTER';
    show('msg', true);
    saveTop();
  }
  function saveTop() {
    if (G.score > G.top) {
      G.top = G.score;
      try { localStorage.setItem('mario25d-top', String(G.top)); } catch (e) { /* ignore */ }
    }
  }

  function startFlag() {
    G.state = 'flag'; G.flagPhase = 'slide'; G.flagT = 0;
    const h = P.y - 3;
    const pts = h >= 8 ? 5000 : h >= 6 ? 2000 : h >= 4 ? 800 : h >= 2 ? 400 : 100;
    addScore(pts, L.flagX + 1.5, P.y + 1);
    P.vx = 0; P.vy = 0; P.dir = 1;
    P.x = L.flagX + 0.5 - 0.1 - P.w;
    SFX.Music.stop();
    SFX.fx.flag();
  }
  function updateFlag() {
    G.flagT += DT;
    const flagMinY = 3.9 - 3;  // relative to pole root (y=3)
    if (G.flagPhase === 'slide') {
      P.y = Math.max(3, P.y - 9 * DT);
      const fl = L.flag.flag;
      fl.position.y = Math.max(flagMinY + 0.9, fl.position.y - 9 * DT);
      if (P.y <= 3 && fl.position.y <= flagMinY + 0.9) { G.flagPhase = 'hold'; G.flagT = 0; }
    } else if (G.flagPhase === 'hold') {
      if (G.flagT > 0.3 && P.dir === 1) { P.dir = -1; P.x = L.flagX + 0.5 + 0.1; }
      if (G.flagT > 0.7) { G.flagPhase = 'walk'; G.flagT = 0; P.dir = 1; SFX.fx.clear(); }
    } else if (G.flagPhase === 'walk') {
      P.vx = 4.5; P.dir = 1;
      P.vy = Math.max(-MAX_FALL, P.vy - GRAV * DT);
      moveBody(P);
      P.anim += Math.abs(P.vx) * DT * 1.7;
      if (P.x + P.w / 2 >= L.castleX + 2.5) { P.x = L.castleX + 2.5 - P.w / 2; P.vx = 0; G.flagPhase = 'enter'; G.flagT = 0; }
    } else if (G.flagPhase === 'enter') {
      // turn toward the door and walk into the dark archway
      P.z = (P.z || 0) - 1.9 * DT;
      P.anim += 4 * DT;
      if (P.z < -1.75) { P.hidden = true; G.flagPhase = 'tally'; G.flagT = 0; SFX.fx.door(); }
    } else if (G.flagPhase === 'tally') {
      if (G.flagT > 0.6) {
        for (let i = 0; i < 3 && G.time > 0; i++) { G.time--; G.score += 50; }
        if ((Math.floor(G.flagT * 60) % 3) === 0 && G.time > 0) SFX.fx.tick();
        if (G.time <= 0) { G.flagPhase = 'fireworks'; G.flagT = 0; G.fw = 0; L.castle.flag.visible = true; L.castle.flag.position.y = L.castle.flagLow; }
      }
    } else if (G.flagPhase === 'fireworks') {
      L.castle.flag.position.y = Math.min(L.castle.flagHigh, L.castle.flag.position.y + DT * 1.4);
      if (G.fw < 3 && G.flagT > 0.5 + G.fw * 0.5) {
        G.fw++;
        firework(L.castleX + 2.5 + (Math.random() - 0.5) * 8, 10 + Math.random() * 3);
        addScore(500);
      }
      if (G.flagT > 3) {
        G.reachedMid = false;
        if (G.idx + 1 < LEVELS.length) irisTo(() => startIntro(G.idx + 1));
        else winGame();
      }
    }
    updateBlocks(); updateFx(); updateEnemies();
    sweep(L.enemies, e => e.m.root); sweep(L.fx, f => f.m);
  }

  function updateDying() {
    G.timer += DT;
    if (G.timer > 0.5) {
      if (!P.dieJumped) { P.dieJumped = true; if (P.y > -1) P.vy = 15; }
      P.vy -= 40 * DT; P.y += P.vy * DT;
    }
    updateFx(); sweep(L.fx, f => f.m);
    if (G.timer > 3.2) {
      G.lives--;
      if (G.lives <= 0) gameOver();
      else irisTo(() => startIntro(G.idx));
    }
  }

  function updateCannons() {
    for (const c of L.cannons) {
      if (Math.abs(c.x + 0.5 - camX) > halfW + 1) continue;
      c.t -= DT;
      if (c.t > 0) continue;
      c.t = 2.8 + Math.random() * 2;
      const dx = P.x + P.w / 2 - (c.x + 0.5);
      if (Math.abs(dx) < 2.2) continue;
      const dir = Math.sign(dx);
      if (solidAt(c.x + dir, c.y)) continue;
      const b = spawnEnemy('bullet', dir > 0 ? c.x + 1 : c.x - 0.95, c.y + 0.1);
      b.active = true; b.vx = dir * 5.5; b.dir = dir;
      SFX.fx.cannon();
      shake(0.08);
      puff(c.x + 0.5 + dir * 0.6, c.y + 0.55, 0x9a9a9a);
    }
  }
  function updateFirebars() {
    for (const f of L.firebars) {
      f.a += f.speed * DT;
      const ca = Math.cos(f.a), sa = Math.sin(f.a);
      for (let i = 0; i < f.len; i++) {
        const bx = f.x + ca * i * 0.5, by = f.y + sa * i * 0.5;
        f.balls[i].position.set(bx, by - 0.18, 0.15);
        if (i === 0 || G.state !== 'playing' || P.star > 0) continue;
        const nx = Math.max(P.x, Math.min(bx, P.x + P.w)), ny = Math.max(P.y, Math.min(by, P.y + P.h));
        if ((nx - bx) * (nx - bx) + (ny - by) * (ny - by) < 0.2 * 0.2) hurt();
      }
    }
  }
  function startBossClear() {
    G.state = 'bossclear'; G.timer = 0; G.bcPhase = 'collapse'; G.bcT = 0;
    SFX.Music.stop();
    SFX.fx.axe();
    P.vx = 0;
    L.axe.m.root.visible = false;
    L.bridge.sort((a, b) => b.x - a.x);
    for (const e of L.enemies) if (e.kind === 'flame') e.remove = true;
  }
  function updateBossClear() {
    G.timer += DT; G.bcT += DT;
    // player idles with gravity
    P.vy = Math.max(-MAX_FALL, P.vy - GRAV * DT);
    if (G.bcPhase === 'collapse') {
      P.vx = 0;
      if (G.bcT > 0.07 && L.bridge.length) {
        G.bcT = 0;
        const b = L.bridge.shift();
        L.grid[b.y][b.x] = ' ';
        L.fx.push({ type: 'debris', m: b.m, vx: 0, vy: 0, vz: 0, t: 0, life: 2 });
        SFX.fx.bump();
      }
      if (!L.bridge.length && G.bcT > 0.6) { G.bcPhase = 'fall'; G.bcT = 0; if (L.boss && !L.boss.dead) SFX.fx.bossfall(); }
    } else if (G.bcPhase === 'fall') {
      if (G.bcT > 2) { G.bcPhase = 'walk'; G.bcT = 0; SFX.fx.clear(); if (L.boss && !L.boss.remove && !L.boss.dead) addScore(5000); }
    } else if (G.bcPhase === 'walk') {
      P.dir = 1;
      if (P.x + P.w / 2 < L.princess.x - 0.8) P.vx = 4; else { P.vx = 0; G.bcPhase = 'thanks'; G.bcT = 0; showThanks(); }
      P.anim += Math.abs(P.vx) * DT * 1.7;
    } else if (G.bcPhase === 'thanks') {
      if (G.bcT > 0.5 && G.time > 0) { for (let i = 0; i < 3 && G.time > 0; i++) { G.time--; G.score += 50; } if (Math.floor(G.bcT * 60) % 3 === 0) SFX.fx.tick(); }
      const toad = L.princess.who === 'toad';
      if (!toad && G.bcT > 1 && Math.floor(G.bcT * 2) !== Math.floor((G.bcT - DT) * 2)) firework(L.princess.x + (Math.random() - 0.5) * 10, 8 + Math.random() * 3);
      if (toad && G.bcT > 6.5 && !G.bcDone) {
        G.bcDone = true;
        irisTo(() => { $('toast').classList.remove('show'); G.reachedMid = false; startIntro(G.idx + 1); });
      }
      if (!toad && G.bcT > 9) { $('toast').classList.remove('show'); winGame(); }
    }
    moveBody(P);
    updateEnemies(); updateFx();
    sweep(L.enemies, e => e.m.root); sweep(L.fx, f => f.m);
    const target = Math.min(P.x + P.w / 2 + 1, (L.princess ? L.princess.x : P.x));
    if (target > camX) camX = target;
    clampCam();
  }
  function showThanks() {
    G.bcDone = false;
    if (L.princess.who === 'toad') {
      $('toast').innerHTML = 'THANK YOU MARIO!<br><br>BUT OUR PRINCESS IS IN<br>ANOTHER CASTLE!';
      $('toast').classList.add('show');
      SFX.fx.toad();
      return;
    }
    $('toast').innerHTML = 'THANK YOU MARIO!<br><br>YOUR QUEST IS OVER.';
    $('toast').classList.add('show');
  }

  function updatePlaying() {
    if (G.freeze > 0) {
      G.freeze -= DT;
      updateFx(); sweep(L.fx, f => f.m);
      return;
    }
    G.timeAcc += DT;
    if (G.timeAcc >= 0.4) {
      G.timeAcc -= 0.4; G.time--;
      if (G.time === 100 && !G.hurried) { G.hurried = true; SFX.fx.hurry(); }
      if (G.time <= 0) { G.time = 0; die(); return; }
    }
    if (P.inv > 0) P.inv -= DT;
    if (P.star > 0) { P.star -= DT; if (P.star <= 0) { P.star = 0; SFX.Music.play(L.th.music); } }
    if (L.phys.wind) {
      // 9 second cycle: calm, then a 3 second headwind gust
      G.windT = (G.windT + DT) % 9;
      const target = G.windT > 5.5 && G.windT < 8.5 ? 1 : 0;
      if (target && DECOR.gust < 0.05 && G.windT < 5.6) SFX.fx.wind();
      DECOR.gust += (target - DECOR.gust) * DT * 2.5;
    }
    if (L.phys.meteors && P.x > 12 && P.x < L.flagX - 12) {
      L.meteorT -= DT;
      if (L.meteorT <= 0) { L.meteorT = 1.7 + Math.random() * 1.8; spawnMeteor(); }
    }
    updateLifts();
    updatePlayer();
    updateBlocks();
    updateCannons();
    updateFirebars();
    updateEnemies();
    playerVsEnemies();
    updateItems();
    updateFireballs();
    updateCoins();
    updateFx();
    sweep(L.enemies, e => e.m.root); sweep(L.items, i => i.m.root); sweep(L.fireballs, f => f.m.root); sweep(L.fx, f => f.m);
    if (G.state !== 'playing') return;
    if (P.y < -2.5) { die(); return; }
    if (L.th.lava && P.y < 1.05) { puff(P.x + P.w / 2, 1.3, 0xff6020); SFX.fx.burn(); die(); return; }
    if (L.axe && overlap(P, L.axe)) { startBossClear(); return; }
    if (L.def.mid != null && P.x > L.def.mid) { G.reachedMid = true; G.midLevel = L.idx; }
    if (L.flagX != null && P.x + P.w >= L.flagX - 0.02 && P.y < 13) { startFlag(); return; }
    updateCamera();
  }

  function step() {
    G.t += DT;
    switch (G.state) {
      case 'title':
        if (G.selectOpen && pressed.left) changeSelect(-1);
        if (G.selectOpen && pressed.right) changeSelect(1);
        break;
      case 'intro':
        G.timer -= DT;
        if (G.timer <= 0) startPlaying();
        break;
      case 'playing': updatePlaying(); break;
      case 'dying': updateDying(); break;
      case 'flag': updateFlag(); break;
      case 'bossclear': updateBossClear(); break;
      case 'gameover':
        G.timer -= DT;
        if (G.timer <= 0) toTitle();
        break;
      case 'win':
        G.timer -= DT;
        if (G.timer <= 0) toTitle();
        break;
    }
    pressed.jump = false; pressed.run = false; pressed.left = false; pressed.right = false; pressed.down = false;
  }

  function handleMeta() {
    if (pressed.mute) {
      pressed.mute = false;
      SFX.toggleMute();
    }
    if (pressed.levels) {
      pressed.levels = false;
      if (G.state === 'title') { if (G.selectOpen) closeSelect(); else openSelect(); }
    }
    if (pressed.start) {
      pressed.start = false;
      if (G.state === 'title') { newGame(); return; }
      if (G.state === 'win' || G.state === 'gameover') { toTitle(); return; }
      if (G.state === 'playing') pressed.pause = true;
    }
    if (pressed.pause) {
      pressed.pause = false;
      if (G.state === 'title') { closeSelect(); return; }
      if (G.state === 'playing' || G.paused) {
        G.paused = !G.paused;
        show('pause', G.paused);
        SFX.fx.pause();
        if (G.paused) SFX.Music.stop(); else SFX.Music.play(P.star > 0 ? 'star' : L.th.music);
      }
    }
  }

  // ============================================================
  // Rendering / animation sync
  // ============================================================
  const STAR_COLORS = [[0xffffff, 0xd82800], [0xd82800, 0x000000], [0x20a030, 0xffd000], [0xffd000, 0xd82800]];
  function syncPlayer(t) {
    const pm = P.model;
    pm.root.position.set(P.x + P.w / 2, P.y, P.z || 0);
    // size & growth flicker
    const small = [0.72, 0.72, 0.72], big = [1.02, 1.36, 1.02];
    let useBig = P.size > 0;
    if (G.freeze > 0 && (G.freezeKind === 'grow' || G.freezeKind === 'shrink')) {
      useBig = Math.floor(G.freeze * 14) % 2 === (G.freezeKind === 'grow' ? 0 : 1);
    }
    const s = useBig ? big : small;
    const sq = P.sq || 0;
    const idle = P.onGround && Math.abs(P.vx) < 0.2 && (G.state === 'playing' || G.state === 'title');
    const breathe = idle ? 1 + Math.sin(t * 3) * 0.018 : 1;
    // ducking: ease into a squat
    P.duckK = (P.duckK || 0) + (((P.duck && useBig) ? 1 : 0) - (P.duckK || 0)) * 0.35;
    const dk = P.duckK;
    const sy = s[1] * (1 - sq) * breathe * (1 - dk * 0.4), sxz = 1 + sq * 0.6 + dk * 0.12;
    pm.inner.scale.set(s[0] * sxz, sy, s[2] * sxz);
    pm.head.scale.set(1, s[0] * sxz / sy, 1);   // keep the head round when big or ducking
    // blink every few seconds, glance around when idle
    const blink = (t % 3.3) < 0.1 || ((t + 0.25) % 7.1) < 0.08;
    pm.eyes.forEach(e => { e.scale.y = blink ? 0.12 : 1; });
    pm.head.rotation.y += ((idle ? Math.sin(t * 0.6) * 0.45 : 0) - pm.head.rotation.y) * 0.08;
    pm.head.rotation.x = idle ? Math.sin(t * 3) * 0.03 : 0;
    const runLean = P.onGround && G.state === 'playing' ? Math.min(0.22, Math.abs(P.vx) / 45) : 0;
    pm.inner.rotation.x += (runLean - pm.inner.rotation.x) * 0.2;
    // facing
    let targetRot = P.dir > 0 ? 1.1 : -1.1;
    if (G.state === 'dying') targetRot = 0;
    if (G.state === 'flag' && G.flagPhase === 'enter') targetRot = Math.PI;
    if (G.state === 'flag' && G.flagPhase === 'slide') targetRot = 1.4;
    if (G.state === 'bossclear' && G.bcPhase === 'thanks') targetRot = 0.5;
    pm.body.rotation.y += (targetRot - pm.body.rotation.y) * 0.25;
    // limbs
    const [lL, lR] = pm.legs, [aL, aR] = pm.arms;
    let legSwing = 0, armL = 0, armR = 0, lean = 0;
    if (G.state === 'dying') {
      armL = armR = Math.PI * 0.9;
    } else if (G.state === 'flag' && (G.flagPhase === 'slide' || G.flagPhase === 'hold')) {
      armL = armR = Math.PI * 0.85; legSwing = 0.3;
    } else if (!P.onGround && G.state === 'playing' && L.phys.water) {
      legSwing = Math.sin(t * 12) * 0.5;
      const st = Math.max(0, P.swimT || 0) / 0.35;
      armL = armR = 0.4 + st * 2.2;
      lean = -0.5 * P.dir;
    } else if (!P.onGround && G.state === 'playing') {
      legSwing = 0.7; armR = 2.6; armL = -0.6;
    } else if (G.state === 'flag' && G.flagPhase === 'enter') {
      legSwing = Math.sin(P.anim * 2.2) * 0.8; armL = legSwing; armR = -legSwing;
    } else if (P.skid) {
      lean = -0.25 * P.dir; legSwing = 0.4;
    } else if (Math.abs(P.vx) > 0.2) {
      legSwing = Math.sin(P.anim * 2.2) * Math.min(1, Math.abs(P.vx) / 6) * 0.9;
      armL = legSwing; armR = -legSwing;
    }
    if (dk > 0.05) { legSwing *= 1 - dk; armL = armL * (1 - dk) + 0.7 * dk; armR = armR * (1 - dk) + 0.7 * dk; lean = lean * (1 - dk); }
    if (P.throwT > 0) armR = 1.8;
    lL.rotation.x = legSwing; lR.rotation.x = -legSwing;
    lL.rotation.z = -0.35 * dk; lR.rotation.z = 0.35 * dk;
    aL.rotation.x = -armL; aR.rotation.x = -armR;
    aL.rotation.z = G.state === 'dying' ? 0.4 : 0; aR.rotation.z = G.state === 'dying' ? -0.4 : 0;
    pm.body.rotation.z = lean;
    // bob
    pm.inner.position.y = (P.onGround && Math.abs(P.vx) > 0.5) ? Math.abs(Math.sin(P.anim * 2.2)) * 0.05 : 0;
    // visibility / star
    let vis = !P.hidden;
    if (P.inv > 0 && G.state === 'playing') vis = vis && Math.floor(t * 20) % 2 === 0;
    pm.root.visible = vis;
    if (P.star > 0) {
      const c = STAR_COLORS[Math.floor(t * 14) % STAR_COLORS.length];
      pm.setColors(c[0], c[1]);
    } else if (G.state !== 'title') {
      pm.setPalette(P.size === 2 ? 'fire' : 'normal');
    }
  }

  function syncWorld(t, dt) {
    for (const e of L.enemies) {
      const r = e.m.root;
      r.position.set(e.x + e.w / 2, e.y, 0);
      if (e.dead) { r.rotation.z = Math.PI; r.position.y = e.y + e.h; continue; }
      if (e.kind !== 'goomba' && e.kind !== 'koopa') { syncSpecial(e, t, dt); continue; }
      if (e.kind === 'goomba') {
        e.m.inner.scale.y = e.squish ? 0.25 : 1;
        if (!e.squish) {
          const sw = Math.sin(e.anim * 10);
          e.m.feet[0].position.y = 0.07 + Math.max(0, sw) * 0.08;
          e.m.feet[1].position.y = 0.07 + Math.max(0, -sw) * 0.08;
          e.m.inner.rotation.z = sw * 0.08;
        }
      } else {
        const inShell = e.state !== 'walk';
        e.m.headG.visible = !inShell;
        e.m.legs.forEach(l => { l.visible = !inShell; });
        const want = e.dir > 0 ? -0.5 : Math.PI + 0.5;
        e.m.inner.rotation.y = inShell ? e.m.inner.rotation.y : want;
        if (e.state === 'slide') e.m.shell.rotation.y += dt * 18;
        else e.m.shell.rotation.y = 0;
        if (inShell) {
          e.m.shell.position.y = -0.1;
          if (e.state === 'shell' && e.shellT > 5) e.m.shell.position.x = Math.sin(t * 40) * 0.04;
          else e.m.shell.position.x = 0;
        } else {
          e.m.shell.position.set(0, Math.abs(Math.sin(e.anim * 8)) * 0.04, 0);
          const sw = Math.sin(e.anim * 9) * 0.6;
          e.m.legs.forEach((l, i) => { l.rotation.z = (i % 2 ? sw : -sw); });
        }
      }
    }
    for (const it of L.items) {
      const r = it.m.root;
      r.position.set(it.x + it.w / 2, it.y, 0);
      if (it.kind === 'coinpop') r.rotation.y += dt * 20;
      else if (it.kind === 'star') { it.m.inner.rotation.y += dt * 5; it.m.mat.emissiveIntensity = 0.5 + Math.sin(t * 20) * 0.3; }
      else if (it.kind === 'flower') it.m.petals.material.emissiveIntensity = 0.3 + Math.sin(t * 12) * 0.25;
      else r.rotation.y = Math.sin(t * 3) * 0.3;
    }
    for (const c of L.coins) if (!c.taken) c.m.inner.rotation.y = t * 3 + c.x * 0.4;
    if (!G.paused && Math.random() < 0.08 && L.coins.length) {
      const c = L.coins[Math.floor(Math.random() * L.coins.length)];
      if (!c.taken && Math.abs(c.x - camX) < halfW) sparkle(c.x + 0.5 + (Math.random() - 0.5) * 0.4, c.y + 0.5 + (Math.random() - 0.5) * 0.4, 1, 0xfff8d0, 0.2, 0.4);
    }
    for (const f of L.fireballs) { f.m.root.position.set(f.x + f.w / 2, f.y, 0); f.m.root.rotation.z -= dt * 20 * Math.sign(f.vx); }
    for (const b of L.blocks.values()) {
      const off = b.bump > 0 ? Math.sin((1 - b.bump / 0.2) * Math.PI) * 0.35 : 0;
      b.mesh.position.y = b.y + 0.5 + off;
      if (b.type === 'J') {
        const k = (b.jelly || 0) * Math.cos((1 - (b.jelly || 0)) * 22);
        const idle = Math.sin(t * 4 + b.x) * 0.03;
        b.mesh.scale.set(1 + k * 0.25 + idle, 1 - k * 0.35 - idle, 1 + k * 0.25 + idle);
        b.mesh.position.y = b.y + 0.5 - k * 0.17;
      } else if (b.crumbleT) {
        if (b.fallen) { b.mesh.position.y = b.fy + 0.5; b.mesh.rotation.z += dt * 2; b.mesh.position.x = b.x + 0.5; }
        else b.mesh.position.x = b.x + 0.5 + Math.sin(t * 70) * 0.05 * Math.min(1, b.crumbleT * 3);
      }
    }
    for (const lf of L.lifts) lf.mesh.position.set(lf.x + lf.w / 2, lf.y + lf.h / 2, 0);
    if (L.theme === 'speedway') { L.T.dash.map.offset.x = -t * 2; L.T.dash.emissiveIntensity = 0.6 + Math.sin(t * 10) * 0.3; }
    L.T.q.emissiveIntensity = 0.12 + (Math.sin(t * 4) * 0.5 + 0.5) * 0.3;
    for (const c of L.clouds) {
      if (c.flicker) { c.light.intensity = c.base * (0.8 + Math.random() * 0.4); c.m.scale.y = 0.9 + Math.random() * 0.3; }
      else { c.m.position.x += c.speed * dt; }
    }
    if (L.flag) L.flag.flag.rotation.y = Math.sin(t * 3) * 0.25;
    if (L.castle) L.castle.animate(t);
    for (const fn of L.anims) fn(t, dt);
    hemi.intensity = L.th.hemi[2] + (G.flash || 0);
    if (L.weather) L.weather.update(t, dt, camSmoothX === null ? camX : camSmoothX);
    if (L.axe) { L.axe.m.inner.rotation.y = Math.sin(t * 2) * 0.4; L.axe.m.inner.position.y = Math.sin(t * 3) * 0.05; }
    if (L.princess) {
      const pr = L.princess.m;
      pr.inner.position.y = Math.abs(Math.sin(t * 3)) * (G.bcPhase === 'thanks' ? 0.15 : 0);
      pr.arms.forEach((a, i) => { a.rotation.x = G.bcPhase === 'thanks' ? -2.4 + Math.sin(t * 8 + i) * 0.3 : 0; });
    }
  }

  function syncSpecial(e, t, dt) {
    const m = e.m, r = m.root;
    switch (e.kind) {
      case 'spiny': {
        m.inner.rotation.y = e.dir > 0 ? -0.4 : Math.PI + 0.4;
        const sw = Math.sin(e.anim * 12);
        m.feet.forEach((f, i) => { f.position.y = 0.05 + Math.max(0, i % 2 ? sw : -sw) * 0.06; });
        break;
      }
      case 'fish':
        m.inner.rotation.y = e.dir > 0 ? -0.35 : Math.PI + 0.35;
        m.tail.rotation.y = Math.sin(e.anim * 10) * 0.5;
        m.inner.rotation.z = Math.cos(e.anim * 1.8 + e.baseY) * 0.25 * (e.dir > 0 ? 1 : -1);
        break;
      case 'boo':
        m.inner.rotation.y += ((e.dir > 0 ? 0.6 : -0.6) - m.inner.rotation.y) * 0.1;
        m.inner.position.y = 0.45 + Math.sin(e.anim * 2.2) * 0.08;
        m.mat.opacity += ((e.shy ? 0.45 : 0.92) - m.mat.opacity) * 0.1;
        m.eyes.visible = !e.shy;
        m.arms.forEach((a, i) => {
          const sx = i ? 1 : -1;
          a.position.x += ((e.shy ? sx * 0.14 : sx * 0.44) - a.position.x) * 0.2;
          a.position.y += ((e.shy ? 0.1 : -0.02) - a.position.y) * 0.2;
          a.position.z += ((e.shy ? 0.42 : 0.1) - a.position.z) * 0.2;
        });
        break;
      case 'bullet':
        m.inner.rotation.y = e.dir > 0 ? -0.25 : Math.PI + 0.25;
        break;
      case 'piranha': {
        r.position.set(e.x + e.w / 2, e.top - 1.3 + (e.o || 0) * 1.3, 0);
        r.visible = (e.o || 0) > 0.01;
        const bite = Math.abs(Math.sin(e.anim * 7)) * 0.55;
        m.top.rotation.x = -bite; m.bot.rotation.x = bite * 0.6;
        m.head.rotation.y = (P.x + P.w / 2 < e.x + e.w / 2 ? -0.6 : 0.6);
        break;
      }
      case 'podoboo':
        r.visible = e.y > -2;
        m.inner.rotation.z = e.falling ? Math.PI : 0;
        break;
      case 'flame':
        m.inner.rotation.y = e.dir > 0 ? 0 : Math.PI;
        m.inner.scale.set(1 + Math.sin(t * 40) * 0.08, 1 + Math.cos(t * 33) * 0.12, 1);
        break;
      case 'meteor':
        m.rock.rotation.x += dt * 6; m.rock.rotation.y += dt * 4;
        m.trail.rotation.z = -Math.atan2(-e.vx, -e.vy);
        m.trail.scale.set(1 + Math.sin(t * 40) * 0.1, 1, 1);
        break;
      case 'bowser': {
        m.inner.rotation.y += ((e.dir > 0 ? -0.35 : Math.PI + 0.35) - m.inner.rotation.y) * 0.15;
        const sw = e.onGround && e.vx ? Math.sin(e.anim * 6) * 0.35 : 0;
        m.legs[0].rotation.z = sw; m.legs[1].rotation.z = -sw;
        m.arms.forEach((a, i) => { a.rotation.z = Math.sin(e.anim * 3 + i) * 0.2 - 0.2; });
        m.jaw.rotation.z = e.mouthT > 0 ? -0.5 : Math.abs(Math.sin(e.anim * 2)) * -0.1;
        m.shellMat.emissive.setHex(e.hurtT > 0 && Math.floor(t * 30) % 2 ? 0xff2020 : 0x000000);
        if (e.falling) r.rotation.z += dt * 2;
        break;
      }
    }
  }

  let camSmoothX = null;
  function syncCamera(t) {
    if (camSmoothX === null || Math.abs(camSmoothX - camX) > 30) camSmoothX = camX;
    camSmoothX += (camX - camSmoothX) * 0.2;
    let cx = camSmoothX;
    if (G.state === 'title') cx = camX + Math.sin(t * 0.3) * 2;
    const sway = Math.sin(t * 0.25) * 0.5;
    const sh = G.shake || 0;
    const sx = (Math.random() - 0.5) * sh, sy = (Math.random() - 0.5) * sh;
    G.shake = sh * 0.88; if (G.shake < 0.005) G.shake = 0;
    const fov = FOV + (G.state === 'playing' && P.boost > 0 ? 7 : 0);
    if (Math.abs(camera.fov - fov) > 0.05) { camera.fov += (fov - camera.fov) * 0.12; camera.updateProjectionMatrix(); }
    camera.position.set(cx - 1.2 + sway * 0.3 + sx, CAM_Y + 3.4 + sy, CAM_D);
    camera.lookAt(cx + sx * 0.5, CAM_Y - 0.2 + sy * 0.5, 0);
    sun.position.set(cx - 12, 30, 20);
    sun.target.position.set(cx, 0, 0);
    pLight.position.set(P.x + P.w / 2, P.y + 2.5, 3);
    updateLevelLights(cx);
  }

  // HUD
  const hudCache = {};
  function setHud(id, v) {
    if (hudCache[id] === v) return;
    const el = $(id);
    if (hudCache[id] !== undefined && (id === 'hud-coins' || id === 'hud-lives')) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
    hudCache[id] = v; el.textContent = v;
  }
  function updateHud() {
    setHud('hud-score', String(G.score).padStart(6, '0'));
    setHud('hud-coins', String(G.coins).padStart(2, '0'));
    setHud('hud-world', LEVELS[G.idx].name);
    setHud('hud-time', G.state === 'title' ? '' : String(Math.max(0, G.time)).padStart(3, '0'));
    setHud('hud-lives', String(G.lives));
  }

  // ============================================================
  // Main loop
  // ============================================================
  let last = performance.now() / 1000, acc = 0, animDt = 0, dirty = true;
  window.addEventListener('resize', () => { dirty = true; });
  function frame(ms) {
    requestAnimationFrame(frame);
    const now = ms / 1000;
    let dt = Math.min(0.1, now - last);
    last = now;
    // a 60 Hz display's timestamps jitter around DT; snap them so each refresh runs exactly one step
    // instead of the odd 0-then-2 pattern that shows up as a hitch
    if (Math.abs(dt - DT) < 0.002) dt = DT;
    if (dt > 0.004) RES.minDt = Math.min(RES.minDt, dt);
    handleMeta();
    let n = 0;
    if (!G.paused) {
      acc += dt;
      animDt += dt;
      while (acc >= DT && n < 6) { step(); acc -= DT; n++; }
      if (n >= 6) acc = 0;
    }
    updateHud();
    // the world only changes on a game step: on 120/144 Hz screens skip the refreshes in between,
    // they would redraw the exact same image
    if (n === 0 && !dirty) return;
    dirty = false;
    const t = G.t;
    syncPlayer(t);
    syncWorld(t, animDt);
    animDt = 0;
    syncCamera(t);
    renderer.render(scene, camera);
    adaptRes(now);
  }

  function setResLevel(lvl) { RES.lvl = lvl; applyRes(); dirty = true; }
  function adaptRes(now) {
    if (G.state !== 'playing' || G.paused || document.hidden) { RES.t0 = 0; return; }
    if (!RES.t0) { RES.t0 = now; RES.frames = 0; return; }
    RES.frames++;
    const span = now - RES.t0;
    if (span < 2) return;
    const fps = RES.frames / span;
    RES.t0 = now; RES.frames = 0;
    // what the display allows (a 50 Hz screen never reaches 60)
    const target = Math.min(60, 1 / RES.minDt);
    const c = RES.check; RES.check = null;
    if (c && c.down && fps < c.fps + 3) { setResLevel(RES.lvl - 1); RES.hold = now + 120; return; }   // didn't help: not the GPU
    if (c && !c.down && fps < target * 0.9) { setResLevel(RES.lvl + 1); RES.holdLen *= 2; RES.hold = now + RES.holdLen; return; }
    if (now < RES.hold) return;
    if (fps < target * 0.87 && RES.lvl < RES.steps.length - 1) {
      RES.good = 0; RES.check = { down: true, fps }; setResLevel(RES.lvl + 1);
    } else if (fps > target * 0.97 && RES.lvl > 0) {
      RES.good += span;
      if (RES.good >= 10) { RES.good = 0; RES.check = { down: false }; setResLevel(RES.lvl - 1); }
    } else RES.good = 0;
  }

  // debug hook for automated testing
  window.__game = { G, P, get L() { return L; }, keys, pressed, startIntro, loadLevel, setSize, changeSelect, openSelect, closeSelect, unlockSelect: openSelect };
  // title screen menu buttons (mouse / touch)
  function onTap(id, fn) {
    $(id).addEventListener('pointerdown', e => { e.stopPropagation(); SFX.init(); if (G.state === 'title') fn(); });
  }
  onTap('btn-start', newGame);
  onTap('btn-select', openSelect);
  onTap('ls-back', closeSelect);
  $('levelsel').addEventListener('pointerdown', e => e.stopPropagation());

  toTitle();
  requestAnimationFrame(frame);
})();
