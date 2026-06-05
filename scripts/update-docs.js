const fs = require('fs');
const path = require('path');

// Configuration
const BASE_DIR = path.resolve(__dirname, '..');
const APPS_DIR = path.join(BASE_DIR, 'app');
const COMPONENTS_DIR = path.join(BASE_DIR, 'components');
const DOCS_DIR = path.join(BASE_DIR, 'docs');

console.log('⚡ Starting Living Documentation automated update...');

// --- 1. SCAN ROUTES ---
const routeDescriptions = {
  'home': 'Główna strona marketplace\'u z wyszukiwarką sprzętu, mapą oraz kategoriami.',
  'regulamin': 'Regulamin świadczenia usług platformy.',
  'kontakt': 'Formularz kontaktowy i dane kontaktowe.',
  'oferta': 'Informacje o ofercie dla firm i korzyściach z dodania wypożyczalni.',
  'login': 'Ekran logowania/rejestracji zintegrowany z Supabase Auth.',
  'dashboard': 'Główny panel klienta/właściciela wypożyczalni.',
  'admin': 'Pulpit nawigacyjny administratora systemu.',
  'admin/users': 'Zarządzanie rolami użytkowników.',
  'admin/companies': 'Panel akceptacji i zarządzania zarejestrowanymi firmami.',
  'admin/equipment': 'Moderacja ofert sprzętu budowlanego.',
  'admin/directory': 'Panel zarządzania katalogiem firm.',
  'admin/claims': 'Obsługa zgłoszeń praw własności do firm.',
  'katalog': 'Publiczny spis i wyszukiwarka firm w katalogu.',
  'katalog/[city]/[companySlug]': 'Strona profilowa firmy w konkretnym mieście.',
  'katalog/woj/[voivodeship]/[companySlug]': 'Strona profilowa firmy w konkretnym województwie.',
  '[category]/[city]/[slug]': 'Karta szczegółów konkretnej oferty sprzętu na wynajem (SEO-friendly url).',
};

function scanRoutes() {
  const routes = [];
  
  function traverse(currentDir, routePrefix = '') {
    if (!fs.existsSync(currentDir)) return;
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    // Check if this directory is a route itself
    const hasPage = entries.some(e => e.isFile() && e.name === 'page.js');
    const hasRoute = entries.some(e => e.isFile() && e.name === 'route.js');
    
    if (hasPage || hasRoute) {
      let routePath = routePrefix || '/';
      
      // Clean up route path formatting
      routePath = routePath
        .replace(/\/\(categories\)/g, '')
        .replace(/\/page\.js/g, '')
        .replace(/\/route\.js/g, '');
      
      if (!routePath) routePath = '/';
      
      // Determine route key name
      let routeKey = routePath === '/' ? 'home' : routePath.substring(1);
      
      // Deduplicate group folders representation
      if (routeKey.includes('(categories)')) {
        routeKey = routeKey.replace('(categories)/', '');
      }

      routes.push({
        key: routeKey,
        path: routePath,
        type: hasPage ? 'Page' : 'API Endpoint'
      });
    }

    // Traverse subdirectories
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('_') && entry.name !== 'api' && entry.name !== 'sitemaps' && entry.name !== 'auth') {
        traverse(path.join(currentDir, entry.name), `${routePrefix}/${entry.name}`);
      }
    }
  }

  traverse(APPS_DIR);

  // Format into markdown list
  let md = '### 📌 Zarejestrowane Strony i Endpointy (Generowane automatycznie)\n\n';
  
  // Sort routes logically (home first, then alphabetical)
  routes.sort((a, b) => {
    if (a.path === '/') return -1;
    if (b.path === '/') return 1;
    return a.path.localeCompare(b.path);
  });

  for (const r of routes) {
    const desc = routeDescriptions[r.key] || 'Nowo wykryta dynamiczna trasa w systemie.';
    md += `*   \`${r.key}\` -> \`${r.path}\` - ${desc}\n`;
  }
  
  return md;
}


