"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Environment, Float, useTexture } from "@react-three/drei";
import { useRef, useState, useEffect, Suspense, useMemo } from "react";
import * as THREE from "three";

// Photo strip with 3 stacked images
function PhotoStrip({
  images,
  onAnimationComplete,
}: {
  images: string[];
  onAnimationComplete?: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [animationPhase, setAnimationPhase] = useState<
    "waiting" | "printing" | "dropping" | "settling" | "complete"
  >("waiting");
  const startTime = useRef<number | null>(null);
  const hasCalledComplete = useRef(false);

  // Load textures for the 3 images
  const [tex1, tex2, tex3] = useTexture(images);

  // Target aspect ratio for photos (4:3)
  const targetAspect = 4 / 3;

  // Configure textures for better quality and proper aspect ratio (cover mode)
  useMemo(() => {
    [tex1, tex2, tex3].forEach((tex) => {
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      
      // Calculate image aspect ratio
      const image = tex.image as { width: number; height: number };
      if (!image || !image.width || !image.height) return;
      const imageAspect = image.width / image.height;
      
      // Apply "cover" style - crop to fill without stretching
      if (imageAspect > targetAspect) {
        // Image is wider - crop sides
        const scale = targetAspect / imageAspect;
        tex.repeat.set(scale, 1);
        tex.offset.set((1 - scale) / 2, 0);
      } else {
        // Image is taller - crop top/bottom
        const scale = imageAspect / targetAspect;
        tex.repeat.set(1, scale);
        tex.offset.set(0, (1 - scale) / 2);
      }
    });
  }, [tex1, tex2, tex3, targetAspect]);

  useEffect(() => {
    // Start printing after a short delay
    const timer = setTimeout(() => {
      setAnimationPhase("printing");
      startTime.current = Date.now();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Animation positions
  const hiddenY = 3.5; // Starting position (just above visible area)
  const printedY = 1.5; // Halfway printed position
  const finalY = -0.1; // Final resting position in tray

  useFrame(() => {
    if (!groupRef.current || !startTime.current) return;

    const elapsed = (Date.now() - startTime.current) / 1000;

    // Phase 1: Printing - slow slide down to halfway
    if (animationPhase === "printing") {
      const printDuration = 2.0;
      const progress = Math.min(elapsed / printDuration, 1);

      // Ease out for smooth printing motion
      const easeOutQuad = (x: number): number => 1 - (1 - x) * (1 - x);
      const easedProgress = easeOutQuad(progress);

      groupRef.current.position.y = hiddenY - (hiddenY - printedY) * easedProgress;

      if (progress >= 1) {
        setAnimationPhase("dropping");
        startTime.current = Date.now();
      }
    }

    // Phase 2: Dropping - falls from halfway into tray
    if (animationPhase === "dropping") {
      const dropDuration = 0.8;
      const progress = Math.min(elapsed / dropDuration, 1);

      // Easing function for natural drop with bounce
      const easeOutBounce = (x: number): number => {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (x < 1 / d1) {
          return n1 * x * x;
        } else if (x < 2 / d1) {
          return n1 * (x -= 1.5 / d1) * x + 0.75;
        } else if (x < 2.5 / d1) {
          return n1 * (x -= 2.25 / d1) * x + 0.9375;
        } else {
          return n1 * (x -= 2.625 / d1) * x + 0.984375;
        }
      };

      const easedProgress = easeOutBounce(progress);
      groupRef.current.position.y = printedY - (printedY - finalY) * easedProgress;

      // Slight rotation during fall
      groupRef.current.rotation.z = Math.sin(elapsed * 4) * 0.03 * (1 - progress);

      if (progress >= 1) {
        setAnimationPhase("settling");
        startTime.current = Date.now();
      }
    }

    // Phase 3: Settling
    if (animationPhase === "settling") {
      const settleDuration = 0.4;
      const progress = Math.min(elapsed / settleDuration, 1);

      // Subtle settling oscillation
      groupRef.current.rotation.z = Math.sin(progress * Math.PI * 3) * 0.015 * (1 - progress);
      groupRef.current.position.y = finalY + Math.sin(progress * Math.PI * 2) * 0.01 * (1 - progress);

      if (progress >= 1) {
        setAnimationPhase("complete");
        groupRef.current.rotation.z = 0.01;
        groupRef.current.position.y = finalY;
        if (!hasCalledComplete.current) {
          hasCalledComplete.current = true;
          onAnimationComplete?.();
        }
      }
    }
  });

  // Photo strip dimensions - 4:3 aspect ratio for each photo
  const photoWidth = 1.1;
  const photoHeight = photoWidth * 0.75; // 4:3 aspect ratio
  const borderPadding = 0.12;
  const bottomPadding = 0.5; // Extra space at the bottom
  const spacing = 0.1;
  const stripWidth = photoWidth + borderPadding * 2;
  const stripHeight = (photoHeight * 3) + (spacing * 2) + borderPadding + bottomPadding;
  
  // Offset to center photos accounting for extra bottom padding
  const photosOffsetY = (bottomPadding - borderPadding) / 2;

  return (
    <group ref={groupRef} position={[0, 3.5, 0]}>
      {/* White backing/frame of photo strip */}
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[stripWidth, stripHeight, 0.025]} />
        <meshStandardMaterial
          color="#fefefe"
          roughness={0.3}
          metalness={0}
        />
      </mesh>

      {/* Photo 1 (top) */}
      <mesh position={[0, photoHeight + spacing + photosOffsetY, 0.001]}>
        <planeGeometry args={[photoWidth, photoHeight]} />
        <meshStandardMaterial map={tex1} roughness={0.08} metalness={0.1} />
      </mesh>

      {/* Photo 2 (middle) */}
      <mesh position={[0, photosOffsetY, 0.001]}>
        <planeGeometry args={[photoWidth, photoHeight]} />
        <meshStandardMaterial map={tex2} roughness={0.08} metalness={0.1} />
      </mesh>

      {/* Photo 3 (bottom) */}
      <mesh position={[0, -(photoHeight + spacing) + photosOffsetY, 0.001]}>
        <planeGeometry args={[photoWidth, photoHeight]} />
        <meshStandardMaterial map={tex3} roughness={0.08} metalness={0.1} />
      </mesh>

      {/* Glossy clear coat overlay - covers all photos */}
      <mesh position={[0, photosOffsetY, 0.003]}>
        <planeGeometry args={[photoWidth + 0.02, (photoHeight * 3) + (spacing * 2) + 0.02]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.08}
          roughness={0.02}
          metalness={0.3}
          clearcoat={1}
          clearcoatRoughness={0.05}
          reflectivity={0.9}
        />
      </mesh>

      {/* Subtle glossy highlight strip */}
      <mesh position={[-photoWidth * 0.25, photosOffsetY, 0.004]} rotation={[0, 0, 0.1]}>
        <planeGeometry args={[0.15, (photoHeight * 3) + (spacing * 2)]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.06} />
      </mesh>

      {/* Subtle drop shadow */}
      <mesh position={[0.04, -0.04, -0.03]} rotation={[0, 0, 0]}>
        <planeGeometry args={[stripWidth * 0.95, stripHeight * 0.98]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

// Photo booth catch tray - sleek modern design
function PhotoboothTray() {
  const trayRef = useRef<THREE.Group>(null);

  // Brushed stainless steel material
  const steelMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#e8e8e8",
        metalness: 0.92,
        roughness: 0.18,
      }),
    []
  );

  // Dark inner material
  const velvetMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#1a1a1a",
        metalness: 0.0,
        roughness: 0.95,
      }),
    []
  );

  // Gold accent material
  const goldMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#c9a66b",
        metalness: 0.85,
        roughness: 0.2,
      }),
    []
  );

  const slotDepth = 0.45;
  const slotWidth = 1.8;
  const slotHeight = 3.8;
  const wallThickness = 0.08;

  return (
    <group ref={trayRef} position={[0, -1.85, 0]}>
      {/* Back panel - main structure */}
      <mesh position={[0, slotHeight / 2, -slotDepth / 2 - wallThickness / 2]}>
        <boxGeometry args={[slotWidth + wallThickness * 2.5, slotHeight + 0.1, wallThickness]} />
        <primitive object={steelMaterial} attach="material" />
      </mesh>

      {/* Left wall */}
      <mesh position={[-slotWidth / 2 - wallThickness / 2, slotHeight / 2, 0]}>
        <boxGeometry args={[wallThickness, slotHeight, slotDepth + wallThickness * 0.5]} />
        <primitive object={steelMaterial} attach="material" />
      </mesh>

      {/* Right wall */}
      <mesh position={[slotWidth / 2 + wallThickness / 2, slotHeight / 2, 0]}>
        <boxGeometry args={[wallThickness, slotHeight, slotDepth + wallThickness * 0.5]} />
        <primitive object={steelMaterial} attach="material" />
      </mesh>

      {/* Bottom tray */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[slotWidth + wallThickness * 2.5, wallThickness * 1.5, slotDepth + wallThickness]} />
        <primitive object={steelMaterial} attach="material" />
      </mesh>

      {/* Front catch lip - curved appearance */}
      <mesh position={[0, wallThickness * 2, slotDepth / 2 + wallThickness * 0.25]}>
        <boxGeometry args={[slotWidth + wallThickness * 2.5, wallThickness * 4, wallThickness * 0.6]} />
        <primitive object={steelMaterial} attach="material" />
      </mesh>

      {/* Inner velvet lining - bottom */}
      <mesh position={[0, wallThickness * 0.8, 0]}>
        <boxGeometry args={[slotWidth - 0.02, 0.01, slotDepth - 0.02]} />
        <primitive object={velvetMaterial} attach="material" />
      </mesh>

      {/* Inner velvet lining - back */}
      <mesh position={[0, slotHeight / 2, -slotDepth / 2 + 0.01]}>
        <boxGeometry args={[slotWidth - 0.02, slotHeight - 0.1, 0.01]} />
        <primitive object={velvetMaterial} attach="material" />
      </mesh>

      {/* Gold accent strip - top */}
      <mesh position={[0, slotHeight + 0.02, -slotDepth / 2 - wallThickness / 2]}>
        <boxGeometry args={[slotWidth + wallThickness * 2, 0.04, wallThickness + 0.02]} />
        <primitive object={goldMaterial} attach="material" />
      </mesh>

      {/* Gold accent strip - bottom front */}
      <mesh position={[0, wallThickness * 4.2, slotDepth / 2 + wallThickness * 0.25]}>
        <boxGeometry args={[slotWidth + wallThickness * 2, 0.025, wallThickness * 0.7]} />
        <primitive object={goldMaterial} attach="material" />
      </mesh>

      {/* Subtle ambient glow at slot opening */}
      <pointLight
        position={[0, slotHeight + 0.3, 0]}
        color="#fff8f0"
        intensity={0.15}
        distance={1.5}
      />
    </group>
  );
}

