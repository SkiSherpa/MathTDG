/**
 * TowerRegistry — the single place to add a new tower type.
 *
 * To add "FreezeTower":
 *   1. Create src/towers/FreezeTower.ts (extends Tower)
 *   2. Add one line below: ["freeze", (s, g, x, y, o) => new FreezeTower(s, g, x, y, o as FreezeTowerOpts)]
 *   3. Add a typed wrapper to TowerManager (optional, for call-site safety)
 *
 * Nothing else needs to change.
 */
import Phaser from "phaser";
import { Tower, GridGeometry, TowerFactory } from "./Tower";
import { BasicTower } from "./BasicTower";
import { LaserLineTower } from "./LaserLineTower";

const registry = new Map<string, TowerFactory>([
	["basic",     (s, g, x, y)    => new BasicTower(s, g, x, y)],
	["laserLine", (s, g, x, y, o) => new LaserLineTower(s, g, x, y, o as { m: number; b: number })],
]);

export function createTower(
	type: string,
	scene: Phaser.Scene,
	geo: GridGeometry,
	gridX: number,
	gridY: number,
	opts?: unknown,
): Tower {
	const factory = registry.get(type);
	if (!factory) throw new Error(`Unknown tower type: "${type}"`);
	return factory(scene, geo, gridX, gridY, opts);
}
