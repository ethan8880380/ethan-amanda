"use client";

import { motion } from "framer-motion";
import { AnimatedImageFrame } from "./animated-image-frame";

// Image gallery for the animation - images from /public/gallery folder
const galleryImages = [
  "/gallery/gallery-1.jpg",
  "/gallery/gallery-2.jpg",
  "/gallery/gallery-3.webp",
  "/gallery/gallery-4.jpg",
  "/gallery/gallery-5.jpeg",
];

export function EngagementHero() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative">
      {/* Center RSVP Square
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-48 h-24 bg-red-500 flex items-center justify-center cursor-pointer hover:bg-red-700 transition-colors"
      >
        <span className="text-white text-2xl tracking-[0.3em] font-light">RSVP</span>
      </motion.div> */}
      {/* Left Panel - Light */}
      <div className="w-full lg:w-1/2 bg-[#faf9f7] relative flex flex-col min-h-screen lg:min-h-0">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-6 lg:px-12 lg:py-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-2xl lg:text-3xl tracking-tight text-[#1a1a1a] font-medium"
          >
            E&A
          </motion.h1>

          <nav className="flex items-center gap-8">
            <motion.a
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              href="#details"
              className="text-sm tracking-wide text-[#1a1a1a] hover:text-[#b8956b] transition-colors border-b border-[#1a1a1a] pb-0.5"
            >
              Details
            </motion.a>
            <motion.a
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              href="#rsvp"
              className="text-sm tracking-wide text-[#1a1a1a] hover:text-[#b8956b] transition-colors"
            >
              RSVP
            </motion.a>
          </nav>
        </header>

        {/* Image and Info Row - Absolutely positioned to align with right panel center frame */}
        <div className="absolute top-1/2 -translate-y-1/2 left-8 lg:left-12 right-8 lg:right-12">
          <div className="flex flex-row gap-8 lg:gap-12 items-end">
            {/* Featured Image - Same size as center frame on right */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="relative flex-shrink-0"
            >
              <div className="w-52 h-72 lg:w-64 lg:h-[22rem] overflow-hidden">
                <img
                  src="/gallery/featured.jpg"
                  alt="Engagement"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
              </div>
            </motion.div>

            {/* Event Info and Separator - Side by side with image */}
            <div className="flex-1 flex flex-col justify-end pb-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="max-w-xs mb-8"
              >
                <p className="text-xs tracking-[0.3em] text-[#666] mb-4 uppercase">
                  01/ Engagement Party
                </p>
                <p className="text-sm lg:text-base text-[#1a1a1a] leading-relaxed">
                  Join us as we celebrate our next chapter together—a night of love, laughter, and new beginnings.
                </p>
              </motion.div>

              {/* Separator - Aligned with bottom of image, extends to right edge */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="w-full h-px bg-[#ddd] origin-left"
              />
            </div>
          </div>
        </div>

        {/* Bottom Content */}
        <div className="absolute bottom-0 left-8 lg:left-12 right-8 lg:right-12 pb-8">
          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="max-w-sm mb-8"
          >
            <p className="text-sm lg:text-base text-[#444] leading-relaxed mb-4">
              After years of adventures, late-night conversations, and countless
              shared dreams, we're thrilled to announce that we're engaged.
            </p>
            <p className="text-sm lg:text-base text-[#444] leading-relaxed">
              <span className="border-b border-[#1a1a1a]">
                We invite you to join us
              </span>{" "}
              for an evening of celebration, connection, and joy as we mark
              this beautiful milestone.
            </p>
          </motion.div>

          {/* Bottom Decorative Elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="flex items-end gap-6"
          >
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="w-px bg-[#ccc]"
                style={{ height: `${8 + (i % 3) * 8}px` }}
              />
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Animated Image Frame */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="w-full lg:w-1/2 relative min-h-[70vh] lg:min-h-screen"
      >
        <AnimatedImageFrame
          initialOuterSrc="/gallery/hero-background.jpeg"
          initialCenterSrc="/gallery/gallery-1.jpg"
          images={galleryImages}
          outerAlt="Couple"
          centerAlt="Engagement moment"
          className="w-full h-full bg-[#1a1a1a]"
          centerClassName="w-52 h-72 lg:w-64 lg:h-[22rem] bg-[#c9a66b]/90"
          autoAdvance={true}
          autoAdvanceInterval={1500}
        />
        
        {/* Menu Icon Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="absolute top-6 right-8 lg:top-8 lg:right-12 flex flex-col gap-1.5 cursor-pointer group z-50"
        >
          <div className="w-6 h-0.5 bg-white group-hover:w-8 transition-all" />
          <div className="w-6 h-0.5 bg-white" />
        </motion.div>
      </motion.div>
    </div>
  );
}
