import Link from 'next/link';

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
          <li>
            <Link
              href="/clones/upbit"
              className="group flex items-center justify-between rounded-md border border-border bg-card px-4 py-3 transition-colors hover:bg-card/80"
            >
              <span className="font-medium">Upbit Dashboard</span>
              <span className="text-xs uppercase tracking-wide text-muted-foreground group-hover:text-foreground">
                /clones/upbit
              </span>
            </Link>
          </li>
        </ul>
      </nav>
    </main>
  );
}
