import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { emailConfigured, sendEmail } from '@/lib/email';
import {
  CONFIRMATION_GRACE_DAYS, CONFIRMATION_REMINDER_DAYS, FEATURED_DAYS, FEATURED_PRICE_PLN, FEATURED_REMINDER_DAYS,
  INQUIRY_RETENTION_MONTHS, SITE_URL,
} from '@/lib/site';

const DAY_MS = 24 * 60 * 60 * 1000;
const daysAgo = (days) => new Date(Date.now() - days * DAY_MS).toISOString();

/**
 * Daily job: reminds owners to confirm their listings, hides those left unconfirmed
 * and anonymises old inquiries. Listings without an owner are never hidden here: they
 * have nobody to confirm them. Hiding also needs working mail, or owners would get no warning.
 */
export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: 'Not configured' }, { status: 500 });

  const result = { reminded: 0, hidden: 0, anonymised: 0, featuredExpired: 0, featuredReminded: 0 };

  if (emailConfigured()) {
    const { data: owned, error } = await admin
      .from('equipment')
      .select('id, name, created_at, last_confirmed_at, reminder_sent_at, company_id, companies!inner (owner_user_id, email)')
      .eq('status', 'active')
      .not('companies.owner_user_id', 'is', null);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const reminderCutoff = daysAgo(CONFIRMATION_REMINDER_DAYS);
    const graceCutoff = daysAgo(CONFIRMATION_GRACE_DAYS);

    for (const listing of owned) {
      const lastConfirmed = listing.last_confirmed_at || listing.created_at;
      if (lastConfirmed >= reminderCutoff) continue;

      // Reminded and still unconfirmed after the grace period: hide until the owner confirms.
      if (listing.reminder_sent_at && listing.reminder_sent_at >= lastConfirmed && listing.reminder_sent_at < graceCutoff) {
        await admin.from('equipment').update({ status: 'stale' }).eq('id', listing.id);
        result.hidden += 1;
        continue;
      }

      if (!listing.reminder_sent_at || listing.reminder_sent_at < lastConfirmed) {
        const { data: owner } = await admin.auth.admin.getUserById(listing.companies.owner_user_id);
        const to = owner?.user?.email || listing.companies.email;
        const sent = await sendEmail({
          to,
          subject: `Czy oferta „${listing.name}” jest aktualna?`,
          text: `Dzień dobry,\n\nprosimy o potwierdzenie, że ogłoszenie „${listing.name}” jest aktualne:\n${SITE_URL}/dashboard/company/${listing.company_id}\n\nBez potwierdzenia ogłoszenie zostanie ukryte za ${CONFIRMATION_GRACE_DAYS} dni. Możesz je przywrócić w każdej chwili.`,
        });
        if (sent.sent) {
          await admin.from('equipment').update({ reminder_sent_at: new Date().toISOString() }).eq('id', listing.id);
          result.reminded += 1;
        }
      }
    }
  }

  // Paid featuring ends on its own. Listings featured by hand have no end date and stay.
  const { data: expired, error: expireError } = await admin
    .from('equipment')
    .update({ priority: 1, featured_until: null })
    .gt('priority', 1)
    .lt('featured_until', new Date().toISOString())
    .select('id');
  if (expireError) return NextResponse.json({ error: expireError.message }, { status: 500 });
  result.featuredExpired = expired.length;

  // The job runs once a day, so each period falls into this one-day window exactly once.
  if (emailConfigured()) {
    const { data: ending, error: endingError } = await admin
      .from('equipment')
      .select('id, name, featured_until, company_id, companies!inner (owner_user_id, email)')
      .gt('priority', 1)
      .gte('featured_until', new Date(Date.now() + (FEATURED_REMINDER_DAYS - 1) * DAY_MS).toISOString())
      .lt('featured_until', new Date(Date.now() + FEATURED_REMINDER_DAYS * DAY_MS).toISOString());
    if (endingError) return NextResponse.json({ error: endingError.message }, { status: 500 });

    for (const listing of ending) {
      const { data: owner } = listing.companies.owner_user_id
        ? await admin.auth.admin.getUserById(listing.companies.owner_user_id)
        : { data: null };
      const until = new Date(listing.featured_until).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Warsaw' });
      const sent = await sendEmail({
        to: owner?.user?.email || listing.companies.email,
        subject: `Wyróżnienie „${listing.name}” kończy się ${until}`,
        text: `Dzień dobry,

wyróżnienie ogłoszenia „${listing.name}” kończy się ${until}. Potem ogłoszenie wróci na zwykłe miejsce w wynikach.

Możesz je przedłużyć o ${FEATURED_DAYS} dni za ${FEATURED_PRICE_PLN} zł przyciskiem „Przedłuż wyróżnienie” w panelu:
${SITE_URL}/dashboard/ogloszenia`,
      });
      if (sent.sent) result.featuredReminded += 1;
    }
  }

  const retentionCutoff = new Date();
  retentionCutoff.setMonth(retentionCutoff.getMonth() - INQUIRY_RETENTION_MONTHS);
  const { data: anonymised, error: anonymiseError } = await admin
    .from('inquiries')
    .update({ customer_name: 'usunięto', customer_phone: 'usunięto', customer_email: null, message: null, job_location: null, ip_hash: null })
    .lt('created_at', retentionCutoff.toISOString())
    .neq('customer_name', 'usunięto')
    .select('id');
  if (anonymiseError) return NextResponse.json({ error: anonymiseError.message }, { status: 500 });
  result.anonymised = anonymised.length;

  if (result.hidden > 0 || result.featuredExpired > 0) revalidateTag('listings', 'max');
  return NextResponse.json(result);
}
