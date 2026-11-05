'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExternalLink, Flag, Mail, MapPin, MessageSquare, Phone, ShieldCheck } from 'lucide-react';
import ClaimCompanyModal from '../../../../../components/ClaimCompanyModal';
import InquiryForm from '../../../../../components/listing/InquiryForm';
import ListingGallery from '../../../../../components/listing/ListingGallery';
import ListingCard from '../../../../../components/ListingCard';
import { trackEvent } from '../../../../../lib/gtag';
import { trackClick, trackView } from '../../../../../lib/tracking';
import { getExternalLinkProps, isBrokenLink } from '../../../../../lib/seo-utils';
import { formatDate, listingFacts, priceText } from '../../../../../lib/format';
import { CONTACT_EMAIL } from '../../../../../lib/site';
import { createClient } from '@/utils/supabase/client';

const ListingMap = dynamic(() => import('../../../../../components/ListingMap'), {
  ssr: false,
  loading: () => <div className="h-[320px] w-full animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />,
});

const secondaryButton = 'flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700';

export default function ListingPageClient({ listing, description, related, categorySlug, categoryName }) {
  const router = useRouter();
  const supabaseRef = useRef(null);
  const [showPhone, setShowPhone] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [user, setUser] = useState(null);

  const name = listing['Sprzęt'] || 'Sprzęt';
  const company = listing.companyDetails || {};
  const phone = String(company.Telefon || '').trim();
  const telHref = `tel:${phone.replace(/\s/g, '')}`;
  const facts = listingFacts(listing);
  const websiteUsable = company.WWW && !isBrokenLink(company.WWW);
  const olxUsable = listing.olxUrl && !isBrokenLink(listing.olxUrl);
  const paragraphs = String(description || '').split(/\r?\n\s*\r?\n/).filter((p) => p.trim());
  const reportHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Zgłoszenie ogłoszenia: ${name}`)}&body=${encodeURIComponent(`Adres ogłoszenia: https://wypozycz.online/${listing.seoCategory}/${listing.citySlug}/${listing.slug}\n\nCo jest nie tak:\n`)}`;

  useEffect(() => {
    const supabase = createClient();
    supabaseRef.current = supabase;
    let cancelled = false;

    (async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (cancelled) return;
      setUser(currentUser);
      let isAdmin = false;
      if (currentUser) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', currentUser.id).maybeSingle();
        isAdmin = profile?.role === 'admin';
      }
      trackView(listing.ID_sprzetu, isAdmin);
    })();

    trackEvent('view_listing', { listing_name: name, listing_category: categoryName, listing_city: listing.Miasto });
    return () => { cancelled = true; };
  }, [listing.ID_sprzetu, listing.Miasto, name, categoryName]);

  const recordPhone = (source) => {
    trackEvent('show_phone', { listing_name: name, source });
    trackClick(listing.ID_sprzetu, 'phone');
  };

  const revealPhone = () => {
    setShowPhone(true);
    recordPhone('reveal');
  };

  const handleClaimClick = () => {
    if (!user) {
      router.push(`/login?returnTo=/${listing.seoCategory}/${listing.citySlug}/${listing.slug}`);
      return;
    }
    setShowClaimModal(true);
  };

  return (
    <>
      <header className="mb-5">
        <h1 className="text-2xl font-bold leading-tight text-slate-900 dark:text-white md:text-3xl">{name}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
          <p className="text-xl font-bold text-slate-900 dark:text-white">{priceText(listing)}</p>
          <p className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            {listing.Miasto}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="min-w-0 space-y-6 lg:col-span-8">
          <ListingGallery images={listing.gallery} name={name} city={listing.Miasto} category={listing.Kategoria} />

          {facts.length > 0 && (
            <section aria-labelledby="facts-heading">
              <h2 id="facts-heading" className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">Parametry i warunki</h2>
              <dl className="grid grid-cols-1 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-800 sm:grid-cols-2 sm:divide-y-0">
                {facts.map((fact) => (
                  <div key={fact.label} className="flex justify-between gap-4 px-4 py-3 text-sm sm:border-b sm:border-slate-200 sm:dark:border-slate-700">
                    <dt className="text-slate-600 dark:text-slate-400">{fact.label}</dt>
                    <dd className="text-right font-medium text-slate-900 dark:text-white">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <section aria-labelledby="description-heading">
            <h2 id="description-heading" className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">Opis</h2>
            {paragraphs.length > 0 ? (
              <div className="space-y-3 text-base leading-relaxed text-slate-700 dark:text-slate-300">
                {paragraphs.map((paragraph, index) => (
                  <p key={index} className="whitespace-pre-line">{paragraph.trim()}</p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-400">Wynajmujący nie dodał opisu. Szczegóły ustalisz bezpośrednio z nim.</p>
            )}
          </section>

          {listing.lat != null && listing.lng != null && (
            <section aria-labelledby="location-heading">
              <h2 id="location-heading" className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">Lokalizacja</h2>
              <ListingMap listing={listing} />
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:col-span-4">
          <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800 md:p-5">
            {phone && (
              showPhone ? (
                <a href={telHref} className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 font-semibold text-white hover:bg-brand-700">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {phone}
                </a>
              ) : (
                <button type="button" onClick={revealPhone} className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 font-semibold text-white hover:bg-brand-700">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  Pokaż numer telefonu
                </button>
              )
            )}
            <a href="#zapytanie" className={secondaryButton}>
              <Mail className="h-4 w-4" aria-hidden="true" />
              Zapytaj o dostępność
            </a>
            {olxUsable && (
              <a
                href={listing.olxUrl}
                {...getExternalLinkProps(listing.olxUrl)}
                className={secondaryButton}
                onClick={() => {
                  trackEvent('click_olx', { listing_name: name });
                  trackClick(listing.ID_sprzetu, 'olx');
                }}
              >
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                Ogłoszenie na OLX
              </a>
            )}
            {websiteUsable && (
              <a
                href={company.WWW.startsWith('http') ? company.WWW : `https://${company.WWW}`}
                {...getExternalLinkProps(company.WWW)}
                className={secondaryButton}
                onClick={() => {
                  trackEvent('click_www', { listing_name: name });
                  trackClick(listing.ID_sprzetu, 'website');
                }}
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Strona firmy
              </a>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800 md:p-5">
            <h2 className="text-sm font-medium text-slate-600 dark:text-slate-400">Wynajmujący</h2>
            <p className="mt-1 font-semibold text-slate-900 dark:text-white">{company.Nazwa}</p>
            {listing.isVerified && (
              <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                Zweryfikowana firma
              </p>
            )}
            {(company.address || company.city) && (
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {company.address ? `${company.address}, ` : ''}{company.postal_code ? `${company.postal_code} ` : ''}{company.city}
              </p>
            )}
            {listing.lastConfirmedAt && (
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                Aktualność potwierdzona: {formatDate(listing.lastConfirmedAt)}
              </p>
            )}
            {!listing.isClaimed && (
              <div className="mt-3 border-t border-slate-200 pt-3 text-xs leading-relaxed text-slate-600 dark:border-slate-700 dark:text-slate-400">
                <p>Dane pochodzą ze źródeł publicznych, firma ich jeszcze nie potwierdziła. Warunki ustal bezpośrednio z wynajmującym.</p>
                <button type="button" onClick={handleClaimClick} className="mt-2 font-medium text-brand-600 underline dark:text-brand-400">
                  To Twoja firma? Przejmij profil
                </button>
              </div>
            )}
          </div>

          <div id="zapytanie" className="scroll-mt-24 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800 md:p-5">
            <h2 className="mb-1 text-base font-semibold text-slate-900 dark:text-white">Zapytaj o dostępność</h2>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">Bez rejestracji. Odpowiedź otrzymasz bezpośrednio od wynajmującego.</p>
            <InquiryForm equipmentId={listing.ID_sprzetu} equipmentName={name} />
          </div>

          <a href={reportHref} className="flex min-h-[44px] items-center justify-center gap-1.5 text-xs text-slate-600 hover:underline dark:text-slate-400">
            <Flag className="h-3.5 w-3.5" aria-hidden="true" />
            Zgłoś błąd lub naruszenie w ogłoszeniu
          </a>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-10" aria-labelledby="related-heading">
          <h2 id="related-heading" className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Podobne oferty w pobliżu</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            {related.map((item) => <ListingCard key={item.ID_sprzetu} listing={item} />)}
          </div>
        </section>
      )}

      <p className="mb-24 mt-8 text-center lg:mb-8">
        <Link href={`/${categorySlug}`} className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
          Wszystkie oferty: {categoryName}
        </Link>
      </p>

      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900 lg:hidden" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        {phone && (
          <a href={telHref} onClick={() => recordPhone('sticky')} className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-lg bg-brand-600 font-semibold text-white">
            <Phone className="h-4 w-4" aria-hidden="true" />
            Zadzwoń
          </a>
        )}
        <a href="#zapytanie" className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 font-semibold text-slate-900 dark:border-slate-600 dark:text-white">
          <Mail className="h-4 w-4" aria-hidden="true" />
          Zapytaj
        </a>
      </div>

      <ClaimCompanyModal
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        company={company}
        user={user}
      />
    </>
  );
}
