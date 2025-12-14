'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Eye, Package } from 'lucide-react';
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
    if (!confirm('Delete this product?')) return;
    
    try {
      await api.delete(`/products/${productId}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount) => '৳' + (amount || 0).toLocaleString();

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-semibold text-white">Products</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#232a3b] border border-gray-700 rounded text-white placeholder-gray-500 focus:border-blue-500 outline-none"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
          className="px-4 py-2.5 bg-[#232a3b] border border-gray-700 rounded text-white focus:border-blue-500 outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat.slug}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-[#232a3b] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-4 text-gray-400 text-sm font-medium">Product</th>
                <th className="text-left p-4 text-gray-400 text-sm font-medium">Category</th>
                <th className="text-left p-4 text-gray-400 text-sm font-medium">Price</th>
                <th className="text-left p-4 text-gray-400 text-sm font-medium">Stock</th>
                <th className="text-left p-4 text-gray-400 text-sm font-medium">Status</th>
                <th className="text-right p-4 text-gray-400 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="border-b border-gray-700/50 hover:bg-white/5">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                          {product.images?.[0]?.url ? (
                            <img 
                              src={product.images[0].url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={20} className="text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">{product.name}</p>
                          <p className="text-gray-500 text-xs">SKU: {product.sku || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300 text-sm capitalize">{product.category}</td>
                    <td className="p-4">
                      <div>
                        <p className="text-white">{formatCurrency(product.price)}</p>
                        {product.compare_price && (
                          <p className="text-gray-500 text-xs line-through">
                            {formatCurrency(product.compare_price)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-sm ${
                        product.stock === 0 ? 'text-red-400' : 
                        product.stock <= 5 ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded ${
                        product.status === 'active' 
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/product/${product.slug}`}
                          target="_blank"
                          className="p-2 text-gray-400 hover:text-white transition-colors"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          href={`/admin/products/${product._id}`}
                          className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <Package size={48} className="mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400">No products found</p>
                    <Link
                      href="/admin/products/new"
                      className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Add First Product
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-700">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded text-sm ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-white/10'
                }`}
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
