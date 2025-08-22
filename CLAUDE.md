# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Tokyo Metro Quiz web game where users guess station names based on their Metro interchange symbols. The game is a simple static HTML/CSS/JavaScript application.

## Architecture

- **Frontend-only application**: Pure HTML/CSS/JavaScript with no backend or build tools
- **Main files**:
  - `index.html`: Three screens (start, game, end) managed via CSS visibility
  - `script.js`: Core game logic with question generation, timer, and scoring
  - `style.css`: Responsive styling with mobile-first design
  - `stations.json`: Station data with names (English/Japanese) and line codes
  - `lines.json`: Line code to color hex mapping

## Data Processing

Station and line data is generated from Excel files:
```bash
python convert_data.py
```
This reads `1.xlsx` (stations) and `2.xlsx` (line colors) and outputs JSON files.

## Development

No build process required. Simply open `index.html` in a browser to run the game locally.

## Game Flow

1. Displays station interchange symbols (colored badges with line codes)
2. User selects from 4 station name options within 10 seconds
3. Tracks score across 10 questions total
4. Shows final score and allows restart