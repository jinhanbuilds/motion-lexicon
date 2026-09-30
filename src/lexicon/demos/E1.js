/* 动效词典 v3 · 组合案例 E1：sc-launch · sc-saas · sc-luxury · sc-explainer · sc-data
 *
 * 视觉语法 = 页面顶部「滚动解剖」小片：纸色颗粒舞台 + 细线圆环 + 大号拉丁字/数字 + 一个钴蓝块/点 + 底部 mono 时间码与刻度。
 * 5 个组合只靠节奏 / 构图 / 运动方式区分；不画 UI 模型、不画插画、钴蓝只是点/线/小块。
 *
 * 约定
 *  - 画布逻辑尺寸 1600×1000（16:10）。letterbox 类（launch / explainer / data）：黑边里嵌 1344×756 的舞台（局部坐标 1600×900，缩放 .84），
 *    下方是 mono 时间码 + 刻度；全出血类（saas / luxury）：舞台铺满，细线框 + 角标，只有一个 mono 标签。
 *  - B 一个循环 10 秒，首尾无缝（结尾淡回空白舞台，开头从空白舞台长出来）；mode()/restart() 从 t=0 重播。
 *  - A（只写内容）= 模型默认审美：紫粉渐变、多色平均、弹跳/线性、光晕与粒子、一屏塞满、无停顿、硬切落在随机时刻。
 *  - 全部确定性：画面只由本地循环时间 lt 决定。
 *
 * 分镜表（B）在各场景代码块顶部。
 */
