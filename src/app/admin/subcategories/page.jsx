'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, GripVertical, Package, Eye, EyeOff, Image as ImageIcon } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

// Available Lucide icons for subcategories
const AVAILABLE_ICONS = [
  'Package', 'Shirt', 'Watch', 'Gem', 'Crown', 'Glasses', 'Footprints',
  'ShoppingBag', 'Briefcase', 'Heart', 'Star', 'Sparkles', 'Palette',
  'Scissors', 'Umbrella', 'Gift', 'Tag', 'Bookmark', 'Circle'
];

// Parent categories
const PARENT_CATEGORIES = [
  { slug: 'watch', name: 'Watch' },
  { slug: 'menswear', name: 'Menswear' },
  { slug: 'womenswear', name: 'Womenswear' },
  { slug: 'accessories', name: 'Accessories' },
  { slug: 'beauty', name: 'Beauty' }
];

export default function AdminSubcategoriesPage() {
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    parent_category: 'menswear',
    image_url: '',
    icon: 'Package',
    description: '',
    is_active: true,
    sort_order: 0
  });

  useEffect(() => {
    fetchSubcategories();
  }, [activeFilter]);

  const fetchSubcategories = async () => {
    try {
      setLoading(true);
      const params = activeFilter !== 'all' ? `?parent=${activeFilter}` : '';
      const res = await api.get(`/subcategories${params}`);
      setSubcategories(res.data.subcategories || []);
    } catch (error) {
      console.error('Failed to fetch subcategories:', error);
      toast.error('Failed to load subcategories');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: editingId ? formData.slug : generateSlug(name)
    });
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      slug: '',
      parent_category: activeFilter !== 'all' ? activeFilter : 'menswear',
      image_url: '',
      icon: 'Package',
      description: '',
      is_active: true,
      sort_order: subcategories.length
    });
    setShowModal(true);
  };

  const openEditModal = (subcategory) => {
    setEditingId(subcategory._id);
    setFormData({
      name: subcategory.name || '',
      slug: subcategory.slug || '',
      parent_category: subcategory.parent_category || 'menswear',
      image_url: subcategory.image_url || '',
      icon: subcategory.icon || 'Package',
      description: subcategory.description || '',
      is_active: subcategory.is_active ?? true,
      sort_order: subcategory.sort_order || 0
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.slug.trim()) {
      toast.error('Name and slug are required');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/subcategories/${editingId}`, formData);
        toast.success('Subcategory updated');
      } else {
        await api.post('/subcategories', formData);
        toast.success('Subcategory created');
      }
      setShowModal(false);
      fetchSubcategories();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save subcategory');
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This action cannot be undone.`)) return;

    try {
      await api.delete(`/subcategories/${id}`);
      toast.success('Subcategory deleted');
      fetchSubcategories();
    } catch (error) {
      toast.error('Failed to delete subcategory');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.put(`/subcategories/${id}/toggle-status`);
      toast.success('Status updated');
      fetchSubcategories();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getParentName = (slug) => {
    return PARENT_CATEGORIES.find(c => c.slug === slug)?.name || slug;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <div style={{ width: 40, height: 40, border: '3px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Subcategories</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Manage product subcategories for filtering</p>
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
          Add Subcategory
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveFilter('all')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeFilter === 'all' ? '#3b82f6' : '#1f2937',
            color: '#fff',
            fontSize: 13,
            fontWeight: 500,
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer'
          }}
        >
          All
        </button>
        {PARENT_CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setActiveFilter(cat.slug)}
            style={{
              padding: '10px 20px',
              backgroundColor: activeFilter === cat.slug ? '#3b82f6' : '#1f2937',
              color: '#fff',
              fontSize: 13,
              fontWeight: 500,
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Subcategories Grid */}
      {subcategories.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {subcategories.map((subcategory) => (
            <div
              key={subcategory._id}
              style={{
                backgroundColor: '#1f2937',
                borderRadius: 16,
                overflow: 'hidden',
                opacity: subcategory.is_active ? 1 : 0.6
              }}
            >
              {/* Image/Icon Preview */}
              <div style={{
                height: 140,
                backgroundColor: '#374151',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                {subcategory.image_url ? (
                  <img
                    src={subcategory.image_url}
                    alt={subcategory.name}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid #4b5563'
                    }}
                  />
                ) : (
                  <div style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: '#4b5563',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Package size={32} style={{ color: '#9ca3af' }} />
                  </div>
                )}

                {/* Status Badge */}
                <div style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  padding: '4px 10px',
                  backgroundColor: subcategory.is_active ? '#059669' : '#6b7280',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 600,
                  borderRadius: 20
                }}>
                  {subcategory.is_active ? 'Active' : 'Inactive'}
                </div>
              </div>

              {/* Info */}
              <div style={{ padding: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 4 }}>
                  {subcategory.name}
                </h3>
                <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
                  /{subcategory.slug}
                </p>
                <div style={{
                  display: 'inline-block',
                  padding: '4px 10px',
                  backgroundColor: '#374151',
                  color: '#9ca3af',
                  fontSize: 11,
                  fontWeight: 500,
                  borderRadius: 6
                }}>
                  {getParentName(subcategory.parent_category)}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button
                    onClick={() => handleToggleStatus(subcategory._id)}
                    style={{
                      flex: 1,
                      padding: 10,
                      backgroundColor: '#374151',
                      color: subcategory.is_active ? '#fbbf24' : '#10b981',
                      fontSize: 13,
                      fontWeight: 500,
                      borderRadius: 8,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    {subcategory.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                    {subcategory.is_active ? 'Hide' : 'Show'}
                  </button>
                  <button
                    onClick={() => openEditModal(subcategory)}
                    style={{
                      padding: 10,
                      backgroundColor: '#374151',
                      color: '#3b82f6',
                      borderRadius: 8,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex'
                    }}
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(subcategory._id, subcategory.name)}
                    style={{
                      padding: 10,
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
        <div style={{
          backgroundColor: '#1f2937',
          borderRadius: 16,
          padding: 80,
          textAlign: 'center'
        }}>
          <Package size={48} style={{ color: '#4b5563', marginBottom: 16 }} />
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 8 }}>
            No Subcategories Found
          </h3>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>
            {activeFilter !== 'all' 
              ? `No subcategories in ${getParentName(activeFilter)}` 
              : 'Create your first subcategory to get started'}
          </p>
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
            Add Subcategory
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: 20
        }}>
          <div style={{
            backgroundColor: '#1f2937',
            borderRadius: 20,
            width: '100%',
            maxWidth: 500,
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 24,
              borderBottom: '1px solid #374151'
            }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>
                {editingId ? 'Edit Subcategory' : 'Add Subcategory'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: 8,
                  backgroundColor: '#374151',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex'
                }}
              >
                <X size={20} style={{ color: '#9ca3af' }} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} style={{ padding: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                
                {/* Name */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 8 }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="e.g. Formal Shirt"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: '#374151',
                      border: '1px solid #4b5563',
                      borderRadius: 10,
                      color: '#fff',
                      fontSize: 14,
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Slug */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 8 }}>
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. formal-shirt"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: '#374151',
                      border: '1px solid #4b5563',
                      borderRadius: 10,
                      color: '#fff',
                      fontSize: 14,
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Parent Category */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 8 }}>
                    Parent Category *
                  </label>
                  <select
                    value={formData.parent_category}
                    onChange={(e) => setFormData({ ...formData, parent_category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: '#374151',
                      border: '1px solid #4b5563',
                      borderRadius: 10,
                      color: '#fff',
                      fontSize: 14,
                      outline: 'none'
                    }}
                  >
                    {PARENT_CATEGORIES.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Image URL */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 8 }}>
                    Image URL (Optional - 200x200px recommended)
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: '#374151',
                      border: '1px solid #4b5563',
                      borderRadius: 10,
                      color: '#fff',
                      fontSize: 14,
                      outline: 'none'
                    }}
                  />
                  {formData.image_url && (
                    <div style={{ marginTop: 12, textAlign: 'center' }}>
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid #4b5563'
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Icon (Fallback) */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 8 }}>
                    Icon (Fallback if no image)
                  </label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: '#374151',
                      border: '1px solid #4b5563',
                      borderRadius: 10,
                      color: '#fff',
                      fontSize: 14,
                      outline: 'none'
                    }}
                  >
                    {AVAILABLE_ICONS.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 8 }}>
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: '#374151',
                      border: '1px solid #4b5563',
                      borderRadius: 10,
                      color: '#fff',
                      fontSize: 14,
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* Active Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    style={{ width: 18, height: 18, accentColor: '#3b82f6' }}
                  />
                  <label htmlFor="is_active" style={{ fontSize: 14, color: '#fff' }}>
                    Active (visible on website)
                  </label>
                </div>

              </div>

              {/* Submit Button */}
              <div style={{ marginTop: 32 }}>
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '14px',
                    backgroundColor: '#3b82f6',
                    color: '#fff',
                    fontSize: 15,
                    fontWeight: 600,
                    borderRadius: 10,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {editingId ? 'Update Subcategory' : 'Create Subcategory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
