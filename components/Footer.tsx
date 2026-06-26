import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');
  return (
    <footer className="bg-stone-950 text-stone-500 mt-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 text-center space-y-1.5 text-xs">
        <p>{t('prices')}</p>
        <p>{t('allergy')}</p>
        <p className="text-stone-600 pt-2">{t('copyright')}</p>
      </div>
    </footer>
  );
}
