
import React, { useEffect, useState } from 'react';
import { useAppContext } from '../contexts/AppContext';

const AppBackground: React.FC = () => {
    const { settings, currentBackgroundOverride } = useAppContext();
    const background = currentBackgroundOverride || settings.appBackground;
    const [activeBg, setActiveBg] = useState(1); // Manages which element (1 or 2) is currently visible

    useEffect(() => {
        const bgElement1 = document.getElementById('app-background-1');
        const bgElement2 = document.getElementById('app-background-2');

        if (!bgElement1 || !bgElement2) return;

        // Handle solid color backgrounds to prevent flickering
        if (background?.type === 'color') {
            document.body.style.backgroundImage = 'none';
            document.body.style.backgroundColor = background.value;
            // Hide the image divs
            bgElement1.classList.remove('visible');
            bgElement2.classList.remove('visible');
            return;
        }

        // Handle image backgrounds or no background
        // Restore default body styles first
        document.body.style.backgroundImage = '';
        document.body.style.backgroundColor = '';

        const currentActiveElement = activeBg === 1 ? bgElement1 : bgElement2;
        const currentInactiveElement = activeBg === 1 ? bgElement2 : bgElement1;
        
        // Determine new styles for image
        let newBgImage = 'none';
        let newFilter = 'none';

        if (background?.type === 'image' && background.value) {
            newBgImage = `url("${background.value}")`;
            newFilter = `blur(${background.style?.blur ?? 8}px) brightness(${background.style?.brightness ?? 0.6})`;
        }
        
        const isActiveAlready = 
            currentActiveElement.style.backgroundImage === newBgImage &&
            currentActiveElement.classList.contains('visible');

        if (isActiveAlready) {
            if (currentActiveElement.style.filter !== newFilter) {
                currentActiveElement.style.filter = newFilter;
            }
            return;
        }

        if (newBgImage !== 'none') {
            // A new background image is being set
            currentInactiveElement.style.backgroundImage = newBgImage;
            currentInactiveElement.style.filter = newFilter;

            currentInactiveElement.classList.add('visible');
            currentActiveElement.classList.remove('visible');

            setActiveBg(activeBg === 1 ? 2 : 1);
        } else {
            // No background is set, hide both elements
            bgElement1.classList.remove('visible');
            bgElement2.classList.remove('visible');
            
            setTimeout(() => {
                if (!currentActiveElement.classList.contains('visible') && !currentInactiveElement.classList.contains('visible')) {
                    bgElement1.style.backgroundImage = 'none';
                    bgElement2.style.backgroundImage = 'none';
                }
            }, 800);
        }

    }, [background, activeBg]);

    return null;
};

export default AppBackground;