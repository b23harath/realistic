import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  variable: '--font-grotesk',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0a0a0a',
};

export const metadata: Metadata = {
  title: 'STUDIO // SPACES — Ultra-Realistic 3D Interior Architecture Showcase',
  description:
    'An ultra-realistic 3D interior architecture showcase built with Next.js App Router, React Three Fiber, Three.js, and brutalist editorial typography. Pure raw textures, balanced lighting, and quiet concrete.',
  keywords: [
    '3D Interior Architecture',
    'React Three Fiber',
    'Three.js',
    'WebGL',
    'Brutalist Architecture',
    'Luxury Interior Design',
    'Next.js 3D',
  ],
  authors: [{ name: 'STUDIO // SPACES Atelier' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-[#0a0a0a] text-white overflow-x-hidden selection:bg-white selection:text-black">
        {children}
      </body>
    </html>
  );
}
