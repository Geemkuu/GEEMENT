import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';

const ADMIN_KEY = 'efootball-admin';

function AdminPage() {
  const { fixtures, table, leaderboard, invite, loadApp, fetchJson } = useContext(AppContext);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [scorers, setScorers] = useState([{ playerName: '', teamId: null, goals: 1 }, { playerName: '', teamId: null, goals: 1 }]);
  const [status, setStatus] = useState('');
  const [inviteToken, setInviteToken] = useState(invite.token);

  useEffect(() => {
    setInviteToken(invite.token);
  }, [invite.token]);

  const openMatch = (match) => {
    setSelectedMatch(match);
    setHomeScore(match.home_score);
    setAwayScore(match.away_score);
    setScorers([{ playerName: '', teamId: match.home_team_id, goals: 1 }, { playerName: '', teamId: match.away_team_id, goals: 1 }]);
  };

  const postResult = async () => {
    if (!selectedMatch) return;
    setStatus('Saving result...');
    const body = { homeScore, awayScore, scorers: scorers.filter((scorer) => scorer.playerName.trim()) };
    const res = await fetchJson(`/api/fixtures/${selectedMatch.id}/result?adminKey=${ADMIN_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    setStatus(res.message);
    if (res.success) {
      await loadApp();
    }
  };

  const generateNewInvite = async () => {
    const token = `efootball${Math.floor(1000 + Math.random() * 9000)}`;
    const res = await fetchJson(`/api/admin/invite?adminKey=${ADMIN_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    if (res.success) {
      setInviteToken(res.token);
      setStatus('New invite generated. Share the new registration link.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-panel p-8 shadow-glow">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-neon">Admin control</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">League operations</h1>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-950/70 px-6 py-4 text-slate-200">
            <p className="text-sm uppercase text-slate-400">Current invite</p>
            <p className="mt-2 text-lg text-neon">/join?token={inviteToken}</p>
            <button onClick={generateNewInvite} className="mt-4 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent/90">
              Generate new invite
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[0.9fr_0.8fr]">
        <div className="space-y-8">
          <div className="rounded-3xl border border-slate-800 bg-panel p-6 shadow-glow">
            <h2 className="text-2xl font-semibold text-white">Schedule manager</h2>
            <p className="mt-2 text-slate-400">Click a match to enter scorelines and scorers for live league updates.</p>
            <div className="mt-6 space-y-3">
              {fixtures.map((match) => (
                <button key={match.id} onClick={() => openMatch(match)} className="w-full rounded-3xl border border-slate-700 bg-slate-950/80 p-4 text-left transition hover:border-neon">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">{match.home_team_name} vs {match.away_team_name}</p>
                      <p className="text-sm text-slate-400">{match.stage === 'league' ? 'League' : match.round_label}</p>
                    </div>
                    <div className="rounded-full bg-slate-900 px-3 py-1 text-sm text-slate-300">{match.home_score} - {match.away_score}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedMatch && (
            <div className="rounded-3xl border border-slate-800 bg-panel p-6 shadow-glow">
              <h2 className="text-2xl font-semibold text-white">Update match result</h2>
              <p className="mt-2 text-slate-400">{selectedMatch.home_team_name} vs {selectedMatch.away_team_name}</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm text-slate-300">Home score</span>
                  <input type="number" min="0" value={homeScore} onChange={(e) => setHomeScore(Number(e.target.value))} className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-neon" />
                </label>
                <label className="block">
                  <span className="text-sm text-slate-300">Away score</span>
                  <input type="number" min="0" value={awayScore} onChange={(e) => setAwayScore(Number(e.target.value))} className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-neon" />
                </label>
              </div>
              <div className="mt-6 space-y-4">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Scorer details</p>
                {scorers.map((row, index) => (
                  <div key={index} className="grid gap-3 sm:grid-cols-3">
                    <input type="text" value={row.playerName} onChange={(e) => {
                      const next = [...scorers];
                      next[index].playerName = e.target.value;
                      setScorers(next);
                    }} placeholder="Player name" className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-neon" />
                    <select value={row.teamId || selectedMatch.home_team_id} onChange={(e) => {
                      const next = [...scorers];
                      next[index].teamId = Number(e.target.value);
                      setScorers(next);
                    }} className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-neon">
                      <option value={selectedMatch.home_team_id}>{selectedMatch.home_team_name}</option>
                      <option value={selectedMatch.away_team_id}>{selectedMatch.away_team_name}</option>
                    </select>
                    <input type="number" min="1" value={row.goals} onChange={(e) => {
                      const next = [...scorers];
                      next[index].goals = Number(e.target.value);
                      setScorers(next);
                    }} className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-neon" />
                  </div>
                ))}
              </div>
              <button onClick={postResult} className="mt-6 rounded-full bg-neon px-6 py-3 font-semibold text-slate-950 transition hover:brightness-110">Save match</button>
              {status && <p className="mt-4 text-sm text-slate-200">{status}</p>}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-glow">
            <h2 className="text-2xl font-semibold text-white">Live standings</h2>
            <div className="mt-6 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
              <table className="min-w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Team</th>
                    <th className="px-4 py-3">P</th>
                    <th className="px-4 py-3">W</th>
                    <th className="px-4 py-3">D</th>
                    <th className="px-4 py-3">L</th>
                    <th className="px-4 py-3">GD</th>
                    <th className="px-4 py-3">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {table.map((row) => (
                    <tr key={row.teamId} className="border-t border-slate-800 hover:bg-slate-900/80">
                      <td className="px-4 py-3 text-white">{row.teamName}</td>
                      <td className="px-4 py-3">{row.played}</td>
                      <td className="px-4 py-3">{row.wins}</td>
                      <td className="px-4 py-3">{row.draws}</td>
                      <td className="px-4 py-3">{row.losses}</td>
                      <td className="px-4 py-3">{row.goalDifference}</td>
                      <td className="px-4 py-3 text-neon">{row.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-panel p-6 shadow-glow">
            <h2 className="text-2xl font-semibold text-white">Golden Boot</h2>
            <div className="mt-5 space-y-3 text-slate-300">
              {leaderboard.slice(0, 5).map((player, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-2xl bg-slate-900 p-4">
                  <div>
                    <p className="font-semibold text-white">{player.player_name}</p>
                    <p className="text-sm text-slate-400">{player.team_name}</p>
                  </div>
                  <span className="rounded-full bg-neon/10 px-3 py-1 text-sm text-neon">{player.goals}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
