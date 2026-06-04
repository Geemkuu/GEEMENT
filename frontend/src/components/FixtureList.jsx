function FixtureList({ fixtures }) {
  if (!fixtures.length) return <p className="mt-4 text-slate-400">No fixtures available yet.</p>;
  return (
    <div className="space-y-3">
      {fixtures.map((match) => (
        <div key={match.id} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4 transition hover:border-neon">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-white">{match.home_team_name} {match.home_score} - {match.away_score} {match.away_team_name}</p>
              <p className="text-sm text-slate-400">{match.stage === 'league' ? 'League' : match.round_label}</p>
            </div>
            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">{match.stage}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default FixtureList;
