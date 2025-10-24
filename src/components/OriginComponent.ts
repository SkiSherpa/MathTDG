import Phaser from "phaser";
import { Colors } from "../design/colors";

export class OriginComponent {
	private scene: Phaser.Scene;
	private gridSize: number;
	private gridWidth: number;
	private gridHeight: number;
	private offsetX: number = 0;
	private offsetY: number = 0;
	private origin!: Phaser.GameObjects.Rectangle;

	constructor(
		scene: Phaser.Scene,
		gridSize: number,
		gridWidth: number,
		gridHeight: number,
		offsetX: number = 0,
		offsetY: number = 0
	) {
		this.scene = scene;
		this.gridSize = gridSize;
		this.gridWidth = gridWidth;
		this.gridHeight = gridHeight;
		this.offsetX = offsetX;
		this.offsetY = offsetY;
	}

	public createOrigin() {
		// Place Origin at the center of the grid for proper four-quadrant system
		const centerGridX = Math.floor(this.gridWidth / 2);
		const centerGridY = Math.floor(this.gridHeight / 2);
		const originX = this.offsetX + centerGridX * this.gridSize;
		const originY = this.offsetY + centerGridY * this.gridSize;

		this.origin = this.scene.add.rectangle(
			originX,
			originY,
			this.gridSize,
			this.gridSize,
			Colors.origin.background
		);

		// Add label
		this.scene.add
			.text(originX, originY, "ORIGIN", {
				fontSize: "10px",
				color: `#${Colors.origin.label.toString(16).padStart(6, "0")}`,
				fontFamily: "Arial",
			})
			.setOrigin(0.5);

		return {
			gridX: Math.floor(originX / this.gridSize),
			gridY: Math.floor(originY / this.gridSize),
		};
	}

	public getOrigin(): Phaser.GameObjects.Rectangle {
		return this.origin;
	}
}
