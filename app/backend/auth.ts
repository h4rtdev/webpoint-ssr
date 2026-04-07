'use server';
import { User } from '@/backend/types';
import { readFromDatabase, writeToDatabase, DATABASE } from '@/backend/db';
import { cookies } from 'next/headers';

// Simples "hash" base64 (sem deps externas, apenas para fins didáticos)
function hashPassword(p: string) { return Buffer.from(p).toString('base64'); }
function verifyPassword(p: string, h: string) { return hashPassword(p) === h; }

// Sessão: cookie com userId|tipo assinado com segredo simples
const SECRET = 'webpoint-secret-2024';
function sign(payload: string) {
  const sig = Buffer.from(payload + SECRET).toString('base64').slice(0, 16);
  return `${payload}|${sig}`;
}
function verify(token: string): { userId: string; tipo: string } | null {
  const parts = token.split('|');
  if (parts.length < 3) return null;
  const sig = parts.pop()!;
  const payload = parts.join('|');
  const expected = Buffer.from(payload + SECRET).toString('base64').slice(0, 16);
  if (sig !== expected) return null;
  const [userId, tipo] = payload.split('|');
  return { userId, tipo };
}

export async function serverRegister(nome: string, email: string, senha: string): Promise<User> {
  const users = await readFromDatabase<User>(DATABASE.USERS_FILE);
  if (users.find(u => u.email === email)) throw new Error('Email já cadastrado');
  const user: User = {
    id: Date.now().toString(),
    nome: nome.trim(),
    email: email.trim().toLowerCase(),
    senha: hashPassword(senha),
    tipo: 'USER',
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  await writeToDatabase(DATABASE.USERS_FILE, users);
  return user;
}

export async function serverLogin(email: string, senha: string): Promise<User> {
  const users = await readFromDatabase<User>(DATABASE.USERS_FILE);
  const user = users.find(u => u.email === email.trim().toLowerCase());
  if (!user || !verifyPassword(senha, user.senha)) throw new Error('Email ou senha inválidos');
  // Criar sessão
  const cookieStore = await cookies();
  const token = sign(`${user.id}|${user.tipo}`);
  cookieStore.set('wp_session', token, {
    httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax',
  });
  return user;
}

export async function serverLogout() {
  const cookieStore = await cookies();
  cookieStore.delete('wp_session');
}

export async function serverGetCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('wp_session')?.value;
    if (!token) return null;
    const payload = verify(token);
    if (!payload) return null;
    const users = await readFromDatabase<User>(DATABASE.USERS_FILE);
    return users.find(u => u.id === payload.userId) ?? null;
  } catch {
    return null;
  }
}

export async function serverEnsureAdmin(): Promise<User> {
  const user = await serverGetCurrentUser();
  if (!user || user.tipo !== 'ADMIN') throw new Error('Não autorizado');
  return user;
}
