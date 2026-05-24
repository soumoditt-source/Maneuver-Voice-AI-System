import './globals.css';
import { Space_Grotesk, Orbitron } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';
import type { Metadata } from 'next';

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
});

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ],
};

export const metadata: Metadata = {
  title: 'Maneuver | The AI Founder Experience',
  description: 'Interact with Husain, the visionary AI founder behind Maneuver. Experience ultra-low latency voice conversations, intelligent insights, and the future of interaction.',
  openGraph: {
    title: 'Maneuver | The AI Founder Experience',
    description: 'Experience ultra-low latency voice conversations with Husain, the AI founder.',
    type: 'website',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${orbitron.variable} font-space antialiased bg-white dark:bg-black text-black dark:text-white transition-colors duration-500`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
