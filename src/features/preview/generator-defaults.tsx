import { useIconStore } from "@/store/icon-store";

export function GeneratorDefaults() {
  const config = useIconStore((s) => s.componentGenerator);
  const setConfig = useIconStore((s) => s.setComponentGenerator);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Defaults</h3>

      <div className="grid gap-4">
        {/* Component Name */}
        <div className="space-y-1">
          <label htmlFor="component-name" className="text-sm font-medium">
            Component Name
          </label>

          <input
            id="component-name"
            type="text"
            value={config.defaults.componentName}
            onChange={(e) =>
              setConfig({
                defaults: {
                  componentName: e.target.value,
                },
              })
            }
            className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2"
            placeholder="Icon"
          />
        </div>

        {/* Size */}
        <div className="space-y-1">
          <label htmlFor="default-size" className="text-sm font-medium">
            Default Size
          </label>

          <input
            id="default-size"
            type="number"
            min={1}
            value={config.defaults.size}
            onChange={(e) =>
              setConfig({
                defaults: {
                  size: Number(e.target.value),
                },
              })
            }
            className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2"
          />
        </div>

        {/* Color */}
        <div className="space-y-1">
          <label htmlFor="default-color" className="text-sm font-medium">
            Default Color
          </label>

          <div className="flex gap-2">
            <input
              id="default-color"
              type="color"
              value={config.defaults.color}
              onChange={(e) =>
                setConfig({
                  defaults: {
                    color: e.target.value,
                  },
                })
              }
              className="h-10 w-12 rounded border"
            />

            <input
              type="text"
              value={config.defaults.color}
              onChange={(e) =>
                setConfig({
                  defaults: {
                    color: e.target.value,
                  },
                })
              }
              className="flex-1 rounded-md border px-3 py-2 outline-none focus:ring-2"
            />
          </div>
        </div>

        {/* Stroke Width */}
        <div className="space-y-1">
          <label htmlFor="stroke-width" className="text-sm font-medium">
            Stroke Width
          </label>

          <input
            id="stroke-width"
            type="number"
            step="0.25"
            value={config.defaults.strokeWidth}
            onChange={(e) =>
              setConfig({
                defaults: {
                  strokeWidth: Number(e.target.value),
                },
              })
            }
            className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2"
          />
        </div>
      </div>
    </div>
  );
}
