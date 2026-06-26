import CategoryCard from './CategoryCard';
import type { Category } from '@/lib/types';

interface Props { categories: Category[]; locale: string }

export default function CategoryGrid({ categories, locale }: Props) {
  return (
    <>
      {/* Mobile: full-width stacked landscape banners */}
      <div className="sm:hidden flex flex-col gap-3">
        {categories.map((cat) => (
          <CategoryCard key={cat.id} category={cat} locale={locale} variant="banner" />
        ))}
      </div>
      {/* Tablet+: square grid */}
      <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <CategoryCard key={cat.id} category={cat} locale={locale} variant="grid" />
        ))}
      </div>
    </>
  );
}
