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
