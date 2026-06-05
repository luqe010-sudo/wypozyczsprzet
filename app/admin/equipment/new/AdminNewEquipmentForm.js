'use client'

import { useState } from 'react'
import { adminCreateEquipment } from '../../actions'
import { toast } from 'react-hot-toast'
import { ArrowLeft, Package } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import CustomSelect from '../../../../components/CustomSelect'

export default function AdminNewEquipmentForm({ companies = [], categories = [], subcategories = [], branches = [] }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  
  const [companyId, setCompanyId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [subcategoryId, setSubcategoryId] = useState('')
  const [branchId, setBranchId] = useState('')
  const [availability, setAvailability] = useState('immediately')
  const [rentalPeriod, setRentalPeriod] = useState('day')

  const handleCompanyChange = (val) => {
    setCompanyId(val)
    // Find branches for selected company and set main branch by default
    const companyBranches = branches.filter(b => b.company_id === val)
    const mainBranch = companyBranches.find(b => b.is_main) || companyBranches[0]
    setBranchId(mainBranch ? mainBranch.id : '')
  }

  const handleCategoryChange = (val) => {
    setCategoryId(val)
    setSubcategoryId('')
  }

  const selectedCategory = categories.find(c => c.id === categoryId)
  const selectedSubcategory = subcategories.find(s => s.id === subcategoryId)
  const categoryDbKey = selectedCategory ? selectedCategory.db_key : ''
  const subcategorySlug = selectedSubcategory ? selectedSubcategory.slug : ''

  const filteredSubcategories = subcategories.filter(s => s.category_id === categoryId)
  const filteredBranches = branches.filter(b => b.company_id === companyId)

  async function handleSubmit(formData) {
    if (!formData.get('company_id')) {
      toast.error('Musisz wybrać firmę!')
      return
    }
    if (!formData.get('branch_id')) {
      toast.error('Musisz wybrać oddział dla wybranej firmy!')
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

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Nowe Ogłoszenie</h2>
        </div>
        
        <form action={handleSubmit} className="p-6 space-y-6">
          {/* Hidden fields for FK and legacy compatibility */}
          <input type="hidden" name="company_id" value={companyId} />
          <input type="hidden" name="category_id" value={categoryId} />
          <input type="hidden" name="category" value={categoryDbKey} />
          <input type="hidden" name="subcategory_id" value={subcategoryId} />
          <input type="hidden" name="subcategory" value={subcategorySlug} />
          <input type="hidden" name="branch_id" value={branchId} />
          <input type="hidden" name="availability" value={availability} />
          <input type="hidden" name="rental_period" value={rentalPeriod} />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Przypisz do firmy <span className="text-red-500">*</span></label>
              <CustomSelect
                options={companies.map(c => ({ value: c.id, label: c.name }))}
                value={companyId}
                onChange={handleCompanyChange}
                placeholder="Wybierz firmę..."
                variant="field"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nazwa sprzętu <span className="text-red-500">*</span></label>
              <input type="text" name="name" required placeholder="Np. Zagęszczarka 90kg"
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border focus:ring-blue-500 focus:border-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategoria <span className="text-red-500">*</span></label>
              <CustomSelect
                options={categories.map(c => ({ value: c.id, label: c.name }))}
                value={categoryId}
                onChange={handleCategoryChange}
                placeholder="Wybierz kategorię..."
                variant="field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Podkategoria</label>
              <CustomSelect
                options={filteredSubcategories.map(s => ({ value: s.id, label: s.name }))}
                value={subcategoryId}
                onChange={setSubcategoryId}
                placeholder="Wybierz typ..."
                variant="field"
                disabled={!categoryId}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Oddział Firmy <span className="text-red-500">*</span></label>
              <CustomSelect
                options={filteredBranches.map(b => ({ 
                  value: b.id, 
                  label: b.name ? `${b.name} (${b.city})` : `${b.city}, ${b.address}` 
                }))}
                value={branchId}
                onChange={setBranchId}
                placeholder={companyId ? "Wybierz oddział..." : "Najpierw wybierz firmę"}
                variant="field"
                disabled={!companyId}
              />
              <p className="mt-1 text-xs text-gray-500 italic">Lokalizacja sprzętu pochodzi z wybranego oddziału firmy.</p>
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
                variant="field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cena (PLN) <span className="text-red-500">*</span></label>
              <input type="number" name="price_from" required step="0.01" placeholder="0.00"
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
                variant="field"
              />
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
