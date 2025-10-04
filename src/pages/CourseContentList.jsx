import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
// Custom Icons
const VideoIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);
import { api } from '../lib/api';
import { SkeletonCard } from '../components/Skeleton';

export default function CourseContentList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadCourses();
  }, []);

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

  const handleCourseSelect = (course) => {
    navigate(`/course-content/${course.id}`);
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
            <h1 className="text-3xl font-bold text-white">Course Content Management</h1>
          </div>
          <p className="text-bca-gray-400">Select a course to manage its content including videos, GitHub repos, and notes</p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400"
          >
            {error}
            <button onClick={() => setError('')} className="ml-2 text-red-300 hover:text-red-200">×</button>
          </motion.div>
        )}

        {/* Course Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-bca-gray-800 rounded-xl p-6 border border-bca-gray-700"
        >
          <h2 className="text-xl font-bold text-white mb-6">Select Course</h2>
          
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {courses.map(course => (
                <motion.button
                  key={course.id}
                  onClick={() => handleCourseSelect(course)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-6 bg-bca-gray-700 hover:bg-bca-gray-600 rounded-lg text-left transition-all duration-300 border border-bca-gray-600 hover:border-bca-gold/50 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white group-hover:text-bca-gold transition-colors mb-2">
                        {course.title}
                      </h3>
                      <p className="text-sm text-bca-gray-400 line-clamp-2">
                        {course.shortDesc}
                      </p>
                    </div>
                    <div className="ml-4 p-2 bg-bca-gold/20 rounded-lg group-hover:bg-bca-gold/30 transition-colors">
                      <VideoIcon className="w-5 h-5 text-bca-gold" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-bca-gray-400">
                      {course.isMonthlyPayment 
                        ? `${course.durationMonths} months` 
                        : 'Single payment'
                      }
                    </span>
                    <span className="text-bca-gold font-medium">
                      Manage Content →
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {!loading && courses.length === 0 && (
            <div className="text-center py-12">
              <VideoIcon className="w-16 h-16 text-bca-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-bca-gray-400 mb-2">No Courses Found</h3>
              <p className="text-bca-gray-500">Create your first course to start managing content.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
