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
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const uploadImage = async (file) => {
    if (!file) return null;
    
    try {
      setUploading(true);
      const key = `testimonials/${Date.now()}-${file.name}`;
      const presign = await api.post('/admin/uploads/presign', { 
        key, 
        contentType: file.type 
      });
      
      if (presign.data.mode === 'post') {
        const { url, fields } = presign.data.post;
        const formData = new FormData();
        Object.entries(fields).forEach(([k, v]) => formData.append(k, v));
        formData.append('file', file);
        await fetch(url, { method: 'POST', body: formData });
      }
      
      return presign.data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      let imageUrl = formData.studentImage;
      
      // Upload image if a new file is selected
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }
      
      const testimonialData = {
        ...formData,
        studentImage: imageUrl
      };
      
      if (editingId) {
        await api.put(`/admin/testimonials/${editingId}`, testimonialData);
        setSuccess('Testimonial updated successfully!');
      } else {
        await api.post('/admin/testimonials', testimonialData);
        setSuccess('Testimonial created successfully!');
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({ studentName: '', studentImage: '', comment: '', rating: 5 });
      setImageFile(null);
      fetchTestimonials();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      setError(error.response?.data?.error || 'Failed to save testimonial. Please try again.');
    }
  };

  const handleEdit = (testimonial) => {
    setFormData({
      studentName: testimonial.studentName,
      studentImage: testimonial.studentImage || '',
      comment: testimonial.comment,
      rating: testimonial.rating
    });
    setImageFile(null);
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
          
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
              {success}
            </div>
          )}
          
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
                  Student Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full px-3 py-2 bg-bca-gray-700 border border-bca-gray-600 rounded-lg text-white focus:outline-none focus:border-bca-gold file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-bca-gold file:text-bca-black hover:file:bg-bca-gold/80"
                />
                {imageFile && (
                  <div className="mt-2 text-sm text-bca-gray-400">
                    Selected: {imageFile.name}
                  </div>
                )}
                {formData.studentImage && !imageFile && (
                  <div className="mt-2 text-sm text-bca-gray-400">
                    Current image: {formData.studentImage.split('/').pop()}
                  </div>
                )}
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
                disabled={uploading}
                className="px-6 py-2 bg-bca-gold text-black rounded-lg font-medium hover:bg-bca-gold/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : (editingId ? 'Update' : 'Create')} Testimonial
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ studentName: '', studentImage: '', comment: '', rating: 5 });
                  setImageFile(null);
                  setError('');
                  setSuccess('');
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
            className="group relative bg-gradient-to-br from-bca-gray-800/90 to-bca-gray-900/90 backdrop-blur-sm rounded-2xl p-6 border border-bca-gold/30 hover:border-bca-gold/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(253,176,0,0.2)] hover:scale-[1.02]"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-bca-gold/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                {testimonial.studentImage ? (
                  <div className="relative">
                    <img
                      src={testimonial.studentImage}
                      alt={testimonial.studentName}
                      className="w-16 h-16 rounded-full object-cover border-2 border-bca-gold/50 shadow-lg"
                    />
                    <div className="absolute -inset-1 bg-gradient-to-r from-bca-gold/20 to-bca-cyan/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-bca-gray-700 to-bca-gray-600 flex items-center justify-center border-2 border-bca-gold/50 shadow-lg">
                      <span className="text-bca-gold font-bold text-xl">
                        {testimonial.studentName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-bca-gold/20 to-bca-cyan/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-white text-lg mb-1 group-hover:text-bca-gold transition-colors duration-300">
                    {testimonial.studentName}
                  </h3>
                  <div className="flex items-center gap-1">
                    {renderStars(testimonial.rating)}
                    <span className="text-bca-gray-400 text-sm ml-2">({testimonial.rating}/5)</span>
                  </div>
                </div>
              </div>
              
              <div className="relative mb-6">
                <div className="absolute left-0 top-0 text-bca-gold/30 text-4xl font-serif leading-none">"</div>
                <p className="text-bca-gray-300 italic pl-6 pr-2 leading-relaxed text-sm">
                  {testimonial.comment}
                </p>
                <div className="absolute right-0 bottom-0 text-bca-gold/30 text-4xl font-serif leading-none">"</div>
              </div>
              
              <div className="flex justify-end">
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(testimonial)}
                    className="px-4 py-2 bg-gradient-to-r from-bca-cyan/20 to-bca-cyan/10 text-bca-cyan rounded-lg text-sm font-medium hover:from-bca-cyan/30 hover:to-bca-cyan/20 transition-all duration-300 border border-bca-cyan/30 hover:border-bca-cyan/50 hover:shadow-[0_0_15px_rgba(0,161,255,0.3)]"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(testimonial.id)}
                    className="px-4 py-2 bg-gradient-to-r from-bca-red/20 to-bca-red/10 text-bca-red rounded-lg text-sm font-medium hover:from-bca-red/30 hover:to-bca-red/20 transition-all duration-300 border border-bca-red/30 hover:border-bca-red/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                  >
                    🗑️ Delete
                  </button>
                </div>
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
