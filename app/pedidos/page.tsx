'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface OrderItem { productId: string; productName: string; price: number; qty: number; }
interface Order { id: string; items: OrderItem[]; total: number; status: string; createdAt: string; }

const STATUS_STYLE: Record<string, { color: string; bg: string; border: string; label: string }> = {
  ABERTO:    { color: '#60a5fa', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.3)',  label: 'Aberto' },
  CONFIRMADO:{ color: '#4ade80', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.3)',   label: 'Confirmado' },
  CANCELADO: { color: '#f87171', bg: 'rgba(229,25,42,0.1)',   border: 'rgba(229,25,42,0.3)',   label: 'Cancelado' },
};

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(user => {
      if (!user) { router.push('/login'); return; }
      fetch('/api/pedidos').then(r => r.json()).then(data => { setOrders(data); setLoading(false); });
    });
  }, [router]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <span className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div className="page-header">
        <h1>Meus Pedidos</h1>
        <p>{orders.length} pedido{orders.length !== 1 ? 's' : ''} realizados</p>
      </div>

      {orders.length === 0 ? (
        <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', opacity: 0.2, marginBottom: '12px' }}>📦</div>
          <p style={{ color: '#555' }}>Nenhum pedido ainda.</p>
          <a href="/loja" className="btn btn-primary" style={{ display: 'inline-flex', marginTop: '16px' }}>Ir à loja</a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map(order => {
            const s = STATUS_STYLE[order.status] || STATUS_STYLE.ABERTO;
            return (
              <div key={order.id} className="card fade-in" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#555' }}>#{order.id}</span>
                    <div style={{ color: '#888', fontSize: '13px', marginTop: '2px' }}>
                      {new Date(order.createdAt).toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <span style={{ padding: '4px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                    {s.label}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                  {order.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#aaa' }}>
                      <span>{item.productName} <span style={{ color: '#555' }}>× {item.qty}</span></span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#888' }}>R$ {(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                  <span style={{ color: '#888', fontSize: '13px', marginRight: '8px' }}>Total:</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#fff', fontWeight: 700 }}>R$ {order.total.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
