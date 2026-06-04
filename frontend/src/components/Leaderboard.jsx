function Leaderboard({ scorers }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-panel p-6 shadow-glow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Golden Boot</p>
          <h2 className="text-2xl font-semibold text-white">Top scorers</h2>
        </div>
      </div>
      <div className="mt-6 space-y-3">
        {scorers.slice(0, 5).map((player, index) => (
          <div key={index} className="flex items-center justify-between rounded-3xl border border-slate-800 bg-slate-950 p-4">
            <div>
              <p className="font-semibold text-white">{player.player_name}</p>
              <p className="text-sm text-slate-400">{player.team_name}</p>
            </div>
            <span className="rounded-full bg-neon/10 px-3 py-1 text-sm font-semibold text-neon">{player.goals}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Leaderboard;
