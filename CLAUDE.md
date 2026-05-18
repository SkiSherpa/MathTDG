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

## Current Feature In Progress

- Replacing mouse-click tower placement with an equation-building UI
- Players build linear equations (y = mx + b) using randomly generated cards
- Cards contain numbers (0-3) and operators (+, -)
- Interface: 2×2 grid of equation slots at top, 5 cards in middle, nav buttons at bottom

## Coding Conventions

- TypeScript strict mode
- Component-based patterns following existing architecture
- Follow patterns established in existing components
