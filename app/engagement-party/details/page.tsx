"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, MapPin, Clock, Utensils, Wine, Users, Car, MessageCircle } from "lucide-react";

interface SectionProps {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  delay?: number;
}

function Section({ icon: Icon, title, children, delay = 0 }: SectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="mb-10"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-red-700/20 rounded-lg">
          <Icon className="w-5 h-5 text-red-500" />
        </div>
        <h2 className="text-xl font-medium text-white">{title}</h2>
      </div>
      <div className="pl-12 text-white/70 space-y-3">
        {children}
      </div>
    </motion.div>
  );
}

export default function DetailsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Subtle grain texture */}
      <div 
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-2xl mx-auto px-6 py-12 sm:py-16">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link 
            href="/engagement-party"
            className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-10"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <p className="text-xs tracking-[0.3em] text-red-700 mb-3 uppercase">
            Engagement Party
          </p>
          <h1 className="text-4xl sm:text-5xl font-medium text-white mb-4">
            Event Details
          </h1>
          <div className="w-16 h-px bg-red-700/40" />
        </motion.div>

        {/* What */}
        <Section icon={Utensils} title="What" delay={0.1}>
          <p className="text-white text-lg">Ethan & Amanda's Engagement Party</p>
        </Section>

        {/* When */}
        <Section icon={Clock} title="When" delay={0.15}>
          <p className="text-white text-lg">Saturday, March 15th, 2026</p>
          <p>1:00 PM</p>
        </Section>

        {/* Where */}
        <Section icon={MapPin} title="Where" delay={0.2}>
          <p className="text-white text-lg">Local 104</p>
          <p>18498 Ballinger Way NE, Lake Forest Park, WA 98155</p>
          <p className="text-white/50 text-sm mt-2 italic">
            The party will be held on the back patio.
          </p>
        </Section>

        {/* What to Expect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
          className="mb-10 p-6 bg-[#151515] border border-[#2a2a2a]"
        >
          <h2 className="text-xl font-medium text-white mb-3">What to Expect</h2>
          <p className="text-white/70 leading-relaxed">
            This will be a casual get-together to celebrate with friends and family.
            Come hang out, eat, drink, and spend time together.
          </p>
        </motion.div>

        {/* Food & Drinks */}
        <Section icon={Wine} title="Food & Drinks" delay={0.3}>
          <div className="space-y-4">
            <div>
              <p className="text-white font-medium mb-1">Food</p>
              <p>Mostly pizza buffet with some additional options.</p>
            </div>
            <div>
              <p className="text-white font-medium mb-1">Drinks</p>
              <p>Beer and wine will be provided.</p>
              <p className="text-white/50 text-sm">
                Cocktails will be available for purchase if you'd like something else.
              </p>
            </div>
          </div>
        </Section>

        {/* Guests */}
        <Section icon={Users} title="Guests" delay={0.35}>
          <div className="space-y-4">
            <div>
              <p className="text-white font-medium mb-1">Plus Ones</p>
              <p>Bring a guest — or guests — as many as you'd like. Just include them in your RSVP.</p>
            </div>
            <div>
              <p className="text-white font-medium mb-1">Kids</p>
              <p>Kids are welcome.</p>
            </div>
          </div>
        </Section>

        {/* RSVP */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          className="mb-10 p-6 bg-red-700/10 border border-red-700/20"
        >
          <h2 className="text-xl font-medium text-white mb-3">RSVP</h2>
          <p className="text-white/70">
            No RSVP deadline — just let us know if you're coming when you can.
          </p>
          <Link 
            href="/engagement-party"
            className="inline-block mt-4 px-6 py-2.5 bg-white text-red-700 font-medium tracking-wide uppercase text-sm hover:bg-white/90 transition-colors"
          >
            RSVP Now
          </Link>
        </motion.div>

        {/* Parking */}
        <Section icon={Car} title="Parking" delay={0.45}>
          <p>Parking is limited.</p>
          <p className="text-white">If possible, please carpool.</p>
          <p className="text-white/50 text-sm">There is some street parking available nearby.</p>
        </Section>

        {/* Questions */}
        <Section icon={MessageCircle} title="Questions" delay={0.5}>
          <p>If you have any questions, contact either of us.</p>
        </Section>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="mt-16 pt-8 border-t border-white/10"
        >
          <p className="text-white/40 text-sm italic">
            Ethan & Amanda
          </p>
        </motion.div>
      </div>
    </div>
  );
}
