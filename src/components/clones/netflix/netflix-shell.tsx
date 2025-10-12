'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { NETFLIX_ROUTE_BASE } from '@/lib/netflix/constants';

type NavLink = {
  href: string;
  label: string;
  isActive: (pathname: string) => boolean;
};

const NAV_LINKS: NavLink[] = [
  {
    href: NETFLIX_ROUTE_BASE,
    label: 'Home',
    isActive: (pathname) => pathname === NETFLIX_ROUTE_BASE,
  },
  {
    href: `${NETFLIX_ROUTE_BASE}/shows`,
    label: 'Shows',
    isActive: (pathname) => pathname.startsWith(`${NETFLIX_ROUTE_BASE}/shows`),
  },
  {
    href: `${NETFLIX_ROUTE_BASE}/movies`,
    label: 'Movies',
    isActive: (pathname) => pathname.startsWith(`${NETFLIX_ROUTE_BASE}/movies`),
  },
  {
    href: `${NETFLIX_ROUTE_BASE}/new-popular`,
    label: 'New & Popular',
    isActive: (pathname) => pathname.startsWith(`${NETFLIX_ROUTE_BASE}/new-popular`),
  },
  {
    href: `${NETFLIX_ROUTE_BASE}/my-list`,
    label: 'My List',
    isActive: (pathname) => pathname.startsWith(`${NETFLIX_ROUTE_BASE}/my-list`),
  },
];

type NetflixShellProps = {
  children: ReactNode;
};

export function NetflixShell({ children }: NetflixShellProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navLinks = useMemo(() => NAV_LINKS, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between px-6 transition-colors duration-300',
          scrolled
            ? 'bg-black/90 backdrop-blur'
            : 'bg-gradient-to-b from-black/90 to-transparent',
        )}
      >
        <div className="flex items-center space-x-6">
          <Link
            href={NETFLIX_ROUTE_BASE}
            className="text-2xl font-extrabold text-red-600"
          >
            NETFLIX
          </Link>
          <Link href={'/'} className="text-lg font-extrabold">
            <span className="inline underline ">Exit</span>
          </Link>
          <nav className="ml-4 hidden gap-6 text-sm font-medium md:flex">
            {navLinks.map((link) => {
              const active = link.isActive(pathname);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'transition-colors hover:text-white',
                    active ? 'text-white' : 'text-white/70',
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div />
        <div className="flex items-center gap-4 text-sm font-medium text-white/70 md:text-base">
          <Image
            src="/assets/clones/account-profile.png"
            alt="Profile picture"
            width={32}
            height={32}
            className="size-8 rounded"
          />
        </div>
      </header>
      <nav className="mt-16 flex gap-4 overflow-x-auto px-6 pb-3 text-sm font-medium text-white/70 md:hidden">
        {navLinks.map((link) => {
          const active = link.isActive(pathname);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex-shrink-0 rounded-full px-4 py-1 transition-colors',
                active
                  ? 'bg-white text-black'
                  : 'bg-white/10 hover:bg-white/20 hover:text-white',
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <main className="pt-4 md:pt-16">{children}</main>
    </div>
  );
}
