'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath, updateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { generateUniqueSlug } from '@/lib/listings'
import { parseListingFields } from '@/lib/listingForm'
import { adminEmail, sendEmail } from '@/lib/email'
import { SITE_URL } from '@/lib/site'

async function requireOwnedCompany(supabase, companyId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Zaloguj się, aby kontynuować.')

  const { data: company } = await supabase
    .from('companies')
    .select('id, name')
    .eq('id', companyId)
    .eq('owner_user_id', user.id)
    .single()

  if (!company) throw new Error('Nie masz dostępu do tej firmy.')
  return company
}

function refresh(companyId) {
  revalidatePath(`/dashboard/company/${companyId}`)
  revalidatePath('/dashboard/ogloszenia')
  updateTag('listings')
}

export async function createEquipment(companyId, formData) {
  const supabase = await createClient()
  const company = await requireOwnedCompany(supabase, companyId)
  if (formData.get('terms') !== 'on') return { error: 'Zaakceptuj regulamin i politykę prywatności.' }

  let fields
  try {
    fields = parseListingFields(formData)
  } catch (error) {
    return { error: error.message }
  }
  if (!fields.category_id) return { error: 'Wybierz kategorię sprzętu.' }
  if (!fields.branch_id) return { error: 'Wybierz oddział, w którym znajduje się sprzęt.' }
  const { data: branch } = await supabase.from('company_branches').select('id')
    .eq('id', fields.branch_id).eq('company_id', companyId).maybeSingle()
  if (!branch) return { error: 'Wybrany oddział nie jest dostępny. Wybierz oddział swojej firmy.' }

  const slug = await generateUniqueSlug(supabase, fields.name)

  // The database decides the final status: the first listing of an unverified company waits for moderation.
  const { data: created, error } = await supabase
    .from('equipment')
    .insert([{
      ...fields,
      company_id: companyId,
      slug,
      promotion: formData.get('promotion') === 'on',
      last_confirmed_at: new Date().toISOString(),
      status: 'pending',
    }])
    .select('status')
    .single()

  if (error) return { error: error.message }

  if (created.status === 'pending') {
    await sendEmail({
      to: adminEmail(),
      subject: `Ogłoszenie do moderacji: ${fields.name}`,
      text: `Firma ${company.name} dodała ogłoszenie „${fields.name}”.\n\nModeracja: ${SITE_URL}/admin/equipment`,
    })
  }

  refresh(companyId)
  return { pending: created.status === 'pending' }
}

export async function updateEquipment(id, companyId, formData) {
  const supabase = await createClient()
  await requireOwnedCompany(supabase, companyId)

  const { data: current } = await supabase
    .from('equipment')
    .select('image_url, gallery_urls')
    .eq('id', id)
    .eq('company_id', companyId)
    .single()
  if (!current) return { error: 'Nie znaleziono ogłoszenia.' }

  let fields
  try {
    fields = parseListingFields(formData, { existingImages: [current.image_url, ...(current.gallery_urls || [])].filter(Boolean) })
  } catch (error) {
    return { error: error.message }
  }

  const { error } = await supabase
    .from('equipment')
    .update({
      ...fields,
      promotion: formData.get('promotion') === 'on',
      last_confirmed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('company_id', companyId)

  if (error) return { error: error.message }

  refresh(companyId)
  redirect(`/dashboard/company/${companyId}`)
}

export async function deleteEquipment(id, companyId) {
  const supabase = await createClient()
  await requireOwnedCompany(supabase, companyId)

  const { error } = await supabase
    .from('equipment')
    .delete()
    .eq('id', id)
    .eq('company_id', companyId)

  if (error) return { error: error.message }

  refresh(companyId)
  redirect(`/dashboard/company/${companyId}`)
}

/** The owner states the listing is current. Also brings back one hidden for lack of confirmation. */
export async function confirmEquipment(id, companyId) {
  const supabase = await createClient()
  await requireOwnedCompany(supabase, companyId)

  const { data: listing } = await supabase
    .from('equipment')
    .select('status')
    .eq('id', id)
    .eq('company_id', companyId)
    .single()
  if (!listing) return { error: 'Nie znaleziono ogłoszenia.' }

  const { error } = await supabase
    .from('equipment')
    .update({
      last_confirmed_at: new Date().toISOString(),
      reminder_sent_at: null,
      ...(listing.status === 'stale' ? { status: 'active' } : {}),
    })
    .eq('id', id)
    .eq('company_id', companyId)

  if (error) return { error: error.message }
  refresh(companyId)
  return { success: true }
}

/** Temporarily takes a listing off the site, or brings it back. */
export async function setEquipmentPaused(id, companyId, paused) {
  const supabase = await createClient()
  await requireOwnedCompany(supabase, companyId)

  const { error } = await supabase
    .from('equipment')
    .update({ status: paused ? 'inactive' : 'active' })
    .eq('id', id)
    .eq('company_id', companyId)

  if (error) return { error: error.message }
  refresh(companyId)
  return { success: true }
}
