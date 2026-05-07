'use client'

import { useState } from 'react'
import { updatePassword } from '@/app/login/actions'
import { toast, Toaster } from 'react-hot-toast'
import { Lock, ShieldCheck } from 'lucide-react'

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData) {
    setIsLoading(true)
    const password = formData.get('password')
    const confirmPassword = formData.get('confirmPassword')

    if (password !== confirmPassword) {
      toast.error('Hasła nie są identyczne.')
      setIsLoading(false)
      return
    }

    const result = await updatePassword(formData)
    
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success(result.success)
      // Reset form
      document.getElementById('settings-form').reset()
    }
    
    setIsLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Toaster position="top-center" />
      
      <div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-blue-600" />
          Ustawienia konta
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Zarządzaj bezpieczeństwem swojego konta</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5 text-gray-400" />
            Zmiana hasła
          </h2>

          <form id="settings-form" action={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Nowe hasło
              </label>
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Przynajmniej 6 znaków"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Potwierdź nowe hasło
              </label>
              <input
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Powtórz hasło"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98]"
            >
              {isLoading ? 'Przetwarzanie...' : 'Zaktualizuj hasło'}
            </button>
          </form>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/10 p-6 border-t border-blue-100 dark:border-blue-900/20">
          <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
            <strong>Wskazówka:</strong> Użyj silnego hasła składającego się z liter, cyfr i znaków specjalnych. Twoja przeglądarka powinna zaproponować bezpieczne hasło automatycznie.
          </p>
        </div>
      </div>
    </div>
  )
}
