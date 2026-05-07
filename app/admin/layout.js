import Link from 'next/link'
import { 
  LayoutDashboard, 
  Building2, 
  Package, 
  Users, 
  ArrowLeft,
  Settings,
  ShieldCheck
} from 'lucide-react'

export default function AdminLayout({ children }) {
  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Firmy', href: '/admin/companies', icon: Building2 },
    { name: 'Sprzęt', href: '/admin/equipment', icon: Package },
    { name: 'Użytkownicy', href: '/admin/users', icon: Users },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-blue-600" />
          <span className="text-xl font-bold dark:text-white">Admin Panel</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-slate-700">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Wróć do Panelu Usera
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-lg font-semibold text-gray-800 dark:text-white">Panel Administracyjny</h1>
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              Administrator
            </span>
          </div>
        </header>
        
        <div className="p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
