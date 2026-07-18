import { useIconStore } from "@/store/icon-store";
import {
  DEFAULT_COMPONENT_GENERATOR,
  LUCIDE_COMPONENT_GENERATOR,
  HEROICONS_COMPONENT_GENERATOR,
  MUI_COMPONENT_GENERATOR,
  MINIMAL_COMPONENT_GENERATOR,
  REACT_JS_COMPONENT_GENERATOR,
} from "@/lib/component-generator-defaults";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@radix-ui/react-select";
import { useState } from "react";

type Preset = "react-ts" | "react-js" | "lucide" | "heroicons" | "mui" | "minimal";

export function GeneratorPresets() {
  const [preset, setPreset] = useState<Preset>("react-ts");
  //   const config = useIconStore((s) => s.componentGenerator);
  const setConfig = useIconStore((s) => s.setComponentGenerator);

  function applyPreset(value: Preset) {
    switch (value) {
      case "react-ts":
        setConfig({
          ...DEFAULT_COMPONENT_GENERATOR,
          language: "ts",
        });
        break;

      case "react-js":
        setConfig(REACT_JS_COMPONENT_GENERATOR);
        break;

      case "lucide":
        setConfig(LUCIDE_COMPONENT_GENERATOR);
        break;

      case "heroicons":
        setConfig(HEROICONS_COMPONENT_GENERATOR);
        break;

      case "mui":
        setConfig(MUI_COMPONENT_GENERATOR);
        break;

      case "minimal":
        setConfig(MINIMAL_COMPONENT_GENERATOR);
        break;
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Preset</label>

      {/* <Select value={`${config.language}`} onValueChange={(v) => applyPreset(v as Preset)}> */}
      <Select
        value={preset}
        onValueChange={(value) => {
          setPreset(value as Preset);
          applyPreset(value as Preset);
        }}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="react-ts">React TS</SelectItem>

          <SelectItem value="react-js">React JS</SelectItem>

          <SelectItem value="lucide">Lucide</SelectItem>

          <SelectItem value="heroicons">Heroicons</SelectItem>

          <SelectItem value="mui">MUI</SelectItem>

          <SelectItem value="minimal">Minimal</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
