# Plan zwielokrotnienia ruchu z Google (wypozycz.online)

Stan na 2026-11-10. Mierzymy w Search Console (`npm run gsc -- report`).

## Punkt startowy (Search Console, 2026-08-10 – 2026-11-07)

| | 90 dni | poprzednie 90 dni |
|---|---|---|
| Kliknięcia | 601 | 201 |
| Wyświetlenia | 30 345 | 18 098 |
| CTR | 2,0% | 1,1% |
| Śr. pozycja | 25,3 | 32,2 |

Miesięcznie: sierpień 124, wrzesień 233, październik 201 kliknięć. **Punkt startowy ok. 200 kliknięć/mies.**

**Cel: 1000 kliknięć/mies. (5×) do maja 2027**, etap pośredni 500/mies. do lutego 2027.

Skąd jest ruch:
- **Wzory umów: 394 z 601 kliknięć (66%).** `/umowy` i PDF-y są na pozycjach 2–10 z CTR 7–45%. To jedyna sekcja, która dziś działa.
- **Oferty: 101 kliknięć z 9 431 wyświetleń** (64 strony).
- **Zapytania o wynajem** (np. „wynajem rusztowań wrocław”, „wynajem koparka wrocław”): 1037 fraz, **16 759 wyświetleń, tylko 21 kliknięć**. Popyt jest, ale Google pokazuje pojedyncze ogłoszenia na pozycjach 10–17, bo nie ma dobrej strony docelowej.
- **Strona główna:** 10 683 wyświetlenia na pozycji 41 („wynajem maszyn budowlanych”), 26 kliknięć.
- Popyt spoza Dolnego Śląska: podnośniki w Mławie, Działdowie, Parczewie, Świebodzinie; agregaty w Chorzowie.

## Problem z indeksacją (najpilniejsze)

Sprawdzenie URL-i w API (`npm run gsc -- inspect`) z 2026-11-10:
- `/prace-na-wysokosci/wroclaw`, `/roboty-ziemne/wroclaw`, `/sprzet-ogrodowy/wroclaw`: **„Zeskanowana, ale jeszcze nie zindeksowana”**. Google odwiedził je w maju–sierpniu i uznał za mało wartościowe.
- `/wroclaw`: „Duplikat”. Za oryginał Google uznał **`https://www.747live.bet/`** (serwis hazardowy). Strona hazardowa nie kopiuje dziś naszej treści, a w naszym kodzie i HTML nie ma podrzuconych linków. To najpewniej błędna decyzja z sierpniowego crawla, gdy strona nie miała jeszcze canonicala.
- `/katalog`: **Google w ogóle go nie zna** (prawdopodobnie przez rozmiar ~1 MB).
- Indeks `sitemap.xml` Google pobrał ostatnio 2026-06-04. Wysłany ponownie 2026-11-10.
- Kategorie (`/roboty-ziemne`, `/prace-na-wysokosci`), oferty i strona główna są zindeksowane.

Wniosek: huby lokalne, które mają łapać 16 tys. wyświetleń fraz „wynajem X miasto”, nie istnieją dla Google. Naprawa ich treści i indeksacji to warunek każdego dalszego wzrostu.

## Co już jest

- Witryna zweryfikowana w Search Console (meta tag w `app/layout.js`), GA4 `G-02JHGY66TQ` (tylko po zgodzie na cookies, więc zaniża ruch).
- Sitemapy: 102 oferty, 8 kategorii, 6 hubów kategoria×miasto, 9 miast, 3 artykuły, 9 wzorów umów, 200 firm w katalogu.
- Poprawne canonicale, BreadcrumbList, Product/Offer na ofertach, ochrona przed cienkimi stronami (`MIN_LISTINGS_FOR_INDEXING`).

## Najważniejsze luki (z audytu stron na produkcji)

