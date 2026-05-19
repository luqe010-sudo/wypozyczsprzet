'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'

const CLAIM_ACTIONS = new Set(['approve', 'reject'])

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

export async function submitClaim(companyId, { email, phone, message }) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Musisz być zalogowany, aby zgłosić przejęcie firmy.' }
    }

    // Check if there's already a pending claim for this company by this user
    const { data: existingClaim } = await supabase
      .from('company_claims')
      .select('id')
      .eq('company_id', companyId)
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single()

    if (existingClaim) {
      return { error: 'Masz już aktywne zgłoszenie dla tej firmy. Poczekaj na weryfikację.' }
    }

    const { error } = await supabase
      .from('company_claims')
      .insert([{
        company_id: companyId,
        user_id: user.id,
        email,
        phone,
        message,
        status: 'pending'
      }])

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error submitting claim:', error)
    return { error: error.message }
  }
}

export async function getPendingClaims() {
  try {
    const { supabase } = await checkAdmin()
    
    const { data, error } = await supabase
      .from('company_claims')
      .select(`
        *,
        companies (name, city)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data }
  } catch (error) {
    return { error: error.message }
  }
}

export async function handleClaimAction(claimId, action, companyId, userId) {
  try {
    if (!CLAIM_ACTIONS.has(action)) {
      throw new Error('Invalid claim action')
    }

    const { supabase } = await checkAdmin()

    if (action === 'approve') {
      // 1. Update company owner
      const { error: updateError } = await supabase
        .from('companies')
        .update({ owner_user_id: userId })
        .eq('id', companyId)

      if (updateError) throw updateError

      // 2. Mark claim as approved
      const { error: claimError } = await supabase
        .from('company_claims')
        .update({ status: 'approved' })
        .eq('id', claimId)

      if (claimError) throw claimError

      // 3. Reject other pending claims for the same company
      await supabase
        .from('company_claims')
        .update({ status: 'rejected' })
        .eq('company_id', companyId)
        .eq('status', 'pending')
        .neq('id', claimId)

    } else if (action === 'reject') {
      const { error } = await supabase
        .from('company_claims')
        .update({ status: 'rejected' })
        .eq('id', claimId)

      if (error) throw error
    }

    revalidatePath('/admin/claims')
    revalidatePath('/dashboard')
    revalidateTag('listings')
    return { success: true }
  } catch (error) {
    return { error: error.message }
  }
}
