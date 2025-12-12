import Phaser from "phaser";
import { Colors } from "../design/colors";

export interface OriginHealth {
	container: Phaser.GameObjects.Container;
	background: Phaser.GameObjects.Rectangle;
	healthCounterText: Phaser.GameObjects.Text;
	coorX: number;
	coorY: number;
	healthCount: number;
}

// For importing this component
// 	import into GameScene
// 		create a `this.originHealthComponent` for line 62 in *initializeComppnents

export class OriginHealthComponent {
	private scene: Phaser.Scene;
	private coorX: number;
	private coorY: number;
	private healthCount: number;

	constructor(
		scene: Phaser.Scene,
		coorX: number,
		coorY: number,
		healthCount: number
	) {
		this.scene = scene;
		this.coorX = coorX;
		this.coorY = coorY;
		this.healthCount = healthCount;
	}

	/**
	 * Display health count of Origin
	 * @param coorX X position on game
	 * @param coorY Y position on game
	 * @param healthCount Health of Origin
	 */

	public displayHealthCounter(
		coorX: number,
		coorY: number,
		healthCount: number = 10
	): OriginHealth | null {
		// Calculate screen position
		const x = coorX + 50;
		const y = coorY - 150;

		// Create container to hold origin health elements
		const container = this.scene.add.container(x, y);

		// TODO: Add background, text, and other elements here
		// Add bg
		const background = this.scene.add.rectangle(
			0, // x position
			0, // y position
			100, // width
			30, // height
			Colors.healthCounter.background, // background color
			1 // opacity
		);
		// Add text,
		const currentHealthCount = this.scene.add.text(
			-45,
			-10,
			healthCount.toString(),
			{
				fontSize: "12px",
				color: `#${Colors.healthCounter.healthNumber
					.toString(16)
					.padStart(6, "0")}`,
				fontFamily: "Arial",
				fontStyle: "bold",
			}
		);
		// Add background and currentHealthCount to the container
		container.add([background, currentHealthCount]);
		/** This can be it's own test
		 * Update the Health count
		 */

		// Return the OriginHealth object
		return {
			container,
			background: background, // TODO: Create actual background
			healthCounterText: currentHealthCount, // TODO: Create actual text
			coorX: x,
			coorY: y,
			healthCount: healthCount,
		};
	}
}

// set the width of screen
// this.scene.scale.width
