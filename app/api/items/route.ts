import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { CATEGORIES, MENU_ITEMS } from '@/lib/menuData';

const db = () => supabaseAdmin();

export async function GET(req: NextRequest) {
  const categoryId = req.nextUrl.searchParams.get('category_id');
  try {
    let query = db().from('menu_items').select('*').order('display_order');
    if (categoryId) query = query.eq('category_id', categoryId);
    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data);
  } catch {
    const items = MENU_ITEMS.map((i, idx) => {
      const catIdx = CATEGORIES.findIndex((c) => c.slug === i.category_slug);
      return {
        id: String(idx), category_id: String(catIdx + 1),
        slug: i.slug, name_tr: i.name_tr, name_en: i.name_en,
        description_tr: i.description_tr || '', description_en: i.description_en || '',
        price: i.price, image_url: i.image_url || null,
        is_active: true, is_featured: i.is_featured || false, display_order: idx,
      };
    });
    return NextResponse.json(categoryId ? items.filter((i) => i.category_id === categoryId) : items);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { data, error } = await db().from('menu_items').insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const { id, ...rest } = await req.json();
  const { data, error } = await db().from('menu_items').update(rest).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const rows: { id: string; display_order: number }[] = await req.json();
  const updates = rows.map(({ id, display_order }) =>
    db().from('menu_items').update({ display_order }).eq('id', id)
  );
  await Promise.all(updates);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  const { error } = await db().from('menu_items').delete().eq('id', id!);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
