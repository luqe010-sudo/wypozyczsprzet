'use client'

import { useState } from 'react'
import { adminDeleteRecord, updateEquipmentStatus } from '../actions'
import { toast } from 'react-hot-toast'
import { useSearchParams } from 'next/navigation'
import { 
  Search, 
  Trash2, 
  Filter, 
  Eye, 
  EyeOff, 
  Star,
  Package,
  Building,
  Edit2
} from 'lucide-react'
import Link from 'next/link'

export default function EquipmentTable({ initialEquipment }) {
  const [equipment, setEquipment] = useState(initialEquipment)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const searchParams = useSearchParams()
  const companyFilter = searchParams.get('company')

  const categories = [...new Set(equipment.map(e => e.category))].filter(Boolean)

  const filteredEquipment = equipment.filter(e => {
    const matchesSearch = e.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || e.category === filterCategory
    const matchesCompany = !companyFilter || e.company_id === companyFilter
    return matchesSearch && matchesCategory && matchesCompany
  })

  const handleDelete = async (id) => {
    if (confirm('Czy na pewno chcesz usunąć ten sprzęt?')) {
      const result = await adminDeleteRecord('equipment', id)
      if (result.success) {
        setEquipment(equipment.filter(e => e.id !== id))
        toast.success('Sprzęt usunięty')
      } else {
        toast.error(result.error)
      }
    }
  }

  const handleStatusChange = async (id, status) => {
    const result = await updateEquipmentStatus(id, status)
    if (result.success) {
      setEquipment(equipment.map(e => 
        e.id === id ? { ...e, status } : e
      ))
      toast.success(`Status zmieniony na ${status}`)
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Szukaj sprzętu..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            className="text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-2 outline-none"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">Wszystkie kategorie</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div className="text-sm text-gray-500 whitespace-nowrap">
            Wyników: <strong>{filteredEquipment.length}</strong>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEquipment.map((item) => (
          <div key={item.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
            {/* Image placeholder or real image */}
            <div className="h-40 bg-gray-100 dark:bg-slate-900 relative">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Package className="w-12 h-12" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1">
                {item.promotion && (
                  <span className="bg-yellow-400 text-yellow-900 p-1.5 rounded-lg shadow-lg" title="Promowane">
                    <Star className="w-4 h-4 fill-current" />
                  </span>
                )}
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase shadow-lg ${item.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                  {item.status}
                </span>
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col gap-3">
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white line-clamp-1">{item.name}</h4>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                  <Building className="w-3 h-3" />
                  <span className="truncate">{item.companies?.name || 'Nieznana firma'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-slate-700">
                <div className="text-sm font-bold text-blue-600">
                  {item.price_from} PLN <span className="text-[10px] font-normal text-gray-500">/ {item.rental_period}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Link
                    href={`/admin/equipment/${item.id}/edit`}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edytuj"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleStatusChange(item.id, item.status === 'active' ? 'hidden' : 'active')}
                    className={`p-2 rounded-lg transition-colors ${item.status === 'active' ? 'text-gray-400 hover:bg-gray-100' : 'text-blue-600 bg-blue-50'}`}
                    title={item.status === 'active' ? 'Ukryj' : 'Pokaż'}
                  >
                    {item.status === 'active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Usuń"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
