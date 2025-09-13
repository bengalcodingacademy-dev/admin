import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function Announcements() {
  const [list, setList] = useState([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const load = ()=> api.get('/announcements').then(r=>setList(r.data));
  useEffect(()=>{ load(); },[]);
  const create = async () => { await api.post('/admin/announcements', { title, body }); setTitle(''); setBody(''); load(); };
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid gap-6">
      <div className="rounded-xl border border-white/10 p-4 grid gap-3">
        <div className="font-semibold">Create Announcement</div>
        <input placeholder="Title" className="px-3 py-2 rounded-xl bg-black/50 border border-white/10" value={title} onChange={e=>setTitle(e.target.value)} />
        <input placeholder="Body" className="px-3 py-2 rounded-xl bg-black/50 border border-white/10" value={body} onChange={e=>setBody(e.target.value)} />
        <button onClick={create} className="px-4 py-2 rounded-xl bg-bca-gold text-black w-max">Publish</button>
      </div>
      <div className="grid gap-3">
        {list.map(a => (
          <div key={a.id} className="rounded-xl border border-white/10 p-4">
            <div className="font-semibold">{a.title}</div>
            <div className="text-white/70">{a.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
