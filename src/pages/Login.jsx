import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../lib/authContext';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const submit = async (e) => {
    e.preventDefault(); setError('');
    try {
      const r = await api.post('/auth/login', { email, password });
      if (r.data.user.role !== 'ADMIN') throw new Error('Not an admin');
      login(r.data);
      navigate('/');
    } catch (e) { setError(e?.response?.data?.error || e.message || 'Login failed'); }
  };
  return (
    <div className="max-w-md mx-auto px-4 py-8 md:py-10">
      <h1 className="text-xl md:text-2xl font-semibold mb-4">Admin Login</h1>
      {error && <div className="mb-3 text-bca-red text-sm md:text-base">{error}</div>}
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input className="px-3 py-2 md:py-3 rounded-xl bg-black/50 border border-white/10 text-sm md:text-base" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" className="px-3 py-2 md:py-3 rounded-xl bg-black/50 border border-white/10 text-sm md:text-base" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="px-4 py-2 md:py-3 rounded-xl bg-bca-gold text-black text-sm md:text-base">Login</button>
      </form>
    </div>
  );
}
