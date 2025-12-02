'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Upload, X, Image as ImageIcon } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(null);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data || []);
    } catch (error) {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: editingCategory ? formData.slug : generateSlug(name)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, formData);
        toast.success('Category updated');
      } else {
        await api.post('/categories', formData);
        toast.success('Category created');
      }
      
      setShowModal(false);
      setEditingCategory(null);
      setFormData({ name: '', slug: '', description: '' });
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save category');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      await api.delete(`/categories/${categoryId}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete category');
    }
  };

  const handleImageUpload = async (categoryId, file) => {
    setUploadingImage(categoryId);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      await api.post(`/categories/${categoryId}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Image uploaded');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(null);
    }
  };

  const handleDeleteImage = async (categoryId) => {
    if (!confirm('Delete this image?')) return;
    
    try {
      await api.delete(`/categories/${categoryId}/image`);
      toast.success('Image deleted');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete image');
    }
  };

  const openFilePicker = (categoryId) => {
    fileInputRef.current.dataset.categoryId = categoryId;
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const categoryId = e.target.dataset.categoryId;
    
    if (file && categoryId) {
      handleImageUpload(categoryId, file);
    }
    
    e.target.value = '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-light tracking-wide">Categories</h1>
        <button
          onClick={() => {
            setEditingCategory(null);
            setFormData({ name: '', slug: '', description: '' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-focus text-white text-sm hover:bg-gold transition-colors"
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <div key={category._id} className="bg-white border border-primary-200 overflow-hidden">
            {/* Image Section */}
            <div className="relative aspect-square bg-primary-100 overflow-hidden">
              {category.image ? (
                <>
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleDeleteImage(category._id)}
                    className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted">
                  <ImageIcon size={48} strokeWidth={1} />
                  <p className="text-sm mt-2">No Image</p>
                </div>
              )}
              
              {/* Upload Button */}
              <button
                onClick={() => openFilePicker(category._id)}
                disabled={uploadingImage === category._id}
                className="absolute bottom-2 right-2 w-10 h-10 bg-focus text-white rounded-full flex items-center justify-center hover:bg-gold transition-colors disabled:opacity-50"
              >
                {uploadingImage === category._id ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <Upload size={18} />
                )}
              </button>
            </div>

            {/* Info Section */}
            <div className="p-4">
              <h3 className="font-medium text-lg mb-1">{category.name}</h3>
              <p className="text-sm text-muted mb-2">/{category.slug}</p>
              {category.description && (
                <p className="text-sm text-muted line-clamp-2">{category.description}</p>
              )}
              
              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-primary-100">
                <button
                  onClick={() => handleEdit(category)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 text-sm border border-primary-300 hover:border-focus transition-colors"
                >
                  <Edit size={14} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(category._id)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 text-sm border border-primary-300 hover:border-red-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-16 text-muted">
          <p>No categories yet. Create your first category.</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-light">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-focus">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleNameChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows={3}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-primary-300 text-sm hover:border-focus transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-focus text-white text-sm hover:bg-gold transition-colors"
                >
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
