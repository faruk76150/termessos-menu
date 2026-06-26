export interface Category {
  id: string;
  slug: string;
  name_tr: string;
  name_en: string;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  is_drink: boolean;
}

export interface MenuItem {
  id: string;
  category_id: string;
  slug: string;
  name_tr: string;
  name_en: string;
  description_tr: string;
  description_en: string;
  price: number;
  image_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
}

export type Locale = 'tr' | 'en';
