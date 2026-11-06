'use server'

import { randomUUID } from 'node:crypto'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath, updateTag } from 'next/cache'
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
  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/company/${companyId}`)
  revalidatePath('/dashboard/ogloszenia')
  updateTag('listings')
}

async function listingFields(supabase, companyId, formData, current) {
  const fields = parseListingFields(formData, {
    existingImages: current ? [current.image_url, ...(current.gallery_urls || [])].filter(Boolean) : [],
  })
  if (!fields.category_id && (!current || current.category_id)) throw new Error('Wybierz kategorię sprzętu.')
  if (!fields.branch_id && (!current || current.branch_id)) throw new Error('Wybierz oddział, w którym znajduje się sprzęt.')

  const [categoryResult, subcategoryResult, branchResult] = await Promise.all([
    fields.category_id
      ? supabase.from('equipment_categories').select('db_key, status').eq('id', fields.category_id).maybeSingle()
      : { data: null },
    fields.subcategory_id
      ? supabase.from('equipment_subcategories').select('slug, status').eq('id', fields.subcategory_id)
        .eq('category_id', fields.category_id).maybeSingle()
      : { data: null },
    fields.branch_id
      ? supabase.from('company_branches').select('id').eq('id', fields.branch_id).eq('company_id', companyId).maybeSingle()
      : { data: null },
  ])

  const category = categoryResult.data
  const subcategory = subcategoryResult.data
  if (fields.category_id && (!category || (category.status !== 'active' && fields.category_id !== current?.category_id))) {
    throw new Error('Wybrana kategoria nie jest dostępna.')
  }
  if (fields.subcategory_id && (!subcategory || (subcategory.status !== 'active' && fields.subcategory_id !== current?.subcategory_id))) {
    throw new Error('Wybierz podkategorię należącą do wybranej kategorii.')
  }
  if (fields.branch_id && !branchResult.data) throw new Error('Wybrany oddział nie jest dostępny. Wybierz oddział swojej firmy.')

  return {
    ...fields,
    category: category ? category.db_key : current?.category ?? null,
    subcategory: category ? subcategory?.slug ?? null : current?.subcategory ?? null,
  }
}

export async function createEquipment(companyId, formData) {
  const supabase = await createClient()
  const company = await requireOwnedCompany(supabase, companyId)
  if (formData.get('terms') !== 'on') return { error: 'Zaakceptuj regulamin i politykę prywatności.' }

  let fields
  try {
    fields = await listingFields(supabase, companyId, formData)
  } catch (error) {
    return { error: error.message }
  }
  const slug = await generateUniqueSlug(supabase, fields.name)

  // The database decides the final status: the first listing of an unverified company waits for moderation.
  const insert = (slug) => supabase
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

  let result = await insert(slug)
  // A concurrent or RLS-hidden listing can take this slug after the lookup.
  if (result.error?.code === '23505' && result.error.message.includes('equipment_slug_unique')) {
    result = await insert(`${slug.slice(0, 71)}-${randomUUID().slice(0, 8)}`)
  }
  if (result.error) return { error: result.error.message }
  const created = result.data

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
    .select('image_url, gallery_urls, category_id, subcategory_id, branch_id, category, subcategory')
    .eq('id', id)
    .eq('company_id', companyId)
    .single()
  if (!current) return { error: 'Nie znaleziono ogłoszenia.' }

  let fields
  try {
    fields = await listingFields(supabase, companyId, formData, current)
  } catch (error) {
    return { error: error.message }
  }

  const { data: saved, error } = await supabase
    .from('equipment')
    .update({
      ...fields,
      promotion: formData.get('promotion') === 'on',
      last_confirmed_at: new Date().toISOString(),
      reminder_sent_at: null,
    })
    .eq('id', id)
    .eq('company_id', companyId)
    .select('id')
    .maybeSingle()

  if (error) return { error: error.message }
  if (!saved) return { error: 'Nie znaleziono ogłoszenia.' }

  refresh(companyId)
  return { success: true }
}

export async function deleteEquipment(id, companyId) {
  const supabase = await createClient()
  await requireOwnedCompany(supabase, companyId)

  const { data: deleted, error } = await supabase
    .from('equipment')
    .delete()
    .eq('id', id)
    .eq('company_id', companyId)
    .select('id')
    .maybeSingle()

  if (error) return { error: error.message }
  if (!deleted) return { error: 'Nie znaleziono ogłoszenia.' }

  refresh(companyId)
  return { success: true }
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
  if (!['active', 'incomplete', 'stale'].includes(listing.status)) {
    return { error: 'Aktualność można potwierdzić dla ogłoszenia opublikowanego lub ukrytego po terminie.' }
  }

  const { data: saved, error } = await supabase
    .from('equipment')
    .update({
      last_confirmed_at: new Date().toISOString(),
      reminder_sent_at: null,
      ...(listing.status === 'stale' ? { status: 'active' } : {}),
    })
    .eq('id', id)
    .eq('company_id', companyId)
    .eq('status', listing.status)
    .select('status')
    .maybeSingle()

  if (error) return { error: error.message }
  if (!saved || (listing.status === 'stale' && saved.status !== 'active')) {
    return { error: 'Status ogłoszenia się zmienił. Odśwież stronę i spróbuj ponownie.' }
  }
  refresh(companyId)
  return { success: true }
}

/** Temporarily takes a listing off the site, or brings it back. */
export async function setEquipmentPaused(id, companyId, paused) {
  const supabase = await createClient()
  await requireOwnedCompany(supabase, companyId)

  const status = paused ? 'inactive' : 'active'
  const { data: saved, error } = await supabase
    .from('equipment')
    .update({
      status,
      ...(paused ? {} : { last_confirmed_at: new Date().toISOString(), reminder_sent_at: null }),
    })
    .eq('id', id)
    .eq('company_id', companyId)
    .in('status', paused ? ['active', 'incomplete'] : ['inactive'])
    .select('status')
    .maybeSingle()

  if (error) return { error: error.message }
  if (saved?.status !== status) return { error: 'Status ogłoszenia się zmienił. Odśwież stronę i spróbuj ponownie.' }
  refresh(companyId)
  return { success: true }
}
