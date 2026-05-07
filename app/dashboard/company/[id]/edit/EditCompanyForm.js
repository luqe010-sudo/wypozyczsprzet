'use client'

import { useState } from 'react'
import { updateCompany, deleteCompany } from '../../actions'
import { toast } from 'react-hot-toast'
import { Trash2 } from 'lucide-react'
import AddressAutocomplete from '@/components/AddressAutocomplete'

export default function EditCompanyForm({ company }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [city, setCity] = useState(company.city || company.miasto || '')
  const [postalCode, setPostalCode] = useState(company.zip_code || company.postal_code || '')
  const [address, setAddress] = useState(company.address || '')

  async function handleSubmit(formData) {
    setIsLoading(true)
    const result = await updateCompany(company.id, formData)
    
    if (result?.error) {
      toast.error(result.error)
      setIsLoading(false)
    } else {
      toast.success('Dane firmy zaktualizowane')
    }
  }

  const handleAddressSelect = (data) => {
    setCity(data.city);
    setPostalCode(data.postalCode);
    setAddress(data.street || data.fullAddress.split(',')[0]);
  };

  async function handleDelete() {
    if (confirm('Czy na pewno chcesz usunąć tę firmę? Spowoduje to usunięcie również całego przypisanego sprzętu.')) {
      setIsDeleting(true)
      const result = await deleteCompany(company.id)
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
          {/* Autocomplete helper */}
          <div className="sm:col-span-6 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/20">
            <label className="block text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">
              Wyszukaj nowy adres (ułatwienie)
            </label>
            <AddressAutocomplete onSelect={handleAddressSelect} defaultValue={company.address ? `${company.address}, ${company.city}` : ''} />
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nazwa firmy <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <input type="text" name="company_name" id="company_name" required defaultValue={company.name || company.nazwa}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border" />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Telefon <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <input type="text" name="phone" id="phone" required defaultValue={company.phone}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border" />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email firmowy
            </label>
            <div className="mt-1">
              <input type="email" name="email" id="email" defaultValue={company.email}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border" />
            </div>
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Strona WWW
            </label>
            <div className="mt-1">
              <input type="url" name="website" id="website" defaultValue={company.website} placeholder="https://"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border" />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Kod pocztowy <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <input type="text" name="postal_code" id="postal_code" required
                value={postalCode} onChange={(e) => setPostalCode(e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border" />
            </div>
          </div>

          <div className="sm:col-span-4">
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Miejscowość <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <input type="text" name="city" id="city" required
                value={city} onChange={(e) => setCity(e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border" />
            </div>
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Adres (Ulica i numer)
            </label>
            <div className="mt-1">
              <input type="text" name="address" id="address"
                value={address} onChange={(e) => setAddress(e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border" />
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
            Usuń firmę
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
