import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

type Push = (message: string, type?: ToastType) => void;

const ToastContext = createContext<Push>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const push = useCallback<Push>((message, type = "success") => {
    counter.current += 1;
    const id = counter.current;
    setItems((prev) => [...prev, { id, message, type }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 2600);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            role="status"
            className="pointer-events-auto flex items-center gap-2.5 rounded-sm border border-line bg-ground-2/95 px-4 py-3 text-sm text-ink shadow-lg backdrop-blur"
          >
            <span
              className={
                "h-1.5 w-1.5 rounded-full " +
                (item.type === "error"
                  ? "bg-danger"
                  : item.type === "info"
                    ? "bg-star"
                    : "bg-accent")
              }
            />
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): Push {
  return useContext(ToastContext);
}
