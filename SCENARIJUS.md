# „Ki Banga“: žaidimo scenarijus

Paprastas naršyklėje veikiantis 2D veiksmo žaidimas (šoninis vaizdas, „side-scroller + arena“). Herojus, kovos menų meistras, šaudo energijos bangomis ir pyktį bei jėgą paverčia vis stipresnėmis transformacijomis.

> Pastaba dėl autorių teisių: Son Goku ir „Dragon Ball“ priklauso jų autoriams (Akira Toriyama / Toei / Shueisha). Kad žaidimą būtų galima laisvai publikuoti, jame naudojamas originalus herojus ir originalūs pavadinimai. Mechanika lieka ta pati, kurios norėjote: energijos banga ir transformacijos.

---

## 1. Siužetas

**Herojus:** Kai, kalnų vienuolyne užaugęs kovos menų mokinys. Jo kūne miega senovinė „žvaigždžių kraujo“ jėga.

**Konfliktas:** iš kosmoso nusileidžia tironas **Vorgas** su savo kariauna ir pavagia **7 Žvaigždžių kristalus**. Surinkęs visus, jis galėtų išpildyti bet kokį norą ir pavergti planetą.

**Tikslas:** Kai keliauja per penkias vietoves, nugali Vorgo generolus, atgauna kristalus ir pakeliui atrakina naujas savo formas.

**Pabaiga:** paskutinėje kovoje Vorgas pats transformuojasi. Kai pasiekia aukščiausią formą ir paleidžia galutinę **Žvaigždžių bangą**.

---

## 2. Valdymas

| Klavišas | Veiksmas |
|---|---|
| ← → / A D | Judėti |
| ↑ / W / Tarpas | Šokti (laikant ore: skrydis, eikvoja Ki) |
| J | Smūgis artimoje kovoje (3 smūgių kombinacija) |
| K | Mažas Ki šūvis (greitas, pigus) |
| **L (laikyti → paleisti)** | **Ki Banga**: kuo ilgiau laikai, tuo stipresnė |
| **T** | **Transformacija** (kai pilna Jėgos juosta) |
| S / ↓ | Blokuoti / kaupti Ki |
| P / Esc | Pauzė |

Mobiliesiems: virtualus vairalazdės ratas kairėje ir 4 mygtukai dešinėje.

---

## 3. Pagrindinės mechanikos

### 3.1. Trys juostos
- **Gyvybė (HP):** krenta gaunant smūgius.
- **Ki (mėlyna):** eikvojama šūviams, bangai ir skrydžiui. Atsistato pamažu arba greitai, laikant „kaupti“ (S).
- **Jėga (geltona):** kyla daužant priešus ir gaunant žalos. Kai pilna, galima transformuotis.

### 3.2. Ki Banga (pagrindinis ginklas)
1. Laikai **L**: herojus sudeda delnus, tarp jų auga švytintis rutulys, ekranas šiek tiek dreba.
2. Krūvio lygiai:
   - **1 lygis** (iki 0,5 s): trumpas spindulys, 20 žalos.
   - **2 lygis** (0,5–1,5 s): ilgas spindulys, 50 žalos, pramuša 1 priešą.
   - **3 lygis** (>1,5 s): per visą ekraną, 120 žalos, pramuša viską, atstumia priešus.
3. Kaupiant herojus negali judėti, todėl reikia rizikuoti.
4. **Bangų kova:** jei bosas paleidžia savo bangą tuo pačiu metu, bangos susiduria. Reikia greitai spaudinėti **L**, ir laimi tas, kas stumia stipriau.

### 3.3. Transformacijos
Kiekviena forma atrakinama nugalėjus bosą. Transformacija trunka ribotą laiką (kol išsenka Jėgos juosta), po to herojus grįžta į bazinę formą.

| Forma | Atrakinama | Išvaizda | Efektas |
|---|---|---|---|
| **Bazinė** | nuo pradžių | juodi plaukai, balta aura | standartinė |
| **Liepsnos forma** | 1 bosas | auksiniai stačiai plaukai, geltona aura | +50 % žala, banga 1,5× platesnė |
| **Audros forma** | 3 bosas | ilgesni plaukai, žaibai aplink kūną | +100 % žala, Ki atsistato 2× greičiau, smūgiai elektrina |
| **Dangaus forma** | 5 bosas | mėlyni plaukai, rami mėlyna aura | +200 % žala, trumpas teleportas (dvigubas ← / →), banga kaupiasi 2× greičiau |
| **Žvaigždžių forma** | tik finalinėje kovoje | sidabrinė aura, žvaigždžių dalelės | galutinė *Žvaigždžių banga* |

**Transformacijos animacija (~1 s):** žaidimas sulėtėja, herojus rėkia, aplink sukasi akmenys, ekraną nušviečia blyksnis, ir pasikeičia plaukų spalva ir aura. Transformacijos metu herojus nepažeidžiamas.

