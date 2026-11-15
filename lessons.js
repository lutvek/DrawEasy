// Ritlektioner. Alla koordinater är i en ruta 0–100.
// Varje steg har en text (läses upp) och en SVG-bana "d" som visar vad som ska ritas.
(function () {
  const C = (x, y, r) => `M${x - r} ${y} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0`;
  const E = (x, y, rx, ry) => `M${x - rx} ${y} a${rx} ${ry} 0 1 0 ${2 * rx} 0 a${rx} ${ry} 0 1 0 ${-2 * rx} 0`;
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
      id: 'jatte', name: 'Stark jätte', bg: '#CFE6C0', level: 3,
      zoom: '6 28 88 96',
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
          light: 'M50 42 V104 M20 72 Q50 75 80 72' },
        { id: 'earsG', phase: 'Hjälpformer', press: 'light',
          text: 'Rita två avlånga öron på sidorna av cirkeln, i höjd med korset.',
          light: E(15, 74, 5.5, 9) + E(85, 74, 5.5, 9) },
        { id: 'head', phase: 'Kontur', press: 'hard',
          text: 'Nu trycker vi hårdare. Rita huvudet: runt upptill, och en bred fyrkantig haka längst ner.',
          dark: 'M20 72 A30 30 0 0 1 80 72 Q80 94 71 101 Q50 106 29 101 Q20 94 20 72 Z' },
        { id: 'ears', phase: 'Kontur', press: 'hard',
          text: 'Rita öronen utanför huvudet, och en liten båge inuti varje öra.',
          dark: 'M20.3 65 Q11 63 11.5 74 Q12 85 21.5 83 M19 69 Q15 71 16.5 77 ' +
            'M79.7 65 Q89 63 88.5 74 Q88 85 78.5 83 M81 69 Q85 71 83.5 77' },
        { id: 'eyes', phase: 'Kontur', press: 'hard',
          text: 'Rita två runda ögon på linjen. Ett på varje sida om mitten.',
          dark: C(39, 72, 3.6) + C(61, 72, 3.6) },
        { id: 'brows', phase: 'Kontur', press: 'hard',
          text: 'Rita två tjocka ögonbryn som bågar ovanför ögonen. Jätten är stark!',
          dark: 'M31 65 Q39 59 46 65 M54 65 Q61 59 69 65' },
        { id: 'nose', phase: 'Kontur', press: 'hard',
          text: 'Rita en stor rund potatisnäsa mitt emellan ögonen och hakan.',
          dark: E(50, 83, 6, 4.2) },
        { id: 'mouth', phase: 'Kontur', press: 'hard',
          text: 'Rita ett brett glatt leende, och en liten tand som sticker upp.',
          dark: 'M36 92 Q50 100 64 92 M42.6 94.8 L44 90.5 L46.2 95.4' },
        { id: 'erase', phase: 'Sudda',
          text: 'Sudda försiktigt bort prickarna och alla ljusa hjälplinjer.',
          erase: ['dots3', 'dot4', 'circle', 'cross', 'earsG'] },
        { id: 'eyefill', phase: 'Detaljer', press: 'hard',
          text: 'Rita en liten ring i varje öga. Fyll resten av ögat svart, men lämna ringen vit.',
          fillDark: C(39, 72, 3.6) + C(40.2, 70.8, 1.1) + C(61, 72, 3.6) + C(62.2, 70.8, 1.1) },
        { id: 'hair', phase: 'Detaljer', press: 'hard',
          text: 'Rita en liten hårlock högst upp på huvudet, och en grop i hakan.',
          dark: 'M50 42 Q46 35 51 32.5 Q56 32 55 36.5 Q54 39 51.5 38 M47 100.6 Q50 102.6 53 100.6' },
        { id: 'neck', phase: 'Detaljer', press: 'hard',
          text: 'Rita en tjock hals och breda axlar som går ut åt sidorna.',
          dark: 'M33 102.4 Q32 108 28 112 Q16 114 8 122 M67 102.4 Q68 108 72 112 Q84 114 92 122' },
        { id: 'faceshade', phase: 'Skugga', press: 'light',
          text: 'Ljuset kommer från vänster. Skugga därför högra kanten av ansiktet.',
          fillHatch: 'M71.2 50.8 A30 30 0 0 1 80 72 Q80 94 71 101 Q64 103 58 103.6 ' +
            'Q70 98 74 86 Q76 66 71.2 50.8 Z' },
        { id: 'earshade', phase: 'Skugga', press: 'light',
          text: 'Skugga högra örat och skuggan under hakan på halsen.',
          fillHatch: 'M79.7 65 Q89 63 88.5 74 Q88 85 78.5 83 Z ' +
            'M33.3 104 Q50 108 66.7 104 L67.2 108.5 Q50 112 32.8 108.5 Z' },
        { id: 'done', phase: 'Klar',
          text: 'Din starka jätte är klar! Skriv ditt namn i hörnet.' },
      ],
    },
  ];
})();
