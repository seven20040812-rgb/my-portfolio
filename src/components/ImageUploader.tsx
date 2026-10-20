import { useRef } from "react";

import { cn } from "@/lib/cn";
import { compressImage } from "@/lib/compressImage";
import { buttonClass } from "./ui/Button";
import { useToast } from "./ui/Toast";

export function ImageUploader({
  value,
  onChange,
  aspect = "wide",
  maxMB = 2,
}: {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  aspect?: "square" | "wide";
  maxMB?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const maxEdge = aspect === "square" ? 512 : 1280;

  const handlePick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) {
      toast("请选择 png / jpg / webp 图片", "error");
      return;
    }
    if (file.size > maxMB * 1024 * 1024) {
      toast(`图片需小于 ${maxMB}MB`, "error");
      return;
    }

    try {
      const dataUrl = await compressImage(file, maxEdge);
      onChange(dataUrl);
      toast("图片已更新");
    } catch {
      toast("图片处理失败", "error");
    }
  };

  return (
    <div>
      <div
        className={cn(
          "relative overflow-hidden rounded-sm border border-line bg-ground-2/40",
          aspect === "square" ? "aspect-square w-32" : "aspect-[16/9] w-full"
        )}
      >
        {value ? (
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
            NO IMAGE
          </div>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className={buttonClass("ghost", "px-3 py-1.5 text-xs")}
          onClick={() => inputRef.current?.click()}
        >
          {value ? "更换图片" : "上传图片"}
        </button>
        {value && (
          <button
            type="button"
            className={buttonClass("ghost", "px-3 py-1.5 text-xs")}
            onClick={() => onChange(null)}
          >
            移除
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handlePick}
        />
      </div>
    </div>
  );
}
