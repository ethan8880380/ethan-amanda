"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { weddingContent } from "@/lib/wedding-content";
import { useHasWeddingRsvp } from "@/hooks/use-wedding-rsvp-session";
import { cn } from "@/lib/utils";

interface NavSection {
  id: string;
  label: string;
  shortLabel?: string;
  /** Show in the mobile thumb bar (space is limited). */
  isPrimary: boolean;
}

const sections: NavSection[] = [
  { id: "story", label: "Story", isPrimary: true },
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
      <header className="wedding-hairline fixed inset-x-0 top-0 z-40 hidden h-16 border-b bg-paper/92 backdrop-blur-md md:block">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-8 lg:px-12">
          <a
            href={pathname === "/wedding" ? "#top" : "/wedding"}
            className="font-wedding-serif text-xl leading-none tracking-tight text-ink outline-none focus-visible:ring-2 focus-visible:ring-blood focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
          >
            {weddingContent.couple.partnerOne}{" "}
            <span className="italic text-blood">&amp;</span>{" "}
            {weddingContent.couple.partnerTwo}
          </a>

          <nav aria-label="Primary" className="flex items-center gap-1">
            {sections.map((section) => {
              const href = sectionHref(section.id, pathname);
              const isExternal = href.startsWith("http");
              return (
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
                    "group relative flex h-10 items-center px-3.5 text-[0.75rem] font-medium uppercase tracking-[0.18em] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blood",
                    !isExternal && activeId === section.id
                      ? "text-ink"
                      : "text-ink/55 hover:text-ink"
                  )}
                >
                  {section.label}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-3.5 bottom-1.5 h-px origin-left bg-blood transition-transform duration-300",
                      !isExternal && activeId === section.id
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    )}
                  />
                </a>
              );
            })}
          </nav>

          <a
            href={cta.href}
            {...(cta.external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className="inline-flex h-10 items-center bg-blood px-5 text-[0.75rem] font-medium uppercase tracking-[0.18em] text-paper transition-colors hover:bg-blood-deep outline-none focus-visible:ring-2 focus-visible:ring-blood focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          >
            {cta.label}
          </a>
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
            className="wedding-hairline fixed inset-x-0 bottom-0 z-40 border-t bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
          >
            <div className="flex h-14 items-stretch">
              {sections
                .filter((section) => section.isPrimary)
                .map((section) => {
                  const href = sectionHref(section.id, pathname);
                  const isExternal = href.startsWith("http");
                  return (
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
                        "relative flex flex-1 items-center justify-center text-[0.6875rem] font-medium uppercase tracking-[0.16em] transition-colors outline-none focus-visible:bg-blood/10",
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
                          className="absolute bottom-2 size-1 rounded-full bg-blood"
                          transition={{
                            duration: 0.35,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        />
                      )}
                    </a>
                  );
                })}
              <a
                href={cta.href}
                {...(cta.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="flex min-w-[5.25rem] items-center justify-center bg-blood px-5 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-paper transition-colors active:bg-blood-deep outline-none focus-visible:bg-blood-deep"
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
