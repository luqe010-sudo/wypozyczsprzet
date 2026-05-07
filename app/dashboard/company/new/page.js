'use client'

import { useState } from 'react'
import { createCompany } from '../actions'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { ArrowLeft, Building2 } from 'lucide-react'

export default function NewCompanyPage() {
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData) {
    setIsLoading(true)
    const result = await createCompany(formData)
    
    if (result?.error) {
      toast.error(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center">
        <Link href="/dashboard" className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Wróć do panelu
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-5">
            <Building2 className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="text-lg leading-6 font-bold text-gray-900 dark:text-white">
              Dodaj nową firmę
            </h3>
          </div>
          
          <form action={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nazwa firmy <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input type="text" name="company_name" id="company_name" required
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border" />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Telefon <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input type="text" name="phone" id="phone" required
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border" />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email firmowy
                </label>
                <div className="mt-1">
                  <input type="email" name="email" id="email"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border" />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Strona WWW
                </label>
                <div className="mt-1">
                  <input type="url" name="website" id="website" placeholder="https://"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border" />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Kod pocztowy <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input type="text" name="postal_code" id="postal_code" required
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border" />
                </div>
              </div>

              <div className="sm:col-span-4">
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Miejscowość <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input type="text" name="city" id="city" required
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border" />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Adres (Ulica i numer)
                </label>
                <div className="mt-1">
                  <input type="text" name="address" id="address"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border" />
                </div>
              </div>
            </div>

            <div className="pt-5 flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Zapisywanie...' : 'Utwórz firmę'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
