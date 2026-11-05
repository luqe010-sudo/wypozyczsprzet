'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { SITE_URL } from '@/lib/site'

export async function login(formData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function forgotPassword(formData) {
  const supabase = await createClient()
  const email = formData.get('email')
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || SITE_URL}/auth/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: 'Link do resetowania hasła został wysłany na Twój email.' }
}

export async function updatePassword(formData) {
  const supabase = await createClient()
  const password = formData.get('password')
  
  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    return { error: error.message }
  }

  return { success: 'Hasło zostało pomyślnie zmienione.' }
}
