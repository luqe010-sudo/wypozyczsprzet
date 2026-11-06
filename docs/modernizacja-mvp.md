# Wypozycz.online 2.0

## Audyt stanu wyjściowego

| Obszar | Stan i ryzyko |
| --- | --- |
| Wejście i nawigacja | Strona główna używała tego samego komponentu klienckiego co pełna wyszukiwarka i przekazywała mu wszystkie karty. Na telefonie istnieje dolny pasek ze skrótami i gestem przełączania. Strona oferty ma osobny pasek kontaktowy. |
| Lista, lokalizacja i mapa | `/szukaj` i strony SEO dzielą komponent `BrowseListings`. Wyszukiwanie promieniowe używało średniej współrzędnych ofert z miejscowości. Brak współrzędnych ograniczał wyniki do tej miejscowości. Karty i markery korzystają z tej samej projekcji danych, ale obsługa nakładających się punktów wymaga poprawy. |
| Oferta i kontakt | Istnieją zdjęcia, ceny, parametry, dane firmy, mapa i kanały kontaktu. Aktywna publikacja i deklaracja dostępności nie potwierdzają wolnego terminu. Zapytanie może wysłać gość. Oferty importowane bez właściciela wymagają bezpośredniego kontaktu z firmą. |
| Zapytania i panel | `inquiryActions` zapisuje zapytania w Supabase i opcjonalnie powiadamia przez Resend. `/dashboard/inquiries` oraz panel administracyjny odczytują je przez istniejące reguły dostępu. Panel i formularze działają na firmach, oddziałach i sprzęcie. Pierwsza oferta niezweryfikowanej firmy trafia do moderacji. |
| Dane i uprawnienia | Supabase jest źródłem ofert, firm, oddziałów i zapytań. Repozytorium zawiera migracje RLS i triggery publikacji. Działanie konkretnych polityk zależy od migracji zastosowanych w środowisku. Sesje chronią panel i administrację w `proxy.js`. Zdjęcia przechodzą przez podpis Cloudinary, a współrzędne przez MapTiler. |
| SEO | Adresy kategorii, miejscowości i regionów używają dynamicznego routingu. Oferty mają stały slug, kanoniczną ścieżkę kategorii i miejscowości oraz przekierowanie z `/oferta/[slug]`. Indeks sitemap nie uwzględniał istniejącej mapy katalogu. Część adresów w mapie katalogu wskazywała warianty inne niż kanoniczne. |
| Wydajność i pomiar | Strona główna pobierała pełny indeks ofert i przesyłała jego skróconą kopię do klienta. Obraz hero ważył 2,34 MB jako źródłowy PNG. Mapa jest cięższą funkcją klienta. GA wymaga zgody analitycznej, a opóźniona inicjalizacja może zgubić zdarzenie z wejścia bezpośredniego. |
| Pozostałe trasy | Katalog i roszczenia do firm, poradniki, wzory umów, strony informacyjne, ulubione, logowanie i administracja pozostają częścią istniejącego serwisu. Główne ścieżki mają zachować prowadzące do nich linki. |

## Kolejność prac

1. Uporządkować stronę główną i wspólne karty. Podpiąć lekki formularz GET do istniejącej trasy wyszukiwania. Zachować skróty mobilne i pogodzić je z paskiem kontaktu.
2. Doprecyzować lokalizację, filtry i sortowanie. Zachować parametry URL, linki SEO i dotychczasowe daty wynajmu. Ograniczyć koszt renderowania mapy i poprawić wybór oferty z markera.
3. Uporządkować zdjęcia, warunki, dane firmy i kontakt na stronie oferty. Oprzeć obsługę gości i dostarczanie zapytań na istniejących akcjach i uprawnieniach.
4. Skrócić drogę od panelu do nowej oferty, edycji, wstrzymania i odebranego zapytania. Używać rzeczywistych statusów moderacji i statystyk.
5. Skontrolować canonical, mapy witryny, oznaczenia danych oraz zdarzenia analityczne po zgodzie. Zachować istniejące adresy i integracje.
6. Uruchomić lint i build, zweryfikować mobilne i desktopowe ścieżki od wyszukania do kontaktu. Test zapisu oferty i zapytania wykonać na odizolowanych danych.

