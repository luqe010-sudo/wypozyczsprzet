# 🔒 API i Middleware

System **WypożyczSprzęt** wykorzystuje serwerowe punkty końcowe Next.js API Routes oraz globalny mechanizm Middleware do zapewnienia ochrony tras, obsługi sesji autoryzacyjnych oraz realizacji procesów biznesowych (podwójny zapis danych, geokodowanie).

---

## 🛡️ Ochrona Ścieżek i Middleware (`middleware.js`)

Aplikacja zabezpiecza prywatne obszary za pomocą globalnego pliku `/middleware.js`, który deleguje obsługę sesji do modułu w `/utils/supabase/middleware.js`.

### 1. Inicjalizacja Klienta Supabase w Middleware
Klient Supabase Server jest tworzony przy pomocy `@supabase/ssr` (`createServerClient`). Zapewnia to automatyczną synchronizację ciasteczek (cookies) sesyjnych między przeglądarką klienta a serwerem Next.js:
- Zaimplementowano funkcję `getAll()` i `setAll()` do odczytu i zapisu ciasteczek w nagłówkach żądania i odpowiedzi.
- Ciasteczka sesyjne mają flagę `sameSite: 'lax'` oraz `secure: true` w środowisku produkcyjnym.

### 2. Logika Zabezpieczania Ścieżek
Podczas każdego żądania middleware sprawdza autentykację użytkownika przy użyciu `supabase.auth.getUser()`. Następnie podejmuje decyzje o przekierowaniach:

*   **Pulpit Klienta (`/dashboard/*`)**:
    - Wymaga zalogowanego użytkownika (`user` !== null).
    - Brak sesji przekierowuje użytkownika na stronę `/login`.
*   **Panel Administratora (`/admin/*`)**:
    - Wymaga zalogowanego użytkownika z uprawnieniami administratora (`role === 'admin'`).
    - Po zweryfikowaniu tożsamości wysyłane jest zapytanie do tabeli `public.profiles` w celu sprawdzenia kolumny `role`.
    - Jeśli użytkownik nie jest zalogowany, zostaje odesłany na `/login`.
    - Jeśli użytkownik jest zalogowany, ale nie jest administratorem, zostaje odesłany na `/dashboard`.
*   **Strona Logowania (`/login`)**:
    - Zalogowany użytkownik wchodzący na `/login` jest automatycznie przekierowywany do `/dashboard`.

---

## ⚡ Punkty Końcowe API (API Routes)

Aplikacja udostępnia dwa kluczowe punkty końcowe do obsługi map oraz dodawania nowych ogłoszeń:

### 1. `POST /api/add-listing` - Formularz Dodawania Ogłoszenia
Zaawansowany endpoint przetwarzający publiczne zgłoszenie nowej maszyny do bazy. Posiada wdrożone zabezpieczenia oraz unikalną architekturę podwójnego zapisu:

- **Limitowanie Żądań (Rate Limiting)**: Maksymalnie **5 zgłoszeń na godzinę** z jednego adresu IP klienta (IP wyodrębniane z nagłówków `x-forwarded-for` lub `x-real-ip`). Dane są przechowywane w pamięci podręcznej serwera (`submissionBuckets`).
- **Walidacja Pliku Graficznego**:
  - Obsługiwane typy mime: `image/jpeg`, `image/png`, `image/webp`.
  - Maksymalny rozmiar pliku: **5 MB**.
  - Przesyłanie strumieniowe bufferów bezpośrednio do **Cloudinary** (folder `/listings`) bez zapisywania pliku tymczasowego na dysku serwera.
- **Double-Write Strategy (Podwójny Zapis)**:
  1. **Supabase (PostgreSQL)**: Tworzy nowy rekord w tabeli `companies` ze statusem `pending` oraz powiązany rekord w tabeli `equipment` ze statusem `pending` dla celów moderacji przez administratora.
  2. **Google Sheets API**: Równolegle wysyła ustrukturyzowany pakiet danych w formacie JSON do zewnętrznego skryptu Google Apps Script (`GOOGLE_SCRIPT_URL`), aby zsynchronizować ogłoszenie w arkuszu kalkulacyjnym.

### 2. `GET /api/geocode` - Geolokalizacja i Geokodowanie Adresów
Endpoint optymalizujący pobieranie współrzędnych geograficznych dla miast i adresów w Polsce.

- **Server-Side Cache**: Posiada wbudowaną statyczną mapę pamięci podręcznej (`geocodeCache`) z zapisanymi współrzędnymi dla 23 największych miast w Polsce (np. Wrocław, Warszawa, Kraków, Rzeszów), co redukuje narzut sieciowy do zera dla większości zapytań.
- **Fallback Kodów Pocztowych**: Wykorzystuje wyrażenia regularne do wycinania kodu pocztowego (np. z `"50-001 Wrocław"` pobiera `"Wrocław"`) i sprawdza dopasowanie w cache miast.
- **Integracja z OpenStreetMap Nominatim**: Jeśli zapytanie nie znajduje się w cache, endpoint wysyła zapytanie do zewnętrznego serwera Nominatim z ustawionym niestandardowym User-Agentem (`WypozyczSprzet/1.0`) w celu pobrania dokładnych współrzędnych. Udane zapytania są automatycznie dopisywane do cache.
