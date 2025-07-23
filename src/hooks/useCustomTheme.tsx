
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CustomThemeContextType {
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
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

export const CustomThemeProvider: React.FC<CustomThemeProviderProps> = ({ children }) => {
  const [primaryColor, setPrimaryColor] = useState('#3B82F6');

  return (
    <CustomThemeContext.Provider value={{ primaryColor, setPrimaryColor }}>
      {children}
    </CustomThemeContext.Provider>
  );
};
