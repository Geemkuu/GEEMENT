import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

function ProfilePage() {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/teams/${id}`);
      const data = await res.json();
      if (data.success) {
        setTeam(data.team);
        setPlayers(data.players);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <div>Loading profile...</div>;
  if (!team) return <div>Profile not found.</div>;

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-panel p-8 shadow-glow">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-neon">Team profile</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">{team.team_name}</h1>
            <p className="mt-2 text-slate-300">Manager: {team.manager_name}</p>
          </div>
          <div className="h-32 w-32 overflow-hidden rounded-3xl border border-slate-700 bg-slate-900">
            {team.badge ? <img src={team.badge} alt="Team badge" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-sm text-slate-400">No badge</div>}
          </div>
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-glow">
          <h2 className="text-2xl font-semibold text-white">Stats Overview</h2>
          <div className="mt-5 space-y-4 text-slate-300">
            <p>Matches played and goals will update automatically as the league progresses.</p>
            <p>Top performing virtual players live inside the team roster area below.</p>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-panel p-6 shadow-glow">
          <h2 className="text-2xl font-semibold text-white">Line-up</h2>
          <p className="mt-2 text-sm text-slate-400">Virtual roster built for goal-tracking and leaderboards.</p>
          <div className="mt-6 space-y-3">
            {players.map((player) => (
              <div key={player.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">{player.player_name}</p>
                    <p className="text-sm text-slate-400">Goals: {player.goals}</p>
                  </div>
                  <div className="rounded-full bg-neon/10 px-3 py-1 text-xs font-semibold text-neon">Scorer</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-3xl border border-slate-800 bg-panel p-6 shadow-glow">
        <h2 className="text-2xl font-semibold text-white">Share your squad</h2>
        <p className="mt-2 text-slate-300">This profile page is shareable with your community. Copy the URL and challenge the competition.</p>
        <Link to="/" className="mt-6 inline-block rounded-full border border-neon px-5 py-3 text-sm text-neon transition hover:bg-neon/10">Return to dashboard</Link>
      </div>
    </div>
  );
}

export default ProfilePage;
