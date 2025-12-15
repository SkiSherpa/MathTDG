import Phaser from "phaser";
import { Colors } from "../design/colors";

export interface Creep {
	sprite: Phaser.GameObjects.Arc;
	gridX: number;
	gridY: number;
	targetGridX: number;
	targetGridY: number;
	isMoving: boolean;
}

export class CreepMovement {
	private scene: Phaser.Scene;
	private gridSize: number;
	private offsetX: number;
	private offsetY: number;
	private creeps: Creep[] = [];
	private originGridX: number;
	private originGridY: number;

	constructor(
		scene: Phaser.Scene,
		gridSize: number,
		offsetX: number,
		offsetY: number,
		originGridX: number,
		originGridY: number
	) {
		this.scene = scene;
		this.gridSize = gridSize;
		this.offsetX = offsetX;
		this.offsetY = offsetY;
		this.originGridX = originGridX;
		this.originGridY = originGridY;
	}

	/**
	 * Spawns a creep at a specific grid position
	 * @param gridX Starting grid X position
	 * @param gridY Starting grid Y position
	 */
	public spawnCreep(gridX: number, gridY: number): Creep {
		// Calculate screen position
		const x = this.offsetX + gridX * this.gridSize;
		const y = this.offsetY + gridY * this.gridSize;

		// Create the creep sprite (red circle)
		const sprite = this.scene.add.circle(
			x,
			y,
			8, // 8px radius
			Colors.creepTowers.circle // Red color
		);
		sprite.setDepth(100); // Draw above other elements

		const creep: Creep = {
			sprite,
			gridX,
			gridY,
			targetGridX: gridX,
			targetGridY: gridY,
			isMoving: false,
		};

		this.creeps.push(creep);

		console.log(`Creep spawned at grid (${gridX}, ${gridY})`);

		return creep;
	}

	/**
	 * Calculates the next step in the shortest path to the origin
	 * Uses diagonal movement (8-directional)
	 * @param creep The creep to move
	 * @returns Next grid position {x, y} or null if at origin
	 */
	private calculateNextStep(creep: Creep): { x: number; y: number } | null {
		const currentX = creep.gridX;
		const currentY = creep.gridY;

		// If already at origin, don't move
		if (currentX === this.originGridX && currentY === this.originGridY) {
			return null;
		}

		// Calculate direction to origin
		const deltaX = this.originGridX - currentX;
		const deltaY = this.originGridY - currentY;

		// Normalize to -1, 0, or 1 for each axis
		const stepX = deltaX === 0 ? 0 : deltaX > 0 ? 1 : -1;
		const stepY = deltaY === 0 ? 0 : deltaY > 0 ? 1 : -1;

		return {
			x: currentX + stepX,
			y: currentY + stepY,
		};
	}

	/**
	 * Moves a creep one step towards the origin
	 * @param creep The creep to move
	 */
	private moveCreepOneStep(creep: Creep): void {
		const nextStep = this.calculateNextStep(creep);

		if (!nextStep) {
			// Creep has reached origin
			this.removeCreep(creep);
			// TODO: Trigger damage to origin here
			console.log("Creep reached origin!");
			return;
		}

		// Update grid position
		creep.gridX = nextStep.x;
		creep.gridY = nextStep.y;

		// Calculate target screen position
		const targetX = this.offsetX + nextStep.x * this.gridSize;
		const targetY = this.offsetY + nextStep.y * this.gridSize;

		// Animate the movement
		creep.isMoving = true;
		this.scene.tweens.add({
			targets: creep.sprite,
			x: targetX,
			y: targetY,
			duration: 300, // 300ms per step
			ease: "Linear",
			onComplete: () => {
				creep.isMoving = false;
			},
		});
	}

	/**
	 * Moves all creeps one step towards the origin
	 * Call this during the attack phase
	 */
	public moveAllCreeps(): void {
		// Create a copy of the array to avoid modification during iteration
		const creepsToMove = [...this.creeps];

		creepsToMove.forEach((creep) => {
			if (!creep.isMoving) {
				this.moveCreepOneStep(creep);
			}
		});
	}

	/**
	 * Removes a creep from the game
	 */
	public removeCreep(creep: Creep): void {
		const index = this.creeps.indexOf(creep);
		if (index > -1) {
			creep.sprite.destroy();
			this.creeps.splice(index, 1);
		}
	}

	/**
	 * Removes all creeps from the game
	 */
	public clearAllCreeps(): void {
		this.creeps.forEach((creep) => creep.sprite.destroy());
		this.creeps = [];
	}

	/**
	 * Gets all active creeps
	 */
	public getCreeps(): Creep[] {
		return this.creeps;
	}

	/**
	 * Gets the count of active creeps
	 */
	public getCreepCount(): number {
		return this.creeps.length;
	}

	/**
	 * Checks if any creeps are currently moving
	 */
	public areCreepsMoving(): boolean {
		return this.creeps.some((creep) => creep.isMoving);
	}
}
