"use client";

import React, { Suspense, useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { trackEvent } from '../lib/gtag';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '../utils/supabase/client';
import { ChevronDown, CirclePlus, Heart, House, Map as MapIcon, Menu, Moon, Plus, Search, Sun, UserRound, X } from 'lucide-react';
import SiteBrand from './SiteBrand';
import { MARKET_CATEGORIES, SEO_CATEGORY_SLUGS } from '../lib/categories';

const primaryLinks = [
  { href: '/jak-to-dziala', label: 'Jak to działa' },
  { href: '/dla-wynajmujacych', label: 'Dla wypożyczalni' },
];

const resourceLinks = [
  { href: '/katalog', label: 'Katalog firm' },
  { href: '/umowy', label: 'Wzory umów' },
  { href: '/blog', label: 'Poradniki' },
  { href: '/kontakt', label: 'Pomoc i kontakt' },
  { href: '/regulamin', label: 'Regulamin' },
  { href: '/polityka-prywatnosci', label: 'Polityka prywatności' },
];

const navItem = 'flex min-h-11 items-center whitespace-nowrap rounded-lg px-3 hover:bg-white/10 lg:px-2 xl:px-3';
const dropdown = 'rounded-lg bg-slate-900 p-1.5 lg:absolute lg:top-full lg:w-60 lg:border lg:border-white/10 lg:shadow-xl';

function browseShortcuts(searchParams) {
  const params = new URLSearchParams(searchParams?.toString());
  params.delete('view');
  const searchHref = params.size ? `/szukaj?${params}` : '/szukaj';
  params.set('view', 'map');

  return [
    { id: 'home', href: '/', label: 'Start', icon: House },
    { id: 'map', href: `/szukaj?${params}`, label: 'Mapa', icon: MapIcon },
    { id: 'search', href: searchHref, label: 'Szukaj', icon: Search },
    { id: 'favorites', href: '/ulubione', label: 'Ulubione', icon: Heart },
  ];
}

function ShortcutLinks({ shortcuts, actions, active, closeMenu }) {
  return [...shortcuts, ...actions].map(({ id, href, label, icon: Icon, action }) => (
    <Link key={id} href={href} onClick={action || closeMenu} className={`market-shortcut ${id === active ? 'text-market-yellow' : ''}`} aria-current={id === active ? 'page' : undefined}>
      <Icon size={19} aria-hidden="true" /> {label}
    </Link>
  ));
}

const SLIDE_OUT = { duration: 180, easing: 'ease-in', fill: 'forwards' };
const SLIDE_IN = { duration: 240, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' };
const SLIDE_BACK = { duration: 180, easing: 'ease-out' };
const offset = (x) => `translate3d(${x}, 0, 0)`;

function MobileShortcuts({ active, onSearchPage, menuOpen, ...props }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const leaving = useRef(null);
  const shortcuts = browseShortcuts(onSearchPage ? params : null);
  const current = onSearchPage && params.get('view') === 'map' ? 'map' : active;
  const currentIndex = shortcuts.findIndex(({ id }) => id === current);
  const previous = shortcuts[currentIndex - 1]?.href;
  const next = shortcuts[currentIndex + 1]?.href;

  const route = `${pathname}?${params}`;

  // The new page is in place (still off-screen), so bring it in from the side the finger moved away from.
  useEffect(() => {
    if (!leaving.current) return;
    const { animation, direction, fallback } = leaving.current;
    leaving.current = null;
    clearTimeout(fallback);
    animation.cancel();
    document.getElementById('main-content')?.animate({ transform: [offset(`${-direction * 100}%`), 'none'] }, SLIDE_IN);
  }, [route]);

  useEffect(() => {
    if (menuOpen) return;
    const mobile = window.matchMedia('(max-width: 1023px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const page = document.getElementById('main-content');
    let start = null;

    const settle = (dx) => {
      page.style.transform = '';
      if (dx) page.animate({ transform: [offset(`${dx}px`), 'none'] }, SLIDE_BACK);
    };

    const leave = (destination, dx) => {
      const direction = Math.sign(dx);
      page.style.transform = '';
      const animation = page.animate({ transform: [offset(`${dx}px`), offset(`${direction * 100}%`)] }, SLIDE_OUT);
      animation.onfinish = () => router.push(destination);
      // A navigation that never finishes must not leave the page off-screen.
      const fallback = setTimeout(() => {
        leaving.current = null;
        animation.cancel();
        settle(direction * window.innerWidth);
      }, 6000);
      leaving.current = { animation, direction, fallback };
    };

    const startSwipe = (event) => {
      start = null;
      const target = event.target;
      if (!mobile.matches || event.touches.length !== 1 || !(target instanceof Element)) return;
      if (!target.closest('body > main, .mobile-market-nav')) return;
      if (target.closest('button, input, select, textarea, label, [contenteditable], dialog, [data-no-tab-swipe]')) return;

      const { clientX: x, clientY: y } = event.touches[0];
      // Keep the browser's edge gestures available.
      if (x < 20 || x > window.innerWidth - 20) return;
      start = { x, y, dx: 0, horizontal: null };
    };

    const moveSwipe = (event) => {
      if (!start) return;
      if (event.touches.length !== 1) return cancelSwipe();
      const dx = event.touches[0].clientX - start.x;
      const dy = event.touches[0].clientY - start.y;
      if (start.horizontal === null) {
        if (Math.hypot(dx, dy) < 10) return;
        start.horizontal = Math.abs(dx) > Math.abs(dy) * 1.5 && window.getSelection()?.isCollapsed !== false;
      }
      if (!start.horizontal) return;
      // No page on that side: resist the drag instead of following the finger.
      start.dx = (dx < 0 ? next : previous) ? dx : dx * 0.25;
      if (!reducedMotion.matches) page.style.transform = offset(`${start.dx}px`);
    };

    const endSwipe = () => {
      if (!start) return;
      const { dx, horizontal } = start;
      start = null;
      if (!horizontal) return;
      const destination = Math.abs(dx) >= 65 && (dx < 0 ? next : previous);
      if (reducedMotion.matches) {
        if (destination) router.push(destination);
      } else if (destination) {
        leave(destination, dx);
      } else {
        settle(dx);
      }
    };

    const cancelSwipe = () => {
      if (start?.horizontal && !reducedMotion.matches) settle(start.dx);
      start = null;
    };

    const events = { touchstart: startSwipe, touchmove: moveSwipe, touchend: endSwipe, touchcancel: cancelSwipe };
    Object.entries(events).forEach(([type, handler]) => document.addEventListener(type, handler, { passive: true, capture: true }));
    return () => {
      Object.entries(events).forEach(([type, handler]) => document.removeEventListener(type, handler, true));
      page.style.transform = '';
    };
  }, [menuOpen, next, previous, router]);

  return <ShortcutLinks {...props} active={current} shortcuts={shortcuts} />;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const header = useRef(null);

  useEffect(() => {
    if (!openDropdown) return undefined;
    const closeOutside = (event) => {
      if (!header.current?.contains(event.target)) setOpenDropdown(null);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [openDropdown]);

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
  const addHref = user ? '/dashboard/ogloszenia#dodaj' : '/login?returnTo=%2Fdashboard%2Fogloszenia%23dodaj';
  const closeMenu = () => {
    setIsOpen(false);
    setOpenDropdown(null);
  };
  const trackAdd = () => {
    closeMenu();
    trackEvent('click_add_listing', { source: 'navbar' });
  };

  const toggleDropdown = (name) => setOpenDropdown((current) => current === name ? null : name);
  const pathParts = pathname?.split('/').filter(Boolean) || [];
  const categoryPage = SEO_CATEGORY_SLUGS.includes(pathParts[0]) && pathParts.length <= 3;
  const activeShortcut = pathname === '/' ? 'home'
    : categoryPage || pathname === '/szukaj' ? 'search'
    : pathname === '/ulubione' ? 'favorites' : null;
  const shortcutActions = [
    { id: 'add', href: addHref, label: 'Dodaj', icon: CirclePlus, action: trackAdd },
    { id: 'account', href: accountHref, label: 'Konto', icon: UserRound },
  ];

  return (
    <>
      <header ref={header} className="sticky top-0 z-50 border-b border-white/10 bg-market-navy text-white" onKeyDown={(event) => { if (event.key === 'Escape') closeMenu(); }}>
        <nav aria-label="Nawigacja główna" className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 xl:gap-4">
          <SiteBrand />

          <div id="site-menu" className={`${isOpen ? 'flex' : 'hidden'} absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] flex-col overflow-y-auto border-b border-white/10 bg-market-navy px-4 pb-4 pt-2 text-sm font-medium shadow-xl lg:static lg:flex lg:max-h-none lg:flex-row lg:items-center lg:overflow-visible lg:border-0 lg:bg-transparent lg:p-0 lg:text-[13px] lg:shadow-none xl:gap-1 xl:text-sm`}>
            <Link href="/szukaj" onClick={closeMenu} className={navItem} aria-label="Znajdź sprzęt">
              <span className="lg:max-xl:hidden">Znajdź sprzęt</span>
              <span className="hidden lg:max-xl:inline">Szukaj</span>
            </Link>
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('categories')}
                aria-expanded={openDropdown === 'categories'}
                aria-controls="nav-categories"
                className={`${navItem} w-full justify-between gap-1.5`}
              >
                Kategorie <ChevronDown size={15} className={openDropdown === 'categories' ? 'rotate-180' : ''} aria-hidden="true" />
              </button>
              <div id="nav-categories" hidden={openDropdown !== 'categories'} className={dropdown}>
                {MARKET_CATEGORIES.map(({ value, label, hub }) => (
                  <Link key={value} href={`/${hub}`} onClick={closeMenu} className={navItem}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {primaryLinks.map(({ href, label }) => (
              <Link key={href} href={href} onClick={closeMenu} className={navItem}>{label}</Link>
            ))}
            <div className="relative">
              <button type="button" onClick={() => toggleDropdown('resources')} aria-expanded={openDropdown === 'resources'} aria-controls="nav-resources" className={`${navItem} w-full justify-between gap-1.5`}>
                Więcej <ChevronDown size={15} className={openDropdown === 'resources' ? 'rotate-180' : ''} aria-hidden="true" />
              </button>
              <div id="nav-resources" hidden={openDropdown !== 'resources'} className={`${dropdown} lg:right-0`}>
                {resourceLinks.map(({ href, label }) => (
                  <Link key={href} href={href} onClick={closeMenu} className={navItem}>{label}</Link>
                ))}
                {isAdmin && <Link href="/admin" onClick={closeMenu} className={`${navItem} text-amber-300`}>Admin</Link>}
                <button type="button" onClick={toggleDarkMode} aria-pressed={isDark} className={`${navItem} w-full gap-2`}>
                  {isDark ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />} Tryb ciemny
                </button>
              </div>
            </div>
            <Link href={addHref} onClick={trackAdd} className="market-action mt-2 lg:hidden"><Plus size={17} /> Dodaj ogłoszenie</Link>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link href="/ulubione" aria-label="Ulubione" className="hidden size-11 items-center justify-center rounded-lg hover:bg-white/10 lg:flex">
              <Heart size={18} aria-hidden="true" />
            </Link>
            <Link href={accountHref} onClick={closeMenu} aria-label={user ? 'Mój panel' : 'Zaloguj się'} className="flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-2.5 text-sm font-medium hover:bg-white/10">
              <UserRound size={18} aria-hidden="true" />
              <span className="hidden xl:inline">{user ? 'Mój panel' : 'Zaloguj się'}</span>
            </Link>
            <Link href={addHref} onClick={trackAdd} className="market-action hidden whitespace-nowrap lg:inline-flex">
              <Plus size={17} aria-hidden="true" /> Dodaj ogłoszenie
            </Link>
            <button
              type="button"
              onClick={() => isOpen ? closeMenu() : setIsOpen(true)}
              aria-label={isOpen ? 'Zamknij menu' : 'Otwórz menu'}
              aria-expanded={isOpen}
              aria-controls="site-menu"
              className="-mr-2 flex size-11 shrink-0 items-center justify-center rounded-lg hover:bg-white/10 lg:hidden"
            >
              {isOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
            </button>
          </div>
        </nav>
      </header>

      {activeShortcut && (
        <nav aria-label="Skróty" className="mobile-market-nav fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-white/10 bg-market-navy px-1 pb-[env(safe-area-inset-bottom)] text-white lg:hidden">
          <Suspense fallback={<ShortcutLinks shortcuts={browseShortcuts()} actions={shortcutActions} active={activeShortcut} closeMenu={closeMenu} />}>
            <MobileShortcuts actions={shortcutActions} active={activeShortcut} closeMenu={closeMenu} onSearchPage={pathname === '/szukaj'} menuOpen={isOpen} />
          </Suspense>
        </nav>
      )}
    </>
  );
}
