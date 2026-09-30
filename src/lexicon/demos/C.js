/* Lexicon group C — L2 质感 (11) + L3 镜头/文字动效 (9). See LEXSPEC.md for the contract. */
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

  // Pure helper: a small offscreen canvas of grayscale noise, usable as a fill pattern
  // or (via toDataURL) as a CSS background-image. No shared state, safe to reuse.
  function noiseCanvas(w, h, rand, alpha) {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const cx = cv.getContext('2d');
    const id = cx.createImageData(w, h);
    for (let i = 0; i < id.data.length; i += 4) {
      const v = Math.floor(255 * rand());
      id.data[i] = v; id.data[i + 1] = v; id.data[i + 2] = v; id.data[i + 3] = Math.round(255 * alpha);
    }
    cx.putImageData(id, 0, 0);
    return cv;
  }

  // ── one-idea ───────────────────────────────────────────────────────
  LEX.register('one-idea', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      let modeStart = 0;
      return {
        mode() { modeStart = api.t; },
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
          const lt = t - modeStart;
          if (api.mode === 0) {
            const p = (lt % 2.2) / 2.2;
            ctx.textAlign = 'left'; ctx.textBaseline = 'top';
            ctx.font = api.font('sans', h * 0.13, 800); ctx.fillStyle = C.ink;
            ctx.fillText('新品发布', w * 0.06, h * 0.06 + Math.sin(lt * 6) * 2);
            const bx = w * 0.06, by = h * 0.36, bw = w * 0.24, bh = h * 0.15;
            ctx.fillStyle = C.accent2; rrect(ctx, bx, by, bw, bh, 6); ctx.fill();
            ctx.fillStyle = C.ink; ctx.font = api.font('mono', h * 0.07, 700);
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('NEW', bx + bw / 2, by + bh / 2);
            const icons = [C.accent, C.accent2, C.ink];
            icons.forEach((col, i) => {
              const cx = w * (0.42 + i * 0.15), cy = h * 0.44 + Math.sin(lt * 5 + i) * 4;
              ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx, cy, h * 0.045, 0, TAU); ctx.fill();
            });
            const bx2 = w * 0.58 + Math.sin(lt * 20) * 2, by2 = h * 0.72, bw2 = w * 0.36, bh2 = h * 0.17;
            ctx.fillStyle = C.ink; rrect(ctx, bx2, by2, bw2, bh2, 8); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.font = api.font('sans', h * 0.065, 600);
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('立即体验', bx2 + bw2 / 2, by2 + bh2 / 2);
          } else {
            const shotLen = 1.3, total = shotLen * 3;
            const lp = lt % total;
            const idx = Math.floor(lp / shotLen);
            const lp2 = (lp % shotLen) / shotLen;
            const fade = lp2 < 0.15 ? lp2 / 0.15 : (lp2 > 0.8 ? (1 - lp2) / 0.2 : 1);
            ctx.save(); ctx.globalAlpha = api.clamp(fade, 0, 1);
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            if (idx === 0) {
              ctx.font = api.font('sans', h * 0.22, 800); ctx.fillStyle = C.ink;
              ctx.fillText('新品发布', w / 2, h / 2);
            } else if (idx === 1) {
              ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(w / 2, h / 2, h * 0.09, 0, TAU); ctx.fill();
            } else {
              const bw2 = w * 0.36, bh2 = h * 0.17, bx2 = w / 2 - bw2 / 2, by2 = h / 2 - bh2 / 2;
              ctx.fillStyle = C.ink; rrect(ctx, bx2, by2, bw2, bh2, 8); ctx.fill();
              ctx.fillStyle = '#fff'; ctx.font = api.font('sans', h * 0.075, 600);
              ctx.fillText('立即体验', bx2 + bw2 / 2, by2 + bh2 / 2);
            }
            ctx.restore();
          }
        },
      };
    },
  });

  // ── restraint ──────────────────────────────────────────────────────
  LEX.register('restraint', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      let modeStart = 0;
      return {
        mode() { modeStart = api.t; },
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
          const period = api.mode === 0 ? 2.2 : 3.6;
          const lt = (t - modeStart) % period;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          if (api.mode === 0) {
            const p = api.clamp(lt / 0.5);
            const s = api.ease.bouncy(p);
            const rot = (1 - p) * 0.5;
            ctx.save();
            ctx.translate(w / 2, h / 2); ctx.rotate(rot); ctx.scale(0.5 + 0.7 * s, 0.5 + 0.7 * s);
            ctx.font = api.font('sans', h * 0.17, 800); ctx.fillStyle = C.ink;
            ctx.fillText('新品发布', 0, 0);
            ctx.restore();
            if (lt < 0.12) { ctx.fillStyle = `rgba(255,255,255,${(1 - lt / 0.12) * 0.7})`; ctx.fillRect(0, 0, w, h); }
          } else {
            const p = api.clamp(lt / 1.2);
            const e = api.ease.out(p);
            const y = h * 0.05 * (1 - e);
            ctx.save(); ctx.globalAlpha = e;
            ctx.font = api.font('serif', h * 0.13, 500); ctx.fillStyle = C.ink;
            ctx.fillText('新品发布', w / 2, h * 0.5 + y);
            ctx.restore();
          }
        },
      };
    },
  });

  // ── one-accent ─────────────────────────────────────────────────────
  LEX.register('one-accent', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      const busy = ['#3B82F6', '#F43F5E', '#22C55E', '#F59E0B', '#A855F7'];
      return {
        mode() {},
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
          const pad = w * 0.08;
          const cardX = pad, cardY = h * 0.1, cardW = w - 2 * pad, cardH = h * 0.8;
          ctx.fillStyle = '#fff'; rrect(ctx, cardX, cardY, cardW, cardH, 10); ctx.fill();
          ctx.strokeStyle = C.line; ctx.lineWidth = 1; rrect(ctx, cardX, cardY, cardW, cardH, 10); ctx.stroke();
          const accent = Math.floor(t / 2.4) % 2 === 0 ? C.accent : C.accent2;
          for (let i = 0; i < 3; i++) {
            const ry = cardY + cardH * (0.2 + i * 0.24);
            ctx.fillStyle = api.mode === 0 ? busy[(i + 2) % busy.length] : C.line;
            ctx.fillRect(cardX + cardW * 0.06, ry, cardW * 0.42, h * 0.045);
            ctx.fillStyle = api.mode === 0 ? busy[i % busy.length] : (i === 1 ? accent : C.muted);
            ctx.font = api.font('mono', h * 0.065, 700); ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
            ctx.fillText((12 + i * 7) + '%', cardX + cardW * 0.92, ry + h * 0.02);
          }
          const bw = cardW * 0.5, bh = h * 0.12, bx = cardX + (cardW - bw) / 2, by = cardY + cardH * 0.8;
          ctx.fillStyle = api.mode === 0 ? busy[3] : accent;
          rrect(ctx, bx, by, bw, bh, 8); ctx.fill();
          ctx.fillStyle = '#fff'; ctx.font = api.font('sans', h * 0.06, 700);
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('确认', bx + bw / 2, by + bh / 2);
        },
      };
    },
  });

  // ── type-roles ─────────────────────────────────────────────────────
  LEX.register('type-roles', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      let modeStart = 0;
      return {
        mode() { modeStart = api.t; },
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
          const lt = (t - modeStart) % 3.2;
          const x = w * 0.08;
          const reveal = (delay, dur) => api.ease.out(api.clamp((lt - delay) / (dur || 0.5)));
          ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
          const r1 = reveal(0), r2 = reveal(0.18), r3 = reveal(0.36);
          ctx.save(); ctx.globalAlpha = r1; ctx.fillStyle = C.ink;
          ctx.font = api.mode === 0 ? api.font('sans', h * 0.13, 600) : api.font('serif', h * 0.17, 600);
          ctx.fillText('设计的秩序感', x, h * 0.36 - (1 - r1) * h * 0.03);
          ctx.restore();
          ctx.save(); ctx.globalAlpha = r2; ctx.fillStyle = C.muted;
          ctx.font = api.font('sans', h * 0.07, 400);
          ctx.fillText('每一处细节都值得被认真对待', x, h * 0.55 - (1 - r2) * h * 0.03);
          ctx.restore();
          ctx.save(); ctx.globalAlpha = r3;
          ctx.fillStyle = api.mode === 0 ? C.muted : C.accent;
          ctx.font = api.mode === 0 ? api.font('sans', h * 0.06, 400) : api.font('mono', h * 0.06, 500);
          ctx.fillText('00:12:04 · v2.3.1', x, h * 0.74 - (1 - r3) * h * 0.03);
          ctx.restore();
        },
      };
    },
  });

  // ── type-extremes ──────────────────────────────────────────────────
  LEX.register('type-extremes', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      let modeStart = 0;
      return {
        mode() { modeStart = api.t; },
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
          const lt = (t - modeStart) % 3.4;
          const e = api.ease.out(api.clamp(lt / 1.4));
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          if (api.mode === 0) {
            ctx.save(); ctx.globalAlpha = e;
            ctx.font = api.font('sans', h * 0.15, 600); ctx.fillStyle = C.ink;
            ctx.fillText('产品发布', w / 2, h * 0.42);
            ctx.font = api.font('sans', h * 0.08, 400); ctx.fillStyle = C.muted;
            ctx.fillText('用心打磨每一次体验', w / 2, h * 0.66);
            ctx.restore();
          } else {
            ctx.save(); ctx.globalAlpha = e; const s = 0.85 + 0.15 * e;
            ctx.translate(w / 2, h * 0.4); ctx.scale(s, s);
            ctx.font = api.font('sans', h * 0.44, 900); ctx.fillStyle = C.ink;
            ctx.fillText('势', 0, 0);
            ctx.restore();
            ctx.save(); ctx.globalAlpha = e;
            ctx.font = api.font('sans', h * 0.055, 200); ctx.fillStyle = C.muted;
            ctx.fillText('细节决定质感', w / 2, h * 0.78);
            ctx.restore();
          }
        },
      };
    },
  });

  // ── frosted-glass ──────────────────────────────────────────────────
  LEX.register('frosted-glass', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      const grainURL = noiseCanvas(64, 64, api.rng(7), 0.45).toDataURL();
      const panel = api.div('position:absolute;left:14%;top:22%;width:58%;height:56%;border-radius:14px;');
      function applyMode(m) {
        if (m === 0) {
          panel.style.background = 'rgba(255,255,255,0.55)';
          panel.style.backdropFilter = 'none'; panel.style.webkitBackdropFilter = 'none';
          panel.style.border = '1px solid rgba(255,255,255,0.4)';
          panel.style.backgroundImage = 'none';
          panel.style.boxShadow = 'none';
        } else {
          panel.style.background = 'rgba(255,255,255,0.14)';
          panel.style.backdropFilter = 'blur(14px) saturate(170%)';
          panel.style.webkitBackdropFilter = 'blur(14px) saturate(170%)';
          panel.style.border = '1px solid rgba(255,255,255,0.35)';
          panel.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.85), inset 0 0 24px rgba(255,255,255,0.05)';
          panel.style.backgroundImage = `url(${grainURL})`;
          panel.style.backgroundBlendMode = 'overlay';
          panel.style.backgroundSize = '64px 64px';
        }
      }
      return {
        mode(m) { applyMode(m); },
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          const hue = (t * 26) % 360;
          const g = ctx.createLinearGradient(0, 0, w, h);
          g.addColorStop(0, `hsl(${hue},70%,60%)`);
          g.addColorStop(0.5, `hsl(${(hue + 80) % 360},75%,55%)`);
          g.addColorStop(1, `hsl(${(hue + 160) % 360},70%,55%)`);
          ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
          for (let i = 0; i < 3; i++) {
            const cx = w * (0.2 + 0.3 * i) + Math.sin(t * 0.6 + i) * w * 0.1;
            const cy = h * (0.3 + 0.2 * i) + Math.cos(t * 0.5 + i) * h * 0.14;
            ctx.fillStyle = `hsla(${(hue + i * 90) % 360},80%,65%,0.5)`;
            ctx.beginPath(); ctx.arc(cx, cy, h * 0.3, 0, TAU); ctx.fill();
          }
        },
      };
    },
  });

  // ── print-texture ──────────────────────────────────────────────────
  LEX.register('print-texture', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      const grain = noiseCanvas(64, 64, api.rng(11), 0.06);
      return {
        mode() {},
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          const B = api.mode === 1;
          ctx.fillStyle = B ? '#EDE6D2' : '#FFFFFF';
          ctx.fillRect(0, 0, w, h);
          const ink = B ? '#2B2118' : C.ink;
          const spot = B ? '#B1432E' : C.accent;
          const cx = w * 0.38, cy = h * 0.38, r = h * 0.14;
          const bob = Math.sin(t * 1.3) * h * 0.01;
          const tri = [[w * 0.18, h * 0.78], [w * 0.5, h * 0.34], [w * 0.82, h * 0.78]];
          if (B) {
            ctx.save();
            ctx.beginPath(); ctx.moveTo(tri[0][0], tri[0][1]); ctx.lineTo(tri[1][0], tri[1][1]); ctx.lineTo(tri[2][0], tri[2][1]); ctx.closePath(); ctx.clip();
            const step = Math.max(6, h * 0.05);
            for (let y = h * 0.34; y < h * 0.8; y += step) {
              for (let x = w * 0.15; x < w * 0.85; x += step) {
                const shade = api.clamp((y - h * 0.34) / (h * 0.46));
                ctx.fillStyle = `rgba(43,33,24,${(0.08 + shade * 0.32).toFixed(3)})`;
                const off = Math.round(y / step) % 2 ? step / 2 : 0;
                ctx.beginPath(); ctx.arc(x + off, y, step * 0.15 * (0.5 + shade), 0, TAU); ctx.fill();
              }
            }
            ctx.restore();
          } else {
            ctx.fillStyle = C.stage2;
            ctx.beginPath(); ctx.moveTo(tri[0][0], tri[0][1]); ctx.lineTo(tri[1][0], tri[1][1]); ctx.lineTo(tri[2][0], tri[2][1]); ctx.closePath(); ctx.fill();
          }
          ctx.strokeStyle = ink; ctx.lineWidth = Math.max(1.5, h * 0.012);
          ctx.beginPath(); ctx.moveTo(tri[0][0], tri[0][1]); ctx.lineTo(tri[1][0], tri[1][1]); ctx.lineTo(tri[2][0], tri[2][1]); ctx.closePath(); ctx.stroke();
          ctx.beginPath(); ctx.arc(cx, cy + bob, r, 0, TAU); ctx.stroke();
          ctx.fillStyle = spot; ctx.beginPath(); ctx.arc(cx, cy + bob, r * 0.42, 0, TAU); ctx.fill();
          ctx.font = api.font('mono', h * 0.05, 500); ctx.fillStyle = ink; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
          ctx.fillText(B ? 'PRINT · 002' : 'VECTOR', w * 0.08, h * 0.94);
          if (B) {
            ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.7;
            ctx.fillStyle = ctx.createPattern(grain, 'repeat'); ctx.fillRect(0, 0, w, h);
            ctx.restore();
          }
        },
      };
    },
  });

  // ── layered-atmosphere ─────────────────────────────────────────────
  LEX.register('layered-atmosphere', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      const grain = noiseCanvas(80, 80, api.rng(23), 0.05);
      return {
        mode() {},
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          if (api.mode === 0) {
            ctx.fillStyle = C.stage2; ctx.fillRect(0, 0, w, h);
          } else {
            const g = ctx.createRadialGradient(
              w * (0.3 + 0.1 * Math.sin(t * 0.3)), h * (0.35 + 0.08 * Math.cos(t * 0.25)), 0,
              w * 0.5, h * 0.5, w * 0.85);
            g.addColorStop(0, '#3a3f63'); g.addColorStop(0.55, '#232636'); g.addColorStop(1, C.night);
            ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
            const g2 = ctx.createRadialGradient(
              w * (0.7 + 0.08 * Math.cos(t * 0.22)), h * (0.7 + 0.1 * Math.sin(t * 0.28)), 0,
              w * 0.7, h * 0.7, w * 0.6);
            g2.addColorStop(0, 'rgba(46,75,255,0.28)'); g2.addColorStop(1, 'rgba(46,75,255,0)');
            ctx.fillStyle = g2; ctx.fillRect(0, 0, w, h);
            ctx.save(); ctx.globalAlpha = 0.5; ctx.globalCompositeOperation = 'overlay';
            ctx.fillStyle = ctx.createPattern(grain, 'repeat'); ctx.fillRect(0, 0, w, h);
            ctx.restore();
            const vg = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.78);
            vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.45)');
            ctx.fillStyle = vg; ctx.fillRect(0, 0, w, h);
          }
          ctx.font = api.font('sans', h * 0.13, 700); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillStyle = api.mode === 0 ? C.ink : C.nightInk;
          ctx.fillText('沉浸式体验', w / 2, h / 2);
        },
      };
    },
  });

  // ── metal-sheen ────────────────────────────────────────────────────
  LEX.register('metal-sheen', {
    mount(el, api) {
      const C = api.colors;
      el.style.background = C.stage;
      const label = api.div(
        'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);white-space:nowrap;' +
        'font-weight:900;letter-spacing:0.02em;' +
        'background-image:linear-gradient(100deg,#8a8f9a 0%,#e7eaef 18%,#ffffff 30%,#e7eaef 42%,#8a8f9a 58%,#aeb3bc 100%);' +
        'background-size:220% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;',
        '尊享体验'
      );
      function size() { label.style.fontFamily = api.fonts.sans; label.style.fontSize = Math.round(api.h * 0.2) + 'px'; }
      size();
      return {
        resize() { size(); },
        frame(t) {
          const period = 4.2;
          let pos;
          if (api.pointer.inside) pos = api.pointer.x * 150;
          else { const p = (t % period) / period; pos = p * 180 - 40; }
          label.style.backgroundPosition = pos + '% 0%';
        },
      };
    },
  });

  // ── studio-light-3d ────────────────────────────────────────────────
  LEX.register('studio-light-3d', {
    mount(el, api) {
      const C = api.colors;
      if (window.THREE) return mountThree(el, api, C);
      return mount2D(el, api, C);

      function mount2D(el, api, C) {
        const { ctx } = api.canvas();
        return {
          mode() {},
          frame(t) {
            const w = api.w, h = api.h; if (!w) return;
            ctx.fillStyle = api.mode === 1 ? C.night : C.stage;
            ctx.fillRect(0, 0, w, h);
            const cx = w / 2, cy = h * 0.54, R = h * 0.26;
            const rot = t * 0.6;
            const squash = 0.35 + 0.15 * Math.abs(Math.sin(rot));
            ctx.save(); ctx.globalAlpha = api.mode === 1 ? 0.35 : 0.15;
            ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(cx, cy + R * 1.05, R * 0.9, R * 0.22, 0, 0, TAU); ctx.fill();
            ctx.restore();
            ctx.save(); ctx.translate(cx, cy); ctx.scale(1, squash);
            if (api.mode === 0) {
              ctx.fillStyle = '#9a9a9c';
              ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill();
              ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 2; ctx.stroke();
            } else {
              const grad = ctx.createRadialGradient(-R * 0.35, -R * 0.5, R * 0.05, 0, 0, R * 1.05);
              grad.addColorStop(0, '#f4f2ee'); grad.addColorStop(0.25, '#c9cfe0');
              grad.addColorStop(0.55, '#4b5162'); grad.addColorStop(1, '#15161c');
              ctx.fillStyle = grad;
              ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill();
              ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = Math.max(1.5, R * 0.04);
              ctx.beginPath(); ctx.arc(0, 0, R - 1, -2.4, -0.5); ctx.stroke();
            }
            ctx.restore();
          },
        };
      }

      function mountThree(el, api, C) {
        const T = window.THREE;
        const { cv } = api.canvas({ context: 'webgl', contextAttrs: { alpha: true, antialias: true } });
        const gl = cv.getContext('webgl');
        const renderer = new T.WebGLRenderer({ canvas: cv, context: gl, alpha: true, antialias: true });
        renderer.setPixelRatio(api.dpr);
        const scene = new T.Scene();
        const camera = new T.PerspectiveCamera(35, 1, 0.1, 100); camera.position.set(0, 0, 4.2);
        const geo = new T.TorusKnotGeometry(0.75, 0.24, 120, 16);
        let mat = new T.MeshBasicMaterial({ color: 0x9a9a9c });
        const mesh = new T.Mesh(geo, mat); scene.add(mesh);
        const amb = new T.AmbientLight(0xffffff, 1.1); scene.add(amb);
        const key = new T.DirectionalLight(0xffffff, 0); key.position.set(2, 3, 4); scene.add(key);
        const fill = new T.DirectionalLight(0x88aaff, 0); fill.position.set(-3, -1, 2); scene.add(fill);
        const rim = new T.DirectionalLight(0xffffff, 0); rim.position.set(-2, 2, -3); scene.add(rim);
        function applyMode(m) {
          mesh.material = m === 0
            ? new T.MeshBasicMaterial({ color: 0x9a9a9c })
            : new T.MeshStandardMaterial({ color: 0xb7bcc4, metalness: 0.85, roughness: 0.28 });
          amb.intensity = m === 0 ? 1.1 : 0.25;
          key.intensity = m === 0 ? 0 : 1.6; fill.intensity = m === 0 ? 0 : 0.5; rim.intensity = m === 0 ? 0 : 1.0;
          renderer.toneMapping = m === 0 ? T.NoToneMapping : T.ACESFilmicToneMapping;
        }
        function fit() { const w = api.w, h = api.h; if (!w) return; camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h, false); }
        fit();
        return {
          mode(m) { applyMode(m); },
          resize() { fit(); },
          frame(t) {
            fit();
            mesh.rotation.y = t * 0.5; mesh.rotation.x = Math.sin(t * 0.3) * 0.2;
            renderer.render(scene, camera);
          },
          destroy() { geo.dispose(); mesh.material.dispose(); renderer.dispose(); },
        };
      }
    },
  });

  // ── anti-slop ──────────────────────────────────────────────────────
  LEX.register('anti-slop', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      let modeStart = 0;
      const parts = Array.from({ length: 22 }, (_, i) => ({ a: (i / 22) * TAU, r: 0.4 + (i % 5) * 0.11 }));
      return {
        mode() { modeStart = api.t; },
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          const lt = (t - modeStart) % 3.2;
          if (api.mode === 0) {
            const g = ctx.createLinearGradient(0, 0, w, h);
            g.addColorStop(0, '#7C3AED'); g.addColorStop(1, '#3B82F6');
            ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
            const p = api.clamp(lt / 0.6);
            const s = api.ease.bouncy(p);
            const shake = lt < 0.9 ? Math.sin(lt * 60) * 3 * (1 - lt / 0.9) : 0;
            ctx.save();
            ctx.translate(w / 2 + shake, h / 2);
            ctx.scale(0.4 + 0.8 * s, 0.4 + 0.8 * s);
            ctx.shadowColor = 'rgba(255,255,255,0.9)'; ctx.shadowBlur = h * 0.14;
            ctx.font = api.font('sans', h * 0.2, 800); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('发布', 0, 0);
            ctx.restore();
            if (lt < 0.9) {
              const burstP = lt / 0.9;
              ctx.save();
              parts.forEach(pt => {
                const rr = burstP * h * pt.r * 0.9;
                const x = w / 2 + Math.cos(pt.a) * rr, y = h / 2 + Math.sin(pt.a) * rr;
                ctx.globalAlpha = 1 - burstP;
                ctx.fillStyle = '#fff';
                ctx.beginPath(); ctx.arc(x, y, Math.max(1.5, h * 0.012), 0, TAU); ctx.fill();
              });
              ctx.restore();
            }
          } else {
            ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
            const p = api.clamp(lt / 0.9);
            const e = api.ease.out(p);
            ctx.save();
            const revealW = w * 0.7 * e;
            ctx.beginPath(); ctx.rect(w / 2 - revealW / 2, 0, revealW, h); ctx.clip();
            ctx.font = api.font('sans', h * 0.2, 800); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('发布', w / 2, h / 2);
            ctx.restore();
            ctx.fillStyle = C.accent;
            ctx.fillRect(w / 2 - w * 0.12 * e, h * 0.68, w * 0.24 * e, Math.max(2, h * 0.012));
          }
        },
      };
    },
  });

  // ── push-in-journey ────────────────────────────────────────────────
  LEX.register('push-in-journey', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      // Infinite push-in: every frame holds the next one at 1/Z scale and a different hairline pattern.
      // The parent dissolves as the child reaches matched framing, so it reads as one continuous shot.
      const Z = 6, ZT = 1.25, HOLD = 0.65, STEP = ZT + HOLD, STEPS = 4, TOTAL = STEP * STEPS;
      function pattern(m, x, y, w, h) {
        ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.beginPath();
        const cx = x + w / 2, cy = y + h / 2;
        if (m === 0) {
          for (let i = 1; i < 6; i++) { const px = Math.round(x + w * i / 6) + 0.5; ctx.moveTo(px, y); ctx.lineTo(px, y + h); }
          for (let j = 1; j < 4; j++) { const py = Math.round(y + h * j / 4) + 0.5; ctx.moveTo(x, py); ctx.lineTo(x + w, py); }
        } else if (m === 1) {
          ctx.moveTo(cx + h * 0.42, cy); ctx.arc(cx, cy, h * 0.42, 0, TAU);
          ctx.moveTo(cx + h * 0.2, cy); ctx.arc(cx, cy, h * 0.2, 0, TAU);
          ctx.moveTo(x, cy); ctx.lineTo(x + w, cy); ctx.moveTo(cx, y); ctx.lineTo(cx, y + h);
        } else if (m === 2) {
          const tl = Math.min(w, h) * 0.05;
          for (let i = 1; i < 24; i++) { const px = x + w * i / 24; ctx.moveTo(px, y); ctx.lineTo(px, y + tl); ctx.moveTo(px, y + h); ctx.lineTo(px, y + h - tl); }
          for (let j = 1; j < 15; j++) { const py = y + h * j / 15; ctx.moveTo(x, py); ctx.lineTo(x + tl, py); ctx.moveTo(x + w, py); ctx.lineTo(x + w - tl, py); }
        } else {
          ctx.moveTo(x, y); ctx.lineTo(x + w, y + h); ctx.moveTo(x + w, y); ctx.lineTo(x, y + h);
          ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w, y + h / 2); ctx.lineTo(x + w / 2, y + h); ctx.lineTo(x, y + h / 2); ctx.closePath();
        }
        ctx.stroke();
      }
      return {
        resize() { this.frame(api.t, 0); },
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
          const lt = ((t % TOTAL) + TOTAL) % TOTAL;
          const i = Math.min(STEPS - 1, Math.floor(lt / STEP)), p = lt - i * STEP;
          const tau = i + api.ease.inOut(p / ZT);
          const bw = w * 0.62, bh = h * 0.62, cx = w / 2, cy = h * 0.46;
          const k0 = Math.floor(tau) - 1;
          for (let k = k0; k <= k0 + 6; k++) {
            const ratio = Math.pow(Z, tau - k), fw = bw * ratio, fh = bh * ratio;
            if (fw < 5 || fw > w * 8) continue;
            const a = (1 - api.clamp((ratio - 1.12) / 0.55)) * api.clamp((fw - 5) / 6);
            if (a <= 0.01) continue;
            const x = Math.round(cx - fw / 2), y = Math.round(cy - fh / 2);
            ctx.globalAlpha = a;
            ctx.fillStyle = C.paper; ctx.fillRect(x, y, fw, fh);
            pattern(((k % 4) + 4) % 4, x, y, fw, fh);
            ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, fw - 1, fh - 1);
          }
          ctx.globalAlpha = 1;
          // crop marks: the matched framing every level snaps back to
          const bx = cx - bw / 2, by = cy - bh / 2, L = w * 0.022, o = 6;
          ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.beginPath();
          [[bx - o, by - o, 1, 1], [bx + bw + o, by - o, -1, 1], [bx - o, by + bh + o, 1, -1], [bx + bw + o, by + bh + o, -1, -1]].forEach(([px, py, sx, sy]) => { ctx.moveTo(px + sx * L, py); ctx.lineTo(px, py); ctx.lineTo(px, py + sy * L); });
          ctx.stroke();
          // the point we are diving into
          ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(cx, cy, Math.max(3, h * 0.014), 0, TAU); ctx.fill();
          // magnification readout
          const cum = Math.pow(Z, tau), la = Math.min(1, lt / 0.3, (TOTAL - lt) / 0.3);
          const px = h * 0.12;
          ctx.globalAlpha = Math.max(0, la);
          ctx.font = api.font('serif', px, 300); ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
          ctx.fillStyle = C.muted; ctx.fillText('×', w * 0.05, h * 0.95);
          const xw = ctx.measureText('×').width;
          ctx.fillStyle = C.ink; ctx.fillText(cum < 1000 ? String(Math.round(cum)) : (cum / 1000).toFixed(1) + 'k', w * 0.05 + xw + 3, h * 0.95);
          ctx.globalAlpha = 1;
        },
      };
    },
  });

  // ── zoom-to-fill ───────────────────────────────────────────────────
  LEX.register('zoom-to-fill', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      const states = [
        { size: 46, kind: 'dot' },
        { size: 100, kind: 'bar' },
        { size: 170, kind: 'card' },
      ];
      const DUR = 1.3;
      function draw(st) {
        if (st.kind === 'dot') { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(0, 0, st.size / 2, 0, TAU); ctx.fill(); }
        else if (st.kind === 'bar') { ctx.fillStyle = C.accent; ctx.fillRect(-st.size / 2, -st.size * 0.18, st.size, st.size * 0.36); }
        else {
          ctx.fillStyle = '#fff'; ctx.strokeStyle = C.line; ctx.lineWidth = 2;
          rrect(ctx, -st.size / 2, -st.size * 0.32, st.size, st.size * 0.64, st.size * 0.08); ctx.fill(); ctx.stroke();
          ctx.fillStyle = C.ink; ctx.fillRect(-st.size * 0.38, -st.size * 0.16, st.size * 0.5, st.size * 0.09);
          ctx.fillStyle = C.accent; ctx.fillRect(-st.size * 0.38, -st.size * 0.02, st.size * 0.3, st.size * 0.09);
        }
      }
      return {
        mode() {},
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
          const total = states.length * DUR;
          const lt = t % total;
          const i = Math.min(states.length - 1, Math.floor(lt / DUR));
          const prev = states[(i - 1 + states.length) % states.length];
          const st = states[i];
          const p = (lt - i * DUR) / DUR;
          const camA = h / 1000;
          const camFrom = api.mode === 0 ? camA : (h * 0.6) / prev.size;
          const camTo = api.mode === 0 ? camA : (h * 0.6) / st.size;
          const zt = api.ease.inOut(api.clamp(p / 0.4));
          const cam = api.lerp(camFrom, camTo, zt);
          ctx.save();
          ctx.translate(w / 2, h * 0.52);
          ctx.scale(cam, cam);
          draw(st);
          ctx.restore();
          ctx.font = api.font('mono', h * 0.05, 600); ctx.fillStyle = C.muted;
          ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
          ctx.fillText(api.mode === 0 ? '固定镜头' : '推到填满', w * 0.06, h * 0.94);
        },
      };
    },
  });

  // ── parallax-depth ─────────────────────────────────────────────────
  LEX.register('parallax-depth', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      const layers = [
        { depth: 0.008, color: '#b7c2d6', y: 0.6 },
        { depth: 0.016, color: '#93a3c0', y: 0.7 },
        { depth: 0.028, color: '#5c6d92', y: 0.8 },
      ];
      return {
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = '#dfe6f2'; ctx.fillRect(0, 0, w, h);
          let px, py;
          if (api.pointer.inside) { px = api.pointer.x; py = api.pointer.y; }
          else { const g = api.ghost(t, 3); px = g.x; py = g.y; }
          const dx = (px - 0.5) * 2, dy = (py - 0.5) * 2;
          layers.forEach(L => {
            const ox = -dx * w * L.depth, oy = -dy * h * L.depth * 0.6;
            ctx.save(); ctx.translate(ox, oy);
            ctx.fillStyle = L.color;
            ctx.beginPath();
            ctx.moveTo(-w * 0.1, h * (L.y + 0.25));
            ctx.quadraticCurveTo(w * 0.3, h * (L.y - 0.12), w * 0.55, h * L.y);
            ctx.quadraticCurveTo(w * 0.8, h * (L.y + 0.1), w * 1.1, h * (L.y - 0.05));
            ctx.lineTo(w * 1.1, h * 1.05); ctx.lineTo(-w * 0.1, h * 1.05); ctx.closePath(); ctx.fill();
            ctx.restore();
          });
          const ox = -dx * w * 0.05, oy = -dy * h * 0.03;
          ctx.save(); ctx.translate(ox, oy);
          ctx.font = api.font('sans', h * 0.16, 800); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('纵深感', w / 2, h * 0.42);
          ctx.restore();
        },
      };
    },
  });

  // ── follow-cam ─────────────────────────────────────────────────────
  LEX.register('follow-cam', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      const pts = [[0.1, 0.75], [0.28, 0.55], [0.42, 0.68], [0.6, 0.32], [0.78, 0.45], [0.92, 0.2]];
      function pointAt(u) {
        const n = pts.length - 1; const seg = Math.min(n - 1, Math.floor(u * n)); const lu = u * n - seg;
        const a = pts[seg], b = pts[seg + 1];
        return [api.lerp(a[0], b[0], lu), api.lerp(a[1], b[1], lu)];
      }
      return {
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.stage2; ctx.fillRect(0, 0, w, h);
          ctx.strokeStyle = C.line; ctx.lineWidth = 1;
          for (let i = 1; i < 8; i++) { ctx.beginPath(); ctx.moveTo(w * i / 8, 0); ctx.lineTo(w * i / 8, h); ctx.stroke(); }
          for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(0, h * i / 6); ctx.lineTo(w, h * i / 6); ctx.stroke(); }
          const period = 4.2;
          const u = api.ease.inOut((t % period) / period);
          const [hx, hy] = pointAt(u);
          let nearest = 1;
          pts.forEach(p => { const d = Math.hypot(p[0] - hx, p[1] - hy); nearest = Math.min(nearest, d); });
          const zoom = 1 + api.clamp(1 - nearest * 7, 0, 1) * 0.5;
          ctx.save();
          ctx.translate(w / 2, h / 2); ctx.scale(zoom, zoom); ctx.translate(-w * hx, -h * hy);
          ctx.strokeStyle = C.line; ctx.lineWidth = Math.max(2, h * 0.012);
          ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(w * p[0], h * p[1]) : ctx.moveTo(w * p[0], h * p[1])); ctx.stroke();
          ctx.strokeStyle = C.accent; ctx.lineWidth = Math.max(2.5, h * 0.016); ctx.lineCap = 'round';
          ctx.beginPath();
          const steps = 40;
          for (let i = 0; i <= steps; i++) { const uu = u * i / steps; const [x, y] = pointAt(uu); if (i === 0) ctx.moveTo(w * x, h * y); else ctx.lineTo(w * x, h * y); }
          ctx.stroke();
          ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(w * hx, h * hy, h * 0.02, 0, TAU); ctx.fill();
          ctx.restore();
        },
      };
    },
  });

  // ── rack-focus ─────────────────────────────────────────────────────
  LEX.register('rack-focus', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      const rng = api.rng(19);
      const drops = Array.from({ length: 24 }, () => ({ x: rng(), y: rng(), len: 0.03 + rng() * 0.05 }));
      const bokeh = Array.from({ length: 9 }, () => ({ x: rng(), y: rng() * 0.6, r: 0.02 + rng() * 0.05, hue: rng() * 40 + 30 }));
      return {
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.night; ctx.fillRect(0, 0, w, h);
          const period = 5.2;
          const p = (t % period) / period;
          const focus = (Math.sin(p * TAU) + 1) / 2;
          ctx.filter = 'blur(8px)';
          bokeh.forEach(b => {
            ctx.fillStyle = `hsla(${b.hue},70%,60%,0.55)`;
            ctx.beginPath(); ctx.arc(w * b.x, h * b.y, h * b.r, 0, TAU); ctx.fill();
          });
          const subjBlur = api.lerp(9, 1, focus);
          ctx.filter = `blur(${subjBlur}px)`;
          ctx.fillStyle = '#05070a';
          ctx.beginPath(); ctx.ellipse(w * 0.5, h * 0.38, w * 0.09, h * 0.13, 0, 0, TAU); ctx.fill();
          ctx.beginPath();
          ctx.moveTo(w * 0.32, h * 0.9); ctx.quadraticCurveTo(w * 0.5, h * 0.42, w * 0.68, h * 0.9); ctx.closePath(); ctx.fill();
          const fgBlur = api.lerp(1, 9, focus);
          ctx.filter = `blur(${fgBlur}px)`;
          ctx.strokeStyle = 'rgba(220,230,255,0.5)'; ctx.lineWidth = Math.max(1, h * 0.006);
          drops.forEach(d => {
            const yy = (d.y + t * 0.15) % 1;
            ctx.beginPath(); ctx.moveTo(w * d.x, h * yy); ctx.lineTo(w * d.x - w * 0.01, h * (yy + d.len)); ctx.stroke();
          });
          ctx.filter = 'none';
          ctx.font = api.font('mono', h * 0.05, 500); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
          ctx.fillText(focus < 0.5 ? '对焦：前景' : '对焦：主体', w * 0.05, h * 0.95);
        },
      };
    },
  });

  // ── orbit-drift ────────────────────────────────────────────────────
  LEX.register('orbit-drift', {
    mount(el, api) {
      const C = api.colors;
      // Wireframe study: three boxes, a ground grid, the orbit ring, one cobalt point.
      // kind 0 = grid, 1 = object edges, 2 = orbit ring. Shared by the three.js path and the 2D fallback.
      const segs = [];
      const boxes = [[0, 0.1, 0, 1.0, 2.2, 1.0], [1.9, -0.5, 0.7, 1.0, 1.0, 1.0], [-1.8, -0.85, -1.1, 1.7, 0.3, 1.7]];
      for (let i = -3; i <= 3; i++) { segs.push([i, -1, -3, i, -1, 3, 0]); segs.push([-3, -1, i, 3, -1, i, 0]); }
      boxes.forEach(([x, y, z, sx, sy, sz]) => {
        const c = [];
        for (let a = -1; a <= 1; a += 2) for (let b = -1; b <= 1; b += 2) for (let d = -1; d <= 1; d += 2) c.push([x + a * sx / 2, y + b * sy / 2, z + d * sz / 2]);
        for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) { const x1 = i ^ j; if (x1 === 1 || x1 === 2 || x1 === 4) segs.push([...c[i], ...c[j], 1]); }
      });
      const RING = 2.6, RN = 72;
      for (let i = 0; i < RN; i++) {
        const a0 = i / RN * TAU, a1 = (i + 1) / RN * TAU;
        segs.push([RING * Math.cos(a0), -1, RING * Math.sin(a0), RING * Math.cos(a1), -1, RING * Math.sin(a1), 2]);
      }
      const MARK = [0, 1.5, 0], MARK_R = 0.11;
      const CAM = { fov: 34, R: 8.8, H: 3.6, look: [0, -0.3, 0] };
      const camAt = ang => [Math.sin(ang) * CAM.R, CAM.H, Math.cos(ang) * CAM.R];

      if (window.THREE) return mountThree(el, api, C);
      return mount2D(el, api, C);

      function makeButtons(api, C, onPick) {
        const row = api.div('position:absolute;left:0;right:0;bottom:5%;display:flex;justify-content:center;gap:6px;pointer-events:auto;');
        const presets = [0, Math.PI * 0.66, Math.PI * 1.33];
        presets.forEach((ang, i) => {
          const b = document.createElement('button'); b.textContent = 'V' + (i + 1);
          b.style.cssText = `font:600 ${Math.max(9, 0)}px ${api.fonts.mono};padding:2px 8px;border-radius:4px;border:1px solid ${C.line};` +
            `background:${i === 0 ? C.ink : 'rgba(255,255,255,0.75)'};color:${i === 0 ? '#fff' : C.ink};cursor:pointer;`;
          b.style.fontSize = '11px';
          b.onclick = (e) => {
            e.stopPropagation(); api.touch();
            [...row.children].forEach((c, ci) => { c.style.background = ci === i ? C.ink : 'rgba(255,255,255,0.75)'; c.style.color = ci === i ? '#fff' : C.ink; });
            onPick(ang);
          };
          row.appendChild(b);
        });
        return presets;
      }

      function mount2D(el, api, C) {
        const { ctx } = api.canvas();
        let fromOffset = 0, toOffset = 0, transStart = -10;
        const transDur = 0.9;
        makeButtons(api, C, (ang) => { fromOffset = curOffset(); toOffset = ang; transStart = api.t; });
        function curOffset() { const p = api.clamp((api.t - transStart) / transDur); return api.lerp(fromOffset, toOffset, api.ease.inOut(p)); }
        const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
        const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
        const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
        const norm = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
        const cols = [C.line, C.ink, C.muted];
        return {
          resize() { this.frame(api.t, 0); },
          frame(t) {
            const w = api.w, h = api.h; if (!w) return;
            ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
            const ang = t * 0.22 + curOffset();
            const cam = camAt(ang), f = norm(sub(CAM.look, cam)), r = norm(cross(f, [0, 1, 0])), u = cross(r, f);
            const F = (h / 2) / Math.tan(CAM.fov * Math.PI / 360), cx = w / 2, cy = h / 2;
            const P = p => { const d = sub(p, cam); const zc = dot(d, f); return [cx + dot(d, r) / zc * F, cy - dot(d, u) / zc * F, zc]; };
            ctx.lineWidth = 1;
            for (let kind = 0; kind < 3; kind++) {
              ctx.strokeStyle = cols[kind];
              for (const s of segs) {
                if (s[6] !== kind) continue;
                const a = P([s[0], s[1], s[2]]), b = P([s[3], s[4], s[5]]);
                const fog = api.clamp(((a[2] + b[2]) / 2 - 8) / 9);
                ctx.globalAlpha = 1 - 0.85 * fog;
                ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
              }
            }
            ctx.globalAlpha = 1;
            const m = P(MARK);
            ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(m[0], m[1], Math.max(3, MARK_R * F / m[2]), 0, TAU); ctx.fill();
          },
        };
      }

      function mountThree(el, api, C) {
        const T = window.THREE;
        const { cv } = api.canvas({ context: 'webgl', contextAttrs: { alpha: true, antialias: true } });
        const gl = cv.getContext('webgl');
        const renderer = new T.WebGLRenderer({ canvas: cv, context: gl, alpha: true, antialias: true });
        renderer.setPixelRatio(api.dpr);
        const scene = new T.Scene();
        scene.fog = new T.Fog(0xE9E6DF, 8, 17);
        const camera = new T.PerspectiveCamera(CAM.fov, 1, 0.1, 50);
        const mats = [0xC9C4BA, 0x17171A, 0x77756F].map(c => new T.LineBasicMaterial({ color: c }));
        const geos = [0, 1, 2].map(kind => {
          const pos = []; segs.forEach(s => { if (s[6] === kind) pos.push(s[0], s[1], s[2], s[3], s[4], s[5]); });
          const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); scene.add(new T.LineSegments(g, mats[kind])); return g;
        });
        const mg = new T.SphereGeometry(MARK_R, 20, 14), mm = new T.MeshBasicMaterial({ color: 0x2E4BFF, fog: false });
        const mark = new T.Mesh(mg, mm); mark.position.set(MARK[0], MARK[1], MARK[2]); scene.add(mark);
        let fromOffset = 0, toOffset = 0, transStart = -10;
        const transDur = 0.9;
        makeButtons(api, C, (ang) => { fromOffset = curOffset(); toOffset = ang; transStart = api.t; });
        function curOffset() { const p = api.clamp((api.t - transStart) / transDur); return api.lerp(fromOffset, toOffset, api.ease.inOut(p)); }
        function fit() { const w = api.w, h = api.h; if (!w) return; camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h, false); }
        fit();
        return {
          resize() { fit(); },
          frame(t) {
            fit();
            const ang = t * 0.22 + curOffset(), c = camAt(ang);
            camera.position.set(c[0], c[1], c[2]);
            camera.lookAt(CAM.look[0], CAM.look[1], CAM.look[2]);
            renderer.render(scene, camera);
          },
          destroy() { geos.forEach(g => g.dispose()); mats.forEach(m => m.dispose()); mg.dispose(); mm.dispose(); renderer.dispose(); },
        };
      }
    },
  });

  // ── kinetic-type ───────────────────────────────────────────────────
  LEX.register('kinetic-type', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      const seq = [{ t0: 0.0, dur: 0.55 }, { t0: 0.55, dur: 0.55 }, { t0: 1.1, dur: 0.55 }, { t0: 1.75, dur: 0.55 }];
      const period = 4.6, holdEnd = 3.8, fadeOutDur = 0.35;
      return {
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
          const lt = t % period;
          let globalFade = 1;
          if (lt > holdEnd) globalFade = api.clamp(1 - (lt - holdEnd) / fadeOutDur);
          function rise(idx) {
            const s = seq[idx];
            const p = api.clamp((lt - s.t0) / s.dur);
            return { a: api.ease.out(p) * globalFade, y: (1 - api.ease.out(p)) * h * 0.05 };
          }
          ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
          const groundY = h * 0.84;
          {
            const r = rise(0); ctx.save(); ctx.globalAlpha = r.a;
            ctx.font = api.font('sans', h * 0.17, 800); ctx.fillStyle = C.ink;
            ctx.fillText('根基', w / 2, groundY + r.y);
            ctx.strokeStyle = C.line; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(w * 0.12, groundY + h * 0.03); ctx.lineTo(w * 0.88, groundY + h * 0.03); ctx.stroke();
            ctx.restore();
          }
          const charH = h * 0.115;
          const pillarTop = groundY - 2 * charH - h * 0.02;
          {
            const r = rise(1); ctx.save(); ctx.globalAlpha = r.a;
            ctx.font = api.font('serif', h * 0.1, 600); ctx.fillStyle = C.accent;
            ['耐', '心'].forEach((ch, i) => ctx.fillText(ch, w * 0.28, pillarTop + i * charH + charH * 0.8 + r.y));
            ctx.restore();
          }
          {
            const r = rise(2); ctx.save(); ctx.globalAlpha = r.a;
            ctx.font = api.font('serif', h * 0.1, 600); ctx.fillStyle = C.accent;
            ['细', '节'].forEach((ch, i) => ctx.fillText(ch, w * 0.72, pillarTop + i * charH + charH * 0.8 + r.y));
            ctx.restore();
          }
          {
            const r = rise(3); ctx.save(); ctx.globalAlpha = r.a;
            ctx.font = api.font('sans', h * 0.075, 700); ctx.fillStyle = C.ink;
            ctx.fillText('自成一格', w / 2, pillarTop - h * 0.05 + r.y);
            ctx.restore();
          }
        },
      };
    },
  });

  // ── counter-roll ───────────────────────────────────────────────────
  LEX.register('counter-roll', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      const rand = api.rng(77);
      const stats = [
        { target: 128, unit: '', label: '活跃用户' },
        { target: 4502, unit: '+', label: '累计下载' },
        { target: 99.9, unit: '%', label: '满意率', decimals: 1 },
      ];
      let modeStart = 0;
      const lastVal = stats.map(() => -1);
      const kick = stats.map(() => 0);
      return {
        mode() { modeStart = api.t; for (let i = 0; i < lastVal.length; i++) { lastVal[i] = -1; kick[i] = 0; } },
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
          const lt = (t - modeStart) % 4.2;
          const countDur = 1.6;
          const p = api.ease.out(api.clamp(lt / countDur));
          const rowH = h / stats.length;
          stats.forEach((s, i) => {
            const val = s.target * p;
            const shown = s.decimals ? val.toFixed(s.decimals) : Math.round(val).toString();
            const cy = rowH * (i + 0.5);
            const rounded = Math.round(val);
            if (rounded !== lastVal[i] && lt < countDur) kick[i] = 1;
            lastVal[i] = rounded;
            kick[i] *= 0.82;
            ctx.font = api.font('mono', h * 0.04, 400); ctx.fillStyle = C.muted; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
            ctx.fillText(s.label, w * 0.08, cy);
            ctx.textAlign = 'center';
            if (api.mode === 0) {
              const jx = (rand() - 0.5) * kick[i] * 4;
              const jy = (rand() - 0.5) * kick[i] * 3;
              const numFont = api.font('sans', h * 0.13, 700);
              ctx.font = numFont;
              const numW = ctx.measureText(shown).width;
              ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
              ctx.fillText(shown, w * 0.42 - numW / 2 + jx, cy + jy);
              ctx.font = api.font('sans', h * 0.07, 600); ctx.fillStyle = C.muted;
              ctx.fillText(s.unit, w * 0.42 + numW / 2 + w * 0.02 + jx, cy + jy);
            } else {
              const numFont = api.font('mono', h * 0.13, 600);
              ctx.font = numFont;
              const numW = ctx.measureText(shown).width;
              ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
              ctx.fillText(shown, w * 0.42 - numW / 2, cy);
              const unitAlpha = api.clamp((p - 0.75) / 0.25);
              ctx.save(); ctx.globalAlpha = unitAlpha;
              ctx.font = api.font('mono', h * 0.07, 500); ctx.fillStyle = C.accent;
              ctx.fillText(s.unit, w * 0.42 + numW / 2 + w * 0.02, cy);
              ctx.restore();
            }
          });
        },
      };
    },
  });

  // ── light-on-text ──────────────────────────────────────────────────
  LEX.register('light-on-text', {
    mount(el, api) {
      const { ctx } = api.canvas();
      const C = api.colors;
      const text = '看见所思';
      return {
        frame(t) {
          const w = api.w, h = api.h; if (!w) return;
          ctx.fillStyle = C.night; ctx.fillRect(0, 0, w, h);
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.font = api.font('sans', h * 0.2, 800);
          ctx.fillStyle = 'rgba(236,233,226,0.16)';
          ctx.fillText(text, w / 2, h / 2);
          const period = 3.4;
          const p = (t % period) / period;
          const pp = p < 0.5 ? p * 2 : 2 - p * 2;
          const bx = api.lerp(-w * 0.3, w * 1.3, pp);
          const beamW = w * 0.34, skew = w * 0.22;
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(bx - beamW / 2 + skew, 0);
          ctx.lineTo(bx + beamW / 2 + skew, 0);
          ctx.lineTo(bx + beamW / 2 - skew, h);
          ctx.lineTo(bx - beamW / 2 - skew, h);
          ctx.closePath(); ctx.clip();
          ctx.fillStyle = '#fff6df';
          ctx.shadowColor = 'rgba(255,235,180,0.6)'; ctx.shadowBlur = h * 0.03;
          ctx.fillText(text, w / 2, h / 2);
          ctx.restore();
          ctx.save();
          const g = ctx.createLinearGradient(bx - beamW * 0.6, 0, bx + beamW * 0.6, 0);
          g.addColorStop(0, 'rgba(255,235,180,0)'); g.addColorStop(0.5, 'rgba(255,235,180,0.12)'); g.addColorStop(1, 'rgba(255,235,180,0)');
          ctx.fillStyle = g; ctx.fillRect(bx - beamW * 0.6, 0, beamW * 1.2, h);
          ctx.restore();
        },
      };
    },
  });
})();
