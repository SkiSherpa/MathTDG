import Phaser from "phaser";
import { Tower, GridGeometry, CreepInteraction } from "./Tower";
import { BasicTower } from "./BasicTower";
import { LaserLineTower } from "./LaserLineTower";

export class TowerManager {
	private readonly scene: Phaser.Scene;
	private readonly geo: GridGeometry;
	private towers: Tower[] = [];

	constructor(scene: Phaser.Scene, geo: GridGeometry) {
		this.scene = scene;
		this.geo = geo;
	}

	placeBasic(gridX: number, gridY: number): Tower {
		return this.add(new BasicTower(this.scene, this.geo, gridX, gridY));
	}

	placeLaser(gridX: number, gridY: number, equation: { m: number; b: number }): Tower {
		return this.add(new LaserLineTower(this.scene, this.geo, gridX, gridY, equation));
	}

	/** Dispatches to every tower's onCreepStep. Towers call i.kill() if they want. */
	applyCreepStep(interaction: CreepInteraction): void {
		for (const tower of this.towers) {
			tower.onCreepStep(interaction);
		}
	}

	getTowers(): Tower[] {
		return this.towers;
	}

	getCount(): number {
		return this.towers.length;
	}

	remove(tower: Tower): void {
		const index = this.towers.indexOf(tower);
		if (index === -1) return;
		tower.destroy();
		this.towers.splice(index, 1);
	}

	clear(): void {
		for (const tower of this.towers) tower.destroy();
		this.towers = [];
	}

	private add(tower: Tower): Tower {
		tower.render();
		this.towers.push(tower);
		return tower;
	}
}
