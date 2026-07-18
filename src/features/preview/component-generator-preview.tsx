import { useMemo } from "react";
// import { copyText } from "@/lib/jsx-utils";
import { useIconStore } from "@/store/icon-store";
import { generateReactComponent } from "@/lib/component-generator";

interface ComponentGeneratorPreviewProps {
  svg: string;
  componentName: string;
}

export function ComponentGeneratorPreview({ svg, componentName }: ComponentGeneratorPreviewProps) {
  const config = useIconStore((s) => s.componentGenerator);

  const code = useMemo(() => {
    return generateReactComponent(svg, componentName, config);
  }, [svg, componentName, config]);

  //   async function handleCopy() {
  //     await copyText(code);
  //   }

  return (
    <div className="flex h-full flex-col rounded-lg border">
      {/* <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="font-medium">Preview</h3>

        <button onClick={handleCopy} className="rounded border px-3 py-1 text-sm hover:bg-gray-100">
          Copy
        </button>
      </div> */}

      <pre className="overflow-auto p-4 text-sm text-wrap">
        <code>{code}</code>
      </pre>
    </div>
  );
}
