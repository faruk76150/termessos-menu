import { createClient } from '@supabase/supabase-js';

const noStoreFetch: typeof fetch = (url, init) =>
  fetch(url, { ...init, cache: 'no-store' });

export function supabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase env vars not configured');
  return createClient(url, key, { global: { fetch: noStoreFetch } });
}

export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase admin env vars not configured');
  return createClient(url, key, { global: { fetch: noStoreFetch } });
}
