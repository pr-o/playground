import Link from 'next/link';
import { cloneEntries } from '@/lib/clones';

export default function ClonesIndexPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Clone Library</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Explore interactive recreations of popular products. Each clone runs entirely in
          the browser so you can review behavior without additional setup.
        </p>
      </header>
      <section className="grid gap-4 md:grid-cols-2">
        {cloneEntries.map((clone) => (
          <Link
            key={clone.href}
            href={clone.href}
            className="group rounded-lg border border-border bg-card p-5 transition-colors hover:bg-card/80"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">{clone.title}</h2>
              <span className="text-[0.65rem] uppercase tracking-wide text-muted-foreground group-hover:text-foreground">
                {clone.href}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{clone.description}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
