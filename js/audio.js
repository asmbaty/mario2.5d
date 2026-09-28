'use strict';
// Synthesized sound effects and chiptune music via WebAudio.
const SFX = (() => {
  let ctx = null, master = null, sfxGain = null, musicGain = null, noiseBuf = null;
  let muted = false;
  const midi = n => 440 * Math.pow(2, (n - 69) / 12);

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = muted ? 0 : 0.5; master.connect(ctx.destination);
    sfxGain = ctx.createGain(); sfxGain.gain.value = 0.7; sfxGain.connect(master);
    musicGain = ctx.createGain(); musicGain.gain.value = 0.45; musicGain.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    if (Music.pending) { const p = Music.pending; Music.pending = null; Music.play(p); }
  }

  function tone(f, t0, dur, type = 'square', vol = 0.25, f2 = null, dest = sfxGain) {
    if (!ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t0);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
    o.connect(g); g.connect(dest);
    o.start(t0); o.stop(t0 + dur + 0.03);
  }
  function noise(t0, dur, vol = 0.3, dest = sfxGain, hp = 800) {
    if (!ctx) return;
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    s.connect(f); f.connect(g); g.connect(dest);
    s.start(t0); s.stop(t0 + dur + 0.02);
  }
  // play a sequence of [midi, seconds] notes
  function seq(notes, type = 'square', vol = 0.2, gap = 0.92) {
    if (!ctx) return;
    let t = ctx.currentTime + 0.01;
    for (const [n, d] of notes) { if (n) tone(midi(n), t, d * gap, type, vol); t += d; }
  }
  const now = () => ctx ? ctx.currentTime : 0;

  const fx = {
    jump(big) { if (!ctx) return; const t = now(); tone(big ? 180 : 250, t, 0.2, 'square', 0.16, big ? 520 : 760); },
    coin() { if (!ctx) return; const t = now(); tone(midi(83), t, 0.07, 'square', 0.15); tone(midi(88), t + 0.07, 0.35, 'square', 0.15); },
    stomp() { if (!ctx) return; const t = now(); tone(520, t, 0.12, 'square', 0.22, 140); },
    kick() { if (!ctx) return; const t = now(); tone(900, t, 0.06, 'square', 0.18, 300); noise(t, 0.05, 0.12); },
    bump() { if (!ctx) return; const t = now(); tone(140, t, 0.1, 'square', 0.25, 90); },
    brk() { if (!ctx) return; const t = now(); noise(t, 0.3, 0.4, sfxGain, 300); tone(160, t, 0.15, 'triangle', 0.3, 60); },
    appear() { seq([[60, .04], [67, .04], [72, .04], [64, .04], [71, .04], [76, .04], [67, .04], [74, .04], [79, .06]], 'square', 0.12); },
    powerup() { seq([[60, .05], [64, .05], [67, .05], [72, .05], [62, .05], [66, .05], [69, .05], [74, .05], [64, .05], [68, .05], [71, .05], [76, .08]], 'square', 0.14); },
    shrink() { seq([[76, .06], [72, .06], [67, .06], [64, .06], [60, .06], [55, .06], [52, .1]], 'square', 0.14); },
    fire() { if (!ctx) return; const t = now(); tone(1200, t, 0.08, 'square', 0.12, 300); },
    oneup() { seq([[76, .1], [79, .1], [88, .1], [84, .1], [86, .1], [91, .18]], 'square', 0.16); },
    die() { seq([[71, .14], [77, .14], [0, .14], [77, .14], [77, .18], [76, .18], [74, .18], [72, .14], [64, .14], [0, .14], [60, .4]], 'square', 0.16); },
    flag() { if (!ctx) return; const t = now(); tone(1400, t, 1.0, 'square', 0.1, 200); },
    clear() { seq([[55, .12], [60, .12], [64, .12], [67, .12], [72, .12], [76, .12], [79, .36], [76, .36], [56, .12], [60, .12], [63, .12], [68, .12], [72, .12], [75, .12], [80, .36], [75, .36], [58, .12], [62, .12], [65, .12], [70, .12], [74, .12], [77, .12], [82, .36], [82, .12], [82, .12], [82, .12], [84, .7]], 'square', 0.14); },
    gameover() { seq([[72, .2], [0, .1], [67, .2], [0, .1], [64, .3], [69, .2], [71, .2], [69, .2], [68, .25], [70, .25], [68, .25], [67, .15], [65, .15], [67, .6]], 'triangle', 0.3); },
    tick() { if (!ctx) return; tone(midi(96), now(), 0.03, 'square', 0.05); },
    hurry() { seq([[84, .08], [0, .04], [84, .08], [0, .04], [84, .2]], 'square', 0.14); },
    pause() { seq([[76, .06], [72, .06], [76, .06], [72, .1]], 'square', 0.14); },
    swim() { if (!ctx) return; const t = now(); tone(420, t, 0.12, 'triangle', 0.18, 700); },
    cannon() { if (!ctx) return; const t = now(); noise(t, 0.35, 0.35, sfxGain, 100); tone(110, t, 0.25, 'square', 0.25, 45); },
    bossfire() { if (!ctx) return; const t = now(); noise(t, 0.7, 0.3, sfxGain, 500); tone(160, t, 0.6, 'sawtooth', 0.12, 70); },
    bosshit() { if (!ctx) return; const t = now(); tone(300, t, 0.15, 'square', 0.25, 120); tone(200, t + 0.1, 0.15, 'square', 0.2, 80); },
    bossfall() { seq([[55, .12], [54, .12], [53, .12], [52, .12], [51, .12], [50, .12], [49, .12], [48, .12], [36, .5]], 'sawtooth', 0.14); },
    burn() { if (!ctx) return; const t = now(); noise(t, 0.5, 0.4, sfxGain, 1500); },
    axe() { if (!ctx) return; const t = now(); tone(1600, t, 0.3, 'square', 0.12, 900); noise(t, 0.2, 0.2); },
    thunder() { if (!ctx) return; const t = now() + 0.15; noise(t, 1.6, 0.5, sfxGain, 40); tone(55, t, 1.4, 'sawtooth', 0.12, 30); },
    door() { seq([[48, .08], [43, .08], [36, .2]], 'triangle', 0.3); },
    firework() { if (!ctx) return; const t = now(); noise(t, 0.5, 0.4, sfxGain, 150); tone(90, t, 0.3, 'triangle', 0.4, 40); },
    spring() { if (!ctx) return; const t = now(); tone(180, t, 0.35, 'triangle', 0.3, 720); tone(360, t + 0.04, 0.3, 'square', 0.06, 1100); },
    crumble() { if (!ctx) return; const t = now(); noise(t, 0.25, 0.25, sfxGain, 400); tone(90, t, 0.2, 'triangle', 0.25, 50); },
    wind() { if (!ctx) return; const t = now(); noise(t, 1.8, 0.16, sfxGain, 900); noise(t + 0.3, 1.4, 0.1, sfxGain, 2400); },
    meteor() { if (!ctx) return; const t = now(); tone(1800, t, 0.9, 'triangle', 0.05, 300); },
    boom() { if (!ctx) return; const t = now(); noise(t, 0.6, 0.45, sfxGain, 60); tone(80, t, 0.45, 'sawtooth', 0.2, 30); },
    dash() { if (!ctx) return; const t = now(); tone(220, t, 0.35, 'sawtooth', 0.12, 1400); tone(440, t + 0.05, 0.3, 'square', 0.06, 2200); noise(t, 0.3, 0.12, sfxGain, 2000); },
    toad() { seq([[72, .1], [76, .1], [79, .1], [84, .25], [0, .1], [79, .1], [84, .35]], 'square', 0.14); },
  };

  // ---------------- Music: original loops ----------------
  // each array entry is one eighth note (midi number, 0 = rest, -1 = sustain previous)
  const SONGS = {
    over: {
      bpm: 150,
      mel: [
        72, 76, 79, -1, 77, 76, 74, -1, 71, 74, 77, -1, 76, 74, 72, -1,
        69, 72, 76, -1, 74, 72, 71, 72, 74, -1, 67, -1, 0, 67, 69, 71,
        72, 76, 79, 84, 83, -1, 79, -1, 81, -1, 77, -1, 79, 77, 76, 74,
        76, 77, 79, 81, 83, -1, 86, -1, 84, -1, -1, -1, 0, 79, 81, 83,
      ],
      chords: [48, 43, 45, 43, 48, 41, 43, 48],
      bassPat: [0, 0, 7, 0, 12, 0, 7, 0],
      drum: [1, 0, 1, 1, 1, 0, 1, 0],
    },
    under: {
      bpm: 116,
      mel: [
        69, 0, 72, 0, 76, 0, 75, 0, 69, 0, 72, 0, 76, 0, 74, 0,
        67, 0, 70, 0, 74, 0, 73, 0, 67, 0, 70, 0, 74, 0, 72, 0,
        65, 0, 69, 0, 72, 0, 71, 0, 64, 0, 68, 0, 71, 0, 76, -1,
        69, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
      chords: [45, 45, 43, 43, 41, 40, 45, 45],
      bassPat: [0, 0, 0, 0, 0, 0, 12, 0],
      drum: [1, 0, 0, 0, 0, 0, 1, 0],
      wave: 'square',
    },
    sky: {
      bpm: 138,
      mel: [
        77, -1, 81, 84, 81, -1, 77, -1, 79, -1, 82, 86, 82, -1, 79, -1,
        81, 79, 77, 76, 77, -1, 72, -1, 74, 76, 77, 79, 81, -1, -1, -1,
        84, -1, 81, -1, 77, 81, 84, 89, 86, -1, 82, -1, 79, 82, 86, -1,
        84, 82, 81, 79, 77, -1, 76, -1, 77, -1, -1, -1, 0, 72, 74, 76,
      ],
      chords: [41, 43, 41, 36, 41, 46, 36, 41],
      bassPat: [0, 0, 7, 0, 12, 0, 7, 0],
      drum: [1, 0, 0, 1, 0, 0, 1, 0],
      wave: 'square',
    },
    snow: {
      bpm: 118, wave: 'triangle',
      mel: [
        84, -1, 79, -1, 76, 79, 84, 86, 88, -1, 86, 84, 79, -1, 76, -1,
        81, -1, 79, -1, 76, 74, 72, 74, 76, -1, -1, -1, 0, 0, 0, 0,
        84, -1, 79, -1, 76, 79, 84, 86, 88, -1, 91, -1, 88, 86, 84, -1,
        86, 84, 81, 79, 81, -1, 84, -1, 84, -1, -1, -1, 0, 0, 0, 0,
      ],
      chords: [48, 43, 45, 43, 48, 43, 41, 48],
      bassPat: [0, 0, 0, 0, 7, 0, 0, 0],
      drum: [1, 0, 0, 0, 0, 0, 0, 0],
    },
    desert: {
      bpm: 132,
      mel: [
        76, 77, 80, -1, 77, 76, -1, 74, 76, -1, -1, -1, 0, 71, 72, 74,
        76, 77, 80, 81, 83, -1, 81, 80, 77, -1, 76, -1, 0, 0, 0, 0,
        81, -1, 80, 77, 76, -1, 77, 80, 81, 83, 84, -1, 83, 81, 80, -1,
        77, 76, 74, 72, 71, -1, 72, 74, 76, -1, -1, -1, 0, 0, 0, 0,
      ],
      chords: [40, 40, 45, 40, 45, 40, 38, 40],
      bassPat: [0, 0, 7, 0, 0, 0, 7, 12],
      drum: [1, 0, 0, 1, 0, 1, 0, 0],
    },
    reef: {
      bpm: 100, wave: 'triangle',
      mel: [
        72, -1, 76, -1, 79, -1, 84, -1, 83, -1, 79, -1, 76, -1, -1, -1,
        74, -1, 77, -1, 81, -1, 84, -1, 83, -1, 81, -1, 79, -1, -1, -1,
        72, -1, 76, -1, 79, -1, 84, -1, 86, -1, 84, -1, 81, -1, 79, -1,
        77, -1, 76, -1, 74, -1, 71, -1, 72, -1, -1, -1, -1, -1, -1, -1,
      ],
      chords: [48, 40, 50, 43, 48, 45, 41, 48],
      bassPat: [0, 0, 0, 0, 7, 0, 0, 0],
      drum: [0, 0, 0, 0, 1, 0, 0, 0],
    },
    haunted: {
      bpm: 96, wave: 'triangle',
      mel: [
        69, 0, 72, 0, 71, 0, 68, -1, 69, 0, 72, 0, 75, -1, 74, -1,
        69, 0, 72, 0, 71, 0, 68, -1, 65, -1, 64, -1, -1, -1, 0, 0,
        81, -1, 80, -1, 77, -1, 76, -1, 81, -1, 80, -1, 77, -1, 74, -1,
        72, 71, 72, 74, 76, -1, 75, -1, 69, -1, -1, -1, 0, 0, 0, 0,
      ],
      chords: [45, 45, 45, 40, 41, 41, 40, 45],
      bassPat: [0, 0, 0, 0, 12, 0, 0, 0],
      drum: [1, 0, 0, 0, 0, 0, 0, 0],
    },
    moon: {
      bpm: 126, wave: 'triangle',
      mel: [
        72, 79, 84, 79, 76, 79, 84, 79, 74, 81, 86, 81, 77, 81, 86, 81,
        71, 79, 83, 79, 74, 79, 83, 79, 72, 79, 84, 88, 91, -1, -1, -1,
        69, 76, 81, 76, 72, 76, 81, 76, 65, 72, 77, 72, 69, 72, 77, 72,
        67, 74, 79, 74, 71, 74, 79, 83, 84, -1, -1, -1, 0, 0, 0, 0,
      ],
      chords: [48, 50, 43, 48, 45, 41, 43, 48],
      bassPat: [0, 0, 0, 0, 0, 0, 0, 0],
      drum: [0, 0, 1, 0, 0, 0, 1, 0],
    },
    castle: {
      bpm: 168,
      mel: [
        69, 72, 75, 72, 69, 72, 75, 72, 68, 71, 74, 71, 68, 71, 74, 71,
        69, 72, 75, 72, 69, 72, 75, 72, 70, 73, 76, 73, 70, 73, 76, 73,
        69, 72, 75, 78, 81, -1, 78, 75, 68, 71, 74, 77, 80, -1, 77, 74,
        81, -1, 80, -1, 79, -1, 78, -1, 77, 76, 75, 74, 73, 72, 71, 70,
      ],
      chords: [45, 44, 45, 46, 45, 44, 45, 46],
      bassPat: [0, 0, 0, 0, 0, 0, 0, 0],
      drum: [1, 0, 1, 0, 1, 0, 1, 0],
    },
    candy: {
      bpm: 160,
      mel: [
        72, -1, 76, 79, 84, -1, 79, 76, 77, -1, 81, 84, 81, -1, 77, -1,
        76, -1, 79, 84, 88, -1, 84, 79, 81, 79, 77, 76, 74, -1, -1, -1,
        72, -1, 76, 79, 84, -1, 79, 76, 77, -1, 81, 84, 89, -1, 88, 86,
        84, -1, 79, -1, 76, -1, 74, -1, 72, -1, -1, -1, 0, 0, 0, 0,
      ],
      chords: [48, 48, 41, 41, 48, 48, 43, 48],
      bassPat: [0, 0, 12, 0, 7, 0, 12, 0],
      drum: [1, 0, 1, 0, 1, 1, 1, 0],
    },
    crystal: {
      bpm: 96, wave: 'triangle',
      mel: [
        81, -1, -1, 76, 72, -1, 76, -1, 79, -1, -1, 74, 71, -1, 74, -1,
        77, -1, -1, 72, 69, -1, 72, -1, 76, -1, 75, -1, 76, -1, -1, -1,
        81, -1, -1, 76, 72, -1, 76, -1, 84, -1, 83, -1, 79, -1, 76, -1,
        77, -1, 76, -1, 74, -1, 71, -1, 69, -1, -1, -1, 0, 0, 0, 0,
      ],
      chords: [45, 43, 41, 40, 45, 43, 41, 40],
      bassPat: [0, 0, 0, 0, 7, 0, 0, 0],
      drum: [1, 0, 0, 0, 0, 0, 0, 0],
    },
    airship: {
      bpm: 144,
      mel: [
        62, -1, 65, 69, 74, -1, 72, 70, 69, -1, 65, -1, 62, -1, -1, -1,
        64, -1, 67, 70, 73, -1, 72, 70, 69, -1, 67, -1, 64, -1, -1, -1,
        62, -1, 65, 69, 74, -1, 77, -1, 76, 74, 73, 74, 76, -1, 69, -1,
        70, -1, 69, 67, 65, -1, 64, -1, 62, -1, -1, -1, 0, 57, 60, 61,
      ],
      chords: [38, 38, 45, 45, 38, 43, 45, 38],
      bassPat: [0, 12, 0, 12, 0, 12, 7, 12],
      drum: [1, 0, 1, 0, 1, 0, 1, 1],
    },
    jungle: {
      bpm: 126, wave: 'triangle',
      mel: [
        69, -1, 72, 74, 76, -1, 74, 72, 69, -1, 67, -1, 69, -1, -1, -1,
        72, -1, 74, 76, 79, -1, 76, 74, 76, -1, -1, -1, 0, 0, 0, 0,
        81, -1, 79, 76, 79, -1, 76, 74, 76, -1, 74, 72, 74, -1, 72, 69,
        67, -1, 69, 72, 74, -1, 72, -1, 69, -1, -1, -1, 0, 0, 0, 0,
      ],
      chords: [45, 45, 43, 43, 45, 45, 43, 45],
      bassPat: [0, 0, 7, 0, 0, 12, 7, 0],
      drum: [1, 0, 1, 1, 0, 1, 1, 0],
    },
    volcano: {
      bpm: 168,
      mel: [
        64, 65, 64, -1, 71, -1, 69, 67, 65, 64, 65, -1, 72, -1, 71, 69,
        67, 65, 67, -1, 74, -1, 72, 71, 69, -1, 67, -1, 65, -1, 64, -1,
        64, 65, 64, -1, 76, -1, 74, 72, 71, 72, 74, -1, 77, -1, 76, 74,
        72, 71, 69, -1, 71, -1, 69, 68, 64, -1, -1, -1, 0, 0, 0, 0,
      ],
      chords: [40, 41, 40, 43, 40, 41, 45, 40],
      bassPat: [0, 0, 0, 1, 0, 0, 0, 1],
      drum: [1, 0, 1, 0, 1, 0, 1, 1],
    },
    fortress: {
      bpm: 132,
      mel: [
        60, -1, 63, -1, 67, -1, 66, -1, 67, -1, 63, -1, 60, -1, -1, -1,
        58, -1, 62, -1, 65, -1, 64, -1, 65, -1, 62, -1, 58, -1, -1, -1,
        72, -1, 70, 68, 67, -1, 68, 70, 72, -1, 75, -1, 74, -1, 72, -1,
        71, -1, 68, -1, 67, -1, 65, -1, 63, -1, 62, -1, 60, -1, -1, -1,
      ],
      chords: [36, 36, 34, 34, 44, 44, 43, 43],
      bassPat: [0, 0, 12, 0, 0, 0, 12, 0],
      drum: [1, 0, 0, 1, 1, 0, 0, 1],
    },
    speedway: {
      bpm: 184,
      mel: [
        67, 67, 72, -1, 76, -1, 79, 76, 77, -1, 76, 74, 72, -1, 74, -1,
        76, 76, 79, -1, 83, -1, 84, 83, 81, -1, 79, 77, 76, -1, -1, -1,
        67, 67, 72, -1, 76, -1, 79, 76, 81, -1, 79, 77, 76, -1, 77, 79,
        84, -1, 83, 81, 79, -1, 74, 76, 72, -1, -1, -1, 0, 67, 69, 71,
      ],
      chords: [48, 48, 53, 55, 48, 45, 53, 55],
      bassPat: [0, 12, 0, 12, 7, 12, 0, 12],
      drum: [1, 1, 1, 0, 1, 1, 1, 1],
    },
    star: {
      bpm: 200,
      mel: [
        72, 72, 0, 72, 0, 69, 72, 0, 74, 74, 0, 74, 0, 72, 74, 0,
        76, 76, 0, 76, 0, 74, 76, 0, 77, 0, 79, 0, 81, 0, 79, 0,
      ],
      chords: [48, 50, 52, 53],
      bassPat: [0, 12, 0, 12, 0, 12, 0, 12],
      drum: [1, 1, 1, 1, 1, 1, 1, 1],
    },
  };

  const Music = {
    cur: null, name: null, timer: null, step: 0, next: 0, pending: null,
    play(name) {
      if (!ctx) { this.pending = name; return; }
      if (this.name === name && this.timer) return;
      this.stop();
      const s = SONGS[name]; if (!s) return;
      // precompute durations for sustained notes
      if (!s.dur) {
        s.dur = s.mel.map((n, i) => {
          if (n <= 0) return 0;
          let k = 1; while (s.mel[(i + k) % s.mel.length] === -1 && k < s.mel.length) k++;
          return k;
        });
      }
      this.cur = s; this.name = name; this.step = 0; this.next = ctx.currentTime + 0.06;
      this.timer = setInterval(() => this.tick(), 25);
    },
    stop() { if (this.timer) clearInterval(this.timer); this.timer = null; this.cur = null; this.name = null; this.pending = null; },
    tick() {
      const s = this.cur; if (!s || !ctx) return;
      const e = 60 / s.bpm / 2;
      while (this.next < ctx.currentTime + 0.15) {
        const i = this.step % s.mel.length;
        const n = s.mel[i];
        if (n > 0) tone(midi(n), this.next, e * s.dur[i] * 0.9, s.wave || 'square', 0.07, null, musicGain);
        const bar = Math.floor(i / 8) % s.chords.length;
        const bp = s.bassPat[i % 8];
        if (i % 2 === 0 || bp) tone(midi(s.chords[bar] + bp), this.next, e * 0.85, 'triangle', 0.22, null, musicGain);
        if (s.drum[i % s.drum.length]) noise(this.next, 0.035, 0.06, musicGain, 4000);
        this.next += e; this.step++;
      }
    },
  };

  function setMuted(m) { muted = m; if (master) master.gain.value = m ? 0 : 0.5; }

  return {
    init, fx, Music,
    toggleMute() { setMuted(!muted); return muted; },
    get muted() { return muted; },
  };
})();
