"use client";

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';

interface LogoItem {
  src?: string;
  alt?: string;
  name?: string;
  node?: React.ReactNode;
  href?: string;
}

interface LogoLoopProps {
  logos: LogoItem[];
  speed?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  logoHeight?: number;
  gap?: number;
  mobileGap?: number;
  mobileSpeed?: number;
  hoverSpeed?: number;
  scaleOnHover?: boolean;
  fadeOut?: boolean;
  fadeOutColor?: string;
  ariaLabel?: string;
  className?: string;
}

const LogoLoop: React.FC<LogoLoopProps> = ({
  logos,
  speed = 100,
  direction = 'left',
  logoHeight = 48,
  gap = 40,
  mobileGap,
  mobileSpeed,
  hoverSpeed = 0,
  scaleOnHover = false,
  fadeOut = false,
  fadeOutColor = '#000000',
  ariaLabel,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentGap, setCurrentGap] = useState(gap);
  
  // Calculate current speed based on mobile, hover, and base speed
  const getCurrentSpeed = () => {
    if (isHovered && hoverSpeed !== undefined && hoverSpeed > 0) {
      return hoverSpeed;
    }
    if (isMobile && mobileSpeed !== undefined) {
      return mobileSpeed;
    }
    return speed;
  };
  
  const animationSpeed = getCurrentSpeed();

  useEffect(() => {
    const updateLayout = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      
      if (mobileGap !== undefined && isMobileView) {
        setCurrentGap(mobileGap);
      } else {
        setCurrentGap(gap);
      }
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, [gap, mobileGap]);

  // Duplicate logos for seamless loop
  const duplicatedLogos = [...logos, ...logos];

  const getAnimationClass = () => {
    switch (direction) {
      case 'left':
        return 'animate-scroll-left';
      case 'right':
        return 'animate-scroll-right';
      case 'up':
        return 'animate-scroll-up';
      case 'down':
        return 'animate-scroll-down';
      default:
        return 'animate-scroll-left';
    }
  };

  const getContainerClass = () => {
    const baseClass = 'flex items-center justify-center';
    const directionClass = direction === 'left' || direction === 'right' 
      ? 'flex-row' 
      : 'flex-col';
    return `${baseClass} ${directionClass}`;
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-transparent ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={ariaLabel}
    >
      {fadeOut && (
        <>
          <div
            className="absolute top-0 left-0 right-0 h-24 z-10 pointer-events-none opacity-80"
            style={{
              background: direction === 'left' || direction === 'right'
                ? `linear-gradient(to right, ${fadeOutColor} 0%, transparent 100%)`
                : `linear-gradient(to bottom, ${fadeOutColor} 0%, transparent 100%)`,
            }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-24 z-10 pointer-events-none opacity-80"
            style={{
              background: direction === 'left' || direction === 'right'
                ? `linear-gradient(to left, ${fadeOutColor} 0%, transparent 100%)`
                : `linear-gradient(to top, ${fadeOutColor} 0%, transparent 100%)`,
            }}
          />
        </>
      )}
      <div
        className={`${getContainerClass()} ${getAnimationClass()} w-max`}
        style={{
          '--duration': `${animationSpeed}s`,
          gap: `${currentGap}px`,
        } as React.CSSProperties}
      >
        {duplicatedLogos.map((logo, index) => (
          <div
            key={index}
            className={`flex items-center justify-center opacity-60 hover:opacity-100 transition-all duration-500 ease-out ${
              scaleOnHover ? 'hover:scale-[1.3] hover:brightness-110' : ''
            }`}
            style={{
              height: `${logoHeight}px`,
              minWidth: `${logoHeight * 2}px`,
            }}
          >
            {logo.href ? (
              <a
                href={logo.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center"
              >
                {logo.src ? (
                  <Image
                    src={logo.src}
                    alt={logo.alt || logo.name || `Logo ${index}`}
                    width={logoHeight * 2}
                    height={logoHeight}
                    className="h-full w-auto object-contain"
                    unoptimized
                  />
                ) : (
                  logo.node
                )}
              </a>
            ) : (
              <>
                {logo.src ? (
                  <Image
                    src={logo.src}
                    alt={logo.alt || logo.name || `Logo ${index}`}
                    width={logoHeight * 2}
                    height={logoHeight}
                    className="h-full w-auto object-contain"
                    unoptimized
                  />
                ) : (
                  logo.node
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogoLoop;

