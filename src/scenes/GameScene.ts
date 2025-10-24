import Phaser from "phaser";
import { Colors, getGridLineStyle, getAxisLineStyle } from "../design/colors";

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

		// Draw coordinate axes through Origin
		this.createCoordinateAxes();
	}

	private createCoordinateAxes() {
		// Calculate Origin position (same as in createOrigin)
		const originX = (this.gridWidth / 2) * this.gridSize;
		const originY = (this.gridHeight / 2) * this.gridSize;

		// Create axes graphics
		const axesGraphics = this.add.graphics();

		// X-axis (horizontal line through Origin)
		const axisStyle = getAxisLineStyle();
		axesGraphics.lineStyle(axisStyle.thickness, Colors.axes.xAxis, 1);
		axesGraphics.moveTo(0, originY);
		axesGraphics.lineTo(this.gridWidth * this.gridSize, originY);

		// Y-axis (vertical line through Origin)
		axesGraphics.lineStyle(axisStyle.thickness, Colors.axes.yAxis, 1);
		axesGraphics.moveTo(originX, 0);
		axesGraphics.lineTo(originX, this.gridHeight * this.gridSize);

		axesGraphics.strokePath();

		// Add axis labels
		this.add.text(originX + 10, 10, "Y", {
			fontSize: "16px",
			color: `#${Colors.axes.yAxis.toString(16).padStart(6, "0")}`,
			fontFamily: "Arial",
		});

		this.add.text(this.gridWidth * this.gridSize - 20, originY - 10, "X", {
			fontSize: "16px",
			color: `#${Colors.axes.xAxis.toString(16).padStart(6, "0")}`,
			fontFamily: "Arial",
		});

		// Add coordinate labels along axes
		this.addCoordinateLabels(originX, originY);
	}

	private addCoordinateLabels(originX: number, originY: number) {
		// Add coordinate numbers along X-axis
		for (let x = 0; x <= this.gridWidth; x += 4) {
			const worldX = x * this.gridSize;
			if (worldX !== originX) {
				// Don't label the origin itself
				const coordX = x - this.gridWidth / 2;
				this.add
					.text(worldX, originY + 15, coordX.toString(), {
						fontSize: "10px",
						color: `#${Colors.coordinates.xLabels
							.toString(16)
							.padStart(6, "0")}`,
						fontFamily: "Arial",
					})
					.setOrigin(0.5);
			}
		}

		// Add coordinate numbers along Y-axis
		for (let y = 0; y <= this.gridHeight; y += 4) {
			const worldY = y * this.gridSize;
			if (worldY !== originY) {
				// Don't label the origin itself
				const coordY = this.gridHeight / 2 - y;
				this.add
					.text(originX - 15, worldY, coordY.toString(), {
						fontSize: "10px",
						color: `#${Colors.coordinates.yLabels
							.toString(16)
							.padStart(6, "0")}`,
						fontFamily: "Arial",
					})
					.setOrigin(0.5);
			}
		}

		// Add origin label (0,0)
		this.add.text(originX - 20, originY + 20, "(0,0)", {
			fontSize: "12px",
			color: `#${Colors.coordinates.originLabel.toString(16).padStart(6, "0")}`,
			fontFamily: "Arial",
		});
	}

	private createOrigin() {
		// Place Origin at the center of the grid for proper four-quadrant system
		const originX = (this.gridWidth / 2) * this.gridSize;
		const originY = (this.gridHeight / 2) * this.gridSize;

		this.origin = this.add.rectangle(
			originX,
			originY,
			this.gridSize,
			this.gridSize,
			Colors.origin.background
		);

		// Add label
		this.add
			.text(originX, originY, "ORIGIN", {
				fontSize: "10px",
				color: `#${Colors.origin.label.toString(16).padStart(6, "0")}`,
				fontFamily: "Arial",
			})
			.setOrigin(0.5);

		// Mark single grid cell as occupied
		this.grid[Math.floor(originY / this.gridSize)][
			Math.floor(originX / this.gridSize)
		] = true;
	}

	private createUI() {
		// Game phase indicator
		this.add
			.text(10, 10, `Phase: ${this.gamePhase.toUpperCase()}`, {
				fontSize: "16px",
				color: `#${Colors.ui.primary.toString(16).padStart(6, "0")}`,
				fontFamily: "Arial",
			})
			.setOrigin(0, 0);

		// Instructions
		this.add
			.text(10, 30, "Click on empty grid cells to place towers", {
				fontSize: "12px",
				color: `#${Colors.ui.secondary.toString(16).padStart(6, "0")}`,
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
			Colors.towers.background
		);
		this.towers.push(tower);

		// Mark grid cell as occupied
		this.grid[gridY][gridX] = true;

		// Calculate coordinate system position (center-based)
		const originGridX = this.gridWidth / 2;
		const originGridY = this.gridHeight / 2;
		const coordX = gridX - originGridX;
		const coordY = originGridY - gridY;

		console.log(
			`Tower placed at grid position (${gridX}, ${gridY}) - Coordinates: (${coordX}, ${coordY})`
		);

		// Add coordinate label above tower
		this.add
			.text(x, y - this.gridSize / 2 - 5, `(${coordX},${coordY})`, {
				fontSize: "8px",
				color: `#${Colors.towers.label.toString(16).padStart(6, "0")}`,
				fontFamily: "Arial",
			})
			.setOrigin(0.5);
	}

	update() {
		// Game update logic will go here
	}
}
