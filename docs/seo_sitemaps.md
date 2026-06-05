# 🔍 Strategia SEO i Sitemapy XML

Optymalizacja pod kątem wyszukiwarek (SEO) to jeden z najważniejszych filarów sukcesu platformy **WypożyczSprzęt**. Projekt wdraża zaawansowane techniki pozycjonowania on-page, semantyczną strukturę HTML5 oraz automatycznie generowane indeksy map witryn.

---

## 🏷️ Dynamiczne Generowanie Metadanych i SEO-Friendly URLs

Wszystkie kluczowe ścieżki w aplikacji posiadają zautomatyzowany mechanizm generowania unikalnych metatagów przy użyciu funkcji serwerowej `generateMetadata({ params })` w Next.js.

### 1. Struktura Przyjaznych Adresów URL
Zamiast tradycyjnych identyfikatorów bazodanowych (np. `?id=123`), system stosuje czytelne i bogate w słowa kluczowe ścieżki:
- Szczegóły oferty: `/[category]/[city]/[slug]` (np. `/earthmoving/wroclaw/koparka-gasienicowa-cat-320`)
- Profil firmy w katalogu: `/katalog/[city]/[companySlug]` (np. `/katalog/wroclaw/rent-expert-budowlany`)

### 2. Format Tytułów i Opisów (Dynamic Metadata)
Metadane są optymalizowane pod kątem współczynnika klikalności (CTR) w wynikach wyszukiwania Google:
- **Tytuł Oferty**: „`{Nazwa_Sprzętu} – wynajem {Miasto} | od {Cena} PLN | WypożyczSprzęt`”
- **Opis Oferty (Meta Description)**: „`{Nazwa_Sprzętu} na wynajem w {Miasto}. Sprawdź dostępność i lokalne oferty wynajmu od firm i osób prywatnych.`”
- **Słowa Kluczowe**: Automatycznie generowany ciąg tagów na podstawie kategorii i lokalizacji maszyny.

### 3. Zabezpieczenie przed Kanibalizacją (Canonical Tags)
Każda dynamiczna podstrona posiada jawnie zadeklarowany znacznik kanoniczny (`canonical` URL):
- Dla ofert punkt kanoniczny wskazuje na ich dokładny przyjazny URL.
- Dla wariantów lokalnych katalogu firm, jeśli firma posiada oddział we Wrocławiu i Oławie, system wstrzykuje główny (pierwszy) oddział jako URL kanoniczny, co konsoliduje moc linków (link juice) i zapobiega filtrom za duplikację treści.

---

## 🗂️ Dane Strukturalne JSON-LD (Rich Snippets)

System wstrzykuje do kodu HTML kompletne zestawy mikrodanych w formacie JSON-LD. Pozwala to na prezentację bogatych wyników w wyszukiwarce Google (gwiazdki ocen, ceny, FAQ bezpośrednio na liście wyników wyszukiwania).

### 1. `Schema.org/Product` (Karta Szczegółów Maszyny)
Prezentuje maszynę jako produkt do wynajęcia. Zawiera:
- Nazwę, opis i URL zdjęcia z Cloudinary.
- Sekcję **AggregateRating** (wstępna ocena 4.5/5 na podstawie opinii).
- Sekcję **Offers** z podaną ceną minimalną (`price`), walutą (`PLN`), dostępnością (`InStock`), obszarem świadczenia usługi (`areaServed`) oraz brakiem polityki zwrotów (brak możliwości zwrotu usług najmu).

### 2. `Schema.org/LocalBusiness` (Profil Firmy / Strona Główna)
Opisuje fizyczny biznes lokalny. Zawiera:
- Nazwę firmy, opis, logotyp i witrynę WWW.
- Adresy fizyczne wszystkich oddziałów wraz z podziałem na województwa i miasta.
- Numery telefonów i adresy e-mail do bezpośredniego kontaktu.

### 3. `Schema.org/BreadcrumbList` (Nawigacja)
Definiuje hierarchię podstrony w strukturze serwisu (Strona główna -> Kategoria -> Miasto -> Nazwa Oferty), co ułatwia robotom Google indeksowanie struktury kategorii.

### 4. `Schema.org/FAQPage` (Sekcja Pytań i Odpowiedzi)
Dynamicznie generuje zestaw czterech pytań i odpowiedzi specyficznych dla każdej maszyny (ceny wynajmu w danym mieście, zasady odbioru, dostępność, sposób kontaktu). Google może wyświetlić te pytania bezpośrednio pod wynikiem wyszukiwania.

---

## 🗺️ Dynamiczne Mapy Witryn (Sitemaps XML)

Platforma automatycznie generuje indeksy sitemap w celu błyskawicznego powiadamiania wyszukiwarek o nowych ofertach lub zarejestrowanych firmach.

### 1. Indeks Główny (`/sitemap.xml`)
Next.js udostępnia główny plik indeksu mapy witryny (`app/sitemap.xml/route.js`), który zbiera poszczególne mapy tematyczne:
- `/sitemaps/offers.xml` - aktywne oferty sprzętu.
- `/sitemaps/categories.xml` - strony główne kategorii.
- `/sitemaps/local-hubs.xml` - warianty lokalne kategorii.
- `/sitemaps/cities.xml` / `/sitemaps/voivodeships.xml` - wykazy miast i województw.
- `/sitemaps/katalog.xml` - dynamiczny indeks katalogu firm.

### 2. Generator Sitemapy Katalogu (`/sitemaps/katalog`)
Plik `/app/sitemaps/katalog/route.js` w czasie rzeczywistym generuje dynamiczną mapę XML dla wszystkich placówek w katalogu firm:
- Pobiera z bazy danych pełną listę firm oraz ich placówek (`supabaseDirectory.fetchAllCompanies()`).
- Iteruje po oddziałach każdej firmy i generuje zestaw wariantów dla miast (`/katalog/[city]/[companySlug]`) z priorytetem `0.7` i częstotliwością zmian `monthly`.
- Generuje warianty dla województw (`/katalog/woj/[voivodeship]/[companySlug]`) z priorytetem `0.6`.
- Ustawia datę ostatniej modyfikacji (`lastmod`) na podstawie pola `updated_at` lub `created_at` z bazy danych Supabase.
