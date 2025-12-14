'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, FolderOpen, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '', image: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData({ ...formData, name, slug: editingCategory ? formData.slug : generateSlug(name) });
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
      setFormData({ name: '', slug: '', description: '', image: '' });
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
      description: category.description || '',
      image: category.image || ''
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

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', slug: '', description: '', image: '' });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <div style={{ width: 40, height: 40, border: '3px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Categories</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Manage product categories</p>
        </div>
        <button
          onClick={openAddModal}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 20px',
            backgroundColor: '#3b82f6',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            borderRadius: 10,
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      {/* Categories Grid */}
      {categories.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {categories.map((category) => (
            <div key={category._id} style={{ backgroundColor: '#1f2937', borderRadius: 16, overflow: 'hidden' }}>
              {/* Image */}
              <div style={{ 
                height: 160, 
                backgroundColor: '#374151',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {category.image ? (
                  <img src={category.image} alt={category.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <FolderOpen size={48} style={{ color: '#6b7280' }} />
                )}
              </div>

              {/* Content */}
              <div style={{ padding: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{category.name}</h3>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>/{category.slug}</p>
                
                {category.description && (
                  <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 16, lineHeight: 1.5 }}>
                    {category.description.length > 80 ? category.description.slice(0, 80) + '...' : category.description}
                  </p>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleEdit(category)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: 12,
                      backgroundColor: '#374151',
                      color: '#fff',
                      fontSize: 13,
                      fontWeight: 500,
                      borderRadius: 8,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category._id)}
                    style={{
                      padding: 12,
                      backgroundColor: '#374151',
                      color: '#ef4444',
                      borderRadius: 8,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex'
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ backgroundColor: '#1f2937', borderRadius: 16, padding: 80, textAlign: 'center' }}>
          <FolderOpen size={64} style={{ color: '#374151', margin: '0 auto 16px' }} />
          <p style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 8 }}>No categories yet</p>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>Add your first category to organize products</p>
          <button
            onClick={openAddModal}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              borderRadius: 10,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Add Category
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div style={{ width: '100%', maxWidth: 500, backgroundColor: '#1f2937', borderRadius: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 24, borderBottom: '1px solid #374151' }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ padding: 8, backgroundColor: '#374151', borderRadius: 8, border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: 24 }}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 8 }}>
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="e.g. Men's Watches"
                  required
                  style={{
                    width: '100%',
                    padding: 14,
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: 10,
                    color: '#fff',
                    fontSize: 14,
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 8 }}>
                  Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="mens-watches"
                  required
                  style={{
                    width: '100%',
                    padding: 14,
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: 10,
                    color: '#fff',
                    fontSize: 14,
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 8 }}>
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this category..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: 14,
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: 10,
                    color: '#fff',
                    fontSize: 14,
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 8 }}>
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://res.cloudinary.com/..."
                  style={{
                    width: '100%',
                    padding: 14,
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: 10,
                    color: '#fff',
                    fontSize: 14,
                    outline: 'none'
                  }}
                />
                {formData.image && (
                  <div style={{ marginTop: 12, height: 120, backgroundColor: '#374151', borderRadius: 10, overflow: 'hidden' }}>
                    <img src={formData.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: 14,
                    backgroundColor: '#374151',
                    color: '#9ca3af',
                    fontSize: 14,
                    fontWeight: 600,
                    borderRadius: 10,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: 14,
                    backgroundColor: '#3b82f6',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 600,
                    borderRadius: 10,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {editingCategory ? 'Update' : 'Create'} Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
