import 'server-only';

/**
 * Sends mail through the Resend HTTP API. Without RESEND_API_KEY it reports `skipped`
 * and does nothing: inquiries are stored and visible in the panels either way.
 */
export async function sendEmail({ to, subject, text, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { skipped: true };
  if (!to) return { skipped: true };

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'wypozycz.online <powiadomienia@wypozycz.online>',
        to: Array.isArray(to) ? to : [to],
        subject,
        text,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });

    if (!response.ok) {
      console.error('[email] Resend error', response.status, await response.text());
      return { sent: false };
    }
    return { sent: true };
  } catch (error) {
    console.error('[email] send failed', error);
    return { sent: false };
  }
}

export const emailConfigured = () => Boolean(process.env.RESEND_API_KEY);

export const adminEmail = () =>
  process.env.ADMIN_NOTIFICATION_EMAIL || process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'lukasz.szyp@gmail.com';
