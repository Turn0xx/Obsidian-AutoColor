/* eslint-disable prefer-const */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {Hotkey, MarkdownView , Plugin, Setting , PluginSettingTab, App } from 'obsidian';
import { checkRegisteredCommands, createColorCommand, loadShortcuts} from 'src/utils/pluginFunctions';

export default class AutoColorPlugin extends Plugin {

	settings: ColorSettings;

	async onload() {
		console.log(this.manifest.name+" v" + this.manifest.version + " loaded - Author : " + this.manifest.author);
		await this.loadSettings();
		this.addSettingTab(new ColorSettingsTab(this.app, this));
		createColorCommand('unColor', 'auto-color: Uncolor' , 'Uncolor' ,  this , [{modifiers: ['Mod', 'Shift'], key: '*'}] , true);
		await loadShortcuts(this);
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
	preSet: string,
	registeredColors: string[],
}


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DEFAULT_SETTINGS: ColorSettings = {
	colors : "",
	preSet : "unColor",
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
					this.plugin.loadSettings();
					value = value.slice(0, -1);
					text.setValue(value);
					await loadShortcuts(this.plugin);
					await checkRegisteredCommands(this.plugin);
				}
				this.plugin.settings.colors = value;
				await this.plugin.saveSettings();
			})
		});


		this.plugin.loadSettings().then(() => {
			const colors = this.plugin.settings.colors.split(";").slice(0, -1);
			colors.forEach((color) => {
				if (!this.plugin.settings.registeredColors.contains(color)) {
					console.log("Creating Color : " + color);
					createColorCommand(color, 'auto-color:'+color , 'auto '+color , this.plugin); 
				}
			});
		});
	}
}