# 🧱 Komponenty UI i Integracje Mapowe

Aplikacja **WypożyczSprzęt** posiada rozbudowaną warstwę prezentacji opartą o reużywalne komponenty React. Integracja z interaktywnymi mapami oraz zaawansowane filtrowanie ofert stanowią rdzeń interfejsu użytkownika.

---

## 🗺️ Integracje Mapowe (Leaflet i Maplibre GL)

Aplikacja wdrożyła podwójną architekturę map w celu optymalizacji wydajności i wyglądu:

### 1. `ListingMap.js` (React Map GL + Maplibre GL)
Używany na karcie szczegółów oferty. Prezentuje punktową lokalizację sprzętu.
- **Stylizacja Premium**: Wykorzystuje autorski ciemny styl **Fiord** zintegrowany z **MapTiler** (za pośrednictwem wektorowego źródła kafelków `openmaptiles`). Jeśli brak klucza `NEXT_PUBLIC_MAPTILER_KEY`, następuje automatyczny fallback do ciemnych kafelków rastrowych **Carto Dark**.
- **Dynamiczne Geokodowanie**: Posiada wewnętrzny efekt `useEffect`, który sprawdza współrzędne geograficzne w bazie (`lat` / `lng`). W przypadku ich braku, wysyła asynchroniczne żądanie do API `/api/geocode`, przekazując oczyszczony adres w celu pobrania koordynatów z OpenStreetMap.
- **Interaktywność**: Po kliknięciu markera wyskakuje Popup ze skróconym opisem oferty, ceną oraz dedykowanym przyciskiem przekierowującym do Nawigacji Google Maps.

### 2. `MapComponent.js`
Główna mapa klastrująca oferty na stronie głównej marketplace. Umożliwia użytkownikowi eksplorację ofert poprzez fizyczne przesuwanie mapy.
- Integruje się z filtrami wyszukiwarki (kategoria, odległość, miasto).
- Zmiana obszaru widocznego (Viewport) może powodować automatyczne filtrowanie listy widocznych ogłoszeń.

---

## 🔍 Panel Marketplace i Filtrowanie (`Marketplace.js`)

Główny komponent platformy zarządzający kompletnym stanem wyszukiwania.

- **Filtry Odległości (Distance Search)**: Współpracuje z geolokalizacją przeglądarki lub wybranym adresem wpisanym w `AddressAutocomplete`. Oblicza dystans w linii prostej na podstawie wzoru Haversine'a (`lib/distance.js`).
- **Dynamiczny Grid**: Renderuje siatkę ofert za pomocą `ListingGrid` oraz pojedyncze karty `ListingCard`.
- **Brak Placeholders**: Każde ogłoszenie wyświetla rzeczywiste zdjęcie przesłane przez Cloudinary lub zoptymalizowaną grafikę z przypisaną dominantą kolorystyczną (skeleton loader na bazie dominanty koloru).

---

## 📄 Wykaz Komponentów UI (React Components)

Ta lista została wygenerowana automatycznie przez skrypt narzędziowy `Living Documentation`:

<!-- START_COMPONENTS_LIST -->
### 📌 Wykryte Komponenty (Generowane automatycznie)

