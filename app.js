/* Rita Lätt – steg-för-steg-ritapp för barn. Ingen inloggning, ingen server. */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const LESSONS = window.LESSONS;

  const COLORS = ['#EF476F', '#FF9F1C', '#FFD23F', '#8AC926', '#2EC27E', '#4CC9F0', '#3A86FF',
    '#8E5BEF', '#FF8FC7', '#A0643C', '#F2C9A0', '#9AA0A6', '#FFFFFF'];
  const INK = '#2B2D42';
  const SIZES = [1.3, 3.2, 7.5]; // i ritrutans enheter (rutan är 100 bred)
  const VB = 108, VB_MIN = -4; // måste matcha viewBox på #guide

  // ---------- Sparade småsaker (bara på den här iPaden) ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ok */ } },
  };
  let stars = store.get('stars', {});
  let soundOn = store.get('sound', true);

  // ---------- Startsida ----------
  function lessonSvg(lesson) {
    return `<svg viewBox="${VB_MIN} ${VB_MIN} ${VB} ${VB}">` +
      lesson.steps.map((s) => `<path d="${s.d}"/>`).join('') + '</svg>';
  }

  function renderHome() {
    const grid = $('grid');
    grid.innerHTML = '';
    const free = document.createElement('button');
    free.className = 'card free';
    free.innerHTML = '<div class="emoji">🖍️</div><div class="name">Rita fritt</div><div class="level">&nbsp;</div>';
    free.onclick = () => openLesson(null);
    grid.appendChild(free);
    for (const l of LESSONS) {
      const b = document.createElement('button');
      b.className = 'card';
      b.style.setProperty('--card-bg', l.bg);
      b.innerHTML = lessonSvg(l) + `<div class="name">${l.name}</div>` +
        `<div class="level">${'●'.repeat(l.level)}${'○'.repeat(3 - l.level)}</div>` +
        (stars[l.id] ? '<div class="star">⭐</div>' : '');
      b.onclick = () => openLesson(l);
      grid.appendChild(b);
    }
  }

  function show(screen) {
    $('home').hidden = screen !== 'home';
    $('draw').hidden = screen !== 'draw';
    $('done').hidden = true;
  }

  // ---------- Rityta ----------
  const stage = $('stage');
  const cLine = $('c-line'), cColor = $('c-color');
  const xLine = cLine.getContext('2d'), xColor = cColor.getContext('2d');
  let W = 0, H = 0, dpr = 1, unit = 1;

  let strokes = [];       // allt som ritats (för ångra och omritning)
  let current = null;     // pågående streck
  let activePointer = null;
  let tool = 'pen';       // 'pen' | 'color' | 'eraser'
  let color = COLORS[0];
  const sizeFor = { pen: 0, color: 2, eraser: 2 };

  let lesson = null, step = 0, guideOn = true;

  function resize() {
    const r = stage.getBoundingClientRect();
    if (!r.width || !r.height) return;
    W = r.width; H = r.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    unit = Math.min(W, H) / VB;
    for (const c of [cLine, cColor]) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
    redraw();
  }

  // Skärmpixlar <-> ritrutans enheter (så teckningen följer med när iPaden vrids)
  const toUnit = (px, py) => ({ x: (px - W / 2) / unit + 50, y: (py - H / 2) / unit + 50 });
  function setTransform(ctx) {
    ctx.setTransform(dpr * unit, 0, 0, dpr * unit, dpr * (W / 2 - 50 * unit), dpr * (H / 2 - 50 * unit));
  }

  function targets(s) {
    if (s.erase) return [xLine, xColor];
    return [s.layer === 'line' ? xLine : xColor];
  }
  function prep(ctx, s) {
    setTransform(ctx);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.lineWidth = s.size;
    ctx.globalCompositeOperation = s.erase ? 'destination-out' : 'source-over';
    ctx.strokeStyle = ctx.fillStyle = s.erase ? '#000' : s.color;
  }
  const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

  function drawDot(s) {
    for (const ctx of targets(s)) {
      prep(ctx, s);
      ctx.beginPath(); ctx.arc(s.pts[0].x, s.pts[0].y, s.size / 2, 0, Math.PI * 2); ctx.fill();
    }
  }
  // Ritar bara den senaste biten av strecket (mjukt, med kurvor mellan mittpunkter)
  function drawLastSegment(s) {
    const p = s.pts, n = p.length;
    if (n < 2) return;
    for (const ctx of targets(s)) {
      prep(ctx, s);
      ctx.beginPath();
      if (n === 2) {
        const m = mid(p[0], p[1]);
        ctx.moveTo(p[0].x, p[0].y); ctx.lineTo(m.x, m.y);
      } else {
        const a = mid(p[n - 3], p[n - 2]), b = mid(p[n - 2], p[n - 1]);
        ctx.moveTo(a.x, a.y); ctx.quadraticCurveTo(p[n - 2].x, p[n - 2].y, b.x, b.y);
      }
      ctx.stroke();
    }
  }
  function drawTail(s) {
    const p = s.pts, n = p.length;
    if (n < 2) return;
    const m = mid(p[n - 2], p[n - 1]);
    for (const ctx of targets(s)) {
      prep(ctx, s);
      ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(p[n - 1].x, p[n - 1].y); ctx.stroke();
    }
  }
  function drawWhole(s) {
    const p = s.pts;
    if (p.length === 1) return drawDot(s);
    for (const ctx of targets(s)) {
      prep(ctx, s);
      ctx.beginPath();
      ctx.moveTo(p[0].x, p[0].y);
      for (let i = 1; i < p.length - 1; i++) {
        const m = mid(p[i], p[i + 1]);
        ctx.quadraticCurveTo(p[i].x, p[i].y, m.x, m.y);
      }
      ctx.lineTo(p[p.length - 1].x, p[p.length - 1].y);
      ctx.stroke();
    }
  }
  function clearCanvases() {
    for (const ctx of [xLine, xColor]) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  }
  function redraw() {
    clearCanvases();
    for (const s of strokes) { if (s.clear) clearCanvases(); else drawWhole(s); }
    if (current) drawWhole(current);
  }

  // ---------- Pekare (finger och Apple Pencil) ----------
  function pointFromEvent(e) {
    const r = cLine.getBoundingClientRect();
    return toUnit(e.clientX - r.left, e.clientY - r.top);
  }
  cLine.addEventListener('pointerdown', (e) => {
    if (activePointer !== null) return;
    e.preventDefault();
    activePointer = e.pointerId;
    try { cLine.setPointerCapture(e.pointerId); } catch (err) { /* ok */ }
    current = {
      layer: tool === 'pen' ? 'line' : 'color',
      erase: tool === 'eraser',
      color: tool === 'pen' ? INK : color,
      size: SIZES[sizeFor[tool]] * (tool === 'eraser' ? 1.4 : 1),
      pts: [pointFromEvent(e)],
    };
    drawDot(current);
  });
  cLine.addEventListener('pointermove', (e) => {
    if (e.pointerId !== activePointer || !current) return;
    e.preventDefault();
    const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
    for (const ev of (events.length ? events : [e])) {
      const p = pointFromEvent(ev), last = current.pts[current.pts.length - 1];
      if (Math.hypot(p.x - last.x, p.y - last.y) < 0.25) continue;
      current.pts.push(p);
      drawLastSegment(current);
    }
  });
  function endStroke(e) {
    if (e.pointerId !== activePointer) return;
    activePointer = null;
    if (!current) return;
    drawTail(current);
    strokes.push(current);
    current = null;
  }
  cLine.addEventListener('pointerup', endStroke);
  cLine.addEventListener('pointercancel', endStroke);
  cLine.addEventListener('lostpointercapture', endStroke);

  // Stoppa zoom och andra gester som stör när man ritar
  for (const ev of ['gesturestart', 'gesturechange', 'contextmenu', 'dblclick']) {
    document.addEventListener(ev, (e) => e.preventDefault());
  }
  document.addEventListener('touchmove', (e) => {
    if (!$('draw').hidden) e.preventDefault();
  }, { passive: false });

  // ---------- Verktyg ----------
  function renderPalette() {
    const pal = $('palette');
    pal.innerHTML = '';
    for (const c of COLORS) {
      const b = document.createElement('button');
      b.className = 'swatch';
      b.style.background = c;
      b.dataset.color = c;
      b.setAttribute('aria-label', 'Färg');
      b.onclick = () => { color = c; setTool('color'); };
      pal.appendChild(b);
    }
  }
  function setTool(t) {
    tool = t;
    $('tool-pen').classList.toggle('sel', t === 'pen');
    $('tool-eraser').classList.toggle('sel', t === 'eraser');
    for (const b of document.querySelectorAll('.swatch')) {
      b.classList.toggle('sel', t === 'color' && b.dataset.color === color);
    }
    for (const b of document.querySelectorAll('.size')) {
      b.classList.toggle('sel', Number(b.dataset.size) === sizeFor[t]);
    }
  }
  $('tool-pen').onclick = () => setTool('pen');
  $('tool-eraser').onclick = () => setTool('eraser');
  for (const b of document.querySelectorAll('.size')) {
    b.onclick = () => { sizeFor[tool] = Number(b.dataset.size); setTool(tool); };
  }
  $('btn-undo').onclick = () => { if (strokes.length) { strokes.pop(); redraw(); } };
  $('btn-clear').onclick = () => {
    if (strokes.length && !strokes[strokes.length - 1].clear) { strokes.push({ clear: true }); redraw(); }
  };

  // ---------- Lektion och steg ----------
  const totalSteps = () => (lesson ? lesson.steps.length + 1 : 1); // +1 = färglägg
  const isColorStep = () => !!lesson && step === lesson.steps.length;

  function stepText() {
    if (!lesson) return 'Rita precis vad du vill!';
    if (isColorStep()) return 'Nu är det dags att färglägga!';
    return lesson.steps[step].text;
  }

  function speak(text) {
    if (!soundOn || !('speechSynthesis' in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'sv-SE'; u.rate = 0.9; u.pitch = 1.1;
      const v = speechSynthesis.getVoices().find((x) => x.lang && x.lang.toLowerCase().startsWith('sv'));
      if (v) u.voice = v;
      speechSynthesis.speak(u);
    } catch (e) { /* ok */ }
  }

  function renderGuide() {
    const g = $('guide');
    if (!lesson || !guideOn) { g.innerHTML = ''; return; }
    let html = '';
    lesson.steps.forEach((s, i) => {
      if (i < step) html += `<path class="old" d="${s.d}"/>`;
      else if (i === step) html += `<path class="now" d="${s.d}"/><path class="demo" pathLength="1" d="${s.d}"/>`;
    });
    g.innerHTML = html;
  }

  function renderStep(announce) {
    $('step-text').textContent = stepText();
    const dots = $('dots');
    dots.innerHTML = '';
    if (lesson) {
      for (let i = 0; i < totalSteps(); i++) {
        const d = document.createElement('i');
        if (i <= step) d.className = 'on' + (i === step ? ' now' : '');
        dots.appendChild(d);
      }
    }
    $('btn-prev').hidden = !lesson;
    $('btn-prev').disabled = step === 0;
    $('btn-next').textContent = (!lesson || isColorStep()) ? 'Klar ✓' : 'Nästa ▶';
    $('btn-guide').hidden = !lesson;
    $('btn-guide').classList.toggle('off', !guideOn);
    renderGuide();
    if (announce) speak(stepText());
  }

  function openLesson(l) {
    lesson = l; step = 0; guideOn = true;
    strokes = []; current = null; activePointer = null;
    show('draw');
    setTool(l ? 'pen' : 'color');
    resize();
    renderStep(true);
  }

  $('btn-next').onclick = () => {
    if (!lesson || isColorStep()) return finish();
    step++;
    if (isColorStep()) { guideOn = false; setTool('color'); }
    renderStep(true);
  };
  $('btn-prev').onclick = () => {
    if (step === 0) return;
    step--; guideOn = true;
    setTool('pen');
    renderStep(true);
  };
  $('btn-guide').onclick = () => { guideOn = !guideOn; renderStep(false); };
  let held = false;
  $('btn-speak').onclick = () => {
    if (held) { held = false; return; }
    if (!soundOn) { soundOn = true; store.set('sound', true); renderSound(); }
    speak(stepText());
  };
  // Håll inne högtalaren för att stänga av/sätta på rösten
  let holdTimer = null;
  $('btn-speak').addEventListener('pointerdown', () => {
    held = false;
    holdTimer = setTimeout(() => {
      held = true;
      soundOn = !soundOn; store.set('sound', soundOn); renderSound();
      if (!soundOn && 'speechSynthesis' in window) speechSynthesis.cancel();
    }, 700);
  });
  for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) {
    $('btn-speak').addEventListener(ev, () => clearTimeout(holdTimer));
  }
  function renderSound() {
    $('btn-speak').textContent = soundOn ? '🔊' : '🔇';
  }
  $('btn-home').onclick = () => {
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    renderHome(); show('home');
  };

  // ---------- Klar: visa och spara teckningen ----------
  function exportCanvas() {
    const out = document.createElement('canvas');
    out.width = cLine.width; out.height = cLine.height;
    const x = out.getContext('2d');
    x.fillStyle = '#fff'; x.fillRect(0, 0, out.width, out.height);
    x.drawImage(cColor, 0, 0); x.drawImage(cLine, 0, 0);
    return out;
  }
  let exportBlob = null;

  function finish() {
    const out = exportCanvas();
    $('done-img').src = out.toDataURL('image/png');
    exportBlob = null;
    out.toBlob((b) => { exportBlob = b; }, 'image/png');
    if (lesson) { stars[lesson.id] = true; store.set('stars', stars); }
    $('done').hidden = false;
    confetti();
    speak('Bra jobbat!');
  }
  function confetti() {
    const box = $('confetti');
    box.innerHTML = '';
    for (let i = 0; i < 60; i++) {
      const p = document.createElement('i');
      p.style.left = Math.random() * 100 + '%';
      p.style.background = COLORS[i % (COLORS.length - 1)];
      p.style.animationDuration = 1.8 + Math.random() * 2 + 's';
      p.style.animationDelay = Math.random() * 0.8 + 's';
      box.appendChild(p);
    }
  }
  $('btn-save').onclick = async () => {
    if (!exportBlob) return;
    const name = 'teckning-' + (lesson ? lesson.id : 'fri') + '.png';
    const file = new File([exportBlob], name, { type: 'image/png' });
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file] }); // på iPad: välj "Spara bild"
        return;
      }
    } catch (e) { if (e && e.name === 'AbortError') return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(exportBlob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  };
  $('btn-continue').onclick = () => { $('done').hidden = true; };
  $('btn-new').onclick = () => { renderHome(); show('home'); };

  // ---------- Start ----------
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', () => setTimeout(resize, 200));
  if ('speechSynthesis' in window) speechSynthesis.getVoices();

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches;
  if (isIOS && !standalone && !store.get('hintClosed', false)) $('install-hint').hidden = false;
  $('hint-close').onclick = () => { $('install-hint').hidden = true; store.set('hintClosed', true); };

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  renderPalette();
  renderSound();
  renderHome();
  show('home');
})();
