'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import cloudinary from '@/lib/cloudinary'
import { geocodeAddress } from '@/lib/geocoding'
import { sanitizeAddress } from '@/lib/utils'
import { slugify, citySlug, voivodeshipSlug } from '@/lib/slugify'
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin'

const USER_ROLES = new Set(['user', 'admin'])
const EQUIPMENT_STATUSES = new Set(['active', 'pending', 'inactive', 'rejected', 'incomplete'])
const DELETABLE_TABLES = new Set(['companies', 'equipment', 'company_branches'])

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

async function checkAdminWithServiceRole() {
  const { user } = await checkAdmin()
  const supabase = createSupabaseAdminClient()

  if (!supabase) {
    throw new Error('Brak konfiguracji SUPABASE_SERVICE_ROLE_KEY dla zapisu katalogu')
  }

  return { supabase, user }
}

async function fetchDirectoryCompanyWithBranches(supabase, companyId) {
  const [{ data: company }, { data: branches }] = await Promise.all([
    supabase
      .from('company_directory')
      .select('*')
      .eq('id', companyId)
      .maybeSingle(),
    supabase
      .from('company_directory_branches')
      .select('*')
      .eq('company_id', companyId),
  ])

  if (!company) return null
  return { ...company, branches: branches || [] }
}

function revalidateDirectoryPaths(company) {
  revalidatePath('/admin/directory')
  revalidatePath('/katalog')
  revalidatePath('/sitemaps/katalog')
  revalidateTag('directory')

  if (!company) return

  const companySlug = company.slug || slugify(company.name)
  const seen = new Set()

  for (const branch of company.branches || []) {
    if (branch.city) {
      const path = `/katalog/${citySlug(branch.city)}/${companySlug}`
      if (!seen.has(path)) {
        revalidatePath(path)
        seen.add(path)
      }
    }

    if (branch.voivodeship) {
      const path = `/katalog/woj/${voivodeshipSlug(branch.voivodeship)}/${companySlug}`
      if (!seen.has(path)) {
        revalidatePath(path)
        seen.add(path)
      }
    }
  }
}

export async function updateUserRole(userId, role) {
  try {
    if (!USER_ROLES.has(role)) {
      throw new Error('Invalid role')
    }

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
    revalidateTag('listings')
    return { success: true }
  } catch (error) {
    return { error: error.message }
  }
}

export async function adminDeleteRecord(table, id) {
  try {
    const { supabase } = await checkAdmin()
    if (!DELETABLE_TABLES.has(table)) {
      throw new Error('Invalid table')
    }

    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)

    if (error) throw error
    revalidatePath(`/admin/${table}`)
    revalidateTag('listings')
    return { success: true }
  } catch (error) {
    return { error: error.message }
  }
}

export async function adminUpdateCompany(id, formData) {
  try {
    const { supabase } = await checkAdmin()

    const rawData = {
      name: formData.get('company_name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      website: formData.get('website'),
    }

    // Also update deprecated columns for backward compatibility
    const city = formData.get('city')
    const address = formData.get('address')
    if (city) rawData.city = city
    if (address) rawData.address = address
    const zipCode = formData.get('postal_code')
    if (zipCode) rawData.zip_code = zipCode

    if (city || address) {
      const sanitized = sanitizeAddress(address, city)
      const coords = await geocodeAddress(sanitized)
      if (coords) {
        rawData.lat = coords.lat
        rawData.lng = coords.lng
      }
    }

    const { error } = await supabase
      .from('companies')
      .update(rawData)
      .eq('id', id)

    if (error) throw error
    revalidatePath('/admin/companies')
    revalidateTag('listings')
    return { success: true }
  } catch (error) {
    return { error: error.message }
  }
}

export async function adminUpdateEquipment(id, formData) {
  try {
    const { supabase } = await checkAdmin()
    
    let imageUrl = formData.get('current_image_url')
    const imageFile = formData.get('image')

    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'listings' },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        )
        uploadStream.end(buffer)
      })
      imageUrl = uploadResult.secure_url
    }

    const rawData = {
      name: formData.get('name'),
      category: formData.get('category'),
      subcategory: formData.get('subcategory') || null,
      category_id: formData.get('category_id') || null,
      subcategory_id: formData.get('subcategory_id') || null,
      branch_id: formData.get('branch_id') || null,
      price_from: parseFloat(formData.get('price_from')),
      rental_period: formData.get('rental_period'),
      availability: formData.get('availability'),
      description: formData.get('description'),
      external_olx_url: formData.get('external_olx_url'),
      image_url: imageUrl,
      promotion: formData.get('promotion') === 'on',
    }

    const { error } = await supabase
      .from('equipment')
      .update(rawData)
      .eq('id', id)

    if (error) throw error
    revalidatePath('/admin/equipment')
    revalidateTag('listings')
    return { success: true }
  } catch (error) {
    return { error: error.message }
  }
}

