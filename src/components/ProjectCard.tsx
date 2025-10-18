import Link from 'next/link';
import { cn } from '@/lib/utils';

type ProjectCardProps = {
  href: string;
  title: string;
  meta: string;
  description: string;
  className?: string;
};

export function ProjectCard({
  href,
  title,
  meta,
  description,
  className,
}: ProjectCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group block border border-border bg-card transition-colors hover:bg-card/80',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className={'text-lg font-semibold'}>{title}</span>
        <span className="text-xs uppercase tracking-wide text-muted-foreground group-hover:text-foreground">
          {meta}
        </span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </Link>
  );
}