1. **Brak stron pod frazy typu sprzętu.** Ludzie szukają „wynajem minikoparki Wrocław”, „zagęszczarka wynajem”, a serwis ma tylko strony kategorii („Roboty ziemne: Wrocław”). Typy sprzętu (`filters` w `lib/categories.js`) są tylko filtrami, nie osobnymi adresami.
2. **Opisy meta ofert to surowy początek ogłoszenia** (np. WIELKIE LITERY, specyfikacja „Producent: WUBER Model…”). Słabo zachęca do kliknięcia.
3. **Mało treści poradnikowych:** 3 artykuły. Frazy „ile kosztuje wynajem X” i „jak wybrać X” mają duży wolumen i niską konkurencję lokalną.
4. **`/katalog` waży ~1 MB HTML** (200 firm na jednej stronie). Wolne ładowanie na telefonie, słabszy crawl.
5. **Niespójna marka w tytułach:** „WypożyczSprzęt”, „Wypozycz.Online”, „Wypożycz.online”.
6. **Blog i `/umowy` bez danych strukturalnych** (Article, BreadcrumbList).

## Etap 0: pomiar i indeksacja (tydzień 1)

- [x] Dostęp do Search Console API (OAuth, `npm run gsc -- login`).
- [x] Raport startowy 90 dni, ponowne wysłanie `sitemap.xml`, inspekcja hubów.
- [x] Huby lokalne (kategoria×miasto, miasto, województwo) mają unikalną treść z danych ofert (`lib/hubContent.js`, `components/browse/HubSummary.js`): własny wstęp, tabelę cen za dobę według typu, FAQ z JSON-LD `FAQPage` i tytuł z typami sprzętu i ceną (np. „Glebogryzarki – wynajem Wrocław od 250 zł”). Gotowe 2026-11-10, czeka na wdrożenie.
- [ ] `/prace-na-wysokosci/wroclaw` ma tylko 1 ofertę, więc ma `noindex`, a fraza „rusztowania wrocław” ma ponad 1000 wyświetleń. Do decyzji: liczyć do progu indeksacji oferty z 30 km i wypożyczalnie z katalogu albo zdobyć więcej ofert rusztowań we Wrocławiu.
- [x] Wdrożone 2026-11-10 (`316720b`). Tego dnia zgłoszono do indeksu w Search Console (UI, „Sprawdź URL” → „Poproś o zindeksowanie”, limit ok. 10 dziennie): `/wroclaw`, `/roboty-ziemne/wroclaw`, `/sprzet-ogrodowy/wroclaw`, `/dolnoslaskie`, `/chorzow`, `/swidnica`, `/walbrzych`, `/jelenia-gora`, `/sprzet-ogrodowy/kamieniec-wroclawski`, `/przyczepy-i-lawety/walbrzych`. API nie pozwala zgłaszać zwykłych stron.
- [ ] Zgłosić pozostałe: `/prace-na-wysokosci/katy-wroclawskie`, `/sprzet-ogrodowy/legnickie-pole`, `/katy-wroclawskie`, `/legnickie-pole`, `/katalog`.
- [ ] Ok. 2026-11-24: `npm run gsc -- inspect` dla zgłoszonych adresów, sprawdzić, czy weszły do indeksu.
- [x] `/katalog`: strony katalogu per miasto `/katalog/{miasto}` (indeksowane od 3 firm, w `katalog` sitemap: 10 miast), `/katalog` to lekki spis miast z wyszukiwarką (ok. 160 KB zamiast ok. 830 KB). Huby ofert linkują do katalogu swojego miasta. Gotowe 2026-11-10.
- [ ] Cotygodniowy raport (zaplanowane zadanie), porównanie tydzień do tygodnia.

KPI: kliknięcia, wyświetlenia, liczba stron z ≥1 kliknięciem, liczba zapytań wysłanych przez formularz (`inquiries`).

## Etap 1: szybkie poprawki (tygodnie 1–2), wpływ na CTR

