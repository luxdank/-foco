import { useState } from 'react';
import { APP_IMAGES } from '../data/mockData';

type LogoVariant = 'color' | 'dark' | 'light';

const LOGO_CANDIDATES: Record<LogoVariant, string[]> = {
  color: ['/logos/logo-color.png', APP_IMAGES.logo],
  dark: ['/logos/logo-black.png', '/logos/logo-color.png', APP_IMAGES.logo],
  light: ['/logos/logo-light.png', '/logos/logo-color.png', APP_IMAGES.logo],
};

interface LogoImageProps {
  variant?: LogoVariant;
  className?: string;
  alt?: string;
  onClick?: () => void;
  referrerPolicy?: 'no-referrer';
}

export default function LogoImage({
  variant = 'color',
  className,
  alt = '+Foco Logo',
  onClick,
  ...rest
}: LogoImageProps) {
  const candidates = LOGO_CANDIDATES[variant];
  const [index, setIndex] = useState(0);
  const src = candidates[Math.min(index, candidates.length - 1)];

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onClick={onClick}
      onError={() => {
        if (index < candidates.length - 1) setIndex((i) => i + 1);
      }}
      {...rest}
    />
  );
}