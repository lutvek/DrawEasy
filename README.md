# Rita Lätt 🎨

En enkel rit-app för barn som vill lära sig rita, steg för steg. Byggd för iPad.
Ingen inloggning, inget konto, ingen server – bara en webbsida som går att lägga som ikon på hemskärmen.

## Vad appen kan

### Rita på papper ✏️
Skärmen är läraren och barnet ritar med blyerts på eget papper. Varje lektion går igenom
mät med handen → hjälpformer (tryck löst) → kontur (tryck hårdare) → sudda → detaljer → skuggning.
Första lektionen är ett björnansikte. Lektionerna finns sist i `lessons.js` (`PAPER_LESSONS`).

### Rita på skärmen 📱

- 9 teckningar att lära sig (sol, fisk, blomma, glass, hus, katt, bil, raket, fjäril) + **Rita fritt**
- Varje steg visar med streckade linjer vad som ska ritas, och en röd linje visar hur man gör
- Instruktionen läses upp på svenska med en naturlig röst (håll inne 🔊 för att stänga av/sätta på rösten)
- Penna, färger, tre tjocklekar, sudd, ångra och rensa
- Sista steget är att färglägga – färgerna hamnar *under* pennstrecken
- Spara teckningen som bild när den är klar
- Funkar med finger och Apple Pencil, stående och liggande

## Publicera med GitHub Pages (görs en gång)

1. Gå till repot på GitHub → **Settings** → **Pages**
2. Under *Build and deployment*: Source = **Deploy from a branch**
3. Välj branch (`main` när koden är mergad dit) och mapp **/ (root)** → **Save**
4. Efter någon minut finns appen på `https://lutvek.github.io/DrawEasy/`

## Lägg ikonen på iPadens hemskärm

1. Öppna adressen ovan i **Safari** på iPaden
2. Tryck på **Dela**-knappen (fyrkanten med pil uppåt)
3. Välj **Lägg till på hemskärmen** → **Lägg till**

Nu finns ikonen "Rita Lätt" på hemskärmen och appen öppnas i helskärm.

## Lägga till fler teckningar

Alla teckningar finns i `lessons.js`. Varje steg är en text och en SVG-bana i en ruta 0–100.
Skapa sedan uppläsningsljud för de nya texterna (se nedan).

## Uppläsning

Instruktionerna spelas upp från färdiga ljudfiler i `audio/`, inlästa med en svensk
neural röst ([Piper](https://github.com/rhasspy/piper), rösten *nst* från KBLab/Kungliga biblioteket, CC0).
Då låter rösten likadant på alla iPads, fungerar offline och kräver ingen nedladdad svensk systemröst.
Finns ingen ljudfil för en text (t.ex. en ny lektion) läses den upp med enhetens inbyggda röst i stället.

Ljudfilerna heter som en hash av texten, och `audio/index.json` kopplar text → fil.
Ändrar du eller lägger till en text kör du skriptet igen – det skapar bara de filer som saknas
och tar bort de som inte används längre.

Engångsförberedelse (kräver python3 och ffmpeg):

```bash
pip install piper-tts
```

```bash
mkdir -p ~/piper-röster && curl -L https://github.com/rhasspy/piper/releases/download/v0.0.2/voice-sv-se-nst-medium.tar.gz | tar xz -C ~/piper-röster
```

Skapa ljuden:

```bash
python3 tools/generate_audio.py --model ~/piper-röster/sv-se-nst-medium.onnx
```

Tempo och pauser ställs in högst upp i `tools/generate_audio.py`.

## Köra lokalt

```bash
python3 -m http.server 8000
```