export async function adminCreateCompany(formData) {
  try {
    const { supabase } = await checkAdmin()
    const address = formData.get('address')
    const city = formData.get('city')
    const sanitized = sanitizeAddress(address, city)
    const coords = await geocodeAddress(sanitized)

    const rawData = {
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
      owner_user_id: formData.get('owner_user_id') || null,
      status: 'active',
    }

    const { data, error } = await supabase
      .from('companies')
      .insert([rawData])
      .select()

    if (error) throw error

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
      source: 'admin',
    }

    await supabase.from('company_branches').insert([branchData])

    revalidatePath('/admin/companies')
    revalidateTag('listings')
    return { success: true, id: data[0].id }
  } catch (error) {
    return { error: error.message }
  }
}

export async function adminCreateEquipment(formData) {
  try {
    const { supabase } = await checkAdmin()
    
    let imageUrl = null
    const imageFile = formData.get('image')

    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'listings' },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        )
        uploadStream.end(buffer)
      })
      imageUrl = uploadResult.secure_url
    }

    const rawData = {
      company_id: formData.get('company_id'),
      name: formData.get('name'),
      category: formData.get('category'),
      subcategory: formData.get('subcategory') || null,
      category_id: formData.get('category_id') || null,
      subcategory_id: formData.get('subcategory_id') || null,
      branch_id: formData.get('branch_id') || null,
      price_from: parseFloat(formData.get('price_from')),
      rental_period: formData.get('rental_period'),
      availability: formData.get('availability'),
      description: formData.get('description'),
      external_olx_url: formData.get('external_olx_url'),
      image_url: imageUrl,
      promotion: formData.get('promotion') === 'on',
      status: 'active',
    }

    const { error } = await supabase
      .from('equipment')
      .insert([rawData])

    if (error) throw error
    revalidatePath('/admin/equipment')
    revalidateTag('listings')
    return { success: true }
  } catch (error) {
    return { error: error.message }
  }
}

export async function updateEquipmentStatus(id, status) {
  try {
    if (!EQUIPMENT_STATUSES.has(status)) {
      throw new Error('Invalid status')
    }

    const { supabase } = await checkAdmin()
    const { error } = await supabase
      .from('equipment')
      .update({ status })
      .eq('id', id)

    if (error) throw error
    revalidatePath('/admin/equipment')
    revalidateTag('listings')
    return { success: true }
  } catch (error) {
    return { error: error.message }
  }
}

// ─── Company Directory CRUD ──────────────────────────────────────────────────

async function uploadLogoToCloudinary(file) {
  if (!file || file.size === 0) return null
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'company_logos' },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    )
    stream.end(buffer)
  })
  return result.secure_url
}

export async function adminCreateDirectoryCompany(formData) {
  try {
    const { supabase } = await checkAdminWithServiceRole()

    const name = formData.get('name')
    if (!name) throw new Error('Nazwa firmy jest wymagana')

    let logoUrl = null
    const logoFile = formData.get('logo')
    if (logoFile && logoFile.size > 0) {
      logoUrl = await uploadLogoToCloudinary(logoFile)
    }

    const rawData = {
      name,
      slug: slugify(name),
      description: formData.get('description') || null,
      category: formData.get('category') || null,
      logo_url: logoUrl,
      rating: formData.get('rating') ? parseFloat(formData.get('rating')) : null,
      review_count: formData.get('review_count') ? parseInt(formData.get('review_count'), 10) : null,
    }

    const { data, error } = await supabase
      .from('company_directory')
      .insert([rawData])
      .select()
      .single()

    if (error) throw error
    revalidateDirectoryPaths({ ...data, branches: [] })
    return { success: true, id: data.id }
  } catch (error) {
    return { error: error.message }
  }
}

