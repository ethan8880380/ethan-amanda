"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Delay in seconds. */
  delay?: number;
  /** Vertical travel distance in px. */
  distance?: number;
}

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;

/**
 * Fades + lifts children into view once as they enter the viewport.
 * Respects reduced-motion preferences (opacity only).
 */
export function Reveal({
  children,
  className,
  delay = 0,
  distance = 20,
}: RevealProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{
        duration: shouldReduceMotion ? 0.3 : 0.9,
        ease: EASE_OUT_EXPO,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
