import { createClient } from '@/utils/supabase/server'
import UsersTable from './UsersTable'
import { Users } from 'lucide-react'

export default async function AdminUsersPage() {
  const supabase = createClient()

  // Fetch all users and count their companies
  const { data: users } = await supabase
    .from('profiles')
    .select(`
      id, 
      role, 
      created_at,
      companies(count)
    `)
    .order('role', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-600" />
            Zarządzanie Użytkownikami
          </h2>
          <p className="text-gray-500 dark:text-gray-400">Przeglądaj profile i nadawaj uprawnienia administratora.</p>
        </div>
      </div>

      <UsersTable initialUsers={users || []} />
    </div>
  )
}
