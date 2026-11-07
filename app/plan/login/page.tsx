import { redirect } from "next/navigation";
import { loginToPlan } from "@/app/plan/actions";
import { Glyph } from "@/components/planning/glyph";
import { isPlanningAuthenticated } from "@/lib/planning-auth";

export default async function PlanLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isPlanningAuthenticated()) redirect("/plan/guests");
  const params = await searchParams;

  async function loginAction(formData: FormData) {
    "use server";
    const result = await loginToPlan(formData);
    if (result && !result.success) redirect("/plan/login?error=1");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <Glyph className="h-8 w-16 text-white" />
      <p className="mt-8 text-[11px] uppercase tracking-[0.32em] text-[#8e8e8e]">
        Plan
      </p>
      <h1 className="mt-3 text-center text-[2rem] font-medium tracking-tight">
        Ethan & Amanda
      </h1>
      <form action={loginAction} className="mt-10 w-full max-w-sm">
        <label className="block text-sm text-[#8e8e8e]">
          Password
          <input
            type="password"
            name="password"
            required
            className="mt-2 w-full rounded-2xl bg-[#161616] px-4 py-4 text-base text-white outline-none ring-1 ring-transparent focus:ring-white/30"
          />
        </label>
        {params.error ? (
          <p className="mt-3 text-sm text-[#ff453a]">Incorrect password.</p>
        ) : null}
        <button
          type="submit"
          className="mt-4 w-full rounded-full bg-white py-4 text-sm font-medium text-black"
        >
          Enter
        </button>
      </form>
    </div>
  );
}
