import * as RadixCheckbox from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export function Checkbox({
  checked,
  onCheckedChange,
  className,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  className?: string;
}) {
  return (
    <RadixCheckbox.Root
      checked={checked}
      onCheckedChange={(v) => onCheckedChange(v === true)}
      className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center rounded border border-border-strong bg-surface-2 transition-colors data-[state=checked]:border-accent data-[state=checked]:bg-accent",
        className
      )}
    >
      <RadixCheckbox.Indicator>
        <Check size={11} strokeWidth={3} className="text-[#0b0c10]" />
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );
}
