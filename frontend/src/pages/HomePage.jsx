import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import LeagueTable from '../components/LeagueTable';
import FixtureList from '../components/FixtureList';
import Leaderboard from '../components/Leaderboard';
import HallOfFame from '../components/HallOfFame';
import Bracket from '../components/Bracket';

function HomePage() {
  const { teams, table, fixtures, leaderboard, hallOfFame, invite, loading } = useContext(AppContext);
  const activeTeams = teams.length;

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-surface via-slate-950 to-slate-900 p-8 shadow-glow">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-neon">eFootball League Hub</p>
            <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">Community League & Knockout Arena</h1>
            <p className="mt-4 max-w-xl text-slate-300">
              Manage teams, fixtures, and golden boot competition in one responsive dashboard. Track league progress live while your knockout bracket seeds automatically when the season closes.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-xl">
              <p className="text-sm uppercase text-slate-400">Registered Teams</p>
              <p className="mt-3 text-3xl font-semibold text-white">{activeTeams}</p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-xl">
              <p className="text-sm uppercase text-slate-400">Invite URL</p>
              <p className="mt-3 break-words text-lg text-neon">{invite.link}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <HallOfFame leader={hallOfFame.leader} topScorer={hallOfFame.topScorer} />
            <Leaderboard scorers={leaderboard} />
          </div>
          <div className="rounded-3xl border border-slate-800 bg-panel p-6 shadow-glow">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">League table</p>
                <h2 className="text-2xl font-semibold text-white">Standings</h2>
              </div>
              <Link to="/join" className="rounded-full border border-neon px-4 py-2 text-sm text-neon transition hover:bg-neon/10">
                Join a team
              </Link>
            </div>
            {loading ? <p>Loading league data...</p> : <LeagueTable rows={table} />}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-panel p-6 shadow-glow">
            <h2 className="text-2xl font-semibold text-white">Latest fixtures</h2>
            <p className="mt-2 text-sm text-slate-400">Update results from the admin panel to keep this view fresh.</p>
            <FixtureList fixtures={fixtures.slice(0, 6)} />
          </div>
          <div className="rounded-3xl border border-slate-800 bg-panel p-6 shadow-glow">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Knockout bracket</p>
                <h2 className="text-2xl font-semibold text-white">Top seed path</h2>
              </div>
              <Link to="/admin" className="rounded-full border border-accent px-4 py-2 text-sm text-accent transition hover:bg-accent/10">
                Admin control
              </Link>
            </div>
            <Bracket fixtureData={fixtures.filter((fixture) => fixture.stage === 'knockout')} />
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
