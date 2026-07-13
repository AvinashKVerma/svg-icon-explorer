import * as RadixSlider from "@radix-ui/react-slider";

export function Slider({
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
}) {
  return (
    <RadixSlider.Root
      className="relative flex h-4 w-full touch-none items-center select-none"
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={([v]) => onChange(v)}
    >
      <RadixSlider.Track className="relative h-1 grow rounded-full bg-surface-3">
        <RadixSlider.Range className="absolute h-full rounded-full bg-accent" />
      </RadixSlider.Track>
      <RadixSlider.Thumb className="block h-3.5 w-3.5 rounded-full border-2 border-accent bg-canvas shadow transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" />
    </RadixSlider.Root>
  );
}
