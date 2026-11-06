'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Heart, Inbox, LayoutDashboard, Package, Settings } from 'lucide-react'

const links = [
  { href: '/dashboard', label: 'Pulpit i firmy', icon: LayoutDashboard },
  { href: '/dashboard/ogloszenia', label: 'Moje ogłoszenia', icon: Package },
  { href: '/dashboard/inquiries', label: 'Zapytania', icon: Inbox },
  { href: '/ulubione', label: 'Ulubione', icon: Heart },
  { href: '/dashboard/settings', label: 'Ustawienia', icon: Settings },
]

export default function DashboardNav() {
  const pathname = usePathname()
  return links.map(({ href, label, icon: Icon }) => {
    const active = pathname === href
      || (href === '/dashboard' && pathname.startsWith('/dashboard/company/') && !pathname.endsWith('/equipment/new'))
      || (href === '/dashboard/ogloszenia' && (pathname.startsWith('/dashboard/equipment/') || pathname.endsWith('/equipment/new')))
    return (
      <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={`flex min-h-11 items-center gap-2 rounded-lg px-2.5 text-sm font-semibold ${active ? 'bg-amber-100 text-market-navy dark:bg-amber-400/15 dark:text-market-yellow' : 'text-foreground hover:bg-background'}`}>
        <Icon size={17} aria-hidden="true" /> {label}
      </Link>
    )
  })
}
