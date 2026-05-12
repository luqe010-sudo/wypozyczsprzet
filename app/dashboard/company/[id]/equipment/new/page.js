'use client'

import { useState } from 'react'
import { createEquipment } from '../../../../equipment/actions'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { ArrowLeft, PackagePlus } from 'lucide-react'
import { FORM_CATEGORIES, SEO_CATEGORIES } from '../../../../../lib/categories'
import CustomSelect from '../../../../../components/CustomSelect'

export default function NewEquipmentPage({ params }) {
  const [isLoading, setIsLoading] = useState(false)
  const companyId = params.id
  
  const [category, setCategory] = useState('earthmoving')
  const [subcategory, setSubcategory] = useState('')
  const [availability, setAvailability] = useState('immediately')
  const [rentalPeriod, setRentalPeriod] = useState('day')

  async function handleSubmit(formData) {
    setIsLoading(true)
    const result = await createEquipment(companyId, formData)
    
    if (result?.error) {
      toast.error(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center">
        <Link href={`/dashboard/company/${companyId}`} className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Wróć do firmy
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-gray-200 dark:border-slate-700 transition-colors">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-5">
            <PackagePlus className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="text-lg leading-6 font-bold text-gray-900 dark:text-white">
              Dodaj nowy sprzęt
            </h3>
          </div>
          
          <form action={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nazwa Sprzętu <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input type="text" name="name" id="name" required placeholder="np. Minikoparka Kubota U17-3a"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border" />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kategoria <span className="text-red-500">*</span>
                </label>
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

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Podkategoria
                </label>
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

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Dostępność
                </label>
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

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cena (PLN) <span className="text-red-500">*</span>
                </label>
                <input type="number" name="price_from" id="price_from" required min="0" step="0.01"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border" />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Jednostka czasu
                </label>
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

              <div className="sm:col-span-6">
                <label htmlFor="external_olx_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Link do OLX (Opcjonalnie)
                </label>
                <div className="mt-1">
                  <input type="url" name="external_olx_url" id="external_olx_url" placeholder="https://olx.pl/..."
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border" />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Zdjęcie sprzętu
                </label>
                <div className="mt-1">
                  <input type="file" name="image" id="image" accept="image/*"
                    className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-700 dark:file:text-gray-200" />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Opis (Opcjonalnie)
                </label>
                <div className="mt-1">
                  <textarea name="description" id="description" rows={4}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border" />
                </div>
              </div>

              <div className="sm:col-span-6 space-y-4">
                <div className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input id="promotion" name="promotion" type="checkbox"
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="promotion" className="font-medium text-gray-700 dark:text-gray-300">Chcę promować to ogłoszenie w przyszłości</label>
                    <p className="text-gray-500 dark:text-gray-400">Zaznacz, jeśli jesteś zainteresowany płatnym wyróżnieniem swojego sprzętu.</p>
                  </div>
                </div>

                <div className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input id="terms" name="terms" type="checkbox" required
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="terms" className="font-medium text-gray-700 dark:text-gray-300">
                      Akceptuję <Link href="/regulamin" className="text-blue-600 hover:underline">Regulamin</Link> oraz politykę RODO <span className="text-red-500">*</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-5 flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Dodawanie...' : 'Dodaj sprzęt'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
