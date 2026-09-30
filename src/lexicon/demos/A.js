/* Group A demos — L1 底座 (fixed-stage, duration-fps, seek-t, seeded-random, loop-seam,
 * storyboard-first, contact-sheet, subframe-blur, export-mp4, aspect-ratios, safe-zone,
 * reduced-motion) + L5 结构 (s-five-scene, s-launch-bars, s-mechanism, s-scale-journey,
 * s-loop-cycle, s-shot-list, s-landing-signature, s-longread). One IIFE, only
 * LEX.register calls + private helpers inside; nothing touches global scope. */
(function () {
  'use strict';
  const TAU = Math.PI * 2;

  function rrect(ctx, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, Math.min(w, h) / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  function label(ctx, api, text, x, y, opts) {
    opts = opts || {};
    const C = api.colors;
    ctx.font = api.font('mono', opts.size || Math.max(10, api.h * 0.052), opts.weight || 600);
    ctx.fillStyle = opts.color || C.ink;
    ctx.textAlign = opts.align || 'center';
    ctx.textBaseline = opts.baseline || 'middle';
    ctx.fillText(text, x, y);
  }

  // Shared "segment row" skeleton used by several L5 narrative demos: a strip of
  // abstract pictograms above a ticked baseline, with a playhead that sweeps the
  // whole loop and highlights whichever segment it is currently over.
  function skeletonRow(ctx, api, t, period, items, drawIcon) {
    const w = api.w, h = api.h; if (!w) return;
    const C = api.colors;
    ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
    const n = items.length;
    const x0 = w * 0.08, x1 = w * 0.92, y = h * 0.42;
    const segW = (x1 - x0) / n;
    const p = (t % period) / period;
    const raw = p * n;
    const activeIdx = Math.min(n - 1, Math.floor(raw));
    const segP = raw - activeIdx;
    for (let i = 0; i < n; i++) {
      const cx = x0 + segW * (i + 0.5);
      const active = i === activeIdx;
      ctx.save();
      if (active) {
        const pulse = 1 + 0.12 * Math.sin(segP * Math.PI);
        ctx.translate(cx, y); ctx.scale(pulse, pulse); ctx.translate(-cx, -y);
      }
      ctx.strokeStyle = active ? C.accent : C.line;
      ctx.fillStyle = active ? C.accent : C.ink;
      ctx.lineWidth = Math.max(1.2, h * 0.01);
      drawIcon(i, cx, y, Math.min(segW, h * 0.5) * 0.62, active, active ? segP : 0);
      ctx.restore();
      if (items[i]) label(ctx, api, items[i], cx, y + h * 0.24, { size: Math.max(9, h * 0.052), color: active ? C.accent : C.muted });
    }
    const by = y + h * 0.32;
    ctx.strokeStyle = C.line; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, by); ctx.lineTo(x1, by); ctx.stroke();
    for (let i = 0; i <= n; i++) { const x = x0 + i * segW; ctx.beginPath(); ctx.moveTo(x, by - 5); ctx.lineTo(x, by + 5); ctx.stroke(); }
    const px = x0 + p * (x1 - x0);
    ctx.fillStyle = C.accent;
    ctx.beginPath(); ctx.arc(px, by, Math.max(3.5, h * 0.022), 0, TAU); ctx.fill();
  }

  // ── L1 底座 ──────────────────────────────────────────────────────────

  LEX.register('fixed-stage', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      let mode = 1;
      const period = 4.2;
      return {
        resize() { this.frame(api.t, 0); },
        mode(m) { mode = m; },
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.stage2; ctx.fillRect(0, 0, w, h);
          const p = (t % period) / period;
          const winW = api.lerp(w * 0.46, w * 0.92, 0.5 + 0.5 * Math.sin(p * TAU));
          const winH = h * 0.8, winX = (w - winW) / 2, winY = (h - winH) / 2;

          if (mode === 0) {
            ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.strokeRect(winX, winY, winW, winH);
            ctx.fillStyle = C.ink;
            ctx.fillRect(winX + winW * 0.06, winY + winH * 0.10, winW * 0.5, winH * 0.12);
            const imgW = Math.min(w * 0.30, winW * 0.7), imgH = h * 0.30;
            ctx.strokeStyle = C.muted;
            ctx.strokeRect(winX + winW * 0.06, winY + winH * 0.34, imgW, imgH * 0.6);
            const btnW = w * 0.22, btnH = h * 0.12;
            const btnX = winX + w * 0.36, btnY = winY + winH * 0.68;
            const overflow = btnX + btnW > winX + winW;
            ctx.save(); ctx.beginPath(); ctx.rect(winX, winY, winW, winH); ctx.clip();
            ctx.fillStyle = overflow ? C.bad : C.accent2;
            ctx.fillRect(btnX, btnY, btnW, btnH);
            ctx.restore();
          } else {
            const stageAR = 16 / 9;
            let sw = winW, sh = sw / stageAR;
            if (sh > winH) { sh = winH; sw = sh * stageAR; }
            const sx = winX + (winW - sw) / 2, sy = winY + (winH - sh) / 2;
            ctx.fillStyle = C.night; ctx.fillRect(winX, winY, winW, winH);
            ctx.fillStyle = C.stage; ctx.fillRect(sx, sy, sw, sh);
            ctx.strokeStyle = C.line; ctx.strokeRect(sx, sy, sw, sh);
            const u = v => sx + v * sw, vv = v => sy + v * sh;
            ctx.fillStyle = C.ink; ctx.fillRect(u(0.06), vv(0.10), sw * 0.5, sh * 0.12);
            ctx.strokeStyle = C.muted; ctx.strokeRect(u(0.06), vv(0.30), sw * 0.42, sh * 0.34);
            ctx.fillStyle = C.accent; ctx.fillRect(u(0.58), vv(0.64), sw * 0.28, sh * 0.14);
          }
          ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.strokeRect(winX, winY, winW, winH);
        }
      };
    }
  });

  LEX.register('duration-fps', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      let fps = 24;
      const period = 2;
      return {
        resize() { this.frame(api.t, 0); },
        param(name, v) { if (name === 'fps') fps = Math.max(1, Math.round(v)); },
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
          const stepDur = 1 / fps;
          const tq = Math.floor(t / stepDur) * stepDur;
          const raw = (tq % period) / period;
          const y = h * 0.36, x0 = w * 0.08, x1 = w * 0.92;
          ctx.strokeStyle = C.line; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
          ctx.fillStyle = C.accent;
          ctx.beginPath(); ctx.arc(api.lerp(x0, x1, raw), y, Math.max(6, h * 0.06), 0, TAU); ctx.fill();

          const totalFrames = Math.max(1, Math.round(period * fps));
          const curFrame = Math.floor((t % period) / stepDur) % totalFrames;
          const ry = h * 0.78;
          ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, ry); ctx.lineTo(x1, ry); ctx.stroke();
          for (let i = 0; i <= totalFrames; i++) {
            const fx = api.lerp(x0, x1, i / totalFrames);
            const tall = i === curFrame;
            ctx.strokeStyle = tall ? C.accent : C.line;
            ctx.lineWidth = tall ? 2 : 1;
            ctx.beginPath(); ctx.moveTo(fx, ry - (tall ? 7 : 4)); ctx.lineTo(fx, ry + (tall ? 7 : 4)); ctx.stroke();
          }
          label(ctx, api, fps + ' fps', w * 0.5, h * 0.94, { size: Math.max(10, h * 0.06), color: C.muted });
        }
      };
    }
  });

  LEX.register('seek-t', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      const DURATION = 6;
      let cursor = 1.5, hold = 0;
      function seek(s) {
        const p = api.clamp(s / DURATION);
        const x = api.lerp(0.1, 0.86, api.ease.inOut(p));
        const sc = 0.6 + 0.4 * api.ease.spring(Math.max(0, s - 3.6), 1.4, 0.5);
        const alpha = api.clamp((s - 3.2) / 0.8);
        return { x, sc, alpha };
      }
      return {
        resize() { this.frame(api.t, 0); },
        param(name, v) { if (name === 't') { cursor = v; hold = 3; } },
        frame(t, dt) {
          const w = api.w, h = api.h; if (!w) return;
          if (hold > 0) hold -= dt; else cursor = (cursor + dt) % DURATION;
          ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
          const s = seek(cursor);
          const cx = w * s.x, cy = h * 0.32;
          ctx.save(); ctx.translate(cx, cy); ctx.scale(s.sc, s.sc);
          ctx.fillStyle = C.accent;
          rrect(ctx, -h * 0.07, -h * 0.07, h * 0.14, h * 0.14, Math.max(2, h * 0.02));
          ctx.fill();
          ctx.restore();
          if (s.alpha > 0.01) {
            ctx.globalAlpha = s.alpha;
            label(ctx, api, 'READY', w * 0.5, h * 0.12, { size: Math.max(10, h * 0.06), color: C.ink });
            ctx.globalAlpha = 1;
          }
          const y = h * 0.82, x0 = w * 0.08, x1 = w * 0.92;
          ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
          const px = api.lerp(x0, x1, cursor / DURATION);
          ctx.fillStyle = hold > 0 ? C.accent2 : C.accent;
          ctx.beginPath(); ctx.arc(px, y, Math.max(4, h * 0.03), 0, TAU); ctx.fill();
          label(ctx, api, 't=' + cursor.toFixed(2), x1, y - h * 0.09, { align: 'right', size: Math.max(10, h * 0.052), color: C.muted });
        }
      };
    }
  });

  LEX.register('seeded-random', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      let mode = 1;
      const N = 70;
      const seedRng = api.rng(42);
      const stars = Array.from({ length: N }, () => ({ x: seedRng(), y: seedRng(), r: 0.6 + seedRng() * 1.8, phase: seedRng() * TAU }));
      return {
        resize() { this.frame(api.t, 0); },
        mode(m) { mode = m; },
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.night; ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = C.nightInk;
          if (mode === 0) {
            const seed = Math.floor(t * 14) * 7919 + 1;
            const r = api.rng(seed);
            for (let i = 0; i < N; i++) {
              const x = r() * w, y = r() * h, rad = 0.6 + r() * 2.2, br = 0.4 + r() * 0.6;
              ctx.globalAlpha = br;
              ctx.beginPath(); ctx.arc(x, y, rad, 0, TAU); ctx.fill();
            }
          } else {
            for (const s of stars) {
              const br = 0.45 + 0.4 * Math.sin(t * 1.1 + s.phase);
              ctx.globalAlpha = br;
              ctx.beginPath(); ctx.arc(s.x * w, s.y * h, s.r, 0, TAU); ctx.fill();
            }
          }
          ctx.globalAlpha = 1;
        }
      };
    }
  });

  LEX.register('loop-seam', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      let mode = 1;
      const period = 3;
      const GAP = 0.17; // A: the last frame stops this fraction of the ring short of the first frame
      return {
        resize() { this.frame(api.t, 0); },
        mode(m) { mode = m; },
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
          const cyc = ((t % period) + period) % period, p = cyc / period;
          const cx = w * 0.5, cy = h * 0.5, R = Math.min(w * 0.3, h * 0.28);
          const span = mode === 1 ? 1 : 1 - GAP;
          const start = -Math.PI / 2, endA = start + span * TAU;
          const posAt = ts => { const c = (((ts % period) + period) % period) / period; return start + c * span * TAU; };
          const dotR = Math.max(5, h * 0.036), ghostR = Math.max(5, h * 0.032);

          // ring + 10-degree ticks
          ctx.lineWidth = 1; ctx.strokeStyle = C.line;
          ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
          for (let i = 0; i < 36; i++) {
            const a = start + i * TAU / 36, l = i === 0 ? 0 : (i % 9 === 0 ? 7 : 4);
            if (!l) continue;
            ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * (R + 3), cy + Math.sin(a) * (R + 3)); ctx.lineTo(cx + Math.cos(a) * (R + 3 + l), cy + Math.sin(a) * (R + 3 + l)); ctx.stroke();
          }

          // the seam: a long ink tick at the top + label
          ctx.strokeStyle = C.ink; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(cx, cy - R - 3); ctx.lineTo(cx, cy - R - 3 - Math.max(9, h * 0.06)); ctx.stroke();
          label(ctx, api, 'seam', cx, cy - R - 3 - Math.max(9, h * 0.06) - Math.max(8, h * 0.035), { size: Math.max(10, h * 0.048), weight: 400, color: C.muted });

          // A: the gap between the last frame and the first frame, drawn on the ring
          if (mode === 0) {
            ctx.strokeStyle = C.bad; ctx.lineWidth = Math.max(2, h * 0.012);
            ctx.beginPath(); ctx.arc(cx, cy, R, endA, start + TAU); ctx.stroke();
          }
          // ghost markers: first frame + last frame (coincide in B)
          ctx.lineWidth = 1.2; ctx.strokeStyle = C.ink;
          [start, endA].forEach(a => { ctx.beginPath(); ctx.arc(cx + R * Math.cos(a), cy + R * Math.sin(a), ghostR, 0, TAU); ctx.stroke(); });

          // afterimage trail (previous cycle wraps in, so the seam shows up in the trail)
          for (let k = 9; k >= 1; k--) {
            const a = posAt(t - k * 0.05);
            ctx.globalAlpha = 0.5 * (1 - k / 10);
            ctx.fillStyle = C.accent;
            ctx.beginPath(); ctx.arc(cx + R * Math.cos(a), cy + R * Math.sin(a), dotR * (1 - k * 0.07), 0, TAU); ctx.fill();
          }
          ctx.globalAlpha = 1;
          const ang = posAt(t);
          ctx.fillStyle = C.accent;
          ctx.beginPath(); ctx.arc(cx + R * Math.cos(ang), cy + R * Math.sin(ang), dotR, 0, TAU); ctx.fill();

          // seam flash: green ring in B (no jump), red in A (jump)
          const d = Math.min(cyc, period - cyc), fl = d < 0.16 ? 1 - d / 0.16 : 0;
          if (fl > 0.01) {
            ctx.globalAlpha = fl; ctx.strokeStyle = mode === 0 ? C.bad : C.good; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(cx, cy - R, ghostR + (1 - fl) * h * 0.06, 0, TAU); ctx.stroke();
            ctx.globalAlpha = 1;
          }

          // ruler: 0 .. 3.00 s, both ends are the same frame
          const rx0 = w * 0.2, rx1 = w * 0.8, ry = h * 0.87;
          ctx.strokeStyle = C.line; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(rx0, ry); ctx.lineTo(rx1, ry); ctx.stroke();
          for (let i = 0; i <= 30; i++) { const x = rx0 + (rx1 - rx0) * i / 30; ctx.beginPath(); ctx.moveTo(x, ry - (i % 10 === 0 ? 5 : 2.5)); ctx.lineTo(x, ry + (i % 10 === 0 ? 5 : 2.5)); ctx.stroke(); }
          ctx.strokeStyle = C.ink;
          [rx0, rx1].forEach(x => { ctx.beginPath(); ctx.moveTo(x, ry - 7); ctx.lineTo(x, ry + 7); ctx.stroke(); });
          ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(rx0 + (rx1 - rx0) * p, ry, Math.max(3, h * 0.016), 0, TAU); ctx.fill();
          label(ctx, api, cyc.toFixed(2) + 's', w * 0.5, h * 0.95, { size: Math.max(10, h * 0.048), weight: 400, color: C.muted });
        }
      };
    }
  });

  LEX.register('storyboard-first', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      const period = 7.2;
      const N = 4, BEATS = 16;
      const dur = [3, 5, 4, 4], start = [0, 3, 8, 12];
      // one quiet geometric mark per shot (hook / transform / steps / landing)
      function shot(i, x, y, w, h) {
        ctx.lineWidth = 1; ctx.strokeStyle = C.ink; ctx.fillStyle = C.ink;
        if (i === 0) { ctx.beginPath(); ctx.arc(x + w * 0.3, y + h * 0.62, h * 0.07, 0, TAU); ctx.fill(); }
        else if (i === 1) { ctx.beginPath(); ctx.arc(x + w * 0.5, y + h * 0.5, h * 0.27, 0, TAU); ctx.stroke(); }
        else if (i === 2) { [0.36, 0.52, 0.68].forEach((f, k) => { ctx.beginPath(); ctx.moveTo(x + w * 0.2, y + h * f); ctx.lineTo(x + w * (0.8 - k * 0.14), y + h * f); ctx.stroke(); }); }
        else { ctx.fillStyle = C.accent; const s = h * 0.24; ctx.fillRect(x + w * 0.5 - s / 2, y + h * 0.5 - s / 2, s, s); }
      }
      return {
        resize() { this.frame(api.t, 0); },
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
          const lt = ((t % period) + period) % period;
          const cw = w * 0.2, ch = cw * 0.625, gap = w * 0.03, x0 = (w - (N * cw + (N - 1) * gap)) / 2, fy = h * 0.2;
          const TL = w * 0.09, TR = w * 0.91, bw = (TR - TL) / BEATS, by = h * 0.56, bh = h * 0.17, ry = h * 0.78;
          const seg = api.clamp, io = api.ease.inOut;
          const sweep = api.clamp((lt - 2.3) / 3.3);
          const beat = sweep * BEATS;
          let act = -1; if (sweep > 0 && sweep < 1) for (let i = 0; i < N; i++) if (beat >= start[i] && beat < start[i] + dur[i]) act = i;
          const ms = [];
          for (let i = 0; i < N; i++) {
            const d = i * 0.08, fwd = io(seg((lt - 1.0 - d) / 0.9)), back = io(seg((lt - 6.2 - d) / 0.7));
            ms.push(fwd * (1 - back));
          }
          const mAvg = ms.reduce((a, b) => a + b, 0) / N;
          // ruler (beat grid)
          if (mAvg > 0.02) {
            ctx.globalAlpha = mAvg;
            ctx.strokeStyle = C.line; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(TL, ry); ctx.lineTo(TR, ry); ctx.stroke();
            for (let b = 0; b <= BEATS; b++) { const x = TL + b * bw; ctx.beginPath(); ctx.moveTo(x, ry); ctx.lineTo(x, ry + (b % 4 === 0 ? 8 : 4)); ctx.stroke(); }
            ctx.globalAlpha = 1;
          }
          for (let i = 0; i < N; i++) {
            const m = ms[i];
            const fx = x0 + i * (cw + gap);
            const rx = api.lerp(fx, TL + start[i] * bw + 1, m), rw = api.lerp(cw, dur[i] * bw - 2, m);
            const ry0 = api.lerp(fy, by, m), rh = api.lerp(ch, bh, m);
            const on = i === act;
            ctx.fillStyle = on ? C.stage2 : C.paper; ctx.fillRect(rx, ry0, rw, rh);
            ctx.strokeStyle = on ? C.ink : C.muted; ctx.lineWidth = 1; ctx.strokeRect(rx + 0.5, ry0 + 0.5, rw - 1, rh - 1);
            const sa = 1 - api.clamp(m * 2.2);
            if (sa > 0.02) { ctx.globalAlpha = sa; shot(i, rx, ry0, rw, rh); ctx.globalAlpha = 1; }
            // shot number (serif) slides from under the frame into the block
            const px = h * 0.1;
            ctx.font = api.font('serif', px, 300); ctx.fillStyle = on ? C.accent : C.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
            // the numeral hands over from under the frame to inside the block at the midpoint of the morph
            const inBlock = m > 0.5;
            ctx.globalAlpha = Math.abs(m - 0.5) * 2;
            ctx.fillText('0' + (i + 1), inBlock ? rx + w * 0.014 : fx, inBlock ? by + bh * 0.5 + px * 0.34 : fy + ch + h * 0.13);
            ctx.globalAlpha = 1;
          }
          if (mAvg > 0.02 || sweep > 0) {
            const px = TL + sweep * (TR - TL);
            ctx.globalAlpha = Math.min(1, mAvg * 1.5) * (sweep > 0 ? 1 : 0.0);
            ctx.strokeStyle = C.accent; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(px, by - h * 0.05); ctx.lineTo(px, ry + 10); ctx.stroke();
            ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(px, by - h * 0.05, Math.max(3.5, h * 0.018), 0, TAU); ctx.fill();
            ctx.globalAlpha = 1;
          }
          if (mAvg > 0.02) {
            const s = beat * 0.5;
            ctx.globalAlpha = mAvg;
            label(ctx, api, '00:' + (s < 10 ? '0' : '') + s.toFixed(1), TL, h * 0.92, { size: Math.max(10, h * 0.048), weight: 400, color: C.muted, align: 'left' });
            ctx.globalAlpha = 1;
          }
        }
      };
    }
  });

  LEX.register('contact-sheet', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      const period = 7.2;
      const N = 8, flagIdx = 4;
      const FIX0 = 4.9, FIX1 = 5.6, CLASH = 0.32, CLEAN = 1.15;
      // one "frame": two Latin lines, the second sits `sep` line-heights below the first (small sep = overlap)
      function comp(i, x, y, w, h, sep) {
        ctx.fillStyle = C.paper; ctx.fillRect(x, y, w, h);
        const hs = w * 0.2, cyy = y + h * 0.46;
        const y1 = cyy - hs * sep * 0.5 + hs * 0.3, y2 = y1 + sep * hs;
        ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        ctx.font = api.font('serif', hs, 400); ctx.fillStyle = C.ink; ctx.fillText('Signal', x + w * 0.1, y1);
        ctx.font = api.font('serif', hs, 400, 'italic'); ctx.fillStyle = C.muted; ctx.fillText('Motion', x + w * 0.1, y2);
        // the cobalt point travels across the frames (one dot per frame, at that frame's time)
        ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(x + w * (0.1 + 0.8 * i / (N - 1)), y + h * 0.88, Math.max(1.5, h * 0.035), 0, TAU); ctx.fill();
      }
      return {
        resize() { this.frame(api.t, 0); },
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
          const lt = ((t % period) + period) % period;
          const seg = a => api.clamp(a), io = api.ease.inOut;
          const cw = w * 0.096, gap = w * 0.01, ch = cw * 0.625, x0 = (w - (N * cw + (N - 1) * gap)) / 2, sy = h * 0.77;
          const scanIdx = lt < 1.0 ? -1 : Math.min(flagIdx, Math.floor((lt - 1.0) / 0.4));
          const e = io(seg((lt - 3.0) / 0.7)) * (1 - io(seg((lt - 6.3) / 0.7)));
          const fixP = io(seg((lt - FIX0) / (FIX1 - FIX0)));
          const sep = api.lerp(CLASH, CLEAN, fixP);
          const hw = w * 0.44, hh = hw * 0.625, hx = (w - hw) / 2, hy = h * 0.1;
          const fcx = x0 + flagIdx * (cw + gap);
          // strip
          for (let i = 0; i < N; i++) {
            const x = x0 + i * (cw + gap);
            ctx.globalAlpha = e > 0 && i !== flagIdx ? 1 - 0.45 * e : 1;
            comp(i, x, sy, cw, ch, i === flagIdx ? sep : CLEAN);
            ctx.lineWidth = 1; ctx.strokeStyle = C.muted; ctx.strokeRect(x + 0.5, sy + 0.5, cw - 1, ch - 1);
            ctx.globalAlpha = 1;
            // beat tick under every frame; the probe stops on the ones already checked
            ctx.strokeStyle = i <= scanIdx ? C.ink : C.line;
            ctx.beginPath(); ctx.moveTo(x + cw / 2, sy + ch + 3); ctx.lineTo(x + cw / 2, sy + ch + 3 + (i <= scanIdx ? 6 : 3)); ctx.stroke();
          }
          // probe
          if (scanIdx >= 0 && lt < 6.9) {
            const px = x0 + scanIdx * (cw + gap) + cw / 2;
            ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(px, sy + ch + h * 0.07, Math.max(3, h * 0.018), 0, TAU); ctx.fill();
          }
          // flag on the strip cell
          const flagged = lt > 3.0 && lt < 6.9;
          const boxCol = fixP > 0.02 ? C.good : C.bad;
          if (flagged) { ctx.strokeStyle = boxCol; ctx.lineWidth = 1.5; ctx.strokeRect(fcx - 1.5, sy - 1.5, cw + 3, ch + 3); }
          // empty loupe slot (dashed) until a frame is pulled up
          if (e < 0.99) { ctx.save(); ctx.globalAlpha = 1 - e; ctx.setLineDash([3, 3]); ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.strokeRect(hx + 0.5, hy + 0.5, hw - 1, hh - 1); ctx.restore(); }
          // loupe: hero frame + two hairlines to its source cell
          if (e > 0.01) {
            const cx0 = api.lerp(fcx, hx, e), cy0 = api.lerp(sy, hy, e), cw0 = api.lerp(cw, hw, e), chh = api.lerp(ch, hh, e);
            ctx.globalAlpha = e; ctx.strokeStyle = C.line; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(hx, hy + hh); ctx.lineTo(fcx, sy); ctx.moveTo(hx + hw, hy + hh); ctx.lineTo(fcx + cw, sy); ctx.stroke();
            ctx.globalAlpha = 1;
            ctx.save(); ctx.globalAlpha = Math.min(1, e * 1.4);
            comp(flagIdx, cx0, cy0, cw0, chh, sep);
            ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(cx0 + 0.5, cy0 + 0.5, cw0 - 1, chh - 1);
            if (e > 0.9 && lt < 6.3) {
              const pulse = lt < FIX0 ? 0.55 + 0.45 * Math.sin(lt * 9) : 1 - api.clamp((lt - FIX1) / 0.4);
              ctx.globalAlpha = Math.max(0, pulse); ctx.strokeStyle = boxCol; ctx.lineWidth = 1.5;
              ctx.strokeRect(cx0 + cw0 * 0.06, cy0 + chh * 0.16, cw0 * 0.62, chh * 0.56);
            }
            ctx.restore();
          }
          const tl = scanIdx < 0 ? 0 : scanIdx * 0.5;
          label(ctx, api, tl.toFixed(1) + 's', x0, h * 0.95, { size: Math.max(10, h * 0.048), weight: 400, align: 'left', color: (flagged && lt < FIX0) ? C.bad : C.muted });
        }
      };
    }
  });

  LEX.register('subframe-blur', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      let mode = 1;
      const period = 1.6;
      return {
        resize() { this.frame(api.t, 0); },
        mode(m) { mode = m; },
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
          const cardW = w * 0.16, cardH = h * 0.4, y = h * 0.5 - cardH / 2;
          if (mode === 1) {
            const trail = 5;
            for (let k = trail; k >= 0; k--) {
              const ts = t - k * 0.018;
              const p = (((ts % period) + period) % period) / period;
              const x = api.lerp(w * 0.06, w * 0.94 - cardW, p);
              ctx.globalAlpha = k === 0 ? 1 : 0.35 * (1 - k / trail);
              ctx.fillStyle = C.accent;
              ctx.fillRect(x, y, cardW, cardH);
            }
            ctx.globalAlpha = 1;
          } else {
            const strobeFps = 10, ts = Math.floor(t * strobeFps) / strobeFps;
            const p = (((ts % period) + period) % period) / period;
            const x = api.lerp(w * 0.06, w * 0.94 - cardW, p);
            ctx.fillStyle = C.accent;
            ctx.fillRect(x, y, cardW, cardH);
          }
          ctx.strokeStyle = C.line; ctx.beginPath(); ctx.moveTo(w * 0.06, h * 0.5); ctx.lineTo(w * 0.94, h * 0.5); ctx.stroke();
        }
      };
    }
  });

  LEX.register('export-mp4', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      const period = 6.8;
      const K = 5;
      return {
        resize() { this.frame(api.t, 0); },
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
          const lt = ((t % period) + period) % period;
          const seg = a => api.clamp(a), io = api.ease.inOut;
          const cy = h * 0.44;
          const sw = w * 0.2, sh = sw * 0.625, sx = w * 0.07, sy = cy - sh / 2;
          const bx0 = w * 0.34, bx1 = w * 0.72, pad = w * 0.014, g = w * 0.008;
          const cw = (bx1 - bx0 - 2 * pad - (K - 1) * g) / K, ch = cw * 0.625, bandH = ch + 2 * w * 0.018;
          const fw = w * 0.12, fh = fw * 1.25, fx = w * 0.86;
          const fade = 1 - seg((lt - 6.2) / 0.5);
          const cnt = 900 * seg((lt - 0.4) / 3.6);
          const merge = io(seg((lt - 4.3) / 0.7)), fileA = seg((lt - 4.7) / 0.5);
          const dotAt = c => ({ x: 0.16 + 0.68 * (c / 900), y: 0.5 + 0.24 * Math.sin(c / 900 * TAU) });
          ctx.globalAlpha = fade;
          // axis
          ctx.strokeStyle = C.line; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(sx + sw + w * 0.02, cy); ctx.lineTo(bx0 - w * 0.02, cy); ctx.moveTo(bx1 + w * 0.02, cy); ctx.lineTo(fx - fw / 2 - w * 0.02, cy); ctx.stroke();
          // source stage: seek(t) draws the frame; cobalt point = the sampled state
          ctx.fillStyle = C.paper; ctx.fillRect(sx, sy, sw, sh);
          ctx.strokeStyle = C.ink; ctx.strokeRect(sx + 0.5, sy + 0.5, sw - 1, sh - 1);
          const dp = dotAt(cnt);
          ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(sx + sw * dp.x, sy + sh * dp.y, Math.max(3, h * 0.02), 0, TAU); ctx.fill();
          label(ctx, api, 'seek(t)', sx + sw / 2, sy + sh + h * 0.075, { size: Math.max(10, h * 0.048), weight: 400, color: C.muted });
          // film band with sprocket dots
          ctx.globalAlpha = fade * (1 - merge * 0.8);
          ctx.strokeStyle = C.muted; ctx.strokeRect(bx0 + 0.5, cy - bandH / 2 + 0.5, bx1 - bx0 - 1, bandH - 1);
          ctx.fillStyle = C.line;
          for (let i = 0; i < K * 2 + 1; i++) { const x = bx0 + pad + (i / (K * 2)) * (bx1 - bx0 - 2 * pad); ctx.fillRect(x - 1, cy - bandH / 2 + 3, 2, 2); ctx.fillRect(x - 1, cy + bandH / 2 - 5, 2, 2); }
          ctx.globalAlpha = fade;
          // frames leave the source one by one and settle into the band
          for (let k = 0; k < K; k++) {
            const e0 = 0.4 + 0.72 * k, a = api.ease.inOut(seg((lt - e0) / 0.55));
            if (lt < e0) continue;
            const tx = bx0 + pad + k * (cw + g), ty = cy - ch / 2;
            const x = api.lerp(sx + sw * 0.5 - cw / 2, tx, a), y = api.lerp(cy - ch / 2, ty, a);
            const mx = api.lerp(x, fx - cw / 2, merge);
            ctx.globalAlpha = fade * (1 - merge);
            ctx.fillStyle = C.paper; ctx.fillRect(mx, y, cw, ch);
            ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.strokeRect(mx + 0.5, y + 0.5, cw - 1, ch - 1);
            const d = dotAt(k * 180);
            ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(mx + cw * d.x, y + ch * d.y, Math.max(1.3, ch * 0.09), 0, TAU); ctx.fill();
          }
          ctx.globalAlpha = fade;
          // file: hairline ghost until the encode lands
          const fr = Math.min(fw, fh) * 0.12;
          ctx.strokeStyle = C.line; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(fx - fw / 2 + fr, cy - fh / 2); ctx.arcTo(fx + fw / 2, cy - fh / 2, fx + fw / 2, cy + fh / 2, fr); ctx.arcTo(fx + fw / 2, cy + fh / 2, fx - fw / 2, cy + fh / 2, fr); ctx.arcTo(fx - fw / 2, cy + fh / 2, fx - fw / 2, cy - fh / 2, fr); ctx.arcTo(fx - fw / 2, cy - fh / 2, fx + fw / 2, cy - fh / 2, fr); ctx.closePath(); ctx.stroke();
          if (fileA > 0.01) {
            ctx.globalAlpha = fade * fileA;
            ctx.fillStyle = C.ink; rrect(ctx, fx - fw / 2, cy - fh / 2, fw, fh, fr); ctx.fill();
            ctx.fillStyle = C.accent; ctx.beginPath();
            ctx.moveTo(fx - fw * 0.13, cy - fh * 0.14); ctx.lineTo(fx - fw * 0.13, cy + fh * 0.14); ctx.lineTo(fx + fw * 0.17, cy); ctx.closePath(); ctx.fill();
          }
          ctx.globalAlpha = fade;
          label(ctx, api, 'crf 18', fx, cy + fh / 2 + h * 0.075, { size: Math.max(10, h * 0.048), weight: 400, color: C.muted });
          // counter: large serif numeral
          const npx = h * 0.19, ny = h * 0.9;
          ctx.font = api.font('serif', npx, 300); ctx.fillStyle = C.ink; ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic';
          ctx.fillText(String(Math.round(cnt)).padStart(3, '0'), w * 0.58, ny);
          ctx.font = api.font('serif', npx * 0.5, 300); ctx.fillStyle = C.muted; ctx.textAlign = 'left';
          ctx.fillText('/ 900', w * 0.6, ny);
          ctx.globalAlpha = 1;
        }
      };
    }
  });

  LEX.register('aspect-ratios', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      const ratios = [{ label: '16:9', ar: 16 / 9 }, { label: '9:16', ar: 9 / 16 }, { label: '1:1', ar: 1 }, { label: '2.39:1', ar: 2.39 }];
      const holdT = 1.1, transT = 0.7, stepT = holdT + transT, period = stepT * ratios.length;
      return {
        resize() { this.frame(api.t, 0); },
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.night; ctx.fillRect(0, 0, w, h);
          const cyc = t % period;
          const idx = Math.floor(cyc / stepT);
          const local = cyc - idx * stepT;
          const i0 = idx % ratios.length, i1 = (idx + 1) % ratios.length;
          const morphP = local < holdT ? 0 : api.ease.inOut((local - holdT) / transT);
          const ar = api.lerp(ratios[i0].ar, ratios[i1].ar, morphP);
          const maxW = w * 0.82, maxH = h * 0.82;
          let fw = maxW, fh = fw / ar;
          if (fh > maxH) { fh = maxH; fw = fh * ar; }
          const fx = (w - fw) / 2, fy = (h - fh) / 2;
          ctx.strokeStyle = C.line; ctx.lineWidth = 1.5; ctx.strokeRect(fx, fy, fw, fh);
          ctx.fillStyle = C.stage; ctx.fillRect(fx, fy, fw, fh);
          ctx.fillStyle = C.ink; ctx.fillRect(fx + fw * 0.08, fy + fh * 0.08, fw * 0.5, fh * 0.10);
          ctx.strokeStyle = C.muted; ctx.strokeRect(fx + fw * 0.08, fy + fh * 0.26, fw * 0.7, fh * 0.42);
          ctx.fillStyle = C.accent; ctx.fillRect(fx + fw * 0.08, fy + fh * 0.78, fw * 0.32, fh * 0.10);
          const curLabel = morphP < 0.5 ? ratios[i0].label : ratios[i1].label;
          label(ctx, api, curLabel, w * 0.90, h * 0.10, { align: 'right', size: Math.max(10, h * 0.06), color: C.nightInk });
        }
      };
    }
  });

  LEX.register('safe-zone', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      let mode = 1;
      return {
        resize() { this.frame(api.t, 0); },
        mode(m) { mode = m; },
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.stage2; ctx.fillRect(0, 0, w, h);
          const pw = h * 0.58, ph = h * 0.92;
          const px0 = (w - pw) / 2, py0 = (h - ph) / 2;
          ctx.fillStyle = C.night; rrect(ctx, px0, py0, pw, ph, ph * 0.06); ctx.fill();

          const safeTop = py0 + ph * 0.10, safeBottom = py0 + ph * 0.88, safeLeft = px0 + pw * 0.10, safeRight = px0 + pw * 0.90;
          ctx.fillStyle = C.nightInk; ctx.textAlign = 'center';
          ctx.font = api.font('sans', Math.max(10, ph * 0.045), 700);
          const textY = mode === 1 ? safeTop + ph * 0.05 : py0 + ph * 0.045;
          ctx.fillText('主标题', px0 + pw / 2, textY);
          ctx.font = api.font('sans', Math.max(9, ph * 0.032));
          const capY = mode === 1 ? safeBottom - ph * 0.03 : py0 + ph * 0.965;
          ctx.fillText('这是一句说明文字', px0 + pw / 2, capY);

          ctx.fillStyle = 'rgba(23,23,26,0.55)';
          ctx.fillRect(px0, py0, pw, ph * 0.09);
          ctx.fillRect(px0, py0 + ph * 0.90, pw, ph * 0.10);
          for (let i = 0; i < 3; i++) {
            ctx.beginPath(); ctx.arc(px0 + pw * 0.88, py0 + ph * 0.5 + (i - 1) * ph * 0.11, pw * 0.05, 0, TAU);
            ctx.fillStyle = 'rgba(23,23,26,0.55)'; ctx.fill();
          }

          if (mode === 1) {
            ctx.setLineDash([4, 4]);
            ctx.strokeStyle = C.accent2; ctx.lineWidth = 1.5;
            ctx.strokeRect(safeLeft, safeTop, safeRight - safeLeft, safeBottom - safeTop);
            ctx.setLineDash([]);
          } else {
            ctx.strokeStyle = C.bad; ctx.lineWidth = 1.5;
            ctx.strokeRect(px0 + pw * 0.06, py0 + ph * 0.015, pw * 0.88, ph * 0.06);
          }
        }
      };
    }
  });

  LEX.register('reduced-motion', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      let mode = 1;
      const period = 3.0;
      return {
        resize() { this.frame(api.t, 0); },
        mode(m) { mode = m; },
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
          const p = (t % period) / period;
          const enterP = api.ease.out(api.clamp(p / 0.5));
          if (mode === 0) {
            const parallax = (p - 0.5) * w * 0.06;
            ctx.fillStyle = C.stage2;
            for (let i = 0; i < 3; i++) ctx.fillRect(w * 0.1 + i * w * 0.28 - parallax * (i + 1) * 0.4, h * 0.66, w * 0.2, h * 0.2);
          } else {
            ctx.fillStyle = C.stage2;
            for (let i = 0; i < 3; i++) ctx.fillRect(w * 0.1 + i * w * 0.28, h * 0.66, w * 0.2, h * 0.2);
          }
          const cardW = w * 0.42, cardH = h * 0.32;
          let cy = h * 0.4, sc = 1;
          if (mode === 0) { cy = api.lerp(h * 0.7, h * 0.4, enterP); sc = api.lerp(0.75, 1, enterP); }
          ctx.globalAlpha = enterP;
          ctx.save(); ctx.translate(w * 0.5, cy); ctx.scale(sc, sc);
          ctx.fillStyle = C.ink; rrect(ctx, -cardW / 2, -cardH / 2, cardW, cardH, 10); ctx.fill();
          ctx.fillStyle = C.accent; ctx.fillRect(-cardW * 0.34, -cardH * 0.14, cardW * 0.68, cardH * 0.14);
          ctx.restore();
          ctx.globalAlpha = 1;
        }
      };
    }
  });

  // ── L5 结构 ──────────────────────────────────────────────────────────

  LEX.register('s-five-scene', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const period = 6;
      const labels = ['痛点', '方案', '三步', '证据', '落版'];
      function icon(i, cx, cy, s, active, segP) {
        const C = api.colors;
        switch (i) {
          case 0:
            ctx.beginPath(); ctx.moveTo(cx, cy - s * 0.5); ctx.lineTo(cx, cy + s * 0.08); ctx.stroke();
            ctx.beginPath(); ctx.arc(cx, cy + s * 0.32, s * 0.07, 0, TAU); ctx.fill();
            break;
          case 1:
            ctx.strokeRect(cx - s * 0.42, cy - s * 0.3, s * 0.84, s * 0.6);
            ctx.beginPath(); ctx.moveTo(cx - s * 0.42, cy); ctx.lineTo(cx + s * 0.42, cy); ctx.stroke();
            break;
          case 2:
            for (let k = -1; k <= 1; k++) {
              const kk = k + 1, app = active ? api.clamp(segP * 3 - kk) : 1;
              ctx.globalAlpha = app;
              ctx.beginPath(); ctx.arc(cx + k * s * 0.34, cy, s * 0.09, 0, TAU);
              ctx.fillStyle = active && k === 1 ? api.colors.accent2 : (active ? api.colors.accent : api.colors.ink);
              ctx.fill();
              ctx.globalAlpha = 1;
            }
            break;
          case 3:
            ctx.beginPath(); ctx.moveTo(cx - s * 0.4, cy + s * 0.3); ctx.lineTo(cx - s * 0.12, cy - s * 0.05); ctx.lineTo(cx + s * 0.1, cy + s * 0.1); ctx.lineTo(cx + s * 0.42, cy - s * 0.35); ctx.stroke();
            break;
          case 4:
            ctx.strokeRect(cx - s * 0.3, cy - s * 0.3, s * 0.6, s * 0.6);
            break;
        }
      }
      return { frame(t) { skeletonRow(ctx, api, t, period, labels, icon); }, resize() { this.frame(api.t, 0); } };
    }
  });

  LEX.register('s-launch-bars', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const period = 5; // 10 bars @ 120bpm = 0.5s/bar
      const labels = ['钩子', '变形', 'DROP', '', '', '', '', '', '', '落版'];
      function icon(i, cx, cy, s, active) {
        const C = api.colors;
        if (i === 2) {
          ctx.lineWidth = Math.max(1.4, s * 0.1);
          ctx.beginPath(); ctx.arc(cx, cy, active ? s * 0.55 : s * 0.3, 0, TAU); ctx.stroke();
        } else if (i === 9) {
          ctx.strokeRect(cx - s * 0.28, cy - s * 0.28, s * 0.56, s * 0.56);
        } else {
          ctx.beginPath(); ctx.arc(cx, cy, s * 0.16, 0, TAU); ctx.fill();
        }
      }
      return { frame(t) { skeletonRow(ctx, api, t, period, labels, icon); }, resize() { this.frame(api.t, 0); } };
    }
  });

  LEX.register('s-mechanism', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const period = 5.6;
      const labels = ['提问', '模型', '公式', '结论'];
      function icon(i, cx, cy, s, active, segP) {
        if (i === 0) {
          ctx.font = api.font('sans', s * 0.9, 700); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('?', cx, cy - s * 0.02);
        } else if (i === 1) {
          const pts = [[cx - s * 0.3, cy + s * 0.25], [cx, cy - s * 0.3], [cx + s * 0.3, cy + s * 0.2]];
          ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); ctx.lineTo(pts[1][0], pts[1][1]); ctx.lineTo(pts[2][0], pts[2][1]); ctx.stroke();
          pts.forEach(pt => { ctx.beginPath(); ctx.arc(pt[0], pt[1], s * 0.06, 0, TAU); ctx.fill(); });
        } else if (i === 2) {
          const glyphs = ['f', '=', 'm', 'a'];
          const offsets = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
          const spread = active ? api.lerp(s * 1.3, 0, api.ease.out(segP)) : 0;
          ctx.font = api.font('mono', s * 0.5, 700); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          glyphs.forEach((g, gi) => { const d = offsets[gi]; ctx.fillText(g, cx + d[0] * spread * 0.5, cy + d[1] * spread * 0.3); });
        } else {
          ctx.beginPath(); ctx.arc(cx, cy, s * 0.32, 0, TAU); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(cx - s * 0.14, cy); ctx.lineTo(cx - s * 0.02, cy + s * 0.14); ctx.lineTo(cx + s * 0.2, cy - s * 0.16); ctx.stroke();
        }
      }
      return { frame(t) { skeletonRow(ctx, api, t, period, labels, icon); }, resize() { this.frame(api.t, 0); } };
    }
  });

  LEX.register('s-scale-journey', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      const period = 6;
      const stages = ['10⁰m', '10⁻²m', '10⁻⁵m', '10⁻⁹m', '10⁻¹⁵m'];
      const N = stages.length;
      return {
        resize() { this.frame(api.t, 0); },
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.night; ctx.fillRect(0, 0, w, h);
          const per = period / N;
          const cyc = t % period;
          const idx = Math.min(N - 1, Math.floor(cyc / per));
          const local = (cyc - idx * per) / per;
          const zoom = api.ease.inOut(local);
          const cx = w * 0.5, cy = h * 0.42, maxR = Math.min(w, h) * 0.34;
          const outer = maxR * 2, innerFrac = 0.34;
          const boxSize = api.lerp(outer, outer / innerFrac, zoom);
          ctx.strokeStyle = C.line; ctx.lineWidth = 1.5;
          ctx.strokeRect(cx - boxSize / 2, cy - boxSize / 2, boxSize, boxSize);
          const markerSize = api.lerp(outer * innerFrac, outer, zoom);
          ctx.strokeStyle = C.accent; ctx.lineWidth = 2;
          ctx.strokeRect(cx - markerSize / 2, cy - markerSize / 2, markerSize, markerSize);
          ctx.fillStyle = C.nightInk;
          ctx.beginPath(); ctx.arc(cx, cy, Math.max(2, markerSize * 0.05), 0, TAU); ctx.fill();

          label(ctx, api, stages[idx], w * 0.5, h * 0.12, { size: Math.max(11, h * 0.075), color: C.nightInk, weight: 700 });

          const x0 = w * 0.1, x1 = w * 0.9, y = h * 0.88;
          ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
          for (let i = 0; i <= N; i++) { const x = api.lerp(x0, x1, i / N); ctx.beginPath(); ctx.moveTo(x, y - 4); ctx.lineTo(x, y + 4); ctx.stroke(); }
          const px = api.lerp(x0, x1, cyc / period);
          ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(px, y, Math.max(3, h * 0.02), 0, TAU); ctx.fill();
        }
      };
    }
  });

  LEX.register('s-loop-cycle', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      const period = 5;
      const labels = ['起', '承', '转', '合'];
      const N = 4;
      return {
        resize() { this.frame(api.t, 0); },
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
          const cx = w * 0.5, cy = h * 0.48, r = Math.min(w, h) * 0.32;
          const p = (t % period) / period;
          ctx.strokeStyle = C.line; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
          const activeIdx = Math.floor(p * N);
          for (let i = 0; i < N; i++) {
            const ang = (i / N) * TAU - Math.PI / 2;
            const lx = cx + Math.cos(ang) * (r + h * 0.11), ly = cy + Math.sin(ang) * (r + h * 0.11);
            const passed = i <= activeIdx;
            ctx.beginPath(); ctx.arc(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r, Math.max(3, h * 0.018), 0, TAU);
            ctx.fillStyle = passed ? C.accent : C.line; ctx.fill();
            label(ctx, api, labels[i], lx, ly, { size: Math.max(11, h * 0.07), color: passed ? C.accent : C.muted, weight: 700 });
          }
          const ang = p * TAU - Math.PI / 2;
          ctx.fillStyle = C.ink;
          ctx.beginPath(); ctx.arc(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r, Math.max(4, h * 0.026), 0, TAU); ctx.fill();
        }
      };
    }
  });

  LEX.register('s-shot-list', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      const period = 5.5;
      const shots = [
        { tc: '0:00', size: 'CU', move: '→' },
        { tc: '0:06', size: 'MS', move: '↖' },
        { tc: '0:12', size: 'WS', move: '↔' },
        { tc: '0:20', size: 'CU', move: '↗' },
      ];
      const N = shots.length;
      const insetMap = { CU: 0.32, MS: 0.18, WS: 0.04 };
      return {
        resize() { this.frame(api.t, 0); },
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
          const cardW = w * 0.19, cardH = h * 0.62, gap = (w * 0.86 - cardW * N) / (N - 1), x0 = w * 0.07, y = h * 0.5 - cardH / 2;
          const per = period / N;
          const cyc = t % period, activeIdx = Math.min(N - 1, Math.floor(cyc / per));
          for (let i = 0; i < N; i++) {
            const local = api.clamp((cyc - i * per) / (per * 0.6));
            const flip = api.ease.out(local);
            if (flip <= 0.02) continue;
            const cx = x0 + i * (cardW + gap);
            const active = i === activeIdx;
            const sx = api.lerp(0.3, 1, flip);
            ctx.save();
            ctx.translate(cx + cardW / 2, y + cardH / 2);
            ctx.scale(sx, 1);
            ctx.translate(-(cx + cardW / 2), -(y + cardH / 2));
            ctx.globalAlpha = flip;
            ctx.fillStyle = active ? C.ink : C.stage2;
            ctx.strokeStyle = C.line; ctx.lineWidth = 1;
            rrect(ctx, cx, y, cardW, cardH, 6); ctx.fill(); ctx.stroke();
            const fg = active ? C.stage : C.ink;
            ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
            ctx.font = api.font('mono', Math.max(9, cardH * 0.10), 700);
            ctx.fillStyle = fg;
            ctx.fillText('#' + (i + 1), cx + cardW / 2, y + cardH * 0.2);
            const inset = insetMap[shots[i].size] || 0.15;
            ctx.strokeStyle = active ? C.accent : C.muted; ctx.lineWidth = 1.4;
            ctx.strokeRect(cx + cardW * 0.25, y + cardH * 0.32, cardW * 0.5, cardH * 0.3);
            ctx.strokeRect(cx + cardW * 0.25 + cardW * 0.5 * inset, y + cardH * 0.32 + cardH * 0.3 * inset, cardW * 0.5 * (1 - 2 * inset), cardH * 0.3 * (1 - 2 * inset));
            ctx.font = api.font('mono', Math.max(8, cardH * 0.075));
            ctx.fillStyle = fg;
            ctx.fillText(shots[i].size, cx + cardW / 2, y + cardH * 0.72);
            ctx.fillText(shots[i].tc, cx + cardW / 2, y + cardH * 0.85);
            ctx.font = api.font('mono', Math.max(9, cardH * 0.09));
            ctx.fillText(shots[i].move, cx + cardW / 2, y + cardH * 0.97);
            ctx.globalAlpha = 1;
            ctx.restore();
          }
        }
      };
    }
  });

  LEX.register('s-landing-signature', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      const sections = [
        { h: 1.0, type: 'hero', hi: true },
        { h: 0.16, type: 'strip' },
        { h: 0.5, type: 'pillars' },
        { h: 2.6, type: 'pinned', hi: true },
        { h: 0.55, type: 'grid' },
        { h: 0.26, type: 'numbers' },
        { h: 0.3, type: 'quotes' },
        { h: 0.34, type: 'faq' },
        { h: 0.3, type: 'cta' },
      ];
      const PIN = 3;
      const period = 10;
      const seg = a => api.clamp(a), io = api.ease.inOut;
      return {
        resize() { this.frame(api.t, 0); },
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
          const lt = ((t % period) + period) % period;
          const pageW = w * 0.3, pageX = w * 0.14, pageY = h * 0.06, pageH = h * 0.88;
          const unit = pageH * 0.62;
          const offs = []; let acc = 0; sections.forEach(s => { offs.push(acc); acc += s.h * unit; });
          const contentH = acc, maxScroll = contentH - pageH;
          const pinTop = offs[PIN], pinH = sections[PIN].h * unit, pinE = pinTop + pinH - pageH;
          let sc;
          if (lt < 1.6) sc = 0;
          else if (lt < 3.0) sc = pinTop * io(seg((lt - 1.6) / 1.4));
          else if (lt < 5.4) sc = api.lerp(pinTop, pinE, seg((lt - 3.0) / 2.4));
          else if (lt < 6.0) sc = pinE;
          else if (lt < 7.4) sc = api.lerp(pinE, maxScroll, io(seg((lt - 6.0) / 1.4)));
          else if (lt < 8.0) sc = maxScroll;
          else sc = maxScroll * (1 - io(seg((lt - 8.0) / 1.6)));
          ctx.fillStyle = C.paper; ctx.fillRect(pageX, pageY, pageW, pageH);
          ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.strokeRect(pageX + 0.5, pageY + 0.5, pageW - 1, pageH - 1);
          ctx.save(); ctx.beginPath(); ctx.rect(pageX, pageY, pageW, pageH); ctx.clip();
          const ix = pageX + 6, iw = pageW - 12;
          let active = 0;
          sections.forEach((s, i) => {
            const top = pageY - sc + offs[i], sh = s.h * unit;
            if (top + sh < pageY - 4 || top > pageY + pageH + 4) return;
            const yc = pageY + pageH * 0.5; if (top <= yc && top + sh > yc) active = i;
            const x = ix, y = top + 1.5, ww = iw, hh = sh - 3, mx = x + ww / 2;
            ctx.lineWidth = 1;
            if (s.type === 'hero') {
              ctx.strokeStyle = C.accent; ctx.lineWidth = 1.4; ctx.strokeRect(x + 0.5, y + 0.5, ww - 1, hh - 1);
              const r = Math.min(ww, hh) * 0.3, cy0 = y + hh * 0.46;
              ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(mx, cy0, r, 0, TAU); ctx.stroke();
              const a = t * 1.1 - 1.2;
              ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(mx + r * Math.cos(a), cy0 + r * Math.sin(a), Math.max(3, r * 0.14), 0, TAU); ctx.fill();
              ctx.strokeStyle = C.line; ctx.beginPath(); ctx.moveTo(x + ww * 0.25, y + hh * 0.86); ctx.lineTo(x + ww * 0.75, y + hh * 0.86); ctx.stroke();
            } else if (s.type === 'pinned') {
              ctx.setLineDash([3, 3]); ctx.strokeStyle = C.muted; ctx.strokeRect(x + 0.5, y + 0.5, ww - 1, hh - 1); ctx.setLineDash([]);
              const ph = pageH * 0.62, minY = y + 4, maxY = y + hh - ph - 4;
              const py = api.clamp(pageY + pageH * 0.19, minY, maxY);
              ctx.fillStyle = C.paper; ctx.fillRect(x + 5, py, ww - 10, ph);
              ctx.strokeStyle = C.accent; ctx.lineWidth = 1.4; ctx.strokeRect(x + 5.5, py + 0.5, ww - 11, ph - 1);
              const prog = api.clamp((sc - pinTop) / (pinH - pageH));
              const r = Math.min(ww - 10, ph) * 0.3, pcx = mx, pcy = py + ph * 0.5;
              ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(pcx, pcy, r, 0, TAU); ctx.stroke();
              ctx.strokeStyle = C.accent; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(pcx, pcy, r, -Math.PI / 2, -Math.PI / 2 + prog * TAU); ctx.stroke();
              const a = -Math.PI / 2 + prog * TAU;
              ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(pcx + r * Math.cos(a), pcy + r * Math.sin(a), Math.max(3, r * 0.14), 0, TAU); ctx.fill();
            } else {
              ctx.strokeStyle = C.line; ctx.strokeRect(x + 0.5, y + 0.5, ww - 1, hh - 1);
              ctx.strokeStyle = C.muted;
              if (s.type === 'strip') { for (let k = 0; k < 4; k++) { const px = x + ww * (0.2 + k * 0.2); ctx.beginPath(); ctx.moveTo(px - 4, y + hh / 2); ctx.lineTo(px + 4, y + hh / 2); ctx.stroke(); } }
              else if (s.type === 'pillars') { for (let k = 0; k < 3; k++) { const px = x + ww * (0.22 + k * 0.28); ctx.beginPath(); ctx.moveTo(px, y + hh * 0.3); ctx.lineTo(px, y + hh * 0.7); ctx.stroke(); } }
              else if (s.type === 'grid') { ctx.strokeStyle = C.line; ctx.beginPath(); ctx.moveTo(mx, y + hh * 0.12); ctx.lineTo(mx, y + hh * 0.88); for (let k = 1; k < 3; k++) { const gy = y + hh * (0.12 + 0.76 * k / 3); ctx.moveTo(x + ww * 0.1, gy); ctx.lineTo(x + ww * 0.9, gy); } ctx.stroke(); }
              else if (s.type === 'numbers') { for (let k = 0; k < 3; k++) { const px = x + ww * (0.25 + k * 0.25); ctx.beginPath(); ctx.moveTo(px - 5, y + hh / 2); ctx.lineTo(px + 5, y + hh / 2); ctx.stroke(); } }
              else if (s.type === 'quotes') { ctx.beginPath(); ctx.moveTo(x + ww * 0.25, y + hh / 2); ctx.lineTo(x + ww * 0.75, y + hh / 2); ctx.stroke(); }
              else if (s.type === 'faq') { for (let k = 0; k < 3; k++) { const ly = y + hh * (0.25 + k * 0.25); ctx.beginPath(); ctx.moveTo(x + ww * 0.15, ly); ctx.lineTo(x + ww * 0.85, ly); ctx.stroke(); } }
              else if (s.type === 'cta') { ctx.strokeRect(mx - ww * 0.18, y + hh * 0.3, ww * 0.36, hh * 0.4); }
            }
          });
          ctx.restore();

          // right: the motion budget — 2 of 9 sections
          const rx = w * 0.56;
          const npx = h * 0.44;
          ctx.font = api.font('serif', npx, 300); ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
          const ny = h * 0.5; ctx.fillText('2', rx, ny);
          const nw = ctx.measureText('2').width;
          ctx.font = api.font('serif', npx * 0.36, 300); ctx.fillStyle = C.muted; ctx.fillText('/ 9', rx + nw + w * 0.015, ny);
          const q = Math.max(8, w * 0.026), qg = w * 0.012, qy = h * 0.62;
          sections.forEach((s, i) => {
            const qx = rx + i * (q + qg);
            if (s.hi) { ctx.fillStyle = C.accent; ctx.fillRect(qx, qy, q, q); }
            else { ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.strokeRect(qx + 0.5, qy + 0.5, q - 1, q - 1); }
            if (i === active) { ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.strokeRect(qx - 2.5, qy - 2.5, q + 5, q + 5); }
          });
          label(ctx, api, 'motion budget', rx, h * 0.8, { size: Math.max(10, h * 0.048), weight: 400, color: C.muted, align: 'left' });
        }
      };
    }
  });

  LEX.register('s-longread', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      const sections = [
        { h: 0.9, type: 'hero' },
        { h: 0.7, type: 'chapter' },
        { h: 0.8, type: 'sticky', hi: true },
        { h: 0.7, type: 'chapter' },
        { h: 0.75, type: 'figure', hi: true },
        { h: 0.6, type: 'chapter' },
        { h: 0.3, type: 'endnotes' },
      ];
      const totalH = sections.reduce((a, s) => a + s.h, 0);
      const period = 7.5;
      return {
        resize() { this.frame(api.t, 0); },
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.stage2; ctx.fillRect(0, 0, w, h);
          const pageW = w * 0.30, pageX = (w - pageW) / 2, pageY = h * 0.04, pageH = h * 0.92;
          ctx.fillStyle = C.stage; ctx.fillRect(pageX, pageY, pageW, pageH);
          ctx.strokeStyle = C.line; ctx.strokeRect(pageX, pageY, pageW, pageH);
          ctx.save(); ctx.beginPath(); ctx.rect(pageX, pageY, pageW, pageH); ctx.clip();
          const unit = pageH * 0.6;
          const contentH = totalH * unit;
          const maxScroll = Math.max(0, contentH - pageH);
          const p = (Math.sin((t / period) * TAU - Math.PI / 2) + 1) / 2;
          const scrollY = maxScroll * p;
          let cy = pageY - scrollY;
          for (const s of sections) {
            const sh = s.h * unit;
            if (cy + sh > pageY - 20 && cy < pageY + pageH + 20) {
              if (s.type === 'sticky') {
                const rel = api.clamp((pageY + pageH * 0.5 - cy) / sh);
                ctx.globalAlpha = 0.14 + 0.14 * Math.sin(rel * Math.PI);
                ctx.fillStyle = C.accent; ctx.fillRect(pageX + 4, cy, pageW - 8, sh); ctx.globalAlpha = 1;
                ctx.strokeStyle = C.accent; ctx.lineWidth = 1.6; ctx.strokeRect(pageX + 4, cy, pageW - 8, sh);
              } else if (s.type === 'figure') {
                ctx.strokeStyle = C.accent; ctx.lineWidth = 1.6; ctx.strokeRect(pageX + 4, cy, pageW - 8, sh);
                const rel = api.clamp(1 - Math.abs(pageY + pageH * 0.5 - (cy + sh * 0.5)) / (pageH * 0.6));
                const cx0 = pageX + pageW * 0.5, cy0 = cy + sh * 0.5;
                const pieces = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
                ctx.strokeStyle = C.accent;
                pieces.forEach(pt => {
                  const spread = api.lerp(pageW * 0.32, pageW * 0.09, rel);
                  ctx.strokeRect(cx0 + pt[0] * spread - pageW * 0.05, cy0 + pt[1] * spread * 0.4 - pageW * 0.05, pageW * 0.1, pageW * 0.1);
                });
              } else {
                ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.strokeRect(pageX + 4, cy, pageW - 8, sh);
                if (s.type === 'chapter') {
                  ctx.fillStyle = C.muted; ctx.fillRect(pageX + pageW * 0.12, cy + sh * 0.12, pageW * 0.1, sh * 0.16);
                  ctx.strokeStyle = C.muted;
                  for (let li = 0; li < 3; li++) { const ly = cy + sh * (0.18 + li * 0.22); ctx.beginPath(); ctx.moveTo(pageX + pageW * 0.26, ly); ctx.lineTo(pageX + pageW * 0.86, ly); ctx.stroke(); }
                }
              }
            }
            cy += sh;
          }
          ctx.restore();
        }
      };
    }
  });
})();
