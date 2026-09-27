export const PRODUCT_THEMES = [
  {
    id: 'harbour',
    name: 'Harbour',
    tag: 'Recommended',
    note: 'Dock navy chrome, misted teal workspace. Closest to the logo mark.',
    swatch: { nav: '#0C3338', canvas: '#E7F0EF', accent: '#2FB8AE' }
  },
  {
    id: 'fjord',
    name: 'Fjord',
    tag: 'Cool',
    note: 'Steel-blue bar and ice canvas. More Scandinavian, still teal accents.',
    swatch: { nav: '#173A4A', canvas: '#E8F1F6', accent: '#2AA0B0' }
  },
  {
    id: 'signal',
    name: 'Signal',
    tag: 'Bold',
    note: 'Navbar in the logo teal itself. Highest colour on chrome.',
    swatch: { nav: '#1A9A92', canvas: '#F2F8F6', accent: '#0D7370' }
  },
  {
    id: 'dock',
    name: 'Night dock',
    tag: 'Contrast',
    note: 'Near-black teal chrome against a cooler grey-green page.',
    swatch: { nav: '#071618', canvas: '#DCE8E6', accent: '#2FB8AE' }
  },
  {
    id: 'sand',
    name: 'Warm sand',
    tag: 'Current',
    note: 'The original warm off-white with a white bar. Kept for comparison.',
    swatch: { nav: '#FFFFFF', canvas: '#F4F3EF', accent: '#0E6F74' }
  },
  {
    id: 'aalogistik',
    name: 'aalogistik.se',
    tag: 'Brand',
    note: 'Clean white nav, warm paper canvas, red active states — matches the logo mark.',
    swatch: { nav: '#FFFFFF', canvas: '#F7F5F0', accent: '#E31B23' }
  }
] as const;

export type ProductThemeId = (typeof PRODUCT_THEMES)[number]['id'];

export const DEFAULT_PRODUCT_THEME: ProductThemeId = 'aalogistik';
export const PRODUCT_THEME_STORAGE_KEY = 'aa-product-theme';

export function isProductThemeId(value: string): value is ProductThemeId {
  return PRODUCT_THEMES.some((theme) => theme.id === value);
}
