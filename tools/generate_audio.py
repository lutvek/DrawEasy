#!/usr/bin/env python3
"""Skapar uppläsningsljud för alla instruktioner i appen.

Läser alla texter i lessons.js (och de fasta fraserna nedan), läser upp dem med
en svensk röst och sparar dem som små mp3-filer i audio/.
Filnamnet är en hash av röst + text, så en ändrad text (eller röst) får
automatiskt en ny fil och gamla filer som inte längre används tas bort.
audio/index.json talar om för appen vilken fil som hör till vilken text.
Saknas en fil läser appen upp texten med enhetens inbyggda röst i stället.

Röster:
  edge  (standard) Microsofts neurala röst sv-SE-MattiasNeural via Edges
        uppläsningstjänst (paketet edge-tts). Gratis, inget konto, men ingen
        officiell tjänst – den kan sluta fungera.
  piper Fri röst som körs helt lokalt (paketet piper-tts + en röstfil),
        reserv om Edge-tjänsten slutar fungera.

Krav: python3 och ffmpeg, samt  pip install edge-tts  (eller piper-tts)

Användning:
    python3 tools/generate_audio.py
    python3 tools/generate_audio.py --engine piper --model sv_SE-alma-medium.onnx
"""
import argparse
import asyncio
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
AUDIO = ROOT / 'audio'

# Fraser som står direkt i app.js och också ska läsas upp.
FIXED_PHRASES = [
    'Rita precis vad du vill!',
    'Nu är det dags att färglägga!',
    'Bra jobbat!',
]

EDGE_VOICE = 'sv-SE-MattiasNeural'
EDGE_RATE = '-10%'          # lite lugnare tempo passar barn bättre
PIPER_LENGTH_SCALE = '1.12'
PIPER_SENTENCE_SILENCE = '0.45'


def lesson_texts():
    src = (ROOT / 'lessons.js').read_text(encoding='utf-8')
    return [re.sub(r'\\(.)', r'\1', m) for m in re.findall(r"text:\s*'((?:[^'\\]|\\.)*)'", src)]


def audio_name(voice_id, text):
    return hashlib.sha1(f'{voice_id}\n{text}'.encode('utf-8')).hexdigest()[:12] + '.mp3'


def edge_raw(text, out):
    import edge_tts
    proxy = os.environ.get('HTTPS_PROXY') or os.environ.get('https_proxy')
    for attempt in range(25):
        try:
            asyncio.run(edge_tts.Communicate(text, EDGE_VOICE, rate=EDGE_RATE, proxy=proxy).save(str(out)))
            # Tjänsten skickar ibland en avbruten fil: kontrollera att den går att läsa.
            subprocess.run(['ffprobe', '-v', 'error', str(out)], check=True, capture_output=True)
            return
        except Exception as e:  # nätverksstrul: försök igen
            if attempt == 24:
                raise
            print('  försöker igen:', type(e).__name__)
            time.sleep(min(3 * (attempt + 1), 20))


def piper_raw(text, out, model):
    subprocess.run(
        [sys.executable, '-m', 'piper', '-m', str(model), '-f', str(out),
         '--length-scale', PIPER_LENGTH_SCALE, '--sentence-silence', PIPER_SENTENCE_SILENCE],
        input=text.encode('utf-8'), check=True, capture_output=True)


def synthesize(text, args, out):
    with tempfile.TemporaryDirectory() as tmp:
        raw = Path(tmp) / ('tal.mp3' if args.engine == 'edge' else 'tal.wav')
        if args.engine == 'edge':
            edge_raw(text, raw)
        else:
            piper_raw(text, raw, args.model)
        # Ta bort tystnad i början, jämna ut volymen. Mono 48 kbit/s räcker gott för tal.
        subprocess.run(
            ['ffmpeg', '-y', '-loglevel', 'error', '-i', str(raw),
             '-af', 'silenceremove=start_periods=1:start_threshold=-50dB,loudnorm=I=-16:TP=-1.5',
             '-ac', '1', '-ar', '24000', '-b:a', '48k', str(out)],
            check=True)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--engine', choices=['edge', 'piper'], default='edge')
    ap.add_argument('--model', help='Piper: sökväg till röstens .onnx-fil')
    ap.add_argument('--force', action='store_true', help='skapa om alla filer, även de som redan finns')
    args = ap.parse_args()
    if args.engine == 'piper' and not args.model:
        ap.error('--model krävs med --engine piper')
    voice_id = EDGE_VOICE + EDGE_RATE if args.engine == 'edge' else Path(args.model).stem

    texts = list(dict.fromkeys(lesson_texts() + FIXED_PHRASES))
    AUDIO.mkdir(exist_ok=True)
    index = {}
    made = 0
    for text in texts:
        name = audio_name(voice_id, text)
        out = AUDIO / name
        if not out.exists() or args.force:
            print('🔊', text)
            synthesize(text, args, out)
            made += 1
        index[text] = name

    removed = 0
    for f in AUDIO.glob('*.mp3'):
        if f.name not in index.values():
            f.unlink()
            removed += 1

    (AUDIO / 'index.json').write_text(
        json.dumps(index, ensure_ascii=False, indent=1, sort_keys=True) + '\n', encoding='utf-8')
    print(f'Klart: {len(index)} texter, {made} nya filer, {removed} borttagna.')


if __name__ == '__main__':
    main()