Zrobione 2026-11-10 (czeka na wdrożenie):
- [x] Opis meta oferty z szablonu (`listingMetaDescription` w `lib/format.js`): „{Nazwa} na wynajem – {Miasto}, od {cena} za dobę. Możliwa dostawa. {pierwsze zdanie opisu}. Bez prowizji.” Zdanie z opisu jest wybierane tak, żeby pomijać nagłówki WIELKIMI LITERAMI, specyfikacje „Producent: …”, wypunktowania i powitania.
- [x] Jedna nazwa marki: `wypozycz.online` (jak logo i domena) we wszystkich tytułach, `SITE_NAME`, nadawcy maili. Stare nazwy są w `alternateName` danych WebSite.
- [x] Pełny Article (publisher, mainEntityOfPage, image) + BreadcrumbList na blogu, BreadcrumbList na `/umowy/[slug]`.
- [x] Tytuły pod zapytania z GSC: kategorie („Wynajem podnośników koszowych i rusztowań”, „Wynajem koparek, minikoparek i zagęszczarek”…), `/umowy` („Umowa wypożyczenia sprzętu – darmowe wzory PDF”), wzory umów („… – PDF do pobrania za darmo”), artykuły (`seoTitle` z ceną z treści artykułu), strona główna („Wynajem i wypożyczalnia sprzętu budowlanego”), katalog.
- [x] Wzory umów linkują do ofert pasującej kategorii (sekcja „Jakiego sprzętu dotyczy?” i przycisk w panelu bocznym).
- [x] `/katalog` wysyła do przeglądarki tylko pola potrzebne kartom (dane RSC ok. 130 KB). Sam HTML 200 kart nadal jest duży; pełne rozwiązanie to strony katalogu per miasto (Etap 0).
- [ ] Po 2–4 tygodniach: porównać CTR kategorii, `/umowy` i ofert w `npm run gsc -- report 28`.

## Etap 2: strony typu sprzętu × miasto (tygodnie 2–6), największa dźwignia

- [ ] Indeksowalne adresy `/{kategoria}/{typ}` i `/{kategoria}/{typ}/{miasto}`, np. `/roboty-ziemne/minikoparki/wroclaw`.
- [ ] Do sitemapy tylko kombinacje z wystarczającą podażą. Żeby nie były cienkie, łączą: oferty z serwisu + firmy z katalogu w okolicy (`companiesNear` już istnieje) + realny przedział cen z ofert + krótkie FAQ zbudowane z danych.
- [ ] Linkowanie wewnętrzne: oferta → typ w mieście → typ → kategoria; miasto → typy dostępne w mieście.
- [ ] Priorytet według danych z GSC (wyświetlenia bez kliknięć): **rusztowania Wrocław** (ponad 1000 wyświetleń w kilkunastu wariantach frazy, dziś trafiają na jedno ogłoszenie Aluberg), **koparki / ładowarki / zagęszczarki Wrocław**, **podnośniki koszowe** (także poza regionem), **glebogryzarki separacyjne**, **agregaty prądotwórcze**.

Szacunek: przy ~10 typach × ~9 miastach i progu podaży to kilkadziesiąt nowych stron trafiających w konkretne frazy, zamiast 6 hubów dziś.

## Etap 3: treści (ciągle, 2 artykuły tygodniowo)

- [ ] Seria „Ile kosztuje wynajem {typu} w 2026” z cenami policzonymi z ofert w bazie (prawdziwe dane, aktualizowane automatycznie).
- [ ] „Jak wybrać {typ} do {zastosowania}” (np. zagęszczarka do kostki vs pod fundament), z linkami do stron typu×miasto.
- [ ] **Rozbudować `/umowy` jako pierwsze**: to 66% obecnego ruchu. Dodać brakujące wzory, na które jest popyt (umowa wypożyczenia sprzętu w .doc, „druk wypożyczenia sprzętu”, umowa wynajmu koparki), wersje DOCX obok PDF i linki z każdej umowy do ofert danego typu. To też najlepszy zasób do zdobywania linków.
- [ ] Blog „ile kosztuje wynajem minikoparki” jest na pozycji 6,6 przy 104 wyświetleniach i 0 kliknięciach: przepisać tytuł i opis pod CTR (cena w tytule, rok).
- [ ] Każdy artykuł: tytuł pod konkretną frazę z GSC, FAQ, linki do 3–5 stron ofert.

