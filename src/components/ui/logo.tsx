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

  const widthClasses = {
    sm: 'w-32',
    md: 'w-48',
    lg: 'w-64',
    xl: 'w-80'
  };

  // Logo SVG baseada na imagem fornecida - centralizada
  const OptiFlowLogo = ({ className: logoClassName = '' }: { className?: string }) => (
    <svg
      viewBox="0 0 800 200"
      className={logoClassName}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* "Opti" em verde - centralizado */}
      <text x="150" y="130" fontSize="80" fontWeight="bold" fill="#00D26A" fontFamily="Arial, sans-serif" textAnchor="middle">
        Opti
      </text>
      
      {/* "Flow" em cinza - centralizado */}
      <text x="350" y="130" fontSize="80" fontWeight="bold" fill="#6B7280" fontFamily="Arial, sans-serif" textAnchor="middle">
        Flow
      </text>
      
      {/* "VAREJO" em verde menor - posicionado no canto superior direito */}
      <text x="650" y="50" fontSize="20" fontWeight="600" fill="#00D26A" fontFamily="Arial, sans-serif" letterSpacing="1px">
        VAREJO
      </text>
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div className={`${sizeClasses[size]} ${className} flex items-center justify-center`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Ícone circular com "O" estilizado */}
          <circle cx="50" cy="50" r="45" fill="#00D26A" stroke="#00bf63" strokeWidth="2"/>
          <text x="50" y="65" fontSize="48" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial, sans-serif">
            O
          </text>
        </svg>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`${className} flex items-center gap-2 justify-center`}>
        <span className="font-bold text-2xl md:text-3xl text-green-500">
          Opti
        </span>
        <span className="font-bold text-2xl md:text-3xl text-gray-600 dark:text-gray-300">
          Flow
        </span>
        <span className="ml-2 text-xs font-semibold text-green-500 uppercase tracking-wider">
          VAREJO
        </span>
      </div>
    );
  }

  // Variant 'full' - Logo completa baseada na imagem
  return (
    <div className={`${className} ${widthClasses[size]} ${sizeClasses[size]} flex justify-center`}>
      <OptiFlowLogo className="w-full h-full" />
    </div>
  );
};