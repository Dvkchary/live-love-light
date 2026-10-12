import type { Metadata } from 'next';
import { Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

const cormorant = Cormorant_Garamond({
  variable: '--font-serif',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Live Love Light — LIGHT SOMETHING BEAUTIFUL | Premium Handcrafted Candles',
  description:
    'Discover handcrafted candles designed to bring warmth, fragrance, and beauty to your everyday moments. Explore Teddy Candles, Flower Candles, Rose Candles, and Gift Collections. Shop directly on Amazon, Flipkart, and Meesho.',
  keywords: [
    'Live Love Light',
    'Handcrafted Candles India',
    'Soy Wax Candles',
    'Teddy Candle',
    'Rose Candle',
    'Lotus Candle',
    'Royal Oud Candle',
    'Buy Candles Amazon Flipkart Meesho'
  ],
  openGraph: {
    title: 'Live Love Light — Handcrafted Scented Candles',
    description: 'Light Something Beautiful. Premium handcrafted botanical soy wax candles.',
    images: ['/images/05-lighting-moment.png'],
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${plusJakarta.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-[#FCFBF7] text-[#231B15] font-sans antialiased selection:bg-[#F4E8C1] selection:text-[#231B15]">
        <AuthProvider>
          <div className="flex-1 flex flex-col">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
