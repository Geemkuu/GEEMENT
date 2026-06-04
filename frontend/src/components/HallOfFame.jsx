function HallOfFame({ leader, topScorer }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-panel p-6 shadow-glow">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Hall of Fame</p>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
          <p className="text-sm uppercase text-slate-400">Current league leader</p>
          <p className="mt-3 text-2xl font-semibold text-white">{leader?.teamName ?? 'No leader yet'}</p>
          <p className="mt-2 text-slate-400">{leader ? `${leader.points} pts • GD ${leader.goalDifference}` : 'Waiting for league matches.'}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
          <p className="text-sm uppercase text-slate-400">Top scorer</p>
          <p className="mt-3 text-2xl font-semibold text-white">{topScorer?.player_name ?? 'No scorer yet'}</p>
          <p className="mt-2 text-slate-400">{topScorer ? `${topScorer.goals} goals • ${topScorer.team_name}` : 'Register teams and update matches.'}</p>
        </div>
      </div>
    </div>
  );
}

export default HallOfFame;
