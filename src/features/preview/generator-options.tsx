import { useIconStore } from "@/store/icon-store";

type BooleanOption = {
  key:
    | "includeImports"
    | "includeSvgPropsImport"
    | "useForwardRef"
    | "useMemo"
    | "includeSize"
    | "includeColor"
    | "includeStrokeWidth"
    | "includeClassName"
    | "includeStyle"
    | "includeTitle"
    | "spreadProps"
    | "removeDimensions"
    | "preserveViewBox";
  label: string;
};

const OPTIONS: BooleanOption[] = [
  { key: "includeImports", label: "Include imports" },
  { key: "includeSvgPropsImport", label: "Include SVGProps import" },
  { key: "useForwardRef", label: "forwardRef()" },
  { key: "useMemo", label: "memo()" },
  { key: "includeSize", label: "size prop" },
  { key: "includeColor", label: "color prop" },
  { key: "includeStrokeWidth", label: "strokeWidth prop" },
  { key: "includeClassName", label: "className prop" },
  { key: "includeStyle", label: "style prop" },
  { key: "includeTitle", label: "title prop" },
  { key: "spreadProps", label: "Spread {...props}" },
  { key: "removeDimensions", label: "Remove width / height" },
  { key: "preserveViewBox", label: "Preserve viewBox" },
];

export function GeneratorOptions() {
  const config = useIconStore((s) => s.componentGenerator);
  const setConfig = useIconStore((s) => s.setComponentGenerator);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Options</h3>

      <div className="grid gap-3">
        {OPTIONS.map((option) => (
          <label
            key={option.key}
            className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 cursor-pointer"
          >
            <span className="text-sm">{option.label}</span>

            <input
              type="checkbox"
              checked={config[option.key]}
              onChange={(e) =>
                setConfig({
                  [option.key]: e.target.checked,
                })
              }
              className="h-4 w-4"
            />
          </label>
        ))}
      </div>
    </div>
  );
}
