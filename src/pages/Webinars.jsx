import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { SkeletonTable } from '../components/Skeleton';

export default function Webinars() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title:'', description:'', presenter:'', startTime:'', joinLink:'', imageUrl:'' });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
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
  
  const uploadImage = async () => {
    if (!file) return null;
    const key = `webinars/${Date.now()}-${file.name}`;
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
    return presign.data.publicUrl;
  };
  
  const create = async () => {
    try {
      // Clear previous messages and set loading
      setError('');
      setSuccess('');
      setIsCreating(true);
      
      // Basic validation
      if (!form.title.trim()) {
        setError('Webinar title is required');
        setIsCreating(false);
        return;
      }
      
      let imageUrl = form.imageUrl;
      if (file) imageUrl = await uploadImage();
      
      const payload = { ...form, imageUrl };
      if (!payload.imageUrl) delete payload.imageUrl;
      
      await api.post('/admin/webinars', payload);
      setSuccess('Webinar created successfully!');
      setForm({ title:'', description:'', presenter:'', startTime:'', joinLink:'', imageUrl:'' });
      setFile(null);
      load();
    } catch (error) {
      console.error('Error creating webinar:', error);
      setIsCreating(false);
      
      // Handle different types of errors
      if (error.response?.data) {
        const responseData = error.response.data;
        
        // Check if it's a ZodError with issues array
        if (responseData.issues && Array.isArray(responseData.issues)) {
          const errorMessages = responseData.issues.map(issue => {
            const field = issue.path.join('.');
            switch (issue.code) {
              case 'too_small':
                return `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${issue.minimum} characters long`;
              case 'too_big':
                return `${field.charAt(0).toUpperCase() + field.slice(1)} must be no more than ${issue.maximum} characters long`;
              case 'invalid_type':
                return `${field.charAt(0).toUpperCase() + field.slice(1)} has an invalid format`;
              case 'invalid_format':
                if (field === 'startTime') {
                  return 'Start time must be a valid date and time (e.g., 2025-09-15T21:10)';
                } else if (field === 'joinLink') {
                  return 'Join link must be a valid URL (e.g., https://meet.google.com/abc-def-ghi)';
                }
                return `${field.charAt(0).toUpperCase() + field.slice(1)} has an invalid format`;
              case 'required':
                return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
              default:
                return `${field.charAt(0).toUpperCase() + field.slice(1)}: ${issue.message}`;
            }
          });
          setError(errorMessages.join(', '));
        } else if (responseData.message) {
          if (responseData.message.includes('ZodError')) {
            setError('Please check all required fields and try again');
          } else {
            setError(responseData.message);
          }
        } else {
          setError('Please check all required fields and try again');
        }
      } else if (error.response?.status === 403) {
        setError('You are not authorized to create webinars. Please check your admin permissions.');
      } else if (error.response?.status === 401) {
        setError('You are not logged in. Please log in and try again.');
      } else if (error.response?.status === 500) {
        setError('Server error occurred. Please try again later.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
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
      
      {/* Error and Success Messages */}
      {error && (
        <div className="mb-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/50 rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <div>
                <h3 className="text-red-400 font-semibold">Error</h3>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {success && (
        <div className="mb-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/20 border border-green-500/50 rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
              <div>
                <h3 className="text-green-400 font-semibold">Success</h3>
                <p className="text-green-300 text-sm">{success}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      
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
                {k === 'startTime' ? 'Start Date & Time' : k} {k === 'title' && <span className="text-red-400">*</span>}
              </label>
              <input 
                type={k === 'startTime' ? 'datetime-local' : 'text'}
                placeholder={k === 'startTime' ? 'Select date and time (optional)' : k === 'joinLink' ? 'Enter join link (optional)' : k}
                className="w-full px-3 py-2 rounded-lg bg-bca-gray-700 border border-bca-gray-600 text-white focus:outline-none focus:border-bca-gold"
                value={form[k]}
                onChange={e=>{
                  setForm(f=>({...f,[k]: e.target.value}));
                  if (error) setError('');
                }} 
              />
              {k === 'startTime' && (
                <p className="text-xs text-bca-gray-400 mt-1">Optional: Select a date and time for the webinar</p>
              )}
              {k === 'joinLink' && (
                <p className="text-xs text-bca-gray-400 mt-1">Optional: Enter a join link for the webinar</p>
              )}
            </div>
          ))}
        </div>
        
        {/* Image Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-bca-gray-300 mb-2">Webinar Image</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={e=>setFile(e.target.files?.[0]||null)} 
            className="w-full px-3 py-2 rounded-lg bg-bca-gray-700 border border-bca-gray-600 text-white focus:outline-none focus:border-bca-gold" 
          />
          {file && (
            <div className="mt-2 text-sm text-green-400">
              ✓ File selected: {file.name}
            </div>
          )}
        </div>
        <button 
          onClick={create} 
          disabled={isCreating}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            isCreating 
              ? 'bg-bca-gray-600 text-bca-gray-400 cursor-not-allowed' 
              : 'bg-bca-gold text-black hover:bg-bca-gold/80'
          }`}
        >
          {isCreating ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-bca-gray-400 border-t-transparent rounded-full animate-spin"></div>
              Creating Webinar...
            </div>
          ) : (
            'Create Webinar'
          )}
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
              <div className="flex items-center gap-4">
                {w.imageUrl && (
                  <img
                    src={w.imageUrl}
                    alt={w.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h3 className="text-lg font-bold text-white">{w.title}</h3>
                  <p className="text-bca-gray-300 text-sm mb-1">{w.description}</p>
                  <p className="text-bca-cyan text-sm">{new Date(w.startTime).toLocaleString()}</p>
                  {w.presenter && <p className="text-bca-gray-400 text-sm">Presenter: {w.presenter}</p>}
                </div>
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
