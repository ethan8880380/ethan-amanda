"use client";

import { PhotoboothScene } from "@/components/photobooth-scene";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CalendarPlus, Loader2 } from "lucide-react";
import { submitRSVP, type RSVPFormData } from "./actions";
import Link from "next/link";

// Scripty heart SVG path for loading animation
function ScriptyHeartLoader({ isVisible }: { isVisible: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
    >
      <div className="relative flex flex-col items-center overflow-visible">
        <svg
          width="105"
          height="100"
          viewBox="0 0 467 444"
          fill="none"
          className="overflow-visible"
        >
          {/* Hand-drawn heart from heart-3.svg */}
          <motion.path
            d="M218.547 333.272C190.547 321.605 123.947 286.872 81.5474 241.272C28.5474 184.272 -5.95258 125.772 12.5474 81.7718C31.0474 37.7718 64.0474 21.7718 122.047 17.7718C180.047 13.7718 223.047 41.7718 251.047 69.2718C279.047 96.7718 311.547 138.772 316.047 162.772C320.547 186.772 316.047 200.772 308.047 200.772C300.047 200.772 291.547 181.772 294.047 151.772C296.547 121.772 320.547 58.7718 374.547 21.7718C428.547 -15.2282 455.547 29.2718 458.047 47.7718C460.547 66.2718 460.047 120.772 421.047 177.272C382.047 233.772 318.047 330.272 180.547 436.272"
            stroke="white"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              pathLength: { duration: 2.4, ease: [0.65, 0, 0.35, 1] },
              opacity: { duration: 0.3 }
            }}
          />
        </svg>

        {/* Ethan + Amanda text */}
        <motion.p
          initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="mt-5 font-serif text-white/90 text-3xl tracking-wide leading-[2] overflow-visible"
        >
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
          >
            Ethan
          </motion.span>
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.6, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.5, ease: "easeOut" }}
            className="inline-block mx-2 text-xl text-white/50"
          >
            +
          </motion.span>
          <motion.span
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.6, ease: "easeOut" }}
          >
            Amanda
          </motion.span>
        </motion.p>
        
        {/* Subtle glow effect */}
        <motion.div 
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 -m-8 bg-white/10 rounded-full blur-2xl animate-pulse" 
        />
      </div>
    </motion.div>
  );
}

// Gallery images for the photo strip
const photoStripImages = [
  "/booth/booth-1.png",
  "/booth/booth-3.png", 
  "/booth/booth-2.png",
];

const attendingOptions = [
  { value: "yes", label: "Yes, I'll be there!" },
  { value: "no", label: "Sorry, I can't make it" },
];

// Calendar .ics file served from /engagement-party/calendar route
const calendarUrl = "/engagement-party/calendar";

