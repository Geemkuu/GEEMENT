import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'league.sqlite');
const ADMIN_KEY = 'efootball-admin';
const DEFAULT_INVITE = 'efootball2026';

await fs.promises.mkdir(DATA_DIR, { recursive: true });
const db = await open({
  filename: DB_PATH,
  driver: sqlite3.Database
});

await db.exec(`
CREATE TABLE IF NOT EXISTS invite_tokens (
  id INTEGER PRIMARY KEY,
  token TEXT UNIQUE,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS teams (
  id INTEGER PRIMARY KEY,
  manager_name TEXT,
  team_name TEXT,
  badge TEXT,
  token TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY,
  team_id INTEGER,
  player_name TEXT,
  goals INTEGER DEFAULT 0,
  FOREIGN KEY(team_id) REFERENCES teams(id)
);
CREATE TABLE IF NOT EXISTS matches (
  id INTEGER PRIMARY KEY,
  home_team_id INTEGER,
  away_team_id INTEGER,
  stage TEXT,
  round_label TEXT,
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  scored_detail TEXT DEFAULT '[]',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(home_team_id, away_team_id, stage, round_label),
  FOREIGN KEY(home_team_id) REFERENCES teams(id),
  FOREIGN KEY(away_team_id) REFERENCES teams(id)
);
`);

const inviteRow = await db.get('SELECT token FROM invite_tokens ORDER BY id DESC LIMIT 1');
if (!inviteRow) {
  await db.run('INSERT INTO invite_tokens (token) VALUES (?)', DEFAULT_INVITE);
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../frontend/dist')));

function buildLeagueStats(teams, matches, scorers) {
  const table = teams.map((team) => ({
    teamId: team.id,
    managerName: team.manager_name,
    teamName: team.team_name,
    badge: team.badge,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0
  }));
  const look = Object.fromEntries(table.map((row) => [row.teamId, row]));

  matches.filter((m) => m.stage === 'league').forEach((match) => {
    const home = look[match.home_team_id];
    const away = look[match.away_team_id];
    if (!home || !away) return;
    home.played += 1;
    away.played += 1;
    home.goalsFor += match.home_score;
    home.goalsAgainst += match.away_score;
    away.goalsFor += match.away_score;
    away.goalsAgainst += match.home_score;
    if (match.home_score > match.away_score) {
      home.wins += 1;
      away.losses += 1;
      home.points += 3;
    } else if (match.home_score < match.away_score) {
      away.wins += 1;
      home.losses += 1;
      away.points += 3;
    } else {
      home.draws += 1;
      away.draws += 1;
      home.points += 1;
      away.points += 1;
    }
  });

  table.forEach((row) => {
    row.goalDifference = row.goalsFor - row.goalsAgainst;
  });
  table.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });
  return table;
}

function buildKnockoutBracket(leagueRows) {
  const seeded = leagueRows.slice(0, 8);
  if (seeded.length < 2) return null;

  const pair = (i, j, round) => ({
    id: `${round}-${i + 1}-${j + 1}`,
    home: seeded[i] ? { teamId: seeded[i].teamId, teamName: seeded[i].teamName, badge: seeded[i].badge } : null,
    away: seeded[j] ? { teamId: seeded[j].teamId, teamName: seeded[j].teamName, badge: seeded[j].badge } : null,
    stage: round
  });

  const quarter = [pair(0, 7, 'Quarter-final'), pair(3, 4, 'Quarter-final'), pair(1, 6, 'Quarter-final'), pair(2, 5, 'Quarter-final')];
  return {
    edition: 'Top 8 Knockout Seed',
    rounds: [
      { title: 'Quarter-finals', matches: quarter }
    ]
  };
}

function extractTopScorers(players) {
  const sorted = players.slice().sort((a, b) => b.goals - a.goals || a.player_name.localeCompare(b.player_name));
  return sorted.slice(0, 10);
}