// --- 2. SCAN COMPONENTS ---
const componentDescriptions = {
  'AddressAutocomplete.js': 'Pole tekstowe z autosugestią adresu oparte na geokodowaniu OpenStreetMap/Nominatim w czasie rzeczywistym.',
  'Breadcrumbs.js': 'Klasyczna ścieżka powrotu wspierająca nawigację SEO dla ofert oraz kategorii.',
  'CTASection.js': 'Sekcja wezwania do działania (Call to Action) zachęcająca wypożyczalnie do rejestracji i dodawania maszyn.',
  'CategoryHubs.js': 'Kafelki na stronie głównej prezentujące główne kategorie sprzętu (roboty ziemne, ogród, narzędzia) wraz z liczbą aktywnych ofert.',
  'ClaimCompanyModal.js': 'Interaktywne okno modalne służące do wysyłania zgłoszeń roszczeń do profili firm z katalogu.',
  'CookieConsent.js': 'Premium baner zgód na pliki cookies zgodny z RODO (GDPR) z pełną konfiguracją śledzenia Google Analytics.',
  'CustomSelect.js': 'Zaawansowany i w pełni stylizowany komponent wyboru (Select Dropdown) obsługujący podkategorie i ikony kategorii.',
  'DocumentCard.js': 'Karta pobierania wzorów umów najmu sprzętu budowlanego.',
  'DynamicPlaceholder.js': 'Dynamiczne grafiki zastępcze generowane z logo lub nazwą firmy dla ofert bez wgranych zdjęć.',
  'FAQSchema.js': 'Wstrzykuje dane FAQ w standardzie JSON-LD bezpośrednio do nagłówków SEO.',
  'Filters.js': 'Belka filtrów szybkiego dostępu (sortowanie, wybór statusu).',
  'FiltersSidebar.js': 'Panel boczny z filtrami na urządzeniach mobilnych i desktopach (cena, odległość, dostępność).',
  'Hero.js': 'Główny nagłówek strony z zaawansowaną wyszukiwarką lokalizacji i kategorii sprzętu budowlanego.',
  'ListingCard.js': 'Premium karta prezentacyjna oferta z animacjami najechania myszką (hover), zdjęciem i ceną.',
  'ListingGrid.js': 'Kontener siatki (Flex/Grid layout) dla kart ogłoszeń.',
  'ListingMap.js': 'Mapa szczegółów oferty zintegrowana z Maplibre GL, wektorowymi kafelkami i fallbackiem do CartoDB.',
  'MapComponent.js': 'Zaawansowana, pełnoekranowa mapa klastrująca lokalizacje wielu maszyn na rynku.',
  'Marketplace.js': 'Główny silnik i interfejs wyszukiwarki ogłoszeń, łączący mapy, filtry i listę wyników.',
  'Navbar.js': 'Pasek nawigacji u góry ekranu z obsługą logowania, rejestracji i stanu sesji użytkownika.',
  'PrivacyModal.js': 'Szczegółowy modal ustawień cookies umożliwiający konfigurację poszczególnych zgód (analityka, marketing).',
  'SeoFAQ.js': 'Sekcja FAQ przydatna do pozycjonowania organicznego na stronach kategorii.',
  'StatsSection.js': 'Statystyki serwisu pokazujące liczbę użytkowników, maszyn i zrealizowanych wypożyczeń.',
  'ToastProvider.js': 'Kontekst obsługi powiadomień toast (react-hot-toast).',
  'TrustBar.js': 'Pasek zaufania z logotypami partnerów oraz opiniami klientów.',
  'dashboard/DashboardSidebar.js': 'Pasek boczny nawigacji panelu użytkownika.',
  'dashboard/AddEquipmentModal.js': 'Formularz dodawania nowego sprzętu do oferty wypożyczalni.',
  'dashboard/EditCompanyModal.js': 'Formularz edycji danych teleadresowych firmy użytkownika.',
  'dashboard/EditEquipmentModal.js': 'Formularz edycji istniejącej oferty sprzętu budowlanego.',
  'directory/CompanyCard.js': 'Bogata karta profilowa firmy w katalogu (adresy oddziałów, mapa, recenzje, formularz roszczenia).',
  'directory/CompanyListCard.js': 'Element listy firm prezentujący podsumowanie profilu w katalogu głównym.',
  'directory/DirectoryBreadcrumbs.js': 'Specjalne ścieżki nawigacji dla katalogu firm.',
};

