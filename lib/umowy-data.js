export const documentCategories = [
  {
    id: 'heavy',
    name: 'Ciężki sprzęt',
    items: ['koparki', 'minikoparki', 'ładowarki', 'wozidła', 'walce', 'spycharki']
  },
  {
    id: 'construction',
    name: 'Sprzęt budowlany',
    items: ['zagęszczarki', 'betoniarki', 'przecinarki', 'młoty wyburzeniowe', 'niwelatory']
  },
  {
    id: 'lifts',
    name: 'Podnośniki i platformy',
    items: ['podnośniki koszowe', 'zwyżki', 'podesty ruchome']
  },
  {
    id: 'scaffolding',
    name: 'Rusztowania',
    items: ['rusztowania elewacyjne', 'rusztowania warszawskie']
  },
  {
    id: 'tools',
    name: 'Elektronarzędzia i narzędzia',
    items: ['młoty', 'szlifierki', 'wiertnice', 'piły', 'elektronarzędzia']
  },
  {
    id: 'garden',
    name: 'Maszyny ogrodowe',
    items: ['glebogryzarki', 'rębaki', 'wertykulatory', 'kosiarki', 'traktorki ogrodowe']
  },
  {
    id: 'power',
    name: 'Agregaty i zasilanie',
    items: ['agregaty prądotwórcze', 'nagrzewnice', 'kompresory']
  }
];

