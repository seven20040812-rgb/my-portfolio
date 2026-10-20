import { useInView } from "@/hooks/useInView";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const points = [
  { x: 128, y: 138, label: "A·01" },
  { x: 206, y: 104 },
  { x: 286, y: 150 },
  { x: 252, y: 224 },
  { x: 312, y: 266, label: "B·17" },
  { x: 176, y: 246 },
  { x: 150, y: 318 },
  { x: 232, y: 330 },
  { x: 300, y: 330 },
];

const links: Array<[number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [3, 5],
  [5, 1],
  [5, 6],
  [6, 7],
  [7, 8],
  [4, 8],
];

export function CelestialChart({ className }: { className?: string }) {
  const { ref, inView } = useInView<SVGSVGElement>({
    once: true,
    threshold: 0.25,
  });
  const reduced = usePrefersReducedMotion();
  const drawn = reduced || inView;

  return (
    <svg
      ref={ref}
      viewBox="0 0 420 420"
      className={className}
      role="img"
      aria-label="装饰性的星图与坐标网格"
    >
      {/* frame + inner grid */}
      <g stroke="rgba(207,224,255,0.16)" fill="none">
        <circle cx="210" cy="210" r="190" />
        <circle cx="210" cy="210" r="132" strokeOpacity="0.5" />
        <circle cx="210" cy="210" r="70" strokeOpacity="0.4" />
        <line x1="20" y1="210" x2="400" y2="210" strokeOpacity="0.35" />
        <line x1="210" y1="20" x2="210" y2="400" strokeOpacity="0.35" />
      </g>

      {/* radial ticks */}
      <g stroke="rgba(207,224,255,0.22)">
        {Array.from({ length: 36 }).map((_, i) => {
          const angle = (i / 36) * Math.PI * 2;
          const outer = 190;
          const inner = i % 9 === 0 ? 176 : 183;
          return (
            <line
              key={i}
              x1={210 + Math.cos(angle) * inner}
              y1={210 + Math.sin(angle) * inner}
              x2={210 + Math.cos(angle) * outer}
              y2={210 + Math.sin(angle) * outer}
              strokeOpacity={i % 9 === 0 ? 0.5 : 0.25}
            />
          );
        })}
      </g>

      {/* constellation links —— 进入视口后逐段描边绘制 */}
      <g stroke="rgba(207,224,255,0.28)" strokeWidth="1">
        {links.map(([a, b], i) => (
          <line
            key={i}
            x1={points[a].x}
            y1={points[a].y}
            x2={points[b].x}
            y2={points[b].y}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={drawn ? 0 : 1}
            style={{
              transition:
                "stroke-dashoffset 1.1s cubic-bezier(0.2, 0.7, 0.2, 1)",
              transitionDelay: `${280 + i * 70}ms`,
            }}
          />
        ))}
      </g>

      {/* plotted stars */}
      <g fill="#CFE0FF">
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={1.6} fillOpacity="0.85" />
        ))}
      </g>

      {/* labels */}
      <g
        fill="rgba(207,224,255,0.5)"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="8"
        letterSpacing="1"
      >
        {points
          .filter((p) => p.label)
          .map((p) => (
            <text key={p.label} x={p.x + 8} y={p.y - 6}>
              {p.label}
            </text>
          ))}
        <text x="214" y="30">RA 12h 34m</text>
        <text x="30" y="206">DEC +21°</text>
      </g>

      {/* the one warm star */}
      <circle cx="210" cy="210" r="14" fill="rgba(242,200,121,0.12)" className="animate-pulse" />
      <circle cx="210" cy="210" r="3.2" fill="#F2C879" />
      <circle cx="210" cy="210" r="6.5" fill="none" stroke="rgba(242,200,121,0.5)" />

      {/* corner brackets */}
      <g stroke="rgba(238,241,246,0.22)" strokeWidth="1.2">
        <path d="M8 26V8h18" fill="none" />
        <path d="M412 26V8h-18" fill="none" />
        <path d="M8 394v18h18" fill="none" />
        <path d="M412 394v18h-18" fill="none" />
      </g>
    </svg>
  );
}
