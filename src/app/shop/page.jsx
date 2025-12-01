'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/product/ProductCard';
import api from '@/lib/api';

export default function ShopPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';
  const currentPage = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch products
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (search) params.append('search', search);
        if (sort) params.append('sort', sort);
        params.append('page', currentPage.toString());
        params.append('limit', '12');

        const productRes = await api.get(`/products?${params.toString()}`);
        setProducts(productRes.data.products || []);
        setTotal(productRes.data.total || 0);
        setPages(productRes.data.pages || 1);

        // Fetch categories
        const catRes = await api.get('/categories');
        setCategories(catRes.data || []);
      } catch (error) {
        console.error('Failed to fetch:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category, search, sort, currentPage]);

  const handleSortChange = (e) => {
    const url = new URL(window.location.href);
    url.searchParams.set('sort', e.target.value);
    window.location.href = url.toString();
  };

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="text-center py-16">
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-24">
            <h2 className="text-xl font-bold mb-4">Filters</h2>
            
            {/* Categories */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Categories</h3>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="/shop" 
                    className={`text-sm ${!category ? 'text-gold font-medium' : 'text-muted hover:text-focus'}`}
                  >
                    All Products
                  </a>
                </li>
                {categories.map((cat) => (
                  <li key={cat._id}>
                    <a 
                      href={`/shop?category=${cat.slug}`}
                      className={`text-sm ${category === cat.slug ? 'text-gold font-medium' : 'text-muted hover:text-focus'}`}
                    >
                      {cat.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sort */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Sort By</h3>
              <select 
                className="input-field text-sm"
                value={sort}
                onChange={handleSortChange}
              >
                <option value="newest">Newest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted">
              Showing {products.length} of {total} products
            </p>
          </div>

          {/* Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted text-lg">No products found</p>
              <a href="/shop" className="text-gold hover:underline mt-2 inline-block">
                Clear filters
              </a>
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              {Array.from({ length: pages }, (_, i) => i + 1).map((page) => (
                <a
                  key={page}
                  href={`/shop?page=${page}${category ? `&category=${category}` : ''}`}
                  className={`w-10 h-10 flex items-center justify-center border ${
                    currentPage === page 
                      ? 'bg-gold text-white border-gold' 
                      : 'border-primary-300 hover:border-gold'
                  }`}
                >
                  {page}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
