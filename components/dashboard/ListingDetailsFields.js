'use client';

import { useState } from 'react';
import { ImagePlus, X } from 'lucide-react';

const inputClass = 'block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white';
const labelClass = 'mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300';
const MAX_IMAGES = 8;

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
        {priceType === 'fixed' && (
          <div>
            <label htmlFor="price_amount" className={labelClass}>Kwota (zł) <span className="text-red-500">*</span></label>
            <input id="price_amount" name="price_amount" type="number" min="0" step="0.01" required defaultValue={initialPrice} className={inputClass} />
          </div>
        )}
        <div>
          <label htmlFor="deposit_amount" className={labelClass}>Kaucja (zł)</label>
          <input id="deposit_amount" name="deposit_amount" type="number" min="0" step="1" defaultValue={listing.deposit_amount ?? ''} className={inputClass} />
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
export function GalleryField({ initialImages = [] }) {
  const [images, setImages] = useState(initialImages.filter(Boolean));
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFiles(event) {
    const files = Array.from(event.target.files || []).slice(0, MAX_IMAGES - images.length);
    event.target.value = '';
    if (files.length === 0) return;

    setUploading(true);
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
    }
  }

  return (
    <div className="sm:col-span-6">
      <span className={labelClass}>Zdjęcia (do {MAX_IMAGES}, pierwsze jest główne)</span>
      <input type="hidden" name="gallery" value={JSON.stringify(images)} />
      <div className="flex flex-wrap gap-3">
        {images.map((url) => (
          <div key={url} className="relative h-24 w-32 overflow-hidden rounded-lg border border-gray-200 dark:border-slate-600">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              aria-label="Usuń zdjęcie"
              onClick={() => setImages((current) => current.filter((item) => item !== url))}
              className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        ))}
        {images.length < MAX_IMAGES && (
          <label className="flex h-24 w-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-gray-400 text-xs text-gray-600 hover:bg-gray-50 dark:border-slate-500 dark:text-gray-300 dark:hover:bg-slate-700">
            <ImagePlus className="h-5 w-5" aria-hidden="true" />
            {uploading ? 'Wysyłanie…' : 'Dodaj zdjęcia'}
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" disabled={uploading} onChange={handleFiles} />
          </label>
        )}
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-red-700 dark:text-red-400">{error}</p>}
    </div>
  );
}
