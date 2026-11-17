// Enkel service worker: hämta alltid senaste från nätet, använd cache som reserv.
// Uppläsningsljuden (audio/*.mp3) har hash av texten i filnamnet och ändras aldrig,
// så de laddas ner i förväg och tas från cachen direkt – då fungerar rösten även offline.
const CACHE = 'rita-latt-v9';
const AUDIO = 'rita-latt-ljud';

async function precacheAudio() {
  try {
    const res = await fetch('audio/index.json', { cache: 'no-cache' });
    if (!res.ok) return;
    const files = Object.values(await res.json()).map((f) => 'audio/' + f);
    const cache = await caches.open(AUDIO);
    const have = new Set((await cache.keys()).map((r) => new URL(r.url).pathname.split('/').pop()));
    await Promise.all(files.filter((f) => !have.has(f.slice(6))).map((f) => cache.add(f).catch(() => {})));
    // Städa bort ljud som inte används längre.
    const keep = new Set(files.map((f) => f.slice(6)));
    for (const r of await cache.keys()) {
      if (!keep.has(new URL(r.url).pathname.split('/').pop())) await cache.delete(r);
    }
  } catch (e) { /* offline: försök igen nästa gång */ }
}

// Safari ber om ljud i bitar (Range) och spelar bara upp om svaret är ett riktigt 206-svar.
async function audioResponse(req, url) {
  const cache = await caches.open(AUDIO);
  const key = url.origin + url.pathname;
  let res = await cache.match(key);
  if (!res) {
    res = await fetch(key);
    if (res.status !== 200) return res;
    await cache.put(key, res.clone());
  }
  const range = /bytes=(\d*)-(\d*)/.exec(req.headers.get('range') || '');
  if (!range) return res;
  const buf = await res.arrayBuffer();
  const size = buf.byteLength;
  let start = range[1] === '' ? size - Number(range[2]) : Number(range[1]);
  let end = range[1] === '' || range[2] === '' ? size - 1 : Math.min(Number(range[2]), size - 1);
  start = Math.max(0, start);
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Content-Length': String(end - start + 1),
      'Accept-Ranges': 'bytes',
    },
  });
}

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim().then(precacheAudio)));
self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (/\/audio\/[0-9a-f]+\.mp3$/.test(url.pathname)) {
    e.respondWith(audioResponse(req, url));
    return;
  }
  if (url.pathname.endsWith('/audio/index.json')) e.waitUntil(precacheAudio());
  e.respondWith(
    fetch(req, { cache: 'no-cache' })
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }))
  );
});
