import { createClient } from '@/utils/supabase/server'
import UsersTable from './UsersTable'
import { AdminPageHeader } from '@/components/admin/adminUi'

export default async function AdminUsersPage() {
  const supabase = await createClient()

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
    <div className="space-y-5">
      <AdminPageHeader title="Użytkownicy" description="Konta zarejestrowanych osób. Rolę administratora nadawaj tylko zaufanym osobom." />

      <UsersTable initialUsers={users || []} />
    </div>
  )
}
