function Bracket({ fixtureData }) {
  if (!fixtureData.length) {
    return <p className="text-slate-400">Knockout bracket will appear once enough league results are entered.</p>;
  }

  return (
    <div className="space-y-4">
      {fixtureData.map((match) => (
        <div key={match.id} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4 shadow-sm">
          <p className="text-sm uppercase tracking-[0.28em] text-slate-400">{match.round_label}</p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-white">{match.home_team_name}</p>
              <p className="text-slate-400">Score: {match.home_score}</p>
            </div>
            <div className="h-0.5 flex-1 bg-slate-800 sm:h-12 sm:w-px" />
            <div>
              <p className="font-semibold text-white">{match.away_team_name}</p>
              <p className="text-slate-400">Score: {match.away_score}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Bracket;
