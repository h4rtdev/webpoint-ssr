import { NextResponse } from 'next/server';
import { serverGetCurrentUser } from '@/backend/auth';
import { serverCreateOrder, serverGetOrders, serverGetOrdersByUser } from '@/backend/orders';

export async function GET() {
  const user = await serverGetCurrentUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  if (user.tipo === 'ADMIN') {
    const orders = await serverGetOrders();
    return NextResponse.json(orders.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }
  const orders = await serverGetOrdersByUser(user.id);
  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const user = await serverGetCurrentUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  try {
    const { items } = await req.json();
    const order = await serverCreateOrder(user.id, user.nome, items);
    return NextResponse.json(order);
  } catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 400 }); }
}