## Etap 4: podaż ofert (ciągle), więcej stron i lepsze odpowiedzi

Każda nowa oferta w nowym mieście albo typie tworzy nową stronę, która może się wyświetlać w Google.
- [ ] Mailing do 200 firm z katalogu: „przejmij profil i dodaj ofertę za darmo” (mechanizm przejęcia już jest).
- [ ] Dla firm z katalogu: odznaka „Jesteśmy na wypozycz.online” z linkiem — zwiększa podaż i daje linki.
- [ ] Rozważyć oferty spoza Dolnego Śląska (już są np. Cieszyn) — świadoma decyzja o regionie.
- [ ] **Paczki redakcyjne do 300+ aktywnych ofert.** Hub typ×miasto był indeksowany od 3 ofert (`MIN_LISTINGS_FOR_INDEXING`; od 17.11 od 1), więc najpierw uzupełnialiśmy luki do 3. Każda paczka to manifest `scratch/editorial-batch-*.mjs` publikowany przez `scratch/publish-editorial-batch.mjs`. Fakty i ceny pochodzą wyłącznie ze stron firm. Stan liczymy skryptem `node --env-file=.env.local scratch/listing-counts.mjs`.

  | Data | Paczka | Ofert w paczce | Aktywne oferty po | Indeksowalne huby (≥3) | Huby, które przekroczyły próg |
  |---|---|---|---|---|---|
  | 2026-11-10 | stan wyjściowy | – | 95 | 5 | – |
  | 2026-11-10 | `2026-11-10` (MasterRent, Mobil Serwis, Atut Rental – Wrocław) | 18 | 113 | 10 | prace-na-wysokosci/wroclaw (1→5), agregaty-i-zasilanie/wroclaw (1→4), sprzet-betoniarski/wroclaw (1→3), narzedzia/wroclaw (2→4), sprzet-ogrodowy/wroclaw (2→4) |
  | 2026-11-10 | `2026-11-10-2` (Wypożyczalnia Alex – Świdnica, JMR Rent – Jelenia Góra) | 20 | 133 | 19 | Świdnica: narzedzia, roboty-ziemne, sprzet-betoniarski, sprzet-ogrodowy (1→3), agregaty-i-zasilanie (0→3); Jelenia Góra: agregaty-i-zasilanie, narzedzia, prace-na-wysokosci (1→3), roboty-ziemne (0→3) |
  | 2026-11-10 | `2026-11-10-3` (przyczepy: Lawety i Przyczepy Wrocław, Przyczepy Lubin, Nachtman; kontenery MIL-KON) | 10 | 143 | 23 | przyczepy-i-lawety/wroclaw (2→5), przyczepy-i-lawety/lubin (2→5), przyczepy-i-lawety/radwanice (2→4), inny-sprzet-budowlany/blonie (2→4) |
  | 2026-11-10 | `2026-11-10-4` (Wypożyczalnia Narzędzi Oleśnica – DoMi) | 15 | 158 | 28 | Oleśnica: narzedzia, roboty-ziemne, sprzet-betoniarski, sprzet-ogrodowy, agregaty-i-zasilanie (0→3) |
  | 2026-11-10 | `2026-11-10-5` (TransLift – Świdnica, Kam-Bud – Boguszów-Gorce) | 16 | 174 | 30 | prace-na-wysokosci/swidnica (0→5), narzedzia/boguszow-gorce (0→3) |
  | 2026-11-10 | `2026-11-10-6` (Atut Rental – oddział Legnica) | 18 | 192 | 36 | Legnica: agregaty-i-zasilanie, narzedzia (1→4), prace-na-wysokosci, roboty-ziemne, sprzet-betoniarski, sprzet-ogrodowy (0→3) |
  | 2026-11-10 | `2026-11-10-7` (Atut Rental – oddział Wrocław-Małuszów) | 20 | 212 | 42 | Małuszów: prace-na-wysokosci, roboty-ziemne (0→4), agregaty-i-zasilanie, narzedzia, sprzet-betoniarski, sprzet-ogrodowy (0→3) |
  | 2026-11-16 | stan przed paczkami z 16.11 (po paczkach 11-08 … 11-16) | – | 285 | 49 | – |
  | 2026-11-16 | `2026-11-16-2` (Wypożyczalnia Narzędzi Kłodzko), `2026-11-16-3` (Artech Głogów, bez cen), `2026-11-16-4` (Rental-Bud, Kostrzyna k. Zgorzelca) | 30 + 11 + 25 | 351 | 56 | narzedzia/klodzko (0→19), sprzet-czyszczacy/klodzko (0→3), narzedzia/glogow (1→8), Kostrzyna: narzedzia, sprzet-ogrodowy (0→7), roboty-ziemne, sprzet-betoniarski (0→4) |
  | 2026-11-16 | `2026-11-16-5` (Sanitar Lubin, ceny netto → brutto) | 16 | 367 | 58 | narzedzia/lubin (0→10), agregaty-i-zasilanie/lubin (0→5) |

  Nie otwieraj nowych stron ofert przed upływem 5 minut od publikacji: pierwsze wejście przy starej liście ofert zapisuje w cache 404 na godzinę (tak było z Kostrzyną 16.11). Najpierw sprawdź, czy oferta jest w `/szukaj?q=…`.

  Nowe strony ofert mogą przez chwilę zwracać 404: lista ofert jest w cache 5 min, a odpowiedź strony do godziny (`revalidate = 3600`). Weryfikacja: `node scratch/check-editorial-publication.mjs <paczka>`.