export const documents = [
  {
    slug: 'wzor-umowy-wynajmu-ciezkiego-sprzetu',
    title: 'Wzór umowy wynajmu ciężkiego sprzętu',
    seoH1: 'Darmowy wzór umowy wynajmu ciężkiego sprzętu PDF',
    category: 'Ciężki sprzęt',
    categoryId: 'heavy',
    pdfUrl: '/umowy/wzor-umowy-wynajmu-ciezkiego-sprzetu.pdf',
    description: 'Kompletna umowa najmu dla maszyn budowlanych o dużej masie. Zawiera klauzule dotyczące transportu niskopodwoziowego oraz odpowiedzialności za uszkodzenia mechaniczne.',
    whenToUse: 'Używaj tej umowy przy wynajmie maszyn takich jak koparki gąsienicowe, ładowarki kołowe czy spycharki. Jest przystosowana zarówno dla firm, jak i osób prywatnych.',
    forWhom: 'Przeznaczona dla wypożyczalni sprzętu budowlanego oraz firm podwykonawczych.',
    equipmentTypes: ['Koparki gąsienicowe i kołowe', 'Ładowarki', 'Spycharki', 'Wozidła technologiczne', 'Walce drogowe'],
    faqs: [
      {
        question: "Czy umowa wynajmu ciężkiego sprzętu musi być zawarta na piśmie?",
        answer: "Zdecydowanie tak. Ze względu na dużą wartość sprzętu oraz potencjalne koszty napraw, forma pisemna jest niezbędna dla celów dowodowych i ubezpieczeniowych."
      },
      {
        question: "Kto odpowiada za serwis maszyny podczas wynajmu?",
        answer: "Standardowo za serwis bieżący odpowiada wynajmujący, chyba że uszkodzenie wynika z niewłaściwego użytkowania przez najemcę. Szczegóły warto doprecyzować w umowie."
      }
    ]
  },
  {
    slug: 'wzor-umowy-wynajmu-sprzetu-budowlanego',
    title: 'Wzór umowy wynajmu sprzętu budowlanego',
    seoH1: 'Darmowy wzór umowy wynajmu sprzętu budowlanego PDF',
    category: 'Sprzęt budowlany',
    categoryId: 'construction',
    pdfUrl: '/umowy/wzor-umowy-wynajmu-sprzetu-budowlanego.pdf',
    description: 'Uniwersalny wzór umowy dla średniego sprzętu budowlanego. Idealny dla zagęszczarek, betoniarek i narzędzi pneumatycznych.',
    whenToUse: 'Przy wynajmie popularnego sprzętu budowlanego używanego na co dzień na budowie.',
    forWhom: 'Dla małych i średnich firm budowlanych oraz osób budujących dom sposobem gospodarczym.',
    equipmentTypes: ['Zagęszczarki', 'Betoniarki', 'Młoty wyburzeniowe', 'Przecinarki do betonu', 'Niwelatory'],
    faqs: [
      {
        question: "Czy osoba prywatna może wynająć sprzęt budowlany?",
        answer: "Tak, większość wypożyczalni udostępnia sprzęt osobom fizycznym na podstawie dowodu osobistego i kaucji zwrotnej."
      },
      {
        question: "Czy warto pobierać kaucję?",
        answer: "Tak, kaucja zabezpiecza interesy wynajmującego w przypadku drobnych uszkodzeń lub braku zwrotu paliwa/czyszczenia sprzętu."
      }
    ]
  },
  {
    slug: 'wzor-umowy-wynajmu-podnosnikow-i-platform',
    title: 'Wzór umowy wynajmu podnośników i platform',
    seoH1: 'Wzór umowy wynajmu podnośników koszowych i platform PDF',
    category: 'Podnośniki i platformy',
    categoryId: 'lifts',
    pdfUrl: '/umowy/wzor-umowy-wynajmu-podnosnikow-i-platform.pdf',
    description: 'Specjalistyczna umowa uwzględniająca wymogi UDT oraz konieczność posiadania uprawnień przez operatora.',
    whenToUse: 'Wynajem zwyżek, podnośników nożycowych i teleskopowych.',
    forWhom: 'Firmy instalacyjne, malarskie oraz wypożyczalnie podestów ruchomych.',
    equipmentTypes: ['Podnośniki koszowe', 'Podnośniki nożycowe', 'Zwyżki teleskopowe', 'Podesty masztowe'],
    faqs: [
      {
        question: "Kto odpowiada za uszkodzenia kosza podnośnika?",
        answer: "Zazwyczaj najemca, chyba że wykupił dodatkowe ubezpieczenie od uszkodzeń (tzw. CDW)."
      },
      {
        question: "Czy można dopisać operatora do umowy?",
        answer: "Tak, umowa może określać, czy sprzęt jest wynajmowany z operatorem wynajmującego, czy obsługiwany przez pracownika najemcy z uprawnieniami UDT."
      }
    ]
  },
  {
    slug: 'wzor-umowy-wynajmu-rusztowan',
    title: 'Wzór umowy wynajmu rusztowań',
    seoH1: 'Wzór umowy wynajmu rusztowań elewacyjnych i warszawskich PDF',
    category: 'Rusztowania',
    categoryId: 'scaffolding',
    pdfUrl: '/umowy/wzor-umowy-wynajmu-rusztowan.pdf',
    description: 'Umowa regulująca wynajem elementów rusztowań, kwestie montażu, demontażu oraz odbioru technicznego.',
    whenToUse: 'Wynajem zestawów rusztowań na elewacje lub rusztowań przejezdnych.',
    forWhom: 'Firmy elewacyjne i wypożyczalnie rusztowań.',
    equipmentTypes: ['Rusztowania ramowe', 'Rusztowania warszawskie', 'Rusztowania modułowe', 'Wieże przejezdne'],
    faqs: [
      {
        question: "Czy wynajmujący musi zamontować rusztowanie?",
        answer: "Niekoniecznie, umowa może przewidywać sam wynajem elementów, ale montaż musi być wykonany przez osoby z uprawnieniami montera rusztowań."
      }
    ]
  },
  {
    slug: 'wzor-umowy-wynajmu-elektronarzedzi',
    title: 'Wzór umowy wynajmu elektronarzędzi',
    seoH1: 'Darmowy wzór umowy wynajmu elektronarzędzi PDF',
    category: 'Elektronarzędzia',
    categoryId: 'tools',
    pdfUrl: '/umowy/wzor-umowy-wynajmu-elektronarzedzi.pdf',
    description: 'Uproszczona umowa dla mniejszego sprzętu. Skupia się na terminowości zwrotu i stanie osprzętu (wiertła, tarcze).',
    whenToUse: 'Wynajem wiertarek, szlifierek, młotowiertarek i pił.',
    forWhom: 'Osoby prywatne wykonujące remonty oraz ekipy wykończeniowe.',
    equipmentTypes: ['Wiertnice', 'Młoty udarowe', 'Szlifierki kątowe', 'Piły do drewna', 'Odkurzacze przemysłowe'],
    faqs: [
      {
        question: "Co w przypadku spalenia silnika w elektronarzędziu?",
        answer: "Jeśli wynika to z naturalnego zużycia szczotek lub wady ukrytej - odpowiada wynajmujący. Jeśli z przeciążenia sprzętu - najemca."
      }
    ]
  },
  {
    slug: 'wzor-umowy-wynajmu-sprzetu-ogrodowego',
    title: 'Wzór umowy wynajmu sprzętu ogrodowego',
    seoH1: 'Wzór umowy wynajmu maszyn ogrodowych PDF',
    category: 'Maszyny ogrodowe',
    categoryId: 'garden',
    pdfUrl: '/umowy/wzor-umowy-wynajmu-sprzetu-ogrodowego.pdf',
    description: 'Umowa dla sprzętu sezonowego. Zawiera zapisy o czystości zwracanego sprzętu i stanie noży tnących.',
    whenToUse: 'Wynajem glebogryzarek, kosiarek i rębaków.',
    forWhom: 'Właściciele ogrodów i firmy pielęgnujące zieleń.',
    equipmentTypes: ['Glebogryzarki', 'Rębaki do gałęzi', 'Wertykulatory', 'Kosiarki spalinowe', 'Traktorki'],
    faqs: [
      {
        question: "Czy muszę oddać sprzęt z pełnym bakiem?",
        answer: "Standardowo tak - zasada 'pełny do pełnego'. Szczegóły powinny być zapisane w umowie."
      }
    ]
  },
  {
    slug: 'wzor-umowy-wynajmu-agregatow-i-zasilania',
    title: 'Wzór umowy wynajmu agregatów i zasilania',
    seoH1: 'Umowa wynajmu agregatu prądotwórczego i nagrzewnic PDF',
    category: 'Agregaty i zasilanie',
    categoryId: 'power',
    pdfUrl: '/umowy/wzor-umowy-wynajmu-agregatow-i-zasilania.pdf',
    description: 'Umowa dla urządzeń zasilających i grzewczych. Uwzględnia limity motogodzin i zasady tankowania.',
    whenToUse: 'Wynajem agregatów prądotwórczych, kompresorów i nagrzewnic.',
    forWhom: 'Organizatorzy imprez, firmy budowlane w miejscach bez przyłączy.',
    equipmentTypes: ['Agregaty prądotwórcze', 'Nagrzewnice olejowe', 'Kompresory śrubowe', 'Maszty oświetleniowe'],
    faqs: [
      {
        question: "Kto odpowiada za paliwo do agregatu?",
        answer: "Najemca ponosi koszty paliwa zużytego podczas pracy urządzenia."
      }
    ]
  },
  {
    slug: 'protokol-zdawczo-odbiorczy-sprzetu',
    title: 'Protokół zdawczo-odbiorczy sprzętu',
    seoH1: 'Darmowy protokół zdawczo-odbiorczy sprzętu budowlanego PDF',
    category: 'Dokumenty uniwersalne',
    categoryId: 'universal',
    pdfUrl: '/umowy/protokol-zdawczo-odbiorczy-sprzetu.pdf',
    description: 'Niezbędny załącznik do każdej umowy. Służy do dokumentowania stanu wizualnego i technicznego maszyny w momencie wydania i zwrotu.',
    whenToUse: 'Zawsze przy wydawaniu i odbieraniu sprzętu od klienta.',
    forWhom: 'Dla każdego wynajmującego i najemcy.',
    equipmentTypes: ['Wszystkie rodzaje maszyn i narzędzi'],
    faqs: [
      {
        question: "Dlaczego protokół jest ważniejszy od samej umowy?",
        answer: "Ponieważ to protokół opisuje stan faktyczny (rysy, wgniecenia, poziom płynów). Bez niego trudno udowodnić, że uszkodzenie powstało w trakcie najmu."
      }
    ]
  },
  {
    slug: 'oswiadczenie-odpowiedzialnosci-za-sprzet',
    title: 'Oświadczenie odpowiedzialności za sprzęt',
    seoH1: 'Oświadczenie o odpowiedzialności materialnej za sprzęt PDF',
    category: 'Dokumenty uniwersalne',
    categoryId: 'universal',
    pdfUrl: '/umowy/oswiadczenie-odpowiedzialnosci-za-sprzet.pdf',
    description: 'Dokument podpisywany przez pracownika lub operatora, który bezpośrednio użytkuje sprzęt.',
    whenToUse: 'Gdy firma wynajmuje sprzęt, a przekazuje go pracownikowi pod opiekę.',
    forWhom: 'Właściciele firm budowlanych.',
    equipmentTypes: ['Elektronarzędzia', 'Klucze do maszyn', 'Laptopy serwisowe'],
    faqs: [
      {
        question: "Czy pracownik może odmówić podpisania oświadczenia?",
        answer: "Może, ale pracodawca ma prawo uzależnić powierzenie mienia od podpisania dokumentu o odpowiedzialności materialnej."
      }
    ]
  }
];

export const commonChecklist = [
  'Dane stron (Wynajmujący i Najemca)',
  'Szczegółowy opis sprzętu (Model, numer seryjny)',
  'Czas trwania wynajmu (Data i godzina)',
  'Cena najmu i sposób płatności',
  'Wysokość kaucji i warunki jej zwrotu',
  'Zakres odpowiedzialności za uszkodzenia',
  'Stan techniczny w chwili wydania',
  'Warunki transportu i zwrotu',
  'Załącznik: Protokół zdawczo-odbiorczy',
  'Czytelne podpisy obu stron'
];
