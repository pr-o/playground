import Link from 'next/link';
import { cloneEntries } from '@/lib/clones';

export default function Home() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Available Pages</h1>
        <p className="text-sm text-muted-foreground">
          Choose one of the available clones to explore.
        </p>
      </header>
      <nav>
        <ul className="space-y-3">
          {cloneEntries.map((clone) => (
            <li key={clone.href}>
              <Link
                href={clone.href}
                className="group block rounded-md border border-border bg-card px-4 py-3 transition-colors hover:bg-card/80"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{clone.title}</span>
                  <span className="text-xs uppercase tracking-wide text-muted-foreground group-hover:text-foreground">
                    {clone.href}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{clone.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
