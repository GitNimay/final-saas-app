
import React, { useEffect, useRef } from 'react';

const PaperBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let time = 0;

    const animate = () => {
      time += 0.002; // Slower, more elegant movement
      ctx.clearRect(0, 0, width, height);

      // Solid black base
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // We use screen blending to create the "light" effect against black
      ctx.globalCompositeOperation = 'screen'; 
      
      const drawBlob = (x: number, y: number, r: number, opacity: number) => {
          ctx.beginPath();
          const g = ctx.createRadialGradient(x, y, 0, x, y, r);
          // Pure white/grey gradient for the monochrome look
          g.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
          g.addColorStop(0.5, `rgba(200, 200, 200, ${opacity * 0.5})`);
          g.addColorStop(1, 'transparent');
          ctx.fillStyle = g;
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
      };

      // Blob 1: The main "Fog" sweeping across
      const x1 = width * 0.3 + Math.sin(time) * width * 0.2;
      const y1 = height * 0.5 + Math.cos(time * 0.7) * height * 0.1;
      drawBlob(x1, y1, width * 0.7, 0.12);

      // Blob 2: Secondary light source
      const x2 = width * 0.7 + Math.cos(time * 0.5) * width * 0.2;
      const y2 = height * 0.2 + Math.sin(time * 0.6) * height * 0.15;
      drawBlob(x2, y2, width * 0.6, 0.08);

      // Blob 3: Bottom fill
      const x3 = width * 0.5 + Math.sin(time * 0.3) * width * 0.3;
      const y3 = height * 0.9 + Math.cos(time * 0.4) * height * 0.1;
      drawBlob(x3, y3, width * 0.8, 0.06);

      requestAnimationFrame(animate);
    };

    const handleResize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    };

    window.addEventListener('resize', handleResize);
    const animationId = requestAnimationFrame(animate);

    return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <>
        <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none -z-20" />
        {/* CSS Noise Overlay for texture */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-[0.08] mix-blend-overlay" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }}>
        </div>
    </>
  );
};

export default PaperBackground;
