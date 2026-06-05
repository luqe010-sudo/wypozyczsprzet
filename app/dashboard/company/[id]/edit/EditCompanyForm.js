'use client'

import { useState } from 'react'
import { updateCompany, deleteCompany, createBranch, deleteBranch } from '../../actions'
import { toast } from 'react-hot-toast'
import { Trash2, Plus, X, MapPin, Building, Star, Phone, Mail, Globe } from 'lucide-react'
import AddressAutocomplete from '@/components/AddressAutocomplete'
import { useRouter } from 'next/navigation'

export default function EditCompanyForm({ company, branches = [] }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  // Company Form Address State (for Main Branch)
  const [city, setCity] = useState(company.city || company.miasto || '')
  const [postalCode, setPostalCode] = useState(company.zip_code || company.postal_code || '')
  const [address, setAddress] = useState(company.address || '')

  // Branch Manager States
  const [showAddForm, setShowAddForm] = useState(false)
  const [isBranchLoading, setIsBranchLoading] = useState(false)
  const [newBranch, setNewBranch] = useState({
    name: '',
    city: '',
    zip_code: '',
    address: '',
    phone: '',
    email: ''
  })

  // Filters out the main branch to display other branches in the side list
  const otherBranches = branches.filter(b => !b.is_main)
  const mainBranch = branches.find(b => b.is_main)

  async function handleCompanySubmit(formData) {
    setIsLoading(true)
    const result = await updateCompany(company.id, formData)
    setIsLoading(false)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Dane firmy zaktualizowane')
      router.refresh()
    }
  }

  const handleAddressSelect = (data) => {
    setCity(data.city);
    setPostalCode(data.postalCode);
    setAddress(data.street || data.fullAddress.split(',')[0]);
  };

  const handleBranchAddressSelect = (data) => {
    setNewBranch(prev => ({
      ...prev,
      city: data.city || '',
      zip_code: data.postalCode || '',
      address: data.street || data.fullAddress.split(',')[0] || ''
    }))
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

  async function handleAddBranch(e) {
    e.preventDefault()
    if (!newBranch.city || !newBranch.address) {
      toast.error('Miejscowość i adres oddziału są wymagane')
      return
    }
    setIsBranchLoading(true)
    const fd = new FormData()
    fd.append('branch_name', newBranch.name)
    fd.append('city', newBranch.city)
    fd.append('postal_code', newBranch.zip_code)
    fd.append('address', newBranch.address)
    fd.append('phone', newBranch.phone)
    fd.append('email', newBranch.email)

    const res = await createBranch(company.id, fd)
    setIsBranchLoading(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Oddział został dodany')
      setShowAddForm(false)
      setNewBranch({ name: '', city: '', zip_code: '', address: '', phone: '', email: '' })
      router.refresh()
      setTimeout(() => window.location.reload(), 500)
    }
  }

  async function handleDeleteBranch(branchId) {
    if (confirm('Czy na pewno chcesz usunąć ten oddział?')) {
      setIsBranchLoading(true)
      const res = await deleteBranch(branchId, company.id)
      setIsBranchLoading(false)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success('Oddział został usunięty')
        router.refresh()
        setTimeout(() => window.location.reload(), 500)
      }
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: General Info and Main Address */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 space-y-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-600" />
            Dane podstawowe i adres główny
          </h3>

          <form action={handleCompanySubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {/* Autocomplete helper */}
              <div className="sm:col-span-6 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/20">
                <label className="block text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">
                  Wyszukaj adres główny (Siedziba główna)
                </label>
                <AddressAutocomplete onSelect={handleAddressSelect} defaultValue={address ? `${address}, ${city}` : ''} />
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nazwa firmy <span className="text-red-500">*</span>
                </label>
                <input type="text" name="company_name" id="company_name" required defaultValue={company.name || company.nazwa}
                  className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border outline-none" />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Telefon <span className="text-red-500">*</span>
                </label>
                <input type="text" name="phone" id="phone" required defaultValue={company.phone}
                  className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border outline-none" />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email kontaktowy
                </label>
                <input type="email" name="email" id="email" defaultValue={company.email}
                  className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border outline-none" />
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Strona WWW
                </label>
                <input type="url" name="website" id="website" defaultValue={company.website} placeholder="https://"
                  className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border outline-none" />
              </div>

              {/* Hidden bindings to send autocomplete fields */}
              <input type="hidden" name="postal_code" value={postalCode} />
              <input type="hidden" name="city" value={city} />
              <input type="hidden" name="address" value={address} />

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-400 uppercase">Kod pocztowy</label>
                <div className="mt-1 text-sm text-gray-900 dark:text-white font-mono bg-gray-50 dark:bg-slate-900 p-2.5 rounded-lg border border-gray-100 dark:border-slate-800">
                  {postalCode || '-'}
                </div>
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-gray-400 uppercase">Miejscowość / Ulica</label>
                <div className="mt-1 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-900 p-2.5 rounded-lg border border-gray-100 dark:border-slate-800 truncate">
                  {city ? `${city}, ${address}` : '-'}
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || isLoading}
                className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none disabled:opacity-50 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Usuń firmę
              </button>
              <button
                type="submit"
                disabled={isLoading || isDeleting}
                className="inline-flex justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Zapisywanie...' : 'Zapisz zmiany'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Column: Branch Manager */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              <MapPin className="w-5 h-5 text-emerald-500" />
              Pozostałe Oddziały ({otherBranches.length})
            </h3>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Dodaj
              </button>
            )}
          </div>

          {/* Other branches list */}
          {!showAddForm && (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {otherBranches.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-6">Firma nie ma żadnych dodatkowych oddziałów poza główną siedzibą.</p>
              ) : (
                otherBranches.map(branch => (
                  <div key={branch.id} className="p-4 rounded-xl border border-gray-100 dark:border-slate-700/80 hover:border-gray-200 dark:hover:border-slate-600 transition-all">
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1">
                        <span className="font-bold text-gray-900 dark:text-white text-sm">
                          {branch.name || 'Oddział'}
                        </span>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {branch.zip_code} {branch.city}, {branch.address}
                        </p>
                        {(branch.phone || branch.email) && (
                          <div className="flex flex-wrap gap-x-2 gap-y-0.5 pt-1.5 text-[10px] text-gray-500">
                            {branch.phone && <span>Tel: {branch.phone}</span>}
                            {branch.email && <span>Email: {branch.email}</span>}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteBranch(branch.id)}
                        disabled={isBranchLoading}
                        className="p-1 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
                        title="Usuń oddział"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Add Branch Inline Form */}
          {showAddForm && (
            <form onSubmit={handleAddBranch} className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-2">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">Nowy oddział</h4>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Autocomplete for branch address */}
              <div className="bg-emerald-50/50 dark:bg-emerald-950/10 p-3 rounded-lg border border-emerald-100/30">
                <label className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1.5">
                  Wyszukaj adres oddziału
                </label>
                <AddressAutocomplete onSelect={handleBranchAddressSelect} placeholder="Wpisz adres oddziału..." />
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase">Nazwa oddziału (opcjonalnie)</label>
                  <input
                    type="text"
                    placeholder="Np. Magazyn Główny"
                    value={newBranch.name}
                    onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                    className="mt-1 w-full text-xs rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white px-3 py-2 outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase">Kod pocztowy</label>
                    <input
                      type="text"
                      required
                      placeholder="00-000"
                      value={newBranch.zip_code}
                      onChange={(e) => setNewBranch({ ...newBranch, zip_code: e.target.value })}
                      className="mt-1 w-full text-xs rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white px-3 py-2 outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase">Miejscowość</label>
                    <input
                      type="text"
                      required
                      placeholder="Miasto"
                      value={newBranch.city}
                      onChange={(e) => setNewBranch({ ...newBranch, city: e.target.value })}
                      className="mt-1 w-full text-xs rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white px-3 py-2 outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase">Ulica i numer</label>
                  <input
                    type="text"
                    required
                    placeholder="Ulica"
                    value={newBranch.address}
                    onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
                    className="mt-1 w-full text-xs rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white px-3 py-2 outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase">Telefon</label>
                    <input
                      type="text"
                      placeholder="Opcjonalnie"
                      value={newBranch.phone}
                      onChange={(e) => setNewBranch({ ...newBranch, phone: e.target.value })}
                      className="mt-1 w-full text-xs rounded-lg border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white px-3 py-2 outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase">Email</label>
                    <input
                      type="email"
                      placeholder="Opcjonalnie"
                      value={newBranch.email}
                      onChange={(e) => setNewBranch({ ...newBranch, email: e.target.value })}
                      className="mt-1 w-full text-xs rounded-lg border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white px-3 py-2 outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={isBranchLoading}
                  className="text-xs text-white bg-blue-600 hover:bg-blue-700 font-bold px-3 py-1.5 rounded-lg transition-colors"
                >
                  {isBranchLoading ? 'Zapisywanie...' : 'Dodaj oddział'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
