import Phaser from "phaser";
import { Colors } from "../design/colors";

export interface Tower {
	gameObject: Phaser.GameObjects.Rectangle;
	gridX: number;
	gridY: number;
	coordX: number;
	coordY: number;
	equation?: { m: number; b: number };
	laserGraphics?: Phaser.GameObjects.Graphics;
}

export class TowerComponent {
	private scene: Phaser.Scene;
	private gridSize: number;
	private gridWidth: number;
	private gridHeight: number;
	private offsetX: number = 0;
	private offsetY: number = 0;
	private towers: Tower[] = [];

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

	public placeTower(gridX: number, gridY: number, equation?: { m: number; b: number }): Tower | null {
		const x = this.offsetX + gridX * this.gridSize;
		const y = this.offsetY + gridY * this.gridSize;

		const towerGameObject = this.scene.add.rectangle(
			x,
			y,
			this.gridSize,
			this.gridSize,
			Colors.towers.background
		);
		towerGameObject.setStrokeStyle(2, Colors.towers.border);

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
			equation,
		};

		this.towers.push(tower);

		this.scene.add
			.text(x, y - 15, `(${coordX},${coordY})`, {
				fontSize: "8px",
				color: `#${Colors.towers.label.toString(16).padStart(6, "0")}`,
				fontFamily: "Arial",
			})
			.setOrigin(0.5);

		if (equation) {
			this.drawLaserLine(tower, equation.m, equation.b);
		}

		console.log(
			`Tower placed at grid position (${gridX}, ${gridY}) - Coordinates: (${coordX}, ${coordY})`
		);

		return tower;
	}

	private drawLaserLine(tower: Tower, m: number, b: number) {
		const clip = this.clipLineToGrid(m, b);
		if (!clip) return;

		const originGridX = Math.floor(this.gridWidth / 2); // 10
		const originGridY = Math.floor(this.gridHeight / 2); // 10

		// Math coords → screen coords
		const sx1 = this.offsetX + (clip.x1 + originGridX) * this.gridSize;
		const sy1 = this.offsetY + (originGridY - clip.y1) * this.gridSize;
		const sx2 = this.offsetX + (clip.x2 + originGridX) * this.gridSize;
		const sy2 = this.offsetY + (originGridY - clip.y2) * this.gridSize;

		const g = this.scene.add.graphics();
		g.setDepth(2);

		// Glow layer
		g.lineStyle(6, Colors.towers.background, 0.25);
		g.beginPath();
		g.moveTo(sx1, sy1);
		g.lineTo(sx2, sy2);
		g.strokePath();

		// Core laser
		g.lineStyle(2, Colors.towers.border, 0.9);
		g.beginPath();
		g.moveTo(sx1, sy1);
		g.lineTo(sx2, sy2);
		g.strokePath();

		tower.laserGraphics = g;
	}

	// Clips y = mx + b to the grid math-coordinate rectangle [-10,10] × [-10,10].
	// Returns the two endpoints of the visible segment, or null if fully off-screen.
	private clipLineToGrid(m: number, b: number): { x1: number; y1: number; x2: number; y2: number } | null {
		const XMIN = -Math.floor(this.gridWidth / 2);   // -10
		const XMAX =  Math.floor(this.gridWidth / 2);   //  10
		const YMIN = -Math.floor(this.gridHeight / 2);  // -10
		const YMAX =  Math.floor(this.gridHeight / 2);  //  10

		if (m === 0) {
			if (b < YMIN || b > YMAX) return null;
			return { x1: XMIN, y1: b, x2: XMAX, y2: b };
		}

		let x1 = XMIN, y1 = m * XMIN + b;
		let x2 = XMAX, y2 = m * XMAX + b;

		if (y1 < YMIN) { x1 = (YMIN - b) / m; y1 = YMIN; }
		else if (y1 > YMAX) { x1 = (YMAX - b) / m; y1 = YMAX; }

		if (y2 < YMIN) { x2 = (YMIN - b) / m; y2 = YMIN; }
		else if (y2 > YMAX) { x2 = (YMAX - b) / m; y2 = YMAX; }

		if (x1 > x2 || x1 > XMAX || x2 < XMIN) return null;
		x1 = Math.max(x1, XMIN);
		x2 = Math.min(x2, XMAX);

		return { x1, y1: m * x1 + b, x2, y2: m * x2 + b };
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
			tower.laserGraphics?.destroy();
			this.towers.splice(index, 1);
		}
	}

	public clearAllTowers() {
		this.towers.forEach((tower) => {
			tower.gameObject.destroy();
			tower.laserGraphics?.destroy();
		});
		this.towers = [];
	}
}
