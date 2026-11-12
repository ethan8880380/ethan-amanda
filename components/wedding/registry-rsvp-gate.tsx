"use client";

import { useRef, useState, type MouseEvent, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Dialog as DialogPrimitive } from "radix-ui";
import {
  Dialog,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useHasWeddingRsvp,
  useWeddingRsvpCookie,
} from "@/hooks/use-wedding-rsvp-session";
import { weddingContent } from "@/lib/wedding-content";
import { weddingFontVariables } from "@/lib/wedding-fonts";
import { cn } from "@/lib/utils";
import { openWeddingRsvp } from "./open-wedding-rsvp";

const { rsvpPrompt } = weddingContent.registry;

interface RegistryRsvpGateProps {
  children: ReactNode;
}

/**
 * Wraps Zola links. A click explains that Zola opens in a new tab and offers
 * to RSVP first. Guests who already have an RSVP cookie go straight through.
 */
export function RegistryRsvpGate({ children }: RegistryRsvpGateProps) {
  const hasRsvp = useHasWeddingRsvp() || useWeddingRsvpCookie();
  const pathname = usePathname();
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const afterClose = useRef<(() => void) | null>(null);

  function handleClickCapture(event: MouseEvent<HTMLSpanElement>) {
    if (hasRsvp || isModifiedClick(event)) return;
    const anchor = (event.target as HTMLElement).closest("a");
    if (!anchor?.href) return;
    event.preventDefault();
    event.stopPropagation();
    setPendingHref(anchor.href);
  }

  function continueToRegistry() {
    if (!pendingHref) return;
    const url = new URL(pendingHref);
    if (url.origin === window.location.origin)
      router.push(`${url.pathname}${url.search}${url.hash}`);
    else window.open(url.href, "_blank", "noopener,noreferrer");
    setPendingHref(null);
  }

  function rsvpFirst() {
    if (pathname === "/wedding") afterClose.current = () => openWeddingRsvp();
    else router.push("/wedding#rsvp");
    setPendingHref(null);
  }

  return (
    <>
      <span className="contents" onClickCapture={handleClickCapture}>
        {children}
      </span>

      <Dialog
        open={pendingHref !== null}
        onOpenChange={(isOpen) => !isOpen && setPendingHref(null)}
      >
        <DialogPortal>
          <DialogOverlay className="z-[90] bg-ink/55 duration-300 supports-backdrop-filter:backdrop-blur-sm" />
          <DialogPrimitive.Content
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              afterClose.current?.();
              afterClose.current = null;
            }}
            className={cn(
              weddingFontVariables,
              "fixed top-1/2 left-1/2 z-[90] w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-[1.75rem] bg-paper p-8 text-center font-wedding-sans text-ink shadow-[0_32px_80px_-24px_rgb(24_20_21/0.45)] outline-none duration-300 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 sm:max-w-md sm:p-10"
            )}
          >
            <DialogTitle className="wedding-display text-[2rem] leading-tight font-normal text-balance md:text-[2.25rem]">
              {rsvpPrompt.title}
            </DialogTitle>
            <DialogDescription className="mt-4 text-base leading-relaxed text-pretty text-ink/65">
              {rsvpPrompt.body}
            </DialogDescription>
            <div className="mt-8 flex flex-col gap-3">
              <button
                type="button"
                onClick={rsvpFirst}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-blood px-7 text-[0.9375rem] font-medium text-paper transition-colors md:hover:bg-blood-deep outline-none focus-visible:ring-2 focus-visible:ring-blood focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
              >
                {rsvpPrompt.rsvpCta}
              </button>
              <button
                type="button"
                onClick={continueToRegistry}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-ink/15 px-7 text-[0.9375rem] font-medium text-ink/80 transition-colors md:hover:border-ink md:hover:text-ink outline-none focus-visible:ring-2 focus-visible:ring-blood focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
              >
                {rsvpPrompt.continueCta}
              </button>
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </>
  );
}

function isModifiedClick(event: MouseEvent) {
  return (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  );
}
