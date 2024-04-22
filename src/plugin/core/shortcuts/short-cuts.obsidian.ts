import { ColorManager } from "../color-managing/color-manager";
import { ActionType } from "../../building-blocks/observability/observer";
import { Command, Notice, Plugin } from "obsidian";
import { ObsidianColorManager } from "../color-managing/color-manager.obsidian";
import { Observer } from "src/plugin/building-blocks/observability/observer";
import { Colorizer } from "../colorizer.obsidian";
import { ShortCuts } from "./short-cuts";

export class ObsidianShortCuts implements ShortCuts , Observer {
	private static commands: Command[] = [];

	private static instance: ObsidianShortCuts;

	public static getInstance(plugin: Plugin): ObsidianShortCuts {
		if (!ObsidianShortCuts.instance) {
			ObsidianShortCuts.instance = new ObsidianShortCuts(plugin);
		}
		return ObsidianShortCuts.instance;
	}

	private constructor(private plugin: Plugin) {}

	update(actionType: ActionType, colorName: string): void {
		if (actionType === "add") {
			this.addCommand(colorName);
		} else if (actionType === "remove") {
			this.removeCommand();
		}
	}

	public addCommand(colorName: string) {
		if (ObsidianShortCuts.commands.find((c) => c.id.endsWith(colorName))) {
			// console.log(`Command color-${colorName} already exists`);
			return;
		}

		ObsidianShortCuts.commands.push(
			this.plugin.addCommand({
				id: `color-${colorName}`,
				name: `Color ${colorName}`,
				checkCallback: (checking: boolean) => {
					console.log(ObsidianShortCuts.commands);
					if (
						ObsidianShortCuts.commands.find((c) => c.id.endsWith(colorName))
					) {
						Colorizer.changeColor(colorName);
						return true;
					}

					new Notice(
						`Color ${colorName} has been deleted - please reload the plugin`
					);
				},
			})
		);

		console.log(`Command color-${colorName} added`);
	}

	public removeCommand() {
		const command = ObsidianShortCuts.commands.pop();
		if (!command) {
			console.log(`No commands to remove`);
			return;
		}

		console.log(`Command ${command.id} removed`);
	}

	public addEssentialCommands() {
		ObsidianShortCuts.commands.push(
			this.plugin.addCommand({
				id: "uncolore",
				name: "Uncolore - remove color",
				checkCallback: (checking: boolean) => {
					Colorizer.uncolor();
					return true;
				},
				hotkeys: [{modifiers: ['Mod', 'Shift'], key: '`'}]
			})
		);
	}
}
