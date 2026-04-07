import { NextResponse } from 'next/server';
import { serverLogout } from '@/backend/auth';
export async function POST() { await serverLogout(); return NextResponse.json({ ok: true }); }
