'use strict';
// Procedurally generated pixel-art textures and materials, per level theme.
const TEX = (() => {
  const cache = {};

  function canvasTex(draw, size = 16) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    draw(g, size);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 4;
    return t;
  }
  function rng(seed) { let s = seed; return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }; }
  const P = (g, c, x, y, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(x, y, w, h); };

  function brick(p) {
    return canvasTex(g => {
      P(g, p.base, 0, 0, 16, 16);
      for (let r = 0; r < 4; r++) {
        const y = r * 4, off = (r % 2) * 4;
        for (let bx = off - 8; bx < 16; bx += 8) {
          P(g, p.light, bx, y, 7, 1);
          P(g, p.dark, bx, y + 2, 7, 1);
          P(g, p.mortar, bx + 7, y, 1, 3);
        }
        P(g, p.mortar, 0, y + 3, 16, 1);
      }
    });
  }
  const QGLYPH = [
    '..####..',
    '.##..##.',
    '.##..##.',
    '.....##.',
    '....##..',
    '...##...',
    '...##...',
    '........',
    '...##...',
    '...##...',
  ];
  function question() {
    return canvasTex(g => {
      P(g, '#f8b800', 0, 0, 16, 16);
      P(g, '#ffe08a', 0, 0, 16, 1); P(g, '#ffe08a', 0, 0, 1, 16);
      P(g, '#8a3c00', 0, 15, 16, 1); P(g, '#8a3c00', 15, 0, 1, 16);
      for (const [x, y] of [[2, 2], [13, 2], [2, 13], [13, 13]]) P(g, '#8a3c00', x, y);
      QGLYPH.forEach((row, gy) => [...row].forEach((ch, gx) => { if (ch === '#') P(g, '#4a1c00', 4 + gx + 1, 3 + gy + 1); }));
      QGLYPH.forEach((row, gy) => [...row].forEach((ch, gx) => { if (ch === '#') P(g, '#c85000', 4 + gx, 3 + gy); }));
    });
  }
  function used(p) {
    return canvasTex(g => {
      P(g, p.usedBase, 0, 0, 16, 16);
      P(g, p.usedDark, 0, 15, 16, 1); P(g, p.usedDark, 15, 0, 1, 16);
      P(g, p.usedDark, 0, 0, 16, 1); P(g, p.usedDark, 0, 0, 1, 16);
      for (const [x, y] of [[2, 2], [13, 2], [2, 13], [13, 13]]) P(g, p.usedDark, x, y);
    });
  }
  function hard(p) {
    return canvasTex(g => {
      P(g, p.hardBase, 0, 0, 16, 16);
      P(g, p.hardLight, 0, 0, 16, 2); P(g, p.hardLight, 0, 0, 2, 16);
      P(g, p.hardDark, 0, 14, 16, 2); P(g, p.hardDark, 14, 0, 2, 16);
      P(g, p.hardLight, 14, 0, 1, 1); P(g, p.hardLight, 0, 14, 1, 1);
      P(g, p.hardDark, 4, 4, 8, 1); P(g, p.hardDark, 4, 4, 1, 8);
      P(g, p.hardLight, 4, 11, 8, 1); P(g, p.hardLight, 11, 4, 1, 8);
    });
  }
  function speckle(base, a, b, seed, density = 0.18) {
    return canvasTex(g => {
      P(g, base, 0, 0, 16, 16);
      const r = rng(seed);
      for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
        const v = r();
        if (v < density / 2) P(g, a, x, y); else if (v < density) P(g, b, x, y);
      }
    });
  }
  function grassSide(p) {
    return canvasTex(g => {
      P(g, p.dirt, 0, 0, 16, 16);
      const r = rng(7);
      for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
        const v = r(); if (v < 0.08) P(g, p.dirtDark, x, y); else if (v < 0.14) P(g, p.dirtLight, x, y);
      }
      P(g, p.grass, 0, 0, 16, 4);
      P(g, p.grassLight, 0, 0, 16, 1);
      for (let x = 0; x < 16; x++) if (r() < 0.55) P(g, p.grass, x, 4, 1, 1 + (r() < 0.4 ? 1 : 0));
    });
  }
  function stone(p) {
    return canvasTex(g => {
      P(g, p.dirt, 0, 0, 16, 16);
      P(g, p.dirtLight, 0, 0, 16, 1); P(g, p.dirtLight, 0, 0, 1, 16);
      P(g, p.dirtDark, 0, 15, 16, 1); P(g, p.dirtDark, 15, 0, 1, 16);
      P(g, p.dirtDark, 5, 3, 1, 5); P(g, p.dirtDark, 6, 8, 4, 1); P(g, p.dirtDark, 10, 9, 1, 4);
      P(g, p.dirtLight, 3, 11, 2, 1);
    });
  }
  function treeTop(p) {
    return canvasTex(g => {
      P(g, p.tree, 0, 0, 16, 16);
      const r = rng(3);
      for (let i = 0; i < 18; i++) P(g, p.treeLight, Math.floor(r() * 16), Math.floor(r() * 16), 2, 1);
      for (let i = 0; i < 10; i++) P(g, p.treeDark, Math.floor(r() * 16), Math.floor(r() * 16));
    });
  }
  function treeSide(p) {
    return canvasTex(g => {
      P(g, p.tree, 0, 0, 16, 16);
      P(g, p.treeLight, 0, 0, 16, 2);
      for (let x = 0; x < 16; x += 4) { P(g, p.treeDark, x, 12, 4, 4); P(g, p.tree, x + 1, 12, 2, 2); }
      P(g, p.treeDark, 0, 15, 16, 1);
    });
  }
  function bark() {
    return canvasTex(g => {
      P(g, '#c98b4a', 0, 0, 16, 16);
      for (let x = 1; x < 16; x += 5) P(g, '#a86c32', x, 0, 1, 16);
      P(g, '#e0a868', 3, 4, 1, 3); P(g, '#e0a868', 12, 9, 1, 4);
    });
  }

  const PALETTES = {
    over: {
      base: '#c84c0c', mortar: '#2a0c00', light: '#f08050', dark: '#a03c08',
      usedBase: '#a8602c', usedDark: '#4a2208',
      hardBase: '#c0682c', hardLight: '#f4a878', hardDark: '#5a2408',
      dirt: '#9b5a2c', dirtDark: '#6e3c18', dirtLight: '#bf7a44',
      grass: '#3cb043', grassLight: '#7ee06a',
      tree: '#35b04a', treeLight: '#7ee07a', treeDark: '#1f7a30',
    },
    under: {
      base: '#2a7ea8', mortar: '#06141c', light: '#6cc4e8', dark: '#1a5c80',
      usedBase: '#6a5a4a', usedDark: '#241a10',
      hardBase: '#3a6ea0', hardLight: '#8ab8e8', hardDark: '#102840',
      dirt: '#3d5f93', dirtDark: '#1a2c4a', dirtLight: '#6a8cc0',
      grass: '#3d5f93', grassLight: '#6a8cc0',
      tree: '#35b04a', treeLight: '#7ee07a', treeDark: '#1f7a30',
    },
  };
  PALETTES.sky = PALETTES.over;
  PALETTES.snow = {
    base: '#8fc4e8', mortar: '#2a4a68', light: '#e0f4ff', dark: '#6a9cc8',
    usedBase: '#7a8ca0', usedDark: '#2a3444',
    hardBase: '#a8d8f0', hardLight: '#f0fbff', hardDark: '#4a88b0',
    dirt: '#5a6a84', dirtDark: '#3a4660', dirtLight: '#8a9ab4',
    grass: '#f4f8ff', grassLight: '#ffffff', grassDark: '#c8dcf0',
    tree: '#35b04a', treeLight: '#7ee07a', treeDark: '#1f7a30',
  };
  PALETTES.desert = {
    base: '#d8a060', mortar: '#6a4020', light: '#f8d090', dark: '#b88040',
    usedBase: '#a07040', usedDark: '#4a2a10',
    hardBase: '#d8b070', hardLight: '#fbe0a8', hardDark: '#8a6030',
    dirt: '#c89858', dirtDark: '#a07038', dirtLight: '#e0b878',
    grass: '#f0cc80', grassLight: '#fbe0a0', grassDark: '#d8b060',
    tree: '#35b04a', treeLight: '#7ee07a', treeDark: '#1f7a30',
  };
  PALETTES.reef = {
    base: '#e87080', mortar: '#6a2030', light: '#ffb0b8', dark: '#c05060',
    usedBase: '#8a6a60', usedDark: '#3a2420',
    hardBase: '#f08868', hardLight: '#ffc0a0', hardDark: '#a04838',
    dirt: '#b8a070', dirtDark: '#8a7450', dirtLight: '#d8c090',
    grass: '#e8d8a0', grassLight: '#fff0c0', grassDark: '#c8b880',
    tree: '#35b04a', treeLight: '#7ee07a', treeDark: '#1f7a30',
  };
  PALETTES.haunted = {
    base: '#6a6078', mortar: '#1a1420', light: '#9a90a8', dark: '#4a4058',
    usedBase: '#5a4a50', usedDark: '#201820',
    hardBase: '#5a5068', hardLight: '#8a80a0', hardDark: '#241c30',
    dirt: '#2e2436', dirtDark: '#1a1420', dirtLight: '#443650',
    grass: '#4a3a6a', grassLight: '#6a5a9a', grassDark: '#2e2448',
    tree: '#5a3a7a', treeLight: '#8a6ab0', treeDark: '#3a2050',
  };
  PALETTES.moon = {
    base: '#9aa0b0', mortar: '#30343c', light: '#d0d6e0', dark: '#70768a',
    usedBase: '#6a6e78', usedDark: '#2a2c34',
    hardBase: '#b0b6c4', hardLight: '#e8ecf4', hardDark: '#5a6070',
    dirt: '#6a6a74', dirtDark: '#4a4a54', dirtLight: '#8a8a96',
    grass: '#b8b8c0', grassLight: '#d8d8e0', grassDark: '#9a9aa4',
    tree: '#35b04a', treeLight: '#7ee07a', treeDark: '#1f7a30',
  };
  PALETTES.castle = {
    base: '#8a8a90', mortar: '#2a2a30', light: '#b8b8c0', dark: '#606068',
    usedBase: '#6a5a50', usedDark: '#2a2018',
    hardBase: '#7a7a84', hardLight: '#a8a8b4', hardDark: '#3a3a44',
    dirt: '#6a6a72', dirtDark: '#3a3a42', dirtLight: '#9a9aa4',
    grass: '#6a6a72', grassLight: '#9a9aa4',
    tree: '#35b04a', treeLight: '#7ee07a', treeDark: '#1f7a30', stone: true,
  };
  PALETTES.under.stone = true;

  function mats(theme) {
    if (cache[theme]) return cache[theme];
    const p = PALETTES[theme];
    const std = (map, o = {}) => new THREE.MeshStandardMaterial({ map, roughness: 0.85, metalness: 0, ...o });
    const stoneStyle = !!p.stone;
    const topTex = stoneStyle ? stone(p) : speckle(p.grass, p.grassLight, p.grassDark || '#2c9434', 5, 0.2);
    const qt = question();
    const m = {
      brick: std(brick(p)),
      q: std(qt, { emissive: 0xffffff, emissiveMap: qt, emissiveIntensity: 0.25, roughness: 0.5 }),
      used: std(used(p)),
      hard: std(hard(p)),
      dirt: std(stoneStyle ? stone(p) : speckle(p.dirt, p.dirtDark, p.dirtLight, 11, 0.16)),
      grassTop: std(topTex, theme === 'snow' ? { roughness: 0.35, metalness: 0.05 } : {}),
      grassSide: std(stoneStyle ? stone(p) : grassSide(p)),
      treeTop: std(treeTop(p)),
      treeSide: std(treeSide(p)),
      bark: std(bark()),
      castle: std(brick(theme === 'haunted' || theme === 'moon' || theme === 'castle' ? p : PALETTES.over)),
    };
    m.grass = [m.grassSide, m.grassSide, m.grassTop, m.dirt, m.grassSide, m.grassSide];
    m.tree = [m.treeSide, m.treeSide, m.treeTop, m.treeSide, m.treeSide, m.treeSide];
    return (cache[theme] = m);
  }

  function gradient(stops) {
    const c = document.createElement('canvas'); c.width = 2; c.height = 256;
    const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 256);
    stops.forEach((s, i) => gr.addColorStop(i / (stops.length - 1), s));
    g.fillStyle = gr; g.fillRect(0, 0, 2, 256);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  const textCache = {};
  function textTex(text, color = '#fff') {
    const k = text + color;
    if (textCache[k]) return textCache[k];
    const c = document.createElement('canvas'); c.width = 256; c.height = 64;
    const g = c.getContext('2d');
    g.font = 'bold 40px "Press Start 2P", monospace';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.lineWidth = 8; g.strokeStyle = '#000'; g.strokeText(text, 128, 34);
    g.fillStyle = color; g.fillText(text, 128, 34);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    return (textCache[k] = t);
  }

  // animated lava texture
  let lavaTex = null;
  function lava() {
    if (lavaTex) return lavaTex;
    lavaTex = canvasTex(g => {
      P(g, '#ff4a00', 0, 0, 32, 32);
      const r = rng(21);
      for (let i = 0; i < 60; i++) P(g, r() < 0.5 ? '#ffb020' : '#c01800', Math.floor(r() * 32), Math.floor(r() * 32), 2 + Math.floor(r() * 3), 1 + Math.floor(r() * 2));
      for (let i = 0; i < 10; i++) P(g, '#fff080', Math.floor(r() * 32), Math.floor(r() * 32), 2, 1);
    }, 32);
    return lavaTex;
  }
  function roundSprite() {
    const c = document.createElement('canvas'); c.width = c.height = 32;
    const g = c.getContext('2d');
    const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(255,255,255,.7)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 32, 32);
    return new THREE.CanvasTexture(c);
  }
  function earth() {
    const c = document.createElement('canvas'); c.width = 128; c.height = 64;
    const g = c.getContext('2d');
    g.fillStyle = '#1a5ac8'; g.fillRect(0, 0, 128, 64);
    const r = rng(9);
    g.fillStyle = '#3aa040';
    for (let i = 0; i < 14; i++) { g.beginPath(); g.ellipse(r() * 128, 10 + r() * 44, 6 + r() * 14, 4 + r() * 8, r() * 3, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = 'rgba(255,255,255,.8)';
    for (let i = 0; i < 18; i++) { g.beginPath(); g.ellipse(r() * 128, r() * 64, 4 + r() * 10, 1 + r() * 2, 0, 0, Math.PI * 2); g.fill(); }
    g.fillRect(0, 0, 128, 4); g.fillRect(0, 60, 128, 4);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  const isStone = theme => !!(PALETTES[theme] && PALETTES[theme].stone);
  return { mats, gradient, textTex, canvasTex, lava, roundSprite, earth, isStone };
})();
