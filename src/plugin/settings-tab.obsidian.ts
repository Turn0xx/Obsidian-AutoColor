import { PluginSettingTab, App, Setting } from "obsidian";
import { ObsidianColorManager } from "./core/color-managing/color-manager.obsidian";
import AutoColorPlugin from "./main";
import { TextAreaSetting } from "./text-area-setting.obsidian";
import { ColorManager } from "./core/color-managing/color-manager";
import { ColorTranslator } from "colortranslator";
import { ColorPreview } from "./color-previewer.obsidian";

export class ColorSettingsTab extends PluginSettingTab {
	private textAreaSetting: TextAreaSetting;

	plugin: AutoColorPlugin;
	private colorManager: ColorManager;

	private colorSettings: Setting;
	private addColorSettings: Setting;
	private previewColorSettings: Setting;

	constructor(app: App, plugin: AutoColorPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this.colorManager = ObsidianColorManager.getInstance();
		this.textAreaSetting = new TextAreaSetting(this.colorManager);
	}

	public async display(): Promise<void> {
		const colorsPreviewer: ColorPreview = ColorPreview.fromColors(
			await this.colorManager.loadColors()
		);

		this.textAreaSetting.attach(colorsPreviewer);

		this.prepareColorSectionSettings();
		this.displayColorSettings();

		this.prepareAddColorButton();
		this.displayAddColorSettings();

		this.preparePreviewColors();
		this.displayPreviewColorSettings(colorsPreviewer);
	}

	public prepareColorSectionSettings(): void {
		let { containerEl } = this;

		containerEl.empty();
		containerEl.createEl("h1", { text: "Auto Color Plugin" });
		containerEl.createEl("span", { text: " Created By " }).createEl("a", {
			text: "Mouad 👩🏽‍💻",
			href: "https://github.com/Trun0xx",
		});
		containerEl.createEl("h2", { text: "Customize your colors : " });
	}

	public displayColorSettings(): void {
		let { containerEl } = this;

		this.colorSettings = new Setting(containerEl);

		this.colorSettings
			.setName("Colors")
			.setDesc(
				"Type here your colors separated by a ';'. If the color is valid, it will be displayed in the preview section. and you can change it by clicking on it."
			)
			.setClass("text-colors-input")
			.addTextArea(async (textArea) => {
				await this.textAreaSetting.configure(
					textArea,
					this.colorSettings
				);
			});
	}

	public prepareAddColorButton(): void {
		let { containerEl } = this;

		containerEl.createEl("h2", { text: "Color Adding" });
	}

	public displayAddColorSettings(): void {
		let { containerEl } = this;

		this.addColorSettings = new Setting(containerEl);

		let colorToBeAdded = "";

		this.addColorSettings
			.setName("Add Color")
			.setDesc("Add a new color")
			.addColorPicker((colorPicker) => {
				colorPicker.onChange((color) => {
					colorToBeAdded = color;
				});
			})
			.addButton((button) => {
				button.setButtonText("Add Color").onClick((call) => {
					this.textAreaSetting.addToTextArea(colorToBeAdded);
				});
			});
	}

	public preparePreviewColors(): void {
		let { containerEl } = this;

		containerEl.createEl("h2", { text: "Preview Colors" });
	}

	public displayPreviewColorSettings(renderer: ColorPreview): void {
		let { containerEl } = this;

		this.previewColorSettings = new Setting(containerEl);

		this.previewColorSettings
			.setName("Preview Colors")
			.setDesc("Preview your colors")
			.setTooltip("This is a tooltip");

		renderer.render(this.previewColorSettings, this.textAreaSetting);
	}
}
