#!/usr/bin/env python3
"""Skapar uppläsningsljud för alla instruktioner i appen.

Läser alla texter i lessons.js (och de fasta fraserna nedan), läser upp dem med
en svensk Piper-röst och sparar dem som små mp3-filer i audio/.
Filnamnet är en hash av texten, så en ändrad text får automatiskt en ny fil och
gamla filer som inte längre används tas bort. audio/index.json talar om för
appen vilken fil som hör till vilken text. Saknas en fil läser appen upp texten
med enhetens inbyggda röst i stället.

Krav: python3, ffmpeg och  pip install piper-tts
Röst:  se README (avsnittet "Uppläsning") för var rösten laddas ner.

Användning:
    python3 tools/generate_audio.py --model röster/sv-se-nst-medium.onnx
"""
import argparse
import hashlib
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
AUDIO = ROOT / 'audio'

# Fraser som står direkt i app.js och också ska läsas upp.
FIXED_PHRASES = [
    'Rita precis vad du vill!',
    'Nu är det dags att färglägga!',
    'Bra jobbat!',
]

# Lite långsammare än normalt tempo passar barn bättre.
LENGTH_SCALE = '1.12'
SENTENCE_SILENCE = '0.45'


def lesson_texts():
    src = (ROOT / 'lessons.js').read_text(encoding='utf-8')
    return [re.sub(r'\\(.)', r'\1', m) for m in re.findall(r"text:\s*'((?:[^'\\]|\\.)*)'", src)]


def audio_name(text):
    return hashlib.sha1(text.encode('utf-8')).hexdigest()[:12] + '.mp3'


def synthesize(text, model, out):
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / 'tal.wav'
        subprocess.run(
            [sys.executable, '-m', 'piper', '-m', str(model), '-f', str(wav),
             '--length-scale', LENGTH_SCALE, '--sentence-silence', SENTENCE_SILENCE],
            input=text.encode('utf-8'), check=True, capture_output=True)
        # Mono, 48 kbit/s: låter bra för tal och håller filerna små.
        subprocess.run(
            ['ffmpeg', '-y', '-loglevel', 'error', '-i', str(wav),
             '-af', 'silenceremove=start_periods=1:start_threshold=-50dB,loudnorm=I=-16:TP=-1.5',
             '-ac', '1', '-ar', '22050', '-b:a', '48k', str(out)],
            check=True)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--model', required=True, help='sökväg till Piper-röstens .onnx-fil')
    ap.add_argument('--force', action='store_true', help='skapa om alla filer, även de som redan finns')
    args = ap.parse_args()

    texts = list(dict.fromkeys(lesson_texts() + FIXED_PHRASES))
    AUDIO.mkdir(exist_ok=True)
    index = {}
    made = 0
    for text in texts:
        name = audio_name(text)
        index[text] = name
        out = AUDIO / name
        if out.exists() and not args.force:
            continue
        print('🔊', text)
        synthesize(text, args.model, out)
        made += 1

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
