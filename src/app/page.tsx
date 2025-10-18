import type { Metadata } from 'next';
import { ProjectCard } from '@/components/ProjectCard';
import { ProjectEntries } from '@/lib/project-entries';

const title = 'Playground – Things in Playground';

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
      'Explore interactive Playground projects featuring immersive apps and games built with Next.js.',
  },
};

const uniqueKinds = [...new Set(ProjectEntries.map(({ kind }) => kind))];

export default function Home() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Things in Playground</h1>
        <p className="text-md text-muted-foreground">
          Choose one of the available projects to explore.
        </p>
      </header>

      <section className="mt-2">
        {uniqueKinds.map((kind) => {
          const filtered = ProjectEntries.filter((item) => item.kind === kind);
          return (
            <div key={kind} className="space-y-3 mb-6">
              <h1 className="text-2xl font-semibold">{kind}</h1>
              {filtered.map(({ href, title, tag, description }) => (
                <ProjectCard
                  key={href}
                  href={href}
                  title={title}
                  meta={tag}
                  description={description}
                  className="rounded-md px-4 py-3"
                />
              ))}
            </div>
          );
        })}
      </section>
    </main>
  );
}
