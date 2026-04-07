'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface NavUser { id: string; nome: string; email: string; tipo: 'USER' | 'ADMIN'; }

export default function Navbar() {
  const [user, setUser] = useState<NavUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(u => { setUser(u); setReady(true); })
      .catch(() => setReady(true));
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setMenuOpen(false);
    router.push('/login');
    router.refresh();
  };

  const navLink = (href: string, label: string) => (
    <a
      href={href}
      style={{ color: '#999', fontSize: '14px', fontWeight: 500, transition: 'color 0.2s' }}
      onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
      onMouseLeave={e => (e.currentTarget.style.color = '#999')}
    >
      {label}
    </a>
  );

  return (
    <nav style={{
      background: 'rgba(10,10,10,0.97)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      position: 'sticky', top: 0, zIndex: 200,
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', height: '64px', gap: '32px' }}>
        {/* Logo */}
        <a
          href={user?.tipo === 'ADMIN' ? '/admin' : '/loja'}
          style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '26px', color: '#e5192a', letterSpacing: '3px', flexShrink: 0 }}
        >
          WEB POINT
        </a>

        {/* Links */}
        <div style={{ display: 'flex', gap: '20px', flex: 1 }}>
          {ready && (
            <>
              {(!user || user.tipo === 'USER') && navLink('/loja', 'Loja')}
              {user?.tipo === 'USER' && navLink('/pedidos', 'Meus Pedidos')}
              {user?.tipo === 'ADMIN' && (
                <>
                  {navLink('/admin', 'Dashboard')}
                  {navLink('/admin/pedidos', 'Pedidos')}
                  {navLink('/admin/produtos', 'Produtos')}
                </>
              )}
            </>
          )}
        </div>

        {/* Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {!ready ? null : user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px', color: '#fff', fontSize: '14px', cursor: 'pointer',
                }}
              >
                <span style={{
                  width: '26px', height: '26px', borderRadius: '50%', background: '#e5192a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 700, flexShrink: 0,
                }}>
                  {user.nome[0].toUpperCase()}
                </span>
                <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.nome.split(' ')[0]}
                </span>
                {user.tipo === 'ADMIN' && (
                  <span style={{ fontSize: '9px', fontWeight: 700, background: 'rgba(229,25,42,0.2)', color: '#e5192a', padding: '1px 5px', borderRadius: '4px', letterSpacing: '0.5px' }}>
                    ADMIN
                  </span>
                )}
              </button>

              {menuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                  background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', padding: '8px', minWidth: '180px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                }}>
                  <div style={{ padding: '8px 12px', fontSize: '12px', color: '#444', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '4px' }}>
                    {user.email}
                  </div>
                  {user.tipo === 'USER' && (
                    <a href="/pedidos" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '8px 12px', borderRadius: '6px', fontSize: '14px', color: '#ccc' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      Meus Pedidos
                    </a>
                  )}
                  <button onClick={logout} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: '6px', fontSize: '14px', color: '#e5192a', background: 'transparent', border: 'none', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(229,25,42,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <a href="/login" className="btn btn-ghost btn-sm">Entrar</a>
              <a href="/register" className="btn btn-primary btn-sm">Cadastrar</a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
