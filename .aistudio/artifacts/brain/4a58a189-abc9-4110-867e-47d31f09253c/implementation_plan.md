# Implementation Plan - Combo Streaks, Achievements & Infinite Gameplay

## Overview
Enhance gameplay quality, visual feedback, achievements, and infinite replayability across Bulmaca Kulübü games.

## Proposed Changes

### 1. Achievements & Badges System (`src/types.ts` & `src/utils/achievements.ts`)
- Define achievement types (e.g. İlk Galibiyet, Seri Ustası, Hızlı Çözüm, Kelime Avcısı).
- Store unlocked achievements in localStorage.
- Show animated toast notification when an achievement is unlocked.

### 2. Combo Streaks & Enhanced Feedback (`src/utils/audio.ts` & game components)
- Track consecutive wins/correct guesses.
- Add combo sound effects and visual celebration effects when combo milestones are reached.

### 3. Infinite Replayability (`src/games/*`)
- Ensure all games (Kelime Bulmaca, Kelime Türetme, Sözcük Avı, Adam Asmaca, Sudoku, Satranç, Kelime Zinciri, Hafıza Kartları, Nokta Avı) generate fresh random content infinitely upon completion or reset.

## Verification Plan
- Compile applet with `compile_applet`.
- Verify linting with `lint_applet`.
