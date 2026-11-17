// Ritlektioner. Alla koordinater är i en ruta 0–100.
// Varje steg har en text (läses upp) och en SVG-bana "d" som visar vad som ska ritas.
(function () {
  const C = (x, y, r) => `M${x - r} ${y} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0`;
  const E = (x, y, rx, ry) => `M${x - rx} ${y} a${rx} ${ry} 0 1 0 ${2 * rx} 0 a${rx} ${ry} 0 1 0 ${-2 * rx} 0`;
  // Lutande ellips: ry är längs den lutade axeln, deg = lutning (minus = toppen åt vänster).
  const RE = (x, y, rx, ry, deg) => {
    const a = deg * Math.PI / 180, f = (v) => +v.toFixed(2);
    const ux = Math.sin(a) * ry, uy = -Math.cos(a) * ry;
    return `M${f(x + ux)} ${f(y + uy)} A${rx} ${ry} ${deg} 0 1 ${f(x - ux)} ${f(y - uy)} ` +
      `A${rx} ${ry} ${deg} 0 1 ${f(x + ux)} ${f(y + uy)}`;
  };
  const rays = (cx, cy, r1, r2, n) => {
    let d = '';
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const f = (v) => v.toFixed(1);
      d += `M${f(cx + Math.cos(a) * r1)} ${f(cy + Math.sin(a) * r1)} L${f(cx + Math.cos(a) * r2)} ${f(cy + Math.sin(a) * r2)} `;
    }
    return d;
  };

  window.LESSONS = [
    {
      id: 'sol', name: 'Sol', level: 1, bg: '#FFF3B0',
      steps: [
        { text: 'Rita en stor rund cirkel.', d: C(50, 50, 18) },
        { text: 'Rita solstrålar runt om.', d: rays(50, 50, 25, 37, 8) },
        { text: 'Rita två ögon och en glad mun.', d: C(43, 46, 2) + C(57, 46, 2) + 'M41 54 Q50 64 59 54' },
      ],
    },
    {
      id: 'fisk', name: 'Fisk', level: 1, bg: '#BDE7FF',
      steps: [
        { text: 'Rita en oval kropp.', d: E(45, 50, 28, 18) },
        { text: 'Rita en stjärtfena som en triangel.', d: 'M73 50 L92 34 L92 66 Z' },
        { text: 'Rita ett öga och en mun.', d: C(30, 45, 3) + 'M19 56 Q25 58 28 53' },
        { text: 'Rita en fena där uppe och en där nere.', d: 'M38 33 Q48 18 58 34 M40 67 Q48 79 54 67' },
        { text: 'Rita ränder och några bubblor.', d: 'M45 36 Q52 50 45 64 M56 37 Q63 50 56 63 ' + C(10, 34, 3) + C(6, 23, 2) },
      ],
    },
    {
      id: 'blomma', name: 'Blomma', level: 1, bg: '#FFD6E8',
      steps: [
        { text: 'Rita en liten cirkel i mitten.', d: C(50, 35, 8) },
        { text: 'Rita sex runda blad runt cirkeln.', d: C(67, 35, 9) + C(58.5, 49.7, 9) + C(41.5, 49.7, 9) + C(33, 35, 9) + C(41.5, 20.3, 9) + C(58.5, 20.3, 9) },
        { text: 'Rita en lång stjälk.', d: 'M50 56 Q47 76 50 96' },
        { text: 'Rita två gröna blad på stjälken.', d: 'M49 80 Q30 68 26 80 Q38 89 49 81 M50 74 Q68 61 74 73 Q62 83 50 76' },
      ],
    },
    {
      id: 'glass', name: 'Glass', level: 2, bg: '#FFE2C2',
      steps: [
        { text: 'Rita en strut som en triangel.', d: 'M34 50 L50 92 L66 50 Z' },
        { text: 'Rita en stor glasskula.', d: 'M32 50 A19 19 0 1 1 68 50' },
        { text: 'Rita en kula till högst upp.', d: 'M37 31 A14 14 0 1 1 63 31' },
        { text: 'Rita ett körsbär på toppen.', d: C(50, 8, 4) + 'M50 4 Q52 0 57 0' },
        { text: 'Rita rutor på struten.', d: 'M40 50 L56 76 M52 50 L60.5 64 M60 50 L44 76 M48 50 L39.5 64' },
      ],
    },
    {
      id: 'hus', name: 'Hus', level: 2, bg: '#D9F2C4',
      steps: [
        { text: 'Rita en stor fyrkant.', d: 'M25 45 H75 V88 H25 Z' },
        { text: 'Rita ett tak som en triangel.', d: 'M18 45 L50 15 L82 45 Z' },
        { text: 'Rita en dörr med ett handtag.', d: 'M44 88 V66 H56 V88 ' + C(53, 78, 1) },
        { text: 'Rita två fönster.', d: 'M30 53 H40 V63 H30 Z M35 53 V63 M30 58 H40 M60 53 H70 V63 H60 Z M65 53 V63 M60 58 H70' },
        { text: 'Rita en skorsten med rök.', d: 'M64 28 V16 H72 V35.5 M68 12 Q63 9 68 6 Q73 3 69 0' },
      ],
    },
    {
      id: 'katt', name: 'Katt', level: 2, bg: '#FFE0B5',
      steps: [
        { text: 'Rita ett runt huvud.', d: C(50, 55, 28) },
        { text: 'Rita två spetsiga öron.', d: 'M27 39 L26 14 L44 28 M73 39 L74 14 L56 28' },
        { text: 'Rita två ögon.', d: C(40, 50, 3.5) + C(60, 50, 3.5) },
        { text: 'Rita en nos och en mun.', d: 'M46 60 L54 60 L50 65 Z M50 65 Q45 73 39 68 M50 65 Q55 73 61 68' },
        { text: 'Rita morrhår.', d: 'M34 62 L10 58 M34 66 L10 71 M66 62 L90 58 M66 66 L90 71' },
      ],
    },
    {
      id: 'bil', name: 'Bil', level: 2, bg: '#D7DCFF',
      steps: [
        { text: 'Rita en lång fyrkant.', d: 'M12 56 H88 V72 H12 Z' },
        { text: 'Rita ett tak.', d: 'M28 56 L36 38 H64 L72 56' },
        { text: 'Rita två runda hjul.', d: C(30, 73, 9) + C(70, 73, 9) + C(30, 73, 3) + C(70, 73, 3) },
        { text: 'Rita två fönster.', d: 'M36 53 L41 42 H48 V53 Z M52 53 V42 H59 L64 53 Z' },
        { text: 'Rita en lampa och ett handtag.', d: C(84, 61, 2) + 'M47 61 H54' },
      ],
    },
    {
      id: 'raket', name: 'Raket', level: 3, bg: '#CFC9FF',
      steps: [
        { text: 'Rita en hög fyrkant.', d: 'M38 30 H62 V72 H38 Z' },
        { text: 'Rita en rund nos högst upp.', d: 'M38 30 Q50 0 62 30' },
        { text: 'Rita ett runt fönster.', d: C(50, 44, 6) },
        { text: 'Rita två vingar.', d: 'M38 54 L24 76 L38 72 M62 54 L76 76 L62 72' },
        { text: 'Rita eld som sprutar ut.', d: 'M42 72 Q40 86 50 97 Q60 86 58 72 M46 72 Q46 82 50 88 Q54 82 54 72' },
      ],
    },
    {
      id: 'fjaril', name: 'Fjäril', level: 3, bg: '#C9F5E6',
      steps: [
        { text: 'Rita en lång kropp och ett runt huvud.', d: E(50, 53, 4, 18) + C(50, 30, 5) },
        { text: 'Rita två stora vingar där uppe.', d: 'M54 42 Q70 10 88 24 Q94 44 54 52 M46 42 Q30 10 12 24 Q6 44 46 52' },
        { text: 'Rita två mindre vingar där nere.', d: 'M54 54 Q84 54 80 74 Q66 88 54 64 M46 54 Q16 54 20 74 Q34 88 46 64' },
        { text: 'Rita två antenner.', d: 'M48 26 Q44 14 38 12 M52 26 Q56 14 62 12' },
        { text: 'Rita prickar på vingarna.', d: C(72, 32, 5) + C(28, 32, 5) + C(68, 68, 4) + C(32, 68, 4) },
      ],
    },
  ];
})();

