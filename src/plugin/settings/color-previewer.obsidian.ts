import { Setting, TextAreaComponent } from "obsidian";
import { Observer } from "../building-blocks/observability/observer";
import {
	ObservableAction,
	ActionMap,
} from "../building-blocks/observability/subject";
import { Color } from "../core/color.value-object";
import { ColorTranslator } from "colortranslator";
import { TextAreaSetting } from "./text-area-setting.obsidian";

export class ColorPreview implements Observer {
	private colors: Color[] = [];
  private renderer: Setting | null;
  private textAreaComponent: TextAreaSetting | null;

	update<T extends ObservableAction>(
		actionType: T,
		colorName: ActionMap[T]
	): void {
    if (actionType === "updated") {
      if (this.renderer == null) throw new Error("No renderer attached to the color preview");
      if (this.textAreaComponent == null) throw new Error("No text area component attached to the color preview");
      this.renderer.clear();

      if ('colors' in colorName) {
        this.colors = colorName.colors;
        this.render(this.renderer! , this.textAreaComponent);
      }
    }
	}

	private constructor() {}

	public static fromColors(colors: Color[]): ColorPreview {
		const preview = new ColorPreview();
		preview.colors = colors;
    preview.renderer = null;
    preview.textAreaComponent = null;
		return preview;
	}

	public render(settings: Setting , textAreaComponent: TextAreaSetting): void {
    if (this.renderer == null) this.renderer = settings;
    if (this.textAreaComponent === null) this.textAreaComponent = textAreaComponent;

		this.colors.map((color , index) => {
			this.renderer!.addColorPicker((colorPicker) => {
				const dco = ColorTranslator.toHEX(color.unpack());
				colorPicker.setValue(dco);
        let defaultValue = dco;
        colorPicker.onChange((value) => {

          console.log(`Color ${index} changed from ${defaultValue} to ${value}`);
          defaultValue = value;

          const color = Color.from(value);
          this.colors[index] = color;

          this.textAreaComponent?.changeColor(value , index);
          
          
        });
			});
		});
	}
}
