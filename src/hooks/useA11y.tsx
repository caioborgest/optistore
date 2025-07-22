import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface A11yOptions {
  reduceMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  focusVisible: boolean;
  keyboardNavigation: boolean;
}

interface A11yContextType {
  options: A11yOptions;
  setOption: (option: keyof A11yOptions, value: boolean) => void;
  resetOptions: () => void;
  announceToScreenReader: (message: string) => void;
}

const defaultOptions: A11yOptions = {
  reduceMotion: false,
  highContrast: false,
  largeText: false,
  screenReader: false,
  focusVisible: true,
  keyboardNavigation: true,
};

const A11yContext = createContext<A11yContextType | undefined>(undefined);

export function A11yProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<A11yOptions>(() => {
    const savedOptions = localStorage.getItem('optiflow-a11y-options');
    const systemPreferences = {
      reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    };
    
    return savedOptions 
      ? { ...defaultOptions, ...systemPreferences, ...JSON.parse(savedOptions) }
      : { ...defaultOptions, ...systemPreferences };
  });

  const [announcer, setAnnouncer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create screen reader announcer
    const announcerElement = document.createElement('div');
    announcerElement.setAttribute('aria-live', 'polite');
    announcerElement.setAttribute('aria-atomic', 'true');
    announcerElement.className = 'sr-only';
    document.body.appendChild(announcerElement);
    setAnnouncer(announcerElement);

    return () => {
      if (announcerElement.parentNode) {
        announcerElement.parentNode.removeChild(announcerElement);
      }
    };
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Apply accessibility classes
    root.classList.toggle('reduce-motion', options.reduceMotion);
    root.classList.toggle('high-contrast', options.highContrast);
    root.classList.toggle('large-text', options.largeText);
    root.classList.toggle('screen-reader-optimized', options.screenReader);
    root.classList.toggle('focus-visible-enhanced', options.focusVisible);
    root.classList.toggle('keyboard-navigation', options.keyboardNavigation);

    // Set ARIA attributes
    if (options.screenReader) {
      root.setAttribute('role', 'application');
      root.setAttribute('aria-label', 'OptiFlow - Sistema de Gestão de Tarefas');
    } else {
      root.removeAttribute('role');
      root.removeAttribute('aria-label');
    }

    // Save preferences
    localStorage.setItem('optiflow-a11y-options', JSON.stringify(options));
  }, [options]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => {
      setOptions(prev => ({ ...prev, reduceMotion: mediaQuery.matches }));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const setOption = (option: keyof A11yOptions, value: boolean) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  const resetOptions = () => {
    const systemPreferences = {
      reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    };
    setOptions({ ...defaultOptions, ...systemPreferences });
    localStorage.removeItem('optiflow-a11y-options');
  };

  const announceToScreenReader = (message: string) => {
    if (announcer && options.screenReader) {
      announcer.textContent = message;
      setTimeout(() => {
        announcer.textContent = '';
      }, 1000);
    }
  };

  return (
    <A11yContext.Provider value={{ options, setOption, resetOptions, announceToScreenReader }}>
      {children}
    </A11yContext.Provider>
  );
}

export const useA11y = () => {
  const context = useContext(A11yContext);
  if (context === undefined) {
    throw new Error('useA11y must be used within an A11yProvider');
  }
  return context;
};