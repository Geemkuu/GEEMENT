import { useEffect, useContext } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { AppContext } from './context/AppContext';
import HomePage from './pages/HomePage';
import JoinPage from './pages/JoinPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import NotFound from './pages/NotFound';
import Navbar from './components/Navbar';

function App() {
  const { initApp } = useContext(AppContext);

  useEffect(() => {
    initApp();
  }, []);

  return (
    <div className="min-h-screen bg-surface text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/join" element={<JoinPage />} />
          <Route path="/team/:id" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="border-t border-slate-800 py-6 text-center text-sm text-slate-400">
        Built for eFootball leagues with responsive fixtures, rankings, and bracket tracking.
      </footer>
    </div>
  );
}

export default App;
