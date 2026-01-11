'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, X, Watch, SlidersHorizontal } from 'lucide-react';
import api from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';

// Filter Dropdown Component - Z-INDEX FIXED
function FilterDropdown({ label, options, value, onChange, isOpen, onToggle }) {
  return (
    <div style={{ position: 'relative', zIndex: isOpen ? 100 : 1 }}>
      <button
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 16px',
          border: value ? '1px solid #0C0C0C' : '1px solid #D1D5DB',
          borderRadius: 20,
          fontSize: 13,
          fontWeight: 500,
          backgroundColor: value ? '#0C0C0C' : '#FFFFFF',
          color: value ? '#FFFFFF' : '#374151',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        {label}{value && `: ${value}`}
        <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            style={{ 
              position: 'fixed', 
              inset: 0, 
              zIndex: 90 
            }} 
            onClick={onToggle} 
          />
          {/* Dropdown Menu */}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 8,
            width: 200,
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 12,
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            zIndex: 100,
            padding: '8px 0',
            maxHeight: 280,
            overflowY: 'auto'
          }}>
            <button
              onClick={() => { onChange(''); onToggle(); }}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '12px 16px',
                fontSize: 13,
                color: !value ? '#B08B5C' : '#374151',
                fontWeight: !value ? 600 : 400,
                backgroundColor: !value ? '#FDF8F3' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.15s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#F9FAFB'}
              onMouseLeave={(e) => e.target.style.backgroundColor = !value ? '#FDF8F3' : 'transparent'}
            >
              All {label}
            </button>
            {options.map((option) => (
              <button
                key={option}
                onClick={() => { onChange(option); onToggle(); }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 16px',
                  fontSize: 13,
                  color: value === option ? '#B08B5C' : '#374151',
                  fontWeight: value === option ? 600 : 400,
                  backgroundColor: value === option ? '#FDF8F3' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#F9FAFB'}
                onMouseLeave={(e) => e.target.style.backgroundColor = value === option ? '#FDF8F3' : 'transparent'}
              >
                {option}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Brand Pill Component
function BrandPill({ brand, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 20px',
        borderRadius: 20,
        fontSize: 13,
        fontWeight: 500,
        whiteSpace: 'nowrap',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s',
        backgroundColor: isActive ? '#0C0C0C' : '#FFFFFF',
        color: isActive ? '#FFFFFF' : '#374151',
        boxShadow: isActive ? 'none' : '0 0 0 1px #D1D5DB'
      }}
    >
      {brand.name}
    </button>
  );
}

// Main Content Component
function WatchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [selectedPrice, setSelectedPrice] = useState(searchParams.get('price') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [openFilter, setOpenFilter] = useState('');

  const priceOptions = ['Under ৳500', '৳500 - ৳1000', '৳1000 - ৳2000', '৳2000 - ৳5000', 'Above ৳5000'];
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' }
  ];

  useEffect(() => {
    setSelectedBrand(searchParams.get('brand') || '');
    setSelectedPrice(searchParams.get('price') || '');
    setSortBy(searchParams.get('sort') || 'newest');
  }, [searchParams]);

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedBrand, selectedPrice, sortBy]);

  const updateURL = (brand, price, sort) => {
    const params = new URLSearchParams();
    if (brand) params.set('brand', brand);
    if (price) params.set('price', price);
    if (sort && sort !== 'newest') params.set('sort', sort);
    const query = params.toString();
    router.push(`/watch${query ? '?' + query : ''}`, { scroll: false });
  };

  const handleBrandChange = (brandSlug) => {
    const newBrand = selectedBrand === brandSlug ? '' : brandSlug;
    setSelectedBrand(newBrand);
    updateURL(newBrand, selectedPrice, sortBy);
  };

  const handlePriceChange = (price) => {
    setSelectedPrice(price);
    updateURL(selectedBrand, price, sortBy);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    updateURL(selectedBrand, selectedPrice, sort);
  };

  const fetchBrands = async () => {
    try {
      const res = await api.get('/brands?category=watch');
      setBrands(res.data || []);
    } catch (error) {
      console.error('Failed to fetch brands:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = '/products?category=watch&limit=20';
      
      if (selectedBrand) url += `&brand=${selectedBrand}`;
      if (sortBy) url += `&sort=${sortBy}`;
      
      if (selectedPrice) {
        if (selectedPrice === 'Under ৳500') url += '&max_price=500';
        else if (selectedPrice === '৳500 - ৳1000') url += '&min_price=500&max_price=1000';
        else if (selectedPrice === '৳1000 - ৳2000') url += '&min_price=1000&max_price=2000';
        else if (selectedPrice === '৳2000 - ৳5000') url += '&min_price=2000&max_price=5000';
        else if (selectedPrice === 'Above ৳5000') url += '&min_price=5000';
      }

      const res = await api.get(url);
      setProducts(res.data.products || []);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearAllFilters = () => {
    setSelectedBrand('');
    setSelectedPrice('');
    setSortBy('newest');
    setOpenFilter('');
    router.push('/watch', { scroll: false });
  };

  const hasActiveFilters = selectedBrand || selectedPrice;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
      <div style={{ height: 60 }} />

      {/* Breadcrumb */}
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: '16px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <Link href="/" style={{ color: '#6B7280', textDecoration: 'none' }}>Home</Link>
            <span style={{ color: '#D1D5DB' }}>/</span>
            <span style={{ color: '#0C0C0C', fontWeight: 500 }}>Watches</span>
          </div>
        </div>
      </div>

      {/* Page Title */}
      <div style={{ backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: '32px 40px' }}>
          <h1 style={{ fontSize: 36, fontWeight: 300, letterSpacing: 6, color: '#0C0C0C', margin: 0, textTransform: 'uppercase' }}>
            Watches
          </h1>
        </div>
      </div>

      {/* Brand Bar */}
      {brands.length > 0 && (
        <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #F3F4F6' }}>
          <div style={{ maxWidth: 1600, margin: '0 auto', padding: '16px 40px' }}>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
              <button
                onClick={() => handleBrandChange('')}
                style={{
                  padding: '10px 20px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: !selectedBrand ? '#0C0C0C' : '#FFFFFF',
                  color: !selectedBrand ? '#FFFFFF' : '#374151',
                  boxShadow: !selectedBrand ? 'none' : '0 0 0 1px #D1D5DB'
                }}
              >
                All Brands
              </button>
              {brands.map((brand) => (
                <BrandPill
                  key={brand._id}
                  brand={brand}
                  isActive={selectedBrand === brand.slug}
                  onClick={() => handleBrandChange(brand.slug)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar - HIGH Z-INDEX */}
      <div style={{ 
        backgroundColor: '#FFFFFF', 
        borderBottom: '1px solid #F3F4F6',
        position: 'sticky',
        top: 60,
        zIndex: 50,
        overflow: 'visible'
      }}>
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: '16px 40px', overflow: 'visible' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, overflow: 'visible' }}>
            {/* Left - Filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflow: 'visible' }}>
              <SlidersHorizontal size={18} style={{ color: '#9CA3AF', flexShrink: 0 }} />
              
              <FilterDropdown
                label="Price"
                options={priceOptions}
                value={selectedPrice}
                onChange={handlePriceChange}
                isOpen={openFilter === 'price'}
                onToggle={() => setOpenFilter(openFilter === 'price' ? '' : 'price')}
              />

              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '8px 12px',
                    fontSize: 13,
                    color: '#DC2626',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <X size={14} />
                  Clear
                </button>
              )}
            </div>

            {/* Right - Sort & Count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
              <span style={{ fontSize: 13, color: '#6B7280' }}>
                {total} items
              </span>
              
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                style={{
                  padding: '10px 16px',
                  border: '1px solid #D1D5DB',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#374151',
                  backgroundColor: '#FFFFFF',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid - LOWER Z-INDEX */}
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '40px 40px 60px', position: 'relative', zIndex: 1 }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{ width: 40, height: 40, border: '2px solid #B08B5C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : products.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 30 }}>
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Watch size={48} style={{ color: '#D1D5DB', marginBottom: 16 }} />
            <h3 style={{ fontSize: 18, fontWeight: 500, color: '#1F2937', marginBottom: 8 }}>No watches found</h3>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>Try adjusting your filters or browse all watches</p>
            <button onClick={clearAllFilters} style={{ padding: '12px 24px', backgroundColor: '#0C0C0C', color: '#FFFFFF', fontSize: 13, fontWeight: 500, borderRadius: 20, border: 'none', cursor: 'pointer' }}>
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '2px solid #B08B5C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <WatchContent />
    </Suspense>
  );
}
