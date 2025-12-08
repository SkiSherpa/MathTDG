import Phaser from "phaser";
import { GridComponent } from "../components/GridComponent";
import { CoordinateSystemComponent } from "../components/CoordinateSystemComponent";
import { OriginComponent } from "../components/OriginComponent";
import { TowerComponent } from "../components/TowerComponent";
import { UIComponent } from "../components/UIComponent";
import { CreepTowerComponent } from "../components/CreepTowerComponent";

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

	// Game state
	private currentTurn: number = 0;
	private maxTurns: number = 3;
	private gameStarted: boolean = false;

	constructor() {
		super({ key: "GameScene" });
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
		this.uiComponent.createUI();
		this.uiComponent.createStartButton(() => this.startNewGame());

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

		this.uiComponent = new UIComponent(this);
	}

	private startNewGame(turns: number = 3) {
		console.log(`Starting new game with ${turns} turns`);

		// Reset game state
		this.currentTurn = 0;
		this.maxTurns = turns;
		this.gameStarted = true;

		// Clear existing creep towers
		this.creepTowerComponent.clearAllCreepTowers();

		// Place one random creep tower around the 22x22 square
		this.placeRandomCreepTower();

		// Update UI
		this.uiComponent.updateTurnDisplay(this.currentTurn, this.maxTurns);
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
			1,
			2
		);

		console.log(
			`Placed random creep tower at grid (${position.gridX}, ${position.gridY})`
		);
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

	update() {
		// Game update logic will go here
	}
}
