import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function Sales() {
  const [list, setList] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const load = ()=>{
    api.get('/admin/purchases').then(r=>setList(r.data));
    const y = new Date().getFullYear();
    api.get(`/admin/stats/monthly-sales?year=${y}`).then(r=>setMonthly(r.data));
  };
  useEffect(()=>{ load(); },[]);

  const approve = async (id) => { await api.post(`/admin/purchases/${id}/approve`); load(); };
  const decline = async (id) => { await api.post(`/admin/purchases/${id}/decline`); alert('Registration unsuccessful, contact admin at support.bca.com'); load(); };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid gap-6">
      <div className="rounded-xl border border-white/10 p-4">
        <div className="font-semibold mb-3">Purchases</div>
        <div className="grid gap-2 text-sm">
          <div className="grid grid-cols-8 text-white/60">
            <div>User</div><div>Email</div><div>Course</div><div>Amount</div><div>Date</div><div>Status</div><div>UPI Mobile</div><div>Actions</div>
          </div>
          {list.map(p => (
            <div key={p.id} className="grid grid-cols-8 gap-2 items-center">
              <div>{p.user.name}</div>
              <div className="text-white/70">{p.user.email}</div>
              <div>{p.course.title}</div>
              <div>₹{(p.amountCents/100).toFixed(2)}</div>
              <div className="text-white/70">{new Date(p.createdAt).toLocaleString()}</div>
              <div className={p.status==='PAID'?'text-bca-gold':p.status==='DECLINED'?'text-bca-red':'text-white/70'}>{p.status}</div>
              <div className="text-white/70">{p.upiMobile || '-'}</div>
              <div className="flex gap-2">
                <button disabled={p.status!=='PENDING'} onClick={()=>approve(p.id)} className="px-3 py-1 rounded-xl bg-bca-gold text-black disabled:opacity-50">Approve</button>
                <button disabled={p.status!=='PENDING'} onClick={()=>decline(p.id)} className="px-3 py-1 rounded-xl bg-bca-red disabled:opacity-50">Decline</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-white/10 p-4">
        <div className="font-semibold mb-3">Monthly Sales</div>
        <div className="grid grid-cols-12 gap-2 text-xs">
          {monthly.map(m => (
            <div key={m.month} className="text-center">
              <div className="text-white/60">{m.month}</div>
              <div className="text-bca-gold">₹{(m.totalRevenueCents/100).toFixed(0)}</div>
              <div className="text-white/60">{m.totalOrders} orders</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
