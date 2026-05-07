'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createEquipment(companyId, formData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be logged in')
  }

  // Verify company ownership
  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('id', companyId)
    .eq('owner_user_id', user.id)
    .single()

  if (!company) {
    throw new Error('Unauthorized or company not found')
  }

  const rawData = {
    company_id: companyId,
    category: formData.get('category'),
    name: formData.get('name'),
    price_from: formData.get('price_from'),
    rental_period: formData.get('rental_period'),
    availability: formData.get('availability'),
    description: formData.get('description'),
    external_olx_url: formData.get('external_olx_url'),
    status: 'active',
  }

  const { error } = await supabase
    .from('equipment')
    .insert([rawData])

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/company/${companyId}`)
  redirect(`/dashboard/company/${companyId}`)
}

export async function updateEquipment(id, companyId, formData) {
  const supabase = createClient()

  const rawData = {
    category: formData.get('category'),
    name: formData.get('name'),
    price_from: formData.get('price_from'),
    rental_period: formData.get('rental_period'),
    availability: formData.get('availability'),
    description: formData.get('description'),
    external_olx_url: formData.get('external_olx_url'),
  }

  const { error } = await supabase
    .from('equipment')
    .update(rawData)
    .eq('id', id)
    // RLS handles the ownership check via company_id implicitly if setup correctly, 
    // but we add it to be safe if calling from server
    .eq('company_id', companyId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/company/${companyId}`)
  redirect(`/dashboard/company/${companyId}`)
}

export async function deleteEquipment(id, companyId) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('equipment')
    .delete()
    .eq('id', id)
    .eq('company_id', companyId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/company/${companyId}`)
  redirect(`/dashboard/company/${companyId}`)
}
