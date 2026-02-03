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
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Mobile: Gallery First, Desktop: Right Panel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="w-full lg:w-1/2 relative h-[60vh] sm:h-[70vh] lg:h-auto lg:min-h-screen order-1 lg:order-2"
      >
        <AnimatedImageFrame
          initialOuterSrc="/gallery/hero-background.jpeg"
          initialCenterSrc="/gallery/gallery-1.jpg"
          images={galleryImages}
          outerAlt="Couple"
          centerAlt="Engagement moment"
          className="w-full h-full bg-[#1a1a1a]"
          centerClassName="w-40 h-56 sm:w-52 sm:h-72 lg:w-64 lg:h-[22rem] bg-[#c9a66b]/90"
          autoAdvance={true}
          autoAdvanceInterval={1500}
        />
        
        {/* Menu Icon Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="absolute top-4 right-6 sm:top-6 sm:right-8 lg:top-8 lg:right-12 flex flex-col gap-1.5 cursor-pointer group z-50"
        >
          <div className="w-6 h-0.5 bg-white group-hover:w-8 transition-all" />
          <div className="w-6 h-0.5 bg-white" />
        </motion.div>
      </motion.div>

      {/* Content Panel - Light */}
      <div className="w-full lg:w-1/2 bg-[#faf9f7] relative flex flex-col order-2 lg:order-1">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-5 sm:px-8 sm:py-6 lg:px-12 lg:py-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-2xl lg:text-3xl tracking-tight text-[#1a1a1a] font-medium"
          >
            Ethan & Amanda
          </motion.h1>

          <nav className="flex items-center gap-4 sm:gap-8">
            <motion.a
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              href="#details"
              className="text-xs sm:text-sm tracking-wide text-[#1a1a1a] hover:text-[#b8956b] transition-colors border-b border-[#1a1a1a] pb-0.5"
            >
              Details
            </motion.a>
            <motion.a
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              href="#rsvp"
              className="text-xs sm:text-sm tracking-wide text-[#1a1a1a] hover:text-[#b8956b] transition-colors"
            >
              RSVP
            </motion.a>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="hidden sm:block w-6 h-6 bg-[#1a1a1a] rounded-full cursor-pointer hover:bg-[#b8956b] transition-colors"
            />
          </nav>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col px-6 sm:px-8 lg:px-12 py-6 sm:py-8 lg:py-0 lg:justify-center">
          {/* Featured Image + Info Row - Only on Desktop */}
          <div className="hidden lg:flex flex-row gap-12 items-end mb-12">
            {/* Featured Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="relative flex-shrink-0"
            >
              <div className="w-64 h-[22rem] overflow-hidden">
                <img
                  src="/gallery/featured.jpg"
                  alt="Engagement"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
              </div>
            </motion.div>

            {/* Event Info */}
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
                <p className="text-base text-[#1a1a1a] leading-relaxed">
                  Join us as we celebrate our next chapter together—a night of love, laughter, and new beginnings.
                </p>
              </motion.div>

              {/* Separator */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="w-full h-px bg-[#ddd] origin-left"
              />
            </div>
          </div>

          {/* Mobile Event Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="lg:hidden mb-6"
          >
            <p className="text-xs tracking-[0.3em] text-[#666] mb-3 uppercase">
              01/ Engagement Party
            </p>
            <p className="text-sm sm:text-base text-[#1a1a1a] leading-relaxed">
              Join us as we celebrate our next chapter together—a night of love, laughter, and new beginnings.
            </p>
          </motion.div>

          {/* Separator - Mobile */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="lg:hidden w-full h-px bg-[#ddd] origin-left mb-6"
          />

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="max-w-sm mb-8"
          >
            <p className="text-sm sm:text-base text-[#444] leading-relaxed mb-4">
              After years of adventures, late-night conversations, and countless
              shared dreams, we're thrilled to announce that we're engaged.
            </p>
            <p className="text-sm sm:text-base text-[#444] leading-relaxed">
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
            className="flex items-end gap-4 sm:gap-6 mt-auto pb-6 lg:pb-12"
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
    </div>
  );
}
