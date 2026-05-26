import Phaser from "phaser";
import { GridComponent } from "../components/GridComponent";
import { CoordinateSystemComponent } from "../components/CoordinateSystemComponent";
import { OriginComponent } from "../components/OriginComponent";
import { TowerComponent } from "../components/TowerComponent";
import { UIComponent } from "../components/UIComponent";
import { CreepTowerComponent } from "../components/CreepTowerComponent";
import { OriginHealthComponent } from "../components/OriginHealthComponent";
import { CreepMovement } from "../components/CreepMovement";
import { TowerPlacementComponent, EquationResult } from "../components/TowerPlacementComponent";
import { GAME_CONFIG } from "../config/gameConfig";

export default class GameScene extends Phaser.Scene {
	private gridSize: number = 32; // Size of each grid cell
	private gridWidth: number = 21; // Number of grid cells horizontally (-10 to 10)
	private gridHeight: number = 21; // Number of grid cells vertically (-10 to 10)

	// Components
	private gridComponent!: GridComponent;
	private coordinateSystemComponent!: CoordinateSystemComponent;
	private originComponent!: OriginComponent;
	private towerComponent!: TowerComponent;
	private uiComponent!: UIComponent;
	private creepTowerComponent!: CreepTowerComponent;
	private originHealthComponent!: OriginHealthComponent;
	private creepMovement!: CreepMovement;
	private towerPlacement!: TowerPlacementComponent;

