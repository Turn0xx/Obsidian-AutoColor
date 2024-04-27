import { ShortCutsModal } from "./short-cuts-modal.obsidian";
import { App, Plugin } from "obsidian";

export default class ModalDelayer {
	private modal: ShortCutsModal;
	private pointer: number[] = [];

	private constructor(modal: ShortCutsModal, pointer: number[]) {
		this.modal = modal;
		this.pointer = pointer;
	}

	public static from(app: App): ModalDelayer {
		const pointer = [0];

		const modal = new ShortCutsModal(app, pointer);

		const delayer = new ModalDelayer(modal, pointer);

		delayer.startMotion();

		return delayer;
	}

	private startMotion() {
		document.addEventListener("keydown", this.modal.handleKeyDown);

		setTimeout(() => {
			if (this.pointer[0] == 1) {
				return;
			}

			this.modal.open();
		}, 1000);
	}
}
