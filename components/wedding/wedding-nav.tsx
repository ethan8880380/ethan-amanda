"use client";

import { useEffect, useState, type ReactElement } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { weddingContent } from "@/lib/wedding-content";
import { useHasWeddingRsvp } from "@/hooks/use-wedding-rsvp-session";
import { cn } from "@/lib/utils";
import { RegistryRsvpGate } from "./registry-rsvp-gate";

interface NavSection {
  id: string;
  label: string;
  shortLabel?: string;
  /** Show in the mobile thumb bar (space is limited). */
  isPrimary: boolean;
}

const sections: NavSection[] = [
  { id: "day", label: "The Day", shortLabel: "Day", isPrimary: true },
  { id: "travel", label: "Travel", isPrimary: true },
  { id: "registry", label: "Registry", isPrimary: true },
  { id: "faq", label: "Q&A", isPrimary: false },
];

const allIds = [...sections.map((s) => s.id), "rsvp"];

function sectionHref(id: string, pathname: string) {
  if (id === "registry") return weddingContent.registry.url;
  return pathname === "/wedding" ? `#${id}` : `/wedding#${id}`;
}

export function WeddingNav() {
  const pathname = usePathname();
  const isRegistryPage = pathname === "/wedding/registry";
  const isPastHero = useIsPastHero(pathname);
  const observedId = useActiveSection(allIds, pathname);
  const activeId = isRegistryPage ? "registry" : observedId;
  const hasRsvp = useHasWeddingRsvp();
  const shouldReduceMotion = useReducedMotion();
  const { registry, hero } = weddingContent;

  const cta = getPersistentCta({
    hasRsvp,
    isRegistryPage,
    pathname,
    rsvpLabel: hero.cta,
    registry,
  });

  return (
    <>
      {/* Desktop masthead */}
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 hidden h-20 border-b px-10 transition-colors duration-500 md:block",
          isPastHero
            ? "border-ink/[0.07] bg-paper/[0.97] backdrop-blur-xl"
            : "border-transparent bg-paper"
        )}
      >
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between">
          <a
            href={pathname === "/wedding" ? "#top" : "/wedding"}
            className="font-wedding-serif text-[1.625rem] leading-none text-ink outline-none focus-visible:ring-2 focus-visible:ring-blood focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
          >
            {weddingContent.couple.partnerOne}{" "}
            <span className="italic text-blood">&amp;</span>{" "}
            {weddingContent.couple.partnerTwo}
          </a>

          <div className="flex items-center gap-6">
          <nav aria-label="Primary" className="flex items-center gap-1">
            {sections.map((section) => {
              const href = sectionHref(section.id, pathname);
              const isExternal = href.startsWith("http");
              const link = (
                <a
                  key={section.id}
                  href={href}
                  {...(isExternal
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  aria-current={
                    !isExternal && activeId === section.id
                      ? "location"
                      : undefined
                  }
                  className={cn(
                    "group relative flex h-10 items-center rounded-full px-4 text-[0.9375rem] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blood",
                    !isExternal && activeId === section.id
                      ? "text-ink"
                      : "text-ink/55 hover:text-ink"
                  )}
                >
                  {section.label}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-4 bottom-1.5 h-px origin-center bg-current transition-transform duration-300",
                      !isExternal && activeId === section.id
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    )}
                  />
                </a>
              );
              return withRegistryGate(section.id, link);
            })}
          </nav>

          <a
            href={cta.href}
            {...(cta.external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className="inline-flex h-11 items-center rounded-full bg-ink px-7 text-[0.9375rem] font-medium text-paper transition-colors hover:bg-blood outline-none focus-visible:ring-2 focus-visible:ring-blood focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          >
            {cta.label}
          </a>
          </div>
        </div>
      </header>

      {/* Mobile thumb bar */}
      <AnimatePresence>
        {isPastHero && (
          <motion.nav
            aria-label="Primary"
            initial={{ y: shouldReduceMotion ? 0 : 72, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: shouldReduceMotion ? 0 : 72, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-40 rounded-full border border-ink/[0.07] bg-paper/90 p-1.5 shadow-[0_12px_40px_-12px_rgb(24_20_21/0.35)] backdrop-blur-xl md:hidden"
          >
            <div className="flex h-12 items-stretch">
              {sections
                .filter((section) => section.isPrimary)
                .map((section) => {
                  const href = sectionHref(section.id, pathname);
                  const isExternal = href.startsWith("http");
                  const link = (
                    <a
                      key={section.id}
                      href={href}
                      {...(isExternal
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      aria-current={
                        !isExternal && activeId === section.id
                          ? "location"
                          : undefined
                      }
                      className={cn(
                        "relative flex flex-1 items-center justify-center rounded-full text-sm transition-colors outline-none focus-visible:bg-ink/5",
                        !isExternal && activeId === section.id
                          ? "text-ink"
                          : "text-ink/55 active:text-ink"
                      )}
                    >
                      {section.shortLabel ?? section.label}
                      {!isExternal && activeId === section.id && (
                        <motion.span
                          layoutId="wedding-nav-dot"
                          aria-hidden
                          className="absolute bottom-1 size-1 rounded-full bg-blood"
                          transition={{
                            duration: 0.35,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        />
                      )}
                    </a>
                  );
                  return withRegistryGate(section.id, link);
                })}
              <a
                href={cta.href}
                {...(cta.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="flex min-w-[5.5rem] items-center justify-center rounded-full bg-ink px-5 text-sm font-medium text-paper transition-colors active:bg-blood outline-none focus-visible:bg-blood"
              >
                {cta.label}
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}

function withRegistryGate(id: string, link: ReactElement) {
  if (id !== "registry") return link;
  return <RegistryRsvpGate key={id}>{link}</RegistryRsvpGate>;
}

function getPersistentCta({
  hasRsvp,
  isRegistryPage,
  pathname,
  rsvpLabel,
  registry,
}: {
  hasRsvp: boolean;
  isRegistryPage: boolean;
  pathname: string;
  rsvpLabel: string;
  registry: (typeof weddingContent)["registry"];
}) {
  if (!hasRsvp) {
    return {
      href: pathname === "/wedding" ? "#rsvp" : "/wedding#rsvp",
      label: rsvpLabel,
      external: false,
    };
  }

  return {
    href: registry.url,
    label: isRegistryPage ? registry.ctaShort : "Registry",
    external: registry.url.startsWith("http"),
  };
}

/** True once the hero has mostly scrolled out of view. */
function useIsPastHero(pathname: string) {
  const [isPastHero, setIsPastHero] = useState(pathname !== "/wedding");

  useEffect(() => {
    if (pathname !== "/wedding") {
      setIsPastHero(true);
      return;
    }

    const hero = document.getElementById("top");
    if (!hero) {
      setIsPastHero(true);
      return;
    }

    setIsPastHero(false);
    const observer = new IntersectionObserver(
      ([entry]) => setIsPastHero(!entry.isIntersecting),
      // Shrink the root to the lower 45% of the viewport so the bar
      // appears once the hero is more than half-way gone.
      { rootMargin: "-55% 0px 0px 0px", threshold: 0 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [pathname]);

  return isPastHero;
}

/** Tracks which section currently crosses the middle band of the viewport. */
function useActiveSection(ids: string[], pathname: string) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) setActiveId(entry.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
    // ids is a module-level constant in practice
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return activeId;
}
