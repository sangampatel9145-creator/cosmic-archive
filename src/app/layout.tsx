import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';

import '@/styles/globals.css';

const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cosmic-archive.example';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Cosmic Archive — Explore the Infinite',
  description:
    'An interactive universe rendered in real time. Six celestial destinations, warp travel between them, and a handful of things that are not on the chart.',
  applicationName: 'Cosmic Archive',
  openGraph: {
    title: 'Cosmic Archive',
    description: 'Travel between worlds instead of scrolling through pages.',
    type: 'website',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cosmic Archive',
    description: 'Travel between worlds instead of scrolling through pages.',
  },
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = {
  themeColor: '#050816',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  readonly children: ReactNode;
}): JSX.Element {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body className="h-full bg-space-primary antialiased">{children}</body>
    </html>
  );
}
