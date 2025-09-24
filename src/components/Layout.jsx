import { Link } from 'react-router-dom';
import { useAuth } from '../lib/authContext';

/**
 * Sauvik Chatterjee
 */

export default function Layout({ children }) {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-bca-black text-white">
      <header className="sticky top-0 z-20 backdrop-blur bg-black/60 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 md:gap-3 font-bold text-lg md:text-xl tracking-wide">
            <img src="/https://sauvikbcabucket.s3.ap-south-1.amazonaws.com/assets/bca-logo.jpg" alt="BCA" className="h-6 w-6 md:h-8 md:w-8 rounded" />
            <span className="hidden sm:inline">BCA Admin</span>
            <span className="sm:hidden">Admin</span>
          </Link>
          <div className="flex items-center gap-2 md:gap-4">
            <Link to="/" className="text-xs md:text-sm hover:text-bca-gold transition-colors hidden sm:inline">
              ← Back to Dashboard
            </Link>
            <Link to="/" className="text-xs md:text-sm hover:text-bca-gold transition-colors sm:hidden">
              ← Back
            </Link>
            <button onClick={logout} className="px-2 md:px-3 py-1 md:py-1.5 rounded-xl bg-bca-red hover:bg-bca-red/80 transition-colors text-xs md:text-sm">
              Logout
            </button>
            
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
