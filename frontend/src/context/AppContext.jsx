import { createContext, useState, useCallback } from 'react';

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [teams, setTeams] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [table, setTable] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [hallOfFame, setHallOfFame] = useState({});
  const [invite, setInvite] = useState({ token: 'efootball2026', link: '/join?token=efootball2026' });
  const [loading, setLoading] = useState(true);

  const fetchJson = async (url, options = {}) => {
    const res = await fetch(url, options);
    return res.json();
  };

  const loadApp = useCallback(async () => {
    setLoading(true);
    try {
      const [teamRes, fixtureRes, tableRes, boardRes, hallRes] = await Promise.all([
        fetchJson('/api/teams'),
        fetchJson('/api/fixtures'),
        fetchJson('/api/table'),
        fetchJson('/api/leaderboards'),
        fetchJson('/api/halloffame')
      ]);
      if (teamRes.success) setTeams(teamRes.teams);
      if (fixtureRes.success) setFixtures(fixtureRes.fixtures);
      if (tableRes.success) setTable(tableRes.table);
      if (boardRes.success) setLeaderboard(boardRes.scorers);
      if (hallRes.success) setHallOfFame({ leader: hallRes.leader, topScorer: hallRes.topScorer });
    } catch (error) {
      console.error('App load failed', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshInvite = useCallback(async () => {
    try {
      const res = await fetchJson('/api/admin/invite?adminKey=efootball-admin');
      if (res.success) setInvite(res);
    } catch (error) {
      console.warn('Could not refresh invite token');
    }
  }, []);

  const initApp = useCallback(async () => {
    await loadApp();
    await refreshInvite();
  }, [loadApp, refreshInvite]);

  const value = {
    teams,
    fixtures,
    table,
    leaderboard,
    hallOfFame,
    invite,
    loading,
    initApp,
    loadApp,
    refreshInvite,
    fetchJson
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
