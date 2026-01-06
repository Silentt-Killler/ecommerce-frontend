'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, X, Watch, SlidersHorizontal } from 'lucide-react';
import api from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';

// Filter Dropdown Component
function FilterDropdown({ label, options, value, onChange, isOpen, onToggle }) {
  return (
    <div style={{ position: 'relative' }}>
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
          backgroundColor: value ? '#0C0C0C' : 'transparent',
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
          <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={onToggle} />
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 8,
            width: 200,
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 20,
            padding: '8px 0',
            maxHeight: 280,
            overflowY: 'auto'
          }}>
            <button
              onClick={() => { onChange(''); onToggle(); }}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '10px 16px',
                fontSize: 13,
                color: !value ? '#B08B5C' : '#374151',
                fontWeight: !value ? 600 : 400,
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              All {label}
            </button>
            {options.map((option) => (
              <button
                key={typeof option === 'object' ? option.value : option}
                onClick={() => { onChange(typeof option === 'object' ? option.value : option); onToggle(); }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 16px',
                  fontSize: 13,
                  color: value === (typeof option === 'object' ? option.value : option) ? '#B08B5C' : '#374151',
                  fontWeight: value === (typeof option === 'object' ? option.value : option) ? 600 : 400,
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {typeof option === 'object' ? option.label : option}
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

// Loading Component
function LoadingSpinner() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #B08B5C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
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
  
  // Get initial values from URL
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [selectedPrice, setSelectedPrice] = useState(searchParams.get('price') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [openFilter, setOpenFilter] = useState('');

  // Price filter options with values
  const priceOptions = [
    { label: 'Under ৳5,000', value: '0-5000' },
    { label: '৳5,000 - ৳10,000', value: '5000-10000' },
    { label: '৳10,000 - ৳25,000', value: '10000-25000' },
    { label: '৳25,000 - ৳50,000', value: '25000-50000' },
    { label: 'Above ৳50,000', value: '50000-999999' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' }
  ];

  // Update state when URL changes
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

  // Update URL when filters change
  const updateURL = (newBrand, newPrice, newSort) => {
    const params = new URLSearchParams();
    if (newBrand) params.set('brand', newBrand);
    if (newPrice) params.set('price', newPrice);
    if (newSort && newSort !== 'newest') params.set('sort', newSort);
    
    const queryString = params.toString();
    router.push(`/watch${queryString ? '?' + queryString : ''}`, { scroll: false });
  };

  const handleBrandChange = (brand) => {
    const newBrand = selectedBrand === brand ? '' : brand;
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
      
      // Parse price range
      if (selectedPrice) {
        const [minPrice, maxPrice] = selectedPrice.split('-');
        if (minPrice) url += `&min_price=${minPrice}`;
        if (maxPrice) url += `&max_price=${maxPrice}`;
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
    router.push('/watch', { scroll: false });
  };

  const hasActiveFilters = selectedBrand || selectedPrice;

  // Get display label for price
  const getPriceLabel = () => {
    if (!selectedPrice) return '';
    const option = priceOptions.find(p => p.value === selectedPrice);
    return option ? option.label : selectedPrice;
  };

  return (
    <div style={{ backgroundColor: '#F7F7F7', minHeight: '100vh' }}>
      {/* Hero Section */}
      <div style={{ 
        backgroundColor: '#FFFFFF', 
        borderBottom: '1px solid #E5E7EB',
        paddingTop: 80
      }}>
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: '60px 40px 40px' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h1 style={{ 
              fontSize: 32, 
              fontWeight: 300, 
              letterSpacing: 8, 
              textTransform: 'uppercase',
              marginBottom: 12,
              color: '#0C0C0C'
            }}>
              Watches
            </h1>
            <p style={{ fontSize: 14, color: '#6B7280', letterSpacing: 1 }}>
              Discover our curated collection of premium timepieces
            </p>
          </div>

          {/* Brand Pills */}
          {brands.length > 0 && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              overflowX: 'auto',
              paddingBottom: 8,
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
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
                  transition: 'all 0.2s',
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
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ 
        backgroundColor: '#FFFFFF', 
        borderBottom: '1px solid #F3F4F6',
        position: 'sticky',
        top: 60,
        zIndex: 20
      }}>
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: '16px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            {/* Left - Filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflowX: 'auto' }}>
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
                {total} {total === 1 ? 'item' : 'items'}
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

      {/* Products Grid */}
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '32px 40px 60px' }}>
        {loading ? (
          <LoadingSpinner />
        ) : products.length > 0 ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: 24 
          }}>
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <Watch size={64} style={{ color: '#D0D0D0', marginBottom: 24 }} />
            <h2 style={{ fontSize: 20, fontWeight: 500, color: '#0C0C0C', marginBottom: 12 }}>
              No watches found
            </h2>
            <p style={{ fontSize: 14, color: '#919191', marginBottom: 24 }}>
              Try adjusting your filters
            </p>
            <button
              onClick={clearAllFilters}
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
        )}
      </div>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 1024px) {
          .watch-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .watch-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}

// Export with Suspense
export default function WatchPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <WatchContent />
    </Suspense>
  );
}
