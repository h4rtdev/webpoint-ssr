'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface OrderItem { productId: string; productName: string; price: number; qty: number; }
interface Order { id: string; userId: string; userName: string; items: OrderItem[]; total: number; status: 'ABERTO' | 'CONFIRMADO' | 'CANCELADO'; createdAt: string; }

const STATUS_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  ABERTO:    { color: '#60a5fa', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.3)' },
  CONFIRMADO:{ color: '#4ade80', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.3)' },
  CANCELADO: { color: '#f87171', bg: 'rgba(229,25,42,0.1)',   border: 'rgba(229,25,42,0.3)' },
};

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(u => {
      if (!u || u.tipo !== 'ADMIN') { router.push('/login'); return; }
      fetch('/api/pedidos').then(r => r.json()).then(d => { setOrders(d); setLoading(false); });
    });
  }, [router]);

  const updateStatus = async (id: string, status: Order['status']) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/pedidos/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Falha');
      const updated = await res.json();
      setOrders(o => o.map(x => x.id === id ? updated : x));
    } catch { alert('Erro ao atualizar pedido'); }
    finally { setUpdating(null); }
  };

  const filtered = orders.filter(o => !filter || o.status === filter);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <span className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div className="page-header">
        <h1>Pedidos</h1>
        <p>{filtered.length} de {orders.length} pedido{orders.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Filtro status */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['', 'ABERTO', 'CONFIRMADO', 'CANCELADO'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-ghost'}`}>
            {s || 'Todos'} {s && <span style={{ opacity: 0.7 }}>({orders.filter(o => o.status === s).length})</span>}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ padding: '60px', textAlign: 'center', color: '#444' }}>Nenhum pedido encontrado.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map(order => {
            const s = STATUS_STYLE[order.status];
            return (
              <div key={order.id} className="card fade-in" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '15px' }}>{order.userName}</div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#444', marginTop: '2px' }}>#{order.id}</div>
                    <div style={{ color: '#555', fontSize: '12px', marginTop: '2px' }}>{new Date(order.createdAt).toLocaleString('pt-BR')}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ padding: '4px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                      {order.status}
                    </span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#fff', fontWeight: 700 }}>R$ {order.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Itens */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px', padding: '12px', background: 'var(--black-3)', borderRadius: '8px' }}>
                  {order.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: '#aaa' }}>{item.productName} <span style={{ color: '#555' }}>× {item.qty}</span></span>
                      <span style={{ color: '#666', fontFamily: 'JetBrains Mono, monospace' }}>R$ {(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Ações */}
                {order.status === 'ABERTO' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => updateStatus(order.id, 'CONFIRMADO')} disabled={updating === order.id} className="btn btn-primary btn-sm">
                      {updating === order.id ? <span className="spinner" style={{ width: 14, height: 14 }} /> : '✓ Confirmar'}
                    </button>
                    <button onClick={() => updateStatus(order.id, 'CANCELADO')} disabled={updating === order.id} className="btn btn-danger btn-sm">
                      ✕ Cancelar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
