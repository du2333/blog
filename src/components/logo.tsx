
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Proxy Archive Logo"
    >
      {/* Outer Shell - Heavy Industrial Shape */}
      <path
        d="M20 10H80L95 30V90H20L5 70V30L20 10Z"
        fill="currentColor"
        className="text-zzz-lime"
      />

      {/* Inner Cutout - The 'Hollow' */}
      <path d="M30 30H70L80 45V75H30V30Z" fill="black" />

      {/* The Signal - Z Shape */}
      <path
        d="M40 40H65L45 65H70"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="square"
        className="text-zzz-lime"
      />

      {/* Decorative Tech Bits */}
      <rect x="10" y="75" width="5" height="5" fill="black" />
      <rect x="10" y="82" width="5" height="5" fill="black" />

      <path d="M85 20L92 20" stroke="black" strokeWidth="2" />
      <path d="M85 25L90 25" stroke="black" strokeWidth="2" />
    </svg>
  );
}
