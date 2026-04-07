import { serverEnsureAdmin } from '@/backend/auth';
import { serverGetProducts } from '@/backend/products';
import ProductForm from '@/frontend/components/ProductForm';
import ProductList from '@/frontend/components/ProductList';
import { redirect } from 'next/navigation';

export const metadata = { title: 'Produtos — Admin WEB POINT' };

export default async function AdminProdutosPage() {
  try { await serverEnsureAdmin(); } catch { redirect('/login'); }
  const products = await serverGetProducts();

  const outOfStock = products.filter(p => p.stock === 0).length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5).length;

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div className="page-header" style={{ margin: 0 }}>
          <h1>Backlog de Produtos</h1>
          <p>Gerencie o catálogo completo de produtos</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {outOfStock > 0 && (
            <div style={{ padding: '8px 16px', background: 'rgba(229,25,42,0.1)', border: '1px solid rgba(229,25,42,0.25)', borderRadius: '8px', fontSize: '13px' }}>
              <span style={{ color: '#f87171', fontWeight: 600 }}>{outOfStock}</span>
              <span style={{ color: '#666', marginLeft: '6px' }}>sem estoque</span>
            </div>
          )}
          {lowStock > 0 && (
            <div style={{ padding: '8px 16px', background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.25)', borderRadius: '8px', fontSize: '13px' }}>
              <span style={{ color: '#facc15', fontWeight: 600 }}>{lowStock}</span>
              <span style={{ color: '#666', marginLeft: '6px' }}>estoque baixo</span>
            </div>
          )}
          <div style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px' }}>
            <span style={{ color: '#c084fc', fontWeight: 600 }}>{products.length}</span>
            <span style={{ color: '#666', marginLeft: '6px' }}>total</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '24px', alignItems: 'start' }}>
        <div>
          <ProductForm />
        </div>
        <div>
          <ProductList initialProducts={products} />
        </div>
      </div>
    </div>
  );
}
