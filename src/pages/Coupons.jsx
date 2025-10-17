import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ code: '', discountPercent: 10, courseId: '', maxLimit: '' });
  const [courses, setCourses] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const [couponsRes, coursesRes] = await Promise.all([
        api.get('/admin/coupons'),
        api.get('/admin/courses')
      ]);
      setCoupons(couponsRes.data);
      setCourses(coursesRes.data);
    } catch (e) {
      const raw = e.response?.data?.error || e.message;
      const message = typeof raw === 'string' ? raw : (raw?.message || 'Failed');
      setError(message);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ code: '', discountPercent: 10, courseId: '', maxLimit: '' });
    setEditingId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const payload = {
        code: form.code.trim().toUpperCase(),
        discountPercent: Number(form.discountPercent),
        courseId: form.courseId,
        maxLimit: form.maxLimit === '' ? undefined : Number(form.maxLimit),
        isActive: true
      };
      if (editingId) {
        await api.put(`/admin/coupons/${editingId}`, payload);
      } else {
        await api.post('/admin/coupons', payload);
      }
      await load();
      resetForm();
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally { setLoading(false); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
      await load();
    } catch (e) {
      const raw = e.response?.data?.error || e.message;
      const message = typeof raw === 'string' ? raw : (raw?.message || 'Failed');
      setError(message);
    }
  };

  const toggle = async (id) => {
    try {
      await api.post(`/admin/coupons/${id}/toggle`);
      await load();
    } catch (e) {
      const raw = e.response?.data?.error || e.message;
      const message = typeof raw === 'string' ? raw : (raw?.message || 'Failed');
      setError(message);
    }
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setForm({
      code: c.code,
      discountPercent: c.discountPercent,
      courseId: c.courseId,
      maxLimit: c.maxLimit ?? ''
    });
  };

  return (
    <div className="min-h-screen bg-bca-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Coupons</h1>
        {error && (
          <div className="mb-4 p-3 rounded-lg border border-red-500/40 bg-red-500/10 text-red-300">{error}</div>
        )}

        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end mb-8">
          <div>
            <label className="block text-sm text-bca-gray-300 mb-1">Code</label>
            <input value={form.code} onChange={e=>setForm({...form, code:e.target.value})} className="w-full px-3 py-2 rounded-lg bg-bca-gray-800 border border-bca-gray-700 text-white placeholder-bca-gray-500 focus:outline-none focus:border-bca-gold" placeholder="BCA50" required />
          </div>
          <div>
            <label className="block text-sm text-bca-gray-300 mb-1">Discount %</label>
            <input type="number" min="1" max="100" value={form.discountPercent} onChange={e=>setForm({...form, discountPercent:e.target.value})} className="w-full px-3 py-2 rounded-lg bg-bca-gray-800 border border-bca-gray-700 text-white placeholder-bca-gray-500 focus:outline-none focus:border-bca-gold" required />
          </div>
          <div>
            <label className="block text-sm text-bca-gray-300 mb-1">Course</label>
            <select value={form.courseId} onChange={e=>setForm({...form, courseId:e.target.value})} className="w-full px-3 py-2 rounded-lg bg-bca-gray-800 border border-bca-gray-700 text-white focus:outline-none focus:border-bca-gold" required>
              <option value="">Select course</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-bca-gray-300 mb-1">Max Uses (optional)</label>
            <input type="number" min="1" value={form.maxLimit} onChange={e=>setForm({...form, maxLimit:e.target.value})} className="w-full px-3 py-2 rounded-lg bg-bca-gray-800 border border-bca-gray-700 text-white placeholder-bca-gray-500 focus:outline-none focus:border-bca-gold" placeholder="e.g. 100" />
          </div>
          <div className="flex gap-2">
            <button disabled={loading} className="px-4 py-2 rounded-lg bg-bca-gold text-black font-semibold hover:bg-bca-gold/80 disabled:opacity-50">{editingId ? 'Update' : 'Create'}</button>
            {editingId && <button type="button" onClick={resetForm} className="px-3 py-2 rounded-lg border border-bca-gray-600 text-bca-gray-200 hover:bg-bca-gray-700">Cancel</button>}
          </div>
        </form>

        <div className="overflow-x-auto rounded-xl border border-bca-gray-700">
          <table className="min-w-full">
            <thead>
              <tr className="bg-bca-gray-800/70 text-left">
                <th className="p-3 border-b border-bca-gray-700 text-bca-gray-300">Code</th>
                <th className="p-3 border-b border-bca-gray-700 text-bca-gray-300">Course</th>
                <th className="p-3 border-b border-bca-gray-700 text-bca-gray-300">Discount</th>
                <th className="p-3 border-b border-bca-gray-700 text-bca-gray-300">Used / Max</th>
                <th className="p-3 border-b border-bca-gray-700 text-bca-gray-300">Active</th>
                <th className="p-3 border-b border-bca-gray-700 text-bca-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id} className="hover:bg-bca-gray-800/50">
                  <td className="p-3 border-t border-bca-gray-800 font-mono">{c.code}</td>
                  <td className="p-3 border-t border-bca-gray-800">{c.course?.title || c.courseId}</td>
                  <td className="p-3 border-t border-bca-gray-800">{c.discountPercent}%</td>
                  <td className="p-3 border-t border-bca-gray-800">{c.usedLimit ?? 0} / {c.maxLimit ?? '∞'}</td>
                  <td className="p-3 border-t border-bca-gray-800">{c.isActive ? 'Yes' : 'No'}</td>
                  <td className="p-3 border-t border-bca-gray-800 space-x-2">
                    <button onClick={()=>startEdit(c)} className="px-3 py-1 rounded-lg border border-bca-gray-600 text-bca-gray-200 hover:bg-bca-gray-700">Edit</button>
                    <button onClick={()=>toggle(c.id)} className="px-3 py-1 rounded-lg border border-bca-gray-600 text-bca-gray-200 hover:bg-bca-gray-700">{c.isActive ? 'Disable' : 'Enable'}</button>
                    <button onClick={()=>remove(c.id)} className="px-3 py-1 rounded-lg border border-bca-red/40 text-bca-red hover:bg-bca-red/10">Delete</button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-bca-gray-400">No coupons yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


