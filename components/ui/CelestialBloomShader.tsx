import React, { useEffect, useRef } from "react"
import * as THREE from "three"

interface CelestialBloomShaderProps {
    className?: string;
}

export function CelestialBloomShader({ className }: CelestialBloomShaderProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const sceneRef = useRef<{
        scene: THREE.Scene | null
        camera: THREE.OrthographicCamera | null
        renderer: THREE.WebGLRenderer | null
        mesh: THREE.Mesh | null
        uniforms: any
        animationId: number | null
        mouse: { x: number; y: number; targetX: number; targetY: number }
    }>({
        scene: null,
        camera: null,
        renderer: null,
        mesh: null,
        uniforms: null,
        animationId: null,
        mouse: { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 }
    })

    useEffect(() => {
        if (!canvasRef.current) return

        const canvas = canvasRef.current
        const { current: refs } = sceneRef

        // Celestial Bloom vertex shader
        const vertexShader = `
      attribute vec3 position;
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `

        // Celestial Bloom fragment shader - creates a turbulent, glowing surface effect
        const fragmentShader = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      uniform vec2 mouse;

      #define PI 3.14159265359

      // Simplex noise functions
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

      float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        
        vec3 i = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        
        i = mod289(i);
        vec4 p = permute(permute(permute(
          i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        
        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        
        vec4 x = x_ * ns.x + ns.yyyy;
        vec4 y = y_ * ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        
        vec4 s0 = floor(b0) * 2.0 + 1.0;
        vec4 s1 = floor(b1) * 2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        
        vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
        
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        
        vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        
        vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
      }

      // Fractal Brownian Motion
      float fbm(vec3 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        for (int i = 0; i < 6; i++) {
          value += amplitude * snoise(p * frequency);
          amplitude *= 0.5;
          frequency *= 2.0;
        }
        return value;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution;
        vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
        
        // Mouse influence
        vec2 mouseInfluence = (mouse - 0.5) * 0.3;
        
        // Time variables for animation
        float t = time * 0.15;
        
        // Create turbulent noise layers
        float noise1 = fbm(vec3(p * 1.5 + mouseInfluence, t));
        float noise2 = fbm(vec3(p * 2.5 - mouseInfluence * 0.5, t * 1.3 + 100.0));
        float noise3 = fbm(vec3(p * 0.8, t * 0.7 + 200.0));
        
        // Combine noise layers for turbulent effect
        float combinedNoise = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
        
        // Create bloom/glow effect
        float bloom = smoothstep(-0.2, 0.8, combinedNoise);
        
        // Color palette - cosmic purple/blue/pink
        vec3 color1 = vec3(0.1, 0.0, 0.2);      // Deep purple
        vec3 color2 = vec3(0.4, 0.1, 0.6);      // Purple
        vec3 color3 = vec3(0.2, 0.3, 0.8);      // Blue
        vec3 color4 = vec3(0.8, 0.2, 0.5);      // Pink
        vec3 color5 = vec3(1.0, 0.8, 0.9);      // Bright pink/white
        
        // Mix colors based on noise and position
        vec3 baseColor = mix(color1, color2, bloom);
        baseColor = mix(baseColor, color3, smoothstep(0.3, 0.7, noise2 + 0.5));
        baseColor = mix(baseColor, color4, smoothstep(0.5, 0.9, noise1 + 0.3));
        
        // Add glow/bloom highlights
        float glowIntensity = pow(bloom, 2.0) * 0.8;
        baseColor = mix(baseColor, color5, glowIntensity * smoothstep(0.4, 1.0, combinedNoise + 0.2));
        
        // Add vignette effect
        float vignette = 1.0 - length(p) * 0.4;
        vignette = smoothstep(0.0, 1.0, vignette);
        
        // Add subtle pulsing
        float pulse = sin(time * 0.5) * 0.05 + 0.95;
        
        // Final color with vignette and pulse
        vec3 finalColor = baseColor * vignette * pulse;
        
        // Add subtle grain for texture
        float grain = (fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.03;
        finalColor += grain;
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `

        const initScene = () => {
            refs.scene = new THREE.Scene()
            refs.renderer = new THREE.WebGLRenderer({ canvas, alpha: true })
            refs.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

            refs.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, -1)

            refs.uniforms = {
                resolution: { value: [canvas.clientWidth, canvas.clientHeight] },
                time: { value: 0.0 },
                mouse: { value: [0.5, 0.5] }
            }

            const position = [
                -1.0, -1.0, 0.0,
                1.0, -1.0, 0.0,
                -1.0, 1.0, 0.0,
                1.0, -1.0, 0.0,
                -1.0, 1.0, 0.0,
                1.0, 1.0, 0.0,
            ]

            const positions = new THREE.BufferAttribute(new Float32Array(position), 3)
            const geometry = new THREE.BufferGeometry()
            geometry.setAttribute("position", positions)

            const material = new THREE.RawShaderMaterial({
                vertexShader,
                fragmentShader,
                uniforms: refs.uniforms,
                side: THREE.DoubleSide,
            })

            refs.mesh = new THREE.Mesh(geometry, material)
            refs.scene.add(refs.mesh)

            handleResize()
        }

        const animate = () => {
            if (refs.uniforms) {
                refs.uniforms.time.value += 0.016 // ~60fps timing

                // Smooth mouse interpolation
                refs.mouse.x += (refs.mouse.targetX - refs.mouse.x) * 0.05
                refs.mouse.y += (refs.mouse.targetY - refs.mouse.y) * 0.05
                refs.uniforms.mouse.value = [refs.mouse.x, refs.mouse.y]
            }
            if (refs.renderer && refs.scene && refs.camera) {
                refs.renderer.render(refs.scene, refs.camera)
            }
            refs.animationId = requestAnimationFrame(animate)
        }

        const handleResize = () => {
            if (!canvas || !refs.renderer || !refs.uniforms) return
            const width = canvas.clientWidth
            const height = canvas.clientHeight
            refs.renderer.setSize(width, height, false)
            refs.uniforms.resolution.value = [width, height]
        }

        const handleMouseMove = (e: MouseEvent) => {
            if (!canvas) return
            const rect = canvas.getBoundingClientRect()
            refs.mouse.targetX = (e.clientX - rect.left) / rect.width
            refs.mouse.targetY = 1.0 - (e.clientY - rect.top) / rect.height
        }

        initScene()
        animate()

        const resizeObserver = new ResizeObserver(() => handleResize())
        resizeObserver.observe(canvas)

        window.addEventListener('mousemove', handleMouseMove)

        return () => {
            if (refs.animationId) cancelAnimationFrame(refs.animationId)
            resizeObserver.disconnect()
            window.removeEventListener('mousemove', handleMouseMove)
            if (refs.mesh) {
                refs.scene?.remove(refs.mesh)
                refs.mesh.geometry.dispose()
                if (refs.mesh.material instanceof THREE.Material) {
                    refs.mesh.material.dispose()
                }
            }
            refs.renderer?.dispose()
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className={className || "absolute inset-0 w-full h-full block -z-10"}
        />
    )
}

export default CelestialBloomShader
