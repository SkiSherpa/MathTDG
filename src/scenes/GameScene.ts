import Phaser from "phaser";
import { GridComponent } from "../components/GridComponent";
import { CoordinateSystemComponent } from "../components/CoordinateSystemComponent";
import { OriginComponent } from "../components/OriginComponent";
import { TowerComponent } from "../components/TowerComponent";
import { UIComponent } from "../components/UIComponent";
import { CreepTowerComponent } from "../components/CreepTowerComponent";
import { OriginHealthComponent } from "../components/OriginHealthComponent";
import { CreepMovement } from "../components/CreepMovement";

export default class GameScene extends Phaser.Scene {
	private gridSize: number = 32; // Size of each grid cell
	private gridWidth: number = 27; // Number of grid cells horizontally (-13 to 13)
	private gridHeight: number = 27; // Number of grid cells vertically (-13 to 13)

	// Components
	private gridComponent!: GridComponent;
	private coordinateSystemComponent!: CoordinateSystemComponent;
	private originComponent!: OriginComponent;
	private towerComponent!: TowerComponent;
	private uiComponent!: UIComponent;
	private creepTowerComponent!: CreepTowerComponent;
	private originHealthComponent!: OriginHealthComponent;
	private creepMovement!: CreepMovement;

	// Game state
	private currentTurn: number = 0;
	private maxTurns: number = 3;
	private gameStarted: boolean = false;

	constructor() {
		super({ key: "GameScene" });
	}

	preload() {
		// Load the heart image before the scene starts
		this.load.image("heartIcon", "/assets/heartIconWhite.png");
		//              ↑         ↑
		//              key       path to your image file
	}

	create() {
		console.log("GameScene created!");

		// Initialize components
		this.initializeComponents();

		// Create the game board background
		this.gridComponent.createGrid();

		// Create coordinate system
		this.coordinateSystemComponent.createCoordinateAxes();

		// Create the Origin (home base)
		const originPosition = this.originComponent.createOrigin();
		this.gridComponent.occupyCell(originPosition.gridX, originPosition.gridY);

		// Add UI for game phase and start button
		this.uiComponent.setGridInfo(
			this.gridComponent.getOffsetX(),
			this.gridComponent.getOffsetY(),
			this.gridSize,
			this.gridWidth
		);
		this.uiComponent.createUI();
		this.uiComponent.createStartButton(() => this.startNewGame());
		this.uiComponent.createPhaseSwitchButton(() => this.switchToAttackPhase());
		this.originHealthComponent.displayHealthCounter(
			// display health coutner
			this.gridComponent.getOffsetX(),
			this.gridComponent.getOffsetY() + 50,
			10
		);
		// Add click handler for tower placement
		this.input.on("pointerdown", this.onGridClick, this);
	}

	private initializeComponents() {
		this.gridComponent = new GridComponent(
			this,
			this.gridSize,
			this.gridWidth,
			this.gridHeight
		);

		this.coordinateSystemComponent = new CoordinateSystemComponent(
			this,
			this.gridSize,
			this.gridWidth,
			this.gridHeight,
			this.gridComponent.getOffsetX(),
			this.gridComponent.getOffsetY()
		);

		this.originComponent = new OriginComponent(
			this,
			this.gridSize,
			this.gridWidth,
			this.gridHeight,
			this.gridComponent.getOffsetX(),
			this.gridComponent.getOffsetY()
		);

		this.towerComponent = new TowerComponent(
			this,
			this.gridSize,
			this.gridWidth,
			this.gridHeight,
			this.gridComponent.getOffsetX(),
			this.gridComponent.getOffsetY()
		);

		this.creepTowerComponent = new CreepTowerComponent(
			this,
			this.gridSize,
			this.gridWidth,
			this.gridHeight,
			this.gridComponent.getOffsetX(),
			this.gridComponent.getOffsetY()
		);

		this.originHealthComponent = new OriginHealthComponent(
			this, // ← The scene (required!)
			0, // coorX - placeholder
			0, // coorY - placeholder
			10 // healthCount - starting health
		);

		this.creepMovement = new CreepMovement(
			this,
			this.gridSize,
			this.gridComponent.getOffsetX(),
			this.gridComponent.getOffsetY(),
			Math.floor(this.gridWidth / 2), // origin grid X
			Math.floor(this.gridHeight / 2), // origin grid Y
			() => this.originHealthComponent.decrementHealth(1) // ← Callback!
		);

		this.uiComponent = new UIComponent(this);
	}

	private startNewGame(turns: number = 3) {
		console.log(`Starting new game with ${turns} turns`);

		// Reset game state
		this.currentTurn = 1;
		this.maxTurns = turns;
		this.gameStarted = true;
		this.originHealthComponent.setHealth(10); // Reset Health to 10

		// Clear existing creep towers
		this.creepTowerComponent.clearAllCreepTowers();

		// Place one random creep tower around the 22x22 square
		this.placeRandomCreepTower();

		// Update UI
		this.uiComponent.updateTurnDisplay(this.currentTurn, this.maxTurns);
		this.uiComponent.setGamePhase("placement");
		this.uiComponent.showPhaseSwitchButton();
	}

