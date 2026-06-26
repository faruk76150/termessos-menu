-- Grant SELECT on public tables to anon and authenticated roles
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT SELECT ON public.menu_items TO anon, authenticated;
GRANT SELECT ON public.settings TO anon, authenticated;
