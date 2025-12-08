import Phaser from "phaser";

type GamePhase = "placement" | "attack";

export class UIComponent {
	private scene: Phaser.Scene;
	private phaseText!: Phaser.GameObjects.Text;
	private turnText!: Phaser.GameObjects.Text;
	private startButton!: Phaser.GameObjects.Container;
	private currentPhase: GamePhase = "placement";

	constructor(scene: Phaser.Scene) {
		this.scene = scene;
	}

	public createUI(): void {
		// Phase indicator (top-left)
		this.phaseText = this.scene.add.text(10, 10, "Phase: Placement", {
			fontSize: "20px",
			color: "#ffffff",
			fontFamily: "Arial",
			fontStyle: "bold",
			backgroundColor: "#000000",
			padding: { x: 10, y: 5 },
		});
		this.phaseText.setDepth(1000);

		// Turn counter (top-right) - initially hidden
		this.turnText = this.scene.add.text(
			this.scene.scale.width - 10,
			10,
			"Turn: 0/3",
			{
				fontSize: "20px",
				color: "#ffffff",
				fontFamily: "Arial",
				fontStyle: "bold",
				backgroundColor: "#000000",
				padding: { x: 10, y: 5 },
			}
		);
		this.turnText.setOrigin(1, 0);
		this.turnText.setDepth(1000);
		this.turnText.setVisible(false); // Hidden until game starts
	}

	public createStartButton(onClickCallback: () => void): void {
		const centerX = this.scene.scale.width / 2;
		const centerY = this.scene.scale.height / 2;

		// Create container for button
		this.startButton = this.scene.add.container(centerX, centerY);

		// Create button background
		const buttonWidth = 200;
		const buttonHeight = 60;
		const background = this.scene.add.rectangle(
			0,
			0,
			buttonWidth,
			buttonHeight,
			0x4caf50
		);
		background.setStrokeStyle(3, 0x2e7d32);
		background.setInteractive({ useHandCursor: true });

		// Create button text
		const text = this.scene.add.text(0, 0, "Start New Game", {
			fontSize: "24px",
			color: "#ffffff",
			fontFamily: "Arial",
			fontStyle: "bold",
		});
		text.setOrigin(0.5);

		// Add hover effects
		background.on("pointerover", () => {
			background.setFillStyle(0x66bb6a);
		});

		background.on("pointerout", () => {
			background.setFillStyle(0x4caf50);
		});

		// Add click handler
		background.on("pointerdown", () => {
			this.startButton.setVisible(false);
			this.turnText.setVisible(true);
			onClickCallback();
		});

		// Add elements to container
		this.startButton.add([background, text]);
		this.startButton.setDepth(2000);
	}

	public updateTurnDisplay(currentTurn: number, maxTurns: number): void {
		this.turnText.setText(`Turn: ${currentTurn}/${maxTurns}`);
		this.turnText.setVisible(true);
	}

	public setGamePhase(phase: GamePhase): void {
		this.currentPhase = phase;
		const phaseText =
			phase === "placement" ? "Phase: Placement" : "Phase: Attack";
		this.phaseText.setText(phaseText);

		// Update color based on phase
		if (phase === "placement") {
			this.phaseText.setBackgroundColor("#2196f3"); // Blue for placement
		} else {
			this.phaseText.setBackgroundColor("#f44336"); // Red for attack
		}
	}

	public getGamePhase(): GamePhase {
		return this.currentPhase;
	}

	public showStartButton(): void {
		if (this.startButton) {
			this.startButton.setVisible(true);
		}
	}

	public hideStartButton(): void {
		if (this.startButton) {
			this.startButton.setVisible(false);
		}
	}
}
