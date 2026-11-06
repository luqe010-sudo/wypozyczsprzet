'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, ExternalLink, Flag, Mail, MapPin, MessageSquare, Phone, ShieldCheck, Truck } from 'lucide-react';
import ClaimCompanyModal from '@/components/ClaimCompanyModal';
import FavoriteButton from '@/components/FavoriteButton';
import ListingCard from '@/components/ListingCard';
import InquiryForm from '@/components/listing/InquiryForm';
import ListingGallery from '@/components/listing/ListingGallery';
import { listingFacts, priceText } from '@/lib/format';
import { trackEvent } from '@/lib/gtag';
import { getExternalLinkProps, isBrokenLink } from '@/lib/seo-utils';
import { CONTACT_EMAIL, SITE_URL } from '@/lib/site';
import { trackClick, trackView } from '@/lib/tracking';
import { createClient } from '@/utils/supabase/client';

const ListingMap = dynamic(() => import('@/components/ListingMap'), {
  ssr: false,
  loading: () => <div className="h-[320px] w-full animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700 md:h-[400px]" />,
});

const secondaryButton = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-semibold text-foreground hover:bg-background';
const mutedText = 'text-sm text-slate-600 dark:text-slate-400';
const firmLink = 'flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400';

function publicLink(value) {
  if (!value || isBrokenLink(value)) return null;
  try {
    const url = new URL(value.includes('://') ? value : `https://${value}`);
    if (url.username || url.password) return null;
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

function ListingLocation({ listing }) {
  const container = useRef(null);
  const [nearViewport, setNearViewport] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setNearViewport(true);
        observer.disconnect();
      }
    }, { rootMargin: '280px' });
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={container} data-no-tab-swipe className="min-h-[320px] rounded-xl bg-background md:min-h-[400px]">
      {nearViewport && <ListingMap listing={listing} />}
    </div>
  );
}

