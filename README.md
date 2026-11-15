# Rita Lätt 🎨

En enkel rit-app för barn som vill lära sig rita, steg för steg. Byggd för iPad.
Ingen inloggning, inget konto, ingen server – bara en webbsida som går att lägga som ikon på hemskärmen.

## Vad appen kan

### Rita på papper ✏️
Skärmen är läraren och barnet ritar med blyerts på eget papper. Varje lektion går igenom
mät med handen → hjälpformer (tryck löst) → kontur (tryck hårdare) → sudda → detaljer → skuggning.
Lektioner: björnansikte och uggla på en gren. Lektionerna finns sist i `lessons.js` (`PAPER_LESSONS`).

### Rita på skärmen 📱

- 9 teckningar att lära sig (sol, fisk, blomma, glass, hus, katt, bil, raket, fjäril) + **Rita fritt**
- Varje steg visar med streckade linjer vad som ska ritas, och en röd linje visar hur man gör
- Instruktionen läses upp på svenska (håll inne 🔊 för att stänga av/sätta på rösten)
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

## Köra lokalt

```bash
python3 -m http.server 8000
```
