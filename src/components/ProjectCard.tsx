'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogDescription,
  DialogTitle,
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
          className="group block w-full cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label={`Show details for ${title}`}
        >
          <div
            className={cn(
              'flex h-full w-full flex-col items-start gap-2 rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card/95 to-card/85 p-5 text-left shadow-[0_10px_25px_rgba(15,15,26,0.08)] ring-1 ring-border/50 transition duration-200 hover:-translate-y-[1px] hover:border-primary/40 hover:ring-primary/10 group-hover:bg-card',
              className,
            )}
          >
            <div className="flex w-full items-center justify-between gap-3">
              <span className="text-lg font-semibold">{title}</span>
              <span className="text-xs uppercase tracking-wide text-muted-foreground group-hover:text-foreground">
                {tag}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          </div>
        </button>
      </DialogTrigger>

      <DialogContent
        // onInteractOutside={(e) => {
        //   e.preventDefault();
        // }}
        className="max-w-3xl gap-0 rounded-none border-none bg-transparent p-0 shadow-none sm:max-w-4xl"
      >
        <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card text-card-foreground shadow-2xl">
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
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
