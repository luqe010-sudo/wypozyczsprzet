import Link from 'next/link'
import { 
  LayoutDashboard, 
  Building2, 
  Package, 
  Users, 
  Home, 
  Settings, 
  ArrowLeft,
  ShieldCheck 
} from 'lucide-react'

export default function AdminLayout({ children }) {
  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { label: 'Firmy', icon: Building2, href: '/admin/companies' },
    { label: 'Sprzęt', icon: Package, href: '/admin/equipment' },
    { label: 'Użytkownicy', icon: Users, href: '/admin/users' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col lg:flex-row">
      {/* Sidebar (Desktop) */}
      <aside className="w-full lg:w-64 bg-white dark:bg-slate-900 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-slate-800 flex-shrink-0 lg:sticky lg:top-0 lg:h-screen z-50">
        <div className="p-4 lg:p-6 flex lg:flex-col items-center lg:items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 dark:text-white leading-none">ADMIN</h1>
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1">WypożyczSprzęt</p>
            </div>
          </div>

          <nav className="hidden lg:flex flex-col gap-1 w-full mt-8">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all group"
              >
                <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-bold">{item.label}</span>
              </Link>
            ))}
            
            <div className="mt-8 pt-8 border-t border-gray-100 dark:border-slate-800">
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Wróć do strony</span>
              </Link>
            </div>
          </nav>
          
          {/* Mobile Top Stats/Menu Info */}
          <div className="lg:hidden flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-1 bg-blue-100 text-blue-800 rounded uppercase">Panel Admina</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 pb-24 lg:pb-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-gray-200 dark:border-slate-800 px-2 py-3 flex justify-around items-center z-50">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors px-3"
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
          </Link>
        ))}
        <Link href="/" className="flex flex-col items-center gap-1 text-gray-400 px-3">
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">WWW</span>
        </Link>
      </nav>
    </div>
  )
}
