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

  const openImageModal = (category) => {
    setSelectedCategory(category);
    setImageUrl(category.image || '');
    setShowImageModal(true);
  };

  const handleSaveImage = async () => {
    if (!selectedCategory) return;

    try {
      await api.put(`/categories/${selectedCategory._id}`, {
        image: imageUrl || null
      });
      toast.success('Image updated');
      setShowImageModal(false);
      setSelectedCategory(null);
      setImageUrl('');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to update image');
    }
  };

  const handleRemoveImage = async (categoryId) => {
    if (!confirm('Remove this image?')) return;

    try {
      await api.put(`/categories/${categoryId}`, {
        image: null
      });
      toast.success('Image removed');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to remove image');
    }
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
                    onClick={() => handleRemoveImage(category._id)}
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

              {/* Add/Change Image Button */}
              <button
                onClick={() => openImageModal(category)}
                className="absolute bottom-2 right-2 w-10 h-10 bg-focus text-white rounded-full flex items-center justify-center hover:bg-gold transition-colors"
                title="Add/Change Image URL"
              >
                <LinkIcon size={18} />
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

      {/* Add/Edit Category Modal */}
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

      {/* Image URL Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-light">
                {selectedCategory?.image ? 'Change Image' : 'Add Image'}
              </h2>
              <button onClick={() => setShowImageModal(false)} className="text-muted hover:text-focus">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://res.cloudinary.com/..."
                  className="input-field"
                />
                <p className="text-xs text-muted mt-2">
                  Cloudinary তে image upload করে URL paste করো
                </p>
              </div>

              {/* Preview */}
              {imageUrl && (
                <div className="mt-4">
                  <label className="block text-sm mb-2">Preview</label>
                  <div className="aspect-square bg-primary-100 overflow-hidden max-w-[200px]">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowImageModal(false)}
                  className="flex-1 py-3 border border-primary-300 text-sm hover:border-focus transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveImage}
                  className="flex-1 py-3 bg-focus text-white text-sm hover:bg-gold transition-colors"
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