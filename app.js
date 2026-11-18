/* Rita Lätt – steg-för-steg-ritapp för barn. Ingen inloggning, ingen server. */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const LESSONS = window.LESSONS;
  const PAPER = window.PAPER_LESSONS || [];

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
    const pg = $('grid-paper');
    pg.innerHTML = '';
    for (const l of PAPER) {
      const b = document.createElement('button');
      b.className = 'card';
      b.style.setProperty('--card-bg', l.bg);
      b.innerHTML = `<svg viewBox="${l.zoom}">` + paperMarks(l, l.steps.length - 1, false) + '</svg>' +
        `<div class="name">${l.name}</div>` +
        `<div class="level">${'●'.repeat(l.level)}${'○'.repeat(3 - l.level)}</div>` +
        (stars['p-' + l.id] ? '<div class="star">⭐</div>' : '');
      b.onclick = () => openPaper(l);
      pg.appendChild(b);
    }
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
    $('paper').hidden = screen !== 'paper';
    $('done').hidden = true;
    $('done').classList.remove('paper-done');
    if (screen !== 'paper') releaseWake();
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
    if (!$('draw').hidden || !$('paper').hidden) e.preventDefault();
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

  // ---------- Uppläsning på svenska ----------
  let voices = [], voiceWarned = false;
  const hasSpeech = 'speechSynthesis' in window;
  function loadVoices() { if (hasSpeech) voices = speechSynthesis.getVoices() || []; }
  function swedishVoice() {
    const sv = voices.filter((v) => /^sv([-_]|$)/i.test(v.lang || ''));
    if (!sv.length) return null;
    const score = (v) => (/alva|klara|oskar|svenska|swedish/i.test(v.name) ? 2 : 0) +
      (/premium|enhanced|förbättrad/i.test(v.name) ? 3 : 0) + (v.localService ? 1 : 0);
    return sv.sort((x, y) => score(y) - score(x))[0];
  }
  if (hasSpeech) {
    loadVoices();
    speechSynthesis.addEventListener && speechSynthesis.addEventListener('voiceschanged', loadVoices);
  }
  function speakNow(text) {
    loadVoices();
    const v = swedishVoice();
    if (voices.length && !v) {
      // Enheten har röster men ingen svensk: var hellre tyst än läs svenska med fel röst.
      if (!voiceWarned) { voiceWarned = true; $('voice-hint').hidden = false; }
      return;
    }
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = v ? v.lang.replace('_', '-') : 'sv-SE';
      if (v) u.voice = v;
      u.rate = 0.9;
      speechSynthesis.speak(u);
    } catch (e) { /* ok */ }
  }
  // Förinspelade ljudfiler (audio/, skapas med tools/generate_audio.py) låter
  // naturligare och likadant på alla enheter. Saknas en fil används rösten ovan.
  let clips = {};
  const player = new Audio();
  player.preload = 'auto';
  fetch('audio/index.json').then((r) => r.ok ? r.json() : {}).then((m) => { clips = m || {}; }).catch(() => {});
  function playClip(text) {
    const file = clips[text];
    if (!file) return false;
    if (hasSpeech) speechSynthesis.cancel();
    player.pause();
    player.src = 'audio/' + file;
    const p = player.play();
    // Om filen inte går att spela (t.ex. offline utan cache): läs upp med rösten i stället.
    if (p && p.catch) p.catch((e) => { if (e && e.name !== 'AbortError' && soundOn) speakVoice(text); });
    return true;
  }
  function stopSpeech() {
    player.pause();
    if (hasSpeech) speechSynthesis.cancel();
  }
  function speak(text) {
    if (!soundOn) return;
    if (playClip(text)) return;
    speakVoice(text);
  }
  function speakVoice(text) {
    if (!hasSpeech) return;
    player.pause();
    loadVoices();
    if (voices.length) return speakNow(text);
    // Rösterna laddas ibland lite senare: vänta kort innan vi läser.
    let done = false;
    const go = () => { if (!done) { done = true; speakNow(text); } };
    speechSynthesis.addEventListener && speechSynthesis.addEventListener('voiceschanged', go, { once: true });
    setTimeout(go, 600);
  }

  // Delar en bana i separata streck och ritar dem ett i taget.
  const STROKE_MS = 1100, STROKE_GAP = 250;
  function strokeParts(d) { return d.split(/(?=M)/).map((x) => x.trim()).filter(Boolean); }
  function strokeAnim(d, cls, start, fadeAfter) {
    const parts = strokeParts(d);
    const total = start + parts.length * (STROKE_MS + STROKE_GAP);
    let html = '';
    parts.forEach((p, i) => {
      const delay = start + i * (STROKE_MS + STROKE_GAP);
      let anim = `pdraw ${STROKE_MS}ms ease-in-out ${delay}ms 1 forwards`;
      if (fadeAfter) anim += `, pfade 500ms linear ${total}ms 1 forwards`;
      html += `<path class="${cls}" pathLength="1" style="animation:${anim}" d="${p}"/>`;
    });
    return { html, end: total };
  }

  function renderGuide() {
    const g = $('guide');
    if (!lesson || !guideOn) { g.innerHTML = ''; return; }
    let html = '';
    lesson.steps.forEach((s, i) => {
      if (i < step) html += `<path class="old" d="${s.d}"/>`;
      else if (i === step) html += `<path class="now" d="${s.d}"/>` + strokeAnim(s.d, 'demo', 250, true).html;
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
      if (!soundOn) stopSpeech();
    }, 700);
  });
  for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) {
    $('btn-speak').addEventListener(ev, () => clearTimeout(holdTimer));
  }
  function renderSound() {
    $('btn-speak').textContent = $('p-speak').textContent = soundOn ? '🔊' : '🔇';
  }
  $('btn-home').onclick = () => {
    stopSpeech();
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

  // ---------- Rita på papper ----------
  let pLesson = null, pStep = 0, wake = null;

  // Bygger SVG för allt som finns på pappret vid ett visst steg.
  // animate=true markerar det nya steget i blått och ritar upp det.
  function paperMarks(l, upto, animate) {
    const erasedBy = {};
    l.steps.forEach((s, i) => { for (const id of (s.erase || [])) erasedBy[id] = i; });
    let fills = '', lines = '', t = 300;
    const line = (d, tone, cur, extra) => {
      if (!cur) return `<path class="${tone}${extra}" d="${d}"/>`;
      const a = strokeAnim(d, tone + ' cur seq', t, false);
      t = a.end;
      return a.html;
    };
    l.steps.forEach((s, i) => {
      if (i > upto) return;
      const gone = erasedBy[s.id];
      if (gone !== undefined && gone < upto) return;
      if (gone !== undefined && gone === upto && !animate) return;
      const erasing = gone === upto ? ' erasing' : '';
      const cur = animate && i === upto;
      if (s.fillHatch) fills += `<path class="fh${cur ? ' fillin' : ''}" d="${s.fillHatch}"/>`;
      if (s.fillDark) fills += `<path class="fd${cur ? ' fillin' : ''}" d="${s.fillDark}"/>`;
      if (s.light) lines += line(s.light, 'light tl', cur, erasing);
      if (s.dark) lines += line(s.dark, 'dark', cur, erasing);
      for (const d of (s.dots || [])) {
        lines += `<circle class="dot${cur ? ' cur' : erasing}" cx="${d[0]}" cy="${d[1]}" r="1.1"/>`;
      }
    });
    return fills + lines;
  }

  // Barnets hand sedd uppifrån: kontur, veck över knogarna och naglar.
  // Fingertopparna ligger precis innanför mät-prickarna i lektionerna, armen fortsätter ut nedanför pappret.
  const HAND =
    '<path class="skin" d="' +
    'M40.6 126C40.6 122.3 40.7 118.7 40.7 115C40.7 112.2 41.4 109.3 40.8 106.5' +
    'C40.3 104 38.7 101.8 37.5 99.5C36.5 97.4 35.6 95.2 34.3 93.4C32.4 90.9 30 88.9 27.9 86.6' +
    'C25.8 84.3 23.6 82 21.8 79.5C21.2 78.6 20.6 77.5 20.6 76.4C20.6 75.3 21.1 74.2 21.9 73.4' +
    'C22.7 72.6 23.9 72.2 25 72.2C26.1 72.2 27.1 72.9 28 73.5C29.3 74.3 30.4 75.4 31.5 76.5' +
    'C32.6 77.5 33.5 78.8 34.7 79.7C34.9 79.9 35.6 79.9 35.6 79.6C35.5 75.7 35 71.8 34.5 68' +
    'C34.1 65.4 33.4 63 33 60.5C32.6 57.9 32 55.4 31.8 52.9C31.8 52 31.8 50.9 32.3 50.2' +
    'C32.8 49.4 33.7 48.8 34.6 48.6C35.5 48.4 36.5 48.6 37.3 49.1C38.1 49.6 38.5 50.5 38.9 51.4' +
    'C39.7 53.7 40.2 56.1 40.8 58.5C41.4 60.9 41.6 63.4 42.5 65.7C42.8 66.4 43.4 67.9 44.1 67.5' +
    'C45.2 66.8 45.3 65.1 45.5 63.7C45.9 61.1 45.6 58.4 45.7 55.8C45.8 53.1 45.8 50.5 46.3 47.9' +
    'C46.4 46.9 46.7 45.9 47.4 45.3C48 44.6 49.1 44.2 50 44.2C50.9 44.2 51.9 44.6 52.6 45.3' +
    'C53.3 46 53.5 47 53.7 47.9C54 50.6 54 53.2 54 55.9C54.1 58.6 53.7 61.2 54 63.9' +
    'C54.2 65.2 54.1 68.1 55.5 67.8C57.1 67.5 56.8 64.8 57.4 63.2C58 61.2 58.5 59.2 59.1 57.2' +
    'C59.7 55.2 60.2 53.2 61.1 51.3C61.5 50.5 62 49.6 62.7 49.1C63.5 48.7 64.5 48.6 65.4 48.8' +
    'C66.3 49 67.1 49.7 67.5 50.4C68 51.2 68 52.2 67.9 53.1C67.6 55.5 66.9 57.8 66.4 60.2' +
    'C65.9 62.6 64.8 64.8 64.6 67.2C64.4 69.4 64.7 71.5 65.2 73.6C65.4 74.2 66 75 66.6 75' +
    'C68 74.8 69 73.7 70.2 73.1C71.4 72.5 72.7 71.9 74 71.5C74.7 71.3 75.6 71 76.4 71.3' +
    'C77.2 71.5 77.9 72.1 78.3 72.8C78.7 73.5 78.8 74.5 78.6 75.2C78.3 76 77.6 76.6 77 77.1' +
    'C76 78 74.8 78.7 73.7 79.4C72.5 80.2 71 80.4 70.2 81.4C69.1 82.6 68.6 84.1 68.2 85.6' +
    'C67.7 87.3 67.9 89.2 67.4 91C66.6 93.7 65.7 96.5 64.4 99C63.1 101.7 60.5 103.7 59.6 106.5' +
    'C58.8 109.2 59.4 112.2 59.4 115C59.4 118.7 59.5 122.3 59.5 126L60.5 400L39.5 400Z' +
    '"/>' +
    '<path class="crease" d="M28 83.4Q29.2 80.9 31.7 79.8M35.2 61.9Q37.2 60.6 39.5 61M47.6 57.6Q49.8 56.7 52.1 57.6M60 60.5Q62.3 60.1 64.2 61.6M69.5 75.4Q71.2 76.7 71.4 78.8"/>' +
    '<g class="nail">' +
    '<ellipse cx="25.6" cy="77.3" rx="2.6" ry="3.4" transform="rotate(-44.2 25.6 77.3)"/>' +
    '<ellipse cx="35.5" cy="53" rx="2.2" ry="2.8" transform="rotate(-12.1 35.5 53)"/>' +
    '<ellipse cx="49.9" cy="48.8" rx="2.2" ry="2.9" transform="rotate(0.7 49.9 48.8)"/>' +
    '<ellipse cx="64.3" cy="53" rx="2.1" ry="2.7" transform="rotate(15.1 64.3 53)"/>' +
    '<ellipse cx="74.8" cy="74.7" rx="1.9" ry="2.5" transform="rotate(61.4 74.8 74.7)"/>' +
    '</g>';

  function renderPaper(announce) {
    const s = pLesson.steps[pStep], n = pLesson.steps.length;
    const svg = $('p-svg');
    svg.setAttribute('viewBox', s.view === 'paper' ? '-4 -4 108 149' : pLesson.zoom);
    svg.innerHTML =
      '<defs><pattern id="hatch" width="1.5" height="1.5" patternUnits="userSpaceOnUse" patternTransform="rotate(-50)">' +
      '<line x1="0" y1="0.75" x2="1.5" y2="0.75" stroke="#55586a" stroke-width="0.42"/></pattern></defs>' +
      '<rect class="sheet" x="0" y="0" width="100" height="141" rx="1"/>' +
      (s.hand ? `<g class="hand ${s.hand}">${HAND}</g>` : '') +
      paperMarks(pLesson, pStep, true);
    $('p-text').textContent = s.text;
    const dots = $('p-dots');
    dots.innerHTML = '';
    for (let i = 0; i < n; i++) {
      const d = document.createElement('i');
      if (i <= pStep) d.className = 'on' + (i === pStep ? ' now' : '');
      dots.appendChild(d);
    }
    $('p-phase').textContent = s.phase;
    const press = $('p-press');
    press.className = 'chip press ' + (s.press || '');
    press.textContent = s.press === 'light' ? '🪶 Tryck löst' : s.press === 'hard' ? '✏️ Tryck hårdare' : '';
    $('p-prev').disabled = pStep === 0;
    $('p-next').textContent = pStep === n - 1 ? 'Klar ✓' : 'Nästa ▶';
    if (announce) speak(s.text);
  }

  async function keepAwake() {
    try {
      if ('wakeLock' in navigator && !wake) {
        wake = await navigator.wakeLock.request('screen');
        wake.addEventListener('release', () => { wake = null; });
      }
    } catch (e) { wake = null; }
  }
  function releaseWake() {
    if (wake) { try { wake.release(); } catch (e) { /* ok */ } wake = null; }
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !$('paper').hidden) keepAwake();
  });

  function openPaper(l) {
    pLesson = l; pStep = 0;
    show('paper');
    keepAwake();
    renderPaper(true);
  }
  $('p-next').onclick = () => {
    if (pStep === pLesson.steps.length - 1) {
      stars['p-' + pLesson.id] = true; store.set('stars', stars);
      $('done').classList.add('paper-done');
      $('done').hidden = false;
      confetti();
      speak('Bra jobbat!');
      return;
    }
    pStep++; renderPaper(true);
  };
  $('p-prev').onclick = () => { if (pStep > 0) { pStep--; renderPaper(true); } };
  $('p-replay').onclick = () => renderPaper(true);
  $('p-speak').onclick = () => {
    if (!soundOn) { soundOn = true; store.set('sound', true); renderSound(); }
    speak(pLesson.steps[pStep].text);
  };
  $('p-home').onclick = () => $('btn-home').onclick();

  // ---------- Start ----------
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', () => setTimeout(resize, 200));

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches;
  if (isIOS && !standalone && !store.get('hintClosed', false)) $('install-hint').hidden = false;
  $('hint-close').onclick = () => { $('install-hint').hidden = true; store.set('hintClosed', true); };

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  $('voice-hint-close').onclick = () => { $('voice-hint').hidden = true; };

  renderPalette();
  renderSound();
  renderHome();
  show('home');
})();
