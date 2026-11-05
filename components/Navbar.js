"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { trackEvent } from '../lib/gtag';
import { usePathname } from 'next/navigation';
import { createClient } from '../utils/supabase/client';
import { ChevronDown, CirclePlus, House, LayoutGrid, Menu, Moon, Plus, Search, Sun, UserRound, X } from 'lucide-react';
import SiteBrand from './SiteBrand';
import { SEO_CATEGORIES } from '../lib/categories';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));

    const supabase = createClient();
    let isMounted = true;
    let roleRequestId = 0;

    const applyUserRole = async (currentUser) => {
      const requestId = ++roleRequestId;

      if (!isMounted) return;
      setUser(currentUser);
      setIsAdmin(false);

      if (!currentUser) return;

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentUser.id)
          .maybeSingle();

        if (isMounted && requestId === roleRequestId) {
          setIsAdmin(profile?.role === 'admin');
        }
      } catch {
        if (isMounted && requestId === roleRequestId) {
          setIsAdmin(false);
        }
      }
    };

    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      applyUserRole(error ? null : data?.user ?? null);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => {
        applyUserRole(session?.user ?? null);
      }, 0);
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setCategoriesOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
    }
  }, [user]);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const toggleDarkMode = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  const accountHref = user ? '/dashboard' : '/login';
  const addHref = user ? '/dashboard' : '/login?returnTo=/dashboard';
  const closeMenu = () => {
    setIsOpen(false);
    setCategoriesOpen(false);
  };
  const trackAdd = () => {
    closeMenu();
    trackEvent('click_add_listing', { source: 'navbar' });
  };

  const links = [
    { href: '/#jak-to-dziala', label: 'Jak to działa?' },
    { href: '/#dla-wynajmujacych', label: 'Dla wynajmujących' },
    { href: '/katalog', label: 'Katalog firm' },
    { href: '/kontakt', label: 'Kontakt' },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950 text-white" onKeyDown={(event) => { if (event.key === 'Escape') closeMenu(); }}>
        <nav aria-label="Nawigacja główna" className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 lg:gap-5">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Zamknij menu' : 'Otwórz menu'}
            aria-expanded={isOpen}
            aria-controls="site-menu"
            className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg hover:bg-white/10 lg:hidden"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <SiteBrand />

          <div id="site-menu" className={`${isOpen ? 'flex' : 'hidden'} absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] flex-col overflow-y-auto border-b border-white/10 bg-slate-950 px-4 pb-4 pt-2 text-sm font-medium shadow-xl lg:static lg:flex lg:max-h-none lg:flex-row lg:items-center lg:gap-1 lg:overflow-visible lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none`}>
            <div className="relative">
              <button
                type="button"
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                aria-expanded={categoriesOpen}
                aria-controls="nav-categories"
                className="flex min-h-11 w-full items-center justify-between gap-1.5 rounded-lg px-3 hover:bg-white/10"
              >
                Kategorie <ChevronDown size={15} className={categoriesOpen ? 'rotate-180' : ''} aria-hidden="true" />
              </button>
              <div id="nav-categories" hidden={!categoriesOpen} className="rounded-lg bg-slate-900 p-1.5 lg:absolute lg:top-full lg:w-56 lg:border lg:border-white/10 lg:shadow-xl">
                {Object.values(SEO_CATEGORIES).map((cat) => (
                  <Link key={cat.slug} href={`/${cat.slug}`} onClick={closeMenu} className="block rounded-md px-3 py-2.5 hover:bg-white/10">
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {links.map(({ href, label }) => (
              <Link key={href} href={href} onClick={closeMenu} className="flex min-h-11 items-center rounded-lg px-3 hover:bg-white/10">{label}</Link>
            ))}
            <Link href="/blog" onClick={closeMenu} className="flex min-h-11 items-center rounded-lg px-3 hover:bg-white/10 lg:hidden">Poradniki</Link>
            <Link href="/umowy" onClick={closeMenu} className="flex min-h-11 items-center rounded-lg px-3 hover:bg-white/10 lg:hidden">Wzory umów</Link>
            {isAdmin && (
              <Link href="/admin" onClick={closeMenu} className="flex min-h-11 items-center rounded-lg px-3 text-amber-300 hover:bg-white/10">Admin</Link>
            )}
            <button type="button" onClick={toggleDarkMode} aria-label="Przełącz tryb ciemny" aria-pressed={isDark} className="flex min-h-11 items-center gap-2 rounded-lg px-3 hover:bg-white/10">
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
              <span className="lg:sr-only">Tryb ciemny</span>
            </button>
            <Link href={addHref} onClick={trackAdd} className="market-action mt-2 lg:hidden"><Plus size={17} /> Dodaj ogłoszenie</Link>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link href={accountHref} onClick={closeMenu} aria-label={user ? 'Mój panel' : 'Zaloguj się'} className="flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-2.5 text-sm font-medium hover:bg-white/10">
              <UserRound size={18} aria-hidden="true" />
              <span className="hidden xl:inline">{user ? 'Mój panel' : 'Zaloguj się'}</span>
            </Link>
            <Link href={addHref} onClick={trackAdd} className="market-action hidden whitespace-nowrap lg:inline-flex">
              <Plus size={17} aria-hidden="true" /> Dodaj ogłoszenie
            </Link>
          </div>
        </nav>
      </header>

      {pathname === '/' && (
        <nav aria-label="Skróty" className="mobile-market-nav fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-white/10 bg-slate-950 px-2 pb-[env(safe-area-inset-bottom)] text-white lg:hidden">
          <Link href="/" onClick={closeMenu} className="market-shortcut text-amber-400" aria-current="page"><House size={19} aria-hidden="true" /> Start</Link>
          <Link href="/#szukaj" onClick={closeMenu} className="market-shortcut"><Search size={19} aria-hidden="true" /> Szukaj</Link>
          <Link href={addHref} onClick={trackAdd} className="market-shortcut"><CirclePlus size={19} aria-hidden="true" /> Dodaj</Link>
          <Link href="/#kategorie" onClick={closeMenu} className="market-shortcut"><LayoutGrid size={19} aria-hidden="true" /> Kategorie</Link>
          <Link href={accountHref} onClick={closeMenu} className="market-shortcut"><UserRound size={19} aria-hidden="true" /> Konto</Link>
        </nav>
      )}
    </>
  );
}
