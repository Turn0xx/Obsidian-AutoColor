import {Hotkey, MarkdownView , Plugin, } from 'obsidian';




export default class MyPlugin extends Plugin {

	async onload() {
		this.createColorCommand('red', 'perso-red' , 'perso' , [{modifiers: ['Mod', 'Shift'], key: 'R'}]);
		this.createColorCommand('blue', 'perso-green' , 'perso' , [{modifiers: ['Mod', 'Shift'], key: 'B'}]);
	}

	onunload(): void {

	}

	createColorCommand(color : string ,id : string , name : string , shortcut : Hotkey[] ): void {
		this.addCommand({
			id: id,
			name: name,
			hotkeys: shortcut,
			checkCallback: (checking: boolean) => {
				this.changeColor(color);
				return true;
			}
		});
	}

	changeColor(color : string): void {
		const leaf = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!leaf) return
		const editor = leaf.editor;
		const cursor = editor.getCursor();
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
