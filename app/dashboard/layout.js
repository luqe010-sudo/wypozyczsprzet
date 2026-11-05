import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { signout } from '@/app/login/actions'
import DashboardNav from '@/components/dashboard/DashboardNav'

export default async function DashboardLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="mx-auto grid min-h-[65vh] max-w-7xl items-start gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-6 lg:py-8">
      <aside className="listing-panel min-w-0">
        <div className="mb-3 border-b border-slate-200 pb-3 dark:border-slate-700">
          <p className="font-bold text-slate-950 dark:text-white">Panel wynajmującego</p>
          <p className="mt-1 truncate text-xs text-slate-600 dark:text-slate-400" title={user.email}>{user.email}</p>
        </div>
        <nav aria-label="Panel wynajmującego" className="flex flex-wrap gap-1 lg:flex-col">
          <DashboardNav />
          <form action={signout}>
            <button type="submit" className="flex min-h-11 w-full items-center gap-2 rounded-lg px-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700">
              <LogOut size={17} aria-hidden="true" /> Wyloguj
            </button>
          </form>
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  )
}