(function () {
  'use strict';
  const LOOP = 10, W = 1600, H = 1000, TAU = Math.PI * 2;
  const F = LEX.fonts, C = LEX.colors, E = LEX.ease;
  let K = null, SS = 1, DP = 1;
  const INTER = '"Inter","Helvetica Neue",Arial,"PingFang SC","Noto Sans SC",system-ui,sans-serif';
  const APAL = ['#FF5A5F', '#7B61FF', '#00B3A4', '#FFB400'];
  const BLACK = '#0B0B0D';

  // ── 工具 ────────────────────────────────────────────────
  const cl = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x;
  const seg = (t, a, b) => cl((t - a) / (b - a));
  const lerp = (a, b, t) => a + (b - a) * t;
  const eo = p => E.expoOut(cl(p));
  const eio = p => E.inOut(cl(p));
  const ec = p => E.out(cl(p));
  const slow = p => { p = cl(p); return p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
  const bounce = p => E.bouncy(cl(p));
  const spr = (t, a, f = 2.0, z = 0.7) => t <= a ? 0 : E.spring(t - a, f, z);
  const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; };
  const mix = (h1, h2, e) => { e = cl(e); const a = parseInt(h1.slice(1), 16), b = parseInt(h2.slice(1), 16); const c = [16, 8, 0].map(s => Math.round(lerp(a >> s & 255, b >> s & 255, e))); return '#' + ((1 << 24) + (c[0] << 16) + (c[1] << 8) + c[2]).toString(16).slice(1); };
  const font = (role, px, w = 400, style = '') => `${style} ${w} ${px}px ${F[role]}`.trim();
  const fA = (px, w = 700) => `${w} ${px}px ${INTER}`;
  const rr = (ctx, x, y, w, h, r) => K.rr(ctx, x, y, w, h, r);
  const pad2 = n => (n < 10 ? '0' : '') + n;

  function T(ctx, s, x, y, px, o = {}) {
    ctx.save();
    ctx.font = o.f || font(o.role || 'sans', px, o.w || 400, o.style || '');
    ctx.fillStyle = o.c || C.ink; ctx.textAlign = o.a || 'left'; ctx.textBaseline = o.b || 'alphabetic';
    if (o.ls != null && 'letterSpacing' in ctx) ctx.letterSpacing = o.ls + 'px';
    if (o.al != null) ctx.globalAlpha *= o.al;
    if (o.sh) { ctx.shadowColor = o.sh[0]; ctx.shadowBlur = o.sh[1] * SS * DP; ctx.shadowOffsetY = (o.sh[2] || 0) * SS * DP; }
    ctx.fillText(s, x, y); ctx.restore();
  }
  function TW(ctx, s, px, o = {}) {
    ctx.save(); ctx.font = o.f || font(o.role || 'sans', px, o.w || 400, o.style || '');
    if (o.ls != null && 'letterSpacing' in ctx) ctx.letterSpacing = o.ls + 'px';
    const w = ctx.measureText(s).width; ctx.restore(); return w;
  }
  // 文字从看不见的遮罩后面升起。y = 基线，p: 0..1
  function rise(ctx, s, x, y, px, p, o = {}) {
    if (p <= 0.001) return 0;
    const w = TW(ctx, s, px, o), al = o.a || 'left', x0 = al === 'center' ? x - w / 2 : al === 'right' ? x - w : x;
    ctx.save(); ctx.beginPath(); ctx.rect(x0 - px * .3, y - px * (o.up || 1.0), w + px * .6, px * (o.up || 1.0) + px * (o.down || .32)); ctx.clip();
    T(ctx, s, x, y + (1 - p) * px * 1.25, px, o); ctx.restore(); return w;
  }
  function radial(ctx, x, y, r, col, a) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba(col, a)); g.addColorStop(1, rgba(col, 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
  function vignette(ctx, w, h, a, col = '#28201A') { const g = ctx.createRadialGradient(w / 2, h / 2, h * .38, w / 2, h / 2, h * 1.0); g.addColorStop(0, rgba(col, 0)); g.addColorStop(1, rgba(col, a)); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); }
  // 幽灵光标：细圆环 + 十字 + 圆心点（不画箭头）
  function ghost(ctx, x, y, o = {}) {
    const col = o.c || C.ink, r = (o.r || 22) * (1 - .35 * (o.press || 0)), a = o.al == null ? 1 : o.al;
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = col; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
    ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x - r - 14, y); ctx.lineTo(x - r + 6, y); ctx.moveTo(x + r - 6, y); ctx.lineTo(x + r + 14, y); ctx.moveTo(x, y - r - 14); ctx.lineTo(x, y - r + 6); ctx.moveTo(x, y + r - 6); ctx.lineTo(x, y + r + 14); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, o.dot || 4.5, 0, TAU); ctx.fillStyle = o.dc || col; ctx.fill(); ctx.restore();
  }
  function logoCut(ctx, cx, cy, sz, color, cutP = 1, cutBg) {
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, sz / 2, 0, TAU); ctx.clip();
    const ox = cx + sz * .2 + sz * (1 - cutP) * 1.0, oy = cy - sz * .14, cr = sz * .3;
    ctx.beginPath(); ctx.arc(cx, cy, sz / 2, 0, TAU); ctx.moveTo(ox + cr, oy); ctx.arc(ox, oy, cr, 0, TAU);
    ctx.fillStyle = color; ctx.fill('evenodd'); ctx.restore();
  }
  const tcf = t => { const s = Math.floor(t), f = Math.floor((t - s) * 30); return `00:${pad2(s)}:${pad2(f)} / 00:10:00`; };

  // ── 舞台（局部坐标 1600×900）：纸色 / 夜色 + 颗粒 + 细线圆环 + 刻度 ──
  function stage(ctx, o = {}) {
    const night = !!o.night;
    ctx.fillStyle = night ? C.night : (o.bg || C.stage); ctx.fillRect(0, 0, 1600, 900);
    radial(ctx, 420, 180, 1000, night ? '#ECE9E2' : '#FFFFFF', night ? .07 : .55);
    radial(ctx, 1380, 880, 900, night ? '#000000' : '#3C321E', night ? .45 : .10);
    vignette(ctx, 1600, 900, night ? .32 : .14, night ? '#000000' : '#28201A');
    K.grain(ctx, 1600, 900, night ? .10 : (o.grain || .17), 3);
    if (o.rings !== false) {
      ctx.strokeStyle = night ? C.nightLine : C.line; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(1340, 180, 118, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(1340, 180, 186, 0, TAU); ctx.stroke();
    }
    if (o.ruler) {
      ctx.strokeStyle = night ? C.nightLine : C.line; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(110, 790); ctx.lineTo(1490, 790); ctx.stroke();
      for (let i = 0; i <= 8; i++) { const x = 110 + i * 172.5; ctx.beginPath(); ctx.moveTo(x, 790); ctx.lineTo(x, 772); ctx.stroke(); }
    }
  }
  // 黑边 letterbox + 角标 + 时间码 + 右侧标签
  function letterbox(ctx, t, o, drawStage) {
    ctx.fillStyle = BLACK; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(128, 50); ctx.scale(.84, .84); ctx.beginPath(); ctx.rect(0, 0, 1600, 900); ctx.clip();
    drawStage(ctx); ctx.restore();
    const fade = seg(t, .15, .6) * (1 - seg(t, 9.7, 10));
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 2; ctx.strokeRect(128, 50, 1344, 756);
    ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 3;
    [[128, 50, 1, 1], [1472, 50, -1, 1], [128, 806, 1, -1], [1472, 806, -1, -1]].forEach(([x, y, a, b]) => { ctx.beginPath(); ctx.moveTo(x - a * 26, y); ctx.lineTo(x - a * 10, y); ctx.moveTo(x, y - b * 26); ctx.lineTo(x, y - b * 10); ctx.stroke(); });
    ctx.restore();
    T(ctx, tcf(t), 128, 878, 46, { role: 'mono', c: C.nightInk, al: fade });
    if (o.right) T(ctx, o.right, 1472, 878, 46, { role: 'mono', c: C.muted, a: 'right', al: fade * (o.rightA == null ? 1 : o.rightA) });
    if (o.ticks) o.ticks(ctx, t, fade);
  }

  // ── 宿主适配：单 canvas + 本地循环时间 + active ─────────────
  function combo(id, spec) {
    LEX.register(id, {
      mount(el, api) {
        K = api.kit;
        const cv = api.canvas(), ctx = cv.ctx;
        const X = { api, rnd: api.rng(spec.seed || 7) };
        if (spec.init) spec.init(X);
        let t0 = 0, last = -1, reset = true, cur = 0, md = 1;
        return {
          frame(t) {
            K = api.kit;
            if (reset || t < last - 0.3) { t0 = t; reset = false; }
            last = t; cur = ((t - t0) % LOOP + LOOP) % LOOP;
            const w = api.w; if (!w) return; const s = w / W; SS = s; DP = api.dpr;
            ctx.save(); ctx.scale(s, s); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
            (md ? spec.B : spec.A)(ctx, cur, X);
            ctx.restore();
          },
          mode(m) { md = m ? 1 : 0; reset = true; },
          restart() { reset = true; },
          active(t, m) { return m ? spec.active(cur) : []; },
        };
      },
    });
  }

  // ── A 模式共用：默认审美（紫粉渐变 + 光晕 + 彩纸 + 爆发）──────────
  function confList(rnd, n) { const a = []; for (let i = 0; i < n; i++) a.push({ x: rnd(), y: rnd(), s: 16 + rnd() * 26, k: Math.floor(rnd() * 3), f: .8 + rnd() * 1.6, ph: rnd() * TAU }); return a; }
  function burstList(rnd, n) { const a = []; for (let i = 0; i < n; i++) a.push({ a: rnd() * TAU, spd: .4 + rnd() * .8, s: 16 + rnd() * 22 }); return a; }
  function aBg(ctx, t, c1, c2) {
    const g = ctx.createLinearGradient(0, 0, W * .8, H); g.addColorStop(0, c1); g.addColorStop(1, c2); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    radial(ctx, 300 + Math.sin(t * 1.3) * 90, 250, 520, '#FF5A5F', .35); radial(ctx, 1300 + Math.cos(t * 1.1) * 90, 760, 560, '#00B3A4', .32); radial(ctx, 900, 520 + Math.sin(t) * 40, 420, '#FFB400', .18);
  }
  function aStar(ctx, x, y, r, col, rot) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.beginPath(); for (let i = 0; i < 10; i++) { const q = i % 2 ? r * .45 : r; const a = i * Math.PI / 5; ctx.lineTo(Math.sin(a) * q, -Math.cos(a) * q); } ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.restore(); }
  function aConfetti(ctx, t, list, amt = 1, alpha = .9) {
    for (let i = 0, n = Math.floor(list.length * amt); i < n; i++) {
      const p = list[i], x = p.x * W + Math.sin(t * p.f + p.ph) * 26, y = p.y * H + Math.cos(t * p.f * .8 + p.ph) * 22, col = APAL[i % 4], rot = t * p.f * .9 + p.ph;
      ctx.save(); ctx.globalAlpha = alpha; ctx.shadowColor = col; ctx.shadowBlur = 14 * SS * DP;
      if (p.k === 0) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, p.s * .6, 0, TAU); ctx.fill(); }
      else if (p.k === 1) { ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = col; ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s); }
      else aStar(ctx, x, y, p.s, col, rot);
      ctx.restore();
    }
  }
  function aBurst(ctx, bt, list, cx, cy) {
    if (bt < 0 || bt > 1.4) return; const e = 1 - Math.pow(1 - cl(bt / 1.2), 3);
    for (let i = 0; i < list.length; i++) { const p = list[i], d = p.spd * e * 520, x = cx + Math.cos(p.a) * d, y = cy + Math.sin(p.a) * d * .7 + bt * bt * 120; ctx.save(); ctx.globalAlpha = 1 - cl((bt - .5) / .9); ctx.translate(x, y); ctx.rotate(p.a * 3 + bt * 6); ctx.fillStyle = APAL[i % 4]; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore(); }
  }
  function aRings(ctx, t, cx, cy, col) { for (let i = 0; i < 3; i++) { const p = ((t * .7 + i / 3) % 1); ctx.beginPath(); ctx.arc(cx, cy, 140 + p * 380, 0, TAU); ctx.lineWidth = 8 * (1 - p); ctx.strokeStyle = rgba(col, .6 * (1 - p)); ctx.stroke(); } }
  const aShadow = (c = 'rgba(0,0,0,.35)', b = 18, y = 6) => [c, b, y];

  /* ════════════════════════════════════════════════════════════
   * sc-launch · 发布片 · 120 BPM（1 拍 .5s，1 小节 2s）· 主题：Nimbus + 一个钴蓝点
   * ─────────────────────────────────────────────────────────
   *  0.0–0.9  黑边 + 时间码 + 五格分镜框出现后收成一条 5 小节刻度线      fixed-stage · seek-t · duration-fps · storyboard-first
   *  0.5–2.5  钩子 Plan/less/Do/more 每词落在一拍上，从遮罩后升起，字重 800 vs 200   word-on-beat · masked-reveal · type-extremes · beat-grid
   *  2.5–3.0  句号 “.” 弹簧长出——整片唯一的钴蓝点；停顿                  one-accent
   *  3.0–3.6  匹配剪辑：句号变形成钴蓝块，弹簧过冲一点点                    match-cut · spring
   *  3.5–4.0  圆形从块的中心张开，落在 4.0 强拍（DROP 刻度是钴蓝的）          iris-open · s-launch-bars
   *  4.0–6.0  三个大数字 4h / 3.5× / 12k 硬切，各在一拍上，1.06→1.0 推进；5.0 后停 1 秒   push-cut · beat-grid
   *  6.0–8.0  一小节一个动作：三块线框弹簧升起，中间那块填成钴蓝，其余不动         spring · one-idea · anti-slop
   *  8.0–9.4  钴蓝块匹配剪辑成圆盘，月牙缺口弹入，NIMBUS 800 / app 200 遮罩升起  match-cut · spring · masked-reveal · type-extremes
   *  9.45–10.0 纸面从圆心张开（再用一次圆形转场），回到空白舞台，首尾衔接
   * A：同内容，紫色渐变 + 光晕 + 彩纸 + 弹跳 + 爆发 + 抖动；硬切在 2.3/4.4/6.3/8.2，不在拍上。
   * ════════════════════════════════════════════════════════════ */
  const LW = [{ s: 'Plan', w: 800, l: 0, at: .5 }, { s: 'less', w: 200, l: 0, at: 1 }, { s: 'Do', w: 200, l: 1, at: 1.5 }, { s: 'more', w: 800, l: 1, at: 2 }];
  const LB_BLOCK = { x: 560, y: 330, w: 480, h: 240 };
  function launchHook(ctx, t) {
    const px = 210, gap = px * .24, base = [400, 640], dr = 24, sp = { role: 'sans' };
    const ws = LW.map(h => TW(ctx, h.s, px, { role: 'sans', w: h.w }));
    const l0 = ws[0] + gap + ws[1], l1 = ws[2] + gap + ws[3] + dr * 3.4;
    const xs = [800 - l0 / 2, 800 - l0 / 2 + ws[0] + gap, 800 - l1 / 2, 800 - l1 / 2 + ws[2] + gap];
    const out = eio(seg(t, 2.95, 3.3));
    LW.forEach((h, i) => { const p = Math.min(eo(seg(t, h.at, h.at + .5)), 1 - out); rise(ctx, h.s, xs[i], base[h.l], px, p, { role: 'sans', w: h.w, c: C.ink, up: 1.0, down: .3 }); });
    const dx = xs[3] + ws[3] + dr * 1.5 + dr, dy = base[1] - dr;
    return { x: dx, y: dy, r: dr, s: spr(t, 2.5, 2.4, .55), vis: t >= 2.5 };
  }
  function launchLight(ctx, t) {
    stage(ctx, { ruler: true });
    const dot = launchHook(ctx, t);
    if (t >= 2.5) {
      const e = spr(t, 3.0, 1.6, .74), B = LB_BLOCK, r0 = dot.r * dot.s;
      const rx = lerp(dot.x - r0, B.x, e), ry = lerp(dot.y - r0, B.y, e), rw = lerp(r0 * 2, B.w, e), rh = lerp(r0 * 2, B.h, e);
      rr(ctx, rx, ry, Math.max(1, rw), Math.max(1, rh), lerp(Math.min(rw, rh) / 2, 26, cl(e))); ctx.fillStyle = C.accent; ctx.fill();
      const la = seg(t, 3.35, 3.6); if (la > 0) T(ctx, 'Nimbus', 800, 480, 92, { role: 'sans', w: 800, a: 'center', c: '#fff', al: la, ls: -1 });
    }
  }
  function launchNight(ctx, t) {
    stage(ctx, { night: true });
    if (t >= 4 && t < 6) {
      const cuts = [[4.0, '4', 'h'], [4.5, '3.5', '×'], [5.0, '12', 'k']], i = t >= 5 ? 2 : t >= 4.5 ? 1 : 0, c = cuts[i];
      const s = 1 + .06 * (1 - eo((t - c[0]) / .3)), px = 460;
      const wN = TW(ctx, c[1], px, { role: 'sans', w: 800, ls: -12 }), wU = TW(ctx, c[2], px * .34, { role: 'sans', w: 200 }), tot = wN + wU + 44;
      ctx.save(); ctx.translate(800, 450); ctx.scale(s, s); ctx.translate(-800, -450);
      const x0 = 800 - tot / 2;
      T(ctx, c[1], x0, 610, px, { role: 'sans', w: 800, c: C.nightInk, ls: -12 });
      T(ctx, c[2], x0 + wN + 14, 610, px * .34, { role: 'sans', w: 200, c: rgba(C.nightInk, .8) });
      ctx.beginPath(); ctx.arc(x0 + wN + wU + 44, 596, 22, 0, TAU); ctx.fillStyle = C.accent; ctx.fill();
      ctx.restore();
    } else if (t >= 6 && t < 8) {
      for (let i = 0; i < 3; i++) {
        const p = spr(t, 6.0 + i * .12, 2.0, .6), a = cl(p * 1.3), s = lerp(.72, 1, p), cx = 800 + (i - 1) * 336, cy = 450;
        ctx.save(); ctx.globalAlpha = a; ctx.translate(cx, cy); ctx.scale(s, s);
        rr(ctx, -140, -190, 280, 380, 24);
        if (i === 1) { const f = eio(seg(t, 6.7, 7.1)); ctx.fillStyle = rgba(C.accent, f); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = mix('#5A5C63', C.accent, f); ctx.stroke(); }
        else { ctx.lineWidth = 4; ctx.strokeStyle = rgba(C.nightInk, .34); ctx.stroke(); }
        ctx.restore();
      }
    } else if (t >= 8) {
      const e = spr(t, 8.0, 1.7, .74), fo = 1 - eio(seg(t, 8.0, 8.4)), cx = 800, cy = 340;
      for (let i = 0; i < 3; i += 2) { const x = 800 + (i - 1) * 336; ctx.save(); ctx.globalAlpha = fo; rr(ctx, x - 140, 260, 280, 380, 24); ctx.lineWidth = 4; ctx.strokeStyle = rgba(C.nightInk, .34); ctx.stroke(); ctx.restore(); }
      const rx = lerp(660, cx - 100, e), ry = lerp(260, cy - 100, e), rw = lerp(280, 200, e), rh = lerp(380, 200, e);
      if (t < 8.5) { rr(ctx, rx, ry, rw, rh, lerp(24, 100, cl(e))); ctx.fillStyle = C.accent; ctx.fill(); }
      else logoCut(ctx, cx, cy, 200, C.accent, cl(spr(t, 8.5, 1.8, .7)));
      const px = 150, wN = TW(ctx, 'NIMBUS', px, { role: 'sans', w: 800, ls: 6 }), wA = TW(ctx, 'app', px * .5, { role: 'sans', w: 200 }), tot = wN + 34 + wA, x0 = 800 - tot / 2;
      rise(ctx, 'NIMBUS', x0, 690, px, eo(seg(t, 8.7, 9.2)), { role: 'sans', w: 800, c: C.nightInk, ls: 6 });
      rise(ctx, 'app', x0 + wN + 34, 690, px * .5, eo(seg(t, 8.85, 9.3)), { role: 'sans', w: 200, c: rgba(C.nightInk, .8) });
    }
  }
  function launchStage(ctx, t) {
    if (t >= 4.0) launchNight(ctx, t);
    else {
      launchLight(ctx, t);
      if (t >= 3.6) {
        const q = eio(seg(t, 3.6, 4.0)), R = q * 1150;
        ctx.save(); ctx.beginPath(); ctx.arc(800, 450, Math.max(.1, R), 0, TAU); ctx.clip(); launchNight(ctx, t); ctx.restore();
        ctx.save(); ctx.strokeStyle = rgba(C.accent, .9 * (1 - q)); ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(800, 450, Math.max(.1, R), 0, TAU); ctx.stroke(); ctx.restore();
      }
    }
    if (t > 9.45) { const q = eio(seg(t, 9.45, 9.95)); ctx.save(); ctx.beginPath(); ctx.arc(800, 450, Math.max(.1, q * 1150), 0, TAU); ctx.clip(); stage(ctx, { ruler: true }); ctx.restore(); ctx.save(); ctx.strokeStyle = rgba(C.accent, .9 * (1 - q)); ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(800, 450, Math.max(.1, q * 1150), 0, TAU); ctx.stroke(); ctx.restore(); }
  }
  function launchTicks(ctx, t, fade) {
    const x0 = 128, w = 1344, y = 930, bw = w / 20;
    ctx.save(); ctx.globalAlpha = fade;
    // 分镜框 → 收成刻度线
    const sb = 1 - eio(seg(t, .75, 1.0));
    if (sb > 0.01) for (let i = 0; i < 5; i++) { const a = eo(seg(t, .2 + i * .08, .5 + i * .08)) * sb, bh = 60 * a; if (bh < 1) continue; ctx.strokeStyle = rgba(C.nightInk, .5 * a); ctx.lineWidth = 3; ctx.strokeRect(x0 + i * 4 * bw + 6, y - bh / 2, 4 * bw - 12, bh); }
    ctx.lineWidth = 4; ctx.strokeStyle = rgba(C.nightInk, .26); ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + w, y); ctx.stroke();
    ctx.strokeStyle = rgba(C.nightInk, .85); ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + w * t / 10, y); ctx.stroke();
    const bi = Math.floor(t / .5) % 20, bp = 1 - eo((t % .5) / .35);
    for (let i = 0; i <= 20; i++) {
      const x = x0 + i * bw, big = i % 4 === 0, drop = i === 8, hh = (drop ? 40 : big ? 26 : 14) + (i === bi ? 12 * bp : 0);
      ctx.beginPath(); ctx.moveTo(x, y - hh); ctx.lineTo(x, y + hh * .4); ctx.lineWidth = drop || i === bi ? 6 : 3; ctx.strokeStyle = drop || i === bi ? C.accent : rgba(C.nightInk, big ? .5 : .3); ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(x0 + w * t / 10, y, 9, 0, TAU); ctx.fillStyle = C.accent; ctx.fill();
    ctx.restore();
  }
  function launchB(ctx, t) { letterbox(ctx, t, { right: '120 BPM', ticks: launchTicks }, c => launchStage(c, t)); }
  function launchActive(t) {
    const a = [];
    if (t < 1.0) a.push('fixed-stage', 'seek-t', 'duration-fps', 'storyboard-first');
    if (t >= .5 && t < 2.6) a.push('word-on-beat', 'masked-reveal', 'type-extremes', 'beat-grid');
    if (t >= 2.5 && t < 3.6) a.push('one-accent');
    if (t >= 3.0 && t < 3.7) a.push('match-cut', 'spring');
    if (t >= 3.6 && t < 4.3) a.push('iris-open', 's-launch-bars');
    if (t >= 4.0 && t < 6.0) a.push('push-cut', 'beat-grid');
    if (t >= 6.0 && t < 7.6) a.push('spring', 'one-idea', 'anti-slop');
    if (t >= 8.0 && t < 8.6) a.push('match-cut', 'spring');
    if (t >= 8.6 && t < 9.5) a.push('masked-reveal', 'type-extremes');
    return a;
  }
  function launchA(ctx, t, X) {
    const cuts = [0, 2.3, 4.4, 6.3, 8.2], si = t >= 8.2 ? 4 : t >= 6.3 ? 3 : t >= 4.4 ? 2 : t >= 2.3 ? 1 : 0, lt = t - cuts[si];
    const shake = si === 2 ? Math.max(0, 1 - lt / .7) * 14 : 0;
    ctx.save(); if (shake) ctx.translate(Math.sin(lt * 70) * shake, Math.cos(lt * 53) * shake);
    if (si === 0) {
      aBg(ctx, t, '#7B61FF', '#C04CFF'); aConfetti(ctx, t, X.conf, 1);
      const p = bounce(lt / .9), p2 = bounce((lt - .1) / .9);
      T(ctx, 'Plan less.', W / 2, 470 - (1 - p) * 260, 168, { f: fA(168, 800), a: 'center', c: '#fff', sh: aShadow() });
      T(ctx, 'Do more.', W / 2, 690 - (1 - p2) * 300, 168, { f: fA(168, 800), a: 'center', c: '#FFD84D', sh: ['#FF5A5F', 40, 0] });
      aStar(ctx, 1280, 250, 70 * p, '#FFB400', t * 1.5); aStar(ctx, 290, 790, 54 * p, '#00E0C6', -t * 1.3);
    } else if (si === 1) {
      aBg(ctx, t, '#EDE8FF', '#FFE4EC'); aConfetti(ctx, t, X.conf, .8, .8);
      const p = bounce(lt / .8);
      ctx.save(); ctx.translate(W / 2, 480); ctx.scale(.5 + .5 * p, .5 + .5 * p);
      const g = ctx.createLinearGradient(-380, -190, 380, 190); g.addColorStop(0, '#8B5CF6'); g.addColorStop(1, '#3B82F6');
      ctx.shadowColor = 'rgba(124,92,255,.6)'; ctx.shadowBlur = 60 * SS * DP; ctx.shadowOffsetY = 20 * SS * DP; rr(ctx, -380, -190, 760, 380, 46); ctx.fillStyle = g; ctx.fill(); ctx.shadowColor = 'transparent';
      T(ctx, 'Nimbus', 0, 40, 150, { f: fA(150, 800), a: 'center', c: '#fff' }); ctx.restore();
      ctx.save(); ctx.translate(1330, 190); ctx.rotate(.3 + Math.sin(t * 3) * .08); aStar(ctx, 0, 0, 110, '#FFB400', 0); T(ctx, 'NEW!', 0, 14, 44, { f: fA(44, 800), a: 'center', c: '#fff' }); ctx.restore();
    } else if (si === 2) {
      aBg(ctx, t, '#2A1B6E', '#7B2BB5'); aConfetti(ctx, t, X.conf, .5, .7);
      [['4h'], ['3.5×'], ['12k']].forEach((c, i) => {
        const p = bounce((lt - i * .05) / .7), x = 90 + i * 490, y = 250 + (1 - p) * 500, col = APAL[i];
        ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 50 * SS * DP; rr(ctx, x, y, 440, 500, 40); ctx.fillStyle = col; ctx.fill(); ctx.restore();
        T(ctx, c[0], x + 220, y + 300, 170, { f: fA(170, 800), a: 'center', c: '#fff' });
      });
      aBurst(ctx, lt, X.burst, W / 2, 500);
    } else if (si === 3) {
      aBg(ctx, t, '#FF5A8A', '#7B61FF'); aConfetti(ctx, t, X.conf, 1);
      for (let i = 0; i < 3; i++) { const p = bounce((lt - i * .1) / .8); ctx.save(); ctx.translate(330 + i * 470, 500 + (1 - p) * 500); ctx.rotate((1 - p) * .5 + Math.sin(t * 2 + i) * .04); ctx.shadowColor = APAL[(i + 3) % 4]; ctx.shadowBlur = 50 * SS * DP; rr(ctx, -170, -230, 340, 460, 40); ctx.fillStyle = APAL[i]; ctx.fill(); ctx.restore(); }
      T(ctx, 'Shared weeks!', W / 2, 900, 100, { f: fA(100, 800), a: 'center', c: '#FFD84D', sh: ['#FF5A5F', 40, 0], al: cl(lt / .3) });
    } else {
      aBg(ctx, t, '#7B61FF', '#FF5A8A'); aConfetti(ctx, t, X.conf, 1); aRings(ctx, t, W / 2, 380, '#FFFFFF');
      const p = bounce(lt / .9); ctx.save(); ctx.translate(W / 2, 380); ctx.scale(p, p); ctx.shadowColor = '#fff'; ctx.shadowBlur = 80 * SS * DP; logoCut(ctx, 0, 0, 260, '#fff'); ctx.restore();
      const g = ctx.createLinearGradient(400, 0, 1200, 0); g.addColorStop(0, '#FFD84D'); g.addColorStop(1, '#FF5A5F');
      T(ctx, 'NIMBUS', W / 2, 700, 170, { f: fA(170, 800), a: 'center', c: g, sh: ['rgba(255,255,255,.8)', 40, 0] });
    }
    ctx.restore();
  }
  combo('sc-launch', { seed: 5, init: X => { X.conf = confList(X.rnd, 30); X.burst = burstList(X.rnd, 40); }, A: launchA, B: launchB, active: launchActive });

  /* ════════════════════════════════════════════════════════════
   * sc-saas · 落地页 · 一页抽象版面（细线框 + 衬线大字 + 玻璃片 + 钴蓝点），滚动三屏
   * ─────────────────────────────────────────────────────────
   *  0.0–0.9  纸面长出多层柔和渐变 + 颗粒 + 暗角，缓慢漂移              layered-atmosphere
   *  0.5–2.4  首屏一次编排入场：Calm / planning 遮罩升起 → 副标 → 钴蓝小块 → 玻璃片，错开 ~120ms，expo-out
   *                                            orchestrated-load · stagger · expo-out · type-roles · one-accent · anti-slop
   *  1.2–3.0  玻璃片从后面的圆环上滑过：内部模糊 + 提饱和 + 高光边 + 颗粒        frosted-glass
   *  2.9–5.0  光标划过玻璃片：片子朝光标倾斜，一块高光跟着走；离开后弹簧回正      tilt-glare
   *  4.7–6.3  页面 expo-out 滚到第二屏，标题 / 价格 / 开关依次上浮              scroll-reveal · stagger · expo-out
   *  6.1–7.4  光标点开关：药丸弹簧滑过去，数字 12 → 9 滚动，只有开关钴蓝         spring-toggle · counter-roll · one-accent
   *  7.4–8.8  滚到第三屏：三个数字错峰滚到目标，单位最后出现                   scroll-reveal · counter-roll · stagger
   *  8.8–10   标签变 “motion: reduced”：漂移停止，换成纯淡入淡出回首屏，再淡回空白  reduced-motion
   * A：紫粉渐变 + 光晕 + 多色，全部同时弹出，线性匀速滚动，价格瞬间切换，数字直接是终值（非等宽抖动）。
   * ════════════════════════════════════════════════════════════ */
  const FR = { x: 60, y: 60, w: 1480, h: 880 };
  const GL = { x: 970, y: 130, w: 440, h: 600 };
  function tabNum(ctx, str, x, y, px, o = {}) {
    const cw = px * .56, dw = px * .28, ws = [...str].map(c => c === '.' ? dw : (c === '−' ? px * .5 : cw)), tot = ws.reduce((a, b) => a + b, 0);
    let cx = o.a === 'center' ? x - tot / 2 : o.a === 'right' ? x - tot : x;
    [...str].forEach((c, i) => { T(ctx, c, cx + ws[i] / 2, y, px, Object.assign({}, o, { a: 'center' })); cx += ws[i]; }); return tot;
  }
  function saasBehind(ctx, A) {
    ctx.save();
    if (A) {
      ctx.lineWidth = 44; ctx.strokeStyle = '#FFB400'; ctx.beginPath(); ctx.arc(GL.x + 40, GL.y + 150, 118, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.arc(GL.x + GL.w - 50, GL.y + GL.h - 20, 96, 0, TAU); ctx.fillStyle = '#00B3A4'; ctx.fill();
      ctx.translate(GL.x + GL.w - 40, GL.y + 90); ctx.rotate(-.5); rr(ctx, -130, -34, 260, 68, 34); ctx.fillStyle = '#FF5A5F'; ctx.fill();
    } else { // 细线圆环 + 墨色小圆 + 灰色细胶囊 + 一个钴蓝小点
      ctx.lineWidth = 9; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.arc(GL.x + 40, GL.y + 150, 118, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.arc(GL.x + GL.w - 70, GL.y + GL.h - 40, 62, 0, TAU); ctx.fillStyle = C.ink; ctx.fill();
      ctx.beginPath(); ctx.arc(GL.x + 6, GL.y + 330, 20, 0, TAU); ctx.fillStyle = C.accent; ctx.fill();
      ctx.save(); ctx.translate(GL.x + GL.w - 40, GL.y + 90); ctx.rotate(-.5); rr(ctx, -120, -18, 240, 36, 18); ctx.fillStyle = C.muted; ctx.fill(); ctx.restore();
    }
    ctx.restore();
  }
  function saasGlass(ctx, o) {
    const G = GL, p = o.p; if (p <= 0.001) return;
    const base = ctx.getTransform(), cx = G.x + G.w / 2, cy = G.y + G.h / 2, tl = o.tilt || { rx: 0, ry: 0, gs: 0, gx: 0, gy: 0 };
    ctx.save(); ctx.globalAlpha *= cl(p * 1.4); ctx.translate(0, (1 - p) * 80); ctx.translate(cx, cy);
    ctx.transform(Math.cos(tl.ry), Math.sin(tl.ry) * .3, -Math.sin(tl.rx) * .3, Math.cos(tl.rx), 0, 0); ctx.translate(-cx, -cy);
    const tilted = ctx.getTransform();
    ctx.save(); rr(ctx, G.x, G.y, G.w, G.h, 36); ctx.clip();
    ctx.setTransform(base); ctx.translate(0, (1 - p) * 80); ctx.fillStyle = '#F4F2EE'; ctx.fillRect(G.x - 60, G.y - 60, G.w + 120, G.h + 120);
    ctx.filter = `blur(${22 * SS * DP}px) saturate(1.6)`; saasBehind(ctx, false); ctx.filter = 'none';
    ctx.setTransform(tilted); ctx.fillStyle = 'rgba(255,255,255,.34)'; ctx.fillRect(G.x, G.y, G.w, G.h); K.grain(ctx, W, H, .08, 11);
    if (tl.gs > 0) { const g = ctx.createRadialGradient(tl.gx, tl.gy, 0, tl.gx, tl.gy, 300); g.addColorStop(0, `rgba(255,255,255,${.75 * tl.gs})`); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(G.x, G.y, G.w, G.h); }
    ctx.restore();
    const g = ctx.createLinearGradient(G.x, G.y, G.x + G.w * .6, G.y + G.h); g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(.5, 'rgba(255,255,255,.12)'); g.addColorStop(1, 'rgba(255,255,255,.55)');
    rr(ctx, G.x + 1.5, G.y + 1.5, G.w - 3, G.h - 3, 35); ctx.lineWidth = 3; ctx.strokeStyle = g; ctx.stroke();
    const rv = o.rv || 1;
    T(ctx, 'FOCUS', G.x + 40, G.y + 76, 44, { role: 'mono', c: C.muted, al: cl(rv * 2 - 1) });
    rise(ctx, '12h', G.x + 40, G.y + G.h - 64, 170, rv, { role: 'serif', w: 300, c: C.ink, ls: -4 });
    ctx.restore();
  }
  function saasFrame(ctx, t, label, sc, prog) {
    ctx.save(); ctx.strokeStyle = 'rgba(23,23,26,.16)'; ctx.lineWidth = 3; ctx.strokeRect(FR.x, FR.y, FR.w, FR.h);
    ctx.strokeStyle = 'rgba(23,23,26,.55)'; ctx.lineWidth = 3.5;
    [[FR.x, FR.y, 1, 1], [FR.x + FR.w, FR.y, -1, 1], [FR.x, FR.y + FR.h, 1, -1], [FR.x + FR.w, FR.y + FR.h, -1, -1]].forEach(([x, y, a, b]) => { ctx.beginPath(); ctx.moveTo(x - a * 26, y); ctx.lineTo(x - a * 10, y); ctx.moveTo(x, y - b * 26); ctx.lineTo(x, y - b * 10); ctx.stroke(); });
    // 右侧滚动刻度
    const rx = 1572, y0 = 130, y1 = 870; ctx.strokeStyle = 'rgba(23,23,26,.22)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(rx, y0); ctx.lineTo(rx, y1); ctx.stroke();
    for (let i = 0; i <= 2; i++) { const y = lerp(y0, y1 - 90, i / 2); ctx.beginPath(); ctx.moveTo(rx - 8, y); ctx.lineTo(rx + 8, y); ctx.stroke(); }
    const my = lerp(y0, y1 - 90, prog); ctx.strokeStyle = C.accent; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(rx, my); ctx.lineTo(rx, my + 90); ctx.stroke();
    ctx.restore();
    T(ctx, label, FR.x + 30, 988, 44, { role: 'mono', c: C.muted, al: seg(t, .3, .7) * (1 - seg(t, 9.7, 10)) });
  }
  function saasB(ctx, t, X) {
    const A_ = eo(seg(t, 0, .9)) * (1 - eio(seg(t, 9.6, 10))), dr = Math.min(t, 8.9);
    // 氛围（固定在视口后面）
    ctx.fillStyle = C.stage; ctx.fillRect(0, 0, W, H);
    radial(ctx, 380 + Math.sin(dr * .5) * 90, 330 + Math.cos(dr * .4) * 50, 720, C.paper, .95 * A_);
    radial(ctx, 1230 + Math.cos(dr * .45) * 80, 720 + Math.sin(dr * .35) * 60, 720, C.stage2, .95 * A_);
    radial(ctx, 900 + Math.sin(dr * .3) * 90, 120, 520, C.line, .55 * A_);
    radial(ctx, 900 + Math.sin(dr * .3) * 90, 150, 480, C.accent, .05 * A_);
    ctx.save(); ctx.globalAlpha = A_; vignette(ctx, W, H, .24); ctx.restore(); K.grain(ctx, W, H, .06 + .14 * A_, 3);
    // 滚动
    const sc = 880 * (eo(seg(t, 4.7, 6.3)) + eo(seg(t, 7.6, 8.8)));
    const outA = 1 - seg(t, 9.7, 10);
    const screen = (i, alpha, tt, scroll) => {
      ctx.save(); ctx.beginPath(); ctx.rect(FR.x, FR.y, FR.w, FR.h); ctx.clip(); ctx.translate(FR.x, FR.y - scroll); ctx.globalAlpha = alpha; saasContent(ctx, tt, X, i); ctx.restore();
    };
    if (t < 8.9) screen(0, 1, t, sc);
    else { screen(0, seg(t, 9.2, 9.6) * outA, 99, 0); screen(0, (1 - seg(t, 8.9, 9.2)) * outA, 99, 1760); }
    // 光标（固定在视口）
    const cur = saasCursor(t); if (cur) ghost(ctx, cur.x, cur.y, { press: cur.press, al: cur.a });
    saasFrame(ctx, t, t < 8.9 ? 'motion: full' : 'motion: reduced', 0, t < 8.9 ? sc / 1760 : 1);
  }
  // 屏幕坐标里的光标路径
  function saasCursor(t) {
    if (t >= 2.9 && t < 5.0) { const a = eio(seg(t, 2.9, 3.2)) * (1 - eio(seg(t, 4.75, 5.0))); const p1 = eio(seg(t, 3.0, 3.9)), p2 = eio(seg(t, 3.9, 4.6)), p3 = eio(seg(t, 4.6, 5.0)); let x = lerp(900, 1250, p1), y = lerp(760, 340, p1); x = lerp(x, 1180, p2); y = lerp(y, 610, p2); x = lerp(x, 1520, p3); y = lerp(y, 880, p3); return { x, y, a, press: 0 }; }
    if (t >= 5.6 && t < 7.4) { const a = eio(seg(t, 5.6, 5.9)) * (1 - eio(seg(t, 7.0, 7.3))), p = eio(seg(t, 5.7, 6.3)); return { x: lerp(1330, 1170, p), y: lerp(800, 738, p), a, press: seg(t, 6.35, 6.4) * (1 - seg(t, 6.5, 6.58)) }; }
    return null;
  }
  function saasContent(ctx, t, X, only) {
    const st = t > 50; // 静态最终态（reduced-motion 画面）
    const P = (a, d, k) => st ? 1 : eo(seg(t, a, a + d * (k || 1)));
    // ── 首屏 ──
    const h1 = P(.5, .8), h2 = P(.62, .8), sub = P(.85, .7), btn = P(1.0, .7), dot = st ? 1 : spr(t, 1.3, 2.4, .55), card = st ? 1 : eo(seg(t, 1.2, 2.3)), rvv = st ? 1 : eo(seg(t, 1.7, 2.4));
    rise(ctx, 'Calm', 110, 350, 200, h1, { role: 'serif', w: 300, c: C.ink, ls: -3 });
    rise(ctx, 'planning', 110, 560, 200, h2, { role: 'serif', w: 300, c: C.ink, ls: -3 });
    const wp = TW(ctx, 'planning', 200, { role: 'serif', w: 300, ls: -3 });
    if (dot > 0) { ctx.beginPath(); ctx.arc(110 + wp + 26, 548, 15 * dot, 0, TAU); ctx.fillStyle = C.accent; ctx.fill(); }
    T(ctx, 'For busy teams', 112, 660 + (1 - sub) * 30, 54, { role: 'sans', w: 400, c: C.muted, al: sub });
    ctx.save(); ctx.globalAlpha *= btn; const bs = lerp(.85, 1, btn); ctx.translate(112 + 100, 760 + 34); ctx.scale(bs, bs); rr(ctx, -100, -34, 200, 68, 34); ctx.fillStyle = C.accent; ctx.fill(); ctx.restore();
    // 背后的形状 + 玻璃
    ctx.save(); ctx.globalAlpha *= card; saasBehind(ctx, false); ctx.restore();
    const tl = saasTilt(t, st);
    saasGlass(ctx, { p: card, rv: rvv, tilt: tl });
    // ── 第二屏（价格）──
    const o2 = 880, r0 = st ? 1 : eo(seg(t, 5.0, 5.8)), r1 = st ? 1 : eo(seg(t, 5.15, 5.95)), r2 = st ? 1 : eo(seg(t, 5.3, 6.1)), r3 = st ? 1 : eo(seg(t, 5.45, 6.25));
    rise(ctx, 'One', 110, o2 + 340, 190, r0, { role: 'serif', w: 300, c: C.ink, ls: -3 });
    rise(ctx, 'price.', 110, o2 + 540, 190, r1, { role: 'serif', w: 300, c: C.ink, ls: -3 });
    // 价格数字：12 → 9（滚动）
    const roll = st ? 0 : eo(seg(t, 6.5, 7.1)), nx = 1000, ny = o2 + 500, npx = 340;
    ctx.save(); ctx.globalAlpha *= r2; ctx.beginPath(); ctx.rect(nx - 300, ny - npx * .95, 640, npx * 1.1); ctx.clip();
    const dy = roll * npx * .95;
    tabNum(ctx, '12', nx, ny - dy - 0 + 0, npx, { a: 'center', role: 'serif', w: 300, c: C.ink, al: 1 - roll });
    tabNum(ctx, '9', nx, ny + npx * .95 - dy, npx, { a: 'center', role: 'serif', w: 300, c: C.ink, al: roll });
    ctx.restore();
    ctx.save(); ctx.globalAlpha *= r2; T(ctx, '/mo', nx + 290, ny - 20, 44, { role: 'sans', w: 200, c: C.muted, a: 'left' }); ctx.restore();
    // 开关
    const tg = { x: 860, y: o2 + 640, w: 300, h: 76 }, k = st ? 0 : cl(spr(t, 6.4, 2.0, .55));
    ctx.save(); ctx.globalAlpha *= r3;
    rr(ctx, tg.x, tg.y, tg.w, tg.h, 38); ctx.lineWidth = 3.5; ctx.strokeStyle = rgba(C.ink, .3); ctx.stroke();
    const kx = tg.x + 8 + (E.spring(Math.max(0, t - 6.4), 2.0, .55)) * (tg.w - 16 - 60) * (st ? 0 : 1);
    ctx.beginPath(); ctx.arc(kx + 30, tg.y + tg.h / 2, 30, 0, TAU); ctx.fillStyle = C.accent; ctx.fill();
    T(ctx, 'Monthly', tg.x - 30, tg.y + tg.h / 2 + 16, 46, { role: 'sans', w: 400, c: k < .5 ? C.ink : C.muted, a: 'right' });
    T(ctx, 'Yearly', tg.x + tg.w + 30, tg.y + tg.h / 2 + 16, 46, { role: 'sans', w: 400, c: k < .5 ? C.muted : C.ink });
    ctx.restore();
    // ── 第三屏（三个数字）──
    const o3 = 1760, col = [{ v: 3.2, u: '×', d: 1 }, { v: 41, u: '%', d: 0 }, { v: 12, u: 'k', d: 0 }];
    ctx.strokeStyle = rgba(C.ink, .16); ctx.lineWidth = 3;
    [520, 960].forEach(x => { ctx.beginPath(); ctx.moveTo(x, o3 + 250); ctx.lineTo(x, o3 + 630); ctx.stroke(); });
    col.forEach((c, i) => {
      const cx = 300 + i * 440, rv = st ? 1 : eo(seg(t, 7.9 + i * .14, 8.5 + i * .14)), roll2 = st ? 1 : ec(seg(t, 7.9 + i * .14, 8.7 + i * .14)), un = st ? 1 : seg(t, 8.4 + i * .14, 8.75 + i * .14);
      const val = (c.v * roll2).toFixed(c.d), px = 250, tot = [...val].reduce((s_, ch) => s_ + (ch === '.' ? px * .28 : px * .56), 0), wu = 90, x0 = cx - (tot + wu) / 2;
      ctx.save(); ctx.globalAlpha *= rv; ctx.translate(0, (1 - rv) * 50);
      tabNum(ctx, val, x0, o3 + 480, px, { role: 'serif', w: 300, c: i === 1 ? C.ink : C.ink });
      T(ctx, c.u, x0 + tot + 8, o3 + 480, px * .34, { role: 'sans', w: 200, c: C.muted, al: un });
      ctx.restore();
    });
    ctx.beginPath(); ctx.arc(300 + 440 + 5, o3 + 560, 10, 0, TAU); ctx.fillStyle = rgba(C.accent, st ? 1 : eo(seg(t, 8.5, 8.8))); ctx.fill();
  }
  function saasTilt(t, st) {
    if (st || t < 2.9 || t > 5.6) return { rx: 0, ry: 0, gs: 0, gx: GL.x, gy: GL.y };
    const cur = saasCursor(t) || { x: 1200, y: 600 }, px = cur.x - FR.x, py = cur.y - FR.y;
    const nx = cl((px - (GL.x + GL.w / 2)) / (GL.w / 2), -1.3, 1.3), ny = cl((py - (GL.y + GL.h / 2)) / (GL.h / 2), -1.3, 1.3);
    const eng = eio(seg(t, 3.2, 3.8)), back = t > 4.6 ? (1 - E.spring(t - 4.6, 2.2, .5)) : 1, amp = eng * back;
    return { ry: nx * .22 * amp, rx: -ny * .18 * amp, gs: eng * (t < 4.6 ? 1 : cl(1 - (t - 4.6) / .5)), gx: px, gy: py };
  }
  function saasActive(t) {
    const a = [];
    if (t < 1.0) a.push('layered-atmosphere');
    if (t >= .5 && t < 2.5) a.push('orchestrated-load', 'stagger', 'expo-out', 'type-roles', 'one-accent', 'anti-slop');
    if (t >= 1.2 && t < 3.0) a.push('frosted-glass');
    if (t >= 2.9 && t < 5.0) a.push('tilt-glare');
    if (t >= 4.7 && t < 6.3) a.push('scroll-reveal', 'stagger', 'expo-out');
    if (t >= 5.6 && t < 7.4) a.push('spring-toggle', 'one-accent');
    if (t >= 6.5 && t < 7.3) a.push('counter-roll');
    if (t >= 7.6 && t < 8.9) a.push('scroll-reveal', 'stagger', 'expo-out');
    if (t >= 7.9 && t < 9.0) a.push('counter-roll');
    if (t >= 8.9) a.push('reduced-motion');
    return a;
  }
  function saasA(ctx, t, X) {
    aBg(ctx, t, '#7B61FF', '#FF5A8A'); aConfetti(ctx, t, X.conf, .7, .6);
    const sc = (t / 10) * 1760 + Math.sin(t * 3) * 14, pop = i => bounce((t - .08 * i) / .6);
    ctx.save(); ctx.beginPath(); ctx.rect(FR.x, FR.y, FR.w, FR.h); ctx.clip(); ctx.translate(FR.x, FR.y - sc);
    // 首屏
    const g = ctx.createLinearGradient(110, 0, 900, 0); g.addColorStop(0, '#FFFFFF'); g.addColorStop(1, '#FFD84D');
    ctx.save(); ctx.translate(0, (1 - pop(0)) * -200); T(ctx, 'Calm planning', 100, 360, 150, { f: fA(150, 800), c: g, sh: ['rgba(0,0,0,.3)', 20, 6] }); ctx.restore();
    T(ctx, 'for busy teams!', 100, 500, 100, { f: fA(100, 800), c: '#fff', sh: ['#FF5A5F', 40, 0], al: cl(pop(1)) });
    [['#FFB400', 110, 600], ['#00B3A4', 330, 600], ['#FF5A5F', 550, 600]].forEach(([c, x, y], i) => { const s = Math.max(0, pop(i + 2)); ctx.save(); ctx.translate(x + 90, y + 34); ctx.scale(s, s); ctx.shadowColor = c; ctx.shadowBlur = 40 * SS * DP; rr(ctx, -90, -34, 180, 68, 34); ctx.fillStyle = c; ctx.fill(); ctx.restore(); });
    ctx.save(); const gs = Math.max(0, pop(3)); ctx.translate(GL.x + GL.w / 2, GL.y + GL.h / 2 + Math.sin(t * 1.6) * 10); ctx.scale(gs, gs); ctx.translate(-GL.x - GL.w / 2, -GL.y - GL.h / 2);
    saasBehind(ctx, true); rr(ctx, GL.x, GL.y, GL.w, GL.h, 36); ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.stroke();
    T(ctx, '12h', GL.x + 40, GL.y + GL.h - 70, 200, { f: fA(200, 800), c: '#fff', sh: aShadow('rgba(0,0,0,.3)', 14, 5) }); ctx.restore();
    // 第二屏
    T(ctx, 'One price!', 100, 880 + 340, 150, { f: fA(150, 800), c: '#fff', sh: aShadow() });
    const yearly = t > 5.5;
    rr(ctx, 860, 880 + 500, 300, 76, 38); ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fill(); ctx.beginPath(); ctx.arc(yearly ? 1122 : 898, 880 + 538, 30, 0, TAU); ctx.fillStyle = '#FFD84D'; ctx.fill();
    T(ctx, yearly ? '$9' : '$12', 860, 880 + 460, 220, { f: fA(220, 800), c: '#FFD84D', sh: ['#FF5A5F', 40, 0] });
    // 第三屏
    [['3.2×', '#FF5A5F'], ['41%', '#FFB400'], ['12k', '#00B3A4']].forEach(([s, c], i) => { ctx.save(); ctx.shadowColor = c; ctx.shadowBlur = 40 * SS * DP; rr(ctx, 100 + i * 470, 1760 + 220, 420, 420, 40); ctx.fillStyle = c; ctx.fill(); ctx.restore(); T(ctx, s, 100 + i * 470 + 210, 1760 + 470, 130, { f: fA(130, 800), a: 'center', c: '#fff' }); });
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 3; ctx.strokeRect(FR.x, FR.y, FR.w, FR.h);
  }
  combo('sc-saas', { seed: 9, init: X => { X.conf = confList(X.rnd, 26); }, A: saasA, B: saasB, active: saasActive });

  /* ════════════════════════════════════════════════════════════
   * sc-luxury · 高端品牌官网 · HALDEN · 夜色舞台，慢，大量留白
   * ─────────────────────────────────────────────────────────
   *  0.0–1.6  HALDEN 用 1.4 秒慢缓动淡入上移，周围全空；下方一行 mono   restraint · slow-ease · one-idea · type-roles · anti-slop
   *  1.6–3.2  一道窄高光扫过字面                                      metal-sheen
   *  3.2–4.8  十字光标缓慢划过，三层线圈 / 字 / 前景细线错位移动           parallax-depth · custom-cursor
   *  4.9–7.0  金属圆盘叠：主光 + 边缘高光 + 一点环境反射；5.4 起拆开成三片，细线标注，左侧刻度尺同步擦洗
   *                                                      studio-light-3d · exploded-view · pinned-scrub
   *  7.0–8.4  一个细线胶囊按钮，光标靠近时按钮向光标吸 ≤14px，里面的字反向微移；光标环收缩  magnetic-btn · custom-cursor
   *  8.4–9.6  收成一张竖长线框页，五段里只有两段（首屏 / 固定段）标钴蓝 —— 动效预算   s-landing-signature
   *  9.6–10   全部淡回黑
   * A：紫粉渐变 + 金色渐变字弹跳 + 光晕/镜头光斑/粒子/旋转发光立方/发光按钮，全部叠在一屏，硬切在随机时刻。
   * ════════════════════════════════════════════════════════════ */
  function lxBg(ctx, t, a = 1) {
    ctx.fillStyle = C.night; ctx.fillRect(0, 0, W, H);
    radial(ctx, 800, 430, 760, '#ECE9E2', .07 * a); radial(ctx, 1400, 900, 700, '#000000', .5);
    vignette(ctx, W, H, .35, '#000000'); K.grain(ctx, W, H, .10, 3);
  }
  function lxFrame(ctx, t, fade) {
    ctx.save(); ctx.globalAlpha = fade; ctx.strokeStyle = 'rgba(236,233,226,.14)'; ctx.lineWidth = 3; ctx.strokeRect(FR.x, FR.y, FR.w, FR.h);
    ctx.strokeStyle = 'rgba(236,233,226,.45)'; ctx.lineWidth = 3.5;
    [[FR.x, FR.y, 1, 1], [FR.x + FR.w, FR.y, -1, 1], [FR.x, FR.y + FR.h, 1, -1], [FR.x + FR.w, FR.y + FR.h, -1, -1]].forEach(([x, y, a, b]) => { ctx.beginPath(); ctx.moveTo(x - a * 26, y); ctx.lineTo(x - a * 10, y); ctx.moveTo(x, y - b * 26); ctx.lineTo(x, y - b * 10); ctx.stroke(); });
    ctx.restore();
  }
  function metalWord(ctx, s, cx, y, px, sheen, al, dx = 0, dy = 0) {
    const ls = px * .16, w = TW(ctx, s, px, { role: 'serif', w: 300, ls }) - ls, x0 = cx - w / 2 + dx;
    const o = { role: 'serif', w: 300, ls, al };
    let g = ctx.createLinearGradient(x0, y - px, x0 + w, y); g.addColorStop(0, '#77746D'); g.addColorStop(.5, '#B9B5AA'); g.addColorStop(1, '#6F6C66');
    T(ctx, s, x0, y + dy, px, Object.assign({}, o, { c: g }));
    if (sheen > 0 && sheen < 1) {
      const c = x0 - px * .5 + (w + px) * sheen, sw = px * .55;
      g = ctx.createLinearGradient(c - sw - px * .3, y - px, c + sw + px * .3, y);
      g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,255,255,.98)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      T(ctx, s, x0, y + dy, px, Object.assign({}, o, { c: g }));
    }
    return w;
  }
  const discR = [210, 174, 210];
  function discStack(ctx, cx, cy, g, t, alpha) {
    const th = 34, ry = .32;
    ctx.save(); ctx.globalAlpha = alpha;
    for (let i = 2; i >= 0; i--) {
      const rx = discR[i], y = cy + (i - 1) * (th + 8 + g * 150), hi = .32 + .18 * Math.sin(t * .6 + i * .5);
      // 侧壁（横向金属渐变）
      const sg = ctx.createLinearGradient(cx - rx, 0, cx + rx, 0);
      sg.addColorStop(0, '#1C1D21'); sg.addColorStop(hi * .6, '#6C6E74'); sg.addColorStop(hi, '#ECE9E2'); sg.addColorStop(hi + .18, '#5A5C62'); sg.addColorStop(1, '#17181B');
      ctx.beginPath(); ctx.moveTo(cx - rx, y); ctx.lineTo(cx - rx, y + th); ctx.ellipse(cx, y + th, rx, rx * ry, 0, Math.PI, 0, true); ctx.lineTo(cx + rx, y); ctx.ellipse(cx, y, rx, rx * ry, 0, 0, Math.PI, false); ctx.closePath(); ctx.fillStyle = sg; ctx.fill();
      // 顶面（主光在左上）
      const tg = ctx.createRadialGradient(cx - rx * .35, y - rx * ry * .3, 4, cx, y, rx);
      tg.addColorStop(0, '#F4F1EA'); tg.addColorStop(.35, '#B7B4AC'); tg.addColorStop(1, '#4C4E54');
      ctx.beginPath(); ctx.ellipse(cx, y, rx, rx * ry, 0, 0, TAU); ctx.fillStyle = tg; ctx.fill();
      // 边缘高光
      const rg = ctx.createLinearGradient(cx - rx, y - rx * ry, cx + rx * .4, y + rx * ry); rg.addColorStop(0, 'rgba(255,255,255,.95)'); rg.addColorStop(.6, 'rgba(255,255,255,.1)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.beginPath(); ctx.ellipse(cx, y, rx - 1, rx * ry - 1, 0, 0, TAU); ctx.lineWidth = 3; ctx.strokeStyle = rg; ctx.stroke();
      if (i === 0) { ctx.beginPath(); ctx.ellipse(cx, y, rx - 12, rx * ry - 4, 0, .62 * Math.PI, .92 * Math.PI); ctx.lineWidth = 5; ctx.strokeStyle = rgba(C.accent, .75); ctx.stroke(); }
    }
    ctx.restore();
  }
  function luxB(ctx, t, X) {
    const fadeAll = 1 - seg(t, 9.6, 10), fr = seg(t, .3, .8) * fadeAll;
    lxBg(ctx, t);
    lxFrame(ctx, t, fr);
    const NC = { x: 800, y: 500 };
    // ── 0–4.9：HALDEN（慢入 / 高光 / 视差）
    const wIn = slow(seg(t, .2, 1.6)), wOut = slow(seg(t, 4.7, 5.3));
    if (t < 5.4) {
      const cur = luxCursor(t), nx = cur ? (cur.x - 800) / 800 : 0, ny = cur ? (cur.y - 500) / 500 : 0, pe = eio(seg(t, 3.2, 3.8)) * (1 - eio(seg(t, 4.5, 5.0)));
      const a = wIn * (1 - wOut);
      // 远层线圈
      ctx.save(); ctx.strokeStyle = C.nightLine; ctx.lineWidth = 3; ctx.globalAlpha = a;
      [220, 330, 430].forEach(r => { ctx.beginPath(); ctx.arc(NC.x - nx * 16 * pe, NC.y - ny * 8 * pe, r, 0, TAU); ctx.stroke(); }); ctx.restore();
      // 中层字
      const sheen = t >= 1.6 && t < 3.2 ? slow(seg(t, 1.6, 3.1)) : -1;
      metalWord(ctx, 'HALDEN', NC.x, NC.y + 66 + (1 - wIn) * 16, 200, sheen, a, -nx * 34 * pe, -ny * 12 * pe);
      T(ctx, 'N° 01', 800 - nx * 34 * pe, 640, 44, { role: 'mono', c: C.muted, a: 'center', ls: 6, al: slow(seg(t, 1.3, 2.1)) * (1 - wOut) });
      // 前景细线 + 钴蓝点
      ctx.save(); ctx.globalAlpha = a * pe; ctx.strokeStyle = rgba(C.nightInk, .28); ctx.lineWidth = 3;
      [[280, 330], [1320, 330]].forEach(([x], i) => { const xx = x + nx * 60 * (i ? 1 : 1); ctx.beginPath(); ctx.moveTo(xx, 200); ctx.lineTo(xx, 800); ctx.stroke(); });
      ctx.beginPath(); ctx.arc(1130 + nx * 90, 270 + ny * 40, 9, 0, TAU); ctx.fillStyle = C.accent; ctx.fill(); ctx.restore();
      if (cur) { const hov = 0; ghost(ctx, cur.x, cur.y, { c: C.nightInk, al: cur.a, r: 24 }); }
    }
    // ── 4.9–7.4：金属圆盘叠 / 拆解 / 刻度尺
    if (t >= 4.8 && t < 7.6) {
      const a = slow(seg(t, 4.8, 5.4)) * (1 - slow(seg(t, 6.9, 7.5))), g = eio(seg(t, 5.4, 6.3)) * (1 - eio(seg(t, 6.5, 7.0)));
      discStack(ctx, 800, 470, g, t, a);
      ctx.save(); ctx.globalAlpha = a * seg(t, 5.2, 5.6);
      // 左侧刻度尺（擦洗）
      ctx.strokeStyle = rgba(C.nightInk, .3); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(250, 250); ctx.lineTo(250, 750); ctx.stroke();
      for (let i = 0; i <= 5; i++) { ctx.beginPath(); ctx.moveTo(250, 250 + i * 100); ctx.lineTo(i % 5 === 0 ? 226 : 238, 250 + i * 100); ctx.stroke(); }
      ctx.beginPath(); ctx.arc(250, 750 - 500 * g, 11, 0, TAU); ctx.fillStyle = C.accent; ctx.fill(); ctx.restore();
      // 细线标注
      for (let i = 0; i < 3; i++) {
        const la = eo(seg(t, 5.9 + i * .14, 6.4 + i * .14)) * a * (1 - eio(seg(t, 6.5, 6.9))), y = 470 + (i - 1) * (42 + g * 150), x1 = 800 + discR[i] + 40, x2 = x1 + 200 * la;
        if (la <= .01) continue;
        ctx.strokeStyle = rgba(C.nightInk, .5); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
        ctx.beginPath(); ctx.arc(x2, y, 8, 0, TAU); ctx.fillStyle = i === 1 ? C.accent : rgba(C.nightInk, .7); ctx.fill();
      }
    }
    // ── 7.0–8.6：磁吸按钮
    if (t >= 6.9 && t < 8.7) {
      const a = slow(seg(t, 7.0, 7.6)) * (1 - slow(seg(t, 8.3, 8.8))), cur = luxCursor(t), bc = { x: 800, y: 500 };
      let ox = 0, oy = 0;
      if (cur) { const dx = cur.x - bc.x, dy = cur.y - bc.y, d = Math.hypot(dx, dy), R = 320, k = cl(1 - d / R); ox = dx / (d || 1) * 14 * k * k * 1.4 + (dx / R) * 6 * k; oy = dy / (d || 1) * 14 * k * k * 1.4; ox = cl(ox, -14, 14); oy = cl(oy, -14, 14); }
      ctx.save(); ctx.globalAlpha = a; ctx.translate(bc.x + ox, bc.y + oy);
      rr(ctx, -170, -50, 340, 100, 50); ctx.lineWidth = 3.5; ctx.strokeStyle = rgba(C.nightInk, .55); ctx.stroke();
      T(ctx, 'ENTER', -ox * .5, 14 - oy * .5, 40, { role: 'sans', w: 200, c: C.nightInk, a: 'center', ls: 10 });
      ctx.restore();
      if (cur) { const near = cl(1 - Math.hypot(cur.x - bc.x, cur.y - bc.y) / 240); ghost(ctx, cur.x, cur.y, { c: C.nightInk, al: cur.a * a * 1.2, r: lerp(24, 13, near), dot: lerp(4.5, 7, near), dc: near > .5 ? C.accent : C.nightInk }); }
    }
    // ── 8.4–9.7：竖长线框页 = 动效预算
    if (t >= 8.4) {
      const a = slow(seg(t, 8.4, 9.0)) * (1 - slow(seg(t, 9.5, 9.9))), X0 = 660, Y0 = 130, PW = 280, PH = 740;
      const hs = [.30, .13, .28, .12, .17], ys = [0]; hs.forEach((h, i) => ys.push(ys[i] + h));
      ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = rgba(C.nightInk, .45); ctx.lineWidth = 3.5; rr(ctx, X0, Y0, PW, PH, 10); ctx.stroke();
      ctx.lineWidth = 2.5; ctx.strokeStyle = rgba(C.nightInk, .22);
      for (let i = 1; i < 5; i++) { const y = Y0 + PH * ys[i]; ctx.beginPath(); ctx.moveTo(X0, y); ctx.lineTo(X0 + PW, y); ctx.stroke(); }
      [0, 2].forEach(i => { const y0 = Y0 + PH * ys[i], y1 = Y0 + PH * ys[i + 1], m = eo(seg(t, 8.9 + i * .15, 9.3 + i * .15)); ctx.fillStyle = C.accent; ctx.fillRect(X0 - 4, y0 + 8, 8, (y1 - y0 - 16) * m); ctx.beginPath(); ctx.arc(X0 + PW - 26, y0 + 30, 8 * m, 0, TAU); ctx.fill(); });
      // 自动滚动的视口窗
      const vy = lerp(Y0 + 6, Y0 + PH * .62, slow(seg(t, 8.6, 9.5))); ctx.strokeStyle = rgba(C.nightInk, .7); ctx.lineWidth = 3; rr(ctx, X0 + 10, vy, PW - 20, PH * .34, 6); ctx.stroke();
      ctx.restore();
      T(ctx, 'budget 2 / 5', 1000, 500, 44, { role: 'mono', c: C.muted, ls: 2, al: a * seg(t, 9.0, 9.4) });
    }
  }
  function luxCursor(t) {
    if (t >= 3.2 && t < 5.0) { const a = eio(seg(t, 3.2, 3.6)) * (1 - eio(seg(t, 4.6, 5.0))), p = slow(seg(t, 3.2, 4.9)); return { x: lerp(380, 1180, p), y: 560 + 150 * Math.sin(p * Math.PI * 1.1) - 220 * p, a }; }
    if (t >= 7.1 && t < 8.6) { const a = eio(seg(t, 7.1, 7.5)) * (1 - eio(seg(t, 8.3, 8.6))); const p = slow(seg(t, 7.1, 7.9)), q = slow(seg(t, 8.0, 8.5)); let x = lerp(1240, 900, p), y = lerp(780, 560, p); x = lerp(x, 1180, q); y = lerp(y, 780, q); return { x, y, a }; }
    return null;
  }
  function luxActive(t) {
    const a = [];
    if (t < 1.7) a.push('restraint', 'slow-ease', 'one-idea', 'type-roles', 'anti-slop');
    if (t >= 1.6 && t < 3.3) a.push('metal-sheen');
    if (t >= 3.2 && t < 4.9) a.push('parallax-depth', 'custom-cursor');
    if (t >= 4.9 && t < 7.0) a.push('studio-light-3d');
    if (t >= 5.4 && t < 7.0) a.push('exploded-view', 'pinned-scrub');
    if (t >= 7.1 && t < 8.6) a.push('magnetic-btn', 'custom-cursor');
    if (t >= 8.4 && t < 9.7) a.push('s-landing-signature');
    return a;
  }
  function luxA(ctx, t, X) {
    const cuts = [0, 2.6, 5.1, 7.3], si = t >= 7.3 ? 3 : t >= 5.1 ? 2 : t >= 2.6 ? 1 : 0, lt = t - cuts[si];
    aBg(ctx, t, '#7B61FF', '#FF5A8A'); aConfetti(ctx, t, X.conf, 1);
    radial(ctx, 1250 + Math.sin(t * 2) * 60, 250, 300, '#FFFFFF', .5); aStar(ctx, 1250 + Math.sin(t * 2) * 60, 250, 90, '#FFF6C8', t);
    const g = ctx.createLinearGradient(300, 0, 1300, 0); g.addColorStop(0, '#FFD84D'); g.addColorStop(.5, '#FFF3B0'); g.addColorStop(1, '#FF9F1C');
    if (si === 0 || si === 1) {
      const p = bounce(lt / .9); ctx.save(); ctx.translate(W / 2, 480); ctx.scale(.5 + .5 * p, .5 + .5 * p); ctx.rotate((1 - p) * .3);
      T(ctx, 'HALDEN', 0, 60, 230, { f: fA(230, 800), a: 'center', c: g, sh: ['#FF5A5F', 60, 0] }); ctx.restore();
      T(ctx, 'LUXURY  EXPERIENCE  ✦', W / 2, 640, 56, { f: fA(56, 700), a: 'center', c: '#fff', al: cl(lt / .4), sh: aShadow('rgba(0,0,0,.4)', 12, 4) });
    } else if (si === 2) {
      ctx.save(); ctx.translate(W / 2, 500); ctx.rotate(t * .8); ctx.shadowColor = '#FFD84D'; ctx.shadowBlur = 80 * SS * DP;
      [0, 1, 2].forEach(i => { ctx.rotate(1.05); rr(ctx, -150, -150, 300, 300, 40); ctx.fillStyle = APAL[i]; ctx.globalAlpha = .85; ctx.fill(); }); ctx.restore();
      aBurst(ctx, lt, X.burst, W / 2, 500);
      T(ctx, 'Explore!', W / 2, 890, 120, { f: fA(120, 800), a: 'center', c: '#fff', sh: ['#FF5A5F', 40, 0] });
    } else {
      const p = 1 + Math.sin(t * 6) * .04; ctx.save(); ctx.translate(W / 2, 500); ctx.scale(p, p);
      ctx.shadowColor = '#FF5A5F'; ctx.shadowBlur = 80 * SS * DP; const gg = ctx.createLinearGradient(-260, 0, 260, 0); gg.addColorStop(0, '#7B61FF'); gg.addColorStop(1, '#FF5A5F'); rr(ctx, -300, -80, 600, 160, 80); ctx.fillStyle = gg; ctx.fill(); ctx.shadowColor = 'transparent';
      T(ctx, 'Shop now →', 0, 22, 66, { f: fA(66, 800), a: 'center', c: '#fff' }); ctx.restore();
      aRings(ctx, t, W / 2, 500, '#FFFFFF');
    }
  }
  combo('sc-luxury', { seed: 13, init: X => { X.conf = confList(X.rnd, 34); X.burst = burstList(X.rnd, 40); }, A: luxA, B: luxB, active: luxActive });

  /* ════════════════════════════════════════════════════════════
   * sc-explainer · 原理讲解 · 两条正弦细线相消成一条直线 · 旧课本式印刷质感
   * ─────────────────────────────────────────────────────────
   *  0.0–0.9  黑边 + 时间码，四格分镜框收成四段时间线；网点与纸纹“印”上来        fixed-stage · seek-t · storyboard-first · print-texture
   *  0.1–2.5  ① 提问：细线衬线气质的问号（高≈舞台 40%，居中）0.1–1.3 一笔画出，1.4 钴蓝点弹出，完整停留到 2.5；2.5–3.0 淡出、点飞向笔头起点   s-mechanism
   *  3.0–4.6  ② 模型：钴蓝点落到左端变成笔头；A（墨）与反相 A（钴蓝）依次画出，第三行是相消后的直线，镜头跟着笔头往右
   *                                                 stagger · expo-out · follow-cam
   *  4.4–5.1  镜头一路推向那条直线，右上角标签 ×1 → ×3.4                     push-in-journey
   *  5.2–7.6  ③ 公式：A + (−A) = 0，五个记号错峰飞入，衬线 + 无衬线 + mono          type-roles · stagger · expo-out
   *  7.6–9.4  ④ 结论：那条直线长成钴蓝块，−40 dB 滚动计数，单位最后出现            counter-roll
   *  9.4–10   块塌回细线、淡回空白纸面
   * A：同内容，紫粉渐变、彩色波形、光晕、弹跳飞入、数字直接是终值。
   * ════════════════════════════════════════════════════════════ */
  let HT = null;
  function waveY(x, row) { const w = 110 * Math.sin(x / 360 * TAU); return row === 0 ? 225 + w : row === 1 ? 450 - w : 675; }
  function expStage(ctx, t) {
    stage(ctx, { bg: '#E6E0D2', grain: .24, rings: false });
    // 网点（印刷）：右下角渐变网点场（离屏缓存，只画一次）
    if (!HT) {
      HT = document.createElement('canvas'); HT.width = 800; HT.height = 450; const g = HT.getContext('2d'); g.fillStyle = 'rgba(23,23,26,.13)';
      for (let y = 7; y < 450; y += 14) for (let x = 7 + ((y / 14) % 2) * 7; x < 800; x += 14) { const k = cl((x / 800) * .6 + (y / 450) * .5 - .55) / .55; if (k <= 0) continue; g.beginPath(); g.arc(x, y, .25 + 2.75 * Math.pow(k, 1.3), 0, TAU); g.fill(); }
    }
    ctx.save(); ctx.globalAlpha = eo(seg(t, .3, 1.0)); ctx.drawImage(HT, 0, 0, 1600, 900); ctx.restore();
  }
  function expPen(ctx, x, y, r, col) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = col; ctx.fill(); }
  function expQ(ctx, p) { // 细线衬线气质的问号：高 ≈ 舞台 40%，居中；笔画两遍错位 = 粗细对比，起笔有球形端点
    const cx = 800, top = 270, R = 104, cy = top + R, k = .7071;
    const path = () => { ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI, Math.PI * 2.25); ctx.bezierCurveTo(cx + k * R - k * 62, cy + k * R + k * 62, cx, cy + 124, cx, cy + 172); ctx.lineTo(cx, cy + 197); };
    ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = C.ink; ctx.lineWidth = 8; ctx.setLineDash([600 * p, 4000]);
    path(); ctx.stroke(); ctx.translate(9, 0); path(); ctx.stroke(); ctx.restore();
    if (p > .02) { ctx.beginPath(); ctx.arc(cx - R, cy, 15 * cl(p * 8), 0, TAU); ctx.fillStyle = C.ink; ctx.fill(); }
  }
  function explainerStage(ctx, t) {
    expStage(ctx, t);
    // ① 问号：0.1–1.3 一笔画出 → 1.4 钴蓝点弹出 → 1.4–2.5 完整停留 → 2.5–3.0 淡出，点飞向笔头起点
    if (t < 3.1) {
      const p = ec(seg(t, .1, 1.3)), out = eio(seg(t, 2.5, 2.9)), dx = spr(t, 1.4, 2.4, .55);
      ctx.save(); ctx.globalAlpha = 1 - out; expQ(ctx, p); ctx.restore();
      const sx = 800, sy = 612, ex = 250, ey = 225, q = eio(seg(t, 2.5, 3.0));
      if (t >= 1.4) expPen(ctx, lerp(sx, ex, q), lerp(sy, ey, q) - Math.sin(q * Math.PI) * 110, lerp(18, 9, q) * Math.min(1.12, dx), C.accent);
    }
    // ② 模型（世界坐标，镜头跟随）
    if (t >= 2.9 && t < 5.4) {
      const prog = trav(seg(t, 3.0, 4.6)), hx = 250 + 1800 * prog, camx = clamp2(hx - 1000, 0, 900);
      const pz = eio(seg(t, 4.55, 5.1)), sc = 1 + 2.4 * pz, out = eio(seg(t, 5.05, 5.3));
      ctx.save(); ctx.globalAlpha = 1 - out; ctx.translate(800, 450); ctx.scale(sc, sc);
      ctx.translate(-lerp(camx + 800, 1600, pz), -lerp(450, 675, pz));
      const lags = [0, 140, 300], starts = [3.0, 3.3, 3.6];
      // 符号 + =
      T(ctx, '+', 130, 377, 110, { role: 'serif', w: 300, c: C.muted, a: 'center', al: eo(seg(t, 3.3, 3.8)) });
      T(ctx, '=', 130, 602, 110, { role: 'serif', w: 300, c: C.muted, a: 'center', al: eo(seg(t, 3.6, 4.1)) });
      for (let r = 0; r < 3; r++) {
        const head = 250 + (hx - 250) - lags[r], apr = seg(t, starts[r], starts[r] + .4);
        if (head <= 250 || apr <= 0) continue;
        ctx.save(); ctx.lineWidth = 6 / Math.max(1, sc * .55); ctx.lineJoin = 'round';
        if (r === 1) { ctx.globalCompositeOperation = 'multiply'; ctx.translate(3, 2); }
        ctx.strokeStyle = r === 1 ? C.accent : C.ink; ctx.beginPath();
        if (r === 2) { ctx.moveTo(250, 675); ctx.lineTo(head, 675); }
        else for (let x = 250; x <= head; x += 6) { const y = waveY(x, r); x === 250 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
        ctx.stroke(); ctx.restore();
        expPen(ctx, head, waveY(head, r), r === 2 ? 11 : 9, r === 0 ? C.accent : r === 1 ? C.ink : C.accent);
      }
      ctx.restore();
    }
    // ③ 公式
    if (t >= 5.2 && t < 7.9) {
      const toks = [['A', C.ink], ['+', C.muted], ['(−A)', C.accent], ['=', C.muted], ['0', C.ink]], px = 250, gap = 44;
      const ws = toks.map(k => TW(ctx, k[0], px, { role: 'serif', w: 300 })), tot = ws.reduce((a, b) => a + b, 0) + gap * 4; let x = 800 - tot / 2;
      const out = eio(seg(t, 7.4, 7.7));
      toks.forEach((k, i) => {
        const p = eo(seg(t, 5.3 + i * .2, 5.9 + i * .2)), dir = i % 2 ? 1 : -1;
        if (p > 0) { ctx.save(); ctx.globalAlpha = p * (1 - out); if (i === 2) ctx.globalCompositeOperation = 'multiply'; T(ctx, k[0], x + (1 - p) * 90 * dir, 500, px, { role: 'serif', w: 300, c: k[1] }); ctx.restore(); }
        x += ws[i] + gap;
      });
      T(ctx, 'Destructive interference', 800, 640, 54, { role: 'sans', w: 400, c: C.muted, a: 'center', al: eo(seg(t, 6.5, 7.1)) * (1 - out) });
    }
    // ④ 结论：直线长成钴蓝块
    if (t >= 7.6) {
      const g = eo(seg(t, 7.6, 8.3)), col = 1 - eio(seg(t, 9.3, 9.8)), bh = lerp(4, 240, g) * lerp(.02, 1, col) + 4 * (1 - col), bw = 470;
      if (col > 0.01) {
        const a = col; ctx.save(); ctx.globalAlpha = Math.max(a, .001);
        rr(ctx, 800 - bw / 2, 450 - bh / 2, bw, Math.max(4, bh), Math.min(26, bh / 2)); ctx.fillStyle = C.accent; ctx.fill();
        const roll = ec(seg(t, 8.0, 9.0)), val = Math.round(40 * roll), un = seg(t, 8.9, 9.25);
        const txt = '−' + val; ctx.beginPath(); ctx.rect(800 - bw / 2, 450 - bh / 2, bw, Math.max(4, bh)); ctx.clip();
        const wN = tabW(ctx, txt, 150), wU = 80, x0 = 800 - (wN + wU) / 2;
        tabNum(ctx, txt, x0, 450 + 50, 150, { role: 'sans', w: 800, c: '#fff', al: cl((g - .5) * 2) });
        T(ctx, 'dB', x0 + wN + 12, 450 + 50, 66, { role: 'sans', w: 200, c: '#fff', al: un });
        ctx.restore();
      }
    }
  }
  function trav(p) { return .5 * p + .5 * ec(p); }
  function clamp2(x, a, b) { return x < a ? a : x > b ? b : x; }
  function tabW(ctx, str, px) { return [...str].reduce((s, c) => s + (c === '.' ? px * .28 : c === '−' ? px * .5 : px * .56), 0); }
  function explainerTicks(ctx, t, fade) {
    const x0 = 128, w = 1344, y = 930, sw = w / 4;
    ctx.save(); ctx.globalAlpha = fade;
    const sb = 1 - eio(seg(t, .75, 1.0));
    if (sb > .01) for (let i = 0; i < 4; i++) { const a = eo(seg(t, .2 + i * .1, .5 + i * .1)) * sb, bh = 60 * a; if (bh < 1) continue; ctx.strokeStyle = rgba(C.nightInk, .5 * a); ctx.lineWidth = 3; ctx.strokeRect(x0 + i * sw + 6, y - bh / 2, sw - 12, bh); }
    ctx.lineWidth = 4; ctx.strokeStyle = rgba(C.nightInk, .26); ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + w, y); ctx.stroke();
    ctx.strokeStyle = rgba(C.nightInk, .85); ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + w * t / 10, y); ctx.stroke();
    for (let i = 0; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(x0 + i * sw, y - 20); ctx.lineTo(x0 + i * sw, y + 10); ctx.lineWidth = 3.5; ctx.strokeStyle = rgba(C.nightInk, .5); ctx.stroke(); }
    ctx.beginPath(); ctx.arc(x0 + w * t / 10, y, 9, 0, TAU); ctx.fillStyle = C.accent; ctx.fill();
    ctx.restore();
  }
  function explainerB(ctx, t) {
    const lab = t < 3.0 ? 'Q.01' : t < 4.55 ? 'A + B' : t < 5.2 ? '×' + (1 + 2.4 * eio(seg(t, 4.55, 5.1))).toFixed(1) : t < 7.6 ? 'Δφ = π' : 'Δ = 0';
    letterbox(ctx, t, { right: lab, ticks: explainerTicks }, c => explainerStage(c, t));
  }
  function explainerActive(t) {
    const a = [];
    if (t < 1.0) a.push('fixed-stage', 'seek-t', 'storyboard-first', 'print-texture');
    if (t >= .1 && t < 9.4) a.push('s-mechanism');
    if (t >= 3.0 && t < 4.6) a.push('stagger', 'expo-out', 'follow-cam');
    if (t >= 4.55 && t < 5.2) a.push('push-in-journey');
    if (t >= 5.2 && t < 7.6) a.push('type-roles', 'stagger', 'expo-out');
    if (t >= 7.8 && t < 9.4) a.push('counter-roll');
    return a;
  }
  function explainerA(ctx, t, X) {
    const cuts = [0, 2.4, 5.0, 7.5], si = t >= 7.5 ? 3 : t >= 5.0 ? 2 : t >= 2.4 ? 1 : 0, lt = t - cuts[si];
    aBg(ctx, t, '#7B61FF', '#C04CFF'); aConfetti(ctx, t, X.conf, .8);
    if (si === 0) { const p = bounce(lt / .9); ctx.save(); ctx.translate(W / 2, 480); ctx.scale(p, p); ctx.rotate(Math.sin(t * 3) * .08); T(ctx, '?', 0, 200, 620, { f: fA(620, 800), a: 'center', c: '#FFD84D', sh: ['#FF5A5F', 60, 0] }); ctx.restore(); }
    else if (si === 1) {
      const p = lt / 2.6; [[0, '#FFD84D', 300], [1, '#00E0C6', 500], [2, '#FF5A5F', 700]].forEach(([r, c, y]) => { ctx.save(); ctx.shadowColor = c; ctx.shadowBlur = 30 * SS * DP; ctx.lineWidth = 12; ctx.strokeStyle = c; ctx.beginPath(); const hx = 100 + 1400 * p; for (let x = 100; x <= hx; x += 8) { const yy = r === 2 ? y + Math.sin(x / 40 + t * 8) * 6 : y + (r ? -1 : 1) * 110 * Math.sin(x / 360 * TAU); x === 100 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); } ctx.stroke(); ctx.restore(); });
    } else if (si === 2) {
      ['A', '+', '(−A)', '=', '0'].forEach((s, i) => { const p = bounce((lt - i * .06) / .7); ctx.save(); ctx.translate(180 + i * 290, 500 - (1 - p) * 300); ctx.rotate((1 - p) * .6); T(ctx, s, 0, 0, 200, { f: fA(200, 800), c: APAL[i % 4], sh: aShadow('rgba(0,0,0,.35)', 14, 5) }); ctx.restore(); });
    } else {
      const p = bounce(lt / .8); ctx.save(); ctx.translate(W / 2, 480); ctx.scale(p, p); ctx.shadowColor = '#FFD84D'; ctx.shadowBlur = 80 * SS * DP;
      T(ctx, '−40 dB', 0, 90, 300, { f: fA(300, 800), a: 'center', c: '#FFD84D' }); ctx.restore(); aRings(ctx, t, W / 2, 500, '#FFFFFF');
    }
  }
  combo('sc-explainer', { seed: 21, init: X => { X.conf = confList(X.rnd, 26); }, A: explainerA, B: explainerB, active: explainerActive });

  /* ════════════════════════════════════════════════════════════
   * sc-data · 数据汇报 · 三个数字 + 一条细折线 · 五幕
   * ─────────────────────────────────────────────────────────
   *  0.0–0.6  黑边 + 时间码；下方五格刻度 = 五幕                              fixed-stage · seek-t · s-five-scene
   *  0.3–2.0  ① 痛点：−18% 从 0 滚出来，灰色细线向下走                        counter-roll · expo-out · type-roles
   *  2.0–4.0  ② 方案：细线掉头向上，钴蓝点做笔头，镜头跟着往右                  follow-cam · one-accent
   *  4.0–6.0  ③ 三步：4.2× / −41% / 12k 硬切，每次 1.06→1.0 推进，5.0 后停 1 秒   push-cut · type-roles
   *  6.0–8.0  ④ 证据：一条折线 + 三个数字错峰滚动，终点是钴蓝环                 stagger · counter-roll · expo-out
   *  8.0–9.5  ⑤ 落版：终点的钴蓝点长成钴蓝块，4.2× 滚出；9.5 淡回空白             one-accent · counter-roll
   *  全程：无阴影、无渐变、无弹跳，灰墨 + 一个钴蓝 —— anti-slop
   * A：同内容，彩虹柱状图、渐变数字、光晕、弹跳、彩纸。
   * ════════════════════════════════════════════════════════════ */
  function series(n, f) { const a = []; for (let i = 0; i < n; i++) a.push(f(i / (n - 1), i)); return a; }
  const DN = { pain: series(12, (u, i) => .12 + .78 * Math.pow(u, 1.1) + .035 * Math.sin(i * 2.1)), up: series(26, (u, i) => .95 - .8 * Math.pow(u, 1.15) + .04 * Math.sin(i * 1.7)), evi: series(12, (u, i) => .9 - .78 * Math.pow(u, 1.2) + .03 * Math.sin(i * 2.3)) };
  function polyDraw(ctx, arr, x0, x1, y0, y1, p, o = {}) { // arr 值 0..1（0 = 顶部 y0，1 = 底部 y1）
    const n = arr.length - 1, f = p * n; let hx = x0, hy = lerp(y0, y1, arr[0]);
    ctx.save(); ctx.lineWidth = o.lw || 5; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = o.c || C.ink; ctx.beginPath(); ctx.moveTo(hx, hy);
    for (let i = 1; i <= n; i++) { const k = Math.min(1, Math.max(0, f - (i - 1))); if (k <= 0) break; const ax = lerp(x0, x1, (i - 1) / n), ay = lerp(y0, y1, arr[i - 1]), bx = lerp(x0, x1, i / n), by = lerp(y0, y1, arr[i]); hx = lerp(ax, bx, k); hy = lerp(ay, by, k); ctx.lineTo(hx, hy); }
    ctx.stroke(); ctx.restore(); return { x: hx, y: hy };
  }
  function dataStage(ctx, t) {
    stage(ctx, { ruler: false });
    const S = t < 2.0 ? 0 : t < 4.0 ? 1 : t < 6.0 ? 2 : t < 8.0 ? 3 : 4, u = t - [0, 2, 4, 6, 8][S];
    if (S === 0) {
      const ap = eo(seg(t, .3, 1.0)), out = eio(seg(t, 1.75, 2.0));
      ctx.save(); ctx.globalAlpha = 1 - out; ctx.translate(-out * 80, 0);
      const roll = ec(seg(t, .4, 1.5)), val = '−' + Math.round(18 * roll), px = 360;
      tabNum(ctx, val, 170, 470, px, { role: 'serif', w: 300, c: C.ink, al: ap });
      T(ctx, '%', 170 + tabW(ctx, val, px) + 16, 470, px * .34, { role: 'sans', w: 200, c: C.muted, al: seg(t, 1.2, 1.5) });
      polyDraw(ctx, DN.pain, 170, 1430, 560, 800, eo(seg(t, .5, 1.6)), { c: C.muted, lw: 5 });
      ctx.restore();
    } else if (S === 1) {
      const p = trav(seg(t, 2.1, 3.7)), out = eio(seg(t, 3.75, 4.0)), hxw = 150 + 2450 * p, camx = clamp2(hxw - 1000, 0, 1000), sc = 1 + .1 * eio(seg(t, 2.1, 3.7));
      ctx.save(); ctx.globalAlpha = 1 - out; ctx.translate(-out * 80, 0); ctx.translate(800, 450); ctx.scale(sc, sc); ctx.translate(-800, -450); ctx.translate(-camx, 0);
      ctx.strokeStyle = C.line; ctx.lineWidth = 3; [300, 600].forEach(y => { ctx.beginPath(); ctx.moveTo(-200, y); ctx.lineTo(2900, y); ctx.stroke(); });
      const h = polyDraw(ctx, DN.up, 150, 2600, 250, 700, p, { c: C.ink, lw: 6 });
      ctx.beginPath(); ctx.arc(h.x, h.y, 26 * spr(t, 2.1, 2.4, .6), 0, TAU); ctx.lineWidth = 4; ctx.strokeStyle = rgba(C.accent, .5); ctx.stroke();
      ctx.beginPath(); ctx.arc(h.x, h.y, 14, 0, TAU); ctx.fillStyle = C.accent; ctx.fill();
      ctx.restore();
    } else if (S === 2) {
      const cuts = [[4.0, '4.2', '×'], [4.5, '−41', '%'], [5.0, '12', 'k']], i = t >= 5 ? 2 : t >= 4.5 ? 1 : 0, c = cuts[i], s = 1 + .06 * (1 - eo((t - c[0]) / .3)), px = 420;
      const wN = tabW(ctx, c[1], px), wU = 130, x0 = 800 - (wN + wU) / 2;
      ctx.save(); ctx.translate(800, 450); ctx.scale(s, s); ctx.translate(-800, -450);
      tabNum(ctx, c[1], x0, 570, px, { role: 'serif', w: 300, c: C.ink });
      T(ctx, c[2], x0 + wN + 14, 570, px * .34, { role: 'sans', w: 200, c: C.muted });
      ctx.restore();
      for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(760 + k * 40, 730, k === i ? 9 : 6, 0, TAU); ctx.fillStyle = k === i ? C.accent : C.line; ctx.fill(); }
    } else if (S === 3) {
      const out = eio(seg(t, 7.75, 8.0)), pd = eo(seg(t, 6.05, 6.9));
      ctx.save(); ctx.globalAlpha = S === 3 ? 1 : 0; ctx.strokeStyle = C.line; ctx.lineWidth = 3; [200, 380, 560].forEach(y => { ctx.beginPath(); ctx.moveTo(170, y); ctx.lineTo(1430, y); ctx.stroke(); });
      const h = polyDraw(ctx, DN.evi, 170, 1430, 200, 560, pd, { c: C.ink, lw: 6 });
      if (pd > .98) { const r = spr(t, 6.9, 2.4, .6); ctx.beginPath(); ctx.arc(h.x, h.y, 30 * r, 0, TAU); ctx.lineWidth = 4; ctx.strokeStyle = C.accent; ctx.stroke(); ctx.beginPath(); ctx.arc(h.x, h.y, 13, 0, TAU); ctx.fillStyle = C.accent; ctx.fill(); }
      const stats = [['4.2', '×', 4.2, 1], ['41', '%', 41, 0], ['12', 'k', 12, 0]];
      stats.forEach((s, i) => {
        const rv = eo(seg(t, 6.6 + i * .14, 7.2 + i * .14)), roll = ec(seg(t, 6.7 + i * .14, 7.6 + i * .14)), val = (s[2] * roll).toFixed(s[3]), px = 130, cx = 320 + i * 480, tot = tabW(ctx, val, px), x0 = cx - (tot + 50) / 2;
        ctx.save(); ctx.globalAlpha = rv; ctx.translate(0, (1 - rv) * 30);
        tabNum(ctx, val, x0, 770, px, { role: 'serif', w: 300, c: C.ink }); T(ctx, s[1], x0 + tot + 6, 770, px * .34, { role: 'sans', w: 200, c: C.muted, al: seg(t, 7.3, 7.6) }); ctx.restore();
      });
      ctx.restore();
      if (out > 0) { ctx.fillStyle = rgba(C.stage, out); ctx.fillRect(0, 0, 1600, 900); }
    } else {
      const g = spr(t, 8.0, 1.7, .74), bw = 470, bh = 240, ex = 1430, ey = 200 + 360 * DN.evi[11];
      const rx = lerp(ex - 13, 800 - bw / 2, g), ry = lerp(ey - 13, 450 - bh / 2, g), rw = lerp(26, bw, g), rh = lerp(26, bh, g), fo = 1 - eio(seg(t, 9.4, 9.9));
      ctx.save(); ctx.globalAlpha = fo; rr(ctx, rx, ry, Math.max(2, rw), Math.max(2, rh), lerp(13, 26, cl(g))); ctx.fillStyle = C.accent; ctx.fill();
      const roll = ec(seg(t, 8.5, 9.4)), val = (4.2 * roll).toFixed(1), px = 150, tot = tabW(ctx, val, px), x0 = 800 - (tot + 80) / 2;
      tabNum(ctx, val, x0, 450 + 52, px, { role: 'sans', w: 800, c: '#fff', al: seg(t, 8.4, 8.8) }); T(ctx, '×', x0 + tot + 8, 450 + 52, 70, { role: 'sans', w: 200, c: '#fff', al: seg(t, 9.0, 9.3) });
      ctx.restore();
    }
  }
  function dataTicks(ctx, t, fade) {
    const x0 = 128, w = 1344, y = 930, sw = w / 5, S = t < 2 ? 0 : t < 4 ? 1 : t < 6 ? 2 : t < 8 ? 3 : 4;
    ctx.save(); ctx.globalAlpha = fade;
    ctx.lineWidth = 4; ctx.strokeStyle = rgba(C.nightInk, .26); ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + w, y); ctx.stroke();
    ctx.strokeStyle = rgba(C.nightInk, .85); ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + w * t / 10, y); ctx.stroke();
    for (let i = 0; i <= 5; i++) { ctx.beginPath(); ctx.moveTo(x0 + i * sw, y - 22); ctx.lineTo(x0 + i * sw, y + 10); ctx.lineWidth = 3.5; ctx.strokeStyle = rgba(C.nightInk, .5); ctx.stroke(); }
    ctx.fillStyle = C.accent; ctx.fillRect(x0 + S * sw + 6, y - 6, sw - 12, 12);
    ctx.beginPath(); ctx.arc(x0 + w * t / 10, y, 9, 0, TAU); ctx.fillStyle = C.nightInk; ctx.fill();
    ctx.restore();
  }
  function dataB(ctx, t) {
    const S = t < 2 ? 0 : t < 4 ? 1 : t < 6 ? 2 : t < 8 ? 3 : 4;
    letterbox(ctx, t, { right: ['pain', 'fix', 'result', 'proof', 'close'][S], ticks: dataTicks }, c => dataStage(c, t));
  }
  function dataActive(t) {
    const a = [];
    if (t < .9) a.push('fixed-stage', 'seek-t');
    if (t >= .3 && t < 9.5) a.push('s-five-scene');
    if (t >= .3 && t < 1.8) a.push('counter-roll', 'expo-out', 'type-roles');
    if (t >= 2.0 && t < 3.9) a.push('follow-cam', 'one-accent', 'expo-out');
    if (t >= 4.0 && t < 6.0) a.push('push-cut', 'type-roles');
    if (t >= 6.0 && t < 7.8) a.push('stagger', 'counter-roll', 'expo-out', 'one-accent');
    if (t >= 8.0 && t < 9.5) a.push('one-accent', 'counter-roll');
    return a;
  }
  function dataA(ctx, t, X) {
    const cuts = [0, 2.3, 4.4, 6.3, 8.2], si = t >= 8.2 ? 4 : t >= 6.3 ? 3 : t >= 4.4 ? 2 : t >= 2.3 ? 1 : 0, lt = t - cuts[si];
    aBg(ctx, t, '#7B61FF', '#C04CFF'); aConfetti(ctx, t, X.conf, .8);
    if (si === 0) { const p = bounce(lt / .9); T(ctx, '−18%', W / 2, 520 + (1 - p) * -300, 320, { f: fA(320, 800), a: 'center', c: '#fff', sh: ['#FF5A5F', 60, 0] }); }
    else if (si === 1) { ctx.save(); ctx.shadowColor = '#00E0C6'; ctx.shadowBlur = 40 * SS * DP; ctx.lineWidth = 14; const g = ctx.createLinearGradient(100, 0, 1500, 0); g.addColorStop(0, '#FFD84D'); g.addColorStop(1, '#00E0C6'); ctx.strokeStyle = g; ctx.beginPath(); DN.up.forEach((v, i) => { const x = 100 + 1400 * i / 25, y = 250 + 550 * (1 - (1 - v)); i ? ctx.lineTo(x, 250 + 550 * v) : ctx.moveTo(x, 250 + 550 * v); }); ctx.stroke(); ctx.restore(); }
    else if (si === 2) { [['4.2×', '#FFD84D'], ['−41%', '#00E0C6'], ['12k', '#FF5A5F']].forEach((c, i) => { const p = bounce((lt - i * .08) / .7); ctx.save(); ctx.shadowColor = c[1]; ctx.shadowBlur = 40 * SS * DP; T(ctx, c[0], 300 + i * 500, 420 + (1 - p) * 500, 190, { f: fA(190, 800), a: 'center', c: c[1] }); ctx.restore(); }); aBurst(ctx, lt, X.burst, W / 2, 500); }
    else if (si === 3) { for (let i = 0; i < 8; i++) { const p = bounce((lt - i * .05) / .7), h = 500 * (.3 + .7 * DN.up[24 - i * 3 < 0 ? 0 : 24 - i * 3] * .9) * 1; ctx.save(); ctx.shadowColor = APAL[i % 4]; ctx.shadowBlur = 30 * SS * DP; rr(ctx, 150 + i * 170, 800 - h * p, 120, h * p, 20); ctx.fillStyle = APAL[i % 4]; ctx.fill(); ctx.restore(); } T(ctx, '12k', W / 2, 220, 160, { f: fA(160, 800), a: 'center', c: '#fff', sh: aShadow() }); }
    else { const p = bounce(lt / .9); ctx.save(); ctx.translate(W / 2, 480); ctx.scale(p, p); ctx.shadowColor = '#FFD84D'; ctx.shadowBlur = 80 * SS * DP; rr(ctx, -420, -220, 840, 440, 60); ctx.fillStyle = '#FF5A5F'; ctx.fill(); ctx.shadowColor = 'transparent'; T(ctx, '4.2×', 0, 70, 280, { f: fA(280, 800), a: 'center', c: '#fff' }); ctx.restore(); aRings(ctx, t, W / 2, 480, '#FFFFFF'); }
  }
  combo('sc-data', { seed: 33, init: X => { X.conf = confList(X.rnd, 26); X.burst = burstList(X.rnd, 40); }, A: dataA, B: dataB, active: dataActive });
})();
