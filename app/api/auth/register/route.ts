import { NextResponse } from 'next/server';
import { serverRegister, serverLogin } from '@/backend/auth';
export async function POST(req: Request) {
  try {
    const { nome, email, senha } = await req.json();
    const user = await serverRegister(nome, email, senha);
    await serverLogin(email, senha);
    return NextResponse.json({ id: user.id, nome: user.nome, email: user.email, tipo: user.tipo });
  } catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 400 }); }
}
