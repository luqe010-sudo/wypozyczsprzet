import Link from 'next/link';
import { formatDate, formatMoney, offersLabel } from '../../lib/format';

const priceCell = (row) => {
  if (row.min == null) return 'na zapytanie';
  return row.min === row.max ? formatMoney(row.min) : `${formatMoney(row.min)} – ${formatMoney(row.max)}`;
};

/** Price table and FAQ built from the listings on a landing page (see lib/hubContent.js). */
export default function HubSummary({ content, rowsHeading = 'Typ sprzętu' }) {
  const { heading, rows, faqs, updated, stats } = content;
  const showTable = rows.length > 1 || stats.priced > 0;

  return (
    <section className="mt-10 grid gap-8 lg:grid-cols-2" aria-labelledby="hub-summary-heading">
      {showTable && (
        <div>
          <h2 id="hub-summary-heading" className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">
            {heading}: ceny wynajmu
          </h2>
          <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
            Stawki za dobę z aktualnych ogłoszeń ({stats.priced} z {offersLabel(stats.total)} podaje cenę)
            {updated ? `, stan na ${formatDate(updated)}` : ''}.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-semibold">{rowsHeading}</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-semibold">Oferty</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-semibold">Cena za dobę</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {rows.map((row) => (
                  <tr key={row.label} className="text-slate-800 dark:text-slate-200">
                    <th scope="row" className="px-4 py-2.5 font-medium first-letter:uppercase">
                      {row.href ? <Link href={row.href} className="hover:underline">{row.label}</Link> : row.label}
                    </th>
                    <td className="px-4 py-2.5 text-right tabular-nums">{row.count}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right tabular-nums">{priceCell(row)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {faqs.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">Najczęstsze pytania</h2>
          <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 dark:divide-slate-700 dark:border-slate-700">
            {faqs.map((faq) => (
              <details key={faq.question} className="group px-4 py-3">
                <summary className="flex min-h-[32px] cursor-pointer list-none items-center justify-between gap-3 font-medium text-slate-900 dark:text-white">
                  {faq.question}
                  <span aria-hidden="true" className="text-slate-500 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{faq.answer}</p>
              </details>
            ))}
          </div>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            Przed wynajmem przyda się <Link href="/umowy" className="font-medium text-brand-600 hover:underline dark:text-brand-400">darmowy wzór umowy wynajmu</Link>.
          </p>
        </div>
      )}
    </section>
  );
}