function scanComponents() {
  const components = [];

  function traverse(currentDir, relativePath = '') {
    if (!fs.existsSync(currentDir)) return;
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const entryRelative = relativePath ? `${relativePath}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        traverse(path.join(currentDir, entry.name), entryRelative);
      } else if (entry.isFile() && /\.(js|jsx|tsx)$/.test(entry.name)) {
        components.push(entryRelative);
      }
    }
  }

  traverse(COMPONENTS_DIR);

  // Format into markdown
  let md = '### 📌 Wykryte Komponenty (Generowane automatycznie)\n\n';
  
  // Sort alphabetically
  components.sort();

  for (const c of components) {
    let desc = componentDescriptions[c];
    
    if (!desc) {
      // Try to read first comment block inside file for dynamic description
      const fileContent = fs.readFileSync(path.join(COMPONENTS_DIR, c), 'utf8');
      const firstLineComment = fileContent.match(/^\/\/s*(.+)$/m);
      const jsDocComment = fileContent.match(/\/\*\*\s*\n\s*\*?\s*(.+?)\n/);
      
      if (firstLineComment) {
        desc = firstLineComment[1].trim();
      } else if (jsDocComment) {
        desc = jsDocComment[1].trim();
      } else {
        desc = 'Reużywalny komponent interfejsu React w systemie.';
      }
    }

    md += `*   **[${c}](file:///e:/sprzety_budowlane/components/${c.replace(/\\/g, '/')})**: ${desc}\n`;
  }

  return md;
}


// --- 3. SCAN MIGRATIONS ---
const migrationDescriptions = {
  'supabase_setup.sql': 'Podstawowy skrypt modyfikujący tabele companies i equipment, włączający RLS oraz polityki edycji dla właścicieli sprzętów.',
  'supabase_category_migration.sql': 'Skrypt mapujący polskie kategorie na angielskie identyfikatory i przypisujący szczegółowe podkategorie (np. earthmoving, garden, access-platforms).',
  'supabase_claims_setup.sql': 'Tworzy tabelę claims (roszczeń) do zarządzania prawami do profili firm oraz przydziela uprawnienia RLS dla admina i użytkowników.',
  'supabase_directory_admin_setup.sql': 'Skrócony instalator uprawnień administracyjnych dla tabel katalogu firm.',
  'supabase_directory_migration.sql': 'Dodaje unikalną kolumnę slug do tabeli katalogu, wdraża procedurę automatycznego generowania slugów w bazie i konfiguruje odczyt publiczny.',
  'supabase_relationship_fixes.sql': 'Rozwiązuje problemy z kluczami obcymi i indeksami wydajnościowymi między tabelami.',
  'supabase_security_fixes.sql': 'Uaktualnia uprawnienia schematu publicznego i naprawia luki w politykach RLS.',
  'supabase_admin_setup.sql': 'Konfiguruje tabelę public.profiles, funkcję pomocniczą is_admin oraz wyzwalacz on_auth_user_created dla automatycznego tworzenia profili.',
};

function scanSQLMigrations() {
  const sqlFiles = [];
  const entries = fs.readdirSync(BASE_DIR, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.sql')) {
      sqlFiles.push(entry.name);
    }
  }

  // Format into markdown
  let md = '### 📌 Wykryte skrypty SQL (Generowane automatycznie)\n\n';
  
  // Sort alphabetically
  sqlFiles.sort();

  for (const f of sqlFiles) {
    let desc = migrationDescriptions[f];
    if (!desc) {
      // Try to read first SQL comment block (starts with --)
      const fileContent = fs.readFileSync(path.join(BASE_DIR, f), 'utf8');
      const firstLineSqlComment = fileContent.match(/^--\s*(.+)$/m);
      desc = firstLineSqlComment ? firstLineSqlComment[1].trim() : 'Skrypt bazy danych SQL Supabase.';
    }

    md += `*   **[${f}](file:///e:/sprzety_budowlane/${f})**: ${desc}\n`;
  }

  return md;
}


// --- 4. DYNAMIC DOCS UPDATE ---

function updateDocFile(fileName, startTag, endTag, newContent) {
  const filePath = path.join(DOCS_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ Warning: Doc file does not exist: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  const escapedStart = startTag.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const escapedEnd = endTag.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`${escapedStart}[\\s\\S]*?${escapedEnd}`, 'g');

  if (regex.test(content)) {
    content = content.replace(regex, `${startTag}\n${newContent}${endTag}`);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated ${fileName} section [${startTag}]`);
  } else {
    console.warn(`⚠️ Warning: Tags [${startTag} ... ${endTag}] not found in ${fileName}`);
  }
}

try {
  // Generate list markdown contents
  const routesMd = scanRoutes();
  const componentsMd = scanComponents();
  const migrationsMd = scanSQLMigrations();

  // Inject content in-place to files
  updateDocFile('architecture.md', '<!-- START_ROUTES_LIST -->', '<!-- END_ROUTES_LIST -->', routesMd);
  updateDocFile('components.md', '<!-- START_COMPONENTS_LIST -->', '<!-- END_COMPONENTS_LIST -->', componentsMd);
  updateDocFile('database.md', '<!-- START_MIGRATIONS_LIST -->', '<!-- END_MIGRATIONS_LIST -->', migrationsMd);

  console.log('🚀 Living Documentation portal update completed successfully!');
} catch (error) {
  console.error('❌ Error during Living Documentation update:', error);
  process.exit(1);
}
