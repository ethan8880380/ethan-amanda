"use client";

import { useEffect, useState, useRef } from "react";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { weddingContent as c } from "@/lib/wedding-content";
import { submitWeddingRSVP } from "@/app/wedding/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CalendarPlus, Loader2, Plus, Minus, ArrowUpRight } from "lucide-react";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";

const RED = "#e11d2e";
const ease = [0.22, 1, 0.36, 1] as const;
const springSoft = { type: "spring" as const, stiffness: 120, damping: 16 };
const springBouncy = { type: "spring" as const, stiffness: 260, damping: 14 };
const springPlayful = { type: "spring" as const, stiffness: 380, damping: 18 };

function Reveal({
  children,
  className,
  delay = 0,
  y = 56,
  scale = 1,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  scale?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-12% 0px" });
  const reduce = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={
        reduce
          ? false
          : { opacity: 0, y, scale: scale === 1 ? 0.92 : 0.88, rotate: -1.5 }
      }
      animate={
        isInView ? { opacity: 1, y: 0, scale: 1, rotate: 0 } : undefined
      }
      transition={{ ...springSoft, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ClipReveal({
  children,
  className,
  delay = 0,
  direction = "up",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const initial =
    direction === "left"
      ? { x: "-110%", rotate: -4 }
      : { y: "120%", rotate: 3 };

  return (
    <div ref={ref} className={`overflow-hidden ${className ?? ""}`}>
      <motion.div
        initial={reduce ? false : initial}
        animate={isInView ? { x: 0, y: 0, rotate: 0 } : undefined}
        transition={{ ...springBouncy, delay }}
      >
        {children}
      </motion.div>
    </div>
  );
}

function SplitWords({
  text,
  className,
  delay = 0,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  delay?: number;
  as?: "span" | "h1" | "h2" | "p";
}) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-8% 0px" });
  const reduce = useReducedMotion();
  const words = text.split(" ");

  return (
    <Tag ref={ref as never} className={className}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="inline-block overflow-hidden mr-[0.28em] last:mr-0 align-bottom"
        >
          <motion.span
            className="inline-block"
            initial={
              reduce ? false : { y: "120%", rotate: i % 2 === 0 ? 8 : -8, scale: 0.9 }
            }
            animate={
              isInView ? { y: "0%", rotate: 0, scale: 1 } : undefined
            }
            transition={{ ...springBouncy, delay: delay + i * 0.07 }}
            whileHover={reduce ? undefined : { y: -4, color: RED, transition: springPlayful }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

function SplitLetters({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-5% 0px" });
  const reduce = useReducedMotion();
  const chars = text.split("");

  return (
    <span ref={ref} className={className}>
      {chars.map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          className="inline-block"
          style={{ whiteSpace: char === " " ? "pre" : undefined }}
          initial={
            reduce
              ? false
              : {
                  y: "120%",
                  opacity: 0,
                  rotate: (i % 2 === 0 ? 1 : -1) * (10 + (i % 5) * 2),
                  scale: 0.7,
                }
          }
          animate={
            isInView
              ? { y: "0%", opacity: 1, rotate: 0, scale: 1 }
              : undefined
          }
          transition={{ ...springBouncy, delay: delay + i * 0.045 }}
          whileHover={
            reduce
              ? undefined
              : {
                  y: -10,
                  rotate: (i % 2 === 0 ? 1 : -1) * 8,
                  color: RED,
                  transition: springPlayful,
                }
          }
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}

function FloatingBits() {
  const bits = [
    { top: "18%", left: "8%", size: 8, delay: 0 },
    { top: "32%", left: "88%", size: 12, delay: 0.4 },
    { top: "62%", left: "12%", size: 6, delay: 0.8 },
    { top: "72%", left: "78%", size: 10, delay: 1.2 },
    { top: "48%", left: "92%", size: 5, delay: 0.2 },
  ];

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {bits.map((bit, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-[var(--wedding-red)]"
          style={{
            top: bit.top,
            left: bit.left,
            width: bit.size,
            height: bit.size,
          }}
          animate={{
            y: [0, -18, 0, 12, 0],
            x: [0, 10, -6, 4, 0],
            scale: [1, 1.35, 0.9, 1.2, 1],
            opacity: [0.25, 0.7, 0.35, 0.6, 0.25],
          }}
          transition={{
            duration: 5 + i,
            delay: bit.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function ImageReveal({
  src,
  alt,
  className,
  sizes,
  priority,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-5% 0px" });
  const reduce = useReducedMotion();

  return (
    <div ref={ref} className={`relative h-full w-full overflow-hidden ${className ?? ""}`}>
      <motion.div
        initial={reduce ? false : { clipPath: "inset(100% 0% 0% 0%)" }}
        animate={
          isInView ? { clipPath: "inset(0% 0% 0% 0%)" } : undefined
        }
        transition={{ duration: 1.25, ease }}
        className="absolute inset-0"
      >
        <motion.div
          initial={reduce ? false : { scale: 1.2 }}
          animate={isInView ? { scale: 1 } : undefined}
          transition={{ duration: 1.6, ease }}
          className="absolute inset-0"
        >
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            className="object-cover"
            sizes={sizes}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

function MagneticButton({
  children,
  href,
  className,
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setOffset({ x: x * 0.4, y: y * 0.4 });
  }

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={onMove}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
      animate={{ x: offset.x, y: offset.y }}
      whileHover={{ scale: 1.06, rotate: -1 }}
      whileTap={{ scale: 0.94, rotate: 1 }}
      transition={springPlayful}
      className={className}
    >
      <motion.span
        className="inline-block"
        whileHover={{ letterSpacing: "0.28em" }}
        transition={{ duration: 0.25 }}
      >
        {children}
      </motion.span>
    </motion.a>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#story", label: "Story" },
    { href: "#details", label: "Details" },
    { href: "#travel", label: "Travel" },
    { href: "#registry", label: "Registry" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.5, ease }}
        className="fixed top-0 inset-x-0 z-50"
      >
        <motion.div
          aria-hidden
          initial={false}
          animate={{ opacity: scrolled && !open ? 1 : 0 }}
          transition={{ duration: 0.45, ease }}
          className="pointer-events-none absolute inset-x-0 top-0 h-28 sm:h-32 -z-10"
        >
          <ProgressiveBlur position="top" height="100%" className="z-0" />
        </motion.div>

        <div className="relative mx-auto max-w-[1400px] flex items-center justify-between px-5 sm:px-8 py-4">
          <a
            href="#top"
            className="font-serif text-lg sm:text-xl text-white tracking-tight"
          >
            E<span className="text-white/35 mx-1">×</span>A
          </a>

          <nav className="hidden lg:flex items-center gap-1">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-[11px] tracking-[0.18em] uppercase text-white/50 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <MagneticButton
              href="#rsvp"
              className="hidden sm:inline-flex text-[11px] tracking-[0.18em] uppercase text-white bg-[var(--wedding-red)] px-4 py-2.5 hover:bg-white hover:text-[#0a0a0a] transition-colors"
            >
              RSVP
            </MagneticButton>
            <button
              type="button"
              aria-label="Menu"
              onClick={() => setOpen((v) => !v)}
              className="lg:hidden relative w-10 h-10 flex flex-col items-center justify-center gap-1.5"
            >
              <motion.span
                animate={open ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
                className="block w-5 h-px bg-white origin-center"
              />
              <motion.span
                animate={open ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }}
                className="block w-5 h-px bg-white origin-center"
              />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.7, ease }}
            className="fixed inset-0 z-40 bg-[#0a0a0a] lg:hidden flex flex-col justify-end pb-16 px-6"
          >
            {links.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + 0.07 * i, ease }}
                className="font-serif text-4xl text-white py-3 border-b border-white/10"
              >
                {link.label}
              </motion.a>
            ))}
            <motion.a
              href="#rsvp"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, ease }}
              className="mt-8 inline-flex justify-center bg-[var(--wedding-red)] text-white py-4 text-xs tracking-[0.2em] uppercase"
            >
              RSVP
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "32%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -80]);
  const redGlow = useTransform(scrollYProgress, [0, 0.6], [0.35, 0]);
  const reduce = useReducedMotion();

  return (
    <section
      id="top"
      ref={ref}
      className="relative h-[100svh] min-h-[640px] overflow-hidden bg-[#0a0a0a]"
    >
      <motion.div
        style={reduce ? undefined : { y: imageY, scale: imageScale }}
        className="absolute inset-0"
      >
        <motion.div
          initial={{ scale: 1.35, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2.4, ease }}
          className="absolute inset-0"
        >
          <Image
            src={c.hero.image}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </motion.div>
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-[#0a0a0a]" />
      <motion.div
        style={{ opacity: redGlow }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(225,29,46,0.35),transparent_55%)]"
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,10,10,0.6)_100%)]" />
      <FloatingBits />

      <motion.div
        style={reduce ? undefined : { opacity: contentOpacity, y: contentY }}
        className="relative z-10 h-full flex flex-col justify-end px-5 sm:px-8 pb-10 sm:pb-14 max-w-[1400px] mx-auto w-full"
      >
        <div className="mb-8 sm:mb-10 overflow-hidden">
          <motion.p
            initial={{ y: "100%", opacity: 0, scale: 0.8 }}
            animate={{ y: "0%", opacity: 1, scale: 1 }}
            transition={{ ...springBouncy, delay: 0.25 }}
            className="text-[11px] tracking-[0.35em] uppercase text-[var(--wedding-red)]"
          >
            {c.hero.eyebrow}
          </motion.p>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 lg:gap-12">
          <h1 className="font-serif text-[clamp(3.5rem,12vw,9.5rem)] text-white leading-[0.88] tracking-tight">
            <span className="block overflow-hidden pb-1">
              <SplitLetters text={c.couple.partnerOne} delay={0.4} />
            </span>
            <span className="block overflow-hidden">
              <motion.span
                initial={{ y: "115%", opacity: 0, scale: 0.4, rotate: -20 }}
                animate={{ y: "0%", opacity: 0.28, scale: 1, rotate: 0 }}
                transition={{ ...springBouncy, delay: 0.7 }}
                whileHover={{
                  opacity: 1,
                  color: RED,
                  scale: 1.15,
                  rotate: 12,
                  transition: springPlayful,
                }}
                className="inline-block text-white cursor-default"
              >
                &
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-1">
              <SplitLetters text={c.couple.partnerTwo} delay={0.85} />
            </span>
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 40, filter: "blur(12px)", rotate: 2 }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", rotate: 0 }}
            transition={{ ...springSoft, delay: 1.15 }}
            className="lg:max-w-xs lg:pb-3"
          >
            <p className="text-white/65 text-sm sm:text-base leading-relaxed mb-6">
              {c.hero.subhead}
            </p>
            <p className="text-[11px] tracking-[0.25em] uppercase text-white/90 mb-8">
              {c.date.display}
            </p>
            <div className="flex items-center gap-3">
              <MagneticButton
                href="#rsvp"
                className="inline-flex items-center justify-center bg-[var(--wedding-red)] text-white px-6 py-3.5 text-[11px] tracking-[0.22em] uppercase hover:bg-white hover:text-[#0a0a0a] transition-colors"
              >
                {c.hero.cta}
              </MagneticButton>
              <MagneticButton
                href="#story"
                className="inline-flex items-center justify-center border border-white/25 text-white px-6 py-3.5 text-[11px] tracking-[0.22em] uppercase hover:border-white hover:bg-white/5 transition-colors"
              >
                Our story
              </MagneticButton>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 10, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-10 bg-gradient-to-b from-[var(--wedding-red)] to-transparent"
        />
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="text-[9px] tracking-[0.3em] uppercase text-white/40"
        >
          Scroll
        </motion.span>
      </motion.div>
    </section>
  );
}

function Marquee() {
  const text = `${c.couple.short}  ·  ${c.date.short}  ·  We're getting married  ·  `;
  return (
    <div className="bg-[var(--wedding-red)] text-white overflow-hidden">
      <motion.div
        className="py-2 border-b border-white/15 overflow-hidden"
        initial={{ y: -40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={springBouncy}
      >
        <motion.div
          className="flex whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 22, ease: "linear", repeat: Infinity }}
        >
          {[0, 1].map((copy) => (
            <p
              key={copy}
              className="font-serif text-sm sm:text-base tracking-[0.08em] uppercase px-2"
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} className="inline-flex items-center">
                  {text}
                  <motion.span
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="inline-block mx-1 opacity-70"
                  >
                    ✦
                  </motion.span>
                </span>
              ))}
            </p>
          ))}
        </motion.div>
      </motion.div>
      <div className="py-2 overflow-hidden opacity-70">
        <motion.div
          className="flex whitespace-nowrap"
          animate={{ x: ["-50%", "0%"] }}
          transition={{ duration: 28, ease: "linear", repeat: Infinity }}
        >
          {[0, 1].map((copy) => (
            <p
              key={copy}
              className="font-serif text-xs sm:text-sm tracking-[0.12em] uppercase px-2"
            >
              {Array.from({ length: 10 }).map((_, i) => (
                <span key={i}>{text}</span>
              ))}
            </p>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function Story() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"]);
  const numberX = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);
  const numberRotate = useTransform(scrollYProgress, [0, 1], [0, -6]);
  const reduce = useReducedMotion();

  return (
    <section
      id="story"
      ref={ref}
      className="relative bg-[#f4f1ec] text-[#0a0a0a] py-16 sm:py-24 lg:py-36 overflow-hidden"
    >
      <motion.p
        style={reduce ? undefined : { x: numberX, rotate: numberRotate }}
        className="pointer-events-none absolute top-4 sm:top-0 left-0 font-serif text-[18vw] sm:text-[22vw] lg:text-[28vw] leading-none text-[var(--wedding-red)]/[0.07] select-none"
      >
        01
      </motion.p>

      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-8 lg:items-end">
          {/* Text — first on mobile so content isn't buried under a tall empty image */}
          <div className="lg:col-span-5 lg:col-start-1 order-1 lg:order-1 lg:pb-16">
            <ClipReveal>
              <p className="text-[11px] tracking-[0.3em] uppercase text-[var(--wedding-red)] mb-4 sm:mb-5">
                {c.story.eyebrow}
              </p>
            </ClipReveal>
            <SplitWords
              as="h2"
              text={c.story.title}
              delay={0.08}
              className="font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05] mb-5 sm:mb-8"
            />
            <Reveal
              delay={0.15}
              y={28}
              className="space-y-4 sm:space-y-5 text-[#0a0a0a]/65 leading-relaxed max-w-md"
            >
              {c.story.paragraphs.map((p, i) => (
                <motion.p
                  key={p}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.7, ease }}
                >
                  {p}
                </motion.p>
              ))}
            </Reveal>
          </div>

          {/* Image — shorter on mobile, full portrait on desktop */}
          <div className="lg:col-span-6 lg:col-start-7 order-2 lg:order-2">
            <div className="relative w-full aspect-[4/3] sm:aspect-[3/4] lg:aspect-[4/5] max-h-[55vh] lg:max-h-none overflow-hidden bg-[#e8e4dc]">
              <motion.div
                style={reduce ? undefined : { y: imageY }}
                className="absolute inset-0 lg:inset-[-12%]"
              >
                <ImageReveal
                  src={c.story.image}
                  alt={c.couple.short}
                  className="absolute inset-0"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Details() {
  const venues = c.venue.sameLocation
    ? [{ ...c.venue.ceremony, label: "Ceremony & Reception" }]
    : [
        { ...c.venue.ceremony, label: "Ceremony" },
        { ...c.venue.reception, label: "Reception" },
      ];

  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const lineHeight = useTransform(scrollYProgress, [0.15, 0.7], ["0%", "100%"]);

  return (
    <section
      id="details"
      ref={sectionRef}
      className="bg-[#0a0a0a] text-white py-28 sm:py-36"
    >
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16 sm:mb-24">
          <div>
            <ClipReveal>
              <p className="text-[11px] tracking-[0.3em] uppercase text-[var(--wedding-red)] mb-5">
                {c.schedule.eyebrow}
              </p>
            </ClipReveal>
            <SplitWords
              as="h2"
              text={c.schedule.title}
              delay={0.08}
              className="font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight"
            />
          </div>
          <Reveal delay={0.15}>
            <p className="text-[11px] tracking-[0.22em] uppercase text-white/40">
              {c.date.display} · {c.date.time}
            </p>
          </Reveal>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-7 relative">
            <div className="absolute left-[4.5rem] sm:left-[6rem] top-0 bottom-0 w-px bg-white/10 hidden sm:block" />
            <motion.div
              style={{ height: lineHeight }}
              className="absolute left-[4.5rem] sm:left-[6rem] top-0 w-px bg-[var(--wedding-red)] origin-top hidden sm:block"
            />
            {c.schedule.items.map((item, i) => (
              <TimelineItem
                key={item.title}
                item={item}
                index={i}
                isActive={active === i}
                onEnter={() => setActive(i)}
              />
            ))}
          </div>

          <div className="lg:col-span-5 lg:sticky lg:top-28 self-start space-y-12">
            {venues.map((venue, i) => (
              <Reveal key={venue.label} delay={0.1 + i * 0.12} scale={0.96}>
                <motion.div
                  whileHover={{ x: 6 }}
                  transition={springSoft}
                  className="group"
                >
                  <div className="flex items-baseline justify-between gap-4 mb-4">
                    <p className="text-[11px] tracking-[0.28em] uppercase text-[var(--wedding-red)]">
                      {venue.label}
                    </p>
                    <span className="font-serif text-3xl text-white/15 group-hover:text-[var(--wedding-red)]/40 transition-colors">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="font-serif text-3xl sm:text-4xl tracking-tight mb-4">
                    {venue.name}
                  </h3>
                  <p className="text-white/55 text-sm leading-relaxed">
                    {venue.address}
                    <br />
                    {venue.city}
                  </p>
                  <p className="text-white/35 text-sm leading-relaxed mt-4 mb-6">
                    {venue.notes}
                  </p>
                  <a
                    href={venue.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-white hover:text-[var(--wedding-red)] transition-colors"
                  >
                    View map
                    <ArrowUpRight className="size-3.5" />
                  </a>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TimelineItem({
  item,
  index,
  isActive,
  onEnter,
}: {
  item: (typeof c.schedule.items)[number];
  index: number;
  isActive: boolean;
  onEnter: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { margin: "-40% 0px -40% 0px" });

  useEffect(() => {
    if (isInView) onEnter();
  }, [isInView, onEnter]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -40, rotate: -2 }}
      whileInView={{ opacity: 1, x: 0, rotate: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ ...springBouncy, delay: index * 0.08 }}
      className="grid grid-cols-[4.5rem_1fr] sm:grid-cols-[6rem_1fr] gap-4 sm:gap-8 py-7 sm:py-8 border-t border-white/10 relative"
    >
      <motion.div
        animate={{
          scale: isActive ? 1 : 0.55,
          backgroundColor: isActive ? RED : "rgba(255,255,255,0.2)",
          boxShadow: isActive
            ? "0 0 0 6px rgba(225,29,46,0.25)"
            : "0 0 0 0px rgba(225,29,46,0)",
        }}
        transition={springPlayful}
        className="absolute left-[4.5rem] sm:left-[6rem] top-8 -translate-x-1/2 w-2.5 h-2.5 rounded-full hidden sm:block z-10"
      >
        {isActive && (
          <motion.span
            className="absolute inset-0 rounded-full bg-[var(--wedding-red)]"
            animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
          />
        )}
      </motion.div>
      <motion.p
        animate={{
          color: isActive ? RED : "rgba(255,255,255,0.35)",
          x: isActive ? 4 : 0,
        }}
        className="text-xs sm:text-sm tracking-[0.12em] pt-1"
      >
        {item.time}
      </motion.p>
      <div>
        <motion.h3
          animate={{
            color: isActive ? "#ffffff" : "rgba(255,255,255,0.45)",
            x: isActive ? 8 : 0,
            scale: isActive ? 1.02 : 1,
          }}
          transition={springSoft}
          className="font-serif text-2xl sm:text-3xl tracking-tight mb-2 origin-left"
        >
          {item.title}
        </motion.h3>
        <motion.p
          animate={{
            opacity: isActive ? 1 : 0.4,
            y: isActive ? 0 : 6,
            height: "auto",
          }}
          className="text-white/40 text-sm leading-relaxed max-w-md"
        >
          {item.description}
        </motion.p>
      </div>
    </motion.div>
  );
}

function Gallery() {
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start end", "end start"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["12%", "-48%"]);
  const rotate = useTransform(scrollYProgress, [0, 1], [3, -3]);
  const skew = useTransform(scrollYProgress, [0, 0.5, 1], [2, 0, -2]);

  return (
    <section
      ref={trackRef}
      className="bg-[#0a0a0a] py-16 sm:py-24 overflow-hidden"
      aria-label="Gallery"
    >
      <motion.div
        style={{ x, rotate, skewX: skew }}
        className="flex gap-3 sm:gap-4 w-max px-5"
      >
        {c.gallery.map((src, i) => (
          <motion.div
            key={src}
            initial={{ opacity: 0, y: 60, rotate: i % 2 === 0 ? -6 : 6 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ ...springBouncy, delay: i * 0.1 }}
            whileHover={{
              scale: 1.04,
              y: -16,
              rotate: i % 2 === 0 ? -3 : 3,
              zIndex: 10,
              transition: springPlayful,
            }}
            className={`relative shrink-0 overflow-hidden cursor-pointer ${
              i % 2 === 0
                ? "w-[58vw] sm:w-[34vw] lg:w-[22vw] aspect-[3/4]"
                : "w-[50vw] sm:w-[28vw] lg:w-[18vw] aspect-[4/5] mt-10 sm:mt-16"
            }`}
          >
            <motion.div
              className="absolute inset-0"
              whileHover={{ scale: 1.12 }}
              transition={{ duration: 0.6, ease }}
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes="30vw"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              className="absolute inset-0 bg-[var(--wedding-red)]/25 mix-blend-multiply"
            />
            <motion.div
              initial={{ y: "100%" }}
              whileHover={{ y: "0%" }}
              transition={springSoft}
              className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent"
            >
              <p className="text-[10px] tracking-[0.25em] uppercase text-white/80">
                0{i + 1} / 0{c.gallery.length}
              </p>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

function Travel() {
  return (
    <section id="travel" className="bg-[#f4f1ec] text-[#0a0a0a] py-28 sm:py-36">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="grid lg:grid-cols-12 gap-12 mb-16">
          <div className="lg:col-span-5">
            <ClipReveal>
              <p className="text-[11px] tracking-[0.3em] uppercase text-[var(--wedding-red)] mb-5">
                {c.travel.eyebrow}
              </p>
            </ClipReveal>
            <SplitWords
              as="h2"
              text={c.travel.title}
              delay={0.08}
              className="font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight"
            />
          </div>
          <Reveal delay={0.12} className="lg:col-span-5 lg:col-start-8 lg:pt-10">
            <p className="text-[#0a0a0a]/60 leading-relaxed">{c.travel.intro}</p>
          </Reveal>
        </div>

        <div className="grid sm:grid-cols-2 gap-px bg-[#0a0a0a]/10">
          {c.travel.hotels.map((hotel, i) => (
            <Reveal key={hotel.name} delay={i * 0.1}>
              <motion.a
                href={hotel.url}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={springPlayful}
                className="group block bg-[#f4f1ec] p-8 sm:p-10 h-full hover:bg-[#0a0a0a] transition-colors duration-500"
              >
                <div className="flex items-start justify-between gap-4 mb-8">
                  <motion.span
                    whileHover={{ rotate: -12, scale: 1.1 }}
                    className="font-serif text-5xl text-[var(--wedding-red)]/20 group-hover:text-[var(--wedding-red)]/50 transition-colors inline-block"
                  >
                    0{i + 1}
                  </motion.span>
                  <motion.span
                    animate={{ rotate: [0, 0] }}
                    whileHover={{ rotate: 45, scale: 1.2 }}
                    transition={springPlayful}
                    className="inline-flex"
                  >
                    <ArrowUpRight className="size-5 text-[#0a0a0a]/30 group-hover:text-[var(--wedding-red)] transition-colors" />
                  </motion.span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl tracking-tight mb-3 group-hover:text-white transition-colors">
                  {hotel.name}
                </h3>
                <p className="text-sm text-[#0a0a0a]/55 group-hover:text-white/50 leading-relaxed transition-colors">
                  {hotel.detail}
                </p>
              </motion.a>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 pt-8 border-t border-[#0a0a0a]/10">
          <p className="text-[11px] tracking-[0.25em] uppercase text-[var(--wedding-red)] mb-2">
            Parking
          </p>
          <p className="text-sm text-[#0a0a0a]/65 max-w-xl">{c.travel.parking}</p>
        </Reveal>
      </div>
    </section>
  );
}

function HoneymoonFundButton({
  href,
  label,
  index,
}: {
  href: string;
  label: string;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);
  const reduce = useReducedMotion();
  const letters = label.split("");
  const sparkles = [
    { x: -40, y: -28, delay: 0, emoji: "✈" },
    { x: 50, y: -36, delay: 0.05, emoji: "☀" },
    { x: -55, y: 18, delay: 0.1, emoji: "✦" },
    { x: 60, y: 22, delay: 0.08, emoji: "♥" },
    { x: 0, y: -48, delay: 0.12, emoji: "🌴" },
    { x: -20, y: 36, delay: 0.15, emoji: "✦" },
    { x: 30, y: 40, delay: 0.18, emoji: "🍹" },
    { x: 70, y: -10, delay: 0.07, emoji: "✦" },
  ];

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 28, rotate: -2, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ ...springBouncy, delay: 0.1 + index * 0.1 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={
        reduce
          ? undefined
          : {
              scale: 1.04,
              transition: springPlayful,
            }
      }
      whileTap={{ scale: 0.95, rotate: 2 }}
      className="group relative flex items-center justify-between gap-4 border-2 border-[var(--wedding-red)]/50 px-6 py-5 overflow-visible"
      style={{
        backgroundColor: hovered ? RED : "transparent",
        boxShadow: hovered
          ? "0 0 36px 6px rgba(225,29,46,0.4)"
          : "0 0 0 0 rgba(225,29,46,0)",
        transition: "background-color 0.25s ease, box-shadow 0.4s ease",
      }}
    >
      <motion.span
        aria-hidden
        className="absolute inset-0 border-2 border-[var(--wedding-red)] pointer-events-none"
        animate={
          reduce || hovered
            ? { opacity: 0, scale: 1 }
            : { opacity: [0.35, 0.9, 0.35], scale: [1, 1.015, 1] }
        }
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />

      <AnimatePresence>
        {hovered &&
          !reduce &&
          sparkles.map((s, i) => (
            <motion.span
              key={i}
              aria-hidden
              className="absolute left-1/2 top-1/2 text-sm pointer-events-none z-20"
              initial={{ x: 0, y: 0, opacity: 0, scale: 0, rotate: 0 }}
              animate={{
                x: s.x,
                y: s.y,
                opacity: [0, 1, 1, 0],
                scale: [0, 1.4, 1, 0.6],
                rotate: [0, (i % 2 === 0 ? 1 : -1) * 40],
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.85, delay: s.delay, ease: "easeOut" }}
            >
              {s.emoji}
            </motion.span>
          ))}
      </AnimatePresence>

      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <motion.span
          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
          animate={hovered ? { left: ["-40%", "120%"] } : { left: "-40%" }}
          transition={
            hovered
              ? {
                  duration: 0.7,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 0.4,
                }
              : { duration: 0.2 }
          }
        />
      </motion.span>

      <span className="relative flex items-center gap-4 z-10">
        <motion.span
          animate={
            hovered
              ? { rotate: [0, 360], scale: [1, 1.4, 1] }
              : { rotate: 0, scale: 1 }
          }
          transition={
            hovered
              ? {
                  rotate: { duration: 0.6, ease: "easeOut" },
                  scale: { duration: 0.55, ease: "easeInOut" },
                }
              : { duration: 0.25 }
          }
          className="text-[11px] tracking-[0.2em] text-[var(--wedding-red)] group-hover:text-white inline-block"
        >
          0{index + 1}
        </motion.span>
        <span className="font-serif text-xl sm:text-2xl tracking-tight flex">
          {letters.map((char, i) => (
            <motion.span
              key={`${char}-${i}`}
              className="inline-block"
              style={{ whiteSpace: char === " " ? "pre" : undefined }}
              animate={
                hovered && !reduce
                  ? {
                      y: [0, -14, 0],
                      rotate: [0, (i % 2 === 0 ? 1 : -1) * 12, 0],
                    }
                  : { y: 0, rotate: 0 }
              }
              transition={{
                duration: 0.45,
                delay: i * 0.03,
                ease: "easeInOut",
              }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </span>
      </span>

      <motion.span
        animate={
          hovered
            ? {
                rotate: [0, 20, -10, 45],
                scale: [1, 1.4, 1.2],
                x: [0, 4, 0],
              }
            : { rotate: 0, scale: 1, x: 0 }
        }
        transition={{ duration: 0.55, ease: "easeInOut" }}
        className="relative z-10 inline-flex"
      >
        <ArrowUpRight className="size-5 text-[var(--wedding-red)] group-hover:text-white" />
      </motion.span>
    </motion.a>
  );
}

function Registry() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const bgScale = useTransform(scrollYProgress, [0, 1], [0.9, 1.15]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.4, 0.8], [0, 0.06, 0.02]);

  return (
    <section
      id="registry"
      ref={ref}
      className="relative bg-[#0a0a0a] text-white py-28 sm:py-36 overflow-hidden"
    >
      <motion.div
        aria-hidden
        style={{ scale: bgScale, opacity: bgOpacity }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <p className="font-serif text-[22vw] leading-none text-white select-none whitespace-nowrap">
          GIFTS
        </p>
      </motion.div>

      <div className="relative mx-auto max-w-[900px] px-5 sm:px-8 text-center">
        <ClipReveal>
          <p className="text-[11px] tracking-[0.3em] uppercase text-[var(--wedding-red)] mb-5">
            {c.registry.eyebrow}
          </p>
        </ClipReveal>
        <SplitWords
          as="h2"
          text={c.registry.title}
          delay={0.08}
          className="font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight mb-6"
        />
        <Reveal delay={0.15}>
          <p className="text-white/50 leading-relaxed mb-12 max-w-md mx-auto">
            {c.registry.intro}
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="flex flex-col gap-3">
            {c.registry.links.map((link, i) =>
              /honeymoon/i.test(link.label) ? (
                <HoneymoonFundButton
                  key={link.label}
                  href={link.url}
                  label={link.label}
                  index={i}
                />
              ) : (
                <motion.a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 28, rotate: -1 }}
                  whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ ...springBouncy, delay: 0.1 + i * 0.1 }}
                  whileHover={{
                    x: 12,
                    scale: 1.02,
                    borderColor: RED,
                    transition: springPlayful,
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="group flex items-center justify-between gap-4 border border-white/15 px-6 py-5 hover:bg-[var(--wedding-red)] hover:border-[var(--wedding-red)] transition-colors duration-400"
                >
                  <span className="flex items-center gap-4">
                    <motion.span
                      whileHover={{ scale: 1.3, rotate: 12 }}
                      className="text-[11px] tracking-[0.2em] text-white/30 group-hover:text-white/60 inline-block"
                    >
                      0{i + 1}
                    </motion.span>
                    <span className="font-serif text-xl sm:text-2xl tracking-tight">
                      {link.label}
                    </span>
                  </span>
                  <motion.span
                    whileHover={{ rotate: 45, scale: 1.25 }}
                    transition={springPlayful}
                    className="inline-flex"
                  >
                    <ArrowUpRight className="size-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                  </motion.span>
                </motion.a>
              )
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-[#f4f1ec] text-[#0a0a0a] py-28 sm:py-36">
      <div className="mx-auto max-w-[900px] px-5 sm:px-8">
        <div className="mb-14 sm:mb-16">
          <ClipReveal>
            <p className="text-[11px] tracking-[0.3em] uppercase text-[var(--wedding-red)] mb-5">
              {c.faq.eyebrow}
            </p>
          </ClipReveal>
          <SplitWords
            as="h2"
            text={c.faq.title}
            delay={0.08}
            className="font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight"
          />
        </div>

        <div>
          {c.faq.items.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <Reveal key={item.question} delay={i * 0.05}>
                <div className="border-t border-[#0a0a0a]/12">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-6 py-6 text-left group"
                  >
                    <span className="font-serif text-xl sm:text-2xl tracking-tight pr-4 group-hover:text-[var(--wedding-red)] transition-colors">
                      {item.question}
                    </span>
                    <motion.span
                      animate={{
                        rotate: isOpen ? 180 : 0,
                        scale: isOpen ? 1.1 : 1,
                        backgroundColor: isOpen ? RED : "transparent",
                        borderColor: isOpen ? RED : "rgba(10,10,10,0.2)",
                        color: isOpen ? "#fff" : "#0a0a0a",
                      }}
                      whileHover={{ scale: 1.15, rotate: isOpen ? 180 : 90 }}
                      transition={springPlayful}
                      className="shrink-0 w-9 h-9 border flex items-center justify-center"
                    >
                      {isOpen ? (
                        <Minus className="size-3.5" />
                      ) : (
                        <Plus className="size-3.5" />
                      )}
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, y: -8 }}
                        animate={{ height: "auto", opacity: 1, y: 0 }}
                        exit={{ height: 0, opacity: 0, y: -8 }}
                        transition={springSoft}
                        className="overflow-hidden"
                      >
                        <p className="pb-7 text-[#0a0a0a]/60 text-sm sm:text-base leading-relaxed max-w-xl">
                          {item.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
          <div className="border-t border-[#0a0a0a]/12" />
        </div>
      </div>
    </section>
  );
}

function RSVP() {
  const [attending, setAttending] = useState<"yes" | "no" | "">("");
  const [guests, setGuests] = useState("");
  const [allergies, setAllergies] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<"yes" | "no" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!attending || !guests.trim()) {
      setError("Please fill in your name and whether you can attend.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const res = await submitWeddingRSVP({
      attending,
      guests: guests.trim(),
      allergies: allergies.trim(),
      email: email.trim(),
    });

    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error || "Something went wrong. Please try again.");
      return;
    }

    setResult(attending);
  }

  return (
    <section id="rsvp" className="bg-[#0a0a0a] text-white py-28 sm:py-36 relative overflow-hidden">
      <motion.div
        aria-hidden
        className="absolute -right-20 top-1/4 w-[40vw] h-[40vw] rounded-full bg-[var(--wedding-red)]/10 blur-[120px] pointer-events-none"
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8 grid lg:grid-cols-12 gap-12 lg:gap-20">
        <div className="lg:col-span-5">
          <ClipReveal>
            <p className="text-[11px] tracking-[0.3em] uppercase text-[var(--wedding-red)] mb-5">
              {c.rsvp.eyebrow}
            </p>
          </ClipReveal>
          <SplitWords
            as="h2"
            text={c.rsvp.title}
            delay={0.08}
            className="font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight mb-6"
          />
          <Reveal delay={0.2}>
            <p className="text-white/50 leading-relaxed mb-4 max-w-sm">
              {c.rsvp.intro}
            </p>
            <p className="text-[11px] tracking-[0.2em] uppercase text-white/35">
              {c.rsvp.deadline}
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.12} className="lg:col-span-6 lg:col-start-7">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8, rotate: -4, filter: "blur(12px)" }}
                animate={{ opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={springBouncy}
                className="py-8 relative"
              >
                <motion.div
                  aria-hidden
                  className="absolute -inset-8 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {[...Array(8)].map((_, i) => (
                    <motion.span
                      key={i}
                      className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full bg-[var(--wedding-red)]"
                      initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                      animate={{
                        x: Math.cos((i / 8) * Math.PI * 2) * 80,
                        y: Math.sin((i / 8) * Math.PI * 2) * 60,
                        opacity: [1, 0],
                        scale: [0, 1.4, 0],
                      }}
                      transition={{ duration: 1.1, delay: 0.1 + i * 0.04, ease }}
                    />
                  ))}
                </motion.div>
                <motion.p
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  transition={springBouncy}
                  className="font-serif text-3xl sm:text-4xl tracking-tight mb-6"
                >
                  {result === "yes" ? c.rsvp.successYes : c.rsvp.successNo}
                </motion.p>
                {result === "yes" && (
                  <motion.a
                    href="/wedding/calendar"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...springSoft, delay: 0.25 }}
                    whileHover={{ x: 6, color: "#fff" }}
                    className="inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-[var(--wedding-red)]"
                  >
                    <CalendarPlus className="size-3.5" />
                    Add to calendar
                  </motion.a>
                )}
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="space-y-2">
                  <Label
                    htmlFor="guests"
                    className="text-white/50 text-[11px] tracking-[0.15em] uppercase"
                  >
                    Guest name(s)
                  </Label>
                  <Input
                    id="guests"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    placeholder="e.g. Alex Smith, Jordan Lee"
                    className="bg-transparent border-0 border-b border-white/20 rounded-none px-0 h-12 text-white placeholder:text-white/25 focus-visible:border-[var(--wedding-red)] focus-visible:ring-0"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-white/50 text-[11px] tracking-[0.15em] uppercase"
                  >
                    Email <span className="text-white/25">(optional)</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="bg-transparent border-0 border-b border-white/20 rounded-none px-0 h-12 text-white placeholder:text-white/25 focus-visible:border-[var(--wedding-red)] focus-visible:ring-0"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <Label className="text-white/50 text-[11px] tracking-[0.15em] uppercase">
                    Will you attend?
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(
                      [
                        { value: "yes", label: "Joyfully accept" },
                        { value: "no", label: "Regretfully decline" },
                      ] as const
                    ).map((opt) => (
                      <motion.button
                        key={opt.value}
                        type="button"
                        onClick={() => setAttending(opt.value)}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        animate={
                          attending === opt.value
                            ? { scale: [1, 1.04, 1] }
                            : { scale: 1 }
                        }
                        transition={
                          attending === opt.value
                            ? { duration: 0.35, ease: "easeInOut" }
                            : springPlayful
                        }
                        className={`px-4 py-4 text-[11px] tracking-[0.15em] uppercase border transition-colors duration-300 ${
                          attending === opt.value
                            ? "bg-[var(--wedding-red)] text-white border-[var(--wedding-red)]"
                            : "border-white/20 text-white/60 hover:border-white/50"
                        }`}
                      >
                        {opt.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <AnimatePresence>
                  {attending === "yes" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.35, ease }}
                      className="space-y-2 overflow-hidden"
                    >
                      <Label
                        htmlFor="allergies"
                        className="text-white/50 text-[11px] tracking-[0.15em] uppercase"
                      >
                        Dietary notes{" "}
                        <span className="text-white/25">(optional)</span>
                      </Label>
                      <Textarea
                        id="allergies"
                        value={allergies}
                        onChange={(e) => setAllergies(e.target.value)}
                        placeholder="Allergies, restrictions, etc."
                        className="bg-transparent border border-white/20 rounded-none text-white placeholder:text-white/25 min-h-[96px] focus-visible:border-[var(--wedding-red)] focus-visible:ring-0"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 bg-[var(--wedding-red)] text-white hover:bg-white hover:text-[#0a0a0a] text-[11px] tracking-[0.25em] uppercase rounded-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    "Send RSVP"
                  )}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [80, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [0.3, 1]);

  return (
    <footer
      ref={ref}
      className="bg-[#0a0a0a] text-white border-t border-white/5 py-20 sm:py-28 overflow-hidden"
    >
      <motion.div
        style={{ y, scale, opacity }}
        className="mx-auto max-w-[1400px] px-5 sm:px-8"
      >
        <p className="text-[11px] tracking-[0.3em] uppercase text-[var(--wedding-red)] mb-6">
          {c.footer.note}
        </p>
        <h2 className="font-serif text-[clamp(3rem,10vw,8rem)] tracking-tight leading-[0.9] mb-12">
          <SplitLetters text={c.couple.partnerOne} delay={0} />
          <motion.span
            className="inline-block text-[var(--wedding-red)] mx-2 sm:mx-4"
            animate={{ rotate: [0, 12, -8, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          >
            &
          </motion.span>
          <SplitLetters text={c.couple.partnerTwo} delay={0.2} />
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <p className="text-[11px] tracking-[0.25em] uppercase text-white/30">
            {c.date.short} · {c.footer.year}
          </p>
          <Link
            href="/engagement-party"
            className="text-[11px] tracking-[0.2em] uppercase text-white/25 hover:text-[var(--wedding-red)] transition-colors"
          >
            Engagement party →
          </Link>
        </div>
      </motion.div>
    </footer>
  );
}

function ProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[2px] bg-[var(--wedding-red)] origin-left z-[60]"
    />
  );
}

export function WeddingSite() {
  return (
    <div
      className="bg-[#0a0a0a] min-h-screen selection:bg-[var(--wedding-red)] selection:text-white"
      style={{ ["--wedding-red" as string]: RED }}
    >
      <ProgressBar />
      <Nav />
      <Hero />
      <Marquee />
      <Story />
      <Details />
      <Gallery />
      <Travel />
      <Registry />
      <FAQ />
      <RSVP />
      <Footer />
    </div>
  );
}
