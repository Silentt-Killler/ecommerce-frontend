'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Filter, ChevronDown, X, Grid, List, ShoppingBag } from 'lucide-react';
import api from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';

// Loading component
function LoadingSpinner() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #B08B5C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );
}

// Main Shop Content
function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [showFilters, setShowFilters] = useState(false);
  
  // Search
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy, currentPage, searchQuery]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data || []);
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `/products?page=${currentPage}&limit=12&sort=${sortBy}`;
      if (selectedCategory) url += `&category=${selectedCategory}`;
      if (searchQuery) url += `&search=${searchQuery}`;
      
      const res = await api.get(url);
      setProducts(res.data.products || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.pages || 1);
    } catch (error) {
      console.error('Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    // Update URL
    const params = new URLSearchParams(searchParams);
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    router.push(`/shop?${params.toString()}`);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    const params = new URLSearchParams(searchParams);
    params.set('sort', sort);
    router.push(`/shop?${params.toString()}`);
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' }
  ];

  return (
    <div style={{ backgroundColor: '#F7F7F7', minHeight: '100vh', paddingTop: 80 }}>
      {/* Header */}
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E0E0E0', padding: '40px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <h1 style={{ fontSize: 28, fontWeight: 400, letterSpacing: 4, color: '#0C0C0C', marginBottom: 8, textTransform: 'uppercase' }}>
            {searchQuery ? `Search: "${searchQuery}"` : selectedCategory ? categories.find(c => c.slug === selectedCategory)?.name || 'Shop' : 'All Products'}
          </h1>
          <p style={{ fontSize: 14, color: '#919191' }}>
            {total} {total === 1 ? 'product' : 'products'} found
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {/* Filters Bar */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: 32,
          flexWrap: 'wrap',
          gap: 16
        }}>
          {/* Category Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => handleCategoryChange('')}
              style={{
                padding: '10px 20px',
                backgroundColor: !selectedCategory ? '#0C0C0C' : 'transparent',
                color: !selectedCategory ? '#FFFFFF' : '#0C0C0C',
                border: !selectedCategory ? 'none' : '1px solid #E0E0E0',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => handleCategoryChange(cat.slug)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: selectedCategory === cat.slug ? '#0C0C0C' : 'transparent',
                  color: selectedCategory === cat.slug ? '#FFFFFF' : '#0C0C0C',
                  border: selectedCategory === cat.slug ? 'none' : '1px solid #E0E0E0',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div style={{ position: 'relative' }}>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              style={{
                padding: '10px 40px 10px 16px',
                border: '1px solid #E0E0E0',
                borderRadius: 6,
                fontSize: 13,
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
                appearance: 'none',
                outline: 'none'
              }}
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#919191' }} />
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <LoadingSpinner />
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <ShoppingBag size={64} style={{ color: '#D0D0D0', marginBottom: 24 }} />
            <h2 style={{ fontSize: 20, fontWeight: 500, color: '#0C0C0C', marginBottom: 12 }}>
              No products found
            </h2>
            <p style={{ fontSize: 14, color: '#919191', marginBottom: 24 }}>
              {searchQuery ? `No results for "${searchQuery}"` : 'Try changing your filters'}
            </p>
            <button
              onClick={() => {
                setSelectedCategory('');
                router.push('/shop');
              }}
              style={{
                padding: '12px 32px',
                backgroundColor: '#0C0C0C',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 6,
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              gap: 24 
            }}>
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 48 }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      width: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: currentPage === page ? 'none' : '1px solid #E0E0E0',
                      backgroundColor: currentPage === page ? '#B08B5C' : '#FFFFFF',
                      color: currentPage === page ? '#FFFFFF' : '#0C0C0C',
                      fontSize: 14,
                      cursor: 'pointer',
                      borderRadius: 6
                    }}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 1024px) {
          .shop-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .shop-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}

// Export with Suspense
export default function ShopPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ShopContent />
    </Suspense>
  );
}
