import { Check, X, Info } from "lucide-react";
import { useToastStore } from "@/hooks/use-toast";
import { cn } from "@/lib/cn";

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "animate-[var(--animate-toast-in)] flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-sm shadow-lg backdrop-blur-sm",
            "border-border bg-surface-2/95 text-ink"
          )}
        >
          <span
            className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
              t.variant === "success" && "bg-success/15 text-success",
              t.variant === "error" && "bg-danger/15 text-danger",
              t.variant === "info" && "bg-accent/15 text-accent"
            )}
          >
            {t.variant === "success" && <Check size={12} strokeWidth={3} />}
            {t.variant === "error" && <X size={12} strokeWidth={3} />}
            {t.variant === "info" && <Info size={12} strokeWidth={3} />}
          </span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
