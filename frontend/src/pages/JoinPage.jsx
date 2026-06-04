import { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import BadgePicker from '../components/BadgePicker';

const presetBadges = [
  { label: 'Neon Phoenix', value: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=60' },
  { label: 'Aqua Blade', value: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=200&q=60' },
  { label: 'Cyber Knight', value: 'https://images.unsplash.com/photo-1530541930197-5da2f7f8653f?auto=format&fit=crop&w=200&q=60' }
];

function JoinPage() {
  const [searchParams] = useSearchParams();
  const { invite, registerTeam, loading } = useContext(AppContext);
  const [inviteValid, setInviteValid] = useState(false);
  const [checking, setChecking] = useState(true);
  const [managerName, setManagerName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [badge, setBadge] = useState(presetBadges[0].value);
  const [uploadedBadge, setUploadedBadge] = useState('');
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

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setUploadedBadge(reader.result);
    reader.readAsDataURL(file);
  };

  const submitTeam = (event) => {
    event.preventDefault();
    setMessage('Registering your team…');
    const res = registerTeam({ managerName, teamName, badge: selectedBadge, token });
    setMessage(res.message);
    if (res.success) {
      setManagerName('');
      setTeamName('');
      setUploadedBadge('');
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-panel p-8 shadow-glow">
        <h1 className="text-3xl font-semibold text-white">Team registration</h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          Use the invite link shared by the admin to join the league. Build your profile, choose a badge, and get ready for a premium eFootball season.
        </p>
      </div>

      {checking ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-8 text-center">Checking invite link…</div>
      ) : inviteValid ? (
        <div className="grid gap-8 lg:grid-cols-[0.9fr_0.8fr]">
          <form className="rounded-3xl border border-slate-800 bg-panel p-8 shadow-glow" onSubmit={submitTeam}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300">Manager Name</label>
                <input value={managerName} onChange={(e) => setManagerName(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-neon focus:ring-2 focus:ring-neon/20" placeholder="Your name on the sidelines" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Team Name</label>
                <input value={teamName} onChange={(e) => setTeamName(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-neon focus:ring-2 focus:ring-neon/20" placeholder="Club name" />
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
            <p className="mt-4 text-slate-300">This registration form is only available when you arrive through a valid invite token.</p>
            <div className="mt-6 space-y-3 rounded-3xl border border-slate-800 bg-surface p-5">
              <div>
                <p className="text-sm uppercase text-slate-400">Invite token</p>
                <p className="mt-2 text-lg text-neon">{token}</p>
              </div>
              <div>
                <p className="text-sm uppercase text-slate-400">First team startup</p>
                <p className="mt-2 text-slate-300">Each registration creates a team profile with automatic player rotation and goal tracking.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-red-500/30 bg-slate-950/80 p-8 text-center text-red-300">
          <p className="text-xl font-semibold">Invalid invite link.</p>
          <p className="mt-3">Please reach out to your league admin and ask for a fresh /join?token= invite URL.</p>
        </div>
      )}
    </div>
  );
}

export default JoinPage;
