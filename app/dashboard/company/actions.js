'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createCompany(formData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be logged in to create a company')
  }

  const rawData = {
    owner_user_id: user.id,
    company_name: formData.get('company_name'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    website: formData.get('website'),
    postal_code: formData.get('postal_code'),
    city: formData.get('city'),
    address: formData.get('address'),
    status: 'active',
  }

  const { data, error } = await supabase
    .from('companies')
    .insert([rawData])
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  redirect(`/dashboard/company/${data[0].id}`)
}

export async function updateCompany(id, formData) {
  const supabase = createClient()

  const rawData = {
    company_name: formData.get('company_name'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    website: formData.get('website'),
    postal_code: formData.get('postal_code'),
    city: formData.get('city'),
    address: formData.get('address'),
  }

  const { error } = await supabase
    .from('companies')
    .update(rawData)
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/company/${id}`)
  redirect(`/dashboard/company/${id}`)
}

export async function deleteCompany(id) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}
