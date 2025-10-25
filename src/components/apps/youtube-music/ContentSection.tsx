import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ContentSectionProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  headingClassName?: string;
};

export function ContentSection({
  title,
  description,
  action,
  children,
  className,
  headingClassName,
}: ContentSectionProps) {
  return (
    <section className={cn('space-y-4', className)}>
      <header className={cn('flex flex-col gap-2', headingClassName)}>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-music-primary">{title}</h2>
          {action}
        </div>
        {description && <p className="text-sm text-music-muted">{description}</p>}
      </header>
      {children}
    </section>
  );
}
