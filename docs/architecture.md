# 🏛️ Architektura Systemu i Trasy

Aplikacja **WypożyczSprzęt** jest zbudowana w oparciu o framework **Next.js 14** z wykorzystaniem **App Router**. Łączy w sobie zalety statycznego generowania stron (SSG), renderowania po stronie serwera (SSR) oraz dynamicznych akcji serwerowych (Server Actions).

---

## 📂 Struktura Katalogów

Projekt jest podzielony na logiczne warstwy odpowiedzialne za logikę biznesową, prezentację danych i konfigurację:

```
├── app/                  # Trasy aplikacji (App Router), strony, layouty i API
│   ├── (categories)/     # Trasy kategorii i szczegółów ofert (dynamiczne grupy)
│   ├── admin/            # Panel administratora (zarządzanie zgłoszeniami, firmami, użytkownikami)
│   ├── api/              # Trasy API (dodawanie ofert, geokodowanie adresów)
│   ├── auth/             # Trasy autoryzacyjne (obsługa Supabase auth callbacks)
│   ├── dashboard/        # Panel zalogowanego klienta (zarządzanie własną firmą i sprzętem)
│   ├── katalog/          # Dynamiczny katalog firm (katalog według miast, województw)
│   └── sitemaps/         # Generatory map witryny (Sitemap XML)
├── components/           # Reużywalne komponenty React (UI, mapy, formularze)
│   ├── dashboard/        # Komponenty panelu klienta
│   └── directory/        # Komponenty katalogu firm
├── lib/                  # Biblioteki narzędziowe, integracje z zewnętrznymi API (Google Sheets, Cloudinary)
├── public/               # Statyczne zasoby aplikacji (ikony, obrazki nagłówków)
├── scripts/              # Skrypty migracyjne oraz automatyzacja zadań deweloperskich
└── utils/                # Narzędzia pomocnicze (np. konfiguracja Supabase middleware dla serwera i klienta)
```

---

## 🎨 System Stylizacji i UI

Stylizacja aplikacji opiera się na **Tailwind CSS** wspieranym przez konfigurację zmiennych CSS (Custom Properties) dla płynnej obsługi trybu ciemnego (Dark Mode).

