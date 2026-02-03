"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface AnimatedImageFrameProps {
  initialOuterSrc: string;
  initialCenterSrc: string;
  images: string[];
  outerAlt?: string;
  centerAlt?: string;
  className?: string;
  centerClassName?: string;
  autoAdvance?: boolean;
  autoAdvanceInterval?: number;
}

export function AnimatedImageFrame({
  initialOuterSrc,
  initialCenterSrc,
  images,
  outerAlt = "Background image",
  centerAlt = "Featured image",
  className = "",
  centerClassName = "",
  autoAdvance = true,
  autoAdvanceInterval = 1500,
}: AnimatedImageFrameProps) {
  const prefersReducedMotion = useReducedMotion();
  
  const [outerSrc, setOuterSrc] = useState(initialOuterSrc);
  const [centerSrc, setCenterSrc] = useState(initialCenterSrc);
  const [promotingImage, setPromotingImage] = useState<string | null>(null);
  const [incomingImage, setIncomingImage] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [clipStart, setClipStart] = useState("inset(0%)");
  
  const outerRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);

  // Calculate the clip-path inset to match center frame
  const calculateClipStart = useCallback(() => {
    if (!outerRef.current || !centerRef.current) return "inset(0%)";
    
    const outerRect = outerRef.current.getBoundingClientRect();
    const centerRect = centerRef.current.getBoundingClientRect();
    
    // Calculate inset percentages
    const top = ((centerRect.top - outerRect.top) / outerRect.height) * 100;
    const right = ((outerRect.right - centerRect.right) / outerRect.width) * 100;
    const bottom = ((outerRect.bottom - centerRect.bottom) / outerRect.height) * 100;
    const left = ((centerRect.left - outerRect.left) / outerRect.width) * 100;
    
    return `inset(${top}% ${right}% ${bottom}% ${left}%)`;
  }, []);

  // Trigger the next image
  const advanceImage = useCallback(() => {
    if (isAnimating || images.length === 0) return;
    
    const nextIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(nextIndex);
    
    const clip = calculateClipStart();
    setClipStart(clip);
    
    if (prefersReducedMotion) {
      setOuterSrc(centerSrc);
      setCenterSrc(images[nextIndex]);
    } else {
      setPromotingImage(centerSrc);
      setIncomingImage(images[nextIndex]);
      setIsAnimating(true);
    }
  }, [currentIndex, images, isAnimating, calculateClipStart, centerSrc, prefersReducedMotion]);

  // Auto-advance timer
  useEffect(() => {
    if (!autoAdvance || isAnimating) return;
    
    const timer = setTimeout(advanceImage, autoAdvanceInterval);
    return () => clearTimeout(timer);
  }, [autoAdvance, autoAdvanceInterval, advanceImage, isAnimating]);

  // Handle clip animation complete
  const handleClipComplete = useCallback(() => {
    if (promotingImage) {
      setOuterSrc(promotingImage);
      setPromotingImage(null);
    }
  }, [promotingImage]);

  // Handle slide animation completion
  const handleSlideComplete = useCallback(() => {
    if (incomingImage) {
      setCenterSrc(incomingImage);
      setIncomingImage(null);
      setIsAnimating(false);
    }
  }, [incomingImage]);

  return (
    <div ref={outerRef} className={`relative overflow-hidden ${className}`}>
      {/* Outer background image */}
      <div className="absolute inset-0">
        <img
          src={outerSrc}
          alt={outerAlt}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Promotion overlay - full size image with animated clip-path */}
      <AnimatePresence>
        {promotingImage && !prefersReducedMotion && (
          <motion.div
            initial={{ 
              clipPath: clipStart,
            }}
            animate={{ 
              clipPath: "inset(0%)",
            }}
            transition={{
              duration: 1.8,
              ease: [0.22, 0.1, 0.1, 1],
            }}
            onAnimationComplete={handleClipComplete}
            className="absolute inset-0 z-20"
          >
            <img
              src={promotingImage}
              alt="Transitioning image"
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}
      </AnimatePresence>


      {/* Bottom right 3x3 text grid */}
      <div className="absolute bottom-8 right-8 lg:bottom-12 lg:right-12 z-40">
        <div className="grid grid-cols-3 gap-x-6 gap-y-3 text-white/70 text-xs tracking-[0.2em] font-bold">
          <span>-</span>
          <span>0</span>
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>-</span>
          <span>-</span>
          <span>2</span>
          <span>7</span>
        </div>
      </div>

      {/* Center frame */}
      <div
        ref={centerRef}
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 overflow-hidden ${centerClassName}`}
      >
        {/* Current center image */}
        <div className="w-full h-full">
          <img
            src={centerSrc}
            alt={centerAlt}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Incoming center image (slides in from left) */}
        <AnimatePresence>
          {incomingImage && !prefersReducedMotion && (
            <motion.div
              key={incomingImage}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              transition={{
                duration: 1.4,
                delay: 0.35,
                ease: [0.22, 0.1, 0.1, 1],
              }}
              onAnimationComplete={handleSlideComplete}
              className="absolute inset-0"
            >
              <img
                src={incomingImage}
                alt={centerAlt}
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
