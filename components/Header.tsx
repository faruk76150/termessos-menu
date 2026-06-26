'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone } from 'lucide-react';
import type { SiteSettings } from '@/lib/settings';

interface Props { locale: string; settings: SiteSettings }

export default function Header({ locale, settings }: Props) {
  const pathname = usePathname();
  const otherLocale = locale === 'tr' ? 'en' : 'tr';
  const otherPath = pathname.replace(`/${locale}`, `/${otherLocale}`);
  const phone = settings.restaurant_phone;
  const phoneHref = `tel:${phone.replace(/\s+/g, '')}`;

  return (
    <header className="sticky top-0 z-40 bg-[#0f0f0f]/95 backdrop-blur-md border-b border-[#2a2a2a]">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <Link href={`/${locale}`} className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#1e1a0e] border border-[#D4A843]/30 flex items-center justify-center font-display font-bold text-[#D4A843] text-lg leading-none">
            {settings.restaurant_name.charAt(0)}
          </div>
          <div className="leading-none">
            <p className="font-semibold text-[#f0ece4] text-[13px] tracking-widest uppercase">{settings.restaurant_name}</p>
            <p className="text-[10px] text-[#666] uppercase tracking-widest mt-0.5">{settings.restaurant_tagline}</p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <a
            href={phoneHref}
            className="sm:hidden flex items-center justify-center w-9 h-9 rounded-full bg-[#1a1a1a] border border-[#333] text-[#D4A843] hover:border-[#D4A843]/60 transition-colors"
            aria-label="Ara"
          >
            <Phone size={14} />
          </a>
          <a
            href={phoneHref}
            className="hidden sm:flex items-center gap-1.5 bg-[#1a1a1a] border border-[#333] hover:border-[#D4A843]/50 text-[#999] text-xs px-3 py-2 rounded-full transition-colors"
          >
            <Phone size={11} className="text-[#D4A843]" />
            {phone}
          </a>
          <Link
            href={otherPath}
            className="text-[11px] font-bold tracking-widest text-[#888] border border-[#333] hover:border-[#D4A843]/60 hover:text-[#D4A843] px-3 py-2 rounded-full transition-colors"
          >
            {otherLocale.toUpperCase()}
          </Link>
        </div>
      </div>
    </header>
  );
}
