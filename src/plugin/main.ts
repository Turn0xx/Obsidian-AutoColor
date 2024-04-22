import { Plugin, Setting, PluginSettingTab, App } from "obsidian";
import { ColorManager } from "./core/color-managing/color-manager";
import { TextAreaSetting } from "./text-area-setting";
import { ObsidianColorManager } from "./core/color-managing/color-manager.obsidian";
import { ObsidianShortCuts } from "./core/shortcuts/short-cuts.obsidian";
import { ShortCuts } from "./core/shortcuts/short-cuts";
import { Observer } from "./building-blocks/observability/observer";
import { Subject } from "./building-blocks/observability/subject";
import { Colorizer } from "./core/colorizer.obsidian";

export default class AutoColorPlugin extends Plugin {
	private colorManager: ColorManager = ObsidianColorManager.getInstance(this);
	private shortCutsManager: ShortCuts = ObsidianShortCuts.getInstance(this);

	async onload() {
		console.log(
			this.manifest.name +
				" v" +
				this.manifest.version +
				" loaded - Author : " +
				this.manifest.author
		);
		(this.shortCutsManager as ObsidianShortCuts).addEssentialCommands();
		(this.colorManager as ObsidianColorManager as Subject).attach(
			this.shortCutsManager as ObsidianShortCuts as Observer
		);
		this.colorManager.loadSettings();
		Colorizer.attachPlugin(this);

		this.addSettingTab(new ColorSettingsTab(this.app, this));

	}

	async onunload() {
		await this.colorManager.saveSettings();
	}
}

class ColorSettingsTab extends PluginSettingTab {
	private textAreaSetting: TextAreaSetting;

	plugin: AutoColorPlugin;

	constructor(app: App, plugin: AutoColorPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this.textAreaSetting = new TextAreaSetting(
			ObsidianColorManager.getInstance()
		);
	}

	public display(): void {
		this.prepareContainer();
		const displaySetting = new Setting(this.containerEl);

		displaySetting
			.setName("Colors")
			.setDesc(
				"Type here your colors separated by a comma, after you finish press '!'; it is not going to show on the screen but it is going to refresh the colors table right now otherwise you have to go out of setting and reentre it"
			)
			.setClass("text-colors-input")
			.addTextArea((textArea) => {
				this.textAreaSetting.configure(textArea, displaySetting);
			});
	}

	public prepareContainer(): void {
		let { containerEl } = this;

		containerEl.empty();
		containerEl.createEl("h1", { text: "Auto Color Plugin" });
		containerEl.createEl("span", { text: " Created By " }).createEl("a", {
			text: "Mouad 👩🏽‍💻",
			href: "https://github.com/Trun0xx",
		});
		containerEl.createEl("h2", { text: "Customize your colors : " });
	}
}
