import { Link } from 'react-router-dom';
import { useAuth } from '../lib/authContext';

export default function Layout({ children }) {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-bca-black text-white">
      <header className="sticky top-0 z-20 backdrop-blur bg-black/60 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 font-bold text-xl tracking-wide">
            <img src="/bca-logo.jpg" alt="BCA" className="h-8 w-8 rounded" />
            <span>BCA Admin</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm hover:text-bca-gold transition-colors">
              ← Back to Dashboard
            </Link>
            <button onClick={logout} className="px-3 py-1.5 rounded-xl bg-bca-red hover:bg-bca-red/80 transition-colors">
              Logout
            </button>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
