import '@/frontend/styles/globals.css';
import Navbar from '@/frontend/components/Navbar';

export const metadata = {
  title: 'WEB POINT',
  description: 'Gerenciamento de Produtos – WEB POINT',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body style={{ minHeight: '100vh', background: 'var(--black)', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          {children}
        </main>
        <footer style={{ borderTop: '1px solid var(--border)', padding: '18px 0', textAlign: 'center', color: '#333', fontSize: '13px' }}>
          <div className="container">
            <span style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#e5192a', letterSpacing: '2px', marginRight: '8px' }}>WEB POINT</span>
            © {new Date().getFullYear()}
          </div>
        </footer>
      </body>
    </html>
  );
}
