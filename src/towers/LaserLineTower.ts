import Phaser from "phaser";
import { Colors } from "../design/colors";
import { Tower, GridGeometry, CreepInteraction } from "./Tower";

export class LaserLineTower extends Tower {
	private readonly m: number;
	private readonly b: number;

	constructor(
		scene: Phaser.Scene,
		geo: GridGeometry,
		gridX: number,
		gridY: number,
		equation: { m: number; b: number },
	) {
		super(scene, geo, gridX, gridY);
		this.m = equation.m;
		this.b = equation.b;
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

		this.drawLaser();
	}

	onCreepStep(i: CreepInteraction): void {
		const from = this.gridToMath(i.fromGridX, i.fromGridY);
		const to   = this.gridToMath(i.toGridX,   i.toGridY);

		// Signed distance from each endpoint to the line y = mx + b
		const f1 = from.y - (this.m * from.x + this.b);
		const f2 = to.y   - (this.m * to.x   + this.b);

		if (f1 * f2 > 0) return; // Same side — no crossing

		const denom = f1 - f2;
		if (Math.abs(denom) < 1e-10) return; // Segment parallel to line

		// x-coordinate of the crossing point — must lie within the visible laser
		const xCross = from.x + (f1 / denom) * (to.x - from.x);
		const half = Math.floor(this.geo.gridWidth / 2);
		if (xCross >= -half && xCross <= half) i.kill();
	}

	// ── Private ──────────────────────────────────────────────────────────────

	private drawLaser(): void {
		const clip = this.clipLineToGrid();
		if (!clip) return;

		const ox = Math.floor(this.geo.gridWidth  / 2);
		const oy = Math.floor(this.geo.gridHeight / 2);

		// Clipped math coords → screen coords
		const { x: sx1, y: sy1 } = this.gridToScreen(clip.x1 + ox, oy - clip.y1);
		const { x: sx2, y: sy2 } = this.gridToScreen(clip.x2 + ox, oy - clip.y2);

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

		this.ownedObjects.push(g);
	}

	// Clips y = mx + b to the grid's math-coordinate bounds [-half, half]².
	// Returns the two visible endpoints, or null if the line misses the grid.
	private clipLineToGrid(): { x1: number; y1: number; x2: number; y2: number } | null {
		const half = Math.floor(this.geo.gridWidth / 2);
		const XMIN = -half, XMAX = half, YMIN = -half, YMAX = half;
		const { m, b } = this;

		if (m === 0) {
			if (b < YMIN || b > YMAX) return null;
			return { x1: XMIN, y1: b, x2: XMAX, y2: b };
		}

		let x1 = XMIN, y1 = m * XMIN + b;
		let x2 = XMAX, y2 = m * XMAX + b;

		if      (y1 < YMIN) { x1 = (YMIN - b) / m; y1 = YMIN; }
		else if (y1 > YMAX) { x1 = (YMAX - b) / m; y1 = YMAX; }

		if      (y2 < YMIN) { x2 = (YMIN - b) / m; y2 = YMIN; }
		else if (y2 > YMAX) { x2 = (YMAX - b) / m; y2 = YMAX; }

		if (x1 > x2 || x1 > XMAX || x2 < XMIN) return null;
		x1 = Math.max(x1, XMIN);
		x2 = Math.min(x2, XMAX);

		return { x1, y1: m * x1 + b, x2, y2: m * x2 + b };
	}
}
