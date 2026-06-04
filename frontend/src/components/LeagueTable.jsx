import { Link } from 'react-router-dom';

function LeagueTable({ rows }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-glow">
      <table className="min-w-full text-left text-sm text-slate-200">
        <thead className="bg-slate-900 text-slate-400">
          <tr>
            <th className="px-4 py-4">#</th>
            <th className="px-4 py-4">Team</th>
            <th className="px-4 py-4">P</th>
            <th className="px-4 py-4">W</th>
            <th className="px-4 py-4">D</th>
            <th className="px-4 py-4">L</th>
            <th className="px-4 py-4">GD</th>
            <th className="px-4 py-4">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.teamId} className="border-t border-slate-800 hover:bg-slate-900/70">
              <td className="px-4 py-3 text-slate-400">{index + 1}</td>
              <td className="px-4 py-3">
                <Link to={`/team/${row.teamId}`} className="font-medium text-white hover:text-neon">
                  {row.teamName}
                </Link>
              </td>
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
  );
}

export default LeagueTable;
