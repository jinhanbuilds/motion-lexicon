/* 动效词典 · Parametric scene
 * One ~6 s looping micro-film on one canvas. Its look is driven by lexicon.scene_params.
 * SCENE.mount(el) → { set(partial), get(), play(), pause(), destroy() }
 * Deterministic from time; logical stage 1600×900; DPR ≤ 1.5; pauses offscreen / hidden;
 * prefers-reduced-motion → starts paused with a play button.
 */
(function () {
  'use strict';
  const W = 1600, H = 900, LOOP = 6, T0 = 1.6;
  const reduced = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const DEF = { easing: 'bouncy', transition: 'cut', texture: 'flat', palette: 'default', type: 'default', camera: 'static', density: 'busy', onBeat: false, stagger: false, onTwos: false, slop: true, frame: false, blur: false };
  const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x;
  const lerp = (a, b, t) => a + (b - a) * t;
  const SANS = '"Hanken Grotesk", "PingFang SC", "Noto Sans CJK SC", system-ui, sans-serif';
  const SERIF = '"Newsreader", "Noto Serif CJK SC", Georgia, serif';
  const MONO = '"JetBrains Mono", Menlo, Consolas, monospace';
  const F = (spec) => `${spec[3] || ''} ${spec[2] || 400} ${spec[1]}px ${spec[0]}`.trim();
  function rngF(seed) { let a = seed >>> 0 || 1; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function hexRGB(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function hexA(h, a) { const c = hexRGB(h); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; }
  function mixHex(h1, h2, e) { e = clamp(e); const a = hexRGB(h1), b = hexRGB(h2); const c = a.map((v, i) => Math.round(lerp(v, b[i], e))); return '#' + ((1 << 24) + (c[0] << 16) + (c[1] << 8) + c[2]).toString(16).slice(1); }

  // ── easing ─────────────────────────────────────────────────────────
  function springStep(t, f, z) { if (t <= 0) return 0; const w = 2 * Math.PI * f, wd = w * Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z * w / wd) * Math.sin(wd * t)); }
  function bounceOut(t) { const n = 7.5625, d = 2.75; if (t < 1 / d) return n * t * t; if (t < 2 / d) return n * (t -= 1.5 / d) * t + .75; if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + .9375; return n * (t -= 2.625 / d) * t + .984375; }
  const EASE = {
    linear: p => clamp(p),
    bouncy: p => bounceOut(clamp(p)),
    expo: p => { p = clamp(p); return p >= 1 ? 1 : 1 - Math.pow(2, -10 * p); },
    spring: p => { p = clamp(p); return p >= 1 ? 1 : springStep(p, 1.35, 0.58); },
    slow: p => { p = clamp(p); return p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; },
  };
  const DUR = { linear: .5, bouncy: .85, expo: .75, spring: 1.0, slow: 1.35 };

  // ── palettes (fixed specimen colours; never follow page theme) ─────
  const PAL = {
    default: { dark: false, multi: true, bg: '#FFFFFF', ink: '#1E2230', muted: '#6B7280', line: '#E3E5EC', accent: '#7B61FF',
      k: ['#7B61FF', '#FFB400', '#00B3A4'], kInk: ['#FFFFFF', '#1E2230', '#FFFFFF'], tile: ['#FF5A5F', '#7B61FF', '#00B3A4'], tileInk: ['#FFFFFF', '#FFFFFF', '#FFFFFF'],
      word: ['#1E2230', '#FF5A5F'], deco: ['#FF5A5F', '#00B3A4', '#FFB400', '#7B61FF'], blobs: ['#7B61FF', '#FFB400', '#00B3A4'] },
    'one-accent': { dark: false, bg: '#E9E6DF', ink: '#17171A', muted: '#77756F', line: '#C9C4BA', accent: '#2E4BFF',
      k: ['#2E4BFF', '#2E4BFF', '#2E4BFF'], kInk: ['#FFFFFF', '#FFFFFF', '#FFFFFF'], tile: ['#F4F2EC', '#2E4BFF', '#F4F2EC'], tileInk: ['#17171A', '#FFFFFF', '#17171A'], tileStroke: '#C9C4BA',
      word: ['#77756F', '#17171A'], deco: ['#C9C4BA'], blobs: ['#2E4BFF', '#F2B544', '#9FB0FF'] },
    'ink-paper': { dark: false, bg: '#F1ECE1', ink: '#1B1A17', muted: '#6E685C', line: '#CFC6B4', accent: '#C8372D',
      k: ['#1B1A17', '#C8372D', '#1B1A17'], kInk: ['#F1ECE1', '#F1ECE1', '#F1ECE1'], tile: ['#F1ECE1', '#C8372D', '#F1ECE1'], tileInk: ['#1B1A17', '#F1ECE1', '#1B1A17'], tileStroke: '#1B1A17', strokeW: 3,
      word: ['#1B1A17', '#1B1A17'], deco: ['#1B1A17'], blobs: ['#C8372D', '#1B1A17', '#E0A458'] },
    'dark-premium': { dark: true, bg: '#131417', ink: '#EDE8DF', muted: '#8A857C', line: '#2E2F35', accent: '#CFA062',
      k: ['#CFA062', '#CFA062', '#1D1E22'], kInk: ['#131417', '#131417', '#CFA062'], tile: ['#1D1E22', '#CFA062', '#1D1E22'], tileInk: ['#EDE8DF', '#131417', '#EDE8DF'], tileStroke: '#383940',
      word: ['#8A857C', '#EDE8DF'], deco: ['#2E2F35'], blobs: ['#CFA062', '#2E4BFF', '#6C5A3A'] },
  };
  const TYPE = {
    default: { one: true, meet: [SANS, 128, 700], nimbus: [SANS, 128, 700], tag: [SANS, 40, 500], label: [SANS, 46, 700], sub: null, num: [SANS, 230, 700], cap: [SANS, 44, 600], end: [SANS, 30, 600] },
    roles: { one: true, meet: [SERIF, 150, 300, 'italic'], nimbus: [SERIF, 150, 500], tag: [MONO, 26, 500], upper: true, label: [SANS, 44, 600], sub: [MONO, 20, 400], idx: [MONO, 20, 500], num: [SERIF, 280, 400], cap: [MONO, 26, 500], end: [MONO, 26, 500] },
    extremes: { one: false, meet: [SANS, 80, 200], nimbus: [SANS, 250, 900], tag: [SANS, 40, 200], label: [SANS, 60, 900], sub: [SANS, 24, 200], num: [SANS, 300, 900], cap: [SANS, 42, 200], end: [SANS, 28, 200] },
  };

  // ── geometry ───────────────────────────────────────────────────────
  const L = { x: 745, y: 150, w: 110, h: 110 };
  const CARD = { x: 230, y: 320, w: 1140, h: 260 };
  const TILE = i => ({ x: 230 + i * 390, y: 250, w: 360, h: 400 });
  const K = { x: 380, y: 170, w: 840, h: 440 };
  const lerpRect = (a, b, e) => ({ x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e), w: lerp(a.w, b.w, e), h: lerp(a.h, b.h, e) });
  const scaleRect = (r, s) => ({ x: r.x + r.w / 2 - r.w * s / 2, y: r.y + r.h / 2 - r.h * s / 2, w: r.w * s, h: r.h * s });
  const third = (r, i) => ({ x: r.x + i * r.w / 3, y: r.y, w: r.w / 3, h: r.h });
  function rr(ctx, x, y, w, h, r) { r = Math.max(0, Math.min(r, w / 2, h / 2)); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

  // static decoration + busy extras, generated once
  const DECO = (() => { const r = rngF(11), a = []; for (let i = 0; i < 28; i++) a.push({ x: r() * W, y: r() * H, s: 7 + r() * 16, k: i % 3, rot: r() * 6 }); return a; })();
  const CONF = (() => { const r = rngF(5), a = []; for (let i = 0; i < 26; i++) { const ang = r() * Math.PI * 2, d = 470 + r() * 170; a.push({ x: 800 + Math.cos(ang) * d, y: 390 + Math.sin(ang) * d * 0.62, rot: r() * 6, s: 10 + r() * 12 }); } return a; })();
  const STREAK = (() => { const r = rngF(23), a = []; for (let i = 0; i < 16; i++) a.push({ y: r() * H, len: 300 + r() * 700, off: r(), th: 2 + r() * 5 }); return a; })();

  // cached textures
  const cache = {};
  function noiseTile() {
    if (cache.noise) return cache.noise;
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); const img = g.createImageData(128, 128); const r = rngF(3);
    for (let i = 0; i < img.data.length; i += 4) { const v = r(); const on = v > .5 ? 255 : 0; img.data[i] = img.data[i + 1] = img.data[i + 2] = on; img.data[i + 3] = Math.abs(v - .5) * 2 * 70; }
    g.putImageData(img, 0, 0); return (cache.noise = c);
  }
  function halftoneImg(pal) {
    const key = 'ht' + pal.ink; if (cache[key]) return cache[key];
    const c = document.createElement('canvas'); c.width = 800; c.height = 450; const g = c.getContext('2d');
    g.fillStyle = hexA(pal.ink, pal.dark ? .22 : .13);
    for (let y = 7; y < 450; y += 14) for (let x = 7 + ((y / 14) % 2) * 7; x < 800; x += 14) {
      const k = clamp((x / 800) * .55 + (y / 450) * .45 - .3) / .7; const rad = .35 + 5.6 * Math.pow(k, 1.4);
      g.beginPath(); g.arc(x, y, rad, 0, 6.283); g.fill();
    }
    return (cache[key] = c);
  }
  function dotPattern(ctx, pal) {
    const key = 'dp' + pal.ink; if (!cache[key]) { const c = document.createElement('canvas'); c.width = c.height = 12; const g = c.getContext('2d'); g.fillStyle = hexA(pal.ink, pal.dark ? .7 : .55); g.beginPath(); g.arc(6, 6, 2.5, 0, 6.283); g.fill(); cache[key] = c; }
    return ctx.createPattern(cache[key], 'repeat');
  }

  // ── timeline ───────────────────────────────────────────────────────
  function timeline(P) {
    const T = P.onBeat
      ? { c1: 2, c2: 4, words: [0.5, 1.0], tag: 1.5, tiles: P.stagger ? [2.5, 2.75, 3.0] : [2.5, 2.5, 2.5], num: 4.5, cap: 5.0, end: 5.5, busy: [0.25, 0.75, 1.25, 1.75] }
      : { c1: 1.83, c2: 4.21, words: [0.27, 0.62], tag: 1.19, tiles: P.stagger ? [2.29, 2.43, 2.61] : [2.37, 2.37, 2.37], num: 4.38, cap: 5.07, end: 5.46, busy: [0.41, 0.93, 1.07, 1.52] };
    T.td = ({ cut: 0, masked: .6, match: .7, iris: .7, whip: .3, push: .55 }[P.transition] || 0) * (P.easing === 'slow' ? 1.45 : 1);
    T.events = [0, ...T.words, T.tag, T.c1, ...T.tiles, T.c2, T.num, T.cap, T.end];
    return T;
  }
  function phase(T, t) {
    const td = T.td, h = td / 2;
    if (td > 0) {
      if (t >= T.c1 - h && t < T.c1 + h) return { tr: 1, a: 0, b: 1, q: (t - T.c1 + h) / td, la: t, lb: t - T.c1 };
      if (t >= T.c2 - h && t < T.c2 + h) return { tr: 1, a: 1, b: 2, q: (t - T.c2 + h) / td, la: t - T.c1, lb: t - T.c2 };
      if (t >= LOOP - h) return { tr: 1, a: 2, b: 0, q: (t - LOOP + h) / td, la: t - T.c2, lb: t - LOOP };
      if (t < h) return { tr: 1, a: 2, b: 0, q: (t + h) / td, la: t + LOOP - T.c2, lb: t };
    }
    if (t < T.c1) return { a: 0, la: t };
    if (t < T.c2) return { a: 1, la: t - T.c1 };
    return { a: 2, la: t - T.c2 };
  }
  // appear helper: progress, eased value, fade alpha
  function ap(S, lt, t0, k = 1) { const d = S.dur * k, p = (lt - t0) / d; return { p: clamp(p), e: p <= 0 ? 0 : S.E(p), a: clamp((lt - t0) / (d * 0.3)), on: lt >= t0 }; }
  const pop = (S, p) => S.P.slop && p > 0 && p < 1 ? 1 + 0.2 * Math.sin(Math.PI * clamp(p * 1.3)) * (1 - p) : 1;

  // ── camera ─────────────────────────────────────────────────────────
  function camera(S, i, lt) {
    const P = S.P, T = S.T;
    if (P.camera === 'zoom') {
      if (i === 0) { const u = EASE.slow(lt / T.c1); return { x: 800, y: lerp(450, 430, u), s: lerp(1, 1.26, u) }; }
      if (i === 1) { const t0 = T.tiles[2] - T.c1 + S.dur * 0.55, e = S.E((lt - t0) / (S.dur * 1.1)), tl = TILE(1); return { x: lerp(800, tl.x + tl.w / 2, e), y: lerp(450, tl.y + tl.h / 2, e), s: lerp(1, 1.9, e) }; }
      const e = S.E(lt / (S.dur * 1.25)); return { x: 800, y: lerp(390, 450, e), s: lerp(1.38, 1, e) };
    }
    if (P.camera === 'parallax') {
      const len = [T.c1, T.c2 - T.c1, LOOP - T.c2][i], u = clamp(lt / len, -0.4, 1.4);
      return { x: 800 + lerp(-46, 46, u), y: 450 + lerp(12, -12, u), s: 1.06 };
    }
    return { x: 800, y: 450, s: 1 };
  }
  function applyCam(ctx, c) { ctx.translate(800, 450); ctx.scale(c.s, c.s); ctx.translate(-c.x, -c.y); }
  const blendCam = (a, b, e) => ({ x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e), s: lerp(a.s, b.s, e) });

  // ── drawing primitives ─────────────────────────────────────────────
  function box(ctx, S, r, st) {
    const P = S.P, pal = S.pal, rad = st.rad == null ? 22 : st.rad;
    if (r.w <= 1 || r.h <= 1) return;
    if (P.texture === 'halftone') { ctx.save(); ctx.fillStyle = dotPattern(ctx, pal); rr(ctx, r.x + 16, r.y + 16, r.w, r.h, rad); ctx.fill(); ctx.restore(); }
    ctx.save();
    if (P.slop) { ctx.shadowColor = 'rgba(124,92,255,.5)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 14; }
    let fill = st.fill, stroke = st.stroke, lw = st.lw || 2;
    if (P.slop && st.key) { const g = ctx.createLinearGradient(r.x, r.y, r.x + r.w, r.y + r.h); g.addColorStop(0, '#8B5CF6'); g.addColorStop(1, '#3B82F6'); fill = g; }
    else if (P.texture === 'glass') {
      const accentish = st.fill === pal.accent || st.fill === pal.tile[1] || st.key;
      fill = accentish ? hexA(st.fill, .62) : (pal.dark ? 'rgba(255,255,255,.07)' : 'rgba(255,255,255,.34)');
      stroke = pal.dark ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.85)'; lw = 2;
    }
    ctx.fillStyle = fill; rr(ctx, r.x, r.y, r.w, r.h, rad); ctx.fill();
    ctx.restore();
    if (stroke) { ctx.save(); ctx.lineWidth = lw; ctx.strokeStyle = stroke; rr(ctx, r.x, r.y, r.w, r.h, rad); ctx.stroke(); ctx.restore(); }
    if (P.texture === 'glass' && !P.slop) { ctx.save(); const g = ctx.createLinearGradient(0, r.y, 0, r.y + r.h * .5); g.addColorStop(0, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; rr(ctx, r.x + 2, r.y + 2, r.w - 4, r.h * .5, rad); ctx.fill(); ctx.restore(); }
  }
  function text(ctx, S, s, x, y, spec, color, align = 'center', ls = 0) {
    ctx.font = F(spec); ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = color;
    if ('letterSpacing' in ctx) ctx.letterSpacing = ls ? ls + 'px' : '0px';
    ctx.fillText(s, x, y);
    if ('letterSpacing' in ctx && ls) ctx.letterSpacing = '0px';
  }
  function glow(ctx, S, on) { if (S.P.slop && on) { ctx.shadowColor = 'rgba(139,92,246,.75)'; ctx.shadowBlur = 36; } }
  function pill(ctx, S, cx, cy, label, fill, ink) {
    ctx.font = F([SANS, 22, 800]); const w = ctx.measureText(label).width + 40;
    ctx.save(); glow(ctx, S, true); ctx.fillStyle = fill; rr(ctx, cx - w / 2, cy - 22, w, 44, 22); ctx.fill(); ctx.restore();
    text(ctx, S, label, cx, cy + 8, [SANS, 22, 800], ink);
  }
  function star(ctx, cx, cy, r, pts = 5, inner = .45) { ctx.beginPath(); for (let i = 0; i < pts * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / pts, rad = i % 2 ? r * inner : r; ctx.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad); } ctx.closePath(); }
  function glyph(ctx, i, x, y, s, col) {
    ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = s * 0.1; ctx.lineJoin = 'round';
    if (i === 0) { ctx.beginPath(); ctx.arc(x + s / 2, y + s / 2, s * .42, 0, 6.283); ctx.stroke(); ctx.beginPath(); ctx.arc(x + s / 2, y + s / 2, s * .14, 0, 6.283); ctx.fill(); }
    else if (i === 1) { ctx.beginPath(); ctx.moveTo(x + s / 2, y); ctx.lineTo(x + s, y + s / 2); ctx.lineTo(x + s / 2, y + s); ctx.lineTo(x, y + s / 2); ctx.closePath(); ctx.fill(); }
    else { ctx.beginPath(); ctx.moveTo(x + s * .05, y + s * .92); ctx.lineTo(x + s / 2, y + s * .08); ctx.lineTo(x + s * .95, y + s * .92); ctx.closePath(); ctx.stroke(); }
    ctx.restore();
  }
  function burst(ctx, S, dt, x, y, seed) {
    if (!S.P.slop || dt < 0 || dt > .8) return;
    const r = rngF(seed), cols = ['#8B5CF6', '#3B82F6', '#EC4899', '#FBBF24'], k = dt / .8;
    ctx.save();
    ctx.strokeStyle = hexA('#8B5CF6', .55 * (1 - k)); ctx.lineWidth = 6 * (1 - k); ctx.beginPath(); ctx.arc(x, y, 40 + dt * 520, 0, 6.283); ctx.stroke();
    for (let i = 0; i < 20; i++) {
      const a = i / 20 * 6.283 + r() * .4, sp = 420 + r() * 300, d = sp * dt * (1 - dt * .55), s = (8 + r() * 8) * (1 - k);
      ctx.fillStyle = cols[i % 4]; star(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d, s, 4, .35); ctx.fill();
    }
    ctx.restore();
  }
  const keyCol = (S, i, end) => (i === 1 && end ? S.pal.tile[1] : S.pal.k[i]);

  // ── shots ──────────────────────────────────────────────────────────
  function hookLayout(ctx, S) {
    const ty = S.ty; ctx.font = F(ty.meet); const w1 = ctx.measureText('Meet').width; ctx.font = F(ty.nimbus); const w2 = ctx.measureText('Nimbus').width;
    if (ty.one) { const gap = ty.meet[1] * .3, tot = w1 + gap + w2, x0 = 800 - tot / 2; return [{ s: 'Meet', x: x0 + w1 / 2, y: 505, spec: ty.meet, w: w1 }, { s: 'Nimbus', x: x0 + w1 + gap + w2 / 2, y: 505, spec: ty.nimbus, w: w2 }]; }
    return [{ s: 'Meet', x: 800, y: 368, spec: ty.meet, w: w1 }, { s: 'Nimbus', x: 800, y: 592, spec: ty.nimbus, w: w2 }];
  }
  function logo(ctx, S, r, col, ink) {
    box(ctx, S, r, { fill: col, key: true, rad: r.w * .24 });
    if (r.w > 30) { ctx.save(); ctx.fillStyle = ink; ctx.globalAlpha *= .95; const cx = r.x + r.w / 2, cy = r.y + r.h / 2, u = r.w / 110; ctx.beginPath(); ctx.arc(cx - 14 * u, cy + 6 * u, 16 * u, 0, 6.283); ctx.arc(cx + 8 * u, cy - 4 * u, 22 * u, 0, 6.283); ctx.arc(cx + 24 * u, cy + 10 * u, 12 * u, 0, 6.283); ctx.fill(); ctx.fillRect(cx - 30 * u, cy + 8 * u, 66 * u, 14 * u); ctx.restore(); }
  }
  function shot1(ctx, S, lt, o) {
    const { P, T, pal, ty } = S;
    const lg = ap(S, lt, 0);
    if (!o.skipKey && lg.on) { ctx.save(); ctx.globalAlpha *= lg.a; logo(ctx, S, scaleRect(L, lerp(.3, 1, lg.e) * pop(S, lg.p)), pal.k[0], pal.kInk[0]); ctx.restore(); }
    const words = hookLayout(ctx, S);
    words.forEach((w, i) => {
      const a = ap(S, lt, T.words[i]); if (!a.on) return;
      ctx.save(); ctx.globalAlpha *= a.a; const sc = pop(S, a.p);
      ctx.translate(w.x, w.y - w.spec[1] * .35 + (1 - a.e) * 80); ctx.scale(sc, sc); ctx.translate(-w.x, -(w.y - w.spec[1] * .35));
      let col = pal.word[i];
      if (P.slop && i === 1) { const g = ctx.createLinearGradient(w.x - w.w / 2, 0, w.x + w.w / 2, 0); g.addColorStop(0, '#8B5CF6'); g.addColorStop(1, '#3B82F6'); col = g; }
      glow(ctx, S, i === 1); text(ctx, S, w.s, w.x, w.y, w.spec, col);
      if (i === 1 && !pal.multi) { ctx.shadowBlur = 0; ctx.fillStyle = pal.accent; const d = w.spec[1] * .075; ctx.beginPath(); ctx.arc(w.x + w.w / 2 + d * 1.9, w.y - d, d, 0, 6.283); ctx.fill(); }
      ctx.restore();
      if (i === 1) burst(ctx, S, lt - T.words[1], w.x, w.y - w.spec[1] * .35, 17);
    });
    const tg = ap(S, lt, T.tag);
    if (tg.on) { ctx.save(); ctx.globalAlpha *= tg.a; const s = 'Calm planning for busy teams'; text(ctx, S, ty.upper ? s.toUpperCase() : s, 800, (ty.one ? 612 : 690) + (1 - tg.e) * 40, ty.tag, pal.muted, 'center', ty.upper ? 5 : 0); ctx.restore(); }
    if (P.density === 'busy') {
      const b = T.busy.map(x => ap(S, lt, x)), dc = pal.multi ? pal.deco : [pal.ink, pal.accent, pal.muted, pal.accent];
      const ink2 = pal.dark ? '#131417' : '#FFFFFF';
      if (b[0].on) { ctx.save(); ctx.globalAlpha *= b[0].a; const y = 205 - (1 - b[0].e) * 50; pill(ctx, S, 555, y, 'NEW', dc[0], ink2); pill(ctx, S, 1060, y, 'AI-POWERED', dc[3], ink2); ctx.restore(); }
      const sy = ty.one ? 700 : 760;
      if (b[1].on) { ctx.save(); ctx.globalAlpha *= b[1].a; ctx.fillStyle = pal.multi ? '#FFB400' : pal.accent; for (let i = 0; i < 5; i++) { star(ctx, 640 + i * 44, sy - 12, 17 * pop(S, b[1].p)); ctx.fill(); } text(ctx, S, '4.9 / 5 rating', 870, sy, [SANS, 28, 600], pal.muted, 'left'); ctx.restore(); }
      if (b[2].on) { ctx.save(); ctx.globalAlpha *= b[2].a; const y = (ty.one ? 790 : 835) + (1 - b[2].e) * 60, sc = pop(S, b[2].p); ctx.translate(800, y); ctx.scale(sc, sc); ctx.save(); glow(ctx, S, true); ctx.fillStyle = dc[1]; rr(ctx, -200, -34, 400, 68, 34); ctx.fill(); ctx.restore(); text(ctx, S, 'Get started free  →', 0, 10, [SANS, 28, 700], ink2); ctx.restore(); }
      if (b[3].on) { ctx.save(); ctx.globalAlpha *= b[3].a; [[380, 330, 0], [1225, 300, 1], [1270, 560, 2], [320, 600, 3], [1130, 150, 0]].forEach(([x, y, c]) => { ctx.fillStyle = dc[c]; star(ctx, x, y, 22 * b[3].e * pop(S, b[3].p), 4, .3); ctx.fill(); }); ctx.restore(); }
    }
  }
  const T2 = ['Sync', 'Focus', 'Share'], SUB = ['every calendar', 'deep-work guard', 'one live plan'], BADGE = ['NEW', 'PRO', 'HOT'];
  function cardRect(S, lt) { return lerpRect(L, CARD, ap(S, lt, 0).e); }
  function tileRect(S, lt, i) { const ts = S.T.tiles[i] - S.T.c1; const cr = cardRect(S, lt); return lerpRect(third(cr, i), TILE(i), ap(S, lt, ts).e); }
  function shot2(ctx, S, lt, o) {
    const { P, T, pal, ty } = S;
    const ts = T.tiles.map(x => x - T.c1), split = lt >= ts[0] - 1e-6;
    const dc = pal.multi ? pal.deco : [pal.ink, pal.accent, pal.muted, pal.accent], ink2 = pal.dark ? '#131417' : '#FFFFFF';
    if (P.density === 'busy') { const hb = ap(S, lt, .12); if (hb.on) { ctx.save(); ctx.globalAlpha *= hb.a; glow(ctx, S, true); text(ctx, S, 'Powerful features for modern teams', 800, 190 - (1 - hb.e) * 40, [SANS, 48, 800], pal.ink); ctx.restore(); } }
    if (!split) { if (!o.skipKey) box(ctx, S, cardRect(S, lt), { fill: pal.k[1], key: true, rad: 22 }); }
    else {
      for (let i = 0; i < 3; i++) {
        if (o.skipKey && i === 1) continue;
        const a = ap(S, lt, ts[i]), r = tileRect(S, lt, i), sc = pop(S, a.p), rs = scaleRect(r, sc);
        const fill = i === 1 ? mixHex(pal.k[1], pal.tile[1], a.e) : mixHex(pal.k[1], pal.tile[i], clamp(a.e));
        box(ctx, S, rs, { fill, key: i === 1 && P.slop, stroke: pal.tileStroke && i !== 1 ? pal.tileStroke : null, lw: pal.strokeW || 2, rad: lerp(8, 22, clamp(a.e)) });
        const ca = clamp((lt - ts[i] - S.dur * .3) / (S.dur * .45));
        if (ca > 0) {
          ctx.save(); ctx.globalAlpha *= ca; const ink = pal.tileInk[i], x = rs.x + 40, dy = (1 - ca) * 24;
          glyph(ctx, i, x, rs.y + 40 + dy, 64, i === 1 || pal.multi ? ink : pal.accent === '#2E4BFF' ? pal.ink : ink);
          if (ty.idx) text(ctx, S, '0' + (i + 1), rs.x + rs.w - 36, rs.y + 66, ty.idx, hexA(ink, .6), 'right');
          text(ctx, S, T2[i], x, rs.y + rs.h - (ty.sub ? 84 : 48) + dy, ty.label, ink, 'left');
          if (ty.sub) text(ctx, S, SUB[i], x, rs.y + rs.h - 44 + dy, ty.sub, hexA(ink, .72), 'left');
          if (P.density === 'busy') {
            pill(ctx, S, rs.x + rs.w - 70, rs.y + 44, BADGE[i], i === 1 ? '#FFFFFF' : dc[(i + 2) % 4], i === 1 ? '#1E2230' : ink2);
            ctx.fillStyle = hexA(ink, .32); [220, 170, 200].forEach((bw, j) => { rr(ctx, x, rs.y + 150 + j * 30, bw, 12, 6); ctx.fill(); });
          }
          ctx.restore();
        }
        burst(ctx, S, lt - ts[i], r.x + r.w / 2, r.y + r.h / 2, 31 + i);
      }
    }
    if (P.density === 'busy') { const fb = ap(S, lt, ts[2] + .2); if (fb.on) { ctx.save(); ctx.globalAlpha *= fb.a; for (let i = 0; i < 5; i++) { ctx.fillStyle = dc[i % 4]; ctx.beginPath(); ctx.arc(560 + i * 34, 724, 13, 0, 6.283); ctx.fill(); } text(ctx, S, 'Trusted by 10,000+ teams', 760, 734, [SANS, 30, 600], pal.muted, 'left'); ctx.restore(); } }
  }
  function blockRect(S, lt) { return scaleRect(K, lerp(.82, 1, ap(S, lt, 0).e)); }
  function shot3(ctx, S, lt, o) {
    const { P, T, pal, ty } = S;
    const k = ap(S, lt, 0), r = scaleRect(blockRect(S, lt), pop(S, k.p));
    const dc = pal.multi ? pal.deco : [pal.ink, pal.accent, pal.muted, pal.accent], ink2 = pal.dark ? '#131417' : '#FFFFFF';
    if (P.density === 'busy') { const cf = ap(S, lt, .15); if (cf.on) { ctx.save(); ctx.globalAlpha *= cf.a; CONF.forEach((c, i) => { ctx.save(); ctx.translate(lerp(800, c.x, cf.e), lerp(390, c.y, cf.e)); ctx.rotate(c.rot + lt * 2); ctx.fillStyle = dc[i % 4]; ctx.fillRect(-c.s / 2, -c.s / 4, c.s, c.s / 2); ctx.restore(); }); ctx.restore(); } }
    if (!o.skipKey) { ctx.save(); ctx.globalAlpha *= k.a; box(ctx, S, r, { fill: pal.k[2], key: true, stroke: pal.dark ? pal.tileStroke : null, rad: 28 }); ctx.restore(); }
    const n = ap(S, lt, T.num - T.c2, 1.3);
    if (n.on && !(o.skipKey && lt < 0)) {
      ctx.save(); ctx.globalAlpha *= clamp(n.a * 1.5) * k.a; glow(ctx, S, true);
      const v = 3.2 * n.e; text(ctx, S, v.toFixed(1) + '×', 800, K.y + K.h / 2 + ty.num[1] * .34 + (1 - n.e) * 30, ty.num, pal.kInk[2]);
      ctx.restore(); burst(ctx, S, lt - (T.num - T.c2), 800, K.y + K.h / 2, 51);
    }
    const c = ap(S, lt, T.cap - T.c2);
    if (c.on) { ctx.save(); ctx.globalAlpha *= c.a; const s = 'faster weekly planning'; text(ctx, S, ty.upper ? s.toUpperCase() : s, 800, 700 + (1 - c.e) * 36, ty.cap, pal.ink, 'center', ty.upper ? 5 : 0); ctx.restore(); }
    const e = ap(S, lt, T.end - T.c2);
    if (e.on) { ctx.save(); ctx.globalAlpha *= e.a; const y = 792 + (1 - e.e) * 30; logo(ctx, S, { x: 692, y: y - 26, w: 40, h: 40 }, pal.k[0], pal.kInk[0]); text(ctx, S, 'nimbus.app', 748, y + 4, ty.end, pal.muted, 'left'); ctx.restore(); }
    if (P.density === 'busy') {
      const bb = ap(S, lt, .35); if (bb.on) { ctx.save(); ctx.globalAlpha *= bb.a; pill(ctx, S, 800, 150 - (1 - bb.e) * 40, '#1 PRODUCT OF THE DAY', dc[2], pal.multi ? '#1E2230' : ink2); pill(ctx, S, 1205, 250, '+320%', dc[0], ink2); ctx.restore(); }
      const jb = ap(S, lt, T.cap - T.c2 + .25); if (jb.on) { ctx.save(); ctx.globalAlpha *= jb.a; text(ctx, S, 'Join 10,000+ teams today', 800, 752, [SANS, 28, 600], pal.muted); ctx.restore(); }
    }
  }
  const SHOTS = [shot1, shot2, shot3];
  function keyRect(S, i, lt) {
    if (i === 0) { const a = ap(S, lt, 0); return scaleRect(L, lerp(.3, 1, a.e)); }
    if (i === 1) return lt < S.T.tiles[0] - S.T.c1 ? cardRect(S, lt) : tileRect(S, lt, 1);
    return blockRect(S, lt);
  }
  const keyRad = (i, r) => (i === 0 ? r.w * .24 : i === 1 ? 22 : 28);

  function drawShot(ctx, S, i, lt, o) {
    ctx.save();
    if (o.dx || o.dy) ctx.translate(o.dx || 0, o.dy || 0);
    if (o.alpha != null) ctx.globalAlpha *= clamp(o.alpha);
    applyCam(ctx, camera(S, i, lt));
    if (ctx.globalAlpha > 0.003) SHOTS[i](ctx, S, lt, o);
    ctx.restore();
  }
  function backdrop(ctx, S, cam) { drawBG(ctx, S); drawDeco(ctx, S, cam); }
  function drawTransition(ctx, S, ph) {
    const P = S.P, pal = S.pal, q = clamp(ph.q), e = S.E(q), ec = clamp(e);
    switch (P.transition) {
      case 'push': drawShot(ctx, S, ph.a, ph.la, { dy: -H * e }); drawShot(ctx, S, ph.b, ph.lb, { dy: H * (1 - e) }); break;
      case 'whip': {
        const sI = Math.sin(Math.PI * q);
        for (const k of [-1, 1]) { ctx.save(); ctx.globalAlpha *= .22 * sI; drawShot(ctx, S, ph.a, ph.la, { dx: -W * e + k * 90 * sI }); drawShot(ctx, S, ph.b, ph.lb, { dx: W * (1 - e) + k * 90 * sI }); ctx.restore(); }
        drawShot(ctx, S, ph.a, ph.la, { dx: -W * e }); drawShot(ctx, S, ph.b, ph.lb, { dx: W * (1 - e) });
        ctx.save(); STREAK.forEach(s => { ctx.fillStyle = hexA(pal.ink, .16 * sI); const x = lerp(W, -s.len, (q + s.off * .5) % 1); ctx.fillRect(x, s.y, s.len, s.th); }); ctx.restore();
        break;
      }
      case 'masked': {
        drawShot(ctx, S, ph.a, ph.la, { dy: -150 * ec, alpha: 1 - clamp(q * 1.25) });
        const hh = 470 * ec; ctx.save(); ctx.beginPath(); ctx.rect(0, 450 - hh, W, hh * 2); ctx.clip();
        backdrop(ctx, S, camera(S, ph.b, ph.lb)); drawShot(ctx, S, ph.b, ph.lb, { dy: 130 * (1 - e) }); ctx.restore();
        if (q < 1) { ctx.save(); ctx.fillStyle = hexA(pal.dark ? '#EDE8DF' : pal.ink, .55 * (1 - q)); ctx.fillRect(0, 450 - hh - 1.5, W, 3); ctx.fillRect(0, 450 + hh - 1.5, W, 3); ctx.restore(); }
        break;
      }
      case 'iris': {
        drawShot(ctx, S, ph.a, ph.la, {});
        const R = 940 * ec; ctx.save(); ctx.beginPath(); ctx.arc(800, 430, Math.max(.1, R), 0, 6.283); ctx.clip();
        backdrop(ctx, S, camera(S, ph.b, ph.lb)); drawShot(ctx, S, ph.b, ph.lb, {}); ctx.restore();
        ctx.save(); ctx.strokeStyle = hexA(pal.accent, .9 * (1 - q)); ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(800, 430, Math.max(.1, R), 0, 6.283); ctx.stroke(); ctx.restore();
        break;
      }
      case 'match': {
        drawShot(ctx, S, ph.a, ph.la, { alpha: 1 - clamp(q / .45), skipKey: true });
        drawShot(ctx, S, ph.b, ph.lb, { alpha: clamp((q - .55) / .45), skipKey: true });
        const cA = camera(S, ph.a, ph.la), cB = camera(S, ph.b, ph.lb), rA = keyRect(S, ph.a, ph.la), rB = keyRect(S, ph.b, ph.lb);
        ctx.save(); applyCam(ctx, blendCam(cA, cB, ec)); const r = lerpRect(rA, rB, e);
        box(ctx, S, r, { fill: mixHex(keyCol(S, ph.a, true), keyCol(S, ph.b, false), ec), key: true, rad: lerp(keyRad(ph.a, rA), keyRad(ph.b, rB), ec) });
        ctx.restore();
        break;
      }
      default: if (q < .5) drawShot(ctx, S, ph.a, ph.la, {}); else drawShot(ctx, S, ph.b, ph.lb, {});
    }
  }
  const wrap = t => ((t % LOOP) + LOOP) % LOOP;
  function shake(S, t) {
    if (!S.P.slop) return [0, 0]; let x = 0, y = 0;
    for (const ev of S.T.events) { const d = t - ev; if (d >= 0 && d < .28) { const k = 10 * (1 - d / .28); x += Math.sin(d * 115) * k; y += Math.cos(d * 97) * k; } }
    return [x, y];
  }
  function drawContent(ctx, S, tRaw) {
    const t = wrap(tRaw), ph = phase(S.T, t), [sx, sy] = shake(S, t);
    ctx.save(); ctx.translate(sx, sy);
    if (!ph.tr) drawShot(ctx, S, ph.a, ph.la, {}); else drawTransition(ctx, S, ph);
    ctx.restore();
    return ph;
  }

  // ── background / deco / overlays ───────────────────────────────────
  function radial(ctx, x, y, r, col) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, col.replace(/[\d.]+\)$/, '0)')); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
  function drawBG(ctx, S) {
    const P = S.P, pal = S.pal, t = S.t;
    ctx.fillStyle = pal.bg; ctx.fillRect(0, 0, W, H);
    if (P.texture === 'grain') { radial(ctx, 420, 180, 1000, pal.dark ? 'rgba(255,236,210,.07)' : 'rgba(255,255,255,.55)'); radial(ctx, 1380, 880, 900, pal.dark ? 'rgba(0,0,0,.45)' : 'rgba(60,50,30,.10)'); }
    if (P.texture === 'glass') {
      const u = Math.sin(t / LOOP * 6.283), v = Math.cos(t / LOOP * 6.283), bl = pal.blobs, al = pal.dark ? .42 : .62;
      radial(ctx, 520 + 90 * u, 360 + 50 * v, 460, hexA(bl[0], al)); radial(ctx, 1120 - 70 * u, 560 + 60 * u, 480, hexA(bl[1], al * .85)); radial(ctx, 820 + 40 * v, 140 + 40 * v, 360, hexA(bl[2], al * .7));
    }
    if (P.texture === 'halftone') ctx.drawImage(halftoneImg(pal), 0, 0, W, H);
    if (P.slop) { radial(ctx, 300, 180, 760, 'rgba(139,92,246,.30)'); radial(ctx, 1360, 780, 760, 'rgba(59,130,246,.26)'); }
  }
  function drawDeco(ctx, S, cam) {
    const P = S.P, pal = S.pal, f = P.camera === 'parallax' ? .35 : .2, s = 1 + (cam.s - 1) * .25;
    ctx.save(); ctx.translate(800, 450); ctx.scale(s, s); ctx.translate(-(800 + (cam.x - 800) * f), -(450 + (cam.y - 450) * f));
    if (P.density === 'busy') {
      if (pal.multi) { radial(ctx, 170, 760, 260, hexA(pal.deco[1], .16)); radial(ctx, 1450, 140, 260, hexA(pal.deco[2], .18)); }
      DECO.forEach((d, i) => {
        ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(d.rot); ctx.fillStyle = ctx.strokeStyle = pal.multi ? hexA(pal.deco[i % 4], .55) : hexA(pal.dark ? '#EDE8DF' : pal.ink, .22); ctx.lineWidth = 4;
        if (d.k === 0) { ctx.beginPath(); ctx.arc(0, 0, d.s * .5, 0, 6.283); ctx.fill(); } else if (d.k === 1) { ctx.strokeRect(-d.s / 2, -d.s / 2, d.s, d.s); } else { ctx.fillRect(-d.s / 2, -2, d.s, 4); ctx.fillRect(-2, -d.s / 2, 4, d.s); }
        ctx.restore();
      });
    } else {
      ctx.strokeStyle = pal.line; ctx.lineWidth = 2; ctx.globalAlpha = .9;
      ctx.beginPath(); ctx.arc(1340, 180, 118, 0, 6.283); ctx.stroke(); ctx.beginPath(); ctx.arc(1340, 180, 186, 0, 6.283); ctx.stroke();
      ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(110, 790); ctx.lineTo(1490, 790); ctx.stroke();
      for (let i = 0; i <= 8; i++) { const x = 110 + i * 172.5; ctx.beginPath(); ctx.moveTo(x, 790); ctx.lineTo(x, 776); ctx.stroke(); }
    }
    ctx.restore();
  }
  function drawForeground(ctx, S, cam) {
    if (S.P.camera !== 'parallax') return;
    const pal = S.pal, dx = -(cam.x - 800) * 1.8; ctx.save(); ctx.fillStyle = hexA(pal.dark ? '#EDE8DF' : pal.ink, .07);
    [[140, 180, 70], [1480, 700, 110], [260, 820, 46]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.arc(x + dx, y, r, 0, 6.283); ctx.fill(); });
    ctx.restore();
  }
  function drawBeats(ctx, S, t) {
    if (!S.P.onBeat) return;
    const pal = S.pal, cur = Math.floor(t / .5), fr = (t / .5) % 1, evs = new Set(S.T.events.map(e => Math.round(e / .5) % 12));
    const x0 = 800 - 5.5 * 44, y = 858, col = pal.dark ? '#EDE8DF' : pal.ink;
    ctx.save(); ctx.font = F([MONO, 20, 500]); ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillStyle = hexA(col, .5); ctx.fillText('120 BPM', x0 - 26, y - 6);
    for (let i = 0; i < 12; i++) {
      const on = i === cur % 12, hgt = (i % 4 === 0 ? 22 : 13) + (on ? 10 * (1 - fr) : 0);
      ctx.fillStyle = on ? S.pal.accent : hexA(col, i % 4 === 0 ? .45 : .28); ctx.fillRect(x0 + i * 44 - 3, y - hgt, 6, hgt);
      if (evs.has(i)) { ctx.fillStyle = hexA(col, .55); ctx.beginPath(); ctx.arc(x0 + i * 44, y + 12, 4, 0, 6.283); ctx.fill(); }
    }
    ctx.restore();
  }
  function drawOverlay(ctx, S, st) {
    const P = S.P;
    if (P.texture === 'grain') {
      const g = ctx.createRadialGradient(800, 450, 380, 800, 450, 1000); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, S.pal.dark ? 'rgba(0,0,0,.4)' : 'rgba(40,30,20,.14)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); const fi = Math.floor(S.t * 12); ctx.translate((fi * 37) % 128, (fi * 53) % 128);
      ctx.globalAlpha = S.pal.dark ? .3 : .2; ctx.fillStyle = ctx.createPattern(noiseTile(), 'repeat'); ctx.fillRect(-128, -128, st.cv.width + 256, st.cv.height + 256); ctx.restore();
    }
  }
  function drawChrome(ctx, t, sc0) {
    const px = Math.max(22, 10 / sc0);
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 1.5 / sc0; ctx.strokeRect(128, 36, 1344, 756);
    ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 2;
    [[128, 36, 1, 1], [1472, 36, -1, 1], [128, 792, 1, -1], [1472, 792, -1, -1]].forEach(([x, y, a, b]) => { ctx.beginPath(); ctx.moveTo(x - a * 22, y); ctx.lineTo(x - a * 8, y); ctx.moveTo(x, y - b * 22); ctx.lineTo(x, y - b * 8); ctx.stroke(); });
    const sec = Math.floor(t), fr = Math.floor((t % 1) * 30), pad = n => String(n).padStart(2, '0');
    ctx.font = F([MONO, px, 500]); ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left'; ctx.fillStyle = '#ECE9E2';
    ctx.fillText(`00:${pad(sec)}:${pad(fr)}`, 128, 846); ctx.fillStyle = '#77756F'; ctx.fillText(' / 00:06:00', 128 + ctx.measureText('00:00:00').width, 846);
    ctx.textAlign = 'right'; ctx.fillText('1920×1080 · fit · seek(t)', 1472, 846);
    ctx.fillStyle = 'rgba(255,255,255,.16)'; ctx.fillRect(128, 868, 1344, 4); ctx.fillStyle = '#2E4BFF'; ctx.fillRect(128, 868, 1344 * t / LOOP, 4);
    ctx.fillStyle = '#ECE9E2'; ctx.fillRect(128 + 1344 * t / LOOP - 2, 860, 4, 20);
    ctx.restore();
  }

  function render(st) {
    const { ctx, cv } = st; const cw = st.cw, ch = st.ch, dpr = st.dpr; if (!cw || !ch) return;
    const P = st.P; let t = wrap(st.t); if (P.onTwos) t = Math.floor(t * 12) / 12;
    const S = { P, T: timeline(P), pal: PAL[P.palette] || PAL.default, ty: TYPE[P.type] || TYPE.default, E: EASE[P.easing] || EASE.linear, dur: DUR[P.easing] || .6, t };
    const sc0 = Math.min(cw / W, ch / H), ox0 = (cw - W * sc0) / 2, oy0 = (ch - H * sc0) / 2;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = P.frame ? '#0B0B0D' : S.pal.bg; ctx.fillRect(0, 0, cv.width, cv.height);
    let sc = sc0, ox = ox0, oy = oy0;
    if (P.frame) { sc = sc0 * .84; ox = ox0 + 128 * sc0; oy = oy0 + 36 * sc0; }
    ctx.save(); ctx.setTransform(dpr * sc, 0, 0, dpr * sc, dpr * ox, dpr * oy); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
    const ph0 = phase(S.T, t), pcam = ph0.tr ? camera(S, ph0.b, ph0.lb) : camera(S, ph0.a, ph0.la);
    backdrop(ctx, S, pcam);
    if (P.blur) { [[.075, .12], [.05, .2], [.025, .32]].forEach(([d, a]) => { ctx.save(); ctx.globalAlpha = a; drawContent(ctx, S, t - d); ctx.restore(); }); }
    drawContent(ctx, S, t);
    drawForeground(ctx, S, pcam);
    drawBeats(ctx, S, t);
    drawOverlay(ctx, S, st);
    ctx.restore();
    if (P.frame) { ctx.save(); ctx.setTransform(dpr * sc0, 0, 0, dpr * sc0, dpr * ox0, dpr * oy0); drawChrome(ctx, wrap(st.t), sc0); ctx.restore(); }
  }

  // ── mount ──────────────────────────────────────────────────────────
  const ICON_PAUSE = '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><rect x="2" y="1.5" width="3" height="9" fill="currentColor"/><rect x="7" y="1.5" width="3" height="9" fill="currentColor"/></svg>';
  const ICON_PLAY = '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.5v9l7.5-4.5z" fill="currentColor"/></svg>';
  function mount(el) {
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.style.overflow = 'hidden';
    const cv = document.createElement('canvas'); cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;'; cv.setAttribute('aria-hidden', 'true'); el.appendChild(cv);
    const st = { P: Object.assign({}, DEF), t: T0, playing: !reduced, visible: true, dead: false, cv, ctx: cv.getContext('2d'), cw: 0, ch: 0, dpr: 1 };
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'scene-pp';
    btn.style.cssText = 'position:absolute;right:10px;bottom:10px;width:32px;height:32px;border-radius:50%;border:1px solid rgba(255,255,255,.28);background:rgba(15,17,21,.66);color:#fff;display:grid;place-items:center;cursor:pointer;padding:0;z-index:2';
    el.appendChild(btn);
    let big = null;
    if (reduced) { big = document.createElement('button'); big.type = 'button'; big.className = 'scene-big'; big.innerHTML = ICON_PLAY + '<span>播放动效</span>'; big.style.cssText = 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;gap:8px;align-items:center;padding:10px 16px;border-radius:999px;border:0;background:rgba(15,17,21,.78);color:#fff;font:600 14px/1 "Hanken Grotesk",system-ui,sans-serif;cursor:pointer;z-index:2'; el.appendChild(big); big.addEventListener('click', () => ctl.play()); }
    const syncBtn = () => { btn.innerHTML = st.playing ? ICON_PAUSE : ICON_PLAY; btn.setAttribute('aria-label', st.playing ? '暂停动效' : '播放动效'); if (big && st.playing) { big.remove(); big = null; } };
    btn.addEventListener('click', () => (st.playing ? ctl.pause() : ctl.play()));
    const fit = () => { const w = el.clientWidth, h = el.clientHeight, d = Math.min(window.devicePixelRatio || 1, 1.5); if (!w || !h) return; st.cw = w; st.ch = h; st.dpr = d; cv.width = Math.round(w * d); cv.height = Math.round(h * d); draw(); };
    const draw = () => { try { render(st); } catch (e) { console.error('[scene]', e); } };
    let raf = 0, last = 0;
    const loop = now => { raf = 0; if (st.dead) return; const dt = last ? Math.min(.05, (now - last) / 1000) : 0; last = now; if (st.playing && st.visible && !document.hidden) { st.t += dt; draw(); raf = requestAnimationFrame(loop); } else last = 0; };
    const kick = () => { if (!raf && !st.dead && st.playing && st.visible && !document.hidden) { last = 0; raf = requestAnimationFrame(loop); } };
    const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => { for (const e of es) st.visible = e.isIntersecting; kick(); }, { rootMargin: '80px' }) : null;
    if (io) io.observe(el);
    const ro = 'ResizeObserver' in window ? new ResizeObserver(fit) : null; if (ro) ro.observe(el); else window.addEventListener('resize', fit);
    const onVis = () => kick(); document.addEventListener('visibilitychange', onVis);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!st.dead) draw(); });
    const ctl = {
      set(partial) { Object.assign(st.P, partial || {}); draw(); return ctl; },
      get() { return Object.assign({}, st.P); },
      play() { st.playing = true; syncBtn(); kick(); },
      pause() { st.playing = false; syncBtn(); },
      restart() { st.t = 0; draw(); },
      seek(t) { st.t = t; draw(); },
      get playing() { return st.playing; },
      destroy() { st.dead = true; if (raf) cancelAnimationFrame(raf); if (io) io.disconnect(); if (ro) ro.disconnect(); document.removeEventListener('visibilitychange', onVis); cv.remove(); btn.remove(); if (big) big.remove(); },
    };
    syncBtn(); fit(); kick();
    return ctl;
  }
  window.SCENE = { mount, DEFAULTS: Object.assign({}, DEF), reduced };
})();
