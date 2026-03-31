import { useState, useEffect } from 'react';

// Tailwind standard breakpoints
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export const useDeviceType = () => {
    const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            const width = window.innerWidth;
            setWindowWidth(width);
            
            if (width < 768) {
                setDeviceType('mobile');
            } else if (width >= 768 && width < 1024) {
                setDeviceType('tablet');
            } else {
                setDeviceType('desktop');
            }
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return {
        isMobile: deviceType === 'mobile',
        isTablet: deviceType === 'tablet',
        isDesktop: deviceType === 'desktop',
        deviceType,
        windowWidth
    };
};
