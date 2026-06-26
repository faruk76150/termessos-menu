import { getRequestConfig } from 'next-intl/server';

export const locales = ['tr', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'tr';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  return {
    locale: locale ?? defaultLocale,
    messages: (await import(`@/messages/${locale ?? defaultLocale}.json`)).default,
  };
});
