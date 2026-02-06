"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, useTexture, RoundedBox, Text } from "@react-three/drei";
import { useRef, useState, useEffect, Suspense, useMemo } from "react";
import * as THREE from "three";

// Photo strip with 3 stacked images - prints and drops into view
function PhotoStrip({
  images,
  onAnimationComplete,
  startDelay = 500,
}: {
  images: string[];
  onAnimationComplete?: () => void;
  startDelay?: number;
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
    // Start printing after the specified delay
    const timer = setTimeout(() => {
      setAnimationPhase("printing");
      startTime.current = Date.now();
    }, startDelay);
    return () => clearTimeout(timer);
  }, [startDelay]);

  // Animation positions - strip prints from top and drops to center
  const hiddenY = 5.5;
  const printedY = 2.0;
  const finalY = 0;

  useFrame((state) => {
    if (!groupRef.current) return;

    if (!startTime.current) return;
    const elapsed = (Date.now() - startTime.current) / 1000;

    // Phase 1: Printing - slow slide down
    if (animationPhase === "printing") {
      const printDuration = 2.0;
      const progress = Math.min(elapsed / printDuration, 1);
      const easeOutQuad = (x: number): number => 1 - (1 - x) * (1 - x);
      const easedProgress = easeOutQuad(progress);

      groupRef.current.position.y =
        hiddenY - (hiddenY - printedY) * easedProgress;

      if (progress >= 1) {
        setAnimationPhase("dropping");
        startTime.current = Date.now();
      }
    }

    // Phase 2: Dropping - falls to center
    if (animationPhase === "dropping") {
      const dropDuration = 0.8;
      const progress = Math.min(elapsed / dropDuration, 1);

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
      groupRef.current.position.y =
        printedY - (printedY - finalY) * easedProgress;

      // Slight rotation during fall
      groupRef.current.rotation.z =
        Math.sin(elapsed * 4) * 0.03 * (1 - progress);

      if (progress >= 1) {
        setAnimationPhase("settling");
        startTime.current = Date.now();
      }
    }

    // Phase 3: Settling
    if (animationPhase === "settling") {
      const settleDuration = 0.4;
      const progress = Math.min(elapsed / settleDuration, 1);

      groupRef.current.rotation.z =
        Math.sin(progress * Math.PI * 3) * 0.015 * (1 - progress);
      groupRef.current.position.y =
        finalY +
        Math.sin(progress * Math.PI * 2) * 0.02 * (1 - progress);

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

    // Phase 4: Gentle idle floating after complete
    if (animationPhase === "complete") {
      const t = state.clock.elapsedTime;
      groupRef.current.position.y =
        finalY + Math.sin(t * 0.6) * 0.035;
      groupRef.current.rotation.z =
        0.01 + Math.sin(t * 0.4 + 0.5) * 0.005;
    }
  });

  // Photo strip dimensions - 4:3 aspect ratio for each photo
  const photoWidth = 1.1;
  const photoHeight = photoWidth * 0.75;
  const borderPadding = 0.12;
  const bottomPadding = 0.5;
  const spacing = 0.1;
  const stripWidth = photoWidth + borderPadding * 2;
  const stripHeight =
    photoHeight * 3 + spacing * 2 + borderPadding + bottomPadding;

  // Offset to center photos accounting for extra bottom padding
  const photosOffsetY = (bottomPadding - borderPadding) / 2;

  // Rounded corner radius for individual photos
  const photoRadius = 0.02;

  // Create rounded rectangle shape for photo clipping
  const photoShape = useMemo(() => {
    const shape = new THREE.Shape();
    const w = photoWidth / 2;
    const h = photoHeight / 2;
    const r = photoRadius;
    shape.moveTo(-w + r, -h);
    shape.lineTo(w - r, -h);
    shape.quadraticCurveTo(w, -h, w, -h + r);
    shape.lineTo(w, h - r);
    shape.quadraticCurveTo(w, h, w - r, h);
    shape.lineTo(-w + r, h);
    shape.quadraticCurveTo(-w, h, -w, h - r);
    shape.lineTo(-w, -h + r);
    shape.quadraticCurveTo(-w, -h, -w + r, -h);
    return shape;
  }, [photoWidth, photoHeight]);

  const photoGeo = useMemo(() => {
    const geo = new THREE.ShapeGeometry(photoShape);
    // Generate UVs that map [0,1] across the shape
    const pos = geo.attributes.position;
    const uvs = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) {
      uvs[i * 2] = (pos.getX(i) + photoWidth / 2) / photoWidth;
      uvs[i * 2 + 1] = (pos.getY(i) + photoHeight / 2) / photoHeight;
    }
    geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    return geo;
  }, [photoShape, photoWidth, photoHeight]);

  return (
    <group ref={groupRef} position={[0, hiddenY, 0]}>
      {/* White backing/frame of photo strip with rounded corners */}
      <RoundedBox
        args={[stripWidth, stripHeight, 0.025]}
        radius={0.04}
        smoothness={4}
        position={[0, 0, -0.02]}
      >
        <meshStandardMaterial
          color="#fafafa"
          roughness={0.25}
          metalness={0}
        />
      </RoundedBox>

      {/* Photo 1 (top) */}
      <mesh
        geometry={photoGeo}
        position={[0, photoHeight + spacing + photosOffsetY, 0.001]}
      >
        <meshStandardMaterial map={tex1} roughness={0.1} metalness={0.05} />
      </mesh>

      {/* Photo 2 (middle) */}
      <mesh geometry={photoGeo} position={[0, photosOffsetY, 0.001]}>
        <meshStandardMaterial map={tex2} roughness={0.1} metalness={0.05} />
      </mesh>

      {/* Photo 3 (bottom) */}
      <mesh
        geometry={photoGeo}
        position={[0, -(photoHeight + spacing) + photosOffsetY, 0.001]}
      >
        <meshStandardMaterial map={tex3} roughness={0.1} metalness={0.05} />
      </mesh>

      {/* Glossy clear coat overlay */}
      <mesh position={[0, photosOffsetY, 0.003]}>
        <planeGeometry
          args={[
            photoWidth + 0.02,
            photoHeight * 3 + spacing * 2 + 0.02,
          ]}
        />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.06}
          roughness={0.02}
          metalness={0.2}
          clearcoat={1}
          clearcoatRoughness={0.03}
          reflectivity={0.8}
        />
      </mesh>

      {/* Subtle diagonal specular highlight */}
      <mesh
        position={[-photoWidth * 0.22, photosOffsetY + 0.2, 0.004]}
        rotation={[0, 0, 0.15]}
      >
        <planeGeometry args={[0.08, photoHeight * 3 + spacing * 2]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.045} />
      </mesh>

      {/* "E ♥ A" text at the bottom of the strip */}
      <Text
        position={[0, -(stripHeight / 2) + bottomPadding * 0.42, 0.002]}
        fontSize={0.11}
        color="#b0b0b0"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.15}
      >
        E &amp; A
      </Text>

      {/* Soft drop shadow - multi-layered for realism */}
      <mesh position={[0.03, -0.05, -0.04]}>
        <planeGeometry args={[stripWidth * 1.05, stripHeight * 1.02]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.12} />
      </mesh>
      <mesh position={[0.05, -0.08, -0.05]}>
        <planeGeometry args={[stripWidth * 1.1, stripHeight * 1.05]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.06} />
      </mesh>
    </group>
  );
}

