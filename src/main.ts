import Phaser from "phaser";
import GameScene from "./scenes/GameScene";
import { Colors } from "./design/colors";

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 1024,
	height: 768,
	backgroundColor: `#${Colors.ui.background.toString(16).padStart(6, "0")}`,
	scene: [GameScene],
	physics: {
		default: "arcade",
		arcade: {
			gravity: { y: 0, x: 0 },
			debug: false,
		},
	},
};

const game = new Phaser.Game(config);

// Debug: Log when game is created
console.log("Math Tower Defense Game initialized!");
