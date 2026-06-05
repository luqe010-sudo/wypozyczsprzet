'use client'

import { useState } from 'react'
import { 
  adminUpdateDirectoryCompany, 
  adminCreateDirectoryBranch, 
  adminUpdateDirectoryBranch, 
  adminDeleteDirectoryBranch,
  adminLinkDirectoryCompany
} from '../../../actions'
import { toast } from 'react-hot-toast'
import { 
  ArrowLeft, 
  BookOpen, 
  ImageIcon, 
  Upload, 
  Star, 
  Plus, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  FileText, 
  Trash2, 
  Edit3,
  X,
  ExternalLink,
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const VOIVODESHIPS = [
  'dolnośląskie',
  'kujawsko-pomorskie',
  'lubelskie',
  'lubuskie',
  'łódzkie',
  'małopolskie',
  'mazowieckie',
  'opolskie',
  'podkarpackie',
  'podlaskie',
  'pomorskie',
  'śląskie',
  'świętokrzyskie',
  'warmińsko-mazurskie',
  'wielkopolskie',
  'zachodniopomorskie'
]

export default function DirectoryEditForm({ company, initialBranches, marketplaceCompanies = [] }) {
  const router = useRouter()
  
  // States
  const [isUpdatingCompany, setIsUpdatingCompany] = useState(false)
  const [logoPreview, setLogoPreview] = useState(company.logo_url)
  const [branches, setBranches] = useState(initialBranches)
  const [linkedCompanyId, setLinkedCompanyId] = useState(company.linked_company_id || '')
  const [isLinking, setIsLinking] = useState(false)
  
  // Branch form state
  const [isBranchFormOpen, setIsBranchFormOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState(null) // null for new, branch object for edit
  const [isSubmittingBranch, setIsSubmittingBranch] = useState(false)

  // Local state for branch inputs
  const [branchCity, setBranchCity] = useState('')
  const [branchVoivodeship, setBranchVoivodeship] = useState('dolnośląskie')
  const [branchAddress, setBranchAddress] = useState('') // matches correct database column
  const [branchPhone, setBranchPhone] = useState('')
  const [branchEmail, setBranchEmail] = useState('')
  const [branchWebsite, setBranchWebsite] = useState('')
  const [branchNip, setBranchNip] = useState('')
  const [branchRegon, setBranchRegon] = useState('')
  const [branchKrs, setBranchKrs] = useState('')
  const [branchVatStatus, setBranchVatStatus] = useState('')
  const [branchGoogleMapsUrl, setBranchGoogleMapsUrl] = useState('')

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle Main Company update
  async function handleCompanySubmit(formData) {
    setIsUpdatingCompany(true)
    const result = await adminUpdateDirectoryCompany(company.id, formData)
    setIsUpdatingCompany(false)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Dane główne firmy zaktualizowane')
      router.refresh()
    }
  }

  // Open form for new branch
  const handleNewBranchClick = () => {
    setEditingBranch(null)
    setBranchCity('')
    setBranchVoivodeship('dolnośląskie')
    setBranchAddress('')
    setBranchPhone('')
    setBranchEmail('')
    setBranchWebsite('')
    setBranchNip('')
    setBranchRegon('')
    setBranchKrs('')
    setBranchVatStatus('')
    setBranchGoogleMapsUrl('')
    setIsBranchFormOpen(true)
  }

  // Open form for editing branch
  const handleEditBranchClick = (branch) => {
    setEditingBranch(branch)
    setBranchCity(branch.city || '')
    setBranchVoivodeship(branch.voivodeship || 'dolnośląskie')
    setBranchAddress(branch.address || '')
    setBranchPhone(branch.phone || '')
    setBranchEmail(branch.email || '')
    setBranchWebsite(branch.website || '')
    setBranchNip(branch.nip || '')
    setBranchRegon(branch.regon || '')
    setBranchKrs(branch.krs || '')
    setBranchVatStatus(branch.vat_status || '')
    setBranchGoogleMapsUrl(branch.google_maps_url || '')
    setIsBranchFormOpen(true)
  }

  // Submit branch (both Create & Update)
  const handleBranchSubmit = async (e) => {
    e.preventDefault()
    setIsSubmittingBranch(true)

    const formData = new FormData()
    formData.append('city', branchCity)
    formData.append('voivodeship', branchVoivodeship)
    formData.append('address', branchAddress)
    formData.append('phone', branchPhone)
    formData.append('email', branchEmail)
    formData.append('website', branchWebsite)
    formData.append('nip', branchNip)
    formData.append('regon', branchRegon)
    formData.append('krs', branchKrs)
    formData.append('vat_status', branchVatStatus)
    formData.append('google_maps_url', branchGoogleMapsUrl)

    if (editingBranch) {
      // Update Branch
      const result = await adminUpdateDirectoryBranch(editingBranch.id, formData)
      if (result.success) {
        setBranches(branches.map(b => 
          b.id === editingBranch.id 
            ? { ...b, city: branchCity, voivodeship: branchVoivodeship, address: branchAddress, phone: branchPhone, email: branchEmail, website: branchWebsite, nip: branchNip, regon: branchRegon, krs: branchKrs, vat_status: branchVatStatus, google_maps_url: branchGoogleMapsUrl }
            : b
        ))
        toast.success('Oddział zaktualizowany')
        setIsBranchFormOpen(false)
      } else {
        toast.error(result.error || 'Błąd edycji oddziału')
      }
    } else {
      // Create Branch
      const result = await adminCreateDirectoryBranch(company.id, formData)
      if (result.success) {
        const newBranch = {
          id: result.id,
          company_id: company.id,
          city: branchCity,
          voivodeship: branchVoivodeship,
          address: branchAddress,
          phone: branchPhone,
          email: branchEmail,
          website: branchWebsite,
          nip: branchNip,
          regon: branchRegon,
          krs: branchKrs,
          vat_status: branchVatStatus,
          google_maps_url: branchGoogleMapsUrl
        }
        setBranches([...branches, newBranch])
        toast.success('Oddział dodany pomyślnie')
        setIsBranchFormOpen(false)
      } else {
        toast.error(result.error || 'Błąd dodawania oddziału')
      }
    }
    setIsSubmittingBranch(false)
  }

  // Delete branch
  const handleDeleteBranchClick = async (branchId) => {
    if (confirm('Czy na pewno chcesz usunąć ten oddział?')) {
      const result = await adminDeleteDirectoryBranch(branchId)
      if (result.success) {
        setBranches(branches.filter(b => b.id !== branchId))
        toast.success('Oddział usunięty')
      } else {
        toast.error(result.error || 'Błąd usuwania oddziału')
      }
    }
  }

  async function handleLinkCompany(e) {
    e.preventDefault()
    setIsLinking(true)
    const res = await adminLinkDirectoryCompany(company.id, linkedCompanyId)
    setIsLinking(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Powiązanie z firmą zaktualizowane')
      router.refresh()
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Back Button */}
      <div>
        <Link href="/admin/directory" className="text-sm text-blue-600 hover:underline flex items-center gap-1 font-semibold">
          <ArrowLeft className="w-4 h-4" /> Wróć do listy wizytówek
        </Link>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Main Company Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edytuj Dane Główne</h2>
                <p className="text-xs text-gray-500">Modyfikuj wizytówkę firmy w katalogu.</p>
              </div>
            </div>

            <form action={handleCompanySubmit} className="p-6 space-y-6">
              
              {/* Logo Preview and Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Logo firmy</label>
                <div className="flex items-center gap-6">
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="Logo firmy" 
                      className="w-20 h-20 rounded-xl object-cover border border-gray-200 dark:border-slate-700 bg-white"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                  <label className="cursor-pointer bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Zmień logo
                    <input 
                      type="file" 
                      name="logo" 
                      accept="image/*" 
                      onChange={handleLogoChange}
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nazwa firmy <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="name" 
                    defaultValue={company.name} 
                    required 
                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border focus:ring-blue-500 focus:border-blue-500 outline-none" 
                  />
                </div>

                {/* Slug */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 dark:text-gray-500">Przyjazny URL (slug)</label>
                  <input 
                    type="text" 
                    disabled 
                    value={company.slug} 
                    className="mt-1 block w-full rounded-lg border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-500 font-mono px-3 py-2 border select-all" 
                  />
                  <p className="mt-1 text-xs text-gray-400">Slug generuje się i aktualizuje automatycznie w bazie na podstawie nazwy.</p>
                </div>

                {/* Category */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kategoria</label>
                  <input 
                    type="text" 
                    name="category" 
                    defaultValue={company.category || ''} 
                    placeholder="Np. Wynajem sprzętu budowlanego"
                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border focus:ring-blue-500 focus:border-blue-500 outline-none" 
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Opis firmy</label>
                  <textarea 
                    name="description" 
                    defaultValue={company.description || ''} 
                    rows="5" 
                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border focus:ring-blue-500 focus:border-blue-500 outline-none" 
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    Ocena (gwiazdki)
                  </label>
                  <input 
                    type="number" 
                    name="rating" 
                    step="0.1" 
                    min="1.0" 
                    max="5.0" 
                    defaultValue={company.rating || ''} 
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
                    defaultValue={company.review_count || 0} 
                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border focus:ring-blue-500 focus:border-blue-500 outline-none" 
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200 dark:border-slate-700 flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdatingCompany}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all disabled:opacity-50"
                >
                  {isUpdatingCompany ? 'Zapisywanie...' : 'Zapisz dane główne'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right column: Branch Listing & Management */}
        <div className="space-y-6">
          
          {/* Marketplace Link Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              Powiązanie z Marketplace
            </h3>
            <p className="text-xs text-gray-500">Powiąż tę wizytówkę z firmą zarejestrowaną w Marketplace, aby ułatwić integrację i przekazywanie ruchu.</p>
            
            <form onSubmit={handleLinkCompany} className="space-y-3">
              <select
                value={linkedCompanyId}
                onChange={(e) => setLinkedCompanyId(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white px-3 py-2 border text-sm outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
              >
                <option value="">-- Brak powiązania --</option>
                {marketplaceCompanies.map(comp => (
                  <option key={comp.id} value={comp.id}>{comp.name}</option>
                ))}
              </select>
              
              <button
                type="submit"
                disabled={isLinking}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                {isLinking ? 'Zapisywanie...' : 'Zapisz powiązanie'}
              </button>
            </form>
          </div>

          {/* Branch management header */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Oddziały firmy ({branches.length})
                </h3>
                <p className="text-xs text-gray-500">Zarządzaj lokalizacjami w katalogu.</p>
              </div>
              <button
                onClick={handleNewBranchClick}
                className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center"
                title="Dodaj nowy oddział"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Branch Cards list */}
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {branches.length === 0 ? (
                <div className="text-center py-8 text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl">
                  <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-xs font-semibold">Brak oddziałów</p>
                  <p className="text-[10px] text-gray-400 px-4">Firma nie wyświetli się w wyszukiwarce katalogu bez dodania przynajmniej jednego oddziału.</p>
                </div>
              ) : (
                branches.map((branch) => (
                  <div 
                    key={branch.id} 
                    className="p-4 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 transition-all group relative"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
                          {branch.city}
                          <span className="text-[10px] font-normal text-gray-400 bg-gray-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            {branch.voivodeship}
                          </span>
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 select-all">{branch.address}</p>
                      </div>
                      
                      {/* Branch actions */}
                      <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditBranchClick(branch)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded transition-colors"
                          title="Edytuj oddział"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBranchClick(branch.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded transition-colors"
                          title="Usuń oddział"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Rich Details */}
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-800/80 grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px] text-gray-500">
                      {branch.phone && (
                        <div className="flex items-center gap-1 select-all">
                          <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                          <span className="truncate">{branch.phone}</span>
                        </div>
                      )}
                      {branch.email && (
                        <div className="flex items-center gap-1 select-all">
                          <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                          <span className="truncate">{branch.email}</span>
                        </div>
                      )}
                      {branch.website && (
                        <div className="flex items-center gap-1 select-all">
                          <Globe className="w-3 h-3 text-gray-400 shrink-0" />
                          <span className="truncate">{branch.website}</span>
                        </div>
                      )}
                      {branch.nip && (
                        <div className="flex items-center gap-1 select-all">
                          <FileText className="w-3 h-3 text-gray-400 shrink-0" />
                          <span>NIP: {branch.nip}</span>
                        </div>
                      )}
                      {branch.regon && (
                        <div className="col-span-2 flex items-center gap-1 select-all">
                          <FileText className="w-3 h-3 text-gray-400 shrink-0" />
                          <span>REGON: {branch.regon} {branch.krs && `| KRS: ${branch.krs}`}</span>
                        </div>
                      )}
                      {branch.vat_status && (
                        <div className="col-span-2 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                          <span>Status VAT: {branch.vat_status}</span>
                        </div>
                      )}
                      {branch.google_maps_url && (
                        <a 
                          href={branch.google_maps_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="col-span-2 text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 mt-0.5"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Zobacz na Google Maps
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Branch Modal/Form overlay */}
      {isBranchFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingBranch ? 'Edytuj oddział' : 'Dodaj nowy oddział'}
              </h3>
              <button 
                onClick={() => setIsBranchFormOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Scrollable Form */}
            <form onSubmit={handleBranchSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                {/* City */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Miejscowość <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required 
                    value={branchCity}
                    onChange={(e) => setBranchCity(e.target.value)}
                    placeholder="Np. Wrocław"
                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border text-sm focus:ring-blue-500 outline-none" 
                  />
                </div>

                {/* Voivodeship */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Województwo <span className="text-red-500">*</span></label>
                  <select 
                    value={branchVoivodeship}
                    onChange={(e) => setBranchVoivodeship(e.target.value)}
                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border text-sm focus:ring-blue-500 outline-none"
                  >
                    {VOIVODESHIPS.map((voiv) => (
                      <option key={voiv} value={voiv}>{voiv}</option>
                    ))}
                  </select>
                </div>

                {/* Address */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Adres (Ulica i numer) <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={branchAddress}
                    onChange={(e) => setBranchAddress(e.target.value)}
                    placeholder="Np. ul. Robotnicza 42/3"
                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border text-sm focus:ring-blue-500 outline-none" 
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Telefon</label>
                  <input 
                    type="text" 
                    value={branchPhone}
                    onChange={(e) => setBranchPhone(e.target.value)}
                    placeholder="Np. 71 345 67 89"
                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border text-sm focus:ring-blue-500 outline-none" 
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Email</label>
                  <input 
                    type="email" 
                    value={branchEmail}
                    onChange={(e) => setBranchEmail(e.target.value)}
                    placeholder="Np. wroclaw@firma.pl"
                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border text-sm focus:ring-blue-500 outline-none" 
                  />
                </div>

                {/* Website */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Dedykowana strona WWW</label>
                  <input 
                    type="url" 
                    value={branchWebsite}
                    onChange={(e) => setBranchWebsite(e.target.value)}
                    placeholder="Np. https://firma.pl/wroclaw"
                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border text-sm focus:ring-blue-500 outline-none" 
                  />
                </div>

                {/* NIP */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase">NIP</label>
                  <input 
                    type="text" 
                    value={branchNip}
                    onChange={(e) => setBranchNip(e.target.value)}
                    placeholder="10-cyfrowy NIP"
                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border text-sm focus:ring-blue-500 outline-none" 
                  />
                </div>

                {/* REGON */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase">REGON</label>
                  <input 
                    type="text" 
                    value={branchRegon}
                    onChange={(e) => setBranchRegon(e.target.value)}
                    placeholder="REGON"
                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border text-sm focus:ring-blue-500 outline-none" 
                  />
                </div>

                {/* KRS */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase">KRS</label>
                  <input 
                    type="text" 
                    value={branchKrs}
                    onChange={(e) => setBranchKrs(e.target.value)}
                    placeholder="KRS (opcjonalnie)"
                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border text-sm focus:ring-blue-500 outline-none" 
                  />
                </div>

                {/* VAT Status */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Status VAT</label>
                  <input 
                    type="text" 
                    value={branchVatStatus}
                    onChange={(e) => setBranchVatStatus(e.target.value)}
                    placeholder="Np. Czynny podatnik VAT"
                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border text-sm focus:ring-blue-500 outline-none" 
                  />
                </div>

                {/* Google Maps URL */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase">Link Google Maps (Wizytówka)</label>
                  <input 
                    type="url" 
                    value={branchGoogleMapsUrl}
                    onChange={(e) => setBranchGoogleMapsUrl(e.target.value)}
                    placeholder="https://maps.google.com/?cid=..."
                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-3 py-2 border text-sm focus:ring-blue-500 outline-none" 
                  />
                </div>

              </div>

              {/* Modal Actions */}
              <div className="pt-6 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsBranchFormOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 font-semibold"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBranch}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50 shadow-md shadow-blue-100 dark:shadow-none"
                >
                  {isSubmittingBranch ? 'Zapisywanie...' : 'Zapisz oddział'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
