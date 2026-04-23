import React, { useEffect, useRef } from 'react';

declare global {
    interface Window {
        UnicornStudio?: {
            isInitialized: boolean;
            init: () => void;
            destroy: () => void;
        };
    }
}

interface UnicornBackgroundProps {
    projectId?: string;
}

const UnicornBackground: React.FC<UnicornBackgroundProps> = ({
    projectId = "AABPvxuO4k4SJAa7U1tI"
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Load the Unicorn Studio script
        const loadUnicornStudio = () => {
            if (!window.UnicornStudio) {
                window.UnicornStudio = { isInitialized: false, init: () => { }, destroy: () => { } };

                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.5.3/dist/unicornStudio.umd.js';
                script.onload = () => {
                    if (window.UnicornStudio && !window.UnicornStudio.isInitialized) {
                        window.UnicornStudio.init();
                        window.UnicornStudio.isInitialized = true;
                    }
                };
                (document.head || document.body).appendChild(script);
            } else if (!window.UnicornStudio.isInitialized) {
                window.UnicornStudio.init();
                window.UnicornStudio.isInitialized = true;
            } else {
                // Re-initialize if already loaded but component remounted
                window.UnicornStudio.init();
            }
        };

        loadUnicornStudio();

        return () => {
            // Cleanup on unmount if needed
            if (window.UnicornStudio?.destroy) {
                try {
                    window.UnicornStudio.destroy();
                } catch (e) {
                    // Ignore errors during cleanup
                }
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="auth-unicorn fixed inset-0 w-full h-full z-0"
            style={{
                background: 'var(--background)'
            }}
        >
            {/* Unicorn Studio Container - this div will be picked up by the Unicorn Studio script */}
            <div
                data-us-project={projectId}
                style={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0
                }}
            />

            {/* Overlay gradient for better text readability */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at center, transparent 0%, color-mix(in srgb, var(--background) 40%, transparent) 100%)'
                }}
            />
        </div>
    );
};

export default UnicornBackground;
