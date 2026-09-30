/* Lexicon group B — L3 缓动与物理 (5) + 节奏 (5) + 转场 (7). See LEXSPEC.md for the contract. */
(function () {
  'use strict';
  const TAU = Math.PI * 2;

  function rrect(ctx, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, Math.min(w, h) / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  // Subtle beat-tick row shared by rhythm demos: a strip of dots, the current
  // beat pulses in accent. Purely a function of t and bpm — no shared state.
  function beatRow(ctx, api, t, bpm, yFrac) {
    const w = api.w, h = api.h; const C = api.colors;
    const spb = 60 / bpm, n = 8;
    const bf = t / spb, activeIdx = Math.floor(bf) % n, frac = bf - Math.floor(bf);
    const x0 = w * 0.08, x1 = w * 0.92, y = h * yFrac;
    for (let i = 0; i < n; i++) {
      const x = x0 + (x1 - x0) * (i + 0.5) / n;
      const isActive = i === activeIdx;
      const r = isActive ? Math.max(3, h * 0.026) * (1 + 0.5 * (1 - frac)) : Math.max(2, h * 0.014);
      ctx.fillStyle = isActive ? C.accent : C.line;
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    }
  }

  // ── 缓动与物理 ───────────────────────────────────────────────────────

  LEX.register('spring', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      let overshoot = 0.06, fired = 0;
      const rows = [
        { name: 'linear', f: (t) => api.ease.linear(t / 0.9), col: C.muted },
        { name: 'ease-in-out', f: (t) => api.ease.inOut(t / 0.9), col: C.ink },
        { name: 'spring', f: (t) => api.ease.spring(t, 1.6, api.ease.zetaFor(overshoot)), col: C.accent },
      ];
      api.onClick(() => { fired = api.t; });
      return {
        param(name, v) { if (name === 'overshoot') { overshoot = Math.max(0.0001, v); fired = api.t; } },
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          const local = (t - fired) % 2.6;
          ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
          const topH = h * 0.62;
          const x0 = w * 0.32, x1 = w * 0.88, rowH = topH / (rows.length + 1);
          rows.forEach((r, i) => {
            const y = rowH * (i + 0.9);
            ctx.strokeStyle = C.line; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
            const p = r.f(local);
            ctx.fillStyle = r.col;
            ctx.beginPath(); ctx.arc(api.lerp(x0, x1, api.clamp(p, -0.4, 1.4)), y, Math.max(5, h * 0.038), 0, TAU); ctx.fill();
            ctx.font = api.font('mono', Math.max(9, h * 0.044)); ctx.fillStyle = r.col;
            ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(r.name, x0 - 10, y);
          });
          // small curve plot, bottom-right corner
          const bx0 = w * 0.6, by0 = topH + h * 0.09, bw = w * 0.34, bh = h * 0.24;
          ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.strokeRect(bx0, by0, bw, bh);
          const plotDur = 1.3;
          rows.forEach(r => {
            ctx.beginPath();
            for (let i = 0; i <= 32; i++) {
              const tt = (i / 32) * plotDur;
              const v = api.clamp(r.f(tt), -0.3, 1.3);
              const px = bx0 + (i / 32) * bw, py = by0 + bh - (v + 0.3) / 1.6 * bh;
              if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.strokeStyle = r.col; ctx.lineWidth = r.name === 'spring' ? 2 : 1.2;
            ctx.stroke();
          });
          const lx = bx0 + api.clamp(local / plotDur, 0, 1) * bw;
          ctx.strokeStyle = C.ink; ctx.globalAlpha = 0.45;
          ctx.beginPath(); ctx.moveTo(lx, by0); ctx.lineTo(lx, by0 + bh); ctx.stroke(); ctx.globalAlpha = 1;
        },
      };
    },
  });

  LEX.register('slow-ease', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      let dur = 1.2;
      const fmt = v => v.toFixed(2).replace(/0$/, '');
      return {
        param(name, v) { if (name === 'dur') dur = Math.max(0.05, v); },
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
          const fastD = 0.3, hold = 1.3;
          const period = Math.max(dur, fastD) + hold;
          const local = t % period;
          const fade = api.clamp(local / 0.15) * api.clamp((period - local) / 0.3);
          const x0 = w * 0.32, x1 = w * 0.9, r = h * 0.036;
          const lanes = [
            { y: h * 0.36, d: fastD, col: C.ink },
            { y: h * 0.68, d: dur, col: C.accent },
          ];
          // start / end hairlines
          ctx.strokeStyle = C.line; ctx.lineWidth = 1;
          [x0, x1].forEach(x => { ctx.beginPath(); ctx.moveTo(x, h * 0.2); ctx.lineTo(x, h * 0.84); ctx.stroke(); });
          lanes.forEach(L => {
            ctx.strokeStyle = C.line; ctx.beginPath(); ctx.moveTo(x0, L.y); ctx.lineTo(x1, L.y); ctx.stroke();
            // afterimage ticks: position every 0.1s of elapsed time
            const shown = Math.min(local, L.d);
            ctx.strokeStyle = C.muted; ctx.globalAlpha = 0.7 * fade;
            for (let k = 1; k * 0.1 < shown - 1e-6; k++) {
              const x = api.lerp(x0, x1, api.ease.out(k * 0.1 / L.d));
              ctx.beginPath(); ctx.moveTo(x, L.y - h * 0.035); ctx.lineTo(x, L.y + h * 0.035); ctx.stroke();
            }
            ctx.globalAlpha = fade;
            const x = api.lerp(x0, x1, api.ease.out(local / L.d));
            ctx.fillStyle = L.col; ctx.beginPath(); ctx.arc(x, L.y, r, 0, 7); ctx.fill();
            ctx.globalAlpha = 1;
            // big Latin numeral
            ctx.fillStyle = C.ink; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
            ctx.font = api.font('serif', h * 0.16, 300);
            ctx.fillText(fmt(L.d) + 's', w * 0.25, L.y - h * 0.005);
          });
        },
      };
    },
  });

  LEX.register('expo-out', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      let modeStart = 0, first = true;
      const widths = [0.62, 0.44, 0.5];
      const period = 3.4;
      return {
        mode() { modeStart = first ? -period * 0.5 : api.t; first = false; },
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
          const lt = (t - modeStart) % period;
          for (let i = 0; i < widths.length; i++) {
            const delay = i * 0.08;
            const p = api.clamp((lt - delay) / 0.85);
            const e = api.mode === 0 ? api.ease.in(p) : api.ease.expoOut(p);
            const x = api.lerp(-w * 0.5, w * 0.08, e);
            const y = h * (0.26 + i * 0.22);
            const bw = w * widths[i], bh = h * 0.13;
            ctx.fillStyle = api.mode === 0 ? C.muted : C.accent;
            rrect(ctx, x, y, bw, bh, bh * 0.3); ctx.fill();
          }
        },
      };
    },
  });

  LEX.register('dual-spring', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      const N = 4;
      let cur = 0, prev = 0, changeT = 0, curMode = 1;
      api.onClick(() => {
        const idx = api.clamp(Math.floor(api.pointer.x * N), 0, N - 1);
        if (idx !== cur) { prev = cur; cur = idx; changeT = api.t; }
      });
      return {
        mode(m) { curMode = m; },
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
          if (t - changeT > 1.7) { prev = cur; cur = (cur + 1) % N; changeT = t; }
          const local = t - changeT;
          const tabW = w / N, tabY = h * 0.64, tabH = h * 0.22;
          for (let i = 0; i < N; i++) {
            ctx.font = api.font('mono', h * 0.06, 600); ctx.fillStyle = i === cur ? C.ink : C.muted;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('T' + (i + 1), tabW * (i + 0.5), h * 0.34);
          }
          const x0t = tabW * cur + tabW * 0.14, x1t = tabW * (cur + 1) - tabW * 0.14;
          const x0p = tabW * prev + tabW * 0.14, x1p = tabW * (prev + 1) - tabW * 0.14;
          let lx, rx;
          if (curMode === 0) {
            const p = api.ease.out(api.clamp(local / 0.5));
            lx = api.lerp(x0p, x0t, p); rx = api.lerp(x1p, x1t, p);
          } else {
            const pl = api.ease.spring(local, 3.0, api.ease.zetaFor(0.14));
            const pr = api.ease.spring(Math.max(0, local - 0.05), 1.7, api.ease.zetaFor(0.22));
            lx = api.lerp(x0p, x0t, pl); rx = api.lerp(x1p, x1t, pr);
          }
          if (rx < lx) { const m = (lx + rx) / 2; lx = rx = m; }
          ctx.fillStyle = C.accent;
          rrect(ctx, lx, tabY, Math.max(2, rx - lx), tabH, tabH * 0.4); ctx.fill();
          ctx.strokeStyle = C.line; ctx.beginPath();
          ctx.moveTo(w * 0.04, tabY + tabH + h * 0.06); ctx.lineTo(w * 0.96, tabY + tabH + h * 0.06); ctx.stroke();
        },
      };
    },
  });

  LEX.register('on-twos', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      let curMode = 1;
      const AMP = 0.55, FPS = 12;
      function jitter(step) { const x = Math.sin(step * 12.9898) * 43758.5453; return (x - Math.floor(x) - 0.5) * 2; }
      return {
        mode(m) { curMode = m; },
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
          const px = w * 0.5, py = h * 0.08, len = h * 0.56, r = h * 0.07;
          const posAt = (disp, jx, jy) => {
            const a = Math.sin(disp * Math.PI) * AMP;
            return { a, x: px + Math.sin(a) * len + jx, y: py + Math.cos(a) * len + jy };
          };
          // swing arc (guide)
          ctx.strokeStyle = C.line; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(px, py, len, Math.PI / 2 - AMP, Math.PI / 2 + AMP); ctx.stroke();
          const step = Math.floor(t * FPS);
          if (curMode === 1) {
            // the 24 held frames of one swing period, as ticks on the arc
            ctx.fillStyle = C.muted;
            for (let k = 0; k < 24; k++) {
              const p = posAt(k / FPS, 0, 0);
              ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(1.5, h * 0.008), 0, 7); ctx.fill();
            }
            // afterimages of the two previous held frames
            for (let g = 2; g >= 1; g--) {
              const p = posAt((step - g * 2) / FPS, 0, 0);
              ctx.globalAlpha = g === 1 ? 0.35 : 0.16; ctx.strokeStyle = C.ink;
              ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 7); ctx.stroke();
            }
            ctx.globalAlpha = 1;
          }
          let disp = t, jx = 0, jy = 0, jr = 0;
          if (curMode === 1) {
            const s2 = Math.floor(t * FPS / 2) * 2; // held for two frames
            disp = s2 / FPS; jx = jitter(s2) * h * 0.008; jy = jitter(s2 + 50) * h * 0.008; jr = jitter(s2 + 90);
          }
          const b = posAt(disp, jx, jy);
          ctx.strokeStyle = C.muted; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(b.x, b.y); ctx.stroke();
          ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(px, py, 2.5, 0, 7); ctx.fill();
          ctx.beginPath(); ctx.arc(b.x, b.y, r, 0, 7); ctx.fill();
          if (curMode === 1) { // hand-drawn outline boil
            ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.arc(b.x + jr * h * 0.012, b.y - jr * h * 0.008, r + h * 0.02, 0, 7); ctx.stroke();
          }
          ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(b.x, b.y, h * 0.016, 0, 7); ctx.fill();
          api.kit.label(ctx, curMode === 1 ? '12 fps' : '60 fps', w * 0.5, h * 0.94, { h, align: 'center' });
        },
      };
    },
  });

  // ── 节奏 ────────────────────────────────────────────────────────────

  LEX.register('beat-grid', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      let bpm = 120;
      return {
        param(name, v) { if (name === 'bpm') bpm = v; },
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
          const spb = 60 / bpm;
          const beatF = t / spb, beatIdx = Math.floor(beatF) % 4, beatFrac = beatF - Math.floor(beatF);
          const dotY = h * 0.26, x0 = w * 0.22, x1 = w * 0.78;
          for (let i = 0; i < 4; i++) {
            const x = api.lerp(x0, x1, i / 3);
            const active = i === beatIdx, pulse = active ? (1 - beatFrac) : 0;
            const r = h * 0.05 + (active ? h * 0.032 * pulse : 0);
            ctx.globalAlpha = active ? 1 : 0.28;
            ctx.fillStyle = i === 0 ? C.accent : C.ink;
            ctx.beginPath(); ctx.arc(x, dotY, r, 0, TAU); ctx.fill();
          }
          ctx.globalAlpha = 1;
          const barF = beatF / 4, shotIdx = Math.floor(barF) % 3, shotFrac = barF - Math.floor(barF);
          const flash = shotFrac < 0.06 ? 1 - shotFrac / 0.06 : 0;
          const sx = w * 0.15, sy = h * 0.62, sw = w * 0.7, sh = h * 0.24;
          ctx.fillStyle = C.stage2; rrect(ctx, sx, sy, sw, sh, 6); ctx.fill();
          const shotColors = [C.ink, C.accent, C.muted];
          ctx.save(); rrect(ctx, sx, sy, sw, sh, 6); ctx.clip();
          ctx.globalAlpha = 0.85; ctx.fillStyle = shotColors[shotIdx]; ctx.fillRect(sx, sy, sw, sh);
          ctx.globalAlpha = 1; ctx.restore();
          if (flash > 0) { ctx.fillStyle = `rgba(255,255,255,${flash * 0.8})`; rrect(ctx, sx, sy, sw, sh, 6); ctx.fill(); }
        },
      };
    },
  });

  LEX.register('word-on-beat', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      const words = ['快', '准', '稳', '狠'];
      const bpm = 132, spb = 60 / bpm;
      return {
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
          const period = spb * (words.length + 2);
          const lt = (t + spb * 1.6) % period;
          const n = words.length, gap = w * 0.86 / n, x0 = w * 0.07;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          for (let i = 0; i < n; i++) {
            const onset = i * spb, local = lt - onset;
            const cx = x0 + gap * (i + 0.5), cy = h * 0.46;
            if (local < 0) continue;
            const e = Math.min(api.ease.spring(local, 3.4, api.ease.zetaFor(0.16)), 1.25);
            const y = api.lerp(-h * 0.35, 0, e);
            ctx.save();
            ctx.beginPath(); ctx.rect(cx - gap * 0.48, 0, gap * 0.96, h); ctx.clip();
            ctx.font = api.font('sans', h * 0.24, 800); ctx.fillStyle = C.ink;
            ctx.fillText(words[i], cx, cy + y);
            ctx.restore();
          }
          beatRow(ctx, api, t, bpm, 0.86);
        },
      };
    },
  });

  LEX.register('stagger', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      let gap = 0.07, fired = 0, initialized = false;
      api.onClick(() => { fired = api.t; });
      return {
        param(name, v) { if (name === 'gap') gap = v / 1000; },
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          const rows = 3, cols = 3, n = rows * cols;
          if (!initialized) { fired = -((n - 1) * gap + 0.5 + 0.5); initialized = true; }
          ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
          const revealDur = (n - 1) * gap + 0.5, holdDur = 1.0, fadeDur = 0.3;
          const period = revealDur + holdDur + fadeDur;
          let local = (t - fired) % period; if (local < 0) local += period;
          let fade = 1;
          if (local > revealDur + holdDur) fade = api.clamp(1 - (local - revealDur - holdDur) / fadeDur);
          const cs = h * 0.17, g = h * 0.06;
          const gx0 = (w - (cs * 3 + g * 2)) / 2, gy0 = h * 0.5 - (cs * 3 + g * 2) / 2 - h * 0.02;
          for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
            const idx = r * cols + c, onset = idx * gap;
            const x = gx0 + c * (cs + g), y0 = gy0 + r * (cs + g);
            // permanent target outline
            ctx.strokeStyle = 'rgba(119,117,111,0.4)'; ctx.lineWidth = 1;
            rrect(ctx, x + 0.5, y0 + 0.5, cs - 1, cs - 1, 4); ctx.stroke();
            const p = api.clamp((local - onset) / 0.45);
            if (p <= 0) continue;
            const e = api.ease.expoOut(p);
            const y = y0 + h * 0.06 * (1 - e);
            const a = api.clamp(p * 6) * fade;
            // cobalt only on the leading edge of the wave, fading to ink
            const lead = gap > 0.02 ? api.clamp(1 - (local - onset) / (Math.max(gap, 0.12) * 1.6)) : 0;
            const mix = (a0, b0) => Math.round(a0 + (b0 - a0) * lead);
            ctx.globalAlpha = a; ctx.fillStyle = `rgb(${mix(23, 46)},${mix(23, 75)},${mix(26, 255)})`;
            rrect(ctx, x, y, cs, cs, 4); ctx.fill();
          }
          ctx.globalAlpha = 1;
          api.kit.label(ctx, Math.round(gap * 1000) + ' ms', gx0, h * 0.95, { h });
        },
      };
    },
  });

  LEX.register('no-dead-time', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      let modeStart = 0;
      return {
        mode() { modeStart = api.t; },
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
          const period = 3.0;
          const lt = (t - modeStart) % period;
          const tx0 = w * 0.08, tx1 = w * 0.92, ty = h * 0.18;
          if (api.mode === 0) {
            const dz0 = api.lerp(tx0, tx1, 1.0 / period), dz1 = api.lerp(tx0, tx1, 2.0 / period);
            ctx.strokeStyle = C.line; ctx.lineWidth = Math.max(2, h * 0.018);
            ctx.beginPath(); ctx.moveTo(tx0, ty); ctx.lineTo(tx1, ty); ctx.stroke();
            ctx.strokeStyle = C.bad; ctx.lineWidth = Math.max(3, h * 0.03);
            ctx.beginPath(); ctx.moveTo(dz0, ty); ctx.lineTo(dz1, ty); ctx.stroke();
          } else {
            ctx.strokeStyle = C.good; ctx.lineWidth = Math.max(3, h * 0.03);
            ctx.beginPath(); ctx.moveTo(tx0, ty); ctx.lineTo(tx1, ty); ctx.stroke();
          }
          const px = api.lerp(tx0, tx1, lt / period);
          ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(px, ty, Math.max(3, h * 0.02), 0, TAU); ctx.fill();
          const cx = w * 0.5, cy = h * 0.62;
          let dx = 0, scale = 1;
          if (api.mode === 0) {
            if (lt < 1.0) { dx = Math.sin((lt / 1.0) * Math.PI * 4) * w * 0.14; }
            else if (lt < 2.0) { dx = Math.sin(Math.PI * 4) * w * 0.14; }
            else { const p = (lt - 2.0) / (period - 2.0); dx = -Math.cos(p * Math.PI * 2) * w * 0.14; }
          } else {
            dx = Math.sin(lt * TAU * 1.3) * w * 0.14;
            scale = 1 + 0.06 * Math.sin(lt * TAU * 2.6);
          }
          ctx.save(); ctx.translate(cx + dx, cy); ctx.scale(scale, scale);
          ctx.fillStyle = C.accent; rrect(ctx, -w * 0.06, -h * 0.06, w * 0.12, h * 0.12, 6); ctx.fill();
          ctx.restore();
        },
      };
    },
  });

  LEX.register('orchestrated-load', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      let fired = 0, first = true;
      const period = 3.2;
      api.onClick(() => { fired = api.t; });
      const items = [
        { y: 0.16, w: 0.5, h: 0.11, kind: 'title' },
        { y: 0.32, w: 0.36, h: 0.06, kind: 'sub' },
        { y: 0.44, w: 0.22, h: 0.09, kind: 'btn' },
        { y: 0.60, w: 0.6, h: 0.26, kind: 'img' },
      ];
      function drawItem(w, h, it, jx, jy, scale, alpha) {
        const x = w * 0.08 + jx, y = h * it.y + jy;
        ctx.save(); ctx.globalAlpha = Math.max(0, alpha);
        ctx.fillStyle = it.kind === 'btn' ? C.accent : (it.kind === 'img' ? C.stage2 : C.ink);
        rrect(ctx, x, y, w * it.w * scale, h * it.h * scale, it.kind === 'img' ? 8 : h * it.h * 0.4); ctx.fill();
        ctx.restore();
      }
      return {
        mode() { fired = first ? -period * 0.55 : api.t; first = false; },
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
          if (api.mode === 0) {
            items.forEach((it, i) => {
              const jx = Math.sin(t * 3 + i * 2.1) * w * 0.02, jy = Math.sin(t * 4.3 + i) * h * 0.015;
              const flash = (Math.sin(t * 6 + i * 3) + 1) / 2;
              drawItem(w, h, it, jx, jy, 1, 0.5 + 0.5 * flash);
            });
          } else {
            const lt = (t - fired) % period;
            items.forEach((it, i) => {
              const onset = i * 0.18;
              const p = api.clamp((lt - onset) / 0.5);
              const e = api.ease.expoOut(p);
              drawItem(w, h, it, 0, h * 0.06 * (1 - e), e, e);
            });
          }
        },
      };
    },
  });

  // ── 转场 ────────────────────────────────────────────────────────────

  LEX.register('masked-reveal', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      let modeStart = 0, first = true;
      const lines = ['设计', '动效', '词典'];
      const period = 2.4;
      return {
        mode() { modeStart = first ? -period * 0.75 : api.t; first = false; },
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
          const lt = (t - modeStart) % period;
          ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
          const lh = h * 0.26;
          lines.forEach((txt, i) => {
            const onset = i * 0.16, local = lt - onset;
            const p = api.clamp(local / 0.55);
            const e = api.mode === 0 ? api.ease.inOut(p) : api.ease.expoOut(p);
            const y = h * 0.3 + i * lh;
            ctx.save();
            if (api.mode === 1) { ctx.beginPath(); ctx.rect(0, y - lh * 0.85, w, lh); ctx.clip(); }
            else ctx.globalAlpha = e;
            const dy = api.mode === 1 ? (1 - e) * lh * 0.85 : 0;
            ctx.font = api.font('serif', h * 0.17, 500); ctx.fillStyle = C.ink;
            ctx.fillText(txt, w * 0.1, y + dy);
            ctx.restore();
          });
        },
      };
    },
  });

  LEX.register('match-cut', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      const shots = [
        { bg: C.stage2, x: 0.78, y: 0.28, r: 0.09, col: C.accent2 },
        { bg: C.ink, x: 0.30, y: 0.5, r: 0.11, col: C.accent },
        { bg: C.muted, x: 0.5, y: 0.32, r: 0.13, col: '#fff' },
      ];
      const shotDur = 1.5, total = shotDur * shots.length;
      return {
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          const lt = t % total;
          const idx = Math.floor(lt / shotDur), p = (lt - idx * shotDur) / shotDur;
          const prev = shots[(idx - 1 + shots.length) % shots.length], cur = shots[idx];
          ctx.fillStyle = cur.bg; ctx.fillRect(0, 0, w, h);
          const e = api.ease.out(api.clamp(p / 0.7));
          const cx = api.lerp(prev.x, cur.x, e) * w, cy = api.lerp(prev.y, cur.y, e) * h;
          const r = api.lerp(prev.r, cur.r, e) * Math.min(w, h);
          ctx.fillStyle = cur.col;
          ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
        },
      };
    },
  });

  LEX.register('shape-morph', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      const states = [
        { w: 0.28, h: 0.16, r: 0.5, icon: 'btn' },
        { w: 0.16, h: 0.16, r: 0.5, icon: 'load' },
        { w: 0.16, h: 0.16, r: 0.5, icon: 'check' },
        { w: 0.5, h: 0.08, r: 0.5, icon: 'pill' },
        { w: 0.42, h: 0.28, r: 0.12, icon: 'card' },
      ];
      function drawIcon(kind, cx, cy, w, h) {
        if (kind === 'btn') { ctx.font = api.font('mono', h * 0.42, 700); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.fillText('GO', cx, cy); }
        else if (kind === 'load') { ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(1.5, h * 0.09); ctx.beginPath(); ctx.arc(cx, cy, h * 0.26, 0.4, 2.6); ctx.stroke(); }
        else if (kind === 'check') { ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(1.5, h * 0.1); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx - h * 0.2, cy); ctx.lineTo(cx - h * 0.03, cy + h * 0.18); ctx.lineTo(cx + h * 0.24, cy - h * 0.2); ctx.stroke(); }
        else if (kind === 'pill') { ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillRect(cx - w * 0.32, cy - h * 0.08, w * 0.64, h * 0.16); }
        else { ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(cx - w * 0.38, cy - h * 0.22, w * 0.76, h * 0.1); ctx.fillRect(cx - w * 0.38, cy - h * 0.02, w * 0.5, h * 0.08); }
      }
      const segDur = 1.1, total = segDur * states.length;
      return {
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
          const lt = t % total;
          const idx = Math.floor(lt / segDur), p = (lt - idx * segDur) / segDur;
          const prev = states[(idx - 1 + states.length) % states.length], cur = states[idx];
          const e = Math.min(api.ease.spring(p * segDur, 2.4, api.ease.zetaFor(0.1)), 1);
          const cw = api.lerp(prev.w, cur.w, e) * w, ch = api.lerp(prev.h, cur.h, e) * h;
          const cr = Math.min(cw, ch) * cur.r;
          const cx = w * 0.5, cy = h * 0.5;
          ctx.fillStyle = C.accent; rrect(ctx, cx - cw / 2, cy - ch / 2, cw, ch, cr); ctx.fill();
          const swapWin = 0.18;
          ctx.save(); rrect(ctx, cx - cw / 2, cy - ch / 2, cw, ch, cr); ctx.clip();
          if (p < swapWin) {
            const a = p / swapWin;
            ctx.filter = 'blur(2px)'; ctx.globalAlpha = 1 - a; drawIcon(prev.icon, cx, cy, cw, ch);
            ctx.globalAlpha = a; drawIcon(cur.icon, cx, cy, cw, ch);
            ctx.filter = 'none'; ctx.globalAlpha = 1;
          } else drawIcon(cur.icon, cx, cy, cw, ch);
          ctx.restore();
        },
      };
    },
  });

  LEX.register('iris-open', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      const total = 2.6, openStart = 0.5, openDur = 0.7;
      return {
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          const lt = (t + 1.6) % total;
          const btnX = w * 0.5, btnY = h * 0.66;
          ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = C.ink; rrect(ctx, btnX - w * 0.14, btnY - h * 0.08, w * 0.28, h * 0.16, h * 0.08); ctx.fill();
          ctx.fillStyle = '#fff'; ctx.font = api.font('sans', h * 0.06, 600); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('打开', btnX, btnY);
          const p = api.clamp((lt - openStart) / openDur);
          if (p > 0) {
            const e = api.ease.expoOut(p);
            const r = e * Math.hypot(w, h) * 0.75;
            ctx.save(); ctx.beginPath(); ctx.arc(btnX, btnY, r, 0, TAU); ctx.clip();
            ctx.fillStyle = C.night; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = C.nightInk; ctx.globalAlpha = 0.9;
            ctx.beginPath(); ctx.arc(w * 0.5, h * 0.42, h * 0.14, 0, TAU); ctx.fill();
            ctx.globalAlpha = 1; ctx.fillStyle = C.accent;
            rrect(ctx, w * 0.32, h * 0.62, w * 0.36, h * 0.08, h * 0.04); ctx.fill();
            ctx.restore();
          }
        },
      };
    },
  });

  LEX.register('whip-pan', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      const period = 2.0, whipDur = 0.32, cards = 5;
      return {
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
          const lt = (t + 1.3) % period;
          const p = api.clamp(lt / whipDur);
          const e = 1 - Math.pow(1 - p, 3);
          const travel = w * 1.4;
          const offset = api.lerp(travel, 0, e);
          const cw = w * 0.22, gap = w * 0.06, cy = h * 0.5, ch = h * 0.5;
          const trails = p < 1 ? 3 : 0;
          for (let g = trails; g >= 0; g--) {
            const tOff = g * 0.02 * travel * (1 - e);
            ctx.globalAlpha = g === 0 ? 1 : 0.16 / g;
            for (let i = 0; i < cards; i++) {
              const cx = w * 0.5 + (i - 2) * (cw + gap) + offset + tOff;
              if (cx < -cw || cx > w + cw) continue;
              const isHero = i === 2;
              ctx.fillStyle = isHero ? C.accent : C.ink;
              const scale = isHero ? api.lerp(1, 1.08, e) : 1;
              rrect(ctx, cx - cw * scale / 2, cy - ch * scale / 2, cw * scale, ch * scale, 8); ctx.fill();
            }
          }
          ctx.globalAlpha = 1;
        },
      };
    },
  });

  LEX.register('push-cut', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      const nums = ['128', '4.6', '92%'];
      const bpm = 120, spb = 60 / bpm, segDur = spb * 2;
      const period = segDur * nums.length;
      return {
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
          const lt = (t + segDur * 2.3) % period;
          const idx = Math.floor(lt / segDur), p = (lt - idx * segDur) / segDur;
          const e = api.ease.expoOut(api.clamp(p / 0.35));
          const scale = api.lerp(1.06, 1, e);
          ctx.save(); ctx.translate(w * 0.5, h * 0.5); ctx.scale(scale, scale);
          ctx.font = api.font('sans', h * 0.34, 800); ctx.fillStyle = C.ink;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(nums[idx], 0, 0);
          ctx.restore();
          beatRow(ctx, api, t, bpm, 0.88);
        },
      };
    },
  });

  LEX.register('material-wipe', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      const sceneDur = 1.3, wipeDur = 0.7, half = sceneDur + wipeDur, period = half * 2;
      const scenes = [
        { bg: C.stage2, fg: C.ink, txt: '01', tag: 'liquid' },
        { bg: C.night, fg: C.nightInk, txt: '02', tag: 'light' },
      ];
      function drawScene(s, w, h) {
        ctx.fillStyle = s.bg; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = s.fg; ctx.font = api.font('serif', h * 0.46, 300);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s.txt, w * 0.5, h * 0.5);
        api.kit.label(ctx, s.tag, w * 0.06, h * 0.93, { h });
      }
      return {
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          const lt = (t + sceneDur + wipeDur * 0.5) % period;
          const cyc = lt < half ? 0 : 1;
          const local = lt - cyc * half;
          const from = scenes[cyc], to = scenes[(cyc + 1) % 2];
          drawScene(from, w, h);
          const p = api.clamp((local - sceneDur) / wipeDur);
          if (p <= 0) return;
          const e = api.ease.inOut(p), fadeLine = Math.sin(Math.PI * e);
          const amp = w * 0.06;
          ctx.save();
          if (cyc === 0) {
            const bx = -amp + (w + 2 * amp) * e;
            const pts = [];
            for (let i = 0; i <= 28; i++) {
              const y = h * i / 28;
              const v = y / h * TAU;
              const wob = (Math.sin(v * 1.2 + t * 3.2) * 0.65 + Math.sin(v * 2.4 - t * 2.1 + 1) * 0.35) * amp * fadeLine;
              pts.push([bx + wob, y]);
            }
            ctx.beginPath(); ctx.moveTo(0, 0);
            pts.forEach(q => ctx.lineTo(q[0], q[1]));
            ctx.lineTo(0, h); ctx.closePath(); ctx.clip();
            drawScene(to, w, h);
            ctx.restore(); ctx.save();
            ctx.beginPath(); pts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]));
            ctx.strokeStyle = C.accent; ctx.lineWidth = 1.5; ctx.globalAlpha = fadeLine; ctx.stroke();
          } else {
            const bx = w * e;
            ctx.beginPath(); ctx.rect(0, 0, bx, h); ctx.clip();
            drawScene(to, w, h);
            ctx.restore(); ctx.save();
            const gr = ctx.createLinearGradient(bx, 0, bx + w * 0.16, 0);
            gr.addColorStop(0, 'rgba(236,233,226,0.34)'); gr.addColorStop(1, 'rgba(236,233,226,0)');
            ctx.beginPath(); ctx.rect(bx, 0, w * 0.16, h); ctx.clip();
            ctx.globalAlpha = fadeLine; ctx.fillStyle = gr; ctx.fillRect(bx, 0, w * 0.16, h);
            ctx.restore(); ctx.save();
            ctx.globalAlpha = fadeLine; ctx.fillStyle = C.accent; ctx.fillRect(bx - 0.75, 0, 1.5, h);
          }
          ctx.restore();
        },
      };
    },
  });
})();
