'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ChevronDown } from 'lucide-react';
import { submitInquiry } from '@/app/actions/inquiryActions';
import { trackEvent } from '../../lib/gtag';
import { rentalDates, todayInPoland } from '../../lib/rentalDates';

const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 dark:border-slate-600 dark:bg-slate-900 dark:text-white md:text-sm';
const labelClass = 'mb-1 block text-sm font-medium text-slate-800 dark:text-slate-200';

export default function InquiryForm({ equipmentId, equipmentName, isClaimed }) {
  const [state, setState] = useState({ status: 'idle', error: '' });
  const sending = useRef(false);
  const fromInput = useRef(null);
  const toInput = useRef(null);
  const confirmation = useRef(null);
  const today = todayInPoland();

  useEffect(() => {
    if (!fromInput.current || !toInput.current) return;
    const params = new URLSearchParams(window.location.search);
    const from = params.get('from');
    const to = params.get('to');
    const dates = rentalDates({ from: from >= today ? from : '', to: to >= today ? to : '' });
    fromInput.current.value = dates.from;
    toInput.current.value = dates.to;
    toInput.current.min = dates.from || today;
  }, [equipmentId, today]);

  useEffect(() => {
    if (state.status !== 'sent') return;
    confirmation.current?.focus({ preventScroll: true });
    confirmation.current?.scrollIntoView({ block: 'center' });
  }, [state.status]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (sending.current) return;
    sending.current = true;
    setState({ status: 'sending', error: '' });

    const formData = new FormData(event.currentTarget);
    formData.set('equipment_id', equipmentId);

    try {
      const result = await submitInquiry(formData);
      if (!result?.success) {
        setState({ status: 'idle', error: result?.error || 'Nie udało się wysłać zapytania. Spróbuj ponownie.' });
        return;
      }
      trackEvent('send_inquiry', { listing_id: equipmentId, listing_name: equipmentName });
      setState({ status: 'sent', error: '' });
    } catch {
      setState({ status: 'idle', error: 'Nie udało się wysłać zapytania. Spróbuj ponownie albo zadzwoń.' });
    } finally {
      sending.current = false;
    }
  }

  if (state.status === 'sent') {
    return (
      <div ref={confirmation} role="status" tabIndex={-1} className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
        <p className="flex items-center gap-2 font-semibold">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          Zapytanie zapisane
        </p>
        <p className="mt-1">{isClaimed ? 'Wynajmujący zobaczy je w swoim panelu. Może odpowiedzieć na podany numer telefonu lub adres e-mail.' : 'Obsługa serwisu ma dostęp do zapytania. Jeśli zależy Ci na szybkim kontakcie, skorzystaj z danych wynajmującego podanych w ogłoszeniu.'}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} aria-busy={state.status === 'sending'} className="space-y-3">
      {/* Honeypot: hidden from people, filled in by bots. */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="inquiry-website">Strona internetowa</label>
        <input id="inquiry-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label htmlFor="inquiry-name" className={labelClass}>Imię lub firma</label>
        <input id="inquiry-name" name="customer_name" required maxLength={100} autoComplete="name" className={inputClass} />
      </div>
      <div>
        <label htmlFor="inquiry-phone" className={labelClass}>Telefon</label>
        <input id="inquiry-phone" name="customer_phone" type="tel" required maxLength={30} autoComplete="tel" inputMode="tel" className={inputClass} />
      </div>
      <fieldset>
        <legend className={labelClass}>Termin wynajmu <span className="font-normal text-slate-600 dark:text-slate-400">(opcjonalnie)</span></legend>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="min-w-0">
            <label htmlFor="inquiry-from" className={labelClass}>Od</label>
            <input ref={fromInput} id="inquiry-from" name="date_from" type="date" min={today} onInput={(event) => { toInput.current.min = event.currentTarget.value || today; }} className={`${inputClass} min-w-0 scroll-mt-24 px-2`} />
          </div>
          <div className="min-w-0">
            <label htmlFor="inquiry-to" className={labelClass}>Do</label>
            <input ref={toInput} id="inquiry-to" name="date_to" type="date" min={today} className={`${inputClass} min-w-0 px-2`} />
          </div>
        </div>
      </fieldset>

      <details className="group rounded-lg bg-background px-3">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold [&::-webkit-details-marker]:hidden">
          Dodaj e-mail, miejsce pracy lub wiadomość
          <ChevronDown size={17} className="shrink-0 group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="space-y-3 pb-3">
          <div>
            <label htmlFor="inquiry-email" className={labelClass}>E-mail</label>
            <input id="inquiry-email" name="customer_email" type="email" maxLength={150} autoComplete="email" onInvalid={(event) => { event.currentTarget.closest('details').open = true; }} className={inputClass} />
          </div>
          <div>
            <label htmlFor="inquiry-location" className={labelClass}>Miejsce pracy</label>
            <input id="inquiry-location" name="job_location" maxLength={150} placeholder="np. Wrocław, Krzyki" className={inputClass} />
          </div>
          <div>
            <label htmlFor="inquiry-message" className={labelClass}>Wiadomość</label>
            <textarea id="inquiry-message" name="message" rows={3} maxLength={1500} className={inputClass} />
          </div>
        </div>
      </details>

      <label className="flex items-start gap-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
        <input name="consent" type="checkbox" required className="mt-0.5 h-4 w-4 flex-shrink-0 accent-brand-600" />
        <span>
          Zgadzam się na przekazanie moich danych wynajmującemu w celu odpowiedzi na zapytanie.
          Szczegóły w <Link href="/polityka-prywatnosci" className="underline">polityce prywatności</Link>.
        </span>
      </label>

      {state.error && <p role="alert" className="text-sm text-red-700 dark:text-red-400">{state.error}</p>}

      <button type="submit" disabled={state.status === 'sending'} className="market-action w-full">
        {state.status === 'sending' ? 'Wysyłanie…' : 'Wyślij zapytanie'}
      </button>
    </form>
  );
}
