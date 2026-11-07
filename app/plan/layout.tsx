export default function PlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="plan scheme-light min-h-screen bg-[#f3f3f3] text-[#141414]">{children}</div>
  );
}
