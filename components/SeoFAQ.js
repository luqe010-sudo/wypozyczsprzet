import React from 'react';

const faqData = [
  {
    question: "Ile kosztuje wynajem koparki we Wrocławiu?",
    answer: "Cena wynajmu koparki we Wrocławiu zaczyna się od około 250-450 PLN za dobę w przypadku minikoparek bez operatora. Jeśli interesuje Cię wynajem koparki z operatorem we Wrocławiu, stawki godzinowe zazwyczaj wahają się od 120 do 180 PLN za godzinę pracy."
  },
  {
    question: "Czy oferujecie wynajem minikoparki z operatorem w Legnicy i Lubinie?",
    answer: "Tak, na naszej platformie znajdziesz liczne oferty na wynajem minikoparki z operatorem w Legnicy, Lubinie oraz Wałbrzychu. Usługi koparką z operatorem to doskonałe rozwiązanie dla osób, które nie posiadają uprawnień, a chcą szybko i precyzyjnie wykonać prace ziemne."
  },
  {
    question: "Jaki jest koszt wynajmu koparki za godzinę na Dolnym Śląsku?",
    answer: "Koszt wynajmu koparki za godzinę zależy od wielkości maszyny i lokalizacji. We Wrocławiu, Świdnicy czy Jeleniej Górze ceny usług koparką zaczynają się od 100 PLN/h za najmniejsze maszyny, sięgając do 250 PLN/h za ciężki sprzęt budowlany z operatorem."
  },
  {
    question: "Gdzie szukać najtańszej minikoparki w Wałbrzychu i okolicach?",
    answer: "Najlepszym sposobem na znalezienie atrakcyjnej ceny za dzień wynajmu minikoparki w Wałbrzychu jest porównanie ofert bezpośrednio na WypożyczSprzęt. Dzięki brakowi pośredników, ceny wynajmu są często niższe niż w dużych wypożyczalniach sieciowych."
  }
];

export default function SeoFAQ() {
  return (
    <section className="py-12 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm my-12 px-6 md:px-10 transition-colors">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-8 text-center">
          Wynajem koparki i minikoparki - FAQ i Ceny
        </h2>
        <div className="space-y-6">
          {faqData.map((item, index) => (
            <div key={index} className="border-b border-gray-100 dark:border-slate-700 pb-6 last:border-0">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-start gap-3">
                <span className="text-blue-600 dark:text-blue-400">Q:</span>
                {item.question}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed ml-8 text-sm md:text-base">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30 text-center">
          <p className="text-blue-900 dark:text-blue-300 font-medium text-sm md:text-base">
            Szukasz usług ziemnych koparką we Wrocławiu lub innym mieście na Dolnym Śląsku? 
            <br />
            <span className="font-bold">Przejrzyj nasze ogłoszenia i znajdź operatora koparki z najlepszymi opiniami.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