- **[tailwind.config.js](file:///e:/sprzety_budowlane/tailwind.config.js)**: Definiuje niestandardowe palety kolorów, promienie zaokrągleń oraz animacje. Rozszerza konfigurację o dopasowanie do standardów premium: bogate barwy niebieskiego (`blue`), szarości (`slate`, `gray`) oraz akcenty ostrzegawcze/informacyjne.
- **[app/globals.css](file:///e:/sprzety_budowlane/app/globals.css)**: Zawiera bazowe definicje stylów dla klas Tailwind CSS, customowe style dla biblioteki Leaflet, customowy scrollbar oraz animowane tła w stylu szklanych paneli (glassmorphism).

---

## 🗺️ Wykaz Stron i Tras Aplikacji (Page Routes)

Poniższa lista przedstawia trasy zdefiniowane w katalogu `app/`. Zostały one skatalogowane automatycznie na podstawie analizy struktury plików.

<!-- START_ROUTES_LIST -->
### 📌 Zarejestrowane Strony i Endpointy (Generowane automatycznie)

*   `home` -> `/` - Główna strona marketplace'u z wyszukiwarką sprzętu, mapą oraz kategoriami.
*   `[category]` -> `/[category]` - Nowo wykryta dynamiczna trasa w systemie.
*   `[category]/[city]` -> `/[category]/[city]` - Nowo wykryta dynamiczna trasa w systemie.
*   `[category]/[city]/[slug]` -> `/[category]/[city]/[slug]` - Karta szczegółów konkretnej oferty sprzętu na wynajem (SEO-friendly url).
*   `admin` -> `/admin` - Pulpit nawigacyjny administratora systemu.
*   `admin/claims` -> `/admin/claims` - Obsługa zgłoszeń praw własności do firm.
*   `admin/companies` -> `/admin/companies` - Panel akceptacji i zarządzania zarejestrowanymi firmami.
*   `admin/companies/[id]/edit` -> `/admin/companies/[id]/edit` - Nowo wykryta dynamiczna trasa w systemie.
*   `admin/companies/new` -> `/admin/companies/new` - Nowo wykryta dynamiczna trasa w systemie.
*   `admin/directory` -> `/admin/directory` - Panel zarządzania katalogiem firm.
*   `admin/directory/[id]/edit` -> `/admin/directory/[id]/edit` - Nowo wykryta dynamiczna trasa w systemie.
*   `admin/directory/new` -> `/admin/directory/new` - Nowo wykryta dynamiczna trasa w systemie.
*   `admin/equipment` -> `/admin/equipment` - Moderacja ofert sprzętu budowlanego.
*   `admin/equipment/[id]/edit` -> `/admin/equipment/[id]/edit` - Nowo wykryta dynamiczna trasa w systemie.
*   `admin/equipment/new` -> `/admin/equipment/new` - Nowo wykryta dynamiczna trasa w systemie.
*   `admin/users` -> `/admin/users` - Zarządzanie rolami użytkowników.
*   `blog` -> `/blog` - Nowo wykryta dynamiczna trasa w systemie.
*   `blog/[slug]` -> `/blog/[slug]` - Nowo wykryta dynamiczna trasa w systemie.
*   `dashboard` -> `/dashboard` - Główny panel klienta/właściciela wypożyczalni.
*   `dashboard/company/[id]` -> `/dashboard/company/[id]` - Nowo wykryta dynamiczna trasa w systemie.
*   `dashboard/company/[id]/edit` -> `/dashboard/company/[id]/edit` - Nowo wykryta dynamiczna trasa w systemie.
*   `dashboard/company/[id]/equipment/new` -> `/dashboard/company/[id]/equipment/new` - Nowo wykryta dynamiczna trasa w systemie.
*   `dashboard/company/[id]/stats` -> `/dashboard/company/[id]/stats` - Nowo wykryta dynamiczna trasa w systemie.
*   `dashboard/company/new` -> `/dashboard/company/new` - Nowo wykryta dynamiczna trasa w systemie.
*   `dashboard/equipment/[id]/edit` -> `/dashboard/equipment/[id]/edit` - Nowo wykryta dynamiczna trasa w systemie.
*   `dashboard/settings` -> `/dashboard/settings` - Nowo wykryta dynamiczna trasa w systemie.
*   `katalog` -> `/katalog` - Publiczny spis i wyszukiwarka firm w katalogu.
*   `katalog/[city]/[companySlug]` -> `/katalog/[city]/[companySlug]` - Strona profilowa firmy w konkretnym mieście.
*   `katalog/woj/[voivodeship]/[companySlug]` -> `/katalog/woj/[voivodeship]/[companySlug]` - Strona profilowa firmy w konkretnym województwie.
*   `kontakt` -> `/kontakt` - Formularz kontaktowy i dane kontaktowe.
*   `login` -> `/login` - Ekran logowania/rejestracji zintegrowany z Supabase Auth.
*   `oferta/[slug]` -> `/oferta/[slug]` - Nowo wykryta dynamiczna trasa w systemie.
*   `regulamin` -> `/regulamin` - Regulamin świadczenia usług platformy.
*   `robots.txt` -> `/robots.txt` - Nowo wykryta dynamiczna trasa w systemie.
*   `sitemap.xml` -> `/sitemap.xml` - Nowo wykryta dynamiczna trasa w systemie.
*   `umowy` -> `/umowy` - Nowo wykryta dynamiczna trasa w systemie.
*   `umowy/[slug]` -> `/umowy/[slug]` - Nowo wykryta dynamiczna trasa w systemie.
<!-- END_ROUTES_LIST -->

---

## 🔄 Cykl Renderowania i Caching

Aplikacja wykorzystuje nowoczesne metody buforowania danych w Next.js 14:
1. **Dynamiczne Metadane**: Metadane na stronach dynamicznych (takich jak karta szczegółowa oferty lub strona firmy) są generowane za pomocą funkcji `generateMetadata({ params })`.
2. **Rewalidacja Ścieżek (On-demand Revalidation)**: Po modyfikacji danych za pomocą Server Actions (np. po akceptacji sprzętu przez admina lub edycji profilu przez użytkownika) wywoływane są funkcje `revalidatePath()` oraz `revalidateTag('listings')`. Zapewnia to natychmiastowe odświeżenie danych u użytkowników przy zachowaniu zalet statycznego buforowania (Incremental Static Regeneration - ISR).
3. **Generowanie Statycznych Parametrów**: Dla profili firm w katalogu wykorzystywana jest funkcja `generateStaticParams()` w celu wygenerowania ścieżek `/katalog/[city]/[companySlug]` na etapie budowania aplikacji (Build Time), co gwarantuje natychmiastowy czas ładowania (TTFB).
