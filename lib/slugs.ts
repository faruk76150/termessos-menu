// Localized category slug mapping
// Key: database slug (default Turkish)
// Value: English slug
export const SLUG_MAP_TR_TO_EN: Record<string, string> = {
  'kahvalti': 'breakfast',
  'gozleme': 'turkish-flatbread',
  'gunun-corbasi': 'soup-of-the-day',
  'meze': 'mezze',
  'ara-sicaklar': 'hot-starters',
  'salatalar': 'salads',
  'fast-food': 'fast-food',
  'tava-yemekleri': 'pan-dishes',
  'makarnalar': 'pasta',
  'ana-yemekler': 'main-courses',
  'baliklar': 'fish',
  'testi-kebaplari': 'clay-pot-kebabs',
  'tatlilar': 'desserts',
  'soguk-icecekler': 'cold-beverages',
  'sicak-icecekler': 'hot-beverages',
  'kokteyller-alkolsuz': 'mocktails',
  'biralar': 'beers',
  'cin': 'gin',
  'rakilar': 'raki',
  'votka': 'vodka',
  'alkollu-icecekler-kokteyller': 'cocktails-spirits',
  'viski': 'whiskey',
  'sarap': 'wine',
};

// Inverse map for English to database slug
export const SLUG_MAP_EN_TO_TR: Record<string, string> = Object.entries(SLUG_MAP_TR_TO_EN).reduce(
  (acc, [tr, en]) => {
    acc[en] = tr;
    return acc;
  },
  {} as Record<string, string>
);

/**
 * Returns the slug to be shown in the URL for a given category database slug and locale
 */
export function getLocalizedSlug(dbSlug: string, locale: string): string {
  if (locale === 'en') {
    return SLUG_MAP_TR_TO_EN[dbSlug] || dbSlug;
  }
  return dbSlug; // Default is Turkish slug in DB
}

/**
 * Resolves a URL slug (which might be English or Turkish) back to the database slug
 */
export function getDbSlug(urlSlug: string): string {
  return SLUG_MAP_EN_TO_TR[urlSlug] || urlSlug;
}
