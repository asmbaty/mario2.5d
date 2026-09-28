'use strict';
// Extra per-level detail: ground dressing, ambient critters, sky events and animated set pieces.
const DETAILS = (() => {
  const M = () => MODELS;
  const V3 = THREE.Vector3;

  // ---------- shared helpers ----------
  function tiles(L, pred) {
    const out = [];
    for (let y = 0; y < L.h; y++) for (let x = 0; x < L.w; x++) if (pred(L.grid[y][x], x, y)) out.push([x, y]);
    return out;
  }
  const empty = (L, x, y) => x < 0 || x >= L.w || y < 0 || y >= L.h || L.grid[y][x] === ' ';

  // instanced ground dressing (grass blades, flowers, pebbles...) on exposed ground tops
  function scatter(ctx, { geo, colors, count, zMin = -2.3, zMax = 1.3, scale = [0.6, 1.2], yOff = 0, tilt = 0.25, filter }) {
    const { world, L, rnd } = ctx;
    const spots = [];
    for (let x = 0; x < L.w; x++) {
      if (!ctx.groundAt(x)) continue;
      if (filter && !filter(x)) continue;
      spots.push(x);
    }
    if (!spots.length) return null;
    const n = Math.min(count, spots.length * 8);
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.8, vertexColors: false });
    const im = new THREE.InstancedMesh(geo, mat, n);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new V3(), p = new V3();
    const col = new THREE.Color();
    for (let i = 0; i < n; i++) {
      const x = spots[Math.floor(rnd() * spots.length)] + rnd();
      let z = zMin + rnd() * (zMax - zMin);
      if (Math.abs(z) < 0.45) z += z < 0 ? -0.45 : 0.45;   // keep the play lane readable
      e.set((rnd() - 0.5) * tilt, rnd() * Math.PI * 2, (rnd() - 0.5) * tilt);
      q.setFromEuler(e);
      const s = scale[0] + rnd() * (scale[1] - scale[0]);
      sc.set(s, s, s);
      p.set(x, 2 + yOff * s, z);
      m4.compose(p, q, sc);
      im.setMatrixAt(i, m4);
      im.setColorAt(i, col.setHex(colors[Math.floor(rnd() * colors.length)]));
    }
    im.receiveShadow = true;
    world.add(im);
    return im;
  }
  const bladeGeo = () => M().geo('d_blade', () => {
    const g = new THREE.ConeGeometry(0.035, 0.28, 3);
    g.translate(0, 0.14, 0);
    const g2 = g.clone(); g2.rotateZ(0.35); g2.translate(0.04, 0, 0.02);
    const g3 = g.clone(); g3.rotateZ(-0.4); g3.translate(-0.04, 0, -0.02);
    return mergeGeos([g, g2, g3]);
  });
  const flowerGeo = () => M().geo('d_flower', () => {
    const stem = new THREE.CylinderGeometry(0.012, 0.012, 0.22, 4); stem.translate(0, 0.11, 0);
    const head = new THREE.SphereGeometry(0.06, 8, 6); head.scale(1, 0.6, 1); head.translate(0, 0.24, 0);
    return mergeGeos([stem, head]);
  });
  const pebbleGeo = () => M().geo('d_pebble', () => { const g = new THREE.DodecahedronGeometry(0.08, 0); g.scale(1.3, 0.6, 1); return g; });

  function mergeGeos(list) {
    // minimal merge for non-indexed + indexed geometries (position + normal only)
    const parts = list.map(g => g.index ? g.toNonIndexed() : g);
    let n = 0; parts.forEach(g => { n += g.attributes.position.count; });
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3);
    let o = 0;
    parts.forEach(g => { pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); o += g.attributes.position.count; });
    const out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    return out;
  }

  function bird(color = 0x202028) {
    const g = new THREE.Group();
    const m = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
    const wing = new THREE.BufferGeometry();
    wing.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0, 0.5, 0.05, -0.12, 0.45, 0, 0.12]), 3));
    const l = new THREE.Mesh(wing, m), r = new THREE.Mesh(wing, m);
    r.scale.x = -1;
    g.add(l, r);
    return { g, l, r };
  }
  function flock(ctx, { n = 5, y = [10, 14], z = [-12, -25], color = 0x202028, speed = 3, size = 1 }) {
    const { world, rnd } = ctx;
    const birds = [];
    for (let i = 0; i < n; i++) {
      const b = bird(color);
      b.g.scale.setScalar(size * (0.8 + rnd() * 0.5));
      world.add(b.g);
      birds.push({ b, ox: (i % 2 ? 1 : -1) * Math.ceil(i / 2) * 0.9, oy: -Math.ceil(i / 2) * 0.45, ph: rnd() * 6 });
    }
    const st = { x: ctx.camX() - 40, y: y[0] + rnd() * (y[1] - y[0]), z: z[0] + rnd() * (z[1] - z[0]) };
    ctx.anim((t, dt) => {
      st.x += speed * dt;
      if (st.x > ctx.camX() + 45) { st.x = ctx.camX() - 45; st.y = y[0] + Math.random() * (y[1] - y[0]); }
      for (const o of birds) {
        o.b.g.position.set(st.x + o.ox * -1 - Math.abs(o.ox) * 0.5, st.y + o.oy + Math.sin(t * 2 + o.ph) * 0.15, st.z + o.ox * 0.4);
        const f = Math.sin(t * 12 + o.ph) * 0.7;
        o.b.l.rotation.z = f; o.b.r.rotation.z = -f;
      }
    });
  }
  function butterflies(ctx, n, colors) {
    const { world, L, rnd } = ctx;
    const list = [];
    for (let i = 0; i < n; i++) {
      const g = new THREE.Group();
      const m = new THREE.MeshBasicMaterial({ color: colors[i % colors.length], side: THREE.DoubleSide });
      const wg = M().geo('d_bwing', () => { const s = new THREE.Shape(); s.moveTo(0, 0); s.bezierCurveTo(0.15, 0.2, 0.28, 0.12, 0.2, -0.02); s.bezierCurveTo(0.22, -0.12, 0.08, -0.15, 0, 0); return new THREE.ShapeGeometry(s); });
      const l = new THREE.Mesh(wg, m), r = new THREE.Mesh(wg, m); r.scale.x = -1;
      g.add(l, r);
      world.add(g);
      list.push({ g, l, r, x: 8 + rnd() * (L.w - 16), y: 3 + rnd() * 2, z: -1.2 - rnd() * 3, ph: rnd() * 6 });
    }
    ctx.anim(t => {
      for (const b of list) {
        b.g.position.set(b.x + Math.sin(t * 0.5 + b.ph) * 2.5, b.y + Math.sin(t * 1.7 + b.ph) * 0.5, b.z + Math.cos(t * 0.4 + b.ph) * 0.6);
        const f = Math.abs(Math.sin(t * 16 + b.ph)) * 1.2;
        b.l.rotation.y = f; b.r.rotation.y = -f;
        b.g.rotation.y = Math.cos(t * 0.5 + b.ph) > 0 ? 0.4 : Math.PI - 0.4;
      }
    });
  }
  function glowSprite(color, size, opacity = 0.6) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.roundSprite(), color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.scale.set(size, size, 1);
    return s;
  }
  function plantArmenianFlag(ctx, x, z, h = 2.4) {
    const { world } = ctx;
    const g = new THREE.Group();
    g.position.set(x, 2, z);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, h, 8), M().mat(0xe8e8f0, { metalness: 0.7, roughness: 0.3 }));
    pole.position.y = h / 2; pole.castShadow = true; g.add(pole);
    const f = M().armenianFlag(1.1, 0.7);
    f.position.set(0.03, h - 0.05, 0);
    g.add(f);
    world.add(g);
    ctx.anim(t => f.userData.wave(t * 0.8));
    return g;
  }

  // ---------- per theme ----------
  const T = {
    over(ctx) {
      const { world, L, rnd } = ctx;
      scatter(ctx, { geo: bladeGeo(), colors: [0x3cb043, 0x4ec850, 0x2e9a3a, 0x68d45a], count: 2600, scale: [0.7, 1.4] });
      scatter(ctx, { geo: flowerGeo(), colors: [0xffffff, 0xffe040, 0xff5070, 0xff90c0, 0xa070ff], count: 500, scale: [0.8, 1.3] });
      butterflies(ctx, 14, [0xffe040, 0xffffff, 0xff8030, 0x80c0ff]);
      flock(ctx, { n: 5, speed: 3.5 });
      flock(ctx, { n: 3, speed: 2.4, y: [12, 15], z: [-20, -30] });
      // wooden fence along the back edge
      const post = M().mat(0xc89858, { roughness: 0.9 });
      for (let x = 2; x < L.w - 2; x++) {
        if (!(ctx.groundAt(x) && rnd() < 0.55)) continue;
        let len = 0; while (len < 6 && ctx.groundAt(x + len)) len++;
        if (len < 3) continue;
        for (let i = 0; i <= len; i++) { const p = new THREE.Mesh(M().boxGeo(0.12, 0.7, 0.12), post); p.position.set(x + i, 2.35, -2.35); p.castShadow = true; world.add(p); }
        for (const yy of [2.3, 2.55]) { const r = new THREE.Mesh(M().boxGeo(len, 0.08, 0.05), post); r.position.set(x + len / 2, yy, -2.3); world.add(r); }
        x += len + 6 + Math.floor(rnd() * 10);
      }
      // giant spotted mushrooms in the background
      for (let x = 15; x < L.w; x += 25 + rnd() * 30) {
        const g = new THREE.Group();
        const h = 1.5 + rnd() * 2.5;
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.25 * h / 2, 0.32 * h / 2, h, 12), M().mat(0xfff0d8)); stem.position.y = h / 2; g.add(stem);
        const cap = new THREE.Mesh(M().geo('d_mcap', () => new THREE.SphereGeometry(1, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2)), M().mat([0xe83020, 0x30b0ff, 0xffb020][Math.floor(rnd() * 3)], { roughness: 0.4 }));
        cap.scale.set(h * 0.55, h * 0.4, h * 0.55); cap.position.y = h; g.add(cap);
        for (let i = 0; i < 5; i++) {
          const a = i / 5 * Math.PI * 2 + rnd(), e = 0.4 + rnd() * 0.6;
          const d = new THREE.Mesh(M().geo('d_mdot', () => new THREE.SphereGeometry(0.12, 8, 6)), M().mat(0xffffff));
          d.position.set(Math.cos(a) * Math.cos(e) * h * 0.55, h + Math.sin(e) * h * 0.4, Math.sin(a) * Math.cos(e) * h * 0.55);
          d.scale.setScalar(h * 0.5); g.add(d);
        }
        g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
        g.position.set(x, 1, -6 - rnd() * 8);
        world.add(g);
      }
      const sunGlow = glowSprite(0xfff4c0, 40, 0.35); sunGlow.material.fog = false;
      world.add(sunGlow);
      ctx.anim(() => sunGlow.position.set(ctx.camX() + 30, 30, -120));
    },

    under(ctx) {
      const { world, L, rnd } = ctx;
      const rock = M().mat(0x3a4660, { roughness: 1 });
      const tips = [];
      for (let x = 7; x < L.w - 20; x += 1 + rnd() * 3) {
        const h = 0.6 + rnd() * 1.8;
        const c = new THREE.Mesh(M().geo('d_stal', () => new THREE.ConeGeometry(0.22, 1, 6)), rock);
        c.scale.set(1 + rnd(), h, 1 + rnd());
        const z = -1.2 - rnd() * 1.6;
        c.rotation.x = Math.PI; c.position.set(x, 13.9 - h / 2, z);
        world.add(c);
        if (rnd() < 0.4) tips.push({ x, y: 13.9 - h, z });
      }
      // water drips from stalactite tips
      const dropMat = M().mat(0x9ad8ff, { emissive: 0x2a6090, emissiveIntensity: 0.6, roughness: 0.1 });
      const drops = tips.map(tp => {
        const d = new THREE.Mesh(M().geo('d_drop', () => new THREE.SphereGeometry(0.05, 6, 4)), dropMat);
        d.scale.y = 1.6; world.add(d);
        return { d, tp, y: tp.y, v: 0, wait: Math.random() * 4 };
      });
      ctx.anim((t, dt) => {
        const cx = ctx.camX();
        for (const o of drops) {
          if (Math.abs(o.tp.x - cx) > 30) { o.d.visible = false; continue; }
          o.d.visible = true;
          if (o.wait > 0) { o.wait -= dt; o.y = o.tp.y; o.v = 0; }
          else {
            o.v -= 25 * dt; o.y += o.v * dt;
            if (o.y < 2.05) { ctx.dust(o.tp.x, 2, 2, 0.6, 1.2, 0x9ad8ff); o.wait = 2 + Math.random() * 4; }
          }
          o.d.position.set(o.tp.x, o.y, o.tp.z);
        }
      });
      // glowing mushrooms on the cave floor
      const glowCols = [0x40e0ff, 0xff60d0, 0x80ff80];
      const shrooms = [];
      for (let x = 4; x < L.w; x += 4 + rnd() * 8) {
        if (!ctx.groundAt(Math.floor(x))) continue;
        const c = glowCols[Math.floor(rnd() * 3)];
        const g = new THREE.Group();
        for (let i = 0; i < 3; i++) {
          const h = 0.2 + rnd() * 0.35;
          const st = new THREE.Mesh(M().geo('d_gst', () => new THREE.CylinderGeometry(0.03, 0.04, 1, 5)), M().mat(0xe0e8ff));
          st.scale.y = h; st.position.set((i - 1) * 0.18, h / 2, rnd() * 0.2); g.add(st);
          const cap = new THREE.Mesh(M().geo('d_gcap', () => new THREE.SphereGeometry(0.1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2)), new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 1.2 }));
          cap.position.set((i - 1) * 0.18, h, st.position.z); cap.scale.setScalar(0.8 + rnd() * 0.8); g.add(cap);
          shrooms.push(cap);
        }
        const glow = glowSprite(c, 1.6, 0.25); glow.position.y = 0.3; g.add(glow);
        g.position.set(x, 2, -2.0 - rnd() * 0.4);
        world.add(g);
      }
      ctx.anim(t => shrooms.forEach((s, i) => { s.material.emissiveIntensity = 0.8 + Math.sin(t * 2 + i) * 0.4; }));
      // mine support beams
      const wood = M().mat(0x6a4424, { roughness: 1 });
      for (let x = 10; x < L.w - 20; x += 14 + rnd() * 6) {
        for (const dx of [-1.2, 1.2]) { const p = new THREE.Mesh(M().boxGeo(0.25, 11, 0.25), wood); p.position.set(x + dx, 7.5, -2.7); world.add(p); }
        const b = new THREE.Mesh(M().boxGeo(3, 0.3, 0.3), wood); b.position.set(x, 12.8, -2.7); world.add(b);
        const lampG = glowSprite(0xffb050, 2.2, 0.4); lampG.position.set(x, 12.3, -2.5); world.add(lampG);
        const lamp = new THREE.Mesh(M().geo('d_lamp', () => new THREE.SphereGeometry(0.12, 8, 6)), M().mat(0xffd080, { emissive: 0xffa040, emissiveIntensity: 2 })); lamp.position.set(x, 12.35, -2.5); world.add(lamp);
      }
    },

    sky(ctx) {
      const { world, L, rnd } = ctx;
      const cols = [[0xff5050, 0xffe060], [0x50a0ff, 0xffffff], [0x60d060, 0xffa0d0], [0xffa030, 0x8060ff]];
      const balloons = [];
      for (let i = 0; i < 7; i++) {
        const g = new THREE.Group();
        const [a, b] = cols[i % cols.length];
        for (let k = 0; k < 8; k++) {
          const seg = new THREE.Mesh(M().geo('d_bseg', () => new THREE.SphereGeometry(1.2, 6, 12, 0, Math.PI / 4)), M().mat(k % 2 ? a : b, { roughness: 0.5 }));
          seg.rotation.y = k * Math.PI / 4; seg.scale.y = 1.2; g.add(seg);
        }
        const bask = new THREE.Mesh(M().boxGeo(0.5, 0.4, 0.5), M().mat(0x8a5a2c)); bask.position.y = -1.9; g.add(bask);
        for (const [dx, dz] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) { const r = new THREE.Mesh(M().boxGeo(0.02, 0.7, 0.02), M().mat(0x503018)); r.position.set(dx * 1.6, -1.45, dz * 1.6); g.add(r); }
        g.position.set(rnd() * L.w, 6 + rnd() * 10, -18 - rnd() * 25);
        g.scale.setScalar(0.8 + rnd() * 0.8);
        world.add(g);
        balloons.push({ g, ph: rnd() * 6, y0: g.position.y });
      }
      ctx.anim((t, dt) => balloons.forEach(b => { b.g.position.y = b.y0 + Math.sin(t * 0.4 + b.ph) * 0.8; b.g.position.x += 0.4 * dt; b.g.rotation.y += 0.1 * dt; }));
      // floating islands
      const grass = M().mat(0x5ab848, { roughness: 0.9 }), dirt = M().mat(0x9b6a3c, { roughness: 1 });
      for (let x = -10; x < L.w + 20; x += 22 + rnd() * 20) {
        const g = new THREE.Group();
        const r = 2 + rnd() * 3;
        const top = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.95, 0.5, 10), grass); g.add(top);
        const bot = new THREE.Mesh(new THREE.ConeGeometry(r * 0.95, r * 1.6, 10), dirt); bot.rotation.x = Math.PI; bot.position.y = -0.25 - r * 0.8; g.add(bot);
        for (let k = 0; k < 3; k++) { const t2 = M().tree(1.2 + rnd() * 1.2); t2.position.set((rnd() - 0.5) * r, 0.25, (rnd() - 0.5) * r * 0.6); g.add(t2); }
        g.position.set(x, 8 + rnd() * 10, -30 - rnd() * 20);
        world.add(g);
        const ph = rnd() * 6, y0 = g.position.y;
        ctx.anim(t => { g.position.y = y0 + Math.sin(t * 0.5 + ph) * 0.4; });
      }
      flock(ctx, { n: 5, speed: 3, y: [9, 14], z: [-10, -18], color: 0x3a2040 });
      const sunGlow = glowSprite(0xffc080, 60, 0.4); sunGlow.material.fog = false; world.add(sunGlow);
      ctx.anim(() => sunGlow.position.set(ctx.camX() * 0.5 + L.w * 0.3, 4, -140));
    },

    snow(ctx) {
      const { world, L, rnd } = ctx;
      // snow caps and icicles on blocks, stairs and pipes
      const capMat = M().mat(0xffffff, { roughness: 0.6 });
      const iceMat = new THREE.MeshStandardMaterial({ color: 0xc8f0ff, roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.85, emissive: 0x4080a0, emissiveIntensity: 0.2 });
      const capGeo = M().geo('d_scap', () => { const g = new THREE.CapsuleGeometry(0.12, 0.8, 4, 8); g.rotateZ(Math.PI / 2); g.scale(1.05, 1, 3.6); return g; });
      const iceGeo = M().geo('d_ice', () => new THREE.ConeGeometry(0.05, 1, 5).rotateX(Math.PI));
      const decorate = (x, y, parent, depth) => {
        if (empty(L, x, y + 1)) {
          const c = new THREE.Mesh(capGeo, capMat);
          c.scale.z = depth / 1; c.castShadow = true;
          if (parent) { c.position.set(0, 0.52, 0); parent.add(c); } else { c.position.set(x + 0.5, y + 1.02, 0); world.add(c); }
        }
        if (empty(L, x, y - 1) && y > 2) {
          for (let i = 0; i < 3; i++) {
            if (rnd() < 0.35) continue;
            const ic = new THREE.Mesh(iceGeo, iceMat);
            const h = 0.15 + rnd() * 0.3;
            ic.scale.set(1, h, 1);
            const px = -0.3 + i * 0.3, py = -0.5 - h / 2, pz = 0.35;
            if (parent) { ic.position.set(px, py, pz); parent.add(ic); } else { ic.position.set(x + 0.5 + px, y + py + 0.5, pz); world.add(ic); }
          }
        }
      };
      for (const b of L.blocks.values()) decorate(b.x, b.y, b.mesh, 1.15);
      for (const [x, y] of tiles(L, c => c === 'X')) decorate(x, y, null, 1.85);
      for (const [x, y] of tiles(L, (c, x, y) => c === 'P' && L.grid[y][x - 1] !== 'P' && empty(L, x, y + 1))) {
        const c = new THREE.Mesh(M().geo('d_pcap', () => new THREE.CylinderGeometry(1.02, 1.05, 0.14, 24)), capMat);
        c.position.set(x + 1, y + 1.05, 0); world.add(c);
        for (let i = 0; i < 6; i++) { const ic = new THREE.Mesh(iceGeo, iceMat); const h = 0.15 + rnd() * 0.3; ic.scale.set(1.2, h, 1.2); const a = -0.9 + i * 0.36; ic.position.set(x + 1 + Math.sin(a) * 1.0, y + 0.7 - h / 2, Math.cos(a) * 1.0); world.add(ic); }
      }
      // snowy tufts / little ice crystals
      scatter(ctx, { geo: pebbleGeo(), colors: [0xffffff, 0xe8f2ff, 0xd0e4f8], count: 900, scale: [0.8, 2.2] });
      // aurora ribbons
      const auroraMats = [0x40ffa0, 0x40c0ff, 0xb060ff].map(c => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
      const ribbons = auroraMats.map((m, i) => {
        const g = new THREE.PlaneGeometry(260, 8 + i * 2, 80, 1);
        const base = Float32Array.from(g.attributes.position.array);
        const mesh = new THREE.Mesh(g, m);
        mesh.position.set(L.w / 2, 30 + i * 4, -130 - i * 10);
        world.add(mesh);
        return { g, base, i };
      });
      ctx.anim(t => {
        for (const r of ribbons) {
          const p = r.g.attributes.position;
          for (let k = 0; k < p.count; k++) {
            const x = r.base[k * 3], y = r.base[k * 3 + 1];
            p.setY(k, y + Math.sin(x * 0.05 + t * 0.4 + r.i) * 3 + Math.sin(x * 0.13 - t * 0.7) * 1.2);
            p.setZ(k, Math.cos(x * 0.04 + t * 0.3) * 6);
          }
          p.needsUpdate = true;
        }
        auroraMats.forEach((m, i) => { m.opacity = 0.16 + Math.sin(t * 0.6 + i * 2) * 0.08; });
      });
      flock(ctx, { n: 4, speed: 2.5, y: [10, 13], color: 0x303848 });
    },

    desert(ctx) {
      const { world, L, rnd } = ctx;
      scatter(ctx, { geo: pebbleGeo(), colors: [0xc8a060, 0xa88048, 0xe0c080], count: 700, scale: [0.6, 1.6] });
      // tumbleweeds rolling through
      const twMat = new THREE.MeshStandardMaterial({ color: 0x9a7040, wireframe: true });
      const weeds = [];
      for (let i = 0; i < 6; i++) {
        const m = new THREE.Mesh(M().geo('d_tw', () => new THREE.IcosahedronGeometry(0.45, 1)), twMat);
        const m2 = new THREE.Mesh(M().geo('d_tw2', () => new THREE.IcosahedronGeometry(0.35, 1)), twMat); m2.rotation.set(1, 2, 3); m.add(m2);
        world.add(m);
        weeds.push({ m, x: rnd() * L.w, z: -1.6 - rnd() * 6, ph: rnd() * 10, sp: 3 + rnd() * 3 });
      }
      ctx.anim((t, dt) => {
        const cx = ctx.camX();
        for (const w of weeds) {
          w.x += w.sp * dt;
          if (w.x > cx + 35) w.x = cx - 35 - Math.random() * 20;
          const bounce = Math.abs(Math.sin(t * 3 + w.ph)) * 0.8;
          w.m.position.set(w.x, 1.45 + (w.z > -2.5 ? 1 : 0) + bounce, w.z);
          w.m.rotation.z -= w.sp * dt / 0.45;
        }
      });
      // oasis with palms
      for (let x = 30; x < L.w; x += 60 + rnd() * 30) {
        const g = new THREE.Group();
        const pool = new THREE.Mesh(new THREE.CircleGeometry(3, 24), new THREE.MeshStandardMaterial({ color: 0x30a0d0, roughness: 0.1, metalness: 0.3 }));
        pool.rotation.x = -Math.PI / 2; pool.scale.y = 0.5; pool.position.y = 0.02; g.add(pool);
        for (let k = 0; k < 3; k++) {
          const palm = new THREE.Group();
          const h = 3 + rnd() * 2;
          for (let s2 = 0; s2 < 6; s2++) {
            const seg = new THREE.Mesh(M().geo('d_palmSeg', () => new THREE.CylinderGeometry(0.12, 0.16, 0.6, 7)), M().mat(0x8a6a40));
            seg.position.set(Math.pow(s2 / 6, 2) * 0.8, s2 * h / 6 + 0.3, 0); palm.add(seg);
          }
          for (let f = 0; f < 7; f++) {
            const leaf = new THREE.Mesh(M().geo('d_leaf', () => { const g2 = new THREE.SphereGeometry(1, 8, 4); g2.scale(1.1, 0.08, 0.25); g2.translate(1, 0, 0); return g2; }), M().mat(0x2a9a3a, { side: THREE.DoubleSide }));
            leaf.position.set(0.8, h, 0); leaf.rotation.set(0, f / 7 * Math.PI * 2, -0.45); palm.add(leaf);
          }
          palm.position.set((k - 1) * 2.2, 0, (rnd() - 0.5) * 1.5); palm.rotation.y = rnd() * 6;
          g.add(palm);
        }
        g.traverse(o => { if (o.isMesh) o.castShadow = true; });
        g.position.set(x, 1, -9 - rnd() * 6);
        world.add(g);
      }
      // vultures circling
      for (let i = 0; i < 3; i++) {
        const b = bird(0x2a1a10); b.g.scale.setScalar(1.6); world.add(b.g);
        const cx0 = rnd() * L.w, r = 5 + rnd() * 4, ph = rnd() * 6, y = 13 + rnd() * 4;
        ctx.anim(t => {
          const a = t * 0.3 + ph;
          b.g.position.set(cx0 + Math.cos(a) * r, y + Math.sin(t * 0.7) * 0.5, -20 + Math.sin(a) * r);
          b.g.rotation.y = -a;
          const f = Math.sin(t * 2 + ph) * 0.25; b.l.rotation.z = f; b.r.rotation.z = -f;
        });
      }
      // bones
      for (let x = 10; x < L.w; x += 18 + rnd() * 20) {
        if (!ctx.groundAt(Math.floor(x))) continue;
        const sk = new THREE.Mesh(M().geo('d_skull', () => new THREE.SphereGeometry(0.16, 10, 8)), M().mat(0xf4ecd8));
        sk.scale.set(1.2, 0.9, 1); sk.position.set(x, 2.1, -1.9); world.add(sk);
        for (const dx of [-0.06, 0.06]) { const e = new THREE.Mesh(M().geo('d_skEye', () => new THREE.SphereGeometry(0.04, 6, 4)), M().mat(0x202020)); e.position.set(x + dx + 0.12, 2.14, -1.84); world.add(e); }
      }
    },

    reef(ctx) {
      const { world, L, rnd } = ctx;
      // caustic light dancing on the sea floor
      const cc = document.createElement('canvas'); cc.width = cc.height = 128;
      const g = cc.getContext('2d');
      g.fillStyle = '#000'; g.fillRect(0, 0, 128, 128);
      g.strokeStyle = 'rgba(200,240,255,.9)'; g.lineWidth = 2;
      for (let i = 0; i < 26; i++) {
        g.beginPath();
        const x0 = rnd() * 128, y0 = rnd() * 128, r = 8 + rnd() * 18;
        for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.5) g.lineTo(x0 + Math.cos(a) * r * (0.7 + rnd() * 0.5), y0 + Math.sin(a) * r * (0.7 + rnd() * 0.5));
        g.stroke();
      }
      const ct = new THREE.CanvasTexture(cc); ct.wrapS = ct.wrapT = THREE.RepeatWrapping; ct.repeat.set(L.w / 6, 1);
      const caustic = new THREE.Mesh(new THREE.PlaneGeometry(L.w + 60, 4.2), new THREE.MeshBasicMaterial({ map: ct, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
      caustic.rotation.x = -Math.PI / 2; caustic.position.set(L.w / 2, 2.015, -0.45);
      world.add(caustic);
      const ct2 = ct.clone(); ct2.needsUpdate = true; ct2.repeat.set(L.w / 10, 8);
      const caustic2 = new THREE.Mesh(new THREE.PlaneGeometry(L.w + 140, 60), new THREE.MeshBasicMaterial({ map: ct2, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false }));
      caustic2.rotation.x = -Math.PI / 2; caustic2.position.set(L.w / 2, 0.02, -35);
      world.add(caustic2);
      ctx.anim(t => { ct.offset.set(t * 0.05, Math.sin(t * 0.4) * 0.3); ct2.offset.set(-t * 0.03, t * 0.02); caustic.material.opacity = 0.28 + Math.sin(t * 1.3) * 0.08; });
      // starfish + shells on the ground
      const starGeo = M().geo('d_starfish', () => {
        const s = new THREE.Shape();
        for (let i = 0; i < 10; i++) { const r = i % 2 ? 0.07 : 0.2, a = i / 10 * Math.PI * 2; if (i === 0) s.moveTo(Math.cos(a) * r, Math.sin(a) * r); else s.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
        const eg = new THREE.ExtrudeGeometry(s, { depth: 0.04, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 1 });
        eg.rotateX(-Math.PI / 2); return eg;
      });
      scatter(ctx, { geo: starGeo, colors: [0xff8040, 0xff5060, 0xffc040, 0xd060ff], count: 160, scale: [0.7, 1.3], tilt: 0.1 });
      scatter(ctx, { geo: pebbleGeo(), colors: [0xffffff, 0xf0e0c0, 0xd0c0a0], count: 600, scale: [0.6, 1.4] });
      // fish schools
      const fishGeo = M().geo('d_sfish', () => { const b = new THREE.SphereGeometry(0.12, 8, 6); b.scale(1.6, 0.8, 0.5); const t2 = new THREE.ConeGeometry(0.08, 0.14, 4); t2.rotateZ(Math.PI / 2); t2.translate(-0.24, 0, 0); return mergeGeos([b, t2]); });
      const schoolCols = [0xffd040, 0x40c0ff, 0xff7090, 0x80ffb0];
      for (let s = 0; s < 6; s++) {
        const n = 14;
        const im = new THREE.InstancedMesh(fishGeo, new THREE.MeshStandardMaterial({ color: schoolCols[s % 4], roughness: 0.3, metalness: 0.3 }), n);
        world.add(im);
        const offs = Array.from({ length: n }, () => [rnd() * 3 - 1.5, rnd() * 1.4 - 0.7, rnd() * 1.4 - 0.7, rnd() * 6]);
        const st = { x: rnd() * L.w, y: 4 + rnd() * 8, z: -3 - rnd() * 10, sp: 1.2 + rnd() * 1.5, dir: rnd() < 0.5 ? 1 : -1 };
        const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new V3(1, 1, 1), p = new V3();
        ctx.anim((t, dt) => {
          const cx = ctx.camX();
          st.x += st.sp * st.dir * dt;
          if (st.x > cx + 40) st.x = cx - 40; if (st.x < cx - 40) st.x = cx + 40;
          q.setFromAxisAngle(new V3(0, 1, 0), st.dir > 0 ? 0 : Math.PI);
          offs.forEach((o, i) => {
            p.set(st.x + o[0] + Math.sin(t * 2 + o[3]) * 0.2, st.y + o[1] + Math.sin(t * 1.3 + o[3]) * 0.25 + Math.sin(t * 0.3 + s) * 1.5, st.z + o[2]);
            m4.compose(p, q, sc); im.setMatrixAt(i, m4);
          });
          im.instanceMatrix.needsUpdate = true;
        });
      }
      // jellyfish
      for (let i = 0; i < 9; i++) {
        const jg = new THREE.Group();
        const col = [0xff80d0, 0xb080ff, 0x80d0ff][i % 3];
        const bell = new THREE.Mesh(M().geo('d_bell', () => new THREE.SphereGeometry(0.4, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2)), new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.5, transparent: true, opacity: 0.6, side: THREE.DoubleSide }));
        jg.add(bell);
        const tents = [];
        for (let k = 0; k < 5; k++) {
          const tn = new THREE.Mesh(M().geo('d_tent', () => new THREE.CylinderGeometry(0.015, 0.005, 1, 4).translate(0, -0.5, 0)), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.6 }));
          const a = k / 5 * Math.PI * 2; tn.position.set(Math.cos(a) * 0.22, 0, Math.sin(a) * 0.22); jg.add(tn); tents.push(tn);
        }
        const glow = glowSprite(col, 2, 0.25); jg.add(glow);
        jg.position.set(rnd() * L.w, 5 + rnd() * 7, -2.5 - rnd() * 8);
        world.add(jg);
        const y0 = jg.position.y, ph = rnd() * 6;
        ctx.anim(t => {
          const pulse = Math.sin(t * 2.2 + ph);
          bell.scale.set(1 + pulse * 0.12, 1 - pulse * 0.15, 1 + pulse * 0.12);
          jg.position.y = y0 + Math.sin(t * 0.5 + ph) * 1.2 + Math.max(0, pulse) * 0.1;
          tents.forEach((tn, k) => { tn.rotation.z = Math.sin(t * 2 + k + ph) * 0.3; tn.rotation.x = Math.cos(t * 1.7 + k) * 0.2; });
        });
      }
      // treasure chest glowing with gold
      for (const x of [L.w * 0.3, L.w * 0.72]) {
        const g2 = new THREE.Group();
        const wood = M().mat(0x7a4a20), gold = M().mat(0xffcc30, { metalness: 0.8, roughness: 0.25, emissive: 0x805010, emissiveIntensity: 0.6 });
        const base = new THREE.Mesh(M().boxGeo(1.2, 0.6, 0.8), wood); base.position.y = 0.3; g2.add(base);
        const lid = new THREE.Mesh(M().geo('d_lid', () => new THREE.CylinderGeometry(0.4, 0.4, 1.2, 12, 1, false, 0, Math.PI).rotateZ(Math.PI / 2)), wood);
        lid.position.set(0, 0.6, -0.4); lid.rotation.x = -1.1; g2.add(lid);
        for (let k = 0; k < 8; k++) { const c = new THREE.Mesh(M().geo('d_gcoin', () => new THREE.CylinderGeometry(0.1, 0.1, 0.03, 10)), gold); c.position.set((rnd() - 0.5) * 0.9, 0.62 + rnd() * 0.1, (rnd() - 0.5) * 0.5); c.rotation.set(rnd(), rnd(), rnd()); g2.add(c); }
        const gl = glowSprite(0xffd060, 3, 0.4); gl.position.y = 0.9; g2.add(gl);
        g2.position.set(x, 0, -6); g2.rotation.y = 0.4;
        world.add(g2);
      }
      // sunken ship silhouette
      const ship = new THREE.Group();
      const dark = M().mat(0x1a3040, { roughness: 1 });
      const hull = new THREE.Mesh(new THREE.CylinderGeometry(3, 2, 14, 8, 1, false, 0, Math.PI), dark); hull.rotation.z = Math.PI / 2; hull.rotation.x = Math.PI; hull.position.y = 2; ship.add(hull);
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 12, 6), dark); mast.position.set(2, 7, 0); mast.rotation.z = 0.3; ship.add(mast);
      const mast2 = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 8, 6), dark); mast2.position.set(-3, 5, 0); mast2.rotation.z = 0.25; ship.add(mast2);
      ship.position.set(L.w * 0.55, 0, -40); ship.rotation.z = 0.12;
      world.add(ship);
    },

    haunted(ctx) {
      const { world, L, rnd } = ctx;
      scatter(ctx, { geo: bladeGeo(), colors: [0x3a2a58, 0x4a3a6a, 0x2a2040], count: 1600, scale: [0.8, 1.6] });
      // iron fence
      const iron = M().mat(0x151018, { metalness: 0.6, roughness: 0.5 });
      for (let x = 1; x < L.w; x++) {
        if (!ctx.groundAt(x)) continue;
        for (let k = 0; k < 3; k++) {
          const bar = new THREE.Mesh(M().boxGeo(0.05, 1.1, 0.05), iron); bar.position.set(x + k / 3, 2.55, -2.35); world.add(bar);
          const tip = new THREE.Mesh(M().geo('d_spear', () => new THREE.ConeGeometry(0.06, 0.18, 4)), iron); tip.position.set(x + k / 3, 3.18, -2.35); world.add(tip);
        }
        const rail = new THREE.Mesh(M().boxGeo(1, 0.05, 0.05), iron); rail.position.set(x + 0.5, 2.9, -2.35); world.add(rail);
      }
      // bats
      const bats = [];
      for (let i = 0; i < 10; i++) {
        const g = new THREE.Group();
        const m = new THREE.MeshBasicMaterial({ color: 0x0a0610, side: THREE.DoubleSide });
        const wg = M().geo('d_batwing', () => { const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(0.35, 0.15); s.lineTo(0.3, 0.02); s.lineTo(0.22, 0.06); s.lineTo(0.16, -0.04); s.lineTo(0.08, 0.02); s.closePath(); return new THREE.ShapeGeometry(s); });
        const l = new THREE.Mesh(wg, m), r = new THREE.Mesh(wg, m); r.scale.x = -1;
        const body = new THREE.Mesh(M().geo('d_batB', () => new THREE.SphereGeometry(0.07, 6, 4)), m);
        g.add(l, r, body);
        for (const dx of [-0.03, 0.03]) { const e = new THREE.Mesh(M().geo('d_batE', () => new THREE.SphereGeometry(0.015, 4, 3)), new THREE.MeshBasicMaterial({ color: 0xff3030 })); e.position.set(dx, 0.02, 0.06); g.add(e); }
        world.add(g);
        bats.push({ g, l, r, x: rnd() * L.w, y: 7 + rnd() * 6, z: -2 - rnd() * 8, ph: rnd() * 6, sp: 2 + rnd() * 2 });
      }
      ctx.anim((t, dt) => {
        const cx = ctx.camX();
        for (const b of bats) {
          b.x += b.sp * dt * Math.sign(Math.sin(t * 0.2 + b.ph) + 0.3);
          if (b.x > cx + 35) b.x = cx - 35; if (b.x < cx - 35) b.x = cx + 35;
          b.g.position.set(b.x, b.y + Math.sin(t * 3 + b.ph) * 0.6, b.z + Math.cos(t * 0.8 + b.ph));
          const f = Math.sin(t * 20 + b.ph) * 0.9;
          b.l.rotation.y = f; b.r.rotation.y = -f;
        }
      });
      // will-o'-wisps
      for (let i = 0; i < 12; i++) {
        const w = glowSprite(0x60c0ff, 0.9, 0.7);
        const core = new THREE.Mesh(M().geo('d_wisp', () => new THREE.SphereGeometry(0.07, 8, 6)), new THREE.MeshBasicMaterial({ color: 0xc0f0ff }));
        w.add(core);
        const x0 = rnd() * L.w, y0 = 3 + rnd() * 3, z0 = -2 - rnd() * 5, ph = rnd() * 6;
        world.add(w);
        ctx.anim(t => {
          w.position.set(x0 + Math.sin(t * 0.4 + ph) * 2, y0 + Math.sin(t * 1.1 + ph) * 0.6, z0 + Math.cos(t * 0.5 + ph));
          w.material.opacity = 0.4 + Math.abs(Math.sin(t * 2 + ph)) * 0.5;
        });
      }
      // lightning storms
      const bolt = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ color: 0xe0e8ff, fog: false, side: THREE.DoubleSide }));
      world.add(bolt);
      let next = 5 + rnd() * 5, flash = 0;
      ctx.anim((t, dt) => {
        next -= dt;
        if (next <= 0) {
          next = 7 + Math.random() * 9; flash = 0.45;
          const pts = []; let x = ctx.camX() + (Math.random() - 0.5) * 40, y = 40;
          while (y > 5) { const nx = x + (Math.random() - 0.5) * 5, ny = y - 3 - Math.random() * 3; pts.push(x - 0.3, y, 0, x + 0.3, y, 0, nx, ny, 0); x = nx; y = ny; }
          bolt.geometry.dispose(); bolt.geometry = new THREE.BufferGeometry(); bolt.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
          bolt.position.z = -90;
          ctx.sfx('thunder');
        }
        if (flash > 0) {
          flash -= dt;
          const k = flash > 0.3 || (flash > 0.12 && flash < 0.2) ? 1 : 0;
          bolt.visible = k > 0;
          ctx.flash(k * 1.6);
        } else { bolt.visible = false; ctx.flash(0); }
      });
    },

    moon(ctx) {
      const { world, L, rnd } = ctx;
      scatter(ctx, { geo: pebbleGeo(), colors: [0x9a9aa4, 0x7a7a84, 0xb8b8c0], count: 900, scale: [0.6, 2] });
      // ringed planet
      const pl = new THREE.Group();
      const planet = new THREE.Mesh(new THREE.SphereGeometry(6, 28, 18), new THREE.MeshStandardMaterial({ color: 0xd8a070, emissive: 0x402010, emissiveIntensity: 0.3, roughness: 0.8 }));
      pl.add(planet);
      const ring = new THREE.Mesh(new THREE.RingGeometry(8, 12, 48), new THREE.MeshBasicMaterial({ color: 0xe8c8a0, side: THREE.DoubleSide, transparent: true, opacity: 0.7, fog: false }));
      ring.rotation.x = 1.2; pl.add(ring);
      world.add(pl);
      ctx.anim(t => { pl.position.set(ctx.camX() * 0.85 - 35, 22, -150); planet.rotation.y = t * 0.03; });
      // satellite
      const sat = new THREE.Group();
      const sb = new THREE.Mesh(M().boxGeo(0.6, 0.6, 0.9), M().mat(0xd0b060, { metalness: 0.8, roughness: 0.3 })); sat.add(sb);
      for (const sx of [-1, 1]) { const pnl = new THREE.Mesh(M().boxGeo(1.6, 0.04, 0.7), M().mat(0x2040a0, { metalness: 0.5, roughness: 0.2, emissive: 0x102050, emissiveIntensity: 0.4 })); pnl.position.x = sx * 1.2; sat.add(pnl); }
      world.add(sat);
      ctx.anim(t => { sat.position.set(ctx.camX() + Math.cos(t * 0.1) * 30, 16 + Math.sin(t * 0.1) * 3, -40); sat.rotation.set(t * 0.2, t * 0.3, 0); });
      // shooting stars
      const trailMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, fog: false });
      const trail = new THREE.Mesh(new THREE.BoxGeometry(6, 0.08, 0.08), trailMat);
      world.add(trail); trail.visible = false;
      let ss = { t: 99, x: 0, y: 0 };
      ctx.anim((t, dt) => {
        ss.t += dt;
        if (ss.t > 4 + Math.random() * 3) { ss = { t: 0, x: ctx.camX() + (Math.random() - 0.3) * 60, y: 35 + Math.random() * 10 }; }
        trail.visible = ss.t < 0.8;
        trail.position.set(ss.x - ss.t * 45, ss.y - ss.t * 18, -100);
        trail.rotation.z = 0.38;
        trailMat.opacity = 0.9 * (1 - ss.t / 0.8);
      });
      // rover crawling around
      const rover = new THREE.Group();
      const rb = new THREE.Mesh(M().boxGeo(1.4, 0.5, 0.9), M().mat(0xe0e0e8, { metalness: 0.5, roughness: 0.4 })); rb.position.y = 0.6; rover.add(rb);
      const wheels = [];
      for (const [wx, wz] of [[-0.5, 0.5], [0, 0.5], [0.5, 0.5], [-0.5, -0.5], [0, -0.5], [0.5, -0.5]]) {
        const w = new THREE.Mesh(M().geo('d_wheel', () => new THREE.CylinderGeometry(0.2, 0.2, 0.15, 10).rotateX(Math.PI / 2)), M().mat(0x303038)); w.position.set(wx, 0.2, wz); rover.add(w); wheels.push(w);
      }
      const mastR = new THREE.Mesh(M().boxGeo(0.06, 0.7, 0.06), M().mat(0xc0c0c8)); mastR.position.set(0.5, 1.2, 0); rover.add(mastR);
      const cam = new THREE.Mesh(M().boxGeo(0.3, 0.18, 0.18), M().mat(0xc0c0c8)); cam.position.set(0.5, 1.6, 0); rover.add(cam);
      const panel = new THREE.Mesh(M().boxGeo(1.5, 0.04, 1.0), M().mat(0x2040a0, { metalness: 0.5, emissive: 0x102050, emissiveIntensity: 0.3 })); panel.position.y = 0.9; rover.add(panel);
      rover.traverse(o => { if (o.isMesh) o.castShadow = true; });
      rover.position.set(20, 1, -6);
      world.add(rover);
      ctx.anim((t, dt) => {
        const x = 20 + ((t * 0.8) % (L.w - 40));
        rover.position.x = x; wheels.forEach(w => { w.rotation.z = -t * 4; });
        cam.rotation.y = Math.sin(t) * 0.8;
      });
      // an Armenian flag planted on the Moon
      plantArmenianFlag(ctx, 8, -2.0, 2.6);
      for (let i = 0; i < 6; i++) { const fp = new THREE.Mesh(M().boxGeo(0.14, 0.02, 0.28), M().mat(0x55555f)); fp.position.set(5 + i * 0.5, 2.01, -1.3 + (i % 2) * 0.25); world.add(fp); }
    },

    castle(ctx) {
      const { world, L, rnd } = ctx;
      // lava falls pouring from the back wall
      const lt = TEX.lava().clone(); lt.needsUpdate = true; lt.repeat.set(1, 4);
      const fallMat = new THREE.MeshStandardMaterial({ map: lt, emissive: 0xffffff, emissiveMap: lt, emissiveIntensity: 1.3, transparent: true, opacity: 0.95 });
      for (let x = 20; x < L.w - 10; x += 26 + rnd() * 10) {
        const f = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 12), fallMat);
        f.position.set(x, 6, -3.4); world.add(f);
        const gl = glowSprite(0xff6010, 6, 0.35); gl.position.set(x, 2, -3); world.add(gl);
      }
      ctx.anim(t => { lt.offset.y = t * 0.8; });
      // lava bubbles popping in the pits
      const pits = [];
      for (let x = 0; x < L.w; x++) if (L.grid[1][x] === ' ' && (L.grid[0][x] === ' ')) pits.push(x);
      const bubMat = new THREE.MeshStandardMaterial({ color: 0xffa020, emissive: 0xff5000, emissiveIntensity: 1.4 });
      const bubbles = Array.from({ length: Math.min(40, pits.length * 2) }, () => {
        const b = new THREE.Mesh(M().geo('d_lbub', () => new THREE.SphereGeometry(0.15, 8, 6)), bubMat);
        world.add(b);
        return { b, x: 0, z: 0, t: Math.random() * 2, life: 1 };
      });
      ctx.anim((t, dt) => {
        for (const o of bubbles) {
          o.t += dt;
          if (o.t > o.life) {
            o.t = 0; o.life = 0.6 + Math.random() * 1.2;
            o.x = pits[Math.floor(Math.random() * pits.length)] + Math.random();
            o.z = -2 + Math.random() * 3.5;
            if (Math.random() < 0.5 && Math.abs(o.x - ctx.camX()) < 20) ctx.dust(o.x, 1.1, 2, 0.5, 1.5, 0xff8020);
          }
          const k = o.t / o.life;
          o.b.position.set(o.x, 1.05, o.z);
          o.b.scale.setScalar(0.3 + k * 1.2);
          o.b.visible = pits.length > 0;
        }
      });
      // hanging chains
      const chainMat = M().mat(0x505058, { metalness: 0.8, roughness: 0.35 });
      const linkGeo = M().geo('d_link', () => new THREE.TorusGeometry(0.1, 0.03, 5, 10));
      for (let x = 8; x < L.w; x += 7 + rnd() * 9) {
        const n = 4 + Math.floor(rnd() * 8), g = new THREE.Group();
        for (let i = 0; i < n; i++) { const l = new THREE.Mesh(linkGeo, chainMat); l.position.y = -i * 0.17; l.rotation.y = i % 2 ? Math.PI / 2 : 0; g.add(l); }
        g.position.set(x, 13, -2.2 - rnd() * 0.8); world.add(g);
        const ph = rnd() * 6;
        ctx.anim(t => { g.rotation.z = Math.sin(t * 0.9 + ph) * 0.06; });
      }
      // stone Bowser statues guarding the entrance and the bridge
      const stone = M().mat(0x8a8a90, { roughness: 1 });
      for (const [sx, sy, face] of [[4, 5, 1], [124, 2, 1]]) {
        const s = M().bowser();
        s.root.traverse(o => { if (o.isMesh) { o.material = stone; o.castShadow = true; } });
        s.root.scale.setScalar(0.55);
        s.root.position.set(sx, sy, -1.9);
        s.inner.rotation.y = face > 0 ? -0.4 : Math.PI + 0.4;
        world.add(s.root);
      }
    },
  };

  function build(theme, ctx) { if (T[theme]) T[theme](ctx); }
  return { build, plantArmenianFlag };
})();