---

## 4. Lygiai

Kiekviename lygyje: 2–3 bangos priešų, tada bosas.

| # | Vietovė | Priešai | Bosas | Atlygis |
|---|---|---|---|---|
| 1 | **Kalnų vienuolynas** | Vorgo žvalgai (bėga ir muša) | **Raxas**, greitas kardininkas | 1 kristalas + **Liepsnos forma** |
| 2 | **Dykumų kanjonas** | skraidantys dronai (šaudo) | **Dvyniai Zul ir Zel**, kovoja poroje | 2 kristalai |
| 3 | **Ledynų miestas** | šarvuoti kariai (blokuoja šūvius, reikia smūgių) | **Generolas Krag**, milžinas su skydu | 1 kristalas + **Audros forma** |
| 4 | **Ugnikalnio sala** | lavos žvėrys, sprogstantys robotai | **Nyx**, iliuzionistė su klonais | 2 kristalai |
| 5 | **Vorgo laivas orbitoje** | elitinė gvardija | **Vorgas** (3 fazės) | 1 kristalas + **Dangaus forma** → finalas |

### Finalinė kova: Vorgas
- **1 fazė:** Vorgas šaudo spindulius iš pirštų. Reikia vengti skrendant.
- **2 fazė:** Vorgas transformuojasi ir šaukia pastiprinimą.
- **3 fazė:** Vorgas kaupia planetą naikinančią sferą. Kai pasiekia **Žvaigždžių formą** (automatiškai, kai jo HP < 20 %) ir laimi bangų kovą, rodoma pabaigos scena.

---

## 5. Taškai ir progresas
- Taškai už priešus, kombinacijas ir laiką.
- **Kombinacijų skaitiklis:** kas 10 smūgių iš eilės +10 % Jėgos.
- Tarp lygių **treniruotės ekranas**: už surinktus „Zenu“ pinigus galima pagerinti HP, Ki arba bangos stiprumą.
- Rekordai saugomi `localStorage`.

---

## 6. Grafika ir garsas
- **Stilius:** spalvingas pikselių menas (pvz. 64×64 px figūrėlės) arba paprastos vektorinės formos su ryškiomis auromis. Viską galima piešti tiesiog Canvas API, be paveikslėlių.
- **Efektai:** dalelių sistema aurai, ekrano drebėjimas, „hit-stop“ (trumpas sustingimas pataikius), blyksnis transformuojantis.
- **Garsas:** Web Audio API (sugeneruoti efektai: „ūūū“ kaupimas, sprogimai), energinga muzika kiekvienam lygiui.

---

## 7. Techninis planas

**Technologijos:** gryni HTML5 + JavaScript (Canvas 2D), be serverio. Atidarai `index.html` ir žaidi. Vėliau galima talpinti per GitHub Pages.

**Failų struktūra:**
```
index.html
src/
  main.js        // žaidimo ciklas (requestAnimationFrame), būsenos
  input.js       // klaviatūra + lietimas
  player.js      // judėjimas, formos, Ki/Jėga
  beam.js        // Ki banga, krūvis, bangų kova
  enemies.js     // priešų tipai ir AI
  bosses.js      // bosų fazės
  levels.js      // lygių aprašai (duomenys)
  particles.js   // aura, sprogimai
  ui.js          // juostos, meniu, dialogai
  audio.js       // garsai
```

**Žaidimo būsenos:** `MENIU → DIALOGAS → LYGIS → BOSAS → TRENIRUOTĖS → ... → PABAIGA` (ir `PAUZĖ`, `PRALAIMĖJIMAS`).

---

## 8. Kūrimo etapai

1. **MVP (1 lygis):** herojus juda, šoka, muša; Ki banga su 3 krūvio lygiais; 1 priešų tipas; Liepsnos transformacija; paprastas bosas.
2. **Turinys:** visi 5 lygiai, visos formos, bangų kova.
3. **Šlifavimas:** garsai, dalelės, dialogai, treniruotės ekranas, mobilus valdymas.
4. **Publikavimas:** GitHub Pages.

---

## 9. Pavyzdinė įžangos scena

> *Ramus rytas vienuolyne. Kai treniruojasi po kriokliu.*
> **Meistras Oro:** „Kai, tavo Ki šiandien neramus...“
> *Dangų perskrodžia ugnies kamuolys. Žemė dreba.*
> **Vorgas (hologramoje):** „Planetos gyventojai! Žvaigždžių kristalai dabar mano. Per septynias dienas jūsų pasaulis priklausys man!“
> **Kai** *(suspaudžia kumščius, aplink jį sušvinta balta aura)*: „Ne, jei aš turiu ką pasakyti!“
> → **PRASIDEDA 1 LYGIS**
