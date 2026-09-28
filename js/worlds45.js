'use strict';
// Worlds 4 & 5: models, background scenery and weather for the candy, crystal, airship,
// jungle, volcano and dark-fortress themes.
Object.assign(MODELS, (() => {
  const { mat, bx, mesh, group, geo, glow } = MODELS;
  const sph = (k, r, ws = 14, hs = 10) => geo('s4_' + k, () => new THREE.SphereGeometry(r, ws, hs));
  const cyl = (k, r1, r2, h, s = 12) => geo('y4_' + k, () => new THREE.CylinderGeometry(r1, r2, h, s));
  const cone = (k, r, h, s = 8) => geo('c4_' + k, () => new THREE.ConeGeometry(r, h, s));

  // ---------------- characters ----------------
  function toad() {
    const root = new THREE.Group();
    const inner = group(0, 0, 0, root);
    const mSkin = mat(0xffd8b0), mVest = mat(0x2848c8, { roughness: 0.5 }), mW = mat(0xffffff, { roughness: 0.5 }), mR = mat(0xe02020, { roughness: 0.4 });
    for (const sx of [-1, 1]) bx(0.2, 0.14, 0.28, mat(0x6a3a18), sx * 0.13, 0.07, 0.03, inner);
    mesh(cyl('tPants', 0.24, 0.28, 0.32, 14), mW, 0, 0.3, 0, inner);
    mesh(cyl('tBody', 0.2, 0.25, 0.35, 14), mVest, 0, 0.6, 0, inner);
    mesh(cyl('tBelly', 0.14, 0.18, 0.3, 12), mW, 0, 0.6, 0.08, inner);
    const head = group(0, 0.95, 0, inner);
    mesh(sph('tFace', 0.24, 14, 12), mSkin, 0, 0, 0.04, head);
    for (const sx of [-1, 1]) { const e = bx(0.05, 0.13, 0.02, mat(0x111111), sx * 0.08, 0.02, 0.27, head); e.castShadow = false; }
    const cap = mesh(geo('tCap', () => new THREE.SphereGeometry(0.46, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.62)), mW, 0, 0.08, 0, head);
    cap.scale.y = 0.85;
    for (const [x, y, z, s] of [[0, 0.44, 0, 0.14], [0.35, 0.26, 0.1, 0.12], [-0.35, 0.26, 0.1, 0.12], [0, 0.22, 0.38, 0.12], [0, 0.22, -0.38, 0.12]]) {
      const d = mesh(sph('tSpot', 1, 10, 8), mR, x, y, z, head); d.scale.set(s, s * 0.6, s);
      d.lookAt(d.position.clone().multiplyScalar(2));
    }
    const arms = [];
    for (const sx of [-1, 1]) {
      const a = group(sx * 0.26, 0.72, 0, inner);
      bx(0.1, 0.3, 0.1, mSkin, 0, -0.15, 0.03, a);
      arms.push(a);
    }
    return { root, inner, arms };
  }

  function meteor() {
    const root = new THREE.Group();
    const inner = group(0, 0.45, 0, root);
    const rock = mesh(geo('meteorRock', () => new THREE.DodecahedronGeometry(0.42, 0)), mat(0x3a2018, { emissive: 0xff3a00, emissiveIntensity: 0.6, roughness: 0.9 }), 0, 0, 0, inner);
    rock.castShadow = true;
    const core = mesh(sph('meteorCore', 0.36, 10, 8), mat(0xffa030, { emissive: 0xff6010, emissiveIntensity: 2.2 }), 0, 0, 0, inner);
    core.scale.setScalar(0.9);
    const trail = mesh(geo('meteorTrail', () => new THREE.ConeGeometry(0.38, 2.2, 10, 1, true).translate(0, 1.1, 0)),
      new THREE.MeshBasicMaterial({ color: 0xff8020, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }), 0, 0, 0, inner);
    trail.castShadow = false;
    inner.add(glow(0xff6010, 2.6, 0.9));
    return { root, inner, rock, trail };
  }

  // ---------------- candy ----------------
  function candyCane(h = 2.5) {
    const g = new THREE.Group();
    const stripeTex = TEX.canvasTex((c, s) => {
      c.fillStyle = '#ffffff'; c.fillRect(0, 0, s, s);
      c.fillStyle = '#e01830';
      for (let i = -s; i < s * 2; i += 8) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i + 4, 0); c.lineTo(i + 4 - s, s); c.lineTo(i - s, s); c.fill(); }
    }, 32);
    stripeTex.repeat.set(1, h);
    const m = new THREE.MeshStandardMaterial({ map: stripeTex, roughness: 0.25 });
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, h, 12), m);
    shaft.position.y = h / 2; shaft.castShadow = true; g.add(shaft);
    const hook = new THREE.Mesh(geo('caneHook', () => new THREE.TorusGeometry(0.35, 0.12, 10, 16, Math.PI)), m);
    hook.position.set(-0.35, h, 0); hook.castShadow = true; g.add(hook);
    return g;
  }
  function lollipop(h, color) {
    const g = new THREE.Group();
    mesh(cyl('lolStick', 0.05, 0.05, h, 8), mat(0xfff8f0), 0, h / 2, 0, g);
    const tex = TEX.canvasTex((c, s) => {
      c.fillStyle = '#ffffff'; c.fillRect(0, 0, s, s);
      c.strokeStyle = '#' + color.toString(16).padStart(6, '0'); c.lineWidth = 5;
      c.beginPath();
      for (let a = 0; a < Math.PI * 8; a += 0.1) { const r = a * 1.2; c.lineTo(s / 2 + Math.cos(a) * r, s / 2 + Math.sin(a) * r); }
      c.stroke();
    }, 64);
    const disc = new THREE.Mesh(geo('lolDisc', () => new THREE.CylinderGeometry(0.7, 0.7, 0.18, 24).rotateX(Math.PI / 2)),
      [new THREE.MeshStandardMaterial({ color, roughness: 0.2 }), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.2 }), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.2 })]);
    disc.position.y = h + 0.6; disc.castShadow = true; g.add(disc);
    return g;
  }
  function gumdrop(color, s = 1) {
    const m = mat(color, { roughness: 0.2, emissive: color, emissiveIntensity: 0.15, transparent: true, opacity: 0.92 });
    const g = mesh(geo('gumdrop', () => new THREE.SphereGeometry(0.4, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 1.3, 1)), m, 0, 0, 0);
    g.scale.setScalar(s);
    return g;
  }
  function cupcake(s = 1) {
    const g = new THREE.Group();
    mesh(cyl('cupBase', 0.55, 0.4, 0.6, 16), mat(0xf8c0d8, { roughness: 0.6 }), 0, 0.3, 0, g);
    const icing = mesh(geo('cupIcing', () => new THREE.SphereGeometry(0.62, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.9, 1)), mat(0xfff0f8, { roughness: 0.35 }), 0, 0.58, 0, g);
    icing.castShadow = true;
    mesh(sph('cherry', 0.14, 10, 8), mat(0xe01020, { roughness: 0.2 }), 0, 1.18, 0, g);
    g.scale.setScalar(s);
    return g;
  }
  function donut(color) {
    const g = new THREE.Group();
    mesh(geo('donut', () => new THREE.TorusGeometry(0.5, 0.25, 12, 20)), mat(0xd89048, { roughness: 0.7 }), 0, 0, 0, g);
    const ic = mesh(geo('donutIc', () => new THREE.TorusGeometry(0.5, 0.26, 10, 20, Math.PI * 2).scale(1, 1, 0.6).translate(0, 0, 0.06)), mat(color, { roughness: 0.35 }), 0, 0, 0, g);
    ic.castShadow = false;
    return g;
  }

  // ---------------- crystal ----------------
  function crystalCluster(color, s = 1) {
    const g = new THREE.Group();
    const m = mat(color, { emissive: color, emissiveIntensity: 0.9, roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.9 });
    const n = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) {
      const h = 0.8 + Math.random() * 1.4;
      const c = mesh(geo('crys', () => new THREE.CylinderGeometry(0, 0.22, 1, 6).translate(0, 0.5, 0)), m, (Math.random() - 0.5) * 0.5, 0, (Math.random() - 0.5) * 0.4, g);
      c.scale.set(1, h, 1);
      c.rotation.set((Math.random() - 0.5) * 0.9, Math.random() * 3, (Math.random() - 0.5) * 0.9);
      c.castShadow = false;
    }
    g.scale.setScalar(s);
    return g;
  }

  // ---------------- airship ----------------
  function airshipHull(len, mWood, mDark) {
    const g = new THREE.Group();
    const hull = new THREE.Mesh(geo('hull', () => {
      const sh = new THREE.Shape();
      sh.moveTo(-0.5, 0); sh.lineTo(0.5, 0); sh.lineTo(0.42, -0.35); sh.quadraticCurveTo(0.2, -0.7, 0, -0.75); sh.quadraticCurveTo(-0.2, -0.7, -0.42, -0.35); sh.closePath();
      return new THREE.ExtrudeGeometry(sh, { depth: 1, bevelEnabled: false }).rotateY(Math.PI / 2).translate(-0.5, 0, 0);
    }), mWood);
    hull.scale.set(len, 3, 4);
    hull.castShadow = true;
    g.add(hull);
        const bow = mesh(cone('bow', 0.9, 2.4, 4), mWood, len / 2 + 0.9, -0.9, 0, g); bow.rotation.z = -Math.PI / 2; bow.scale.set(1, 1, 1.8);
    // portholes
    const mP = mat(0xffd070, { emissive: 0xffa030, emissiveIntensity: 1.2 });
    for (let x = -len / 2 + 1; x < len / 2 - 0.5; x += 1.6) { const p = mesh(geo('porthole', () => new THREE.CircleGeometry(0.16, 12)), mP, x, -0.7, 1.82, g); p.castShadow = false; }
    return g;
  }
  function propeller(mMetal) {
    const g = new THREE.Group();
    mesh(geo('propHub', () => new THREE.CylinderGeometry(0.12, 0.2, 0.5, 10).rotateZ(Math.PI / 2)), mMetal, 0, 0, 0, g);
    const blades = group(-0.25, 0, 0, g);
    for (let i = 0; i < 3; i++) { const b = bx(0.06, 1.3, 0.22, mMetal, 0, 0.6, 0, null); const pv = group(0, 0, 0, blades); pv.rotation.x = i / 3 * Math.PI * 2; b.rotation.y = 0.5; pv.add(b); }
    return { g, blades };
  }
  function balloonShip(mWood, mDark) {
    const g = new THREE.Group();
    const env = mesh(geo('envelope', () => new THREE.SphereGeometry(1, 20, 12).scale(3.6, 1.3, 1.3)), mat(0xc83030, { roughness: 0.7 }), 0, 3.2, 0, g);
    env.castShadow = true;
    for (let i = -2; i <= 2; i++) bx(0.05, 0.02, 2.6, mat(0xffe0a0), i * 1.3, 3.2 + 1.25, 0, g).castShadow = false;
    const h = airshipHull(5, mWood, mDark); h.scale.setScalar(0.45); h.position.y = 1.2; g.add(h);
    for (const sx of [-1, 1]) bx(0.04, 1.6, 0.04, mat(0x3a2a1a), sx * 1.8, 2.1, 0, g);
    const p = propeller(mat(0x9a9aa8, { metalness: 0.7, roughness: 0.3 })); p.g.position.set(-3.8, 3.2, 0); g.add(p.g);
    return { g, blades: p.blades };
  }

  // ---------------- jungle ----------------
  function jungleTree(h, mTrunk, mLeaf) {
    const g = new THREE.Group();
    const t = mesh(geo('jTrunk', () => new THREE.CylinderGeometry(0.22, 0.4, 1, 8).translate(0, 0.5, 0)), mTrunk, 0, 0, 0, g);
    t.scale.set(1, h, 1);
    const crown = group(0, h, 0, g);
    for (let i = 0; i < 7; i++) {
      const a = i / 7 * Math.PI * 2;
      const leaf = mesh(geo('jLeaf', () => new THREE.SphereGeometry(1, 10, 6).scale(1.6, 0.25, 0.6).translate(1.3, 0, 0)), mLeaf, 0, 0, 0, crown);
      leaf.rotation.set(0, a, -0.45 - Math.random() * 0.3);
    }
    mesh(sph('jCrown', 0.6, 10, 8), mLeaf, 0, 0.1, 0, crown);
    return g;
  }
  function fern(mLeaf) {
    const g = new THREE.Group();
    for (let i = 0; i < 6; i++) {
      const f = mesh(geo('fern', () => new THREE.SphereGeometry(1, 8, 5).scale(0.6, 0.08, 0.18).translate(0.55, 0, 0)), mLeaf, 0, 0.1, 0, g);
      f.rotation.set(0, i / 6 * Math.PI * 2, 0.5);
      f.castShadow = false;
    }
    return g;
  }
  function temple(mStone, mMoss, s = 1) {
    const g = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const w = 6 - i * 1.1;
      bx(w, 1, w, i % 2 ? mMoss : mStone, 0, 0.5 + i, 0, g).receiveShadow = true;
    }
    bx(1.2, 1.2, 1.2, mStone, 0, 5.6, 0, g);
    bx(0.5, 0.7, 0.05, mat(0x050505), 0, 5.45, 0.61, g);
    const eye = mesh(sph('templeEye', 0.12, 8, 6), mat(0x60ff80, { emissive: 0x40ff60, emissiveIntensity: 2 }), 0, 5.5, 0.6, g);
    eye.castShadow = false;
    // stairs
    bx(1, 5, 0.9, mStone, 0, 2.5, 3, g).rotation.x = -0.72;
    g.scale.setScalar(s);
    return g;
  }

  // ---------------- volcano ----------------
  function volcanoMountain(h, mRock, mLava) {
    const g = new THREE.Group();
    const cone2 = mesh(geo('volc', () => new THREE.CylinderGeometry(0.16, 1, 1, 14, 1, true)), mRock, 0, 0, 0, g);
    cone2.scale.set(h * 1.2, h, h * 1.2); cone2.position.y = h / 2; cone2.castShadow = false;
    const crater = mesh(geo('volcTop', () => new THREE.CircleGeometry(1, 14).rotateX(-Math.PI / 2)), mLava, 0, h - 0.05, 0, g);
    crater.scale.setScalar(h * 1.2 * 0.16);
    // lava streams
    for (let i = 0; i < 4; i++) {
      const a = -0.6 + i * 0.45 + Math.random() * 0.2;
      const st = mesh(geo('lavaStream', () => new THREE.PlaneGeometry(1, 1).translate(0, -0.5, 0)), mLava, Math.sin(a) * h * 0.2, h, Math.cos(a) * h * 0.2 + 0.2, g);
      st.scale.set(h * 0.05, h * (0.4 + Math.random() * 0.4), 1);
      st.rotation.set(-0.35, a, 0);
      st.castShadow = false;
    }
    return g;
  }

  return { toad, meteor, candyCane, lollipop, gumdrop, cupcake, donut, crystalCluster, airshipHull, propeller, balloonShip, jungleTree, fern, temple, volcanoMountain };
})());

