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
- Tower types live in src/towers/ (polymorphic class hierarchy)

## Project Structure

- src/components/ - Reusable game components
- src/scenes/ - Phaser scenes
- src/design/ - Design tokens (colors, etc.)
- src/towers/ - Tower type classes and manager
- src/config/ - Shared game constants

## Tower Placement System

Tower placement is equation-driven, not click-driven. The `TowerPlacementComponent` (shown right of the grid during placement phase) handles the full interaction:

### Layout
- 5 randomly dealt cards on top (numbers 0–3, operators +/-)
- 2×2 grid of equation slots below — each starts as `y = x`
- Three buttons: `←` | `Draw More / Cancel` | `→`
- `Place Towers` button (full-width, purple) at the bottom

### Card placement flow
1. Click a card to select it — center button becomes **Cancel**, arrows appear (disabled)
2. Click the right half of an equation slot — arrows **enable**
3. Click `←` to place a number as a coefficient left of x, or `→` to place a number as a constant right of x
   - Operator cards (+/-) set the operator between the x-term and constant (same for both arrows)
   - A constant cannot be placed before an operator exists on that slot
4. **Draw More** redraws all 5 cards and simplifies all equations (e.g. `(3)(2)x` → `6x`)
   - Limited to `MAX_DRAWS` uses per placement phase (resets each turn)

### Tower placement rule (y = mx + b)
Pressing **Place Towers** evaluates each modified equation and places a **Laser Line Tower** at its **y-intercept**:

- Coordinate `(0, b)` → grid cell `(originGridX, originGridY - b)` = `(10, 10 - b)`
- Unmodified slots (no cards placed) are skipped
- Cells already occupied or out of bounds are silently skipped
- Example: `y = 6x` (b=0) → grid `(10, 10)` (origin, already occupied — no tower)
- Example: `y = 2x + 3` (b=3) → grid `(10, 7)` — three cells above origin on the y-axis

### Key types
- `EquationResult { m, b, modified }` — exported from `TowerPlacementComponent`, used as the contract between the placement UI and `GameScene`
- `TowerPlacementComponent.getEquations()` returns `EquationResult[]` with simplified values

## Tower System

Tower types live in `src/towers/` and follow a polymorphic class hierarchy. Each tower is fully self-contained — its visuals, effect, and cleanup all live in one file.

### Adding a new tower type
1. Create `src/towers/YourTower.ts` extending `Tower`
2. Implement `render()` (build visuals, push all objects into `this.ownedObjects`)
3. Override `onCreepStep(i: CreepInteraction)` to apply the tower's effect (call `i.kill()`, `i.damage()`, etc.)
4. Register it in `src/towers/TowerRegistry.ts` — one line
5. Optionally add a typed wrapper to `TowerManager` — one line

### Key files
- `src/towers/Tower.ts` — abstract base class; defines `GridGeometry`, `CreepInteraction`, and `TowerFactory` types
- `src/towers/TowerRegistry.ts` — maps type-id strings to factory functions; **the only file that needs editing to register a new type**
- `src/towers/TowerManager.ts` — holds all placed towers, dispatches `applyCreepStep`, exposes typed placement helpers (`placeBasic`, `placeLaser`)
- `src/towers/BasicTower.ts` — click-placed block, no combat effect
- `src/towers/LaserLineTower.ts` — equation-placed tower; draws a clipped laser line across the grid and kills any creep that crosses it

### CreepInteraction contract
Towers express effects by calling actions on the `CreepInteraction` object passed to `onCreepStep`:
- `i.kill()` — destroys the creep (currently the only action)
- Future: `i.damage(n)`, `i.slow(factor)`, etc. — add to the interface without changing existing towers

### Laser Line Tower
- Placed at the y-intercept of its equation: coordinate `(0, b)` → grid cell `(10, 10 - b)`
- Draws a blue laser line (`Colors.towers.border`) clipped to the grid bounds
- Kills any creep whose movement step crosses the line (sign-change test on `f(x,y) = y − (mx+b)`)
- Visual and collision logic both live in `src/towers/LaserLineTower.ts`

## Game Config

Central constants live in `src/config/gameConfig.ts`:
- `MAX_TURNS` — number of turns per game
- `STARTING_HEALTH` — origin health at game start
- `CREEPS_PER_TOWER` — creeps spawned per creep tower
- `TURNS_UNTIL_RELEASE` — turns before a creep tower releases its creeps
- `MAX_DRAWS` — number of times a player can use Draw More per placement phase

## Coding Conventions

- TypeScript strict mode, `moduleResolution: bundler` (Vite-compatible)
- New tower types go in `src/towers/` following the existing class hierarchy
- Components in `src/components/` follow the existing component patterns
- All game objects a tower creates must be pushed into `this.ownedObjects` — the base `destroy()` handles cleanup automatically
