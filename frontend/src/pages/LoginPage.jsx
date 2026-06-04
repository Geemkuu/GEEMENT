import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

function LoginPage() {
  const { currentUser, invite, loginUser, signUpUser, loading } = useContext(AppContext);
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!loading && currentUser) {
      if (currentUser.teamId) {
        navigate('/');
      } else {
        navigate(`/join?token=${invite.token}`);
      }
    }
  }, [currentUser, invite, loading, navigate]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (mode === 'signup') {
      if (!username || !password) {
        setMessage('Choose a username and password.');
        return;
      }
      if (password !== confirmPassword) {
        setMessage('Passwords do not match.');
        return;
      }
      const res = signUpUser({ username: username.trim(), password });
      setMessage(res.message);
      if (res.success) {
        navigate(`/join?token=${invite.token}`);
      }
    } else {
      const res = loginUser({ username: username.trim(), password });
      setMessage(res.message);
      if (res.success) {
        if (res.currentUser?.teamId) {
          navigate('/');
        } else {
          navigate(`/join?token=${invite.token}`);
        }
      }
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-panel p-10 shadow-glow">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-neon">Sign in / sign up</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">Access your eFootball profile</h1>
          <p className="mt-4 text-slate-300">Use a browser password manager to save your login and return quickly to the league dashboard.</p>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => setMode('login')} className={`rounded-3xl px-5 py-3 text-sm font-semibold ${mode === 'login' ? 'bg-neon text-slate-950' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}>
            Login
          </button>
          <button type="button" onClick={() => setMode('signup')} className={`rounded-3xl px-5 py-3 text-sm font-semibold ${mode === 'signup' ? 'bg-neon text-slate-950' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}>
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-neon focus:ring-2 focus:ring-neon/20"
              placeholder="Your eFootball handle"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-neon focus:ring-2 focus:ring-neon/20"
              placeholder="Enter a secure password"
            />
          </div>
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-slate-300">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-neon focus:ring-2 focus:ring-neon/20"
                placeholder="Repeat your password"
              />
            </div>
          )}
          <button type="submit" className="w-full rounded-full bg-neon px-6 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110">
            {mode === 'signup' ? 'Create account and continue' : 'Login to league'}
          </button>
          {message && <p className="text-sm text-slate-200">{message}</p>}
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
