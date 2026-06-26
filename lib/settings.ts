import { supabaseAdmin } from '@/lib/supabase';

export interface SiteSettings {
  restaurant_name: string;
  restaurant_tagline: string;
  restaurant_location: string;
  restaurant_hours: string;
  restaurant_phone: string;
  food_section_label_tr: string;
  food_section_label_en: string;
  drinks_section_label_tr: string;
  drinks_section_label_en: string;
}

const DEFAULTS: SiteSettings = {
  restaurant_name: 'Termessos Hotel',
  restaurant_tagline: 'Hotel & Restaurant',
  restaurant_location: 'Göreme / Nevşehir',
  restaurant_hours: '07:00 – 00:00',
  restaurant_phone: '+90 384 271 24 95',
  food_section_label_tr: 'Yiyecekler',
  food_section_label_en: 'Food',
  drinks_section_label_tr: 'İçecekler',
  drinks_section_label_en: 'Drinks',
};

export async function getSettings(): Promise<SiteSettings> {
  try {
    const { data, error } = await supabaseAdmin().from('settings').select('key,value');
    if (error || !data) return DEFAULTS;
    const map: Record<string, string> = {};
    data.forEach(({ key, value }: { key: string; value: string }) => { map[key] = value; });
    return { ...DEFAULTS, ...map } as SiteSettings;
  } catch {
    return DEFAULTS;
  }
}
