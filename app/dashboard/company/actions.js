'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { geocodeAddress } from '@/lib/geocoding'
import { sanitizeAddress } from '@/lib/utils'

export async function createCompany(formData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be logged in to create a company')
  }

  const address = formData.get('address')
  const city = formData.get('city')
  const sanitized = sanitizeAddress(address, city)
  const coords = await geocodeAddress(sanitized)

  const rawData = {
    owner_user_id: user.id,
    name: formData.get('company_name'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    website: formData.get('website'),
    // Deprecated but kept for backward compatibility
    zip_code: formData.get('postal_code'),
    city: city,
    address: address,
    lat: coords?.lat || null,
    lng: coords?.lng || null,
    status: 'active',
  }

  const { data, error } = await supabase
    .from('companies')
    .insert([rawData])
    .select()

  if (error) {
    return { error: error.message }
  }

  // Create main branch
  const branchData = {
    company_id: data[0].id,
    name: 'Siedziba główna',
    city: city,
    zip_code: formData.get('postal_code'),
    address: address,
    lat: coords?.lat || null,
    lng: coords?.lng || null,
    phone: formData.get('phone'),
    email: formData.get('email'),
    is_main: true,
    source: 'user',
  }

  await supabase.from('company_branches').insert([branchData])

  revalidatePath('/dashboard')
  revalidateTag('listings')
  redirect(`/dashboard/company/${data[0].id}`)
}

export async function updateCompany(id, formData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Verify ownership
  const { data: company } = await supabase
    .from('companies')
    .select('owner_user_id')
    .eq('id', id)
    .single()

  if (!company || company.owner_user_id !== user.id) {
    throw new Error('Unauthorized or company not found')
  }

  const address = formData.get('address')
  const city = formData.get('city')
  const sanitized = sanitizeAddress(address, city)
  const coords = await geocodeAddress(sanitized)

  // Update company (keeping deprecated columns for backward compat)
  const rawData = {
    name: formData.get('company_name'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    website: formData.get('website'),
    zip_code: formData.get('postal_code'),
    city: city,
    address: address,
    lat: coords?.lat || null,
    lng: coords?.lng || null,
  }

  const { error } = await supabase
    .from('companies')
    .update(rawData)
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  // Also update main branch
  const branchUpdate = {
    city: city,
    zip_code: formData.get('postal_code'),
    address: address,
    lat: coords?.lat || null,
    lng: coords?.lng || null,
    phone: formData.get('phone'),
    email: formData.get('email'),
  }

  await supabase
    .from('company_branches')
    .update(branchUpdate)
    .eq('company_id', id)
    .eq('is_main', true)

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/company/${id}`)
  revalidateTag('listings')
  redirect(`/dashboard/company/${id}`)
}

export async function deleteCompany(id) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Verify ownership
  const { data: company } = await supabase
    .from('companies')
    .select('owner_user_id')
    .eq('id', id)
    .single()

  if (!company || company.owner_user_id !== user.id) {
    throw new Error('Unauthorized or company not found')
  }

  // Delete branches first (cascade should handle this, but just in case)
  await supabase
    .from('company_branches')
    .delete()
    .eq('company_id', id)
  
  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidateTag('listings')
  redirect('/dashboard')
}

// ─── Branch Management ───────────────────────────────────────────────────────

export async function createBranch(companyId, formData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Verify ownership
  const { data: company } = await supabase
    .from('companies')
    .select('owner_user_id')
    .eq('id', companyId)
    .single()

  if (!company || company.owner_user_id !== user.id) {
    throw new Error('Unauthorized or company not found')
  }

  const address = formData.get('address')
  const city = formData.get('city')
  const sanitized = sanitizeAddress(address, city)
  const coords = await geocodeAddress(sanitized)

  const rawData = {
    company_id: companyId,
    name: formData.get('branch_name') || null,
    city: city,
    zip_code: formData.get('postal_code') || null,
    address: address,
    lat: coords?.lat || null,
    lng: coords?.lng || null,
    phone: formData.get('phone') || null,
    email: formData.get('email') || null,
    is_main: false,
    source: 'user',
  }

  const { error } = await supabase
    .from('company_branches')
    .insert([rawData])

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/company/${companyId}`)
  revalidatePath(`/dashboard/company/${companyId}/edit`)
  revalidateTag('listings')
  return { success: true }
}

export async function deleteBranch(branchId, companyId) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Verify company ownership
  const { data: company } = await supabase
    .from('companies')
    .select('owner_user_id')
    .eq('id', companyId)
    .single()

  if (!company || company.owner_user_id !== user.id) {
    throw new Error('Unauthorized or company not found')
  }

  const { error } = await supabase
    .from('company_branches')
    .delete()
    .eq('id', branchId)
    .eq('company_id', companyId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/company/${companyId}`)
  revalidatePath(`/dashboard/company/${companyId}/edit`)
  revalidateTag('listings')
  return { success: true }
}
