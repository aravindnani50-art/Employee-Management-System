import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

const STORAGE_KEYS = {
  THEME: 'ems_theme_preference',
  PALETTE: 'ems_palette_preference',
  FONT: 'ems_font_preference',
  FONT_SIZE: 'ems_fontsize_preference',
  FONT_STYLE: 'ems_fontstyle_preference'
};

export const AVAILABLE_PALETTES = [
  {
    id: 'sonar',
    name: 'Sonar Oceanic',
    description: 'Deep navy enterprise blue',
    primary: '#2563eb',
    accent: '#38bdf8',
    previewBg: '#0b1120'
  },
  {
    id: 'slate',
    name: 'Clean SaaS Slate',
    description: 'Modern indigo & slate SaaS (Screenshot style)',
    primary: '#6366f1',
    accent: '#818cf8',
    previewBg: '#0f172a'
  },
  {
    id: 'tradem-violet',
    name: 'TradeM Cyber Violet',
    description: 'Deep plum neon with violet glow (from TradeM)',
    primary: '#a855f7',
    accent: '#38bdf8',
    previewBg: '#120824'
  },
  {
    id: 'blockchain-carbon',
    name: 'Obsidian Carbon & Amber',
    description: 'Carbon trading dark with fiery amber & emerald (from Blockchain.com)',
    primary: '#f97316',
    accent: '#10b981',
    previewBg: '#0a0e17'
  },
  {
    id: 'aurora-edu',
    name: 'Aurora Gradient',
    description: 'Ocean cyan to deep violet gradient (from Education EMS)',
    primary: '#0284c7',
    accent: '#7c3aed',
    previewBg: '#070d1e'
  },
  {
    id: 'royal-berry',
    name: 'Royal Berry EMS',
    description: 'Executive deep berry magenta & crisp porcelain (from EMS Dashboard)',
    primary: '#9d174d',
    accent: '#f472b6',
    previewBg: '#190915'
  },
  {
    id: 'midnight',
    name: 'Cyber Midnight',
    description: 'Pitch black OLED with neon cyan',
    primary: '#06b6d4',
    accent: '#22d3ee',
    previewBg: '#030712'
  },
  {
    id: 'purple',
    name: 'Purple Nebula',
    description: 'Deep violet & vivid fuchsia',
    primary: '#8b5cf6',
    accent: '#d946ef',
    previewBg: '#130826'
  },
  {
    id: 'emerald',
    name: 'Emerald Matrix',
    description: 'Cyber forest & luminous mint',
    primary: '#10b981',
    accent: '#34d399',
    previewBg: '#041711'
  },
  {
    id: 'amber',
    name: 'Sunset Amber',
    description: 'Warm dark coffee & golden amber',
    primary: '#f59e0b',
    accent: '#fbbf24',
    previewBg: '#19120c'
  },
  {
    id: 'rose',
    name: 'Crimson Rose',
    description: 'Charcoal & radiant electric rose',
    primary: '#f43f5e',
    accent: '#fb7185',
    previewBg: '#1a0d13'
  }
];

export const AVAILABLE_FONTS = [
  {
    id: 'jakarta',
    name: 'Plus Jakarta Sans',
    category: 'Modern SaaS (Default)',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    sample: 'The quick brown fox jumps'
  },
  {
    id: 'inter',
    name: 'Inter',
    category: 'Classic Tech UI',
    fontFamily: "'Inter', sans-serif",
    sample: 'The quick brown fox jumps'
  },
  {
    id: 'dmsans',
    name: 'DM Sans',
    category: 'Clean Grotesque',
    fontFamily: "'DM Sans', sans-serif",
    sample: 'The quick brown fox jumps'
  },
  {
    id: 'outfit',
    name: 'Outfit',
    category: 'Futuristic Geometric',
    fontFamily: "'Outfit', sans-serif",
    sample: 'The quick brown fox jumps'
  },
  {
    id: 'playfair',
    name: 'Playfair Display',
    category: 'Editorial Serif & Luxury',
    fontFamily: "'Playfair Display', Georgia, serif",
    sample: 'The quick brown fox jumps'
  },
  {
    id: 'roboto',
    name: 'Roboto',
    category: 'Clean Modern Neo-Grotesque',
    fontFamily: "'Roboto', sans-serif",
    sample: 'The quick brown fox jumps'
  },
  {
    id: 'caveat',
    name: 'Caveat',
    category: 'Expressive Cursive Script',
    fontFamily: "'Caveat', cursive",
    sample: 'The quick brown fox jumps'
  },
  {
    id: 'mono',
    name: 'JetBrains Mono',
    category: 'Developer Code & Cyber',
    fontFamily: "'JetBrains Mono', monospace",
    sample: 'The quick brown fox jumps'
  }
];

