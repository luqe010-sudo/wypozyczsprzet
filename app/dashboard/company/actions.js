'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath, updateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { geocodeAddress } from '@/lib/geocoding'
import { sanitizeAddress } from '@/lib/utils'

const text = (formData, name, max = 200) => {
  const value = String(formData.get(name) ?? '').trim()
  return value ? value.slice(0, max) : null
}

/** Company and main-branch fields from the form, with the checks the form also does in the browser. */
function readCompanyForm(formData) {
  const fields = {
    name: text(formData, 'company_name', 160),
    phone: text(formData, 'phone', 40),
    email: text(formData, 'email', 200),
    website: text(formData, 'website', 300),
    zip_code: text(formData, 'postal_code', 12),
    city: text(formData, 'city', 100),
    address: text(formData, 'address', 200),
  }
  if (!fields.name) return { error: 'Podaj nazwę firmy.' }
  if (!fields.phone) return { error: 'Podaj telefon, pod którym klienci mogą zadzwonić.' }
  if (!fields.city) return { error: 'Podaj miejscowość siedziby.' }
  if (fields.website && !/^https?:\/\//i.test(fields.website)) fields.website = `https://${fields.website}`
  return { fields }
}

async function currentUser(supabase) {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

async function ownsCompany(supabase, companyId, userId) {
  const { data } = await supabase
    .from('companies')
    .select('id')
    .eq('id', companyId)
    .eq('owner_user_id', userId)
    .maybeSingle()
  return Boolean(data)
}

function refreshCompany(companyId) {
  revalidatePath('/dashboard')
  if (companyId) {
    revalidatePath(`/dashboard/company/${companyId}`)
    revalidatePath(`/dashboard/company/${companyId}/edit`)
  }
  updateTag('listings')
}

export async function createCompany(formData) {
  const supabase = await createClient()
  const user = await currentUser(supabase)
  if (!user) return { error: 'Zaloguj się, aby dodać firmę.' }

  const { fields, error: formError } = readCompanyForm(formData)
  if (formError) return { error: formError }

  const coords = await geocodeAddress(sanitizeAddress(fields.address, fields.city))
  const location = { lat: coords?.lat ?? null, lng: coords?.lng ?? null }

  const { data: company, error } = await supabase
    .from('companies')
    .insert([{ owner_user_id: user.id, status: 'active', ...fields, ...location }])
    .select('id')
    .single()
  if (error) return { error: `Nie udało się utworzyć firmy: ${error.message}` }

  const { error: branchError } = await supabase.from('company_branches').insert([{
    company_id: company.id,
    name: 'Siedziba główna',
    city: fields.city,
    zip_code: fields.zip_code,
    address: fields.address,
    phone: fields.phone,
    email: fields.email,
    ...location,
    is_main: true,
    source: 'user',
  }])
  if (branchError) console.error('createCompany: main branch insert failed', branchError)

  refreshCompany(company.id)
  redirect(`/dashboard/company/${company.id}`)
}

export async function updateCompany(id, formData) {
  const supabase = await createClient()
  const user = await currentUser(supabase)
  if (!user) return { error: 'Zaloguj się ponownie.' }
  if (!(await ownsCompany(supabase, id, user.id))) return { error: 'Nie masz dostępu do tej firmy.' }

  const { fields, error: formError } = readCompanyForm(formData)
  if (formError) return { error: formError }

  const { data: mainBranch } = await supabase
    .from('company_branches')
    .select('id, city, address, lat, lng')
    .eq('company_id', id)
    .eq('is_main', true)
    .order('created_at')
    .limit(1)
    .maybeSingle()

  // Keep stored coordinates while the address is unchanged, so a geocoder outage cannot drop the company off the map.
  const sameAddress = mainBranch
    && (mainBranch.city || '') === (fields.city || '')
    && (mainBranch.address || '') === (fields.address || '')
    && mainBranch.lat != null
  const coords = sameAddress
    ? { lat: mainBranch.lat, lng: mainBranch.lng }
    : await geocodeAddress(sanitizeAddress(fields.address, fields.city))
  const location = { lat: coords?.lat ?? null, lng: coords?.lng ?? null }

  const { error } = await supabase.from('companies').update({ ...fields, ...location }).eq('id', id)
  if (error) return { error: `Nie udało się zapisać firmy: ${error.message}` }

  const branchFields = {
    city: fields.city,
    zip_code: fields.zip_code,
    address: fields.address,
    phone: fields.phone,
    email: fields.email,
    ...location,
  }
  const { error: branchError } = mainBranch
    ? await supabase.from('company_branches').update(branchFields).eq('id', mainBranch.id)
    : await supabase.from('company_branches').insert([{ company_id: id, name: 'Siedziba główna', is_main: true, source: 'user', ...branchFields }])
  if (branchError) return { error: `Dane firmy zapisane, ale nie udało się zapisać siedziby: ${branchError.message}` }

  refreshCompany(id)
  redirect(`/dashboard/company/${id}`)
}

export async function deleteCompany(id) {
  const supabase = await createClient()
  const user = await currentUser(supabase)
  if (!user) return { error: 'Zaloguj się ponownie.' }
  if (!(await ownsCompany(supabase, id, user.id))) return { error: 'Nie masz dostępu do tej firmy.' }

  await supabase.from('company_branches').delete().eq('company_id', id)
  const { error } = await supabase.from('companies').delete().eq('id', id)
  if (error) return { error: `Nie udało się usunąć firmy: ${error.message}` }

  refreshCompany(null)
  redirect('/dashboard')
}

// ─── Branch Management ───────────────────────────────────────────────────────

export async function createBranch(companyId, formData) {
  const supabase = await createClient()
  const user = await currentUser(supabase)
  if (!user) return { error: 'Zaloguj się ponownie.' }
  if (!(await ownsCompany(supabase, companyId, user.id))) return { error: 'Nie masz dostępu do tej firmy.' }

  const city = text(formData, 'city', 100)
  const address = text(formData, 'address', 200)
  if (!city || !address) return { error: 'Podaj miejscowość i adres oddziału.' }

  const coords = await geocodeAddress(sanitizeAddress(address, city))
  const { error } = await supabase.from('company_branches').insert([{
    company_id: companyId,
    name: text(formData, 'branch_name', 120),
    city,
    zip_code: text(formData, 'postal_code', 12),
    address,
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
    phone: text(formData, 'phone', 40),
    email: text(formData, 'email', 200),
    is_main: false,
    source: 'user',
  }])
  if (error) return { error: `Nie udało się dodać oddziału: ${error.message}` }

  refreshCompany(companyId)
  return { success: true, geocoded: Boolean(coords) }
}

export async function deleteBranch(branchId, companyId) {
  const supabase = await createClient()
  const user = await currentUser(supabase)
  if (!user) return { error: 'Zaloguj się ponownie.' }
  if (!(await ownsCompany(supabase, companyId, user.id))) return { error: 'Nie masz dostępu do tej firmy.' }

  const { count } = await supabase
    .from('equipment')
    .select('id', { count: 'exact', head: true })
    .eq('branch_id', branchId)
  if (count) return { error: `Do tego oddziału ${count === 1 ? 'jest przypisane 1 ogłoszenie' : `jest przypisanych ${count} ogłoszeń`}. Najpierw przenieś je do innego oddziału.` }

  // The oldest main branch is the company seat and cannot be removed here.
  const { data: seat } = await supabase
    .from('company_branches')
    .select('id')
    .eq('company_id', companyId)
    .eq('is_main', true)
    .order('created_at')
    .limit(1)
    .maybeSingle()
  if (seat?.id === branchId) return { error: 'Siedziby głównej nie można usunąć. Zmień jej adres w danych firmy.' }

  const { error } = await supabase
    .from('company_branches')
    .delete()
    .eq('id', branchId)
    .eq('company_id', companyId)
  if (error) return { error: `Nie udało się usunąć oddziału: ${error.message}` }

  refreshCompany(companyId)
  return { success: true }
}
