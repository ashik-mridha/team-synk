import { Hind_Siliguri, Inter, JetBrains_Mono } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';
const body = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const bengali = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-bengali',
  display: 'swap',
});
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });
export const metadata = {
  title: { default: 'TeamSync', template: '%s · TeamSync' },
  description: 'Real-time collaborative project management for modern teams.',
};
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAFB' },
    { media: '(prefers-color-scheme: dark)', color: '#16171A' },
  ],
};
export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${body.variable} ${bengali.variable} ${mono.variable}`}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
