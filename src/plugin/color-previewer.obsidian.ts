import { Setting } from "obsidian";
import { Observer } from "./building-blocks/observability/observer";
import {
	ObservableAction,
	ActionMap,
} from "./building-blocks/observability/subject";
import { Color } from "./core/color.value-object";
import { ColorTranslator } from "colortranslator";

export class ColorPreview implements Observer {
	private colors: Color[] = [];
  private renderer: Setting | null;  

	update<T extends ObservableAction>(
		actionType: T,
		colorName: ActionMap[T]
	): void {
    if (actionType === "updated") {
      if (this.renderer == null) throw new Error("No renderer attached to the color preview");
      this.renderer.clear();

      if ('colors' in colorName) {
        this.colors = colorName.colors;
        this.render(this.renderer!);
      }
    }
	}

	private constructor() {}

	public static fromColors(colors: Color[]): ColorPreview {
		const preview = new ColorPreview();
		preview.colors = colors;
    preview.renderer = null;
		return preview;
	}

	public render(settings: Setting): void {
    if (this.renderer == null) this.renderer = settings;

		this.colors.map((color) => {
			this.renderer!.addColorPicker((colorPicker) => {
				const dco = ColorTranslator.toHEX(color.unpack());
				colorPicker.setValue(dco);
			});
		});
	}
}
