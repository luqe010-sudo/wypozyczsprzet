'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Star } from 'lucide-react';
import { confirmEquipment, requestFeatured, setEquipmentPaused } from '@/app/dashboard/equipment/actions';
import { FEATURED_DAYS, FEATURED_PRICE_PLN, featuredPriceText } from '@/lib/site';

const buttonClass = 'min-h-11 rounded-lg border border-border px-2.5 text-xs font-semibold text-foreground hover:bg-background disabled:opacity-60';

export default function EquipmentRowActions({ id, companyId, status, canRequestFeatured = false, featured = false }) {
  const [busy, setBusy] = useState(false);

  async function run(action, successMessage) {
    if (busy) return;
    setBusy(true);
    try {
      const result = await action();
      if (result?.error) toast.error(result.error);
      else toast.success(successMessage);
    } catch {
      toast.error('Nie udało się zmienić ogłoszenia. Spróbuj ponownie.');
    } finally {
      setBusy(false);
    }
  }

  const published = status === 'active' || status === 'incomplete';

  function orderFeatured() {
    const question = `${featured ? 'Przedłużyć' : 'Zamówić'} wyróżnienie ogłoszenia na ${FEATURED_DAYS} dni za ${featuredPriceText()}?

Wyślemy fakturę z danymi do płatności. Wyróżnienie włączymy po zaksięgowaniu wpłaty.`;
    if (!window.confirm(question)) return;
    run(() => requestFeatured(id, companyId), 'Zamówienie wysłane. Fakturę dostaniesz mailem.');
  }

  return (
    <div className="flex flex-wrap gap-2">
      {(published || status === 'stale') && (
        <button type="button" disabled={busy} className={buttonClass} onClick={() => run(() => confirmEquipment(id, companyId), 'Potwierdzono aktualność')}>
          Potwierdź aktualność
        </button>
      )}
      {published && (
        <button type="button" disabled={busy} className={buttonClass} onClick={() => run(() => setEquipmentPaused(id, companyId, true), 'Ogłoszenie wstrzymane')}>
          Wstrzymaj
        </button>
      )}
      {published && canRequestFeatured && (
        <button type="button" disabled={busy} className={`${buttonClass} inline-flex items-center gap-1.5 border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-200`} onClick={orderFeatured}>
          <Star size={14} aria-hidden="true" /> {featured ? 'Przedłuż wyróżnienie' : `Wyróżnij za ${FEATURED_PRICE_PLN} zł`}
        </button>
      )}
      {status === 'inactive' && (
        <button type="button" disabled={busy} className={buttonClass} onClick={() => run(() => setEquipmentPaused(id, companyId, false), 'Ogłoszenie wznowione')}>
          Wznów
        </button>
      )}
    </div>
  );
}