// ================= background scenery for the new themes =================
Object.assign(DECOR.themes, (() => {
  const M = () => MODELS;
  const { backPlane, clouds, everyGround } = DECOR.util;
  const glowS = (color, size, opacity = 0.6) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.roundSprite(), color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.scale.set(size, size, 1);
    return s;
  };

  function candy(ctx) {
    const { world, L, rnd } = ctx;
    backPlane(ctx, 0xffc0e0);
    // rolling cream-and-chocolate hills
    const hillM = [M().mat(0xffd8ec, { roughness: 0.6 }), M().mat(0xa8f0d8, { roughness: 0.6 }), M().mat(0xfff0b0, { roughness: 0.6 })];
    for (let x = -30; x < L.w + 40; x += 18 + rnd() * 22) {
      const h = M().hill(hillM[Math.floor(rnd() * 3)], 4 + rnd() * 7);
      h.position.set(x, 1, -26 - rnd() * 18);
      h.children.slice(1).forEach(c => { c.visible = false; });
      world.add(h);
    }
    const lolCols = [0xff3080, 0x30b0ff, 0xffb020, 0x8040ff, 0x20d080];
    for (let x = 0; x < L.w + 20; x += 5 + rnd() * 8) {
      const l = M().lollipop(1.8 + rnd() * 3, lolCols[Math.floor(rnd() * lolCols.length)]);
      l.position.set(x, 1, -5 - rnd() * 12);
      l.rotation.y = (rnd() - 0.5) * 0.6;
      world.add(l);
    }
    for (let x = 4; x < L.w + 10; x += 7 + rnd() * 9) {
      const c = M().candyCane(2 + rnd() * 2.5);
      c.position.set(x, 1, -3.5 - rnd() * 8);
      c.rotation.y = rnd() * Math.PI;
      world.add(c);
    }
    const gumCols = [0xff4060, 0x40e080, 0xffd030, 0x60a0ff, 0xff80ff];
    everyGround(ctx, [3, 5], x => {
      const g = M().gumdrop(gumCols[Math.floor(rnd() * gumCols.length)], 0.5 + rnd() * 0.5);
      g.position.set(x + rnd(), 2, -1.6 - rnd() * 0.8);
      world.add(g);
    });
    everyGround(ctx, [13, 14], x => {
      const c = M().cupcake(0.8 + rnd() * 0.4); c.position.set(x + 0.5, 2, -2.1); world.add(c);
    });
    // floating donuts
    const donuts = [];
    for (let x = 10; x < L.w; x += 14 + rnd() * 16) {
      const d = M().donut([0xff70b0, 0x6a3a20, 0xfff0f8, 0x60c8ff][Math.floor(rnd() * 4)]);
      d.position.set(x, 9 + rnd() * 4, -8 - rnd() * 8);
      d.scale.setScalar(1 + rnd());
      world.add(d); donuts.push({ d, y: d.position.y, ph: rnd() * 6 });
    }
    ctx.anim(t => donuts.forEach(o => { o.d.position.y = o.y + Math.sin(t + o.ph) * 0.4; o.d.rotation.y = t * 0.4 + o.ph; }));
    clouds(ctx, 0xffd8f0, 10, 16, -14, -30, 0.35);
    // candy rainbow
    const rb = new THREE.Group();
    [0xff4060, 0xffa030, 0xffe040, 0x40e080, 0x40a0ff, 0xa060ff].forEach((c, i) => {
      const r = new THREE.Mesh(new THREE.TorusGeometry(38 - i * 1.6, 0.8, 8, 48, Math.PI), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.45, fog: false }));
      rb.add(r);
    });
    rb.position.set(0, -6, -120); world.add(rb);
    ctx.anim(() => { rb.position.x = ctx.camX() * 0.85 + 30; });
  }

  function crystal(ctx) {
    const { world, L, rnd } = ctx;
    const wallTex = TEX.mats('crystal').brick.map.clone();
    wallTex.needsUpdate = true; wallTex.repeat.set((L.w + 60) / 2, 8);
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(L.w + 60, 32), new THREE.MeshStandardMaterial({ map: wallTex, color: 0x5a4a7a, roughness: 1 }));
    wall.position.set(L.w / 2, 8, -4);
    wall.receiveShadow = true;
    world.add(wall);
    const cols = [0x40e0ff, 0xc060ff, 0xff60c0, 0x60ffc0];
    const lights = [];
    for (let x = 4; x < L.w; x += 9 + rnd() * 8) {
      const col = cols[Math.floor(rnd() * cols.length)];
      const c = M().crystalCluster(col, 1 + rnd() * 1.2);
      const onGround = ctx.groundAt(Math.floor(x));
      c.position.set(x, onGround ? 2 : 1, onGround ? -2.2 : -3);
      world.add(c);
      const pl = new THREE.PointLight(col, 5, 8, 1.6);
      pl.position.set(x, 3.4, -1);
      world.add(pl);
      const gl = glowS(col, 3.5, 0.35); gl.position.set(x, c.position.y + 1, c.position.z + 0.3); world.add(gl);
      lights.push({ pl, gl, ph: rnd() * 6 });
    }
    // ceiling crystals hanging down
    for (let x = 8; x < 150; x += 6 + rnd() * 8) {
      const c = M().crystalCluster(cols[Math.floor(rnd() * cols.length)], 0.6 + rnd() * 0.6);
      c.rotation.z = Math.PI; c.position.set(x, 13, -1.8 - rnd() * 1.2);
      world.add(c);
    }
    ctx.anim(t => lights.forEach(l => { const k = 0.8 + Math.sin(t * 2 + l.ph) * 0.2; l.pl.intensity = 5 * k; l.gl.material.opacity = 0.35 * k; }));
    // far glowing pool
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(L.w + 60, 30), new THREE.MeshBasicMaterial({ color: 0x3050a0, transparent: true, opacity: 0.5 }));
    pool.rotation.x = -Math.PI / 2; pool.position.set(L.w / 2, -1.5, -15);
    world.add(pool);
  }

  function airship(ctx) {
    const { world, L, rnd } = ctx;
    const mWood = M().mat(0x8a5a30, { roughness: 0.8 }), mDark = M().mat(0x4a2e18, { roughness: 0.9 }), mMetal = M().mat(0x9a9aa8, { metalness: 0.7, roughness: 0.3 });
    // sea of clouds far below
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(L.w + 300, 200), M().mat(0xffe8e0, { roughness: 1, emissive: 0xffc0a0, emissiveIntensity: 0.25 }));
    sea.rotation.x = -Math.PI / 2; sea.position.set(L.w / 2, -8, -60);
    world.add(sea);
    clouds(ctx, 0xffe0d8, -6, -2, -6, -30, 0.3);
    clouds(ctx, 0xfff0e8, 12, 17, -18, -40, 0.35);
    const sailTex = TEX.canvasTex((c, sz) => {
      c.fillStyle = '#f4ead4'; c.fillRect(0, 0, sz, sz);
      c.fillStyle = '#e0d4b8'; for (let i = 0; i < sz; i += 16) c.fillRect(i, 0, 2, sz);
      c.fillStyle = '#202020'; c.beginPath(); c.arc(sz / 2, sz * 0.42, sz * 0.2, 0, Math.PI * 2); c.fill();
      c.fillRect(sz * 0.38, sz * 0.52, sz * 0.24, sz * 0.12);
      c.fillStyle = '#f4ead4'; c.beginPath(); c.arc(sz * 0.42, sz * 0.42, sz * 0.05, 0, 7); c.arc(sz * 0.58, sz * 0.42, sz * 0.05, 0, 7); c.fill();
      c.fillStyle = '#202020'; c.save(); c.translate(sz / 2, sz * 0.78);
      for (const r of [0.6, -0.6]) { c.save(); c.rotate(r); c.fillRect(-sz * 0.3, -sz * 0.03, sz * 0.6, sz * 0.06); c.restore(); }
      c.restore();
    }, 64);
    sailTex.magFilter = THREE.LinearFilter;
    // hull under every deck
    for (let x = 0; x < L.w;) {
      if (L.grid[1][x] !== '#') { x++; continue; }
      let x2 = x; while (x2 < L.w && L.grid[1][x2] === '#') x2++;
      const len = x2 - x;
      const h = M().airshipHull(len, mWood, mDark);
      h.position.set(x + len / 2, 0, -0.5);
      world.add(h);
      // masts + billowing sails with a skull emblem
      for (let mx = x + 3; mx < x2 - 2; mx += 9) {
        const mast = new THREE.Mesh(M().boxGeo(0.22, 9, 0.22), mDark);
        mast.position.set(mx + 0.5, 6.5, -3.2); mast.castShadow = true; world.add(mast);
        const yard = new THREE.Mesh(M().boxGeo(3, 0.12, 0.12), mDark); yard.position.set(mx + 0.5, 9.7, -3.1); world.add(yard);
        const sail = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 3, 6, 4), new THREE.MeshStandardMaterial({ map: sailTex, side: THREE.DoubleSide, roughness: 0.9 }));
        sail.position.set(mx + 0.5, 8.1, -3.05); sail.castShadow = true; world.add(sail);
        const base = sail.geometry.attributes.position.array.slice();
        ctx.anim(t => {
          const a = sail.geometry.attributes.position.array, gust = DECOR.gust || 0;
          for (let i = 0; i < a.length; i += 3) a[i + 2] = base[i + 2] + Math.sin(base[i] * 1.2 + t * 3) * 0.06 + (1 - (base[i + 1] / 1.5) ** 2) * (0.2 + gust * 0.5);
          sail.geometry.attributes.position.needsUpdate = true;
        });
      }
      const p = M().propeller(mMetal); p.g.position.set(x - 0.2, -1.4, -0.5); world.add(p.g);
      ctx.anim((t, dt) => { p.blades.rotation.x += dt * 18; });
      x = x2;
    }
    // distant balloon ships drifting
    for (let x = 10; x < L.w + 30; x += 30 + rnd() * 25) {
      const s = M().balloonShip(mWood, mDark);
      s.g.position.set(x, 4 + rnd() * 8, -20 - rnd() * 25);
      s.g.scale.setScalar(1 + rnd());
      world.add(s.g);
      const bx0 = s.g.position.x, by = s.g.position.y, ph = rnd() * 6;
      ctx.anim((t, dt) => { s.blades.rotation.x += dt * 12; s.g.position.x = bx0 + Math.sin(t * 0.1 + ph) * 4; s.g.position.y = by + Math.sin(t * 0.7 + ph) * 0.5; });
    }
    const sunM = new THREE.Mesh(new THREE.SphereGeometry(10, 24, 16), new THREE.MeshBasicMaterial({ color: 0xffb070, fog: false }));
    sunM.position.set(0, 6, -150); world.add(sunM);
    ctx.anim(() => { sunM.position.x = ctx.camX() * 0.9 + 30; });
  }

  function jungle(ctx) {
    const { world, L, rnd } = ctx;
    backPlane(ctx, 0x2a6a2a);
    const mTrunk = M().mat(0x6a4a2a, { roughness: 1 });
    const leafMs = [M().mat(0x2a8a30, { roughness: 0.8, side: THREE.DoubleSide }), M().mat(0x3aa040, { roughness: 0.8, side: THREE.DoubleSide }), M().mat(0x1e6a28, { roughness: 0.8, side: THREE.DoubleSide })];
    for (let x = -20; x < L.w + 30; x += 50 + rnd() * 30) {
      const t = M().temple(M().mat(0x8a8a6a, { roughness: 1 }), M().mat(0x5a7a40, { roughness: 1 }), 1.5 + rnd());
      t.position.set(x, 1, -30 - rnd() * 15);
      world.add(t);
    }
    for (let x = -10; x < L.w + 20; x += 3 + rnd() * 5) {
      const t = M().jungleTree(4 + rnd() * 6, mTrunk, leafMs[Math.floor(rnd() * 3)]);
      t.position.set(x, 1, -4.5 - rnd() * 16);
      t.rotation.y = rnd() * 6;
      world.add(t);
    }
    everyGround(ctx, [3, 4], x => {
      const f = M().fern(leafMs[Math.floor(rnd() * 3)]); f.position.set(x + rnd(), 2, -1.7 - rnd() * 0.6); f.scale.setScalar(0.7 + rnd() * 0.6); world.add(f);
    });
    // hanging vines swaying from the canopy
    const vines = [];
    const vMat = M().mat(0x3a8a2a, { roughness: 0.9 });
    for (let x = 3; x < L.w; x += 4 + rnd() * 6) {
      const len = 2 + rnd() * 4;
      const v = new THREE.Group(); v.position.set(x, 15, -2.6 - rnd() * 1.5);
      const s = new THREE.Mesh(M().geo('vine', () => new THREE.CylinderGeometry(0.04, 0.04, 1, 5).translate(0, -0.5, 0)), vMat);
      s.scale.y = len; v.add(s);
      for (let i = 0; i < len * 2; i++) { const lf = new THREE.Mesh(M().geo('vineLeaf', () => new THREE.SphereGeometry(0.12, 6, 4).scale(1, 0.4, 0.6)), vMat); lf.position.set((i % 2 ? 0.08 : -0.08), -i * 0.5, 0); v.add(lf); }
      world.add(v); vines.push({ v, ph: rnd() * 6 });
    }
    ctx.anim(t => vines.forEach(o => { o.v.rotation.z = Math.sin(t * 0.8 + o.ph) * 0.08; }));
    // waterfalls with mist
    for (let x = 20; x < L.w; x += 45 + rnd() * 30) {
      const tex = TEX.canvasTex((c, s) => {
        c.fillStyle = '#80d0ff'; c.fillRect(0, 0, s, s);
        for (let i = 0; i < 40; i++) { c.fillStyle = Math.random() < 0.5 ? '#ffffff' : '#b0e8ff'; c.fillRect(Math.floor(Math.random() * s), Math.floor(Math.random() * s), 1, 3 + Math.floor(Math.random() * 5)); }
      }, 16);
      tex.repeat.set(2, 6);
      const wf = new THREE.Mesh(new THREE.PlaneGeometry(3, 16), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.85 }));
      const z = -12 - rnd() * 6;
      wf.position.set(x, 8, z); world.add(wf);
      const cliff = new THREE.Mesh(M().boxGeo(8, 18, 3), M().mat(0x5a5a48, { roughness: 1 })); cliff.position.set(x, 8, z - 1.6); world.add(cliff);
      const mist = glowS(0xffffff, 6, 0.3); mist.position.set(x, 1.5, z + 0.5); world.add(mist);
      ctx.anim(t => { tex.offset.y = t * 1.6; mist.material.opacity = 0.25 + Math.sin(t * 3) * 0.05; });
    }
    clouds(ctx, 0x9ab0a0, 13, 16, -12, -26, 0.1, 0.8);
  }

  function volcano(ctx) {
    const { world, L, rnd } = ctx;
    backPlane(ctx, 0x3a2420);
    const mRock = M().mat(0x2a1e1c, { roughness: 1 });
    const lt = TEX.lava().clone(); lt.needsUpdate = true;
    const mLava = new THREE.MeshStandardMaterial({ map: lt, emissive: 0xffffff, emissiveMap: lt, emissiveIntensity: 1.1, side: THREE.DoubleSide });
    const big = M().volcanoMountain(34, mRock, mLava);
    big.position.set(L.w * 0.5, -1, -110);
    world.add(big);
    const smoke = [];
    for (let i = 0; i < 14; i++) {
      const s = new THREE.Mesh(M().geo('smoke', () => new THREE.SphereGeometry(1, 10, 8)), M().mat(0x302424, { roughness: 1, transparent: true, opacity: 0.8 }));
      world.add(s); smoke.push({ s, t: i / 14 });
    }
    const craterGlow = glowS(0xff4010, 40, 0.7); world.add(craterGlow);
    ctx.anim((t, dt) => {
      big.position.x = ctx.camX() * 0.8 + 30;
      craterGlow.position.set(big.position.x, 33, -108);
      smoke.forEach(o => {
        o.t = (o.t + dt * 0.04) % 1;
        o.s.position.set(big.position.x + o.t * 22 + Math.sin(o.t * 9) * 2, 34 + o.t * 24, -110);
        o.s.scale.setScalar(3 + o.t * 9);
        o.s.material.opacity = 0.8 * (1 - o.t);
      });
      lt.offset.y = -t * 0.08;
    });
    for (let x = -30; x < L.w + 40; x += 20 + rnd() * 20) {
      const v = M().volcanoMountain(8 + rnd() * 8, mRock, mLava);
      v.position.set(x, 0, -40 - rnd() * 20);
      world.add(v);
    }
    const mObs = M().mat(0x3a3040, { roughness: 0.45, metalness: 0.2 });
    for (let x = 0; x < L.w + 10; x += 3 + rnd() * 5) {
      const r = M().rock(0.6 + rnd() * 1.6, mObs);
      r.position.set(x, 1, -4 - rnd() * 12);
      world.add(r);
    }
    // glowing cracks on the ground
    everyGround(ctx, [4, 6], x => {
      const c = new THREE.Mesh(M().boxGeo(0.6 + rnd() * 0.8, 0.02, 0.08), M().mat(0xff5010, { emissive: 0xff4000, emissiveIntensity: 2 }));
      c.position.set(x + rnd(), 2.01, -1 - rnd() * 1.2); c.rotation.y = rnd() * 3; c.castShadow = false;
      world.add(c);
    });
    // lava sea in the pits
    const lava = new THREE.Mesh(new THREE.BoxGeometry(L.w + 60, 1, 6), mLava);
    lava.position.set(L.w / 2, 0.55, -0.5);
    world.add(lava);
    ctx.anim(t => { lava.position.y = 0.55 + Math.sin(t * 2) * 0.05; lt.offset.x = t * 0.05; });
    for (let x = 0; x < L.w; x++) {
      if (!ctx.groundAt(x) && L.grid[1][x] === ' ' && ctx.groundAt(x - 1)) {
        const pl = new THREE.PointLight(0xff5010, 8, 9, 1.4);
        pl.position.set(x + 2, 2.5, 0.5);
        world.add(pl);
        ctx.anim(t => { pl.intensity = 7 + Math.sin(t * 5 + x) * 1.5; });
      }
    }
  }

  function fortress(ctx) {
    DECOR.themes.castle(ctx);
    const { world, L, rnd } = ctx;
    // eerie purple spirit flames along the back wall
    for (let x = 6; x < L.w; x += 14 + rnd() * 6) {
      const f = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.9, 10), MODELS.mat(0xc080ff, { emissive: 0x9040ff, emissiveIntensity: 2.4 }));
      f.position.set(x, 5.2, -3.2); world.add(f);
      bx4(world, x, 4.6);
      const g = glowS(0xa060ff, 3, 0.55); g.position.set(x, 5.3, -3.1); world.add(g);
      const pl = new THREE.PointLight(0xa060ff, 4, 7, 1.5); pl.position.set(x, 5.5, -1.8); world.add(pl);
      const ph = rnd() * 6;
      ctx.anim(t => { f.scale.set(1, 0.85 + Math.sin(t * 13 + ph) * 0.15, 1); g.material.opacity = 0.45 + Math.sin(t * 9 + ph) * 0.1; });
    }
    // Bowser emblem banners
    for (let x = 20; x < L.w; x += 30) {
      const b = new THREE.Mesh(M().boxGeo(1.6, 3, 0.05), MODELS.mat(0x401060, { roughness: 0.9 }));
      b.position.set(x, 9, -3.4); world.add(b);
      const e = new THREE.Mesh(M().geo('bEmb', () => new THREE.CircleGeometry(0.5, 20)), MODELS.mat(0xffc020, { metalness: 0.7, roughness: 0.3 }));
      e.position.set(x, 9.3, -3.36); world.add(e);
    }
  }
  function bx4(world, x, y) {
    const b = new THREE.Mesh(MODELS.boxGeo(0.4, 0.2, 0.4), MODELS.mat(0x303038, { metalness: 0.5 }));
    b.position.set(x, y, -3.2); world.add(b);
  }

  // ---------------- turbo speedway ----------------
  function speedway(ctx) {
    const { world, L, rnd } = ctx;
    backPlane(ctx, 0x9ad0ff);
    // distant green hills + mountains
    const hillM = [M().mat(0x5ab04a, { roughness: 0.9 }), M().mat(0x3a9040, { roughness: 0.9 })];
    for (let x = -30; x < L.w + 40; x += 16 + rnd() * 20) {
      const h = M().hill(hillM[Math.floor(rnd() * 2)], 5 + rnd() * 8);
      h.position.set(x, 1, -40 - rnd() * 20);
      h.children.slice(1).forEach(c => { c.visible = false; });
      world.add(h);
    }
    const checker = TEX.canvasTex((c, sz) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { c.fillStyle = (x + y) % 2 ? '#111' : '#fff'; c.fillRect(x * 4, y * 4, 4, 4); } }, 16);
    const mChecker = new THREE.MeshStandardMaterial({ map: checker, roughness: 0.7, side: THREE.DoubleSide });
    const mSteel = M().mat(0xc8ccd8, { metalness: 0.6, roughness: 0.35 });
    const mRoof = M().mat(0xe03028, { roughness: 0.6 });
    const mSeat = M().mat(0x3a4a6a, { roughness: 0.8 });
    // grandstands packed with a cheering crowd (instanced)
    const fans = [], fanCols = [0xff3040, 0xffd020, 0x30a0ff, 0x40e070, 0xffffff, 0xff8020, 0xa050ff];
    const stands = [];
    for (let x = 4; x < L.w + 10; x += 26 + rnd() * 8) {
      const len = 16 + rnd() * 4, z = -13;
      for (let r = 0; r < 5; r++) {
        const step = new THREE.Mesh(M().boxGeo(len, 0.6, 1.1), mSeat);
        step.position.set(x + len / 2, 1.3 + r * 0.6, z - r * 1.1); world.add(step);
        for (let i = 0; i < len / 0.55; i++) if (rnd() < 0.85) fans.push({ x: x + 0.3 + i * 0.55 + (rnd() - 0.5) * 0.15, y: 1.9 + r * 0.6, z: z - r * 1.1, c: fanCols[Math.floor(rnd() * fanCols.length)], ph: rnd() * 6 });
      }
      const roof = new THREE.Mesh(M().boxGeo(len + 1, 0.25, 6.5), mRoof);
      roof.position.set(x + len / 2, 6.2, z - 2.4); roof.rotation.x = -0.12; world.add(roof);
      for (const px of [x, x + len]) { const post = new THREE.Mesh(M().boxGeo(0.25, 5, 0.25), mSteel); post.position.set(px, 3.8, z - 4.6); world.add(post); }
      stands.push(x);
    }
    if (fans.length) {
      const body = new THREE.InstancedMesh(M().boxGeo(0.36, 0.45, 0.3), new THREE.MeshStandardMaterial({ roughness: 0.8 }), fans.length);
      const heads = new THREE.InstancedMesh(M().geo('fanHead', () => new THREE.SphereGeometry(0.15, 8, 6)), M().mat(0xffc8a0, { roughness: 0.8 }), fans.length);
      const col = new THREE.Color(), mtx = new THREE.Matrix4();
      fans.forEach((f, i) => body.setColorAt(i, col.setHex(f.c)));
      world.add(body); world.add(heads);
      ctx.anim(t => {
        const cx = ctx.camX();
        fans.forEach((f, i) => {
          const near = Math.abs(f.x - cx) < 30;
          const j = near ? Math.max(0, Math.sin(t * 9 + f.ph)) * 0.18 : 0;
          mtx.makeTranslation(f.x, f.y + 0.22 + j, f.z); body.setMatrixAt(i, mtx);
          mtx.makeTranslation(f.x, f.y + 0.6 + j, f.z); heads.setMatrixAt(i, mtx);
        });
        body.instanceMatrix.needsUpdate = true; heads.instanceMatrix.needsUpdate = true;
      });
    }
    // waving checkered flags on poles
    for (let x = 10; x < L.w; x += 14 + rnd() * 10) {
      const pole = new THREE.Mesh(M().boxGeo(0.08, 4, 0.08), mSteel); pole.position.set(x, 3, -4.5); world.add(pole);
      const fg = new THREE.PlaneGeometry(1.6, 1, 8, 1);
      const flag = new THREE.Mesh(fg, mChecker); flag.position.set(x + 0.8, 4.4, -4.5); world.add(flag);
      const base = fg.attributes.position.array.slice(), ph = rnd() * 6;
      ctx.anim(t => {
        const a = fg.attributes.position.array;
        for (let i = 0; i < a.length; i += 3) { const u = (base[i] + 0.8) / 1.6; a[i + 2] = Math.sin(t * 7 + ph - u * 4) * 0.2 * u; }
        fg.attributes.position.needsUpdate = true;
      });
    }
    // red/white tyre stacks and barrier along the track
    const mTyre = M().mat(0x1a1a1e, { roughness: 0.9 }), mTyreR = M().mat(0xe03028, { roughness: 0.7 }), mTyreW = M().mat(0xf4f4f4, { roughness: 0.7 });
    everyGround(ctx, [6, 10], x => {
      const g = new THREE.Group(); g.position.set(x + rnd(), 2, -1.9 - rnd() * 0.4);
      for (let i = 0; i < 3; i++) {
        const tyre = new THREE.Mesh(M().geo('tyre', () => new THREE.TorusGeometry(0.28, 0.13, 8, 14).rotateX(Math.PI / 2)), i === 1 ? (rnd() < 0.5 ? mTyreR : mTyreW) : mTyre);
        tyre.position.y = 0.13 + i * 0.26; g.add(tyre);
      }
      world.add(g);
    });
    const barTex = TEX.canvasTex(c => { for (let i = 0; i < 4; i++) { c.fillStyle = i % 2 ? '#f4f4f4' : '#e02a1a'; c.fillRect(i * 4, 0, 4, 16); } }, 16);
    barTex.repeat.set(L.w / 2, 1);
    const barrier = new THREE.Mesh(new THREE.BoxGeometry(L.w + 60, 0.7, 0.2), new THREE.MeshStandardMaterial({ map: barTex, roughness: 0.6 }));
    barrier.position.set(L.w / 2, 1.35, -6.5); world.add(barrier);
    // start / finish gantry and speed arches over the dash panels
    const gantry = (x, label) => {
      const g = new THREE.Group(); g.position.set(x, 2, -2.9);
      for (const sx of [-3, 3]) { const p = new THREE.Mesh(M().boxGeo(0.35, 8, 0.35), mSteel); p.position.set(sx, 4, 0); g.add(p); }
      const beam = new THREE.Mesh(M().boxGeo(6.6, 1.2, 0.3), mChecker); beam.position.set(0, 8, 0); g.add(beam);
      if (label) {
        const sign = new THREE.Mesh(new THREE.PlaneGeometry(4, 0.8), new THREE.MeshBasicMaterial({ map: TEX.textTex(label, '#ffe030', '#101020'), transparent: true }));
        sign.position.set(0, 8, 0.17); g.add(sign);
      }
      world.add(g);
    };
    gantry(5, 'START');
    for (let x = 0; x < L.w; x++) if (L.grid[1][x] === 'A' && L.grid[1][x - 1] !== 'A') gantry(x + 1, 'TURBO');
    // advertising blimp
    const blimp = new THREE.Group();
    const hull = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), M().mat(0xf4f4f4, { roughness: 0.4 })); hull.scale.set(4, 1.3, 1.3); blimp.add(hull);
    const stripe = new THREE.Mesh(new THREE.CylinderGeometry(1.32, 1.32, 1.2, 20, 1, true).rotateZ(Math.PI / 2), mRoof); blimp.add(stripe);
    const gond = new THREE.Mesh(M().boxGeo(1.2, 0.4, 0.5), mSeat); gond.position.y = -1.35; blimp.add(gond);
    for (const r of [0, Math.PI / 2]) { const fin = new THREE.Mesh(M().boxGeo(0.9, 1.4, 0.08), mRoof); fin.position.x = -3.6; fin.rotation.x = r; blimp.add(fin); }
    blimp.position.set(0, 13, -30); world.add(blimp);
    ctx.anim(t => { blimp.position.x = ctx.camX() * 0.7 + 20 + Math.sin(t * 0.1) * 10; blimp.position.y = 13 + Math.sin(t * 0.6) * 0.4; });
    clouds(ctx, 0xffffff, 12, 16, -18, -40, 0.3, 1);
  }

  return { candy, crystal, airship, jungle, volcano, fortress, speedway };
})());

