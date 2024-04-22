import { Subject } from "src/plugin/building-blocks/observability/subject";
import { Color } from "../color.value-object";
import { Observer } from "src/plugin/building-blocks/observability/observer";

export interface ColorManager {
  addColor(color: Color): void;
  removeColor(color: Color): void;
  saveSettings(): Promise<void>;
  loadSettings(): Promise<void>;
  loadColors(): Promise<Color[]>;
}