// Ambient particles for atmosphere — twinkling gold dust
function Particles() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 80;

  const { positions, sizes, opacities, phases } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const sz = new Float32Array(particleCount);
    const op = new Float32Array(particleCount);
    const ph = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = Math.random() * 7 - 1.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5 - 1;
      sz[i] = 0.01 + Math.random() * 0.025;
      op[i] = 0.15 + Math.random() * 0.35;
      ph[i] = Math.random() * Math.PI * 2;
    }
    return { positions: pos, sizes: sz, opacities: op, phases: ph };
  }, []);

  useFrame((state) => {
    if (!particlesRef.current) return;
    const t = state.clock.elapsedTime;

    const positionAttr = particlesRef.current.geometry.attributes.position;
    for (let i = 0; i < particleCount; i++) {
      const y = positions[i * 3 + 1];
      // Gentle drift upward + sinusoidal wave
      positionAttr.setY(
        i,
        y + Math.sin(t * 0.3 + phases[i]) * 0.15 + t * 0.005
      );
      // Subtle horizontal sway
      const x = positions[i * 3];
      positionAttr.setX(i, x + Math.sin(t * 0.2 + phases[i] * 2) * 0.08);
    }
    positionAttr.needsUpdate = true;

    // Rotate the whole system very slowly
    particlesRef.current.rotation.y = t * 0.015;
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
        size={0.018}
        color="#d4a855"
        transparent
        opacity={0.3}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Secondary particle layer - finer sparkles
function Sparkles() {
  const sparklesRef = useRef<THREE.Points>(null);
  const count = 40;

  const { positions, phases } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const ph = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 7;
      pos[i * 3 + 1] = Math.random() * 6 - 1;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 3 - 0.5;
      ph[i] = Math.random() * Math.PI * 2;
    }
    return { positions: pos, phases: ph };
  }, []);

  useFrame((state) => {
    if (!sparklesRef.current) return;
    const mat = sparklesRef.current.material as THREE.PointsMaterial;
    // Twinkle effect through opacity oscillation
    mat.opacity = 0.15 + Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
  });

  return (
    <points ref={sparklesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.01}
        color="#f0e0c0"
        transparent
        opacity={0.2}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Main scene component
function Scene({
  images,
  onAnimationComplete,
  startDelay,
}: {
  images: string[];
  onAnimationComplete?: () => void;
  startDelay?: number;
}) {
  return (
    <>
      {/* Lighting — warm, cinematic setup */}
      <ambientLight intensity={0.4} color="#fff5eb" />
      <directionalLight
        position={[5, 8, 5]}
        intensity={0.9}
        color="#ffffff"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight
        position={[-4, 5, -2]}
        intensity={0.3}
        color="#ffeedd"
      />
      <pointLight
        position={[0, 3, 3]}
        intensity={0.4}
        color="#fff8f0"
        distance={10}
        decay={2}
      />
      {/* Subtle warm fill from below */}
      <pointLight
        position={[0, -3, 2]}
        intensity={0.15}
        color="#ffd9b3"
        distance={8}
        decay={2}
      />

      {/* Photo strip */}
      <Suspense fallback={null}>
        <PhotoStrip
          images={images}
          onAnimationComplete={onAnimationComplete}
          startDelay={startDelay}
        />
      </Suspense>

      {/* Atmospheric particles */}
      <Particles />
      <Sparkles />

      {/* Environment for reflections */}
      <Environment preset="studio" />
    </>
  );
}

// Loading placeholder
function LoadingFallback() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[#c9a66b] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#c9a66b] text-sm tracking-widest uppercase">
          Loading photobooth...
        </p>
      </div>
    </div>
  );
}

export interface PhotoboothSceneProps {
  images?: string[];
  className?: string;
  onAnimationComplete?: () => void;
  startDelay?: number;
}

export function PhotoboothScene({
  images = [
    "/booth/booth-1.png",
    "/booth/booth-2.png",
    "/booth/booth-3.png",
  ],
  className = "",
  onAnimationComplete,
  startDelay = 500,
}: PhotoboothSceneProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className={`relative w-full h-full ${className}`}
      style={{ backgroundColor: "#0a0a0a" }}
    >
      {!isLoaded && <LoadingFallback />}

      {/* Vignette overlay for depth */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)",
        }}
      />

      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        onCreated={() => setIsLoaded(true)}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
        dpr={[1, 2]}
        style={{ background: "transparent" }}
      >
        <color attach="background" args={["#080808"]} />
        <fog attach="fog" args={["#080808", 8, 18]} />
        <Scene
          images={images}
          onAnimationComplete={onAnimationComplete}
          startDelay={startDelay}
        />
      </Canvas>
    </div>
  );
}
