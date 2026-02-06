"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Utensils,
  Wine,
  Users,
  Car,
  ExternalLink,
  CalendarPlus,
  Loader2,
  type LucideIcon,
} from "lucide-react";
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
import { submitRSVP, type RSVPFormData } from "../actions";

const attendingOptions = [
  { value: "yes", label: "Yes, I'll be there!" },
  { value: "no", label: "Sorry, I can't make it" },
];

function handleAddToCalendar() {
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Ethan & Amanda//Engagement Party//EN",
    "BEGIN:VEVENT",
    "DTSTART:20260315T200000Z",
    "DTEND:20260316T000000Z",
    "SUMMARY:Ethan & Amanda's Engagement Party",
    "LOCATION:Local 104\\, 18498 Ballinger Way NE\\, Lake Forest Park\\, WA 98155",
    "DESCRIPTION:Join us as we celebrate our engagement!",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "engagement-party.ics";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

interface DetailCardProps {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
  delay?: number;
  accent?: boolean;
}

function DetailCard({ icon: Icon, label, children, delay = 0, accent = false }: DetailCardProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={`group relative p-6 sm:p-8 border transition-colors duration-500 ${
        accent
          ? "bg-primary/[0.06] border-primary/20 hover:border-primary/40"
          : "bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]"
      }`}
    >
      {/* Subtle corner accent */}
      <div className={`absolute top-0 left-0 w-8 h-px ${accent ? "bg-primary/40" : "bg-white/10"}`} />
      <div className={`absolute top-0 left-0 h-8 w-px ${accent ? "bg-primary/40" : "bg-white/10"}`} />

      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 ${accent ? "bg-primary/15" : "bg-white/[0.06]"}`}>
          <Icon className={`w-4 h-4 ${accent ? "text-primary" : "text-white/50"}`} />
        </div>
        <span className="text-[10px] tracking-[0.25em] uppercase text-white/40 font-medium">
          {label}
        </span>
      </div>
      <div className="space-y-2">{children}</div>
    </motion.div>
  );
}

export default function DetailsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    guests: "",
    attending: "",
    allergies: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
    <div className="min-h-screen bg-[#0a0a0a] text-white relative">
      {/* Grain texture */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/[0.04] rounded-full blur-[200px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/[0.02] rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 py-10 sm:py-16 lg:py-20">
        {/* Back navigation */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Link
            href="/engagement-party"
            className="inline-flex items-center gap-2.5 text-white/40 hover:text-white/80 transition-colors duration-300 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-xs tracking-[0.15em] uppercase">Back</span>
          </Link>
        </motion.div>

        {/* Hero header */}
        <div className="mt-12 sm:mt-16 mb-16 sm:mb-20">

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
            className="font-serif text-4xl sm:text-6xl lg:text-7xl text-white mb-6 leading-[1.1]"
          >
            Event Details
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-20 h-px bg-gradient-to-r from-primary/60 to-transparent origin-left"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-6 text-white/50 text-sm sm:text-base leading-relaxed max-w-md"
          >
            Everything you need to know about our engagement celebration.
            Come as you are — it's going to be a good time.
          </motion.p>
        </div>

        {/* Main details grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-6 sm:mb-8">
          {/* When */}
          <DetailCard icon={Clock} label="When" delay={0.3}>
            <p className="text-white text-lg sm:text-xl font-medium leading-snug">
              Saturday, March 15th
            </p>
            <p className="text-white/60 text-sm">1:00 PM</p>
          </DetailCard>

          {/* Where */}
          <DetailCard icon={MapPin} label="Where" delay={0.35}>
            <p className="text-white text-lg sm:text-xl font-medium leading-snug">
              Local 104
            </p>
            <p className="text-white/50 text-sm leading-relaxed">
              18498 Ballinger Way NE
              <br />
              Lake Forest Park, WA 98155
            </p>
            <a
              href="https://maps.google.com/?q=Local+104+18498+Ballinger+Way+NE+Lake+Forest+Park+WA+98155"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-primary/80 hover:text-primary text-xs tracking-wide mt-2 transition-colors"
            >
              Open in Maps
              <ExternalLink className="w-3 h-3" />
            </a>
          </DetailCard>
        </div>

        {/* What to expect — full width accent */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative mb-6 sm:mb-8 p-6 sm:p-8 lg:p-10 border border-white/[0.06] bg-white/[0.02] overflow-hidden"
        >
          {/* Decorative gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <p className="text-[10px] tracking-[0.25em] uppercase text-white/40 font-medium mb-5">
            What to Expect
          </p>
          <p className="text-white/80 text-base sm:text-lg leading-relaxed max-w-xl">
            A casual get-together to celebrate with friends and family.
            Come hang out, eat, drink, and spend time together.
          </p>
          <p className="text-white/40 text-sm mt-4 italic">
            The party will be held on the back patio.
          </p>
        </motion.div>

        {/* Food, Drinks, Guests */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-8">
          <DetailCard icon={Utensils} label="Food" delay={0.45}>
            <p className="text-white/80 text-sm leading-relaxed">
              Pizza buffet with some additional options to choose from.
            </p>
          </DetailCard>

          <DetailCard icon={Wine} label="Drinks" delay={0.5}>
            <p className="text-white/80 text-sm leading-relaxed">
              Beer and wine provided.
            </p>
            <p className="text-white/40 text-xs mt-1">
              Cocktails available for purchase.
            </p>
          </DetailCard>

          <DetailCard icon={Users} label="Guests" delay={0.55}>
            <p className="text-white/80 text-sm leading-relaxed">
              Plus ones welcome — just include them in your RSVP.
            </p>
            <p className="text-white/40 text-xs mt-1">
              Kids are welcome too.
            </p>
          </DetailCard>
        </div>

        {/* Parking */}
        <DetailCard icon={Car} label="Parking" delay={0.6}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <p className="text-white/70 text-sm">
              Parking is limited — please carpool if possible.
            </p>
            <p className="text-white/40 text-xs whitespace-nowrap">
              Street parking available nearby.
            </p>
          </div>
        </DetailCard>

        {/* RSVP CTA */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.6, delay: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
          className="mt-16 sm:mt-20 text-center"
        >
          <div className="relative inline-block">
            {/* Decorative lines */}
            <div className="absolute top-1/2 -left-12 w-8 h-px bg-white/10 hidden sm:block" />
            <div className="absolute top-1/2 -right-12 w-8 h-px bg-white/10 hidden sm:block" />

            <p className="text-[10px] tracking-[0.3em] uppercase text-white/30 mb-6">
              Ready to join us?
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <button className="w-full sm:w-auto px-10 py-4 bg-white text-[#0a0a0a] font-medium tracking-[0.1em] uppercase text-sm hover:bg-white/90 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                  RSVP Now
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
                              <Label htmlFor="guests-details" className="text-white/80 text-sm">
                                {formData.attending === "yes" ? "Guest names (separated by commas)" : "Your name"}
                              </Label>
                              <Input
                                id="guests-details"
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
                              <Label htmlFor="allergies-details" className="text-white/80 text-sm">
                                Dietary Restrictions or Allergies
                              </Label>
                              <Textarea
                                id="allergies-details"
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
                        <p className="text-white/60 text-xs sm:text-sm mt-1">Saturday, March 15th, 2026 at 1:00 PM</p>
                        <p className="text-white/50 text-xs sm:text-sm">Local 104, Lake Forest Park, WA</p>
                      </div>
                    )}

                    <div className="flex flex-col gap-2 sm:gap-3">
                      {formData.attending === "yes" && (
                        <button
                          onClick={handleAddToCalendar}
                          className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-primary text-primary-foreground font-medium tracking-wide text-sm hover:bg-primary/80 transition-colors"
                        >
                          <CalendarPlus className="w-4 h-4" />
                          Add to Calendar
                        </button>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsOpen(false);
                          setIsSubmitted(false);
                          setSubmitError(null);
                          setFormData({ guests: "", attending: "", allergies: "" });
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
            <p className="text-white/30 text-xs">
              No deadline — let us know when you can.
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.75 }}
          className="mt-20 sm:mt-28 pt-8 border-t border-white/[0.06] flex items-center justify-between"
        >
          <p className="text-white/25 text-xs tracking-wide">
            Ethan & Amanda · 2026
          </p>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-px bg-white/10"
                style={{ height: `${6 + (i % 3) * 4}px` }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
