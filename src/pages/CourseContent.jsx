import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { SkeletonCard } from '../components/Skeleton';

// Icons
const VideoIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const BookIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const CodeIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

export default function CourseContent() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    topicName: '',
    videoLink: '',
    githubRepo: '',
    notes: '',
    order: 0
  });

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadContent();
    }
  }, [selectedCourse, selectedMonth]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error loading courses:', error);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const loadContent = async () => {
    if (!selectedCourse) return;
    
    try {
      setLoading(true);
      const response = await api.get(`/course-content/course/${selectedCourse.id}/month/${selectedMonth}`);
      setContent(response.data);
    } catch (error) {
      console.error('Error loading content:', error);
      setError('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse) {
      setError('Please select a course first');
      return;
    }

    try {
      setIsCreating(true);
      setError('');

      const payload = {
        ...form,
        courseId: selectedCourse.id,
        monthNumber: selectedMonth,
        order: content.length
      };

      if (editingContent) {
        await api.put(`/course-content/${editingContent.id}`, payload);
        setSuccess('Content updated successfully!');
      } else {
        await api.post('/course-content', payload);
        setSuccess('Content added successfully!');
      }

      setForm({ topicName: '', videoLink: '', githubRepo: '', notes: '', order: 0 });
      setEditingContent(null);
      loadContent();
    } catch (error) {
      console.error('Error saving content:', error);
      setError('Failed to save content');
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

    try {
      await api.delete(`/course-content/${id}`);
      setSuccess('Content deleted successfully!');
      loadContent();
    } catch (error) {
      console.error('Error deleting content:', error);
      setError('Failed to delete content');
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

  return (
    <div className="min-h-screen bg-bca-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-bca-gold/20 rounded-lg">
              <VideoIcon className="w-6 h-6 text-bca-gold" />
            </div>
            <h1 className="text-3xl font-bold text-white">Upload Video & Notes</h1>
          </div>
          <p className="text-bca-gray-400">Manage course content including videos, GitHub repos, and notes for each month</p>
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
          {/* Course Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-bca-gray-800 rounded-xl p-6 border border-bca-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Select Course</h2>
              
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {courses.map(course => (
                    <button
                      key={course.id}
                      onClick={() => {
                        setSelectedCourse(course);
                        setSelectedMonth(1);
                        setEditingContent(null);
                        setForm({ topicName: '', videoLink: '', githubRepo: '', notes: '', order: 0 });
                      }}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        selectedCourse?.id === course.id
                          ? 'bg-bca-gold/20 border border-bca-gold text-bca-gold'
                          : 'bg-bca-gray-700 hover:bg-bca-gray-600 text-white'
                      }`}
                    >
                      <div className="font-medium">{course.title}</div>
                      <div className="text-sm opacity-75">
                        {course.isMonthlyPayment 
                          ? `${course.durationMonths} months` 
                          : 'Single payment'
                        }
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Month Selection */}
              {selectedCourse && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Select Month</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {generateMonths(selectedCourse).map(month => (
                      <button
                        key={month}
                        onClick={() => {
                          setSelectedMonth(month);
                          setEditingContent(null);
                          setForm({ topicName: '', videoLink: '', githubRepo: '', notes: '', order: 0 });
                        }}
                        className={`p-2 rounded-lg text-sm font-medium transition-colors ${
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
              )}
            </div>
          </motion.div>

          {/* Content Form and List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            {selectedCourse ? (
              <div className="space-y-6">
                {/* Add/Edit Content Form */}
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
                      <p className="text-bca-gray-400">No content added for this month yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {content.map((item, index) => (
                        <div key={item.id} className="bg-bca-gray-700 rounded-lg p-4 border border-bca-gray-600">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm text-bca-gray-400">#{index + 1}</span>
                                <h3 className="font-semibold text-white">{item.topicName}</h3>
                              </div>
                              
                              <div className="space-y-2">
                                {item.videoLink && (
                                  <div className="flex items-center gap-2">
                                    <VideoIcon className="w-4 h-4 text-red-400" />
                                    <a 
                                      href={item.videoLink} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-400 hover:text-blue-300 text-sm"
                                    >
                                      Watch Video
                                    </a>
                                  </div>
                                )}
                                
                                {item.githubRepo && (
                                  <div className="flex items-center gap-2">
                                    <CodeIcon className="w-4 h-4 text-gray-400" />
                                    <a 
                                      href={item.githubRepo} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-400 hover:text-blue-300 text-sm"
                                    >
                                      View Repository
                                    </a>
                                  </div>
                                )}
                                
                                {item.notes && (
                                  <div className="flex items-start gap-2">
                                    <BookIcon className="w-4 h-4 text-yellow-400 mt-0.5" />
                                    <p className="text-bca-gray-300 text-sm">{item.notes}</p>
                                  </div>
                                )}
                              </div>
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
                                className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-bca-gray-800 rounded-xl p-12 border border-bca-gray-700 text-center">
                <VideoIcon className="w-16 h-16 text-bca-gray-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">Select a Course</h2>
                <p className="text-bca-gray-400">Choose a course from the left to start managing its content</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
