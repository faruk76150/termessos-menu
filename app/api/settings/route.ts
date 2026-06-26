import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin().from('settings').select('key,value');
    if (error) throw error;
    const map: Record<string, string> = {};
    (data ?? []).forEach(({ key, value }) => { map[key] = value; });
    return NextResponse.json(map);
  } catch {
    return NextResponse.json({});
  }
}

export async function PUT(req: NextRequest) {
  const updates: Record<string, string> = await req.json();
  const rows = Object.entries(updates).map(([key, value]) => ({ key, value }));
  const { error } = await supabaseAdmin()
    .from('settings')
    .upsert(rows, { onConflict: 'key' });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
