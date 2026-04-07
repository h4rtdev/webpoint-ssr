import { NextResponse } from 'next/server';
import { serverLogin } from '@/backend/auth';
export async function POST(req: Request) {
  try {
    const { email, senha } = await req.json();
    const user = await serverLogin(email, senha);
    return NextResponse.json({ id: user.id, nome: user.nome, email: user.email, tipo: user.tipo });
  } catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 401 }); }
}
