# MathTDG

A math-based tower defense game where players build defenses by constructing linear equations. Towers are placed by solving `y = mx + b` — the equation's y-intercept determines where the tower lands on the grid.

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Tech Stack

| Tool | Role |
|------|------|
| [Phaser 3](https://phaser.io/) | Game engine (rendering, input, tweens, scene management) |
| TypeScript | Type-safe game logic |
| Vite | Dev server and production bundler |

## Architecture

The game runs as a single Phaser scene (`GameScene`) composed of focused components.

### Grid & Coordinate System
A 21×21 grid of 32px cells. Math coordinates run from −10 to 10 on both axes, with the origin `(0, 0)` at the center. Grid cell `(10, 10)` is the home base the player defends.

### Game Loop
Each turn has two phases:
1. **Placement** — player builds equations using dealt cards, then presses *Place Towers*
2. **Attack** — creep towers release enemies that pathfind toward the origin; towers intercept them

### Tower System
Tower types live in `src/towers/` and follow a polymorphic class hierarchy:

```
Tower (abstract base)
├── BasicTower       — click-placed block, no combat effect
└── LaserLineTower   — draws y = mx + b across the grid; kills creeps that cross the line
```

Each tower is self-contained: its visuals, effect, and cleanup all live in one file. To add a new tower type:

1. Create `src/towers/YourTower.ts` extending `Tower`
2. Register it in `src/towers/TowerRegistry.ts` — one line
3. Optionally add a typed helper to `TowerManager`

The `CreepInteraction` interface is the effect contract — towers call `i.kill()` today, with `i.damage()` and `i.slow()` as natural extensions.

### Key Directories

```
src/
├── scenes/       # GameScene — main loop, phase switching, component wiring
├── components/   # Grid, UI, creep movement, health, placement panel
├── towers/       # Tower base class, concrete types, registry, manager
├── config/       # Shared constants (MAX_TURNS, STARTING_HEALTH, MAX_DRAWS, …)
└── design/       # Color tokens
```
