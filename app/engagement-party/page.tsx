"use client";

import { PhotoboothScene } from "@/components/photobooth-scene";
import { motion } from "framer-motion";
import { useState } from "react";
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
import { CalendarPlus } from "lucide-react";
import { FallingPetals } from "@/components/falling-petals";

// Gallery images for the photo strip
const photoStripImages = [
  "/booth/booth-1.png",
  "/booth/booth-2.png", 
  "/booth/booth-3.png",
];

const attendingOptions = [
  { value: "yes", label: "Yes, I'll be there!" },
  { value: "no", label: "Sorry, I can't make it" },
];

// Generate Google Calendar URL
function getGoogleCalendarUrl() {
  const event = {
    title: "Ethan & Amanda's Engagement Party",
    startDate: "20260315T130000",
    endDate: "20260315T170000",
    location: "Local 104, 18498 Ballinger Way NE, Lake Forest Park, WA 98155",
    description: "Join us as we celebrate our engagement!",
  };
  
  const baseUrl = "https://calendar.google.com/calendar/render";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${event.startDate}/${event.endDate}`,
    location: event.location,
    details: event.description,
  });
  
  return `${baseUrl}?${params.toString()}`;
}

export default function EngagementPartyPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    guests: "",
    attending: "",
    allergies: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("RSVP submitted:", formData);
    setIsSubmitted(true);
  }

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <div className="min-h-screen text-white relative" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Subtle grain texture */}
      <div 
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Background glow - only visible on desktop */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden lg:block">
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-[#c9a66b]/5 rounded-full blur-[150px]" />
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden min-h-screen relative">
        {/* Photobooth - fixed to top, 80vh */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="fixed top-0 left-0 w-screen h-[80vh]"
        >
          <PhotoboothScene
            images={photoStripImages}
            className="w-full h-full"
          />
        </motion.div>

        {/* Content - positioned over photobooth with gradient background */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative z-10 min-h-screen flex flex-col justify-end px-6 pb-12 pt-[50vh] bg-gradient-to-t from-black to-transparent"
        > 
          <h1 className="font-serif text-2xl sm:text-5xl text-white mb-5 leading-tight">
            We're Getting Married!
          </h1>
                    
          <p className="text-white/60 text-sm sm:text-base leading-relaxed mb-6">
            You're invited to join us as we celebrate our engagement!
          </p>
          
          <div className="mb-6">
            <p className="text-white text-base sm:text-lg">
            Local 104 · March 15th, 2026 · 1:00 PM
            </p>
            <p className="text-white/50 text-xs mt-1">
              18498 Ballinger Way NE, Lake Forest Park, WA
            </p>
          </div>
          
          {/* RSVP Button */}
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <button className="w-full px-8 py-4 bg-white text-red-700 font-medium tracking-wide uppercase text-sm hover:bg-white/90 transition-colors">
                RSVP Now
              </button>
            </DialogTrigger>
            <DialogContent className="bg-[#151515] border-[#2a2a2a] text-white max-w-[calc(100vw-2rem)] sm:max-w-md mx-auto">
              {!isSubmitted ? (
                <>
                  <DialogHeader>
                    <DialogTitle className="font-script text-3xl text-white">RSVP</DialogTitle>
                    <DialogDescription className="text-white/60">
                      Let us know if you can make it to our engagement party on March 15th.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-white/80">Will you be attending?</Label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        {attendingOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, attending: option.value }))}
                            className={`px-4 py-3 text-sm border transition-colors ${
                              formData.attending === option.value
                                ? "bg-[#c9a66b] border-[#c9a66b] text-[#0a0a0a]"
                                : "border-[#333] text-white/70 hover:border-[#c9a66b]/50"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {formData.attending === "yes" && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="guests-mobile" className="text-white/80">Who's coming?</Label>
                          <Input
                            id="guests-mobile"
                            name="guests"
                            value={formData.guests}
                            onChange={handleInputChange}
                            placeholder="e.g. John Smith, Jane Smith"
                            required
                            className="bg-[#1a1a1a] border-[#333] text-white placeholder:text-white/30 focus-visible:border-[#c9a66b] focus-visible:ring-[#c9a66b]/20"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="allergies-mobile" className="text-white/80">
                            Dietary Restrictions or Allergies
                          </Label>
                          <Textarea
                            id="allergies-mobile"
                            name="allergies"
                            value={formData.allergies}
                            onChange={handleInputChange}
                            placeholder="Let us know about any food allergies or dietary restrictions..."
                            className="bg-[#1a1a1a] border-[#333] text-white placeholder:text-white/30 focus-visible:border-[#c9a66b] focus-visible:ring-[#c9a66b]/20 min-h-[80px]"
                          />
                        </div>
                      </>
                    )}

                    <DialogFooter className="pt-4">
                      <Button
                        type="submit"
                        disabled={!formData.attending || (formData.attending === "yes" && !formData.guests)}
                        className="w-full bg-[#c9a66b] text-[#0a0a0a] hover:bg-[#d4b87a] disabled:opacity-50"
                      >
                        Submit RSVP
                      </Button>
                    </DialogFooter>
                  </form>
                </>
              ) : (
                <div className="py-6 text-center">
                  <div className="text-5xl mb-4">🎉</div>
                  <h3 className="font-script text-3xl text-white mb-3">You're All Set!</h3>
                  <p className="text-white/60 mb-6">
                    {formData.attending === "yes" 
                      ? "We can't wait to see you there!" 
                      : "We'll miss you! Thanks for letting us know."}
                  </p>
                  
                  {formData.attending === "yes" && (
                    <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-4 mb-6 text-left">
                      <p className="text-xs tracking-[0.2em] text-[#c9a66b] uppercase mb-3">Event Details</p>
                      <p className="text-white font-medium">Ethan & Amanda's Engagement Party</p>
                      <p className="text-white/60 text-sm mt-1">Saturday, March 15th, 2026 at 1:00 PM</p>
                      <p className="text-white/50 text-sm">Local 104, Lake Forest Park, WA</p>
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-3">
                    {formData.attending === "yes" && (
                      <a
                        href={getGoogleCalendarUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#c9a66b] text-[#0a0a0a] font-medium tracking-wide text-sm hover:bg-[#d4b87a] transition-colors"
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
        </motion.div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen flex-row items-center justify-center px-20 gap-16">
        {/* Left side - Text content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 max-w-lg"
        >
          <p className="text-xs tracking-[0.3em] text-red-700 mb-4 uppercase">
            You're Invited
          </p>
          
          <h1 className="font-serif text-7xl text-white mb-6 leading-tight">
            We're Getting Married!
          </h1>
          
          <div className="w-16 h-px bg-[#c9a66b]/40 mb-6" />
          
          <p className="text-white/60 text-lg leading-relaxed mb-8">
            Join us as we celebrate our engagement! We can't wait to share 
            this special moment with you.
          </p>
          
          <div>
            <p className="text-white text-xl">
              March 15th, 2026 · 1:00 PM · Local 104
            </p>
            <p className="text-white/50 text-sm mt-1">
              18498 Ballinger Way NE, Lake Forest Park, WA 98155
            </p>
          </div>
          
          {/* RSVP Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8"
          >
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <button className="px-8 py-3 bg-white text-red-700 font-medium tracking-wide uppercase text-sm hover:bg-white/80 transition-colors">
                  RSVP Now
                </button>
              </DialogTrigger>
              <DialogContent className="bg-[#151515] border-[#2a2a2a] text-white max-w-md">
                {!isSubmitted ? (
                  <>
                    <DialogHeader>
                      <DialogTitle className="font-script text-3xl text-white">RSVP</DialogTitle>
                      <DialogDescription className="text-white/60">
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
                                  ? "bg-[#c9a66b] border-[#c9a66b] text-[#0a0a0a]"
                                  : "border-[#333] text-white/70 hover:border-[#c9a66b]/50"
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {formData.attending === "yes" && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="guests" className="text-white/80">Who's coming?</Label>
                            <Input
                              id="guests"
                              name="guests"
                              value={formData.guests}
                              onChange={handleInputChange}
                              placeholder="e.g. John Smith, Jane Smith"
                              required
                              className="bg-[#1a1a1a] border-[#333] text-white placeholder:text-white/30 focus-visible:border-[#c9a66b] focus-visible:ring-[#c9a66b]/20"
                            />
                          </div>

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
                              className="bg-[#1a1a1a] border-[#333] text-white placeholder:text-white/30 focus-visible:border-[#c9a66b] focus-visible:ring-[#c9a66b]/20 min-h-[80px]"
                            />
                          </div>
                        </>
                      )}

                      <DialogFooter className="pt-4">
                        <Button
                          type="submit"
                          disabled={!formData.attending || (formData.attending === "yes" && !formData.guests)}
                          className="w-full bg-[#c9a66b] text-[#0a0a0a] hover:bg-[#d4b87a] disabled:opacity-50"
                        >
                          Submit RSVP
                        </Button>
                      </DialogFooter>
                    </form>
                  </>
                ) : (
                  <div className="py-6 text-center">
                    <div className="text-5xl mb-4">🎉</div>
                    <h3 className="font-script text-3xl text-white mb-3">You're All Set!</h3>
                    <p className="text-white/60 mb-6">
                      {formData.attending === "yes" 
                        ? "We can't wait to see you there!" 
                        : "We'll miss you! Thanks for letting us know."}
                    </p>
                    
                    {formData.attending === "yes" && (
                      <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-4 mb-6 text-left">
                        <p className="text-xs tracking-[0.2em] text-[#c9a66b] uppercase mb-3">Event Details</p>
                        <p className="text-white font-medium">Ethan & Amanda's Engagement Party</p>
                        <p className="text-white/60 text-sm mt-1">Saturday, March 15th, 2026 at 1:00 PM</p>
                        <p className="text-white/50 text-sm">Local 104, Lake Forest Park, WA</p>
                      </div>
                    )}
                    
                    <div className="flex flex-col gap-3">
                      {formData.attending === "yes" && (
                        <a
                          href={getGoogleCalendarUrl()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#c9a66b] text-[#0a0a0a] font-medium tracking-wide text-sm hover:bg-[#d4b87a] transition-colors"
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
          </motion.div>
          
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-white/40 text-sm italic">
              Ethan & Amanda
            </p>
          </div>
        </motion.div>

        {/* Right side - Photobooth */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="relative flex items-center justify-center"
        >
          {/* Photobooth container */}
          <div className="relative w-[420px] h-[700px]">
            <PhotoboothScene
              images={photoStripImages}
              className="w-full h-full"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
