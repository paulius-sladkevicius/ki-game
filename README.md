# Ki Banga

Paprastas naršyklėje veikiantis 2D veiksmo žaidimas (MVP): kovos menų meistras Kai šaudo **Ki Bangomis** ir transformuojasi į **Liepsnos formą**. Scenarijus – [SCENARIJUS.md](SCENARIJUS.md).

## Kaip žaisti

Atsidaryk `index.html` naršyklėje (serverio nereikia). Telefone rodomi lietimo mygtukai.

| Klavišas | Veiksmas |
|---|---|
| ← → / A D | judėti |
| ↑ / W / Tarpas | šokti, laikant ore – skristi (eikvoja Ki) |
| J | smūgis (3 smūgių kombinacija) |
| K | Ki šūvis |
| L (laikyti → paleisti) | Ki Banga: 3 krūvio lygiai |
| S / ↓ | kaupti Ki (ir blokuoti pusę žalos) |
| T | transformacija (kai pilna Jėgos juosta) |
| P / Esc | pauzė |
| M | garsas įjungti / išjungti |

## Kas yra žaidime

- **5 lygiai** su skirtingais fonais: Kalnų vienuolynas, Dykumų kanjonas, Ledynų miestas, Ugnikalnio sala, Vorgo laivas orbitoje.
- **Priešai:** žvalgai, šauliai, skraidantys dronai, šarvuoti kariai (blokuoja Ki iš priekio), sprogstantys robotai, lavos galiūnai, elitinė gvardija.
- **Bosai:** Raxas (kardininkas), dvyniai Zul ir Zel, Generolas Krag (skydas, puolimas, žemės drebėjimas), Nyx (teleportas, klonai), Vorgas (3 fazės ir finalinė bangų kova).
- **Ki Banga** su 3 krūvio lygiais ir **bangų kova** su bosais (spaudinėk L).
- **Transformacijos (T):**
  - Liepsnos forma (1 lygis): +50 % žala;
  - Audros forma (3 lygis): +100 % žala, smūgiai skelia žaibus į kitus priešus;
  - Dangaus forma (5 lygis): +200 % žala, teleportas dvigubu ← / →;
  - Žvaigždžių forma: finalinėje kovoje su Vorgu.
- 7 Žvaigždžių kristalai, taškai, kombinacijos, rekordas, progreso išsaugojimas (meniu „Tęsti“), kontrolinis taškas prieš bosą.
- Visa grafika piešiama Canvas API, garsai generuojami Web Audio API – jokių išorinių failų.

## Struktūra

```
index.html, style.css
src/core.js       bendra būsena, pagalbinės funkcijos
src/input.js      klaviatūra ir lietimas
src/audio.js      garso efektai
src/particles.js  dalelės, skraidantys skaičiai
src/draw.js       figūrėlės, pozos, fonas, bangos
src/player.js     herojus, Ki Banga, transformacija
src/enemies.js    Vorgo kariai
src/boss.js       bosas Raxas
src/combat.js     pataikymai, šūviai, bangų kova
src/level.js      lygio scenarijus ir dialogai
src/ui.js         HUD, meniu, ekranai
src/main.js       žaidimo ciklas
```
