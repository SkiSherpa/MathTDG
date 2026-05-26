import Phaser from "phaser";
import { GAME_CONFIG } from "../config/gameConfig";

type CardValue = number | "+" | "-";
type PlacementPhase = "idle" | "card_selected" | "equation_selected";

interface CardData {
	index: number;
	value: CardValue;
	container: Phaser.GameObjects.Container;
	background: Phaser.GameObjects.Rectangle;
	label: Phaser.GameObjects.Text;
	inUse: boolean;
}

interface EquationData {
	id: number;
	coefficients: number[];
	operator: "+" | "-" | null;
	constant: number | null;
	container: Phaser.GameObjects.Container;
	background: Phaser.GameObjects.Rectangle;
	equationText: Phaser.GameObjects.Text;
	rightHitZone: Phaser.GameObjects.Rectangle;
}

const EQ_W = 200;
const EQ_H = 60;
const EQ_GAP = 20;
const CARD_W = 56;
const CARD_H = 72;
const CARD_GAP = 10;
const BTN_W = 110;
const BTN_H = 44;
const BTN_GAP = 15;
const PANEL_PAD = 16;

// Total inner width of the 2-column equation grid
const INNER_W = 2 * EQ_W + EQ_GAP;

export interface EquationResult {
	m: number;
	b: number;
	/** True if the player placed at least one card on this slot. */
	modified: boolean;
}

export class TowerPlacementComponent {
	private scene: Phaser.Scene;
	private root: Phaser.GameObjects.Container;
	private onSubmit: ((equations: EquationResult[]) => void) | undefined;

	private cards: CardData[] = [];
	private equations: EquationData[] = [];

	private leftArrowBtn!: {
		bg: Phaser.GameObjects.Rectangle;
	};
	private confirmBtn!: {
		bg: Phaser.GameObjects.Rectangle;
		label: Phaser.GameObjects.Text;
	};
	private rightArrowBtn!: {
		bg: Phaser.GameObjects.Rectangle;
	};

