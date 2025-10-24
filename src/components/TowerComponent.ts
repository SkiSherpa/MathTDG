import Phaser from "phaser";
import { Colors } from "../design/colors";

export interface Tower {
	gameObject: Phaser.GameObjects.Rectangle;
	gridX: number;
	gridY: number;
	coordX: number;
	coordY: number;
}

export class TowerComponent {
	private scene: Phaser.Scene;
	private gridSize: number;
	private gridWidth: number;
	private gridHeight: number;
	private towers: Tower[] = [];

	constructor(
		scene: Phaser.Scene,
		gridSize: number,
		gridWidth: number,
		gridHeight: number
	) {
		this.scene = scene;
		this.gridSize = gridSize;
		this.gridWidth = gridWidth;
		this.gridHeight = gridHeight;
	}

	public placeTower(gridX: number, gridY: number): Tower | null {
		// Place tower at grid line intersection (like Origin)
		const x = gridX * this.gridSize;
		const y = gridY * this.gridSize;

		// Create tower visual
		const towerGameObject = this.scene.add.rectangle(
			x,
			y,
			this.gridSize * 0.8,
			this.gridSize * 0.8,
			Colors.towers.background
		);

		// Calculate coordinate system position (center-based)
		const originGridX = this.gridWidth / 2;
		const originGridY = this.gridHeight / 2;
		const coordX = gridX - originGridX;
		const coordY = originGridY - gridY;

		const tower: Tower = {
			gameObject: towerGameObject,
			gridX,
			gridY,
			coordX,
			coordY,
		};

		this.towers.push(tower);

		// Add coordinate label above tower (positioned relative to intersection)
		this.scene.add
			.text(x, y - 15, `(${coordX},${coordY})`, {
				fontSize: "8px",
				color: `#${Colors.towers.label.toString(16).padStart(6, "0")}`,
				fontFamily: "Arial",
			})
			.setOrigin(0.5);

		console.log(
			`Tower placed at grid position (${gridX}, ${gridY}) - Coordinates: (${coordX}, ${coordY})`
		);

		return tower;
	}

	public getTowers(): Tower[] {
		return this.towers;
	}

	public getTowerCount(): number {
		return this.towers.length;
	}

	public removeTower(tower: Tower) {
		const index = this.towers.indexOf(tower);
		if (index > -1) {
			tower.gameObject.destroy();
			this.towers.splice(index, 1);
		}
	}

	public clearAllTowers() {
		this.towers.forEach((tower) => tower.gameObject.destroy());
		this.towers = [];
	}
}
