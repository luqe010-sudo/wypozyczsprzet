import Link from 'next/link'
import { BarChart3, ExternalLink, Eye, Globe, Inbox, PhoneCall } from 'lucide-react'

const allMetrics = [
  { key: 'inquiries', label: 'Zapytania', icon: Inbox },
  { key: 'views_count', label: 'Wyświetlenia', icon: Eye },
  { key: 'phone_clicks', label: 'Kliknięcia telefonu', icon: PhoneCall },
  { key: 'website_clicks', label: 'Kliknięcia WWW', icon: Globe },
  { key: 'olx_clicks', label: 'Kliknięcia OLX', icon: ExternalLink, optional: true },
]

const sum = (stats, key) => stats.reduce((total, item) => total + Number(item[key] || 0), 0)

export default function StatsDashboard({ stats }) {
  if (!stats.length) {
    return (
      <div className="listing-panel text-center">
        <BarChart3 size={32} className="mx-auto text-muted" aria-hidden="true" />
        <h2 className="mt-2 font-bold">Firma nie ma jeszcze ogłoszeń</h2>
        <p className="mt-1 text-sm text-muted">Statystyki pojawią się po opublikowaniu sprzętu.</p>
      </div>
    )
  }

  // OLX links are optional, so the column only appears when someone used one.
  const metrics = allMetrics.filter((metric) => !metric.optional || sum(stats, metric.key) > 0)
  const sortedStats = [...stats].sort((a, b) => (b.inquiries - a.inquiries) || (b.views_count - a.views_count))

  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        {metrics.map(({ key, label, icon: Icon }) => (
          <div className="listing-panel" key={key}>
            <Icon size={19} className="mb-2 text-brand-600 dark:text-market-yellow" aria-hidden="true" />
            <dt className="text-xs font-semibold text-muted">{label}</dt>
            <dd className="text-2xl font-extrabold tabular-nums">{sum(stats, key)}</dd>
          </div>
        ))}
      </dl>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <caption className="px-4 py-3 text-left text-base font-bold">Poszczególne ogłoszenia</caption>
          <thead className="bg-background text-muted">
            <tr>
              <th scope="col" className="px-4 py-3">Sprzęt</th>
              {metrics.map(({ key, label }) => <th scope="col" key={key} className="px-3 py-3 text-right">{label}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedStats.map((item) => (
              <tr key={item.equipment_id}>
                <th scope="row" className="min-w-40 px-4 py-3 font-semibold">
                  <Link href={`/dashboard/equipment/${item.equipment_id}/edit`} className="hover:underline">{item.equipment_name}</Link>
                  {item.status !== 'active' && item.status !== 'incomplete' && <span className="ml-2 text-xs font-normal text-muted">(niewidoczne)</span>}
                </th>
                {metrics.map(({ key }) => <td key={key} className="px-3 py-3 text-right tabular-nums">{item[key]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
