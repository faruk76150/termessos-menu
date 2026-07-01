import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');
  return (
    <footer className="border-t border-[#1e1e1e]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-px w-8 bg-[#D4A843]/30" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#D4A843]/50" />
          <div className="h-px w-8 bg-[#D4A843]/30" />
        </div>
        <p className="text-[#444] text-xs leading-relaxed">{t('prices')}</p>
        <p className="text-[#444] text-xs leading-relaxed mt-1">{t('allergy')}</p>
        <p className="text-[#555] text-[11px] mt-4">{t('copyright')}</p>
      </div>
    </footer>
  );
}
