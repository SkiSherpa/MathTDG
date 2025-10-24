import Phaser from "phaser";
import { GridComponent } from "../components/GridComponent";
import { CoordinateSystemComponent } from "../components/CoordinateSystemComponent";
import { OriginComponent } from "../components/OriginComponent";
import { TowerComponent } from "../components/TowerComponent";
import { UIComponent } from "../components/UIComponent";

export default class GameScene extends Phaser.Scene {
	private gridSize: number = 32; // Size of each grid cell
	private gridWidth: number = 32; // Number of grid cells horizontally
	private gridHeight: number = 24; // Number of grid cells vertically

	// Components
	private gridComponent!: GridComponent;
	private coordinateSystemComponent!: CoordinateSystemComponent;
	private originComponent!: OriginComponent;
	private towerComponent!: TowerComponent;
	private uiComponent!: UIComponent;

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

		// Add UI for game phase
		this.uiComponent.createUI();

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
			this.gridHeight
		);

		this.originComponent = new OriginComponent(
			this,
			this.gridSize,
			this.gridWidth,
			this.gridHeight
		);

		this.towerComponent = new TowerComponent(
			this,
			this.gridSize,
			this.gridWidth,
			this.gridHeight
		);

		this.uiComponent = new UIComponent(this);
	}

	private onGridClick(pointer: Phaser.Input.Pointer) {
		if (this.uiComponent.getGamePhase() !== "placement") return;

		const gridX = Math.floor(pointer.x / this.gridSize);
		const gridY = Math.floor(pointer.y / this.gridSize);

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
