import '../styles/globals.css';
import { Inter } from 'next/font/google';
import MantineProvider from '../components/common/MantineProvider';
import { WalletProvider } from '../context/WalletContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Plateforme de tokenisation d\'actifs XRPL',
  description: 'Gérez et échangez des actifs réels tokenisés sur le XRP Ledger',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <MantineProvider>
          <WalletProvider>
            <Navbar />
            <main style={{ minHeight: 'calc(100vh - 150px)' }}>
              <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
                {children}
              </div>
            </main>
            <Footer />
          </WalletProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
