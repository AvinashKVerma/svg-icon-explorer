import * as Tabs from "@radix-ui/react-tabs";
import { MousePointerClick } from "lucide-react";
import type { IconRecord } from "@/types/icon";
import { DetailsPanel } from "./details-panel";
import { PlaygroundPanel } from "@/features/playground/playground-panel";
import { cn } from "@/lib/cn";

export function RightPanel({ icon }: { icon: IconRecord | null }) {
  if (!icon) {
    return (
      <aside className="flex h-full w-90 shrink-0 flex-col items-center justify-center gap-2 border-l border-border bg-surface px-6 text-center">
        <MousePointerClick size={22} className="text-ink-faint" strokeWidth={1.5} />
        <p className="text-sm text-ink-dim">Select an icon to preview, customize, and copy it</p>
      </aside>
    );
  }

  return (
    <aside className="flex h-full w-90 shrink-0 flex-col border-l border-border bg-surface">
      <Tabs.Root defaultValue="details" className="flex h-full flex-col">
        <Tabs.List className="flex shrink-0 border-b border-border px-2">
          {[
            { value: "details", label: "Details" },
            { value: "playground", label: "Playground" },
          ].map((t) => (
            <Tabs.Trigger
              key={t.value}
              value={t.value}
              className={cn(
                "px-3 py-2.5 text-xs font-medium text-ink-faint transition-colors",
                "data-[state=active]:text-ink data-[state=active]:border-b-2 data-[state=active]:border-accent -mb-px"
              )}
            >
              {t.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <Tabs.Content value="details" className="min-h-0 flex-1">
          <DetailsPanel icon={icon} />
        </Tabs.Content>
        <Tabs.Content value="playground" className="min-h-0 flex-1">
          <PlaygroundPanel icon={icon} />
        </Tabs.Content>
      </Tabs.Root>
    </aside>
  );
}
