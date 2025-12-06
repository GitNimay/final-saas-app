import React, { useEffect, useRef } from 'react';

const StarBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;

        const setSize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };
        setSize();
        window.addEventListener('resize', setSize);

        const stars: { x: number; y: number; size: number; alpha: number; speed: number }[] = [];
        const starCount = 150; // Enough to look like a field, but not crowded

        for (let i = 0; i < starCount; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 1.5,
                alpha: Math.random(),
                speed: Math.random() * 0.05 + 0.01
            });
        }

        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);

            stars.forEach(star => {
                star.y -= star.speed; // Move up slowly
                if (star.y < 0) {
                    star.y = height;
                    star.x = Math.random() * width;
                }

                // Twinkle effect
                star.alpha += (Math.random() - 0.5) * 0.02;
                if (star.alpha < 0.1) star.alpha = 0.1;
                if (star.alpha > 0.8) star.alpha = 0.8;

                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
                ctx.fill();
            });

            requestAnimationFrame(animate);
        };

        const animationId = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', setSize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full pointer-events-none z-0 bg-black"
            style={{ background: 'radial-gradient(circle at center, #18181b 0%, #000000 100%)' }}
        />
    );
};

export default StarBackground;
