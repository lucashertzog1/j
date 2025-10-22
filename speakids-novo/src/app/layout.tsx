
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/header';
import { AppBackground } from '@/components/app-background';
import { PT_Sans } from 'next/font/google';

const ptSans = PT_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '700'],
  variable: '--font-pt-sans',
});

export const metadata: Metadata = {
  title: 'Speakids',
  description: 'Aprenda inglês de um jeito divertido!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${ptSans.variable}`}>
      <body className="font-body antialiased" suppressHydrationWarning>
          <AppBackground>
            <div className="min-h-screen flex flex-col relative z-10">
              <Header />
              <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8">
                {children}
              </main>
            </div>
          </AppBackground>
          <Toaster />
      </body>
    </html>
  );
}

    