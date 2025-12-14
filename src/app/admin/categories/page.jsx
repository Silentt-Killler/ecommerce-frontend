'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  
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
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
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
    if (!confirm('Delete this category?')) return;
    
    try {
      await api.delete(`/categories/${categoryId}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete category');
    }
  };

  const openImageModal = (category) => {
    setSelectedCategory(category);
    setImageUrl(category.image || '');
    setShowImageModal(true);
  };

  const handleSaveImage = async () => {
    if (!selectedCategory) return;
    
    try {
      await api.put(`/categories/${selectedCategory._id}`, { image: imageUrl || null });
      toast.success('Image updated');
      setShowImageModal(false);
      fetchCategories();
    } catch (error) {
      toast.error('Failed to update image');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-white">Categories</h1>
        <button
          onClick={() => {
            setEditingCategory(null);
            setFormData({ name: '', slug: '', description: '' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <div key={category._id} className="bg-[#232a3b] rounded-lg overflow-hidden">
            {/* Image */}
            <div className="relative aspect-square bg-gray-700">
              {category.image ? (
                <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                  <ImageIcon size={32} />
                  <p className="text-xs mt-1">No Image</p>
                </div>
              )}
              <button
                onClick={() => openImageModal(category)}
                className="absolute bottom-2 right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700"
              >
                <LinkIcon size={14} />
              </button>
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="text-white font-medium">{category.name}</h3>
              <p className="text-gray-500 text-xs">/{category.slug}</p>
              
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(category)}
                  className="flex-1 py-2 text-xs text-gray-400 border border-gray-600 rounded hover:text-white hover:border-gray-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(category._id)}
                  className="flex-1 py-2 text-xs text-gray-400 border border-gray-600 rounded hover:text-red-400 hover:border-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[#232a3b] w-full max-w-md rounded-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-lg font-medium text-white">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full px-4 py-3 bg-[#1a1f2e] border border-gray-700 rounded text-white focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1a1f2e] border border-gray-700 rounded text-white focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1a1f2e] border border-gray-700 rounded text-white focus:border-blue-500 outline-none resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 text-gray-400 border border-gray-600 rounded hover:border-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image URL Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[#232a3b] w-full max-w-md rounded-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-lg font-medium text-white">Category Image</h2>
              <button onClick={() => setShowImageModal(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://res.cloudinary.com/..."
                  className="w-full px-4 py-3 bg-[#1a1f2e] border border-gray-700 rounded text-white focus:border-blue-500 outline-none"
                />
              </div>

              {imageUrl && (
                <div className="aspect-square bg-gray-700 rounded overflow-hidden max-w-[150px]">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowImageModal(false)}
                  className="flex-1 py-3 text-gray-400 border border-gray-600 rounded hover:border-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveImage}
                  className="flex-1 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
