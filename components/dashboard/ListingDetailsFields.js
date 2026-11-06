'use client';

import { useState } from 'react';
import { ImagePlus, X } from 'lucide-react';

const inputClass = 'block min-h-11 w-full rounded-lg border border-slate-300 bg-card px-3 py-2 text-base text-foreground sm:text-sm dark:border-slate-600';
const labelClass = 'mb-1 block text-sm font-semibold text-foreground';
const MAX_IMAGES = 8;

export const rentalPeriods = { hour: 'godzina', day: 'doba', week: 'tydzień', month: 'miesiąc' };

export function ListingBasics({ categories, subcategories, branches, listing = {} }) {
  const initialCategory = categories.find((category) => category.id === listing.category_id)
    || categories.find((category) => category.db_key === listing.category || category.name === listing.category);
  const initialSubcategories = subcategories.filter((item) => item.category_id === initialCategory?.id);
  const initialSubcategory = initialSubcategories.find((item) => item.id === listing.subcategory_id)
    || initialSubcategories.find((item) => item.slug === listing.subcategory || item.name === listing.subcategory);
  const [categoryId, setCategoryId] = useState(initialCategory?.id || '');
  const [subcategoryId, setSubcategoryId] = useState(initialSubcategory?.id || '');
  const filteredSubcategories = subcategories.filter((item) => item.category_id === categoryId);
  const initialBranchId = branches.find((branch) => branch.id === listing.branch_id)?.id
    || branches.find((branch) => branch.is_main)?.id || branches[0]?.id || '';

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor="name" className={labelClass}>Nazwa sprzętu *</label>
        <input id="name" name="name" required maxLength={120} pattern=".*\S.*" defaultValue={listing.name || listing.Sprzęt} placeholder="np. Minikoparka Kubota U17-3a" className={inputClass} />
        <p className="mt-1 text-xs text-muted">Podaj markę i model. Opisz jedną maszynę albo zestaw wynajmowany razem.</p>
      </div>
      <div>
        <label htmlFor="category_id" className={labelClass}>Kategoria{(!listing.id || listing.category_id) && ' *'}</label>
        <select id="category_id" name="category_id" required={!listing.id || Boolean(listing.category_id)} value={categoryId} onChange={(event) => { setCategoryId(event.target.value); setSubcategoryId(''); }} className={inputClass}>
          <option value="">Wybierz kategorię</option>
          {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="subcategory_id" className={labelClass}>Podkategoria</label>
        <select id="subcategory_id" name="subcategory_id" disabled={!filteredSubcategories.length} value={subcategoryId} onChange={(event) => setSubcategoryId(event.target.value)} className={inputClass}>
          <option value="">Wybierz typ</option>
          {filteredSubcategories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="branch_id" className={labelClass}>Lokalizacja sprzętu{(!listing.id || branches.length > 0) && ' *'}</label>
        <select id="branch_id" name="branch_id" required={!listing.id || branches.length > 0} defaultValue={initialBranchId} className={inputClass}>
          <option value="">Wybierz oddział</option>
          {branches.map((item) => (
            <option key={item.id} value={item.id}>{[item.name, item.city, !item.name && item.address].filter(Boolean).join(' · ') || 'Oddział bez nazwy'}</option>
          ))}
        </select>
        <p className="mt-1 text-xs text-muted">Miasto i adres ogłoszenia pobierzemy z wybranego oddziału.</p>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="description" className={labelClass}>Opis <span className="font-normal text-muted">(opcjonalnie)</span></label>
        <textarea id="description" name="description" rows={4} maxLength={5000} defaultValue={listing.description || listing.Opis} placeholder="Opisz sprzęt, dołączone wyposażenie i warunki wynajmu." className={inputClass} />
      </div>
    </div>
  );
}

export function ListingRentalFields({ listing = {}, onUploadingChange }) {
  return (
    <div className="grid gap-4 sm:grid-cols-6">
      <GalleryField initialImages={[listing.image_url, ...(listing.gallery_urls || [])]} onUploadingChange={onUploadingChange} />
      <div className="sm:col-span-3">
        <label htmlFor="availability" className={labelClass}>Dostępność</label>
        <select id="availability" name="availability" defaultValue={listing.availability?.trim() || 'on_call'} className={inputClass}>
          <option value="on_call">Zapytaj o termin</option>
          <option value="immediately">Dostępny od ręki</option>
          <option value="rented">Wynajęty</option>
          <option value="unavailable">Niedostępny</option>
        </select>
      </div>
      <div className="sm:col-span-3">
        <label htmlFor="rental_period" className={labelClass}>Okres rozliczeniowy</label>
        <select id="rental_period" name="rental_period" defaultValue={listing.rental_period || 'day'} className={inputClass}>
          {Object.entries(rentalPeriods).map(([value, title]) => <option key={value} value={value}>{title}</option>)}
        </select>
      </div>
      <ListingDetailsFields listing={listing} />
      <div className="sm:col-span-6">
        <label htmlFor="external_olx_url" className={labelClass}>Link do OLX <span className="font-normal text-muted">(opcjonalnie)</span></label>
        <input id="external_olx_url" name="external_olx_url" type="url" maxLength={500} defaultValue={listing.external_olx_url ?? ''} placeholder="https://olx.pl/..." className={inputClass} />
      </div>
    </div>
  );
}

const triStateValue = (value) => (value === true ? 'yes' : value === false ? 'no' : '');

function TriState({ name, label, value, yes, no }) {
  return (
    <div>
      <label htmlFor={name} className={labelClass}>{label}</label>
      <select id={name} name={name} defaultValue={triStateValue(value)} className={inputClass}>
        <option value="">Nie podaję</option>
        <option value="yes">{yes}</option>
        <option value="no">{no}</option>
      </select>
    </div>
  );
}

const specsToText = (specs) => Object.entries(specs || {}).map(([key, value]) => `${key}: ${value}`).join('\n');

/** Price, conditions and parameters shared by the owner and admin listing forms. */
export function ListingDetailsFields({ listing = {} }) {
  const initialPrice = listing.price_amount ?? '';
  const [priceType, setPriceType] = useState(listing.price_type || 'fixed');

  return (
    <div className="space-y-4 sm:col-span-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="price_type" className={labelClass}>Cena</label>
          <select id="price_type" name="price_type" value={priceType} onChange={(e) => setPriceType(e.target.value)} className={inputClass}>
            <option value="fixed">Podaję cenę</option>
            <option value="ask">Cena na zapytanie</option>
          </select>
        </div>
        <div hidden={priceType !== 'fixed'}>
          <label htmlFor="price_amount" className={labelClass}>Kwota (zł) <span className="text-red-500">*</span></label>
          <input id="price_amount" name="price_amount" type="number" min="0" max="99999999.99" step="0.01" required={priceType === 'fixed'} disabled={priceType !== 'fixed'} defaultValue={initialPrice} className={inputClass} />
        </div>
        <div>
          <label htmlFor="deposit_amount" className={labelClass}>Kaucja (zł)</label>
          <input id="deposit_amount" name="deposit_amount" type="number" min="0" max="99999999.99" step="0.01" defaultValue={listing.deposit_amount ?? ''} className={inputClass} />
        </div>
        <TriState name="delivery_available" label="Dostawa" value={listing.delivery_available} yes="Możliwa dostawa" no="Tylko odbiór własny" />
        <TriState name="with_operator" label="Operator" value={listing.with_operator} yes="Możliwy wynajem z operatorem" no="Bez operatora" />
        <TriState name="vat_invoice" label="Faktura VAT" value={listing.vat_invoice} yes="Wystawiam fakturę VAT" no="Nie wystawiam" />
      </div>
      <div>
        <label htmlFor="specs" className={labelClass}>Parametry</label>
        <textarea id="specs" name="specs" rows={4} defaultValue={specsToText(listing.specs)} placeholder={'Waga: 80 kg\nMoc silnika: 7 KM'} className={inputClass} />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Każdy parametr w osobnej linii, w formacie „nazwa: wartość”.</p>
      </div>
    </div>
  );
}

/** Uploads directly to Cloudinary and passes the resulting URLs to the form as JSON. */
export function GalleryField({ initialImages = [], onUploadingChange }) {
  const [images, setImages] = useState(initialImages.filter(Boolean));
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFiles(event) {
    const files = Array.from(event.target.files || []).slice(0, MAX_IMAGES - images.length);
    event.target.value = '';
    if (files.length === 0) return;

    setUploading(true);
    onUploadingChange?.(true);
    setError('');
    try {
      for (const file of files) {
        const signatureResponse = await fetch('/api/upload-signature', { method: 'POST' });
        if (!signatureResponse.ok) throw new Error('Nie udało się przygotować wysyłki zdjęcia.');
        const signed = await signatureResponse.json();

        if (file.size > signed.maxFileBytes) throw new Error(`Plik ${file.name} jest większy niż 10 MB.`);

        const body = new FormData();
        body.append('file', file);
        body.append('api_key', signed.apiKey);
        body.append('timestamp', signed.timestamp);
        body.append('signature', signed.signature);
        body.append('folder', signed.folder);
        body.append('allowed_formats', signed.allowedFormats);

        const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`, { method: 'POST', body });
        if (!uploadResponse.ok) throw new Error(`Nie udało się wysłać pliku ${file.name}. Dozwolone formaty: JPG, PNG, WEBP.`);
        const uploaded = await uploadResponse.json();
        setImages((current) => [...current, uploaded.secure_url]);
      }
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
    }
  }

  return (
    <div className="sm:col-span-6">
      <span className={labelClass}>Zdjęcia (do {MAX_IMAGES}, pierwsze jest główne)</span>
      <input type="hidden" name="gallery" value={JSON.stringify(images)} />
      <div className="flex flex-wrap gap-3">
        {images.map((url, index) => (
          <div key={url} className="relative h-24 w-32 overflow-hidden rounded-lg border border-gray-200 dark:border-slate-600">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              aria-label={`Usuń zdjęcie ${index + 1}`}
              onClick={() => setImages((current) => current.filter((item) => item !== url))}
              className="absolute right-1 top-1 grid size-10 place-items-center rounded-full bg-black/70 text-white"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        ))}
        {images.length < MAX_IMAGES && (
          <label className="flex h-24 w-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-400 text-xs font-semibold text-muted hover:bg-background focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary dark:border-slate-500">
            <ImagePlus className="h-5 w-5" aria-hidden="true" />
            <span aria-live="polite">{uploading ? 'Wysyłanie…' : 'Dodaj zdjęcia'}</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" disabled={uploading} onChange={handleFiles} />
          </label>
        )}
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-red-700 dark:text-red-400">{error}</p>}
    </div>
  );
}
