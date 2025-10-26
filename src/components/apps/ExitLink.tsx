import Link from 'next/link';
import { Undo2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';

type ExitLinkProps = {
  href?: string;
  label?: string;
  className?: string;
};

export function ExitLink({ href = '/', label = 'Exit', className }: ExitLinkProps) {
  return (
    <Link
      href={href}
      className={cn('flex items-center gap-1 text-lg font-extrabold', className)}
    >
      <span className="underline">{label}</span>
      <Undo2Icon className="size-5" />
    </Link>
  );
}
