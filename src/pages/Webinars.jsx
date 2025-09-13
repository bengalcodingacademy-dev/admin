import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { SkeletonTable } from '../components/Skeleton';

export default function Webinars() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title:'', description:'', presenter:'', startTime:'', joinLink:'' });
  
  const load = async () => {
    try {
      setLoading(true);
      const response = await api.get('/webinars');
      setList(response.data);
    } catch (error) {
      console.error('Error loading webinars:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { load(); }, []);
  
  const create = async () => {
    try {
      await api.post('/admin/webinars', form);
      setForm({ title:'', description:'', presenter:'', startTime:'', joinLink:'' });
      load();
    } catch (error) {
      console.error('Error creating webinar:', error);
    }
  };
  
  const remove = async (id) => {
    try {
      await api.delete(`/admin/webinars/${id}`);
      load();
    } catch (error) {
      console.error('Error deleting webinar:', error);
    }
  };
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <SkeletonTable rows={3} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Webinar Management</h1>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bca-gray-800 rounded-lg p-6 mb-8"
      >
        <h2 className="text-xl font-bold text-white mb-4">Create New Webinar</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {['title','description','presenter','startTime','joinLink'].map(k=> (
            <div key={k}>
              <label className="block text-sm font-medium text-bca-gray-300 mb-2 capitalize">
                {k === 'startTime' ? 'Start Date & Time' : k}
              </label>
              <input 
                type={k === 'startTime' ? 'datetime-local' : 'text'}
                placeholder={k}
                className="w-full px-3 py-2 rounded-lg bg-bca-gray-700 border border-bca-gray-600 text-white focus:outline-none focus:border-bca-gold"
                value={form[k]}
                onChange={e=>setForm(f=>({...f,[k]: e.target.value}))} 
              />
            </div>
          ))}
        </div>
        <button 
          onClick={create} 
          className="px-6 py-3 bg-bca-gold text-black rounded-lg font-medium hover:bg-bca-gold/80 transition-colors"
        >
          Create Webinar
        </button>
      </motion.div>
      
      <div className="grid gap-4">
        {list.map(w => (
          <motion.div
            key={w.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-bca-gray-800 rounded-lg p-6 border border-bca-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">{w.title}</h3>
                <p className="text-bca-gray-300 text-sm mb-1">{w.description}</p>
                <p className="text-bca-cyan text-sm">{new Date(w.startTime).toLocaleString()}</p>
                {w.presenter && <p className="text-bca-gray-400 text-sm">Presenter: {w.presenter}</p>}
              </div>
              <button 
                onClick={()=>remove(w.id)} 
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
          <p className="text-bca-gray-400 text-lg">No webinars found.</p>
        </div>
      )}
    </div>
  );
}
