import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export default function Announcements() {
  const [list, setList] = useState([]);
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [courseId, setCourseId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  
  const load = async () => {
    try {
      const [announcementsRes, coursesRes] = await Promise.all([
        api.get('/announcements'),
        api.get('/courses')
      ]);
      setList(announcementsRes.data);
      setCourses(coursesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };
  
  useEffect(() => { load(); }, []);
  
  const create = async () => {
    try {
      setError('');
      setSuccess('');
      setIsCreating(true);
      
      if (!title.trim()) {
        setError('Title is required');
        setIsCreating(false);
        return;
      }
      if (!body.trim()) {
        setError('Body is required');
        setIsCreating(false);
        return;
      }
      
      await api.post('/admin/announcements', { 
        title, 
        body, 
        courseId: courseId || undefined 
      });
      
      setSuccess('Announcement created successfully!');
      setTitle('');
      setBody('');
      setCourseId('');
      load();
    } catch (error) {
      console.error('Error creating announcement:', error);
      setError('Failed to create announcement. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const deleteAnnouncement = async (id) => {
    if (!confirm('Are you sure you want to delete this announcement? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(id);
      setError('');
      setSuccess('');

      // Optimistic deletion - remove from UI immediately
      const previousList = [...list];
      setList(prevList => prevList.filter(announcement => announcement.id !== id));

      // Make API call
      await api.delete(`/admin/announcements/${id}`);
      
      setSuccess('Announcement deleted successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);

    } catch (error) {
      console.error('Error deleting announcement:', error);
      
      // Revert optimistic deletion on error
      setList(previousList);
      setError('Failed to delete announcement. Please try again.');
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setError('');
      }, 5000);
    } finally {
      setDeletingId(null);
    }
  };
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-white mb-8">Announcement Management</h1>
      
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
        <h2 className="text-xl font-bold text-white mb-4">Create New Announcement</h2>
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-bca-gray-300 mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input 
              placeholder="Enter announcement title" 
              className="w-full px-3 py-2 rounded-lg bg-bca-gray-700 border border-bca-gray-600 text-white focus:outline-none focus:border-bca-gold"
              value={title} 
              onChange={e=>{
                setTitle(e.target.value);
                if (error) setError('');
              }} 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-bca-gray-300 mb-2">
              Course/Batch <span className="text-bca-gray-400 text-xs">(Optional - leave empty for global announcement)</span>
            </label>
            <select 
              className="w-full px-3 py-2 rounded-lg bg-bca-gray-700 border border-bca-gray-600 text-white focus:outline-none focus:border-bca-gold"
              value={courseId} 
              onChange={e=>setCourseId(e.target.value)}
            >
              <option value="">Global Announcement (All Users)</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-bca-gray-300 mb-2">
              Message <span className="text-red-400">*</span>
            </label>
            <textarea 
              placeholder="Enter announcement message" 
              rows={4}
              className="w-full px-3 py-2 rounded-lg bg-bca-gray-700 border border-bca-gray-600 text-white focus:outline-none focus:border-bca-gold resize-none"
              value={body} 
              onChange={e=>{
                setBody(e.target.value);
                if (error) setError('');
              }} 
            />
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
                Creating Announcement...
              </div>
            ) : (
              'Create Announcement'
            )}
          </button>
        </div>
      </motion.div>
      
      <div className="grid gap-4">
        <h2 className="text-xl font-bold text-white mb-4">Recent Announcements</h2>
        {list.map(a => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-bca-gray-800 rounded-lg p-6 border border-bca-gray-700"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">{a.title}</h3>
                {a.course && (
                  <div className="text-bca-cyan text-sm mt-1">
                    📚 {a.course.title}
                  </div>
                )}
                {!a.course && (
                  <div className="text-bca-gold text-sm mt-1">
                    🌐 Global Announcement
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-bca-gray-400 text-sm">
                  {new Date(a.createdAt).toLocaleDateString()}
                </div>
                <button
                  onClick={() => deleteAnnouncement(a.id)}
                  disabled={deletingId === a.id}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                  title="Delete announcement"
                >
                  {deletingId === a.id ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="text-white/80">{a.body}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
