import { TRPCProvider } from '@/trpc/client';
import React from 'react';

export default function YoutubeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <TRPCProvider>{children}</TRPCProvider>;
}
