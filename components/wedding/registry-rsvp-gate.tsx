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
import { useHasWeddingRsvp } from "@/hooks/use-wedding-rsvp-session";
import { weddingContent } from "@/lib/wedding-content";
import { weddingFontVariables } from "@/lib/wedding-fonts";
import { cn } from "@/lib/utils";

const { rsvpPrompt } = weddingContent.registry;

const SKIP_KEY = "wedding-registry-rsvp-prompt-skipped";

interface RegistryRsvpGateProps {
  children: ReactNode;
}

/**
 * Wraps registry links. Until the guest has replied, a click opens a prompt
 * offering to RSVP first; choosing to continue silences it for the session.
 */
export function RegistryRsvpGate({ children }: RegistryRsvpGateProps) {
  const hasRsvp = useHasWeddingRsvp();
  const pathname = usePathname();
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const afterClose = useRef<(() => void) | null>(null);

  function handleClickCapture(event: MouseEvent<HTMLSpanElement>) {
    if (hasRsvp || hasSkippedPrompt()) return;
    if (isModifiedClick(event)) return;
    const anchor = (event.target as HTMLElement).closest("a");
    if (!anchor?.href) return;
    event.preventDefault();
    setPendingHref(anchor.href);
  }

  function continueToRegistry() {
    if (!pendingHref) return;
    skipPrompt();
    const url = new URL(pendingHref);
    if (url.origin === window.location.origin)
      router.push(`${url.pathname}${url.search}${url.hash}`);
    else window.open(url.href, "_blank", "noopener,noreferrer");
    setPendingHref(null);
  }

  function rsvpFirst() {
    if (pathname === "/wedding")
      afterClose.current = () =>
        document.getElementById("rsvp")?.scrollIntoView({ block: "start" });
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
          <DialogOverlay className="bg-ink/55 duration-300 supports-backdrop-filter:backdrop-blur-sm" />
          <DialogPrimitive.Content
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              afterClose.current?.();
              afterClose.current = null;
            }}
            className={cn(
              weddingFontVariables,
              "fixed top-1/2 left-1/2 z-50 w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-[1.75rem] bg-paper p-8 text-center font-wedding-sans text-ink shadow-[0_32px_80px_-24px_rgb(24_20_21/0.45)] outline-none duration-300 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 sm:max-w-md sm:p-10"
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
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-blood px-7 text-[0.9375rem] font-medium text-paper transition-colors hover:bg-blood-deep outline-none focus-visible:ring-2 focus-visible:ring-blood focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
              >
                {rsvpPrompt.rsvpCta}
              </button>
              <button
                type="button"
                onClick={continueToRegistry}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-ink/15 px-7 text-[0.9375rem] font-medium text-ink/80 transition-colors hover:border-ink hover:text-ink outline-none focus-visible:ring-2 focus-visible:ring-blood focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
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

function hasSkippedPrompt() {
  return window.sessionStorage.getItem(SKIP_KEY) === "1";
}

function skipPrompt() {
  window.sessionStorage.setItem(SKIP_KEY, "1");
}
