import { NextRequest, NextResponse } from 'next/server';
import { supabaseClient, supabaseAdmin } from '@/lib/supabase';
import { CATEGORIES } from '@/lib/menuData';

const db = () => supabaseClient();
const adminDb = () => supabaseAdmin();

export async function GET() {
  try {
    const { data, error } = await db().from('categories').select('*').order('display_order');
    if (error) throw error;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(CATEGORIES.map((c, i) => ({ ...c, id: String(i + 1) })));
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { data, error } = await adminDb().from('categories').insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const { id, ...rest } = await req.json();
  const { data, error } = await adminDb().from('categories').update(rest).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  // Bulk reorder: body = [{ id, display_order }, ...]
  const rows: { id: string; display_order: number }[] = await req.json();
  const updates = rows.map(({ id, display_order }) =>
    adminDb().from('categories').update({ display_order }).eq('id', id)
  );
  await Promise.all(updates);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  const { error } = await adminDb().from('categories').delete().eq('id', id!);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
