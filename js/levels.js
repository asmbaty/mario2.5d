'use strict';
// Level definitions. Coordinates are in tiles, y = 0 is the bottom row; the ground top is at y = 2.
// Tile chars: '#' ground, 'B' brick, '?' coin block, 'M' power-up block, 'S' star block, 'L' 1-UP block,
// 'C' multi-coin brick, 'U' used block, 'X' hard block, 'P' pipe, 'T' treetop platform,
// 'K' bullet-bill cannon, 'R' bridge (collapses when the axe is touched).
const LEVEL_H = 15;

class LevelBuilder {
  constructor(w, theme, name, opts = {}) {
    this.w = w; this.h = LEVEL_H; this.theme = theme; this.name = name;
    this.water = !!opts.water; this.ice = !!opts.ice; this.lowgrav = !!opts.lowgrav;
    this.piranhas = []; this.cannons = []; this.firebars = []; this.podoboos = [];
    this.boss = null; this.axe = null; this.princess = null;
    this.grid = Array.from({ length: LEVEL_H }, () => new Array(w).fill(' '));
    this.enemies = []; this.coins = []; this.lifts = [];
    this.start = { x: 3, y: 2 }; this.mid = null;
    this.flagX = null; this.castleX = null;
  }
  set(x, y, c) { if (x >= 0 && x < this.w && y >= 0 && y < this.h) this.grid[y][x] = c; }
  fill(x0, x1, y0, y1, c) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) this.set(x, y, c); return this; }
  ground(x0, x1) { return this.fill(x0, x1, 0, 1, '#'); }
  blocks(x, y, str) {
    [...str].forEach((c, i) => {
      if (c === 'o') this.coins.push({ x: x + i, y });
      else if (c !== ' ') this.set(x + i, y, c);
    });
    return this;
  }
  coinRow(x, y, n) { for (let i = 0; i < n; i++) this.coins.push({ x: x + i, y }); return this; }
  pipe(x, h, plant) { if (plant) this.piranhas.push({ x, top: 2 + h }); return this.fill(x, x + 1, 2, 2 + h - 1, 'P'); }
  cannon(x, h) { this.cannons.push({ x, y: 2 + h - 1 }); return this.fill(x, x, 2, 2 + h - 1, 'K'); }
  firebar(x, y, len, speed) { this.set(x, y, 'X'); this.firebars.push({ x, y, len, speed }); return this; }
  podoboo(x) { this.podoboos.push({ x }); return this; }
  bridge(x0, x1, y) { return this.fill(x0, x1, y, y, 'R'); }
  column(x, h) { return this.fill(x, x, 2, 2 + h - 1, 'X'); }
  stairsUp(x, n) { for (let i = 0; i < n; i++) this.column(x + i, i + 1); return this; }
  stairsDown(x, n) { for (let i = 0; i < n; i++) this.column(x + i, n - i); return this; }
  platform(x, y, len) { return this.fill(x, x + len - 1, y, y, 'T'); }
  enemy(kind, x, y = 2) { this.enemies.push({ kind, x, y }); return this; }
  lift(x, y, w, axis, range, speed) { this.lifts.push({ x, y, w, axis, range, speed }); return this; }
  setBoss(x, y) { this.boss = { x, y }; return this; }
  setAxe(x, y) { this.axe = { x, y }; return this; }
  setPrincess(x, y) { this.princess = { x, y }; return this; }
  flag(x) { this.flagX = x; this.set(x, 2, 'X'); return this; }
  castle(x) { this.castleX = x; return this; }
  done() { return this; }
}

