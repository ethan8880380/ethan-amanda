export function Glyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 22"
      aria-hidden
      className={className}
      fill="none"
    >
      <rect
        x="1.5"
        y="1.5"
        width="45"
        height="19"
        rx="9.5"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <rect
        x="7"
        y="6"
        width="34"
        height="10"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.45"
      />
    </svg>
  );
}
