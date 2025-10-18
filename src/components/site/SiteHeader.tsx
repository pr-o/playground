'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/site/ThemeToggle';
import { ProjectKind } from '@/lib/project-entries';
import { LinkedInIcon } from '@/components/icons/LinkedInIcon';

const navItems = [
  { href: '/', label: 'Home', match: (pathname: string) => pathname === '/' },
  {
    href: '/apps',
    label: ProjectKind.App,
    match: (pathname: string) => pathname.startsWith('/apps'),
  },
  {
    href: '/games',
    label: ProjectKind.Game,
    match: (pathname: string) => pathname.startsWith('/games'),
  },
];

export function SiteHeader() {
  const pathname = usePathname() ?? '/';
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    setIsHidden(pathname.startsWith('/apps/netflix'));
  }, [pathname]);

  if (isHidden) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="text-sm font-semibold uppercase tracking-wide">
          Playground
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {navItems.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-md px-3 py-2 font-medium transition-colors',
                  active
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="https://www.linkedin.com/in/sunghahhwang/"
            aria-label="Visit LinkedIn"
            className="shrink-0 rounded-full p-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring"
            target="_blank"
            rel="noreferrer"
          >
            <LinkedInIcon width={28} height={28} />
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
