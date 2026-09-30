/* Lexicon group D — L3 生成氛围 (4) + L4 滚动驱动 (6) + L4 指针驱动 (4) + L4 状态反馈 (3) + L4 声音 (1). See LEXSPEC.md for the contract. */
(function () {
  'use strict';
  const TAU = Math.PI * 2;

  function rr(ctx, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, Math.min(w, h) / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }
  function hexToRgb(hex) { const n = parseInt(String(hex).replace('#', ''), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function hexA(hex, a) { const c = hexToRgb(hex); const al = Math.max(0, Math.min(1, a)); return `rgba(${c[0]},${c[1]},${c[2]},${al})`; }
  function lerpColor(a, b, t) {
    const A = hexToRgb(a), B = hexToRgb(b);
    return `rgb(${Math.round(A[0] + (B[0] - A[0]) * t)},${Math.round(A[1] + (B[1] - A[1]) * t)},${Math.round(A[2] + (B[2] - A[2]) * t)})`;
  }
  // small glowing marker for the auto-demo "ghost" pointer, drawn on canvas
  function drawGhostMark(ctx, x, y, C, alpha = 0.85) {
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(x, y, 3.5, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.accent; ctx.globalAlpha = alpha * 0.55; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(x, y, 8, 0, TAU); ctx.stroke();
    ctx.restore();
  }
  // same, as a DOM dot, for demos built from real elements
  function ghostDot(api, C) {
    const d = api.div(`position:absolute;width:9px;height:9px;left:0;top:0;margin:-4.5px 0 0 -4.5px;border-radius:50%;background:${C.accent};opacity:0;pointer-events:none;box-shadow:0 0 10px 2px ${hexA(C.accent, 0.35)};z-index:5;`);
    return { el: d, set(x, y, visible) { d.style.left = x + 'px'; d.style.top = y + 'px'; d.style.opacity = visible ? '0.85' : '0'; } };
  }

  // Inner scrollable mini-window shared by every scroll-driven demo: a thin-scrollbar
  // overflow box holding a tall spacer/content div. Auto-scrolls slowly, ping-ponging
  // top<->bottom on an ~8s cycle, and pauses for 3s after real wheel/touch/drag input.
  function scrollBox(el, api, opts = {}) {
    const mult = opts.mult || 3, cycle = opts.cycle || 8;
    const scroller = document.createElement('div');
    scroller.style.cssText = 'position:absolute;inset:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;';
    scroller.style.scrollbarWidth = 'thin';
    el.appendChild(scroller);
    const content = document.createElement('div');
    content.style.cssText = 'position:relative;width:100%;';
    scroller.appendChild(content);
    const st = { pausedUntil: -1, dir: 1, lastT: 0, pos: 0 }; // pos: float auto-scroll position (scrollTop rounds to px)
    const setH = () => { content.style.height = Math.max(40, Math.round(el.clientHeight * mult)) + 'px'; };
    setH();
    const bump = () => { st.pausedUntil = st.lastT + 3; };
    // our own writes also fire 'scroll' (async); only a position that differs from ours is the user's
    api.on(scroller, 'scroll', () => { if (Math.abs(scroller.scrollTop - st.pos) > 2) { st.pos = scroller.scrollTop; bump(); } }, { passive: true });
    api.on(scroller, 'wheel', bump, { passive: true });
    api.on(scroller, 'touchstart', bump, { passive: true });
    api.on(scroller, 'pointerdown', bump);
    function update(t, dt) {
      st.lastT = t;
      const max = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
      if (max <= 0) return 0;
      if (t >= st.pausedUntil) {
        const speed = max / (cycle / 2);
        let next = st.pos + st.dir * speed * (dt || 0.016);
        if (next >= max) { next = max; st.dir = -1; } else if (next <= 0) { next = 0; st.dir = 1; }
        st.pos = next; scroller.scrollTop = next;
      }
      return scroller.scrollTop / max;
    }
    return { scroller, content, update, setH };
  }

  // Shared "object made of parts" used by pinned-scrub (scroll-driven) and
  // exploded-view (hover/auto-driven): explode in [0,1], 0 = assembled.
  function drawAssembly(ctx, w, h, C, api, explode) {
    const cx = w / 2, cy = h * 0.46, baseR = Math.min(w, h) * 0.085;
    const parts = [
      { a: -Math.PI / 2, shape: 'rect', w: baseR * 2.7, h: baseR * 1.2, label: '01' },
      { a: Math.PI / 7, shape: 'circle', r: baseR * 0.85, label: '02' },
      { a: Math.PI * 0.8, shape: 'circle', r: baseR * 0.7, label: '03' },
      { a: Math.PI / 2, shape: 'rect', w: baseR * 1.5, h: baseR * 1.5, label: '04' },
    ];
    const dist = Math.min(w, h) * 0.26 * explode;
    ctx.save();
    ctx.strokeStyle = C.line; ctx.lineWidth = 1;
    parts.forEach(p => {
      if (explode > 0.05) {
        const px = cx + Math.cos(p.a) * dist, py = cy + Math.sin(p.a) * dist;
        ctx.globalAlpha = api.clamp(explode * 1.4, 0, 1) * 0.65;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
      }
    });
    ctx.globalAlpha = 1;
    ctx.fillStyle = C.ink;
    rr(ctx, cx - baseR * 0.85, cy - baseR * 0.85, baseR * 1.7, baseR * 1.7, 6); ctx.fill();
    parts.forEach((p, i) => {
      const px = cx + Math.cos(p.a) * dist, py = cy + Math.sin(p.a) * dist;
      ctx.fillStyle = i % 2 === 0 ? C.accent : C.muted;
      if (p.shape === 'rect') { rr(ctx, px - p.w / 2, py - p.h / 2, p.w, p.h, 4); ctx.fill(); }
      else { ctx.beginPath(); ctx.arc(px, py, p.r, 0, TAU); ctx.fill(); }
      if (explode > 0.32) {
        ctx.globalAlpha = api.clamp((explode - 0.32) / 0.28, 0, 1);
        ctx.fillStyle = C.muted; ctx.font = api.font('mono', Math.max(9, h * 0.045), 500);
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        const s = Math.cos(p.a) >= 0 ? 1 : -1;
        const lx = px + s * ((p.shape === 'rect' ? p.w / 2 : p.r) + 8);
        ctx.textAlign = s > 0 ? 'left' : 'right';
        ctx.fillText(p.label, lx, py);
        ctx.globalAlpha = 1;
      }
    });
    ctx.restore();
  }

  // ════════════════════════════════════ 生成氛围 ════════════════════════════════════

  LEX.register('aurora', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      const bands = [
        { hue: C.accent, base: 0.32, amp: 0.10, freq: 1.3, speed: 0.10, seed: 1.1, a: 0.55, wMul: 1 },
        { hue: C.nightInk, base: 0.50, amp: 0.12, freq: 1.7, speed: 0.07, seed: 3.6, a: 0.20, wMul: 1.1 },
        { hue: C.accent2, base: 0.63, amp: 0.08, freq: 2.0, speed: 0.13, seed: 7.2, a: 0.16, wMul: 0.8 },
      ];
      return {
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.night; ctx.fillRect(0, 0, w, h);
          let px, py, real;
          if (api.pointer.inside) { px = api.pointer.px; py = api.pointer.py; real = true; }
          else { const g = api.ghost(t, 6); px = g.x * w; py = g.y * h; real = false; }
          ctx.globalCompositeOperation = 'lighter';
          bands.forEach(band => {
            const N = 36, pts = [];
            for (let i = 0; i <= N; i++) {
              const u = i / N, x = u * w;
              let y = h * (band.base + band.amp * Math.sin(u * TAU * band.freq + t * band.speed * TAU + band.seed));
              const dx = x - px, sigma = w * 0.18;
              y += Math.exp(-(dx * dx) / (2 * sigma * sigma)) * (py - y) * 0.3;
              pts.push([x, y]);
            }
            const grad = ctx.createLinearGradient(0, 0, w, 0);
            grad.addColorStop(0, hexA(band.hue, 0));
            grad.addColorStop(0.5, hexA(band.hue, band.a));
            grad.addColorStop(1, hexA(band.hue, 0));
            ctx.strokeStyle = grad; ctx.lineWidth = h * 0.1 * band.wMul; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            ctx.beginPath(); pts.forEach((p, i) => i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1])); ctx.stroke();
          });
          ctx.globalCompositeOperation = 'source-over';
          if (!real) drawGhostMark(ctx, px, py, C, 0.5);
        },
      };
    },
  });

  LEX.register('feedback-trail', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      let rot = 0.008;
      let bufA = document.createElement('canvas'), bufB = document.createElement('canvas');
      let cur = bufA, nxt = bufB, bw = 0, bh = 0;
      function ensureSize() {
        const w = api.w, h = api.h; if (w === bw && h === bh || !w || !h) return;
        bw = w; bh = h; bufA.width = bufB.width = Math.max(1, w); bufA.height = bufB.height = Math.max(1, h);
      }
      return {
        param(name, v) { if (name === 'rot') rot = v; },
        resize() { bw = 0; },
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ensureSize();
          const nctx = nxt.getContext('2d');
          nctx.clearRect(0, 0, w, h);
          nctx.save();
          nctx.globalAlpha = 0.93;
          nctx.translate(w / 2, h / 2); nctx.rotate(rot); nctx.scale(1.012, 1.012); nctx.translate(-w / 2, -h / 2);
          nctx.drawImage(cur, 0, 0, w, h);
          nctx.restore();
          const n = 7;
          nctx.save();
          nctx.translate(w / 2, h / 2);
          nctx.globalCompositeOperation = 'lighter';
          for (let i = 0; i < n; i++) {
            const a = (i / n) * TAU + t * 0.6;
            const len = h * 0.16 * (0.5 + 0.5 * Math.sin(t * 2.3 + i * 1.7));
            nctx.strokeStyle = i % 2 === 0 ? C.accent : C.accent2;
            nctx.globalAlpha = 0.55; nctx.lineWidth = Math.max(1, h * 0.01);
            nctx.beginPath(); nctx.moveTo(0, 0); nctx.lineTo(Math.cos(a) * len, Math.sin(a) * len); nctx.stroke();
          }
          nctx.restore();
          const tmp = cur; cur = nxt; nxt = tmp;
          ctx.fillStyle = C.night; ctx.fillRect(0, 0, w, h);
          ctx.drawImage(cur, 0, 0, w, h);
        },
      };
    },
  });

  LEX.register('flow-field', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      const rnd = api.rng(11);
      const N = 420;
      const parts = Array.from({ length: N }, () => ({ x: rnd(), y: rnd(), age: rnd() * 4 }));
      let inited = false;
      return {
        frame(t, dt) {
          const w = api.w, h = api.h; if (!w) return;
          if (!inited) { ctx.fillStyle = C.night; ctx.fillRect(0, 0, w, h); inited = true; }
          ctx.fillStyle = 'rgba(15,17,21,0.10)'; ctx.fillRect(0, 0, w, h);
          let px, py, real;
          if (api.pointer.inside) { px = api.pointer.px; py = api.pointer.py; real = true; }
          else { const g = api.ghost(t, 2); px = g.x * w; py = g.y * h; real = false; }
          const step = Math.max(0.001, Math.min(0.05, dt || 0.016));
          ctx.lineWidth = 1; ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.5; ctx.strokeStyle = C.accent;
          const minwh = Math.min(w, h);
          for (const pt of parts) {
            const x = pt.x * w, y = pt.y * h;
            let ang = Math.sin(x * 0.006 + t * 0.15) * Math.PI + Math.cos(y * 0.007 - t * 0.11) * Math.PI * 0.6;
            const dx = px - x, dy = py - y, d2 = dx * dx + dy * dy;
            if (d2 < (minwh * 0.5) * (minwh * 0.5)) {
              const vortex = Math.atan2(dy, dx) + Math.PI / 2;
              const wgt = Math.exp(-d2 / (2 * (minwh * 0.16) * (minwh * 0.16)));
              ang = ang * (1 - wgt) + vortex * wgt;
            }
            const sp = minwh * 0.22;
            const nx = pt.x + (Math.cos(ang) * sp * step) / w;
            const ny = pt.y + (Math.sin(ang) * sp * step) / h;
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(nx * w, ny * h); ctx.stroke();
            pt.x = nx; pt.y = ny; pt.age += step;
            if (pt.x < 0 || pt.x > 1 || pt.y < 0 || pt.y > 1 || pt.age > 6) { pt.x = rnd(); pt.y = rnd(); pt.age = 0; }
          }
          ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
          if (!real) drawGhostMark(ctx, px, py, C);
        },
      };
    },
  });

  LEX.register('rain-bokeh', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      const rnd = api.rng(21);
      const far = Array.from({ length: 130 }, () => ({ x: rnd(), y: rnd(), len: 0.02 + rnd() * 0.02, sp: 0.22 + rnd() * 0.12 }));
      const near = Array.from({ length: 46 }, () => ({ x: rnd(), y: rnd(), len: 0.05 + rnd() * 0.04, sp: 0.5 + rnd() * 0.22 }));
      const bokeh = Array.from({ length: 7 }, () => ({ x: rnd(), y: rnd() * 0.6, r: 0.03 + rnd() * 0.05, ph: rnd() * TAU, warm: rnd() > 0.4 }));
      return {
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.night; ctx.fillRect(0, 0, w, h);
          bokeh.forEach(b => {
            const breathe = 0.6 + 0.4 * Math.sin(t * 0.35 + b.ph);
            const r = b.r * Math.min(w, h) * (0.85 + 0.3 * breathe);
            const x = b.x * w, y = b.y * h, col = b.warm ? C.accent2 : C.nightInk;
            const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
            grad.addColorStop(0, hexA(col, 0.5 * breathe));
            grad.addColorStop(1, hexA(col, 0));
            ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
          });
          ctx.strokeStyle = hexA(C.nightInk, 0.26); ctx.lineWidth = 1;
          far.forEach(d => {
            const y = ((d.y + t * d.sp * 0.15) % 1) * h;
            ctx.beginPath(); ctx.moveTo(d.x * w, y); ctx.lineTo(d.x * w - h * 0.01, y + h * d.len); ctx.stroke();
          });
          ctx.strokeStyle = hexA(C.nightInk, 0.5); ctx.lineWidth = 2;
          near.forEach(d => {
            const y = ((d.y + t * d.sp * 0.3) % 1) * h;
            ctx.beginPath(); ctx.moveTo(d.x * w, y); ctx.lineTo(d.x * w - h * 0.025, y + h * d.len); ctx.stroke();
          });
        },
      };
    },
  });

  // ════════════════════════════════════ 滚动驱动 ════════════════════════════════════

  LEX.register('pinned-scrub', {
    mount(el, api) {
      const rig = scrollBox(el, api, { mult: 3.2, cycle: 8 });
            // local auto-scroll driver: pings between the ends with a short dwell, pauses 3s after real input
      const sc = rig.scroller; let pos = 0, dir = 1, expect = 0, pausedUntil = -1, dwellUntil = 0, lastT = 0;
      const bump = () => { pausedUntil = lastT + 3; };
      api.on(sc, 'scroll', () => { if (Math.abs(sc.scrollTop - expect) > 1.5) bump(); }, { passive: true });
      api.on(sc, 'wheel', bump, { passive: true }); api.on(sc, 'touchstart', bump, { passive: true }); api.on(sc, 'pointerdown', bump);
      const drive = (t, dt) => {
        lastT = t;
        const max = Math.max(0, sc.scrollHeight - sc.clientHeight); if (max <= 0) return 0;
        if (t < pausedUntil) pos = sc.scrollTop;
        else if (t >= dwellUntil) {
          pos += dir * max / 4 * (dt || 0.016);
          if (pos >= max) { pos = max; dir = -1; dwellUntil = t + 0.8; } else if (pos <= 0) { pos = 0; dir = 1; dwellUntil = t + 0.8; }
          sc.scrollTop = pos; expect = sc.scrollTop;
        }
        return sc.scrollTop / max;
      };
      const { ctx } = api.canvas({ style: 'pointer-events:none;' });
      const C = api.colors;
      const sm = x => api.ease.inOut(api.clamp(x));
      return {
        restart() { pos = 0; dir = 1; dwellUntil = 0; pausedUntil = -1; sc.scrollTop = 0; },
        resize() { rig.setH(); },
        frame(t, dt) {
          const w = api.w, h = api.h; if (!w) return;
          const p = drive(t, dt);
          ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
          // one continuous choreography: parts leave in sequence, hold apart, return
          const ph = api.clamp((Math.sin(p * Math.PI) - 0.1) / 0.7);
          const cx = w / 2, cy = h * 0.46, s = h * 0.26;
          const parts = [
            { hx: 0, hy: -s * 0.7, ex: 0, ey: -h * 0.14, shape: 'rect', pw: s * 1.3, ph: s * 0.4, col: C.accent, d: 0.0, lab: '01', side: 1 },
            { hx: s * 0.8, hy: 0, ex: w * 0.17, ey: 0, shape: 'ring', r: s * 0.3, col: C.ink, d: 0.12, lab: '02', side: 1 },
            { hx: -s * 0.8, hy: 0, ex: -w * 0.17, ey: 0, shape: 'ring', r: s * 0.3, col: C.ink, d: 0.22, lab: '03', side: -1 },
            { hx: 0, hy: s * 0.75, ex: 0, ey: h * 0.12, shape: 'rect', pw: s * 0.5, ph: s * 0.5, col: C.muted, d: 0.32, lab: '04', side: 1 },
          ];
          const fs = Math.max(10, Math.round(h * 0.045));
          ctx.lineWidth = 1;
          parts.forEach(q => {
            const e = sm((ph - q.d) / (1 - q.d));
            const x = cx + q.hx + q.ex * e, y = cy + q.hy + q.ey * e;
            const hw = q.shape === 'rect' ? q.pw / 2 : q.r, hh = q.shape === 'rect' ? q.ph / 2 : q.r;
            if (e > 0.02) {
              // registration line + dashed ghost of the assembled slot
              ctx.strokeStyle = C.line; ctx.globalAlpha = Math.min(1, e * 2);
              ctx.beginPath(); ctx.moveTo(cx + q.hx, cy + q.hy); ctx.lineTo(x, y); ctx.stroke();
              ctx.setLineDash([3, 3]);
              if (q.shape === 'rect') rr(ctx, cx + q.hx - hw, cy + q.hy - hh, hw * 2, hh * 2, 4); else { ctx.beginPath(); ctx.arc(cx + q.hx, cy + q.hy, hw, 0, TAU); }
              ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
            }
            if (q.shape === 'rect') { ctx.fillStyle = q.col; rr(ctx, x - hw, y - hh, hw * 2, hh * 2, 4); ctx.fill(); }
            else { ctx.strokeStyle = q.col; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(x, y, hw, 0, TAU); ctx.stroke(); ctx.lineWidth = 1; }
            if (e > 0.6) {
              ctx.globalAlpha = api.clamp((e - 0.6) / 0.3); ctx.fillStyle = C.muted;
              ctx.font = api.font('mono', fs, 500); ctx.textBaseline = 'middle';
              ctx.textAlign = q.side > 0 ? 'left' : 'right';
              ctx.fillText(q.lab, x + q.side * (hw + 8), y); ctx.globalAlpha = 1;
            }
          });
          // core (drawn last so it sits on top of the registration lines)
          ctx.fillStyle = C.ink; rr(ctx, cx - s / 2, cy - s / 2, s, s, 6); ctx.fill();
          // scrub scale: hairline, ticks, one cobalt point
          const bx0 = w * 0.15, bx1 = w * 0.85, by = h * 0.93;
          ctx.strokeStyle = C.line; ctx.beginPath(); ctx.moveTo(bx0, by); ctx.lineTo(bx1, by); ctx.stroke();
          for (let i = 0; i <= 4; i++) { const x = bx0 + (bx1 - bx0) * i / 4; ctx.beginPath(); ctx.moveTo(x, by - h * 0.015); ctx.lineTo(x, by + h * 0.015); ctx.stroke(); }
          const hx = bx0 + (bx1 - bx0) * p;
          ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(bx0, by); ctx.lineTo(hx, by); ctx.stroke(); ctx.lineWidth = 1;
          ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(hx, by, Math.max(3, h * 0.016), 0, TAU); ctx.fill();
        },
      };
    },
  });

  LEX.register('exploded-view', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      const coarse = !!(window.matchMedia && matchMedia('(pointer:coarse)').matches);
      let cur = 0;
      return {
        frame(t, dt) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
          let target;
          if (api.pointer.inside && !coarse) target = 1;
          else {
            const cyc = t % 3.6;
            target = cyc < 1.2 ? 0 : cyc < 1.8 ? api.ease.inOut((cyc - 1.2) / 0.6) : cyc < 3.0 ? 1 : api.ease.inOut(1 - (cyc - 3.0) / 0.6);
          }
          cur += (target - cur) * api.clamp((dt || 0.016) * 6, 0, 1);
          drawAssembly(ctx, w, h, C, api, cur);
        },
      };
    },
  });

  LEX.register('scroll-reveal', {
    mount(el, api) {
      const rig = scrollBox(el, api, { mult: 2.6, cycle: 8 });
      const C = api.colors;
      const blocks = [];
      for (let i = 0; i < 5; i++) {
        const b = document.createElement('div');
        b.style.cssText = `position:relative;margin:${i === 0 ? '8%' : '14%'} 6% 0;padding:7% 8%;background:${C.stage2};border:1px solid ${C.line};border-radius:10px;`;
        const bar = document.createElement('div');
        bar.style.cssText = `width:${i % 2 === 0 ? '55%' : '40%'};height:10px;background:${i === 1 ? C.accent : C.line};border-radius:3px;`;
        const line2 = document.createElement('div');
        line2.style.cssText = `width:80%;height:7px;background:${C.line};opacity:0.6;border-radius:3px;margin-top:12px;`;
        b.appendChild(bar); b.appendChild(line2);
        rig.content.appendChild(b); blocks.push(b);
      }
      return {
        resize() { rig.setH(); },
        frame(t, dt) {
          if (!api.w) return;
          rig.update(t, dt);
          const viewTop = rig.scroller.scrollTop, viewH = Math.max(1, rig.scroller.clientHeight);
          blocks.forEach(b => {
            const rel = (b.offsetTop - viewTop) / viewH;
            const p = api.clamp((0.82 - rel) / 0.4, 0, 1);
            const e = api.ease.out(p);
            b.style.opacity = e;
            b.style.transform = `translateY(${(1 - e) * 22}px)`;
          });
        },
      };
    },
  });

  LEX.register('scroll-interpolate', {
    mount(el, api) {
      const rig = scrollBox(el, api, { mult: 3, cycle: 8 });
      const { ctx } = api.canvas({ style: 'pointer-events:none;' });
      const C = api.colors;
      const rnd = api.rng(7);
      const stars = Array.from({ length: 34 }, () => ({ x: rnd(), y: rnd() * 0.6 }));
      return {
        resize() { rig.setH(); },
        frame(t, dt) {
          const w = api.w, h = api.h; if (!w) return;
          const p = rig.update(t, dt);
          const horizon = h * 0.72;
          const g = ctx.createLinearGradient(0, 0, 0, horizon);
          g.addColorStop(0, lerpColor('#33447a', C.night, p));
          g.addColorStop(1, lerpColor('#e39a68', '#141826', p));
          ctx.fillStyle = g; ctx.fillRect(0, 0, w, horizon);
          ctx.fillStyle = lerpColor('#3b3227', C.night, p);
          ctx.fillRect(0, horizon, w, h - horizon);
          ctx.fillStyle = lerpColor('#2a241d', '#0a0b0e', p);
          ctx.beginPath(); ctx.moveTo(0, horizon);
          ctx.quadraticCurveTo(w * 0.3, horizon - h * 0.06, w * 0.55, horizon - h * 0.02);
          ctx.quadraticCurveTo(w * 0.8, horizon + h * 0.02, w, horizon - h * 0.03);
          ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill();
          ctx.fillStyle = C.nightInk;
          stars.forEach(s => { ctx.globalAlpha = api.clamp((p - 0.15) / 0.6, 0, 1) * 0.9; ctx.beginPath(); ctx.arc(s.x * w, s.y * horizon, 1.4, 0, TAU); ctx.fill(); });
          ctx.globalAlpha = 1;
          const moonY = api.lerp(horizon + h * 0.08, h * 0.12, api.ease.out(p)), moonX = w * (0.2 + 0.6 * p);
          ctx.fillStyle = lerpColor('#ffe3b0', C.nightInk, p);
          ctx.beginPath(); ctx.arc(moonX, moonY, h * 0.05, 0, TAU); ctx.fill();
        },
      };
    },
  });

  LEX.register('draw-on-scroll', {
    mount(el, api) {
      const rig = scrollBox(el, api, { mult: 3, cycle: 8 });
      const { ctx } = api.canvas({ style: 'pointer-events:none;' });
      const C = api.colors;
      const milestones = [0.2, 0.5, 0.82];
      function pathPoint(u, w, h) { return { x: w * 0.08 + u * w * 0.84, y: h * 0.5 + Math.sin(u * Math.PI * 2.1) * h * 0.22 }; }
      return {
        resize() { rig.setH(); },
        frame(t, dt) {
          const w = api.w, h = api.h; if (!w) return;
          const p = rig.update(t, dt);
          ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
          ctx.strokeStyle = C.line; ctx.lineWidth = Math.max(1.5, h * 0.01); ctx.lineCap = 'round';
          ctx.beginPath();
          for (let i = 0; i <= 60; i++) { const pt = pathPoint(i / 60, w, h); i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y); }
          ctx.stroke();
          ctx.strokeStyle = C.accent; ctx.lineWidth = Math.max(2, h * 0.015);
          ctx.beginPath();
          const steps = Math.max(0, Math.round(60 * p));
          for (let i = 0; i <= steps; i++) { const pt = pathPoint(i / 60, w, h); i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y); }
          ctx.stroke();
          milestones.forEach((u, i) => {
            const pt = pathPoint(u, w, h), on = p >= u;
            ctx.beginPath(); ctx.arc(pt.x, pt.y, h * 0.028, 0, TAU);
            ctx.fillStyle = on ? C.accent : C.stage; ctx.fill();
            ctx.strokeStyle = on ? C.accent : C.line; ctx.lineWidth = 1.5; ctx.stroke();
            if (on) {
              ctx.fillStyle = C.ink; ctx.font = api.font('mono', Math.max(9, h * 0.045), 500);
              ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
              ctx.fillText('0' + (i + 1), pt.x, pt.y - h * 0.045);
            }
          });
        },
      };
    },
  });

  LEX.register('progress-metaphor', {
    mount(el, api) {
      const rig = scrollBox(el, api, { mult: 2.6, cycle: 8 });
      // local auto-scroll driver: pings between the ends with a short dwell, pauses 3s after real input
      const sc = rig.scroller; let pos = 0, dir = 1, expect = 0, pausedUntil = -1, dwellUntil = 0, lastT = 0;
      const bump = () => { pausedUntil = lastT + 3; };
      api.on(sc, 'scroll', () => { if (Math.abs(sc.scrollTop - expect) > 1.5) bump(); }, { passive: true });
      api.on(sc, 'wheel', bump, { passive: true }); api.on(sc, 'touchstart', bump, { passive: true }); api.on(sc, 'pointerdown', bump);
      const drive = (t, dt) => {
        lastT = t;
        const max = Math.max(0, sc.scrollHeight - sc.clientHeight); if (max <= 0) return 0;
        if (t < pausedUntil) pos = sc.scrollTop;
        else if (t >= dwellUntil) {
          pos += dir * max / 4 * (dt || 0.016);
          if (pos >= max) { pos = max; dir = -1; dwellUntil = t + 0.8; } else if (pos <= 0) { pos = 0; dir = 1; dwellUntil = t + 0.8; }
          sc.scrollTop = pos; expect = sc.scrollTop;
        }
        return sc.scrollTop / max;
      };
      const { ctx } = api.canvas({ style: 'pointer-events:none;' });
      const C = api.colors;
      return {
        restart() { pos = 0; dir = 1; dwellUntil = 0; pausedUntil = -1; sc.scrollTop = 0; },
        resize() { rig.setH(); },
        frame(t, dt) {
          const w = api.w, h = api.h; if (!w) return;
          const p = drive(t, dt), scTop = sc.scrollTop;
          ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
          // page ruler passing under the beam: proof that the document is moving
          const sp = h * 0.075;
          for (let i = Math.floor(scTop / sp); i * sp - scTop < h + sp; i++) {
            const y = i * sp - scTop; if (y < h * 0.2) continue;
            ctx.globalAlpha = api.clamp((y - h * 0.2) / (h * 0.1)) * 0.75;
            ctx.strokeStyle = C.muted; ctx.lineWidth = 1;
            const len = i % 5 === 0 ? w * 0.05 : w * 0.024;
            ctx.beginPath(); ctx.moveTo(w * 0.07, y); ctx.lineTo(w * 0.07 + len, y); ctx.stroke();
          }
          ctx.globalAlpha = 1;
          // big Latin numeral
          ctx.fillStyle = C.ink; ctx.font = api.font('serif', h * 0.42, 300);
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(String(Math.round(p * 100)), w * 0.5, h * 0.6);
          // beam: track, ticks, comet-tapered light, bright head
          const x0 = w * 0.07, x1 = w * 0.93, y = h * 0.12, xh = x0 + (x1 - x0) * Math.max(p, 0.006);
          ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
          for (let i = 0; i <= 10; i++) {
            const x = x0 + (x1 - x0) * i / 10;
            ctx.strokeStyle = x <= xh ? C.ink : C.line;
            ctx.beginPath(); ctx.moveTo(x, y - h * 0.018); ctx.lineTo(x, y + h * 0.018); ctx.stroke();
          }
          const gr = ctx.createLinearGradient(x0, 0, xh, 0);
          gr.addColorStop(0, 'rgba(46,75,255,0.12)'); gr.addColorStop(1, 'rgba(46,75,255,1)');
          ctx.save(); ctx.shadowColor = 'rgba(46,75,255,0.75)'; ctx.shadowBlur = h * 0.05;
          ctx.strokeStyle = gr; ctx.lineWidth = Math.max(2, h * 0.012); ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(xh, y); ctx.stroke(); ctx.restore();
          const hg = ctx.createRadialGradient(xh, y, 0, xh, y, h * 0.07);
          hg.addColorStop(0, 'rgba(46,75,255,0.5)'); hg.addColorStop(1, 'rgba(46,75,255,0)');
          ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(xh, y, h * 0.07, 0, TAU); ctx.fill();
          ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(xh, y, Math.max(3, h * 0.016), 0, TAU); ctx.fill();
        },
      };
    },
  });

  // ════════════════════════════════════ 指针驱动 ════════════════════════════════════

  LEX.register('tilt-glare', {
    mount(el, api) {
      const C = api.colors;
      const coarse = !!(window.matchMedia && matchMedia('(pointer:coarse)').matches);
      const wrap = api.div('position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:6%;');
      const cards = [0, 1, 2].map(i => {
        const card = document.createElement('div');
        card.style.cssText = `position:relative;width:18%;height:57%;border-radius:8px;background:${C.ink};border:1px solid ${C.nightLine};overflow:hidden;will-change:transform;`;
        const frame = document.createElement('div');
        frame.style.cssText = `position:absolute;inset:9%;border:1px solid ${C.nightLine};border-radius:4px;pointer-events:none;`;
        const glare = document.createElement('div');
        glare.style.cssText = 'position:absolute;inset:0;opacity:0;pointer-events:none;';
        const tag = document.createElement('div');
        tag.style.cssText = `position:absolute;left:14%;bottom:12%;font:${api.font('mono', 10, 500)};color:${C.muted};pointer-events:none;`;
        tag.textContent = '0' + (i + 1);
        card.appendChild(frame); card.appendChild(glare); card.appendChild(tag); wrap.appendChild(card);
        return { card, glare };
      });
      const gd = ghostDot(api, C);
      return {
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          let px, py, real;
          if (api.pointer.inside && !coarse) { px = api.pointer.px; py = api.pointer.py; real = true; }
          else { const g = api.ghost(t, 4); px = g.x * w; py = g.y * h; real = false; }
          gd.set(px, py, !real);
          cards.forEach(({ card, glare }) => {
            // layout-based centre (unaffected by the card's own transform)
            const ccx = card.offsetLeft + card.offsetWidth / 2, ccy = card.offsetTop + card.offsetHeight / 2;
            const dx = api.clamp((px - ccx) / ((card.offsetWidth || 1) / 2), -1, 1);
            const dy = api.clamp((py - ccy) / ((card.offsetHeight || 1) / 2), -1, 1);
            const max = 16, near = api.clamp(1 - Math.hypot(dx, dy) * 0.5);
            card.style.transform = `perspective(620px) rotateX(${(-dy * max).toFixed(2)}deg) rotateY(${(dx * max).toFixed(2)}deg) scale(${(1 + 0.04 * near).toFixed(3)})`;
            card.style.boxShadow = `${(-dx * 8).toFixed(1)}px ${(8 - dy * 5).toFixed(1)}px 18px rgba(23,23,26,0.14)`;
            const gx = 50 + dx * 50, gy = 50 + dy * 50;
            glare.style.background = `radial-gradient(circle at ${gx.toFixed(1)}% ${gy.toFixed(1)}%, rgba(255,255,255,0.95), rgba(255,255,255,0.2) 32%, rgba(255,255,255,0) 68%)`;
            glare.style.opacity = String(api.clamp(1 - Math.hypot(dx, dy) * 0.4, 0.2, 1));
          });
        },
      };
    },
  });

  LEX.register('magnetic-btn', {
    mount(el, api) {
      const C = api.colors;
      const wrap = api.div('position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:8%;');
      function mkBtn(label, magnetic) {
        const b = document.createElement('div');
        b.style.cssText = `position:relative;width:34%;max-width:120px;height:34%;max-height:44px;display:flex;align-items:center;justify-content:center;border-radius:999px;background:${magnetic ? C.ink : C.stage2};border:1px solid ${C.line};`;
        const span = document.createElement('span');
        span.style.cssText = `font:${api.font('sans', 13, 600)};color:${magnetic ? '#fff' : C.ink};`;
        span.textContent = label;
        b.appendChild(span); wrap.appendChild(b);
        return { b, span };
      }
      mkBtn('普通', false);
      const magnet = mkBtn('磁吸', true);
      const gd = ghostDot(api, C);
      let curx = 0, cury = 0;
      return {
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          const rect = el.getBoundingClientRect();
          let px, py, real;
          if (api.pointer.inside) { px = api.pointer.px; py = api.pointer.py; real = true; }
          else { const g = api.ghost(t, 3); px = g.x * w; py = g.y * h; real = false; }
          gd.set(px, py, !real);
          const br = magnet.b.getBoundingClientRect();
          const bx = br.left - rect.left + br.width / 2, by = br.top - rect.top + br.height / 2;
          const dx = px - bx, dy = py - by, dist = Math.hypot(dx, dy);
          const influence = Math.max(br.width, br.height) * 1.6;
          const k = api.clamp(1 - dist / influence, 0, 1);
          const tx = dist > 0.001 ? (dx / dist) * k * 6 : 0, ty = dist > 0.001 ? (dy / dist) * k * 6 : 0;
          curx += (tx - curx) * 0.25; cury += (ty - cury) * 0.25;
          magnet.b.style.transform = `translate(${curx.toFixed(2)}px, ${cury.toFixed(2)}px)`;
          magnet.span.style.transform = `translate(${(-curx * 0.4).toFixed(2)}px, ${(-cury * 0.4).toFixed(2)}px)`;
        },
      };
    },
  });

  LEX.register('custom-cursor', {
    mount(el, api) {
      el.style.cursor = 'none';
      const { ctx } = api.canvas();
      const C = api.colors;
      return {
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
          const bw = w * 0.36, bh = h * 0.16, bx = w / 2 - bw / 2, by = h * 0.62;
          let px, py;
          if (api.pointer.inside) { px = api.pointer.px; py = api.pointer.py; }
          else { const g = api.ghost(t, 5); px = g.x * w; py = g.y * h; }
          const hover = px > bx && px < bx + bw && py > by && py < by + bh;
          ctx.fillStyle = C.ink; ctx.font = api.font('sans', h * 0.1, 700);
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('设计细节', w / 2, h * 0.32);
          ctx.strokeStyle = hover ? C.accent : C.line; ctx.lineWidth = 1.4;
          rr(ctx, bx, by, bw, bh, bh / 2); ctx.stroke();
          ctx.fillStyle = hover ? C.accent : C.muted; ctx.font = api.font('mono', h * 0.05, 600);
          ctx.fillText('按钮', bx + bw / 2, by + bh / 2);
          const size = hover ? h * 0.03 : h * 0.05;
          ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(px - size, py); ctx.lineTo(px - size * 0.35, py);
          ctx.moveTo(px + size * 0.35, py); ctx.lineTo(px + size, py);
          ctx.moveTo(px, py - size); ctx.lineTo(px, py - size * 0.35);
          ctx.moveTo(px, py + size * 0.35); ctx.lineTo(px, py + size);
          ctx.stroke();
          if (hover) { ctx.strokeStyle = C.accent; ctx.beginPath(); ctx.arc(px, py, size * 0.7, 0, TAU); ctx.stroke(); }
        },
      };
    },
  });

  LEX.register('cursor-reactive', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      const cols = 12, rows = 8;
      return {
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
          let px, py, real;
          if (api.pointer.inside) { px = api.pointer.px; py = api.pointer.py; real = true; }
          else { const g = api.ghost(t, 9); px = g.x * w; py = g.y * h; real = false; }
          const sigma = Math.min(w, h) * 0.22;
          const pts = [];
          for (let j = 0; j <= rows; j++) {
            pts.push([]);
            for (let i = 0; i <= cols; i++) {
              const x0 = (w * i) / cols, y0 = (h * j) / rows;
              const dx = px - x0, dy = py - y0, d2 = dx * dx + dy * dy, d = Math.sqrt(d2) || 1;
              const k = Math.exp(-d2 / (2 * sigma * sigma)) * Math.min(w, h) * 0.07;
              pts[j].push([x0 + (dx / d) * k, y0 + (dy / d) * k]);
            }
          }
          ctx.strokeStyle = C.line; ctx.lineWidth = 1;
          for (let j = 0; j <= rows; j++) { ctx.beginPath(); pts[j].forEach((p, i) => (i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]))); ctx.stroke(); }
          for (let i = 0; i <= cols; i++) { ctx.beginPath(); for (let j = 0; j <= rows; j++) { const p = pts[j][i]; j === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]); } ctx.stroke(); }
          if (!real) drawGhostMark(ctx, px, py, C);
        },
      };
    },
  });

  // ════════════════════════════════════ 状态反馈 ════════════════════════════════════

  LEX.register('spring-toggle', {
    mount(el, api) {
      const C = api.colors;
      const wrap = api.div('position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12%;');
      const track = document.createElement('div');
      track.style.cssText = `position:relative;width:46%;height:16%;max-height:34px;min-height:22px;border-radius:999px;background:${C.stage2};border:1px solid ${C.line};overflow:hidden;`;
      wrap.appendChild(track);
      const pill = document.createElement('div');
      pill.style.cssText = `position:absolute;top:3px;bottom:3px;left:3px;width:calc(50% - 6px);border-radius:999px;background:${C.ink};`;
      track.appendChild(pill);
      ['月付', '年付'].forEach((txt, i) => {
        const s = document.createElement('span'); s.textContent = txt;
        s.style.cssText = `position:absolute;top:0;bottom:0;left:${i * 50}%;width:50%;display:flex;align-items:center;justify-content:center;font:${api.font('sans', 12, 600)};color:${C.muted};pointer-events:none;`;
        track.appendChild(s);
      });
      const price = api.div(`position:relative;font:${api.font('mono', 28, 700)};color:${C.ink};`);
      let toggled = false, animStart = -10, posFrom = 0, posTo = 0, valFrom = 99, valTo = 99, curPos = 0, curVal = 99, lastAuto = 0;
      function trigger(next) { toggled = next; animStart = api.t; posFrom = curPos; posTo = toggled ? 1 : 0; valFrom = curVal; valTo = toggled ? 69 : 99; }
      api.onClick(() => trigger(!toggled));
      return {
        frame(t) {
          const h = api.h; if (!h) return;
          price.style.font = api.font('mono', h * 0.16, 700);
          if (!api.pointer.down && t - lastAuto > 2.2) { lastAuto = t; trigger(!toggled); }
          const se = api.ease.spring(t - animStart, 2.6, api.ease.zetaFor(0.16));
          curPos = api.clamp(api.lerp(posFrom, posTo, se), -0.3, 1.3);
          curVal = api.lerp(valFrom, valTo, api.clamp(se, 0, 1.3));
          pill.style.transform = `translateX(${(curPos * 100).toFixed(1)}%)`;
          price.textContent = '¥' + Math.round(curVal) + '/月';
        },
      };
    },
  });

  LEX.register('hover-reveal', {
    mount(el, api) {
      const C = api.colors;
      const wrap = api.div('position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:5%;perspective:900px;');
      const cards = [0, 1, 2].map(i => {
        const outer = document.createElement('div'); // fade lives here — never on the preserve-3d element
        outer.style.cssText = 'position:relative;width:26%;height:70%;opacity:1;';
        const flip = document.createElement('div'); // rotateY only — no opacity here
        flip.style.cssText = 'position:absolute;inset:0;transform-style:preserve-3d;';
        const front = document.createElement('div');
        front.style.cssText = `position:absolute;inset:0;border-radius:10px;background:${C.stage2};border:1px solid ${C.line};display:flex;align-items:center;justify-content:center;backface-visibility:hidden;font:${api.font('sans', 14, 600)};color:${C.ink};`;
        front.textContent = '正面';
        const back = document.createElement('div');
        back.style.cssText = `position:absolute;inset:0;border-radius:10px;background:${C.ink};border:1px solid ${C.line};display:flex;align-items:center;justify-content:center;transform:rotateY(180deg);backface-visibility:hidden;font:${api.font('mono', 13, 500)};color:#fff;`;
        back.textContent = '细节 0' + (i + 1);
        flip.appendChild(front); flip.appendChild(back); outer.appendChild(flip); wrap.appendChild(outer);
        return { outer, flip, p: 0 };
      });
      return {
        frame(t) {
          const w = api.w; if (!w) return;
          let hoveredIdx = -1;
          if (api.pointer.inside) {
            const rect = el.getBoundingClientRect();
            cards.forEach((c, i) => {
              const r = c.outer.getBoundingClientRect();
              if (api.pointer.px >= r.left - rect.left && api.pointer.px <= r.right - rect.left && api.pointer.py >= r.top - rect.top && api.pointer.py <= r.bottom - rect.top) hoveredIdx = i;
            });
          } else hoveredIdx = Math.floor(t / 1.6) % 3;
          cards.forEach((c, i) => {
            const target = i === hoveredIdx ? 1 : 0;
            c.p += (target - c.p) * 0.15;
            c.flip.style.transform = `rotateY(${c.p * 180}deg)`;
            c.outer.style.opacity = String(1 - 0.35 * Math.sin(c.p * Math.PI)); // brief dip past the edge-on midpoint
          });
        },
      };
    },
  });

  LEX.register('ghost-cursor', {
    mount(el, api) {
      const C = api.colors;
      const btn = api.div(`position:absolute;left:8%;top:14%;width:34%;height:22%;border-radius:8px;background:${C.stage2};border:1.5px solid ${C.line};display:flex;align-items:center;justify-content:center;font:${api.font('sans', 13, 600)};color:${C.ink};transition:background .1s,color .1s,border-color .1s;`, '点击');
      const track = api.div(`position:absolute;left:8%;bottom:20%;width:60%;height:6px;border-radius:3px;background:${C.line};`);
      const handle = document.createElement('div');
      handle.style.cssText = `position:absolute;top:50%;left:0;width:16px;height:16px;margin:-8px 0 0 -8px;border-radius:50%;background:${C.ink};box-shadow:0 1px 3px rgba(0,0,0,.25);`;
      track.appendChild(handle);
      const gd = ghostDot(api, C);
      api.on(btn, 'pointerenter', () => { btn.style.borderColor = C.accent; });
      api.on(btn, 'pointerleave', () => { btn.style.borderColor = C.line; });
      let flash = -10;
      return {
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          if (api.pointer.inside) { gd.set(0, 0, false); return; }
          const rect = el.getBoundingClientRect();
          const btnR = btn.getBoundingClientRect(), trR = track.getBoundingClientRect();
          const bx = btnR.left - rect.left + btnR.width / 2, by = btnR.top - rect.top + btnR.height / 2;
          const tx0 = trR.left - rect.left, tx1 = trR.right - rect.left, ty = trR.top - rect.top + trR.height / 2;
          const cyc = 5.0, lp = t % cyc;
          let gx, gy;
          if (lp < 1.6) { const p = api.ease.inOut(lp / 1.6); gx = api.lerp(w * 0.5, bx, p); gy = api.lerp(h * 0.88, by, p); }
          else if (lp < 2.0) { gx = bx; gy = by; if (Math.abs(lp - 1.8) < 0.05) flash = t; }
          else if (lp < 3.2) { const p = api.ease.inOut((lp - 2.0) / 1.2); gx = api.lerp(bx, tx0 + 8, p); gy = api.lerp(by, ty, p); }
          else { const p = api.ease.inOut(api.clamp((lp - 3.2) / 1.6, 0, 1)); gx = api.lerp(tx0 + 8, tx1 - 8, p); gy = ty; handle.style.left = (gx - tx0) + 'px'; }
          gd.set(gx, gy, true);
          if (t - flash < 0.22) { btn.style.background = C.accent; btn.style.color = '#fff'; }
          else { btn.style.background = C.stage2; btn.style.color = C.ink; }
        },
      };
    },
  });

  // ════════════════════════════════════ 声音 ════════════════════════════════════

  LEX.register('audio-reactive', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      const N = 40;
      const rnd = api.rng(33);
      const phase = Array.from({ length: N }, () => rnd() * TAU);
      const amp0 = Array.from({ length: N }, () => 0.5 + rnd() * 0.5);
      let audioCtx = null, analyser = null, data = null, master = null, playing = false, muted = false;
      let nextNoteTime = 0, beatIdx = 0;
      const bpm = 110, beatDur = 60 / bpm;
      function ensureAudio() {
        if (audioCtx) return;
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        master = audioCtx.createGain(); master.gain.value = muted ? 0 : 0.7;
        analyser = audioCtx.createAnalyser(); analyser.fftSize = 128;
        master.connect(analyser); analyser.connect(audioCtx.destination);
        data = new Uint8Array(analyser.frequencyBinCount);
        nextNoteTime = audioCtx.currentTime + 0.05; beatIdx = 0;
      }
      function kick(when) {
        const o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.type = 'sine'; o.frequency.setValueAtTime(150, when); o.frequency.exponentialRampToValueAtTime(42, when + 0.13);
        g.gain.setValueAtTime(0.9, when); g.gain.exponentialRampToValueAtTime(0.001, when + 0.18);
        o.connect(g); g.connect(master); o.start(when); o.stop(when + 0.2);
      }
      function hat(when, vol) {
        const dur = 0.05, buf = audioCtx.createBuffer(1, Math.max(1, Math.round(audioCtx.sampleRate * dur)), audioCtx.sampleRate);
        const d = buf.getChannelData(0), r = api.rng((Math.floor(when * 1000) % 100000) + 7);
        for (let i = 0; i < d.length; i++) d[i] = (r() * 2 - 1) * (1 - i / d.length);
        const src = audioCtx.createBufferSource(); src.buffer = buf;
        const hp = audioCtx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 6000;
        const g = audioCtx.createGain(); g.gain.value = vol;
        src.connect(hp); hp.connect(g); g.connect(master); src.start(when);
      }
      function scheduler(now) {
        while (nextNoteTime < now + 0.15) {
          if (beatIdx % 2 === 0) kick(nextNoteTime);
          hat(nextNoteTime, beatIdx % 2 === 0 ? 0.18 : 0.1);
          nextNoteTime += beatDur / 2; beatIdx++;
        }
      }
      const playBtn = api.div(`position:absolute;left:50%;bottom:6%;width:15%;height:15%;max-width:44px;max-height:44px;margin-left:-7.5%;border-radius:50%;background:${C.ink};display:flex;align-items:center;justify-content:center;`);
      const drawTri = () => { playBtn.innerHTML = playing ? `<div style="display:flex;gap:3px;"><div style="width:4px;height:14px;background:#fff;"></div><div style="width:4px;height:14px;background:#fff;"></div></div>` : '<div style="width:0;height:0;border-top:7px solid transparent;border-bottom:7px solid transparent;border-left:11px solid #fff;margin-left:3px;"></div>'; };
      drawTri();
      const muteBtn = api.div(`position:absolute;right:6%;bottom:7%;width:13%;height:13%;max-width:32px;max-height:32px;border-radius:50%;background:${C.stage2};border:1px solid ${C.line};display:flex;align-items:center;justify-content:center;font:${api.font('mono', 9, 600)};color:${C.muted};`, '静音');
      api.on(playBtn, 'click', () => { ensureAudio(); if (audioCtx.state === 'suspended') audioCtx.resume(); playing = !playing; drawTri(); });
      api.on(muteBtn, 'click', () => {
        muted = !muted; if (master) master.gain.value = muted ? 0 : 0.7;
        muteBtn.style.color = muted ? C.accent : C.muted; muteBtn.textContent = muted ? '取消' : '静音';
      });
      return {
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
          let values;
          if (playing && analyser) {
            scheduler(audioCtx.currentTime);
            analyser.getByteFrequencyData(data);
            values = new Array(N);
            for (let i = 0; i < N; i++) values[i] = data[Math.floor((i / N) * data.length)] / 255;
          } else {
            values = amp0.map((a, i) => 0.35 + 0.3 * a * Math.sin(t * 0.9 + phase[i]));
          }
          const cx = w / 2, cy = h * 0.42, R = Math.min(w, h) * 0.28;
          for (let i = 0; i < N; i++) {
            const a = (i / N) * TAU - Math.PI / 2;
            const v = api.clamp(values[i], 0, 1), len = R * 0.25 + R * 0.5 * v;
            const x1 = cx + Math.cos(a) * R * 0.55, y1 = cy + Math.sin(a) * R * 0.55;
            const x2 = cx + Math.cos(a) * (R * 0.55 + len), y2 = cy + Math.sin(a) * (R * 0.55 + len);
            ctx.strokeStyle = lerpColor(C.line, C.accent, v);
            ctx.lineWidth = Math.max(2, w * 0.012); ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
          }
        },
        destroy() { try { if (audioCtx) audioCtx.close(); } catch (e) {} },
      };
    },
  });
})();
