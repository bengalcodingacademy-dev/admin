import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { SkeletonTable } from '../components/Skeleton';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

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
    coupons: [],
    // New enhanced fields
    numberOfModules: 0,
    modules: [], // Array of {name: '', content: ''}
    numberOfLectures: 0,
    language: 'bengali',
    starRating: 0.0,
    numberOfStudents: 0,
    aboutCourse: '',
    courseIncludes: [], // Array of strings
    startDate: '',
    endDate: ''
  });
  const [file, setFile] = useState(null);
  const [showCoupons, setShowCoupons] = useState(false);
  const [showModules, setShowModules] = useState(false);
  const [showIncludes, setShowIncludes] = useState(false);
  const [showTestimonials, setShowTestimonials] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingModule, setEditingModule] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialImages, setTestimonialImages] = useState({});
  
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

  const uploadTestimonialImage = async (testimonialIndex, imageFile) => {
    if (!imageFile) return null;
    const key = `courses/testimonials/${Date.now()}-${imageFile.name}`;
    const presign = await api.post('/admin/uploads/presign', { key, contentType: imageFile.type });
    if (presign.data.mode === 'post') {
      const { url, fields } = presign.data.post;
      const formData = new FormData();
      Object.entries(fields).forEach(([k, v]) => formData.append(k, v));
      formData.append('file', imageFile);
      await fetch(url, { method: 'POST', body: formData });
    } else if (presign.data.uploadUrl) {
      await fetch(presign.data.uploadUrl, { method: 'PUT', headers: { 'Content-Type': imageFile.type }, body: imageFile });
    }
    return presign.data.publicUrl; // Direct S3 public URL
  };
  
  const create = async () => {
    try {
      let imageUrl = form.imageUrl;
      if (file) imageUrl = await uploadPoster();
      
      const payload = { 
        ...form, 
        imageUrl,
        modulesJson: form.modules.length > 0 ? form.modules : null,
        courseIncludes: form.courseIncludes.length > 0 ? form.courseIncludes : null,
        startDate: form.startDate ? new Date(form.startDate) : null,
        endDate: form.endDate ? new Date(form.endDate) : null
      };
      
      if (!payload.imageUrl) delete payload.imageUrl;
      
      const response = await api.post('/admin/courses', payload);
      const courseId = response.data.id;
      
      // Create testimonials if any
      if (testimonials.length > 0) {
        for (let i = 0; i < testimonials.length; i++) {
          const testimonial = testimonials[i];
          let imageUrl = testimonial.studentImage;
          
          // Upload testimonial image if file exists
          if (testimonialImages[i]) {
            imageUrl = await uploadTestimonialImage(i, testimonialImages[i]);
          }
          
          await api.post('/admin/testimonials', {
            ...testimonial,
            studentImage: imageUrl,
            courseId: courseId
          });
        }
      }
      
      // Reset form
      setForm({ 
        title:'', slug:'', priceCents:0, shortDesc:'', longDesc:'', imageUrl:'', coupons: [],
        numberOfModules: 0, modules: [], numberOfLectures: 0, language: 'bengali',
        starRating: 0.0, numberOfStudents: 0, aboutCourse: '', courseIncludes: [],
        startDate: '', endDate: ''
      });
      setFile(null);
      setTestimonials([]);
      setTestimonialImages({});
      setShowCoupons(false);
      setShowModules(false);
      setShowIncludes(false);
      setShowTestimonials(false);
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

  // Module management functions
  const addModule = () => {
    setForm(prev => ({
      ...prev,
      modules: [...prev.modules, { name: '', content: '' }]
    }));
  };

  const updateModule = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      modules: prev.modules.map((module, i) => 
        i === index ? { ...module, [field]: value } : module
      )
    }));
  };

  const removeModule = (index) => {
    setForm(prev => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index)
    }));
  };

  // Course includes management functions
  const addInclude = () => {
    setForm(prev => ({
      ...prev,
      courseIncludes: [...prev.courseIncludes, '']
    }));
  };

  const updateInclude = (index, value) => {
    setForm(prev => ({
      ...prev,
      courseIncludes: prev.courseIncludes.map((item, i) => 
        i === index ? value : item
      )
    }));
  };

  const removeInclude = (index) => {
    setForm(prev => ({
      ...prev,
      courseIncludes: prev.courseIncludes.filter((_, i) => i !== index)
    }));
  };

  // Testimonials management functions
  const addTestimonial = () => {
    setTestimonials(prev => [...prev, {
      studentName: '',
      studentImage: '',
      studentAbout: '',
      comment: '',
      rating: 5
    }]);
  };

  const updateTestimonial = (index, field, value) => {
    setTestimonials(prev => prev.map((testimonial, i) => 
      i === index ? { ...testimonial, [field]: value } : testimonial
    ));
  };

  const removeTestimonial = (index) => {
    setTestimonials(prev => prev.filter((_, i) => i !== index));
    setTestimonialImages(prev => {
      const newImages = { ...prev };
      delete newImages[index];
      return newImages;
    });
  };

  const handleTestimonialImageChange = (index, file) => {
    setTestimonialImages(prev => ({
      ...prev,
      [index]: file
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
        <h2 className="text-xl font-bold text-white mb-6">Create New Course</h2>
        
        {/* Basic Course Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-bca-gray-300 mb-2">Course Title</label>
              <input
                type="text"
                placeholder="Enter course title"
                className="w-full px-3 py-2 rounded-lg bg-bca-gray-700 border border-bca-gray-600 text-white focus:outline-none focus:border-bca-gold"
                value={form.title}
                onChange={e=>setForm(f=>({...f,title: e.target.value}))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-bca-gray-300 mb-2">Slug</label>
              <input
                type="text"
                placeholder="course-slug"
                className="w-full px-3 py-2 rounded-lg bg-bca-gray-700 border border-bca-gray-600 text-white focus:outline-none focus:border-bca-gold"
                value={form.slug}
                onChange={e=>setForm(f=>({...f,slug: e.target.value}))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-bca-gray-300 mb-2">Price (₹)</label>
              <input
                type="number"
                placeholder="0"
                className="w-full px-3 py-2 rounded-lg bg-bca-gray-700 border border-bca-gray-600 text-white focus:outline-none focus:border-bca-gold"
                value={form.priceCents}
                onChange={e=>setForm(f=>({...f,priceCents: Number(e.target.value||0)}))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-bca-gray-300 mb-2">Language</label>
              <select
                className="w-full px-3 py-2 rounded-lg bg-bca-gray-700 border border-bca-gray-600 text-white focus:outline-none focus:border-bca-gold"
                value={form.language}
                onChange={e=>setForm(f=>({...f,language: e.target.value}))}
              >
                <option value="bengali">Bengali</option>
                <option value="hindi">Hindi</option>
                <option value="english">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-bca-gray-300 mb-2">Star Rating</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                placeholder="4.8"
                className="w-full px-3 py-2 rounded-lg bg-bca-gray-700 border border-bca-gray-600 text-white focus:outline-none focus:border-bca-gold"
                value={form.starRating}
                onChange={e=>setForm(f=>({...f,starRating: Number(e.target.value||0)}))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-bca-gray-300 mb-2">Number of Students</label>
              <input
                type="number"
                placeholder="0"
                className="w-full px-3 py-2 rounded-lg bg-bca-gray-700 border border-bca-gray-600 text-white focus:outline-none focus:border-bca-gold"
                value={form.numberOfStudents}
                onChange={e=>setForm(f=>({...f,numberOfStudents: Number(e.target.value||0)}))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-bca-gray-300 mb-2">Number of Lectures</label>
              <input
                type="number"
                placeholder="0"
                className="w-full px-3 py-2 rounded-lg bg-bca-gray-700 border border-bca-gray-600 text-white focus:outline-none focus:border-bca-gold"
                value={form.numberOfLectures}
                onChange={e=>setForm(f=>({...f,numberOfLectures: Number(e.target.value||0)}))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-bca-gray-300 mb-2">Number of Modules</label>
              <input
                type="number"
                placeholder="0"
                className="w-full px-3 py-2 rounded-lg bg-bca-gray-700 border border-bca-gray-600 text-white focus:outline-none focus:border-bca-gold"
                value={form.numberOfModules}
                onChange={e=>setForm(f=>({...f,numberOfModules: Number(e.target.value||0)}))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-bca-gray-300 mb-2">Start Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 rounded-lg bg-bca-gray-700 border border-bca-gray-600 text-white focus:outline-none focus:border-bca-gold"
                value={form.startDate}
                onChange={e=>setForm(f=>({...f,startDate: e.target.value}))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-bca-gray-300 mb-2">End Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 rounded-lg bg-bca-gray-700 border border-bca-gray-600 text-white focus:outline-none focus:border-bca-gold"
                value={form.endDate}
                onChange={e=>setForm(f=>({...f,endDate: e.target.value}))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-bca-gray-300 mb-2">Short Description</label>
              <textarea
                placeholder="Brief course description"
                className="w-full px-3 py-2 rounded-lg bg-bca-gray-700 border border-bca-gray-600 text-white focus:outline-none focus:border-bca-gold"
                value={form.shortDesc}
                onChange={e=>setForm(f=>({...f,shortDesc: e.target.value}))}
                rows={2}
              />
            </div>
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
        </div>

        {/* About Course - CKEditor */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">About Course</h3>
          <div className="bg-bca-gray-700 rounded-lg">
            <CKEditor
              editor={ClassicEditor}
              data={form.aboutCourse}
              onChange={(event, editor) => {
                const data = editor.getData();
                setForm(prev => ({ ...prev, aboutCourse: data }));
              }}
              config={{
                toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'outdent', 'indent', '|', 'blockQuote', 'insertTable', 'undo', 'redo'],
                placeholder: 'Enter detailed course description...'
              }}
            />
          </div>
        </div>

        {/* Long Description */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Long Description</h3>
          <div className="bg-bca-gray-700 rounded-lg">
            <CKEditor
              editor={ClassicEditor}
              data={form.longDesc}
              onChange={(event, editor) => {
                const data = editor.getData();
                setForm(prev => ({ ...prev, longDesc: data }));
              }}
              config={{
                toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'outdent', 'indent', '|', 'blockQuote', 'insertTable', 'undo', 'redo'],
                placeholder: 'Enter detailed course content...'
              }}
            />
          </div>
        </div>

        {/* Course Modules */}
        <div className="mb-6">
          <button
            onClick={() => setShowModules(!showModules)}
            className="px-4 py-2 bg-bca-cyan/20 text-bca-cyan rounded-lg hover:bg-bca-cyan/30 transition-colors mb-4"
          >
            {showModules ? 'Hide' : 'Manage'} Modules ({form.modules.length})
          </button>
          
          {showModules && (
            <div className="p-4 bg-bca-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-3">Course Modules</h3>
              
              {/* Existing Modules */}
              {form.modules.map((module, index) => (
                <div key={index} className="mb-4 p-4 bg-bca-gray-600 rounded-lg border border-bca-gray-500">
                  <div className="grid md:grid-cols-5 gap-4 items-start">
                    {/* Module Name (Key) */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-bca-gray-300 mb-2">Module Name (Key)</label>
                      <input
                        type="text"
                        placeholder="e.g., C++ Basics"
                        className="w-full px-3 py-2 rounded-lg bg-bca-gray-500 border border-bca-gray-400 text-white focus:outline-none focus:border-bca-gold"
                        value={module.name}
                        onChange={e => updateModule(index, 'name', e.target.value)}
                      />
                    </div>
                    
                    {/* Module Content Preview (Value) */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-bca-gray-300 mb-2">Content Preview</label>
                      <div className="w-full px-3 py-2 rounded-lg bg-bca-gray-500 border border-bca-gray-400 text-bca-gray-300 text-sm min-h-[42px] flex items-center">
                        {module.content ? (
                          <span className="truncate">
                            {module.content.replace(/<[^>]*>/g, '').substring(0, 50)}...
                          </span>
                        ) : (
                          <span className="text-bca-gray-500">No content added yet</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="md:col-span-1 flex gap-2">
                      <button
                        onClick={() => setEditingModule(index)}
                        className="px-3 py-2 bg-bca-cyan/20 text-bca-cyan rounded-lg hover:bg-bca-cyan/30 transition-colors text-sm"
                      >
                        Edit Content
                      </button>
                      <button
                        onClick={() => removeModule(index)}
                        className="px-3 py-2 bg-bca-red/20 text-bca-red rounded-lg hover:bg-bca-red/30 transition-colors text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  
                  {/* Full Content Editor (shown when editing) */}
                  {editingModule === index && (
                    <div className="mt-4 pt-4 border-t border-bca-gray-500">
                      <label className="block text-sm font-medium text-bca-gray-300 mb-2">Module Content</label>
                      <div className="bg-bca-gray-500 rounded-lg">
                        <CKEditor
                          editor={ClassicEditor}
                          data={module.content}
                          onChange={(event, editor) => {
                            const data = editor.getData();
                            updateModule(index, 'content', data);
                          }}
                          config={{
                            toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'outdent', 'indent', '|', 'blockQuote', 'insertTable', 'undo', 'redo'],
                            placeholder: 'Enter module content...'
                          }}
                        />
                      </div>
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={() => setEditingModule(null)}
                          className="px-3 py-1 bg-bca-gray-500 text-white rounded hover:bg-bca-gray-400 transition-colors text-sm"
                        >
                          Done Editing
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Add New Module Button */}
              <div className="text-center">
                <button
                  onClick={addModule}
                  className="px-6 py-3 bg-bca-gold/20 text-bca-gold rounded-lg hover:bg-bca-gold/30 transition-colors font-medium"
                >
                  + Add New Module
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Course Includes */}
        <div className="mb-6">
          <button
            onClick={() => setShowIncludes(!showIncludes)}
            className="px-4 py-2 bg-bca-cyan/20 text-bca-cyan rounded-lg hover:bg-bca-cyan/30 transition-colors mb-4"
          >
            {showIncludes ? 'Hide' : 'Manage'} Course Includes ({form.courseIncludes.length})
          </button>
          
          {showIncludes && (
            <div className="p-4 bg-bca-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-3">What This Course Includes</h3>
              {form.courseIncludes.map((include, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Course inclusion (e.g., '100+ hours Video Content')"
                    className="flex-1 px-3 py-2 rounded-lg bg-bca-gray-600 border border-bca-gray-500 text-white focus:outline-none focus:border-bca-gold"
                    value={include}
                    onChange={e => updateInclude(index, e.target.value)}
                  />
                  <button
                    onClick={() => removeInclude(index)}
                    className="px-3 py-2 bg-bca-red/20 text-bca-red rounded-lg hover:bg-bca-red/30 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={addInclude}
                className="px-4 py-2 bg-bca-gold/20 text-bca-gold rounded-lg hover:bg-bca-gold/30 transition-colors"
              >
                Add Inclusion
              </button>
            </div>
          )}
        </div>

        {/* Testimonials */}
        <div className="mb-6">
          <button
            onClick={() => setShowTestimonials(!showTestimonials)}
            className="px-4 py-2 bg-bca-cyan/20 text-bca-cyan rounded-lg hover:bg-bca-cyan/30 transition-colors mb-4"
          >
            {showTestimonials ? 'Hide' : 'Manage'} Testimonials ({testimonials.length})
          </button>
          
          {showTestimonials && (
            <div className="p-4 bg-bca-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-3">Course Testimonials</h3>
              {testimonials.map((testimonial, index) => (
                <div key={index} className="mb-4 p-4 bg-bca-gray-600 rounded-lg">
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-bca-gray-300 mb-2">Student Name</label>
                      <input
                        type="text"
                        placeholder="Student Name"
                        className="w-full px-3 py-2 rounded-lg bg-bca-gray-500 border border-bca-gray-400 text-white focus:outline-none focus:border-bca-gold"
                        value={testimonial.studentName}
                        onChange={e => updateTestimonial(index, 'studentName', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-bca-gray-300 mb-2">Rating</label>
                      <select
                        className="w-full px-3 py-2 rounded-lg bg-bca-gray-500 border border-bca-gray-400 text-white focus:outline-none focus:border-bca-gold"
                        value={testimonial.rating}
                        onChange={e => updateTestimonial(index, 'rating', parseInt(e.target.value))}
                      >
                        <option value={1}>1 Star</option>
                        <option value={2}>2 Stars</option>
                        <option value={3}>3 Stars</option>
                        <option value={4}>4 Stars</option>
                        <option value={5}>5 Stars</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-bca-gray-300 mb-2">Student Image</label>
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handleTestimonialImageChange(index, e.target.files?.[0] || null)}
                          className="w-full px-3 py-2 rounded-lg bg-bca-gray-500 border border-bca-gray-400 text-white focus:outline-none focus:border-bca-gold"
                        />
                        <input
                          type="url"
                          placeholder="Or enter image URL directly"
                          className="w-full px-3 py-2 rounded-lg bg-bca-gray-500 border border-bca-gray-400 text-white focus:outline-none focus:border-bca-gold"
                          value={testimonial.studentImage}
                          onChange={e => updateTestimonial(index, 'studentImage', e.target.value)}
                        />
                        {testimonialImages[index] && (
                          <div className="text-xs text-green-400">
                            ✓ File selected: {testimonialImages[index].name}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-bca-gray-300 mb-2">About Student</label>
                      <input
                        type="text"
                        placeholder="About the student"
                        className="w-full px-3 py-2 rounded-lg bg-bca-gray-500 border border-bca-gray-400 text-white focus:outline-none focus:border-bca-gold"
                        value={testimonial.studentAbout}
                        onChange={e => updateTestimonial(index, 'studentAbout', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-bca-gray-300 mb-2">Testimonial Comment</label>
                    <textarea
                      placeholder="What the student said about the course"
                      className="w-full px-3 py-2 rounded-lg bg-bca-gray-500 border border-bca-gray-400 text-white focus:outline-none focus:border-bca-gold"
                      value={testimonial.comment}
                      onChange={e => updateTestimonial(index, 'comment', e.target.value)}
                      rows={3}
                    />
                  </div>
                  <button
                    onClick={() => removeTestimonial(index)}
                    className="px-3 py-2 bg-bca-red/20 text-bca-red rounded-lg hover:bg-bca-red/30 transition-colors"
                  >
                    Remove Testimonial
                  </button>
                </div>
              ))}
              <button
                onClick={addTestimonial}
                className="px-4 py-2 bg-bca-gold/20 text-bca-gold rounded-lg hover:bg-bca-gold/30 transition-colors"
              >
                Add Testimonial
              </button>
            </div>
          )}
        </div>

        {/* Coupons */}
        <div className="mb-6">
          <button
            onClick={() => setShowCoupons(!showCoupons)}
            className="px-4 py-2 bg-bca-cyan/20 text-bca-cyan rounded-lg hover:bg-bca-cyan/30 transition-colors mb-4"
          >
            {showCoupons ? 'Hide' : 'Manage'} Coupons ({form.coupons.length})
          </button>
          
          {showCoupons && (
            <div className="p-4 bg-bca-gray-700 rounded-lg">
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
        </div>
        
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
