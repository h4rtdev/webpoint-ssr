'use client';
import { useState, useEffect } from 'react';

interface Product { id: string; name: string; description: string; price: number; stock: number; category: string; }
interface CartItem { product: Product; qty: number; }
interface NavUser { id: string; nome: string; tipo: string; }

const CATEGORY_LABELS: Record<string, string> = {
  electronics: 'Eletrônicos', clothing: 'Roupas', food: 'Alimentos', books: 'Livros', other: 'Outro',
};

export default function LojaPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<NavUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/auth/me').then(r => r.json()),
    ]).then(([prods, u]) => {
      setProducts(prods);
      setUser(u);
      setLoading(false);
    });
  }, []);

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    const matchCat = !catFilter || p.category === catFilter;
    return matchSearch && matchCat && p.stock > 0;
  });

  const addToCart = (product: Product) => {
    setCart(c => {
      const existing = c.find(i => i.product.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) return c;
        return c.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...c, { product, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) => setCart(c => c.filter(i => i.product.id !== id));
  const changeQty = (id: string, qty: number) => {
    if (qty < 1) { removeFromCart(id); return; }
    setCart(c => c.map(i => i.product.id === id ? { ...i, qty } : i));
  };

  const total = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const placeOrder = async () => {
    if (!user) { window.location.href = '/login'; return; }
    setOrdering(true); setOrderError('');
    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart.map(i => ({ productId: i.product.id, qty: i.qty })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCart([]);
      setOrderSuccess(true);
      setProducts(await fetch('/api/products').then(r => r.json()));
      setTimeout(() => setOrderSuccess(false), 4000);
    } catch (e) { setOrderError((e as Error).message); }
    finally { setOrdering(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <span className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '0', minHeight: 'calc(100vh - 64px)' }}>
      {/* Produtos */}
      <div style={{ padding: '32px 24px', borderRight: '1px solid var(--border)' }}>
        <div className="page-header" style={{ marginBottom: '24px' }}>
          <h1>Loja</h1>
          <p>Escolha seus produtos e faça seu pedido</p>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#555', fontSize: '14px' }}>🔍</span>
            <input type="text" placeholder="Buscar produto..." value={search} onChange={e => setSearch(e.target.value)} className="input" style={{ paddingLeft: '36px' }} />
          </div>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="input" style={{ flex: '0 0 180px', appearance: 'none' }}>
            <option value="">Todas as categorias</option>
            {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>

        {/* Grid de produtos */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#444' }}>Nenhum produto disponível</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {filtered.map(p => {
              const inCart = cart.find(i => i.product.id === p.id);
              return (
                <div key={p.id} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className={`badge badge-${p.category}`}>{CATEGORY_LABELS[p.category] || p.category}</span>
                    <span style={{ fontSize: '11px', color: '#555' }}>{p.stock} em estoque</span>
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{p.name}</div>
                    <div style={{ color: '#555', fontSize: '12px', lineHeight: 1.5 }}>{p.description?.slice(0, 70)}{p.description?.length > 70 ? '…' : ''}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#e5192a', fontSize: '16px', fontWeight: 700 }}>
                      R$ {p.price.toFixed(2)}
                    </span>
                    {inCart ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button onClick={() => changeQty(p.id, inCart.qty - 1)} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}>−</button>
                        <span style={{ color: '#fff', fontSize: '13px', minWidth: '20px', textAlign: 'center' }}>{inCart.qty}</span>
                        <button onClick={() => changeQty(p.id, inCart.qty + 1)} disabled={inCart.qty >= p.stock} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}>+</button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(p)} className="btn btn-primary btn-sm">+ Adicionar</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Carrinho */}
      <div style={{ padding: '32px 20px', background: 'var(--black-2)', display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '64px', height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '20px', letterSpacing: '2px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Carrinho</span>
          {cartCount > 0 && <span style={{ fontSize: '13px', fontFamily: 'Inter, sans-serif', background: '#e5192a', color: '#fff', padding: '2px 8px', borderRadius: '99px' }}>{cartCount}</span>}
        </div>

        {orderSuccess && (
          <div style={{ padding: '12px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '8px', color: '#4ade80', fontSize: '13px' }}>
            ✓ Pedido realizado com sucesso!
          </div>
        )}
        {orderError && (
          <div style={{ padding: '12px', background: 'rgba(229,25,42,0.1)', border: '1px solid rgba(229,25,42,0.3)', borderRadius: '8px', color: '#f87171', fontSize: '13px' }}>
            {orderError}
          </div>
        )}

        {cart.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontSize: '14px', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '28px', opacity: 0.2 }}>🛒</span>
            <span>Carrinho vazio</span>
          </div>
        ) : (
          <>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {cart.map(i => (
                <div key={i.product.id} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px', background: 'var(--black-3)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#fff', fontSize: '13px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.product.name}</div>
                    <div style={{ color: '#555', fontSize: '12px' }}>R$ {i.product.price.toFixed(2)} × {i.qty}</div>
                  </div>
                  <div style={{ color: '#e5192a', fontSize: '13px', fontWeight: 600, flexShrink: 0 }}>
                    R$ {(i.product.price * i.qty).toFixed(2)}
                  </div>
                  <button onClick={() => removeFromCart(i.product.id)} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: '16px', padding: '0 2px' }}>✕</button>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ color: '#888', fontSize: '14px' }}>Total</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#fff', fontSize: '18px', fontWeight: 700 }}>
                  R$ {total.toFixed(2)}
                </span>
              </div>
              <button onClick={placeOrder} disabled={ordering} className="btn btn-primary" style={{ width: '100%' }}>
                {ordering ? <span className="spinner" /> : null}
                {ordering ? 'Processando...' : user ? 'Finalizar Pedido' : 'Entrar para Pedir'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
