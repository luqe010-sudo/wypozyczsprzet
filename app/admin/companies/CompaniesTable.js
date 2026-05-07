'use client'

import { useState } from 'react'
import { adminDeleteRecord, updateCompanyOwner } from '../actions'
import { toast } from 'react-hot-toast'
import { 
  Search, 
  Trash2, 
  UserCircle, 
  MapPin, 
  Phone, 
  ExternalLink,
  MoreVertical
} from 'lucide-react'

export default function CompaniesTable({ initialCompanies, users }) {
  const [companies, setCompanies] = useState(initialCompanies)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCompanies = companies.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.city?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async (id) => {
    if (confirm('Czy na pewno chcesz usunąć tę firmę? Spowoduje to również usunięcie całego przypisanego sprzętu.')) {
      const result = await adminDeleteRecord('companies', id)
      if (result.success) {
        setCompanies(companies.filter(c => c.id !== id))
        toast.success('Firma usunięta')
      } else {
        toast.error(result.error)
      }
    }
  }

  const handleOwnerChange = async (companyId, newOwnerId) => {
    const result = await updateCompanyOwner(companyId, newOwnerId)
    if (result.success) {
      setCompanies(companies.map(c => 
        c.id === companyId ? { ...c, owner_user_id: newOwnerId } : c
      ))
      toast.success('Właściciel zmieniony')
    } else {
      toast.error(result.error)
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
            placeholder="Szukaj firmy lub miasta..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-gray-500">
          Znaleziono: <strong>{filteredCompanies.length}</strong> firm
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-gray-50 dark:bg-slate-900 text-gray-500 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Firma</th>
                <th className="px-6 py-4 font-semibold">Sprzęt</th>
                <th className="px-6 py-4 font-semibold">Lokalizacja</th>
                <th className="px-6 py-4 font-semibold">Kontakt</th>
                <th className="px-6 py-4 font-semibold">Właściciel</th>
                <th className="px-6 py-4 font-semibold text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {filteredCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 dark:text-white">{company.name}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[200px]">{company.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Link 
                      href={`/admin/equipment?company=${company.id}`}
                      className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg font-medium hover:bg-blue-100 transition-colors whitespace-nowrap"
                    >
                      <Package className="w-3.5 h-3.5" />
                      {company.equipment?.[0]?.count || 0} ogłoszeń
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {company.city}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {company.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      className="text-xs bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded p-1 outline-none"
                      value={company.owner_user_id || ''}
                      onChange={(e) => handleOwnerChange(company.id, e.target.value)}
                    >
                      <option value="">Brak właściciela</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.id.substring(0, 8)}... ({u.role})</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/companies/${company.id}/edit`}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edytuj firmę"
                      >
                        <UserCircle className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(company.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Usuń firmę"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
