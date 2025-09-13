import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { SkeletonTable } from '../components/Skeleton';

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    studentName: '',
    studentImage: '',
    comment: '',
    rating: 5
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/testimonials');
      setTestimonials(response.data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/admin/testimonials/${editingId}`, formData);
      } else {
        await api.post('/admin/testimonials', formData);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ studentName: '', studentImage: '', comment: '', rating: 5 });
      fetchTestimonials();
    } catch (error) {
      console.error('Error saving testimonial:', error);
    }
  };

  const handleEdit = (testimonial) => {
    setFormData({
      studentName: testimonial.studentName,
      studentImage: testimonial.studentImage || '',
      comment: testimonial.comment,
      rating: testimonial.rating
    });
    setEditingId(testimonial.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      try {
        await api.delete(`/admin/testimonials/${id}`);
        fetchTestimonials();
      } catch (error) {
        console.error('Error deleting testimonial:', error);
      }
    }
  };

  const toggleActive = async (id, isActive) => {
    try {
      await api.put(`/admin/testimonials/${id}`, { isActive: !isActive });
      fetchTestimonials();
    } catch (error) {
      console.error('Error updating testimonial:', error);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-lg ${i < rating ? 'text-bca-gold' : 'text-bca-gray-600'}`}
      >
        ★
      </span>
    ));
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Testimonials</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-bca-gold text-black rounded-lg font-medium hover:bg-bca-gold/80 transition-colors"
        >
          Add Testimonial
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-bca-gray-800 rounded-lg p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-white mb-4">
            {editingId ? 'Edit Testimonial' : 'Add New Testimonial'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-bca-gray-300 mb-2">
                  Student Name
                </label>
                <input
                  type="text"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  className="w-full px-3 py-2 bg-bca-gray-700 border border-bca-gray-600 rounded-lg text-white focus:outline-none focus:border-bca-gold"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-bca-gray-300 mb-2">
                  Student Image URL
                </label>
                <input
                  type="url"
                  value={formData.studentImage}
                  onChange={(e) => setFormData({ ...formData, studentImage: e.target.value })}
                  className="w-full px-3 py-2 bg-bca-gray-700 border border-bca-gray-600 rounded-lg text-white focus:outline-none focus:border-bca-gold"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-bca-gray-300 mb-2">
                Comment
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 bg-bca-gray-700 border border-bca-gray-600 rounded-lg text-white focus:outline-none focus:border-bca-gold"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-bca-gray-300 mb-2">
                Rating
              </label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-bca-gray-700 border border-bca-gray-600 rounded-lg text-white focus:outline-none focus:border-bca-gold"
              >
                <option value={1}>1 Star</option>
                <option value={2}>2 Stars</option>
                <option value={3}>3 Stars</option>
                <option value={4}>4 Stars</option>
                <option value={5}>5 Stars</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-bca-gold text-black rounded-lg font-medium hover:bg-bca-gold/80 transition-colors"
              >
                {editingId ? 'Update' : 'Create'} Testimonial
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ studentName: '', studentImage: '', comment: '', rating: 5 });
                }}
                className="px-6 py-2 bg-bca-gray-600 text-white rounded-lg font-medium hover:bg-bca-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial) => (
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-bca-gray-800 rounded-lg p-6 border-2 ${
              testimonial.isActive ? 'border-bca-gold/50' : 'border-bca-gray-600'
            }`}
          >
            <div className="flex items-center gap-4 mb-4">
              {testimonial.studentImage ? (
                <img
                  src={testimonial.studentImage}
                  alt={testimonial.studentName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-bca-gray-700 flex items-center justify-center">
                  <span className="text-bca-gray-300 font-bold">
                    {testimonial.studentName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-bold text-white">{testimonial.studentName}</h3>
                <div className="flex">{renderStars(testimonial.rating)}</div>
              </div>
            </div>
            <p className="text-bca-gray-300 mb-4 italic">"{testimonial.comment}"</p>
            <div className="flex justify-between items-center">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                testimonial.isActive 
                  ? 'bg-bca-gold/20 text-bca-gold' 
                  : 'bg-bca-gray-600 text-bca-gray-300'
              }`}>
                {testimonial.isActive ? 'Active' : 'Inactive'}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(testimonial)}
                  className="px-3 py-1 bg-bca-cyan/20 text-bca-cyan rounded text-sm hover:bg-bca-cyan/30 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleActive(testimonial.id, testimonial.isActive)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    testimonial.isActive
                      ? 'bg-bca-gray-600 text-bca-gray-300 hover:bg-bca-gray-500'
                      : 'bg-bca-gold/20 text-bca-gold hover:bg-bca-gold/30'
                  }`}
                >
                  {testimonial.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDelete(testimonial.id)}
                  className="px-3 py-1 bg-bca-red/20 text-bca-red rounded text-sm hover:bg-bca-red/30 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {testimonials.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-bca-gray-400 text-lg">No testimonials found.</p>
        </div>
      )}
    </div>
  );
}
