'use client'

import { useState } from 'react'
import { updateEquipment, deleteEquipment } from '../../actions'
import { toast } from 'react-hot-toast'
import { Trash2 } from 'lucide-react'
import { FORM_CATEGORIES, SEO_CATEGORIES } from '../../../../../lib/categories'
import CustomSelect from '../../../../../components/CustomSelect'

export default function EditEquipmentForm({ equipment }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Robust category initialization: find the DB key ('earthmoving') even if the input is a label ('Roboty ziemne')
  const initialCategoryValue = (() => {
    const raw = equipment.category || equipment.Kategoria || '';
    const found = FORM_CATEGORIES.find(c => c.value === raw || c.label === raw);
    return found ? found.value : 'tools'; // fallback to tools
  })();

  const [category, setCategory] = useState(initialCategoryValue)
  const [availability, setAvailability] = useState(equipment.availability || equipment.Dostępność)
  const [rentalPeriod, setRentalPeriod] = useState(equipment.rental_period || equipment.Czas)
  const [subcategory, setSubcategory] = useState(equipment.subcategory || '')

  async function handleSubmit(formData) {
    setIsLoading(true)
    const result = await updateEquipment(equipment.id, equipment.company_id, formData)
    
    if (result?.error) {
      toast.error(result.error)
      setIsLoading(false)
    } else {
      toast.success('Dane sprzętu zaktualizowane')
    }
  }

  async function handleDelete() {
    if (confirm('Czy na pewno chcesz usunąć ten sprzęt?')) {
      setIsDeleting(true)
      const result = await deleteEquipment(equipment.id, equipment.company_id)
      if (result?.error) {
        toast.error(result.error)
        setIsDeleting(false)
      }
    }
  }

  return (
    <div>
      <form action={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-6">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nazwa Sprzętu <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <input type="text" name="name" id="name" required defaultValue={equipment.name || equipment.Sprzęt}
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
            <input type="number" name="price_from" id="price_from" required min="0" step="0.01" defaultValue={equipment.price_from || equipment.Cena_od}
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
              <input type="url" name="external_olx_url" id="external_olx_url" defaultValue={equipment.external_olx_url} placeholder="https://olx.pl/..."
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border" />
            </div>
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Zdjęcie sprzętu
            </label>
            <div className="mt-1 space-y-3">
              {equipment.image_url && (
                <div className="flex items-center space-x-3">
                  <img src={equipment.image_url} alt="Podgląd" className="h-20 w-20 object-cover rounded-md border dark:border-slate-600" />
                  <span className="text-xs text-gray-500">Obecne zdjęcie</span>
                </div>
              )}
              <input type="hidden" name="current_image_url" defaultValue={equipment.image_url} />
              <input type="file" name="image" id="image" accept="image/*"
                className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-700 dark:file:text-gray-200" />
              <p className="text-xs text-gray-500">Zostaw puste, aby zachować obecne zdjęcie.</p>
            </div>
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Opis (Opcjonalnie)
            </label>
            <div className="mt-1">
              <textarea name="description" id="description" rows={4} defaultValue={equipment.description || equipment.Opis}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border" />
            </div>
          </div>

          <div className="sm:col-span-6">
            <div className="relative flex items-start">
              <div className="flex items-center h-5">
                <input id="promotion" name="promotion" type="checkbox" defaultChecked={equipment.promotion}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="promotion" className="font-medium text-gray-700 dark:text-gray-300">Chcę promować to ogłoszenie</label>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-5 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting || isLoading}
            className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Usuń sprzęt
          </button>
          <button
            type="submit"
            disabled={isLoading || isDeleting}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Zapisywanie...' : 'Zapisz zmiany'}
          </button>
        </div>
      </form>
    </div>
  )
}
