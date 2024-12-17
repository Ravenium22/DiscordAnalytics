import type { Metadata } from 'next'
import { Outfit } from 'next/font/google' // Import Outfit font
import '../styles/globals.css'
import type { AppProps } from 'next/app';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'], // Include weights you need
  variable: '--font-outfit', // Optional: Set as CSS variable
});
function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export const metadata: Metadata = {
  title: 'Discord Analytics',
  description: 'Discover insights about Discord users and their interactions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} bg-dark`}>
        {children}
        <footer className="bg-dark text-secondary/80 py-6 text-center border-t border-secondary/5 font-outfit mt-8">
          <p>
            Made by{' '}
            <a
              href="https://x.com/RaveniumNFT"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Ravenium
            </a>
          </p>
          <p className="mt-1">
            X:{' '}
            <a
              href="https://x.com/RaveniumNFT"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              RaveniumNFT
            </a>
            {' | '} Discord:{' '}
            <a
              href="https://discord.com/users/ravenium22"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              ravenium22
            </a>
          </p>
        </footer>
      </body>
    </html>
  )
}