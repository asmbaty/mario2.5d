'use strict';
// Low-poly 3D models built from primitives. All models have their origin at the feet (bottom center).
const MODELS = (() => {
  const geoCache = {};
  const matCache = {};

  // Box geometry whose UVs tile once per world unit (so textures don't stretch).
  function boxGeo(w, h, d) {
    const k = `${w},${h},${d}`;
    if (geoCache[k]) return geoCache[k];
    const g = new THREE.BoxGeometry(w, h, d);
    const uv = g.attributes.uv;
    const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
    for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) {
      const idx = f * 4 + i;
      uv.setXY(idx, uv.getX(idx) * dims[f][0], uv.getY(idx) * dims[f][1]);
    }
    return (geoCache[k] = g);
  }
  function geo(key, make) { return geoCache[key] || (geoCache[key] = make()); }
  function mat(color, o = {}) {
    const k = color + JSON.stringify(o);
    return matCache[k] || (matCache[k] = new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.02, ...o }));
  }
  function bx(w, h, d, m, x, y, z, parent) {
    const me = new THREE.Mesh(boxGeo(w, h, d), m);
    me.position.set(x, y, z);
    me.castShadow = true;
    if (parent) parent.add(me);
    return me;
  }
  function mesh(g, m, x, y, z, parent) {
    const me = new THREE.Mesh(g, m);
    me.position.set(x, y, z);
    me.castShadow = true;
    if (parent) parent.add(me);
    return me;
  }
  function group(x = 0, y = 0, z = 0, parent) {
    const g = new THREE.Group(); g.position.set(x, y, z);
    if (parent) parent.add(g);
    return g;
  }

  // ---------------- Player ----------------
  function capEmblemTex() {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d');
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(32, 32, 31, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#d82800';
    g.font = 'bold 44px Arial Black, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('M', 32, 35);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  function player() {
    const root = new THREE.Group();
    const body = group(0, 0, 0, root);        // rotated to face direction
    const inner = group(0, 0, 0, body);       // scaled for small/big
    const mShirt = new THREE.MeshStandardMaterial({ color: 0xd82800, roughness: 0.55 });
    const mOver = new THREE.MeshStandardMaterial({ color: 0x2038ec, roughness: 0.6 });
    const mSkin = mat(0xffc8a0, { roughness: 0.7 }), mShoe = mat(0x6b3a10, { roughness: 0.45 }), mSole = mat(0x3a1c06);
    const mHair = mat(0x3a1c06, { roughness: 0.9 }), mBlack = mat(0x111111);
    const mWhite = mat(0xffffff, { roughness: 0.5 }), mButton = mat(0xffd700, { metalness: 0.7, roughness: 0.25 });
    const mEye = mat(0x1a50d0, { roughness: 0.3 });
    const S = (k, r, w = 14, h = 10) => geo('pl_' + k, () => new THREE.SphereGeometry(r, w, h));
    const C = (k, r1, r2, h, n = 12) => geo('pl_' + k, () => new THREE.CylinderGeometry(r1, r2, h, n));

    const legs = [];
    for (const sx of [-1, 1]) {
      const leg = group(sx * 0.12, 0.42, 0, inner);
      mesh(C('leg', 0.1, 0.095, 0.3), mOver, 0, -0.15, 0, leg);
      const shoe = mesh(S('shoe', 0.15), mShoe, 0, -0.33, 0.06, leg); shoe.scale.set(0.85, 0.55, 1.3);
      const sole = mesh(C('sole', 0.13, 0.13, 0.04), mSole, 0, -0.395, 0.06, leg); sole.scale.set(1, 1, 1.45);
      legs.push(leg);
    }
    // overalls (rounded) + shirt
    const belly = mesh(S('belly', 0.27, 16, 12), mOver, 0, 0.53, 0, inner); belly.scale.set(1, 0.62, 0.8);
    mesh(C('hips', 0.26, 0.22, 0.14, 14), mOver, 0, 0.47, 0, inner).scale.z = 0.82;
    const chest = mesh(S('chest', 0.25, 16, 12), mShirt, 0, 0.74, 0, inner); chest.scale.set(1, 0.6, 0.78);
    bx(0.3, 0.14, 0.05, mOver, 0, 0.66, 0.18, inner);
    for (const sx of [-1, 1]) {
      const strap = bx(0.07, 0.24, 0.03, mOver, sx * 0.12, 0.76, 0.17, inner); strap.rotation.z = sx * 0.12;
      mesh(S('button', 0.035, 8, 6), mButton, sx * 0.12, 0.66, 0.21, inner);
    }
    const arms = [];
    for (const sx of [-1, 1]) {
      const arm = group(sx * 0.29, 0.8, 0, inner);
      mesh(S('shoulder', 0.085, 10, 8), mShirt, 0, 0, 0, arm);
      mesh(C('sleeve', 0.075, 0.07, 0.26, 10), mShirt, 0, -0.14, 0, arm);
      const glove = mesh(S('glove', 0.095, 12, 10), mWhite, 0, -0.31, 0.01, arm); glove.scale.set(1, 1.05, 1.05);
      mesh(S('cuff', 0.08, 10, 6), mWhite, 0, -0.24, 0, arm).scale.set(1, 0.45, 1);
      arms.push(arm);
    }
    // head
    const head = group(0, 0.84, 0, inner);
    const skull = mesh(S('head', 0.24, 20, 16), mSkin, 0, 0.19, 0, head); skull.scale.set(1, 0.95, 0.95);
    mesh(S('nose', 0.085, 12, 10), mSkin, 0, 0.12, 0.25, head);
    for (const sx of [-1, 1]) {
      const mu = mesh(S('mus', 0.08, 10, 8), mHair, sx * 0.075, 0.055, 0.2, head); mu.scale.set(1.35, 0.55, 0.6); mu.rotation.z = sx * -0.25;
      mesh(S('ear', 0.055, 8, 6), mSkin, sx * 0.235, 0.17, -0.02, head).scale.set(0.5, 1, 0.8);
      const sb = mesh(S('sideburn', 0.07, 8, 6), mHair, sx * 0.215, 0.24, -0.06, head); sb.scale.set(0.45, 1, 0.7);
    }
    const hairBack = mesh(S('hairBack', 0.23, 14, 10), mHair, 0, 0.2, -0.06, head); hairBack.scale.set(1.02, 0.8, 0.95);
    skull.renderOrder = 1;
    const eyes = [];
    for (const sx of [-1, 1]) {
      const eg = group(sx * 0.075, 0.215, 0.215, head);
      const w = mesh(S('eyeW', 0.055, 10, 8), mWhite, 0, 0, 0, eg); w.scale.set(0.75, 1.15, 0.5);
      const pu = mesh(S('eyeP', 0.034, 8, 6), mEye, 0.005, -0.005, 0.02, eg); pu.scale.set(0.8, 1.2, 0.5);
      mesh(S('eyeK', 0.018, 6, 4), mBlack, 0.006, -0.005, 0.034, eg);
      const brow = bx(0.08, 0.022, 0.02, mHair, 0, 0.085, 0.01, eg); brow.rotation.z = sx * -0.15;
      eyes.push(eg);
    }
    // cap
    const cap = mesh(geo('pl_cap', () => new THREE.SphereGeometry(0.255, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2)), mShirt, 0, 0.3, -0.01, head);
    cap.scale.set(1.02, 0.78, 1.02);
    const brim = mesh(geo('pl_brim', () => new THREE.CylinderGeometry(0.2, 0.2, 0.035, 16, 1, false, -Math.PI / 2, Math.PI)), mShirt, 0, 0.31, 0.1, head);
    brim.scale.set(1.15, 1, 0.95); brim.rotation.x = 0.12;
    const emblem = new THREE.Mesh(geo('pl_emb', () => new THREE.CircleGeometry(0.07, 20)), new THREE.MeshStandardMaterial({ map: capEmblemTex(), roughness: 0.5 }));
    emblem.position.set(0, 0.41, 0.195); emblem.rotation.x = -0.6;
    head.add(emblem);

    const palettes = {
      normal: [0xd82800, 0x2038ec],
      fire: [0xffffff, 0xd82800],
    };
    function setPalette(name) {
      const p = palettes[name];
      mShirt.color.setHex(p[0]); mOver.color.setHex(p[1]);
    }
    function setColors(a, b) { mShirt.color.setHex(a); mOver.color.setHex(b); }
    return { root, body, inner, legs, arms, head, eyes, setPalette, setColors };
  }

  // ---------------- Goomba ----------------
  function goomba() {
    const root = new THREE.Group();
    const inner = group(0, 0, 0, root);
    const mBrown = mat(0xa0501c), mTan = mat(0xf0c890), mDark = mat(0x2a1606);
    const mW = mat(0xffffff), mK = mat(0x111111);
    const head = mesh(geo('gHead', () => new THREE.SphereGeometry(0.46, 18, 12)), mBrown, 0, 0.58, 0, inner);
    head.scale.set(1, 0.72, 0.9);
    mesh(geo('gStem', () => new THREE.CylinderGeometry(0.22, 0.26, 0.34, 12)), mTan, 0, 0.25, 0, inner);
    for (const sx of [-1, 1]) {
      bx(0.13, 0.17, 0.04, mW, sx * 0.12, 0.6, 0.39, inner);
      bx(0.06, 0.1, 0.03, mK, sx * 0.1, 0.58, 0.415, inner);
      const brow = bx(0.18, 0.05, 0.04, mK, sx * 0.13, 0.72, 0.38, inner);
      brow.rotation.z = sx * -0.45;
    }
    const feet = [];
    for (const sx of [-1, 1]) feet.push(bx(0.26, 0.14, 0.34, mDark, sx * 0.16, 0.07, 0.03, inner));
    return { root, inner, feet };
  }

  // ---------------- Koopa ----------------
  function koopa(red) {
    const root = new THREE.Group();
    const inner = group(0, 0, 0, root);
    const mShell = mat(red ? 0xd82800 : 0x20a030, { roughness: 0.35 });
    const mRim = mat(0xfff4d0), mSkin = mat(0xf8d040), mK = mat(0x111111), mW = mat(0xffffff);
    const shell = group(0, 0, 0, inner);
    const dome = mesh(geo('kShell', () => new THREE.SphereGeometry(0.46, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2)), mShell, 0, 0.38, 0, shell);
    dome.scale.set(1, 1.05, 0.92);
    mesh(geo('kRim', () => new THREE.CylinderGeometry(0.48, 0.44, 0.14, 18)), mRim, 0, 0.33, 0, shell);
    mesh(geo('kBelly', () => new THREE.CylinderGeometry(0.42, 0.3, 0.2, 18)), mSkin, 0, 0.18, 0, shell);
    // hexagon pattern on shell
    for (const [a, e] of [[0, 0.9], [2.1, 0.9], [4.2, 0.9], [1.05, 0.45], [3.15, 0.45], [5.25, 0.45]]) {
      const hx = mesh(geo('kHex', () => new THREE.CylinderGeometry(0.1, 0.1, 0.03, 6)), mRim, 0, 0, 0, shell);
      const r = 0.46, y = Math.sin(e) * r * 1.05, rr = Math.cos(e) * r;
      hx.position.set(Math.cos(a) * rr, 0.38 + y, Math.sin(a) * rr * 0.92);
      hx.lookAt(hx.position.x * 3, 0.38 + y * 3, hx.position.z * 3);
      hx.rotateX(Math.PI / 2);
    }
    const headG = group(0.36, 0.72, 0, inner);
    mesh(geo('kHead', () => new THREE.SphereGeometry(0.2, 14, 10)), mSkin, 0.08, 0.14, 0, headG).scale.set(1.2, 1, 1);
    bx(0.14, 0.28, 0.16, mSkin, -0.02, -0.06, 0, headG);
    for (const sz of [-1, 1]) {
      bx(0.08, 0.12, 0.05, mW, 0.14, 0.2, sz * 0.13, headG);
      bx(0.04, 0.07, 0.03, mK, 0.17, 0.2, sz * 0.15, headG);
    }
    const legs = [];
    for (const [lx, lz] of [[0.2, 0.2], [-0.2, 0.2], [0.2, -0.2], [-0.2, -0.2]]) {
      const l = group(lx, 0.22, lz, inner);
      bx(0.14, 0.22, 0.14, mSkin, 0, -0.11, 0, l);
      bx(0.2, 0.08, 0.16, mSkin, 0.04, -0.2, 0, l);
      legs.push(l);
    }
    return { root, inner, shell, headG, legs };
  }

  // ---------------- Items ----------------
  function mushroom(oneUp) {
    const root = new THREE.Group();
    const inner = group(0, 0, 0, root);
    mesh(geo('mStem', () => new THREE.CylinderGeometry(0.24, 0.28, 0.4, 14)), mat(0xfff0d0), 0, 0.2, 0, inner);
    const cap = mesh(geo('mCap', () => new THREE.SphereGeometry(0.42, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2)), mat(oneUp ? 0x28b838 : 0xe02010, { roughness: 0.35 }), 0, 0.36, 0, inner);
    cap.scale.y = 1.05;
    const mW = mat(0xffffff);
    for (const [a, e] of [[1.57, 0.5], [0.4, 0.3], [2.74, 0.3], [1.57, 1.3], [-1.57, 0.5]]) {
      const s = mesh(geo('mSpot', () => new THREE.SphereGeometry(0.12, 10, 8)), mW, 0, 0, 0, inner);
      s.position.set(Math.cos(a) * Math.cos(e) * 0.4, 0.36 + Math.sin(e) * 0.42, Math.sin(a) * Math.cos(e) * 0.4);
      s.scale.set(1, 0.6, 1);
    }
    for (const sx of [-1, 1]) bx(0.05, 0.12, 0.02, mat(0x111111), sx * 0.08, 0.24, 0.26, inner);
    return { root, inner };
  }
  function flower() {
    const root = new THREE.Group();
    const inner = group(0, 0, 0, root);
    const mG = mat(0x20a030);
    mesh(geo('fStem', () => new THREE.CylinderGeometry(0.05, 0.06, 0.4, 8)), mG, 0, 0.2, 0, inner);
    for (const sx of [-1, 1]) {
      const leaf = mesh(geo('fLeaf', () => new THREE.SphereGeometry(0.14, 10, 6)), mG, sx * 0.15, 0.12, 0, inner);
      leaf.scale.set(1.3, 0.4, 0.7);
    }
    const headG = group(0, 0.62, 0, inner);
    const petals = mesh(geo('fHead', () => new THREE.CylinderGeometry(0.34, 0.34, 0.14, 16).rotateX(Math.PI / 2)), mat(0xff5010, { emissive: 0xff2000, emissiveIntensity: 0.3 }), 0, 0, 0, headG);
    mesh(geo('fRing', () => new THREE.CylinderGeometry(0.24, 0.24, 0.16, 16).rotateX(Math.PI / 2)), mat(0xffd000, { emissive: 0xffa000, emissiveIntensity: 0.3 }), 0, 0, 0.01, headG);
    mesh(geo('fCore', () => new THREE.CylinderGeometry(0.14, 0.14, 0.18, 16).rotateX(Math.PI / 2)), mat(0xffffff), 0, 0, 0.02, headG);
    for (const sx of [-1, 1]) bx(0.04, 0.09, 0.02, mat(0x111111), sx * 0.05, 0, 0.12, headG);
    return { root, inner, petals };
  }
  function star() {
    const root = new THREE.Group();
    const inner = group(0, 0.4, 0, root);
    const g = geo('star', () => {
      const s = new THREE.Shape();
      for (let i = 0; i < 10; i++) {
        const r = i % 2 ? 0.18 : 0.42, a = Math.PI / 2 + i * Math.PI / 5;
        const x = Math.cos(a) * r, y = Math.sin(a) * r;
        if (i === 0) s.moveTo(x, y); else s.lineTo(x, y);
      }
      s.closePath();
      const eg = new THREE.ExtrudeGeometry(s, { depth: 0.14, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.04, bevelSegments: 2 });
      eg.translate(0, 0, -0.07);
      return eg;
    });
    const m = new THREE.MeshStandardMaterial({ color: 0xffd800, emissive: 0xffb000, emissiveIntensity: 0.6, roughness: 0.3 });
    inner.add(glow(0xfff080, 1.8, 0.6));
    mesh(g, m, 0, 0, 0, inner);
    for (const sx of [-1, 1]) bx(0.04, 0.1, 0.02, mat(0x111111), sx * 0.07, 0.03, 0.15, inner);
    return { root, inner, mat: m };
  }
  const coinMat = new THREE.MeshStandardMaterial({ color: 0xffc800, metalness: 0.75, roughness: 0.25, emissive: 0x805000, emissiveIntensity: 0.35 });
  function coin() {
    const root = new THREE.Group();
    const inner = group(0, 0.5, 0, root);
    mesh(geo('coin', () => new THREE.CylinderGeometry(0.3, 0.3, 0.08, 20).rotateX(Math.PI / 2)), coinMat, 0, 0, 0, inner);
    bx(0.07, 0.3, 0.1, mat(0xffe890, { metalness: 0.5, roughness: 0.3 }), 0, 0, 0, inner);
    return { root, inner };
  }
  let glowTex = null;
  function glow(color, size, opacity = 0.7) {
    if (!glowTex) {
      const c = document.createElement('canvas'); c.width = c.height = 64;
      const g = c.getContext('2d');
      const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
      glowTex = new THREE.CanvasTexture(c);
    }
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.scale.set(size, size, 1);
    return s;
  }
  function fireball() {
    const root = new THREE.Group();
    const gl = glow(0xff7020, 1.1, 0.8); gl.position.y = 0.18; root.add(gl);
    mesh(geo('fire', () => new THREE.IcosahedronGeometry(0.2, 0)), mat(0xff7010, { emissive: 0xff5000, emissiveIntensity: 1.2 }), 0, 0.18, 0, root);
    mesh(geo('fire2', () => new THREE.IcosahedronGeometry(0.12, 0)), mat(0xffee60, { emissive: 0xffe060, emissiveIntensity: 1.5 }), 0, 0.18, 0, root);
    return { root };
  }

  // ---------------- Scenery ----------------
  function pipe(h) {
    const root = new THREE.Group();
    const mG = mat(0x18a82c, { roughness: 0.3, metalness: 0.15 });
    const bodyH = h - 0.5;
    mesh(new THREE.CylinderGeometry(0.88, 0.88, bodyH + 0.3, 24), mG, 0, bodyH / 2 - 0.3 / 2, 0, root).receiveShadow = true;
    const lip = mesh(geo('pipeLip', () => new THREE.CylinderGeometry(1.0, 1.0, 0.55, 24)), mG, 0, h - 0.275, 0, root);
    lip.receiveShadow = true;
    mesh(geo('pipeHole', () => new THREE.CylinderGeometry(0.78, 0.78, 0.02, 24)), mat(0x041a08), 0, h + 0.001, 0, root);
    // highlight strip
    const hl = mesh(new THREE.BoxGeometry(0.12, bodyH, 0.05), mat(0x9cf0a0, { roughness: 0.2 }), -0.4, bodyH / 2, 0.78, root);
    hl.castShadow = false;
    mesh(geo('pipeLipHl', () => new THREE.BoxGeometry(0.14, 0.45, 0.05)), mat(0x9cf0a0, { roughness: 0.2 }), -0.45, h - 0.275, 0.9, root).castShadow = false;
    return root;
  }

  function flagpole(height) {
    const root = new THREE.Group();
    mesh(new THREE.CylinderGeometry(0.07, 0.07, height, 10), mat(0x70d060, { metalness: 0.3, roughness: 0.3 }), 0, height / 2, 0, root);
    mesh(new THREE.SphereGeometry(0.22, 14, 10), mat(0x20a030, { metalness: 0.3, roughness: 0.3 }), 0, height + 0.18, 0, root);
    const s = new THREE.Shape();
    s.moveTo(0, 0); s.lineTo(-1.3, -0.45); s.lineTo(0, -0.9); s.closePath();
    const flag = new THREE.Mesh(new THREE.ShapeGeometry(s), new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide, roughness: 0.8 }));
    flag.castShadow = true;
    const emblem = new THREE.Mesh(new THREE.CircleGeometry(0.17, 16), mat(0x20a030, { side: THREE.DoubleSide }));
    emblem.position.set(-0.45, -0.45, 0.01);
    flag.add(emblem);
    flag.position.set(-0.07, height - 0.1, 0);
    root.add(flag);
    return { root, flag };
  }

  // Armenian tricolor (red / blue / apricot) as a waving cloth
  function armenianFlag(w = 1.5, h = 0.95) {
    const c = document.createElement('canvas'); c.width = 96; c.height = 60;
    const g = c.getContext('2d');
    g.fillStyle = '#D90012'; g.fillRect(0, 0, 96, 20);
    g.fillStyle = '#0033A0'; g.fillRect(0, 20, 96, 20);
    g.fillStyle = '#F2A800'; g.fillRect(0, 40, 96, 20);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    const geom = new THREE.PlaneGeometry(w, h, 18, 6);
    geom.translate(w / 2, -h / 2, 0);
    const base = Float32Array.from(geom.attributes.position.array);
    const m = new THREE.Mesh(geom, new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.75 }));
    m.castShadow = true;
    m.userData.wave = t => {
      const pos = geom.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = base[i * 3], y = base[i * 3 + 1];
        const k = x / w;
        pos.setZ(i, Math.sin(x * 4.2 - t * 7 + y * 1.5) * 0.12 * k);
        pos.setY(i, y - k * k * 0.08 + Math.sin(x * 3 - t * 5) * 0.03 * k);
      }
      pos.needsUpdate = true;
      geom.computeVertexNormals();
    };
    return m;
  }

  // Castle sits BEHIND the play lane (front face at z = -0.9) so the player walks in through the door.
  function castle(m) {
    const root = new THREE.Group();
    const FZ = -0.9, D = 1.6, CZ = FZ - D / 2;
    const bb = (w, h, d, x, y, z, mm = m) => { const me = bx(w, h, d, mm, x, y, z, root); me.receiveShadow = true; return me; };
    const stone = mat(0xd8c8b0, { roughness: 0.8 }), dark = mat(0x030303, { roughness: 1 });
    const roof = mat(0xc82818, { roughness: 0.5 }), gold = mat(0xffcc30, { metalness: 0.8, roughness: 0.25 });
    // keep
    bb(5, 3.2, D, 0, 1.6, CZ);
    bb(5.2, 0.18, D + 0.2, 0, 3.25, CZ, stone);
    for (let i = 0; i < 6; i++) { bb(0.5, 0.55, 0.35, -2.25 + i * 0.9, 3.6, FZ - 0.18); bb(0.5, 0.55, 0.35, -2.25 + i * 0.9, 3.6, FZ - D + 0.18); }
    // plinth
    bb(5.3, 0.3, D + 0.3, 0, 0.15, CZ, stone);
    // door: black recess the player disappears into
    const door = bx(1.2, 1.75, 1.2, dark, 0, 0.875, FZ - 0.58, root); door.castShadow = false;
    const archG = geo('castleArch', () => new THREE.CylinderGeometry(0.6, 0.6, 1.2, 20, 1, false, -Math.PI / 2, Math.PI).rotateX(Math.PI / 2));
    const arch = mesh(archG, dark, 0, 1.75, FZ - 0.58, root); arch.castShadow = false;
    const frameG = geo('castleFrame', () => new THREE.TorusGeometry(0.68, 0.1, 8, 20, Math.PI));
    mesh(frameG, stone, 0, 1.75, FZ + 0.03, root);
    for (const sx of [-1, 1]) bb(0.2, 1.75, 0.2, sx * 0.68, 0.875, FZ + 0.03, stone);
    bb(0.24, 0.24, 0.1, 0, 2.5, FZ + 0.06, stone);
    // portcullis teeth peeking from the top of the doorway
    for (let i = -2; i <= 2; i++) { const t = mesh(geo('pcTooth', () => new THREE.ConeGeometry(0.05, 0.25, 4)), mat(0x3a3a40, { metalness: 0.6 }), i * 0.22, 2.08, FZ + 0.01, root); t.rotation.x = Math.PI; }
    // corner turrets with conical roofs and pennants
    const pennants = [];
    for (const sx of [-1, 1]) {
      const t = mesh(geo('turret', () => new THREE.CylinderGeometry(0.6, 0.65, 4.2, 16)), m, sx * 2.55, 2.1, CZ, root); t.receiveShadow = true;
      mesh(geo('turretRing', () => new THREE.CylinderGeometry(0.72, 0.72, 0.16, 16)), stone, sx * 2.55, 4.25, CZ, root);
      mesh(geo('turretRoof', () => new THREE.ConeGeometry(0.8, 1.5, 16)), roof, sx * 2.55, 5.08, CZ, root);
      mesh(geo('turretBall', () => new THREE.SphereGeometry(0.08, 8, 6)), gold, sx * 2.55, 5.88, CZ, root);
      const win = bx(0.22, 0.45, 0.05, mat(0xffc860, { emissive: 0xffa030, emissiveIntensity: 0.9 }), sx * 2.55, 2.9, CZ + 0.62, root); win.castShadow = false;
      const pg = group(sx * 2.55, 5.9, CZ, root);
      mesh(geo('pennPole', () => new THREE.CylinderGeometry(0.02, 0.02, 0.6, 5)), mat(0x888888), 0, 0.3, 0, pg);
      const pen = mesh(geo('pennant', () => { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(0.5, -0.12); sh.lineTo(0, -0.24); sh.closePath(); return new THREE.ShapeGeometry(sh); }), mat(0xffd000, { side: THREE.DoubleSide }), 0.02, 0.58, 0, pg);
      pennants.push(pen);
    }
    // central tower
    const TZ = CZ - 0.1;
    bb(2.6, 2.4, 1.3, 0, 4.45, TZ);
    bb(2.8, 0.16, 1.5, 0, 5.72, TZ, stone);
    for (let i = 0; i < 4; i++) bb(0.42, 0.5, 0.3, -1.05 + i * 0.7, 6.05, TZ + 0.5);
    for (let i = 0; i < 4; i++) bb(0.42, 0.5, 0.3, -1.05 + i * 0.7, 6.05, TZ - 0.5);
    const winMat = mat(0xffc860, { emissive: 0xffa030, emissiveIntensity: 0.9 });
    for (const sx of [-1, 1]) {
      const w = bx(0.36, 0.7, 0.05, winMat, sx * 0.62, 4.5, TZ + 0.66, root); w.castShadow = false;
      const wa = mesh(geo('winArch', () => new THREE.CircleGeometry(0.18, 12, 0, Math.PI)), winMat, sx * 0.62, 4.85, TZ + 0.69, root); wa.castShadow = false;
      bx(0.03, 0.7, 0.03, mat(0x302018), sx * 0.62, 4.5, TZ + 0.69, root).castShadow = false;
    }
    // banners on the keep
    for (const sx of [-1, 1]) {
      const b = bx(0.55, 1.2, 0.03, mat(0xb01818, { roughness: 0.9 }), sx * 1.55, 2.25, FZ + 0.02, root);
      const tip = mesh(geo('bannerTip', () => new THREE.ConeGeometry(0.28, 0.3, 3).rotateZ(Math.PI)), mat(0xb01818), sx * 1.55, 1.52, FZ + 0.02, root); tip.scale.z = 0.1;
      const em = mesh(geo('bannerEm', () => new THREE.CircleGeometry(0.15, 12)), gold, sx * 1.55, 2.4, FZ + 0.045, root); em.castShadow = false;
      bx(0.7, 0.05, 0.05, gold, sx * 1.55, 2.86, FZ + 0.04, root);
    }
    // wall torches beside the door
    const flames = [];
    for (const sx of [-1, 1]) {
      bx(0.1, 0.3, 0.14, mat(0x3a2a1a), sx * 0.98, 1.55, FZ + 0.08, root);
      const f = mesh(geo('torchFlame', () => new THREE.ConeGeometry(0.1, 0.32, 8)), mat(0xffa030, { emissive: 0xff7010, emissiveIntensity: 2.2 }), sx * 0.98, 1.85, FZ + 0.12, root);
      f.castShadow = false; flames.push(f);
    }
    // flagpole atop the tower + Armenian flag (raised after the level is cleared)
    const poleBase = 6.3, poleH = 2.6;
    mesh(geo('cPole', () => new THREE.CylinderGeometry(0.035, 0.045, 2.6, 8)), mat(0xe0e0e8, { metalness: 0.7, roughness: 0.3 }), 0, poleBase + poleH / 2, TZ, root);
    mesh(geo('cPoleBall', () => new THREE.SphereGeometry(0.09, 10, 8)), gold, 0, poleBase + poleH + 0.07, TZ, root);
    const flag = armenianFlag(1.5, 0.95);
    flag.position.set(0.04, poleBase + 0.9, TZ);
    root.add(flag);
    return {
      root, flag, flagLow: poleBase + 0.95, flagHigh: poleBase + poleH - 0.06,
      animate(t) {
        flames.forEach((f, i) => { f.scale.set(1, 0.85 + Math.abs(Math.sin(t * 13 + i * 2)) * 0.35, 1); });
        pennants.forEach((p, i) => { p.rotation.y = Math.sin(t * 3 + i) * 0.4; });
        if (flag.visible) flag.userData.wave(t);
      },
    };
  }

  function cloud(mCloud) {
    const root = new THREE.Group();
    const g = geo('cloudS', () => new THREE.SphereGeometry(1, 14, 10));
    const n = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) {
      const s = mesh(g, mCloud, (i - (n - 1) / 2) * 1.1, Math.sin(i / (n - 1) * Math.PI) * 0.5, (Math.random() - 0.5) * 0.4, root);
      const r = 0.8 + Math.sin(i / (n - 1) * Math.PI) * 0.5;
      s.scale.set(r, r * 0.8, r * 0.7);
      s.castShadow = false;
    }
    return root;
  }
  function bush(mB, size = 1) {
    const root = new THREE.Group();
    const g = geo('bushS', () => new THREE.SphereGeometry(0.6, 14, 10));
    const n = 2 + size;
    for (let i = 0; i < n; i++) {
      const s = mesh(g, mB, (i - (n - 1) / 2) * 0.75, 0.25 + Math.sin(i / Math.max(1, n - 1) * Math.PI) * 0.25, 0, root);
      s.scale.set(1, 0.85, 0.8);
    }
    return root;
  }
  function hill(mH, h) {
    const root = new THREE.Group();
    const s = mesh(geo('hill', () => new THREE.SphereGeometry(1, 28, 18, 0, Math.PI * 2, 0, Math.PI / 2)), mH, 0, 0, 0, root);
    s.scale.set(h * 1.5, h, h * 0.9);
    s.receiveShadow = true;
    const dm = mat(0x1a6a24);
    for (const [dx, dy] of [[-0.3, 0.55], [0.25, 0.45], [0, 0.75]]) {
      const d = mesh(geo('hillDot', () => new THREE.SphereGeometry(0.12, 8, 6)), dm, dx * h, dy * h, h * 0.9 * Math.cos(Math.asin(Math.min(0.99, dy))) * 0.95, root);
      d.scale.set(1, 1.8, 0.5);
    }
    return root;
  }
  function tree(h) {
    const root = new THREE.Group();
    mesh(geo('trunk', () => new THREE.CylinderGeometry(0.15, 0.2, 1, 8)), mat(0x8a5a2c), 0, 0.5, 0, root).scale.y = h * 0.5;
    const c = mesh(geo('crown', () => new THREE.SphereGeometry(0.8, 12, 10)), mat(0x2f9a40), 0, h * 0.5 + 0.5, 0, root);
    c.scale.set(1, 1.3, 1);
    return root;
  }

  return { boxGeo, mat, bx, mesh, group, geo, glow, armenianFlag, player, goomba, koopa, mushroom, flower, star, coin, fireball, pipe, flagpole, castle, cloud, bush, hill, tree };
})();
