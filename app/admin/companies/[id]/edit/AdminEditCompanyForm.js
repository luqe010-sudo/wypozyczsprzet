'use client'

import { useState } from 'react'
import { adminUpdateCompany, adminCreateCompanyBranch, adminUpdateCompanyBranch, adminDeleteCompanyBranch } from '../../../actions'
import { toast } from 'react-hot-toast'
import { Trash2, ArrowLeft, Plus, Edit2, Check, X, MapPin, Phone, Mail, Building, Globe, Star } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AdminEditCompanyForm({ company, branches: initialBranches }) {
  const [isLoading, setIsLoading] = useState(false)
  const [branches, setBranches] = useState(initialBranches)
  const [editingBranchId, setEditingBranchId] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [branchLoadingId, setBranchLoadingId] = useState(null)
  const router = useRouter()

  // Branch form state (for both add and edit)
  const [branchForm, setBranchForm] = useState({
    name: '',
    city: '',
    zip_code: '',
    address: '',
    phone: '',
    email: '',
    is_main: false
  })

  async function handleCompanySubmit(formData) {
    setIsLoading(true)
    const result = await adminUpdateCompany(company.id, formData)
    setIsLoading(false)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Dane firmy zaktualizowane')
      router.refresh()
    }
  }

  async function handleAddBranch(e) {
    e.preventDefault()
    if (!branchForm.city || !branchForm.address) {
      toast.error('Miejscowość i adres są wymagane')
      return
    }
    setBranchLoadingId('new')
    const fd = new FormData()
    fd.append('branch_name', branchForm.name)
    fd.append('city', branchForm.city)
    fd.append('postal_code', branchForm.zip_code)
    fd.append('address', branchForm.address)
    fd.append('phone', branchForm.phone)
    fd.append('email', branchForm.email)
    fd.append('is_main', branchForm.is_main ? 'true' : 'false')

    const res = await adminCreateCompanyBranch(company.id, fd)
    setBranchLoadingId(null)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Oddział został dodany')
      setShowAddForm(false)
      setBranchForm({ name: '', city: '', zip_code: '', address: '', phone: '', email: '', is_main: false })
      // Refresh component branches state
      router.refresh()
      // Wait a moment and fetch updated list or let next.js refresh
      setTimeout(() => window.location.reload(), 500)
    }
  }

  async function handleUpdateBranch(e, branchId) {
    e.preventDefault()
    if (!branchForm.city || !branchForm.address) {
      toast.error('Miejscowość i adres są wymagane')
      return
    }
    setBranchLoadingId(branchId)
    const fd = new FormData()
    fd.append('branch_name', branchForm.name)
    fd.append('city', branchForm.city)
    fd.append('postal_code', branchForm.zip_code)
    fd.append('address', branchForm.address)
    fd.append('phone', branchForm.phone)
    fd.append('email', branchForm.email)
    fd.append('is_main', branchForm.is_main ? 'true' : 'false')

    const res = await adminUpdateCompanyBranch(branchId, fd)
    setBranchLoadingId(null)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Oddział został zaktualizowany')
      setEditingBranchId(null)
      router.refresh()
      setTimeout(() => window.location.reload(), 500)
    }
  }

  async function handleDeleteBranch(branchId) {
    if (confirm('Czy na pewno chcesz usunąć ten oddział?')) {
      setBranchLoadingId(branchId)
      const res = await adminDeleteCompanyBranch(branchId)
      setBranchLoadingId(null)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success('Oddział został usunięty')
        router.refresh()
        setTimeout(() => window.location.reload(), 500)
      }
    }
  }

  function startEdit(branch) {
    setEditingBranchId(branch.id)
    setBranchForm({
      name: branch.name || '',
      city: branch.city || '',
      zip_code: branch.zip_code || '',
      address: branch.address || '',
      phone: branch.phone || '',
      email: branch.email || '',
      is_main: branch.is_main || false
    })
    setShowAddForm(false)
  }

  function startAdd() {
    setEditingBranchId(null)
    setBranchForm({
      name: '',
      city: '',
      zip_code: '',
      address: '',
      phone: company.phone || '',
      email: company.email || '',
      is_main: branches.length === 0
    })
    setShowAddForm(true)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
      <div className="mb-4">
        <Link href="/admin/companies" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Wróć do listy firm
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: General Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                Dane podstawowe firmy
              </h2>
            </div>
            
            <form action={handleCompanySubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Nazwa firmy</label>
                  <input type="text" name="company_name" required defaultValue={company.name}
                    className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Telefon główny</label>
                  <input type="text" name="phone" required defaultValue={company.phone}
                    className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email kontaktowy</label>
                  <input type="email" name="email" defaultValue={company.email}
                    className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Strona WWW</label>
                  <input type="url" name="website" defaultValue={company.website}
                    className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Opis firmy</label>
                  <textarea name="description" rows={4} defaultValue={company.description}
                    className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white px-4 py-3 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                </div>
              </div>

              {/* Legacy fallback display */}
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 rounded-xl text-xs space-y-1.5 border border-amber-200/50">
                <span className="font-bold">Informacja:</span> Dane adresowe firmy są teraz zarządzane za pomocą Oddziałów (po prawej). Pola poniżej zostaną zaktualizowane tylko w celach kompatybilności wstecznej.
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <input type="hidden" name="postal_code" value={branches.find(b => b.is_main)?.zip_code || company.zip_code || ''} />
                  <input type="hidden" name="city" value={branches.find(b => b.is_main)?.city || company.city || ''} />
                  <input type="hidden" name="address" value={branches.find(b => b.is_main)?.address || company.address || ''} />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200 dark:border-slate-700 flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 shadow-md shadow-blue-200 dark:shadow-none"
                >
                  {isLoading ? 'Zapisywanie...' : 'Zapisz dane firmy'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: Branches Manager */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-500" />
                Oddziały ({branches.length})
              </h3>
              {!showAddForm && editingBranchId === null && (
                <button
                  onClick={startAdd}
                  className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Dodaj
                </button>
              )}
            </div>

            {/* List of branches */}
            {!showAddForm && editingBranchId === null && (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {branches.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-6">Ta firma nie posiada jeszcze żadnych oddziałów.</p>
                ) : (
                  branches.map(branch => (
                    <div 
                      key={branch.id} 
                      className={`p-4 rounded-xl border transition-all ${
                        branch.is_main 
                          ? 'border-emerald-200 bg-emerald-50/20 dark:border-emerald-900/40 dark:bg-emerald-950/10' 
                          : 'border-gray-100 dark:border-slate-700 hover:border-gray-200 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 dark:text-white text-sm">
                              {branch.name || 'Oddział'}
                            </span>
                            {branch.is_main && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-400 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-current" /> Główny
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {branch.zip_code} {branch.city}, {branch.address}
                          </p>
                          {(branch.phone || branch.email) && (
                            <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1.5 text-[11px] text-gray-500">
                              {branch.phone && (
                                <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {branch.phone}</span>
                              )}
                              {branch.email && (
                                <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {branch.email}</span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => startEdit(branch)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            title="Edytuj"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {!branch.is_main && (
                            <button
                              disabled={branchLoadingId === branch.id}
                              onClick={() => handleDeleteBranch(branch.id)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                              title="Usuń"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Add / Edit Branch Form */}
            {(showAddForm || editingBranchId !== null) && (
              <form onSubmit={showAddForm ? handleAddBranch : (e) => handleUpdateBranch(e, editingBranchId)} className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-2">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    {showAddForm ? 'Nowy oddział' : 'Edycja oddziału'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false)
                      setEditingBranchId(null)
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase">Nazwa oddziału (np. Siedziba, Magazyn)</label>
                    <input
                      type="text"
                      placeholder="np. Oddział Północ"
                      value={branchForm.name}
                      onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                      className="mt-1 w-full text-xs rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white px-3 py-2 outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                      <label className="block text-[11px] font-semibold text-gray-500 uppercase">Kod pocztowy</label>
                      <input
                        type="text"
                        placeholder="00-000"
                        required
                        value={branchForm.zip_code}
                        onChange={(e) => setBranchForm({ ...branchForm, zip_code: e.target.value })}
                        className="mt-1 w-full text-xs rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white px-3 py-2 outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[11px] font-semibold text-gray-500 uppercase">Miejscowość</label>
                      <input
                        type="text"
                        placeholder="np. Warszawa"
                        required
                        value={branchForm.city}
                        onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })}
                        className="mt-1 w-full text-xs rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white px-3 py-2 outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase">Ulica i numer</label>
                    <input
                      type="text"
                      placeholder="np. Al. Jerozolimskie 123"
                      required
                      value={branchForm.address}
                      onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                      className="mt-1 w-full text-xs rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white px-3 py-2 outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 uppercase">Telefon</label>
                      <input
                        type="text"
                        value={branchForm.phone}
                        onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                        className="mt-1 w-full text-xs rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white px-3 py-2 outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 uppercase">Email</label>
                      <input
                        type="email"
                        value={branchForm.email}
                        onChange={(e) => setBranchForm({ ...branchForm, email: e.target.value })}
                        className="mt-1 w-full text-xs rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white px-3 py-2 outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="is_main"
                      checked={branchForm.is_main}
                      disabled={editingBranchId !== null && initialBranches.find(b => b.id === editingBranchId)?.is_main} // Can't unmark main branch without marking another
                      onChange={(e) => setBranchForm({ ...branchForm, is_main: e.target.checked })}
                      className="rounded text-blue-600 border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 focus:ring-blue-500"
                    />
                    <label htmlFor="is_main" className="text-xs text-gray-700 dark:text-gray-300 select-none cursor-pointer">
                      Ustaw jako oddział główny firmy
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false)
                      setEditingBranchId(null)
                    }}
                    className="text-xs text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Anuluj
                  </button>
                  <button
                    type="submit"
                    disabled={branchLoadingId !== null}
                    className="text-xs text-white bg-blue-600 hover:bg-blue-700 font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                    {branchLoadingId !== null ? 'Zapisywanie...' : 'Zapisz oddział'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
