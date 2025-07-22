import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'text';
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md',
  variant = 'full' 
}) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-24'
  };

  const textSizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
    xl: 'text-6xl'
  };

  if (variant === 'icon') {
    return (
      <div className={`${sizeClasses[size]} ${className} flex items-center justify-center`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Ícone estilizado do OptiFlow */}
          <circle cx="50" cy="50" r="45" fill="url(#gradient)" stroke="#00bf63" strokeWidth="2"/>
          <path
            d="M30 35 L45 50 L70 25"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M30 55 L45 70 L70 45"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00bf63" />
              <stop offset="100%" stopColor="#00a855" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`${className} flex items-center`}>
        <span className={`font-bold ${textSizeClasses[size]} bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent`}>
          Opti
        </span>
        <span className={`font-bold ${textSizeClasses[size]} text-gray-700 dark:text-gray-300`}>
          Flow
        </span>
        <span className={`ml-2 text-xs font-medium text-green-600 uppercase tracking-wider ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'}`}>
          VAREJO
        </span>
      </div>
    );
  }

  // Variant 'full' - Logo completa
  return (
    <div className={`${className} flex items-center gap-3`}>
      <div className={`${sizeClasses[size]} flex items-center justify-center`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="50" r="45" fill="url(#gradient)" stroke="#00bf63" strokeWidth="2"/>
          <path
            d="M30 35 L45 50 L70 25"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M30 55 L45 70 L70 45"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00bf63" />
              <stop offset="100%" stopColor="#00a855" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center">
          <span className={`font-bold ${textSizeClasses[size]} bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent`}>
            Opti
          </span>
          <span className={`font-bold ${textSizeClasses[size]} text-gray-700 dark:text-gray-300`}>
            Flow
          </span>
        </div>
        <span className={`text-green-600 font-medium uppercase tracking-wider ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'}`}>
          VAREJO
        </span>
      </div>
    </div>
  );
};