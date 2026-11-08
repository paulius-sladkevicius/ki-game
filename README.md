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

## Kas yra MVP

- 1 lygis „Kalnų vienuolynas“: įžangos dialogas, 3 priešų bangos (žvalgai ir šauliai), bosas **Raxas**.
- Ki Banga su 3 krūvio lygiais (trumpa → pramušanti → per visą ekraną).
- Liepsnos forma (atrakinama po 2 bangos): +50 % žala, greitis, platesnė banga; trunka, kol yra Jėgos.
- **Bangų kova**: kai Raxas paleidžia savo bangą, o tu kaupi ar šaudai – spaudinėk L.
- Taškai, kombinacijos, rekordas (`localStorage`), kontrolinis taškas prieš bosą.
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
