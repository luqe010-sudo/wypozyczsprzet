'use server';

import { createHash } from 'crypto';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { adminEmail, sendEmail } from '@/lib/email';
import { getCitySlug } from '@/lib/categories';
import { CONTACT_EMAIL, SITE_URL } from '@/lib/site';

const MAX_INQUIRIES_PER_HOUR = 5;
const STATUSES = new Set(['new', 'contacted', 'closed', 'spam']);

function clean(value, maxLength) {
  return String(value ?? '').trim().slice(0, maxLength);
}

function validDate(value) {
  const raw = String(value ?? '');
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : null;
}

async function hashedIp() {
  const headerList = await headers();
  const ip = headerList.get('x-forwarded-for')?.split(',')[0]?.trim() || headerList.get('x-real-ip') || 'unknown';
  const salt = process.env.IP_HASH_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex');
}

function inquiryText({ inquiry, listingName, listingUrl, forFirm }) {
  const period = [inquiry.date_from, inquiry.date_to].filter(Boolean).join(' – ');
  return [
    forFirm ? 'Dzień dobry, klient pyta o Państwa sprzęt przez wypozycz.online.' : 'Nowe zapytanie na wypozycz.online.',
    '',
    `Sprzęt: ${listingName}`,
    `Ogłoszenie: ${listingUrl}`,
    '',
    `Klient: ${inquiry.customer_name}`,
    `Telefon: ${inquiry.customer_phone}`,
    inquiry.customer_email ? `E-mail: ${inquiry.customer_email}` : null,
    period ? `Termin: ${period}` : null,
    inquiry.job_location ? `Miejsce pracy: ${inquiry.job_location}` : null,
    inquiry.message ? `\nWiadomość:\n${inquiry.message}` : null,
    '',
    forFirm
      ? `Serwis nie pobiera prowizji. Prosimy o bezpośredni kontakt z klientem.\n\nChcesz zarządzać tym ogłoszeniem? Przejmij profil firmy na stronie ogłoszenia.\nJeśli dane są błędne albo nie chcesz być w serwisie, napisz na ${CONTACT_EMAIL}, a usuniemy ogłoszenie.`
      : null,
  ].filter((line) => line !== null).join('\n');
}

export async function submitInquiry(formData) {
  // A filled honeypot means a bot. It gets a normal-looking answer and nothing is stored.
  if (clean(formData.get('website'), 200)) return { success: true };

  const customerName = clean(formData.get('customer_name'), 100);
  const customerPhone = clean(formData.get('customer_phone'), 30);
  const customerEmail = clean(formData.get('customer_email'), 150);
  const equipmentId = clean(formData.get('equipment_id'), 40);

  if (!customerName) return { error: 'Podaj imię lub nazwę firmy.' };
  if (customerPhone.replace(/\D/g, '').length < 9) return { error: 'Podaj poprawny numer telefonu.' };
  if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) return { error: 'Podaj poprawny adres e-mail.' };
  if (formData.get('consent') !== 'on') return { error: 'Zaznacz zgodę na przekazanie danych wynajmującemu.' };

  const admin = createSupabaseAdminClient();
  if (!admin) return { error: 'Formularz jest chwilowo niedostępny. Skorzystaj z telefonu.' };

  const ipHash = await hashedIp();
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from('inquiries')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', hourAgo);
  if ((count || 0) >= MAX_INQUIRIES_PER_HOUR) {
    return { error: 'Wysłano zbyt wiele zapytań. Spróbuj ponownie za godzinę albo zadzwoń.' };
  }

  const { data: listing, error: listingError } = await admin
    .from('equipment')
    .select('id, name, slug, status, company_id, equipment_categories (slug), companies (name, email), company_branches (city, email)')
    .eq('id', equipmentId)
    .in('status', ['active', 'incomplete'])
    .maybeSingle();
  if (listingError || !listing) return { error: 'To ogłoszenie nie jest już aktywne.' };

  const inquiry = {
    equipment_id: listing.id,
    company_id: listing.company_id,
    equipment_name: listing.name,
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_email: customerEmail || null,
    message: clean(formData.get('message'), 1500) || null,
    date_from: validDate(formData.get('date_from')),
    date_to: validDate(formData.get('date_to')),
    job_location: clean(formData.get('job_location'), 150) || null,
    ip_hash: ipHash,
  };

  const { data: saved, error: insertError } = await admin.from('inquiries').insert(inquiry).select('id').single();
  if (insertError) {
    console.error('[inquiry] insert failed', insertError);
    return { error: 'Nie udało się wysłać zapytania. Spróbuj ponownie albo zadzwoń.' };
  }

  const listingUrl = `${SITE_URL}/${listing.equipment_categories?.slug || 'narzedzia'}/${getCitySlug(listing.company_branches?.city)}/${listing.slug}`;
  const firmEmail = listing.company_branches?.email || listing.companies?.email;
  const notified = {};

  const adminResult = await sendEmail({
    to: adminEmail(),
    subject: `Zapytanie: ${listing.name}`,
    text: inquiryText({ inquiry, listingName: listing.name, listingUrl, forFirm: false }),
    replyTo: customerEmail || undefined,
  });
  if (adminResult.sent) notified.admin_notified_at = new Date().toISOString();

  if (firmEmail) {
    const firmResult = await sendEmail({
      to: firmEmail,
      subject: `Zapytanie o wynajem: ${listing.name}`,
      text: inquiryText({ inquiry, listingName: listing.name, listingUrl, forFirm: true }),
      replyTo: customerEmail || undefined,
    });
    if (firmResult.sent) notified.firm_notified_at = new Date().toISOString();
  }

  if (Object.keys(notified).length > 0) {
    await admin.from('inquiries').update(notified).eq('id', saved.id);
  }

  return { success: true };
}

/** Owners change status on their own inquiries, admins on all; RLS decides which row is allowed. */
export async function updateInquiryStatus(id, status) {
  if (!STATUSES.has(status)) return { error: 'Nieprawidłowy status.' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Zaloguj się.' };

  const { data, error } = await supabase.from('inquiries').update({ status }).eq('id', id).select('id');
  if (error) return { error: error.message };
  if (!data || data.length === 0) return { error: 'Nie znaleziono zapytania.' };

  revalidatePath('/dashboard/inquiries');
  revalidatePath('/admin/inquiries');
  return { success: true };
}
