
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface A11yContextType {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  setHighContrast: (enabled: boolean) => void;
  setLargeText: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
}

const A11yContext = createContext<A11yContextType | undefined>(undefined);

export const useA11y = () => {
  const context = useContext(A11yContext);
  if (!context) {
    throw new Error('useA11y must be used within an A11yProvider');
  }
  return context;
};

interface A11yProviderProps {
  children: ReactNode;
}

export const A11yProvider: React.FC<A11yProviderProps> = ({ children }) => {
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  return (
    <A11yContext.Provider value={{
      highContrast,
      largeText,
      reducedMotion,
      setHighContrast,
      setLargeText,
      setReducedMotion
    }}>
      {children}
    </A11yContext.Provider>
  );
};
