
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface A11yOptions {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  focusVisible: boolean;
  keyboardNavigation: boolean;
  reduceMotion: boolean;
}

interface A11yContextType {
  options: A11yOptions;
  setOption: (option: keyof A11yOptions, value: boolean) => void;
  resetOptions: () => void;
  announceToScreenReader: (message: string) => void;
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

const defaultOptions: A11yOptions = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  screenReader: false,
  focusVisible: false,
  keyboardNavigation: false,
  reduceMotion: false
};

export const A11yProvider: React.FC<A11yProviderProps> = ({ children }) => {
  const [options, setOptions] = useState<A11yOptions>(defaultOptions);

  const setOption = (option: keyof A11yOptions, value: boolean) => {
    setOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  const resetOptions = () => {
    setOptions(defaultOptions);
  };

  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  return (
    <A11yContext.Provider value={{ options, setOption, resetOptions, announceToScreenReader }}>
      {children}
    </A11yContext.Provider>
  );
};
