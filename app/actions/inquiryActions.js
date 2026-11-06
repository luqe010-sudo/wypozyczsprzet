'use server';

import { createHash } from 'crypto';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { after } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { adminEmail, sendEmail } from '@/lib/email';
import { getCitySlug, getSeoSlugByDbKey, SEO_CATEGORIES } from '@/lib/categories';
import { CONTACT_EMAIL, SITE_URL } from '@/lib/site';
import { isRentalDate, todayInPoland } from '@/lib/rentalDates';

const MAX_INQUIRIES_PER_HOUR = 5;
const STATUSES = new Set(['new', 'contacted', 'closed', 'spam']);
const UUID = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;
const SEND_ERROR = 'Nie udało się wysłać zapytania. Spróbuj ponownie albo zadzwoń.';

function clean(value, maxLength) {
  return String(value ?? '').trim().slice(0, maxLength);
}

async function hashedIp() {
  const headerList = await headers();
  const forwarded = headerList.get('x-vercel-forwarded-for') || headerList.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || headerList.get('x-real-ip') || 'unknown';
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
  if (!(formData instanceof FormData)) return { error: SEND_ERROR };
  // A filled honeypot means a bot. It gets a normal-looking answer and nothing is stored.
  if (clean(formData.get('website'), 200)) return { success: true };

  const customerName = clean(formData.get('customer_name'), 100);
  const customerPhone = clean(formData.get('customer_phone'), 30);
  const customerEmail = clean(formData.get('customer_email'), 150);
  const equipmentId = clean(formData.get('equipment_id'), 40);
  const from = String(formData.get('date_from') || '').trim();
  const to = String(formData.get('date_to') || '').trim();
  const today = todayInPoland();

  if (!UUID.test(equipmentId)) return { error: 'To ogłoszenie nie jest już aktywne.' };
  if (!customerName) return { error: 'Podaj imię lub nazwę firmy.' };
  const phoneDigits = customerPhone.replace(/\D/g, '');
  if (!/^\+?[\d\s().-]+$/.test(customerPhone) || phoneDigits.length < 9 || phoneDigits.length > 15) {
    return { error: 'Podaj poprawny numer telefonu.' };
  }
  if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) return { error: 'Podaj poprawny adres e-mail.' };
  if (formData.get('consent') !== 'on') return { error: 'Zaznacz zgodę na przekazanie danych wynajmującemu.' };
  if ((from && (!isRentalDate(from) || from < today)) || (to && (!isRentalDate(to) || to < (from || today)))) {
    return { error: 'Podaj poprawny termin wynajmu.' };
  }

  const admin = createSupabaseAdminClient();
  if (!admin) return { error: 'Formularz jest chwilowo niedostępny. Skorzystaj z telefonu.' };

  const ipHash = await hashedIp();
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error: limitError } = await admin
    .from('inquiries')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', hourAgo);
  if (limitError) return { error: SEND_ERROR };
  if ((count || 0) >= MAX_INQUIRIES_PER_HOUR) {
    return { error: 'Wysłano zbyt wiele zapytań. Spróbuj ponownie za godzinę albo zadzwoń.' };
  }

  const { data: listing, error: listingError } = await admin
    .from('equipment')
    .select('id, name, slug, category, company_id, equipment_categories (slug), companies (city, email, status), company_branches (company_id, city, email)')
    .eq('id', equipmentId)
    .in('status', ['active', 'incomplete'])
    .maybeSingle();
  if (listingError) return { error: SEND_ERROR };
  if (!listing?.companies || listing.companies.status === 'pending') return { error: 'To ogłoszenie nie jest już aktywne.' };

  const inquiry = {
    equipment_id: listing.id,
    company_id: listing.company_id,
    equipment_name: listing.name,
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_email: customerEmail || null,
    message: clean(formData.get('message'), 1500) || null,
    date_from: from || null,
    date_to: to || null,
    job_location: clean(formData.get('job_location'), 150) || null,
    ip_hash: ipHash,
  };

  const { data: saved, error: insertError } = await admin.from('inquiries').insert(inquiry).select('id').single();
  if (insertError) {
    console.error('[inquiry] insert failed', insertError.code);
    return { error: SEND_ERROR };
  }

  revalidatePath('/dashboard/inquiries');
  revalidatePath('/admin/inquiries');

  after(async () => {
    const branch = listing.company_branches?.company_id === listing.company_id ? listing.company_branches : null;
    const city = branch?.city || listing.companies.city;
    const categorySlug = listing.equipment_categories?.slug;
    const category = Object.hasOwn(SEO_CATEGORIES, categorySlug) ? categorySlug : getSeoSlugByDbKey(listing.category);
    const listingUrl = `${SITE_URL}/${category}/${getCitySlug(city)}/${listing.slug}`;
    const emailData = { inquiry, listingName: listing.name, listingUrl };
    const replyTo = customerEmail || undefined;
    const [adminResult, firmResult] = await Promise.all([sendEmail({
      to: adminEmail(),
      subject: `Zapytanie: ${listing.name}`,
      text: inquiryText({ ...emailData, forFirm: false }),
      replyTo,
    }), sendEmail({
      to: branch?.email || listing.companies.email,
      subject: `Zapytanie o wynajem: ${listing.name}`,
      text: inquiryText({ ...emailData, forFirm: true }),
      replyTo,
    })]);

    const notified = {};
    if (adminResult.sent) notified.admin_notified_at = new Date().toISOString();
    if (firmResult.sent) notified.firm_notified_at = new Date().toISOString();

    if (Object.keys(notified).length > 0) {
      const { error } = await admin.from('inquiries').update(notified).eq('id', saved.id);
      if (error) console.error('[inquiry] notification update failed', error.code);
    }
  });

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
