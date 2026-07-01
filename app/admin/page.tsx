import { supabaseClient } from '@/lib/supabase';
import { CATEGORIES, MENU_ITEMS } from '@/lib/menuData';
import Link from 'next/link';
import { List, UtensilsCrossed, CheckCircle } from 'lucide-react';

async function getStats() {
  try {
    const db = supabaseClient();
    const [{ count: cats }, { count: items }] = await Promise.all([
      db.from('categories').select('*', { count: 'exact', head: true }).eq('is_active', true),
      db.from('menu_items').select('*', { count: 'exact', head: true }).eq('is_active', true),
    ]);
    return { categories: cats ?? 0, items: items ?? 0 };
  } catch {
    return { categories: CATEGORIES.length, items: MENU_ITEMS.length };
  }
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    { label: 'Aktif Kategoriler', value: stats.categories, icon: List, color: 'bg-blue-50 text-blue-700', href: '/admin/categories' },
    { label: 'Toplam Ürün', value: stats.items, icon: UtensilsCrossed, color: 'bg-green-50 text-green-700', href: '/admin/items' },
    { label: 'Menü Durumu', value: 'Aktif', icon: CheckCircle, color: 'bg-amber-50 text-amber-700', href: '/tr' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-display font-bold text-stone-800 mb-2">Gösterge Paneli</h1>
      <p className="text-stone-600 text-sm mb-8">Termessos Hotel QR Menü Yönetimi</p>

      <div className="grid grid-cols-3 gap-6 mb-8">
        {cards.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <div className={`inline-flex p-3 rounded-xl ${color} mb-4`}>
              <Icon size={22} />
            </div>
            <p className="text-3xl font-bold text-stone-800">{value}</p>
            <p className="text-sm text-stone-600 mt-1">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-stone-700 mb-4">Hızlı Bağlantılar</h2>
          <div className="space-y-2">
            {[
              { href: '/admin/categories', label: '+ Yeni Kategori Ekle' },
              { href: '/admin/items', label: '+ Yeni Ürün Ekle' },
              { href: '/tr', label: '↗ Menüyü Görüntüle (TR)' },
              { href: '/en', label: '↗ Menüyü Görüntüle (EN)' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="block text-sm text-brand-700 hover:text-brand-900 hover:underline py-1"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-stone-700 mb-4">Restoran Bilgileri</h2>
          <dl className="space-y-2 text-sm">
            {[
              ['Ad', 'Termessos Hotel'],
              ['Konum', 'Göreme / Nevşehir'],
              ['Saat', '07:00 – 00:00'],
              ['E-posta', 'info@termessoshotel.com.tr'],
              ['Telefon', '+90 384 271 24 95'],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <dt className="text-stone-600 w-20 flex-shrink-0 font-medium">{k}:</dt>
                <dd className="text-stone-800">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
