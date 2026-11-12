'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Building2, Handshake, Inbox, LayoutDashboard, Package, Users } from 'lucide-react'

const links = [
  { href: '/admin', label: 'Pulpit', icon: LayoutDashboard },
  { href: '/admin/equipment', label: 'Ogłoszenia', icon: Package, badge: 'pendingListings', badgeLabel: 'do moderacji' },
  { href: '/admin/inquiries', label: 'Zapytania', icon: Inbox, badge: 'newInquiries', badgeLabel: 'nowych' },
  { href: '/admin/claims', label: 'Przejęcia firm', icon: Handshake, badge: 'pendingClaims', badgeLabel: 'oczekujących' },
  { href: '/admin/companies', label: 'Firmy', icon: Building2 },
  { href: '/admin/directory', label: 'Katalog firm', icon: BookOpen },
  { href: '/admin/users', label: 'Użytkownicy', icon: Users },
]

export default function AdminNav({ counts = {} }) {
  const pathname = usePathname()

  return links.map(({ href, label, icon: Icon, badge, badgeLabel }) => {
    const active = href === '/admin' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)
    const count = badge ? counts[badge] || 0 : 0
    return (
      <Link
        key={href}
        href={href}
        aria-current={active ? 'page' : undefined}
        className={`flex min-h-11 shrink-0 items-center gap-2.5 rounded-lg px-3 text-sm font-semibold transition-colors ${active
          ? 'bg-market-yellow text-market-navy'
          : 'text-slate-200 hover:bg-white/10 hover:text-white'}`}
      >
        <Icon size={18} aria-hidden="true" className="shrink-0" />
        <span className="whitespace-nowrap">{label}</span>
        {count > 0 && (
          <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-bold leading-none ${active ? 'bg-market-navy text-white' : 'bg-amber-400 text-market-navy'}`}>
            {count}<span className="sr-only"> {badgeLabel}</span>
          </span>
        )}
      </Link>
    )
  })
}
