'use client'

import { useState, useEffect } from 'react'
import { getPendingClaims, handleClaimAction } from '@/app/actions/claimActions'
import { Building2, User, Mail, Phone, MessageSquare, Check, X, Clock } from 'lucide-react'

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processingId, setProcessingId] = useState(null)

  useEffect(() => {
    loadClaims()
  }, [])

  async function loadClaims() {
    setLoading(true)
    const result = await getPendingClaims()
    if (result.error) {
      setError(result.error)
    } else {
      setClaims(result.data)
    }
    setLoading(false)
  }

  async function onAction(claimId, action, companyId, userId) {
    if (!confirm(`Czy na pewno chcesz ${action === 'approve' ? 'ZAAKCEPTOWAĆ' : 'ODRZUCIĆ'} to zgłoszenie?`)) return
    
    setProcessingId(claimId)
    const result = await handleClaimAction(claimId, action, companyId, userId)
    
    if (result.error) {
      alert(`Błąd: ${result.error}`)
    } else {
      setClaims(claims.filter(c => c.id !== claimId))
    }
    setProcessingId(null)
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white">Zgłoszenia</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Zarządzaj prośbami o przejęcie firm</p>
        </div>
        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-2xl font-bold text-sm">
          {claims.length} oczekujących
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-2xl font-medium">
          {error}
        </div>
      )}

      {claims.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-dashed border-gray-200 dark:border-slate-800">
          <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Brak nowych zgłoszeń</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Wszystkie firmy są przypisane lub nie mają chętnych właścicieli.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {claims.map((claim) => (
            <div key={claim.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-md transition-shadow relative overflow-hidden group">
              {processingId === claim.id && (
                <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
              
              <div className="flex flex-col lg:flex-row gap-8 justify-between">
                <div className="space-y-6 flex-1">
                  {/* Company Info */}
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-2xl text-blue-600 dark:text-blue-400">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Firma do przejęcia</p>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white">{claim.companies?.name}</h3>
                      <p className="text-sm text-gray-500 font-medium">{claim.companies?.city}</p>
                    </div>
                  </div>

                  {/* User/Claim Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">{claim.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">{claim.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-[10px] font-mono bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded italic">UID: {claim.user_id.slice(0, 8)}...</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">{new Date(claim.created_at).toLocaleDateString('pl-PL')} o {new Date(claim.created_at).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  {claim.message && (
                    <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-800">
                      <div className="flex gap-2 items-start">
                        <MessageSquare className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic">"{claim.message}"</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-row lg:flex-col gap-3 justify-end items-center">
                  <button 
                    onClick={() => onAction(claim.id, 'approve', claim.company_id, claim.user_id)}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-black px-6 py-4 rounded-2xl transition-all shadow-lg shadow-green-500/20 active:scale-[0.98]"
                  >
                    <Check className="w-5 h-5" />
                    <span>Akceptuj</span>
                  </button>
                  <button 
                    onClick={() => onAction(claim.id, 'reject', claim.company_id, claim.user_id)}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border-2 border-red-100 dark:border-red-900/30 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 font-bold px-6 py-4 rounded-2xl transition-all active:scale-[0.98]"
                  >
                    <X className="w-5 h-5" />
                    <span>Odrzuć</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