export const AVAILABLE_FONT_STYLES = [
  {
    id: 'normal',
    label: 'Normal',
    name: 'Normal / Regular',
    desc: 'Standard clean typography posture',
    sample: 'Standard text'
  },
  {
    id: 'bold',
    label: 'Bold',
    name: 'Bold Emphasis',
    desc: 'Punchy heavy weight (700)',
    sample: 'Bold text'
  },
  {
    id: 'italic',
    label: 'Italic',
    name: 'Italic Posture',
    desc: 'Slanted italic elegance',
    sample: 'Italic text'
  },
  {
    id: 'bold-italic',
    label: 'Bold Italic',
    name: 'Bold Italic',
    desc: 'Combined weight & italic slant',
    sample: 'Bold italic text'
  },
  {
    id: 'cursive',
    label: 'Cursive',
    name: 'Cursive / Script',
    desc: 'Handcrafted cursive styling',
    sample: 'Cursive script'
  }
];

export const AVAILABLE_FONT_SIZES = [
  {
    id: 'compact',
    label: 'Compact',
    sizeName: 'Dense (12px)',
    desc: 'High data density'
  },
  {
    id: 'small',
    label: 'Small',
    sizeName: 'Small SaaS (13px)',
    desc: 'Screenshot style (Default)'
  },
  {
    id: 'normal',
    label: 'Normal',
    sizeName: 'Standard (14.5px)',
    desc: 'Standard balanced size'
  },
  {
    id: 'large',
    label: 'Spacious',
    sizeName: 'Large (16px)',
    desc: 'Maximum readability'
  }
];

export function ThemeProvider({ children }) {
  // Theme Mode (dark | light)
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved === 'dark' || saved === 'light') return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  // Color Palette
  const [palette, setPalette] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PALETTE);
    return AVAILABLE_PALETTES.some((p) => p.id === saved) ? saved : 'sonar';
  });

  // Font Family (Default to Plus Jakarta Sans matching the screenshot!)
  const [fontFamily, setFontFamily] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FONT);
    return AVAILABLE_FONTS.some((f) => f.id === saved) ? saved : 'jakarta';
  });

  // Font Size (Default to 'small' matching the screenshot!)
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FONT_SIZE);
    return AVAILABLE_FONT_SIZES.some((s) => s.id === saved) ? saved : 'small';
  });

  // Font Styling (Normal | Bold | Italic | Bold Italic | Cursive)
  const [fontStyle, setFontStyle] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FONT_STYLE);
    return AVAILABLE_FONT_STYLES.some((s) => s.id === saved) ? saved : 'normal';
  });

  // Apply to DOM & persist
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-palette', palette);
    localStorage.setItem(STORAGE_KEYS.PALETTE, palette);
  }, [palette]);

  useEffect(() => {
    document.documentElement.setAttribute('data-font', fontFamily);
    localStorage.setItem(STORAGE_KEYS.FONT, fontFamily);
  }, [fontFamily]);

  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize);
    localStorage.setItem(STORAGE_KEYS.FONT_SIZE, fontSize);
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.setAttribute('data-font-style', fontStyle);
    localStorage.setItem(STORAGE_KEYS.FONT_STYLE, fontStyle);
  }, [fontStyle]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
    setTheme,
    palette,
    setPalette,
    fontFamily,
    setFontFamily,
    fontSize,
    setFontSize,
    fontStyle,
    setFontStyle,
    palettes: AVAILABLE_PALETTES,
    fonts: AVAILABLE_FONTS,
    fontSizes: AVAILABLE_FONT_SIZES,
    fontStyles: AVAILABLE_FONT_STYLES
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
