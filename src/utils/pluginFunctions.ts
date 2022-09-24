/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import {EditorPosition, Hotkey, MarkdownView, Notice, Setting } from "obsidian";
import AutoColorPlugin from "src/plugin/main";
import { findSequenceFromCursor, getWorldFromFont, verifyColor } from "./helpers";

export async function createColorCommand(color : string ,id : string , name : string , plugin : AutoColorPlugin ,shortcut ?: Hotkey[] , isUnColor?: boolean): Promise<void> {

    if (verifyColor(color) == undefined && !isUnColor) {
        console.log('Invalid color :' + color);
        return;
    }
    plugin.addCommand({
        id: id,
        name: name,
        hotkeys: shortcut,
        checkCallback: (checking: boolean) => {
            // if (checking) return true;
            if (isUnColor === undefined)
                changeColor(color , plugin);
            else{
                unColor(plugin);
            }
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

export function unColor(plugin : AutoColorPlugin): void {
    const leaf = plugin.app.workspace.getActiveViewOfType(MarkdownView);
    if (!leaf) return
    const editor = leaf.editor;
    const cursor = editor.getCursor();
    const token = editor.getSelection();
    if (!token){
        const commandValidator : EditorPosition = {line: cursor.line , ch: cursor.ch - 1};
        editor.setSelection(cursor , commandValidator);
        if (!editor.getSelection()) return;
        
        if (editor.getSelection() !== '>'){
            console.error('Error : \'>\' not found');
            return;
        } 
        const currentLine : string = editor.getLine(cursor.line);
        const fontRegex : RegExp = new RegExp('<font style="color:.*">.*</font>');
        const match : RegExpMatchArray | null = findSequenceFromCursor(currentLine , fontRegex , cursor , 5);
        if (!match) return;
        const coloredWord = getWorldFromFont(match[0]);
        if (!coloredWord) return;
        const word = coloredWord[0].substring(1 , coloredWord[0].length - 1);
        const newLine = currentLine.replace(match[0] , word);
        const offset = currentLine.length - newLine.length;
        editor.setLine(cursor.line , newLine);
        editor.setCursor(cursor.line , cursor.ch - offset);
    }
}

export async function checkRegisteredCommands(plugin : AutoColorPlugin): Promise<void> {
    await plugin.loadSettings()
        .then(async () => {
            const registredCommands : string[] = plugin.settings.registeredColors;
            const colors = plugin.settings.colors.split(";");
            const preSet = plugin.settings.preSet;
            let isModifier : boolean = false;
            registredCommands.forEach((color) => {
                if (!colors.contains(color) && color !== preSet){
                    console.warn('Color : ' + color + ' not found in settings');
                    plugin.settings.registeredColors.remove(color);
                    isModifier = true;
                }    
            });
            if (isModifier){
                await plugin.saveSettings();
                new Notice("Some color(s) have been deleted their shortcuts don't going to work but they still in the plugin shortcuts - reload the plugin to not see them" , 10000);
            }
    });
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