app.get('/api/invite', async (req, res) => {
  const token = req.query.token || '';
  if (!token) {
    return res.status(400).json({ success: false, message: 'Missing invite token.' });
  }
  const row = await db.get('SELECT token FROM invite_tokens WHERE token = ?', token);
  return res.json({ success: !!row, token, valid: !!row, message: row ? 'Invite token is valid.' : 'Invalid or expired invite token.' });
});

app.get('/api/admin/invite', async (req, res) => {
  const key = req.query.adminKey;
  if (key !== ADMIN_KEY) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const row = await db.get('SELECT token FROM invite_tokens ORDER BY id DESC LIMIT 1');
  return res.json({ success: true, token: row.token, link: `/join?token=${row.token}` });
});

app.post('/api/admin/invite', async (req, res) => {
  const key = req.query.adminKey;
  if (key !== ADMIN_KEY) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const token = req.body.token || `efootball${Date.now()}`;
  await db.run('INSERT INTO invite_tokens (token) VALUES (?)', token);
  return res.json({ success: true, token, link: `/join?token=${token}` });
});

app.get('/api/teams', async (req, res) => {
  const teams = await db.all('SELECT * FROM teams ORDER BY created_at');
  res.json({ success: true, teams });
});

app.get('/api/teams/:id', async (req, res) => {
  const id = Number(req.params.id);
  const team = await db.get('SELECT * FROM teams WHERE id = ?', id);
  if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
  const players = await db.all('SELECT * FROM players WHERE team_id = ? ORDER BY goals DESC, player_name', id);
  res.json({ success: true, team, players });
});

async function refreshLeagueSchedule() {
  const teams = await db.all('SELECT id FROM teams ORDER BY id');
  const existingMatchKeys = new Set((await db.all('SELECT home_team_id, away_team_id, stage, round_label FROM matches')).map((m) => `${m.home_team_id}:${m.away_team_id}:${m.stage}:${m.round_label}`));
  const newLeagueMatches = [];
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      const home = teams[i].id;
      const away = teams[j].id;
      const label = `Round ${i + j}`;
      const key = `${home}:${away}:league:${label}`;
      if (!existingMatchKeys.has(key)) {
        newLeagueMatches.push({ home, away, label });
      }
    }
  }
  for (const match of newLeagueMatches) {
    await db.run('INSERT OR IGNORE INTO matches (home_team_id, away_team_id, stage, round_label) VALUES (?, ?, ?, ?)', match.home, match.away, 'league', match.label);
  }
}

async function maybeCreateKnockout(leagueTable) {
  const completedLeague = leagueTable.length > 1 && leagueTable.every((row) => row.played > 0);
  const existingKnockout = await db.get('SELECT id FROM matches WHERE stage = ?', 'knockout');
  if (!completedLeague || existingKnockout) return;
  const seeds = leagueTable.slice(0, 8);
  const matchups = [ [0, 7], [3, 4], [1, 6], [2, 5] ];
  for (const [a, b] of matchups) {
    if (!seeds[a] || !seeds[b]) continue;
    await db.run('INSERT INTO matches (home_team_id, away_team_id, stage, round_label) VALUES (?, ?, ?, ?)', seeds[a].teamId, seeds[b].teamId, 'knockout', 'Quarter-final');
  }
}

app.post('/api/register', async (req, res) => {
  const { managerName, teamName, badge, token } = req.body;
  if (!managerName || !teamName || !token) {
    return res.status(400).json({ success: false, message: 'Please complete all required fields.' });
  }
  const invite = await db.get('SELECT token FROM invite_tokens WHERE token = ?', token);
  if (!invite) return res.status(400).json({ success: false, message: 'Invalid invite URL.' });
  const existing = await db.get('SELECT id FROM teams WHERE team_name = ? OR manager_name = ?', teamName, managerName);
  if (existing) return res.status(400).json({ success: false, message: 'A similar team or manager already exists.' });
  const result = await db.run('INSERT INTO teams (manager_name, team_name, badge, token) VALUES (?, ?, ?, ?)', managerName, teamName, badge, token);
  const teamId = result.lastID;
  const starterPlayers = ['Nova', 'Phantom', 'Viper', 'Striker', 'Titan'].map((name, index) => ({
    player_name: `${name} ${teamName.split(' ')[0]}`,
    goals: 0,
    team_id: teamId
  }));
  for (const player of starterPlayers) {
    await db.run('INSERT INTO players (team_id, player_name, goals) VALUES (?, ?, ?)', player.team_id, player.player_name, player.goals);
  }
  await refreshLeagueSchedule();
  res.json({ success: true, message: 'Team registered successfully.', teamId });
});