export async function adminUpdateDirectoryCompany(id, formData) {
  try {
    const { supabase } = await checkAdminWithServiceRole()

    const name = formData.get('name')
    if (!name) throw new Error('Nazwa firmy jest wymagana')
    const previousCompany = await fetchDirectoryCompanyWithBranches(supabase, id)

    const rawData = {
      name,
      slug: slugify(name),
      description: formData.get('description') || null,
      category: formData.get('category') || null,
      rating: formData.get('rating') ? parseFloat(formData.get('rating')) : null,
      review_count: formData.get('review_count') ? parseInt(formData.get('review_count'), 10) : null,
    }

    // Handle logo upload (only if new file provided)
    const logoFile = formData.get('logo')
    if (logoFile && logoFile.size > 0) {
      rawData.logo_url = await uploadLogoToCloudinary(logoFile)
    }

    const { data, error } = await supabase
      .from('company_directory')
      .update(rawData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    if (!data) throw new Error('Nie znaleziono firmy w katalogu')

    const branches = previousCompany?.branches || []
    revalidateDirectoryPaths(previousCompany)
    revalidateDirectoryPaths({ ...data, branches })
    return { success: true }
  } catch (error) {
    return { error: error.message }
  }
}

export async function adminDeleteDirectoryCompany(id) {
  try {
    const { supabase } = await checkAdminWithServiceRole()
    const previousCompany = await fetchDirectoryCompanyWithBranches(supabase, id)

    // Branches are deleted via cascade (FK constraint) or manually
    const { error: branchError } = await supabase
      .from('company_directory_branches')
      .delete()
      .eq('company_id', id)

    if (branchError) throw branchError

    const { data, error } = await supabase
      .from('company_directory')
      .delete()
      .eq('id', id)
      .select('id')
      .single()

    if (error) throw error
    if (!data) throw new Error('Nie znaleziono firmy w katalogu')
    revalidateDirectoryPaths(previousCompany)
    return { success: true }
  } catch (error) {
    return { error: error.message }
  }
}

// ─── Company Directory Branches CRUD ─────────────────────────────────────────

export async function adminCreateDirectoryBranch(companyId, formData) {
  try {
    const { supabase } = await checkAdminWithServiceRole()

    const rawData = {
      company_id: companyId,
      city: formData.get('city') || null,
      voivodeship: formData.get('voivodeship') || null,
      address: formData.get('address') || null,
      phone: formData.get('phone') || null,
      email: formData.get('email') || null,
      website: formData.get('website') || null,
      nip: formData.get('nip') || null,
      regon: formData.get('regon') || null,
      krs: formData.get('krs') || null,
      vat_status: formData.get('vat_status') || null,
      google_maps_url: formData.get('google_maps_url') || null,
    }

    const { data, error } = await supabase
      .from('company_directory_branches')
      .insert([rawData])
      .select()
      .single()

    if (error) throw error
    const company = await fetchDirectoryCompanyWithBranches(supabase, companyId)
    revalidateDirectoryPaths(company)
    return { success: true, id: data.id }
  } catch (error) {
    return { error: error.message }
  }
}

export async function adminUpdateDirectoryBranch(branchId, formData) {
  try {
    const { supabase } = await checkAdminWithServiceRole()
    const { data: previousBranch } = await supabase
      .from('company_directory_branches')
      .select('company_id')
      .eq('id', branchId)
      .maybeSingle()
    const previousCompany = previousBranch?.company_id
      ? await fetchDirectoryCompanyWithBranches(supabase, previousBranch.company_id)
      : null

    const rawData = {
      city: formData.get('city') || null,
      voivodeship: formData.get('voivodeship') || null,
      address: formData.get('address') || null,
      phone: formData.get('phone') || null,
      email: formData.get('email') || null,
      website: formData.get('website') || null,
      nip: formData.get('nip') || null,
      regon: formData.get('regon') || null,
      krs: formData.get('krs') || null,
      vat_status: formData.get('vat_status') || null,
      google_maps_url: formData.get('google_maps_url') || null,
    }

    const { data, error } = await supabase
      .from('company_directory_branches')
      .update(rawData)
      .eq('id', branchId)
      .select('id, company_id')
      .single()

    if (error) throw error
    if (!data) throw new Error('Nie znaleziono oddzialu firmy')
    const company = await fetchDirectoryCompanyWithBranches(supabase, data.company_id)
    revalidateDirectoryPaths(previousCompany)
    revalidateDirectoryPaths(company)
    if (previousBranch?.company_id && previousBranch.company_id !== data.company_id) {
      const previousOwnerCompany = await fetchDirectoryCompanyWithBranches(supabase, previousBranch.company_id)
      revalidateDirectoryPaths(previousOwnerCompany)
    }
    return { success: true }
  } catch (error) {
    return { error: error.message }
  }
}

export async function adminDeleteDirectoryBranch(branchId) {
  try {
    const { supabase } = await checkAdminWithServiceRole()
    const { data: previousBranch } = await supabase
      .from('company_directory_branches')
      .select('company_id')
      .eq('id', branchId)
      .maybeSingle()
    const previousCompany = previousBranch?.company_id
      ? await fetchDirectoryCompanyWithBranches(supabase, previousBranch.company_id)
      : null

    const { data, error } = await supabase
      .from('company_directory_branches')
      .delete()
      .eq('id', branchId)
      .select('id, company_id')
      .single()

    if (error) throw error
    if (!data) throw new Error('Nie znaleziono oddzialu firmy')
    const company = await fetchDirectoryCompanyWithBranches(supabase, previousBranch?.company_id || data.company_id)
    revalidateDirectoryPaths(previousCompany)
    revalidateDirectoryPaths(company)
    return { success: true }
  } catch (error) {
    return { error: error.message }
  }
}

// ─── Marketplace Company Branches CRUD ───────────────────────────────────────

export async function adminCreateCompanyBranch(companyId, formData) {
  try {
    const { supabase } = await checkAdmin()
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
      is_main: formData.get('is_main') === 'true',
      source: 'admin',
    }

    const { data, error } = await supabase
      .from('company_branches')
      .insert([rawData])
      .select()
      .single()

    if (error) throw error
    revalidatePath('/admin/companies')
    revalidatePath(`/admin/companies/${companyId}/edit`)
    revalidateTag('listings')
    return { success: true, id: data.id }
  } catch (error) {
    return { error: error.message }
  }
}

