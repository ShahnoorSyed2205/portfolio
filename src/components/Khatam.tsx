import { useId } from "react";

/**
 * Khatam (eight-point star) lattice, the geometric base of Emirati and wider Islamic ornament.
 * Built from two overlapping squares so it tiles cleanly. Stroke uses the brand gradient.
 */
export function KhatamPattern({
  size = 88,
  opacity = 0.35,
  className,
}: {
  size?: number;
  opacity?: number;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const c = size / 2;
  const R = size * 0.34;
  const k = Math.SQRT1_2;
  const square = [
    [c + R, c],
    [c, c + R],
    [c - R, c],
    [c, c - R],
  ];
  const sq2 = [
    [c + R * k, c + R * k],
    [c - R * k, c + R * k],
    [c - R * k, c - R * k],
    [c + R * k, c - R * k],
  ];
  const pts = (a: number[][]) => a.map((p) => p.join(",")).join(" ");
  const oct = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4 + Math.PI / 8;
    const r = R * 0.45;
    return [c + r * Math.cos(a), c + r * Math.sin(a)];
  });

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={className}
      width="100%"
      height="100%"
      style={{ opacity }}
    >
      <defs>
        <linearGradient id={`g${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ccff66" />
          <stop offset="0.45" stopColor="#f2ce19" />
          <stop offset="1" stopColor="#3ef3ee" />
        </linearGradient>
        <pattern id={`p${uid}`} width={size} height={size} patternUnits="userSpaceOnUse">
          <g fill="none" stroke={`url(#g${uid})`} strokeWidth="1" strokeLinejoin="round">
            <polygon points={pts(square)} />
            <polygon points={pts(sq2)} />
            <polygon points={pts(oct)} />
            <path d={`M0 0 L${c - R * 0.9} ${c - R * 0.9} M${size} 0 L${c + R * 0.9} ${c - R * 0.9} M0 ${size} L${c - R * 0.9} ${c + R * 0.9} M${size} ${size} L${c + R * 0.9} ${c + R * 0.9}`} />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#p${uid})`} />
    </svg>
  );
}
