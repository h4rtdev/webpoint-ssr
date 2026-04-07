import { NextResponse } from 'next/server';
import {
  serverGetProducts,
  serverCreateProduct,
  serverUpdateProduct,
  serverDeleteProduct,
} from '@/backend/products';

export async function GET() {
  const products = await serverGetProducts();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const data = await request.json();
  const product = await serverCreateProduct(data);
  return NextResponse.json(product);
}

export async function PUT(request: Request) {
  const { id, ...fields } = await request.json();
  const updated = await serverUpdateProduct(id, fields);
  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 });
  const success = await serverDeleteProduct(id);
  return NextResponse.json({ success });
}
