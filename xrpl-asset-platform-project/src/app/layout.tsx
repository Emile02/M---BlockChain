import { Inter } from 'next/font/google';
import './globals.css';
import MantineProvider from '../components/layout/MantineProvider';
import { WalletProvider } from '../context/WalletContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { ReactNode } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'XRPL Asset Platform',
  description: 'Tokenisez, gérez et échangez vos actifs sur XRP Ledger',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <MantineProvider>
          <WalletProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </WalletProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
