import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface DottedSurfaceProps {
    className?: string;
    isDark?: boolean;
}

export function DottedSurface({ className = '', isDark = true }: DottedSurfaceProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const countRef = useRef(0);
    const animationIdRef = useRef<number>(0);
    const mouseRef = useRef({ x: 0, y: 0, isActive: false });

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const isMobile = window.innerWidth < 768;
        const SEPARATION = 80;
        const AMOUNTX = isMobile ? 32 : 60;
        const AMOUNTY = isMobile ? 22 : 40;

        // Scene setup
        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            1,
            10000,
        );
        camera.position.set(0, 300, 800);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: !isMobile,
        });
        renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        // Create particles
        const numParticles = AMOUNTX * AMOUNTY;
        const positions = new Float32Array(numParticles * 3);
        let i = 0;

        for (let ix = 0; ix < AMOUNTX; ix++) {
            for (let iy = 0; iy < AMOUNTY; iy++) {
                positions[i] = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
                positions[i + 1] = 0;
                positions[i + 2] = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;
                i += 3;
            }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            size: isMobile ? 3 : 4,
            color: isDark ? 0xffffff : 0x333333,
            transparent: true,
            opacity: isDark ? 0.8 : 0.6,
            sizeAttenuation: true,
        });

        const particles = new THREE.Points(geometry, material);
        scene.add(particles);

        // Mouse event handlers
        const handleMouseMove = (event: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            mouseRef.current.isActive = true;
        };

        const handleMouseLeave = () => {
            mouseRef.current.isActive = false;
        };

        if (!isMobile) {
            container.addEventListener('mousemove', handleMouseMove);
            container.addEventListener('mouseleave', handleMouseLeave);
        }

        const animate = () => {
            animationIdRef.current = requestAnimationFrame(animate);

            countRef.current += 0.03;

            const posArray = particles.geometry.attributes.position.array as Float32Array;
            let idx = 0;

            const mouseWorldX = mouseRef.current.x * (AMOUNTX * SEPARATION) / 2;
            const mouseWorldZ = -mouseRef.current.y * (AMOUNTY * SEPARATION) / 2;

            for (let ix = 0; ix < AMOUNTX; ix++) {
                for (let iy = 0; iy < AMOUNTY; iy++) {
                    // Base wave animation
                    let y = Math.sin((ix + countRef.current) * 0.3) * 40 +
                        Math.sin((iy + countRef.current) * 0.4) * 40;

                    // Mouse interaction
                    if (mouseRef.current.isActive) {
                        const particleX = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
                        const particleZ = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;

                        const dx = particleX - mouseWorldX;
                        const dz = particleZ - mouseWorldZ;
                        const distance = Math.sqrt(dx * dx + dz * dz);

                        const interactionRadius = 500;

                        if (distance < interactionRadius) {
                            const force = 1 - (distance / interactionRadius);
                            y += force * force * 120;
                        }
                    }

                    posArray[idx + 1] = y;
                    idx += 3;
                }
            }

            particles.geometry.attributes.position.needsUpdate = true;
            renderer.render(scene, camera);
        };

        animate();

        const handleResize = () => {
            if (!container) return;
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animationIdRef.current);
            renderer.dispose();
            geometry.dispose();
            material.dispose();

            if (container && renderer.domElement && container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, [isDark]);

    return (
        <div
            ref={containerRef}
            className={`absolute inset-0 z-0 overflow-hidden pointer-events-auto ${className}`}
            style={{ minHeight: '100%', minWidth: '100%' }}
        />
    );
}

export default DottedSurface;
