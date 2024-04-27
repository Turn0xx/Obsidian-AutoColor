import { App, Modal } from "obsidian";

import { Root, createRoot } from "react-dom/client";
import * as React from "react";
import ShortCutsComponent from "./short-cuts";
import { ExtentedApp } from "../main";
import { ObsidianColorManager } from "../core/color-managing/color-manager.obsidian";
import { Color } from "../core/color.value-object";

export class ShortCutsModal extends Modal {
	private colorsShortCuts: Root;
	private colorMap: { color: string; shortcut: string }[] = [];

	constructor(
		app: App,
		private pointer: number[],
	) {
		super(app);

		ObsidianColorManager.getInstance()
			.loadColors()
			.then((colors) => {
				this.colorMap = this.mapColorsToShortcuts(colors);
			});
	}

	private mapColorsToShortcuts(colors: Color[]) {
		console.log("Mapping " + colors);
		return colors.map((color, index) => {
			console.log("Color ->", color, index);
			return {
				color: color.unpack(),
				shortcut: (index + 1) as unknown as string,
			};
		});
	}

	public handleKeyDown = (event: KeyboardEvent) => {
		console.log("Key pressed:", event.key);

		const app = this.app as ExtentedApp;

		const allInternalCommands = this.colorMap.map((color, index) => {
			return {
				id: color.shortcut,
				name: `AutoColor ShortCuts:color-${color.color}`,
			};
		});

		// Check if the key pressed is a number
		allInternalCommands.map((command) => {
			if (event.key === command.id.toString()) {
				this.close();

				event.preventDefault();

				console.log("Executing command");
				const commandToExecute = app.commands.findCommand(command.name);
				app.commands.executeCommandById(commandToExecute.id);
				this.pointer[0] = 1;

				return;
			}
		});
	};

	async onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h2", { text: "Shortcuts" });
		contentEl.createDiv({
			text: "Here are the shortcuts you can use:",
		});

		const colors = this.colorMap.map((color) => {
			return Color.from(color.color);
		});

		this.colorsShortCuts = createRoot(contentEl.children[1]);
		this.colorsShortCuts.render(
			<React.StrictMode>
				<div>
					<ShortCutsComponent
						handleKeyDown={this.handleKeyDown}
						colors={colors}
					/>
				</div>
			</React.StrictMode>,
		);
	}

	onClose(): void {
		console.log("Closing Shortcuts Modal");
		document.removeEventListener("keydown", this.handleKeyDown);

		if (this.colorsShortCuts) this.colorsShortCuts.unmount();
	}
}