## Wdrożone zmiany i weryfikacja

- Strona główna renderuje formularz GET i trzy karty z publicznych danych. Wrocław jest przykładową lokalizacją, gdy w mieście są co najmniej trzy oferty. Zdjęcie hero ma lżejszą wersję WebP. Nawigacja mobilna zachowuje sześć skrótów i jest widoczna również pod paskiem kontaktowym oferty.
- Wyszukiwarka zachowuje kryteria w URL i rozumie poprzedni parametr `s`. Punkt odniesienia znanej miejscowości to średnia unikalnych współrzędnych ofert. Dla pozostałych miejscowości działa geokodowanie MapTiler. Przy braku jednoznacznego wyniku serwis ogranicza wyszukiwanie do miejscowości i informuje o tym użytkownika.
- Lista, mapa i szczegóły pokazują ceny z jednostką. Mapa grupuje punkty i otwiera wskazaną kartę. Na szczegółach ceny i warunki wynikają z danych. Informacja o dostępności jest oznaczona jako aktualna deklaracja wynajmującego, jeśli firma przejęła ofertę i niedawno potwierdziła jej aktualność.
- Zapytanie gościa trafia najpierw do bazy i do skrzynki wynajmującego. Powiadomienie przez Resend jest wykonywane po odpowiedzi. Zarówno publiczne ogłoszenie, jak i wysyłka powiadomienia korzystają z danych oddziału wyłącznie wtedy, gdy oddział należy do firmy z ogłoszenia.
- Panel umożliwia filtrowanie po statusie, zapis i edycję z kontrolą kategorii oraz oddziału, wstrzymanie i wznowienie, a także przegląd zapytań i rzeczywistych liczników. Edycja zachowuje slug. Zdarzenia wyszukania, obejrzenia oferty, telefonu, wysłania zapytania i utworzenia oferty są kolejkowane po zgodzie analitycznej.
- Mapa witryny katalogu jest podpięta do indeksu sitemap. Wpisy respektują kanoniczne adresy firm. Stary adres ogłoszenia nadal przekierowuje kodem 308.
- W przeglądarce zweryfikowano szerokości 320, 390, 768, 1024 i 1440 px. Na testowych danych sprawdzono wyszukanie, filtr dostawy, zmianę widoku, wybór oferty z mapy, wysłanie zapytania jako gość i odbiór w panelu. Osobne sprawdzenie objęło dodawanie, edycję, odrzucenie obcego oddziału, wstrzymanie i wznowienie oferty.
- Przeszło sześć testów w `node --test tests/search.test.mjs`, kontrola 16 publicznych tras, testy przekierowań i błędnych ścieżek oraz `git diff --check`. Lint zakończył się bez błędów i pozostawił 11 istniejących ostrzeżeń. Build z odczytem skonfigurowanego Supabase przeszedł etap TypeScript i wygenerował 461 statycznych stron.

## Do sprawdzenia w środowisku wdrożeniowym

- Lokalna atrapa potwierdza przepływ aplikacji. Testy uprawnień RLS między różnymi kontami, dostarczenia e-maila przez Resend, rzeczywistych odpowiedzi MapTiler, odbioru zdarzeń przez GA i Core Web Vitals wymagają działającego środowiska testowego albo wdrożenia.
- Akcje serwera sprawdzają zgodność oddziału i firmy. Reguła, która uniemożliwiłaby zapis takiej niespójnej relacji bezpośrednio przez PostgREST, wymaga oddzielnej migracji po sprawdzeniu istniejących rekordów.
- Limit zapytań na IP działa przez sprawdzenie liczby ostatnich rekordów przed zapisem. Równoległe zgłoszenia mogą przekroczyć limit. Gwarancja limitu wymaga operacji atomowej w bazie.
