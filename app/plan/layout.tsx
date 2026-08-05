export default function PlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f7f3ee] text-[#1c1714]">{children}</div>
  );
}
