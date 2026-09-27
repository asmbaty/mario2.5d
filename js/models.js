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
  function player() {
    const root = new THREE.Group();
    const body = group(0, 0, 0, root);        // rotated to face direction
    const inner = group(0, 0, 0, body);       // scaled for small/big
    const mShirt = new THREE.MeshStandardMaterial({ color: 0xd82800, roughness: 0.55 });
    const mOver = new THREE.MeshStandardMaterial({ color: 0x2038ec, roughness: 0.55 });
    const mSkin = mat(0xffc090), mShoe = mat(0x6b3a10), mHair = mat(0x3a1c06), mBlack = mat(0x111111);
    const mWhite = mat(0xffffff), mButton = mat(0xffd700, { metalness: 0.6, roughness: 0.3 });

    const legs = [];
    for (const sx of [-1, 1]) {
      const leg = group(sx * 0.13, 0.42, 0, inner);
      bx(0.2, 0.34, 0.22, mOver, 0, -0.17, 0, leg);
      bx(0.24, 0.13, 0.36, mShoe, 0, -0.355, 0.05, leg);
      legs.push(leg);
    }
    bx(0.5, 0.24, 0.34, mOver, 0, 0.53, 0, inner);
    bx(0.48, 0.2, 0.32, mShirt, 0, 0.74, 0, inner);
    for (const sx of [-1, 1]) {
      bx(0.08, 0.2, 0.02, mOver, sx * 0.14, 0.74, 0.165, inner);
      bx(0.07, 0.07, 0.03, mButton, sx * 0.14, 0.66, 0.18, inner);
    }
    const arms = [];
    for (const sx of [-1, 1]) {
      const arm = group(sx * 0.31, 0.82, 0, inner);
      bx(0.14, 0.3, 0.16, mShirt, 0, -0.13, 0, arm);
      bx(0.17, 0.13, 0.19, mWhite, 0, -0.32, 0, arm);
      arms.push(arm);
    }
    const head = group(0, 0.84, 0, inner);
    bx(0.44, 0.38, 0.4, mSkin, 0, 0.19, 0, head);
    bx(0.13, 0.11, 0.12, mSkin, 0, 0.16, 0.25, head);
    bx(0.32, 0.06, 0.05, mHair, 0, 0.085, 0.215, head);
    for (const sx of [-1, 1]) {
      bx(0.07, 0.11, 0.02, mBlack, sx * 0.09, 0.27, 0.205, head);
      bx(0.03, 0.18, 0.2, mHair, sx * 0.225, 0.2, -0.05, head);
    }
    bx(0.46, 0.2, 0.1, mHair, 0, 0.18, -0.18, head);
    bx(0.48, 0.15, 0.44, mShirt, 0, 0.42, 0, head);
    bx(0.46, 0.05, 0.22, mShirt, 0, 0.36, 0.27, head);
    bx(0.12, 0.1, 0.02, mWhite, 0, 0.43, 0.225, head);

    const palettes = {
      normal: [0xd82800, 0x2038ec],
      fire: [0xffffff, 0xd82800],
    };
    function setPalette(name) {
      const p = palettes[name];
      mShirt.color.setHex(p[0]); mOver.color.setHex(p[1]);
    }
    function setColors(a, b) { mShirt.color.setHex(a); mOver.color.setHex(b); }
    return { root, body, inner, legs, arms, head, setPalette, setColors };
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
  function fireball() {
    const root = new THREE.Group();
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

  function castle(m) {
    const root = new THREE.Group();
    const bb = (w, h, d, x, y, z, mm = m) => { const me = bx(w, h, d, mm, x, y, z, root); me.receiveShadow = true; return me; };
    bb(5, 3, 3, 0, 1.5, -0.5);
    for (let i = 0; i < 5; i++) bb(0.7, 0.6, 3, -2.15 + i * 1.075, 3.3, -0.5);
    bb(3, 2, 2.2, 0, 4, -0.8);
    for (let i = 0; i < 3; i++) bb(0.65, 0.5, 2.2, -1.175 + i * 1.175, 5.25, -0.8);
    const dark = mat(0x050505);
    bx(1.1, 1.8, 0.1, dark, 0, 0.9, 1.0, root);
    const arch = mesh(geo('arch', () => new THREE.CylinderGeometry(0.55, 0.55, 0.1, 16, 1, false, 0, Math.PI).rotateX(Math.PI / 2).rotateZ(Math.PI / 2)), dark, 0, 1.8, 1.0, root);
    arch.castShadow = false;
    bx(0.5, 0.8, 0.1, dark, -0.7, 4.2, 0.35, root);
    bx(0.5, 0.8, 0.1, dark, 0.7, 4.2, 0.35, root);
    // flag on top (raised after clear)
    const fl = group(0, 5.5, -0.8, root);
    mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 6), mat(0xcccccc), 0, 0.7, 0, fl);
    const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(0.8, -0.25); s.lineTo(0, -0.5); s.closePath();
    const f = new THREE.Mesh(new THREE.ShapeGeometry(s), mat(0xd82800, { side: THREE.DoubleSide }));
    f.position.set(0.04, 0.4, 0);
    fl.add(f);
    return { root, flag: f };
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

  return { boxGeo, mat, bx, mesh, group, geo, player, goomba, koopa, mushroom, flower, star, coin, fireball, pipe, flagpole, castle, cloud, bush, hill, tree };
})();