app.get('/api/fixtures', async (req, res) => {
  const matches = await db.all('SELECT m.*, th.team_name AS home_team_name, ta.team_name AS away_team_name, th.badge AS home_badge, ta.badge AS away_badge FROM matches m JOIN teams th ON th.id = m.home_team_id JOIN teams ta ON ta.id = m.away_team_id ORDER BY CASE stage WHEN "league" THEN 1 WHEN "knockout" THEN 2 ELSE 3 END, round_label, m.id');
  res.json({ success: true, fixtures: matches });
});

app.post('/api/fixtures/:id/result', async (req, res) => {
  const matchId = Number(req.params.id);
  const { homeScore, awayScore, scorers } = req.body;
  const key = req.query.adminKey;
  if (key !== ADMIN_KEY) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const match = await db.get('SELECT * FROM matches WHERE id = ?', matchId);
  if (!match) return res.status(404).json({ success: false, message: 'Match not found' });
  const scored = Array.isArray(scorers) ? scorers : [];
  await db.run('UPDATE matches SET home_score = ?, away_score = ?, scored_detail = ? WHERE id = ?', homeScore, awayScore, JSON.stringify(scored), matchId);
  for (const scorer of scored) {
    if (!scorer.playerName || !scorer.teamId || !scorer.goals) continue;
    const existing = await db.get('SELECT id, goals FROM players WHERE team_id = ? AND player_name = ?', scorer.teamId, scorer.playerName);
    if (existing) {
      await db.run('UPDATE players SET goals = ? WHERE id = ?', existing.goals + scorer.goals, existing.id);
    } else {
      await db.run('INSERT INTO players (team_id, player_name, goals) VALUES (?, ?, ?)', scorer.teamId, scorer.playerName, scorer.goals);
    }
  }
  res.json({ success: true, message: 'Match updated successfully.' });
});

app.get('/api/leaderboards', async (req, res) => {
  const players = await db.all('SELECT p.player_name, p.goals, t.team_name FROM players p JOIN teams t ON p.team_id = t.id ORDER BY goals DESC, player_name LIMIT 10');
  res.json({ success: true, scorers: players });
});

app.get('/api/halloffame', async (req, res) => {
  const teams = await db.all('SELECT * FROM teams');
  const matches = await db.all('SELECT * FROM matches');
  const players = await db.all('SELECT p.player_name, p.goals, t.team_name FROM players p JOIN teams t ON p.team_id = t.id ORDER BY goals DESC, player_name');
  const leagueTable = buildLeagueStats(teams, matches, players);
  const leader = leagueTable[0] || null;
  const topScorer = players[0] || null;
  res.json({ success: true, leader, topScorer });
});

app.get('/api/table', async (req, res) => {
  const teams = await db.all('SELECT * FROM teams');
  const matches = await db.all('SELECT * FROM matches');
  const table = buildLeagueStats(teams, matches);
  await maybeCreateKnockout(table);
  res.json({ success: true, table });
});

app.get('/api/knockout', async (req, res) => {
  const teams = await db.all('SELECT * FROM teams');
  const matches = await db.all('SELECT * FROM matches');
  const table = buildLeagueStats(teams, matches);
  const bracket = buildKnockoutBracket(table);
  res.json({ success: true, bracket, seeded: table.slice(0, 8) });
});

app.get('/api/status', (req, res) => {
  res.json({ success: true, message: 'eFootball API is online.' });
});

app.use((req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ success: false, message: 'API not found.' });
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
