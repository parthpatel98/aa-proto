import React, { useState } from 'react';
import { PRODUCT_THEMES } from '../themes';
import { useProductTheme } from '../ThemeContext';

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useProductTheme();
  const [open, setOpen] = useState(true);
  const active = PRODUCT_THEMES.find((item) => item.id === theme) ?? PRODUCT_THEMES[0];

  return (
    <div className={`theme-trial ${open ? 'open' : 'closed'}`}>
      <button
        type="button"
        className="theme-trial-toggle"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span className="theme-trial-dots" aria-hidden="true">
          <i style={{ background: active.swatch.nav }} />
          <i style={{ background: active.swatch.canvas }} />
          <i style={{ background: active.swatch.accent }} />
        </span>
        <span>Themes</span>
        <span className="theme-trial-caret">{open ? '▾' : '▴'}</span>
      </button>

      {open && (
        <div className="theme-trial-panel">
          <p className="theme-trial-lead">Try palettes. Saved in this browser until you pick one.</p>
          <ul className="theme-trial-list">
            {PRODUCT_THEMES.map((item) => {
              const selected = item.id === theme;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`theme-trial-option${selected ? ' on' : ''}`}
                    onClick={() => setTheme(item.id)}
                    aria-pressed={selected}
                  >
                    <span className="theme-trial-swatch" aria-hidden="true">
                      <i style={{ background: item.swatch.nav }} />
                      <i style={{ background: item.swatch.canvas }} />
                      <i style={{ background: item.swatch.accent }} />
                    </span>
                    <span className="theme-trial-copy">
                      <span className="theme-trial-name">
                        {item.name}
                        {item.tag ? <em>{item.tag}</em> : null}
                      </span>
                      <span className="theme-trial-note">{item.note}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
