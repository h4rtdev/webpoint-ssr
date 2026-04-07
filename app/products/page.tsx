import { serverGetProducts } from '@/backend/products';
import ProductForm from '@/frontend/components/ProductForm';
import ProductList from '@/frontend/components/ProductList';
import { redirect } from 'next/navigation';
import { serverEnsureAdmin } from '@/backend/auth';

export const metadata = { title: 'Produtos — WEB POINT' };

export default async function ProductsPage() {
  try { await serverEnsureAdmin(); } catch { redirect('/admin/produtos'); }
  const products = await serverGetProducts();
  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div className="page-header">
        <h1>Gerenciamento de Produtos</h1>
        <p>Cadastre e gerencie o inventário</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '24px', alignItems: 'start' }}>
        <ProductForm />
        <ProductList initialProducts={products} />
      </div>
    </div>
  );
}
