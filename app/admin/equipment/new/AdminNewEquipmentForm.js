'use client'

import { useState } from 'react'
import { adminCreateEquipment } from '../../actions'
import { toast } from 'react-hot-toast'
import { ArrowLeft, Package } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AdminNewEquipmentForm({ companies }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData) {
    if (!formData.get('company_id')) {
      toast.error('Musisz wybrać firmę!')
      return
    }

    setIsLoading(true)
    const result = await adminCreateEquipment(formData)
    
    if (result?.error) {
      toast.error(result.error)
      setIsLoading(false)
    } else {
      toast.success('Ogłoszenie zostało dodane')
      router.push('/admin/equipment')
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/equipment" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Wróć do listy sprzętu
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Nowe Ogłoszenie</h2>
        </div>
        
        <form action={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Przypisz do firmy <span className="text-red-500">*</span></label>
              <select name="company_id" required
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border focus:ring-blue-500 focus:border-blue-500">
                <option value="">Wybierz firmę</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.city})</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nazwa sprzętu <span className="text-red-500">*</span></label>
              <input type="text" name="name" required placeholder="Np. Zagęszczarka 90kg"
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border focus:ring-blue-500 focus:border-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kategoria <span className="text-red-500">*</span></label>
              <select name="category" required
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border focus:ring-blue-500 focus:border-blue-500">
                <option value="tools">Narzędzia i elektronarzędzia</option>
                <option value="construction_equipment">Sprzęt budowlany</option>
                <option value="heavy_equipment">Sprzęt ciężki</option>
                <option value="garden_equipment">Maszyny ogrodowe</option>
                <option value="lifts_and_platforms">Podnośniki i platformy</option>
                <option value="scaffolding">Rusztowania</option>
                <option value="generators_and_power">Agregaty i zasilanie</option>
                <option value="trailers_and_transport">Lawety i transport</option>
                <option value="cleaning_equipment">Myjki i sprzątanie</option>
                <option value="others">Inne</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dostępność</label>
              <select name="availability"
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border focus:ring-blue-500 focus:border-blue-500">
                <option value="immediately">Dostępny od ręki</option>
                <option value="on_call">Na telefon</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cena (PLN) <span className="text-red-500">*</span></label>
              <input type="number" name="price_from" required step="0.01" placeholder="0.00"
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border focus:ring-blue-500 focus:border-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jednostka czasu</label>
              <select name="rental_period"
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border focus:ring-blue-500 focus:border-blue-500">
                <option value="hour">/ godzina</option>
                <option value="day">/ doba</option>
                <option value="week">/ tydzień</option>
                <option value="month">/ miesiąc</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Zdjęcie sprzętu</label>
              <input type="file" name="image" accept="image/*"
                className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Opis</label>
              <textarea name="description" rows={4} placeholder="Opisz parametry sprzętu..."
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border focus:ring-blue-500 focus:border-blue-500" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Link OLX</label>
              <input type="url" name="external_olx_url" placeholder="https://olx.pl/..."
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border focus:ring-blue-500 focus:border-blue-500" />
            </div>

            <div className="sm:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" name="promotion"
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors">Promuj to ogłoszenie</span>
              </label>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 dark:border-slate-700 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? 'Dodawanie...' : 'Dodaj ogłoszenie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
