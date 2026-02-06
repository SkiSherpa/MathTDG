import Phaser from "phaser";

type GamePhase = "placement" | "attack";

export class UIComponent {
	private scene: Phaser.Scene;
	private phaseText!: Phaser.GameObjects.Text;
	private turnText!: Phaser.GameObjects.Text;
	private startButton!: Phaser.GameObjects.Container;
	private phaseSwitchButton!: Phaser.GameObjects.Container;
	private currentPhase: GamePhase = "placement";
	private gridOffsetX: number = 0;
	private gridOffsetY: number = 0;
	private gridSize: number = 32;
	private gridWidth: number = 21;
	private isFlashing: boolean = false;

	// Fixed UI width (based on original 27x27 grid = 864px)
	private readonly UI_WIDTH: number = 864;

	constructor(scene: Phaser.Scene) {
		this.scene = scene;
	}

	/**
	 * Sets grid information for proper UI alignment
	 * Call this before createUI() to position UI elements relative to the grid
	 */
	public setGridInfo(
		offsetX: number,
		offsetY: number,
		gridSize: number,
		gridWidth: number,
	): void {
		this.gridOffsetX = offsetX;
		this.gridOffsetY = offsetY;
		this.gridSize = gridSize;
		this.gridWidth = gridWidth;
	}

	public createUI(): void {
		// Calculate UI boundaries based on fixed width, centered on screen
		const centerX = this.scene.scale.width / 2;
		const uiLeftEdge = centerX - this.UI_WIDTH / 2;
		const uiRightEdge = centerX + this.UI_WIDTH / 2;

		// Phase indicator - aligned with left edge of UI area
		// setOrigin(0, 0) means the text's top-left corner is positioned at (x, y)
		this.phaseText = this.scene.add.text(uiLeftEdge, 10, "Phase: Placement", {
			fontSize: "20px",
			color: "#ffffff",
			fontFamily: "Arial",
			fontStyle: "bold",
			backgroundColor: "#000000",
			padding: { x: 10, y: 5 },
		});
		this.phaseText.setOrigin(0, 0); // Top-left corner of text at position
		this.phaseText.setDepth(1000);

		// Turn counter - aligned with right edge of UI area
		// setOrigin(1, 0) means the text's top-right corner is positioned at (x, y)
		this.turnText = this.scene.add.text(uiRightEdge, 10, "Turn: 0/3", {
			fontSize: "20px",
			color: "#ffffff",
			fontFamily: "Arial",
			fontStyle: "bold",
			backgroundColor: "#000000",
			padding: { x: 10, y: 5 },
		});
		this.turnText.setOrigin(1, 0); // Top-right corner of text at position
		this.turnText.setDepth(1000);
		this.turnText.setVisible(false); // Hidden until game starts
	}

	public createStartButton(onClickCallback: () => void): void {
		const centerX = this.scene.scale.width / 2;
		const centerY = this.scene.scale.height / 10;

		// Create container for button - we manipulate here!
		this.startButton = this.scene.add.container(centerX, centerY);

		// Create button background
		const buttonWidth = 200;
		const buttonHeight = 60;
		const background = this.scene.add.rectangle(
			0,
			0,
			buttonWidth,
			buttonHeight,
			0x4caf50,
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
			this.startButton.setVisible(true);
			this.turnText.setVisible(true);
			onClickCallback();
		});

		// Add elements to container
		this.startButton.add([background, text]);
		this.startButton.setDepth(2000);
	}

	public createPhaseSwitchButton(onClickCallback: () => void): void {
		// Position below the turn counter using fixed UI width
		const centerX = this.scene.scale.width / 2;
		const uiRightEdge = centerX + this.UI_WIDTH / 2;
		const buttonX = uiRightEdge;
		const buttonY = 70; // turnText Y (10) + turnText height (~30) + margin (10)

		// Create container for button
		this.phaseSwitchButton = this.scene.add.container(buttonX, buttonY);

		// Create button background
		const buttonWidth = 180;
		const buttonHeight = 50;
		const background = this.scene.add.rectangle(
			0,
			0,
			buttonWidth,
			buttonHeight,
			0xff9800, // Orange color
		);
		background.setStrokeStyle(3, 0xe65100);
		background.setInteractive({ useHandCursor: true });

		// Create button text
		const text = this.scene.add.text(0, 0, "Send Creeps", {
			fontSize: "20px",
			color: "#ffffff",
			fontFamily: "Arial",
			fontStyle: "bold",
		});
		text.setOrigin(0.5);

		// Add hover effects
		background.on("pointerover", () => {
			background.setFillStyle(0xffa726);
		});

		background.on("pointerout", () => {
			background.setFillStyle(0xff9800);
		});

		// Add click handler
		background.on("pointerdown", () => {
			if (!this.isFlashing) {
				onClickCallback();
			}
		});

		// Add elements to container
		this.phaseSwitchButton.add([background, text]);
		this.phaseSwitchButton.setDepth(2000);
		this.phaseSwitchButton.setVisible(false); // Hidden until game starts
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
			// Attack phase - trigger flash effect
			this.flashAttackPhase();
		}
	}

	/**
	 * Flashes the attack phase display red for 1 second
	 * Returns a promise that resolves after the flash completes
	 */
	public flashAttackPhase(): Promise<void> {
		return new Promise((resolve) => {
			this.isFlashing = true;

			// Set to red immediately
			this.phaseText.setBackgroundColor("#f44336");

			// Create a flashing effect by toggling between red shades
			let flashCount = 0;
			const maxFlashes = 6; // 6 flashes = 3 on/off cycles in 1 second
			const flashInterval = 1000 / maxFlashes; // ~166ms per flash

			const flashTimer = this.scene.time.addEvent({
				delay: flashInterval,
				callback: () => {
					flashCount++;
					// Toggle between bright red and dark red
					if (flashCount % 2 === 0) {
						this.phaseText.setBackgroundColor("#f44336"); // Bright red
					} else {
						this.phaseText.setBackgroundColor("#c62828"); // Dark red
					}

					if (flashCount >= maxFlashes) {
						flashTimer.destroy();
						// Keep red background after flashing
						this.phaseText.setBackgroundColor("#f44336");
						this.isFlashing = false;
						resolve();
					}
				},
				loop: true,
			});
		});
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

	public showPhaseSwitchButton(): void {
		if (this.phaseSwitchButton) {
			this.phaseSwitchButton.setVisible(true);
		}
	}

	public hidePhaseSwitchButton(): void {
		if (this.phaseSwitchButton) {
			this.phaseSwitchButton.setVisible(false);
		}
	}
}
