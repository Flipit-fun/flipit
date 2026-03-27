import type { Metadata } from 'next';
import { Instrument_Serif, Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const instrumentSerif = Instrument_Serif({
  variable: '--font-serif',
  weight: ['400'],
  subsets: ['latin'],
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'Flip — Solana Coin Flip',
  description: 'Provably fair Solana coin flip. Double or nothing.',
  metadataBase: new URL('https://flip.so'),
  openGraph: {
    title: 'Flip — Solana Coin Flip',
    description: 'Provably fair Solana coin flip. Double or nothing.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geist.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}
        style={{ fontFamily: 'var(--font-geist), system-ui, sans-serif' }}
      >
        {children}
      </body>
    </html>
  );
}
