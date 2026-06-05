'use client'

import { useState } from 'react'
import { adminCreateDirectoryCompany } from '../../actions'
import { toast } from 'react-hot-toast'
import { ArrowLeft, BookOpen, ImageIcon, Upload, Star } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function DirectoryCompanyForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [logoPreview, setLogoPreview] = useState(null)
  const router = useRouter()

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    } else {
      setLogoPreview(null)
    }
  }

  async function handleSubmit(formData) {
    setIsLoading(true)
    const result = await adminCreateDirectoryCompany(formData)
    
    if (result?.error) {
      toast.error(result.error)
      setIsLoading(false)
    } else {
      toast.success('Firma została dodana do katalogu')
      // Redirect to the edit page where the admin can add branches
      router.push(`/admin/directory/${result.id}/edit`)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/directory" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Wróć do listy wizytówek
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Nowa Wizytówka w Katalogu</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Dodaj profil główny firmy. Po zapisaniu dodasz oddziały i dane kontaktowe.</p>
          </div>
        </div>
        
        <form action={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            
            {/* Logo Upload Section */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Logo firmy</label>
              <div className="flex items-center gap-6">
                {logoPreview ? (
                  <img 
                    src={logoPreview} 
                    alt="Podgląd logo" 
                    className="w-20 h-20 rounded-xl object-cover border-2 border-dashed border-gray-300 dark:border-slate-600 bg-white"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-gray-50 dark:bg-slate-900 border-2 border-dashed border-gray-300 dark:border-slate-700 flex items-center justify-center text-gray-400">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
                <label className="cursor-pointer bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Wgraj plik (Cloudinary)
                  <input 
                    type="file" 
                    name="logo" 
                    accept="image/*" 
                    onChange={handleLogoChange}
                    className="hidden" 
                  />
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">Logo zostanie zapisane w folderze &apos;company_logos&apos; w Cloudinary.</p>
            </div>

            {/* Company Name */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nazwa firmy <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="name" 
                required 
                placeholder="Np. PRK Wrocław Sp. z o.o."
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border focus:ring-blue-500 focus:border-blue-500 outline-none" 
              />
              <p className="mt-0.5 text-xs text-gray-400">Przyjazny adres URL (slug) wygeneruje się automatycznie na podstawie nazwy.</p>
            </div>

            {/* Category */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kategoria główna</label>
              <input 
                type="text" 
                name="category" 
                placeholder="Np. Wynajem sprzętu budowlanego, Usługi dźwigowe"
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border focus:ring-blue-500 focus:border-blue-500 outline-none" 
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Opis firmy</label>
              <textarea 
                name="description" 
                rows="4" 
                placeholder="Napisz krótki opis firmy, który wyświetli się na wizytówce..."
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border focus:ring-blue-500 focus:border-blue-500 outline-none" 
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                Ocena początkowa (gwiazdki)
              </label>
              <input 
                type="number" 
                name="rating" 
                step="0.1" 
                min="1.0" 
                max="5.0" 
                placeholder="Np. 4.8"
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border focus:ring-blue-500 focus:border-blue-500 outline-none" 
              />
            </div>

            {/* Review Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Liczba opinii</label>
              <input 
                type="number" 
                name="review_count" 
                min="0" 
                placeholder="Np. 24"
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border focus:ring-blue-500 focus:border-blue-500 outline-none" 
              />
            </div>

          </div>

          <div className="pt-6 border-t border-gray-200 dark:border-slate-700 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? 'Dodawanie...' : 'Dodaj firmę i przejdź do oddziałów'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
