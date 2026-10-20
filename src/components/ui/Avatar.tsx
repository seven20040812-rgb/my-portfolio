import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";

export function Avatar({
  src,
  name,
  size = "lg",
  className,
}: {
  src: string | null;
  name: string;
  size?: "sm" | "lg";
  className?: string;
}) {
  const dim =
    size === "lg"
      ? "h-28 w-28 text-3xl md:h-32 md:w-32 md:text-4xl"
      : "h-10 w-10 text-sm";

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          "rounded-full object-cover ring-1 ring-line",
          dim,
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "relative grid place-items-center rounded-full border border-line bg-ground-2 font-display text-accent",
        dim,
        className
      )}
      aria-label={name}
    >
      <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/5" />
      <span className="absolute -inset-2 rounded-full border border-dashed border-white/5" />
      {initials(name)}
    </div>
  );
}
