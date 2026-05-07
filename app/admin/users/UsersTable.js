'use client'

import { useState } from 'react'
import { updateUserRole } from '../actions'
import { toast } from 'react-hot-toast'
import { 
  Search, 
  Shield, 
  User, 
  Mail, 
  Calendar,
  Building2
} from 'lucide-react'

export default function UsersTable({ initialUsers }) {
  const [users, setUsers] = useState(initialUsers)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredUsers = users.filter(u => 
    u.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleRoleChange = async (userId, newRole) => {
    const result = await updateUserRole(userId, newRole)
    if (result.success) {
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ))
      toast.success(`Rola zmieniona na ${newRole}`)
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Szukaj po ID użytkownika..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-gray-500">
          Użytkowników: <strong>{filteredUsers.length}</strong>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-gray-50 dark:bg-slate-900 text-gray-500 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Użytkownik (ID)</th>
                <th className="px-6 py-4 font-semibold">Rola</th>
                <th className="px-6 py-4 font-semibold">Firmy</th>
                <th className="px-6 py-4 font-semibold">Data dołączenia</th>
                <th className="px-6 py-4 font-semibold text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${u.role === 'admin' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                        {u.role === 'admin' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-mono text-[10px] text-gray-400">{u.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-800 dark:bg-slate-900 dark:text-gray-400'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    <div className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {u.companies?.[0]?.count || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(u.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <select
                      className="text-xs bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded p-1 outline-none"
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    >
                      <option value="user">Użytkownik</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
