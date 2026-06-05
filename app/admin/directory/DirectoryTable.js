'use client'

import { useState } from 'react'
import { adminDeleteDirectoryCompany } from '../actions'
import { toast } from 'react-hot-toast'
import { 
  Search, 
  Trash2, 
  Edit3,
  MapPin, 
  Star,
  Image as ImageIcon,
  Building
} from 'lucide-react'
import Link from 'next/link'

export default function DirectoryTable({ initialCompanies }) {
  const [companies, setCompanies] = useState(initialCompanies)
  const [searchTerm, setSearchTerm] = useState('')

  // Search by company name, category, or branch cities/voivodeships
  const filteredCompanies = companies.filter(c => {
    const term = searchTerm.toLowerCase()
    const nameMatch = c.name?.toLowerCase().includes(term)
    const categoryMatch = c.category?.toLowerCase().includes(term)
    const branchMatch = c.branches?.some(b => 
      b.city?.toLowerCase().includes(term) || 
      b.voivodeship?.toLowerCase().includes(term)
    )
    return nameMatch || categoryMatch || branchMatch
  })

  const handleDelete = async (id) => {
    if (confirm('Czy na pewno chcesz usunąć tę firmę z katalogu? Spowoduje to również bezpowrotne usunięcie wszystkich jej oddziałów.')) {
      const result = await adminDeleteDirectoryCompany(id)
      if (result.success) {
        setCompanies(companies.filter(c => c.id !== id))
        toast.success('Firma usunięta z katalogu')
      } else {
        toast.error(result.error || 'Wystąpił błąd podczas usuwania')
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Szukaj po nazwie, kategorii, mieście..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-gray-500">
          Znaleziono: <strong>{filteredCompanies.length}</strong> firm w katalogu
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-gray-50 dark:bg-slate-900 text-gray-500 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Logo & Nazwa</th>
                <th className="px-6 py-4 font-semibold">Kategoria</th>
                <th className="px-6 py-4 font-semibold">Ocena</th>
                <th className="px-6 py-4 font-semibold">Powiązanie</th>
                <th className="px-6 py-4 font-semibold">Oddziały</th>
                <th className="px-6 py-4 font-semibold">Główne lokalizacje</th>
                <th className="px-6 py-4 font-semibold text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {filteredCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {company.logo_url ? (
                        <img 
                          src={company.logo_url} 
                          alt={company.name} 
                          className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-slate-700 bg-white"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-900 flex items-center justify-center text-gray-400 border border-gray-200 dark:border-slate-700">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white hover:text-blue-600 transition-colors">
                          <Link href={`/katalog/${company.branches?.[0]?.city ? company.branches[0].city.toLowerCase().replace(/ł/g,'l').replace(/ą/g,'a').replace(/ć/g,'c').replace(/ę/g,'e').replace(/ń/g,'n').replace(/ó/g,'o').replace(/ś/g,'s').replace(/ź/g,'z').replace(/ż/g,'z') : 'polska'}/${company.slug}`} target="_blank" className="flex items-center gap-1">
                            {company.name}
                          </Link>
                        </div>
                        <div className="text-xs text-gray-400 font-mono select-all">{company.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-slate-900 text-gray-700 dark:text-gray-300">
                      {company.category || 'Brak kategorii'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {company.rating ? (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="font-semibold text-gray-900 dark:text-white">{company.rating}</span>
                        <span className="text-gray-400">({company.review_count || 0})</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">Brak ocen</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {company.companies ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800/50">
                        {company.companies.name}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Brak powiązania</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg font-medium">
                      <Building className="w-3.5 h-3.5" />
                      {company.branches?.length || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                    {company.branches && company.branches.length > 0 ? (
                      <div className="flex flex-wrap gap-1 max-w-[250px]">
                        {company.branches.slice(0, 3).map((b, idx) => (
                          <span key={b.id || idx} className="text-xs flex items-center gap-0.5 text-gray-600 dark:text-gray-400">
                            <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                            {b.city}
                            {idx < Math.min(company.branches.length, 3) - 1 ? ',' : ''}
                          </span>
                        ))}
                        {company.branches.length > 3 && (
                          <span className="text-xs text-gray-400">+{company.branches.length - 3} więcej</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-red-500">Brak oddziałów</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/directory/${company.id}/edit`}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edytuj wizytówkę"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(company.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Usuń wizytówkę"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCompanies.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                    Brak wyników spełniających kryteria wyszukiwania.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
