import { createContext, useState, useCallback, useEffect } from 'react';

export const AppContext = createContext(null);

const STORAGE_KEY = 'efootball_league_state';
const DEFAULT_INVITE = { token: 'efootball2026', link: '/join?token=efootball2026' };

function createStarterPlayers(teamName, teamId) {
  const baseName = teamName.split(' ')[0] || 'Team';
  return ['Nova', 'Phantom', 'Viper', 'Striker', 'Titan'].map((name, index) => ({
    id: Date.now() + index,
    team_id: teamId,
    player_name: `${name} ${baseName}`,
    goals: 0
  }));
}

function buildLeagueStats(teams, matches) {
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

  matches.filter((match) => match.stage === 'league').forEach((match) => {
    const home = look[match.homeTeamId];
    const away = look[match.awayTeamId];
    if (!home || !away) return;

    home.played += 1;
    away.played += 1;
    home.goalsFor += Number(match.home_score);
    home.goalsAgainst += Number(match.away_score);
    away.goalsFor += Number(match.away_score);
    away.goalsAgainst += Number(match.home_score);

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

function buildLeaderboards(players, teams) {
  const teamMap = new Map(teams.map((team) => [team.id, team.team_name]));
  return players
    .slice()
    .sort((a, b) => b.goals - a.goals || a.player_name.localeCompare(b.player_name))
    .slice(0, 10)
    .map((player) => ({
      ...player,
      team_name: teamMap.get(player.team_id) || 'Unknown Club'
    }));
}

function buildHallOfFame(table, players) {
  const leader = table[0] || null;
  const topScorer = players
    .slice()
    .sort((a, b) => b.goals - a.goals || a.player_name.localeCompare(b.player_name))[0] || null;
  return { leader, topScorer };
}

function ensureLeagueSchedule(teams, matches) {
  const existing = new Set(
    matches
      .filter((match) => match.stage === 'league')
      .map((match) => `${match.homeTeamId}:${match.awayTeamId}`)
  );
  const schedule = [...matches];

  for (let i = 0; i < teams.length; i += 1) {
    for (let j = i + 1; j < teams.length; j += 1) {
      const home = teams[i].id;
      const away = teams[j].id;
      const key = `${home}:${away}`;
      if (!existing.has(key)) {
        schedule.push({
          id: Date.now() + schedule.length + i + j,
          homeTeamId: home,
          awayTeamId: away,
          stage: 'league',
          roundLabel: `Round ${i + j}`,
          home_score: 0,
          away_score: 0,
          scored_detail: []
        });
      }
    }
  }

  return schedule;
}

function ensureKnockoutMatches(teams, matches) {
  const leagueTable = buildLeagueStats(teams, matches);
  const seeded = leagueTable.slice(0, 8);
  if (seeded.length < 8) return matches;
  if (matches.some((match) => match.stage === 'knockout')) return matches;

  const pairings = [
    [0, 7],
    [3, 4],
    [1, 6],
    [2, 5]
  ];

  const bracketMatches = pairings
    .map(([homeIndex, awayIndex], index) => {
      const home = seeded[homeIndex];
      const away = seeded[awayIndex];
      if (!home || !away) return null;
      return {
        id: Date.now() + index + 1000,
        homeTeamId: home.teamId,
        awayTeamId: away.teamId,
        stage: 'knockout',
        roundLabel: 'Quarter-finals',
        home_score: 0,
        away_score: 0,
        scored_detail: []
      };
    })
    .filter(Boolean);

  return [...matches, ...bracketMatches];
}

function enrichFixtures(matches, teams) {
  const teamMap = new Map(teams.map((team) => [team.id, team]));
  return matches
    .map((match) => {
      const home = teamMap.get(match.homeTeamId) || {};
      const away = teamMap.get(match.awayTeamId) || {};
      return {
        ...match,
        home_team_name: home.team_name || 'TBD',
        away_team_name: away.team_name || 'TBD',
        home_badge: home.badge || '',
        away_badge: away.badge || ''
      };
    })
    .sort((a, b) => {
      if (a.stage !== b.stage) return a.stage === 'league' ? -1 : 1;
      if (a.roundLabel !== b.roundLabel) return a.roundLabel.localeCompare(b.roundLabel);
      return a.id - b.id;
    });
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Corrupt local storage state:', error);
    return null;
  }
}

function persistState(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function AppProvider({ children }) {
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [table, setTable] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [hallOfFame, setHallOfFame] = useState({});
  const [invite, setInvite] = useState(DEFAULT_INVITE);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const computeState = useCallback((teamsState, playersState, matchesState) => {
    const leagueMatches = ensureLeagueSchedule(teamsState, matchesState);
    const combinedMatches = ensureKnockoutMatches(teamsState, leagueMatches);
    const leagueTable = buildLeagueStats(teamsState, leagueMatches);
    const scoreBoard = buildLeaderboards(playersState, teamsState);
    const hall = buildHallOfFame(leagueTable, playersState);
    const enrichedFixtures = enrichFixtures(combinedMatches, teamsState);
    return {
      matches: combinedMatches,
      table: leagueTable,
      leaderboard: scoreBoard,
      hallOfFame: hall,
      fixtures: enrichedFixtures
    };
  }, []);

  const hashPassword = (password) => btoa(password || '');
  const createUserId = () => Date.now() + Math.floor(Math.random() * 1000);
  const createStorageState = () => ({
    teams: [],
    players: [],
    matches: [],
    invite: DEFAULT_INVITE,
    users: [],
    currentUser: null
  });

  const syncState = useCallback(
    (teamsState, playersState, matchesState, inviteState, usersState, currentUserState) => {
      const computed = computeState(teamsState, playersState, matchesState);
      setTeams(teamsState);
      setPlayers(playersState);
      setMatches(computed.matches);
      setInvite(inviteState);
      setUsers(usersState);
      setCurrentUser(currentUserState);
      setTable(computed.table);
      setLeaderboard(computed.leaderboard);
      setHallOfFame(computed.hallOfFame);
      setFixtures(computed.fixtures);
      persistState({
        teams: teamsState,
        players: playersState,
        matches: computed.matches,
        invite: inviteState,
        users: usersState,
        currentUser: currentUserState
      });
    },
    [computeState]
  );

  const initApp = useCallback(() => {
    setLoading(true);
    const saved = loadFromStorage() || createStorageState();
    const computed = computeState(saved.teams, saved.players, saved.matches);
    setTeams(saved.teams);
    setPlayers(saved.players);
    setMatches(computed.matches);
    setInvite(saved.invite || DEFAULT_INVITE);
    setUsers(saved.users || []);
    setCurrentUser(saved.currentUser || null);
    setTable(computed.table);
    setLeaderboard(computed.leaderboard);
    setHallOfFame(computed.hallOfFame);
    setFixtures(computed.fixtures);
    persistState({
      teams: saved.teams,
      players: saved.players,
      matches: computed.matches,
      invite: saved.invite || DEFAULT_INVITE,
      users: saved.users || [],
      currentUser: saved.currentUser || null
    });
    setLoading(false);
  }, [computeState]);

  useEffect(() => {
    initApp();
  }, [initApp]);

  const verifyInvite = useCallback((token) => token === invite.token, [invite.token]);

  const getTeamById = useCallback((id) => teams.find((team) => team.id === Number(id)), [teams]);
  const getPlayersForTeam = useCallback((teamId) => players.filter((player) => player.team_id === Number(teamId)), [players]);
  const getLoggedUserTeam = useCallback(() => teams.find((team) => team.id === currentUser?.teamId), [teams, currentUser]);

  const loginUser = useCallback(
    ({ username, password }) => {
      const found = users.find((user) => user.username === username);
      if (!found) return { success: false, message: 'No account found. Create one first.' };
      if (found.password !== hashPassword(password)) return { success: false, message: 'Incorrect password.' };
      const nextUser = { ...found };
      syncState(teams, players, matches, invite, users, nextUser);
      return { success: true, message: 'Welcome back!', currentUser: nextUser };
    },
    [invite, matches, players, syncState, teams, users]
  );

  const signUpUser = useCallback(
    ({ username, password }) => {
      if (!username || !password) {
        return { success: false, message: 'Username and password are required.' };
      }
      if (users.some((user) => user.username === username)) {
        return { success: false, message: 'Username already exists. Choose another.' };
      }
      const newUser = {
        id: createUserId(),
        username,
        password: hashPassword(password),
        favPlayers: [],
        formation: '',
        teamId: null,
        efootballUsername: username,
        created_at: new Date().toISOString()
      };
      const nextUsers = [...users, newUser];
      syncState(teams, players, matches, invite, nextUsers, newUser);
      return { success: true, message: 'Account created. Continue to team setup.', currentUser: newUser };
    },
    [invite, matches, players, syncState, teams, users]
  );

  const logoutUser = useCallback(() => {
    syncState(teams, players, matches, invite, users, null);
  }, [invite, matches, players, syncState, teams, users]);

  const saveUserProfile = useCallback(
    ({ favPlayers, formation, efootballUsername }) => {
      if (!currentUser) return { success: false, message: 'No active user.' };
      const updatedUser = {
        ...currentUser,
        favPlayers: favPlayers || currentUser.favPlayers,
        formation: formation || currentUser.formation,
        efootballUsername: efootballUsername || currentUser.efootballUsername
      };
      const nextUsers = users.map((user) => (user.id === updatedUser.id ? updatedUser : user));
      syncState(teams, players, matches, invite, nextUsers, updatedUser);
      return { success: true, message: 'Profile saved.', currentUser: updatedUser };
    },
    [currentUser, invite, matches, players, syncState, teams, users]
  );

  const registerTeam = useCallback(
    ({ managerName, teamName, badge, token, favPlayers = [], formation = '', efootballUsername = '' }) => {
      if (!managerName || !teamName || !token) {
        return { success: false, message: 'Please complete all required fields.' };
      }
      if (token !== invite.token) {
        return { success: false, message: 'Invalid invite link.' };
      }
      if (
        teams.some(
          (team) =>
            team.team_name.toLowerCase() === teamName.toLowerCase() ||
            team.manager_name.toLowerCase() === managerName.toLowerCase()
        )
      ) {
        return { success: false, message: 'A similar team or manager already exists.' };
      }

      const teamId = Date.now();
      const newTeam = {
        id: teamId,
        manager_name: managerName,
        team_name: teamName,
        badge,
        token,
        created_at: new Date().toISOString()
      };

      const nextPlayers = [...players, ...createStarterPlayers(teamName, teamId)];
      const nextTeams = [...teams, newTeam];
      let nextUsers = users;
      let nextCurrent = currentUser;

      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          teamId,
          favPlayers,
          formation,
          efootballUsername: efootballUsername || currentUser.efootballUsername,
          badge
        };
        nextUsers = users.map((user) => (user.id === updatedUser.id ? updatedUser : user));
        nextCurrent = updatedUser;
      }

      syncState(nextTeams, nextPlayers, matches, invite, nextUsers, nextCurrent);
      return { success: true, message: 'Team registered successfully.', teamId };
    },
    [currentUser, invite, matches, players, syncState, teams, users]
  );

  const generateNewInvite = useCallback(() => {
    const token = `efootball${Math.floor(1000 + Math.random() * 9000)}`;
    const nextInvite = { token, link: `/join?token=${token}` };
    syncState(teams, players, matches, nextInvite, users, currentUser);
    return nextInvite;
  }, [currentUser, matches, players, syncState, teams, users]);

  const value = {
    teams,
    players,
    fixtures,
    table,
    leaderboard,
    hallOfFame,
    invite,
    users,
    currentUser,
    loading,
    initApp,
    loadApp: initApp,
    loginUser,
    signUpUser,
    logoutUser,
    saveUserProfile,
    registerTeam,
    updateMatchResult,
    generateNewInvite,
    getTeamById,
    getPlayersForTeam,
    getLoggedUserTeam,
    verifyInvite
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
