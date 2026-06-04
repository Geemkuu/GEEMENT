# eFootball Tournament Hub

A full-stack league and knockout tournament manager built with React (Vite), Tailwind CSS, and Node.js / Express with SQLite.

## Project structure

- `/frontend` — React SPA with league dashboard, join flow, profile views, and admin controls.
- `/backend` — Express API with SQLite storage for teams, matches, players, and invite tokens.

## Setup

1. Open two terminals.
2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```
4. Start the backend server:
   ```bash
   cd ../backend
   npm run start
   ```
5. Start the frontend app:
   ```bash
   cd ../frontend
   npm run dev
   ```

## Admin token

- Use `adminKey=efootball-admin` for admin-only endpoints.

## Features

- Invite link registration via `/join?token=efootball2026`
- Team onboarding with manager name, team badge preset, and local image upload.
- League standings with automatic table calculations.
- Admin match score entry and scorer tracking.
- Golden Boot leaderboard and Hall of Fame stats.
- Knockout bracket support seeded from league standings.
