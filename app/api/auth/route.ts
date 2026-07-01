import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';
import { supabaseClient, supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json(); // username is treated as email

  try {
    // 1. Authenticate user credentials via Supabase Auth (using public client)
    const { data: authData, error: authError } = await supabaseClient().auth.signInWithPassword({
      email: username,
      password: password,
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid credentials' }, { status: 401 });
    }

    // 2. Verify that the user is mapped in the public.admins table (using admin client to bypass public RLS restrictions)
    const { data: admin, error: adminErr } = await supabaseAdmin()
      .from('admins')
      .select('user_id')
      .eq('user_id', authData.user.id)
      .single();

    if (adminErr || !admin) {
      // Log out user since they are not registered as an administrator
      await supabaseClient().auth.signOut();
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 401 });
    }

    // 3. Authorized! Sign local Next.js JWT cookie token for middleware access check
    const token = signToken({ username: authData.user.email, userId: authData.user.id });
    const res = NextResponse.json({ ok: true });
    res.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    return res;
  } catch (err) {
    console.error('Admin authentication route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get('logout') === '1') {
    const res = NextResponse.redirect(new URL('/admin/login', req.url));
    res.cookies.delete('admin-token');
    return res;
  }
  return NextResponse.json({ ok: false }, { status: 400 });
}
