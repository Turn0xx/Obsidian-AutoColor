import { MarkdownView, Plugin } from "obsidian";

export class Colorizer {
	private static plugin: Plugin;

	private constructor() {}

	static attachPlugin(plugin: Plugin) {
		Colorizer.plugin = plugin;
	}

	public static changeColor(color: string) {
		const leaf =
			this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
		if (!leaf) return;
		const editor = leaf.editor;
		const cursor = editor.getCursor();
		const token = editor.getSelection();
		if (token) {
			const newToken = `<font style="color:${color}">${token}</font>`;
			editor.replaceSelection(newToken);
			cursor.ch = cursor.ch + newToken.length + 1; //todo regler ca
			editor.setCursor(cursor.line, cursor.ch);
		} else {
			const wordAtCursor = editor.wordAt(cursor);
			if (!wordAtCursor) return;
			editor.setSelection(wordAtCursor.from, wordAtCursor.to);
			const token = editor.getSelection();
			if (token) {
				const newToken = `<font style="color:${color}">${token}</font>`;
				editor.replaceSelection(newToken);
				cursor.ch = wordAtCursor.from.ch + newToken.length + 1;
				editor.setCursor(cursor.line, cursor.ch);
			}
		}
	}

	public static uncolor() {
		const leaf =
			this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
		if (!leaf) return;
		const editor = leaf.editor;
		const cursor = editor.getCursor();
		const currentLine = editor.getLine(cursor.line);

		const fontRegex = /<font style="color:[^>]+>(.*?)<\/font>/g;
		let closestFontTag = null;
		let shortestDistance = Infinity;
		let lastIndex = 0;

		let match;
		while ((match = fontRegex.exec(currentLine)) !== null) {
			const tagStart = match.index;
			const tagEnd = fontRegex.lastIndex;
			const distance = Math.min(
				Math.abs(cursor.ch - tagStart),
				Math.abs(cursor.ch - tagEnd)
			);

			if (distance < shortestDistance) {
				shortestDistance = distance;
				closestFontTag = match;
				lastIndex = tagEnd;
			}
		}

		if (!closestFontTag) {
			return;
		}

		const startOfTag = closestFontTag.index;
		const endOfTag = lastIndex;
		const contentOfTag = closestFontTag[1];

		const beforeTag = currentLine.substring(0, startOfTag);
		const afterTag = currentLine.substring(endOfTag);

		const newLine = beforeTag + contentOfTag + afterTag;



		editor.setLine(cursor.line, newLine);

		let newCursorPos = cursor.ch;
		if (cursor.ch > startOfTag) {
			newCursorPos -= endOfTag - startOfTag - contentOfTag.length;
		}
		editor.setCursor(cursor.line, newCursorPos);
	}
}