// ---------- Rita på papper ----------
// Koordinater: pappret är 100 brett och 141 högt (A4 på höjden).
// Varje steg kan ha: light (hjälplinjer), dark (kontur), dots (prickar),
// fillDark / fillHatch (skuggning), erase (id på steg som suddas), hand ('full' | 'ghost').
(function () {
  const C = (x, y, r) => `M${x - r} ${y} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0`;
  const E = (x, y, rx, ry) => `M${x - rx} ${y} a${rx} ${ry} 0 1 0 ${2 * rx} 0 a${rx} ${ry} 0 1 0 ${-2 * rx} 0`;
  // Lutande ellips: ry är längs den lutade axeln, deg = lutning (minus = toppen åt vänster).
  const RE = (x, y, rx, ry, deg) => {
    const a = deg * Math.PI / 180, f = (v) => +v.toFixed(2);
    const ux = Math.sin(a) * ry, uy = -Math.cos(a) * ry;
    return `M${f(x + ux)} ${f(y + uy)} A${rx} ${ry} ${deg} 0 1 ${f(x - ux)} ${f(y - uy)} ` +
      `A${rx} ${ry} ${deg} 0 1 ${f(x + ux)} ${f(y + uy)}`;
  };

  window.PAPER_LESSONS = [
    {
      id: 'bjorn', name: 'Björn', bg: '#EBD8C3', level: 3,
      zoom: '12 30 76 80',
      steps: [
        { id: 'hand', phase: 'Mät', view: 'paper', hand: 'full',
          text: 'Lägg pappret på höjden. Lägg handen mitt på pappret och spreta med fingrarna.' },
        { id: 'dots3', phase: 'Mät', view: 'paper', hand: 'full', press: 'light',
          text: 'Sätt tre prickar: vid tummen, vid långfingret och vid lillfingret.',
          dots: [[20, 72], [50, 42], [80, 72]] },
        { id: 'dot4', phase: 'Mät', view: 'paper', hand: 'ghost', press: 'light',
          text: 'Lyft handen. Sätt en prick längst ner, där handleden låg.',
          dots: [[50, 102]] },
        { id: 'circle', phase: 'Hjälpformer', press: 'light',
          text: 'Rita en stor cirkel genom alla fyra prickarna. Tryck löst!',
          light: C(50, 72, 30) },
        { id: 'cross', phase: 'Hjälpformer', press: 'light',
          text: 'Rita ett kors i cirkeln. En linje uppifrån och ner, och en från sida till sida.',
          light: 'M50 42 V102 M20 70 Q50 73 80 70' },
        { id: 'earsG', phase: 'Hjälpformer', press: 'light',
          text: 'Rita två runda öron uppe på huvudet. Varje öra är tre fingrar brett.',
          light: C(27, 48, 10) + C(73, 48, 10) },
        { id: 'muzzleG', phase: 'Hjälpformer', press: 'light',
          text: 'Rita en oval för nosen, under mitten av korset. Den är fyra fingrar bred.',
          light: E(50, 84, 13, 10) },
        { id: 'head', phase: 'Kontur', press: 'hard',
          text: 'Nu trycker vi hårdare. Rita huvudet, men hoppa över där öronen sitter.',
          dark: 'M36.6 45.2 A30 30 0 0 1 63.4 45.2 M76.3 57.5 A30 30 0 1 1 23.7 57.5' },
        { id: 'ears', phase: 'Kontur', press: 'hard',
          text: 'Rita öronen, och en mindre båge inuti varje öra.',
          dark: 'M23.7 57.5 A10 10 0 1 1 36.6 45.2 M63.4 45.2 A10 10 0 1 1 76.3 57.5 ' +
            'M23 52.2 A5.5 5.5 0 1 1 31.6 45.3 M68.4 45.3 A5.5 5.5 0 1 1 77 52.2' },
        { id: 'muzzle', phase: 'Kontur', press: 'hard',
          text: 'Rita nosens oval tydligt.',
          dark: E(50, 84, 13, 10) },
        { id: 'nose', phase: 'Kontur', press: 'hard',
          text: 'Rita en nos som en mjuk triangel, högst upp i ovalen.',
          dark: 'M44 78 Q50 75.5 56 78 Q56 82 50 84.5 Q44 82 44 78 Z' },
        { id: 'mouth', phase: 'Kontur', press: 'hard',
          text: 'Rita ett kort streck ner från nosen, och en mun som två små krokar.',
          dark: 'M50 84.5 V88 M50 88 Q46 92.5 42 89.5 M50 88 Q54 92.5 58 89.5' },
        { id: 'eyes', phase: 'Kontur', press: 'hard',
          text: 'Rita två runda ögon på linjen. Ett på varje sida om mitten.',
          dark: C(38, 70, 3.6) + C(62, 70, 3.6) },
        { id: 'erase', phase: 'Sudda',
          text: 'Sudda försiktigt bort prickarna och alla ljusa hjälplinjer.',
          erase: ['dots3', 'dot4', 'circle', 'cross', 'earsG', 'muzzleG'] },
        { id: 'eyefill', phase: 'Detaljer', press: 'hard',
          text: 'Rita en liten ring i varje öga. Fyll resten av ögat svart, men lämna ringen vit.',
          fillDark: C(38, 70, 3.6) + C(39.2, 68.8, 1.1) + C(62, 70, 3.6) + C(63.2, 68.8, 1.1) },
        { id: 'fur', phase: 'Detaljer', press: 'hard',
          text: 'Rita ögonbryn, och taggig päls på kinderna och högst upp på huvudet.',
          dark: 'M33.5 63.5 Q38 61 42 63 M58 63 Q62 61 66.5 63.5 ' +
            'M21.5 80 L18.5 82 L22.5 83.5 L20 86.5 L24.5 87.5 M78.5 80 L81.5 82 L77.5 83.5 L80 86.5 L75.5 87.5 ' +
            'M46 42.5 L48 38.5 L50 42 L52 38.5 L54 42.5' },
        { id: 'nosefill', phase: 'Skugga', press: 'hard',
          text: 'Fyll nosen mörk. Lämna en liten ljus fläck så att nosen blänker.',
          fillDark: 'M44 78 Q50 75.5 56 78 Q56 82 50 84.5 Q44 82 44 78 Z ' + E(47.3, 78.8, 1.6, 0.9) },
        { id: 'earshade', phase: 'Skugga', press: 'light',
          text: 'Skugga insidan av öronen med lätta streck åt samma håll.',
          fillHatch: 'M23 52.2 A5.5 5.5 0 1 1 31.6 45.3 Z M68.4 45.3 A5.5 5.5 0 1 1 77 52.2 Z' },
        { id: 'faceshade', phase: 'Skugga', press: 'light',
          text: 'Ljuset kommer från vänster. Skugga därför högra kanten av ansiktet, och under nosen.',
          fillHatch: 'M63.4 45.2 A30 30 0 0 1 60 100.3 A48 48 0 0 0 63.4 45.2 Z ' +
            'M38.5 88.5 Q50 99.5 61.5 88.5 Q50 108 38.5 88.5 Z' },
        { id: 'done', phase: 'Klar',
          text: 'Din björn är klar! Skriv ditt namn i hörnet.' },
      ],
    },
    {
      id: 'kanin', name: 'Kanin', bg: '#D9E8C4', level: 3,
      zoom: '18 40 64 67',
      steps: [
        { id: 'hand', phase: 'Mät', view: 'paper', hand: 'full',
          text: 'Lägg pappret på höjden. Lägg handen mitt på pappret och spreta med fingrarna.' },
        { id: 'dots2', phase: 'Mät', view: 'paper', hand: 'full', press: 'light',
          text: 'Sätt två prickar: en vid pekfingret och en vid ringfingret. Där blir öronens toppar.',
          dots: [[34, 47], [66, 47]] },
        { id: 'dots2b', phase: 'Mät', view: 'paper', hand: 'ghost', press: 'light',
          text: 'Lyft handen. Sätt en prick mitt där handflatan låg, och en där handleden låg.',
          dots: [[50, 87], [50, 102]] },
        { id: 'circle', phase: 'Hjälpformer', press: 'light',
          text: 'Rita en cirkel runt mittpricken. Den ska nå ner till pricken längst ner. Tryck löst!',
          light: C(50, 87, 15) },
        { id: 'cross', phase: 'Hjälpformer', press: 'light',
          text: 'Rita ett kors i cirkeln. En linje uppifrån och ner, och en från sida till sida.',
          light: 'M50 72 V102 M35 85 Q50 88 65 85' },
        { id: 'earsG', phase: 'Hjälpformer', press: 'light',
          text: 'Rita två långa öron, som smala ovaler. De går från huvudet upp till prickarna.',
          light: RE(38.5, 61.5, 6.2, 15.2, -17.2) + ' ' + RE(61.5, 61.5, 6.2, 15.2, 17.2) },
        { id: 'muzzleG', phase: 'Hjälpformer', press: 'light',
          text: 'Rita en liten oval för nosen, precis under korset.',
          light: E(50, 92, 7, 5) },
        { id: 'head', phase: 'Kontur', press: 'hard',
          text: 'Nu trycker vi hårdare. Rita huvudet, men hoppa över där öronen sitter.',
          dark: 'M45.5 72.7 A15 15 0 0 1 54.5 72.7 M59.7 75.6 A15 15 0 1 1 40.3 75.6' },
        { id: 'ears', phase: 'Kontur', press: 'hard',
          text: 'Rita öronen, och en smalare oval inuti varje öra.',
          dark: 'M40.3 75.6 A6.2 15.2 -17.2 1 1 45.5 72.7 M54.5 72.7 A6.2 15.2 17.2 1 1 59.7 75.6 ' +
            RE(38.9, 62.9, 2.8, 10.5, -17.2) + ' ' + RE(61.1, 62.9, 2.8, 10.5, 17.2) },
        { id: 'eyes', phase: 'Kontur', press: 'hard',
          text: 'Rita två runda ögon på linjen. Ett på varje sida om mitten.',
          dark: C(43, 85, 2.8) + C(57, 85, 2.8) },
        { id: 'nose', phase: 'Kontur', press: 'hard',
          text: 'Rita en liten nos som en mjuk triangel, högst upp i ovalen.',
          dark: 'M47.6 88.6 Q50 87.6 52.4 88.6 Q51.8 90.6 50 91.4 Q48.2 90.6 47.6 88.6 Z' },
        { id: 'mouth', phase: 'Kontur', press: 'hard',
          text: 'Rita ett kort streck ner från nosen, och en mun som två små krokar.',
          dark: 'M50 91.4 V93.2 M50 93.2 Q47.8 95.8 45.5 94 M50 93.2 Q52.2 95.8 54.5 94' },
        { id: 'teeth', phase: 'Kontur', press: 'hard',
          text: 'Rita två stora framtänder under munnen, som en liten fyrkant med ett streck i mitten.',
          dark: 'M48.2 94.9 V97.8 H51.8 V94.9 M50 94.4 V97.8' },
        { id: 'erase', phase: 'Sudda',
          text: 'Sudda försiktigt bort prickarna och alla ljusa hjälplinjer.',
          erase: ['dots2', 'dots2b', 'circle', 'cross', 'earsG', 'muzzleG'] },
        { id: 'eyefill', phase: 'Detaljer', press: 'hard',
          text: 'Rita en liten ring i varje öga. Fyll resten av ögat svart, men lämna ringen vit.',
          fillDark: C(43, 85, 2.8) + C(44, 84, 0.9) + C(57, 85, 2.8) + C(58, 84, 0.9) },
        { id: 'whiskers', phase: 'Detaljer', press: 'hard',
          text: 'Rita tre morrhår på varje sida om nosen, och lite lurvig päls högst upp på huvudet.',
          dark: 'M43 91.5 L32 89.5 M43 93.5 L32 94.5 M44 95.5 L34 99 ' +
            'M57 91.5 L68 89.5 M57 93.5 L68 94.5 M56 95.5 L66 99 ' +
            'M47.5 72.3 L48.6 69.6 L50 71.8 L51.4 69.6 L52.5 72.3' },
        { id: 'nosefill', phase: 'Skugga', press: 'hard',
          text: 'Fyll nosen mörk. Lämna en liten ljus fläck så att nosen blänker.',
          fillDark: 'M47.6 88.6 Q50 87.6 52.4 88.6 Q51.8 90.6 50 91.4 Q48.2 90.6 47.6 88.6 Z ' + E(49, 88.9, 0.9, 0.5) },
        { id: 'earshade', phase: 'Skugga', press: 'light',
          text: 'Skugga insidan av öronen med lätta streck åt samma håll.',
          fillHatch: RE(38.9, 62.9, 2.8, 10.5, -17.2) + ' ' + RE(61.1, 62.9, 2.8, 10.5, 17.2) },
        { id: 'faceshade', phase: 'Skugga', press: 'light',
          text: 'Ljuset kommer från vänster. Skugga därför högra kanten av huvudet.',
          fillHatch: 'M61.5 77.4 A15 15 0 0 1 55.1 101.1 A24 24 0 0 0 61.5 77.4 Z' },
        { id: 'done', phase: 'Klar',
          text: 'Din kanin är klar! Skriv ditt namn i hörnet.' },
      ],
    },
    {
      id: 'uggla', name: 'Uggla', bg: '#E2DCF0', level: 3,
      zoom: '8 28 84 90',
      steps: [
        { id: 'hand', phase: 'Mät', view: 'paper', hand: 'full',
          text: 'Lägg pappret på höjden. Lägg handen mitt på pappret och spreta med fingrarna.' },
        { id: 'dots3', phase: 'Mät', view: 'paper', hand: 'full', press: 'light',
          text: 'Sätt tre prickar: vid tummen, vid långfingret och vid lillfingret.',
          dots: [[20, 72], [50, 42], [80, 72]] },
        { id: 'dot4', phase: 'Mät', view: 'paper', hand: 'ghost', press: 'light',
          text: 'Lyft handen. Sätt en prick längst ner, där handleden låg.',
          dots: [[50, 102]] },
        { id: 'circle', phase: 'Hjälpformer', press: 'light',
          text: 'Rita en stor cirkel genom alla fyra prickarna. Tryck löst! Det blir ugglans kropp.',
          light: C(50, 72, 30) },
        { id: 'cross', phase: 'Hjälpformer', press: 'light',
          text: 'Rita ett kors i cirkeln. Den liggande linjen ska ligga ett finger ovanför mitten.',
          light: 'M50 42 V102 M21.1 64 L78.9 64' },
        { id: 'eyesG', phase: 'Hjälpformer', press: 'light',
          text: 'Rita två stora runda ögon på den liggande linjen. De möts i mitten och är tre fingrar breda.',
          light: C(38.5, 64, 11) + C(61.5, 64, 11) },
        { id: 'tuftdots', phase: 'Hjälpformer', press: 'light',
          text: 'Sätt en prick snett ovanför cirkeln på varje sida. Där blir spetsarna på öronen.',
          dots: [[27, 36], [73, 36]] },
        { id: 'body', phase: 'Kontur', press: 'hard',
          text: 'Nu trycker vi hårdare. Rita kroppen, men hoppa över hörnen där öronen ska sitta.',
          dark: 'M39.7 43.8 A30 30 0 0 1 60.3 43.8 M71.2 50.8 A30 30 0 1 1 28.8 50.8' },
        { id: 'tufts', phase: 'Kontur', press: 'hard',
          text: 'Rita två spetsiga öron. Dra strecken upp till prickarna och ner igen.',
          dark: 'M28.8 50.8 L27 36 L39.7 43.8 M60.3 43.8 L73 36 L71.2 50.8' },
        { id: 'eyes', phase: 'Kontur', press: 'hard',
          text: 'Rita de stora ögonen tydligt.',
          dark: C(38.5, 64, 11) + C(61.5, 64, 11) },
        { id: 'pupils', phase: 'Kontur', press: 'hard',
          text: 'Rita en mindre cirkel mitt i varje öga.',
          dark: C(38.5, 64, 5) + C(61.5, 64, 5) },
        { id: 'beak', phase: 'Kontur', press: 'hard',
          text: 'Rita en liten näbb under ögonen, som en triangel som pekar nedåt.',
          dark: 'M46 73.5 Q50 72 54 73.5 L50 81 Z' },
        { id: 'wings', phase: 'Kontur', press: 'hard',
          text: 'Rita en vinge på varje sida. Böj strecken inåt och ner mot botten.',
          dark: 'M20.3 68 Q38 80 33.4 97 M79.7 68 Q62 80 66.6 97' },
        { id: 'branch', phase: 'Kontur', press: 'hard',
          text: 'Rita en gren under ugglan. Två långa streck med runda ändar, och en liten kvist.',
          dark: 'M14 105 Q50 108.5 86 104 M14 111 Q50 114 86 110 ' +
            'M14 105 Q11.5 108 14 111 M86 104 Q88.5 107 86 110 M72 105.5 Q75 100 80 98' },
        { id: 'feet', phase: 'Kontur', press: 'hard',
          text: 'Rita fötterna. Tre små streck för klorna på varje fot.',
          dark: 'M38 106.5 L40.5 101 M42 107 L42.5 101.5 M46 106.8 L45 101.8 ' +
            'M54 106.8 L55 101.8 M58 107 L57.5 101.5 M62 106.5 L59.5 101' },
        { id: 'erase', phase: 'Sudda',
          text: 'Sudda försiktigt bort prickarna och alla ljusa hjälplinjer.',
          erase: ['dots3', 'dot4', 'circle', 'cross', 'eyesG', 'tuftdots'] },
        { id: 'eyefill', phase: 'Detaljer', press: 'hard',
          text: 'Rita en liten ring i varje pupill. Fyll resten av pupillen svart, men lämna ringen vit.',
          fillDark: C(38.5, 64, 5) + C(40, 62.4, 1.6) + C(61.5, 64, 5) + C(63, 62.4, 1.6) },
        { id: 'brows', phase: 'Detaljer', press: 'hard',
          text: 'Rita ett V ovanför ögonen. Det ser ut som arga ögonbryn, men ugglan är snäll!',
          dark: 'M29.5 51.5 Q40 46.5 50 56 Q60 46.5 70.5 51.5' },
        { id: 'feathers', phase: 'Detaljer', press: 'hard',
          text: 'Rita små bågar på magen. Det är ugglans fjädrar.',
          dark: 'M39.5 87 Q42 90 44.5 87 M47.5 87 Q50 90 52.5 87 M55.5 87 Q58 90 60.5 87 ' +
            'M43.5 93 Q46 96 48.5 93 M51.5 93 Q54 96 56.5 93' },
        { id: 'wingshade', phase: 'Skugga', press: 'light',
          text: 'Skugga vingarna med lätta streck åt samma håll.',
          fillHatch: 'M20.3 68 Q38 80 33.4 97 A30 30 0 0 1 20.3 68 Z ' +
            'M79.7 68 Q62 80 66.6 97 A30 30 0 0 0 79.7 68 Z' },
        { id: 'branchshade', phase: 'Skugga', press: 'light',
          text: 'Skugga grenen också. Gå runt klorna.',
          fillHatch: 'M14 105 Q50 108.5 86 104 Q88.5 107 86 110 Q50 114 14 111 Q11.5 108 14 105 Z' },
        { id: 'done', phase: 'Klar',
          text: 'Din uggla är klar! Skriv ditt namn i hörnet.' },
      ],
    },
    {
      id: 'jatte', name: 'Stark jätte', bg: '#CFE6C0', level: 3,
      zoom: '-2 8 104 134',
      steps: [
        { id: 'hand', phase: 'Mät', view: 'paper', hand: 'full',
          text: 'Lägg pappret på höjden. Lägg handen mitt på pappret och spreta med fingrarna.' },
        { id: 'dots3', phase: 'Mät', view: 'paper', hand: 'full', press: 'light',
          text: 'Sätt tre prickar: vid tummen, vid långfingret och vid lillfingret.',
          dots: [[20, 72], [50, 42], [80, 72]] },
        { id: 'dot4', phase: 'Mät', view: 'paper', hand: 'ghost', press: 'light',
          text: 'Lyft handen. Sätt en prick längst ner, där handleden låg.',
          dots: [[50, 102]] },
        { id: 'circle', phase: 'Hjälpformer', press: 'light',
          text: 'Rita en stor cirkel genom alla fyra prickarna. Det blir jättens kropp. Tryck löst!',
          light: C(50, 72, 30) },
        { id: 'headG', phase: 'Hjälpformer', press: 'light',
          text: 'Rita en mindre cirkel ovanpå den stora, så att de nuddar varandra. Det blir huvudet.',
          light: C(50, 30, 12) },
        { id: 'armsG', phase: 'Hjälpformer', press: 'light',
          text: 'Rita armarna som streck: rakt ut åt sidan, och sedan rakt upp, som när man visar musklerna.',
          light: 'M26 55 L9 57 L11.5 30 M74 55 L91 57 L88.5 30' },
        { id: 'fistsG', phase: 'Hjälpformer', press: 'light',
          text: 'Rita en liten cirkel högst upp på varje arm. Det blir händerna.',
          light: C(11.5, 28, 5.5) + C(88.5, 28, 5.5) },
        { id: 'head', phase: 'Kontur', press: 'hard',
          text: 'Nu trycker vi hårdare. Rita huvudet med en bred haka, och ett litet öra på varje sida.',
          dark: 'M38 30 A12 12 0 0 1 62 30 Q62 39 58 42.5 Q50 45 42 42.5 Q38 39 38 30 Z ' +
            'M38.2 27 Q34 26 34 30.5 Q34.5 35 38.5 34.5 M61.8 27 Q66 26 66 30.5 Q65.5 35 61.5 34.5' },
        { id: 'face', phase: 'Kontur', press: 'hard',
          text: 'Rita ögon, tjocka ögonbryn, en rund näsa och ett glatt leende med en tand som sticker upp.',
          dark: C(45, 30, 1.6) + C(55, 30, 1.6) +
            'M41.5 26.5 Q45 24 48 26.5 M52 26.5 Q55 24 58.5 26.5 ' + E(50, 34.5, 2.6, 1.9) +
            'M44 38.5 Q50 42 56 38.5 M46.6 39.9 L47.3 37.8 L48.3 40.3' },
        { id: 'shoulders', phase: 'Kontur', press: 'hard',
          text: 'Rita en kort tjock hals, och axlarna som går snett ner åt sidorna.',
          dark: 'M44.5 43.5 L44 48 Q30 47 26 52 M55.5 43.5 L56 48 Q70 47 74 52' },
        { id: 'arms', phase: 'Kontur', press: 'hard',
          text: 'Rita armarna. Gör en stor rund bula ovanpå varje överarm – det är musklerna!',
          dark: 'M26 52 Q23 42 18 42.5 Q14 43 14.5 48 L15 34 M24 64 Q14 66 6.5 61 Q3.5 57 5 52 L7.5 34 ' +
            'M74 52 Q77 42 82 42.5 Q86 43 85.5 48 L85 34 M76 64 Q86 66 93.5 61 Q96.5 57 95 52 L92.5 34' },
        { id: 'fists', phase: 'Kontur', press: 'hard',
          text: 'Rita två knutna händer högst upp, med två böjda streck för fingrarna.',
          dark: 'M7.5 34 Q4 31 5.5 26 Q7 22 12 22.5 Q17.5 23 17.5 28 Q17.5 32 15 34 ' +
            'M9 26 Q12.5 25 16 26.5 M8.5 30 Q12 29 15.5 30 ' +
            'M92.5 34 Q96 31 94.5 26 Q93 22 88 22.5 Q82.5 23 82.5 28 Q82.5 32 85 34 ' +
            'M91 26 Q87.5 25 84 26.5 M91.5 30 Q88 29 84.5 30' },
        { id: 'body', phase: 'Kontur', press: 'hard',
          text: 'Rita kroppens sidor från armhålorna ner mot midjan. Kroppen blir smalare längst ner.',
          dark: 'M24 64 Q23 82 32 100 M76 64 Q77 82 68 100' },
        { id: 'shorts', phase: 'Kontur', press: 'hard',
          text: 'Rita ett bälte med ett spänne, och ett par shorts under.',
          dark: 'M32 100 L68 100 L68.5 104 L31.5 104 Z M47 99.5 H53 V104.5 H47 Z ' +
            'M31.5 104 L29 118 L48 118 L50 110 L52 118 L71 118 L68.5 104' },
        { id: 'legs', phase: 'Kontur', press: 'hard',
          text: 'Rita två korta tjocka ben och stora skor.',
          dark: 'M32 118 Q31 128 33 133 M46 118 Q47 128 45 133 M54 118 Q53 128 55 133 M68 118 Q69 128 67 133 ' +
            'M33 133 Q25 133 25 138 L45.5 138 L45 133 Z M55 133 L54.5 138 L75 138 Q75 133 67 133 Z' },
        { id: 'erase', phase: 'Sudda',
          text: 'Sudda försiktigt bort prickarna och alla ljusa hjälplinjer.',
          erase: ['dots3', 'dot4', 'circle', 'headG', 'armsG', 'fistsG'] },
        { id: 'eyefill', phase: 'Detaljer', press: 'hard',
          text: 'Fyll ögonen svarta, och rita en liten hårlock högst upp på huvudet.',
          fillDark: C(45, 30, 1.6) + C(55, 30, 1.6),
          dark: 'M50 18 Q48 14 50.5 12.5 Q53 12.3 52.5 14.6 Q52 16 50.8 15.6' },
        { id: 'muscles', phase: 'Detaljer', press: 'hard',
          text: 'Rita bröstmusklerna som två bågar, och magmusklerna som rutor på magen.',
          dark: 'M34 62 Q42 68 50 63 Q58 68 66 62 M50 66 V94 M43 76 H57 M44 85 H56' },
        { id: 'power', phase: 'Detaljer', press: 'hard',
          text: 'Rita tre korta streck ovanför varje hand. Då ser man hur stark jätten är!',
          dark: 'M5 18 L2.5 15 M11.5 17 V13 M18 18.5 L20.5 15.5 M95 18 L97.5 15 M88.5 17 V13 M82 18.5 L79.5 15.5' },
        { id: 'bodyshade', phase: 'Skugga', press: 'light',
          text: 'Ljuset kommer från vänster. Skugga därför högra sidan av kroppen och högra armen.',
          fillHatch: 'M76 64 Q77 82 68 100 L63 100 Q71 84 72 64 Z M95 52 L92.5 34 L90 34 L91.5 52 Z' },
        { id: 'shortshade', phase: 'Skugga', press: 'light',
          text: 'Skugga shortsen med lätta streck åt samma håll.',
          fillHatch: 'M31.5 104 L29 118 L48 118 L50 110 L52 118 L71 118 L68.5 104 Z' },
        { id: 'done', phase: 'Klar',
          text: 'Din starka jätte är klar! Skriv ditt namn i hörnet.' },
      ],
    },
    {
      id: 'spindel', name: 'Spindel', bg: '#D6E0EA', level: 3,
      zoom: '14 26 72 80',
      steps: [
        { id: 'hand', phase: 'Mät', view: 'paper', hand: 'full',
          text: 'Lägg pappret på höjden. Lägg handen mitt på pappret och spreta med fingrarna.' },
        { id: 'dots3', phase: 'Mät', view: 'paper', hand: 'full', press: 'light',
          text: 'Sätt tre prickar: vid tummen, vid långfingret och vid lillfingret.',
          dots: [[20, 72], [50, 42], [80, 72]] },
        { id: 'dot4', phase: 'Mät', view: 'paper', hand: 'ghost', press: 'light',
          text: 'Lyft handen. Sätt en prick längst ner, där handleden låg.',
          dots: [[50, 102]] },
        { id: 'circle', phase: 'Hjälpformer', press: 'light',
          text: 'Rita en stor cirkel genom alla fyra prickarna. Det blir spindelnätet. Tryck löst!',
          light: C(50, 72, 30) },
        { id: 'cross', phase: 'Hjälpformer', press: 'light',
          text: 'Rita ett kors i cirkeln. En linje uppifrån och ner, och en från sida till sida.',
          light: 'M50 42 V102 M20 72 H80' },
        { id: 'diag', phase: 'Hjälpformer', press: 'light',
          text: 'Rita ett snett kryss också, mellan linjerna. Nu ser cirkeln ut som en pizza i åtta bitar.',
          light: 'M28.8 50.8 L71.2 93.2 M71.2 50.8 L28.8 93.2' },
        { id: 'bodyG', phase: 'Hjälpformer', press: 'light',
          text: 'Rita en liten cirkel mitt i, där alla linjer möts. Den är två fingrar bred. Det blir spindelns kropp.',
          light: C(50, 72, 6.5) },
        { id: 'body', phase: 'Kontur', press: 'hard',
          text: 'Nu trycker vi hårdare. Rita spindelns runda kropp.',
          dark: C(50, 72, 6.5) },
        { id: 'legs', phase: 'Kontur', press: 'hard',
          text: 'Rita fyra ben på varje sida. Varje ben går först snett upp till ett knä, och sedan ner igen.',
          dark: 'M45 67.8 L40 61.3 L37 65.8 M55 67.8 L60 61.3 L63 65.8 M43.8 70.1 L37.8 65.6 L34.8 70.6 M56.2 70.1 L62.2 65.6 L65.2 70.6 ' +
            'M43.8 73.9 L37.3 71.9 L34.8 77.9 M56.2 73.9 L62.7 71.9 L65.2 77.9 M45 76.2 L40 76.7 L38.5 83.2 M55 76.2 L60 76.7 L61.5 83.2' },
        { id: 'face', phase: 'Kontur', press: 'hard',
          text: 'Rita två runda ögon och en glad mun på kroppen.',
          dark: C(47.6, 70.5, 1.5) + C(52.4, 70.5, 1.5) + 'M47 74.3 Q50 76.6 53 74.3' },
        { id: 'spokes', phase: 'Kontur', press: 'hard',
          text: 'Rita åtta raka trådar ovanpå hjälplinjerna. Börja en bit utanför benen och dra ut till cirkeln.',
          dark: 'M68.5 72 L80 72 M63.1 58.9 L71.2 50.8 M50 53.5 L50 42 M36.9 58.9 L28.8 50.8 ' +
            'M31.5 72 L20 72 M36.9 85.1 L28.8 93.2 M50 90.5 L50 102 M63.1 85.1 L71.2 93.2' },
        { id: 'rings', phase: 'Kontur', press: 'hard',
          text: 'Rita tre varv med trådar runt spindeln. Varje tråd är en liten båge som hänger inåt, från linje till linje.',
          dark: 'M68.5 72 Q64.7 65.9 63.1 58.9 Q56.1 57.3 50 53.5 Q43.9 57.3 36.9 58.9 Q35.3 65.9 31.5 72 Q35.3 78.1 36.9 85.1 Q43.9 86.7 50 90.5 Q56.1 86.7 63.1 85.1 Q64.7 78.1 68.5 72 ' +
            'M74.5 72 Q69.5 63.9 67.3 54.7 Q58.1 52.5 50 47.5 Q41.9 52.5 32.7 54.7 Q30.5 63.9 25.5 72 Q30.5 80.1 32.7 89.3 Q41.9 91.5 50 96.5 Q58.1 91.5 67.3 89.3 Q69.5 80.1 74.5 72 ' +
            'M80 72 Q73.8 62.1 71.2 50.8 Q59.9 48.2 50 42 Q40.1 48.2 28.8 50.8 Q26.2 62.1 20 72 Q26.2 81.9 28.8 93.2 Q40.1 95.8 50 102 Q59.9 95.8 71.2 93.2 Q73.8 81.9 80 72' },
        { id: 'thread', phase: 'Kontur', press: 'hard',
          text: 'Rita en tråd rakt upp från nätet. Där sitter nätet fast.',
          dark: 'M50 42 V30' },
        { id: 'erase', phase: 'Sudda',
          text: 'Sudda försiktigt bort prickarna och alla ljusa hjälplinjer.',
          erase: ['dots3', 'dot4', 'circle', 'cross', 'diag', 'bodyG'] },
        { id: 'eyefill', phase: 'Detaljer', press: 'hard',
          text: 'Rita en liten ring i varje öga. Fyll resten av ögat svart, men lämna ringen vit.',
          fillDark: C(47.6, 70.5, 1.5) + C(48.1, 70, 0.5) + C(52.4, 70.5, 1.5) + C(52.9, 70, 0.5) },
        { id: 'hairs', phase: 'Detaljer', press: 'hard',
          text: 'Rita små korta hårstrån på spindelns ben.',
          dark: 'M42.5 64.5 l1 -0.8 M38.5 63.5 l-1.1 -0.7 M57.5 64.5 l-1 -0.8 M61.5 63.5 l1.1 -0.7 ' +
            'M40.8 67.8 l0.8 -1 M36.3 68.1 l-1.1 -0.7 M59.2 67.8 l-0.8 -1 M63.7 68.1 l1.1 -0.7 ' +
            'M40.5 72.9 l0.4 -1.2 M36 74.9 l-1.2 -0.5 M59.5 72.9 l-0.4 -1.2 M64 74.9 l1.2 -0.5 ' +
            'M42.5 76.5 l-0.1 -1.3 M39.3 80 l-1.3 -0.3 M57.5 76.5 l0.1 -1.3 M60.8 80 l1.3 -0.3' },
        { id: 'bodyshade', phase: 'Skugga', press: 'light',
          text: 'Ljuset kommer från vänster. Skugga därför högra kanten av kroppen.',
          fillHatch: 'M55 67.8 A6.5 6.5 0 0 1 52.2 78.1 A10.4 10.4 0 0 0 55 67.8 Z' },
        { id: 'done', phase: 'Klar',
          text: 'Din spindel är klar! Skriv ditt namn i hörnet.' },
      ],
    },
  ];
})();
