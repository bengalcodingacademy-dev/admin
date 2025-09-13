import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function Transactions() {
  const [pending, setPending] = useState([]);
  const load = ()=> api.get('/admin/purchases').then(r=>setPending(r.data.filter(p=>p.status==='PENDING')));
  useEffect(()=>{ load(); },[]);

  const approve = async (id) => { await api.post(`/admin/purchases/${id}/approve`); load(); };
  const decline = async (id) => { await api.post(`/admin/purchases/${id}/decline`); load(); };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid gap-6">
      <div className="rounded-xl border border-white/10 p-4">
        <div className="font-semibold mb-3">Pending Transactions</div>
        <div className="grid gap-2 text-sm">
          <div className="grid grid-cols-7 text-white/60">
            <div>User</div><div>Email</div><div>Course</div><div>Amount</div><div>UPI Mobile</div><div>TrxID</div><div>Actions</div>
          </div>
          {pending.map(p => (
            <div key={p.id} className="grid grid-cols-7 gap-2 items-center">
              <div>{p.user.name}</div>
              <div className="text-white/70">{p.user.email}</div>
              <div>{p.course.title}</div>
              <div>₹{(p.amountCents/100).toFixed(2)}</div>
              <div className="text-white/70">{p.upiMobile}</div>
              <div className="text-white/70">{p.upiTxnId}</div>
              <div className="flex gap-2">
                <button onClick={()=>approve(p.id)} className="px-3 py-1 rounded-xl bg-bca-gold text-black">Approve</button>
                <button onClick={()=>decline(p.id)} className="px-3 py-1 rounded-xl bg-bca-red">Decline</button>
              </div>
            </div>
          ))}
          {pending.length === 0 && <div className="text-white/60">No pending transactions.</div>}
        </div>
      </div>
    </div>
  );
}
