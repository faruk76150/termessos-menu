import Link from 'next/link';
import { LayoutDashboard, List, UtensilsCrossed, Settings, LogOut, ExternalLink } from 'lucide-react';

const nav = [
  { href: '/admin', label: 'Gösterge Paneli', icon: LayoutDashboard },
  { href: '/admin/categories', label: 'Kategoriler', icon: List },
  { href: '/admin/items', label: 'Ürünler', icon: UtensilsCrossed },
  { href: '/admin/settings', label: 'Ayarlar', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-100 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-stone-900 text-stone-200 flex flex-col">
        <div className="px-5 py-6 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-sm font-display">T</div>
            <div>
              <p className="font-display font-semibold text-sm">Termessos</p>
              <p className="text-xs text-stone-500">Admin Paneli</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-stone-800 transition text-stone-300 hover:text-white"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-stone-800 space-y-1">
          <Link
            href="/tr"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <ExternalLink size={16} />
            Menüyü Görüntüle
          </Link>
          <Link
            href="/api/auth?logout=1"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-stone-400 hover:text-red-400 hover:bg-stone-800 transition"
          >
            <LogOut size={16} />
            Çıkış Yap
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
