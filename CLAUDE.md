# Quiz Arena

## Overview

A single-page quiz web app with gamification features. Pure HTML/CSS/JS — no build step, no dependencies.

## Running

Open `index.html` directly in a browser (no server needed).

## Architecture

- `index.html` — shell, all screens live here as hidden `<section>` elements
- `src/style.css` — dark theme, animations, responsive layout
- `src/questions.js` — question bank array, loaded before app.js
- `src/app.js` — all game logic, state machine, localStorage leaderboard

## Screens (sections)

1. `#start-screen` — name input, category picker, difficulty picker
2. `#game-screen` — progress bar, streak indicator, question card, timer, answer buttons
3. `#results-screen` — score, accuracy, time, play-again button
4. `#leaderboard-screen` — top 10 scores, back button

## GameState

Central mutable object in `app.js`. Never stored globally on `window`. Mutated by each action function.

## Coding Conventions

- Strict equality (`===`)
- `const` / `let`, never `var`
- Functions named with camelCase verbs: `startGame`, `showQuestion`, `selectAnswer`
- DOM queries cached at top of app.js
- No external libraries

## NEVER

- Do not import npm packages
- Do not modify questions.js structure without updating the category filter logic in app.js
- Do not store sensitive data in localStorage (scores only)

## Verification

1. `npm test` — all 52 tests must pass
2. Open `index.html` in a browser — no console errors
3. Play a full game end-to-end: start screen → questions → results → leaderboard