const LEVELS = [
  {
    name: '1-1', title: 'GRASSLAND',
    build() {
      const b = new LevelBuilder(212, 'over', '1-1');
      b.ground(0, 68).ground(71, 85).ground(89, 152).ground(155, 211);
      b.blocks(16, 5, '?');
      b.blocks(20, 5, 'BMB?B').blocks(22, 9, '?');
      b.enemy('goomba', 22);
      b.pipe(28, 2).pipe(38, 3).pipe(46, 4).pipe(57, 4);
      b.enemy('goomba', 41).enemy('goomba', 51).enemy('goomba', 53);
      b.coinRow(31, 6, 3).coinRow(49, 8, 3);
      b.blocks(64, 6, 'L');
      b.coinRow(69, 5, 2);
      b.blocks(77, 5, 'BMB').blocks(80, 9, 'BBBBBBBB');
      b.enemy('goomba', 81, 10).enemy('goomba', 83, 10);
      b.coinRow(86, 5, 3);
      b.blocks(91, 9, 'BBB?').blocks(94, 5, 'C');
      b.enemy('goomba', 97).enemy('goomba', 98.5);
      b.blocks(100, 5, 'BS');
      b.blocks(106, 5, '?').blocks(109, 5, '?').blocks(109, 9, 'M').blocks(112, 5, '?');
      b.enemy('koopa', 107).enemy('goomba', 114).enemy('goomba', 115.5);
      b.blocks(118, 5, 'B').blocks(121, 9, 'BBB');
      b.enemy('goomba', 124).enemy('goomba', 125.5);
      b.blocks(128, 9, 'B??B').blocks(129, 5, 'BB');
      b.enemy('goomba', 130).enemy('goomba', 131.5);
      b.stairsUp(134, 4).stairsDown(140, 4);
      b.stairsUp(148, 4).column(152, 4).stairsDown(155, 4);
      b.pipe(163, 2);
      b.blocks(168, 5, 'BB?B');
      b.enemy('goomba', 174).enemy('goomba', 175.5);
      b.pipe(179, 2);
      b.stairsUp(181, 8).column(189, 8);
      b.flag(198).castle(202);
      b.mid = 92;
      return b.done();
    },
  },
  {
    name: '1-2', title: 'UNDERGROUND',
    build() {
      const b = new LevelBuilder(190, 'under', '1-2');
      b.ground(0, 79).ground(84, 115).ground(124, 189);
      b.fill(0, 0, 2, 12, 'B');
      b.fill(6, 140, 13, 13, 'B');
      b.blocks(10, 5, 'M????');
      b.enemy('goomba', 16).enemy('goomba', 17.5);
      b.column(29, 1).column(31, 2).column(33, 3).column(35, 4).column(37, 4).column(39, 3);
      b.enemy('goomba', 32, 4);
      b.coinRow(29, 8, 11);
      b.fill(44, 44, 5, 9, 'B').fill(49, 49, 5, 9, 'B').blocks(45, 9, 'BBBB').blocks(45, 5, 'BCBB');
      b.coinRow(45, 6, 4);
      b.enemy('koopa', 52);
      b.blocks(54, 7, 'BBBBBBBB');
      b.enemy('goomba', 56, 8).enemy('goomba', 58, 8);
      b.coinRow(55, 10, 6);
      b.blocks(64, 5, 'B?BL');
      b.pipe(70, 3).pipe(76, 2);
      b.enemy('goomba', 73);
      b.coinRow(80, 6, 4);
      b.enemy('koopa', 88).enemy('goomba', 92).enemy('goomba', 94);
      b.blocks(90, 6, 'BBBSBB');
      b.pipe(100, 3).pipe(106, 4).pipe(112, 2);
      b.enemy('goomba', 103).enemy('goomba', 109);
      b.lift(117, 4, 3, 'x', 2.2, 1.6);
      b.coinRow(118, 8, 5);
      b.blocks(128, 5, '?M?');
      b.enemy('koopa', 132).enemy('goomba', 136).enemy('goomba', 137.5);
      b.stairsUp(144, 6).column(150, 6);
      b.enemy('goomba', 158).enemy('goomba', 160);
      b.blocks(156, 6, 'B?B');
      b.flag(170).castle(175);
      b.mid = 86;
      return b.done();
    },
  },
  {
    name: '1-3', title: 'SUNSET TREETOPS',
    build() {
      const b = new LevelBuilder(180, 'sky', '1-3');
      b.ground(0, 15);
      b.platform(18, 3, 4);
      b.platform(24, 6, 5).enemy('red', 26, 7);
      b.platform(31, 9, 4).coinRow(31, 11, 4);
      b.platform(36, 4, 6).enemy('goomba', 39, 5);
      b.lift(44, 6, 3, 'y', 2.5, 1.2);
      b.platform(50, 7, 5).enemy('red', 52, 8);
      b.platform(57, 4, 3);
      b.platform(62, 7, 4).coinRow(62, 10, 4);
      b.lift(70, 5, 3, 'x', 2.5, 1.4);
      b.platform(77, 5, 7).enemy('koopa', 81, 6).blocks(79, 9, 'M');
      b.platform(87, 7, 3);
      b.platform(93, 5, 4).coinRow(93, 8, 4);
      b.lift(100, 5, 3, 'y', 3, 1.5);
      b.platform(106, 9, 5).enemy('red', 108, 10).coinRow(106, 12, 5);
      b.platform(114, 4, 4);
      b.platform(120, 7, 3).blocks(120, 11, '?S?');
      b.lift(127, 5, 3, 'x', 2.5, 1.6);
      b.platform(134, 5, 6).enemy('goomba', 136, 6).enemy('goomba', 138, 6);
      b.platform(142, 7, 4).coinRow(142, 10, 4);
      b.platform(150, 5, 3);
      b.ground(156, 179);
      b.blocks(158, 5, 'B?B');
      b.flag(166).castle(171);
      b.mid = 77; b.midY = 6;
      return b.done();
    },
  },
  // ======================= WORLD 2 =======================
  {
    name: '2-1', title: 'FROZEN PEAKS', hint: 'ICY GROUND - WATCH YOUR FOOTING!',
    build() {
      const b = new LevelBuilder(192, 'snow', '2-1', { ice: true });
      b.ground(0, 40).ground(44, 70).ground(75, 110).ground(114, 150).ground(154, 191);
      b.blocks(14, 5, '?M?');
      b.enemy('goomba', 20).enemy('goomba', 22);
      b.pipe(26, 3, true);
      b.blocks(31, 9, 'BBBB').coinRow(31, 10, 4);
      b.enemy('koopa', 36);
      b.coinRow(41, 6, 3);
      b.stairsUp(46, 3);
      b.blocks(52, 6, 'B?B?B');
      b.enemy('goomba', 55).enemy('goomba', 56.5);
      b.pipe(62, 4, true);
      b.coinRow(71, 7, 4);
      b.blocks(78, 5, 'BBBBBB').blocks(79, 9, '?L?');
      b.enemy('red', 84).enemy('koopa', 88);
      b.pipe(92, 2, true).pipe(98, 3, true);
      b.blocks(103, 5, 'C');
      b.enemy('goomba', 105).enemy('goomba', 106.5);
      b.coinRow(111, 6, 3);
      b.stairsUp(116, 4).stairsDown(122, 4);
      b.enemy('goomba', 120);
      b.blocks(130, 5, 'BMB');
      b.enemy('koopa', 134).enemy('goomba', 138).enemy('goomba', 139.5);
      b.pipe(143, 2, true);
      b.coinRow(151, 6, 3);
      b.stairsUp(160, 8).column(168, 8);
      b.flag(177).castle(181);
      b.mid = 76;
      return b.done();
    },
  },
  {
    name: '2-2', title: 'DESERT DUNES', hint: 'BEWARE OF BULLET BILLS AND SPINIES',
    build() {
      const b = new LevelBuilder(196, 'desert', '2-2');
      b.ground(0, 50).ground(54, 90).ground(95, 130).ground(133, 195);
      b.blocks(12, 5, 'B?B');
      b.enemy('spiny', 18);
      b.cannon(24, 2);
      b.enemy('goomba', 30).enemy('goomba', 31.5);
      b.blocks(34, 6, '?M?');
      b.cannon(42, 3);
      b.enemy('spiny', 46);
      b.coinRow(51, 6, 3);
      b.pipe(57, 3, true);
      b.blocks(63, 5, 'BBBBB').blocks(63, 9, 'B?S?B');
      b.enemy('koopa', 68).enemy('spiny', 72);
      b.cannon(76, 2).cannon(84, 4);
      b.coinRow(91, 7, 4);
      b.stairsUp(97, 4).column(101, 4);
      b.cannon(105, 2);
      b.enemy('spiny', 108).enemy('spiny', 110);
      b.blocks(113, 5, '?C?');
      b.pipe(120, 4, true);
      b.enemy('goomba', 124).enemy('goomba', 125.5).enemy('koopa', 128);
      b.cannon(138, 3).blocks(142, 6, 'BMB');
      b.enemy('spiny', 146).enemy('spiny', 148);
      b.pipe(152, 2, true);
      b.cannon(158, 2);
      b.stairsUp(166, 8).column(174, 8);
      b.flag(183).castle(187);
      b.mid = 95;
      return b.done();
    },
  },
  {
    name: '2-3', title: 'CORAL REEF', hint: 'PRESS JUMP TO SWIM!',
    build() {
      const b = new LevelBuilder(194, 'reef', '2-3', { water: true });
      b.ground(0, 30).ground(34, 70).ground(76, 120).ground(126, 193);
      b.coinRow(8, 6, 5);
      b.fill(20, 21, 2, 5, 'X').fill(20, 21, 10, 13, 'X');
      b.coinRow(20, 7, 2).coinRow(20, 8, 2);
      b.coinRow(31, 5, 3);
      b.fill(44, 45, 2, 8, 'X');
      b.blocks(50, 6, '?M?');
      b.fill(58, 59, 2, 3, 'X').fill(58, 59, 8, 13, 'X');
      b.coinRow(58, 5, 2);
      b.coinRow(71, 8, 5);
      b.stairsUp(82, 5);
      b.fill(98, 99, 2, 6, 'X').fill(98, 99, 11, 13, 'X');
      b.blocks(104, 5, 'BCB');
      b.coinRow(121, 4, 5);
      b.fill(132, 133, 2, 9, 'X');
      b.coinRow(132, 11, 2);
      b.blocks(140, 8, '?L?');
      b.fill(150, 151, 2, 4, 'X').fill(150, 151, 9, 13, 'X');
      b.coinRow(160, 6, 6);
      for (const [x, y] of [[25, 6], [32, 9], [40, 4], [48, 8], [55, 11], [63, 5], [72, 7], [80, 10], [88, 4], [95, 8], [105, 9],
        [112, 10], [122, 5], [130, 9], [140, 11], [148, 6], [156, 4], [165, 8], [170, 11]]) b.enemy(x % 3 ? 'fish' : 'fishg', x, y);
      b.enemy('goomba', 66).enemy('koopa', 110);
      b.flag(180).castle(184);
      b.mid = 76;
      return b.done();
    },
  },
  // ======================= WORLD 3 =======================
  {
    name: '3-1', title: 'HAUNTED WOODS', hint: 'BOOS ONLY MOVE WHEN YOU LOOK AWAY...',
    build() {
      const b = new LevelBuilder(196, 'haunted', '3-1');
      b.ground(0, 45).ground(49, 80).ground(84, 86).ground(90, 130).ground(135, 195);
      b.blocks(12, 5, 'B?B');
      b.enemy('goomba', 18).enemy('goomba', 19.5);
      b.enemy('boo', 26, 8);
      b.pipe(30, 3, true);
      b.blocks(36, 6, 'BMB');
      b.enemy('koopa', 40);
      b.coinRow(46, 6, 3);
      b.enemy('boo', 56, 10);
      b.blocks(58, 5, '?B?B?').blocks(60, 9, 'L');
      b.enemy('goomba', 64).enemy('goomba', 65.5).enemy('red', 70);
      b.pipe(74, 4, true);
      b.coinRow(84, 5, 3);
      b.enemy('boo', 90, 6);
      b.blocks(94, 6, 'BCB');
      b.stairsUp(100, 3).stairsDown(105, 3);
      b.enemy('boo', 112, 10);
      b.enemy('koopa', 115).enemy('goomba', 118).enemy('goomba', 119.5);
      b.blocks(122, 5, 'BSB');
      b.platform(131, 5, 4);
      b.pipe(140, 2, true);
      b.enemy('boo', 146, 7);
      b.blocks(150, 5, '?M?');
      b.enemy('goomba', 154).enemy('goomba', 155.5);
      b.enemy('boo', 160, 11);
      b.stairsUp(165, 8).column(173, 8);
      b.flag(182).castle(186);
      b.mid = 90;
      return b.done();
    },
  },
  {
    name: '3-2', title: 'MOON BASE', hint: 'LOW GRAVITY - TAKE GIANT LEAPS!',
    build() {
      const b = new LevelBuilder(214, 'moon', '3-2', { lowgrav: true });
      b.ground(0, 30).ground(37, 60).ground(67, 95).ground(103, 140).ground(148, 175).ground(180, 213);
      b.blocks(12, 6, '?M?');
      b.column(20, 5);
      b.enemy('spiny', 25);
      b.coinRow(32, 9, 4);
      b.cannon(42, 3);
      b.enemy('goomba', 47).enemy('goomba', 48.5);
      b.blocks(51, 8, 'BBBSBBB');
      b.coinRow(62, 10, 4);
      b.column(70, 5);
      b.enemy('koopa', 75).enemy('spiny', 80).enemy('spiny', 83);
      b.cannon(88, 4);
      b.lift(99, 5, 3, 'y', 2, 1);
      b.blocks(106, 6, '?C?').blocks(110, 11, 'L');
      b.enemy('spiny', 114).enemy('koopa', 118);
      b.column(122, 3).column(126, 5).column(130, 7);
      b.coinRow(130, 11, 1);
      b.cannon(134, 2);
      b.coinRow(142, 10, 5);
      b.enemy('goomba', 152).enemy('goomba', 153.5).enemy('spiny', 158);
      b.blocks(160, 6, 'BMB');
      b.cannon(168, 3);
      b.coinRow(176, 8, 3);
      b.stairsUp(184, 6).column(190, 6);
      b.flag(200).castle(204);
      b.mid = 103;
      return b.done();
    },
  },
  {
    name: '3-3', title: "BOWSER'S LAVA CASTLE", hint: 'DEFEAT BOWSER AND SAVE THE PRINCESS!',
    build() {
      const b = new LevelBuilder(160, 'castle', '3-3');
      b.fill(0, 159, 13, 13, 'X');
      b.start = { x: 2, y: 5 };
      b.ground(0, 14).fill(0, 5, 2, 4, 'X').fill(6, 8, 2, 3, 'X').fill(9, 10, 2, 2, 'X');
      b.podoboo(16.5);
      b.ground(19, 40);
      b.firebar(26, 5, 5, 1.8).firebar(34, 5, 5, -1.8);
      b.blocks(29, 9, '?M?');
      b.podoboo(42.5);
      b.ground(45, 70).fill(45, 52, 2, 3, 'X');
      b.firebar(56, 6, 6, 1.5);
      b.enemy('goomba', 60).enemy('goomba', 61.5);
      b.fill(62, 70, 9, 12, 'X');
      b.fill(73, 74, 0, 4, 'X');
      b.podoboo(72).podoboo(75.5);
      b.ground(77, 100);
      b.firebar(82, 6, 5, 2).firebar(90, 6, 5, -2);
      b.blocks(86, 10, '?M?');
      b.enemy('koopa', 95);
      b.podoboo(102.5);
      b.ground(105, 125);
      b.firebar(112, 7, 6, 1.4);
      b.enemy('goomba', 116).enemy('goomba', 118);
      b.bridge(126, 140, 1);
      b.ground(141, 159);
      b.setBoss(136, 2).setAxe(141, 2).setPrincess(152, 2);
      b.mid = 77;
      return b.done();
    },
  },
];

if (typeof module !== 'undefined') module.exports = { LEVELS, LevelBuilder, LEVEL_H };
