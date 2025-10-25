import type { Metadata } from 'next';
import { ProjectCard } from '@/components/ProjectCard';
import { ProjectEntries, ProjectKind } from '@/lib/project-entries';

const title = 'Apps - Playground';

export const metadata: Metadata = {
  title,
  description:
    'Browse the curated Playground projects, including interactive apps and games built with Next.js and modern UI patterns.',
  openGraph: {
    title,
    description:
      'Discover interactive apps and games crafted in the Playground with polished Next.js experiences.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description:
      'Discover interactive apps and games crafted in the Playground with polished Next.js experiences.',
  },
};

export default function AppsIndexPage() {
  const apps = ProjectEntries.filter(({ kind }) => kind === ProjectKind.App);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Apps</h1>
        <p className="max-w-2xl text-md text-muted-foreground">
          Explore interactive recreations of popular apps.
        </p>
      </header>
      <section className="grid gap-4 md:grid-cols-2">
        {apps.map((entry) => (
          <ProjectCard key={entry.href} project={entry} className="rounded-lg p-5" />
        ))}
      </section>
    </main>
  );
}
