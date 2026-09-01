import React, { useState } from 'react';

interface BaLangLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const BaLangLogo: React.FC<BaLangLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const [imgError, setImgError] = useState(false);

  // Height configurations
  const heightClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
  };

  // If remote image fails, render our vector Ba Làng TH emblem
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {!imgError ? (
        <img
          src="https://balang.com.vn/wp-content/uploads/2023/06/LOGO-BA-LANG-TH.svg"
          alt="Ba Làng TH"
          className={`${heightClasses[size]} w-auto object-contain max-w-[160px] drop-shadow`}
          onError={() => setImgError(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        /* Standalone Vector SVG Emblem of Ba Làng TH */
        <div className="flex items-center gap-2">
          <svg
            viewBox="0 0 160 48"
            className={`${heightClasses[size]} w-auto`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="bl-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="50%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>
              <linearGradient id="bl-red-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="100%" stopColor="#991B1B" />
              </linearGradient>
              <linearGradient id="bl-blue-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0284C7" />
                <stop offset="100%" stopColor="#0369A1" />
              </linearGradient>
            </defs>

            {/* Seal / Emblem Badge */}
            <g transform="translate(2, 2)">
              {/* Outer Golden Ring */}
              <circle cx="22" cy="22" r="21" fill="url(#bl-gold-grad)" />
              <circle cx="22" cy="22" r="18.5" fill="#0F172A" stroke="#FEF08A" strokeWidth="1" />
              
              {/* Sun & Sea Wave Motif */}
              <path
                d="M10 26C14 23 18 27 22 24C26 21 30 25 34 22V32C30 34 26 31 22 33C18 35 14 32 10 34V26Z"
                fill="url(#bl-gold-grad)"
                opacity="0.85"
              />
              <path
                d="M13 28C16 26 19 29 22 27C25 25 28 28 31 26V33C28 34 25 32 22 34C19 35 16 33 13 35V28Z"
                fill="url(#bl-blue-grad)"
              />
              
              {/* Traditional Golden Drop */}
              <path
                d="M22 8C22 8 16 16 16 19.5C16 22.8 18.7 25.5 22 25.5C25.3 25.5 28 22.8 28 19.5C28 16 22 8 22 8Z"
                fill="url(#bl-gold-grad)"
                stroke="#FEF3C7"
                strokeWidth="0.75"
              />
              <circle cx="20.5" cy="18" r="1.5" fill="#FFFFFF" opacity="0.8" />

              {/* TH Monogram */}
              <text
                x="22"
                y="38.5"
                textAnchor="middle"
                fontSize="7"
                fontWeight="900"
                fill="#FEF08A"
                fontFamily="system-ui, -apple-system, sans-serif"
                letterSpacing="0.5"
              >
                TH
              </text>
            </g>

            {/* Typography "BA LÀNG TH" */}
            <text
              x="50"
              y="22"
              fill="#FFFFFF"
              fontSize="16"
              fontWeight="900"
              letterSpacing="1"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              BA LÀNG
            </text>
            <rect x="126" y="9" width="28" height="15" rx="3.5" fill="url(#bl-red-grad)" />
            <text
              x="140"
              y="20.5"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="10"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="0.5"
            >
              TH
            </text>
            
            {/* Slogan / Subtext */}
            <text
              x="50"
              y="35"
              fill="#F59E0B"
              fontSize="7"
              fontWeight="700"
              letterSpacing="0.8"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              NƯỚC MẮM TRUYỀN THỐNG
            </text>
          </svg>
        </div>
      )}
    </div>
  );
};
