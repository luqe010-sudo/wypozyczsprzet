'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import cloudinary from '@/lib/cloudinary'
import { geocodeAddress } from '@/lib/geocoding'
import { sanitizeAddress } from '@/lib/utils'

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
    revalidateTag('listings')
    return { success: true }
  } catch (error) {
    return { error: error.message }
  }
}

export async function adminDeleteRecord(table, id) {
  try {
    const { supabase } = await checkAdmin()
    const ALLOWED_TABLES = ['companies', 'equipment', 'company_claims', 'profiles']
    if (!ALLOWED_TABLES.includes(table)) {
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
    const address = formData.get('address')
    const city = formData.get('city')
    const sanitized = sanitizeAddress(address, city)
    const coords = await geocodeAddress(sanitized)

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
