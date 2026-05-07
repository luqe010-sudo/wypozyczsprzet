'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import cloudinary from '@/lib/cloudinary'

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

  const imageFile = formData.get('image')
  let imageUrl = ''

  if (imageFile && imageFile.size > 0) {
    try {
      const bytes = await imageFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      const uploadResponse = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({
          folder: 'listings',
        }, (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }).end(buffer)
      })
      
      imageUrl = uploadResponse.secure_url
    } catch (uploadError) {
      console.error('Error uploading to Cloudinary:', uploadError)
    }
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
    image_url: imageUrl,
    promotion: formData.get('promotion') === 'on',
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

  const imageFile = formData.get('image')
  let imageUrl = formData.get('current_image_url')

  if (imageFile && imageFile.size > 0) {
    try {
      const bytes = await imageFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      const uploadResponse = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({
          folder: 'listings',
        }, (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }).end(buffer)
      })
      
      imageUrl = uploadResponse.secure_url
    } catch (uploadError) {
      console.error('Error uploading to Cloudinary:', uploadError)
    }
  }

  const rawData = {
    category: formData.get('category'),
    name: formData.get('name'),
    price_from: formData.get('price_from'),
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
