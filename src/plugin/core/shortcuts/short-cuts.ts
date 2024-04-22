import { Observer } from "src/plugin/building-blocks/observability/observer";

export interface ShortCuts{
    addCommand(colorName: string): void;
    removeCommand(): void;
}