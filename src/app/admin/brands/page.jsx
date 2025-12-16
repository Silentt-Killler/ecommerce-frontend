'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Tag, Filter } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category_slug: ''
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
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category_slug) {
      toast.error('Name and Category required');
      return;
    }

    try {
      await api.post('/brands', {
        name: formData.name,
        slug: generateSlug(formData.name),
        category_slug: formData.category_slug,
        is_active: true
      });
      toast.success('Brand added');
      setShowModal(false);
      setFormData({ name: '', slug: '', category_slug: '' });
      fetchBrands();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add brand');
    }
  };

  const handleDelete = async (brand) => {
    if (!confirm(`Delete "${brand.name}"?`)) return;
    
    try {
      await api.delete(`/brands/${brand._id}`);
      toast.success('Brand deleted');
      fetchBrands();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete');
    }
  };

  const filteredBrands = brands.filter(b => 
    filterCategory === 'all' || b.category_slug === filterCategory
  );

  const getCategoryColor = (slug) => {
    const colors = {
      watch: '#3b82f6',
      menswear: '#10b981',
      womenswear: '#ec4899',
      accessories: '#f59e0b'
    };
    return colors[slug] || '#6b7280';
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Brands</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Manage brands for Watch category</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', backgroundColor: '#3b82f6', color: '#fff', fontSize: 14, fontWeight: 600, borderRadius: 10, border: 'none', cursor: 'pointer' }}
        >
          <Plus size={20} />
          Add Brand
        </button>
      </div>

      {/* Filter */}
      <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 16, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Filter size={18} style={{ color: '#6b7280' }} />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ padding: '10px 16px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14, cursor: 'pointer' }}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat.slug}>{cat.name}</option>
            ))}
          </select>
          <span style={{ fontSize: 14, color: '#6b7280' }}>
            {filteredBrands.length} brands
          </span>
        </div>
      </div>

      {/* Brands List */}
      <div style={{ backgroundColor: '#1f2937', borderRadius: 16, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
            <div style={{ width: 36, height: 36, border: '3px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : filteredBrands.length > 0 ? (
          <div style={{ padding: 20 }}>
            {/* Group by category */}
            {['watch', 'menswear', 'womenswear', 'accessories'].map(catSlug => {
              const catBrands = filteredBrands.filter(b => b.category_slug === catSlug);
              if (catBrands.length === 0) return null;
              
              const catName = categories.find(c => c.slug === catSlug)?.name || catSlug;
              const color = getCategoryColor(catSlug);
              
              return (
                <div key={catSlug} style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: color, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                    {catName}
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {catBrands.map(brand => (
                      <div 
                        key={brand._id}
                        style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: 10,
                          padding: '10px 16px', 
                          backgroundColor: '#111827', 
                          borderRadius: 8,
                          border: `1px solid ${color}30`
                        }}
                      >
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{brand.name}</span>
                        <button
                          onClick={() => handleDelete(brand)}
                          style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', opacity: 0.7 }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <Tag size={48} style={{ color: '#374151', margin: '0 auto 16px' }} />
            <p style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 8 }}>No brands yet</p>
            <p style={{ fontSize: 14, color: '#6b7280' }}>Add brands to show in product filters</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div style={{ width: '100%', maxWidth: 400, backgroundColor: '#1f2937', borderRadius: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottom: '1px solid #374151' }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>Add Brand</h2>
              <button onClick={() => setShowModal(false)} style={{ padding: 8, backgroundColor: '#374151', borderRadius: 8, border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: 20 }}>
              {/* Category */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 8 }}>
                  Category
                </label>
                <select
                  value={formData.category_slug}
                  onChange={(e) => setFormData({ ...formData, category_slug: e.target.value })}
                  required
                  style={{ width: '100%', padding: 12, backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14 }}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Brand Name */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 8 }}>
                  Brand Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Fossil, Casio"
                  required
                  style={{ width: '100%', padding: 12, backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14 }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1, padding: 12, backgroundColor: '#374151', color: '#9ca3af', fontSize: 14, fontWeight: 600, borderRadius: 8, border: 'none', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: 12, backgroundColor: '#3b82f6', color: '#fff', fontSize: 14, fontWeight: 600, borderRadius: 8, border: 'none', cursor: 'pointer' }}
                >
                  Add Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
