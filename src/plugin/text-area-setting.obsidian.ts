import { Setting, TextAreaComponent } from "obsidian";
import { ColorManager } from "./core/color-managing/color-manager";
import { Color } from "./core/color.value-object";
import {
	ActionMap,
	ObservableAction,
	Subject,
} from "./building-blocks/observability/subject";
import { Observer } from "./building-blocks/observability/observer";
export class TextAreaSetting implements Subject {
	private lastValidValue: string = "";
	private textAreaRef: TextAreaComponent;
	private observers: Observer[] = [];

	constructor(private colorManager: ColorManager) {}

	notify<T extends ObservableAction>(payload: ActionMap[T]): void {
		this.observers.map((observer) => {
			if ('colors' in payload) {
				observer.update("updated", { colors: payload.colors });
			} 
		});
	}
	attach(observer: Observer): void {
		if (this.observers.includes(observer)) {
			return;
		}

		this.observers.push(observer);
	}
	detach(observer: Observer): void {
		this.observers = this.observers.filter((obs) => obs !== observer);
	}
	notifyAdd(colorName: string): void {
		throw new Error("Method not implemented.");
	}
	notifyRemove(colorName: string): void {
		throw new Error("Method not implemented.");
	}

	public async configure(
		TextComponent: TextAreaComponent,
		displaySetting: Setting
	): Promise<void> {
		this.textAreaRef = TextComponent;
		TextComponent.setPlaceholder(
			"Enter colors here: red;green;#ff0000;#00ff00"
		);
		this.colorManager.loadColors().then((settings) => {
			TextComponent.setValue(this.colorsToTextArea(settings));
			this.lastValidValue = this.colorsToTextArea(settings);
		});
		TextComponent.onChange(async () => {
			const trimmedValue = TextComponent.getValue().trim();
			if (trimmedValue === this.lastValidValue) {
				this.success(displaySetting);
				return;
			}

			if (!this.isValidTextAreaValue(trimmedValue)) {
				this.error(displaySetting);
				return;
			}
			this.success(displaySetting);
			this.removeDoublon(trimmedValue);
			await this.saveColors(trimmedValue);
		});
	}

	public addToTextArea(color: string) {
		const currentColors = this.textAreaRef.getValue();
		this.textAreaRef.inputEl.innerHTML = currentColors + ";" + color;
		this.textAreaRef.setValue(currentColors + ";" + color);
		this.textAreaRef.inputEl.dispatchEvent(new Event("input"));
	}

	public changeColor(color: string, index: number) {
		console.log("Changing color at index ", index);
		const currentColors = this.textAreaRef.getValue().split(";");
		currentColors[index] = color;
		this.textAreaRef.setValue(currentColors.join(";"));
		this.textAreaRef.inputEl.dispatchEvent(new Event("input"));
	}

	private async saveColors(newColors: string) {
		const lastColors = this.lastValidValue.split(";");
		const changes = newColors.split(";");

		const added = changes.filter((color) => !lastColors.includes(color));
		const removed = lastColors.filter((color) => !changes.includes(color));

		console.log("Added : ", added);
		console.log("Removed : ", removed);

		added.map((color) => {
			if (color === "") return;
			this.colorManager.addColor(Color.from(color));
		});
		removed.map((color) => {
			if (color === "") return;
			this.colorManager.removeColor(Color.from(color));
		});

		this.notify<'updated'>({ colors: await this.colorManager.loadColors() });

		this.lastValidValue = newColors;
	}

	private colorsToTextArea(colors: Color[]): string {
		return colors.map((color) => color.unpack()).join(";");
	}

	private isValidTextAreaValue(value: string): boolean {
		return value.split(";").every((color) => {
			if (color === "") return true;
			return Color.isColor(color);
		});
	}

	private error(displaySetting: Setting) {
		displaySetting.components.forEach((component: any) => {
			(component as { inputEl: HTMLElement }).inputEl.style.borderColor =
				"red";
		});
	}

	private success(displaySetting: Setting) {
		displaySetting.components.forEach((component: any) => {
			(component as { inputEl: HTMLElement }).inputEl.style.borderColor =
				"green";
		});
	}

	private removeDoublon(string: string = this.lastValidValue) {
		const newArea = [...new Set(string.split(";"))].join(";");
		this.textAreaRef.setValue(newArea);
	}
}
