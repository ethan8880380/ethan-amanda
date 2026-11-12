import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { unlockSite } from "@/app/unlock/actions";
import { SITE_GATE_COOKIE, expectedGateToken, safeNextPath } from "@/lib/site-gate";
import { weddingContent } from "@/lib/wedding-content";
import { weddingFontVariables } from "@/lib/wedding-fonts";

export const metadata: Metadata = {
  title: "Ethan & Amanda",
  robots: { index: false, follow: false },
};

export default async function UnlockPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = safeNextPath(params.next);
  const jar = await cookies();

  if (jar.get(SITE_GATE_COOKIE)?.value === (await expectedGateToken())) {
    redirect(nextPath);
  }

  const hasError = params.error === "1";

  return (
    <main
      className={`${weddingFontVariables} flex min-h-svh flex-col justify-center bg-paper px-6 py-16 text-ink font-wedding-sans`}
    >
      <form action={unlockSite} className="mx-auto w-full max-w-md">
        <p className="wedding-eyebrow flex items-center gap-3 text-blood">
          <span aria-hidden className="h-px w-6 bg-blood" />
          {weddingContent.date.short}
        </p>
        <h1 className="mt-6 font-wedding-serif text-[clamp(3.5rem,12vw,5.5rem)] leading-[0.88] tracking-[-0.02em]">
          <span className="block">{weddingContent.couple.partnerOne}</span>
          <span className="block">
            <span className="italic text-blood">&amp;</span>{" "}
            {weddingContent.couple.partnerTwo}
          </span>
        </h1>
        <p className="mt-6 max-w-sm text-base leading-relaxed text-ink/70">
          This site is for our guests. Enter the password to continue.
        </p>

        <input type="hidden" name="next" value={nextPath} />

        <label className="wedding-eyebrow mt-12 block text-ink/60" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          aria-invalid={hasError}
          aria-describedby={hasError ? "password-error" : undefined}
          className="mt-2 w-full border-0 border-b border-ink/25 bg-transparent px-0 py-3.5 text-lg text-ink outline-none transition-colors focus:border-blood aria-invalid:border-blood"
        />
        {hasError ? (
          <p id="password-error" className="mt-3 text-sm text-blood">
            That password isn&apos;t right.
          </p>
        ) : null}

        <button
          type="submit"
          className="mt-10 inline-flex min-h-12 w-full items-center justify-center bg-blood px-6 text-[0.8125rem] font-medium uppercase tracking-[0.18em] text-paper transition-colors md:hover:bg-blood-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blood focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        >
          Enter
        </button>
      </form>
    </main>
  );
}
