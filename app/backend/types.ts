export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
}

export interface User {
  id: string;
  nome: string;
  email: string;
  senha: string; // hashed (base64 simples, sem deps externas)
  tipo: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: OrderItem[];
  total: number;
  status: 'ABERTO' | 'CONFIRMADO' | 'CANCELADO';
  createdAt: string;
  updatedAt: string;
}
