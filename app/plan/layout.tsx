export default function PlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="plan scheme-dark min-h-screen bg-black text-white">{children}</div>
  );
}
