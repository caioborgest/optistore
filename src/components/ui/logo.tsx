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

  // Logo SVG baseada na imagem fornecida com fonte Lato e fundo transparente
  const OptiFlowLogo = ({ className: logoClassName = '' }: { className?: string }) => (
    <svg
      viewBox="0 0 1024 256"
      className={logoClassName}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Sem background para ter fundo transparente */}
      
      {/* "Opti" em verde */}
      <text x="50" y="180" fontSize="120" fontWeight="bold" fill="#00D26A" fontFamily="'Lato', sans-serif">
        Opti
      </text>
      
      {/* "Flow" em cinza */}
      <text x="350" y="180" fontSize="120" fontWeight="bold" fill="#6B7280" fontFamily="'Lato', sans-serif">
        Flow
      </text>
      
      {/* "VAREJO" em verde menor */}
      <text x="850" y="80" fontSize="32" fontWeight="600" fill="#00D26A" fontFamily="'Lato', sans-serif" letterSpacing="2px">
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
          <text x="50" y="65" fontSize="48" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="'Lato', sans-serif">
            O
          </text>
        </svg>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`${className} flex items-center gap-2`}>
        <span className="font-bold text-2xl md:text-3xl text-green-500 font-lato">
          Opti
        </span>
        <span className="font-bold text-2xl md:text-3xl text-gray-600 dark:text-gray-300 font-lato">
          Flow
        </span>
        <span className="ml-2 text-xs font-semibold text-green-500 uppercase tracking-wider font-lato">
          VAREJO
        </span>
      </div>
    );
  }

  // Variant 'full' - Logo completa baseada na imagem
  return (
    <div className={`${className} ${widthClasses[size]} ${sizeClasses[size]}`}>
      <OptiFlowLogo className="w-full h-full" />
    </div>
  );
};