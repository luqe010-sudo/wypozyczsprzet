# 🤖 Wytyczne dla Agentów AI i Asystentów Deweloperskich

Witaj! Jeśli jesteś agentem AI (np. Antigravity, Claude, ChatGPT, Gemini, Cursor) i zostałeś zaangażowany do pracy nad projektem **WypożyczSprzęt**, ten dokument zawiera krytyczne informacje, reguły techniczne oraz wytyczne architektoniczne, których **musisz bezwzględnie przestrzegać**, aby zachować spójność systemu.

---

## 🚀 Złote Zasady Projektu (Zasady Krytyczne)

### 1. 🔄 Utrzymanie "Żywej Dokumentacji" (Living Documentation)
Ten projekt posiada automatyczny system generowania spisu tras, komponentów oraz migracji SQL.
- Po dodaniu nowej trasy w `/app`, nowego komponentu w `/components` lub pliku migracji `*.sql` w katalogu głównym, **zawsze uruchom**:
  ```bash
  npm run docs:update
  ```
- Skrypt automatycznie przeskanuje pliki i uzupełni odpowiednie sekcje w `/docs/architecture.md`, `/docs/components.md` i `/docs/database.md`.

### 2. 🎨 Reguły UI i Stylizacji
- **Estetyka Premium**: Projekt dba o nienaganny, nowoczesny wygląd (glassmorphism, animacje mikrointerakcji, zaokrąglone rogi `rounded-2xl`).
- **Stylizacja**: Używaj czystego Tailwind CSS zgodnie z konfiguracją [tailwind.config.js](file:///e:/sprzety_budowlane/tailwind.config.js).
- **Brak Placeholders**: Nigdy nie dodawaj do kodu pustych grafik ani uproszczonych placeholderów. Jeśli oferta/firma nie posiada wgranego zdjęcia, używaj dedykowanego komponentu `<DynamicPlaceholder name="..." />`.

---

## 🗄️ Supabase i Architektura Bezpieczeństwa

### 1. Zabezpieczenia RLS (Row Level Security)
Wszystkie tabele bazy danych mają włączone RLS. Pamiętaj:
- **Zwykłe operacje klienckie**: Korzystaj ze standardowego klienta `createClient()` z modułu `@/utils/supabase/server`. Pobiera on ciasteczka zalogowanego użytkownika i respektuje RLS.
- **Operacje Administracyjne**: Korzystaj z klienta **Service Role** (`createSupabaseAdminClient` z `lib/supabaseAdmin.js`) **wyłącznie** w zabezpieczonych akcjach serwerowych (np. akceptacja ofert przez admina, operacje katalogowe omijające RLS).
- **Weryfikacja Admina**: Zawsze rozpoczynaj Server Actions w panelu admina od wywołania funkcji `checkAdmin()` (zdefiniowanej w `actions.js`).

### 2. Krytyczna pułapka sesji w Middleware
W pliku [utils/supabase/middleware.js](file:///e:/sprzety_budowlane/utils/supabase/middleware.js) (wywoływanym z `proxy.js`) znajduje się mechanizm odświeżania sesji.
> [!CAUTION]
> **Nigdy nie umieszczaj żadnej logiki** pomiędzy wywołaniem `createServerClient` a `supabase.auth.getUser()`. Nawet drobna modyfikacja lub opóźnienie w tym miejscu może doprowadzić do losowego wylogowywania użytkowników i problemów z ciasteczkami sesyjnymi.

---

## 📝 Ogłoszenia, slugi i moderacja

- **Dane**: jedynym źródłem jest Supabase, czytane przez `lib/listings.js`. Nie ma już zapisu do CSV ani Google Sheets.
- **Slug jest stały**: powstaje raz, przy tworzeniu ogłoszenia (`generateUniqueSlug`), i nie zmienia się przy edycji nazwy ani miasta. Strona oferty szuka po samym slugu i przekierowuje 308 na kanoniczną ścieżkę.
- **Prawda w treści**: nie dodawaj zaszytych na stałe opinii, liczb ani plakietek. Fakty o ofercie pokazujemy tylko, gdy są w danych (`listingFacts` w `lib/format.js`). Plakietka „Zweryfikowana firma” wynika wyłącznie z `companies.verified_at`.
- **Moderacja w bazie**: triggery `guard_equipment_write` i `guard_company_write` pilnują statusu, priorytetu, sluga i `verified_at` dla zwykłych użytkowników. Pierwsze ogłoszenie niezweryfikowanej firmy dostaje status `pending`.
- **Polecane**: ogłoszenie jest polecane, gdy `priority > 1`. Ustawia to tylko administrator gwiazdką w `/admin/equipment`. Pole `promotion` to jedynie deklaracja właściciela, że chce promować ogłoszenie w przyszłości.
- **Zapytania** (`inquiries`): tworzy wyłącznie serwer przez `app/actions/inquiryActions.js`. Maile idą przez Resend (`lib/email.js`); bez `RESEND_API_KEY` zapytania nadal zapisują się i są widoczne w panelach.
- **Zdjęcia**: przeglądarka wysyła je bezpośrednio do Cloudinary po podpisie z `/api/upload-signature`.

---

## 🗺️ Integracja Map i Geokodowania

- **Geokodowanie**: współrzędne powstają przy zapisie firmy lub oddziału (`lib/geocoding.js`, MapTiler) i są trzymane w bazie. Przeglądarka nie geokoduje nic sama.
- **Mapy**: Komponent `ListingMap.js` renderuje mapy za pomocą wektorów MapTiler (z wykorzystaniem autorskiego ciemnego stylu **Fiord**). Jeśli klucz MapTiler nie jest dostępny, automatycznie przełącza się na ciemne kafelki rastrowe **Carto Dark**.
