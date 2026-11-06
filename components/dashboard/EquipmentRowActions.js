'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { confirmEquipment, setEquipmentPaused } from '@/app/dashboard/equipment/actions';

const buttonClass = 'min-h-11 rounded-lg border border-border px-2.5 text-xs font-semibold text-foreground hover:bg-background disabled:opacity-60';

export default function EquipmentRowActions({ id, companyId, status }) {
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
      {status === 'inactive' && (
        <button type="button" disabled={busy} className={buttonClass} onClick={() => run(() => setEquipmentPaused(id, companyId, false), 'Ogłoszenie wznowione')}>
          Wznów
        </button>
      )}
    </div>
  );
}
