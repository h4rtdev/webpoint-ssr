import { serverEnsureAdmin } from '@/backend/auth';
import { serverGetOrders } from '@/backend/orders';
import { serverGetProducts } from '@/backend/products';
import { redirect } from 'next/navigation';

export default async function AdminDashboard() {
  try { await serverEnsureAdmin(); } catch { redirect('/login'); }

  const [orders, products] = await Promise.all([serverGetOrders(), serverGetProducts()]);

  const abertos = orders.filter(o => o.status === 'ABERTO').length;
  const confirmados = orders.filter(o => o.status === 'CONFIRMADO').length;
  const totalRevenue = orders.filter(o => o.status !== 'CANCELADO').reduce((s, o) => s + o.total, 0);
  const lowStock = products.filter(p => p.stock <= 5);
  const outOfStock = products.filter(p => p.stock === 0);

  const stats = [
    { label: 'Pedidos Abertos', value: abertos, color: '#60a5fa', icon: '📋' },
    { label: 'Confirmados', value: confirmados, color: '#4ade80', icon: '✅' },
    { label: 'Receita Total', value: `R$ ${totalRevenue.toFixed(2)}`, color: '#e5192a', icon: '💰' },
    { label: 'Produtos Cadastrados', value: products.length, color: '#c084fc', icon: '📦' },
  ];

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div className="page-header">
        <h1>Dashboard Admin</h1>
        <p>Visão geral do sistema WEB POINT</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        {stats.map((s, i) => (
          <div key={i} className="card" style={{ padding: '24px' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>{s.icon}</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '28px', fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ color: '#555', fontSize: '13px', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Alertas de estoque */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '18px', letterSpacing: '1.5px', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚠️ Alertas de Estoque
          </div>
          {lowStock.length === 0 ? (
            <p style={{ color: '#555', fontSize: '13px' }}>Todos os produtos com estoque OK.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {lowStock.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: p.stock === 0 ? 'rgba(229,25,42,0.08)' : 'rgba(234,179,8,0.08)', borderRadius: '6px', border: `1px solid ${p.stock === 0 ? 'rgba(229,25,42,0.2)' : 'rgba(234,179,8,0.2)'}` }}>
                  <span style={{ color: '#ccc', fontSize: '13px' }}>{p.name}</span>
                  <span style={{ color: p.stock === 0 ? '#f87171' : '#facc15', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                    {p.stock === 0 ? 'SEM ESTOQUE' : `${p.stock} restantes`}
                  </span>
                </div>
              ))}
            </div>
          )}
          <a href="/admin/produtos" className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', marginTop: '16px' }}>Ver todos os produtos →</a>
        </div>

        {/* Últimos pedidos */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '18px', letterSpacing: '1.5px', color: '#fff', marginBottom: '16px' }}>
            Últimos Pedidos
          </div>
          {orders.length === 0 ? (
            <p style={{ color: '#555', fontSize: '13px' }}>Nenhum pedido ainda.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {orders.slice(0, 5).map(o => (
                <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ color: '#ccc', fontSize: '13px' }}>{o.userName}</div>
                    <div style={{ color: '#444', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace' }}>#{o.id.slice(-6)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#fff', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace' }}>R$ {o.total.toFixed(2)}</div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: o.status === 'ABERTO' ? '#60a5fa' : o.status === 'CONFIRMADO' ? '#4ade80' : '#f87171' }}>{o.status}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <a href="/admin/pedidos" className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', marginTop: '16px' }}>Ver todos →</a>
        </div>
      </div>
    </div>
  );
}
