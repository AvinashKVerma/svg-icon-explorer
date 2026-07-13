import { useEffect } from "react";
import type { IconRecord } from "@/types/icon";
import { useIconStore } from "@/store/icon-store";
import { useCopyIcon } from "@/hooks/use-copy-icon";

export function useKeyboardShortcuts(visibleIcons: IconRecord[]) {
  const selectedIconId = useIconStore((s) => s.selectedIconId);
  const selectIcon = useIconStore((s) => s.selectIcon);
  const defaultCopyFormat = useIconStore((s) => s.defaultCopyFormat);
  const pushRecentlyUsed = useIconStore((s) => s.pushRecentlyUsed);
  const { copyIcon } = useCopyIcon();

  useEffect(() => {
    function isTypingTarget(el: EventTarget | null) {
      if (!(el instanceof HTMLElement)) return false;
      return el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable;
    }

    function onKeyDown(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) {
        if (e.key === "Escape") selectIcon(null);
        return;
      }

      if (visibleIcons.length === 0) return;
      const idx = visibleIcons.findIndex((i) => i.id === selectedIconId);

      switch (e.key) {
        case "ArrowRight": {
          e.preventDefault();
          const next = visibleIcons[Math.min(idx + 1, visibleIcons.length - 1)] ?? visibleIcons[0];
          selectIcon(next.id);
          pushRecentlyUsed(next.id);
          break;
        }
        case "ArrowLeft": {
          e.preventDefault();
          const next = visibleIcons[Math.max(idx - 1, 0)] ?? visibleIcons[0];
          selectIcon(next.id);
          pushRecentlyUsed(next.id);
          break;
        }
        case "Enter": {
          if (idx >= 0) {
            const icon = visibleIcons[idx];
            copyIcon(icon, defaultCopyFormat);
          }
          break;
        }
        case "Escape": {
          selectIcon(null);
          break;
        }
        case "c":
        case "C": {
          if ((e.metaKey || e.ctrlKey) && idx >= 0) {
            e.preventDefault();
            copyIcon(visibleIcons[idx], defaultCopyFormat);
          }
          break;
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [visibleIcons, selectedIconId, selectIcon, copyIcon, defaultCopyFormat, pushRecentlyUsed]);
}
