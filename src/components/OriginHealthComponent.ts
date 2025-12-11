import Phaser from "phaser";
import { Colors } from "../design/colors";

export interface OriginHealth {
	container: Phaser.GameObjects.Container;
	background: Phaser.GameObjects.Rectangle;
	healthCounterText: Phaser.GameObjects.Text;
	coordX: number;
	coordY: number;
	healthCount: number;
}

// For importing this component
// 	import into GameScene
// 		create a `this.originHealthComponent` for line 62 in *initializeComppnents

export class OriginHealthComponent {
	private scene: Phaser.Scene;
	private coordX: number;
	private coordY: number;
	private healthCount: number = 10;

	constructor(
		scene: Phaser.Scene,
		coorX: number,
		coorY: number,
		healthCount: number = 10
	) {
		this.scene = scene;
		this.coordX = coorX;
		this.coordY = coorY;
		this.healthCount = healthCount;
	}

	/**
	 * Display health count of Origin
	 * @param coordX X position on game
	 * @param coordY Y position on game
	 * @param healthCount Health of Origin
	 */

	public displayHealthCounter(
		coorX: number,
		coorY: number,
		healthCount: number
	): OriginHealth | null {
		// Calculate screen position
		const coordX = this.scene.scale.width;
		const coordY = this.scene.scale.height;

		// Create container to hold all creep tower elements
		const container = this.scene.add.container(coordX, coordY);

		// TODO: Add background, text, and other elements here
		// Add bg
		const background = this.scene.add.rectangle(
			0, // x position
			0, // y position
			30, // width
			10, // height
			Colors.healthCounter.healthNumber, // background color
			1 // opacity
		);
		// Add text,

		// Return the OriginHealth object
		return {
			container,
			background: null as any, // TODO: Create actual background
			healthCounterText: null as any, // TODO: Create actual text
			coordX: coordX,
			coordY: coordY,
			healthCount: healthCount,
		};
	}
}

// set the width of screen
// this.scene.scale.width
