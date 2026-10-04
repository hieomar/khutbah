import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function Logo({ className = '', size = 'md', showText = true }: LogoProps) {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Minimal geometric logo combining media/play concept with subtle geometric balance */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center rounded-full bg-[#171717] text-[#DADAD4] shadow-xs group-hover:scale-105 transition-transform`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4 text-[#F1F1EC]"
        >
          {/* Subtle 8-point geometric star rotated with subtle center play geometry */}
          <polygon
            points="12 2 15 8 22 8 16 13 18 20 12 16 6 20 8 13 2 8 9 8 12 2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeOpacity="0.4"
          />
          {/* Crisp play triangle representing media streaming */}
          <polygon points="10 8 16 12 10 16 10 8" fill="#F1F1EC" stroke="none" />
        </svg>
        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#FF713F]" />
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={`${textSizes[size]} font-serif-heading font-medium tracking-tight text-[#171717]`}
          >
            Khutbah
          </span>
          <span className="text-[9px] tracking-widest uppercase text-[#55554F] font-medium font-sans">
            Malawi Media
          </span>
        </div>
      )}
    </div>
  );
}
