'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, FolderOpen, Image as ImageIcon, ChevronDown, ChevronRight, Eye, EyeOff, Layers } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState(null);
  
  // Category Modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', description: '', image: '', url: '' });
  
  // Subcategory Modal
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [subcategoryForm, setSubcategoryForm] = useState({ 
    name: '', slug: '', parent_category: '', image_url: '', description: '', is_active: true 
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catRes, subRes] = await Promise.all([
        api.get('/categories'),
        api.get('/subcategories')
      ]);
      setCategories(catRes.data || []);
      setSubcategories(subRes.data.subcategories || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
  };

  // Get subcategories for a category
  const getCategorySubcategories = (categorySlug) => {
    return subcategories.filter(sub => sub.parent_category === categorySlug);
  };

  // ========== CATEGORY FUNCTIONS ==========
  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', slug: '', description: '', image: '', url: '' });
    setShowCategoryModal(true);
  };

  const openEditCategoryModal = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      image: category.image || '',
      url: category.url || ''
    });
    setShowCategoryModal(true);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim() || !categoryForm.slug.trim()) {
      toast.error('Name and slug are required');
      return;
    }

    try {
      if (editingCategory) {
        await api.put('/categories/' + editingCategory._id, categoryForm);
        toast.success('Category updated');
      } else {
        await api.post('/categories', categoryForm);
        toast.success('Category created');
      }
      setShowCategoryModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save category');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Delete this category and all its subcategories?')) return;
    try {
      await api.delete('/categories/' + categoryId);
      toast.success('Category deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  // ========== SUBCATEGORY FUNCTIONS ==========
  const openAddSubcategoryModal = (parentSlug) => {
    setEditingSubcategory(null);
    setSubcategoryForm({ 
      name: '', slug: '', parent_category: parentSlug, image_url: '', description: '', is_active: true 
    });
    setShowSubcategoryModal(true);
  };

  const openEditSubcategoryModal = (subcategory) => {
    setEditingSubcategory(subcategory);
    setSubcategoryForm({
      name: subcategory.name || '',
      slug: subcategory.slug || '',
      parent_category: subcategory.parent_category || '',
      image_url: subcategory.image_url || '',
      description: subcategory.description || '',
      is_active: subcategory.is_active ?? true
    });
    setShowSubcategoryModal(true);
  };

  const handleSubcategorySubmit = async (e) => {
    e.preventDefault();
    if (!subcategoryForm.name.trim() || !subcategoryForm.slug.trim()) {
      toast.error('Name and slug are required');
      return;
    }

    try {
      if (editingSubcategory) {
        await api.put('/subcategories/' + editingSubcategory._id, subcategoryForm);
        toast.success('Subcategory updated');
      } else {
        await api.post('/subcategories', subcategoryForm);
        toast.success('Subcategory created');
      }
      setShowSubcategoryModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save subcategory');
    }
  };

  const handleDeleteSubcategory = async (id, name) => {
    if (!confirm('Delete "' + name + '"?')) return;
    try {
      await api.delete('/subcategories/' + id);
      toast.success('Subcategory deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete subcategory');
    }
  };

  const handleToggleSubcategoryStatus = async (id) => {
    try {
      await api.put('/subcategories/' + id + '/toggle-status');
      toast.success('Status updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <div style={{ width: 40, height: 40, border: '3px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Categories & Subcategories</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Manage product categories and their subcategories</p>
        </div>
        <button
          onClick={openAddCategoryModal}
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

      {/* Categories List */}
      {categories.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {categories.map((category) => {
            const catSubcategories = getCategorySubcategories(category.slug);
            const isExpanded = expandedCategory === category._id;
            
            return (
              <div key={category._id} style={{ backgroundColor: '#1f2937', borderRadius: 16, overflow: 'hidden' }}>
                {/* Category Header */}
                <div 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: 20,
                    cursor: 'pointer',
                    borderBottom: isExpanded ? '1px solid #374151' : 'none'
                  }}
                  onClick={() => setExpandedCategory(isExpanded ? null : category._id)}
                >
                  {/* Expand Icon */}
                  <div style={{ marginRight: 16 }}>
                    {isExpanded ? <ChevronDown size={20} style={{ color: '#9ca3af' }} /> : <ChevronRight size={20} style={{ color: '#9ca3af' }} />}
                  </div>

                  {/* Category Image */}
                  <div style={{ 
                    width: 60, height: 60, borderRadius: 12, backgroundColor: '#374151', 
                    marginRight: 16, overflow: 'hidden', flexShrink: 0 
                  }}>
                    {category.image ? (
                      <img src={category.image} alt={category.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ImageIcon size={24} style={{ color: '#6b7280' }} />
                      </div>
                    )}
                  </div>

                  {/* Category Info */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{category.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 13, color: '#3b82f6' }}>/{category.slug}</span>
                      <span style={{ fontSize: 12, color: '#6b7280' }}>•</span>
                      <span style={{ fontSize: 13, color: '#6b7280' }}>{catSubcategories.length} subcategories</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8 }} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openAddSubcategoryModal(category.slug)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px',
                        backgroundColor: '#10b981', color: '#fff', fontSize: 12, fontWeight: 500,
                        borderRadius: 8, border: 'none', cursor: 'pointer'
                      }}
                    >
                      <Layers size={14} />
                      Add Sub
                    </button>
                    <button
                      onClick={() => openEditCategoryModal(category)}
                      style={{
                        padding: 10, backgroundColor: '#374151', color: '#fff',
                        borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex'
                      }}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category._id)}
                      style={{
                        padding: 10, backgroundColor: '#374151', color: '#ef4444',
                        borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Subcategories (Expanded) */}
                {isExpanded && (
                  <div style={{ padding: '16px 20px', backgroundColor: '#111827' }}>
                    {catSubcategories.length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
                        {catSubcategories.map((sub) => (
                          <div 
                            key={sub._id} 
                            style={{ 
                              display: 'flex', alignItems: 'center', padding: 12,
                              backgroundColor: '#1f2937', borderRadius: 10,
                              border: '1px solid #374151',
                              opacity: sub.is_active ? 1 : 0.5
                            }}
                          >
                            {/* Subcategory Image */}
                            <div style={{ 
                              width: 40, height: 40, borderRadius: '50%', backgroundColor: '#374151', 
                              marginRight: 12, overflow: 'hidden', flexShrink: 0 
                            }}>
                              {sub.image_url ? (
                                <img src={sub.image_url} alt={sub.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <FolderOpen size={16} style={{ color: '#6b7280' }} />
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 2 }}>{sub.name}</p>
                              <p style={{ fontSize: 11, color: '#6b7280' }}>/{sub.slug}</p>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button
                                onClick={() => handleToggleSubcategoryStatus(sub._id)}
                                style={{ padding: 6, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}
                                title={sub.is_active ? 'Hide' : 'Show'}
                              >
                                {sub.is_active ? <Eye size={14} style={{ color: '#10b981' }} /> : <EyeOff size={14} style={{ color: '#6b7280' }} />}
                              </button>
                              <button
                                onClick={() => openEditSubcategoryModal(sub)}
                                style={{ padding: 6, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}
                              >
                                <Edit size={14} style={{ color: '#9ca3af' }} />
                              </button>
                              <button
                                onClick={() => handleDeleteSubcategory(sub._id, sub.name)}
                                style={{ padding: 6, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}
                              >
                                <Trash2 size={14} style={{ color: '#ef4444' }} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '24px 0' }}>
                        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 12 }}>No subcategories yet</p>
                        <button
                          onClick={() => openAddSubcategoryModal(category.slug)}
                          style={{
                            padding: '8px 16px', backgroundColor: '#374151', color: '#fff',
                            fontSize: 13, fontWeight: 500, borderRadius: 8, border: 'none', cursor: 'pointer'
                          }}
                        >
                          Add First Subcategory
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ backgroundColor: '#1f2937', borderRadius: 16, padding: 80, textAlign: 'center' }}>
          <FolderOpen size={64} style={{ color: '#374151', margin: '0 auto 16px' }} />
          <p style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 8 }}>No categories yet</p>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>Add your first category to organize products</p>
          <button
            onClick={openAddCategoryModal}
            style={{
              padding: '12px 24px', backgroundColor: '#3b82f6', color: '#fff',
              fontSize: 14, fontWeight: 600, borderRadius: 10, border: 'none', cursor: 'pointer'
            }}
          >
            Add Category
          </button>
        </div>
      )}

      {/* ========== CATEGORY MODAL ========== */}
      {showCategoryModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div style={{ width: '100%', maxWidth: 500, backgroundColor: '#1f2937', borderRadius: 20, maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 24, borderBottom: '1px solid #374151' }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: 0 }}>
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              <button onClick={() => setShowCategoryModal(false)} style={{ padding: 8, backgroundColor: '#374151', borderRadius: 8, border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} style={{ padding: 24 }}>
              {/* Name */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 8 }}>Name *</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ 
                    ...categoryForm, 
                    name: e.target.value, 
                    slug: editingCategory ? categoryForm.slug : generateSlug(e.target.value) 
                  })}
                  placeholder="e.g. Original Pakistani"
                  required
                  style={{ width: '100%', padding: 14, backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Slug */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 8 }}>Slug * <span style={{ fontSize: 12, color: '#6b7280' }}>(URL path)</span></label>
                <input
                  type="text"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  placeholder="e.g. original-pakistani"
                  required
                  style={{ width: '100%', padding: 14, backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* URL (Custom) */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 8 }}>Custom URL <span style={{ fontSize: 12, color: '#6b7280' }}>(optional)</span></label>
                <input
                  type="text"
                  value={categoryForm.url}
                  onChange={(e) => setCategoryForm({ ...categoryForm, url: e.target.value })}
                  placeholder="e.g. /original-pakistani"
                  style={{ width: '100%', padding: 14, backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
                <p style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>Leave empty to use: /{categoryForm.slug || 'slug'}</p>
              </div>

              {/* Image */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 8 }}>Image URL</label>
                <input
                  type="url"
                  value={categoryForm.image}
                  onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                  placeholder="https://..."
                  style={{ width: '100%', padding: 14, backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
                {categoryForm.image && (
                  <div style={{ marginTop: 12 }}>
                    <img src={categoryForm.image} alt="Preview" style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8 }} />
                  </div>
                )}
              </div>

              {/* Description */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 8 }}>Description</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Brief description..."
                  rows={3}
                  style={{ width: '100%', padding: 14, backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>

              <button type="submit" style={{ width: '100%', padding: 16, backgroundColor: '#3b82f6', color: '#fff', fontSize: 15, fontWeight: 600, borderRadius: 10, border: 'none', cursor: 'pointer' }}>
                {editingCategory ? 'Update Category' : 'Create Category'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========== SUBCATEGORY MODAL ========== */}
      {showSubcategoryModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div style={{ width: '100%', maxWidth: 500, backgroundColor: '#1f2937', borderRadius: 20, maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 24, borderBottom: '1px solid #374151' }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: 0 }}>
                {editingSubcategory ? 'Edit Subcategory' : 'Add Subcategory'}
              </h2>
              <button onClick={() => setShowSubcategoryModal(false)} style={{ padding: 8, backgroundColor: '#374151', borderRadius: 8, border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubcategorySubmit} style={{ padding: 24 }}>
              {/* Parent Category */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 8 }}>Parent Category *</label>
                <select
                  value={subcategoryForm.parent_category}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, parent_category: e.target.value })}
                  required
                  style={{ width: '100%', padding: 14, backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none' }}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Name */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 8 }}>Name *</label>
                <input
                  type="text"
                  value={subcategoryForm.name}
                  onChange={(e) => setSubcategoryForm({ 
                    ...subcategoryForm, 
                    name: e.target.value, 
                    slug: editingSubcategory ? subcategoryForm.slug : generateSlug(e.target.value) 
                  })}
                  placeholder="e.g. 3 Piece"
                  required
                  style={{ width: '100%', padding: 14, backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Slug */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 8 }}>Slug *</label>
                <input
                  type="text"
                  value={subcategoryForm.slug}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  placeholder="e.g. 3-piece"
                  required
                  style={{ width: '100%', padding: 14, backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Image */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 8 }}>Image URL <span style={{ fontSize: 12, color: '#6b7280' }}>(200x200px)</span></label>
                <input
                  type="url"
                  value={subcategoryForm.image_url}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, image_url: e.target.value })}
                  placeholder="https://..."
                  style={{ width: '100%', padding: 14, backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
                {subcategoryForm.image_url && (
                  <div style={{ marginTop: 12, textAlign: 'center' }}>
                    <img src={subcategoryForm.image_url} alt="Preview" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>

              {/* Active */}
              <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="checkbox"
                  id="sub_active"
                  checked={subcategoryForm.is_active}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, is_active: e.target.checked })}
                  style={{ width: 18, height: 18, accentColor: '#3b82f6' }}
                />
                <label htmlFor="sub_active" style={{ fontSize: 14, color: '#fff' }}>Active (visible on website)</label>
              </div>

              <button type="submit" style={{ width: '100%', padding: 16, backgroundColor: '#10b981', color: '#fff', fontSize: 15, fontWeight: 600, borderRadius: 10, border: 'none', cursor: 'pointer' }}>
                {editingSubcategory ? 'Update Subcategory' : 'Create Subcategory'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
