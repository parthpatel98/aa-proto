import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_PRODUCT_THEME,
  PRODUCT_THEME_STORAGE_KEY,
  isProductThemeId,
  type ProductThemeId
} from './themes';

interface ThemeContextValue {
  theme: ProductThemeId;
  setTheme: (id: ProductThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredTheme(): ProductThemeId {
  try {
    const saved = localStorage.getItem(PRODUCT_THEME_STORAGE_KEY);
    if (saved && isProductThemeId(saved)) return saved;
  } catch {}
  return DEFAULT_PRODUCT_THEME;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ProductThemeId>(readStoredTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-product-theme', theme);
    try {
      localStorage.setItem(PRODUCT_THEME_STORAGE_KEY, theme);
    } catch {}
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useProductTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useProductTheme must be used within ThemeProvider');
  return ctx;
}
