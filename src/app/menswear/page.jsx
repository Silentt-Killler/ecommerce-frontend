'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { SlidersHorizontal, X, Check } from 'lucide-react';
import api from '@/lib/api';

function MenswearContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [availableSizes, setAvailableSizes] = useState(['S', 'M', 'L', 'XL', 'XXL']);
  const [availableColors, setAvailableColors] = useState([]);
  
  const selectedSize = searchParams.get('size') || '';
  const selectedColor = searchParams.get('color') || '';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const sortBy = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    fetchProducts();
  }, [selectedSize, selectedColor, minPrice, maxPrice, sortBy, page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = `/products?category=menswear&page=${page}&limit=12&sort=${sortBy}`;
      
      if (selectedSize) url += `&size=${selectedSize}`;
      if (selectedColor) url += `&color=${selectedColor}`;
      if (minPrice) url += `&min_price=${minPrice}`;
      if (maxPrice) url += `&max_price=${maxPrice}`;
      
      const res = await api.get(url);
      setProducts(res.data.products || []);
      setTotalProducts(res.data.total || 0);
      
      if (res.data.available_colors) {
        setAvailableColors(res.data.available_colors);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    if (key !== 'page') {
      params.delete('page');
    }
    
    router.push(`/menswear?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push('/menswear');
  };

  const hasActiveFilters = selectedSize || selectedColor || minPrice || maxPrice;
  const formatPrice = (price) => '৳' + price?.toLocaleString();

  return (
    <div style={{ backgroundColor: '#F7F7F7', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#0C0C0C', padding: '48px 0' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>
          <h1 style={{ fontSize: 36, fontWeight: 300, color: '#fff', letterSpacing: 6, textAlign: 'center', marginBottom: 8 }}>
            MENSWEAR
          </h1>
          <p style={{ fontSize: 14, color: '#919191', textAlign: 'center', letterSpacing: 2 }}>
            Premium clothing for men
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #E0E0E0', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            {/* Size Filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, color: '#919191', marginRight: 8 }}>Size:</span>
              {availableSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => updateFilter('size', selectedSize === size ? '' : size)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: selectedSize === size ? '#0C0C0C' : 'transparent',
                    color: selectedSize === size ? '#fff' : '#0C0C0C',
                    border: '1px solid #0C0C0C',
                    borderRadius: 0,
                    fontSize: 12,
                    fontWeight: 400,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {size}
                </button>
              ))}
            </div>

            {/* Sort & Filter Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <select
                value={sortBy}
                onChange={(e) => updateFilter('sort', e.target.value)}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#fff',
                  border: '1px solid #E0E0E0',
                  fontSize: 13,
                  color: '#0C0C0C',
                  cursor: 'pointer'
                }}
              >
                <option value="newest">Newest</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 16px',
                  backgroundColor: '#fff',
                  border: '1px solid #E0E0E0',
                  fontSize: 13,
                  cursor: 'pointer'
                }}
              >
                <SlidersHorizontal size={16} />
                More Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Extended Filters Panel */}
      {showFilters && (
        <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #E0E0E0', padding: '24px 0' }}>
          <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
              {/* Price Range */}
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 500, color: '#0C0C0C', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Price Range
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => updateFilter('min_price', e.target.value)}
                    style={{ width: 100, padding: '8px 12px', border: '1px solid #E0E0E0', fontSize: 13 }}
                  />
                  <span style={{ color: '#919191' }}>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => updateFilter('max_price', e.target.value)}
                    style={{ width: 100, padding: '8px 12px', border: '1px solid #E0E0E0', fontSize: 13 }}
                  />
                </div>
              </div>

              {/* Color Filter */}
              {availableColors.length > 0 && (
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 500, color: '#0C0C0C', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Color
                  </h4>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {availableColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => updateFilter('color', selectedColor === color ? '' : color)}
                        style={{
                          padding: '6px 14px',
                          backgroundColor: selectedColor === color ? '#0C0C0C' : 'transparent',
                          color: selectedColor === color ? '#fff' : '#0C0C0C',
                          border: '1px solid #0C0C0C',
                          fontSize: 12,
                          cursor: 'pointer'
                        }}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <span style={{ fontSize: 14, color: '#919191' }}>
            {totalProducts} {totalProducts === 1 ? 'product' : 'products'}
          </span>
          
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: '#0C0C0C',
                border: '1px solid #0C0C0C',
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              <X size={14} />
              Clear Filters
            </button>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80 }}>
            <div style={{ width: 40, height: 40, border: '3px solid #B08B5C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : products.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {products.map((product) => (
              <Link key={product._id} href={`/product/${product.slug}`} style={{ textDecoration: 'none' }}>
                <div 
                  style={{ backgroundColor: '#fff', overflow: 'hidden', transition: 'all 0.3s', cursor: 'pointer' }}
                  onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.08)'}
                  onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}
                >
                  <div style={{ position: 'relative', aspectRatio: '3/4', backgroundColor: '#f5f5f5' }}>
                    {product.images?.[0]?.url ? (
                      <img src={product.images[0].url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                        No Image
                      </div>
                    )}
                    
                    {product.compare_price && product.compare_price > product.price && (
                      <div style={{ position: 'absolute', top: 12, left: 12, padding: '4px 10px', backgroundColor: '#B08B5C', color: '#fff', fontSize: 11, fontWeight: 500 }}>
                        {Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}% OFF
                      </div>
                    )}
                  </div>

                  <div style={{ padding: 20 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 400, color: '#0C0C0C', marginBottom: 8, letterSpacing: 0.5 }}>
                      {product.name}
                    </h3>
                    
                    {/* Available Sizes */}
                    {product.available_sizes?.length > 0 && (
                      <p style={{ fontSize: 11, color: '#919191', marginBottom: 10 }}>
                        {product.available_sizes.join(' • ')}
                      </p>
                    )}
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 16, fontWeight: 500, color: '#0C0C0C' }}>
                        {formatPrice(product.price)}
                      </span>
                      {product.compare_price && product.compare_price > product.price && (
                        <span style={{ fontSize: 13, color: '#919191', textDecoration: 'line-through' }}>
                          {formatPrice(product.compare_price)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <h3 style={{ fontSize: 20, fontWeight: 400, color: '#0C0C0C', marginBottom: 8 }}>No products found</h3>
            <p style={{ fontSize: 14, color: '#919191', marginBottom: 24 }}>Try adjusting your filters</p>
            {hasActiveFilters && (
              <button onClick={clearAllFilters} style={{ padding: '12px 24px', backgroundColor: '#0C0C0C', color: '#fff', border: 'none', fontSize: 13, cursor: 'pointer', letterSpacing: 1 }}>
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalProducts > 12 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 48 }}>
            {Array.from({ length: Math.ceil(totalProducts / 12) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => updateFilter('page', p.toString())}
                style={{
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: p === page ? '#0C0C0C' : '#fff',
                  color: p === page ? '#fff' : '#0C0C0C',
                  border: '1px solid #E0E0E0',
                  fontSize: 14,
                  cursor: 'pointer'
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingMenswear() {
  return (
    <div style={{ backgroundColor: '#F7F7F7', minHeight: '100vh' }}>
      <div style={{ backgroundColor: '#0C0C0C', padding: '48px 0' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>
          <h1 style={{ fontSize: 36, fontWeight: 300, color: '#fff', letterSpacing: 6, textAlign: 'center' }}>
            MENSWEAR
          </h1>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80 }}>
        <div style={{ width: 40, height: 40, border: '3px solid #B08B5C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    </div>
  );
}

export default function MenswearPage() {
  return (
    <Suspense fallback={<LoadingMenswear />}>
      <MenswearContent />
    </Suspense>
  );
}
