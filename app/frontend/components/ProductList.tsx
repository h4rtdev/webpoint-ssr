'use client';

import { Product } from '@/app/types/product';
import { useState, useMemo } from 'react';

interface ProductListProps {
  initialProducts: Product[];
  onProductDeleted?: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  electronics: 'Eletrônicos',
  clothing: 'Roupas',
  food: 'Alimentos',
  books: 'Livros',
  other: 'Outro',
};

type SortField = 'name' | 'price' | 'stock' | 'createdAt';
type SortDir = 'asc' | 'desc';

interface EditState {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
}

export default function ProductList({ initialProducts, onProductDeleted }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [editProduct, setEditProduct] = useState<EditState | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // ── Filtered + sorted list ──────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...products];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q)
      );
    }

    if (categoryFilter) {
      list = list.filter(p => p.category === categoryFilter);
    }

    list.sort((a, b) => {
      let va: string | number = a[sortField] as string | number;
      let vb: string | number = b[sortField] as string | number;
      if (sortField === 'createdAt') {
        va = new Date(va as string).getTime();
        vb = new Date(vb as string).getTime();
      }
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [products, search, categoryFilter, sortField, sortDir]);

  // ── Sort toggle ──────────────────────────────────────────────────────────
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sortIcon = (field: SortField) => {
    if (field !== sortField) return <span style={{ opacity: 0.2 }}>⇅</span>;
    return <span style={{ color: '#e5192a' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este produto?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Falha ao excluir produto');
      setProducts(p => p.filter(x => x.id !== id));
      onProductDeleted?.();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao excluir');
    } finally {
      setLoading(false);
    }
  };

  // ── Edit open ────────────────────────────────────────────────────────────
  const openEdit = (product: Product) => {
    setEditProduct({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      category: product.category,
    });
    setEditError(null);
  };

  // ── Edit save ────────────────────────────────────────────────────────────
  const handleEditSave = async () => {
    if (!editProduct) return;
    setEditLoading(true);
    setEditError(null);
    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProduct),
      });
      if (!res.ok) throw new Error('Falha ao atualizar produto');
      const updated: Product = await res.json();
      setProducts(p => p.map(x => (x.id === updated.id ? updated : x)));
      setEditProduct(null);
    } catch (e) {
      setEditError(e instanceof Error ? e.message : 'Erro ao salvar');
    } finally {
      setEditLoading(false);
    }
  };

  // ── Input style helper ───────────────────────────────────────────────────
  const inp: React.CSSProperties = {
    background: '#1a1a1a',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#f5f5f5',
    borderRadius: '7px',
    padding: '8px 12px',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    fontFamily: 'Inter, sans-serif',
  };

  return (
    <>
      {/* ── Modal de edição ─────────────────────────────────────────────── */}
      {editProduct && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setEditProduct(null); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
          }}
        >
          <div
            className="card fade-in"
            style={{ width: '100%', maxWidth: '520px', padding: '32px' }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '22px', letterSpacing: '2px', color: '#fff' }}>
                  Editar Produto
                </h2>
                <p style={{ color: 'var(--gray)', fontSize: '13px', marginTop: '4px' }}>Altere os campos desejados</p>
              </div>
              <button
                onClick={() => setEditProduct(null)}
                style={{ background: 'none', border: 'none', color: '#555', fontSize: '20px', lineHeight: 1, cursor: 'pointer', padding: '4px' }}
              >✕</button>
            </div>

            {editError && (
              <div style={{
                marginBottom: '16px', padding: '10px 14px',
                background: 'rgba(229,25,42,0.1)', border: '1px solid rgba(229,25,42,0.3)',
                borderRadius: '7px', color: '#f87171', fontSize: '13px',
              }}>{editError}</div>
            )}

            {/* Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#aaa', marginBottom: '5px' }}>Nome *</label>
                <input
                  style={inp}
                  value={editProduct.name}
                  onChange={e => setEditProduct(p => p ? { ...p, name: e.target.value } : p)}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#aaa', marginBottom: '5px' }}>Descrição</label>
                <textarea
                  style={{ ...inp, resize: 'vertical', minHeight: '72px' }}
                  value={editProduct.description}
                  onChange={e => setEditProduct(p => p ? { ...p, description: e.target.value } : p)}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#aaa', marginBottom: '5px' }}>Preço (R$) *</label>
                  <input
                    type="number" step="0.01" min="0" style={inp}
                    value={editProduct.price}
                    onChange={e => setEditProduct(p => p ? { ...p, price: parseFloat(e.target.value) } : p)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#aaa', marginBottom: '5px' }}>Estoque *</label>
                  <input
                    type="number" min="0" style={inp}
                    value={editProduct.stock}
                    onChange={e => setEditProduct(p => p ? { ...p, stock: parseInt(e.target.value) } : p)}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#aaa', marginBottom: '5px' }}>Categoria *</label>
                <select
                  style={{ ...inp, appearance: 'none' as const }}
                  value={editProduct.category}
                  onChange={e => setEditProduct(p => p ? { ...p, category: e.target.value } : p)}
                >
                  <option value="">Selecione</option>
                  <option value="electronics">Eletrônicos</option>
                  <option value="clothing">Roupas</option>
                  <option value="food">Alimentos</option>
                  <option value="books">Livros</option>
                  <option value="other">Outro</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button
                onClick={() => setEditProduct(null)}
                className="btn btn-ghost"
                style={{ flex: 1 }}
              >Cancelar</button>
              <button
                onClick={handleEditSave}
                disabled={editLoading}
                className="btn btn-primary"
                style={{ flex: 2 }}
              >
                {editLoading ? <span className="spinner" /> : null}
                {editLoading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tabela principal ─────────────────────────────────────────────── */}
      <div className="card fade-in">
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '22px', letterSpacing: '2px', color: '#fff' }}>
                Produtos Registrados
              </h2>
              <p style={{ color: 'var(--gray)', fontSize: '13px' }}>
                {filtered.length} de {products.length} produto{products.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Busca + Filtros */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {/* Busca */}
            <div style={{ flex: '1 1 220px', position: 'relative' }}>
              <span style={{
                position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                color: '#555', fontSize: '14px', pointerEvents: 'none',
              }}>🔍</span>
              <input
                type="text"
                placeholder="Buscar por nome ou descrição..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input"
                style={{ paddingLeft: '36px' }}
              />
            </div>

            {/* Filtro categoria */}
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="input"
              style={{ flex: '0 0 180px', appearance: 'none' }}
            >
              <option value="">Todas as categorias</option>
              <option value="electronics">Eletrônicos</option>
              <option value="clothing">Roupas</option>
              <option value="food">Alimentos</option>
              <option value="books">Livros</option>
              <option value="other">Outro</option>
            </select>

            {/* Ordenar por */}
            <select
              value={`${sortField}:${sortDir}`}
              onChange={e => {
                const [f, d] = e.target.value.split(':') as [SortField, SortDir];
                setSortField(f); setSortDir(d);
              }}
              className="input"
              style={{ flex: '0 0 200px', appearance: 'none' }}
            >
              <option value="createdAt:desc">Mais recente primeiro</option>
              <option value="createdAt:asc">Mais antigo primeiro</option>
              <option value="name:asc">Nome A→Z</option>
              <option value="name:desc">Nome Z→A</option>
              <option value="price:asc">Menor preço</option>
              <option value="price:desc">Maior preço</option>
              <option value="stock:asc">Menor estoque</option>
              <option value="stock:desc">Maior estoque</option>
            </select>

            {/* Limpar filtros */}
            {(search || categoryFilter) && (
              <button
                onClick={() => { setSearch(''); setCategoryFilter(''); }}
                className="btn btn-ghost btn-sm"
                style={{ flexShrink: 0, alignSelf: 'center' }}
              >
                Limpar filtros ✕
              </button>
            )}
          </div>
        </div>

        {/* Sem resultados */}
        {filtered.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '10px', opacity: 0.25 }}>◈</div>
            <p style={{ color: 'var(--gray)', fontSize: '14px' }}>
              {products.length === 0
                ? 'Nenhum produto registrado ainda.'
                : 'Nenhum produto encontrado com esses filtros.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="wp-table">
              <thead>
                <tr>
                  <th
                    onClick={() => handleSort('name')}
                    style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
                  >
                    Produto {sortIcon('name')}
                  </th>
                  <th>Categoria</th>
                  <th
                    onClick={() => handleSort('price')}
                    style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
                  >
                    Preço {sortIcon('price')}
                  </th>
                  <th
                    onClick={() => handleSort('stock')}
                    style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
                  >
                    Estoque {sortIcon('stock')}
                  </th>
                  <th
                    onClick={() => handleSort('createdAt')}
                    style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
                  >
                    Criado em {sortIcon('createdAt')}
                  </th>
                  <th style={{ textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(product => (
                  <tr key={product.id}>
                    <td>
                      <div style={{ color: '#fff', fontWeight: 500, fontSize: '14px' }}>{product.name}</div>
                      {product.description && (
                        <div style={{ color: 'var(--gray)', fontSize: '12px', marginTop: '2px' }}>
                          {product.description.length > 55
                            ? product.description.slice(0, 55) + '…'
                            : product.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`badge badge-${product.category}`}>
                        {CATEGORY_LABELS[product.category] || product.category}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: '#fff', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}>
                        R$ {product.price.toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        color: product.stock > 0 ? '#4ade80' : '#f87171',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '13px', fontWeight: 600,
                      }}>
                        {product.stock}
                      </span>
                      {product.stock === 0 && (
                        <span style={{ marginLeft: '6px', fontSize: '10px', color: '#f87171' }}>sem estoque</span>
                      )}
                    </td>
                    <td style={{ color: 'var(--gray)', fontSize: '13px' }}>
                      {new Date(product.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button
                          onClick={() => openEdit(product)}
                          className="btn btn-ghost btn-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={loading}
                          className="btn btn-danger btn-sm"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