## Przegląd 2026-11-17 (Search Console, 2026-10-18 – 2026-11-14)

- 28 dni: 171 kliknięć (poprzednio 184), 5 912 wyświetleń (6 951), CTR 2,9%, śr. pozycja 22,5. Zmiany z 10.11 jeszcze nie są widoczne w danych.
- `/umowy` i PDF-y: 133 kliknięcia (78%). Oferty: 12 kliknięć z 2 036 wyświetleń. Strona główna: 9 kliknięć z 1 466 wyświetleń (poz. 47).
- **Próg `MIN_LISTINGS_FOR_INDEXING = 3` (od 05.11) dał `noindex` ok. 90 hubom i stronom miast, które w 90 dniach miały 1 772 wyświetlenia i 60 kliknięć** (prawie cały ruch hubów, np. `/sprzet-ogrodowy/dzierzoniow`, `/stronie-slaskie`, `/agregaty-i-zasilanie/klodzko`, `/sobotka`). **Zrobione 17.11 (czeka na wdrożenie):** huby lokalne, miasta i województwa są indeksowane od 1 oferty (sitemapa: 150 hubów zamiast 58, 64 miasta zamiast 32, 4 województwa zamiast 2). Kategorie ogólnopolskie i miasta na stronie głównej nadal od 3 (`MIN_LISTINGS_FOR_CATEGORY_INDEXING`). Puste huby mają dalej `noindex`.
- Inspekcja: `/prace-na-wysokosci/wroclaw` (fraza „rusztowania wrocław”, ok. 440 wyświetleń/28 dni) nadal „zeskanowana, ale nie zindeksowana”, ostatni crawl 23.05. Ruch idzie na pojedynczą ofertę Aluberg (poz. 11, 0 kliknięć). Wymaga ręcznego „Poproś o zindeksowanie”.
- `/wroclaw`, `/roboty-ziemne/wroclaw`, `/sprzet-ogrodowy/wroclaw`, `/swidnica`, `/dolnoslaskie` już zindeksowane (problem duplikatu `/wroclaw` rozwiązany). Nowe huby z paczek redakcyjnych (`/narzedzia/lubin`, `/roboty-ziemne/legnica`, `/olesnica`, `/katalog`, `/katalog/wroclaw`) są „nieznane” albo „wykryte – niezindeksowane”.
- Oferty z „wynajem” w nazwie miały tytuł „… - wynajem – wynajem” i opis „… wynajem na wynajem” (podnośnik w Dzierżoniowie: 99 wyświetleń, glebogryzarka we Wrocławiu: 150, obie 0 kliknięć). **Zrobione 17.11:** `listingSeoName` w `lib/format.js` ucina końcowe „- wynajem” i nie dokleja słowa drugi raz.
- [ ] Ręcznie w Search Console „Poproś o zindeksowanie”: `/prace-na-wysokosci/wroclaw` (najpierw), `/agregaty-i-zasilanie/wroclaw`, `/sprzet-betoniarski/wroclaw`, `/narzedzia/lubin`, `/roboty-ziemne/legnica`, `/olesnica`, `/katalog/wroclaw`. Po wdrożeniu progu także huby, które wróciły do indeksu z ruchem: `/sprzet-ogrodowy/dzierzoniow`, `/stronie-slaskie`, `/agregaty-i-zasilanie/klodzko`, `/sobotka`, `/bystrzyca-klodzka`.

