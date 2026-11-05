import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { emailConfigured, sendEmail } from '@/lib/email';
import { CONFIRMATION_GRACE_DAYS, CONFIRMATION_REMINDER_DAYS, INQUIRY_RETENTION_MONTHS, SITE_URL } from '@/lib/site';

const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

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

  const result = { reminded: 0, hidden: 0, anonymised: 0 };

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

  if (result.hidden > 0) revalidateTag('listings', 'max');
  return NextResponse.json(result);
}
