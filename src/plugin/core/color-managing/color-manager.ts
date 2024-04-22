import { Color } from "./color.value-object";

export interface ColorManager {
  addColor(color: Color): void;
  removeColor(color: Color): void;
  saveSettings(): Promise<void>;
  loadSettings(): Promise<void>;
  loadColors(): Promise<Color[]>;
}