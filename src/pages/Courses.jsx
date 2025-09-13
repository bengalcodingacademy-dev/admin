import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { SkeletonTable } from '../components/Skeleton';

export default function Courses() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ 
    title:'', 
    slug:'', 
    priceCents:0, 
    shortDesc:'', 
    longDesc:'', 
    imageUrl:'',
    coupons: []
  });
  const [file, setFile] = useState(null);
  const [showCoupons, setShowCoupons] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const load = async () => {
    try {
      setLoading(true);
      const response = await api.get('/courses');
      setList(response.data);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { load(); }, []);
  
  const uploadPoster = async () => {
    if (!file) return null;
    const key = `courses/${form.slug || Date.now()}-${file.name}`;
    const presign = await api.post('/admin/uploads/presign', { key, contentType: file.type });
    if (presign.data.mode === 'post') {
      const { url, fields } = presign.data.post;
      const formData = new FormData();
      Object.entries(fields).forEach(([k, v]) => formData.append(k, v));
      formData.append('file', file);
      await fetch(url, { method: 'POST', body: formData });
    } else if (presign.data.uploadUrl) {
      await fetch(presign.data.uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
    }
    return presign.data.publicUrl; // Direct S3 public URL
  };
  
  const create = async () => {
    try {
      let imageUrl = form.imageUrl;
      if (file) imageUrl = await uploadPoster();
      const payload = { ...form, imageUrl };
      if (!payload.imageUrl) delete payload.imageUrl; // avoid sending empty string which fails url validation
      await api.post('/admin/courses', payload);
      setForm({ title:'', slug:'', priceCents:0, shortDesc:'', longDesc:'', imageUrl:'', coupons: [] });
      setFile(null);
      setShowCoupons(false);
      load();
    } catch (error) {
      console.error('Error creating course:', error);
    }
  };
  
  const remove = async (id) => { 
    try {
      await api.delete(`/admin/courses/${id}`); 
      load(); 
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  const addCoupon = () => {
    setForm(prev => ({
      ...prev,
      coupons: [...prev.coupons, { code: '', discountPercent: 10 }]
    }));
  };

  const updateCoupon = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      coupons: prev.coupons.map((coupon, i) => 
        i === index ? { ...coupon, [field]: value } : coupon
      )
    }));
  };

  const removeCoupon = (index) => {
    setForm(prev => ({
      ...prev,
      coupons: prev.coupons.filter((_, i) => i !== index)
    }));
  };
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <SkeletonTable rows={5} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Course Management</h1>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bca-gray-800 rounded-lg p-6 mb-8"
      >
        <h2 className="text-xl font-bold text-white mb-4">Create New Course</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {['title','slug','shortDesc','longDesc','priceCents'].map(k=> (
            <div key={k}>
              <label className="block text-sm font-medium text-bca-gray-300 mb-2 capitalize">
                {k === 'priceCents' ? 'Price (₹)' : k.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              {k === 'longDesc' ? (
                <textarea
                  placeholder={k}
                  className="w-full px-3 py-2 rounded-lg bg-bca-gray-700 border border-bca-gray-600 text-white focus:outline-none focus:border-bca-gold"
                  value={form[k]}
                  onChange={e=>setForm(f=>({...f,[k]: e.target.value}))}
                  rows={3}
                />
              ) : (
                <input
                  type={k === 'priceCents' ? 'number' : 'text'}
                  placeholder={k}
                  className="w-full px-3 py-2 rounded-lg bg-bca-gray-700 border border-bca-gray-600 text-white focus:outline-none focus:border-bca-gold"
                  value={form[k]}
                  onChange={e=>setForm(f=>({...f,[k]: k==='priceCents'? Number(e.target.value||0): e.target.value}))}
                />
              )}
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-bca-gray-300 mb-2">Course Poster</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={e=>setFile(e.target.files?.[0]||null)} 
              className="w-full px-3 py-2 rounded-lg bg-bca-gray-700 border border-bca-gray-600 text-white focus:outline-none focus:border-bca-gold" 
            />
          </div>
        </div>
        
        <div className="mb-4">
          <button
            onClick={() => setShowCoupons(!showCoupons)}
            className="px-4 py-2 bg-bca-cyan/20 text-bca-cyan rounded-lg hover:bg-bca-cyan/30 transition-colors"
          >
            {showCoupons ? 'Hide' : 'Add'} Coupons ({form.coupons.length})
          </button>
        </div>
        
        {showCoupons && (
          <div className="mb-4 p-4 bg-bca-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-3">Course Coupons</h3>
            {form.coupons.map((coupon, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Coupon Code"
                  className="flex-1 px-3 py-2 rounded-lg bg-bca-gray-600 border border-bca-gray-500 text-white focus:outline-none focus:border-bca-gold"
                  value={coupon.code}
                  onChange={e => updateCoupon(index, 'code', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Discount %"
                  min="1"
                  max="100"
                  className="w-32 px-3 py-2 rounded-lg bg-bca-gray-600 border border-bca-gray-500 text-white focus:outline-none focus:border-bca-gold"
                  value={coupon.discountPercent}
                  onChange={e => updateCoupon(index, 'discountPercent', parseInt(e.target.value) || 0)}
                />
                <button
                  onClick={() => removeCoupon(index)}
                  className="px-3 py-2 bg-bca-red/20 text-bca-red rounded-lg hover:bg-bca-red/30 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={addCoupon}
              className="px-4 py-2 bg-bca-gold/20 text-bca-gold rounded-lg hover:bg-bca-gold/30 transition-colors"
            >
              Add Coupon
            </button>
          </div>
        )}
        
        <button 
          onClick={create} 
          className="px-6 py-3 bg-bca-gold text-black rounded-lg font-medium hover:bg-bca-gold/80 transition-colors"
        >
          Create Course
        </button>
      </motion.div>
      
      <div className="grid gap-4">
        {list.map(c => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-bca-gray-800 rounded-lg p-6 border border-bca-gray-700"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {c.imageUrl && (
                  <img
                    src={c.imageUrl}
                    alt={c.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h3 className="text-lg font-bold text-white">{c.title}</h3>
                  <p className="text-bca-gray-300 text-sm mb-1">{c.shortDesc}</p>
                  <p className="text-bca-gold font-semibold">₹{(c.priceCents/100).toFixed(2)}</p>
                </div>
              </div>
              <button 
                onClick={()=>remove(c.id)} 
                className="px-4 py-2 bg-bca-red/20 text-bca-red rounded-lg hover:bg-bca-red/30 transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      
      {list.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-bca-gray-400 text-lg">No courses found.</p>
        </div>
      )}
    </div>
  );
}
