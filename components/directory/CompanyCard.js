import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Phone, Mail, Globe, MapPin, Building2, FileText, ExternalLink, Shield, CheckCircle, XCircle } from 'lucide-react';

/**
 * Full company business card component.
 * Displays all company information in a premium card layout.
 * 
 * @param {Object} company - Company data with branches array
 * @param {string} contextType - 'city' or 'voivodeship' 
 * @param {string} contextName - Human-readable name of city/voivodeship
 */
export default function CompanyCard({ company, contextType, contextName }) {
  const branches = company.branches || [];
  const hasLogo = company.logo_url && company.logo_url.startsWith('http');
  const rating = company.rating ? parseFloat(company.rating) : null;
  const reviewCount = company.review_count || 0;

  // Get unique registration data from branches (usually same across branches)
  const regData = branches[0] || {};

  const initials = (company.name || '??')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div className="space-y-6">
      {/* ─── Hero Header ─────────────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 shadow-xl">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/[0.02]" />
        </div>

        <div className="relative p-6 md:p-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Logo */}
            <div className="relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center overflow-hidden shadow-lg">
              {hasLogo ? (
                <Image
                  src={company.logo_url}
                  alt={`Logo ${company.name}`}
                  width={80}
                  height={80}
                  className="object-contain p-2"
                />
              ) : (
                <span className="text-2xl md:text-3xl font-black text-white/90 select-none">
                  {initials}
                </span>
              )}
            </div>

            {/* Name + Meta */}
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight mb-2">
                {company.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                {company.category && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-100 bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                    <Building2 size={12} />
                    {company.category}
                  </span>
                )}
                {contextName && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-100 bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                    <MapPin size={12} />
                    {contextName}
                  </span>
                )}
              </div>

              {/* Rating */}
              <div className="mt-3 flex items-center gap-2">
                {rating !== null && rating > 0 ? (
                  <>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-5 h-5 ${
                            star <= Math.round(rating)
                              ? 'text-amber-300'
                              : 'text-white/20'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm font-bold text-white">{rating.toFixed(1)}</span>
                    {reviewCount > 0 && (
                      <span className="text-sm text-blue-200">({reviewCount} opinii)</span>
                    )}
                  </>
                ) : (
                  <span className="text-sm text-blue-200/70">Brak opinii</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Description ──────────────────────────────────────────────── */}
      {company.description && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 md:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <FileText size={18} className="text-blue-600 dark:text-blue-400" />
            O firmie
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
            {company.description}
          </p>
        </div>
      )}

      {/* ─── Branches / Oddziały ──────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 md:p-8 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
          <MapPin size={18} className="text-blue-600 dark:text-blue-400" />
          {branches.length > 1
            ? `Oddziały (${branches.length})`
            : 'Lokalizacja'}
        </h2>

        <div className={`grid gap-4 ${branches.length > 1 ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
          {branches.map((branch, idx) => (
            <BranchCard key={branch.id || idx} branch={branch} />
          ))}
        </div>

        {branches.length === 0 && (
          <p className="text-gray-400 dark:text-gray-500 text-sm italic">
            Brak informacji o lokalizacji
          </p>
        )}
      </div>

      {/* ─── Registration Data ────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 md:p-8 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
          <Shield size={18} className="text-blue-600 dark:text-blue-400" />
          Dane rejestrowe
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DataBadge label="NIP" value={regData.nip} />
          <DataBadge label="REGON" value={regData.regon} />
          <DataBadge label="KRS" value={regData.krs} />
          <VatBadge status={regData.vat_status} />
        </div>
      </div>

      {/* ─── Map placeholder ──────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 md:p-8 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <MapPin size={18} className="text-blue-600 dark:text-blue-400" />
          Lokalizacja na mapie
        </h2>
        <div className="w-full h-64 md:h-80 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center border border-gray-200 dark:border-slate-600">
          <div className="text-center">
            <MapPin size={32} className="mx-auto text-gray-400 dark:text-gray-500 mb-2" />
            <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">
              Mapa wkrótce dostępna
            </p>
          </div>
        </div>
        {/* Google Maps links for individual branches */}
        {branches.some((b) => b.google_maps_url) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {branches
              .filter((b) => b.google_maps_url)
              .map((b, idx) => (
                <a
                  key={idx}
                  href={b.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <ExternalLink size={12} />
                  {b.city ? `Google Maps – ${b.city}` : 'Google Maps'}
                </a>
              ))}
          </div>
        )}
      </div>

      {/* ─── CTA ──────────────────────────────────────────────────────── */}
      <div className="text-center py-4">
        <Link
          href="/katalog"
          className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Wróć do katalogu firm
        </Link>
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function BranchCard({ branch }) {
  return (
    <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-5 border border-gray-100 dark:border-slate-600 hover:border-blue-200 dark:hover:border-blue-800 transition-colors group">
      {/* City header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
          <MapPin size={14} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            {branch.city || 'Nieznane miasto'}
          </h3>
          {branch.voivodeship && (
            <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
              woj. {branch.voivodeship}
            </span>
          )}
        </div>
      </div>

      {/* Contact info */}
      <div className="space-y-2">
        <ContactRow
          icon={<MapPin size={14} />}
          value={branch.address || 'brak danych'}
          isPlaceholder={!branch.address}
        />
        <ContactRow
          icon={<Phone size={14} />}
          value={branch.phone || 'brak danych'}
          href={branch.phone ? `tel:${branch.phone.replace(/\s/g, '')}` : undefined}
          isPlaceholder={!branch.phone}
        />
        <ContactRow
          icon={<Mail size={14} />}
          value={branch.email || 'brak danych'}
          href={branch.email ? `mailto:${branch.email}` : undefined}
          isPlaceholder={!branch.email}
        />
        <ContactRow
          icon={<Globe size={14} />}
          value={branch.website ? branch.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') : 'brak danych'}
          href={branch.website ? (branch.website.startsWith('http') ? branch.website : `https://${branch.website}`) : undefined}
          isPlaceholder={!branch.website}
          external
        />
      </div>
    </div>
  );
}

function ContactRow({ icon, value, href, external, isPlaceholder }) {
  const content = (
    <div className="flex items-center gap-2.5 text-sm group/row">
      <span className="text-gray-400 dark:text-gray-500 flex-shrink-0">{icon}</span>
      <span
        className={`${
          isPlaceholder
            ? 'text-gray-400 dark:text-gray-500 italic'
            : href
            ? 'text-blue-600 dark:text-blue-400 group-hover/row:underline'
            : 'text-gray-600 dark:text-gray-300'
        } break-all leading-snug`}
      >
        {value}
      </span>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className="block hover:bg-white/50 dark:hover:bg-slate-700 rounded-lg px-2 py-1 -mx-2 transition-colors"
      >
        {content}
      </a>
    );
  }

  return <div className="px-2 py-1 -mx-2">{content}</div>;
}

function DataBadge({ label, value }) {
  const isMissing = !value;
  return (
    <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 border border-gray-100 dark:border-slate-600">
      <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
        {label}
      </div>
      <div className={`text-sm font-semibold ${isMissing ? 'text-gray-400 dark:text-gray-500 italic' : 'text-gray-900 dark:text-white font-mono'}`}>
        {value || 'brak danych'}
      </div>
    </div>
  );
}

function VatBadge({ status }) {
  const normalizedStatus = status == null ? '' : String(status);
  const isMissing = !normalizedStatus;
  const isActive = !isMissing && (
    normalizedStatus.toLowerCase().includes('czynny') ||
    normalizedStatus.toLowerCase().includes('aktywny')
  );

  return (
    <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 border border-gray-100 dark:border-slate-600">
      <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
        Status VAT
      </div>
      <div className="flex items-center gap-1.5">
        {isMissing ? (
          <span className="text-sm font-semibold text-gray-400 dark:text-gray-500 italic">
            brak danych
          </span>
        ) : isActive ? (
          <>
            <CheckCircle size={14} className="text-emerald-500" />
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              Czynny
            </span>
          </>
        ) : (
          <>
            <XCircle size={14} className="text-red-500" />
            <span className="text-sm font-semibold text-red-600 dark:text-red-400">
              {normalizedStatus}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
