'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { CreateProductInput } from '@/app/types/product';

interface ProductFormProps {
  onSuccess?: () => void;
}

export default function ProductForm({ onSuccess }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<CreateProductInput>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Falha ao criar produto');
      }

      setSuccess(true);
      setFormData({ name: '', description: '', price: 0, stock: 0, category: '' });
      setTimeout(() => setSuccess(false), 3000);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card fade-in" style={{ padding: '28px' }}>
      <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '22px', letterSpacing: '2px', color: '#fff' }}>
          Novo Produto
        </h2>
        <p style={{ color: 'var(--gray)', fontSize: '13px', marginTop: '4px' }}>Preencha os dados abaixo</p>
      </div>

      {error && (
        <div style={{
          marginBottom: '16px', padding: '12px 16px',
          background: 'rgba(229,25,42,0.1)', border: '1px solid rgba(229,25,42,0.3)',
          borderRadius: '8px', color: '#f87171', fontSize: '14px',
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          marginBottom: '16px', padding: '12px 16px',
          background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
          borderRadius: '8px', color: '#4ade80', fontSize: '14px',
        }}>
          Produto registrado com sucesso!
        </div>
      )}

      <div className="form-group">
        <label className="label">Nome do Produto *</label>
        <input
          type="text" name="name" value={formData.name}
          onChange={handleChange} required className="input"
          placeholder="Ex: Notebook Pro X"
        />
      </div>

      <div className="form-group">
        <label className="label">Descrição</label>
        <textarea
          name="description" value={formData.description}
          onChange={handleChange} className="input"
          placeholder="Descreva o produto..."
          rows={3}
          style={{ resize: 'vertical' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div>
          <label className="label">Preço (R$) *</label>
          <input
            type="number" name="price" value={formData.price}
            onChange={handleChange} required step="0.01" min="0"
            className="input" placeholder="0,00"
          />
        </div>
        <div>
          <label className="label">Estoque *</label>
          <input
            type="number" name="stock" value={formData.stock}
            onChange={handleChange} required min="0"
            className="input" placeholder="0"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="label">Categoria *</label>
        <select
          name="category" value={formData.category}
          onChange={handleChange} required className="input"
          style={{ appearance: 'none' }}
        >
          <option value="">Selecione uma categoria</option>
          <option value="electronics">Eletrônicos</option>
          <option value="clothing">Roupas</option>
          <option value="food">Alimentos</option>
          <option value="books">Livros</option>
          <option value="other">Outro</option>
        </select>
      </div>

      <button
        type="submit" disabled={loading}
        className="btn btn-primary"
        style={{ width: '100%', marginTop: '8px' }}
      >
        {loading ? <span className="spinner" /> : null}
        {loading ? 'Registrando...' : 'Registrar Produto'}
      </button>
    </form>
  );
}
