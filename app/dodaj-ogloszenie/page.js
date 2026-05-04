"use client";

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { trackEvent } from '../../lib/gtag';
import PrivacyModal from '../../components/PrivacyModal';

function AddListingForm() {
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    phone: '',
    zipCode: '',
    city: '',
    lokalizacja: '',
    category: 'Budowlane',
    equipment: '',
    price: '',
    availability: 'od ręki',
    description: '',
    time: 'doba',
    olxUrl: '',
    wantsPromotion: false,
    image: null,
    acceptTerms: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (type === 'file') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });

    if (editId) {
      data.append('editId', editId);
    }

    try {
      const response = await fetch('/api/add-listing', {
        method: 'POST',
        body: data,
      });

      if (!response.ok) throw new Error('Failed to submit');
      
      setStatus('success');
      trackEvent('submit_listing', { equipment: formData.equipment, category: formData.category, city: formData.city });
      setFormData({ 
        company: '', 
        phone: '', 
        zipCode: '',
        city: '', 
        lokalizacja: '',
        category: 'Koparki', 
        equipment: '', 
        price: '', 
        availability: 'Dostępne od zaraz', 
        description: '',
        olxUrl: '',
        wantsPromotion: false,
        image: null,
        acceptTerms: false
      });
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-bold transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Powrót do ogłoszeń
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">
          <div className="p-8 md:p-12">
            <div className="mb-10 text-center">
              <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Dodaj swoje ogłoszenie</h1>
              <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
                Wypełnij formularz, aby dodać swój sprzęt. Twoje ogłoszenie zostanie wyświetlone po zatwierdzeniu przez administratora.
              </p>
            </div>

            {status === 'success' ? (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-8 text-center border border-green-100 dark:border-green-900/30">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 dark:text-green-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-xl font-bold text-green-900 dark:text-green-400 mb-2">Ogłoszenie zostało wysłane!</h3>
                <p className="text-green-700 dark:text-green-500/80 mb-6">Zostanie ono zweryfikowane przez naszą obsługę. Po akceptacji pojawi się na liście.</p>
                <button 
                  onClick={() => setStatus('idle')} 
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md"
                >
                  Dodaj kolejne
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nazwa Firmy / Imię</label>
                    <input required type="text" name="company" value={formData.company} onChange={handleChange} 
                           className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Telefon kontaktowy</label>
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} 
                           className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Kod pocztowy</label>
                    <input required type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} placeholder="np. 50-001"
                           className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-600" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Miasto</label>
                    <input required type="text" name="city" value={formData.city} onChange={handleChange} placeholder="np. Wrocław"
                           className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-600" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Ulica i numer domu (bez lokalu)</label>
                  <input type="text" name="lokalizacja" value={formData.lokalizacja} onChange={handleChange} placeholder="np. ul. Polna 10"
                         className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-600" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Kategoria</label>
                    <select name="category" value={formData.category} onChange={handleChange} 
                            className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none cursor-pointer">
                      <option value="Budowlane">Budowlane</option>
                      <option value="Ciężki sprzęt">Ciężki sprzęt</option>
                      <option value="Koparki">Koparki</option>
                      <option value="Narzędzia">Narzędzia</option>
                      <option value="Ogrodnicze">Ogrodnicze</option>
                      <option value="Inne">Inne</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nazwa Sprzętu</label>
                    <input required type="text" name="equipment" value={formData.equipment} onChange={handleChange} placeholder="np. Minikoparka Kubota U17-3a"
                           className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Cena i Jednostka</label>
                    <div className="flex gap-2 min-w-0">
                      <input required type="number" name="price" value={formData.price} onChange={handleChange} placeholder="0.00"
                             className="flex-1 min-w-0 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
                      <select name="time" value={formData.time || 'doba'} onChange={handleChange} 
                              className="w-24 sm:w-32 flex-shrink-0 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-2 sm:px-4 py-3 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none cursor-pointer text-sm sm:text-base">
                        <option value="godzina">/ godzina</option>
                        <option value="doba">/ doba</option>
                        <option value="tydzień">/ tydzień</option>
                        <option value="miesiąc">/ miesiąc</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Dostępność</label>
                    <select name="availability" value={formData.availability} onChange={handleChange} 
                            className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none cursor-pointer">
                      <option value="od ręki">od ręki</option>
                      <option value="na telefon">na telefon</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Opis sprzętu (Opcjonalnie)</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows="6"
                            placeholder="Szczegóły, dane techniczne, zasady wynajmu..."
                            className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none placeholder-gray-400 dark:placeholder-gray-600"></textarea>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Link do ogłoszenia OLX (Opcjonalnie)</label>
                  <input type="url" name="olxUrl" value={formData.olxUrl} onChange={handleChange} placeholder="https://www.olx.pl/oferta/..."
                         className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-600" />
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                  <div className="flex items-start gap-3">
                    <input 
                      id="wantsPromotion"
                      type="checkbox" 
                      name="wantsPromotion" 
                      checked={formData.wantsPromotion} 
                      onChange={handleChange}
                      className="mt-1.5 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer" 
                    />
                    <label htmlFor="wantsPromotion" className="text-sm font-medium text-blue-900 dark:text-blue-400 cursor-pointer select-none">
                      <span className="font-bold block mb-1">Chcę wyróżnić ogłoszenie (w przyszłości płatne)</span>
                      <p className="opacity-80">Wybierz tę opcję, aby Twoja oferta znalazła się wyżej na liście wyników wyszukiwania.</p>
                    </label>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-200 dark:border-slate-700">
                  <div className="flex items-start gap-3">
                    <input 
                      id="acceptTerms"
                      type="checkbox" 
                      name="acceptTerms" 
                      checked={formData.acceptTerms} 
                      onChange={handleChange}
                      required
                      className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer" 
                    />
                    <label htmlFor="acceptTerms" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                      Akceptuję <Link href="/regulamin" className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank">regulamin serwisu</Link> oraz politykę RODO *
                    </label>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsPrivacyOpen(true)}
                    className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-bold flex items-center gap-1 ml-8"
                  >
                    👉 Pokaż politykę RODO
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Zdjęcie sprzętu</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-slate-700 border-dashed rounded-2xl hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer relative group bg-gray-50 dark:bg-slate-900/50">
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400 group-hover:text-blue-500 transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <span className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none">
                          Wgraj plik
                        </span>
                        <p className="pl-1">lub przeciągnij i upuść</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, GIF do 10MB</p>
                    </div>
                    <input 
                      type="file" 
                      name="image" 
                      onChange={handleChange} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    />
                  </div>
                  {formData.image && (
                    <p className="mt-2 text-sm text-blue-600 dark:text-blue-400 font-bold flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                      Wybrano: {formData.image.name}
                    </p>
                  )}
                </div>

                {status === 'error' && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl border border-red-100 dark:border-red-900/30 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Wystąpił błąd podczas wysyłania formularza. Spróbuj ponownie.
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={status === 'submitting'} 
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-black py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {status === 'submitting' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Wysyłanie...
                    </>
                  ) : 'Dodaj ogłoszenie'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </div>
  );
}

export default function AddListingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Ładowanie...</div>}>
      <AddListingForm />
    </Suspense>
  );
}
