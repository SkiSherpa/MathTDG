import { Colors } from "../design/colors";
import { Tower, GridGeometry, CreepInteraction } from "./Tower";
import Phaser from "phaser";

export class BasicTower extends Tower {
	constructor(scene: Phaser.Scene, geo: GridGeometry, gridX: number, gridY: number) {
		super(scene, geo, gridX, gridY);
	}

	render(): void {
		const { x, y } = this.gridToScreen(this.gridX, this.gridY);

		const block = this.scene.add.rectangle(
			x, y,
			this.geo.gridSize,
			this.geo.gridSize,
			Colors.towers.background,
		);
		block.setStrokeStyle(2, Colors.towers.border);

		const label = this.scene.add
			.text(x, y - 15, `(${this.coordX},${this.coordY})`, {
				fontSize: "8px",
				color: `#${Colors.towers.label.toString(16).padStart(6, "0")}`,
				fontFamily: "Arial",
			})
			.setOrigin(0.5);

		this.ownedObjects.push(block, label);
	}

	// BasicTower has no effect — onCreepStep stays the base no-op.
	onCreepStep(_i: CreepInteraction): void {}
}
