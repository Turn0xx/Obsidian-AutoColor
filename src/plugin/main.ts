/* eslint-disable prefer-const */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {Hotkey, MarkdownView , Plugin, Setting , PluginSettingTab, App } from 'obsidian';
import { createColorCommand} from 'src/utils/helpers';




export default class AutoColorPlugin extends Plugin {

	settings: ColorSettings;

	async onload() {
		console.log(this.manifest.name+" v" + this.manifest.version + " loaded - Author : " + this.manifest.author);
		await this.loadSettings();
		this.addSettingTab(new ColorSettingsTab(this.app, this));
		createColorCommand('chartreuse', 'auto-color:red' , 'auto red' ,  this , [{modifiers: ['Mod', 'Shift'], key: 'R'}]);
		createColorCommand('chocolate', 'auto-color:green' , 'auto green' ,  this ,  [{modifiers: ['Mod', 'Shift'], key: 'G'}] );

		await this.saveSettings();
		await this.saveData(this.settings);
	}

	onunload(): void {
		
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings)
	}
}
interface ColorSettings{
	snippets_file: string;
	snippets: string[];
	colors:  Map<string , string>;
}


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DEFAULT_SETTINGS: ColorSettings = {
	snippets_file: "snippets : It is an obsidian plugin, that replaces your selected text.",
	snippets : [""],
	colors : new Map(),
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
		.setDesc("Type here your colors separated by a comma")
		.setClass("text-colors-input")
		.addTextArea((text) => {
			text.setPlaceholder("red;green;#ff0000;#00ff00");
			if (this.plugin.settings.snippets_file !== "") {
				text.setValue(this.plugin.settings.snippets_file);
			}
			text.onChange(async (value) => {
				this.plugin.settings.snippets_file = value;
				await this.plugin.saveSettings();
			})
		});


		this.plugin.loadSettings().then(() => {
			const colors = this.plugin.settings.snippets_file.split(";");
			colors.forEach((color) => {
				createColorCommand(color, 'auto-color:'+color , 'auto '+color , this.plugin); 
			});
		});
	}
}