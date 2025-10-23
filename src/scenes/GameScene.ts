import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {
	private gridSize: number = 32; // Size of each grid cell
	private gridWidth: number = 32; // Number of grid cells horizontally
	private gridHeight: number = 24; // Number of grid cells vertically
	private grid!: boolean[][]; // 2D array to track occupied cells
	private origin!: Phaser.GameObjects.Rectangle;
	private towers: Phaser.GameObjects.Rectangle[] = [];
	private gamePhase: "placement" | "action" = "placement";

	constructor() {
		super({ key: "GameScene" });
	}

	create() {
		console.log("GameScene created!");

		// Initialize grid
		this.grid = Array(this.gridHeight)
			.fill(null)
			.map(() => Array(this.gridWidth).fill(false));

		// Create the game board background
		this.createGameBoard();

		// Create the Origin (home base)
		this.createOrigin();

		// Add UI for game phase
		this.createUI();

		// Add click handler for tower placement
		this.input.on("pointerdown", this.onGridClick, this);
	}

	private createGameBoard() {
		// Draw grid lines
		const graphics = this.add.graphics();
		graphics.lineStyle(1, 0x34495e, 0.5);

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

	private createOrigin() {
		// Place Origin at the center-right of the grid
		const originX = (this.gridWidth - 2) * this.gridSize;
		const originY = (this.gridHeight / 2) * this.gridSize;

		this.origin = this.add.rectangle(
			originX + this.gridSize / 2,
			originY + this.gridSize / 2,
			this.gridSize * 2,
			this.gridSize * 2,
			0xe74c3c
		);

		// Add label
		this.add
			.text(originX + this.gridSize, originY + this.gridSize, "ORIGIN", {
				fontSize: "12px",
				color: "#ffffff",
				fontFamily: "Arial",
			})
			.setOrigin(0.5);

		// Mark grid cells as occupied
		this.grid[Math.floor(originY / this.gridSize)][
			Math.floor(originX / this.gridSize)
		] = true;
		this.grid[Math.floor(originY / this.gridSize)][
			Math.floor(originX / this.gridSize) + 1
		] = true;
		this.grid[Math.floor(originY / this.gridSize) + 1][
			Math.floor(originX / this.gridSize)
		] = true;
		this.grid[Math.floor(originY / this.gridSize) + 1][
			Math.floor(originX / this.gridSize) + 1
		] = true;
	}

	private createUI() {
		// Game phase indicator
		this.add
			.text(10, 10, `Phase: ${this.gamePhase.toUpperCase()}`, {
				fontSize: "16px",
				color: "#ffffff",
				fontFamily: "Arial",
			})
			.setOrigin(0, 0);

		// Instructions
		this.add
			.text(10, 30, "Click on empty grid cells to place towers", {
				fontSize: "12px",
				color: "#bdc3c7",
				fontFamily: "Arial",
			})
			.setOrigin(0, 0);
	}

	private onGridClick(pointer: Phaser.Input.Pointer) {
		if (this.gamePhase !== "placement") return;

		const gridX = Math.floor(pointer.x / this.gridSize);
		const gridY = Math.floor(pointer.y / this.gridSize);

		// Check if position is valid
		if (this.isValidTowerPosition(gridX, gridY)) {
			this.placeTower(gridX, gridY);
		}
	}

	private isValidTowerPosition(x: number, y: number): boolean {
		return (
			x >= 0 &&
			x < this.gridWidth &&
			y >= 0 &&
			y < this.gridHeight &&
			!this.grid[y][x]
		);
	}

	private placeTower(gridX: number, gridY: number) {
		const x = gridX * this.gridSize + this.gridSize / 2;
		const y = gridY * this.gridSize + this.gridSize / 2;

		// Create tower visual
		const tower = this.add.rectangle(
			x,
			y,
			this.gridSize * 0.8,
			this.gridSize * 0.8,
			0x3498db
		);
		this.towers.push(tower);

		// Mark grid cell as occupied
		this.grid[gridY][gridX] = true;

		console.log(`Tower placed at grid position (${gridX}, ${gridY})`);
	}

	update() {
		// Game update logic will go here
	}
}
