/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Hotkey, MarkdownView, Notice, Setting } from "obsidian";
import AutoColorPlugin from "src/plugin/main";
import { colorKeyWords } from "./colorKeyWords";

export async function createColorCommand(color : string ,id : string , name : string , plugin : AutoColorPlugin ,shortcut ?: Hotkey[]): Promise<void> {

    if (verifyColor(color) == undefined){
        console.log('Invalid color :' + color);
        return;
    }


    plugin.addCommand({
        id: id,
        name: name,
        hotkeys: shortcut,
        checkCallback: (checking: boolean) => {
            if (checking) return true;
            changeColor(color , plugin);
        }
    });
    console.log(color , id , name , shortcut);
    plugin.settings.registeredColors.push(color);
    await plugin.saveSettings();
}

export function createNewColorSettings(container : HTMLElement , plugin : AutoColorPlugin): any {
    new Setting(container)
		.setName("Colors")
		.setDesc("Type here your color name or hex code")
		// .setClass("text-colors-input")
		.addTextArea((text) =>
			text
			.setPlaceholder("red or #00ff00 or 00ff00 ...")
			.onChange(async (value) => {
				plugin.settings.colors = value;
				await plugin.saveSettings();
                return container;
			})
		);
}

export function changeColor(color : string , plugin : AutoColorPlugin): void {
    if (!plugin.settings.registeredColors.contains(color)){
        new Notice("This color have been deleted - please reload the plugin");
        return;
    }
    const leaf = plugin.app.workspace.getActiveViewOfType(MarkdownView);
    if (!leaf) return
    const editor = leaf.editor;
    const cursor = editor.getCursor();
    const token = editor.getSelection();
    if (token){
        const newToken = `<font style="color:${color}">${token}</font>`;
        const newTokenLength = newToken.length + 1;
        editor.replaceSelection(newToken + ' ');
        cursor.ch = cursor.ch + newTokenLength;		
    }else{
        const wordAtCursor = editor.wordAt(cursor);
        if (!wordAtCursor) return;
        editor.setSelection(wordAtCursor.from, wordAtCursor.to);
        const token = editor.getSelection();
        if (token){
            const newToken = `<font style="color:${color}">${token}</font>`;
            const newTokenLength = newToken.length + 1;
            editor.replaceSelection(newToken + ' ');
            cursor.ch = cursor.ch + newTokenLength;
        }
    }
}

export function verifyColor(color: string): string | undefined {
    if (colorKeyWords.includes(color)) return color;
    let regex = new RegExp('/^#[a-f0-9]{6}$/i');
    if (regex.test(color)) 
        return color;
    else{
        regex = new RegExp('/^[a-f0-9]{3}$/i');
        if (regex.test(color))
            return "#"+color;
    }
}

export async function loadShortcuts(plugin : AutoColorPlugin , value ?: string): Promise<void> {
    await plugin.loadSettings().then(() => {
        const colors = plugin.settings.colors.split(";");
        colors.forEach((color) => {
            if (!plugin.settings.registeredColors.contains(color)) {
                createColorCommand(color, 'auto-color:'+color , 'auto '+color , plugin); 
            }
        });
    });
}

export async function checkRegisteredCommands(plugin : AutoColorPlugin): Promise<void> {
    await plugin.loadSettings()
        .then(() => {
            const registredCommands : string[] = plugin.settings.registeredColors;
            const colors = plugin.settings.colors.split(";");
            let isModifier : boolean = false;
            registredCommands.forEach(async (color) => {
                if (!colors.contains(color)){
                    console.log('Modified registered colors : ' + plugin.settings.registeredColors);
                    plugin.settings.registeredColors.remove(color);
                    console.log('Modified registered colors after change : ' + plugin.settings.registeredColors);
                    isModifier = true;
                }
                if (isModifier){
                    console.log('color : ' + color);
                    await plugin.saveSettings();
                    new Notice("Some color(s) have been deleted their shortcuts don't going to work but they still in the plugin shortcuts - reload the plugin to not see them" , 10);
                } 
            });
    });
}
