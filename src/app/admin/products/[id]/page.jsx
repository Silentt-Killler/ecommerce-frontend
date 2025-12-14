'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Upload, X, Plus } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ProductFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = params.id !== 'new';
  
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [imageUrl, setImageUrl] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    short_description: '',
    price: '',
    compare_price: '',
    category: '',
    brand: '',
    stock: '',
    sku: '',
    tags: '',
    status: 'active',
    images: []
  });

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    if (isEdit) {
      fetchProduct();
    }
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
      const res = await api.get('/brands');
      setBrands(res.data || []);
    } catch (error) {
      setBrands([]);
    }
  };

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${params.id}`);
      const product = res.data;
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        short_description: product.short_description || '',
        price: product.price?.toString() || '',
        compare_price: product.compare_price?.toString() || '',
        category: product.category || '',
        brand: product.brand || '',
        stock: product.stock?.toString() || '',
        sku: product.sku || '',
        tags: product.tags?.join(', ') || '',
        status: product.status || 'active',
        images: product.images || []
      });
    } catch (error) {
      toast.error('Failed to load product');
      router.push('/admin/products');
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
      slug: isEdit ? formData.slug : generateSlug(name)
    });
  };

  const addImage = () => {
    if (!imageUrl.trim()) return;
    
    setFormData({
      ...formData,
      images: [...formData.images, { url: imageUrl, is_primary: formData.images.length === 0 }]
    });
    setImageUrl('');
  };

  const removeImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    if (newImages.length > 0 && !newImages.some(img => img.is_primary)) {
      newImages[0].is_primary = true;
    }
    setFormData({ ...formData, images: newImages });
  };

  const setPrimaryImage = (index) => {
    const newImages = formData.images.map((img, i) => ({
      ...img,
      is_primary: i === index
    }));
    setFormData({ ...formData, images: newImages });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const data = {
      ...formData,
      price: parseFloat(formData.price),
      compare_price: formData.compare_price ? parseFloat(formData.compare_price) : null,
      stock: parseInt(formData.stock) || 0,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : []
    };

    try {
      if (isEdit) {
        await api.put(`/products/${params.id}`, data);
        toast.success('Product updated');
      } else {
        await api.post('/products', data);
        toast.success('Product created');
      }
      router.push('/admin/products');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save product');
    } finally {
      setSaving(false);
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
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="text-gray-400 hover:text-white">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-semibold text-white">
          {isEdit ? 'Edit Product' : 'Add Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-[#232a3b] rounded-lg p-6">
              <h2 className="text-white font-medium mb-4">Basic Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={handleNameChange}
                    className="w-full px-4 py-3 bg-[#1a1f2e] border border-gray-700 rounded text-white placeholder-gray-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Slug *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1a1f2e] border border-gray-700 rounded text-white placeholder-gray-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Short Description</label>
                  <input
                    type="text"
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1a1f2e] border border-gray-700 rounded text-white placeholder-gray-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-[#1a1f2e] border border-gray-700 rounded text-white placeholder-gray-500 focus:border-blue-500 outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-[#232a3b] rounded-lg p-6">
              <h2 className="text-white font-medium mb-4">Images</h2>
              
              <div className="flex gap-2 mb-4">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Enter image URL from Cloudinary"
                  className="flex-1 px-4 py-3 bg-[#1a1f2e] border border-gray-700 rounded text-white placeholder-gray-500 focus:border-blue-500 outline-none"
                />
                <button
                  type="button"
                  onClick={addImage}
                  className="px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>

              {formData.images.length > 0 ? (
                <div className="grid grid-cols-4 gap-4">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative group">
                      <div className={`aspect-square bg-gray-700 rounded overflow-hidden ${img.is_primary ? 'ring-2 ring-blue-500' : ''}`}>
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <X size={14} />
                      </button>
                      {!img.is_primary && (
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(index)}
                          className="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Set Primary
                        </button>
                      )}
                      {img.is_primary && (
                        <span className="absolute bottom-1 left-1 text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
                  <Upload size={32} className="mx-auto mb-2 text-gray-500" />
                  <p className="text-gray-500 text-sm">Add image URLs above</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing */}
            <div className="bg-[#232a3b] rounded-lg p-6">
              <h2 className="text-white font-medium mb-4">Pricing</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Price (৳) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1a1f2e] border border-gray-700 rounded text-white placeholder-gray-500 focus:border-blue-500 outline-none"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Compare Price (৳)</label>
                  <input
                    type="number"
                    value={formData.compare_price}
                    onChange={(e) => setFormData({ ...formData, compare_price: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1a1f2e] border border-gray-700 rounded text-white placeholder-gray-500 focus:border-blue-500 outline-none"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Organization */}
            <div className="bg-[#232a3b] rounded-lg p-6">
              <h2 className="text-white font-medium mb-4">Organization</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1a1f2e] border border-gray-700 rounded text-white focus:border-blue-500 outline-none"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Brand</label>
                  <select
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1a1f2e] border border-gray-700 rounded text-white focus:border-blue-500 outline-none"
                  >
                    <option value="">Select Brand</option>
                    {brands.map((brand) => (
                      <option key={brand._id} value={brand.slug}>{brand.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="new, featured, sale"
                    className="w-full px-4 py-3 bg-[#1a1f2e] border border-gray-700 rounded text-white placeholder-gray-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="bg-[#232a3b] rounded-lg p-6">
              <h2 className="text-white font-medium mb-4">Inventory</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Stock *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1a1f2e] border border-gray-700 rounded text-white placeholder-gray-500 focus:border-blue-500 outline-none"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1a1f2e] border border-gray-700 rounded text-white placeholder-gray-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1a1f2e] border border-gray-700 rounded text-white focus:border-blue-500 outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Link
                href="/admin/products"
                className="flex-1 py-3 text-center text-gray-400 border border-gray-600 rounded hover:border-gray-500 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
