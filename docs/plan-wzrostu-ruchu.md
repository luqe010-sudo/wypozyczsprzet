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
- [ ] `/katalog`: paginacja albo strony katalogu per miasto, żeby Google mógł go przeczytać.
- [ ] Cotygodniowy raport (zaplanowane zadanie), porównanie tydzień do tygodnia.

KPI: kliknięcia, wyświetlenia, liczba stron z ≥1 kliknięciem, liczba zapytań wysłanych przez formularz (`inquiries`).

## Etap 1: szybkie poprawki (tygodnie 1–2), wpływ na CTR

- [ ] Szablon opisu meta oferty: „{Nazwa} na wynajem – {Miasto}, od {cena} zł/{jednostka}. {1 zdanie z opisu, bez wielkich liter}. Kontakt bez prowizji.”
- [ ] Jedna nazwa marki w tytułach.
- [ ] Article + BreadcrumbList na blogu, HowTo/BreadcrumbList na `/umowy/[slug]`.
- [ ] Paginacja lub ładowanie porcjami w `/katalog`.
- [ ] Z raportu „Niski CTR mimo top 10” przepisać tytuły 10 najczęściej wyświetlanych stron.

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