*   **[AddressAutocomplete.js](file:///e:/sprzety_budowlane/components/AddressAutocomplete.js)**: Pole tekstowe z autosugestią adresu oparte na geokodowaniu OpenStreetMap/Nominatim w czasie rzeczywistym.
*   **[Breadcrumbs.js](file:///e:/sprzety_budowlane/components/Breadcrumbs.js)**: Klasyczna ścieżka powrotu wspierająca nawigację SEO dla ofert oraz kategorii.
*   **[CTASection.js](file:///e:/sprzety_budowlane/components/CTASection.js)**: Sekcja wezwania do działania (Call to Action) zachęcająca wypożyczalnie do rejestracji i dodawania maszyn.
*   **[CategoryHubs.js](file:///e:/sprzety_budowlane/components/CategoryHubs.js)**: Kafelki na stronie głównej prezentujące główne kategorie sprzętu (roboty ziemne, ogród, narzędzia) wraz z liczbą aktywnych ofert.
*   **[ClaimCompanyModal.js](file:///e:/sprzety_budowlane/components/ClaimCompanyModal.js)**: Interaktywne okno modalne służące do wysyłania zgłoszeń roszczeń do profili firm z katalogu.
*   **[CookieConsent.js](file:///e:/sprzety_budowlane/components/CookieConsent.js)**: Premium baner zgód na pliki cookies zgodny z RODO (GDPR) z pełną konfiguracją śledzenia Google Analytics.
*   **[CustomSelect.js](file:///e:/sprzety_budowlane/components/CustomSelect.js)**: Zaawansowany i w pełni stylizowany komponent wyboru (Select Dropdown) obsługujący podkategorie i ikony kategorii.
*   **[DocumentCard.js](file:///e:/sprzety_budowlane/components/DocumentCard.js)**: Karta pobierania wzorów umów najmu sprzętu budowlanego.
*   **[DynamicPlaceholder.js](file:///e:/sprzety_budowlane/components/DynamicPlaceholder.js)**: Dynamiczne grafiki zastępcze generowane z logo lub nazwą firmy dla ofert bez wgranych zdjęć.
*   **[FAQSchema.js](file:///e:/sprzety_budowlane/components/FAQSchema.js)**: Wstrzykuje dane FAQ w standardzie JSON-LD bezpośrednio do nagłówków SEO.
*   **[Filters.js](file:///e:/sprzety_budowlane/components/Filters.js)**: Belka filtrów szybkiego dostępu (sortowanie, wybór statusu).
*   **[FiltersSidebar.js](file:///e:/sprzety_budowlane/components/FiltersSidebar.js)**: Panel boczny z filtrami na urządzeniach mobilnych i desktopach (cena, odległość, dostępność).
*   **[Hero.js](file:///e:/sprzety_budowlane/components/Hero.js)**: Główny nagłówek strony z zaawansowaną wyszukiwarką lokalizacji i kategorii sprzętu budowlanego.
*   **[ListingCard.js](file:///e:/sprzety_budowlane/components/ListingCard.js)**: Premium karta prezentacyjna oferta z animacjami najechania myszką (hover), zdjęciem i ceną.
*   **[ListingGrid.js](file:///e:/sprzety_budowlane/components/ListingGrid.js)**: Kontener siatki (Flex/Grid layout) dla kart ogłoszeń.
*   **[ListingMap.js](file:///e:/sprzety_budowlane/components/ListingMap.js)**: Mapa szczegółów oferty zintegrowana z Maplibre GL, wektorowymi kafelkami i fallbackiem do CartoDB.
*   **[MapComponent.js](file:///e:/sprzety_budowlane/components/MapComponent.js)**: Zaawansowana, pełnoekranowa mapa klastrująca lokalizacje wielu maszyn na rynku.
*   **[Marketplace.js](file:///e:/sprzety_budowlane/components/Marketplace.js)**: Główny silnik i interfejs wyszukiwarki ogłoszeń, łączący mapy, filtry i listę wyników.
*   **[Navbar.js](file:///e:/sprzety_budowlane/components/Navbar.js)**: Pasek nawigacji u góry ekranu z obsługą logowania, rejestracji i stanu sesji użytkownika.
*   **[PrivacyModal.js](file:///e:/sprzety_budowlane/components/PrivacyModal.js)**: Szczegółowy modal ustawień cookies umożliwiający konfigurację poszczególnych zgód (analityka, marketing).
*   **[SeoFAQ.js](file:///e:/sprzety_budowlane/components/SeoFAQ.js)**: Sekcja FAQ przydatna do pozycjonowania organicznego na stronach kategorii.
*   **[StatsSection.js](file:///e:/sprzety_budowlane/components/StatsSection.js)**: Statystyki serwisu pokazujące liczbę użytkowników, maszyn i zrealizowanych wypożyczeń.
*   **[ToastProvider.js](file:///e:/sprzety_budowlane/components/ToastProvider.js)**: Kontekst obsługi powiadomień toast (react-hot-toast).
*   **[TrustBar.js](file:///e:/sprzety_budowlane/components/TrustBar.js)**: Pasek zaufania z logotypami partnerów oraz opiniami klientów.
*   **[dashboard/StatsDashboard.js](file:///e:/sprzety_budowlane/components/dashboard/StatsDashboard.js)**: Reużywalny komponent interfejsu React w systemie.
*   **[directory/CompanyCard.js](file:///e:/sprzety_budowlane/components/directory/CompanyCard.js)**: Bogata karta profilowa firmy w katalogu (adresy oddziałów, mapa, recenzje, formularz roszczenia).
*   **[directory/CompanyListCard.js](file:///e:/sprzety_budowlane/components/directory/CompanyListCard.js)**: Element listy firm prezentujący podsumowanie profilu w katalogu głównym.
*   **[directory/DirectoryBreadcrumbs.js](file:///e:/sprzety_budowlane/components/directory/DirectoryBreadcrumbs.js)**: Specjalne ścieżki nawigacji dla katalogu firm.
<!-- END_COMPONENTS_LIST -->
