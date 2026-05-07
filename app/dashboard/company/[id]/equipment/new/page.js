'use client'

import { useState } from 'react'
import { createEquipment } from '../../../../equipment/actions'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { ArrowLeft, PackagePlus } from 'lucide-react'

export default function NewEquipmentPage({ params }) {
  const [isLoading, setIsLoading] = useState(false)
  const companyId = params.id

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

      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden transition-colors">
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
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Kategoria <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <select name="category" id="category" required
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border">
                    <option value="tools">Narzędzia i elektronarzędzia</option>
                    <option value="construction_equipment">Zagęszczarki i sprzęt budowlany</option>
                    <option value="heavy_equipment">Koparki i sprzęt ciężki</option>
                    <option value="garden_equipment">Maszyny ogrodowe</option>
                    <option value="lifts_and_platforms">Podnośniki i platformy</option>
                    <option value="scaffolding">Rusztowania</option>
                    <option value="generators_and_power">Agregaty i zasilanie</option>
                    <option value="trailers_and_transport">Lawety i transport</option>
                    <option value="cleaning_equipment">Myjki i sprzęt sprzątający</option>
                    <option value="others">Inne</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="availability" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Dostępność
                </label>
                <div className="mt-1">
                  <select name="availability" id="availability"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border">
                    <option value="immediately">Dostępny od ręki</option>
                    <option value="on_call">Na telefon</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="price_from" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cena (PLN) <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input type="number" name="price_from" id="price_from" required min="0" step="0.01"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border" />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="rental_period" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Jednostka czasu
                </label>
                <div className="mt-1">
                  <select name="rental_period" id="rental_period"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border">
                    <option value="hour">/ godzina</option>
                    <option value="day">/ doba</option>
                    <option value="week">/ tydzień</option>
                    <option value="month">/ miesiąc</option>
                  </select>
                </div>
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
                <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Link do zdjęcia sprzętu (URL)
                </label>
                <div className="mt-1">
                  <input type="url" name="image_url" id="image_url" placeholder="https://example.com/image.jpg"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border" />
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
