/* Opus 5.5 动效词典 — demo runtime (shared by the page and the test harness).
 * Demos call LEX.register(id, { mount(el, api) { ...; return { frame, mode, param, resize, destroy } } }).
 * The host calls LEX.mount(id, el, opts) and gets a controller back.
 */
(function () {
  'use strict';
  const defs = Object.create(null);
  const live = new Set();
  const reduced = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const DPR = () => Math.min(window.devicePixelRatio || 1, 1.5);

  // ── helpers exposed on api ─────────────────────────────────────────
  function rng(seed) { // mulberry32
    let a = (seed >>> 0) || 1;
    return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = {
    linear: t => clamp(t),
    inOut: t => { t = clamp(t); return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; },
    in: t => { t = clamp(t); return t * t * t; },
    out: t => { t = clamp(t); return 1 - Math.pow(1 - t, 3); },
    expoOut: t => { t = clamp(t); return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); },
    // closed-form damped spring step response; zeta<1 overshoots. t in seconds.
    spring: (t, freq = 2.2, zeta = 0.62) => {
      if (t <= 0) return 0; const w = 2 * Math.PI * freq;
      if (zeta >= 1) return 1 - (1 + w * t) * Math.exp(-w * t);
      const wd = w * Math.sqrt(1 - zeta * zeta);
      return 1 - Math.exp(-zeta * w * t) * (Math.cos(wd * t) + (zeta * w / wd) * Math.sin(wd * t));
    },
    // zeta chosen so that peak overshoot ≈ given fraction (e.g. 0.06)
    zetaFor: overshoot => { if (overshoot <= 0) return 1; const l = Math.log(overshoot); return -l / Math.sqrt(Math.PI * Math.PI + l * l); },
    bouncy: t => { t = clamp(t); const n = 7.5625, d = 2.75; if (t < 1 / d) return n * t * t; if (t < 2 / d) return n * (t -= 1.5 / d) * t + .75; if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + .9375; return n * (t -= 2.625 / d) * t + .984375; },
  };
  const FONTS = {
    serif: '"Newsreader", "Songti SC", "STSong", "Noto Serif SC", Georgia, serif',
    sans: '"Hanken Grotesk", "PingFang SC", "Hiragino Sans GB", "Noto Sans SC", "Microsoft YaHei", system-ui, sans-serif',
    mono: '"JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace',
  };
  const COLORS = { // fixed specimen-stage palette (does not follow page theme)
    stage: '#E9E6DF', stage2: '#DEDAD1', ink: '#17171A', muted: '#77756F', line: '#C9C4BA',
    accent: '#2E4BFF', accent2: '#F2B544', night: '#0F1115', nightInk: '#ECE9E2', bad: '#D8453B', good: '#1F9D6B',
  };

  COLORS.paper = '#F4F2EE'; COLORS.accentSoft = '#DCE2FF'; COLORS.inkSoft = '#3A3A40'; COLORS.nightLine = '#2A2E36';

  // ── shared drawing kit (v2 visual system) ─────────────────────────
  // Every demo draws with these so 75 specimens read as one set.
  const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; };
  const SHADOW = { // elevation → [offsetY, blur, alpha] pairs (ink colored, soft)
    1: [[1, 2, .06], [4, 12, .08]], 2: [[1, 2, .06], [8, 24, .12]], 3: [[2, 4, .06], [18, 44, .18]],
  };
  const grainCache = new Map();
  const kit = {
    rgba,
    seg: (t, a, b) => clamp((t - a) / (b - a)),                    // 0..1 progress of t within [a,b]
    loop: (t, period) => ((t % period) + period) % period,
    rr(ctx, x, y, w, h, r) { r = Math.max(0, Math.min(r, w / 2, h / 2)); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); },
    // soft elevated card. o: {r, fill, stroke, elev 0-3, night}
    card(ctx, x, y, w, h, o = {}) {
      const r = o.r ?? Math.min(w, h) * 0.08, elev = o.elev ?? 2;
      if (elev) for (const [oy, bl, a] of SHADOW[elev] || SHADOW[2]) { ctx.save(); ctx.shadowColor = rgba('#17171A', a * (o.night ? 2.2 : 1)); ctx.shadowBlur = bl; ctx.shadowOffsetY = oy; kit.rr(ctx, x, y, w, h, r); ctx.fillStyle = o.fill || COLORS.paper; ctx.fill(); ctx.restore(); }
      kit.rr(ctx, x, y, w, h, r); ctx.fillStyle = o.fill || COLORS.paper; ctx.fill();
      if (o.stroke) { ctx.lineWidth = 1; ctx.strokeStyle = o.stroke; ctx.stroke(); }
    },
    // CSS equivalents for DOM demos
    css: {
      shadow1: '0 1px 2px rgba(23,23,26,.06), 0 4px 12px rgba(23,23,26,.08)',
      shadow2: '0 1px 2px rgba(23,23,26,.06), 0 8px 24px rgba(23,23,26,.12)',
      shadow3: '0 2px 4px rgba(23,23,26,.06), 0 18px 44px rgba(23,23,26,.18)',
      radius: '10px',
    },
    // phone frame; returns inner screen rect {x,y,w,h,r}
    phone(ctx, x, y, w, h, o = {}) {
      const r = w * 0.16; kit.card(ctx, x, y, w, h, { r, fill: COLORS.ink, elev: o.elev ?? 2 });
      const b = Math.max(2, w * 0.04), s = { x: x + b, y: y + b, w: w - 2 * b, h: h - 2 * b, r: r - b };
      kit.rr(ctx, s.x, s.y, s.w, s.h, s.r); ctx.fillStyle = o.screen || (o.dark ? COLORS.night : COLORS.paper); ctx.fill();
      ctx.fillStyle = COLORS.ink; kit.rr(ctx, x + w * 0.36, s.y + s.h * 0.018, w * 0.28, Math.max(3, s.h * 0.03), 99); ctx.fill();
      return s;
    },
    // browser window; returns inner viewport rect
    browser(ctx, x, y, w, h, o = {}) {
      const r = Math.min(w, h) * 0.035; kit.card(ctx, x, y, w, h, { r, fill: o.fill || COLORS.paper, elev: o.elev ?? 2, stroke: o.night ? null : rgba('#17171A', .06) });
      const bar = Math.max(10, h * 0.075); ctx.save(); kit.rr(ctx, x, y, w, h, r); ctx.clip();
      ctx.fillStyle = o.night ? '#1A1D23' : COLORS.stage2; ctx.fillRect(x, y, w, bar); ctx.restore();
      const d = bar * 0.28; [0, 1, 2].forEach(i => { ctx.beginPath(); ctx.arc(x + bar * 0.6 + i * d * 2.6, y + bar / 2, d, 0, 7); ctx.fillStyle = o.night ? '#3A3F48' : COLORS.line; ctx.fill(); });
      return { x, y: y + bar, w, h: h - bar, r };
    },
    // fictional brand mark "Nimbus" — a disc with a crescent cut. Use for product/logo stand-ins.
    logo(ctx, cx, cy, s, color = COLORS.accent, bg = COLORS.stage) {
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, s / 2, 0, 7); ctx.fillStyle = color; ctx.fill();
      ctx.beginPath(); ctx.arc(cx + s * 0.2, cy - s * 0.14, s * 0.3, 0, 7); ctx.fillStyle = bg; ctx.fill(); ctx.restore();
    },
    // cached film-grain overlay; amount 0..1
    grain(ctx, w, h, amount = 0.08, seed = 7) {
      const key = seed; let p = grainCache.get(key);
      if (!p) { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), im = g.createImageData(128, 128), r = rng(seed); for (let i = 0; i < im.data.length; i += 4) { const v = r() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } g.putImageData(im, 0, 0); p = c; grainCache.set(key, p); }
      ctx.save(); ctx.globalAlpha = amount; ctx.globalCompositeOperation = 'overlay'; ctx.fillStyle = ctx.createPattern(p, 'repeat'); ctx.fillRect(0, 0, w, h); ctx.restore();
    },
    // small mono specimen label (HUD). size scales with stage height; min 10px
    label(ctx, text, x, y, o = {}) {
      const h = o.h || 225; ctx.save(); ctx.font = `${o.weight || 500} ${Math.max(10, Math.round(h * (o.scale || 0.042)))}px ${FONTS.mono}`;
      ctx.fillStyle = o.color || COLORS.muted; ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.baseline || 'alphabetic';
      if (o.spacing !== false && 'letterSpacing' in ctx) ctx.letterSpacing = '0.04em';
      ctx.fillText(text, x, y); ctx.restore();
    },
    // largest px (≤ px) so text fits maxW with given role/weight
    fit(ctx, text, maxW, role, px, weight = 400) { for (let p = px; p > 6; p -= 1) { ctx.font = `${weight} ${p}px ${FONTS[role] || FONTS.sans}`; if (ctx.measureText(text).width <= maxW) return p; } return 6; },
    // placeholder text line (for UI mockups) — rounded bar
    line(ctx, x, y, w, th, color = COLORS.line) { kit.rr(ctx, x, y - th / 2, w, th, th / 2); ctx.fillStyle = color; ctx.fill(); },
  };

  // ── one global rAF ────────────────────────────────────────────────
  let last = 0, rafId = 0;
  function tick(now) {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016; last = now;
    for (const inst of live) {
      if (!inst.visible || !inst.playing || inst.dead) continue;
      inst.t += dt;
      if (inst.autoAB && !inst.userTouched && !inst.hover && inst.def_has_ab) {
        inst.abClock += dt;
        if (inst.abClock >= inst.abPeriod) { inst.abClock = 0; inst.setMode(inst.mode ? 0 : 1, true); }
      }
      if (inst.ghostOn) inst.updateGhost();
      try { inst.hooks.frame && inst.hooks.frame(inst.t, dt); }
      catch (e) { inst.fail(e); }
    }
    rafId = requestAnimationFrame(tick);
  }
  function ensureLoop() { if (!rafId) { last = 0; rafId = requestAnimationFrame(tick); } }
  document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(rafId); rafId = 0; } else ensureLoop(); });

  const io = ('IntersectionObserver' in window) ? new IntersectionObserver(entries => {
    for (const en of entries) { const inst = en.target.__lexInst; if (inst) inst.visible = en.isIntersecting; }
  }, { rootMargin: '120px' }) : null;

  // ── mount ─────────────────────────────────────────────────────────
  function mount(id, el, opts = {}) {
    const def = defs[id];
    el.innerHTML = '';
    el.style.position = el.style.position || 'relative';
    el.style.overflow = 'hidden';
    el.classList.add('lx-stage');
    if (!def) { el.innerHTML = '<div class="lx-missing">演示待补</div>'; return null; }

    const inst = {
      id, el, t: 0, visible: !io, playing: opts.autoplay !== false && !(reduced && !opts.ignoreReduced), dead: false,
      mode: opts.mode ?? 1, params: Object.assign({}, opts.params || {}), autoAB: opts.autoAB !== false, abPeriod: opts.abPeriod || 3.6, abClock: 0,
      def_has_ab: !!opts.hasAB, userTouched: false, hover: false, hooks: {}, listeners: [],
      pointer: { x: 0.5, y: 0.5, inside: false, down: false, px: 0, py: 0 }, ghostOn: false, ghostT: 0,
    };
    el.__lexInst = inst;

    const api = {
      el, get w() { return el.clientWidth; }, get h() { return el.clientHeight; }, get dpr() { return DPR(); },
      get mode() { return inst.mode; }, get params() { return inst.params; }, get t() { return inst.t; },
      reduced, rng, clamp, lerp, ease, fonts: FONTS, colors: COLORS, kit,
      font: (role, px, weight = 400, style = '') => `${style} ${weight} ${px}px ${FONTS[role] || FONTS.sans}`.trim(),
      pointer: inst.pointer,
      // smooth autoplay path (normalized 0..1) for when the real pointer is absent
      ghost: (t, seed = 0) => ({ x: 0.5 + 0.34 * Math.sin(t * 0.73 + seed) * Math.cos(t * 0.31 + seed * 2), y: 0.5 + 0.30 * Math.sin(t * 0.52 + 1.7 + seed) }),
      canvas(o = {}) {
        const cv = document.createElement('canvas');
        cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;' + (o.style || '');
        el.appendChild(cv);
        const ctx = cv.getContext(o.context || '2d', o.contextAttrs);
        const c = { cv, ctx, w: 0, h: 0 };
        const fit = () => {
          const w = el.clientWidth, h = el.clientHeight, d = DPR();
          if (!w || !h) return; c.w = w; c.h = h; cv.width = Math.round(w * d); cv.height = Math.round(h * d);
          if (ctx && ctx.setTransform) ctx.setTransform(d, 0, 0, d, 0, 0);
        };
        fit(); inst.fitters = (inst.fitters || []).concat(fit); return c;
      },
      div(css = '', html = '') { const d = document.createElement('div'); d.style.cssText = css; d.innerHTML = html; el.appendChild(d); return d; },
      on(target, type, fn, o) { target.addEventListener(type, fn, o); inst.listeners.push([target, type, fn, o]); },
      onClick(fn) { api.on(el, 'click', e => { inst.userTouched = true; fn(e); }); },
      touch() { inst.userTouched = true; },
    };

    inst.fail = (e) => { inst.dead = true; console.error('[lex demo ' + id + ']', e); const m = document.createElement('div'); m.className = 'lx-missing'; m.textContent = '演示出错'; el.appendChild(m); };
    inst.updateGhost = () => {};
    inst.setMode = (m, fromAuto) => { inst.mode = m ? 1 : 0; if (!fromAuto) { inst.userTouched = true; inst.abClock = 0; } try { inst.hooks.mode && inst.hooks.mode(inst.mode); } catch (e) { inst.fail(e); } opts.onMode && opts.onMode(inst.mode, !!fromAuto); };

    // pointer tracking in element coords
    const pm = e => { const r = el.getBoundingClientRect(); const p = inst.pointer; p.px = e.clientX - r.left; p.py = e.clientY - r.top; p.x = r.width ? p.px / r.width : .5; p.y = r.height ? p.py / r.height : .5; p.inside = true; };
    api.on(el, 'pointermove', pm); api.on(el, 'pointerdown', e => { pm(e); inst.pointer.down = true; });
    api.on(window, 'pointerup', () => { inst.pointer.down = false; });
    api.on(el, 'pointerenter', () => { inst.hover = true; });
    api.on(el, 'pointerleave', () => { inst.hover = false; inst.pointer.inside = false; inst.pointer.down = false; });

    let ro = null;
    if ('ResizeObserver' in window) { ro = new ResizeObserver(() => { (inst.fitters || []).forEach(f => f()); try { inst.hooks.resize && inst.hooks.resize(el.clientWidth, el.clientHeight); if (!inst.dead && !(inst.visible && inst.playing)) inst.hooks.frame && inst.hooks.frame(inst.t, 0); } catch (e) { inst.fail(e); } }); ro.observe(el); }   // resizing clears the canvas: a paused demo must redraw its current frame

    try { inst.hooks = def.mount(el, api) || {}; } catch (e) { inst.fail(e); }
    try { for (const [k, v] of Object.entries(inst.params)) inst.hooks.param && inst.hooks.param(k, v); } catch (e) { inst.fail(e); }
    try { inst.hooks.mode && inst.hooks.mode(inst.mode); } catch (e) { inst.fail(e); }
    try { inst.hooks.frame && inst.hooks.frame(0, 0); } catch (e) { inst.fail(e); } // complete first frame

    live.add(inst); if (io) io.observe(el); ensureLoop();

    const ctl = {
      id, get mode() { return inst.mode; }, get playing() { return inst.playing; }, get t() { return inst.t; },
      // combo demos: which keyword ids are on screen right now (mode B only)
      active: () => { try { return (inst.hooks.active && inst.hooks.active(inst.t, inst.mode)) || []; } catch (e) { return []; } },
      setMode: m => inst.setMode(m, false),
      setParam: (k, v) => { inst.params[k] = v; inst.userTouched = true; try { inst.hooks.param && inst.hooks.param(k, v); } catch (e) { inst.fail(e); } },
      play: () => { inst.playing = true; ensureLoop(); }, pause: () => { inst.playing = false; },
      restart: () => { inst.t = 0; try { inst.hooks.restart ? inst.hooks.restart() : (inst.hooks.mode && inst.hooks.mode(inst.mode)); } catch (e) { inst.fail(e); } },
      // jump to local time x (seconds) and draw that frame, also while paused
      seek: x => { ctl.restart(); try { inst.hooks.frame && inst.hooks.frame(0, 0); inst.t = Math.max(0, +x || 0); inst.hooks.frame && inst.hooks.frame(inst.t, 0); } catch (e) { inst.fail(e); } },
      destroy: () => {
        inst.dead = true; live.delete(inst); if (io) io.unobserve(el); if (ro) ro.disconnect();
        for (const [t, ty, fn, o] of inst.listeners) t.removeEventListener(ty, fn, o);
        try { inst.hooks.destroy && inst.hooks.destroy(); } catch (e) { console.error(e); }
        el.innerHTML = ''; el.__lexInst = null;
      },
    };
    return ctl;
  }

  window.LEX = {
    register(id, def) { if (defs[id]) console.warn('[lex] duplicate demo', id); defs[id] = def; },
    has: id => !!defs[id], ids: () => Object.keys(defs), mount, reduced, fonts: FONTS, colors: COLORS, ease, rng,
    pauseAll() { for (const i of live) i.playing = false; }, playAll() { for (const i of live) i.playing = true; ensureLoop(); },
  };
})();
