'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Tag, Package } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '', logo: '' });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const res = await api.get('/brands');
      setBrands(res.data || []);
    } catch (error) {
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData({ ...formData, name, slug: editingBrand ? formData.slug : generateSlug(name) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBrand) {
        await api.put(`/brands/${editingBrand._id}`, formData);
        toast.success('Brand updated');
      } else {
        await api.post('/brands', formData);
        toast.success('Brand created');
      }
      setShowModal(false);
      setEditingBrand(null);
      setFormData({ name: '', slug: '', description: '', logo: '' });
      fetchBrands();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save brand');
    }
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      slug: brand.slug,
      description: brand.description || '',
      logo: brand.logo || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (brandId) => {
    if (!confirm('Delete this brand?')) return;
    try {
      await api.delete(`/brands/${brandId}`);
      toast.success('Brand deleted');
      fetchBrands();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete brand');
    }
  };

  const openAddModal = () => {
    setEditingBrand(null);
    setFormData({ name: '', slug: '', description: '', logo: '' });
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
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Brands</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Manage product brands</p>
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

      {/* Brands Grid */}
      {brands.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {brands.map((brand) => (
            <div key={brand._id} style={{ backgroundColor: '#1f2937', borderRadius: 16, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: 14,
                  backgroundColor: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0
                }}>
                  {brand.logo ? (
                    <img src={brand.logo} alt={brand.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8 }} />
                  ) : (
                    <Tag size={28} style={{ color: '#6b7280' }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{brand.name}</h3>
                  <p style={{ fontSize: 13, color: '#6b7280' }}>/{brand.slug}</p>
                </div>
              </div>
              
              {brand.description && (
                <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 20, lineHeight: 1.6 }}>
                  {brand.description.length > 100 ? brand.description.slice(0, 100) + '...' : brand.description}
                </p>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => handleEdit(brand)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: 12,
                    backgroundColor: '#374151',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 500,
                    borderRadius: 10,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(brand._id)}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#374151',
                    color: '#ef4444',
                    borderRadius: 10,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex'
                  }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ backgroundColor: '#1f2937', borderRadius: 16, padding: 80, textAlign: 'center' }}>
          <Tag size={64} style={{ color: '#374151', margin: '0 auto 16px' }} />
          <p style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 8 }}>No brands yet</p>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>Add your first brand to organize products</p>
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
            Add Brand
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div style={{ width: '100%', maxWidth: 500, backgroundColor: '#1f2937', borderRadius: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 24, borderBottom: '1px solid #374151' }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>
                {editingBrand ? 'Edit Brand' : 'Add Brand'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ padding: 8, backgroundColor: '#374151', borderRadius: 8, border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: 24 }}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 8 }}>
                  Brand Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="e.g. Rolex"
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
                  placeholder="rolex"
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
                  placeholder="Brief description of this brand..."
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
                  Logo URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
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
                {formData.logo && (
                  <div style={{ marginTop: 12, width: 80, height: 80, backgroundColor: '#374151', borderRadius: 12, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={formData.logo} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
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
                  {editingBrand ? 'Update' : 'Create'} Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
