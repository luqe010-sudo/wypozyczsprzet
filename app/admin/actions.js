'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import cloudinary from '@/lib/cloudinary'

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

export async function adminUpdateCompany(id, formData) {
  try {
    const { supabase } = await checkAdmin()
    const rawData = {
      name: formData.get('company_name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      website: formData.get('website'),
      zip_code: formData.get('postal_code'),
      city: formData.get('city'),
      address: formData.get('address'),
    }

    const { error } = await supabase
      .from('companies')
      .update(rawData)
      .eq('id', id)

    if (error) throw error
    revalidatePath('/admin/companies')
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
