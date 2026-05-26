import Phaser from "phaser";

export interface GridGeometry {
	gridSize: number;
	gridWidth: number;
	gridHeight: number;
	offsetX: number;
	offsetY: number;
}

/**
 * Passed to each tower's onCreepStep so towers can express effects as actions
 * rather than return values. Add damage(), slow(), etc. here as the game grows.
 */
export interface CreepInteraction {
	fromGridX: number;
	fromGridY: number;
	toGridX: number;
	toGridY: number;
	kill(): void;
}

/** Signature every entry in TowerRegistry must satisfy. */
export type TowerFactory = (
	scene: Phaser.Scene,
	geo: GridGeometry,
	gridX: number,
	gridY: number,
	opts?: unknown,
) => Tower;

export abstract class Tower {
	readonly gridX: number;
	readonly gridY: number;
	readonly coordX: number;
	readonly coordY: number;

	protected scene: Phaser.Scene;
	protected geo: GridGeometry;

	// Every game object the tower creates should be pushed here so
	// the base destroy() cleans them all up automatically.
	protected ownedObjects: Phaser.GameObjects.GameObject[] = [];

	constructor(scene: Phaser.Scene, geo: GridGeometry, gridX: number, gridY: number) {
		this.scene = scene;
		this.geo = geo;
		this.gridX = gridX;
		this.gridY = gridY;
		// Preserve the existing label formula (uses /2, not floor, intentionally)
		this.coordX = gridX - geo.gridWidth / 2;
		this.coordY = geo.gridHeight / 2 - gridY;
	}

	/** Build all visuals. Called by TowerManager after construction. */
	abstract render(): void;

	/** React to a creep moving one cell. Call i.kill() to destroy the creep. */
	onCreepStep(_i: CreepInteraction): void {}

	/** Destroy all owned game objects. */
	destroy(): void {
		for (const obj of this.ownedObjects) obj.destroy();
		this.ownedObjects = [];
	}

	// ── Coordinate helpers ──────────────────────────────────────────────────

	protected gridToScreen(gx: number, gy: number): { x: number; y: number } {
		return {
			x: this.geo.offsetX + gx * this.geo.gridSize,
			y: this.geo.offsetY + gy * this.geo.gridSize,
		};
	}

	protected gridToMath(gx: number, gy: number): { x: number; y: number } {
		const ox = Math.floor(this.geo.gridWidth / 2);
		const oy = Math.floor(this.geo.gridHeight / 2);
		return { x: gx - ox, y: oy - gy };
	}
}
