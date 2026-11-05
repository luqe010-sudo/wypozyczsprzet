# 🔒 API i Middleware

System **WypożyczSprzęt** wykorzystuje serwerowe punkty końcowe Next.js API Routes oraz globalny mechanizm Middleware do zapewnienia ochrony tras, obsługi sesji autoryzacyjnych oraz realizacji procesów biznesowych (podwójny zapis danych, geokodowanie).

---

## 🛡️ Ochrona Ścieżek i Proxy (`proxy.js`)

Aplikacja zabezpiecza prywatne obszary za pomocą globalnego pliku `/proxy.js`, który deleguje obsługę sesji do modułu w `/utils/supabase/middleware.js`.

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

### 1. `POST /api/upload-signature`: podpis wysyłki zdjęcia
Dostępny tylko dla zalogowanych. Zwraca podpis, z którym przeglądarka wysyła zdjęcie bezpośrednio do Cloudinary (folder `listings`, formaty JPG/PNG/WEBP).

### 2. `GET /api/cron/freshness`: zadanie dzienne
Uruchamiane przez Vercel Cron z nagłówkiem `Authorization: Bearer $CRON_SECRET`. Przypomina właścicielom o potwierdzeniu ogłoszeń, ukrywa niepotwierdzone (tylko gdy działa wysyłka maili) i anonimizuje zapytania starsze niż 12 miesięcy.

### 3. Server Action `submitInquiry` (`app/actions/inquiryActions.js`)
Formularz zapytania: walidacja, honeypot, limit 5 zapytań na godzinę z jednego hasha IP, zapis do `inquiries` kluczem serwisowym i powiadomienia e-mail.