Object.assign(DECOR.WEATHER, {
  sprinkles: { n: 320, colors: [0xff4080, 0x40c0ff, 0xffe040, 0x60ff90, 0xffffff], size: 0.14, v: (p, t, i) => [Math.sin(t + i) * 0.5, -1.1 - (i % 4) * 0.2, 0] },
  glitter: { n: 260, color: 0xc0a0ff, size: 0.1, v: (p, t, i) => [Math.sin(t * 0.4 + i) * 0.25, 0.25 + Math.cos(t * 0.5 + i) * 0.15, 0], blink: true },
  wind: { n: 260, color: 0xffffff, size: 0.09, v: (p, t, i) => [-(2 + (DECOR.gust || 0) * 34) - (i % 5), Math.sin(t * 2 + i) * 0.3, 0] },
  rain: { n: 900, color: 0xb0d0ff, size: 0.09, v: (p, t, i) => [-1.5, -16 - (i % 5) * 1.5, 0] },
  ash: { n: 420, colors: [0x5a5050, 0x3a3030, 0xff7020], size: 0.14, v: (p, t, i) => [0.6 + Math.sin(t * 0.7 + i) * 0.4, -0.7 - (i % 3) * 0.2, 0] },
  confetti: { n: 280, colors: [0xff3040, 0xffd020, 0x30a0ff, 0x40e070, 0xffffff, 0xff70d0], size: 0.13, v: (p, t, i) => [0.8 + Math.sin(t * 2 + i) * 1.2, -1.3 - (i % 4) * 0.25, 0] },
  spirits: { n: 200, color: 0xb080ff, size: 0.14, v: (p, t, i) => [Math.sin(t + i) * 0.3, 1.2 + (i % 5) * 0.25, 0] },
});
