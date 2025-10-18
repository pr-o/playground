import { ProjectCard } from '@/components/ProjectCard';
import { ProjectEntries, ProjectKind } from '@/lib/project-entries';

export default function ClonesIndexPage() {
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
        {apps.map(({ href, title, tag, description }) => (
          <ProjectCard
            key={href}
            href={href}
            title={title}
            meta={tag}
            description={description}
            className="rounded-lg p-5"
          />
        ))}
      </section>
    </main>
  );
}
