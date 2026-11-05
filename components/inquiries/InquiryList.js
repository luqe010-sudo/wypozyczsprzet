'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { updateInquiryStatus } from '@/app/actions/inquiryActions';

const STATUS_LABELS = {
  new: 'Nowe',
  contacted: 'Po kontakcie',
  closed: 'Zakończone',
  spam: 'Spam',
};

const formatDateTime = (value) => new Date(value).toLocaleString('pl-PL', { dateStyle: 'medium', timeStyle: 'short' });

export default function InquiryList({ inquiries, showCompany = false }) {
  const [items, setItems] = useState(inquiries);

  async function changeStatus(id, status) {
    const previous = items;
    setItems((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
    const result = await updateInquiryStatus(id, status);
    if (result?.error) {
      setItems(previous);
      toast.error(result.error);
    }
  }

  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-600 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-400">
        Nie ma jeszcze żadnych zapytań.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white">{item.equipment_name || 'Ogłoszenie usunięte'}</p>
              <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                {formatDateTime(item.created_at)}
                {showCompany && item.companies?.name ? ` · ${item.companies.name}` : ''}
              </p>
            </div>
            <div>
              <label htmlFor={`status-${item.id}`} className="sr-only">Status zapytania</label>
              <select
                id={`status-${item.id}`}
                value={item.status}
                onChange={(event) => changeStatus(item.id, event.target.value)}
                className="h-9 rounded-lg border border-gray-300 bg-white px-2 text-sm text-gray-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              >
                {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
          </div>

          <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
            <div className="flex gap-2"><dt className="text-gray-600 dark:text-gray-400">Klient:</dt><dd className="font-medium text-gray-900 dark:text-white">{item.customer_name}</dd></div>
            <div className="flex gap-2"><dt className="text-gray-600 dark:text-gray-400">Telefon:</dt><dd><a className="font-medium text-blue-600 underline dark:text-blue-400" href={`tel:${item.customer_phone.replace(/\s/g, '')}`}>{item.customer_phone}</a></dd></div>
            {item.customer_email && <div className="flex gap-2"><dt className="text-gray-600 dark:text-gray-400">E-mail:</dt><dd><a className="break-all font-medium text-blue-600 underline dark:text-blue-400" href={`mailto:${item.customer_email}`}>{item.customer_email}</a></dd></div>}
            {(item.date_from || item.date_to) && <div className="flex gap-2"><dt className="text-gray-600 dark:text-gray-400">Termin:</dt><dd className="text-gray-900 dark:text-white">{[item.date_from, item.date_to].filter(Boolean).join(' – ')}</dd></div>}
            {item.job_location && <div className="flex gap-2"><dt className="text-gray-600 dark:text-gray-400">Miejsce:</dt><dd className="text-gray-900 dark:text-white">{item.job_location}</dd></div>}
          </dl>
          {item.message && <p className="mt-3 whitespace-pre-line rounded-lg bg-gray-50 p-3 text-sm text-gray-800 dark:bg-slate-900 dark:text-gray-200">{item.message}</p>}
          {showCompany && (
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              {item.firm_notified_at ? 'Firma powiadomiona e-mailem.' : 'Firma nie została powiadomiona e-mailem: przekaż zapytanie ręcznie.'}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
