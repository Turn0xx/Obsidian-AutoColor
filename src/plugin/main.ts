import { Plugin, Setting, PluginSettingTab, App, Command } from "obsidian";
import { ColorManager } from "./core/color-managing/color-manager";
import { TextAreaSetting } from "./settings/text-area-setting.obsidian";
import { ObsidianColorManager } from "./core/color-managing/color-manager.obsidian";
import { ObsidianShortCuts } from "./core/shortcuts/short-cuts.obsidian";
import { ShortCuts } from "./core/shortcuts/short-cuts";
import { Observer } from "./building-blocks/observability/observer";
import { Subject } from "./building-blocks/observability/subject";
import { Colorizer } from "./core/colorizer.obsidian";
import { ColorSettingsTab } from "./settings/settings-tab.obsidian"; 
import { ShortCutsModal } from "./modals/short-cuts-modal.obsidian";

export type ExtentedApp = App & {
	commands: {
		executeCommandById: (id: string) => void;
		findCommand(commandId: string): Command;
		listCommands(): Command[];
	}
}

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

		this.addCommand({
			id: "open-color-picker",
			name: "Open Color Picker",
			callback: () => {
				new ShortCutsModal(this.app).open();
			},
			hotkeys: [],
		});


	}

	async onunload() {
		await this.colorManager.saveSettings();
	}
}

