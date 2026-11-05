import Link from 'next/link';

export default function SiteBrand() {
  return (
    <Link href="/" className="inline-flex shrink-0 items-center gap-2 text-white min-[360px]:gap-2.5">
      <svg width="36" height="27" viewBox="0 0 42 31" fill="currentColor" className="w-8 text-amber-400 min-[360px]:w-9" aria-hidden="true">
        <path d="M1 4h8a3 3 0 0 1 2.6 1.5L21 22l-2.4 4.2a4 4 0 0 1-7 0L1 6a1.3 1.3 0 0 1 0-2Zm16.2 1h3.4a3 3 0 0 1 2.7 1.6l2.4 4.7-4 7.1-6.2-10.9A1.7 1.7 0 0 1 17.2 5ZM40.5 4h-7.8A3 3 0 0 0 30 5.6l-9 16.6 2.2 4a4.1 4.1 0 0 0 7.2 0L41.7 6A1.3 1.3 0 0 0 40.5 4Z" />
      </svg>
      <span>
        <span className="block text-base font-extrabold leading-none tracking-tight min-[360px]:text-[1.2rem]">wypozycz.online</span>
        <span className="mt-1 hidden text-[10px] leading-none text-slate-300 min-[360px]:block">Wynajem maszyn, sprzętu i narzędzi</span>
      </span>
    </Link>
  );
}