// Ambient particles for atmosphere
function Particles() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 50;

  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = Math.random() * 6 - 1;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!particlesRef.current) return;
    particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;

    const positionAttr = particlesRef.current.geometry.attributes.position;
    for (let i = 0; i < particleCount; i++) {
      const y = positionAttr.getY(i);
      positionAttr.setY(i, y + Math.sin(state.clock.elapsedTime + i) * 0.001);
    }
    positionAttr.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#c9a66b"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

// Main scene component
function Scene({
  images,
  onAnimationComplete,
}: {
  images: string[];
  onAnimationComplete?: () => void;
}) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-3, 4, -2]} intensity={0.4} color="#ffeedd" />
      <pointLight position={[0, 3, 2]} intensity={0.5} color="#fff8f0" />

      {/* Photobooth elements */}
      <Suspense fallback={null}>
        <PhotoboothTray />
        <PhotoStrip images={images} onAnimationComplete={onAnimationComplete} />
      </Suspense>

      {/* Atmospheric particles */}
      <Particles />

      {/* Environment for reflections */}
      <Environment preset="studio" />
    </>
  );
}

// Loading placeholder
function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[#c9a66b] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#c9a66b] text-sm tracking-widest uppercase">
          Loading photobooth...
        </p>
      </div>
    </div>
  );
}

export interface PhotoboothSceneWithTrayProps {
  images?: string[];
  className?: string;
  onAnimationComplete?: () => void;
}

export function PhotoboothSceneWithTray({
  images = [
    "/booth/booth-1.png",
    "/booth/booth-2.png",
    "/booth/booth-3.png",
  ],
  className = "",
  onAnimationComplete,
}: PhotoboothSceneWithTrayProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative w-full h-full ${className}`} style={{ backgroundColor: '#0a0a0a' }}>
      {!isLoaded && <LoadingFallback />}
      <Canvas
        camera={{ position: [0, 0.5, 6.5], fov: 50 }}
        onCreated={() => setIsLoaded(true)}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
      >
        <color attach="background" args={["#0a0a0a"]} />
        <fog attach="fog" args={["#0a0a0a", 8, 20]} />
        <Scene images={images} onAnimationComplete={onAnimationComplete} />
      </Canvas>
    </div>
  );
}