export default function EngagementPartyPage() {
  const [showHeart, setShowHeart] = useState(true);
  const [showPhoto, setShowPhoto] = useState(false);
  const [showText, setShowText] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    guests: "",
    attending: "",
    allergies: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Prevent body scroll on mobile
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, []);

  // Sequenced animation timing
  useEffect(() => {
    // Heart finishes drawing at ~2.2s, start fading it out
    const heartFadeTimer = setTimeout(() => {
      setShowHeart(false);
    }, 2400);
    
    // Show photo container right away (printing waits internally until 2500ms)
    const photoTimer = setTimeout(() => {
      setShowPhoto(true);
    }, 2400);
    
    // Text comes in after photo has finished printing
    // Photo starts at 2500ms, prints for 2s, drops for 0.8s = ~5300ms total
    const textTimer = setTimeout(() => {
      setShowText(true);
    }, 5800);
    
    return () => {
      clearTimeout(heartFadeTimer);
      clearTimeout(photoTimer);
      clearTimeout(textTimer);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const result = await submitRSVP(formData as RSVPFormData);

    setIsSubmitting(false);

    if (result.success) {
      setIsSubmitted(true);
    } else {
      setSubmitError(result.error || "Something went wrong. Please try again.");
    }
  }

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <div className="fixed inset-0 overflow-hidden text-white" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Heart loader - fades out after drawing */}
      <ScriptyHeartLoader isVisible={showHeart} />
      {/* Subtle grain texture */}
      <div 
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Background glow - only visible on desktop */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden lg:block">
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden absolute inset-0 overflow-hidden">
        {/* Photobooth - fixed to top, full screen */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showPhoto ? 1 : 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0"
        >
          <PhotoboothScene
            images={photoStripImages}
            className="w-full h-full"
            startDelay={2500}
          />
        </motion.div>

        {/* Content - positioned at bottom with local gradient */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showText ? 1 : 0, y: showText ? 0 : 20 }}
          transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute bottom-0 left-0 right-0 z-10"
        > 
          {/* Gradient backdrop - only covers text section */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black to-transparent pointer-events-none" />
          
          {/* Text content */}
          <div className="relative px-6 pb-12 pt-16">
            <h1 className="font-serif text-2xl sm:text-5xl text-white mb-5 leading-tight">
              We're Getting Married!
            </h1>
                      
            <p className="text-white/60 text-sm sm:text-base leading-relaxed mb-6">
              You're invited to join us as we celebrate our engagement!
            </p>
            
            <div className="mb-6">
              <p className="text-white text-base sm:text-lg">
              Local 104 · March 15th, 2026 · 1–4 PM
              </p>
              <p className="text-white/50 text-xs mt-1">
                18498 Ballinger Way NE, Lake Forest Park, WA
              </p>
            </div>
          
            {/* Action Buttons */}
            <div className="flex gap-3">
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <button className="flex-1 px-6 py-4 bg-white text-red-700 font-medium tracking-wide uppercase text-sm hover:bg-white/90 transition-colors">
                    RSVP
                  </button>
                </DialogTrigger>
              <DialogContent className="bg-[#151515] border-[#2a2a2a] text-white w-[calc(100vw-3rem)] max-w-md mx-auto p-5 sm:p-6">
                {!isSubmitted ? (
                  <>
                    <DialogHeader>
                      <DialogTitle className="text-xl sm:text-2xl font-medium tracking-wide text-white">RSVP</DialogTitle>
                      <DialogDescription className="text-white/60 text-sm">
                        Let us know if you can make it to our engagement party on March 15th.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                      <div className="space-y-2">
                        <Label className="text-white/80 text-sm">Will you be attending?</Label>
                        <div className="flex flex-col gap-2">
                          {attendingOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => setFormData((prev) => ({ ...prev, attending: option.value }))}
                              className={`px-3 sm:px-4 py-2.5 sm:py-3 text-sm border transition-colors ${
                                formData.attending === option.value
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : "border-[#333] text-white/70 hover:border-primary/50"
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <AnimatePresence mode="wait">
                        {formData.attending && (
                          <motion.div
                            key="name-field"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-1.5 sm:space-y-2">
                              <Label htmlFor="guests-mobile" className="text-white/80 text-sm">
                                {formData.attending === "yes" ? "Guest names (separated by commas)" : "Your name"}
                              </Label>
                              <Input
                                id="guests-mobile"
                                name="guests"
                                value={formData.guests}
                                onChange={handleInputChange}
                                placeholder={formData.attending === "yes" ? "e.g. John Smith, Jane Doe" : "e.g. John Smith"}
                                required
                                className="bg-[#1a1a1a] border-[#333] text-white placeholder:text-white/30 focus-visible:border-primary focus-visible:ring-primary/20 text-base"
                              />
                              {formData.attending === "yes" && (
                                <p className="text-white/40 text-xs">Include yourself and any plus ones</p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <AnimatePresence mode="wait">
                        {formData.attending === "yes" && (
                          <motion.div
                            key="allergies-field"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-1.5 sm:space-y-2">
                              <Label htmlFor="allergies-mobile" className="text-white/80 text-sm">
                                Dietary Restrictions or Allergies
                              </Label>
                              <Textarea
                                id="allergies-mobile"
                                name="allergies"
                                value={formData.allergies}
                                onChange={handleInputChange}
                                placeholder="Let us know about any food allergies or dietary restrictions..."
                                className="bg-[#1a1a1a] border-[#333] text-white placeholder:text-white/30 focus-visible:border-primary focus-visible:ring-primary/20 min-h-[70px] sm:min-h-[80px] text-base"
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {submitError && (
                        <p className="text-red-400 text-sm">{submitError}</p>
                      )}

                      <DialogFooter className="pt-2 sm:pt-4">
                        <Button
                          type="submit"
                          disabled={isSubmitting || !formData.attending || !formData.guests}
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/80 disabled:opacity-50 py-2.5"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            "Submit RSVP"
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </>
                ) : (
                  <div className="py-4 sm:py-6 text-center">
                    <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🎉</div>
                    <h3 className="text-xl sm:text-2xl font-medium tracking-wide text-white mb-2 sm:mb-3">You're All Set!</h3>
                    <p className="text-white/60 text-sm mb-4 sm:mb-6">
                      {formData.attending === "yes" 
                        ? "We can't wait to see you there!" 
                        : "We'll miss you! Thanks for letting us know."}
                    </p>
                    
                    {formData.attending === "yes" && (
                      <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-3 sm:p-4 mb-4 sm:mb-6 text-left">
                        <p className="text-xs tracking-[0.2em] text-primary uppercase mb-2 sm:mb-3">Event Details</p>
                        <p className="text-white font-medium text-sm sm:text-base">Ethan & Amanda's Engagement Party</p>
                        <p className="text-white/60 text-xs sm:text-sm mt-1">Saturday, March 15th, 2026 · 1:00 – 4:00 PM</p>
                        <p className="text-white/50 text-xs sm:text-sm">Local 104, Lake Forest Park, WA</p>
                      </div>
                    )}
                    
                    <div className="flex flex-col gap-2 sm:gap-3">
                      {formData.attending === "yes" && (
                        <a
                          href={calendarUrl}
                          className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-primary text-primary-foreground font-medium tracking-wide text-sm hover:bg-primary/80 transition-colors"
                        >
                          <CalendarPlus className="w-4 h-4" />
                          Add to Calendar
                        </a>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsOpen(false);
                          setIsSubmitted(false);
                          setSubmitError(null);
                          setFormData({
                            guests: "",
                            attending: "",
                            allergies: "",
                          });
                        }}
                        className="border-[#333] text-white/70 hover:bg-[#1a1a1a] hover:text-white"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
              <Link
                href="/engagement-party/details"
                className="flex-1 px-6 py-4 border border-white/30 text-white font-medium tracking-wide uppercase text-sm hover:bg-white/10 transition-colors text-center"
              >
                Details
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex absolute inset-0 overflow-hidden">
        {/* Photobooth - takes up the majority of the screen */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showPhoto ? 1 : 0 }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0"
        >
          <PhotoboothScene
            images={photoStripImages}
            className="w-full h-full"
          />
        </motion.div>

        {/* Content overlay - positioned bottom-left */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: showText ? 1 : 0, y: showText ? 0 : 30 }}
          transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute bottom-0 left-0 z-10 max-w-xl"
        >
          {/* Gradient backdrop */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent pointer-events-none" />

          <div className="relative px-12 pb-12 pt-32">
            <p className="text-[10px] tracking-[0.35em] text-primary/80 mb-4 uppercase">
              You're Invited
            </p>

            <h1 className="font-serif text-5xl xl:text-6xl text-white mb-5 leading-[1.8]">
              We're Getting Married!
            </h1>

            <div className="w-14 h-px bg-primary/40 mb-5" />

            <p className="text-white/55 text-sm leading-relaxed mb-6 max-w-sm">
              Join us as we celebrate our engagement! We can't wait to share
              this special moment with you.
            </p>

            <div className="mb-8">
              <p className="text-white text-lg">
                March 15th, 2026 · 1–4 PM
              </p>
              <p className="text-white/45 text-sm mt-1">
                Local 104 · 18498 Ballinger Way NE, Lake Forest Park, WA
              </p>
            </div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: showText ? 1 : 0, y: showText ? 0 : 10 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex gap-3 max-w-xs"
            >
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <button className="flex-1 px-8 py-3.5 bg-white text-[#0a0a0a] font-medium tracking-wide uppercase text-sm hover:bg-white/90 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                    RSVP
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-[#151515] border-[#2a2a2a] text-white max-w-md p-6">
                  {!isSubmitted ? (
                    <>
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-medium tracking-wide text-white">RSVP</DialogTitle>
                        <DialogDescription className="text-white/60 text-sm">
                          Let us know if you can make it to our engagement party on March 15th.
                        </DialogDescription>
                      </DialogHeader>

                      <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                          <Label className="text-white/80">Will you be attending?</Label>
                          <div className="flex flex-wrap gap-2">
                            {attendingOptions.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => setFormData((prev) => ({ ...prev, attending: option.value }))}
                                className={`px-4 py-2 text-sm border transition-colors ${
                                  formData.attending === option.value
                                    ? "bg-primary border-primary text-primary-foreground"
                                    : "border-[#333] text-white/70 hover:border-primary/50"
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <AnimatePresence mode="wait">
                          {formData.attending && (
                            <motion.div
                              key="name-field-desktop"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-2">
                                <Label htmlFor="guests" className="text-white/80">
                                  {formData.attending === "yes" ? "Guest names (separated by commas)" : "Your name"}
                                </Label>
                                <Input
                                  id="guests"
                                  name="guests"
                                  value={formData.guests}
                                  onChange={handleInputChange}
                                  placeholder={formData.attending === "yes" ? "e.g. John Smith, Jane Doe" : "e.g. John Smith"}
                                  required
                                  className="bg-[#1a1a1a] border-[#333] text-white placeholder:text-white/30 focus-visible:border-primary focus-visible:ring-primary/20"
                                />
                                {formData.attending === "yes" && (
                                  <p className="text-white/40 text-xs">Include yourself and any plus ones</p>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <AnimatePresence mode="wait">
                          {formData.attending === "yes" && (
                            <motion.div
                              key="allergies-field-desktop"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-2">
                                <Label htmlFor="allergies" className="text-white/80">
                                  Dietary Restrictions or Allergies
                                </Label>
                                <Textarea
                                  id="allergies"
                                  name="allergies"
                                  value={formData.allergies}
                                  onChange={handleInputChange}
                                  placeholder="Let us know about any food allergies or dietary restrictions..."
                                  className="bg-[#1a1a1a] border-[#333] text-white placeholder:text-white/30 focus-visible:border-primary focus-visible:ring-primary/20 min-h-[80px]"
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {submitError && (
                          <p className="text-red-400 text-sm">{submitError}</p>
                        )}

                        <DialogFooter className="pt-4">
                          <Button
                            type="submit"
                            disabled={isSubmitting || !formData.attending || !formData.guests}
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/80 disabled:opacity-50"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Submitting...
                              </>
                            ) : (
                              "Submit RSVP"
                            )}
                          </Button>
                        </DialogFooter>
                      </form>
                    </>
                  ) : (
                    <div className="py-6 text-center">
                      <div className="text-5xl mb-4">🎉</div>
                      <h3 className="text-2xl font-medium tracking-wide text-white mb-3">You're All Set!</h3>
                      <p className="text-white/60 mb-6">
                        {formData.attending === "yes"
                          ? "We can't wait to see you there!"
                          : "We'll miss you! Thanks for letting us know."}
                      </p>

                      {formData.attending === "yes" && (
                        <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-4 mb-6 text-left">
                          <p className="text-xs tracking-[0.2em] text-primary uppercase mb-3">Event Details</p>
                          <p className="text-white font-medium">Ethan & Amanda's Engagement Party</p>
                          <p className="text-white/60 text-sm mt-1">Saturday, March 15th, 2026 · 1:00 – 4:00 PM</p>
                          <p className="text-white/50 text-sm">Local 104, Lake Forest Park, WA</p>
                        </div>
                      )}

                      <div className="flex flex-col gap-3">
                        {formData.attending === "yes" && (
                          <a
                            href={calendarUrl}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium tracking-wide text-sm hover:bg-primary/80 transition-colors"
                          >
                            <CalendarPlus className="w-4 h-4" />
                            Add to Calendar
                          </a>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsOpen(false);
                            setIsSubmitted(false);
                            setSubmitError(null);
                            setFormData({
                              guests: "",
                              attending: "",
                              allergies: "",
                            });
                          }}
                          className="border-[#333] text-white/70 hover:bg-[#1a1a1a] hover:text-white"
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
              <Link
                href="/engagement-party/details"
                className="flex-1 px-8 py-3.5 border border-white/30 text-white font-medium tracking-wide uppercase text-sm hover:bg-white/10 transition-colors text-center"
              >
                Details
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
