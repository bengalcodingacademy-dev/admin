import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../lib/authContext';
import PasswordInput from '../components/PasswordInput';

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const submit = async (e) => {
    e.preventDefault(); setError('');
    try {
      const r = await api.post('/auth/admin/login', { username, password });
      login(r.data);
      navigate('/');
    } catch (e) { setError(e?.response?.data?.error || e.message || 'Login failed'); }
  };
  return (
    <div className="max-w-md mx-auto px-4 py-8 md:py-10">
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Admin Login</h1>
        <p className="text-white/60 text-sm md:text-base">Sign in to your admin account</p>
      </div>
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm md:text-base">
          {error}
        </div>
      )}
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <input 
            className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white placeholder-white/50 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-bca-gold/50 focus:border-bca-gold/50 transition-all duration-200" 
            placeholder="Username" 
            value={username} 
            onChange={e=>setUsername(e.target.value)} 
          />
        </div>
        <div>
          <PasswordInput 
            value={password} 
            onChange={e=>setPassword(e.target.value)} 
            placeholder="Password" 
            className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white placeholder-white/50 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-bca-gold/50 focus:border-bca-gold/50 transition-all duration-200"
          />
        </div>
        <button className="w-full px-4 py-3 rounded-xl bg-bca-gold text-black font-semibold text-sm md:text-base hover:bg-bca-gold/90 focus:outline-none focus:ring-2 focus:ring-bca-gold/50 transition-all duration-200 shadow-lg">
          Login
        </button>
      </form>
    </div>
  );
}
