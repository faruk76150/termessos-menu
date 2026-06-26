import { NextRequest, NextResponse } from 'next/server';
import { signToken, comparePassword } from '@/lib/auth';
import { supabaseClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const { data: admin } = await supabaseClient()
    .from('admins')
    .select('password_hash')
    .eq('username', username)
    .single();

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const valid = await comparePassword(password, admin.password_hash);
  if (!valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = signToken({ username });
  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
  return res;
}

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get('logout') === '1') {
    const res = NextResponse.redirect(new URL('/admin/login', req.url));
    res.cookies.delete('admin-token');
    return res;
  }
  return NextResponse.json({ ok: false }, { status: 400 });
}
