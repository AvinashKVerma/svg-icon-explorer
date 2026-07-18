import { useEffect, useState } from "react";
import { FlipHorizontal2, FlipVertical2, RotateCcw } from "lucide-react";
import type { IconRecord, Background } from "@/types/icon";
import { loadSvgSource } from "@/lib/svg-loader";
import { applyPlaygroundStyle } from "@/lib/jsx-utils";
import { useIconStore } from "@/store/icon-store";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const BACKGROUNDS: { value: Background; label: string; className: string }[] = [
  { value: "white", label: "White", className: "bg-white" },
  { value: "dark", label: "Dark", className: "bg-[#0b0c10]" },
  { value: "checkerboard", label: "Checker", className: "checkerboard-bg" },
  { value: "transparent", label: "None", className: "bg-transparent" },
];

function Row({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-ink-dim">{label}</span>
        <span className="font-mono text-ink-faint">{value}</span>
      </div>
      {children}
    </div>
  );
}

export function PlaygroundPanel({ icon }: { icon: IconRecord }) {
  const [source, setSource] = useState<string | null>(null);
  const playground = useIconStore((s) => s.playground);
  const setPlayground = useIconStore((s) => s.setPlayground);
  const resetPlayground = useIconStore((s) => s.resetPlayground);

  useEffect(() => {
    loadSvgSource(icon.path)
      .then(setSource)
      .catch(() => setSource(null));
  }, [icon.path]);

  const styledMarkup = source ? applyPlaygroundStyle(source, playground) : null;
  const bg = BACKGROUNDS.find((b) => b.value === playground.background)!;

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div
        className={cn(
          "m-3 flex h-44 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border",
          bg.className,
        )}
      >
        {styledMarkup && (
          <div
            className={playground.background === "white" ? "text-black" : "text-ink"}
            dangerouslySetInnerHTML={{ __html: styledMarkup }}
          />
        )}
      </div>

      <div className="flex items-center justify-between px-4">
        <p className="text-xs font-semibold tracking-wide text-ink-faint uppercase">Controls</p>
        <button onClick={resetPlayground} className="flex items-center gap-1 text-[11px] text-ink-faint hover:text-ink">
          <RotateCcw size={11} /> Reset
        </button>
      </div>

      <div className="flex flex-col gap-4 px-4 py-3">
        <Row label="Size" value={`${playground.size}px`}>
          <Slider value={playground.size} onChange={(v) => setPlayground({ size: v })} min={16} max={256} />
        </Row>

        <Row label="Stroke width" value={`${playground.strokeWidth}`}>
          <Slider
            value={playground.strokeWidth}
            onChange={(v) => setPlayground({ strokeWidth: v })}
            min={0.5}
            max={4}
            step={0.1}
          />
        </Row>

        <Row label="Rotation" value={`${playground.rotation}°`}>
          <Slider value={playground.rotation} onChange={(v) => setPlayground({ rotation: v })} min={0} max={360} />
        </Row>

        <Row label="Opacity" value={`${Math.round(playground.opacity * 100)}%`}>
          <Slider
            value={playground.opacity}
            onChange={(v) => setPlayground({ opacity: v })}
            min={0}
            max={1}
            step={0.05}
          />
        </Row>

        <Row label="Scale" value={`${playground.scale.toFixed(2)}×`}>
          <Slider
            value={playground.scale}
            onChange={(v) => setPlayground({ scale: v })}
            min={0.25}
            max={3}
            step={0.05}
          />
        </Row>

        <div className="flex items-center gap-3">
          <label className="flex flex-1 items-center gap-2 text-xs text-ink-dim">
            Fill
            <input
              type="color"
              value={playground.fillColor}
              onChange={(e) => setPlayground({ fillColor: e.target.value })}
              className="h-7 w-full cursor-pointer rounded border border-border bg-transparent"
            />
          </label>
          <label className="flex flex-1 items-center gap-2 text-xs text-ink-dim">
            Stroke
            <input
              type="color"
              value={playground.strokeColor}
              onChange={(e) => setPlayground({ strokeColor: e.target.value })}
              className="h-7 w-full cursor-pointer rounded border border-border bg-transparent"
            />
          </label>
        </div>

        <div className="flex gap-2">
          <Button
            variant={playground.flipH ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => setPlayground({ flipH: !playground.flipH })}
          >
            <FlipHorizontal2 size={13} /> Flip H
          </Button>
          <Button
            variant={playground.flipV ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => setPlayground({ flipV: !playground.flipV })}
          >
            <FlipVertical2 size={13} /> Flip V
          </Button>
        </div>

        <div>
          <p className="mb-1.5 text-xs text-ink-dim">Background</p>
          <div className="grid grid-cols-4 gap-1.5">
            {BACKGROUNDS.map((b) => (
              <button
                key={b.value}
                onClick={() => setPlayground({ background: b.value })}
                className={cn(
                  "rounded-md border px-1 py-1.5 text-[10px]",
                  playground.background === b.value
                    ? "border-accent text-accent"
                    : "border-border text-ink-faint hover:text-ink",
                )}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
