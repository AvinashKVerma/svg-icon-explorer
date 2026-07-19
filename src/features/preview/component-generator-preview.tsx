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

  return (
    <div className="flex h-full flex-col rounded-lg border">
      <pre className="overflow-auto p-4 text-sm text-wrap">
        <code>{code}</code>
      </pre>
    </div>
  );
}
