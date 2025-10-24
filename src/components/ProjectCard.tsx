'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogDescription,
  DialogTitle,
  DialogCloseButton,
} from '@/components/ui/dialog';
import type { ProjectEntry } from '@/lib/project-entries';
import { cn } from '@/lib/utils';

type ProjectCardProps = {
  project: ProjectEntry;
  className?: string;
};

export function ProjectCard({ project, className }: ProjectCardProps) {
  const { href, title, tag, description, thumbnail, thumbnailAlt, techStack } = project;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            'group w-full border border-border bg-card text-left transition-colors cursor-pointer hover:bg-card/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            className,
          )}
          aria-label={`Show details for ${title}`}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-lg font-semibold">{title}</span>
            <span className="text-xs uppercase tracking-wide text-muted-foreground group-hover:text-foreground">
              {tag}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </button>
      </DialogTrigger>

      <DialogContent className="bg-transparent p-0">
        <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-border/80 bg-card text-card-foreground shadow-2xl">
          <DialogCloseButton />
          <div className="grid gap-8 p-6 lg:grid-cols-[300px_minmax(0,1fr)]">
            <div className="relative h-[300px] w-[300px] overflow-hidden rounded-2xl bg-muted sm:mx-auto lg:mx-0">
              <Image
                src={thumbnail}
                alt={thumbnailAlt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 640px"
                loading="lazy"
              />
            </div>
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {tag}
                </span>
                <DialogTitle className="text-2xl font-semibold leading-tight">
                  {title}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {description}
                </DialogDescription>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Tech stack
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {techStack.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-auto flex flex-col gap-2">
                <Link
                  href={href}
                  className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  Visit project
                </Link>
                <span className="text-xs text-muted-foreground">
                  Opens the interactive Playground build in a dedicated page.
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
