import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface ThemeColors {
  primary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

interface CustomThemeContextType {
  colors: ThemeColors;
  setColors: (colors: Partial<ThemeColors>) => void;
  resetColors: () => void;
}

const defaultColors: ThemeColors = {
  primary: '#3b82f6',
  success: '#00bf63',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4',
};

const CustomThemeContext = createContext<CustomThemeContextType | undefined>(undefined);

export function CustomThemeProvider({ children }: { children: ReactNode }) {
  const [colors, setColorsState] = useState<ThemeColors>(() => {
    const savedColors = localStorage.getItem('optiflow-custom-colors');
    return savedColors ? { ...defaultColors, ...JSON.parse(savedColors) } : defaultColors;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Update CSS custom properties
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-success', colors.success);
    root.style.setProperty('--color-warning', colors.warning);
    root.style.setProperty('--color-error', colors.error);
    root.style.setProperty('--color-info', colors.info);

    // Generate lighter and darker variants
    root.style.setProperty('--color-primary-50', adjustColor(colors.primary, 95));
    root.style.setProperty('--color-primary-100', adjustColor(colors.primary, 90));
    root.style.setProperty('--color-primary-200', adjustColor(colors.primary, 80));
    root.style.setProperty('--color-primary-300', adjustColor(colors.primary, 70));
    root.style.setProperty('--color-primary-400', adjustColor(colors.primary, 60));
    root.style.setProperty('--color-primary-500', colors.primary);
    root.style.setProperty('--color-primary-600', adjustColor(colors.primary, -10));
    root.style.setProperty('--color-primary-700', adjustColor(colors.primary, -20));
    root.style.setProperty('--color-primary-800', adjustColor(colors.primary, -30));
    root.style.setProperty('--color-primary-900', adjustColor(colors.primary, -40));

    // Generate gradients
    root.style.setProperty('--gradient-primary', 
      `linear-gradient(135deg, ${colors.primary} 0%, ${adjustColor(colors.primary, -20)} 100%)`
    );
    root.style.setProperty('--gradient-success', 
      `linear-gradient(135deg, ${colors.success} 0%, ${adjustColor(colors.success, -20)} 100%)`
    );

    localStorage.setItem('optiflow-custom-colors', JSON.stringify(colors));
  }, [colors]);

  const setColors = (newColors: Partial<ThemeColors>) => {
    setColorsState(prev => ({ ...prev, ...newColors }));
  };

  const resetColors = () => {
    setColorsState(defaultColors);
    localStorage.removeItem('optiflow-custom-colors');
  };

  return (
    <CustomThemeContext.Provider value={{ colors, setColors, resetColors }}>
      {children}
    </CustomThemeContext.Provider>
  );
}

export const useCustomTheme = () => {
  const context = useContext(CustomThemeContext);
  if (context === undefined) {
    throw new Error('useCustomTheme must be used within a CustomThemeProvider');
  }
  return context;
};

// Helper function to adjust color brightness
function adjustColor(color: string, amount: number): string {
  const usePound = color[0] === '#';
  const col = usePound ? color.slice(1) : color;
  
  const num = parseInt(col, 16);
  let r = (num >> 16) + amount;
  let g = (num >> 8 & 0x00FF) + amount;
  let b = (num & 0x0000FF) + amount;
  
  r = r > 255 ? 255 : r < 0 ? 0 : r;
  g = g > 255 ? 255 : g < 0 ? 0 : g;
  b = b > 255 ? 255 : b < 0 ? 0 : b;
  
  return (usePound ? '#' : '') + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
}