export default function ListingPageClient({ listing, related, categorySlug, categoryName, canonicalPath, confirmedDate, declaredAvailability }) {
  const router = useRouter();
  const [showPhone, setShowPhone] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [user, setUser] = useState(null);
  const [formInView, setFormInView] = useState(false);
  const viewedListing = useRef(null);
  const inquirySection = useRef(null);

  // The sticky bar would cover the real submit button and look like a second, non-working one.
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setFormInView(entry.isIntersecting), { rootMargin: '-64px 0px -140px' });
    observer.observe(inquirySection.current);
    return () => observer.disconnect();
  }, []);

  const id = listing.ID_sprzetu;
  const name = listing['Sprzęt'] || 'Sprzęt';
  const company = listing.companyDetails;
  const phone = String(company.Telefon || '').trim();
  const dialNumber = phone.replace(/[\s().-]/g, '');
  const telHref = /^\+?\d{6,15}$/.test(dialNumber) ? `tel:${dialNumber}` : '';
  const facts = listingFacts(listing).filter((fact) => fact.label !== 'Dostępność');
  const address = [company.address, [company.postal_code, company.city].filter(Boolean).join(' ')].filter(Boolean).join(', ');
  const hasMap = listing.lat != null && listing.lng != null && Number.isFinite(Number(listing.lat)) && Number.isFinite(Number(listing.lng));
  const website = publicLink(company.WWW);
  const olx = publicLink(listing.olxUrl);
  const paragraphs = String(listing.Opis || '').trim().split(/\r?\n\s*\r?\n/).filter(Boolean);
  const reportHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Zgłoszenie ogłoszenia: ${name}`)}&body=${encodeURIComponent(`Adres ogłoszenia: ${SITE_URL}${canonicalPath}\n\nCo jest nie tak:\n`)}`;

  useEffect(() => {
    const supabase = createClient();
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
      if (!cancelled) trackView(id, isAdmin);
    })();

    if (viewedListing.current !== id) {
      trackEvent('view_listing', { listing_id: id, listing_name: name, listing_category: categoryName, listing_city: listing.Miasto });
      viewedListing.current = id;
    }
    return () => { cancelled = true; };
  }, [id, listing.Miasto, name, categoryName]);

  const recordPhone = (source) => {
    trackEvent('click_phone', { listing_id: id, listing_name: name, source });
    trackClick(id, 'phone');
  };

  const revealPhone = () => {
    setShowPhone(true);
    trackEvent('show_phone', { listing_id: id, listing_name: name, source: 'reveal' });
  };

  const handleClaimClick = () => {
    if (!user) {
      router.push(`/login?returnTo=${encodeURIComponent(canonicalPath)}`);
      return;
    }
    setShowClaimModal(true);
  };

  return (
    <>
      <header className="mb-5 grid gap-4 sm:mb-7 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-center lg:gap-8">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/${categorySlug}`} className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
              {listing.subcategoryLabel || categoryName}
            </Link>
            <h1 className="mt-1 break-words text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl">{name}</h1>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
              {listing.Miasto && (
                <span className="inline-flex items-center gap-1.5"><MapPin size={17} aria-hidden="true" />{listing.Miasto}</span>
              )}
              {listing.deliveryAvailable === true && (
                <span className="inline-flex items-center gap-1.5"><Truck size={17} aria-hidden="true" />Możliwa dostawa</span>
              )}
              {listing.isVerified && (
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck size={17} aria-hidden="true" />Zweryfikowany wynajmujący
                </span>
              )}
            </div>
          </div>
          <FavoriteButton id={id} />
        </div>

        <div className="rounded-xl bg-market-navy px-4 py-3 text-white sm:px-5">
          <p className="text-xs font-semibold text-slate-200">Cena wynajmu</p>
          <p className="mt-0.5 text-2xl font-extrabold tracking-tight text-market-yellow sm:text-3xl">{priceText(listing)}</p>
          {declaredAvailability && <p className="mt-1 text-sm text-slate-200">Wynajmujący podaje: {declaredAvailability.toLowerCase()}</p>}
        </div>
      </header>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="min-w-0 space-y-5">
          <ListingGallery images={listing.gallery} name={name} city={listing.Miasto} category={listing.Kategoria} />

          <nav aria-label="Sekcje ogłoszenia" className="flex flex-wrap gap-x-4 border-b border-border">
            <a href="#opis" className="listing-section-link">Opis</a>
            {facts.length > 0 && <a href="#parametry" className="listing-section-link">Parametry</a>}
            {hasMap && <a href="#lokalizacja" className="listing-section-link">Lokalizacja</a>}
            <a href="#wynajmujacy" className="listing-section-link">Wynajmujący</a>
            <a href="#zapytanie" className="listing-section-link">Zapytanie</a>
          </nav>

          <section id="opis" aria-labelledby="description-heading" className="listing-panel scroll-mt-24">
            <h2 id="description-heading" className="market-heading mb-3">Opis sprzętu</h2>
            {paragraphs.length > 0 ? (
              <div className="space-y-3 leading-relaxed text-slate-700 dark:text-slate-300">
                {paragraphs.map((paragraph, index) => (
                  <p key={index} className="whitespace-pre-line break-words">{paragraph.trim()}</p>
                ))}
              </div>
            ) : (
              <p className={mutedText}>Zapytaj wynajmującego o szczegóły tego sprzętu.</p>
            )}
          </section>

          {facts.length > 0 && (
            <section id="parametry" aria-labelledby="facts-heading" className="listing-panel scroll-mt-24">
              <h2 id="facts-heading" className="market-heading mb-3">Parametry i warunki wynajmu</h2>
              <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
                {facts.map((fact, index) => (
                  <div key={`${fact.label}-${index}`} className="min-w-0 bg-card px-4 py-3 text-sm">
                    <dt className="break-words text-slate-600 dark:text-slate-400">{fact.label}</dt>
                    <dd className="mt-1 break-words font-semibold text-foreground">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {hasMap && (
            <section id="lokalizacja" aria-labelledby="location-heading" className="listing-panel scroll-mt-24">
              <h2 id="location-heading" className="market-heading mb-2">Lokalizacja sprzętu</h2>
              {address && <p className={`mb-3 ${mutedText}`}>{address}</p>}
              <ListingLocation listing={listing} />
            </section>
          )}
        </div>

        <aside aria-label="Kontakt z wynajmującym" className="min-w-0 space-y-4">
          <section ref={inquirySection} id="zapytanie" aria-labelledby="inquiry-heading" tabIndex={-1} className="listing-panel scroll-mt-24">
            <h2 id="inquiry-heading" className="market-heading mb-1">Zapytaj o wynajem</h2>
            <p className={`mb-4 ${mutedText}`}>Ustal termin i warunki wynajmu. Możesz wysłać zapytanie bez zakładania konta.</p>

            {phone && (
              <div className="mb-4 border-b border-border pb-4">
                {showPhone ? (
                  telHref ? (
                    <a href={telHref} onClick={() => recordPhone('contact')} className={`${secondaryButton} w-full`}>
                      <Phone size={17} aria-hidden="true" /> Zadzwoń <span className="tabular-nums">{phone}</span>
                    </a>
                  ) : <p className="break-words font-semibold text-foreground">{phone}</p>
                ) : (
                  <button type="button" onClick={revealPhone} className={`${secondaryButton} w-full`}>
                    <Phone size={17} aria-hidden="true" /> Pokaż numer telefonu
                  </button>
                )}
              </div>
            )}

            <InquiryForm equipmentId={id} equipmentName={name} isClaimed={listing.isClaimed} />
          </section>

          <section id="wynajmujacy" aria-labelledby="company-heading" className="listing-panel scroll-mt-24">
            <h2 id="company-heading" className="market-heading mb-3">Wynajmujący</h2>
            <p className="flex items-center gap-2.5 break-words font-bold text-foreground">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-market-navy text-market-yellow"><Building2 size={18} aria-hidden="true" /></span>
              {company.Nazwa}
            </p>
            {address && <p className={`mt-2 ${mutedText}`}>{address}</p>}
            {confirmedDate && (
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                Aktualność ogłoszenia potwierdzono {confirmedDate}
              </p>
            )}
            {(website || olx) && (
              <div className="mt-2 flex flex-wrap gap-x-4">
                {website && (
                  <a href={website} {...getExternalLinkProps(website)} className={firmLink} onClick={() => {
                    trackEvent('click_www', { listing_id: id, listing_name: name });
                    trackClick(id, 'website');
                  }}>
                    <ExternalLink size={16} aria-hidden="true" /> Strona firmy
                  </a>
                )}
                {olx && (
                  <a href={olx} {...getExternalLinkProps(olx)} className={firmLink} onClick={() => {
                    trackEvent('click_olx', { listing_id: id, listing_name: name });
                    trackClick(id, 'olx');
                  }}>
                    <MessageSquare size={16} aria-hidden="true" /> Ogłoszenie na OLX
                  </a>
                )}
              </div>
            )}
            {!listing.isClaimed && (
              <div className="mt-3 border-t border-border pt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                <p>Dane pochodzą ze źródeł publicznych. Warunki ustal bezpośrednio z wynajmującym.</p>
                <button type="button" onClick={handleClaimClick} className="min-h-11 font-medium text-brand-600 underline dark:text-brand-400">
                  To Twoja firma? Przejmij profil
                </button>
              </div>
            )}
          </section>

          <a href={reportHref} className="flex min-h-11 items-center justify-center gap-1.5 text-xs text-slate-600 hover:underline dark:text-slate-400">
            <Flag size={14} aria-hidden="true" /> Zgłoś błąd lub naruszenie w ogłoszeniu
          </a>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-9" aria-labelledby="related-heading">
          <h2 id="related-heading" className="market-heading mb-4">Podobne oferty w pobliżu</h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4">
            {related.map((item) => <ListingCard key={item.ID_sprzetu} listing={item} />)}
          </div>
        </section>
      )}

      <p className="mt-6 text-center">
        <Link href={`/${categorySlug}`} className="inline-flex min-h-11 items-center text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
          Zobacz wszystkie oferty w kategorii {categoryName}
        </Link>
      </p>

      <div className={`mobile-listing-contact fixed inset-x-0 bottom-[var(--market-nav-height)] z-30 h-[65px] gap-2 border-t border-border bg-card px-3 py-2 lg:hidden ${formInView ? 'hidden' : 'flex'}`}>
        {phone && (
          <a href={telHref || '#zapytanie'} onClick={telHref ? () => recordPhone('sticky') : revealPhone} className={`${secondaryButton} flex-1`}>
            <Phone size={17} aria-hidden="true" /> {telHref ? 'Zadzwoń' : 'Pokaż telefon'}
          </a>
        )}
        <a href="#zapytanie" className="market-action flex-1 whitespace-nowrap px-2.5 text-[13px] sm:text-sm">
          <Mail size={17} aria-hidden="true" /> Zapytaj o wynajem
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
