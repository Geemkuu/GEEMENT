import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="rounded-3xl border border-slate-800 bg-panel p-12 text-center shadow-glow">
      <h1 className="text-5xl font-semibold text-white">404</h1>
      <p className="mt-4 text-slate-300">The page you are looking for cannot be found.</p>
      <Link to="/" className="mt-8 inline-block rounded-full bg-neon px-6 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110">Return home</Link>
    </div>
  );
}

export default NotFound;
