'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Eye, Package, Filter, MoreVertical } from 'lucide-react';
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

  const getStockBadge = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', bg: '#fef2f2', color: '#dc2626', border: '#fecaca' };
    if (stock <= 5) return { text: 'Low Stock', bg: '#fffbeb', color: '#d97706', border: '#fde68a' };
    return { text: 'In Stock', bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' };
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Products</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Manage your product inventory</p>
        </div>
        <Link
          href="/admin/products/new"
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
            textDecoration: 'none',
            transition: 'background 0.2s'
          }}
        >
          <Plus size={20} />
          Add Product
        </Link>
      </div>

      {/* Filters Card */}
      <div style={{
        backgroundColor: '#1f2937',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        display: 'flex',
        gap: 16,
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: 250, position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px 14px 48px',
              backgroundColor: '#111827',
              border: '1px solid #374151',
              borderRadius: 10,
              color: '#fff',
              fontSize: 14,
              outline: 'none'
            }}
          />
        </div>
        <div style={{ position: 'relative', minWidth: 200 }}>
          <Filter size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            style={{
              width: '100%',
              padding: '14px 16px 14px 48px',
              backgroundColor: '#111827',
              border: '1px solid #374151',
              borderRadius: 10,
              color: '#fff',
              fontSize: 14,
              outline: 'none',
              appearance: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.slug}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div style={{ backgroundColor: '#1f2937', borderRadius: 16, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80 }}>
            <div style={{ width: 40, height: 40, border: '3px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#111827' }}>
                  <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product</th>
                  <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</th>
                  <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price</th>
                  <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stock</th>
                  <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                  <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? filteredProducts.map((product, index) => {
                  const stockBadge = getStockBadge(product.stock);
                  return (
                    <tr key={product._id} style={{ borderTop: '1px solid #374151' }}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <div style={{
                            width: 56,
                            height: 56,
                            borderRadius: 12,
                            overflow: 'hidden',
                            backgroundColor: '#374151',
                            flexShrink: 0
                          }}>
                            {product.images?.[0]?.url ? (
                              <img src={product.images[0].url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Package size={24} style={{ color: '#6b7280' }} />
                              </div>
                            )}
                          </div>
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{product.name}</p>
                            <p style={{ fontSize: 12, color: '#6b7280' }}>SKU: {product.sku || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          fontSize: 12,
                          fontWeight: 500,
                          padding: '6px 12px',
                          backgroundColor: '#374151',
                          color: '#d1d5db',
                          borderRadius: 6,
                          textTransform: 'capitalize'
                        }}>
                          {product.category}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{formatCurrency(product.price)}</p>
                        {product.compare_price && (
                          <p style={{ fontSize: 12, color: '#6b7280', textDecoration: 'line-through' }}>{formatCurrency(product.compare_price)}</p>
                        )}
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{product.stock}</span>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                        <span style={{
                          fontSize: 12,
                          fontWeight: 500,
                          padding: '6px 12px',
                          backgroundColor: stockBadge.bg,
                          color: stockBadge.color,
                          border: `1px solid ${stockBadge.border}`,
                          borderRadius: 20
                        }}>
                          {stockBadge.text}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                          <Link href={`/product/${product.slug}`} target="_blank" style={{ padding: 10, borderRadius: 8, backgroundColor: '#374151', color: '#9ca3af', display: 'flex' }}>
                            <Eye size={18} />
                          </Link>
                          <Link href={`/admin/products/${product._id}`} style={{ padding: 10, borderRadius: 8, backgroundColor: '#374151', color: '#3b82f6', display: 'flex' }}>
                            <Edit size={18} />
                          </Link>
                          <button onClick={() => handleDelete(product._id)} style={{ padding: 10, borderRadius: 8, backgroundColor: '#374151', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex' }}>
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={6} style={{ padding: 80, textAlign: 'center' }}>
                      <Package size={64} style={{ color: '#374151', marginBottom: 16 }} />
                      <p style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 8 }}>No products found</p>
                      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>Get started by adding your first product</p>
                      <Link href="/admin/products/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', backgroundColor: '#3b82f6', color: '#fff', fontSize: 14, fontWeight: 600, borderRadius: 10, textDecoration: 'none' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 20, borderTop: '1px solid #374151' }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  border: 'none',
                  backgroundColor: currentPage === page ? '#3b82f6' : '#374151',
                  color: currentPage === page ? '#fff' : '#9ca3af',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer'
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
