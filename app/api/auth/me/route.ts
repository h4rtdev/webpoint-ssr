import { NextResponse } from 'next/server';
import { serverGetCurrentUser } from '@/backend/auth';
export async function GET() {
  const user = await serverGetCurrentUser();
  if (!user) return NextResponse.json(null);
  return NextResponse.json({ id: user.id, nome: user.nome, email: user.email, tipo: user.tipo });
}
