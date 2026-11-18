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

  // En grön drakhand sedd uppifrån: kontur, fjäll, knogveck och klor. (Drake i stället för
  // människohand, så slipper vi välja hudfärg.) Klornas spetsar ligger precis innanför
  // mät-prickarna i lektionerna, och armen fortsätter ut nedanför pappret.
  const HAND =
    '<path class="skin" d="' +
    'M38.6 128C38.7 124 38.7 120 38.9 116C39 113 39.9 110 39.6 107C39.4 104.9 38.4 102.9 37.6 101' +
    'C36.6 98.6 35.6 96 34 93.9C32.4 91.5 30 89.6 28.1 87.4C26.1 85.2 24.1 83 22.5 80.6' +
    'C21.8 79.7 21.2 78.5 21.2 77.3C21.2 76.2 21.7 74.9 22.6 74.1C23.4 73.3 24.7 72.8 25.9 72.8' +
    'C27 72.9 28.1 73.6 29.1 74.2C30.1 74.9 31 75.7 31.9 76.5C32.8 77.3 33.4 78.3 34.4 79' +
    'C34.5 79.2 34.9 79.3 35.1 79.2C35.4 79 35.6 78.7 35.5 78.5C35 74.4 34.1 70.4 33.4 66.4' +
    'C32.8 62.4 32 58.3 31.6 54.3C31.6 53.3 31.7 52.1 32.2 51.3C32.8 50.4 33.8 49.8 34.8 49.6' +
    'C35.8 49.4 36.9 49.6 37.8 50.2C38.6 50.8 39.1 51.8 39.5 52.7C40.3 54.7 40.7 56.9 41.2 59' +
    'C41.7 61 41.8 63.2 42.5 65.3C42.9 66.5 43.2 69 44.4 68.6C45.8 68.2 45.1 65.8 45.2 64.4' +
    'C45.4 61.9 45.2 59.3 45.3 56.8C45.5 54.3 45.4 51.8 45.9 49.3C46 48.2 46.3 47.1 47.1 46.4' +
    'C47.8 45.6 48.9 45.2 50 45.2C51 45.2 52.1 45.7 52.9 46.4C53.6 47.2 53.9 48.3 54.1 49.3' +
    'C54.4 51.8 54.4 54.4 54.5 56.9C54.5 59.4 54.3 61.9 54.5 64.4C54.6 66 53.8 69.3 55.4 69.2' +
    'C57.2 69.1 56.9 65.9 57.4 64.2C58 62.3 58.2 60.3 58.8 58.4C59.3 56.5 59.7 54.5 60.5 52.7' +
    'C60.9 51.8 61.4 50.8 62.2 50.3C63.1 49.7 64.2 49.6 65.2 49.8C66.1 50 67.1 50.7 67.6 51.5' +
    'C68.1 52.3 68.2 53.5 68.1 54.4C68 56.6 67.5 58.7 67.1 60.8C66.7 63 66 65 65.7 67.1' +
    'C65.5 69.7 65.1 72.3 65.6 74.8C65.7 75.3 66.7 75.3 67.2 75.1C68.1 74.9 68.9 74 69.7 73.6' +
    'C70.6 73.1 71.6 72.6 72.5 72.3C73.4 72.1 74.3 71.7 75.2 71.9C76 72.1 76.9 72.7 77.4 73.4' +
    'C77.8 74.2 78 75.2 77.8 76.1C77.6 76.9 76.9 77.6 76.2 78.3C75.5 79 74.7 79.6 73.9 80.2' +
    'C73.1 80.8 71.9 81 71.4 81.8C70 84 69.1 86.5 68.3 89C67.2 92.1 66.9 95.5 65.6 98.5' +
    'C64.3 101.5 61.4 103.8 60.6 107C59.9 109.9 61 113 61.1 116C61.3 120 61.3 124 61.4 128L62 400' +
    'L38 400Z' +
    '"/>' +
    '<path class="scale" d="' +
    'M43.3 79Q45 81.3 46.7 79M48.8 77.5Q50.5 79.8 52.2 77.5M54.3 79Q56 81.3 57.7 79M40.8 84.5' +
    'Q42.5 86.8 44.2 84.5M46.3 84Q48 86.3 49.7 84M51.8 84Q53.5 86.3 55.2 84M57.3 84.5' +
    'Q59 86.8 60.7 84.5M43.8 90Q45.5 92.3 47.2 90M54.8 90Q56.5 92.3 58.2 90M42.3 95.5' +
    'Q44 97.8 45.7 95.5M48.3 95Q50 97.3 51.7 95M54.3 95.5Q56 97.8 57.7 95.5M44.8 109' +
    'Q46.5 111.3 48.2 109M51.8 109Q53.5 111.3 55.2 109M48.3 114.5Q50 116.8 51.7 114.5M42.8 119.5' +
    'Q44.5 121.8 46.2 119.5M53.8 119.5Q55.5 121.8 57.2 119.5M48.3 125Q50 127.3 51.7 125M43.3 131' +
    'Q45 133.3 46.7 131M53.3 131Q55 133.3 56.7 131M48.3 137Q50 139.3 51.7 137M43.3 143' +
    'Q45 145.3 46.7 143M53.3 143Q55 145.3 56.7 143' +
    '"/>' +
    '<path class="crease" d="' +
    'M29.5 85.3Q30.9 82.7 33.5 81.4M35.1 63.6Q37.3 62.3 39.8 62.7M47.4 59.6Q49.9 58.7 52.4 59.6' +
    'M59.9 62.4Q62.4 62 64.5 63.4M68.8 76.2Q70.7 77.6 71.1 79.9' +
    '"/>' +
    '<path class="claw" d="' +
    'M26 81.7C22.9 79 21.8 74.7 21.9 73.4C23.2 73.4 27.4 74.6 30 77.8Q29.7 81.5 26 81.7ZM33.8 56.7' +
    'C32.7 53.3 33.9 49.6 34.6 48.6C35.6 49.3 38.1 52.2 38.5 55.8Q36.5 58.4 33.8 56.7ZM47.5 52.2' +
    'C47.1 48.5 49.1 45.1 50 44.2C50.9 45.1 52.8 48.5 52.4 52.2Q49.9 54.4 47.5 52.2ZM61.4 55.7' +
    'C61.9 52.2 64.4 49.5 65.4 48.8C66 49.9 67.1 53.4 66 56.8Q63.2 58.3 61.4 55.7ZM71.2 74.8' +
    'C73.7 72.9 77 72.8 78.2 72.9C77.8 74 76.3 77 73.4 78.4Q70.7 77.6 71.2 74.8Z' +
    '"/>';

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
