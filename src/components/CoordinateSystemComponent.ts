import Phaser from "phaser";
import { Colors, getAxisLineStyle } from "../design/colors";

export class CoordinateSystemComponent {
	private scene: Phaser.Scene;
	private gridSize: number;
	private gridWidth: number;
	private gridHeight: number;

	constructor(
		scene: Phaser.Scene,
		gridSize: number,
		gridWidth: number,
		gridHeight: number
	) {
		this.scene = scene;
		this.gridSize = gridSize;
		this.gridWidth = gridWidth;
		this.gridHeight = gridHeight;
	}

	public createCoordinateAxes() {
		// Calculate Origin position
		const originX = (this.gridWidth / 2) * this.gridSize;
		const originY = (this.gridHeight / 2) * this.gridSize;

		// Create axes graphics
		const axesGraphics = this.scene.add.graphics();

		// X-axis (horizontal line through Origin)
		const axisStyle = getAxisLineStyle();
		axesGraphics.lineStyle(axisStyle.thickness, Colors.axes.xAxis, 1);
		axesGraphics.moveTo(0, originY);
		axesGraphics.lineTo(this.gridWidth * this.gridSize, originY);

		// Y-axis (vertical line through Origin)
		axesGraphics.lineStyle(axisStyle.thickness, Colors.axes.yAxis, 1);
		axesGraphics.moveTo(originX, 0);
		axesGraphics.lineTo(originX, this.gridHeight * this.gridSize);

		axesGraphics.strokePath();

		// Add axis labels
		this.addAxisLabels(originX, originY);

		// Add coordinate labels along axes
		this.addCoordinateLabels(originX, originY);
	}

	private addAxisLabels(originX: number, originY: number) {
		// Y-axis label
		this.scene.add.text(originX + 10, 10, "Y", {
			fontSize: "16px",
			color: `#${Colors.axes.yAxis.toString(16).padStart(6, "0")}`,
			fontFamily: "Arial",
		});

		// X-axis label
		this.scene.add.text(
			this.gridWidth * this.gridSize - 20,
			originY - 10,
			"X",
			{
				fontSize: "16px",
				color: `#${Colors.axes.xAxis.toString(16).padStart(6, "0")}`,
				fontFamily: "Arial",
			}
		);
	}

	private addCoordinateLabels(originX: number, originY: number) {
		// Add coordinate numbers along X-axis
		for (let x = 0; x <= this.gridWidth; x += 4) {
			const worldX = x * this.gridSize;
			if (worldX !== originX) {
				// Don't label the origin itself
				const coordX = x - this.gridWidth / 2;
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

		// Add coordinate numbers along Y-axis
		for (let y = 0; y <= this.gridHeight; y += 4) {
			const worldY = y * this.gridSize;
			if (worldY !== originY) {
				// Don't label the origin itself
				const coordY = this.gridHeight / 2 - y;
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
