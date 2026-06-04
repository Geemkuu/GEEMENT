import { useState, useEffect, useContext } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import BadgePicker from '../components/BadgePicker';

const presetBadges = [
  { label: 'Neon Phoenix', value: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=60' },
  { label: 'Aqua Blade', value: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=200&q=60' },
  { label: 'Cyber Knight', value: 'https://images.unsplash.com/photo-1530541930197-5da2f7f8653f?auto=format&fit=crop&w=200&q=60' }
];

const formations = ['4-3-3', '4-4-2', '3-5-2', '5-3-2', '4-2-3-1'];

function JoinPage() {
  const [searchParams] = useSearchParams();
  const { invite, registerTeam, loading, currentUser } = useContext(AppContext);
  const [inviteValid, setInviteValid] = useState(false);
  const [checking, setChecking] = useState(true);
  const [managerName, setManagerName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [badge, setBadge] = useState(presetBadges[0].value);
  const [uploadedBadge, setUploadedBadge] = useState('');
  const [favPlayers, setFavPlayers] = useState(['', '', '']);
  const [formation, setFormation] = useState(formations[0]);
  const [efootballUsername, setEfootballUsername] = useState('');
  const [message, setMessage] = useState('');

  const token = searchParams.get('token');
  const selectedBadge = uploadedBadge || badge;

  useEffect(() => {
    if (loading) return;
    if (!token) {
      setInviteValid(false);
      setChecking(false);
      return;
    }
    setInviteValid(token === invite.token);
    setChecking(false);
  }, [token, invite, loading]);

  useEffect(() => {
    if (!currentUser) return;
    setEfootballUsername(currentUser.efootballUsername || currentUser.username || '');
    setManagerName(currentUser.username || '');
    if (currentUser.badge) setBadge(currentUser.badge);
    if (currentUser.formation) setFormation(currentUser.formation);
    if (currentUser.favPlayers?.length) {
      setFavPlayers([...currentUser.favPlayers.slice(0, 3), '', ''].slice(0, 3));
    }
  }, [currentUser]);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setUploadedBadge(reader.result);
    reader.readAsDataURL(file);
  };

  const submitTeam = (event) => {
    event.preventDefault();
    setMessage('Registering your team…');
    const res = registerTeam({
      managerName,
      teamName,
      badge: selectedBadge,
      token,
      favPlayers: favPlayers.filter(Boolean),
      formation,
      efootballUsername: efootballUsername || managerName
    });
    setMessage(res.message);
    if (res.success) {
      setManagerName('');
      setTeamName('');
      setUploadedBadge('');
    }
  };

  if (loading) {
    return <div>Loading registration…</div>;
  }

  if (currentUser?.teamId) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-panel p-10 shadow-glow text-center">
        <h1 className="text-3xl font-semibold text-white">Already registered</h1>
        <p className="mt-4 text-slate-300">Your team is already part of the league. Head back to the dashboard to view standings, fixtures, and the knockout bracket.</p>
        <Link to="/" className="mt-6 inline-block rounded-full bg-neon px-6 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110">Go to dashboard</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-panel p-8 shadow-glow">
        <h1 className="text-3xl font-semibold text-white">Team registration</h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          Use the invite link shared by the admin to join the league. Add your favorite players, formation, and club identity for faster future access.
        </p>
      </div>

      {checking ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-8 text-center">Checking invite link…</div>
      ) : inviteValid ? (
        <div className="grid gap-8 lg:grid-cols-[0.9fr_0.8fr]">
          <form className="rounded-3xl border border-slate-800 bg-panel p-8 shadow-glow" onSubmit={submitTeam}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300">eFootball username</label>
                <input value={efootballUsername} onChange={(e) => setEfootballUsername(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-neon focus:ring-2 focus:ring-neon/20" placeholder="Your league handle" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Manager Name</label>
                <input value={managerName} onChange={(e) => setManagerName(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-neon focus:ring-2 focus:ring-neon/20" placeholder="Your name on the sidelines" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Team Name</label>
                <input value={teamName} onChange={(e) => setTeamName(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-neon focus:ring-2 focus:ring-neon/20" placeholder="Club name" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-300">Formation</label>
                  <select value={formation} onChange={(e) => setFormation(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-neon focus:ring-2 focus:ring-neon/20">
                    {formations.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300">Favorite players</label>
                  <div className="mt-2 space-y-3">
                    {favPlayers.map((player, index) => (
                      <input
                        key={index}
                        value={player}
                        onChange={(e) => {
                          const next = [...favPlayers];
                          next[index] = e.target.value;
                          setFavPlayers(next);
                        }}
                        className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-neon focus:ring-2 focus:ring-neon/20"
                        placeholder={`Top player ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Team Badge</label>
                <BadgePicker options={presetBadges} selected={badge} onSelect={setBadge} />
                <div className="mt-4">
                  <input type="file" accept="image/*" onChange={handleUpload} className="w-full text-sm text-slate-300" />
                  <p className="mt-2 text-xs text-slate-500">Upload a badge or choose a preset from above.</p>
                </div>
              </div>
              <button type="submit" className="rounded-full bg-neon px-6 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110">
                Register team
              </button>
              {message && <p className="text-sm text-slate-200">{message}</p>}
            </div>
          </form>

          <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-8 shadow-xl">
            <h2 className="text-2xl font-semibold text-white">Invite details</h2>
            <p className="mt-4 text-slate-300">The invite URL is the one shared by your league admin. After signup, save your browser password for faster return to the dashboard.</p>
            <div className="mt-6 space-y-3 rounded-3xl border border-slate-800 bg-surface p-5">
              <div>
                <p className="text-sm uppercase text-slate-400">Invite token</p>
                <p className="mt-2 text-lg text-neon">{token}</p>
              </div>
              <div>
                <p className="text-sm uppercase text-slate-400">Quick return</p>
                <p className="mt-2 text-slate-300">Your browser can store login credentials so you can come back immediately to the league dashboard.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-red-500/30 bg-slate-950/80 p-8 text-center text-red-300">
          <p className="text-xl font-semibold">Invalid invite link.</p>
          <p className="mt-3">Please reach out to your league admin and ask for a fresh /join?token= URL.</p>
          <Link to="/login" className="mt-6 inline-block rounded-full bg-neon px-6 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110">Back to login</Link>
        </div>
      )}
    </div>
  );
}

export default JoinPage;
