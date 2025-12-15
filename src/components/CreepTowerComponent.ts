import Phaser from "phaser";
import { Colors } from "../design/colors";

export interface CreepTower {
	container: Phaser.GameObjects.Container;
	background: Phaser.GameObjects.Rectangle;
	circle: Phaser.GameObjects.Arc;
	creepCountText: Phaser.GameObjects.Text;
	turnsUntilReleaseText: Phaser.GameObjects.Text;
	gridX: number;
	gridY: number;
	coordX: number;
	coordY: number;
	creepCount: number;
	turnsUntilRelease: number;
}

export class CreepTowerComponent {
	private scene: Phaser.Scene;
	private gridSize: number;
	private gridWidth: number;
	private gridHeight: number;
	private offsetX: number = 0;
	private offsetY: number = 0;
	private creepTowers: CreepTower[] = [];

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

	/**
	 * Places a creep tower at the specified grid position
	 * @param gridX Grid X position
	 * @param gridY Grid Y position
	 * @param creepCount Number of creeps that will spawn
	 * @param turnsUntilRelease Number of turns until creeps are released
	 */
	public placeCreepTower(
		gridX: number,
		gridY: number,
		creepCount: number = 1,
		turnsUntilRelease: number = 0
	): CreepTower | null {
		// Calculate screen position
		const x = this.offsetX + gridX * this.gridSize;
		const y = this.offsetY + gridY * this.gridSize;

		// Create container to hold all creep tower elements
		const container = this.scene.add.container(x, y);

		// Create background rectangle with border
		const background = this.scene.add.rectangle(
			0,
			0,
			this.gridSize,
			this.gridSize,
			Colors.creepTowers.background
		);
		background.setStrokeStyle(2, Colors.creepTowers.border);

		// Create circle placeholder (centered in the middle-bottom area)
		const circleSize = this.gridSize * 0.3; // 30% of grid size
		const circle = this.scene.add.circle(
			0, // Center X
			this.gridSize * 0.15, // Slightly below center
			6, // r = 6px
			Colors.creepTowers.circle
		);

		// Create creep count text (top left)
		const creepCountText = this.scene.add.text(
			-this.gridSize / 2 + 4, // 4px padding from left edge
			-this.gridSize / 2 + 2, // 2px padding from top edge
			creepCount.toString(),
			{
				fontSize: "12px",
				color: `#${Colors.creepTowers.label.toString(16).padStart(6, "0")}`,
				fontFamily: "Arial",
				fontStyle: "bold",
			}
		);
		creepCountText.setOrigin(0, 0);

		// Create turns until release text (top right)
		const turnsUntilReleaseText = this.scene.add.text(
			this.gridSize / 2 - 4, // 4px padding from right edge
			-this.gridSize / 2 + 2, // 2px padding from top edge
			turnsUntilRelease.toString(),
			{
				fontSize: "12px",
				color: `#${Colors.creepTowers.label.toString(16).padStart(6, "0")}`,
				fontFamily: "Arial",
				fontStyle: "bold",
			}
		);
		turnsUntilReleaseText.setOrigin(1, 0);

		// Add all elements to container
		container.add([background, circle, creepCountText, turnsUntilReleaseText]);

		// Calculate coordinate system position
		const originGridX = this.gridWidth / 2;
		const originGridY = this.gridHeight / 2;
		const coordX = gridX - originGridX;
		const coordY = originGridY - gridY;

		const creepTower: CreepTower = {
			container,
			background,
			circle,
			creepCountText,
			turnsUntilReleaseText,
			gridX,
			gridY,
			coordX,
			coordY,
			creepCount,
			turnsUntilRelease,
		};

		this.creepTowers.push(creepTower);

		console.log(
			`Creep Tower placed at grid position (${gridX}, ${gridY}) - Coordinates: (${coordX}, ${coordY}) - ${creepCount} creeps in ${turnsUntilRelease} turns`
		);

		return creepTower;
	}

	/**
	 * Updates the countdown for a specific creep tower
	 */
	public decrementTurnCounter(creepTower: CreepTower): void {
		if (creepTower.turnsUntilRelease > 0) {
			creepTower.turnsUntilRelease--;
			creepTower.turnsUntilReleaseText.setText(
				creepTower.turnsUntilRelease.toString()
			);
		}
	}

	/**
	 * Updates the creep count for a specific tower
	 */
	public updateCreepCount(creepTower: CreepTower, newCount: number): void {
		creepTower.creepCount = newCount;
		creepTower.creepCountText.setText(newCount.toString());
	}

	/**
	 * Checks if a creep tower is ready to release creeps
	 */
	public isReadyToRelease(creepTower: CreepTower): boolean {
		return creepTower.turnsUntilRelease <= 0;
	}

	/**
	 * Places creep towers around the origin in a 22x22 square pattern
	 * This will place towers at the perimeter of the specified square
	 */
	public createCreepTowerRing(
		squareSize: number = 22,
		creepCount: number = 1,
		turnsUntilRelease: number = 0
	): void {
		const halfSize = Math.floor(squareSize / 2);
		const originGridX = Math.floor(this.gridWidth / 2);
		const originGridY = Math.floor(this.gridHeight / 2);

		// Top edge (left to right)
		for (let x = -halfSize; x <= halfSize; x++) {
			const gridX = originGridX + x;
			const gridY = originGridY - halfSize;
			this.placeCreepTower(gridX, gridY, creepCount, turnsUntilRelease);
		}

		// Bottom edge (left to right)
		for (let x = -halfSize; x <= halfSize; x++) {
			const gridX = originGridX + x;
			const gridY = originGridY + halfSize;
			this.placeCreepTower(gridX, gridY, creepCount, turnsUntilRelease);
		}

		// Left edge (top to bottom, excluding corners already placed)
		for (let y = -halfSize + 1; y < halfSize; y++) {
			const gridX = originGridX - halfSize;
			const gridY = originGridY - y;
			this.placeCreepTower(gridX, gridY, creepCount, turnsUntilRelease);
		}

		// Right edge (top to bottom, excluding corners already placed)
		for (let y = -halfSize + 1; y < halfSize; y++) {
			const gridX = originGridX + halfSize;
			const gridY = originGridY - y;
			this.placeCreepTower(gridX, gridY, creepCount, turnsUntilRelease);
		}

		console.log(
			`Created creep tower ring: ${this.creepTowers.length} towers placed in ${squareSize}x${squareSize} square`
		);
	}

	public getCreepTowers(): CreepTower[] {
		return this.creepTowers;
	}

	public getCreepTowerCount(): number {
		return this.creepTowers.length;
	}

	public removeCreepTower(creepTower: CreepTower): void {
		const index = this.creepTowers.indexOf(creepTower);
		if (index > -1) {
			creepTower.container.destroy();
			this.creepTowers.splice(index, 1);
		}
	}

	public clearAllCreepTowers(): void {
		this.creepTowers.forEach((tower) => tower.container.destroy());
		this.creepTowers = [];
	}
}