## Etap 5: linki i sygnały spoza strony (miesiące 2–6)

- [ ] Lokalne katalogi firm i portale budowlane (Dolny Śląsk).
- [ ] Wzory umów jako darmowy zasób dla blogów budowlanych i grup na Facebooku.
- [ ] Odpowiedzi na forach i w grupach (budowa domu, ogród) z linkami do poradników cenowych.

## Rytm pracy

| Kiedy | Co |
|---|---|
| Co tydzień | `npm run gsc -- report 7`, 2 artykuły, poprawa 3–5 tytułów z listy „szybkie wygrane” |
| Co miesiąc | `npm run gsc -- report 28`, przegląd indeksacji nowych stron (`inspect`), decyzja o kolejnych typach/miastach |
| Po 3 miesiącach | ocena: które etapy dały kliknięcia, przesunięcie wysiłku |

## Konfiguracja Search Console API (gotowa 2026-11-10)

- Projekt Google Cloud `wypozyczonline-514311`: włączone Search Console API, ekran zgody OAuth „wypozycz online GSC” (zewnętrzny, tryb testowy, użytkownik testowy = konto właściciela), klient OAuth „gsc-cli” (aplikacja komputerowa).
- Klucze kont serwisowych są zablokowane zasadą organizacji `iam.managed.disableServiceAccountKeyCreation`, dlatego logujemy się kontem właściciela. Konto serwisowe `gsc-reporter` istnieje, ale nie ma klucza.
- Plik klienta i token: `.secrets/gsc-oauth-client.json`, `.secrets/gsc-oauth-token.json` (poza gitem).
- **W trybie testowym token wygasa po 7 dniach.** Gdy skrypt zgłosi `invalid_grant`, uruchom `npm run gsc -- login`. Żeby tego uniknąć: Google Auth Platform → Odbiorcy → „Opublikuj aplikację”.
- Polecenia: `login`, `sites`, `report [dni]`, `sitemaps`, `submit-sitemap [url]`, `inspect <pełny URL…>`. Pełne dane raportu trafiają do `scratch/gsc/`.
- W Git Bash podawaj pełne adresy (`https://wypozycz.online/...`), bo ścieżki zaczynające się od `/` są zamieniane na ścieżki Windows.
