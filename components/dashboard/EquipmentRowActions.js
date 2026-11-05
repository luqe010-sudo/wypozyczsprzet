'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { confirmEquipment, setEquipmentPaused } from '@/app/dashboard/equipment/actions';

const buttonClass = 'min-h-[36px] rounded-lg border border-gray-300 px-3 text-xs font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50 dark:border-slate-600 dark:text-gray-200 dark:hover:bg-slate-700';

export default function EquipmentRowActions({ id, companyId, status }) {
  const [busy, setBusy] = useState(false);

  async function run(action, successMessage) {
    setBusy(true);
    const result = await action();
    setBusy(false);
    if (result?.error) toast.error(result.error);
    else toast.success(successMessage);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {(status === 'active' || status === 'stale') && (
        <button type="button" disabled={busy} className={buttonClass} onClick={() => run(() => confirmEquipment(id, companyId), 'Potwierdzono aktualność')}>
          Potwierdź aktualność
        </button>
      )}
      {status === 'active' && (
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
