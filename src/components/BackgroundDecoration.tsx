import type { CSSProperties } from 'react';

const GamepadIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M18 22h28a12 12 0 0 1 12 12v6a8 8 0 0 1-14.5 4.6L40 40H24l-3.5 4.6A8 8 0 0 1 6 40v-6a12 12 0 0 1 12-12Z"
      fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"
    />
    <path d="M16 28v8M12 32h8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <circle cx="44" cy="27" r="2.8" fill="currentColor" />
    <circle cx="50" cy="33" r="2.8" fill="currentColor" />
  </svg>
);

const KeyboardIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="18" width="52" height="30" rx="5" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="3" />
    {[13, 22, 31, 40, 49].map((x) => (
      <rect key={`r1-${x}`} x={x} y="24" width="5" height="5" rx="1.2" fill="currentColor" />
    ))}
    {[13, 22, 31, 40, 49].map((x) => (
      <rect key={`r2-${x}`} x={x} y="33" width="5" height="5" rx="1.2" fill="currentColor" opacity="0.7" />
    ))}
    <rect x="18" y="42" width="28" height="4.5" rx="2" fill="currentColor" opacity="0.8" />
  </svg>
);

const JoystickIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="46" width="44" height="10" rx="4" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="3" />
    <path d="M32 46V24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <circle cx="32" cy="16" r="9" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="3" />
  </svg>
);

const TrophyIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 10h20v14a10 10 0 0 1-20 0V10Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
    <path d="M22 14h-6a6 6 0 0 0 6 10M42 14h6a6 6 0 0 1-6 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M32 34v8M24 50h16M26 42h12l2 8H24l2-8Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
  </svg>
);

const HeadsetIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 34v-2a20 20 0 0 1 40 0v2" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <rect x="8" y="32" width="10" height="16" rx="4" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="3" />
    <rect x="46" y="32" width="10" height="16" rx="4" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="3" />
    <path d="M46 46c0 6-5 8-10 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const CrosshairIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="18" stroke="currentColor" strokeWidth="3" />
    <circle cx="32" cy="32" r="4" fill="currentColor" />
    <path d="M32 4v10M32 50v10M4 32h10M50 32h10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const DiceIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="10" width="44" height="44" rx="10" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="3" />
    <circle cx="22" cy="22" r="3.2" fill="currentColor" />
    <circle cx="42" cy="22" r="3.2" fill="currentColor" />
    <circle cx="32" cy="32" r="3.2" fill="currentColor" />
    <circle cx="22" cy="42" r="3.2" fill="currentColor" />
    <circle cx="42" cy="42" r="3.2" fill="currentColor" />
  </svg>
);

const ICONS = [
  { Icon: GamepadIcon, className: 'bg-deco-1', color: '#22D3EE', size: 110, rotate: -10, duration: 8, delay: 0 },
  { Icon: KeyboardIcon, className: 'bg-deco-2', color: '#F472B6', size: 130, rotate: 6, duration: 9.5, delay: 0.6 },
  { Icon: TrophyIcon, className: 'bg-deco-3', color: '#FACC15', size: 100, rotate: 12, duration: 7.5, delay: 1.2 },
  { Icon: JoystickIcon, className: 'bg-deco-4', color: '#38BDF8', size: 90, rotate: -8, duration: 8.5, delay: 0.3 },
  { Icon: HeadsetIcon, className: 'bg-deco-5', color: '#A78BFA', size: 110, rotate: 14, duration: 10, delay: 1.6 },
  { Icon: DiceIcon, className: 'bg-deco-6', color: '#4ADE80', size: 84, rotate: -16, duration: 7, delay: 0.9 },
  { Icon: CrosshairIcon, className: 'bg-deco-7', color: '#FB7185', size: 90, rotate: 4, duration: 9, delay: 1.9 },
  { Icon: GamepadIcon, className: 'bg-deco-8', color: '#FB923C', size: 96, rotate: 18, duration: 8.2, delay: 2.3 },
];

const SHAPES = [
  { type: 'circle', className: 'bg-shape-1', color: '#22D3EE', size: 26, duration: 3.2, delay: 0 },
  { type: 'square', className: 'bg-shape-2', color: '#F472B6', size: 22, duration: 2.6, delay: 0.5 },
  { type: 'circle', className: 'bg-shape-3', color: '#FACC15', size: 18, duration: 3.8, delay: 1 },
  { type: 'square', className: 'bg-shape-4', color: '#4ADE80', size: 24, duration: 2.9, delay: 1.4 },
  { type: 'circle', className: 'bg-shape-5', color: '#A78BFA', size: 20, duration: 3.4, delay: 0.8 },
  { type: 'square', className: 'bg-shape-6', color: '#FB7185', size: 16, duration: 2.4, delay: 1.8 },
  { type: 'circle', className: 'bg-shape-7', color: '#38BDF8', size: 22, duration: 3.6, delay: 0.3 },
] as const;

function BackgroundDecoration() {
  return (
    <div className="bg-decoration" aria-hidden="true">
      {ICONS.map(({ Icon, className, color, size, rotate, duration, delay }) => (
        <div
          key={className}
          className={`bg-deco ${className}`}
          style={{
            width: size,
            height: size,
            color,
            '--rot': `${rotate}deg`,
            '--float-duration': `${duration}s`,
            '--float-delay': `${delay}s`,
          } as CSSProperties}
        >
          <Icon />
        </div>
      ))}
      {SHAPES.map(({ type, className, color, size, duration, delay }) => (
        <div
          key={className}
          className={`bg-shape bg-shape-${type} ${className}`}
          style={{
            width: size,
            height: size,
            background: color,
            boxShadow: `0 0 ${size}px ${color}`,
            '--blink-duration': `${duration}s`,
            '--blink-delay': `${delay}s`,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}

export default BackgroundDecoration;
