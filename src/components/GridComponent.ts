import Phaser from "phaser";
import { getGridLineStyle } from "../design/colors";

export class GridComponent {
	private scene: Phaser.Scene;
	private gridSize: number;
	private gridWidth: number;
	private gridHeight: number;
	private grid!: boolean[][];
	private offsetX: number = 0;
	private offsetY: number = 0;

	constructor(
		scene: Phaser.Scene,
		gridSize: number,
		gridWidth: number,
		gridHeight: number,
	) {
		this.scene = scene;
		this.gridSize = gridSize;
		this.gridWidth = gridWidth;
		this.gridHeight = gridHeight;
		this.calculateCenterOffset();
		this.initializeGrid();
	}

	private calculateCenterOffset() {
		// Center the grid horizontally, but position it higher vertically
		const canvasWidth = this.scene.scale.width;
		const canvasHeight = this.scene.scale.height;
		const gridWidth = this.gridWidth * this.gridSize;
		const gridHeight = this.gridHeight * this.gridSize;

		// Center horizontally
		this.offsetX = (canvasWidth - gridWidth) / 2;

		// Position vertically: leave space at top for Start button (approx 100px)
		// Then add a small margin (20px) below the button
		this.offsetY = 180; // Start button area + margin
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

		// Vertical lines (fix 0.5 unit shift by using integer coordinates)
		for (let x = 0; x <= this.gridWidth; x++) {
			const lineX = this.offsetX + x * this.gridSize;
			graphics.moveTo(lineX, this.offsetY);
			graphics.lineTo(lineX, this.offsetY + this.gridHeight * this.gridSize);
		}

		// Horizontal lines (fix 0.5 unit shift by using integer coordinates)
		for (let y = 0; y <= this.gridHeight; y++) {
			const lineY = this.offsetY + y * this.gridSize;
			graphics.moveTo(this.offsetX, lineY);
			graphics.lineTo(this.offsetX + this.gridWidth * this.gridSize, lineY);
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

	public getOffsetX(): number {
		return this.offsetX;
	}

	public getOffsetY(): number {
		return this.offsetY;
	}
}
