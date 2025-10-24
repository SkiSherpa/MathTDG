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
		xAxis: 0xe74c3c, // Red
		yAxis: 0x27ae60, // Green
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
		label: 0xffffff, // White
	},

	// UI Elements
	ui: {
		primary: 0xffffff, // White
		secondary: 0xbdc3c7, // Light gray
		background: 0x2c3e50, // Dark blue-gray
	},

	// Coordinate Labels
	coordinates: {
		xLabels: 0xe74c3c, // Red (matching X-axis)
		yLabels: 0x27ae60, // Green (matching Y-axis)
		originLabel: 0xffffff, // White
	},

	// Game Phases (for future use)
	phases: {
		placement: 0x27ae60, // Green
		action: 0xe74c3c, // Red
		paused: 0xf39c12, // Orange
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
