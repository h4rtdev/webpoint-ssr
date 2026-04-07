'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push('/loja');
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '32px', color: '#e5192a', letterSpacing: '3px', marginBottom: '6px' }}>
            WEB POINT
          </div>
          <h1 style={{ color: '#fff', fontSize: '18px', fontWeight: 600 }}>Criar conta</h1>
          <p style={{ color: '#555', fontSize: '13px', marginTop: '4px' }}>Rápido e gratuito</p>
        </div>

        {error && (
          <div style={{ marginBottom: '20px', padding: '10px 14px', background: 'rgba(229,25,42,0.1)', border: '1px solid rgba(229,25,42,0.3)', borderRadius: '8px', color: '#f87171', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="label">Nome completo</label>
            <input type="text" className="input" value={nome} onChange={e => setNome(e.target.value)} required placeholder="Seu nome" />
          </div>
          <div>
            <label className="label">E-mail</label>
            <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} required placeholder="seu@email.com" />
          </div>
          <div>
            <label className="label">Senha</label>
            <input type="password" className="input" value={senha} onChange={e => setSenha(e.target.value)} required placeholder="Min. 6 caracteres" minLength={6} />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            {loading ? <span className="spinner" /> : null}
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', color: '#555', fontSize: '13px' }}>
          Já tem conta?{' '}
          <a href="/login" style={{ color: '#e5192a', fontWeight: 600 }}>Entrar</a>
        </p>
      </div>
    </div>
  );
}
