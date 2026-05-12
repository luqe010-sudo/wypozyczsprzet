'use client'

import { useState } from 'react'
import { adminUpdateEquipment } from '../../../actions'
import { toast } from 'react-hot-toast'
import { ArrowLeft, Package } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FORM_CATEGORIES, SEO_CATEGORIES } from '../../../../../lib/categories'
import CustomSelect from '../../../../../components/CustomSelect'

export default function AdminEditEquipmentForm({ equipment }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  
  const [category, setCategory] = useState(equipment.category)
  const [subcategory, setSubcategory] = useState(equipment.subcategory || '')
  const [availability, setAvailability] = useState(equipment.availability)
  const [rentalPeriod, setRentalPeriod] = useState(equipment.rental_period)

  async function handleSubmit(formData) {
    setIsLoading(true)
    const result = await adminUpdateEquipment(equipment.id, formData)
    
    if (result?.error) {
      toast.error(result.error)
      setIsLoading(false)
    } else {
      toast.success('Ogłoszenie zaktualizowane')
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
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white font-serif">Edytuj Ogłoszenie (Tryb Admin)</h2>
        </div>
        
        <form action={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nazwa sprzętu</label>
              <input type="text" name="name" required defaultValue={equipment.name}
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border focus:ring-blue-500 focus:border-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategoria</label>
              <CustomSelect
                options={FORM_CATEGORIES}
                value={category}
                onChange={(val) => {
                  setCategory(val);
                  setSubcategory('');
                }}
                placeholder="Wybierz kategorię..."
                showSearch={false}
              />
              <input type="hidden" name="category" value={category} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Podkategoria</label>
              <CustomSelect
                options={(() => {
                  const fc = FORM_CATEGORIES.find(c => c.value === category);
                  const seoSlug = fc?.seoSlug;
                  return seoSlug && SEO_CATEGORIES[seoSlug] ? SEO_CATEGORIES[seoSlug].filters : [];
                })()}
                value={subcategory}
                onChange={setSubcategory}
                placeholder="Wybierz typ..."
                showSearch={false}
              />
              <input type="hidden" name="subcategory" value={subcategory} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dostępność</label>
              <CustomSelect
                options={[
                  { value: 'immediately', label: 'Dostępny od ręki' },
                  { value: 'on_call', label: 'Na telefon' }
                ]}
                value={availability}
                onChange={setAvailability}
                showSearch={false}
              />
              <input type="hidden" name="availability" value={availability} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cena (PLN)</label>
              <input type="number" name="price_from" required step="0.01" defaultValue={equipment.price_from}
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border focus:ring-blue-500 focus:border-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jednostka czasu</label>
              <CustomSelect
                options={[
                  { value: 'hour', label: '/ godzina' },
                  { value: 'day', label: '/ doba' },
                  { value: 'week', label: '/ tydzień' },
                  { value: 'month', label: '/ miesiąc' }
                ]}
                value={rentalPeriod}
                onChange={setRentalPeriod}
                showSearch={false}
              />
              <input type="hidden" name="rental_period" value={rentalPeriod} />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Zdjęcie sprzętu</label>
              <div className="mt-2 space-y-4">
                {equipment.image_url && (
                  <div className="flex items-center gap-4">
                    <img src={equipment.image_url} alt="Podgląd" className="h-24 w-24 object-cover rounded-lg border dark:border-slate-600" />
                    <span className="text-xs text-gray-500 italic">Obecnie wyświetlane zdjęcie</span>
                  </div>
                )}
                <input type="hidden" name="current_image_url" defaultValue={equipment.image_url} />
                <input type="file" name="image" accept="image/*"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Opis</label>
              <textarea name="description" rows={4} defaultValue={equipment.description}
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border focus:ring-blue-500 focus:border-blue-500" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Link OLX</label>
              <input type="url" name="external_olx_url" defaultValue={equipment.external_olx_url}
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border focus:ring-blue-500 focus:border-blue-500" />
            </div>

            <div className="sm:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" name="promotion" defaultChecked={equipment.promotion}
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
              {isLoading ? 'Zapisywanie...' : 'Zaktualizuj ogłoszenie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
