/* 动效词典 v3 — E2 组合演示：sc-vertical / sc-opener / sc-immersive / sc-longread / sc-uimotion
 * 视觉语法 = 页面顶部「滚动解剖」小片：黑色 letterbox + 纸色/夜色舞台 + 细线圆环 + 大号拉丁字 + 一个钴蓝点
 *   + 底部 mono 时间码 / 进度线 / 节拍刻度。A 模式 = 只写内容（默认 AI 审美，无 letterbox）。
 * 逻辑画布 400×250（按 w/400 缩放）；一个循环 10 秒，首尾无缝；mode(m) 从 t=0 重播。
 * active(t, mode) 返回当前画面正在体现的词 id（mode 0 → []）。
 *
 * ── sc-vertical（120 BPM，1 拍 0.5s）─────────────────────────────
 *  0.2–1.0  16:9 细线框收成 9:16 细线框（残影虚线留在原位）                 → aspect-ratios
 *  1.0–2.5  Hook / in 细字，2s 极粗大字，逐词落拍；安全区虚线亮起             → word-on-beat, type-extremes, safe-zone(1–3)
 *  2.5–3.0  带拖影甩镜切到下一镜                                             → whip-pan
 *  3.0–4.5  BEAT 成地面，THE 竖排成柱，drops 落在柱顶                       → kinetic-type, beat-grid
 *  4.5–6.5  1080 / 1920 / 9:16 / 60 每 0.5s 硬切，1.06→1.0 推进              → push-cut, beat-grid
 *  6.5–8.0  NO + glow/bounce/shake 被划掉；每一拍下方都有事件点               → anti-slop, no-dead-time
 *  8.0–8.7  钴蓝点 + Nimbus 落版；安全区再亮                                 → safe-zone
 *  8.7–9.3  幽灵光标拖动时间线，画面精确回到任意时刻                          → seek-t
 *  9.3–10   落版淡出、框收回 16:9，首尾同帧                                   → loop-seam
 */
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const ST = { x: 48, y: 18, w: 304, h: 171 }, CX = 200, CY = 103.5;
  let K, E, C, FONT, ZT;
  const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const seg = (t, a, b) => cl((t - a) / (b - a));
  const has = (T, a, b) => T >= a && T < b;
  const lerp = (a, b, t) => a + (b - a) * t;
  const rgba = (h, a) => K.rgba(h, a);
  const F = (r, px, w, s) => FONT(r, px, w, s || '');
  const sp = x => E.spring(x, 2.4, ZT);
  const io = x => E.inOut(x), eo = x => E.out(x), ex = x => E.expoOut(x);
  const slow = t => { t = cl(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  const uniq = a => [...new Set(a)];

  function txt(ctx, s, x, y, font, color, align, alpha) {
    ctx.save(); ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align || 'left'; ctx.textBaseline = 'alphabetic';
    if (alpha != null) ctx.globalAlpha *= alpha; ctx.fillText(s, x, y); ctx.restore();
  }
  function heavy(ctx, s, x, y, px, color, align, role) { // 极粗字：CJK 回退无 900 字重时补描边
    ctx.save(); ctx.font = F(role || 'sans', px, 900); ctx.textAlign = align || 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = px * 0.03; ctx.lineJoin = 'round';
    ctx.strokeText(s, x, y); ctx.fillText(s, x, y); ctx.restore();
  }
  function rise(ctx, x, y, w, h, p, fn) { // 遮罩上升
    if (p <= 0.001) return; ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h);
    ctx.clip(); ctx.translate(0, (1 - cl(p, 0, 1.03)) * h * 0.95); fn(); ctx.restore();
  }
  function dot(ctx, x, y, r, col) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = col || C.accent; ctx.fill(); }
  function hair(ctx, x1, y1, x2, y2, col, lw) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.strokeStyle = col; ctx.lineWidth = lw || 0.9; ctx.stroke(); }

  // ── 共用外壳：letterbox → 舞台 → 颗粒 → 覆层（时间码/进度/节拍）
  function letterbox(ctx) { ctx.fillStyle = '#0B0B0D'; ctx.fillRect(0, 0, 400, 250); }
  function clipStage(ctx) { ctx.beginPath(); ctx.rect(ST.x, ST.y, ST.w, ST.h); ctx.clip(); }
  function rings(ctx, col, a) {
    ctx.save(); ctx.strokeStyle = col; ctx.globalAlpha = a == null ? 1 : a; ctx.lineWidth = 0.9;
    const cx = ST.x + ST.w * 0.84, cy = ST.y + ST.h * 0.22;
    [17, 27].forEach(r => { ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke(); }); ctx.restore();
  }
  function ruler(ctx, col, a) {
    ctx.save(); ctx.strokeStyle = col; ctx.globalAlpha = a == null ? 1 : a; ctx.lineWidth = 0.8;
    const y = ST.y + ST.h * 0.9, x0 = ST.x + ST.w * 0.09, x1 = ST.x + ST.w * 0.91;
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    for (let i = 0; i <= 8; i++) { const x = x0 + (x1 - x0) * i / 8; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 4); ctx.stroke(); } ctx.restore();
  }
  function paperStage(ctx) {
    ctx.save(); clipStage(ctx); ctx.fillStyle = C.stage; ctx.fillRect(ST.x, ST.y, ST.w, ST.h);
    const g = ctx.createRadialGradient(ST.x + ST.w * .25, ST.y + ST.h * .1, 0, ST.x + ST.w * .25, ST.y + ST.h * .1, 230);
    g.addColorStop(0, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(ST.x, ST.y, ST.w, ST.h);
    rings(ctx, C.line); ruler(ctx, C.line, .9);
    const v = ctx.createRadialGradient(CX, CY, 90, CX, CY, 210); v.addColorStop(0, 'rgba(40,30,20,0)'); v.addColorStop(1, 'rgba(40,30,20,.13)'); ctx.fillStyle = v; ctx.fillRect(ST.x, ST.y, ST.w, ST.h);
    ctx.restore();
  }
  function grainStage(ctx, amt) { ctx.save(); clipStage(ctx); ctx.translate(ST.x, ST.y); K.grain(ctx, ST.w, ST.h, amt); ctx.restore(); }
  function overlay(ctx, Td, o) {
    o = o || {}; ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = .8; ctx.strokeRect(ST.x, ST.y, ST.w, ST.h);
    ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = .9;
    [[ST.x, ST.y, 1, 1], [ST.x + ST.w, ST.y, -1, 1], [ST.x, ST.y + ST.h, 1, -1], [ST.x + ST.w, ST.y + ST.h, -1, -1]].forEach(([x, y, a, b]) => { ctx.beginPath(); ctx.moveTo(x - a * 11, y); ctx.lineTo(x - a * 4, y); ctx.moveTo(x, y - b * 11); ctx.lineTo(x, y - b * 4); ctx.stroke(); });
    const s = Math.floor(Td), f = Math.floor((Td % 1) * 30), pad = n => String(n).padStart(2, '0');
    ctx.font = F('mono', 11, 500); ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left'; ctx.fillStyle = C.nightInk;
    const tc = '00:' + pad(s) + ':' + pad(f); ctx.fillText(tc, ST.x, 211); const w0 = ctx.measureText(tc).width;
    ctx.fillStyle = C.muted; ctx.fillText(' / 00:10:00', ST.x + w0, 211); ctx.textAlign = 'right'; ctx.fillText(o.right || '1920×1080 · fit', ST.x + ST.w, 211);
    const px = ST.x + ST.w * cl(Td / 10);
    ctx.fillStyle = 'rgba(255,255,255,.16)'; ctx.fillRect(ST.x, 221, ST.w, 1.6); ctx.fillStyle = C.accent; ctx.fillRect(ST.x, 221, px - ST.x, 1.6);
    ctx.fillStyle = C.nightInk; ctx.fillRect(px - .8, 217, 1.6, 9);
    if (o.ghost) { ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = .9; ctx.beginPath(); ctx.arc(px, 221.8, 5, 0, TAU); ctx.stroke(); }
    if (o.beats) {
      const cur = Math.floor(Td / .5), fr = (Td / .5) % 1;
      for (let i = 0; i < 20; i++) {
        const on = i === cur, hgt = (i % 4 === 0 ? 9 : 5) + (on ? 4 * (1 - fr) : 0), x = ST.x + ST.w * (i + .5) / 20;
        ctx.fillStyle = on ? C.accent : 'rgba(255,255,255,' + (i % 4 === 0 ? .45 : .28) + ')'; ctx.fillRect(x - 1, 240 - hgt, 2, hgt);
        if (o.events && i >= o.events[0] && i < o.events[1] && i * .5 <= Td) { ctx.beginPath(); ctx.arc(x, 244.5, 1.6, 0, TAU); ctx.fillStyle = o.evCol && i * .5 >= o.evCol ? C.accent : 'rgba(255,255,255,.5)'; ctx.fill(); }
      }
    }
    ctx.restore();
  }
  // ── A 模式共用：默认 AI 审美
  const RB = ['#FFD84A', '#FF5A8A', '#3DE0C4', '#8FA8FF'];
  function mkSpark(rnd, n) { const a = []; for (let i = 0; i < n; i++) a.push({ x: rnd(), y: rnd(), s: 1 + rnd() * 2.4, k: i % 4, sp: 1 + (i % 3) }); return a; }
  function slopGrad(ctx, x, y, w, h, T) {
    const g = ctx.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, '#7B61FF'); g.addColorStop(0.5 + Math.sin(T / 10 * TAU) * .16, '#FF5A8A'); g.addColorStop(1, '#FFB400'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  }
  function sparks(ctx, arr, T, x, y, w, h) { arr.forEach(p => { const yy = (((p.y - T / 10 * p.sp) % 1) + 1) % 1; ctx.beginPath(); ctx.arc(x + p.x * w, y + yy * h, p.s, 0, TAU); ctx.fillStyle = rgba(RB[p.k], .75); ctx.fill(); }); }
  function glow(ctx, fn) { ctx.save(); ctx.shadowColor = 'rgba(255,255,255,.9)'; ctx.shadowBlur = 9; fn(); ctx.restore(); }

  function combo(id, build) {
    LEX.register(id, {
      mount(el, api) {
        K = api.kit; E = api.ease; C = api.colors; FONT = api.font; ZT = E.zetaFor(0.05);
        const { ctx } = api.canvas(); const S = { t0: 0, m: 1 }; const sc = build(api);
        const loc = t => (((t - S.t0) % 10) + 10) % 10;
        return {
          mode(m) { S.m = m ? 1 : 0; S.t0 = api.t; },
          frame(t) {
            const w = api.w; if (!w) return; const s = w / 400;
            ctx.save(); ctx.scale(s, s); ctx.translate(0, (api.h / s - 250) / 2); ctx.beginPath(); ctx.rect(0, -2, 400, 254); ctx.clip();
            sc.draw(ctx, loc(t), S.m); ctx.restore();
          },
          active(t, m) { return m ? sc.active(loc(t)) : []; },
        };
      },
    });
  }

  /* ══════════════ sc-vertical ══════════════ */
  combo('sc-vertical', function (api) {
    const spk = mkSpark(api.rng(9), 22);
    const pF = T => T < 5 ? io(seg(T, .2, 1)) : 1 - io(seg(T, 9.3, 10));
    const geom = T => { const p = pF(T), W = lerp(150, 84.4, p), H = lerp(84.4, 150, p); return { p, W, H, x: CX - W / 2, y: CY - H / 2 }; };
    const safeOf = g => ({ x: g.x + g.W * .07, y: g.y + g.H * .09, w: g.W * .73, h: g.H * .67 });
    const GREY = () => rgba(C.muted, .6);

    function S1(ctx, T, SB) {
      const w = [['Hook', 1.0, 20, 200, SB.y + 26], ['in', 1.5, 20, 200, SB.y + 50], ['2s', 2.0, 40, 900, SB.y + 90]];
      w.forEach(([s, t0, px, wt, y]) => {
        const p = cl(sp(T - t0), 0, 1.03);
        rise(ctx, SB.x - 2, y - px * 1.02, SB.w + 4, px * 1.3, p, () => { if (wt === 900) heavy(ctx, s, SB.x, y, px, C.ink); else txt(ctx, s, SB.x, y, F('sans', px, 200), C.ink); });
      });
      if (T > 2.1) { ctx.font = F('sans', 40, 900); const w2 = ctx.measureText('2s').width; dot(ctx, SB.x + w2 + 5, SB.y + 89, 2.8 * cl(sp(T - 2.1), 0, 1.1)); }
    }
    function S2(ctx, t, SB) {
      const gy = SB.y + SB.h - 6, px = K.fit(ctx, 'BEAT', SB.w, 'sans', 30, 900), p1 = ex(seg(t, 0, .4));
      ctx.save(); ctx.beginPath(); ctx.rect(SB.x - 2, gy - px, (SB.w + 4) * p1, px + 6); ctx.clip(); heavy(ctx, 'BEAT', SB.x, gy, px, C.ink); ctx.restore();
      ctx.fillStyle = C.ink; ctx.fillRect(SB.x, gy + 3.5, SB.w * p1, .9);
      ['E', 'H', 'T'].forEach((c, i) => { const cy = gy - px * .92 - 4 - i * 18; rise(ctx, SB.x, cy - 18, 20, 21, sp(t - (.25 + i * .25)), () => heavy(ctx, c, SB.x + 1, cy, 18, C.ink)); });
      const top = gy - px * .92 - 4 - 2 * 18 - 18;
      rise(ctx, SB.x, top - 22, SB.w, 24, sp(t - 1.0), () => txt(ctx, 'drops', SB.x + 1, top - 7, F('sans', 16, 200), C.ink));
      if (t > 1.15) { ctx.font = F('sans', 16, 200); dot(ctx, SB.x + ctx.measureText('drops').width + 7, top - 8, 2.6 * cl(sp(t - 1.15), 0, 1.1)); }
    }
    function S3(ctx, T, SB) {
      const items = ['1080', '1920', '9:16', '60'], i = Math.min(3, Math.floor((T - 4.5) / .5)), t0 = 4.5 + i * .5, s = 1 + .06 * (1 - ex(seg(T, t0, t0 + .3)));
      const cx = SB.x + SB.w / 2, cy = SB.y + SB.h * .5; ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-cx, -cy);
      const px = K.fit(ctx, items[i], SB.w * .9, 'sans', 44, 900); heavy(ctx, items[i], cx, cy + px * .34, px, C.ink, 'center'); dot(ctx, cx, cy + px * .34 + 12, 2.4); ctx.restore();
    }
    function S4(ctx, t, SB) {
      rise(ctx, SB.x - 2, SB.y + 2, SB.w + 4, 28, sp(t), () => heavy(ctx, 'NO', SB.x, SB.y + 26, 24, C.ink));
      ['glow', 'bounce', 'shake'].forEach((s, i) => {
        const y = SB.y + 54 + i * 22, t0 = .25 + i * .25, p = cl(sp(t - t0), 0, 1.03), k = seg(t, t0 + .25, t0 + .5);
        rise(ctx, SB.x - 2, y - 17, SB.w + 4, 22, p, () => {
          ctx.font = F('sans', 15, 200); const w = ctx.measureText(s).width;
          txt(ctx, s, SB.x, y, F('sans', 15, 200), k > .5 ? C.muted : C.ink); if (k > 0) hair(ctx, SB.x - 2, y - 6, SB.x - 2 + (w + 4) * ex(k), y - 6, C.accent, 1.1);
        });
      });
    }
    function S5(ctx, t, SB, al) {
      ctx.save(); ctx.globalAlpha *= al; const cx = SB.x + SB.w / 2, p = cl(sp(t), 0, 1.1);
      dot(ctx, cx, SB.y + 34, 9 * p);
      const px = K.fit(ctx, 'Nimbus', SB.w, 'sans', 30, 800); rise(ctx, SB.x - 2, SB.y + 58, SB.w + 4, px * 1.3, sp(t - .08), () => heavy(ctx, 'Nimbus', cx, SB.y + 58 + px, px, C.ink, 'center')); ctx.restore();
    }
    function content(ctx, T, g, SB) {
      if (T < 1) return;
      if (T < 2.5) S1(ctx, T, SB);
      else if (T < 3.0) {
        const p = io(seg(T, 2.5, 3)), pp = io(seg(T - .03, 2.5, 3)), Wd = g.W * 1.2, spd = (p - pp) * Wd;
        for (let k = 2; k >= 0; k--) { ctx.save(); ctx.globalAlpha = k ? .09 : 1; ctx.translate(-p * Wd + k * spd * 2.2, 0); S1(ctx, 2.49, SB); ctx.restore(); }
        ctx.save(); ctx.translate((1 - p) * Wd, 0); S2(ctx, 0, SB); ctx.restore();
      }
      else if (T < 4.5) S2(ctx, T - 3, SB);
      else if (T < 6.5) S3(ctx, T, SB);
      else if (T < 8.0) S4(ctx, T - 6.5, SB);
      else S5(ctx, T - 8, SB, 1 - seg(T, 9.3, 9.7));
    }
    function ui(ctx, g, a) {
      if (a <= .01) return; ctx.save(); ctx.globalAlpha = a; const gc = GREY();
      const fx = f => g.x + g.W * f, fy = f => g.y + g.H * f;
      [.5, .6, .7].forEach(f => { K.rr(ctx, fx(.9) - 3.5, fy(f) - 3.5, 7, 7, 2); ctx.strokeStyle = gc; ctx.lineWidth = .8; ctx.stroke(); });
      hair(ctx, fx(.07), fy(.86), fx(.07) + g.W * .5, fy(.86), gc, 1); hair(ctx, fx(.07), fy(.915), fx(.07) + g.W * .3, fy(.915), gc, 1); hair(ctx, fx(.36), fy(.04), fx(.64), fy(.04), gc, 1);
      ctx.restore();
    }
    function drawB(ctx, T) {
      letterbox(ctx); paperStage(ctx); ctx.save(); clipStage(ctx);
      const g = geom(T), SB = safeOf(g);
      // 16:9 残影
      if (g.p > .02 && g.p < 1) { ctx.save(); ctx.setLineDash([3, 3]); ctx.lineWidth = .8; ctx.strokeStyle = rgba(C.ink, .3); ctx.strokeRect(CX - 75, CY - 42.2, 150, 84.4); ctx.restore(); }
      ctx.lineWidth = 1; ctx.strokeStyle = rgba(C.ink, .7); ctx.strokeRect(g.x, g.y, g.W, g.H);
      // scrub
      let Tc = T, Td = T, scrub = false;
      if (T >= 8.7 && T < 9.3) { const q = seg(T, 8.7, 9.3); Td = q < .5 ? lerp(8.7, 2.0, io(q / .5)) : lerp(2.0, 9.3, io((q - .5) / .5)); Tc = Td; scrub = true; }
      ctx.save(); ctx.beginPath(); ctx.rect(g.x, g.y, g.W, g.H); ctx.clip(); content(ctx, Tc, g, SB); ctx.restore();
      const sa = seg(g.p, .7, 1), lit = has(T, 1, 3) || has(T, 8, 8.7);
      if (sa > 0) { ctx.save(); ctx.setLineDash([3, 3]); ctx.lineWidth = .9; ctx.strokeStyle = rgba(C.accent, sa * (lit ? .95 : .28)); ctx.strokeRect(SB.x, SB.y, SB.w, SB.h); ctx.restore(); ui(ctx, g, sa); }
      ctx.restore(); grainStage(ctx, .1);
      overlay(ctx, Td, { beats: true, events: [2, 16], evCol: 6.5, ghost: scrub, right: g.p < .5 ? '1920×1080 · 16:9' : '1080×1920 · 9:16' });
    }
    function drawA(ctx, T) {
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 400, 250);
      const x = 157.8, y = 28.5, W = 84.4, H = 150, fx = f => x + W * f, fy = f => y + H * f;
      ctx.save(); ctx.translate(T >= 8 && T < 9.2 ? Math.sin(T * 47) * 1.5 : 0, 0);
      K.card(ctx, x, y, W, H, { r: 8, fill: '#7B61FF', elev: 2 }); ctx.save(); K.rr(ctx, x, y, W, H, 8); ctx.clip(); slopGrad(ctx, x, y, W, H, T); sparks(ctx, spk, T, x, y, W, H);
      const R = fx(.95);
      if (T < 2.5) ['Hook', 'in', '2s'].forEach((w, i) => { const d = [.1, .7, 1.3][i], p = E.bouncy(seg(T, d, d + .7)); if (p <= 0) return; glow(ctx, () => { ctx.save(); ctx.translate(R, fy(.6 + i * .09)); ctx.scale(p, p); txt(ctx, w, 0, 0, F('sans', 22, 700), '#fff', 'right'); ctx.restore(); }); });
      else if (T < 4.5) ['THE', 'BEAT', 'drops'].forEach((w, i) => { const p = seg(T, 2.5 + i * .3, 3.5 + i * .3); glow(ctx, () => txt(ctx, w, fx(.94) + (1 - p) * W, fy(.66 + i * .08), F('sans', 20, 700), '#fff', 'right')); });
      else if (T < 6.5) ['1080', '1920', '9:16', '60'].forEach((w, i) => { const a2 = cl(1 - Math.abs((T - 4.5 - i * .5 - .25) / .55)); if (a2 <= 0) return; glow(ctx, () => txt(ctx, w, R, fy(.7), F('sans', 30, 700), RB[i], 'right', a2)); });
      else if (T < 8) ['glow', 'bounce', 'shake'].forEach((w, i) => { const p = E.bouncy(seg(T - 6.5, .2 + i * .35, .9 + i * .35)); if (p <= 0) return; ctx.save(); ctx.translate(fx(.88) - i * 5, fy(.6 + i * .09)); ctx.scale(p, p); K.rr(ctx, -48, -8, 48, 16, 8); ctx.fillStyle = RB[(i + 1) % 4]; ctx.fill(); txt(ctx, w, -4, 4, F('sans', 10.5, 700), '#1a1a2a', 'right'); ctx.restore(); });
      else { const p = E.bouncy(seg(T, 8, 8.8)); ctx.save(); ctx.translate(fx(.6), fy(.66)); ctx.scale(p, p); K.logo(ctx, 0, 0, 30, '#fff', '#7B61FF'); ctx.restore(); const pl = 1 + .08 * Math.sin(T * 9); ctx.save(); ctx.translate(fx(.66), fy(.78)); ctx.scale(pl, pl); glow(ctx, () => { K.rr(ctx, -26, -8, 52, 16, 8); ctx.fillStyle = '#FF3D71'; ctx.fill(); }); txt(ctx, 'Follow', 0, 3.5, F('sans', 10.5, 700), '#fff', 'center'); ctx.restore(); }
      ctx.restore(); ctx.restore();
      // 平台 UI 压在文字上（A 的问题：文字被遮）
      ctx.save(); ctx.fillStyle = 'rgba(15,17,21,.5)'; ctx.fillRect(x, fy(.74), W, H * .26); ctx.restore();
      [.5, .6, .7].forEach(f => { dot(ctx, fx(.9), fy(f), 5, 'rgba(15,17,21,.6)'); ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = .9; ctx.beginPath(); ctx.arc(fx(.9), fy(f), 2.4, 0, TAU); ctx.stroke(); });
      hair(ctx, fx(.07), fy(.86), fx(.55), fy(.86), 'rgba(255,255,255,.8)', 1.6); hair(ctx, fx(.07), fy(.92), fx(.35), fy(.92), 'rgba(255,255,255,.6)', 1.6);
    }
    return {
      draw(ctx, T, m) { m ? drawB(ctx, T) : drawA(ctx, T); },
      active(T) {
        const a = [];
        if (has(T, .2, 1.0) || has(T, 9.3, 10)) a.push('aspect-ratios');
        if (has(T, 1, 2.5)) a.push('word-on-beat', 'type-extremes');
        if (has(T, 1, 3) || has(T, 8, 8.7)) a.push('safe-zone');
        if (has(T, 2.5, 3)) a.push('whip-pan');
        if (has(T, 3, 4.5)) a.push('kinetic-type');
        if (has(T, 1, 6.5)) a.push('beat-grid');
        if (has(T, 4.5, 6.5)) a.push('push-cut');
        if (has(T, 6.5, 8)) a.push('anti-slop', 'no-dead-time');
        if (has(T, 8.7, 9.3)) a.push('seek-t');
        if (has(T, 9.3, 10)) a.push('loop-seam');
        return uniq(a);
      },
    };
  });

  /* ══════════════ sc-opener ══════════════
   * 夜色舞台 16:9，letterbox 留边。圆点 = 唯一焦点（雨里的暖光 → 硬切后同位同径的钴蓝点）
   *  0.0–1.2  舞台从 0.94 等比放大到位，四周留边、构图不变                       → fixed-stage
   *  0.0–3.4  远雨细慢、近雨粗快，三枚暖光斑呼吸；多层渐变 + 颗粒 + 暗角；圆点长大   → rain-bokeh, layered-atmosphere
   *  3.4      雨景硬切为干净夜色；圆点位置与大小不变，暖光变钴蓝                   → match-cut(3.4–4.4)
   *  3.7–4.6  NIMBUS 六个字母各自从遮罩下升起（极粗）；随后细字副标题淡入           → masked-reveal, type-extremes(3.7–6.4)
   *  4.8–6.3  斜光束扫过，被扫到的字变亮，扫完保持亮                             → light-on-text
   *  6.4–6.9  NIMBUS 快速坠向底部并缩小，带 5 个子帧拖影                         → subframe-blur
   *  6.6–9.0  圆点变成吊坠，12fps 一拍二摆动，轮廓抖动                           → on-twos
   *  7.0–8.6  NIMBUS 成为地面，SEE 竖排成柱，first 落在柱顶                      → kinetic-type
   *  9.0–10   文字退去、雨回来、圆点缩回暖光；舞台收回 0.94，首尾同帧              → loop-seam
   */
  combo('sc-opener', function (api) {
    const rnd = api.rng(21), MIX = (a, b, e) => { e = cl(e); const p = parseInt(a.slice(1), 16), q = parseInt(b.slice(1), 16), c = i => Math.round(((p >> i) & 255) * (1 - e) + ((q >> i) & 255) * e); return 'rgb(' + c(16) + ',' + c(8) + ',' + c(0) + ')'; };
    const far = Array.from({ length: 46 }, () => ({ x: rnd(), y: rnd(), len: .05 + rnd() * .05, cy: 2 + Math.floor(rnd() * 2) }));
    const near = Array.from({ length: 9 }, () => ({ x: rnd(), y: rnd(), len: .11 + rnd() * .06, cy: 5 + Math.floor(rnd() * 3) }));
    const bok = [[.14, .34, .05, 1], [.86, .6, .06, 2], [.7, .16, .04, 3], [.3, .78, .045, 1]].map((b, i) => ({ x: b[0], y: b[1], r: b[2], n: b[3], ph: i * .27 }));
    const spkA = mkSpark(api.rng(4), 34);
    const WORD = 'NIMBUS', WARM = '#F6E7C6', CIRC_Y = 84;
    const scOf = T => T < 5 ? .94 + .06 * io(seg(T, 0, 1.2)) : 1 - .06 * io(seg(T, 9.4, 10));
    function nightStage(ctx, T) {
      ctx.fillStyle = C.night; ctx.fillRect(ST.x, ST.y, ST.w, ST.h); const a = T / 10 * TAU;
      [[.3 + .06 * Math.sin(a), .8, 150, C.accent, .16], [.74 + .05 * Math.cos(a), .3, 130, '#5C4A2E', .26], [.5, 1.0, 190, C.accent, .09]].forEach(b => {
        const x = ST.x + b[0] * ST.w, y = ST.y + b[1] * ST.h, g = ctx.createRadialGradient(x, y, 0, x, y, b[2]); g.addColorStop(0, rgba(b[3], b[4])); g.addColorStop(1, rgba(b[3], 0)); ctx.fillStyle = g; ctx.fillRect(ST.x, ST.y, ST.w, ST.h);
      });
      rings(ctx, C.nightLine); ruler(ctx, C.nightLine, .9);
      const v = ctx.createRadialGradient(CX, CY, 60, CX, CY, 200); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.5)'); ctx.fillStyle = v; ctx.fillRect(ST.x, ST.y, ST.w, ST.h);
    }
    function rain(ctx, T, al) {
      if (al <= .01) return;
      bok.forEach(b => { const br = .65 + .35 * Math.sin((T / 10 * b.n + b.ph) * TAU), r = b.r * ST.h * (.9 + .2 * br), x = ST.x + b.x * ST.w, y = ST.y + b.y * ST.h, g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba('#F2B544', .4 * br * al)); g.addColorStop(.7, rgba('#F2B544', .14 * br * al)); g.addColorStop(1, rgba('#F2B544', 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); });
      ctx.lineCap = 'round';
      [[far, .6, .2], [near, 1.2, .3]].forEach(([arr, lw, a]) => { ctx.lineWidth = lw; ctx.strokeStyle = rgba(C.nightInk, a * al); ctx.beginPath(); arr.forEach(d => { const px = ST.x + d.x * ST.w, py = ST.y + (((d.y + T / 10 * d.cy) % 1) * (ST.h + 30)) - 15; ctx.moveTo(px, py); ctx.lineTo(px - .1 * d.len * ST.h * 2, py + d.len * ST.h); }); ctx.stroke(); });
    }
    function wordLayout(ctx, px) { ctx.font = F('sans', px, 900); const xs = []; let tot = 0; for (const ch of WORD) { xs.push(tot); tot += ctx.measureText(ch).width + px * .02; } return { xs, tot: tot - px * .02 }; }
    function drawWord(ctx, base, px, fill, ps, alpha) {
      const w = wordLayout(ctx, px), x0 = CX - w.tot / 2; ctx.save(); ctx.globalAlpha *= alpha == null ? 1 : alpha;
      [...WORD].forEach((ch, i) => rise(ctx, x0 + w.xs[i] - 2, base - px * 1.0, px * .95 + 4, px * 1.25, ps[i], () => heavy(ctx, ch, x0 + w.xs[i], base, px, fill))); ctx.restore(); return w;
    }
    const wordAt = T => { const mv = ex(seg(T, 6.4, 6.85)); return { base: lerp(142, 176, mv), px: lerp(38, 20, mv), mv }; };
    function drawB(ctx, T) {
      letterbox(ctx); ctx.save(); const sc = scOf(T); ctx.translate(CX, CY); ctx.scale(sc, sc); ctx.translate(-CX, -CY); clipStage(ctx);
      nightStage(ctx, T);
      rain(ctx, T, T < 3.4 ? 1 : T < 9 ? 0 : io(seg(T, 9, 9.6)));
      // 圆点
      const r = T < 3.4 ? 5 + 9 * io(T / 3.4) : T < 9 ? 14 : 14 - 9 * io(seg(T, 9, 9.7));
      const cool = T < 3.4 ? 0 : T < 9 ? 1 : 1 - io(seg(T, 9, 9.7)), halo = T < 3.4 ? .26 : T < 9 ? 0 : .26 * io(seg(T, 9, 9.7));
      const k = io(seg(T, 6.6, 7.0)) * (1 - io(seg(T, 8.6, 9.0))), T12 = Math.floor(T * 12) / 12, ang = .22 * Math.sin((T12 - 6.6) * 2.6) * k;
      const L = CIRC_Y - 30, px0 = CX + L * Math.sin(ang), py0 = 30 + L * Math.cos(ang), jr = api.rng(Math.floor(T * 12) * 7 + 3), jx = k > .01 ? (jr() - .5) * 1.3 : 0, jy = k > .01 ? (jr() - .5) * 1.3 : 0;
      if (halo > .01) { const g = ctx.createRadialGradient(CX, CIRC_Y, r * .6, CX, CIRC_Y, r * 2.6); g.addColorStop(0, rgba('#F2B544', halo)); g.addColorStop(1, rgba('#F2B544', 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(CX, CIRC_Y, r * 2.6, 0, TAU); ctx.fill(); }
      if (k > .01) hair(ctx, CX, 30, px0, py0, rgba(C.nightInk, .5 * k), .8);
      dot(ctx, px0, py0, r, MIX(WARM, C.accent, cool));
      if (k > .01) { ctx.beginPath(); ctx.arc(px0 + jx, py0 + jy, r + 1.4, 0, TAU); ctx.strokeStyle = rgba(C.nightInk, .55 * k); ctx.lineWidth = .7; ctx.stroke(); }
      // 文字
      if (T >= 3.6 && T < 9.5) {
        const out = 1 - io(seg(T, 9, 9.4)), ps = [0, 1, 2, 3, 4, 5].map(i => cl(sp(T - (3.7 + i * .09))));
        const wa = wordAt(T), lit = T < 4.8 ? 0 : T < 6.4 ? io(seg(T, 4.8, 6.3)) : 1, bx = lerp(ST.x - 50, ST.x + ST.w + 50, io(seg(T, 4.8, 6.3)));
        ctx.save(); ctx.globalAlpha = out;
        const ghosts = (T >= 6.4 && T < 6.95) ? [5, 4, 3, 2, 1] : [];
        ghosts.forEach(k2 => { const g2 = wordAt(T - k2 * .022); drawWord(ctx, g2.base, g2.px, rgba(C.nightInk, .16), ps); });
        drawWord(ctx, wa.base, wa.px, rgba(C.nightInk, T < 6.4 ? .3 : 1), ps);
        if (T >= 4.8 && T < 6.4) { // 光束：扫过的字变亮并保持
          ctx.save(); ctx.beginPath(); ctx.moveTo(ST.x, 100); ctx.lineTo(bx + 14, 100); ctx.lineTo(bx - 14, 170); ctx.lineTo(ST.x, 170); ctx.closePath(); ctx.clip(); drawWord(ctx, wa.base, wa.px, C.nightInk, ps); ctx.restore();
          /* beam edge only */
        } else if (T >= 6.4) drawWord(ctx, wa.base, wa.px, C.nightInk, ps);
        if (T >= 6.4 && T < 6.95) ctx.globalAlpha *= 1;
        const sa = eo(seg(T, 4.4, 5.0)) * (1 - seg(T, 6.2, 6.5));
        if (sa > .01) { ctx.save(); if ('letterSpacing' in ctx) ctx.letterSpacing = '3px'; txt(ctx, 'VISIBLE SIGNALS', CX + 1.5, 161 + (1 - sa) * 4, F('sans', 11, 200), C.nightInk, 'center', sa); ctx.restore(); }
        // kinetic-type：ground + pillar
        const ga = eo(seg(T, 6.9, 7.3)); ctx.fillStyle = rgba(C.nightInk, .45 * ga); ctx.fillRect(CX - 46, 181, 92, .9);
        const gx = CX - wordLayout(ctx, 20).tot / 2; ['E', 'E', 'S'].forEach((c, i) => { const cy = 158 - i * 15; rise(ctx, gx - 1, cy - 16, 20, 19, sp(T - (7.4 + i * .3)), () => heavy(ctx, c, gx, cy, 16, C.nightInk)); });
        rise(ctx, gx - 1, 98, 60, 20, sp(T - 8.3), () => txt(ctx, 'first', gx, 116, F('sans', 15, 200), C.nightInk));
        ctx.restore();
      }
      grainStage(ctx, .12); ctx.restore();
      overlay(ctx, T);
    }
    function drawA(ctx, T) {
      ctx.save(); const sh = (T > 6.6 && T < 8) ? [Math.sin(T * 41) * 2, Math.cos(T * 37) * 2] : [0, 0]; ctx.translate(sh[0], sh[1]);
      const g = ctx.createLinearGradient(0, 0, 400, 250); g.addColorStop(0, '#3B1E8A'); g.addColorStop(.5 + .15 * Math.sin(T / 10 * TAU), '#7B61FF'); g.addColorStop(1, '#FF5A8A'); ctx.fillStyle = g; ctx.fillRect(-6, -6, 412, 262);
      spkA.forEach(p => { const y = (((p.y - T / 10 * p.sp) % 1) + 1) % 1; ctx.beginPath(); ctx.arc(p.x * 400, y * 250, p.s, 0, TAU); ctx.fillStyle = rgba(RB[p.k], .8); ctx.fill(); });
      const oR = T < 3.6 ? 8 + 22 * (T / 3.6) : 30 + 3 * Math.sin(T * 6), og = ctx.createRadialGradient(200, 90, 2, 200, 90, oR * 3); og.addColorStop(0, 'rgba(255,255,255,.95)'); og.addColorStop(.3, 'rgba(255,216,74,.55)'); og.addColorStop(1, 'rgba(255,90,138,0)'); ctx.fillStyle = og; ctx.beginPath(); ctx.arc(200, 90, oR * 3, 0, TAU); ctx.fill();
      [3.6, 6.6].forEach(t0 => { const q = seg(T, t0, t0 + 1); if (q > 0 && q < 1) { ctx.strokeStyle = 'rgba(255,255,255,' + (.8 * (1 - q)) + ')'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(200, 90, 20 + q * 190, 0, TAU); ctx.stroke(); } });
      if (T >= 3.6) { const y = T < 6.6 ? 165 : 165 + 28 * seg(T, 6.6, 7.4), sz = T < 6.6 ? 44 : 44 - 14 * seg(T, 6.6, 7.4); ctx.font = F('sans', sz, 700); const tw = ctx.measureText(WORD).width;
        [...WORD].forEach((ch, i) => { const p = E.bouncy(seg(T, 3.6 + i * .12, 4.3 + i * .12)); if (p <= 0) return; ctx.save(); ctx.shadowColor = 'rgba(255,255,255,.9)'; ctx.shadowBlur = 10; ctx.font = F('sans', sz, 700); const cw = ctx.measureText(WORD.slice(0, i)).width; ctx.translate(200 - tw / 2 + cw, y); ctx.scale(1, p); ctx.fillStyle = i % 2 ? '#FFD84A' : '#fff'; ctx.textAlign = 'left'; ctx.fillText(ch, 0, 0); ctx.restore(); }); }
      if (T > 4.8) { const s = 'Visible Signals · see it first', n = Math.min(s.length, Math.floor((T - 4.8) * 9)); txt(ctx, s.slice(0, n) + (Math.floor(T * 3) % 2 ? '|' : ''), 200, T < 6.6 ? 192 : 218, F('sans', 13, 500), '#fff', 'center'); }
      ctx.restore();
    }
    return {
      draw(ctx, T, m) { m ? drawB(ctx, T) : drawA(ctx, T); },
      active(T) {
        const a = [];
        if (has(T, 0, 1.2)) a.push('fixed-stage');
        if (has(T, 0, 3.4)) a.push('rain-bokeh', 'layered-atmosphere');
        if (has(T, 3.4, 4.4)) a.push('match-cut');
        if (has(T, 3.7, 4.6)) a.push('masked-reveal');
        if (has(T, 3.7, 6.4)) a.push('type-extremes');
        if (has(T, 4.8, 6.3)) a.push('light-on-text');
        if (has(T, 6.4, 6.95)) a.push('subframe-blur');
        if (has(T, 6.6, 9.0)) a.push('on-twos');
        if (has(T, 7.0, 8.6)) a.push('kinetic-type');
        if (has(T, 9.0, 10)) a.push('loop-seam');
        return uniq(a);
      },
    };
  });

  /* ══════════════ sc-immersive ══════════════
   * 夜色舞台（生成艺术）：一个焦点 = 中央一枚细线浑天仪，钴蓝只是绕环的一个点。
   *  0.0–0.9  静止：只有固定种子的星点与中心一个钴蓝点；右下角标注 motion · reduce   → reduced-motion
   *  0.9–2.6  星点开始呼吸（同一 seed 每次相同）；多层渐变/颗粒/暗角淡入            → seeded-random, layered-atmosphere(1.2–3.4)
   *  2.4–4.4  三条极光细带在上方缓慢漂移                                          → aurora
   *  3.6–5.0  三道线环由主光扫亮：亮暗按法线与光向决定，非平光                       → studio-light-3d
   *  5.0–6.6  机位缓慢环绕并抬升，环的形体不变                                     → orbit-drift
   *  4.8–6.6  细线流场淡入；5.2 起幽灵光标（小圆环）游走，线条在光标附近被卷弯       → flow-field, ghost-cursor(5.2–8.4), cursor-reactive(5.4–6.8)
   *  6.8–8.2  光标横扫，远/中/近三层星点错位（视差纵深）                             → parallax-depth
   *  8.2–9.2  一圈细线伪频谱随 120 BPM 起伏                                        → audio-reactive
   *  9.2–10   一切退回静止，只剩星点与中心的点，首尾同帧                             → reduced-motion
   */
  combo('sc-immersive', function (api) {
    const rn = api.rng(42);
    const stars = Array.from({ length: 78 }, (_, i) => { const z = i < 8 ? 2 : i < 34 ? 1 : 0; return { x: ST.x + rn() * ST.w, y: ST.y + rn() * ST.h * .86, z, r: [.6, .9, 1.7][z] * (.7 + rn() * .6), n: 1 + (i % 3), ph: rn() }; });
    const rf = api.rng(7), flow = Array.from({ length: 40 }, () => ({ x: ST.x + rf() * ST.w, y: ST.y + 20 + rf() * (ST.h - 40) }));
    const spkA = mkSpark(api.rng(5), 60);
    const mot = T => T < .9 ? 0 : T < 1.4 ? io(seg(T, .9, 1.4)) : T < 9.2 ? 1 : 1 - io(seg(T, 9.2, 9.7));
    const camX = T => T < 6.8 ? 0 : T < 8.2 ? lerp(-1, 1, io(seg(T, 6.8, 8.2))) * io(seg(T, 6.8, 7.0)) : lerp(1, 0, io(seg(T, 8.2, 8.8)));
    const ghost = T => {
      if (T < 6.8) { const w = (T - 5.2) * 2.6; return { x: CX + 54 + 24 * Math.cos(w), y: CY - 6 + 18 * Math.sin(w) }; }
      if (T < 8.2) return { x: lerp(ST.x + 40, ST.x + ST.w - 40, io(seg(T, 6.8, 8.2))), y: CY + 46 };
      return { x: ST.x + ST.w - 40, y: CY + 46 };
    };
    const gA = T => io(seg(T, 5.0, 5.4)) * (1 - io(seg(T, 8.4, 8.8)));
    const rotY = (p, a) => [p[0] * Math.cos(a) + p[2] * Math.sin(a), p[1], -p[0] * Math.sin(a) + p[2] * Math.cos(a)];
    const rotX = (p, a) => [p[0], p[1] * Math.cos(a) - p[2] * Math.sin(a), p[1] * Math.sin(a) + p[2] * Math.cos(a)];
    const rotZ = (p, a) => [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a), p[2]];
        const rot0 = [a => a, a => rotZ(a, 1.1), a => rotY(rotZ(a, -1.1), 1.5)];
    function view(p, psi, phi) { return rotX(rotY(p, psi), phi); }
    function ringPt(i, th, R, psi, phi) { const u = rot0[i]([Math.cos(th) * R, 0, Math.sin(th) * R]); return view(u, psi, phi); }
    function nightBG(ctx, T, la) {
      ctx.fillStyle = C.night; ctx.fillRect(ST.x, ST.y, ST.w, ST.h); const a = T / 10 * TAU;
      [[.3 + .06 * Math.sin(a), .75, 150, C.accent, .16], [.74 + .05 * Math.cos(a), .3, 130, '#4A3F55', .3]].forEach(b => { const x = ST.x + b[0] * ST.w, y = ST.y + b[1] * ST.h, g = ctx.createRadialGradient(x, y, 0, x, y, b[2]); g.addColorStop(0, rgba(b[3], b[4] * la)); g.addColorStop(1, rgba(b[3], 0)); ctx.fillStyle = g; ctx.fillRect(ST.x, ST.y, ST.w, ST.h); });
      rings(ctx, C.nightLine); ruler(ctx, C.nightLine, .9);
      const v = ctx.createRadialGradient(CX, CY, 60, CX, CY, 200); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,' + (.15 + .35 * la) + ')'); ctx.fillStyle = v; ctx.fillRect(ST.x, ST.y, ST.w, ST.h);
    }
    function aurora(ctx, T, cx0) {
      const A = (io(seg(T, 2.4, 3.4)) * (1 - io(seg(T, 9, 9.6)))) * (T < 4.4 ? 1 : lerp(1, .5, io(seg(T, 4.4, 5.2)))); if (A <= .01) return;
      [[.20, '#B9C6FF', .13, 1], [.30, C.accent, .16, 2], [.40, '#DCE2FF', .09, 1]].forEach(([yb, col, al, n], k) => {
        const top = [], bot = []; for (let i = 0; i <= 30; i++) { const x = ST.x + ST.w * i / 30, u = i / 30; let y = ST.y + ST.h * yb + 9 * Math.sin(u * 5 + k * 1.7 + T / 10 * TAU * n) + 4 * Math.sin(u * 11 + T / 10 * TAU * (n + 1)); if (cx0) y += 6 * Math.exp(-Math.pow((x - cx0.x) / 30, 2)) * (cx0.y > y ? 1 : -1); top.push([x, y]); bot.push([x, y + 8 + 5 * Math.sin(u * 3 + k)]); }
        const g = ctx.createLinearGradient(0, ST.y + ST.h * yb - 10, 0, ST.y + ST.h * yb + 22); g.addColorStop(0, rgba(col, 0)); g.addColorStop(.35, rgba(col, al * A)); g.addColorStop(1, rgba(col, 0));
        ctx.beginPath(); top.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); for (let i = bot.length - 1; i >= 0; i--) ctx.lineTo(bot[i][0], bot[i][1]); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); top.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.strokeStyle = rgba(col, .5 * A); ctx.lineWidth = .7; ctx.stroke();
      });
    }
    function flowLines(ctx, T, fa, gp, dx) {
      if (fa <= .01) return; const a = T / 10 * TAU; ctx.lineWidth = .6; ctx.strokeStyle = rgba(C.nightInk, .28 * fa); ctx.beginPath();
      flow.forEach(s => {
        let x = s.x + dx, y = s.y; if (Math.hypot(x - CX, y - CY) < 46) return; ctx.moveTo(x, y);
        for (let k = 0; k < 12; k++) { let th = (Math.sin(x * .034 + a * 2) + Math.cos(y * .046 - a * 1.5)) * 1.3; if (gp) { const d = Math.hypot(x - gp.x, y - gp.y); th += 2.4 * Math.exp(-d * d / 1400) * Math.sign(x - gp.x + .01); } x += Math.cos(th) * 3.2; y += Math.sin(th) * 3.2; if (Math.hypot(x - CX, y - CY) < 44 || x < ST.x || x > ST.x + ST.w || y < ST.y || y > ST.y + ST.h) break; ctx.lineTo(x, y); }
      }); ctx.stroke();
    }
    function armillary(ctx, T, al, dx) {
      if (al <= .01) return; const R = 34, cx = CX + dx, cy = CY + 3, psi = .35 * (T - 3.6), phi = .35 + .55 * io(seg(T, 5, 6.6)), la = (T - 3.6) * .8, Ld = [Math.cos(la) * .6, -.6, .55];
      const ln = Math.hypot(...Ld); ctx.save(); ctx.lineCap = 'round'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.strokeStyle = rgba(C.nightInk, .1 * al); ctx.stroke();
      for (let i = 0; i < 3; i++) { let prev = null; for (let s = 0; s <= 56; s++) { const th = s / 56 * TAU, p = ringPt(i, th, R, psi, phi); if (prev) { const nz = [(p[0] + prev[0]) / 2 / R, (p[1] + prev[1]) / 2 / R, (p[2] + prev[2]) / 2 / R], b = Math.max(0, (nz[0] * Ld[0] + nz[1] * Ld[1] + nz[2] * Ld[2]) / ln); ctx.strokeStyle = rgba(C.nightInk, al * (.1 + .9 * Math.pow(b, 1.5))); ctx.beginPath(); ctx.moveTo(cx + prev[0], cy + prev[1]); ctx.lineTo(cx + p[0], cy + p[1]); ctx.stroke(); } prev = p; } }
      ctx.restore();
    }
    function bars(ctx, T, al, dx) {
      if (al <= .01) return; const env = Math.pow(1 - ((T / .5) % 1), 2); ctx.lineWidth = 1; ctx.lineCap = 'round';
      for (let i = 0; i < 44; i++) { const th = i / 44 * TAU - Math.PI / 2, amp = (.45 + .55 * Math.sin(i * .9 + T * 7) * Math.sin(i * .37 - T * 3.1)) * (.35 + .65 * env), r0 = 46, r1 = r0 + 3 + 15 * Math.abs(amp); ctx.strokeStyle = rgba(C.nightInk, (.3 + .4 * Math.abs(amp)) * al); ctx.beginPath(); ctx.moveTo(CX + dx + Math.cos(th) * r0, CY + 3 + Math.sin(th) * r0); ctx.lineTo(CX + dx + Math.cos(th) * r1, CY + 3 + Math.sin(th) * r1); ctx.stroke(); }
    }
    function drawB(ctx, T) {
      letterbox(ctx); ctx.save(); clipStage(ctx);
      const m = mot(T), la = io(seg(T, .9, 2.4)) * (1 - io(seg(T, 9.2, 9.8))), cx = camX(T), gp = gA(T) > .02 ? ghost(T) : null;
      nightBG(ctx, T, la);
      const pd = [3, 8, 16];
      stars.forEach(s => { const br = .5 + .3 * m * Math.sin((T / 10 * s.n + s.ph) * TAU), x = s.x + cx * pd[s.z]; ctx.beginPath(); ctx.arc(x, s.y, s.r, 0, TAU); ctx.fillStyle = rgba(C.nightInk, br * (s.z === 2 ? .55 : 1)); ctx.fill(); });
      aurora(ctx, T, gp);
      flowLines(ctx, T, io(seg(T, 4.8, 5.6)) * (1 - io(seg(T, 8.0, 8.6))), gp, cx * 6);
      const sal = io(seg(T, 3.4, 4.2)) * (1 - io(seg(T, 9.0, 9.6))); armillary(ctx, T, sal, cx * 10);
      bars(ctx, T, io(seg(T, 8.0, 8.4)) * (1 - io(seg(T, 9.0, 9.4))), cx * 10);
      // 钴蓝点：静止时在中心，环出现后绕环
      const op = ringPt(0, T * 1.6, 34, .35 * (T - 3.6), .35 + .55 * io(seg(T, 5, 6.6))); dot(ctx, lerp(CX, CX + cx * 10 + op[0], sal), lerp(CY + 3, CY + 3 + op[1], sal), lerp(2.4, 2.8, sal));
      if (gp) { const a = gA(T); ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = rgba(C.nightInk, .9); ctx.lineWidth = .9; ctx.beginPath(); ctx.arc(gp.x, gp.y, 4.5, 0, TAU); ctx.stroke(); dot(ctx, gp.x, gp.y, .9, C.nightInk); ctx.restore(); }
      grainStage(ctx, .12); ctx.restore();
      overlay(ctx, T, { right: m < .5 ? 'motion · reduce' : 'motion · full' });
    }
    function drawA(ctx, T) {
      const g = ctx.createLinearGradient(0, 0, 400, 250); g.addColorStop(0, '#2A1470'); g.addColorStop(.5 + .12 * Math.sin(T / 10 * TAU), '#7B61FF'); g.addColorStop(1, '#FF5A8A'); ctx.fillStyle = g; ctx.fillRect(0, 0, 400, 250);
      [['#3DE0C4', .3], ['#FFD84A', .45], ['#FF5A8A', .6]].forEach(([c, y], i) => { ctx.beginPath(); for (let x = 0; x <= 400; x += 10) { const yy = y * 250 + 16 * Math.sin(x / 60 + T / 10 * TAU * (i + 1)); x ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); } ctx.lineTo(400, 250); ctx.lineTo(0, 250); ctx.closePath(); ctx.fillStyle = rgba(c, .16); ctx.fill(); });
      const rr = api.rng(Math.floor(T * 30) + 1); for (let i = 0; i < 110; i++) { ctx.beginPath(); ctx.arc(rr() * 400, rr() * 250, .8 + rr() * 2.4, 0, TAU); ctx.fillStyle = rgba(RB[i % 4], .35 + rr() * .5); ctx.fill(); }
      const og = ctx.createRadialGradient(190, 100, 4, 200, 112, 62); og.addColorStop(0, '#fff'); og.addColorStop(.35, '#B69CFF'); og.addColorStop(1, 'rgba(123,97,255,0)'); ctx.fillStyle = og; ctx.beginPath(); ctx.arc(200, 112, 62 + 4 * Math.sin(T * 5), 0, TAU); ctx.fill();
      ctx.save(); ctx.shadowColor = 'rgba(255,255,255,.9)'; ctx.shadowBlur = 14; ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 2; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(200, 112, 40, 14 + i * 9, T / 10 * TAU * (i + 1), 0, TAU); ctx.stroke(); } ctx.restore();
      const gp = ghost(T); ctx.save(); ctx.shadowColor = '#FFD84A'; ctx.shadowBlur = 16; dot(ctx, gp.x, gp.y, 6, '#FFD84A'); ctx.restore();
    }
    return {
      draw(ctx, T, m) { m ? drawB(ctx, T) : drawA(ctx, T); },
      active(T) {
        const a = [];
        if (has(T, 0, .9) || has(T, 9.2, 10)) a.push('reduced-motion');
        if (has(T, .9, 2.6)) a.push('seeded-random');
        if (has(T, 1.2, 3.4)) a.push('layered-atmosphere');
        if (has(T, 2.4, 4.4)) a.push('aurora');
        if (has(T, 3.6, 5.0)) a.push('studio-light-3d');
        if (has(T, 5.0, 6.6)) a.push('orbit-drift');
        if (has(T, 4.8, 6.6)) a.push('flow-field');
        if (has(T, 5.2, 8.4)) a.push('ghost-cursor');
        if (has(T, 5.4, 6.8)) a.push('cursor-reactive');
        if (has(T, 6.8, 8.2)) a.push('parallax-depth');
        if (has(T, 8.2, 9.2)) a.push('audio-reactive');
        return uniq(a);
      },
    };
  });

  /* ══════════════ sc-longread ══════════════
   * 纸色舞台上一个 9:16 细线页面框：一列衬线标题 + 细线文字行滚动；进度是页面顶缘一道光束。
   *  0.0–1.6  静止：衬线大标题 + mono 期号 + 细线行，四周大面积留白                   → restraint, type-roles
   *  1.6–3.0  慢缓动滚动一屏，其后 0.6s 停住；细线行进入视口时上浮淡入；顶缘光束变长     → slow-ease, scroll-reveal, progress-metaphor, s-longread
   *  2.6–5.0  一条细曲线随滚动被画出，经过的节点依次点亮成钴蓝点                       → draw-on-scroll
   *  3.6–5.0  第二次慢滚；固定场景段的底色随滚动由纸色渐变到夜色，月亮升起、星点渐显     → scroll-interpolate(4.0–7.0)
   *  5.6–7.0  第三次慢滚；夜色段里的大字被一道光扫亮，扫完保持亮                       → light-on-text
   *  7.0–8.6  停住：网点渐变块（印刷网点 + 纸纹），周围留白                            → print-texture, restraint(7.6–)
   *  9.0–10   减少动态版：不滚动，内容淡出再在页首淡入（只用透明度）                    → reduced-motion
   */
  combo('sc-longread', function (api) {
    const FW = 104, FH = 146, FX = CX - FW / 2, FY = CY - FH / 2;
    const stops = [[0, 0], [1.6, 0], [3.0, 130], [3.6, 130], [5.0, 270], [5.6, 270], [7.0, 410], [9.5, 410]];
    const scrollOf = T => { if (T >= 9.5) return 0; for (let i = 1; i < stops.length; i++) if (T <= stops[i][0]) { const a = stops[i - 1], b = stops[i]; return a[1] === b[1] ? a[1] : lerp(a[1], b[1], slow(seg(T, a[0], b[0]))); } return 410; };
    const MIXc = (a, b, e) => { e = cl(e); const p = parseInt(a.slice(1), 16), q = parseInt(b.slice(1), 16), c = i => Math.round(((p >> i) & 255) * (1 - e) + ((q >> i) & 255) * e); return 'rgb(' + c(16) + ',' + c(8) + ',' + c(0) + ')'; };
    const curve = u => ({ x: 52 + 34 * Math.sin(u * TAU * 1.25 + .6), y: 190 + u * 92 });
    const NODES = [.08, .38, .68, .97];
    const spkA = mkSpark(api.rng(3), 26);
    function ln(ctx, y, w, a) { hair(ctx, 10, y, 10 + w, y, rgba(C.ink, a == null ? .5 : a), 1); }
    function drawPage(ctx, T, s, rd) {
      const R = (top, fn) => { const p = seg(FH - 4 - (top - s), 0, 24); if (p <= .001) return; ctx.save(); ctx.globalAlpha *= p; ctx.translate(0, rd ? 0 : (1 - slow(p)) * 9); fn(); ctx.restore(); };
      // 标题（type-roles：衬线大字 + mono 期号 + 细线行）
      txt(ctx, 'No.07', 10, 20, F('mono', 11.5, 500), C.muted);
      txt(ctx, 'Slow', 10, 56, F('serif', 32, 300), C.ink); txt(ctx, 'reading', 10, 88, F('serif', 32, 300, 'italic'), C.ink);
      R(102, () => { ln(ctx, 106, 84); ln(ctx, 114, 79); ln(ctx, 122, 58); });
      // 第二屏：文字行 + 滚动绘制曲线
      R(140, () => { txt(ctx, '02', 10, 158, F('serif', 22, 300), C.ink); ln(ctx, 170, 84); ln(ctx, 178, 70); });
      const d = seg(s, 110, 270), N = 60; ctx.beginPath(); for (let i = 0; i <= N * d; i++) { const p = curve(i / N); i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); } ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.stroke();
      NODES.forEach(u => { const p = curve(u), on = d >= u; ctx.beginPath(); ctx.arc(p.x, p.y, on ? 2.6 : 2.2, 0, TAU); if (on) { ctx.fillStyle = C.accent; ctx.fill(); hair(ctx, p.x + 6, p.y, p.x + 6 + 16 * ex(seg(d, u, u + .12)), p.y, rgba(C.ink, .5), 1); } else { ctx.strokeStyle = rgba(C.ink, .3); ctx.lineWidth = .8; ctx.stroke(); } });
      // 固定场景段：底色随滚动插值（纸 → 夜）
      const k = seg(s, 200, 410), bt = 300, bh = 112; ctx.fillStyle = k < .5 ? MIXc('#E4E1DA', '#6B7391', k * 2) : MIXc('#6B7391', '#151924', (k - .5) * 2); ctx.fillRect(0, bt, FW, bh);
      ctx.save(); ctx.beginPath(); ctx.rect(0, bt, FW, bh); ctx.clip();
      for (let i = 0; i < 9; i++) { const sx = 8 + (i * 37) % 92, sy = bt + 10 + (i * 23) % 60; dot(ctx, sx, sy, 1, rgba(C.nightInk, cl((k - .45) * 2) * .8)); }
      dot(ctx, 78, lerp(bt + bh + 8, bt + 30, k), 7, MIXc('#F4F2EE', '#ECE9E2', k));
      // 大字：光束扫过后保持亮
      const wy = bt + 88; txt(ctx, 'Night', 10, wy, F('serif', 30, 300), rgba(k > .5 ? C.nightInk : C.ink, k > .5 ? .3 : .6));
      const bx = lerp(-20, FW + 20, seg(s, 320, 400)); if (k > .5) { ctx.save(); ctx.beginPath(); ctx.moveTo(0, bt + 50); ctx.lineTo(bx + 8, bt + 50); ctx.lineTo(bx - 8, bt + 100); ctx.lineTo(0, bt + 100); ctx.closePath(); ctx.clip(); txt(ctx, 'Night', 10, wy, F('serif', 30, 300), C.nightInk); ctx.restore(); if (seg(s, 320, 400) < 1) { const g = ctx.createLinearGradient(bx - 14, 0, bx + 14, 0); g.addColorStop(0, 'rgba(255,240,200,0)'); g.addColorStop(.5, 'rgba(255,240,200,.14)'); g.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = g; ctx.fillRect(bx - 14, bt + 50, 28, 50); } }
      ctx.restore();
      // 印刷网点块
      R(432, () => { ctx.save(); ctx.beginPath(); ctx.rect(10, 436, 84, 62); ctx.clip(); for (let y = 439; y < 498; y += 5) for (let x = 10 + ((y - 439) / 5 % 2) * 2.5; x < 96; x += 5) { const t = cl((x - 10) / 84 * .6 + (y - 436) / 62 * .4), r = .3 + 2.1 * Math.pow(t, 1.3); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = rgba(C.ink, .8); ctx.fill(); } ctx.restore(); ctx.strokeStyle = rgba(C.ink, .4); ctx.lineWidth = .8; ctx.strokeRect(10, 436, 84, 62); });
      R(506, () => { ln(ctx, 514, 84); ln(ctx, 522, 66); ln(ctx, 530, 48); });
    }
    function drawB(ctx, T) {
      letterbox(ctx); paperStage(ctx); ctx.save(); clipStage(ctx);
      const s = scrollOf(T), rd = T >= 9.0, al = T < 9 ? 1 : T < 9.5 ? 1 - io(seg(T, 9, 9.5)) : io(seg(T, 9.5, 10));
      K.card(ctx, FX, FY, FW, FH, { r: 2, fill: C.paper, elev: 0 });
      ctx.save(); ctx.beginPath(); ctx.rect(FX, FY, FW, FH); ctx.clip(); ctx.globalAlpha = al; ctx.translate(FX, FY - s); drawPage(ctx, T, s, rd); ctx.restore();
      ctx.lineWidth = 1; ctx.strokeStyle = rgba(C.ink, .7); ctx.strokeRect(FX, FY, FW, FH);
      // 进度光束：页面顶缘，末端发光点
      const pr = cl(s / 410); if (pr > .003) { const ex1 = FX + FW * pr; ctx.fillStyle = C.ink; ctx.fillRect(FX, FY - 3.5, FW * pr, 1.4); const g = ctx.createRadialGradient(ex1, FY - 2.8, 0, ex1, FY - 2.8, 7); g.addColorStop(0, rgba(C.accent, .5)); g.addColorStop(1, rgba(C.accent, 0)); ctx.fillStyle = g; ctx.fillRect(ex1 - 8, FY - 11, 16, 16); dot(ctx, ex1, FY - 2.8, 2); }
      ctx.restore(); grainStage(ctx, .16);
      overlay(ctx, T, { right: T >= 9 ? 'motion · reduce' : '1440×900 · scroll' });
    }
    function drawA(ctx, T) {
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 400, 250);
      const x = 150, y = 14, W = 100, H = 222, s = 420 * (.5 - .5 * Math.cos(T / 10 * TAU));
      K.card(ctx, x, y, W, H, { r: 10, fill: '#fff', elev: 3 }); ctx.save(); K.rr(ctx, x, y, W, H, 10); ctx.clip(); ctx.translate(x, y - s);
      const hg = ctx.createLinearGradient(0, 0, W, 130); hg.addColorStop(0, '#7B61FF'); hg.addColorStop(1, '#FF5A8A'); ctx.fillStyle = hg; ctx.fillRect(0, 0, W, 130); txt(ctx, 'Slow', 10, 70, F('sans', 26, 800), '#fff'); txt(ctx, 'reading', 10, 96, F('sans', 22, 700), '#FFD84A');
      for (let i = 0; i < 6; i++) { const top = 150 + i * 70, p = E.bouncy(seg(s + 222 - top, 0, 60)); ctx.save(); ctx.translate(0, (1 - p) * 40); ctx.globalAlpha = cl(p * 2); K.card(ctx, 8, top, W - 16, 56, { r: 10, fill: '#fff', elev: 2 }); ctx.fillStyle = RB[i % 4]; K.rr(ctx, 14, top + 8, 40, 40, 8); ctx.fill(); [.7, .5].forEach((f, j) => K.line(ctx, 60, top + 20 + j * 12, 30 * f * 1.3, 4, RB[(i + j + 1) % 4])); ctx.restore(); }
      ctx.restore();
      const pg = ctx.createLinearGradient(x, 0, x + W, 0); pg.addColorStop(0, '#FF5A8A'); pg.addColorStop(.5, '#FFD84A'); pg.addColorStop(1, '#3DE0C4'); ctx.fillStyle = pg; ctx.fillRect(x, y, W * cl(s / 420), 4);
      sparks(ctx, spkA, T, x, y, W, H);
    }
    return {
      draw(ctx, T, m) { m ? drawB(ctx, T) : drawA(ctx, T); },
      active(T) {
        const a = [];
        if (has(T, 0, 1.6) || has(T, 7.6, 8.8)) a.push('restraint');
        if (has(T, 0, 1.6)) a.push('type-roles');
        if (has(T, 1.6, 3.0) || has(T, 6.0, 7.0)) a.push('scroll-reveal');
        if (has(T, 1.6, 3.0) || has(T, 3.6, 5.0) || has(T, 5.6, 7.0)) a.push('slow-ease', 'progress-metaphor');
        if (has(T, 2.6, 5.0)) a.push('draw-on-scroll');
        if (has(T, 4.0, 7.0)) a.push('scroll-interpolate');
        if (has(T, 5.6, 7.0)) a.push('light-on-text');
        if (has(T, 7.0, 8.6)) a.push('print-texture');
        if (has(T, 1.6, 9.0)) a.push('s-longread');
        if (has(T, 9.0, 10)) a.push('reduced-motion');
        return uniq(a);
      },
    };
  });

  /* ══════════════ sc-uimotion ══════════════
   * 纸色舞台，一个焦点 = 一枚细线轮廓形体 + 里面一个钴蓝点。轮廓/点只做同一件事：变形。
   *  0.0–1.0  舞台等比放大到位，画面只有黑白灰 + 一个钴蓝点                           → fixed-stage, one-accent
   *  1.0–2.5  钴蓝点沿细轨道弹簧到位，轻微过冲                                       → spring, beat-grid(1.0–7.0)
   *  2.5–3.5  点长成胶囊：前沿先冲出，后沿追上，拉伸再收；带 4 个子帧残影              → dual-spring, subframe-blur(2.5–3.1)
   *  3.5–5.0  同一个轮廓依次：圆角矩形 → 圆，不切镜                                   → shape-morph
   *  5.0–6.5  镜头推近，形体占画面约 60%，再退回                                      → zoom-to-fill, subframe-blur(5.0–5.7)
   *  7.0–8.0  形体横移两次：12fps 阶梯（帧刻度逐格点亮）→ 60fps 平滑                    → duration-fps
   *  8.0–8.9  幽灵光标拖动时间线来回，形体精确回到任意时刻                             → seek-t, ghost-cursor
   *  8.9–9.4  虚线光晕/过冲被划掉，只剩干净的形体                                     → anti-slop
   *  9.4–10   形体收回成起始的点，首尾同帧                                            → loop-seam
   */
  combo('sc-uimotion', function (api) {
    const S = (t, f, z) => E.spring(t, f, z == null ? ZT : z);
    const CYs = 97.5, DR = 5;
    const stp = (T, v0, steps) => { let prev = v0, v = v0; for (const [t0, val, f] of steps) { if (T >= t0) { v = prev + (val - prev) * S(T - t0, f); } prev = val; } return v; };
    const scOf = T => T < 5 ? .94 + .06 * io(seg(T, 0, 1.0)) : 1 - .06 * io(seg(T, 9.4, 10));
    function shapeAt(T) {
      let L = stp(T, 113, [[1.0, 273, 2.6], [2.5, 189, 3.4], [3.5, 168, 2.6], [4.5, 178, 2.6]]);
      let R = stp(T, 123, [[1.0, 283, 2.6], [2.62, 211, 2.4], [3.5, 232, 2.6], [4.5, 222, 2.6]]);
      let h = stp(T, 10, [[2.5, 22, 2.6], [3.5, 44, 2.6]]);
      let r = stp(T, 5, [[2.5, 11, 2.6], [3.5, 9, 2.6], [4.5, 22, 2.6]]);
      let lA = seg(T, 2.4, 2.9);
      let zs = 1 + 1.4 * (T < 6.5 ? io(seg(T, 5.0, 6.0)) : 1 - io(seg(T, 6.5, 7.0)));
      let dx = 0; if (T >= 7 && T < 7.5) { const tq = Math.floor(T * 12) / 12; dx = 70 * seg(tq, 7.0, 7.4167); } else if (T >= 7.5 && T < 8.0) dx = 70 * (1 - seg(T, 7.5, 8.0));
      if (T >= 9.4) { const q = io(seg(T, 9.4, 10)); L = lerp(178, 113, q); R = lerp(222, 123, q); h = lerp(44, 10, q); r = lerp(22, 5, q); lA = 1 - q; zs = 1; dx = 0; }
      return { L, R, h, r, lA, zs, dx };
    }
    function drawShape(ctx, st, al) {
      ctx.save(); ctx.globalAlpha *= al; ctx.translate(CX, CYs); ctx.scale(st.zs, st.zs); ctx.translate(-CX, -CYs);
      if (st.lA > .01) { K.rr(ctx, st.L + st.dx, CYs - st.h / 2, st.R - st.L, st.h, st.r); ctx.strokeStyle = rgba(C.ink, .85 * st.lA); ctx.lineWidth = 1 / st.zs; ctx.stroke(); }
      dot(ctx, (st.L + st.R) / 2 + st.dx, CYs, DR); ctx.restore();
    }
    const spkA = mkSpark(api.rng(8), 32);
    function drawB(ctx, T) {
      letterbox(ctx); ctx.save(); const sc = scOf(T); ctx.translate(CX, CY); ctx.scale(sc, sc); ctx.translate(-CX, -CY); paperStage(ctx); clipStage(ctx);
      // 轨道
      const ta = T < 2.5 ? 1 : T < 3.2 ? 1 - io(seg(T, 2.5, 3.2)) : T < 9.4 ? 0 : io(seg(T, 9.4, 10));
      if (ta > .01) { hair(ctx, 118, CYs, 278, CYs, rgba(C.ink, .28 * ta), .8); [118, 278].forEach(x => hair(ctx, x, CYs - 4, x, CYs + 4, rgba(C.ink, .4 * ta), .8)); }
      // 时间与 seek
      let Tv = T, Td = T, scrub = false;
      if (T >= 8.0 && T < 8.9) { const q = seg(T, 8.0, 8.9); Td = q < .5 ? lerp(8.0, 2.2, io(q / .5)) : lerp(2.2, 8.9, io((q - .5) / .5)); Tv = Td; scrub = true; }
      const st = shapeAt(Tv);
      if ((T >= 2.5 && T < 3.1) || (T >= 5.0 && T < 5.7)) for (let k = 4; k >= 1; k--) drawShape(ctx, shapeAt(T - k * .03), .15);
      drawShape(ctx, st, 1);
      // 帧刻度（duration-fps）
      if (T >= 7.0 && T < 8.0) { const n = Math.round(seg(Math.floor(T * 12) / 12, 7.0, 7.4167) * 5), a = eo(seg(T, 7.0, 7.2)) * (1 - seg(T, 7.8, 8.0)); for (let i = 0; i < 6; i++) { const on = T < 7.5 && i === n; ctx.fillStyle = on ? C.accent : rgba(C.ink, .4 * a); ctx.fillRect(200 + 14 * i - .6, CYs + 34, 1.2, on ? 7 : 4.5); } }
      // anti-slop：虚线光晕/过冲被划掉
      if (T >= 8.9 && T < 9.5) { const a = io(seg(T, 8.9, 9.05)) * (1 - io(seg(T, 9.3, 9.5))), k = seg(T, 9.05, 9.3); ctx.save(); ctx.globalAlpha = a; ctx.setLineDash([2, 3]); ctx.strokeStyle = rgba(C.ink, .45); ctx.lineWidth = .8; [32, 42].forEach(rr => { ctx.beginPath(); ctx.arc(CX, CYs, rr, 0, TAU); ctx.stroke(); }); ctx.setLineDash([]); hair(ctx, CX - 40, CYs + 40, CX - 40 + 80 * ex(k), CYs + 40 - 80 * ex(k), C.accent, 1); ctx.restore(); }
      // seek 幽灵光标由 overlay 画
      ctx.restore(); grainStage(ctx, .1);
      overlay(ctx, Td, { beats: true, ghost: scrub, right: T >= 7 && T < 8 ? (T < 7.5 ? '12 fps' : '60 fps') : '1920×1080 · fit' });
    }
    function drawA(ctx, T) {
      const g = ctx.createLinearGradient(0, 0, 400, 250); g.addColorStop(0, '#3B1E8A'); g.addColorStop(.5 + .12 * Math.sin(T / 10 * TAU), '#7B61FF'); g.addColorStop(1, '#FF5A8A'); ctx.fillStyle = g; ctx.fillRect(0, 0, 400, 250);
      RB.forEach((c, i) => { const a = T / 10 * TAU * (i + 1); ctx.beginPath(); ctx.arc(200 + 120 * Math.cos(a), 125 + 70 * Math.sin(a), 22 + 6 * i, 0, TAU); ctx.fillStyle = rgba(c, .3); ctx.fill(); });
      sparks(ctx, spkA, T, 0, 0, 400, 250);
      const b = [1, 2.5, 3.5, 4.5, 5, 7, 9]; let last = -9; b.forEach(x => { if (T >= x) last = x; }); const dt = T - last, sc = last < 0 ? 1 : E.bouncy(cl(dt / .7)) * .5 + .75 + .12 * Math.sin(dt * 14) * Math.exp(-dt * 3);
      ctx.save(); ctx.translate(200, 125); ctx.scale(sc, sc); ctx.shadowColor = 'rgba(123,97,255,.6)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
      const cg = ctx.createLinearGradient(-60, -40, 60, 40); cg.addColorStop(0, '#8B5CF6'); cg.addColorStop(1, '#3B82F6'); K.rr(ctx, -62, -40, 124, 80, 22); ctx.fillStyle = cg; ctx.fill(); ctx.restore();
      if (dt < .8) { ctx.strokeStyle = 'rgba(255,255,255,' + (.7 * (1 - dt / .8)) + ')'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(200, 125, 40 + dt * 200, 0, TAU); ctx.stroke(); }
      for (let i = 0; i < 3; i++) dot(ctx, 176 + i * 24, 125, 5, RB[(i + 1) % 4]);
    }
    return {
      draw(ctx, T, m) { m ? drawB(ctx, T) : drawA(ctx, T); },
      active(T) {
        const a = [];
        if (has(T, 0, 1.0)) a.push('fixed-stage', 'one-accent');
        if (has(T, 1.0, 2.5)) a.push('spring');
        if (has(T, 1.0, 7.0)) a.push('beat-grid');
        if (has(T, 2.5, 3.5)) a.push('dual-spring');
        if (has(T, 2.5, 3.1) || has(T, 5.0, 5.7)) a.push('subframe-blur');
        if (has(T, 3.5, 5.0)) a.push('shape-morph');
        if (has(T, 5.0, 6.5)) a.push('zoom-to-fill');
        if (has(T, 7.0, 8.0)) a.push('duration-fps');
        if (has(T, 8.0, 8.9)) a.push('seek-t', 'ghost-cursor');
        if (has(T, 8.9, 9.4)) a.push('anti-slop');
        if (has(T, 9.4, 10)) a.push('loop-seam');
        return uniq(a);
      },
    };
  });
})();
