# 🚀 Konfiguracja Środowiskowa i Wdrożenie

Projekt **WypożyczSprzęt** wymaga prawidłowej konfiguracji zmiennych środowiskowych do komunikacji z bazą danych Supabase, usługą hostingu mediów Cloudinary oraz arkuszami kalkulacyjnymi Google Sheets.

---

## 🔑 Zmienne Środowiskowe (`.env.local`)

W głównym katalogu projektu należy stworzyć plik `.env.local` na bazie szablonu `.env.example`. Plik ten zawiera zarówno klucze publiczne (dostępne po stronie przeglądarki), jak i klucze prywatne serwera (które nigdy nie powinny zostać upublicznione).

```ini
# ==============================================================================
# SUPABASE CONFIGURATION
# ==============================================================================
# Publiczny adres URL projektu Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
# Publiczny klucz anonimowy (do operacji po stronie klienta z RLS)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# Prywatny klucz Service Role (MANDATORY dla Server Actions i API, omija RLS!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.service_role...

# ==============================================================================
# CLOUDINARY CONFIGURATION (Media hosting)
# ==============================================================================
# Nazwa chmury w Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
# Prywatny klucz API
CLOUDINARY_API_KEY=123456789012345
# Prywatny sekret API
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# ==============================================================================
# THIRD-PARTY INTEGRATIONS
# ==============================================================================
# Adres URL skryptu Google Apps Script do synchronizacji arkuszy
RESEND_API_KEY=re_xxx
EMAIL_FROM=WypożyczSprzęt <powiadomienia@wypozycz.online>
ADMIN_NOTIFICATION_EMAIL=
CRON_SECRET=losowy-ciag-znakow
NEXT_PUBLIC_SITE_URL=https://wypozycz.online
# Opcjonalny klucz MapTiler dla niestandardowych wektorowych map premium
NEXT_PUBLIC_MAPTILER_KEY=your-maptiler-key
```

> [!CAUTION]
> **Nigdy nie commituj klucza `SUPABASE_SERVICE_ROLE_KEY` ani `CLOUDINARY_API_SECRET` do repozytorium Git!** Posiadanie klucza Service Role umożliwia pełny odczyt i modyfikację całej bazy danych z pominięciem jakichkolwiek reguł RLS. Upewnij się, że `.env.local` jest wpisany w `.gitignore`.

---

## 🛠️ Integracje z Zewnętrznymi Serwisami

### 1. Supabase (Baza Danych & Auth)
Baza danych musi zostać najpierw zainicjowana skryptami SQL dostępnymi w głównym katalogu projektu:
1. Uruchom `supabase_admin_setup.sql` w edytorze SQL Supabase w celu utworzenia tabeli profili i funkcji administratora.
2. Uruchom podstawowy skrypt `supabase_setup.sql`.
3. Następnie wykonaj migracje kategorii (`supabase_category_migration.sql`) oraz katalogu (`supabase_directory_migration.sql`).

### 2. Cloudinary (Przechowywanie Zdjęć)
Aplikacja wysyła zdjęcia maszyn i logo firm bezpośrednio z serwera Next.js:
- Maszyny są zapisywane w folderze `listings`.
- Logo firm z katalogu są zapisywane w folderze `company_logos`.
- Zdjęcia maszyn przesyłane są strumieniowo przy użyciu metody `cloudinary.uploader.upload_stream` ze zdefiniowanym folderem docelowym.

### 3. Resend (powiadomienia e-mail)
Bez `RESEND_API_KEY` zapytania zapisują się w bazie i są widoczne w panelach, ale nikt nie dostaje maila. Domena z `EMAIL_FROM` musi być zweryfikowana w Resend.

---

## 💻 Uruchamianie Lokalne i Budowanie Produkcyjne

Do uruchomienia projektu wymagane jest środowisko **Node.js** (wersja 18 lub nowsza) oraz menedżer pakietów **npm**.

### 1. Instalacja Zależności
Zainstaluj wymagane pakiety bibliotek:
```bash
npm install
```

### 2. Uruchomienie Serwera Deweloperskiego
Uruchom aplikację lokalnie z przeładowywaniem kodu w czasie rzeczywistym (Hot Reloading):
```bash
npm run dev
```
Aplikacja będzie dostępna pod adresem [http://localhost:3000](http://localhost:3000).

### 3. Budowanie Wersji Produkcyjnej (Build)
Skompiluj kod źródłowy, przeprowadź optymalizację kodu i przygotuj aplikację do wdrożenia na serwerze:
```bash
npm run build
```

### 4. Uruchomienie Produkcyjne
Po pomyślnym zbudowaniu wersji produkcyjnej, uruchom zoptymalizowany serwer:
```bash
npm start
```
