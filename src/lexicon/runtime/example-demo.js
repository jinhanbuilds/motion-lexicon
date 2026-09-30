/* Reference demo showing the conventions. Builders: copy the pattern, not the content. */
LEX.register('spring', {
  mount(el, api) {
    const { ctx, cv } = api.canvas();
    const C = api.colors;
    let overshoot = 0.06, fired = 0;            // fired = time of the last (re)trigger
    const rows = [
      { name: 'linear', f: (t) => api.ease.linear(t / 0.9) },
      { name: 'ease-in-out', f: (t) => api.ease.inOut(t / 0.9) },
      { name: 'spring', f: (t) => api.ease.spring(t, 1.6, api.ease.zetaFor(overshoot)) },
    ];
    api.onClick(() => { fired = api.t; });     // click = retrigger
    return {
      param(name, v) { if (name === 'overshoot') { overshoot = Math.max(0.0001, v); fired = api.t; } },
      frame(t) {
        const w = api.w, h = api.h; if (!w) return;
        const local = (t - fired) % 2.6;         // loop every 2.6s
        ctx.fillStyle = C.stage; ctx.fillRect(0, 0, w, h);
        const x0 = w * 0.3, x1 = w * 0.86, rowH = h / (rows.length + 1);
        rows.forEach((r, i) => {
          const y = rowH * (i + 0.9);
          ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
          const p = r.f(local);
          const hl = r.name === 'spring';
          ctx.fillStyle = hl ? C.accent : C.ink;
          ctx.beginPath(); ctx.arc(api.lerp(x0, x1, p), y, Math.max(5, h * 0.035), 0, Math.PI * 2); ctx.fill();
          ctx.font = api.font('mono', Math.max(10, h * 0.042)); ctx.fillStyle = hl ? C.accent : C.muted;
          ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(r.name, x0 - 12, y);
        });
      },
    };
  },
});
