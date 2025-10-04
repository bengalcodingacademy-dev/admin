import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
// Custom Icons
const VideoIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const ArrowLeftIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);
import { api } from '../lib/api';
import { SkeletonCard } from '../components/Skeleton';

export default function CourseContentManager() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingContent, setEditingContent] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const [form, setForm] = useState({
    topicName: '',
    videoLink: '',
    githubRepo: '',
    notes: '',
    order: 0
  });

  useEffect(() => {
    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  useEffect(() => {
    if (course) {
      loadContent();
    }
  }, [course, selectedMonth]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/courses/${courseId}`);
      setCourse(response.data);
    } catch (error) {
      console.error('Error loading course:', error);
      setError('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const loadContent = async (forceRefresh = false) => {
    if (!course) {
      console.log('No course loaded, skipping content load');
      return;
    }
    
    try {
      console.log('Loading content for course:', course.id, 'month:', selectedMonth, 'forceRefresh:', forceRefresh);
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      // Add cache-busting parameter if force refresh
      const url = forceRefresh 
        ? `/course-content/course/${course.id}/month/${selectedMonth}?t=${Date.now()}`
        : `/course-content/course/${course.id}/month/${selectedMonth}`;
        
      const response = await api.get(url);
      console.log('Content loaded successfully:', response.data);
      setContent(response.data);
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Error loading content:', error);
      setError('Failed to load content');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted!', { form, course, selectedMonth });
    
    if (!course) {
      setError('Course not loaded');
      return;
    }

    if (!form.topicName.trim()) {
      setError('Topic name is required');
      return;
    }

    try {
      setIsCreating(true);
      setError('');
      setSuccess('');

      const payload = {
        ...form,
        courseId: course.id,
        monthNumber: selectedMonth,
        order: content.length
      };

      console.log('Sending payload:', payload);

      if (editingContent) {
        console.log('Updating content:', editingContent.id);
        await api.put(`/course-content/${editingContent.id}`, payload);
        setSuccess('Content updated successfully!');
      } else {
        console.log('Creating new content');
        await api.post('/course-content', payload);
        setSuccess('Content added successfully!');
      }

      setForm({ topicName: '', videoLink: '', githubRepo: '', notes: '', order: 0 });
      setEditingContent(null);
      loadContent();
    } catch (error) {
      console.error('Error saving content:', error);
      setError(`Failed to save content: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEdit = (contentItem) => {
    setEditingContent(contentItem);
    setForm({
      topicName: contentItem.topicName,
      videoLink: contentItem.videoLink || '',
      githubRepo: contentItem.githubRepo || '',
      notes: contentItem.notes || '',
      order: contentItem.order
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this content?')) return;
    if (deletingId === id) return; // Prevent double deletion

    try {
      setDeletingId(id);
      console.log('Deleting content with ID:', id);
      
      // Store the current content for potential rollback
      const previousContent = [...content];
      
      // Optimistically remove from UI first
      const updatedContent = content.filter(item => item.id !== id);
      setContent(updatedContent);
      console.log('Optimistic update - removed item:', id, 'New content count:', updatedContent.length);
      
      await api.delete(`/course-content/${id}`);
      console.log('Content deleted successfully from backend');
      setSuccess('Content deleted successfully!');
      setError(''); // Clear any previous errors
      
      // Clear success message after a delay
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Error deleting content:', error);
      setError(`Failed to delete content: ${error.response?.data?.message || error.message}`);
      
      // If deletion failed, restore the previous content
      setContent(previousContent);
    } finally {
      setDeletingId(null);
    }
  };

  const clearError = () => setError('');
  const clearSuccess = () => setSuccess('');

  const generateMonths = (course) => {
    if (!course) return [];
    const months = [];
    const totalMonths = course.isMonthlyPayment ? course.durationMonths : 1;
    for (let i = 1; i <= totalMonths; i++) {
      months.push(i);
    }
    return months;
  };

  if (loading && !course) {
    return (
      <div className="min-h-screen bg-bca-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-bca-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-white mb-4">Course Not Found</h2>
            <p className="text-bca-gray-400 mb-6">The requested course could not be found.</p>
            <button
              onClick={() => navigate('/course-content')}
              className="px-6 py-2 bg-bca-gold text-black rounded-lg hover:bg-yellow-400 transition-colors"
            >
              Back to Course Selection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bca-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/course-content')}
                className="p-2 bg-bca-gray-700 hover:bg-bca-gray-600 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-white" />
              </button>
              <div className="p-2 bg-bca-gold/20 rounded-lg">
                <VideoIcon className="w-6 h-6 text-bca-gold" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Manage Content</h1>
                <p className="text-bca-gray-400">{course.title}</p>
              </div>
            </div>
            <button
              onClick={() => loadContent(true)}
              disabled={refreshing}
              className="px-4 py-2 bg-bca-cyan/20 hover:bg-bca-cyan/30 border border-bca-cyan/40 rounded-lg text-bca-cyan transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg 
                className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </motion.div>

        {/* Error/Success Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400"
          >
            {error}
            <button onClick={clearError} className="ml-2 text-red-300 hover:text-red-200">×</button>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400"
          >
            {success}
            <button onClick={clearSuccess} className="ml-2 text-green-300 hover:text-green-200">×</button>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Month Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-bca-gray-800 rounded-xl p-6 border border-bca-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Select Month</h2>
              <div className="grid grid-cols-2 gap-2">
                {generateMonths(course).map(month => (
                  <button
                    key={month}
                    onClick={() => {
                      setSelectedMonth(month);
                      setEditingContent(null);
                      setForm({ topicName: '', videoLink: '', githubRepo: '', notes: '', order: 0 });
                      // Force refresh content when switching months
                      setTimeout(() => loadContent(true), 100);
                    }}
                    className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                      selectedMonth === month
                        ? 'bg-bca-gold text-black'
                        : 'bg-bca-gray-700 hover:bg-bca-gray-600 text-white'
                    }`}
                  >
                    Month {month}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Content Management */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Add Content Form */}
            <div className="bg-bca-gray-800 rounded-xl p-6 border border-bca-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">
                {editingContent ? 'Edit Content' : `Add Content - Month ${selectedMonth}`}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-bca-gray-300 mb-2">
                    Topic Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 rounded-lg bg-bca-gray-700 border border-bca-gray-600 text-white focus:outline-none focus:border-bca-gold"
                    value={form.topicName}
                    onChange={e => setForm({ ...form, topicName: e.target.value })}
                    placeholder="e.g., Introduction to React"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-bca-gray-300 mb-2">
                    Video Link
                  </label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 rounded-lg bg-bca-gray-700 border border-bca-gray-600 text-white focus:outline-none focus:border-bca-gold"
                    value={form.videoLink}
                    onChange={e => setForm({ ...form, videoLink: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-bca-gray-300 mb-2">
                    GitHub Repository Link
                  </label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 rounded-lg bg-bca-gray-700 border border-bca-gray-600 text-white focus:outline-none focus:border-bca-gold"
                    value={form.githubRepo}
                    onChange={e => setForm({ ...form, githubRepo: e.target.value })}
                    placeholder="https://github.com/username/repo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-bca-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg bg-bca-gray-700 border border-bca-gray-600 text-white focus:outline-none focus:border-bca-gold"
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    placeholder="Additional notes, resources, or instructions..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-6 py-2 bg-gradient-to-r from-bca-gold to-yellow-500 text-black font-medium rounded-lg hover:from-yellow-400 hover:to-bca-gold transition-all duration-300 disabled:opacity-50"
                  >
                    {isCreating ? 'Saving...' : editingContent ? 'Update Content' : 'Add Content'}
                  </button>
                  
                  {editingContent && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingContent(null);
                        setForm({ topicName: '', videoLink: '', githubRepo: '', notes: '', order: 0 });
                      }}
                      className="px-6 py-2 bg-bca-gray-600 text-white rounded-lg hover:bg-bca-gray-500 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Content List */}
            <div className="bg-bca-gray-800 rounded-xl p-6 border border-bca-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">
                Content for Month {selectedMonth}
              </h2>
              
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : content.length === 0 ? (
                <div className="text-center py-8">
                  <VideoIcon className="w-12 h-12 text-bca-gray-600 mx-auto mb-3" />
                  <p className="text-bca-gray-400">No content added for this month yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {content.map((item, index) => (
                    <div key={item.id} className="bg-bca-gray-700 rounded-lg p-4 border border-bca-gray-600">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-bca-gold font-bold">#{index + 1}</span>
                            <h3 className="font-semibold text-white">{item.topicName}</h3>
                          </div>
                          
                          {item.videoLink && (
                            <div className="flex items-center gap-2 mb-2">
                              <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                              <a 
                                href={item.videoLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-bca-cyan hover:text-bca-gold transition-colors"
                              >
                                Watch Video
                              </a>
                            </div>
                          )}
                          
                          {item.githubRepo && (
                            <div className="flex items-center gap-2 mb-2">
                              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                              </svg>
                              <a 
                                href={item.githubRepo} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-bca-cyan hover:text-bca-gold transition-colors"
                              >
                                View Repository
                              </a>
                            </div>
                          )}
                          
                          {item.notes && (
                            <p className="text-bca-gray-300 text-sm">{item.notes}</p>
                          )}
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 text-bca-gold hover:bg-bca-gold/20 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
                            className={`p-2 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors ${
                              deletingId === item.id ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {deletingId === item.id ? (
                              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