	// Game state
	private currentTurn: number = 0;
	private maxTurns: number = GAME_CONFIG.MAX_TURNS;
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
			this.gridWidth,
		);
		this.uiComponent.createUI();
		this.uiComponent.createStartButton(() => this.startNewGame());
		this.uiComponent.createPhaseSwitchButton(() => this.switchToAttackPhase());
		this.originHealthComponent.displayHealthCounter(
			// display health coutner
			this.gridComponent.getOffsetX(),
			this.gridComponent.getOffsetY() + 50,
			10,
		);
		// Add click handler for tower placement
		this.input.on("pointerdown", this.onGridClick, this);
	}

	private initializeComponents() {
		this.gridComponent = new GridComponent(
			this,
			this.gridSize,
			this.gridWidth,
			this.gridHeight,
		);

		this.coordinateSystemComponent = new CoordinateSystemComponent(
			this,
			this.gridSize,
			this.gridWidth,
			this.gridHeight,
			this.gridComponent.getOffsetX(),
			this.gridComponent.getOffsetY(),
		);

		this.originComponent = new OriginComponent(
			this,
			this.gridSize,
			this.gridWidth,
			this.gridHeight,
			this.gridComponent.getOffsetX(),
			this.gridComponent.getOffsetY(),
		);

		this.towerComponent = new TowerComponent(
			this,
			this.gridSize,
			this.gridWidth,
			this.gridHeight,
			this.gridComponent.getOffsetX(),
			this.gridComponent.getOffsetY(),
		);

		this.creepTowerComponent = new CreepTowerComponent(
			this,
			this.gridSize,
			this.gridWidth,
			this.gridHeight,
			this.gridComponent.getOffsetX(),
			this.gridComponent.getOffsetY(),
		);

		this.originHealthComponent = new OriginHealthComponent(
			this, // ← The scene (required!)
			0, // coorX - placeholder
			0, // coorY - placeholder
			10, // healthCount - starting health
		);

		this.creepMovement = new CreepMovement(
			this,
			this.gridSize,
			this.gridComponent.getOffsetX(),
			this.gridComponent.getOffsetY(),
			Math.floor(this.gridWidth / 2),
			Math.floor(this.gridHeight / 2),
			() => this.originHealthComponent.decrementHealth(1),
			(fx, fy, tx, ty) => this.checkLaserKill(fx, fy, tx, ty),
		);

		this.uiComponent = new UIComponent(this);

		// Placed to the right of the grid; grid right edge ≈ 30 + 21*32 = 702
		this.towerPlacement = new TowerPlacementComponent(
			this,
			730,
			200,
			(equations) => this.onPlacementSubmit(equations),
		);
		this.towerPlacement.hide();
	}

	private startNewGame(turns: number = 3) {
		console.log(`Starting new game with ${turns} turns`);

		// Reset game state
		this.currentTurn = 1;
		this.maxTurns = turns;
		this.gameStarted = true;
		this.originHealthComponent.setHealth(GAME_CONFIG.STARTING_HEALTH); // Reset Health to 10

		// Clear existing creep towers
		this.creepTowerComponent.clearAllCreepTowers();

		// Place one random creep tower at distance 10 from origin
		this.placeRandomCreepTower();

		// Update UI
		this.uiComponent.updateTurnDisplay(this.currentTurn, this.maxTurns);
		this.uiComponent.setGamePhase("placement");
		this.uiComponent.showPhaseSwitchButton();
		this.towerPlacement.reset();
		this.towerPlacement.show();
	}

	private placeRandomCreepTower() {
		// Creep towers spawn at distance 10 from origin (on the outer edge of 21x21 grid)
		const distance = 10; // Distance from origin to spawn creeps
		const originGridX = Math.floor(this.gridWidth / 2);
		const originGridY = Math.floor(this.gridHeight / 2);

		// Calculate all possible positions around the square perimeter at distance 10
		const possiblePositions: { gridX: number; gridY: number }[] = [];

		// Top edge (y = -10, x from -10 to 10)
		for (let x = -distance; x <= distance; x++) {
			possiblePositions.push({
				gridX: originGridX + x,
				gridY: originGridY - distance,
			});
		}

		// Bottom edge (y = 10, x from -10 to 10)
		for (let x = -distance; x <= distance; x++) {
			possiblePositions.push({
				gridX: originGridX + x,
				gridY: originGridY + distance,
			});
		}

		// Left edge (x = -10, y from -9 to 9, excluding corners)
		for (let y = -distance + 1; y < distance; y++) {
			possiblePositions.push({
				gridX: originGridX - distance,
				gridY: originGridY - y,
			});
		}

		// Right edge (x = 10, y from -9 to 9, excluding corners)
		for (let y = -distance + 1; y < distance; y++) {
			possiblePositions.push({
				gridX: originGridX + distance,
				gridY: originGridY - y,
			});
		}

		// Select a random position
		const randomIndex = Math.floor(Math.random() * possiblePositions.length);
		const position = possiblePositions[randomIndex];

		// Place the creep tower with configured creep count and release turns
		this.creepTowerComponent.placeCreepTower(
			position.gridX,
			position.gridY,
			GAME_CONFIG.CREEPS_PER_TOWER,
			GAME_CONFIG.TURNS_UNTIL_RELEASE,
		);

		console.log(
			`Placed random creep tower at grid (${position.gridX}, ${position.gridY})`,
		);
	}

	private async switchToAttackPhase() {
		console.log("Switching to attack phase");

		// Switch to attack phase
		this.uiComponent.setGamePhase("attack");
		this.uiComponent.hidePhaseSwitchButton();
		this.towerPlacement.hide();

		await this.uiComponent.flashAttackPhase();

		// Start unified spawn + movement loop
		await this.spawnAndMoveCreeps();

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
		this.towerPlacement.reset();
		this.towerPlacement.show();
	}

	/**
	 * Called when the player presses "Place Towers" in the placement panel.
	 * Each modified equation y = mx + b places a tower at the y-intercept: coordinate (0, b).
	 * Coordinate (0, b) maps to grid cell (originGridX, originGridY - b).
	 */
	private onPlacementSubmit(equations: EquationResult[]) {
		const originGridX = Math.floor(this.gridWidth / 2);
		const originGridY = Math.floor(this.gridHeight / 2);

		for (const eq of equations) {
			if (!eq.modified) continue;

			const gridX = originGridX;
			const gridY = originGridY - eq.b;

			if (this.gridComponent.isValidPosition(gridX, gridY)) {
				const tower = this.towerComponent.placeTower(gridX, gridY, { m: eq.m, b: eq.b });
				if (tower) {
					this.gridComponent.occupyCell(gridX, gridY);
					console.log(
						`Placed tower at grid (${gridX}, ${gridY}) from y = ${eq.m}x + ${eq.b}`,
					);
				}
			} else {
				console.log(
					`Could not place tower at grid (${gridX}, ${gridY}) — cell occupied or out of bounds`,
				);
			}
		}
	}

	/**
	 * Returns true if a creep stepping from (fromGridX,fromGridY) to (toGridX,toGridY)
	 * crosses any laser-line tower. Uses signed-distance sign-change test on the line
	 * y = mx + b in math coordinates.
	 */
	private checkLaserKill(fromGridX: number, fromGridY: number, toGridX: number, toGridY: number): boolean {
		const originGridX = Math.floor(this.gridWidth / 2); // 10
		const originGridY = Math.floor(this.gridHeight / 2); // 10

		// Grid → math coords  (y-axis is inverted)
		const fx = fromGridX - originGridX;
		const fy = originGridY - fromGridY;
		const tx = toGridX - originGridX;
		const ty = originGridY - toGridY;

		for (const tower of this.towerComponent.getTowers()) {
			if (!tower.equation) continue;

			const { m, b } = tower.equation;
			// Signed distance: positive = above the line, negative = below
			const f1 = fy - (m * fx + b);
			const f2 = ty - (m * tx + b);

			if (f1 * f2 > 0) continue; // Same side — no crossing

			const denom = f1 - f2;
			if (Math.abs(denom) < 1e-10) continue; // Parallel segment

			// Find the x coordinate of the crossing point and check it's in-grid
			const t = f1 / denom;
			const xCross = fx + t * (tx - fx);
			const gridHalf = Math.floor(this.gridWidth / 2);
			if (xCross >= -gridHalf && xCross <= gridHalf) return true;
		}
		return false;
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
	 * Spawns creeps one at a time AND moves all existing creeps
	 * Both happen on the same 400ms interval
	 */
	private spawnAndMoveCreeps(): Promise<void> {
		return new Promise((resolve) => {
			const towers = this.creepTowerComponent.getCreepTowers();

			// Build a queue of creeps to spawn
			const spawnQueue: { gridX: number; gridY: number }[] = [];

			towers.forEach((tower) => {
				if (this.creepTowerComponent.isReadyToRelease(tower)) {
					for (let i = 0; i < tower.creepCount; i++) {
						spawnQueue.push({
							gridX: tower.gridX,
							gridY: tower.gridY,
						});
					}
				}
			});

			console.log(`Total creeps to spawn: ${spawnQueue.length}`);

			// Create interval that handles BOTH spawning and movement
			const gameInterval = this.time.addEvent({
				delay: 400,
				callback: () => {
					// 1. Spawn one creep (if any left in queue)
					if (spawnQueue.length > 0) {
						const spawn = spawnQueue.shift()!;
						this.creepMovement.spawnCreep(spawn.gridX, spawn.gridY);
						console.log(`Spawned creep, ${spawnQueue.length} remaining`);
					}

					// 2. Move all existing creeps
					this.creepMovement.moveAllCreeps();

					// 3. Check if done (no more to spawn AND no creeps left)
					if (
						spawnQueue.length === 0 &&
						this.creepMovement.getCreepCount() === 0
					) {
						gameInterval.destroy();
						console.log("All creeps spawned and reached origin");
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
