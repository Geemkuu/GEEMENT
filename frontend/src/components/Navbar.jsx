import { NavLink } from 'react-router-dom';

function Navbar() {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <NavLink to="/" className="text-xl font-semibold text-white">eFootball League</NavLink>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-300">
          <NavLink to="/" className={({ isActive }) => isActive ? 'text-neon' : 'hover:text-white'}>Dashboard</NavLink>
          <NavLink to="/join" className={({ isActive }) => isActive ? 'text-neon' : 'hover:text-white'}>Join</NavLink>
          <NavLink to="/admin" className={({ isActive }) => isActive ? 'text-neon' : 'hover:text-white'}>Admin</NavLink>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
