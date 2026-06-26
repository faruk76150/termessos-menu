import { NextRequest, NextResponse } from 'next/server';
import { signToken, comparePassword } from '@/lib/auth';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (username !== ADMIN_USERNAME) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fallback for plain-text ADMIN_PASSWORD (dev only)
  const plain = process.env.ADMIN_PASSWORD;
  const valid = ADMIN_PASSWORD_HASH
    ? await comparePassword(password, ADMIN_PASSWORD_HASH)
    : plain === password;

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
