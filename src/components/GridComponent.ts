import Phaser from "phaser";
import { getGridLineStyle } from "../design/colors";

export class GridComponent {
	private scene: Phaser.Scene;
	private gridSize: number;
	private gridWidth: number;
	private gridHeight: number;
	private grid: boolean[][];

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
		this.initializeGrid();
	}

	private initializeGrid() {
		this.grid = Array(this.gridHeight)
			.fill(null)
			.map(() => Array(this.gridWidth).fill(false));
	}

	public createGrid() {
		// Draw grid lines
		const graphics = this.scene.add.graphics();
		const gridStyle = getGridLineStyle();
		graphics.lineStyle(gridStyle.thickness, gridStyle.color, gridStyle.alpha);

		// Vertical lines
		for (let x = 0; x <= this.gridWidth; x++) {
			graphics.moveTo(x * this.gridSize, 0);
			graphics.lineTo(x * this.gridSize, this.gridHeight * this.gridSize);
		}

		// Horizontal lines
		for (let y = 0; y <= this.gridHeight; y++) {
			graphics.moveTo(0, y * this.gridSize);
			graphics.lineTo(this.gridWidth * this.gridSize, y * this.gridSize);
		}

		graphics.strokePath();
	}

	public isValidPosition(x: number, y: number): boolean {
		return (
			x >= 0 &&
			x < this.gridWidth &&
			y >= 0 &&
			y < this.gridHeight &&
			!this.grid[y][x]
		);
	}

	public occupyCell(x: number, y: number) {
		if (this.isValidPosition(x, y)) {
			this.grid[y][x] = true;
		}
	}

	public getGridSize(): number {
		return this.gridSize;
	}

	public getGridWidth(): number {
		return this.gridWidth;
	}

	public getGridHeight(): number {
		return this.gridHeight;
	}

	public getGrid(): boolean[][] {
		return this.grid;
	}
}
