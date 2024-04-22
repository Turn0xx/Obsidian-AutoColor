import { ColorManager } from './../../core/color-managing/color-manager';
import { TextAreaSetting } from "./../../text-area-setting";
import { Observer } from "./observer";
export interface Subject {
	attach(observer: Observer): void;
	detach(observer: Observer): void;
	notifyAdd(colorName: string): void;
	notifyRemove(colorName: string): void;
}
