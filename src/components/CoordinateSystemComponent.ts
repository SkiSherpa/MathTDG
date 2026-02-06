import Phaser from "phaser";
import { Colors, getAxisLineStyle } from "../design/colors";

export class CoordinateSystemComponent {
	private scene: Phaser.Scene;
	private gridSize: number;
	private gridWidth: number;
	private gridHeight: number;
	private offsetX: number = 0;
	private offsetY: number = 0;

	constructor(
		scene: Phaser.Scene,
		gridSize: number,
		gridWidth: number,
		gridHeight: number,
		offsetX: number = 0,
		offsetY: number = 0,
	) {
		this.scene = scene;
		this.gridSize = gridSize;
		this.gridWidth = gridWidth;
		this.gridHeight = gridHeight;
		this.offsetX = offsetX;
		this.offsetY = offsetY;
	}

	public createCoordinateAxes() {
		// Calculate Origin position with offset - ensure it's at the center of the grid
		const centerGridX = Math.floor(this.gridWidth / 2);
		const centerGridY = Math.floor(this.gridHeight / 2);
		const originX = this.offsetX + centerGridX * this.gridSize;
		const originY = this.offsetY + centerGridY * this.gridSize;

		// Create axes graphics
		const axesGraphics = this.scene.add.graphics();

		// X-axis (horizontal line through Origin)
		const axisStyle = getAxisLineStyle();
		axesGraphics.lineStyle(axisStyle.thickness, Colors.axes.xAxis, 1);
		axesGraphics.moveTo(this.offsetX, originY);
		axesGraphics.lineTo(this.offsetX + this.gridWidth * this.gridSize, originY);

		// Y-axis (vertical line through Origin)
		axesGraphics.lineStyle(axisStyle.thickness, Colors.axes.yAxis, 1);
		axesGraphics.moveTo(originX, this.offsetY);
		axesGraphics.lineTo(
			originX,
			this.offsetY + this.gridHeight * this.gridSize,
		);

		axesGraphics.strokePath();

		// Add axis labels
		this.addAxisLabels(originX, originY);

		// Add coordinate labels along axes
		this.addCoordinateLabels(originX, originY);
	}

	private addAxisLabels(originX: number, originY: number) {
		// Y-axis label - at the top of the Y-axis, slightly to the right
		this.scene.add.text(originX + 15, this.offsetY + 10, "Y", {
			fontSize: "16px",
			color: `#${Colors.axes.yAxis.toString(16).padStart(6, "0")}`,
			fontFamily: "Arial",
		});

		// X-axis label - at the right end of the X-axis, slightly up
		this.scene.add.text(
			this.offsetX + this.gridWidth * this.gridSize - 10,
			originY - 15,
			"X",
			{
				fontSize: "16px",
				color: `#${Colors.axes.xAxis.toString(16).padStart(6, "0")}`,
				fontFamily: "Arial",
			},
		);
	}

	private addCoordinateLabels(originX: number, originY: number) {
		// Add coordinate numbers along X-axis (symmetrical around origin)
		const centerGridX = Math.floor(this.gridWidth / 2);
		const centerGridY = Math.floor(this.gridHeight / 2);

		// Create symmetrical X-axis labels for -10 to 10 grid
		const xLabels = [-10, -8, -6, -4, -2, 2, 4, 6, 8, 10]; // Symmetrical around 0
		for (const coordX of xLabels) {
			const gridX = centerGridX + coordX;
			if (gridX >= 0 && gridX <= this.gridWidth) {
				const worldX = this.offsetX + gridX * this.gridSize;
				this.scene.add
					.text(worldX, originY + 15, coordX.toString(), {
						fontSize: "10px",
						color: `#${Colors.coordinates.xLabels
							.toString(16)
							.padStart(6, "0")}`,
						fontFamily: "Arial",
					})
					.setOrigin(0.5);
			}
		}

		// Add coordinate numbers along Y-axis (symmetrical around origin)
		const yLabels = [-10, -8, -6, -4, -2, 2, 4, 6, 8, 10]; // Symmetrical around 0
		for (const coordY of yLabels) {
			const gridY = centerGridY - coordY; // Y-axis is inverted
			if (gridY >= 0 && gridY <= this.gridHeight) {
				const worldY = this.offsetY + gridY * this.gridSize;
				this.scene.add
					.text(originX - 15, worldY, coordY.toString(), {
						fontSize: "10px",
						color: `#${Colors.coordinates.yLabels
							.toString(16)
							.padStart(6, "0")}`,
						fontFamily: "Arial",
					})
					.setOrigin(0.5);
			}
		}

		// Add origin label (0,0)
		this.scene.add.text(originX - 20, originY + 20, "(0,0)", {
			fontSize: "12px",
			color: `#${Colors.coordinates.originLabel.toString(16).padStart(6, "0")}`,
			fontFamily: "Arial",
		});
	}
}
