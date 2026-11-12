'use client'

import { useState } from 'react'
import AddressAutocomplete from '@/components/AddressAutocomplete'

export const inputClass = 'block min-h-11 w-full rounded-lg border border-slate-300 bg-card px-3 py-2 text-base text-foreground sm:text-sm dark:border-slate-600'
export const labelClass = 'mb-1 block text-sm font-semibold text-foreground'
const optional = <span className="font-normal text-muted">(opcjonalnie)</span>

/** Address with an optional search helper; every field stays editable when the search finds nothing. */
export function AddressFields({ initial = {}, idPrefix = '' }) {
  const [address, setAddress] = useState(initial.address || '')
  const [city, setCity] = useState(initial.city || '')
  const [postalCode, setPostalCode] = useState(initial.zip_code || '')
  const id = (name) => `${idPrefix}${name}`

  function handleSelect(data) {
    if (data.city) setCity(data.city)
    if (data.postalCode) setPostalCode(data.postalCode)
    const street = data.street || data.fullAddress?.split(',')[0]
    if (street) setAddress(street)
  }

  return (
    <div className="grid gap-4 sm:grid-cols-6">
      <div className="sm:col-span-6">
        <p className={labelClass}>Wyszukaj adres {optional}</p>
        <AddressAutocomplete onSelect={handleSelect} placeholder="Zacznij wpisywać ulicę i miejscowość…" />
        <p className="mt-1 text-xs text-muted">Wybór z listy uzupełni pola poniżej. Możesz je też wpisać ręcznie.</p>
      </div>
      <div className="sm:col-span-6">
        <label htmlFor={id('address')} className={labelClass}>Ulica i numer {optional}</label>
        <input id={id('address')} name="address" value={address} onChange={(event) => setAddress(event.target.value)} autoComplete="street-address" maxLength={200} className={inputClass} />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={id('postal_code')} className={labelClass}>Kod pocztowy</label>
        <input id={id('postal_code')} name="postal_code" value={postalCode} onChange={(event) => setPostalCode(event.target.value)} autoComplete="postal-code" inputMode="numeric" placeholder="00-000" maxLength={12} className={inputClass} />
      </div>
      <div className="sm:col-span-4">
        <label htmlFor={id('city')} className={labelClass}>Miejscowość <span className="text-red-700 dark:text-red-300">*</span></label>
        <input id={id('city')} name="city" required value={city} onChange={(event) => setCity(event.target.value)} autoComplete="address-level2" maxLength={100} className={inputClass} />
      </div>
    </div>
  )
}

/** Company name and contact details shared by the new and edit forms. */
export function CompanyFields({ company = {}, contact = {} }) {
  return (
    <div className="grid gap-4 sm:grid-cols-6">
      <div className="sm:col-span-6">
        <label htmlFor="company_name" className={labelClass}>Nazwa firmy <span className="text-red-700 dark:text-red-300">*</span></label>
        <input id="company_name" name="company_name" required maxLength={160} defaultValue={company.name || ''} autoComplete="organization" className={inputClass} />
      </div>
      <div className="sm:col-span-3">
        <label htmlFor="phone" className={labelClass}>Telefon <span className="text-red-700 dark:text-red-300">*</span></label>
        <input id="phone" name="phone" type="tel" required maxLength={40} defaultValue={contact.phone || ''} autoComplete="tel" className={inputClass} />
        <p className="mt-1 text-xs text-muted">Pokazujemy go na stronach ogłoszeń.</p>
      </div>
      <div className="sm:col-span-3">
        <label htmlFor="email" className={labelClass}>E-mail firmy {optional}</label>
        <input id="email" name="email" type="email" maxLength={200} defaultValue={contact.email || ''} autoComplete="email" className={inputClass} />
        <p className="mt-1 text-xs text-muted">Na ten adres wysyłamy zapytania klientów.</p>
      </div>
      <div className="sm:col-span-6">
        <label htmlFor="website" className={labelClass}>Strona WWW {optional}</label>
        <input id="website" name="website" type="text" inputMode="url" maxLength={300} defaultValue={company.website || ''} placeholder="https://" className={inputClass} />
      </div>
    </div>
  )
}
