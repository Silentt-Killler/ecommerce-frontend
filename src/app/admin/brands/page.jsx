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
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    logo: ''
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const res = await api.get('/brands');
      setBrands(res.data || []);
    } catch (error) {
      // Brands endpoint might not exist yet
      setBrands([]);
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
      slug: editingBrand ? formData.slug : generateSlug(name)
    });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light tracking-wide">Brands</h1>
          <p className="text-sm text-muted mt-1">Manage product brands</p>
        </div>
        <button
          onClick={() => {
            setEditingBrand(null);
            setFormData({ name: '', slug: '', description: '', logo: '' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-focus text-white text-sm hover:bg-gold transition-colors"
        >
          <Plus size={18} />
          Add Brand
        </button>
      </div>

      {/* Brands Grid */}
      {brands.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {brands.map((brand) => (
            <div key={brand._id} className="bg-white border border-primary-200 p-4">
              <div className="flex items-start gap-3">
                {/* Logo */}
                <div className="w-12 h-12 bg-primary-100 rounded flex items-center justify-center flex-shrink-0">
                  {brand.logo ? (
                    <img 
                      src={brand.logo}
                      alt={brand.name}
                      className="w-full h-full object-contain rounded"
                    />
                  ) : (
                    <Tag size={20} className="text-muted" />
                  )}
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium">{brand.name}</h3>
                  <p className="text-xs text-muted">/{brand.slug}</p>
                  {brand.product_count > 0 && (
                    <p className="text-xs text-muted mt-1 flex items-center gap-1">
                      <Package size={12} />
                      {brand.product_count} products
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-3 border-t border-primary-100">
                <button
                  onClick={() => handleEdit(brand)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 text-xs border border-primary-300 hover:border-focus transition-colors"
                >
                  <Edit size={12} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(brand._id)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 text-xs border border-primary-300 hover:border-red-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={12} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-primary-200 p-12 text-center">
          <Tag size={48} className="mx-auto mb-4 text-muted opacity-50" />
          <p className="text-muted mb-4">No brands yet</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2 bg-focus text-white text-sm hover:bg-gold transition-colors"
          >
            Add First Brand
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-light">
                {editingBrand ? 'Edit Brand' : 'Add Brand'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-focus">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm mb-2">Brand Name</label>
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
                <label className="block text-sm mb-2">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Logo URL (Optional)</label>
                <input
                  type="url"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  placeholder="https://..."
                  className="input-field"
                />
                {formData.logo && (
                  <div className="mt-2 w-16 h-16 bg-primary-100 rounded overflow-hidden">
                    <img 
                      src={formData.logo}
                      alt="Preview"
                      className="w-full h-full object-contain"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}
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
                  {editingBrand ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