export async function adminUpdateCompanyBranch(branchId, formData) {
  try {
    const { supabase } = await checkAdmin()
    const address = formData.get('address')
    const city = formData.get('city')
    const sanitized = sanitizeAddress(address, city)
    const coords = await geocodeAddress(sanitized)

    const rawData = {
      name: formData.get('branch_name') || null,
      city: city,
      zip_code: formData.get('postal_code') || null,
      address: address,
      lat: coords?.lat || null,
      lng: coords?.lng || null,
      phone: formData.get('phone') || null,
      email: formData.get('email') || null,
      is_main: formData.get('is_main') === 'true',
    }

    const { data, error } = await supabase
      .from('company_branches')
      .update(rawData)
      .eq('id', branchId)
      .select('id, company_id')
      .single()

    if (error) throw error
    revalidatePath('/admin/companies')
    if (data?.company_id) revalidatePath(`/admin/companies/${data.company_id}/edit`)
    revalidateTag('listings')
    return { success: true }
  } catch (error) {
    return { error: error.message }
  }
}

export async function adminDeleteCompanyBranch(branchId) {
  try {
    const { supabase } = await checkAdmin()

    const { data, error } = await supabase
      .from('company_branches')
      .delete()
      .eq('id', branchId)
      .select('id, company_id')
      .single()

    if (error) throw error
    if (!data) throw new Error('Nie znaleziono oddziału')
    revalidatePath('/admin/companies')
    revalidatePath(`/admin/companies/${data.company_id}/edit`)
    revalidateTag('listings')
    return { success: true }
  } catch (error) {
    return { error: error.message }
  }
}

// ─── Directory ↔ Marketplace Linking ─────────────────────────────────────────

export async function adminLinkDirectoryCompany(directoryCompanyId, linkedCompanyId) {
  try {
    const { supabase } = await checkAdminWithServiceRole()

    const { error } = await supabase
      .from('company_directory')
      .update({ linked_company_id: linkedCompanyId || null })
      .eq('id', directoryCompanyId)

    if (error) throw error
    revalidatePath('/admin/directory')
    revalidatePath(`/admin/directory/${directoryCompanyId}/edit`)
    return { success: true }
  } catch (error) {
    return { error: error.message }
  }
}
