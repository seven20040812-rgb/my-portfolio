import { cn } from "@/lib/cn";
import { useInView } from "@/hooks/useInView";

/**
 * 文字遮罩升起：内层文字从下方裁切区升入。
 * 用于大标题的「编辑感」揭示。
 */
export function MaskText({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>();

  return (
    <span ref={ref} className="block overflow-hidden">
      <span
        className={cn(
          "block transition-transform duration-[900ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none",
          inView ? "translate-y-0" : "translate-y-[110%]",
          className
        )}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {children}
      </span>
    </span>
  );
}