	private placeRandomCreepTower() {
		const squareSize = 22;
		const halfSize = Math.floor(squareSize / 2);
		const originGridX = Math.floor(this.gridWidth / 2);
		const originGridY = Math.floor(this.gridHeight / 2);

		// Calculate all possible positions around the square perimeter
		const possiblePositions: { gridX: number; gridY: number }[] = [];

		// Top edge
		for (let x = -halfSize; x <= halfSize; x++) {
			possiblePositions.push({
				gridX: originGridX + x,
				gridY: originGridY - halfSize,
			});
		}

		// Bottom edge
		for (let x = -halfSize; x <= halfSize; x++) {
			possiblePositions.push({
				gridX: originGridX + x,
				gridY: originGridY + halfSize,
			});
		}

		// Left edge (excluding corners)
		for (let y = -halfSize + 1; y < halfSize; y++) {
			possiblePositions.push({
				gridX: originGridX - halfSize,
				gridY: originGridY - y,
			});
		}

		// Right edge (excluding corners)
		for (let y = -halfSize + 1; y < halfSize; y++) {
			possiblePositions.push({
				gridX: originGridX + halfSize,
				gridY: originGridY - y,
			});
		}

		// Select a random position
		const randomIndex = Math.floor(Math.random() * possiblePositions.length);
		const position = possiblePositions[randomIndex];

		// Place the creep tower with 1 creep, releasing in 2 turns
		this.creepTowerComponent.placeCreepTower(
			position.gridX,
			position.gridY,
			3, // num of creeps to release
			0 // turns to release
		);

		console.log(
			`Placed random creep tower at grid (${position.gridX}, ${position.gridY})`
		);
	}

	private async switchToAttackPhase() {
		console.log("Switching to attack phase");

		// Switch to attack phase
		this.uiComponent.setGamePhase("attack");
		this.uiComponent.hidePhaseSwitchButton();

		// Spawn creeps from ready towers
		this.spawnCreepsFromTowers();

		// Wait for the flash to complete (1 second)
		await this.uiComponent.flashAttackPhase();

		// Move creeps towards origin
		await this.moveCreepsToOrigin();

		// After all movement, advance to next turn
		this.advanceToNextTurn();
	}

	private advanceToNextTurn() {
		this.currentTurn++;
		console.log(`Advancing to turn ${this.currentTurn}`);

		// Decrement turn counters for all creep towers
		const towers = this.creepTowerComponent.getCreepTowers();
		towers.forEach((tower) => {
			this.creepTowerComponent.decrementTurnCounter(tower);
		});

		// Update turn display
		this.uiComponent.updateTurnDisplay(this.currentTurn, this.maxTurns);

		// Check if game is over
		if (this.currentTurn >= this.maxTurns) {
			console.log("Game Over!");
			this.uiComponent.hidePhaseSwitchButton();
			return;
		}

		// Return to placement phase for the new turn
		this.uiComponent.setGamePhase("placement");
		this.uiComponent.showPhaseSwitchButton();
	}

	private onGridClick(pointer: Phaser.Input.Pointer) {
		if (!this.gameStarted) return;
		if (this.uiComponent.getGamePhase() !== "placement") return;

		// Account for grid offset when calculating grid position
		const offsetX = this.gridComponent.getOffsetX();
		const offsetY = this.gridComponent.getOffsetY();
		const gridX = Math.floor((pointer.x - offsetX) / this.gridSize);
		const gridY = Math.floor((pointer.y - offsetY) / this.gridSize);

		// Check if position is valid
		if (this.gridComponent.isValidPosition(gridX, gridY)) {
			const tower = this.towerComponent.placeTower(gridX, gridY);
			if (tower) {
				this.gridComponent.occupyCell(gridX, gridY);
			}
		}
	}
	/**
	 * Spawns creeps from all towers that are ready to release
	 */
	private spawnCreepsFromTowers(): void {
		const towers = this.creepTowerComponent.getCreepTowers();

		towers.forEach((tower) => {
			if (this.creepTowerComponent.isReadyToRelease(tower)) {
				// Spawn the number of creeps indicated by creepCount
				for (let i = 0; i < tower.creepCount; i++) {
					this.creepMovement.spawnCreep(tower.gridX, tower.gridY);
				}
				console.log(
					`Spawned ${tower.creepCount} creeps from tower at (${tower.gridX}, ${tower.gridY})`
				);
			}
		});
	}

	/**
	 * Moves all creeps towards the origin until they reach it
	 * Returns a promise that resolves when all creeps have finished moving
	 */
	private moveCreepsToOrigin(): Promise<void> {
		return new Promise((resolve) => {
			// Move creeps one step at a time
			const moveInterval = this.time.addEvent({
				delay: 400, // 400ms between steps (gives 300ms animation + 100ms pause)
				callback: () => {
					// Move all creeps one step
					this.creepMovement.moveAllCreeps();

					// Check if any creeps are left
					if (this.creepMovement.getCreepCount() === 0) {
						moveInterval.destroy();
						resolve();
					}
				},
				loop: true,
			});
		});
	}

	update() {
		// Game update logic will go here
	}
}
