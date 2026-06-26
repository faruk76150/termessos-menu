import CategoryCard from './CategoryCard';
import type { Category } from '@/lib/types';

interface Props { categories: Category[]; locale: string }

export default function CategoryGrid({ categories, locale }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {categories.map((cat) => (
        <CategoryCard key={cat.id} category={cat} locale={locale} />
      ))}
    </div>
  );
}