	private phase: PlacementPhase = "idle";
	private selectedCardIndex: number | null = null;
	private selectedEquationId: number | null = null;
	private drawsRemaining: number = GAME_CONFIG.MAX_DRAWS;

	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		onSubmit?: (equations: EquationResult[]) => void,
	) {
		this.scene = scene;
		this.root = scene.add.container(x, y);
		this.root.setDepth(500);
		this.onSubmit = onSubmit;
		this.build();
		this.dealCards();
	}

	// ─── Build ───────────────────────────────────────────────────────────────

	private build() {
		this.addPanelBackground();
		this.buildEquationSlots();
		this.buildCards();
		this.buildButtons();
	}

	private addPanelBackground() {
		const eqRowsH = 2 * EQ_H + EQ_GAP;
		// cards → equations → 3-button row → submit button row
		const totalH =
			PANEL_PAD + CARD_H + 20 + eqRowsH + 20 + BTN_H + 12 + BTN_H + PANEL_PAD;
		const totalW = INNER_W + 2 * PANEL_PAD;
		const bg = this.scene.add.rectangle(
			INNER_W / 2,
			totalH / 2 - PANEL_PAD,
			totalW,
			totalH,
			0x1a1a2e,
			0.85,
		);
		bg.setStrokeStyle(2, 0x4a4a6a);
		this.root.add(bg);

		const title = this.scene.add.text(INNER_W / 2, -PANEL_PAD + 8, "PLACEMENT", {
			fontSize: "11px",
			color: "#8888aa",
			fontFamily: "monospace",
			fontStyle: "bold",
		});
		title.setOrigin(0.5, 0);
		this.root.add(title);
	}

	private buildEquationSlots() {
		const eqOffsetY = CARD_H + 20;
		for (let i = 0; i < 4; i++) {
			const col = i % 2;
			const row = Math.floor(i / 2);
			const slotX = col * (EQ_W + EQ_GAP);
			const slotY = eqOffsetY + row * (EQ_H + EQ_GAP);

			const container = this.scene.add.container(slotX, slotY);

			const background = this.scene.add.rectangle(
				EQ_W / 2,
				EQ_H / 2,
				EQ_W,
				EQ_H,
				0x2c3e50,
			);
			background.setStrokeStyle(2, 0x566573);

			// Subtle divider between y-side and x-side of the equation
			const divider = this.scene.add.rectangle(
				EQ_W * 0.35,
				EQ_H / 2,
				1,
				EQ_H - 8,
				0x566573,
				0.5,
			);

			const equationText = this.scene.add.text(
				EQ_W / 2 + 8,
				EQ_H / 2,
				"y = x",
				{
					fontSize: "13px",
					color: "#ecf0f1",
					fontFamily: "monospace",
				},
			);
			equationText.setOrigin(0.5);

			// Right hit zone covers the x-expression side (right of the divider)
			const rightHitZone = this.scene.add.rectangle(
				EQ_W * 0.675,
				EQ_H / 2,
				EQ_W * 0.65,
				EQ_H,
				0xffffff,
				0,
			);
			rightHitZone.setInteractive({ useHandCursor: true });
			rightHitZone.on("pointerover", () => {
				if (this.phase === "card_selected")
					rightHitZone.setFillStyle(0xffffff, 0.07);
			});
			rightHitZone.on("pointerout", () =>
				rightHitZone.setFillStyle(0xffffff, 0),
			);
			rightHitZone.on("pointerdown", () => this.onEquationClick(i));

			container.add([background, divider, equationText, rightHitZone]);
			this.root.add(container);

			this.equations.push({
				id: i,
				coefficients: [],
				operator: null,
				constant: null,
				container,
				background,
				equationText,
				rightHitZone,
			});
		}
	}

	private buildCards() {
		const totalCardW = 5 * CARD_W + 4 * CARD_GAP;
		const cardsStartX = (INNER_W - totalCardW) / 2;
		const cardsY = 0;

		for (let i = 0; i < 5; i++) {
			const cardX = cardsStartX + i * (CARD_W + CARD_GAP);
			const container = this.scene.add.container(cardX, cardsY);

			const background = this.scene.add.rectangle(
				CARD_W / 2,
				CARD_H / 2,
				CARD_W,
				CARD_H,
				0x34495e,
			);
			background.setStrokeStyle(2, 0x7f8c8d);
			background.setInteractive({ useHandCursor: true });

			const label = this.scene.add.text(CARD_W / 2, CARD_H / 2, "", {
				fontSize: "24px",
				color: "#ecf0f1",
				fontFamily: "monospace",
				fontStyle: "bold",
			});
			label.setOrigin(0.5);

			background.on("pointerdown", () => this.onCardClick(i));
			background.on("pointerover", () => {
				if (this.cards[i]?.inUse) return;
				if (this.phase === "equation_selected") return;
				if (this.selectedCardIndex !== i)
					background.setFillStyle(0x4a6fa5);
			});
			background.on("pointerout", () => {
				if (this.selectedCardIndex !== i)
					background.setFillStyle(0x34495e);
			});

			container.add([background, label]);
			this.root.add(container);

			this.cards.push({
				index: i,
				value: 0,
				container,
				background,
				label,
				inUse: false,
			});
		}
	}

	private buildButtons() {
		const buttonY = CARD_H + 20 + (2 * EQ_H + EQ_GAP) + 20;
		const totalBtnW = 3 * BTN_W + 2 * BTN_GAP;
		const btnStartX = (INNER_W - totalBtnW) / 2;

		const leftContainer = this.scene.add.container(btnStartX, buttonY);
		const leftBg = this.scene.add.rectangle(BTN_W / 2, BTN_H / 2, BTN_W, BTN_H, 0x5d6d7e);
		leftBg.setStrokeStyle(2, 0x485460);
		const leftLabel = this.scene.add.text(BTN_W / 2, BTN_H / 2, "←", {
			fontSize: "22px",
			color: "#ffffff",
			fontFamily: "Arial",
		});
		leftLabel.setOrigin(0.5);
		leftBg.on("pointerdown", () => this.onLeftArrow());
		leftBg.on("pointerover", () => leftBg.setAlpha(0.8));
		leftBg.on("pointerout", () => leftBg.setAlpha(1));
		leftContainer.add([leftBg, leftLabel]);
		this.root.add(leftContainer);
		this.leftArrowBtn = { bg: leftBg };

		const confirmContainer = this.scene.add.container(
			btnStartX + BTN_W + BTN_GAP,
			buttonY,
		);
		const confirmBg = this.scene.add.rectangle(
			BTN_W / 2,
			BTN_H / 2,
			BTN_W,
			BTN_H,
			0x27ae60,
		);
		confirmBg.setStrokeStyle(2, 0x1e8449);
		confirmBg.setInteractive({ useHandCursor: true });
		const confirmLabel = this.scene.add.text(
			BTN_W / 2,
			BTN_H / 2,
			"Draw More",
			{
				fontSize: "13px",
				color: "#ffffff",
				fontFamily: "Arial",
				fontStyle: "bold",
			},
		);
		confirmLabel.setOrigin(0.5);
		confirmBg.on("pointerdown", () => this.onConfirm());
		confirmBg.on("pointerover", () => confirmBg.setAlpha(0.8));
		confirmBg.on("pointerout", () => confirmBg.setAlpha(1));
		confirmContainer.add([confirmBg, confirmLabel]);
		this.root.add(confirmContainer);
		this.confirmBtn = { bg: confirmBg, label: confirmLabel };

		const rightContainer = this.scene.add.container(
			btnStartX + 2 * (BTN_W + BTN_GAP),
			buttonY,
		);
		const rightBg = this.scene.add.rectangle(
			BTN_W / 2,
			BTN_H / 2,
			BTN_W,
			BTN_H,
			0x5d6d7e,
		);
		rightBg.setStrokeStyle(2, 0x485460);
		const rightLabel = this.scene.add.text(BTN_W / 2, BTN_H / 2, "→", {
			fontSize: "22px",
			color: "#ffffff",
			fontFamily: "Arial",
		});
		rightLabel.setOrigin(0.5);
		rightBg.on("pointerdown", () => this.onRightArrow());
		rightBg.on("pointerover", () => rightBg.setAlpha(0.8));
		rightBg.on("pointerout", () => rightBg.setAlpha(1));
		rightContainer.add([rightBg, rightLabel]);
		this.root.add(rightContainer);
		this.rightArrowBtn = { bg: rightBg };

		this.setArrowsEnabled(false);

		// Submit button — spans full inner width, one row below the 3-button row
		const submitY = buttonY + BTN_H + 12;
		const submitContainer = this.scene.add.container(0, submitY);
		const submitBg = this.scene.add.rectangle(
			INNER_W / 2,
			BTN_H / 2,
			INNER_W,
			BTN_H,
			0x8e44ad,
		);
		submitBg.setStrokeStyle(2, 0x6c3483);
		submitBg.setInteractive({ useHandCursor: true });
		const submitLabel = this.scene.add.text(
			INNER_W / 2,
			BTN_H / 2,
			"Place Towers",
			{
				fontSize: "16px",
				color: "#ffffff",
				fontFamily: "Arial",
				fontStyle: "bold",
			},
		);
		submitLabel.setOrigin(0.5);
		submitBg.on("pointerdown", () => this.onSubmitClick());
		submitBg.on("pointerover", () => submitBg.setAlpha(0.8));
		submitBg.on("pointerout", () => submitBg.setAlpha(1));
		submitContainer.add([submitBg, submitLabel]);
		this.root.add(submitContainer);
	}

	// ─── Card dealing ─────────────────────────────────────────────────────────

	private dealCards() {
		// Weighted pool: numbers are more common than operators
		const pool: CardValue[] = [0, 1, 2, 3, 0, 1, 2, 3, "+", "-", "+", "-"];
		for (let i = 0; i < 5; i++) {
			const card = this.cards[i];
			card.value = pool[Math.floor(Math.random() * pool.length)];
			card.label.setText(String(card.value));
			card.inUse = false;
			card.background.setFillStyle(0x34495e);
			card.background.setInteractive({ useHandCursor: true });
		}
	}

	// ─── Event handlers ───────────────────────────────────────────────────────

	private onCardClick(index: number) {
		if (this.cards[index].inUse) return;
		if (this.phase === "equation_selected") return;

		if (this.selectedCardIndex === index) {
			this.cards[index].background.setFillStyle(0x34495e);
			this.selectedCardIndex = null;
			this.enterPhase("idle");
			return;
		}

		if (this.selectedCardIndex !== null) {
			this.cards[this.selectedCardIndex].background.setFillStyle(0x34495e);
		}
		this.selectedCardIndex = index;
		this.cards[index].background.setFillStyle(0xe67e22);
		this.enterPhase("card_selected");
	}

	private onEquationClick(id: number) {
		if (this.phase !== "card_selected") return;

		if (this.selectedEquationId !== null) {
			this.equations[this.selectedEquationId].background.setStrokeStyle(
				2,
				0x566573,
			);
		}
		this.selectedEquationId = id;
		this.equations[id].background.setStrokeStyle(3, 0xe67e22);
		this.enterPhase("equation_selected");
	}

	private onLeftArrow() {
		if (this.phase !== "equation_selected") return;
		this.placeCard("left");
	}

	private onRightArrow() {
		if (this.phase !== "equation_selected") return;
		this.placeCard("right");
	}

	private onConfirm() {
		if (this.phase === "idle") {
			if (this.drawsRemaining <= 0) return;
			this.drawsRemaining--;
			this.dealCards();
			this.simplifyAll();
			this.updateDrawButton();
		} else {
			this.cancelSelection();
		}
	}

	private onSubmitClick() {
		// Cancel any in-progress card selection before submitting
		this.cancelSelection();
		this.simplifyAll();
		if (this.onSubmit) {
			this.onSubmit(this.getEquations());
		}
	}

	// ─── Placement logic ──────────────────────────────────────────────────────

	/**
	 * Left arrow  → number becomes a coefficient (written left of x), operator sets op
	 * Right arrow → number becomes the constant (written right of x), operator sets op
	 * Operator cards (+/-) behave the same for both arrows — they set the operator slot
	 */
	private placeCard(side: "left" | "right") {
		if (this.selectedCardIndex === null || this.selectedEquationId === null)
			return;

		const card = this.cards[this.selectedCardIndex];
		const eq = this.equations[this.selectedEquationId];

		if (typeof card.value === "number") {
			if (side === "left") {
				eq.coefficients.unshift(card.value);
			} else {
				// Can't place a constant before an operator exists
				if (eq.operator === null) return;
				eq.constant = card.value;
			}
		} else {
			// +/- card — set operator regardless of arrow
			eq.operator = card.value;
		}

		this.refreshEquationText(eq);

		// Consume the card
		card.inUse = true;
		card.label.setText("");
		card.background.setFillStyle(0x212f3d);
		card.background.removeInteractive();

		// Clear highlights
		eq.background.setStrokeStyle(2, 0x566573);
		this.selectedCardIndex = null;
		this.selectedEquationId = null;
		this.enterPhase("idle");
	}

	private refreshEquationText(eq: EquationData) {
		let expr = eq.coefficients.map((c) => `(${c})`).join("") + "x";
		if (eq.operator) {
			expr += ` ${eq.operator}`;
			if (eq.constant !== null) expr += ` ${eq.constant}`;
		}
		eq.equationText.setText(`y = ${expr}`);
	}

	/**
	 * Multiplies all stacked coefficients into a single m value.
	 * Called when the player redraws or ends their turn.
	 */
	private simplifyAll() {
		for (const eq of this.equations) {
			if (eq.coefficients.length === 0 && eq.operator === null) continue;

			const m = eq.coefficients.reduce((acc, c) => acc * c, 1);
			eq.coefficients = m !== 1 ? [m] : [];

			let expr = m !== 1 ? `${m}x` : "x";
			if (eq.operator) {
				expr += ` ${eq.operator}`;
				if (eq.constant !== null) expr += ` ${eq.constant}`;
			}
			eq.equationText.setText(`y = ${expr}`);
		}
	}

	private cancelSelection() {
		if (this.selectedCardIndex !== null) {
			this.cards[this.selectedCardIndex].background.setFillStyle(0x34495e);
		}
		if (this.selectedEquationId !== null) {
			this.equations[this.selectedEquationId].background.setStrokeStyle(
				2,
				0x566573,
			);
		}
		this.selectedCardIndex = null;
		this.selectedEquationId = null;
		this.enterPhase("idle");
	}

	// ─── Phase / UI state ─────────────────────────────────────────────────────

	private updateDrawButton() {
		if (this.drawsRemaining <= 0) {
			this.confirmBtn.label.setText("No Draws Left");
			this.confirmBtn.bg.setFillStyle(0x5d6d7e);
			this.confirmBtn.bg.setAlpha(0.6);
		} else {
			this.confirmBtn.label.setText(`Draw More (${this.drawsRemaining})`);
			this.confirmBtn.bg.setFillStyle(0x27ae60);
			this.confirmBtn.bg.setAlpha(1);
		}
	}

	private enterPhase(phase: PlacementPhase) {
		this.phase = phase;
		switch (phase) {
			case "idle":
				this.updateDrawButton();
				this.setArrowsEnabled(false);
				break;
			case "card_selected":
				this.confirmBtn.label.setText("Cancel");
				this.confirmBtn.bg.setFillStyle(0xe74c3c);
				this.setArrowsEnabled(false);
				break;
			case "equation_selected":
				this.confirmBtn.label.setText("Cancel");
				this.confirmBtn.bg.setFillStyle(0xe74c3c);
				this.setArrowsEnabled(true);
				break;
		}
	}

	private setArrowsEnabled(on: boolean) {
		const color = on ? 0x2980b9 : 0x5d6d7e;
		const stroke = on ? 0x1a5276 : 0x485460;
		this.leftArrowBtn.bg.setFillStyle(color);
		this.leftArrowBtn.bg.setStrokeStyle(2, stroke);
		this.rightArrowBtn.bg.setFillStyle(color);
		this.rightArrowBtn.bg.setStrokeStyle(2, stroke);
		if (on) {
			this.leftArrowBtn.bg.setInteractive({ useHandCursor: true });
			this.rightArrowBtn.bg.setInteractive({ useHandCursor: true });
		} else {
			this.leftArrowBtn.bg.removeInteractive();
			this.rightArrowBtn.bg.removeInteractive();
		}
	}

	// ─── Public API ───────────────────────────────────────────────────────────

	/** Returns the simplified {m, b, modified} for each of the 4 equation slots. */
	public getEquations(): EquationResult[] {
		return this.equations.map((eq) => {
			const m = eq.coefficients.reduce((acc, c) => acc * c, 1);
			const sign = eq.operator === "-" ? -1 : 1;
			const b = eq.constant !== null ? sign * eq.constant : 0;
			const modified = eq.coefficients.length > 0 || eq.operator !== null;
			return { m, b, modified };
		});
	}

	public show() {
		this.root.setVisible(true);
	}

	public hide() {
		this.root.setVisible(false);
	}

	public reset() {
		for (const eq of this.equations) {
			eq.coefficients = [];
			eq.operator = null;
			eq.constant = null;
			eq.background.setStrokeStyle(2, 0x566573);
			eq.equationText.setText("y = x");
		}
		this.drawsRemaining = GAME_CONFIG.MAX_DRAWS;
		this.cancelSelection();
		this.dealCards();
	}
}
