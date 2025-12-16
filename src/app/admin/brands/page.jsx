'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Tag, Search, Filter } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo: '',
    description: '',
    category_slug: '',
    is_active: true
  });

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const res = await api.get('/brands');
      setBrands(res.data || []);
    } catch (error) {
      console.error('Failed to fetch brands:', error);
      toast.error('Failed to load brands');
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
      slug: generateSlug(name)
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      logo: '',
      description: '',
      category_slug: '',
      is_active: true
    });
    setEditingBrand(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      slug: brand.slug,
      logo: brand.logo || '',
      description: brand.description || '',
      category_slug: brand.category_slug,
      is_active: brand.is_active
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category_slug) {
      toast.error('Name and Category are required');
      return;
    }

    try {
      if (editingBrand) {
        await api.put(`/brands/${editingBrand._id}`, formData);
        toast.success('Brand updated successfully');
      } else {
        await api.post('/brands', formData);
        toast.success('Brand created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchBrands();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async (brand) => {
    if (!confirm(`Delete "${brand.name}"? This cannot be undone.`)) return;
    
    try {
      await api.delete(`/brands/${brand._id}`);
      toast.success('Brand deleted');
      fetchBrands();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete');
    }
  };

  // Filter brands
  const filteredBrands = brands.filter(brand => {
    const matchesCategory = filterCategory === 'all' || brand.category_slug === filterCategory;
    const matchesSearch = brand.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Group brands by category for display
  const getCategoryName = (slug) => {
    const cat = categories.find(c => c.slug === slug);
    return cat?.name || slug;
  };

  // Get category color
  const getCategoryColor = (slug) => {
    const colors = {
      watch: { bg: '#3b82f620', color: '#3b82f6' },
      menswear: { bg: '#10b98120', color: '#10b981' },
      womenswear: { bg: '#ec489920', color: '#ec4899' },
      accessories: { bg: '#f59e0b20', color: '#f59e0b' }
    };
    return colors[slug] || { bg: '#6b728020', color: '#6b7280' };
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Brands</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Manage product brands by category</p>
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
          Add Brand
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 20 }}>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Total Brands</p>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{brands.length}</p>
        </div>
        <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 20 }}>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Watch Brands</p>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#3b82f6' }}>
            {brands.filter(b => b.category_slug === 'watch').length}
          </p>
        </div>
        <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 20 }}>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Menswear Brands</p>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#10b981' }}>
            {brands.filter(b => b.category_slug === 'menswear').length}
          </p>
        </div>
        <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 20 }}>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Womenswear Brands</p>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#ec4899' }}>
            {brands.filter(b => b.category_slug === 'womenswear').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 16, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            <input
              type="text"
              placeholder="Search brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 40px',
                backgroundColor: '#111827',
                border: '1px solid #374151',
                borderRadius: 8,
                color: '#fff',
                fontSize: 14,
                outline: 'none'
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={18} style={{ color: '#6b7280' }} />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                padding: '10px 16px',
                backgroundColor: '#111827',
                border: '1px solid #374151',
                borderRadius: 8,
                color: '#fff',
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Brands Grid */}
      <div style={{ backgroundColor: '#1f2937', borderRadius: 16, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80 }}>
            <div style={{ width: 40, height: 40, border: '3px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : filteredBrands.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, padding: 20 }}>
            {filteredBrands.map((brand) => {
              const catColor = getCategoryColor(brand.category_slug);
              return (
                <div 
                  key={brand._id} 
                  style={{ 
                    backgroundColor: '#111827', 
                    borderRadius: 12, 
                    padding: 20,
                    border: '1px solid #374151',
                    transition: 'border-color 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {brand.logo ? (
                        <img 
                          src={brand.logo} 
                          alt={brand.name}
                          style={{ 
                            width: 48, 
                            height: 48, 
                            objectFit: 'contain',
                            borderRadius: 8,
                            backgroundColor: '#fff',
                            padding: 4
                          }}
                        />
                      ) : (
                        <div style={{ 
                          width: 48, 
                          height: 48, 
                          borderRadius: 8, 
                          backgroundColor: catColor.bg,
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center' 
                        }}>
                          <Tag size={24} style={{ color: catColor.color }} />
                        </div>
                      )}
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 4 }}>
                          {brand.name}
                        </h3>
                        <span style={{ 
                          fontSize: 11, 
                          fontWeight: 500,
                          padding: '3px 8px', 
                          backgroundColor: catColor.bg, 
                          color: catColor.color, 
                          borderRadius: 4,
                          textTransform: 'capitalize'
                        }}>
                          {getCategoryName(brand.category_slug)}
                        </span>
                      </div>
                    </div>
                    <div style={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      backgroundColor: brand.is_active ? '#10b981' : '#6b7280' 
                    }} />
                  </div>
                  
                  {brand.description && (
                    <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 12, lineHeight: 1.5 }}>
                      {brand.description.length > 80 ? brand.description.slice(0, 80) + '...' : brand.description}
                    </p>
                  )}
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>
                      {brand.product_count || 0} products
                    </span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => openEditModal(brand)}
                        style={{ 
                          padding: 8, 
                          backgroundColor: '#374151', 
                          borderRadius: 6, 
                          border: 'none', 
                          cursor: 'pointer',
                          color: '#3b82f6'
                        }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(brand)}
                        style={{ 
                          padding: 8, 
                          backgroundColor: '#374151', 
                          borderRadius: 6, 
                          border: 'none', 
                          cursor: 'pointer',
                          color: '#ef4444'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: 80, textAlign: 'center' }}>
            <Tag size={64} style={{ color: '#374151', margin: '0 auto 16px' }} />
            <p style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 8 }}>No brands found</p>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>
              {searchQuery || filterCategory !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Start by adding your first brand'}
            </p>
            {!searchQuery && filterCategory === 'all' && (
              <button 
                onClick={openAddModal}
                style={{ 
                  padding: '10px 20px', 
                  backgroundColor: '#3b82f6', 
                  color: '#fff', 
                  borderRadius: 8, 
                  border: 'none', 
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500
                }}
              >
                Add First Brand
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          zIndex: 100, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: 24, 
          backgroundColor: 'rgba(0,0,0,0.8)' 
        }}>
          <div style={{ 
            width: '100%', 
            maxWidth: 500, 
            backgroundColor: '#1f2937', 
            borderRadius: 16,
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: 20, 
              borderBottom: '1px solid #374151' 
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>
                {editingBrand ? 'Edit Brand' : 'Add New Brand'}
              </h2>
              <button 
                onClick={() => { setShowModal(false); resetForm(); }}
                style={{ 
                  padding: 8, 
                  backgroundColor: '#374151', 
                  borderRadius: 8, 
                  border: 'none', 
                  cursor: 'pointer',
                  color: '#9ca3af'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} style={{ padding: 20 }}>
              {/* Category Selection - Required */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 8 }}>
                  Category <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={formData.category_slug}
                  onChange={(e) => setFormData({ ...formData, category_slug: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: 12,
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: 8,
                    color: '#fff',
                    fontSize: 14
                  }}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
                <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                  This brand will only appear for products in this category
                </p>
              </div>

              {/* Brand Name */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 8 }}>
                  Brand Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="e.g., Fossil, Casio, Rolex"
                  required
                  style={{
                    width: '100%',
                    padding: 12,
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: 8,
                    color: '#fff',
                    fontSize: 14
                  }}
                />
              </div>

              {/* Slug */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 8 }}>
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="auto-generated"
                  style={{
                    width: '100%',
                    padding: 12,
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: 8,
                    color: '#9ca3af',
                    fontSize: 14
                  }}
                />
              </div>

              {/* Logo URL */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 8 }}>
                  Logo URL
                </label>
                <input
                  type="url"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  style={{
                    width: '100%',
                    padding: 12,
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: 8,
                    color: '#fff',
                    fontSize: 14
                  }}
                />
                {formData.logo && (
                  <div style={{ marginTop: 12, padding: 12, backgroundColor: '#111827', borderRadius: 8, textAlign: 'center' }}>
                    <img 
                      src={formData.logo} 
                      alt="Preview" 
                      style={{ maxHeight: 60, objectFit: 'contain' }}
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 8 }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the brand..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: 12,
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: 8,
                    color: '#fff',
                    fontSize: 14,
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Active Status */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    style={{ width: 18, height: 18, accentColor: '#3b82f6' }}
                  />
                  <span style={{ fontSize: 14, color: '#fff' }}>Active (visible on website)</span>
                </label>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  style={{
                    flex: 1,
                    padding: 12,
                    backgroundColor: '#374151',
                    color: '#9ca3af',
                    fontSize: 14,
                    fontWeight: 600,
                    borderRadius: 8,
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
                    padding: 12,
                    backgroundColor: '#3b82f6',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 600,
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {editingBrand ? 'Update Brand' : 'Add Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
