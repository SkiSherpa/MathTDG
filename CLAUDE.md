# MathTDG - Math Tower Defense Game

## Stack

- Phaser 3 with TypeScript
- Vite for bundling
- Node.js

## Commands

- `npm run dev` - Start dev server
- `npm run build` - Production build

## Architecture

- Grid: 21×21 cells, 32px per cell, coordinates from -10 to 10
- Players place towers in the inner 19×19 area
- Creep towers spawn on the outer edge at distance 10
- Distinct phases: tower placement/upgrade phase and attack phase
- Component-based architecture in src/components/

## Project Structure

- src/components/ - Reusable game components
- src/scenes/ - Phaser scenes
- src/design/ - Design tokens (colors, etc.)

## Tower Placement System

Tower placement is equation-driven, not click-driven. The `TowerPlacementComponent` (shown right of the grid during placement phase) handles the full interaction:

### Layout
- 2×2 grid of equation slots — each starts as `y = x`
- 5 randomly dealt cards below (numbers 0–3, operators +/-)
- Three buttons: `←` | `Draw More / Cancel` | `→`
- `Place Towers` button (full-width, purple) at the bottom

### Card placement flow
1. Click a card to select it — center button becomes **Cancel**, arrows appear (disabled)
2. Click the right half of an equation slot — arrows **enable**
3. Click `←` to place a number as a coefficient left of x, or `→` to place a number as a constant right of x
   - Operator cards (+/-) set the operator between the x-term and constant (same for both arrows)
   - A constant cannot be placed before an operator exists on that slot
4. **Draw More** redraws all 5 cards and simplifies all equations (e.g. `(3)(2)x` → `6x`)

### Tower placement rule (y = mx + b)
Pressing **Place Towers** evaluates each modified equation and places a tower at its **y-intercept**:

- Coordinate `(0, b)` → grid cell `(originGridX, originGridY - b)` = `(10, 10 - b)`
- Unmodified slots (no cards placed) are skipped
- Cells already occupied or out of bounds are silently skipped
- Example: `y = 6x` (b=0) → grid `(10, 10)` (origin, already occupied — no tower)
- Example: `y = 2x + 3` (b=3) → grid `(10, 7)` — three cells above origin on the y-axis

### Key types
- `EquationResult { m, b, modified }` — exported from `TowerPlacementComponent`, used as the contract between the placement UI and `GameScene`
- `TowerPlacementComponent.getEquations()` returns `EquationResult[]` with simplified values

## Game Config

Central constants live in `src/config/gameConfig.ts`:
- `MAX_TURNS` — number of turns per game
- `STARTING_HEALTH` — origin health at game start
- `CREEPS_PER_TOWER` — creeps spawned per creep tower
- `TURNS_UNTIL_RELEASE` — turns before a creep tower releases its creeps

## Coding Conventions

- TypeScript strict mode, `moduleResolution: bundler` (Vite-compatible)
- Component-based patterns following existing architecture
- Follow patterns established in existing components
