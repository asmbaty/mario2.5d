'use strict';
// Background scenery and weather particles for the extended themes.
const DECOR = (() => {
  const M = () => MODELS;

  function backPlane(ctx, color, y = 0.5) {
    const { world, L } = ctx;
    const back = new THREE.Mesh(new THREE.BoxGeometry(L.w + 140, 1, 70), M().mat(color, { roughness: 1 }));
    back.position.set(L.w / 2, y, -2.5 - 35);
    back.receiveShadow = true;
    world.add(back);
  }
  function clouds(ctx, color, y0, y1, z0, z1, emissive, opacity = 1) {
    const { world, L, rnd } = ctx;
    const mC = M().mat(color, { emissive: color, emissiveIntensity: emissive, roughness: 1, transparent: opacity < 1, opacity });
    for (let x = -10; x < L.w + 30; x += 7 + rnd() * 12) {
      const c = M().cloud(mC);
      c.position.set(x, y0 + rnd() * (y1 - y0), z0 + rnd() * (z1 - z0));
      c.scale.setScalar(0.8 + rnd() * 1.2);
      world.add(c);
      const sp = 0.1 + rnd() * 0.25;
      ctx.anim((t, dt) => { c.position.x += sp * dt; });
    }
  }
  function everyGround(ctx, step, fn) {
    const { L, rnd } = ctx;
    for (let x = 4; x < L.w - 2; x += step[0] + Math.floor(rnd() * step[1])) {
      if (ctx.groundAt(x) && ctx.groundAt(x + 1) && ctx.groundAt(x - 1)) fn(x);
    }
  }

  const themes = {
    snow(ctx) {
      const { world, L, rnd } = ctx;
      backPlane(ctx, 0xe8f0fa);
      const mSnow = M().mat(0xf4f8ff, { roughness: 0.9 }), mRock = M().mat(0x8a98b0, { roughness: 1 });
      for (let x = -40; x < L.w + 60; x += 16 + rnd() * 20) {
        const h = 14 + rnd() * 18;
        const mt = new THREE.Mesh(new THREE.ConeGeometry(h * 0.7, h, 6), mRock);
        mt.position.set(x, h / 2 - 1, -45 - rnd() * 25);
        world.add(mt);
        const cap = new THREE.Mesh(new THREE.ConeGeometry(h * 0.7 * 0.38, h * 0.38, 6), mSnow);
        cap.position.set(x, h - 1 - h * 0.19 + 0.05, mt.position.z);
        world.add(cap);
      }
      for (let x = 2; x < L.w + 20; x += 3 + rnd() * 6) {
        const t = M().pine(3 + rnd() * 4, true);
        t.position.set(x, 1, -4.5 - rnd() * 16);
        world.add(t);
      }
      everyGround(ctx, [14, 16], x => {
        const s = M().snowman(); s.position.set(x + 0.5, 2, -1.8); s.rotation.y = 0.3; s.scale.setScalar(0.8);
        world.add(s);
      });
      everyGround(ctx, [7, 9], x => {
        const b = M().bush(mSnow, 1 + Math.floor(rnd() * 2)); b.position.set(x + 0.5, 2, -2.1); b.scale.y = 0.7;
        world.add(b);
      });
      clouds(ctx, 0xf0f4fa, 11, 15, -16, -32, 0.2);
    },

    desert(ctx) {
      const { world, L, rnd } = ctx;
      backPlane(ctx, 0xe8c888);
      const mSand = M().mat(0xe8c078, { roughness: 1 }), mPyr = M().mat(0xd8b070, { roughness: 0.95 });
      for (let x = -30; x < L.w + 50; x += 40 + rnd() * 40) {
        const p = M().pyramid(10 + rnd() * 10, mPyr);
        p.position.set(x, 0.5, -40 - rnd() * 20);
        world.add(p);
      }
      for (let x = -10; x < L.w + 20; x += 12 + rnd() * 14) {
        const d = M().hill(mSand, 2 + rnd() * 3);
        d.position.set(x, 1, -8 - rnd() * 14);
        d.children.slice(1).forEach(c => { c.visible = false; });
        world.add(d);
      }
      for (let x = 3; x < L.w + 10; x += 5 + rnd() * 9) {
        const c = M().cactus(1.4 + rnd() * 2.2);
        c.position.set(x, 1, -4 - rnd() * 10);
        world.add(c);
      }
      everyGround(ctx, [10, 12], x => {
        const c = M().cactus(1 + rnd() * 1.2); c.position.set(x + 0.5, 2, -1.9);
        world.add(c);
      });
      const sunM = new THREE.Mesh(new THREE.SphereGeometry(6, 20, 14), new THREE.MeshBasicMaterial({ color: 0xfff4c0, fog: false }));
      sunM.position.set(L.w * 0.5, 30, -140);
      world.add(sunM);
      ctx.anim(() => { sunM.position.x = ctx.camX() * 0.8 + 20; });
    },

    reef(ctx) {
      const { world, L, rnd } = ctx;
      const floor = new THREE.Mesh(new THREE.BoxGeometry(L.w + 140, 1, 70), M().mat(0xc8b888, { roughness: 1 }));
      floor.position.set(L.w / 2, -0.5, -37.5);
      floor.receiveShadow = true;
      world.add(floor);
      const cols = [0xff6a8a, 0xffa040, 0xb070ff, 0x40d0c0, 0xffe060, 0xff4060];
      for (let x = -5; x < L.w + 10; x += 1.5 + rnd() * 3) {
        const c = M().coral(Math.floor(rnd() * 3), cols[Math.floor(rnd() * cols.length)]);
        c.position.set(x, 0, -3.5 - rnd() * 12);
        c.scale.setScalar(0.8 + rnd() * 1.4);
        world.add(c);
      }
      const mRock = M().mat(0x5a6a78, { roughness: 1 });
      for (let x = -10; x < L.w + 20; x += 8 + rnd() * 10) {
        const r = M().rock(1 + rnd() * 2.5, mRock);
        r.position.set(x, 0, -8 - rnd() * 16);
        world.add(r);
      }
      const weeds = [];
      for (let x = -5; x < L.w + 10; x += 1 + rnd() * 3) {
        const onFront = rnd() < 0.35 && ctx.groundAt(Math.floor(x));
        const s = M().seaweed(onFront ? 1.5 + rnd() * 1.5 : 3 + rnd() * 5);
        s.root.position.set(x, onFront ? 2 : 0, onFront ? -2 : -3 - rnd() * 10);
        world.add(s.root);
        weeds.push({ s, ph: rnd() * 6 });
      }
      ctx.anim(t => {
        for (const w of weeds) w.s.segs.forEach((g, i) => { g.rotation.z = Math.sin(t * 1.4 + w.ph + i * 0.5) * 0.18; });
      });
      // light shafts
      const rayMat = new THREE.MeshBasicMaterial({ color: 0xbfefff, transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
      const rays = [];
      for (let x = 0; x < L.w + 20; x += 6 + rnd() * 10) {
        const r = new THREE.Mesh(new THREE.PlaneGeometry(1.5 + rnd() * 2, 30), rayMat);
        r.position.set(x, 8, -4 - rnd() * 8);
        r.rotation.z = 0.35;
        world.add(r);
        rays.push(r);
      }
      ctx.anim(t => { rayMat.opacity = 0.06 + Math.sin(t * 0.7) * 0.03; });
      // water surface seen from below
      const surf = new THREE.Mesh(new THREE.PlaneGeometry(L.w + 140, 70), new THREE.MeshBasicMaterial({ color: 0x80d8ff, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }));
      surf.rotation.x = Math.PI / 2;
      surf.position.set(L.w / 2, 13.6, -20);
      world.add(surf);
    },

    haunted(ctx) {
      const { world, L, rnd } = ctx;
      backPlane(ctx, 0x221a30);
      const moon = new THREE.Mesh(new THREE.SphereGeometry(7, 24, 16), new THREE.MeshBasicMaterial({ color: 0xfff6d0, fog: false }));
      moon.position.set(0, 26, -120);
      world.add(moon);
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.roundSprite(), color: 0xfff0c0, transparent: true, opacity: 0.35, fog: false, depthWrite: false }));
      glow.scale.set(40, 40, 1);
      world.add(glow);
      ctx.anim(() => { moon.position.x = ctx.camX() * 0.9 + 15; glow.position.copy(moon.position); glow.position.z += 1; });
      for (let x = -10; x < L.w + 20; x += 3 + rnd() * 6) {
        const t = M().deadTree(3 + rnd() * 5);
        t.position.set(x, 1, -4 - rnd() * 18);
        t.rotation.y = rnd() * 6;
        world.add(t);
      }
      for (let x = 2; x < L.w; x += 2 + rnd() * 5) {
        const g = M().tombstone(); g.position.set(x, 1, -3.5 - rnd() * 6); world.add(g);
      }
      const pumpkins = [];
      everyGround(ctx, [9, 12], x => {
        const p = M().pumpkin(); p.root.position.set(x + 0.5, 2, -1.8); p.root.rotation.y = (rnd() - 0.5);
        world.add(p.root); pumpkins.push(p);
      });
      ctx.anim(t => { pumpkins.forEach((p, i) => { p.mat.emissiveIntensity = 0.3 + Math.abs(Math.sin(t * 7 + i * 3)) * 0.25; }); });
      clouds(ctx, 0x3a3050, 9, 15, -14, -30, 0.1, 0.8);
      // spooky fog layer
      const fogMat = new THREE.MeshBasicMaterial({ color: 0x6a5a90, transparent: true, opacity: 0.18, depthWrite: false });
      for (let i = 0; i < 3; i++) {
        const f = new THREE.Mesh(new THREE.PlaneGeometry(L.w + 100, 3), fogMat);
        f.position.set(L.w / 2, 1.8 + i * 0.6, -3 - i * 4);
        world.add(f);
      }
    },

    moon(ctx) {
      const { world, L, rnd } = ctx;
      backPlane(ctx, 0x6a6a74, 0.5);
      const e = new THREE.Mesh(new THREE.SphereGeometry(9, 32, 20), new THREE.MeshStandardMaterial({ map: TEX.earth(), emissive: 0x2050a0, emissiveIntensity: 0.25, roughness: 0.8 }));
      e.position.set(0, 30, -140);
      world.add(e);
      ctx.anim((t) => { e.position.x = ctx.camX() * 0.9 + 25; e.rotation.y = t * 0.05; });
      const mRock = M().mat(0x8a8a94, { roughness: 1 });
      for (let x = -40; x < L.w + 60; x += 18 + rnd() * 20) {
        const h = 6 + rnd() * 10;
        const mt = new THREE.Mesh(new THREE.ConeGeometry(h * 1.4, h, 7), mRock);
        mt.position.set(x, h / 2 - 0.5, -40 - rnd() * 30);
        world.add(mt);
      }
      const mCr = M().mat(0x7a7a84, { roughness: 1 });
      for (let x = 0; x < L.w + 20; x += 5 + rnd() * 8) {
        const c = M().crater(0.8 + rnd() * 2, mCr);
        c.position.set(x, 1.05, -5 - rnd() * 16);
        world.add(c);
      }
      const blinks = [];
      for (let x = 10; x < L.w; x += 30 + rnd() * 20) {
        const d = M().dome(1.5 + rnd() * 1.5); d.position.set(x, 1, -7 - rnd() * 6); world.add(d);
        const a = M().antenna(); a.root.position.set(x + 4, 1, -6 - rnd() * 4); world.add(a.root); blinks.push(a.blink);
      }
      ctx.anim(t => { blinks.forEach((b, i) => { b.visible = Math.floor(t * 2 + i) % 2 === 0; }); });
      // starfield
      const n = 1500, pos = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        const th = rnd() * Math.PI, ph = rnd() * Math.PI - 0.1, r = 160;
        pos[i * 3] = Math.cos(th) * r * 1.6 + L.w / 2; pos[i * 3 + 1] = Math.sin(ph) * r * 0.8 + 5; pos[i * 3 + 2] = -Math.sin(th) * r * 0.9 - 30;
      }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const stars = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 0.9, sizeAttenuation: true, fog: false, map: TEX.roundSprite(), transparent: true, depthWrite: false }));
      world.add(stars);
    },

    castle(ctx) {
      const { world, L, rnd } = ctx;
      // back wall
      const wallTex = TEX.mats('castle').brick.map.clone();
      wallTex.needsUpdate = true;
      wallTex.repeat.set((L.w + 60) / 1.5, 12);
      const wall = new THREE.Mesh(new THREE.PlaneGeometry(L.w + 60, 24), new THREE.MeshStandardMaterial({ map: wallTex, color: 0x707078, roughness: 1 }));
      wall.position.set(L.w / 2, 6, -3.5);
      wall.receiveShadow = true;
      world.add(wall);
      // glowing windows + pillars
      const winMat = new THREE.MeshBasicMaterial({ color: 0xff7020 });
      for (let x = 6; x < L.w; x += 12 + rnd() * 6) {
        const w = new THREE.Mesh(new THREE.PlaneGeometry(1, 2.2), winMat);
        w.position.set(x, 8, -3.45);
        world.add(w);
        const top = new THREE.Mesh(new THREE.CircleGeometry(0.5, 12, 0, Math.PI), winMat);
        top.position.set(x, 9.1, -3.45);
        world.add(top);
        const bars = M().mat(0x202024);
        for (let i = -1; i <= 1; i++) { const b = new THREE.Mesh(M().boxGeo(0.06, 2.6, 0.06), bars); b.position.set(x + i * 0.3, 8.1, -3.4); world.add(b); }
      }
      const mPil = TEX.mats('castle').hard;
      for (let x = 0; x < L.w; x += 9 + rnd() * 4) {
        const p = new THREE.Mesh(M().boxGeo(1.2, 14, 1.2), mPil);
        p.position.set(x, 6, -2.9);
        p.receiveShadow = true;
        world.add(p);
      }
      // lava sea
      const lt = TEX.lava().clone(); lt.needsUpdate = true;
      lt.repeat.set((L.w + 60) / 2, 3);
      const lavaMat = new THREE.MeshStandardMaterial({ map: lt, emissive: 0xffffff, emissiveMap: lt, emissiveIntensity: 1.1, roughness: 0.6 });
      const lava = new THREE.Mesh(new THREE.BoxGeometry(L.w + 60, 1, 6), lavaMat);
      lava.position.set(L.w / 2, 0.55, -0.5);
      world.add(lava);
      ctx.anim(t => { lt.offset.x = t * 0.05; lt.offset.y = Math.sin(t * 0.8) * 0.1; lava.position.y = 0.55 + Math.sin(t * 2) * 0.05; });
      // lava glow lights in pits
      for (let x = 0; x < L.w; x++) {
        if (!ctx.groundAt(x) && L.grid[1][x] === ' ' && ctx.groundAt(x - 1)) {
          const pl = new THREE.PointLight(0xff5010, 8, 9, 1.4);
          pl.position.set(x + 2, 2.5, 0.5);
          world.add(pl);
          ctx.anim((t) => { pl.intensity = 7 + Math.sin(t * 5 + x) * 1.5; });
        }
      }
      // torches
      for (let x = 10; x < L.w - 5; x += 20) {
        const flame = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.6, 8), M().mat(0xffa030, { emissive: 0xff6010, emissiveIntensity: 2 }));
        flame.position.set(x, 7, -2.2);
        world.add(flame);
        ctx.anim(t => { flame.scale.y = 1.02 + (Math.sin(t * 5.3 + x) * 0.6 + Math.sin(t * 8.7 + x * 1.9) * 0.4) * 0.14; flame.rotation.z = Math.sin(t * 3.1 + x) * 0.08; });
      }
    },
  };

  // ---------------- weather particles ----------------
  const WEATHER = {
    snow: { n: 700, color: 0xffffff, size: 0.2, v: (p, t, i) => [Math.sin(t + i) * 0.4, -1.4 - (i % 5) * 0.15, 0] },
    sand: { n: 500, color: 0xe8c890, size: 0.1, v: (p, t, i) => [7 + (i % 7), Math.sin(t * 2 + i) * 0.4, 0] },
    bubbles: { n: 260, color: 0xd0f4ff, size: 0.2, v: (p, t, i) => [Math.sin(t * 3 + i) * 0.4, 1.2 + (i % 4) * 0.3, 0] },
    fireflies: { n: 120, color: 0xb8ff60, size: 0.25, v: (p, t, i) => [Math.sin(t * 0.7 + i) * 0.6, Math.cos(t * 0.9 + i * 2) * 0.5, 0], blink: true },
    motes: { n: 220, color: 0xa0b8ff, size: 0.08, v: (p, t, i) => [Math.sin(t * 0.3 + i) * 0.2, Math.cos(t * 0.4 + i * 1.3) * 0.15, 0], blink: true },
    petals: { n: 260, color: 0xffb0c8, size: 0.16, v: (p, t, i) => [1.2 + Math.sin(t + i) * 0.8, -0.9 - (i % 4) * 0.15, 0] },
    pollen: { n: 200, color: 0xfff8c0, size: 0.09, v: (p, t, i) => [0.4 + Math.sin(t * 0.5 + i) * 0.3, Math.sin(t * 0.7 + i * 2) * 0.25, 0] },
    moondust: { n: 180, color: 0xd8d8e8, size: 0.08, v: (p, t, i) => [Math.sin(t * 0.2 + i) * 0.15, 0.2 + Math.sin(t * 0.3 + i) * 0.1, 0] },
    embers: { n: 260, color: 0xff8030, size: 0.13, v: (p, t, i) => [Math.sin(t + i) * 0.3, 1.6 + (i % 5) * 0.3, 0] },
  };
  function weather(kind, world, camX) {
    const W = WEATHER[kind];
    if (!W) return null;
    const pos = new Float32Array(W.n * 3);
    for (let i = 0; i < W.n; i++) {
      pos[i * 3] = camX + (Math.random() - 0.5) * 56;
      pos[i * 3 + 1] = -2 + Math.random() * 20;
      pos[i * 3 + 2] = -9 + Math.random() * 14;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    if (W.colors) {
      const col = new Float32Array(W.n * 3), c = new THREE.Color();
      for (let i = 0; i < W.n; i++) { c.setHex(W.colors[i % W.colors.length]); col.set([c.r, c.g, c.b], i * 3); }
      g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    }
    const mat = new THREE.PointsMaterial({ color: W.colors ? 0xffffff : W.color, vertexColors: !!W.colors, size: W.size, map: TEX.roundSprite(), transparent: true, depthWrite: false, opacity: 0.9, blending: kind === 'fireflies' || kind === 'embers' || kind === 'glitter' || kind === 'spirits' ? THREE.AdditiveBlending : THREE.NormalBlending });
    const pts = new THREE.Points(g, mat);
    pts.frustumCulled = false;
    world.add(pts);
    return {
      update(t, dt, cx) {
        const a = g.attributes.position.array;
        for (let i = 0; i < W.n; i++) {
          const v = W.v(a, t, i);
          let x = a[i * 3] + v[0] * dt, y = a[i * 3 + 1] + v[1] * dt;
          if (x < cx - 28) x += 56; else if (x > cx + 28) x -= 56;
          if (y < -2) y += 20; else if (y > 18) y -= 20;
          a[i * 3] = x; a[i * 3 + 1] = y;
        }
        g.attributes.position.needsUpdate = true;
        if (W.blink) mat.opacity = 0.5 + Math.sin(t * 3) * 0.4;
      },
    };
  }

  return { themes, weather, WEATHER, util: { backPlane, clouds, everyGround }, gust: 0 };
})();
