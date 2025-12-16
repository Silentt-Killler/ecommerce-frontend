'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { SlidersHorizontal, X } from 'lucide-react';
import api from '@/lib/api';

function WatchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  
  const selectedBrand = searchParams.get('brand') || '';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const sortBy = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedBrand, minPrice, maxPrice, sortBy, page]);

  const fetchBrands = async () => {
    try {
      const res = await api.get('/brands?category=watch');
      setBrands(res.data || []);
    } catch (error) {
      console.error('Failed to fetch brands:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = `/products?category=watch&page=${page}&limit=12&sort=${sortBy}`;
      
      if (selectedBrand) url += `&brand=${selectedBrand}`;
      if (minPrice) url += `&min_price=${minPrice}`;
      if (maxPrice) url += `&max_price=${maxPrice}`;
      
      const res = await api.get(url);
      setProducts(res.data.products || []);
      setTotalProducts(res.data.total || 0);
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
    
    router.push(`/watch?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push('/watch');
  };

  const hasActiveFilters = selectedBrand || minPrice || maxPrice;
  const formatPrice = (price) => '৳' + price?.toLocaleString();

  return (
    <div style={{ backgroundColor: '#F7F7F7', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#0C0C0C', padding: '48px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <h1 style={{ fontSize: 36, fontWeight: 300, color: '#fff', letterSpacing: 4, textAlign: 'center', marginBottom: 8 }}>
            WATCHES
          </h1>
          <p style={{ fontSize: 14, color: '#919191', textAlign: 'center', letterSpacing: 1 }}>
            Premium timepieces collection
          </p>
        </div>
      </div>

      {/* Brand Bar */}
      {brands.length > 0 && (
        <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e5e5', position: 'sticky', top: 0, zIndex: 40 }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '16px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
              <button
                onClick={() => updateFilter('brand', '')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: !selectedBrand ? '#0C0C0C' : 'transparent',
                  color: !selectedBrand ? '#fff' : '#0C0C0C',
                  border: '1px solid #0C0C0C',
                  borderRadius: 4,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
              >
                All Brands
              </button>
              
              {brands.map((brand) => (
                <button
                  key={brand._id}
                  onClick={() => updateFilter('brand', brand.slug)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: selectedBrand === brand.slug ? '#0C0C0C' : 'transparent',
                    color: selectedBrand === brand.slug ? '#fff' : '#0C0C0C',
                    border: '1px solid #0C0C0C',
                    borderRadius: 4,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s'
                  }}
                >
                  {brand.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 14, color: '#666' }}>
              {totalProducts} {totalProducts === 1 ? 'product' : 'products'}
            </span>
            
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 12,
                  cursor: 'pointer'
                }}
              >
                <X size={14} />
                Clear Filters
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <select
              value={sortBy}
              onChange={(e) => updateFilter('sort', e.target.value)}
              style={{
                padding: '10px 16px',
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: 4,
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
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 13,
                cursor: 'pointer'
              }}
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div style={{ backgroundColor: '#fff', borderRadius: 8, padding: 24, marginBottom: 32, border: '1px solid #e5e5e5' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 600, color: '#0C0C0C', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Price Range
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => updateFilter('min_price', e.target.value)}
                    style={{ width: 100, padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }}
                  />
                  <span style={{ color: '#999' }}>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => updateFilter('max_price', e.target.value)}
                    style={{ width: 100, padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

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
                  style={{ backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e5e5', transition: 'all 0.3s', cursor: 'pointer' }}
                  onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.1)'}
                  onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}
                >
                  <div style={{ position: 'relative', aspectRatio: '1', backgroundColor: '#f5f5f5' }}>
                    {product.images?.[0]?.url ? (
                      <img src={product.images[0].url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: 14 }}>
                        No Image
                      </div>
                    )}
                    
                    {product.compare_price && product.compare_price > product.price && (
                      <div style={{ position: 'absolute', top: 12, left: 12, padding: '4px 10px', backgroundColor: '#dc2626', color: '#fff', fontSize: 11, fontWeight: 600, borderRadius: 4 }}>
                        {Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}% OFF
                      </div>
                    )}
                  </div>

                  <div style={{ padding: 20 }}>
                    {product.brand && (
                      <p style={{ fontSize: 11, color: '#B08B5C', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                        {brands.find(b => b.slug === product.brand)?.name || product.brand}
                      </p>
                    )}
                    
                    <h3 style={{ fontSize: 15, fontWeight: 500, color: '#0C0C0C', marginBottom: 8, lineHeight: 1.4 }}>
                      {product.name}
                    </h3>
                    
                    {product.specs && (
                      <p style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>
                        {[product.specs.movement, product.specs.case_size].filter(Boolean).join(' • ')}
                      </p>
                    )}
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 18, fontWeight: 700, color: '#0C0C0C' }}>
                        {formatPrice(product.price)}
                      </span>
                      {product.compare_price && product.compare_price > product.price && (
                        <span style={{ fontSize: 14, color: '#999', textDecoration: 'line-through' }}>
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
            <div style={{ width: 80, height: 80, margin: '0 auto 24px', backgroundColor: '#f5f5f5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SlidersHorizontal size={32} style={{ color: '#ccc' }} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 500, color: '#0C0C0C', marginBottom: 8 }}>No products found</h3>
            <p style={{ fontSize: 14, color: '#666', marginBottom: 24 }}>Try adjusting your filters</p>
            {hasActiveFilters && (
              <button onClick={clearAllFilters} style={{ padding: '12px 24px', backgroundColor: '#0C0C0C', color: '#fff', border: 'none', borderRadius: 4, fontSize: 14, cursor: 'pointer' }}>
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
                  border: '1px solid #ddd',
                  borderRadius: 4,
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

// Loading component
function LoadingWatch() {
  return (
    <div style={{ backgroundColor: '#F7F7F7', minHeight: '100vh' }}>
      <div style={{ backgroundColor: '#0C0C0C', padding: '48px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <h1 style={{ fontSize: 36, fontWeight: 300, color: '#fff', letterSpacing: 4, textAlign: 'center', marginBottom: 8 }}>
            WATCHES
          </h1>
          <p style={{ fontSize: 14, color: '#919191', textAlign: 'center', letterSpacing: 1 }}>
            Premium timepieces collection
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80 }}>
        <div style={{ width: 40, height: 40, border: '3px solid #B08B5C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    </div>
  );
}

// Main export with Suspense
export default function WatchPage() {
  return (
    <Suspense fallback={<LoadingWatch />}>
      <WatchContent />
    </Suspense>
  );
}
