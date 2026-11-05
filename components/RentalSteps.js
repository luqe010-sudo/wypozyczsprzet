import { Check, PhoneCall, Search } from 'lucide-react';

const steps = [
  { icon: Search, title: 'Znajdź sprzęt', text: 'Wpisz nazwę sprzętu, wybierz miejscowość i porównaj oferty na liście lub mapie.' },
  { icon: PhoneCall, title: 'Skontaktuj się', text: 'Zadzwoń do wynajmującego lub wyślij mu zapytanie z wybranym terminem.' },
  { icon: Check, title: 'Wynajmij sprzęt', text: 'Ustal cenę, kaucję i sposób odbioru bezpośrednio z wynajmującym.' },
];

export default function RentalSteps() {
  return (
    <ol className="grid gap-3 md:grid-cols-3">
      {steps.map(({ icon: Icon, title, text }, index) => (
        <li key={title} className="listing-panel flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-amber-100 text-market-navy dark:bg-amber-400/15 dark:text-market-yellow">
            <Icon size={20} aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold text-muted">Krok {index + 1}</p>
            <h3 className="mt-1 font-bold text-foreground">{title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
