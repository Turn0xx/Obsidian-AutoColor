import { Hotkey, MarkdownView, Setting } from "obsidian";
import AutoColorPlugin from "src/plugin/main";
import { colorKeyWords } from "./colorKeyWords";

export function createColorCommand(color : string ,id : string , name : string , plugin : AutoColorPlugin ,shortcut ?: Hotkey[]): void {

    if (verifyColor(color) == undefined){
        console.log('Invalid color :' + color);
        return;
    }
    plugin.addCommand({
        id: id,
        name: name,
        hotkeys: shortcut,
        callback: () => {
            changeColor(color , plugin);
        },
    });
    console.log(color , id , name , shortcut);
    plugin.settings.registeredColors.push(color);
    plugin.saveSettings();
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

export function loadShortcuts(plugin : AutoColorPlugin , value ?: string): void {
    plugin.loadSettings().then(() => {
        const colors = plugin.settings.colors.split(";");
        colors.forEach((color) => {
            if (!plugin.settings.registeredColors.contains(color)) {
                createColorCommand(color, 'auto-color:'+color , 'auto '+color , plugin); 
            }
        });
    });
}
