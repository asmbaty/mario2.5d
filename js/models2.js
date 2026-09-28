'use strict';
// Additional models: new enemies, boss, props and themed scenery.
Object.assign(MODELS, (() => {
  const { boxGeo, mat, bx, mesh, group, geo } = MODELS;
  const sph = (k, r, ws = 14, hs = 10) => geo('s_' + k, () => new THREE.SphereGeometry(r, ws, hs));
  const cone = (k, r, h, s = 8) => geo('c_' + k, () => new THREE.ConeGeometry(r, h, s));
  const cyl = (k, r1, r2, h, s = 12) => geo('y_' + k, () => new THREE.CylinderGeometry(r1, r2, h, s));

  // ---------------- enemies ----------------
  function spiny() {
    const root = new THREE.Group();
    const inner = group(0, 0, 0, root);
    const dome = mesh(geo('spShell', () => new THREE.SphereGeometry(0.42, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2)), mat(0xd82010, { roughness: 0.35 }), 0, 0.28, 0, inner);
    dome.scale.y = 1.1;
    mesh(cyl('spRim', 0.44, 0.4, 0.1, 16), mat(0xfff0d0), 0, 0.26, 0, inner);
    const mS = mat(0xffffff, { roughness: 0.3 });
    for (let i = 0; i < 7; i++) {
      const a = i / 7 * Math.PI * 2, e = i === 0 ? Math.PI / 2 : 0.6;
      const s = mesh(cone('spike', 0.08, 0.3, 6), mS, 0, 0, 0, inner);
      const dir = i === 0 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(Math.cos(a) * Math.cos(e), Math.sin(e), Math.sin(a) * Math.cos(e));
      s.position.copy(dir.clone().multiplyScalar(0.44)).add(new THREE.Vector3(0, 0.28, 0));
      s.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    }
    const mF = mat(0xf8a020);
    mesh(sph('spHead', 0.17), mF, 0.34, 0.22, 0, inner);
    const feet = [];
    for (const [fx, fz] of [[0.2, 0.2], [-0.2, 0.2], [0.2, -0.2], [-0.2, -0.2]]) feet.push(bx(0.16, 0.1, 0.14, mF, fx, 0.05, fz, inner));
    bx(0.05, 0.08, 0.03, mat(0x111111), 0.46, 0.26, 0.07, inner);
    return { root, inner, feet };
  }

  function boo() {
    const root = new THREE.Group();
    const inner = group(0, 0.45, 0, root);
    const m = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xc8d0ff, emissiveIntensity: 0.25, roughness: 0.6, transparent: true, opacity: 0.92 });
    mesh(sph('boo', 0.46, 20, 14), m, 0, 0, 0, inner);
    const tail = mesh(cone('booTail', 0.18, 0.35, 10), m, -0.38, -0.2, -0.1, inner);
    tail.rotation.z = 2.2;
    const mK = mat(0x111111), mR = mat(0xb01020), mT = mat(0xff6070);
    const eyes = group(0, 0, 0, inner);
    for (const sx of [-1, 1]) { const e = bx(0.08, 0.16, 0.04, mK, sx * 0.13, 0.1, 0.43, eyes); e.rotation.z = sx * 0.2; }
    bx(0.3, 0.14, 0.05, mR, 0, -0.1, 0.43, inner);
    bx(0.12, 0.08, 0.06, mT, 0.04, -0.14, 0.45, inner);
    for (const sx of [-1, 1]) { bx(0.04, 0.05, 0.04, mat(0xffffff), sx * 0.08, -0.05, 0.46, inner); }
    const arms = [];
    for (const sx of [-1, 1]) {
      const a = mesh(sph('booArm', 0.13, 10, 8), m, sx * 0.44, -0.02, 0.1, inner);
      a.scale.set(1, 0.7, 0.8);
      arms.push(a);
    }
    const bg = MODELS.glow(0xc0d0ff, 1.8, 0.3); inner.add(bg);
    return { root, inner, arms, mat: m, eyes };
  }

  function fish(green) {
    const root = new THREE.Group();
    const inner = group(0, 0.4, 0, root);
    const mB = mat(green ? 0x30b040 : 0xe03020, { roughness: 0.3 });
    const b = mesh(sph('fishBody', 0.42, 16, 12), mB, 0, 0, 0, inner);
    b.scale.set(1, 0.85, 0.6);
    const finMat = mat(0xfff4e8, { roughness: 0.4, transparent: true, opacity: 0.92 });
    const finGeo = geo('fishFinS', () => new THREE.SphereGeometry(0.2, 10, 8));
    const tail = group(-0.42, 0, 0, inner);
    for (const sy of [-1, 1]) { const tf = mesh(finGeo, finMat, -0.12, sy * 0.1, 0, tail); tf.scale.set(1.1, 0.55, 0.15); tf.rotation.z = sy * 0.6; }
    const fin = mesh(finGeo, finMat, -0.05, 0.36, 0, inner); fin.scale.set(1.1, 0.6, 0.12); fin.rotation.z = 0.4;
    for (const sz of [-1, 1]) {
      const eyeW = mesh(sph('fishEyeW', 0.1, 10, 8), mat(0xffffff), 0.22, 0.1, sz * 0.2, inner); eyeW.scale.set(1, 1.2, 0.6);
      mesh(sph('fishEyeP', 0.05, 8, 6), mat(0x111111), 0.27, 0.1, sz * 0.25, inner);
      const sf = mesh(finGeo, finMat, -0.02, -0.12, sz * 0.24, inner); sf.scale.set(0.8, 0.45, 0.12); sf.rotation.set(sz * 0.5, 0, -0.6);
    }
    bx(0.08, 0.12, 0.2, mat(0xffe0a0), 0.42, -0.05, 0, inner);
    return { root, inner, tail };
  }

  function bullet() {
    const root = new THREE.Group();
    const inner = group(0, 0.42, 0, root);
    const mK = mat(0x181818, { roughness: 0.35, metalness: 0.3 });
    mesh(geo('bulBody', () => new THREE.CylinderGeometry(0.4, 0.4, 0.6, 18).rotateZ(Math.PI / 2)), mK, -0.05, 0, 0, inner);
    mesh(geo('bulNose', () => new THREE.SphereGeometry(0.4, 18, 12, 0, Math.PI).rotateY(-Math.PI / 2)), mK, 0.25, 0, 0, inner);
    mesh(geo('bulBack', () => new THREE.CylinderGeometry(0.44, 0.44, 0.12, 18).rotateZ(Math.PI / 2)), mat(0x303030), -0.38, 0, 0, inner);
    const mW = mat(0xffffff);
    for (const sz of [-1, 1]) {
      bx(0.14, 0.2, 0.03, mW, 0.28, 0.1, sz * 0.3, inner);
      bx(0.07, 0.12, 0.02, mat(0x111111), 0.32, 0.08, sz * 0.32, inner);
      const brow = bx(0.18, 0.04, 0.03, mK, 0.28, 0.23, sz * 0.31, inner);
      brow.rotation.x = 0; brow.rotation.z = -0.3;
      const arm = mesh(sph('bulArm', 0.1, 8, 6), mW, -0.1, -0.2, sz * 0.4, inner);
      arm.scale.set(1.4, 0.7, 0.7);
    }
    return { root, inner };
  }

  function piranha() {
    const root = new THREE.Group();
    const inner = group(0, 0, 0, root);
    const mG = mat(0x28a838);
    mesh(cyl('pStem', 0.07, 0.09, 0.75, 8), mG, 0, 0.37, 0, inner);
    for (const sx of [-1, 1]) {
      const leaf = mesh(sph('pLeaf', 0.18, 10, 6), mG, sx * 0.2, 0.25, 0, inner);
      leaf.scale.set(1.4, 0.35, 0.8);
      leaf.rotation.z = sx * 0.4;
    }
    const head = group(0, 0.95, 0, inner);
    const mR = mat(0xe02818, { roughness: 0.35 }), mW = mat(0xffffff);
    const top = group(0, 0, 0, head), bot = group(0, 0, 0, head);
    const hemi = geo('pHemi', () => new THREE.SphereGeometry(0.36, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2));
    mesh(hemi, mR, 0, 0, 0, top);
    const b = mesh(hemi, mR, 0, 0, 0, bot); b.rotation.x = Math.PI;
    for (const [a, e] of [[0.8, 0.9], [2.4, 0.7], [4.0, 0.9], [5.4, 0.6], [1.6, 0.3]]) {
      const s = mesh(sph('pSpot', 0.07, 8, 6), mW, Math.cos(a) * Math.cos(e) * 0.35, Math.sin(e) * 0.35, Math.sin(a) * Math.cos(e) * 0.35, top);
      s.scale.set(1, 0.5, 1);
    }
    mesh(cyl('pLip', 0.37, 0.37, 0.05, 16), mW, 0, 0.02, 0, top);
    mesh(cyl('pLip', 0.37, 0.37, 0.05, 16), mW, 0, -0.02, 0, bot);
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * Math.PI * 2;
      const t = mesh(cone('pTooth', 0.04, 0.1, 4), mW, Math.cos(a) * 0.28, -0.05, Math.sin(a) * 0.28, top);
      t.rotation.x = Math.PI;
    }
    head.rotation.x = 0.5;
    return { root, inner, top, bot, head };
  }

  function podoboo() {
    const root = new THREE.Group();
    const inner = group(0, 0.4, 0, root);
    mesh(sph('podo', 0.38, 14, 10), mat(0xff5010, { emissive: 0xff3000, emissiveIntensity: 1.4 }), 0, 0, 0, inner);
    inner.add(MODELS.glow(0xff5010, 2.2, 0.7));
    mesh(sph('podoIn', 0.26, 12, 8), mat(0xffd040, { emissive: 0xffc020, emissiveIntensity: 1.6 }), 0, 0.05, 0.14, inner);
    for (const sx of [-1, 1]) bx(0.06, 0.12, 0.03, mat(0x111111), sx * 0.1, 0.08, 0.37, inner);
    return { root, inner };
  }

  function flame() {
    const root = new THREE.Group();
    const inner = group(0, 0.25, 0, root);
    const c = mesh(cone('flame', 0.26, 1.3, 10), mat(0xff5010, { emissive: 0xff3000, emissiveIntensity: 1.6, transparent: true, opacity: 0.9 }), -0.4, 0, 0, inner);
    c.rotation.z = Math.PI / 2;
    const c2 = mesh(cone('flame2', 0.16, 0.9, 10), mat(0xffe060, { emissive: 0xffd040, emissiveIntensity: 2 }), -0.25, 0, 0.05, inner);
    c2.rotation.z = Math.PI / 2;
    mesh(sph('flameHead', 0.26, 12, 8), mat(0xffa020, { emissive: 0xff8000, emissiveIntensity: 1.8 }), 0.25, 0, 0, inner);
    c.castShadow = c2.castShadow = false;
    const gl = MODELS.glow(0xff6010, 2.4, 0.7); gl.position.x = -0.2; inner.add(gl);
    return { root, inner };
  }

  function bowser() {
    const root = new THREE.Group();
    const inner = group(0, 0, 0, root);
    const mY = mat(0xe8c040, { roughness: 0.5 }), mG = mat(0x2a8a2a, { roughness: 0.35 }), mC = mat(0xfff0c8);
    const mS = mat(0x6a8a20), mR = mat(0xe04010), mK = mat(0x111111), mW = mat(0xffffff);
    // legs
    const legs = [];
    for (const sz of [-1, 1]) {
      const l = group(0, 0.55, sz * 0.4, inner);
      mesh(cyl('bLeg', 0.24, 0.28, 0.55, 10), mY, 0, -0.27, 0, l);
      bx(0.55, 0.2, 0.4, mY, 0.1, -0.5, 0, l);
      for (let i = 0; i < 3; i++) { const cl = mesh(cone('bClaw', 0.05, 0.14, 5), mW, 0.38, -0.52, (i - 1) * 0.12, l); cl.rotation.z = -Math.PI / 2; }
      legs.push(l);
    }
    // body + belly
    const belly = mesh(sph('bBody', 0.7, 18, 14), mY, 0.15, 1.05, 0, inner);
    belly.scale.set(0.9, 1, 1);
    for (let i = 0; i < 4; i++) bx(0.05, 0.02, 0.6, mat(0xc89830), 0.73, 0.75 + i * 0.18, 0, inner).rotation.z = -0.2;
    // shell
    const shell = mesh(sph('bShell', 0.75, 18, 14), mG, -0.35, 1.15, 0, inner);
    shell.scale.set(0.8, 1, 1.05);
    mesh(geo('bRim', () => new THREE.TorusGeometry(0.72, 0.08, 8, 24)), mC, -0.3, 1.15, 0, inner).rotation.y = Math.PI / 2;
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      const dir = new THREE.Vector3(-0.8, Math.cos(a) * 0.9, Math.sin(a)).normalize();
      if (dir.y < -0.5) continue;
      const s = mesh(cone('bSpike', 0.1, 0.32, 6), mC, 0, 0, 0, inner);
      s.position.set(-0.35 + dir.x * 0.62, 1.15 + dir.y * 0.72, dir.z * 0.78);
      s.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    }
    // arms
    const arms = [];
    for (const sz of [-1, 1]) {
      const a = group(0.35, 1.35, sz * 0.62, inner);
      const up = mesh(sph('bArm', 0.2, 10, 8), mY, 0.12, -0.15, 0, a); up.scale.set(1.3, 0.9, 0.9);
      for (let i = 0; i < 3; i++) { const cl = mesh(cone('bClaw', 0.05, 0.14, 5), mW, 0.38, -0.2, (i - 1) * 0.08, a); cl.rotation.z = -Math.PI / 2; }
      mesh(geo('bBand', () => new THREE.TorusGeometry(0.16, 0.05, 6, 12)), mK, -0.02, 0, 0, a).rotation.y = Math.PI / 2;
      arms.push(a);
    }
    // head
    const head = group(0.55, 1.85, 0, inner);
    mesh(sph('bHead', 0.42, 16, 12), mY, 0, 0, 0, head).scale.set(1, 0.9, 0.95);
    const snout = mesh(sph('bSnout', 0.3, 14, 10), mY, 0.35, -0.12, 0, head); snout.scale.set(1.1, 0.8, 1);
    for (const sz of [-1, 1]) {
      mesh(sph('bNost', 0.05, 6, 4), mK, 0.66, -0.02, sz * 0.1, head);
      const horn = mesh(cone('bHorn', 0.1, 0.45, 8), mC, -0.05, 0.35, sz * 0.25, head);
      horn.rotation.x = sz * 0.5; horn.rotation.z = 0.3;
      const eye = mesh(sph('bEye', 0.09, 8, 6), mW, 0.3, 0.18, sz * 0.2, head);
      mesh(sph('bPupil', 0.045, 6, 4), mK, 0.36, 0.18, sz * 0.22, head);
      const brow = bx(0.24, 0.07, 0.1, mR, 0.25, 0.3, sz * 0.2, head);
      brow.rotation.x = sz * -0.3; brow.rotation.z = -0.3;
      mesh(cone('bFang', 0.04, 0.12, 4), mW, 0.55, -0.35, sz * 0.14, head).rotation.x = Math.PI;
    }
    // hair
    for (let i = 0; i < 5; i++) {
      const h = mesh(cone('bHair', 0.12, 0.45, 6), mR, -0.2 - i * 0.08, 0.2 + Math.sin(i) * 0.05, (i - 2) * 0.14, head);
      h.rotation.z = 1.9 + (i % 2) * 0.2;
    }
    const jaw = group(0.2, -0.28, 0, head);
    const jm = mesh(sph('bJaw', 0.28, 12, 8), mY, 0.2, 0, 0, jaw); jm.scale.set(1.2, 0.5, 0.9);
    bx(0.3, 0.06, 0.4, mat(0x901010), 0.3, 0.1, 0, jaw);
    return { root, inner, legs, arms, head, jaw, shellMat: mG };
  }

  function axe() {
    const root = new THREE.Group();
    const inner = group(0, 0, 0, root);
    mesh(cyl('axeHandle', 0.06, 0.06, 1.3, 8), mat(0x8a5a2c), 0, 0.65, 0, inner);
    const bl = mesh(geo('axeBlade', () => {
      const s = new THREE.Shape();
      s.moveTo(0, -0.3); s.quadraticCurveTo(0.6, -0.4, 0.55, 0); s.quadraticCurveTo(0.6, 0.4, 0, 0.3); s.closePath();
      return new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 1 });
    }), mat(0xd8dde8, { metalness: 0.8, roughness: 0.25, emissive: 0x404858, emissiveIntensity: 0.4 }), 0.05, 1.05, -0.03, inner);
    return { root, inner, blade: bl };
  }

  function princess() {
    const root = new THREE.Group();
    const inner = group(0, 0, 0, root);
    const mP = mat(0xff8cc8, { roughness: 0.45 }), mD = mat(0xe860a8), mSkin = mat(0xffd0a8), mHair = mat(0xffd84a, { roughness: 0.4 });
    mesh(cone('dress', 0.55, 1.1, 16), mP, 0, 0.55, 0, inner);
    mesh(cyl('dressHem', 0.56, 0.56, 0.08, 16), mD, 0, 0.05, 0, inner);
    mesh(cyl('torso', 0.18, 0.24, 0.45, 12), mP, 0, 1.25, 0, inner);
    mesh(sph('puff', 0.13, 10, 8), mD, 0.24, 1.38, 0, inner); mesh(sph('puff', 0.13, 10, 8), mD, -0.24, 1.38, 0, inner);
    const brooch = mesh(sph('gem', 0.06, 8, 6), mat(0x40a0ff, { emissive: 0x2060ff, emissiveIntensity: 0.6 }), 0, 1.3, 0.2, inner);
    brooch.castShadow = false;
    const head = group(0, 1.72, 0, inner);
    mesh(sph('phead', 0.26, 14, 12), mSkin, 0, 0, 0, head);
    const hair = mesh(sph('phair', 0.3, 14, 12), mHair, 0, 0.05, -0.08, head); hair.scale.set(1, 1, 0.9);
    const hairB = mesh(sph('phair2', 0.26, 12, 10), mHair, 0, -0.3, -0.18, head); hairB.scale.set(1.1, 1.5, 0.7);
    for (const sx of [-1, 1]) bx(0.05, 0.08, 0.02, mat(0x2050c0), sx * 0.09, 0.02, 0.25, head);
    bx(0.08, 0.03, 0.02, mat(0xe04060), 0, -0.1, 0.25, head);
    const crown = mesh(cyl('crown', 0.13, 0.12, 0.12, 10), mat(0xffd000, { metalness: 0.8, roughness: 0.2 }), 0, 0.33, 0, head);
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; mesh(cone('crownPt', 0.03, 0.08, 4), mat(0xffd000, { metalness: 0.8, roughness: 0.2 }), Math.cos(a) * 0.12, 0.42, Math.sin(a) * 0.12, head); }
    const arms = [];
    for (const sx of [-1, 1]) { const a = group(sx * 0.24, 1.38, 0, inner); bx(0.1, 0.35, 0.1, mSkin, 0, -0.18, 0.05, a); arms.push(a); }
    return { root, inner, arms };
  }

  function cannon(isTop) {
    const root = new THREE.Group();
    const mK = mat(0x202024, { roughness: 0.4, metalness: 0.4 });
    if (isTop) {
      bx(0.94, 0.94, 0.94, mK, 0, 0.5, 0, root).receiveShadow = true;
      mesh(geo('barrel', () => new THREE.CylinderGeometry(0.36, 0.36, 1.12, 16).rotateZ(Math.PI / 2)), mat(0x101012, { metalness: 0.5, roughness: 0.3 }), 0, 0.55, 0, root);
      for (const sx of [-1, 1]) mesh(geo('muzzle', () => new THREE.CylinderGeometry(0.28, 0.28, 0.02, 16).rotateZ(Math.PI / 2)), mat(0x000000), sx * 0.565, 0.55, 0, root);
      const skull = group(0, 0.5, 0.48, root);
      mesh(sph('skull', 0.16, 10, 8), mat(0xffffff), 0, 0.03, 0, skull).scale.z = 0.4;
      for (const sx of [-1, 1]) bx(0.05, 0.05, 0.02, mK, sx * 0.06, 0.05, 0.07, skull);
      const b1 = bx(0.36, 0.05, 0.02, mat(0xffffff), 0, -0.14, 0, skull); b1.rotation.z = 0.6;
      const b2 = bx(0.36, 0.05, 0.02, mat(0xffffff), 0, -0.14, 0, skull); b2.rotation.z = -0.6;
    } else {
      bx(0.7, 1, 0.7, mK, 0, 0.5, 0, root).receiveShadow = true;
      bx(0.85, 0.12, 0.85, mat(0x383840, { metalness: 0.4 }), 0, 0.94, 0, root);
    }
    return root;
  }

  function bridgePlank() {
    const root = new THREE.Group();
    const m = mat(0x8a4a1c, { roughness: 0.9 });
    bx(0.96, 0.3, 1.6, m, 0, 0.85, 0, root).receiveShadow = true;
    bx(1, 0.08, 0.08, mat(0x9aa0a8, { metalness: 0.7, roughness: 0.3 }), 0, 0.72, 0.78, root);
    bx(1, 0.08, 0.08, mat(0x9aa0a8, { metalness: 0.7, roughness: 0.3 }), 0, 0.72, -0.78, root);
    return root;
  }

  // ---------------- scenery ----------------
  function pine(h, snowy) {
    const root = new THREE.Group();
    mesh(cyl('pineTrunk', 0.12, 0.18, 1, 6), mat(0x6a4020), 0, 0.5, 0, root).scale.y = h * 0.3;
    const mG = mat(0x1e6a3a), mS = mat(0xf4f8ff, { roughness: 0.9 });
    for (let i = 0; i < 3; i++) {
      const r = (1 - i * 0.25) * h * 0.28, ch = h * 0.38, y = h * 0.25 + i * h * 0.22;
      const c = mesh(cone('pine', 1, 1, 9), mG, 0, y + ch / 2, 0, root); c.scale.set(r, ch, r);
      if (snowy) { const s = mesh(cone('pine', 1, 1, 9), mS, 0, y + ch * 0.78, 0, root); s.scale.set(r * 0.45, ch * 0.45, r * 0.45); }
    }
    return root;
  }
  function snowman() {
    const root = new THREE.Group();
    const m = mat(0xf8fbff, { roughness: 0.9 });
    mesh(sph('sm1', 0.5), m, 0, 0.45, 0, root);
    mesh(sph('sm2', 0.36), m, 0, 1.1, 0, root);
    mesh(sph('sm3', 0.26), m, 0, 1.6, 0, root);
    const n = mesh(cone('carrot', 0.05, 0.3, 6), mat(0xff7a10), 0, 1.6, 0.35, root); n.rotation.x = Math.PI / 2;
    for (const sx of [-1, 1]) mesh(sph('smEye', 0.04, 6, 4), mat(0x111111), sx * 0.09, 1.68, 0.23, root);
    mesh(cyl('hat', 0.18, 0.18, 0.3, 10), mat(0x202020), 0, 1.95, 0, root);
    mesh(cyl('hatB', 0.28, 0.28, 0.04, 12), mat(0x202020), 0, 1.81, 0, root);
    bx(0.5, 0.1, 0.12, mat(0xd82020), 0, 1.36, 0.1, root);
    return root;
  }
  function cactus(h) {
    const root = new THREE.Group();
    const m = mat(0x3a9a4a, { roughness: 0.7 });
    mesh(cyl('cac', 0.28, 0.3, 1, 10), m, 0, h / 2, 0, root).scale.y = h;
    mesh(sph('cacTop', 0.28, 10, 8), m, 0, h, 0, root);
    for (const sx of [-1, 1]) {
      if (Math.random() < 0.3) continue;
      const ay = h * (0.35 + Math.random() * 0.3);
      const hz = mesh(cyl('cacArmH', 0.15, 0.15, 0.4, 8), m, sx * 0.4, ay, 0, root); hz.rotation.z = Math.PI / 2;
      mesh(cyl('cacArmV', 0.15, 0.15, 0.7, 8), m, sx * 0.6, ay + 0.35, 0, root);
      mesh(sph('cacArmT', 0.15, 8, 6), m, sx * 0.6, ay + 0.7, 0, root);
    }
    if (Math.random() < 0.5) mesh(sph('cacFl', 0.1, 8, 6), mat(0xff60a0), 0, h + 0.28, 0, root);
    return root;
  }
  function pyramid(h, m) {
    const p = new THREE.Mesh(geo('pyr', () => new THREE.ConeGeometry(1, 1, 4, 1).rotateY(Math.PI / 4)), m);
    p.scale.set(h * 1.1, h, h * 1.1);
    p.position.y = h / 2;
    p.receiveShadow = true; p.castShadow = true;
    const g = new THREE.Group(); g.add(p);
    return g;
  }
  function coral(kind, color) {
    const root = new THREE.Group();
    const m = mat(color, { roughness: 0.6, emissive: color, emissiveIntensity: 0.15 });
    if (kind === 0) {
      for (let i = 0; i < 5; i++) {
        const h = 0.6 + Math.random() * 0.9, a = (i - 2) * 0.35;
        const b = mesh(cyl('corB', 0.06, 0.1, 1, 6), m, Math.sin(a) * h * 0.5, h / 2 * Math.cos(a), (Math.random() - 0.5) * 0.3, root);
        b.scale.y = h; b.rotation.z = -a;
        mesh(sph('corTip', 0.1, 8, 6), m, Math.sin(a) * h, h * Math.cos(a), b.position.z, root);
      }
    } else if (kind === 1) {
      const f = mesh(sph('corFan', 0.7, 14, 10), m, 0, 0.6, 0, root); f.scale.set(1, 0.9, 0.12);
    } else {
      const s = mesh(sph('corBrain', 0.5, 14, 10), m, 0, 0.25, 0, root); s.scale.set(1, 0.7, 1);
    }
    return root;
  }
  function seaweed(h) {
    const root = new THREE.Group();
    const m = mat(0x2a9a50, { roughness: 0.7, emissive: 0x0a4020, emissiveIntensity: 0.3 });
    const segs = [];
    let parent = root;
    const n = Math.max(3, Math.round(h / 0.5));
    for (let i = 0; i < n; i++) {
      const g = group(0, i === 0 ? 0 : 0.5, 0, parent);
      const leaf = bx(0.16, 0.52, 0.05, m, 0, 0.25, 0, g);
      leaf.rotation.y = i * 0.6;
      segs.push(g); parent = g;
    }
    return { root, segs };
  }
  function rock(s, m) {
    const r = new THREE.Mesh(geo('rock', () => new THREE.DodecahedronGeometry(1, 0)), m);
    r.scale.set(s * 1.3, s * 0.8, s);
    r.castShadow = r.receiveShadow = true;
    return r;
  }
  function deadTree(h) {
    const root = new THREE.Group();
    const m = mat(0x2a1e28, { roughness: 1 });
    mesh(cyl('dtTrunk', 0.12, 0.3, 1, 7), m, 0, h / 2, 0, root).scale.y = h;
    for (let i = 0; i < 4; i++) {
      const y = h * (0.45 + i * 0.13), s = i % 2 ? 1 : -1, len = h * (0.35 - i * 0.05);
      const b = mesh(cyl('dtBranch', 0.03, 0.08, 1, 5), m, s * len * 0.35, y + len * 0.3, 0, root);
      b.scale.y = len; b.rotation.z = -s * 0.9;
    }
    return root;
  }
  function tombstone() {
    const root = new THREE.Group();
    const m = mat(0x7a7a88, { roughness: 0.95 });
    bx(0.7, 0.8, 0.2, m, 0, 0.4, 0, root);
    mesh(geo('tombTop', () => new THREE.CylinderGeometry(0.35, 0.35, 0.2, 14, 1, false, 0, Math.PI).rotateX(Math.PI / 2).rotateZ(Math.PI / 2)), m, 0, 0.8, 0, root);
    bx(0.06, 0.3, 0.02, mat(0x3a3a48), 0, 0.6, 0.11, root);
    bx(0.2, 0.06, 0.02, mat(0x3a3a48), 0, 0.66, 0.11, root);
    root.rotation.z = (Math.random() - 0.5) * 0.25;
    return root;
  }
  function pumpkin() {
    const root = new THREE.Group();
    const m = mat(0xff7a10, { emissive: 0xff5000, emissiveIntensity: 0.35, roughness: 0.6 });
    const b = mesh(sph('pump', 0.4, 14, 10), m, 0, 0.32, 0, root); b.scale.set(1.2, 0.85, 1);
    mesh(cyl('pumpStem', 0.05, 0.07, 0.2, 6), mat(0x3a6a20), 0, 0.72, 0, root);
    const mf = mat(0xffe040, { emissive: 0xffc020, emissiveIntensity: 2 });
    for (const sx of [-1, 1]) { const e = mesh(cone('pEye', 0.08, 0.12, 3), mf, sx * 0.15, 0.42, 0.37, root); e.castShadow = false; }
    bx(0.3, 0.07, 0.04, mf, 0, 0.24, 0.39, root).castShadow = false;
    return { root, mat: m };
  }
  function dome(r) {
    const root = new THREE.Group();
    const g = mesh(geo('dome', () => new THREE.SphereGeometry(1, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2)), new THREE.MeshStandardMaterial({ color: 0x9adfff, transparent: true, opacity: 0.35, roughness: 0.05, metalness: 0.4 }), 0, 0, 0, root);
    g.scale.setScalar(r); g.castShadow = false;
    mesh(geo('domeRing', () => new THREE.TorusGeometry(1, 0.06, 6, 28).rotateX(Math.PI / 2)), mat(0xc0c8d8, { metalness: 0.7, roughness: 0.3 }), 0, 0.03, 0, root).scale.set(r, 1, r);
    const inner = mesh(cyl('domeIn', 0.3, 0.4, 0.8, 8), mat(0xe0e4f0, { metalness: 0.5 }), 0, 0.4, 0, root);
    inner.scale.set(r * 0.6, r * 0.5, r * 0.6);
    return root;
  }
  function antenna() {
    const root = new THREE.Group();
    const m = mat(0xd0d4e0, { metalness: 0.6, roughness: 0.3 });
    mesh(cyl('antPole', 0.05, 0.08, 3, 6), m, 0, 1.5, 0, root);
    const dish = mesh(geo('dish', () => new THREE.SphereGeometry(0.8, 16, 8, 0, Math.PI * 2, 0, Math.PI / 3)), new THREE.MeshStandardMaterial({ color: 0xe8ecf4, metalness: 0.5, roughness: 0.3, side: THREE.DoubleSide }), 0, 3.3, 0, root);
    dish.rotation.x = Math.PI * 0.75;
    const blink = mesh(sph('antBlink', 0.08, 6, 4), mat(0xff2020, { emissive: 0xff0000, emissiveIntensity: 2 }), 0, 3.05, 0, root);
    return { root, blink };
  }
  function crater(r, m) {
    const c = new THREE.Mesh(geo('crater', () => new THREE.TorusGeometry(1, 0.22, 6, 20).rotateX(Math.PI / 2)), m);
    c.scale.set(r, 0.5, r * 0.5);
    c.receiveShadow = true;
    return c;
  }

  return { spiny, boo, fish, bullet, piranha, podoboo, flame, bowser, axe, princess, cannon, bridgePlank, pine, snowman, cactus, pyramid, coral, seaweed, rock, deadTree, tombstone, pumpkin, dome, antenna, crater };
})());
