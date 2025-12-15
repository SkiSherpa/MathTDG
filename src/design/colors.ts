/**
 * Color Design System for MathTDG
 * Centralized color tokens for consistent theming across the game
 */

export const Colors = {
	// Grid System
	grid: {
		lines: 0x34495e,
		linesAlpha: 0.5,
	},

	// Coordinate System
	axes: {
		xAxis: 0x5a5a70, // Dark Blue
		yAxis: 0x5a5a70, // Dark Blue
		axisThickness: 3,
	},

	// Origin
	origin: {
		background: 0xe74c3c, // Red (same as X-axis)
		label: 0xffffff, // White
	},

	// Towers
	towers: {
		background: 0x3498db, // Blue
		border: 0x0087cc, // Bright blue border
		label: 0xffffff, // White
	},

	// Creep Towers
	creepTowers: {
		background: 0x8e44ad, // Purple
		border: 0x6c3483, // Dark purple border
		label: 0xffffff, // White
		circle: 0xe74c3c, // Red (placeholder creep color)
	},

	// UI Elements
	ui: {
		primary: 0xffffff, // White
		secondary: 0xbdc3c7, // Light gray
		background: 0xdfdbc3, // beige
	},

	// Coordinate Labels
	coordinates: {
		xLabels: 0x5a5a70, // Dark blue
		yLabels: 0x5a5a70, //Dark blue
		originLabel: 0xffffff, // White
	},

	// Game Phases (for future use)
	phases: {
		placement: 0x27ae60, // Green
		action: 0xe74c3c, // Red
		paused: 0xf39c12, // Orange
	},

	// Health Counter
	healthCounter: {
		healthNumber: 0xffffff, // White
		background: 0xe74c3c, // Red
	},
} as const;

// Type for color categories
export type ColorCategory = keyof typeof Colors;

// Helper function to get color with optional alpha
export function getColorWithAlpha(
	color: number,
	alpha: number = 1.0
): { color: number; alpha: number } {
	return { color, alpha };
}

// Helper function to get grid line style
export function getGridLineStyle() {
	return {
		thickness: 1,
		color: Colors.grid.lines,
		alpha: Colors.grid.linesAlpha,
	};
}

// Helper function to get axis line style
export function getAxisLineStyle() {
	return {
		thickness: Colors.axes.axisThickness,
	};
}
