'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

async function checkAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') throw new Error('Unauthorized')
  return { supabase, user }
}

export async function updateUserRole(userId, role) {
  try {
    const { supabase } = await checkAdmin()
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)

    if (error) throw error
    revalidatePath('/admin/users')
    return { success: true }
  } catch (error) {
    return { error: error.message }
  }
}

export async function updateCompanyOwner(companyId, newOwnerId) {
  try {
    const { supabase } = await checkAdmin()
    const { error } = await supabase
      .from('companies')
      .update({ owner_user_id: newOwnerId })
      .eq('id', companyId)

    if (error) throw error
    revalidatePath('/admin/companies')
    return { success: true }
  } catch (error) {
    return { error: error.message }
  }
}

export async function adminDeleteRecord(table, id) {
  try {
    const { supabase } = await checkAdmin()
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)

    if (error) throw error
    revalidatePath(`/admin/${table}`)
    return { success: true }
  } catch (error) {
    return { error: error.message }
  }
}

export async function updateEquipmentStatus(id, status) {
  try {
    const { supabase } = await checkAdmin()
    const { error } = await supabase
      .from('equipment')
      .update({ status })
      .eq('id', id)

    if (error) throw error
    revalidatePath('/admin/equipment')
    return { success: true }
  } catch (error) {
    return { error: error.message }
  }
}
