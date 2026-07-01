import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load local environment configurations
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY environment variables are missing in .env.local.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (err) {
    console.error(`Failed to download image from ${url}:`, err);
    return null;
  }
}

async function uploadToBucket(buffer: Buffer, filePath: string, mimeType: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from('menu-images')
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from('menu-images')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error(`Failed to upload to storage path ${filePath}:`, err);
    return null;
  }
}

function getMimeType(url: string): string {
  const ext = path.extname(url).toLowerCase().split('?')[0];
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.avif') return 'image/avif';
  return 'image/jpeg'; // Default fallback
}

function getFileName(url: string): string {
  const parts = url.split('/');
  const nameWithQuery = parts[parts.length - 1];
  return nameWithQuery.split('?')[0];
}

async function run() {
  console.log('Starting image migration to Supabase bucket...');

  // Ensure the storage bucket exists programmatically
  try {
    await supabase.storage.createBucket('menu-images', { public: true });
    console.log('Storage bucket "menu-images" created or verified.');
  } catch (e) {
    console.log('Note: Storage bucket verify step completed.');
  }

  // 1. Migrate Categories
  console.log('\nFetching categories from database...');
  const { data: categories, error: catErr } = await supabase
    .from('categories')
    .select('*');

  if (catErr) {
    console.error('Error fetching categories from database:', catErr);
  } else if (categories) {
    console.log(`Found ${categories.length} categories.`);
    for (const cat of categories) {
      if (cat.image_url && cat.image_url.startsWith('http') && !cat.image_url.includes('/storage/v1/object/public/menu-images/')) {
        console.log(`Migrating image for category: ${cat.slug}...`);
        const buffer = await downloadImage(cat.image_url);
        if (buffer) {
          const fileName = getFileName(cat.image_url);
          const ext = path.extname(fileName) || '.jpg';
          const storagePath = `categories/${cat.slug}${ext}`;
          const mimeType = getMimeType(cat.image_url);
          
          const newUrl = await uploadToBucket(buffer, storagePath, mimeType);
          if (newUrl) {
            console.log(`Uploaded successfully! New URL: ${newUrl}`);
            const { error: updateErr } = await supabase
              .from('categories')
              .update({ image_url: newUrl })
              .eq('id', cat.id);
            if (updateErr) {
              console.error(`Failed to update database for category ${cat.slug}:`, updateErr);
            } else {
              console.log(`Database updated for category: ${cat.slug}`);
            }
          }
        }
      }
    }
  }

  // 2. Migrate Menu Items
  console.log('\nFetching menu items from database...');
  const { data: items, error: itemErr } = await supabase
    .from('menu_items')
    .select('*');

  if (itemErr) {
    console.error('Error fetching menu items from database:', itemErr);
  } else if (items) {
    console.log(`Found ${items.length} menu items.`);
    let migratedCount = 0;
    for (const item of items) {
      if (item.image_url && item.image_url.startsWith('http') && !item.image_url.includes('/storage/v1/object/public/menu-images/')) {
        console.log(`Migrating image for item [${item.slug}] (${item.name_en})...`);
        const buffer = await downloadImage(item.image_url);
        if (buffer) {
          const fileName = getFileName(item.image_url);
          const ext = path.extname(fileName) || '.jpg';
          const storagePath = `items/${item.slug}${ext}`;
          const mimeType = getMimeType(item.image_url);

          const newUrl = await uploadToBucket(buffer, storagePath, mimeType);
          if (newUrl) {
            console.log(`Uploaded successfully! New URL: ${newUrl}`);
            const { error: updateErr } = await supabase
              .from('menu_items')
              .update({ image_url: newUrl })
              .eq('id', item.id);
            if (updateErr) {
              console.error(`Failed to update database for item ${item.slug}:`, updateErr);
            } else {
              console.log(`Database updated for item: ${item.slug}`);
              migratedCount++;
            }
          }
        }
      }
    }
    console.log(`\nSuccessfully migrated ${migratedCount} item images.`);
  }

  console.log('\nMigration process completed successfully!');
}

run();
