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

	constructor(app: App) {
		super(app);
	}

  private mapColorsToShortcuts(colors: Color[]) {
    return colors.map((color , index) => {
      console.log("Color ->", color , index);
      return {
        color: color.unpack(),
        shortcut: index +1 as unknown as string,
      };
    });
  }

	handleKeyDown = (event: KeyboardEvent) => {
		console.log("Key pressed:", event.key);

		const app = this.app as ExtentedApp;

    const allInternalCommands = this.colorMap.map((color , index) => {
      return {
        id: color.shortcut,
        name: `AutoColor ShortCuts:color-${color.color}`
      }
    });

    // Check if the key pressed is a number
    allInternalCommands.map((command) => {
      if (event.key === command.id.toString()) {
        this.close();

        event.preventDefault();

        console.log("Executing command");
        const commandToExecute = app.commands.findCommand(
          command.name
        );
        app.commands.executeCommandById(commandToExecute.id);

        return;
      }
    });
	};

	async onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h2", { text: "Shortcuts" });
		contentEl.createDiv({ text: "Here are the shortcuts you can use:" });

		this.colorsShortCuts = createRoot(contentEl.children[1]);

    const colors = await ObsidianColorManager.getInstance().loadColors();
    this.colorMap = this.mapColorsToShortcuts(colors);

		this.colorsShortCuts.render(
			<React.StrictMode>
				<div>
					<ShortCutsComponent
						handleKeyDown={this.handleKeyDown}
            colors={colors}
					/>
				</div>
			</React.StrictMode>
		);
	}

	onClose(): void {
		console.log("Closing Shortcuts Modal");
		document.removeEventListener("keydown", this.handleKeyDown);
		this.colorsShortCuts.unmount();
	}
}
