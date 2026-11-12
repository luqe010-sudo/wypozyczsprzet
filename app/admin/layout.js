import Link from 'next/link'
import { ExternalLink, LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { signout } from '@/app/login/actions'
import AdminNav from '@/components/admin/AdminNav'

export const metadata = {
  title: 'Panel administratora | wypozycz.online',
  robots: { index: false, follow: false },
}

/** Queue sizes shown next to the menu items; the proxy has already confirmed the admin role. */
async function fetchQueueCounts() {
  const supabase = await createClient()
  const [listings, inquiries, claims] = await Promise.all([
    supabase.from('equipment').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('inquiries').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('company_claims').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ])
  return {
    pendingListings: listings.count || 0,
    newInquiries: inquiries.count || 0,
    pendingClaims: claims.count || 0,
  }
}

const footerLink = 'flex min-h-11 shrink-0 items-center gap-2.5 rounded-lg px-3 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white'

export default async function AdminLayout({ children }) {
  const counts = await fetchQueueCounts()

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)]">
      <aside className="bg-market-navy text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-y-auto">
        <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-4 lg:block lg:px-5 lg:pb-4 lg:pt-6">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="rounded-lg bg-market-yellow p-1.5 text-market-navy"><ShieldCheck size={20} aria-hidden="true" /></span>
            <span>
              <span className="block text-base font-extrabold leading-none tracking-tight">wypozycz.online</span>
              <span className="mt-1 block text-[11px] font-semibold uppercase leading-none tracking-wider text-amber-300">Panel administratora</span>
            </span>
          </Link>
          <Link href="/" className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-slate-200 hover:bg-white/10 lg:hidden">
            <ExternalLink size={16} aria-hidden="true" /> Strona
          </Link>
        </div>

        <nav aria-label="Panel administratora" className="flex gap-1 overflow-x-auto px-3 pb-3 [scrollbar-width:none] lg:flex-1 lg:flex-col lg:overflow-visible lg:px-3 lg:pb-0">
          <AdminNav counts={counts} />
        </nav>

        <div className="hidden border-t border-white/10 p-3 lg:block">
          <Link href="/dashboard" className={footerLink}><LayoutDashboard size={18} aria-hidden="true" /> Panel wynajmującego</Link>
          <Link href="/" className={footerLink}><ExternalLink size={18} aria-hidden="true" /> Strona główna</Link>
          <form action={signout}>
            <button type="submit" className={`${footerLink} w-full`}><LogOut size={18} aria-hidden="true" /> Wyloguj</button>
          </form>
        </div>
      </aside>

      <div className="min-w-0 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </div>
    </div>
  )
}
