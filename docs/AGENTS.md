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
W pliku [utils/supabase/middleware.js](file:///e:/sprzety_budowlane/utils/supabase/middleware.js) znajduje się mechanizm odświeżania sesji.
> [!CAUTION]
> **Nigdy nie umieszczaj żadnej logiki** pomiędzy wywołaniem `createServerClient` a `supabase.auth.getUser()`. Nawet drobna modyfikacja lub opóźnienie w tym miejscu może doprowadzić do losowego wylogowywania użytkowników i problemów z ciasteczkami sesyjnymi.

---

## 🔍 Wyszukiwarka i Podwójny Zapis (Double-Write)

Przy tworzeniu lub modyfikacji formularza dodawania ogłoszeń pamiętaj, że aplikacja stosuje **strategię podwójnego zapisu**:
1. Dane są zapisywane w bazie PostgreSQL w Supabase (tworząc rekord firmy oraz sprzętu ze statusem `pending` dla moderacji).
2. Dane są równolegle przesyłane do arkusza Google Sheets za pośrednictwem skryptu Google Apps Script (`GOOGLE_SCRIPT_URL`).
Jeśli modyfikujesz formularz, musisz dostosować payload w obu tych miejscach w pliku `app/api/add-listing/route.js`.

---

## 🗺️ Integracja Map i Geokodowania

- **Geokodowanie**: Serwerowy endpoint `/api/geocode` posiada wbudowany cache dla 23 największych miast Polski oraz logikę wycinania kodu pocztowego. Jeśli dodajesz wyszukiwanie po adresie, zawsze przepuszczaj zapytania przez to API, aby uniknąć limitowania zapytań (Rate Limiting) w serwisie OpenStreetMap Nominatim.
- **Mapy**: Komponent `ListingMap.js` renderuje mapy za pomocą wektorów MapTiler (z wykorzystaniem autorskiego ciemnego stylu **Fiord**). Jeśli klucz MapTiler nie jest dostępny, automatycznie przełącza się na ciemne kafelki rastrowe **Carto Dark**.
