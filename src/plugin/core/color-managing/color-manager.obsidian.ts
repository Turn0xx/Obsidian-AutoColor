import { Plugin } from "obsidian";
import { ColorManager } from "./color-manager";
import { Color } from "../color.value-object";
import { Subject } from "src/plugin/building-blocks/observability/subject";
import { Observer } from "src/plugin/building-blocks/observability/observer";
import { BasicSubject } from "src/plugin/building-blocks/observability/concrete-subject";

type RawData = {
	_color: string;
};

export class ObsidianColorManager extends BasicSubject implements ColorManager {
	private static instance: ObsidianColorManager;

	public static getInstance(plugin?: Plugin): ObsidianColorManager {
		if (!ObsidianColorManager.instance) {
			if (!plugin) {
				throw new Error("No plugin attached to the color manager instance");
			}
			ObsidianColorManager.instance = new ObsidianColorManager(plugin);
		}
		return ObsidianColorManager.instance;
	}

	private colors: Color[] = [];

	private constructor(private plugin: Plugin) {
		super();
	}


	async loadColors(): Promise<Color[]> {
		await this.loadSettings();

		return this.colors;
	}

	public addColor(color: Color): void {
		console.log("Adding color", color);
		if (this.colors.find((c) => c.equals(color))) {
			return;
		}
		this.colors.push(color);

		this.saveSettings()
			.catch((e) => console.error(e));

		this.notifyAdd(color.unpack());
	}
	public removeColor(color: Color): void {
		this.colors = this.colors.filter((c) => !c.equals(color));

		this.saveSettings()
			.catch((e) => console.error(e));

		this.notifyRemove(color.unpack());
	}

	public async saveSettings(): Promise<void> {
		await this.plugin.saveData(this.colors);
	}

	public async loadSettings(): Promise<void> {
		const rawData: RawData[] = await this.plugin.loadData();

		if (!rawData) return;

		this.colors = rawData.map((data) => {
			this.notifyAdd(data._color);
			return Color.from(data._color)
		});
	}
}
