/* eslint-disable prefer-const */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {Hotkey, MarkdownView , Plugin, Setting , PluginSettingTab, App } from 'obsidian';
import { createColorCommand, loadShortcuts} from 'src/utils/helpers';

export default class AutoColorPlugin extends Plugin {

	settings: ColorSettings;

	async onload() {
		console.log(this.manifest.name+" v" + this.manifest.version + " loaded - Author : " + this.manifest.author);
		await this.loadSettings();
		this.addSettingTab(new ColorSettingsTab(this.app, this));
		// createColorCommand('chartreuse', 'auto-color:red' , 'auto red' ,  this , [{modifiers: ['Mod', 'Shift'], key: 'R'}]);
		// createColorCommand('chocolate', 'auto-color:green' , 'auto green' ,  this ,  [{modifiers: ['Mod', 'Shift'], key: 'G'}] );
		loadShortcuts(this);
		await this.saveSettings();
		await this.saveData(this.settings);
	}

	async onunload() {
		this.settings.registeredColors = [];
		await this.saveSettings(); 
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings)
	}
}
interface ColorSettings{
	colors:  string,
	registeredColors: string[],
}


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DEFAULT_SETTINGS: ColorSettings = {
	colors : "",
	registeredColors : [],
}


class ColorSettingsTab extends PluginSettingTab {
	plugin: AutoColorPlugin;

	constructor(app: App, plugin: AutoColorPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let {
			containerEl
		} = this;
		containerEl.empty();
		containerEl.createEl('h1', {text: 'Auto Color Plugin'});
		containerEl.createEl("span" , {text : " Created By "}).createEl("a", {
			text: "Mouad 👩🏽‍💻",
			href: "https://github.com/Trun0xx",
		});
		containerEl.createEl("h2" , {text : "Customize your colors : "});
		
		new Setting(containerEl)
		.setName("Colors")
		.setDesc("Type here your colors separated by a comma, after you finish press '!'; it is not going to show on the screen but it is going to refresh the colors table right now otherwise you have to go out of setting and reentre it" )
		.setClass("text-colors-input")
		.addTextArea((text) => {
			text.setPlaceholder("red;green;#ff0000;#00ff00");
			if (this.plugin.settings.colors !== "") {
				text.setValue(this.plugin.settings.colors);
			}
			text.onChange(async (value) => {
				if (value.at(-1) === '!') {
					value = value.slice(0, -1);
					text.setValue(value);
					loadShortcuts(this.plugin);
				}
				this.plugin.settings.colors = value;
				await this.plugin.saveSettings();
			})
		});


		this.plugin.loadSettings().then(() => {
			const colors = this.plugin.settings.colors.split(";").slice(0, -1);
			colors.forEach((color , index) => {
				console.log(index);
				if (!this.plugin.settings.registeredColors.contains(color)) {
					createColorCommand(color, 'auto-color:'+color , 'auto '+color , this.plugin); 
				}
			});
		});
	}
}