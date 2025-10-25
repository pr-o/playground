import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { UpbitProvider } from '@/providers/upbit-provider';
import { SiteHeader } from '@/components/site/SiteHeader';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Upbit Insights Dashboard',
  description:
    'Real-time order book, chart, and trade insights powered by the Upbit Open API.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <UpbitProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <div className="flex-1">{children}</div>
          </div>
        </UpbitProvider>
      </body>
    </html>
  );
}
