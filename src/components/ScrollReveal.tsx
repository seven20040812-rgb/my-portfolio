import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * 全局滚动揭示：为所有 [data-reveal] 元素在进入视口时添加 .is-visible。
 * - 路由切换时重建观察器；
 * - 用 MutationObserver 兜底异步挂载 / 懒加载的节点（如数据加载后才渲染的区块），
 *   避免元素在首次观察器扫描之后才出现而永远停留在隐藏状态。
 */
export function ScrollReveal() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      document
        .querySelectorAll<HTMLElement>("[data-reveal]")
        .forEach((node) => node.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
    );

    const observeAll = () => {
      document
        .querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)")
        .forEach((node) => observer.observe(node));
    };

    observeAll();

    const mutation = new MutationObserver(() => observeAll());
    mutation.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutation.disconnect();
    };
  }, [pathname]);

  return null;
}
