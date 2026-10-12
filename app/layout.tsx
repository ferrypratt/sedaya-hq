import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sedaya Property — Operations HQ',
  description: 'Internal Operations Portal for Branding, Marketing & Research Division - Sedaya Property',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-paper-white text-ink-black font-sans">
        {children}
      </body>
    </html>
  );
}
