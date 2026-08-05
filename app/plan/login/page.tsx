import { redirect } from "next/navigation";
import { loginToPlan } from "@/app/plan/actions";
import { isPlanningAuthenticated } from "@/lib/planning-auth";

export default async function PlanLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isPlanningAuthenticated()) redirect("/plan");
  const params = await searchParams;

  async function loginAction(formData: FormData) {
    "use server";
    const result = await loginToPlan(formData);
    if (result && !result.success) redirect("/plan/login?error=1");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <form
        action={loginAction}
        className="w-full max-w-md border border-[#e4ddd4] bg-white p-8 shadow-[0_20px_60px_rgba(28,23,20,0.08)]"
      >
        <p className="font-serif text-3xl tracking-tight">Planning portal</p>
        <p className="mt-2 text-sm text-[#6f6258]">
          Ethan & Amanda — enter the shared admin password.
        </p>
        <label className="mt-8 block text-xs uppercase tracking-[0.18em] text-[#6f6258]">
          Password
          <input
            type="password"
            name="password"
            required
            className="mt-2 w-full border border-[#d9d0c5] bg-[#fbf8f4] px-3 py-3 text-base outline-none focus:border-[#1c1714]"
          />
        </label>
        {params.error ? (
          <p className="mt-3 text-sm text-red-700">Incorrect password.</p>
        ) : null}
        <button
          type="submit"
          className="mt-6 w-full bg-[#1c1714] px-4 py-3 text-sm uppercase tracking-[0.18em] text-[#f7f3ee]"
        >
          Enter
        </button>
      </form>
    </div>
  );
}
