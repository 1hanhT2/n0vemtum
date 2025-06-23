import { useEffect, useState } from 'react';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const updateLayout = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
      setIsSmallScreen(window.innerWidth < 640);
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    window.addEventListener('orientationchange', () => {
      // Delay to allow browser to update dimensions
      setTimeout(updateLayout, 100);
    });

    return () => {
      window.removeEventListener('resize', updateLayout);
      window.removeEventListener('orientationchange', updateLayout);
    };
  }, []);

  return (
    <div 
      className={`
        ${orientation === 'landscape' ? 'landscape-optimize' : 'portrait-stack'}
        ${isSmallScreen ? 'mobile-optimized' : ''}
      `}
      data-orientation={orientation}
    >
      {children}
    </div>
  );
}