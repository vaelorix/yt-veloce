import React from 'react';

interface VeloceLogoProps {
  size?: number;
  glow?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const VeloceLogo: React.FC<VeloceLogoProps> = ({
  size = 28,
  glow = false,
  className = '',
  style = {}
}) => {
  const filterId = `veloce-glow-${Math.round(size)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        filter: glow ? `drop-shadow(0 0 10px rgba(46, 160, 67, 0.65))` : undefined,
        ...style
      }}
    >
      <defs>
        {/* Main Emerald-to-Neon Gradient */}
        <linearGradient id="veloceGradMain" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#56d364" />
          <stop offset="45%" stopColor="#2ea043" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>

        {/* Speed Stream Highlight Gradient */}
        <linearGradient id="veloceGradStream" x1="2" y1="12" x2="30" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7ee787" />
          <stop offset="100%" stopColor="#238636" />
        </linearGradient>

        {/* Dynamic Glow Filter */}
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Background Outer Shield / Hexagonal Jet Shape */}
      <path
        d="M24 3L41 12.8V35.2L24 45L7 35.2V12.8L24 3Z"
        fill="#0d1117"
        stroke="url(#veloceGradMain)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {/* Aerodynamic Velocity Chevron - Stream 1 (Trailing top speed stripe) */}
      <path
        d="M13 16.5L21 21.5L16 24.5L10 20.5L13 16.5Z"
        fill="url(#veloceGradStream)"
        opacity="0.85"
      />

      {/* Velocity Chevron - Stream 2 (Trailing bottom speed stripe) */}
      <path
        d="M10 27.5L16 23.5L21 26.5L13 31.5L10 27.5Z"
        fill="url(#veloceGradStream)"
        opacity="0.85"
      />

      {/* Supersonic Forward Media Play Delta Arrow */}
      <path
        d="M20 14L37 24L20 34V28L29 24L20 20V14Z"
        fill="url(#veloceGradMain)"
      />

      {/* Inner Core Speed Sparkle */}
      <path
        d="M22 20.5L30 24L22 27.5V20.5Z"
        fill="#ffffff"
        opacity="0.95"
      />

      {/* Subtle Bottom Accent Glow */}
      <circle cx="24" cy="41" r="1.5" fill="#56d364" opacity="0.85" />
    </svg>
  );
};
