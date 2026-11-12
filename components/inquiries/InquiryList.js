'use client';

import { useState } from 'react';
import { Inbox, Mail, Phone } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { updateInquiryStatus } from '@/app/actions/inquiryActions';

const STATUS_LABELS = {
  new: 'Nowe',
  contacted: 'Po kontakcie',
  closed: 'Zakończone',
  spam: 'Spam',
};

const dateTime = new Intl.DateTimeFormat('pl-PL', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Warsaw' });
const dateOnly = new Intl.DateTimeFormat('pl-PL', { dateStyle: 'medium', timeZone: 'Europe/Warsaw' });
const contactClass = 'inline-flex min-h-11 max-w-full items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-semibold hover:border-amber-400';

function InquiryStatus({ id, status }) {
  const [pendingStatus, setPendingStatus] = useState('');

  async function changeStatus(value) {
    if (pendingStatus || value === status) return;
    setPendingStatus(value);
    try {
      const result = await updateInquiryStatus(id, value);
      if (result?.error) toast.error(result.error);
      else toast.success('Zapisano status zapytania.');
    } catch {
      toast.error('Nie udało się zapisać statusu. Spróbuj ponownie.');
    } finally {
      setPendingStatus('');
    }
  }

  return (
    <div>
      <label htmlFor={`status-${id}`} className="sr-only">Status zapytania</label>
      <select id={`status-${id}`} value={pendingStatus || status} disabled={Boolean(pendingStatus)} onChange={(event) => changeStatus(event.target.value)} className="min-h-11 rounded-lg border border-border bg-background px-3 text-sm font-semibold text-foreground disabled:opacity-60">
        {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
    </div>
  );
}

export default function InquiryList({ inquiries = [], showCompany = false, filtered = false }) {
  if (!inquiries?.length) {
    return (
      <div className="listing-panel text-center">
        <Inbox size={30} className="mx-auto text-muted" aria-hidden="true" />
        <p className="mt-2 font-bold">{filtered ? 'Brak zapytań o wybranym statusie' : 'Nie ma jeszcze żadnych zapytań'}</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {inquiries.map((item) => {
        const period = [item.date_from, item.date_to].filter(Boolean).map((date) => dateOnly.format(new Date(date))).join(' – ');
        return (
          <li key={item.id} className="listing-panel">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="break-words font-bold">{item.equipment_name || 'Ogłoszenie usunięte'}</h2>
                <p className="mt-1 text-xs text-muted">
                  <time dateTime={item.created_at}>{dateTime.format(new Date(item.created_at))}</time>
                  {item.companies?.name ? ` · ${item.companies.name}` : ''}
                </p>
              </div>
              <InquiryStatus id={item.id} status={item.status} />
            </div>

            <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              <div className="flex gap-2"><dt className="text-muted">Klient:</dt><dd className="break-words font-semibold">{item.customer_name}</dd></div>
              {period && <div className="flex gap-2"><dt className="text-muted">Termin:</dt><dd>{period}</dd></div>}
              {item.job_location && <div className="flex gap-2"><dt className="text-muted">Miejsce:</dt><dd className="break-words">{item.job_location}</dd></div>}
            </dl>

            {item.message && <p className="mt-3 whitespace-pre-line break-words rounded-lg bg-background p-3 text-sm">{item.message}</p>}
            {(item.customer_phone || item.customer_email) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {item.customer_phone && (
                  <a className={contactClass} href={`tel:${item.customer_phone.replace(/[^+\d]/g, '')}`}>
                    <Phone size={16} aria-hidden="true" className="shrink-0" /> <span className="break-all">{item.customer_phone}</span>
                  </a>
                )}
                {item.customer_email && (
                  <a className={contactClass} href={`mailto:${item.customer_email}`}>
                    <Mail size={16} aria-hidden="true" className="shrink-0" /> <span className="break-all">{item.customer_email}</span>
                  </a>
                )}
              </div>
            )}

            {showCompany && (() => {
              if (item.firm_notified_at) return <p className="mt-2 text-xs text-muted">Firma powiadomiona e-mailem.</p>;
              if (item.status !== 'new') return <p className="mt-2 text-xs text-muted">Firma nie dostała maila o tym zapytaniu.</p>;
              const branches = item.companies?.company_branches || [];
              const contact = branches.find((branch) => branch.is_main && (branch.phone || branch.email)) || branches.find((branch) => branch.phone || branch.email);
              return (
                <p className="mt-2 text-xs text-red-800 dark:text-red-300">
                  Firma nie dostała maila o tym zapytaniu. Przekaż je ręcznie
                  {contact?.phone && <>: <a className="font-semibold underline" href={`tel:${contact.phone.replace(/[^+\d]/g, '')}`}>{contact.phone}</a></>}
                  {contact?.email && <>{contact.phone ? ', ' : ': '}<a className="font-semibold underline" href={`mailto:${contact.email}`}>{contact.email}</a></>}
                  {!contact && item.companies ? ' (firma nie ma telefonu ani e-maila w oddziałach)' : ''}.
                </p>
              );
            })()}
          </li>
        );
      })}
    </ul>
  );
}
