import React, { useEffect, useRef } from 'react';

const DotMapBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -1000, y: -1000 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        interface Dot {
            x: number;
            y: number;
            originX: number;
            originY: number;
            alpha: number;
            targetAlpha: number;
            baseAlpha: number;
        }

        const dots: Dot[] = [];
        const gap = 20; // Slightly larger gap for cleaner look
        const rows = Math.ceil(height / gap);
        const cols = Math.ceil(width / gap);

        // Grid generation with noise
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const x = c * gap;
                const y = r * gap;

                // Simple Perlin-ish noise approximation to create "islands"
                const n = Math.sin(c * 0.05) + Math.sin(r * 0.05) + Math.random() * 0.5;
                if (n > 0.5) {
                    const baseAlpha = Math.random() * 0.3 + 0.1;
                    dots.push({
                        x,
                        y,
                        originX: x,
                        originY: y,
                        alpha: baseAlpha,
                        targetAlpha: baseAlpha,
                        baseAlpha: baseAlpha
                    });
                }
            }
        }

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };

        const handleMouseLeave = () => {
            mouseRef.current = { x: -1000, y: -1000 };
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            // Background is transparent so it layers over black parent
            // But we can clear strictly just in case

            dots.forEach(dot => {
                // 1. Mouse Interaction
                const dx = mouseRef.current.x - dot.originX;
                const dy = mouseRef.current.y - dot.originY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                const interactionRadius = 200;
                let activeDist = 0;

                // React to mouse
                if (dist < interactionRadius) {
                    const force = (interactionRadius - dist) / interactionRadius;

                    // Repel slightly
                    const angle = Math.atan2(dy, dx);
                    const moveDist = force * 20; // Max pixels to move

                    const targetX = dot.originX - Math.cos(angle) * moveDist;
                    const targetY = dot.originY - Math.sin(angle) * moveDist;

                    dot.x += (targetX - dot.x) * 0.1; // Smooth lerp
                    dot.y += (targetY - dot.y) * 0.1;

                    // Brighten significantly near mouse
                    dot.targetAlpha = dot.baseAlpha + force * 0.6;
                } else {
                    // Return to origin
                    dot.x += (dot.originX - dot.x) * 0.1;
                    dot.y += (dot.originY - dot.y) * 0.1;

                    // Twinkle naturally if not near mouse
                    if (Math.abs(dot.alpha - dot.targetAlpha) < 0.01) {
                        dot.targetAlpha = Math.random() < 0.05
                            ? Math.random() * 0.4 + 0.1 // Random new target
                            : dot.baseAlpha; // Or return to base
                    }
                }

                const alphaDiff = dot.targetAlpha - dot.alpha;
                dot.alpha += alphaDiff * 0.05;

                // Draw
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, Math.min(1, dot.alpha))})`;
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, 1.5, 0, Math.PI * 2);
                ctx.fill();
            });

            requestAnimationFrame(animate);
        };

        const animationId = requestAnimationFrame(animate);

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            // Ideally we'd regenerate dots here but for now just resizing canvas is safe enough 
            // though dots might look stretched or clipped. 
            // For a perfect implementation we should debounce re-init.
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
        };

    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-60 mix-blend-screen pointer-events-none" />;
};

export default DotMapBackground;
