'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Upload, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ProductFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = params.id && params.id !== 'new';

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);

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
    tags: ''
  });

  useEffect(() => {
    // Fetch categories
    api.get('/categories').then(res => {
      setCategories(res.data || []);
    });

    // Fetch product if editing
    if (isEdit) {
      api.get(`/products/${params.id}`).then(res => {
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
          tags: product.tags?.join(', ') || ''
        });
        setImages(product.images || []);
      });
    }
  }, [isEdit, params.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Auto-generate slug from name
      ...(name === 'name' && !isEdit ? { slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') } : {})
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!isEdit) {
      toast.error('Save product first, then upload images');
      return;
    }

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append('is_primary', images.length === 0);

    try {
      const response = await api.post(`/products/${params.id}/images`, formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImages([...images, response.data.image]);
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (publicId) => {
    if (!confirm('Delete this image?')) return;

    try {
      await api.delete(`/products/${params.id}/images/${publicId}`);
      setImages(images.filter(img => img.public_id !== publicId));
      toast.success('Image deleted');
    } catch (error) {
      toast.error('Failed to delete image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const productData = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      short_description: formData.short_description || null,
      price: parseFloat(formData.price),
      compare_price: formData.compare_price ? parseFloat(formData.compare_price) : null,
      category: formData.category,
      brand: formData.brand || null,
      stock: parseInt(formData.stock),
      sku: formData.sku || null,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim().toLowerCase()) : []
    };

    try {
      if (isEdit) {
        await api.put(`/products/${params.id}`, productData);
        toast.success('Product updated');
      } else {
        const response = await api.post('/products', productData);
        toast.success('Product created');
        router.push(`/admin/products/${response.data._id}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="p-2 hover:bg-primary-100 rounded">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold">
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-bold mb-4">Basic Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Slug *</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Short Description</label>
                  <input
                    type="text"
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Brief product summary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="input-field min-h-[150px]"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-bold mb-4">Images</h2>
              
              {!isEdit && (
                <p className="text-sm text-muted mb-4">
                  Save product first to upload images
                </p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative aspect-square bg-primary-100 rounded overflow-hidden">
                    <Image
                      src={image.url}
                      alt="Product"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(image.public_id)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded"
                    >
                      <X size={16} />
                    </button>
                    {image.is_primary && (
                      <span className="absolute bottom-2 left-2 bg-gold text-white text-xs px-2 py-1 rounded">
                        Primary
                      </span>
                    )}
                  </div>
                ))}

                {isEdit && (
                  <label className="aspect-square border-2 border-dashed border-primary-300 rounded flex flex-col items-center justify-center cursor-pointer hover:border-gold">
                    <Upload size={24} className="text-muted mb-2" />
                    <span className="text-sm text-muted">
                      {uploading ? 'Uploading...' : 'Upload'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-bold mb-4">Pricing</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Price (৳) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="input-field"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Compare Price (৳)</label>
                  <input
                    type="number"
                    name="compare_price"
                    value={formData.compare_price}
                    onChange={handleChange}
                    className="input-field"
                    min="0"
                    step="0.01"
                    placeholder="Original price for discount"
                  />
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-bold mb-4">Inventory</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Stock *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    className="input-field"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">SKU</label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Stock Keeping Unit"
                  />
                </div>
              </div>
            </div>

            {/* Organization */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-bold mb-4">Organization</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
