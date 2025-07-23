
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Colors {
  primary: string;
  success: string;
}

interface CustomThemeContextType {
  colors: Colors;
  setColors: (colors: Partial<Colors>) => void;
  resetColors: () => void;
}

const CustomThemeContext = createContext<CustomThemeContextType | undefined>(undefined);

export const useCustomTheme = () => {
  const context = useContext(CustomThemeContext);
  if (!context) {
    throw new Error('useCustomTheme must be used within a CustomThemeProvider');
  }
  return context;
};

interface CustomThemeProviderProps {
  children: ReactNode;
}

const defaultColors: Colors = {
  primary: '#3B82F6',
  success: '#00bf63'
};

export const CustomThemeProvider: React.FC<CustomThemeProviderProps> = ({ children }) => {
  const [colors, setColorsState] = useState<Colors>(defaultColors);

  useEffect(() => {
    const savedColors = localStorage.getItem('customColors');
    if (savedColors) {
      try {
        const parsed = JSON.parse(savedColors);
        setColorsState({ ...defaultColors, ...parsed });
      } catch (error) {
        console.error('Error parsing saved colors:', error);
      }
    }
  }, []);

  const setColors = (newColors: Partial<Colors>) => {
    const updatedColors = { ...colors, ...newColors };
    setColorsState(updatedColors);
    localStorage.setItem('customColors', JSON.stringify(updatedColors));
    
    // Apply CSS variables
    Object.entries(updatedColors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value);
    });
  };

  const resetColors = () => {
    setColorsState(defaultColors);
    localStorage.removeItem('customColors');
    
    // Reset CSS variables
    Object.keys(defaultColors).forEach(key => {
      document.documentElement.style.removeProperty(`--color-${key}`);
    });
  };

  return (
    <CustomThemeContext.Provider value={{ colors, setColors, resetColors }}>
      {children}
    </CustomThemeContext.Provider>
  );
};
