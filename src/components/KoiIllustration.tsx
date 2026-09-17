import React from 'react';

interface KoiProps {
  className?: string;
  color?: string;
  secondaryColor?: string;
}

export const KoiIllustration: React.FC<KoiProps> = ({
  className = 'w-16 h-16',
  color = '#DC5D5D',
  secondaryColor = '#943535',
}) => {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Decorative wave background lines */}
      <path
        d="M20 100 C 60 70, 80 130, 120 100 S 160 70, 190 100"
        stroke="#B0AF9F"
        strokeWidth="1.5"
        strokeDasharray="4 4"
        strokeOpacity="0.4"
      />
      <path
        d="M10 130 C 50 100, 90 150, 130 120 S 170 90, 195 125"
        stroke="#B0AF9F"
        strokeWidth="1.5"
        strokeDasharray="4 4"
        strokeOpacity="0.3"
      />

      {/* Koi Fish Flowing Body */}
      <g transform="translate(10, 5) scale(0.9)">
        {/* Dorsal flowing fin */}
        <path
          d="M85 75 Q 115 45 135 60 Q 110 70 95 82 Z"
          fill={secondaryColor}
          fillOpacity="0.8"
        />
        
        {/* Pectoral left fin */}
        <path
          d="M70 100 Q 40 120 45 140 Q 60 125 72 108 Z"
          fill={color}
          fillOpacity="0.75"
          stroke={secondaryColor}
          strokeWidth="1.5"
        />
        <path
          d="M50 126 Q 60 118 68 108"
          stroke={secondaryColor}
          strokeWidth="1"
        />

        {/* Pectoral right fin */}
        <path
          d="M110 88 Q 135 70 148 85 Q 130 92 112 94 Z"
          fill={color}
          fillOpacity="0.75"
          stroke={secondaryColor}
          strokeWidth="1.5"
        />

        {/* Koi Main Torso */}
        <path
          d="M60 120 C 45 95 55 60 90 60 C 130 60 140 105 130 135 C 122 155 105 168 95 180 C 90 165 95 145 90 135 C 80 125 70 125 60 120 Z"
          fill="#FFF9F5"
          stroke={secondaryColor}
          strokeWidth="2.5"
        />

        {/* Red Japanese Kohaku markings on body */}
        <path
          d="M75 75 C 85 62 105 65 110 78 C 115 90 105 105 92 108 C 80 110 70 90 75 75 Z"
          fill={color}
        />
        <path
          d="M100 115 C 115 118 124 130 120 142 C 116 152 105 152 98 145 C 96 135 95 125 100 115 Z"
          fill={secondaryColor}
        />

        {/* Flowing Calico Tail Fin */}
        <path
          d="M95 180 C 110 198 135 200 155 188 C 135 180 125 170 105 175 Z"
          fill={color}
          fillOpacity="0.8"
          stroke={secondaryColor}
          strokeWidth="1.5"
        />
        <path
          d="M93 180 C 85 198 65 205 45 195 C 65 185 80 176 95 178 Z"
          fill={secondaryColor}
          fillOpacity="0.7"
          stroke={secondaryColor}
          strokeWidth="1.5"
        />

        {/* Eye */}
        <circle cx="68" cy="74" r="3.5" fill="#3C3C3B" />
        <circle cx="67" cy="73" r="1.2" fill="#FFFFFF" />

        {/* Whisker barbels */}
        <path
          d="M58 64 Q 48 58 45 52"
          stroke={secondaryColor}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M62 60 Q 58 50 62 42"
          stroke={secondaryColor}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};
