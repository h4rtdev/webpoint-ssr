import { NextResponse } from 'next/server';
import { serverEnsureAdmin } from '@/backend/auth';
import { serverUpdateOrderStatus } from '@/backend/orders';
import { Order } from '@/backend/types';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await serverEnsureAdmin();
    const { id } = await params;
    const { status } = await req.json() as { status: Order['status'] };
    const order = await serverUpdateOrderStatus(id, status);
    if (!order) return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    return NextResponse.json(order);
  } catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 403 }); }
}
