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

	constructor(app: App, plugin: AutoColorPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this.colorManager = ObsidianColorManager.getInstance();
		this.textAreaSetting = new TextAreaSetting(this.colorManager);
	}

	public async display(): Promise<void> {
		this.prepareTextAreaContainer();
		const displaySetting = new Setting(this.containerEl);

    const colorsPreviewer = ColorPreview.fromColors(await this.colorManager.loadColors());
    this.textAreaSetting.attach(colorsPreviewer);

		displaySetting
			.setName("Colors")
			.setDesc(
				"Type here your colors separated by a comma, after you finish press '!'; it is not going to show on the screen but it is going to refresh the colors table right now otherwise you have to go out of setting and reentre it"
			)
			.setClass("text-colors-input")
			.addTextArea(async (textArea) => {
				await this.textAreaSetting.configure(textArea, displaySetting);
			});

    

    this.prepareAddColorButton();

    
    const addColorSetting = new Setting(this.containerEl);

    let Color = ''

    addColorSetting
      .setName("Add Color")
      .setDesc("Add a new color")
      .addColorPicker((colorPicker) => {
        colorPicker.onChange((color) => {
          Color = color;
        });
      })
      .addButton((button) => {
        button.setButtonText("Add Color").onClick((call) => {
          this.textAreaSetting.addToTextArea(Color);
        });
      });

    const previewColorSetting = new Setting(this.containerEl);

    previewColorSetting
      .setName("Preview Colors")
      .setDesc("Preview your colors")
      .setTooltip("This is a tooltip")
    


    colorsPreviewer.render(previewColorSetting , this.textAreaSetting);


    /*colors.map((color) => {
      displaySetting
        .addColorPicker((colorPicker) => {
          colorPicker
            .setValue(color.unpack())
            .onChange((value) => {
              console.log("Color changed" + value);
            });
        })
        .addButton((button) => {
          button.setButtonText("Remove").onClick(() => {
            this.colorManager.removeColor(color);
          });
        });
    });

		/*.addColorPicker((colorPicker) => {
        displaySetting.setName("Color Picker")
        .setDesc("Pick a color")
        .addButton((button) => {
          button.setButtonText("Change color").onClick(() => {
            console.log("Color changed");
          });
        });
      })*/
	}

	public prepareTextAreaContainer(): void {
		let { containerEl } = this;

		containerEl.empty();
		containerEl.createEl("h1", { text: "Auto Color Plugin" });
		containerEl.createEl("span", { text: " Created By " }).createEl("a", {
			text: "Mouad 👩🏽‍💻",
			href: "https://github.com/Trun0xx",
		});
		containerEl.createEl("h2", { text: "Customize your colors : " });
	}

  public prepareAddColorButton(): void {
    let { containerEl } = this;

    containerEl.createEl("h2", { text: "Color Adding" });
  }

  public preparePreviewColors(): void {
    let { containerEl } = this;

    containerEl.createEl("h2", { text: "Preview Colors" });
  }
}
