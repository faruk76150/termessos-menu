import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'general';

    if (!file) {
      return NextResponse.json({ error: 'Dosya yüklenemedi: Dosya bulunamadı.' }, { status: 400 });
    }

    // Convert file to array buffer and then Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Clean and sanitize the filename
    const timestamp = Date.now();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${folder}/${timestamp}_${cleanName}`;

    // Upload to Supabase Storage bucket using service role client
    const { error } = await supabaseAdmin().storage
      .from('menu-images')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      throw error;
    }

    // Retrieve the public URL of the uploaded image
    const { data: publicUrlData } = supabaseAdmin().storage
      .from('menu-images')
      .getPublicUrl(storagePath);

    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (err: unknown) {
    console.error('File upload route error:', err);
    const message = err instanceof Error ? err.message : 'Dosya yükleme hatası.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
