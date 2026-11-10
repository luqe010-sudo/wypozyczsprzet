# 🧱 Komponenty UI i Integracje Mapowe

Aplikacja **WypożyczSprzęt** posiada rozbudowaną warstwę prezentacji opartą o reużywalne komponenty React. Integracja z interaktywnymi mapami oraz zaawansowane filtrowanie ofert stanowią rdzeń interfejsu użytkownika.

---

## 🗺️ Integracje Mapowe (Leaflet i Maplibre GL)

Aplikacja wdrożyła podwójną architekturę map w celu optymalizacji wydajności i wyglądu:

### 1. `ListingMap.js` (React Map GL + Maplibre GL)
Używany na karcie szczegółów oferty. Prezentuje punktową lokalizację sprzętu.
- **Stylizacja Premium**: Wykorzystuje autorski ciemny styl **Fiord** zintegrowany z **MapTiler** (za pośrednictwem wektorowego źródła kafelków `openmaptiles`). Jeśli brak klucza `NEXT_PUBLIC_MAPTILER_KEY`, następuje automatyczny fallback do ciemnych kafelków rastrowych **Carto Dark**.
- **Współrzędne z bazy**: mapa korzysta wyłącznie z `lat`/`lng` zapisanych przy oddziale firmy.
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
*   **[CategoryHubs.js](file:///e:/sprzety_budowlane/components/CategoryHubs.js)**: Kafelki na stronie głównej prezentujące główne kategorie sprzętu (roboty ziemne, ogród, narzędzia) wraz z liczbą aktywnych ofert.
*   **[ClaimCompanyModal.js](file:///e:/sprzety_budowlane/components/ClaimCompanyModal.js)**: Interaktywne okno modalne służące do wysyłania zgłoszeń roszczeń do profili firm z katalogu.
*   **[CookieConsent.js](file:///e:/sprzety_budowlane/components/CookieConsent.js)**: Premium baner zgód na pliki cookies zgodny z RODO (GDPR) z pełną konfiguracją śledzenia Google Analytics.
*   **[CookieConsentLoader.js](file:///e:/sprzety_budowlane/components/CookieConsentLoader.js)**: Reużywalny komponent interfejsu React w systemie.
*   **[CustomSelect.js](file:///e:/sprzety_budowlane/components/CustomSelect.js)**: Zaawansowany i w pełni stylizowany komponent wyboru (Select Dropdown) obsługujący podkategorie i ikony kategorii.
*   **[DocumentCard.js](file:///e:/sprzety_budowlane/components/DocumentCard.js)**: Karta pobierania wzorów umów najmu sprzętu budowlanego.
*   **[DynamicPlaceholder.js](file:///e:/sprzety_budowlane/components/DynamicPlaceholder.js)**: Dynamiczne grafiki zastępcze generowane z logo lub nazwą firmy dla ofert bez wgranych zdjęć.
*   **[FAQSchema.js](file:///e:/sprzety_budowlane/components/FAQSchema.js)**: Wstrzykuje dane FAQ w standardzie JSON-LD bezpośrednio do nagłówków SEO.
*   **[FavoriteButton.js](file:///e:/sprzety_budowlane/components/FavoriteButton.js)**: Reużywalny komponent interfejsu React w systemie.
*   **[FeaturedListings.js](file:///e:/sprzety_budowlane/components/FeaturedListings.js)**: Reużywalny komponent interfejsu React w systemie.
*   **[LatestListings.js](file:///e:/sprzety_budowlane/components/LatestListings.js)**: One download per visit: switching back to the map reuses the pins already fetched.
*   **[ListingCard.js](file:///e:/sprzety_budowlane/components/ListingCard.js)**: Premium karta prezentacyjna oferta z animacjami najechania myszką (hover), zdjęciem i ceną.
*   **[ListingMap.js](file:///e:/sprzety_budowlane/components/ListingMap.js)**: Mapa szczegółów oferty zintegrowana z Maplibre GL, wektorowymi kafelkami i fallbackiem do CartoDB.
*   **[MapComponent.js](file:///e:/sprzety_budowlane/components/MapComponent.js)**: Zaawansowana, pełnoekranowa mapa klastrująca lokalizacje wielu maszyn na rynku.
*   **[Navbar.js](file:///e:/sprzety_budowlane/components/Navbar.js)**: Pasek nawigacji u góry ekranu z obsługą logowania, rejestracji i stanu sesji użytkownika.
*   **[PopularEquipment.js](file:///e:/sprzety_budowlane/components/PopularEquipment.js)**: Pill-length names and an order that pairs short with long, so the panel is one row on a laptop
*   **[RentalSteps.js](file:///e:/sprzety_budowlane/components/RentalSteps.js)**: Reużywalny komponent interfejsu React w systemie.
*   **[SiteBrand.js](file:///e:/sprzety_budowlane/components/SiteBrand.js)**: Reużywalny komponent interfejsu React w systemie.
*   **[ToastProvider.js](file:///e:/sprzety_budowlane/components/ToastProvider.js)**: Kontekst obsługi powiadomień toast (react-hot-toast).
*   **[browse/BrowseListings.js](file:///e:/sprzety_budowlane/components/browse/BrowseListings.js)**: Reużywalny komponent interfejsu React w systemie.
*   **[browse/HubSummary.js](file:///e:/sprzety_budowlane/components/browse/HubSummary.js)**: Reużywalny komponent interfejsu React w systemie.
*   **[browse/HubView.js](file:///e:/sprzety_budowlane/components/browse/HubView.js)**: Reużywalny komponent interfejsu React w systemie.
*   **[browse/SavedListings.js](file:///e:/sprzety_budowlane/components/browse/SavedListings.js)**: Reużywalny komponent interfejsu React w systemie.
*   **[dashboard/DashboardNav.js](file:///e:/sprzety_budowlane/components/dashboard/DashboardNav.js)**: Reużywalny komponent interfejsu React w systemie.
*   **[dashboard/EquipmentList.js](file:///e:/sprzety_budowlane/components/dashboard/EquipmentList.js)**: Reużywalny komponent interfejsu React w systemie.
*   **[dashboard/EquipmentRowActions.js](file:///e:/sprzety_budowlane/components/dashboard/EquipmentRowActions.js)**: Reużywalny komponent interfejsu React w systemie.
*   **[dashboard/ListingDetailsFields.js](file:///e:/sprzety_budowlane/components/dashboard/ListingDetailsFields.js)**: Reużywalny komponent interfejsu React w systemie.
*   **[dashboard/StatsDashboard.js](file:///e:/sprzety_budowlane/components/dashboard/StatsDashboard.js)**: Reużywalny komponent interfejsu React w systemie.
*   **[directory/CompanyCard.js](file:///e:/sprzety_budowlane/components/directory/CompanyCard.js)**: Bogata karta profilowa firmy w katalogu (adresy oddziałów, mapa, recenzje, formularz roszczenia).
*   **[directory/CompanyListCard.js](file:///e:/sprzety_budowlane/components/directory/CompanyListCard.js)**: Element listy firm prezentujący podsumowanie profilu w katalogu głównym.
*   **[directory/DirectoryBreadcrumbs.js](file:///e:/sprzety_budowlane/components/directory/DirectoryBreadcrumbs.js)**: Specjalne ścieżki nawigacji dla katalogu firm.
*   **[icons/EquipmentIcons.js](file:///e:/sprzety_budowlane/components/icons/EquipmentIcons.js)**: Reużywalny komponent interfejsu React w systemie.
*   **[inquiries/InquiryList.js](file:///e:/sprzety_budowlane/components/inquiries/InquiryList.js)**: Reużywalny komponent interfejsu React w systemie.
*   **[listing/InquiryForm.js](file:///e:/sprzety_budowlane/components/listing/InquiryForm.js)**: Reużywalny komponent interfejsu React w systemie.
*   **[listing/ListingGallery.js](file:///e:/sprzety_budowlane/components/listing/ListingGallery.js)**: Reużywalny komponent interfejsu React w systemie.
*   **[listing/ListingImage.js](file:///e:/sprzety_budowlane/components/listing/ListingImage.js)**: Reużywalny komponent interfejsu React w systemie.
<!-- END_COMPONENTS_LIST -->
