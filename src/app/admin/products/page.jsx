'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Eye, Package, Filter } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [currentPage, selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = `/products?page=${currentPage}&limit=10`;
      if (selectedCategory) url += `&category=${selectedCategory}`;
      
      const res = await api.get(url);
      setProducts(res.data.products || []);
      setTotalPages(res.data.pages || 1);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await api.delete(`/products/${productId}`);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount) => '৳' + (amount || 0).toLocaleString();

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', bg: '#fee2e2', color: '#dc2626' };
    if (stock <= 5) return { text: 'Low Stock', bg: '#fef3c7', color: '#d97706' };
    return { text: 'In Stock', bg: '#d1fae5', color: '#059669' };
  };

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Products</h1>
          <p style={{ color: '#64748b' }}>Manage your product inventory</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: '#3b82f6' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
        >
          <Plus size={20} />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div 
        className="rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-4"
        style={{ backgroundColor: '#1e293b' }}
      >
        <div className="relative flex-1">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg text-sm text-white placeholder-gray-500 outline-none"
            style={{ backgroundColor: '#0f172a', border: '1px solid #334155' }}
          />
        </div>
        <div className="relative">
          <Filter size={20} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#64748b' }} />
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            className="pl-12 pr-8 py-3 rounded-lg text-sm text-white outline-none appearance-none min-w-[180px]"
            style={{ backgroundColor: '#0f172a', border: '1px solid #334155' }}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.slug}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div 
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: '#1e293b' }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#0f172a' }}>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase" style={{ color: '#64748b' }}>Product</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase" style={{ color: '#64748b' }}>Category</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase" style={{ color: '#64748b' }}>Price</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase" style={{ color: '#64748b' }}>Stock</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase" style={{ color: '#64748b' }}>Status</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold uppercase" style={{ color: '#64748b' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product, index) => {
                    const stockStatus = getStockStatus(product.stock);
                    return (
                      <tr 
                        key={product._id}
                        style={{ borderBottom: index < filteredProducts.length - 1 ? '1px solid #334155' : 'none' }}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div 
                              className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0"
                              style={{ backgroundColor: '#334155' }}
                            >
                              {product.images?.[0]?.url ? (
                                <img 
                                  src={product.images[0].url}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package size={24} style={{ color: '#64748b' }} />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{product.name}</p>
                              <p className="text-xs" style={{ color: '#64748b' }}>SKU: {product.sku || 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span 
                            className="text-xs font-medium px-3 py-1.5 rounded-lg capitalize"
                            style={{ backgroundColor: '#334155', color: '#94a3b8' }}
                          >
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-semibold text-white">{formatCurrency(product.price)}</p>
                            {product.compare_price && (
                              <p className="text-xs line-through" style={{ color: '#64748b' }}>
                                {formatCurrency(product.compare_price)}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-white">{product.stock}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span 
                            className="text-xs font-medium px-3 py-1.5 rounded-full"
                            style={{ backgroundColor: stockStatus.bg, color: stockStatus.color }}
                          >
                            {stockStatus.text}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/product/${product.slug}`}
                              target="_blank"
                              className="p-2 rounded-lg transition-colors"
                              style={{ color: '#64748b' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#334155';
                                e.currentTarget.style.color = '#ffffff';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#64748b';
                              }}
                            >
                              <Eye size={18} />
                            </Link>
                            <Link
                              href={`/admin/products/${product._id}`}
                              className="p-2 rounded-lg transition-colors"
                              style={{ color: '#64748b' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#334155';
                                e.currentTarget.style.color = '#3b82f6';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#64748b';
                              }}
                            >
                              <Edit size={18} />
                            </Link>
                            <button
                              onClick={() => handleDelete(product._id)}
                              className="p-2 rounded-lg transition-colors"
                              style={{ color: '#64748b' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#334155';
                                e.currentTarget.style.color = '#ef4444';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#64748b';
                              }}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <Package size={48} className="mx-auto mb-4" style={{ color: '#334155' }} />
                      <p className="text-white font-medium mb-2">No products found</p>
                      <p className="text-sm mb-4" style={{ color: '#64748b' }}>Get started by adding your first product</p>
                      <Link
                        href="/admin/products/new"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white"
                        style={{ backgroundColor: '#3b82f6' }}
                      >
                        <Plus size={18} />
                        Add Product
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div 
            className="flex items-center justify-center gap-2 p-4"
            style={{ borderTop: '1px solid #334155' }}
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className="w-10 h-10 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: currentPage === page ? '#3b82f6' : 'transparent',
                  color: currentPage === page ? '#ffffff' : '#64748b'
                }}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
