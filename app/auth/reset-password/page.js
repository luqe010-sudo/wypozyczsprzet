'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updatePassword } from '@/app/login/actions'
import { toast, Toaster } from 'react-hot-toast'
import { Lock, ShieldCheck } from 'lucide-react'

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

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
      toast.success('Hasło zostało zresetowane. Możesz się teraz zalogować.')
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Toaster position="top-center" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-3 rounded-2xl text-white">
            <ShieldCheck className="w-8 h-8" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Ustaw nowe hasło
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Wprowadź nowe hasło dla swojego konta
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow-xl sm:rounded-3xl sm:px-10 border border-gray-100 dark:border-slate-700">
          <form action={handleSubmit} className="space-y-6">
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
              {isLoading ? 'Przetwarzanie...' : 'Zapisz nowe hasło'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
