import { useEffect, useRef, useState } from "react";

interface InViewOptions {
  once?: boolean;
  rootMargin?: string;
  threshold?: number;
}

/**
 * 观察元素是否进入视口（默认只触发一次）。
 * 与 CSS 过渡配合实现滚动揭示、描边绘制等动画。
 */
export function useInView<T extends Element = HTMLDivElement>(
  options: InViewOptions = {}
) {
  const { once = true, rootMargin = "0px 0px -10% 0px", threshold = 0.15 } =
    options;
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setInView(false);
          }
        });
      },
      { rootMargin, threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, rootMargin, threshold]);

  return { ref, inView };
}
