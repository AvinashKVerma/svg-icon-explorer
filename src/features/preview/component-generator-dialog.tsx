import { useMemo, useState } from "react";

import { ComponentGeneratorPreview } from "./component-generator-preview";
import { GeneratorDefaults } from "./generator-defaults";
import { GeneratorOptions } from "./generator-options";
import { GeneratorPresets } from "./generator-presets";

import { useIconStore } from "@/store/icon-store";

import { generateReactComponent } from "@/lib/component-generator";
import { copyText } from "@/lib/jsx-utils";

interface ComponentGeneratorDialogProps {
  svg: string;
  defaultComponentName: string;
  onClose(): void;
}

export function ComponentGeneratorDialog({ svg, defaultComponentName, onClose }: ComponentGeneratorDialogProps) {
  const config = useIconStore((s) => s.componentGenerator);

  const [componentName, setComponentName] = useState(defaultComponentName);

  const generatedCode = useMemo(() => {
    return generateReactComponent(svg, componentName, config);
  }, [svg, componentName, config]);

  async function handleCopy() {
    await copyText(generatedCode);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm">
      <div className="flex h-[90vh] w-[min(1200px,95vw)] overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        {/* Settings */}
        <aside className="flex w-90 flex-col border-r border-border bg-surface-2">
          <div className="sticky top-0 border-b border-border bg-surface-2 px-6 py-5">
            <h2 className="text-lg font-semibold text-ink">React Component</h2>

            <p className="mt-1 text-sm text-ink-faint">Configure the generated component.</p>
          </div>

          <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wide text-ink-faint">Component Name</label>

              <input
                value={componentName}
                onChange={(e) => setComponentName(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition focus:border-accent"
              />
            </div>

            <GeneratorPresets />

            <GeneratorOptions />

            <GeneratorDefaults />
          </div>
        </aside>

        {/* Preview */}
        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h3 className="font-semibold text-ink">Live Preview</h3>

              <p className="mt-1 text-sm text-ink-faint">Updates automatically as you change settings.</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="rounded-lg border border-border px-4 py-2 text-sm transition hover:bg-surface-2"
              >
                Cancel
              </button>

              <button
                onClick={handleCopy}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              >
                Copy Component
              </button>
            </div>
          </header>

          <div className="min-h-0 flex-1 bg-surface">
            <ComponentGeneratorPreview svg={svg} componentName={componentName} />
          </div>
        </section>
      </div>
    </div>
  );
}
