import Phaser from "phaser";
import { Colors } from "../design/colors";

export class UIComponent {
	private scene: Phaser.Scene;
	private gamePhase: "placement" | "action" = "placement";
	private phaseText!: Phaser.GameObjects.Text;
	private instructionsText!: Phaser.GameObjects.Text;

	constructor(scene: Phaser.Scene) {
		this.scene = scene;
	}

	public createUI() {
		// Game phase indicator
		this.phaseText = this.scene.add
			.text(10, 10, `Phase: ${this.gamePhase.toUpperCase()}`, {
				fontSize: "16px",
				color: `#${Colors.ui.primary.toString(16).padStart(6, "0")}`,
				fontFamily: "Arial",
			})
			.setOrigin(0, 0);

		// Instructions
		this.instructionsText = this.scene.add
			.text(10, 30, "Click on empty grid cells to place towers", {
				fontSize: "12px",
				color: `#${Colors.ui.secondary.toString(16).padStart(6, "0")}`,
				fontFamily: "Arial",
			})
			.setOrigin(0, 0);
	}

	public setGamePhase(phase: "placement" | "action") {
		this.gamePhase = phase;
		if (this.phaseText) {
			this.phaseText.setText(`Phase: ${this.gamePhase.toUpperCase()}`);
		}
	}

	public getGamePhase(): "placement" | "action" {
		return this.gamePhase;
	}

	public updateInstructions(text: string) {
		if (this.instructionsText) {
			this.instructionsText.setText(text);
		}
	}

	public addText(
		x: number,
		y: number,
		text: string,
		style?: Phaser.Types.GameObjects.Text.TextStyle
	) {
		return this.scene.add.text(x, y, text, {
			fontSize: "12px",
			color: `#${Colors.ui.primary.toString(16).padStart(6, "0")}`,
			fontFamily: "Arial",
			...style,
		});
	}
}
