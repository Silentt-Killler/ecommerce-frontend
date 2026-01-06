'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronDown, X, SlidersHorizontal, ShoppingBag } from 'lucide-react';
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

// Subcategory Circle Component
function SubcategoryCircle({ subcategory, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 8
      }}
    >
      <div style={{
        width: 70,
        height: 70,
        borderRadius: '50%',
        backgroundColor: isActive ? '#0C0C0C' : '#F3F4F6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        border: isActive ? '2px solid #0C0C0C' : '2px solid transparent'
      }}>
        <span style={{ 
          fontSize: 11, 
          fontWeight: 500, 
          color: isActive ? '#FFFFFF' : '#6B7280',
          textAlign: 'center',
          padding: 4
        }}>
          {subcategory.name.slice(0, 8)}
        </span>
      </div>
      <span style={{ 
        fontSize: 11, 
        color: isActive ? '#0C0C0C' : '#6B7280', 
        fontWeight: isActive ? 600 : 400,
        textAlign: 'center',
        maxWidth: 80
      }}>
        {subcategory.name}
      </span>
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
function WomenswearContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  
  // Get initial values from URL
  const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get('subcategory') || '');
  const [selectedPrice, setSelectedPrice] = useState(searchParams.get('price') || '');
  const [selectedSize, setSelectedSize] = useState(searchParams.get('size') || '');
  const [selectedColor, setSelectedColor] = useState(searchParams.get('color') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [openFilter, setOpenFilter] = useState('');

  // Filter options
  const priceOptions = [
    { label: 'Under ৳1,000', value: '0-1000' },
    { label: '৳1,000 - ৳2,500', value: '1000-2500' },
    { label: '৳2,500 - ৳5,000', value: '2500-5000' },
    { label: '৳5,000 - ৳10,000', value: '5000-10000' },
    { label: 'Above ৳10,000', value: '10000-999999' }
  ];

  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
  
  const colorOptions = ['Black', 'White', 'Red', 'Pink', 'Purple', 'Blue', 'Green', 'Yellow', 'Orange', 'Beige', 'Gold', 'Silver'];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' }
  ];

  // Update state when URL changes
  useEffect(() => {
    setSelectedSubcategory(searchParams.get('subcategory') || '');
    setSelectedPrice(searchParams.get('price') || '');
    setSelectedSize(searchParams.get('size') || '');
    setSelectedColor(searchParams.get('color') || '');
    setSortBy(searchParams.get('sort') || 'newest');
  }, [searchParams]);

  useEffect(() => {
    fetchSubcategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedSubcategory, selectedPrice, selectedSize, selectedColor, sortBy]);

  // Update URL when filters change
  const updateURL = (filters) => {
    const params = new URLSearchParams();
    if (filters.subcategory) params.set('subcategory', filters.subcategory);
    if (filters.price) params.set('price', filters.price);
    if (filters.size) params.set('size', filters.size);
    if (filters.color) params.set('color', filters.color);
    if (filters.sort && filters.sort !== 'newest') params.set('sort', filters.sort);
    
    const queryString = params.toString();
    router.push(`/womenswear${queryString ? '?' + queryString : ''}`, { scroll: false });
  };

  const handleSubcategoryChange = (sub) => {
    const newSub = selectedSubcategory === sub ? '' : sub;
    setSelectedSubcategory(newSub);
    updateURL({ subcategory: newSub, price: selectedPrice, size: selectedSize, color: selectedColor, sort: sortBy });
  };

  const handlePriceChange = (price) => {
    setSelectedPrice(price);
    updateURL({ subcategory: selectedSubcategory, price, size: selectedSize, color: selectedColor, sort: sortBy });
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    updateURL({ subcategory: selectedSubcategory, price: selectedPrice, size, color: selectedColor, sort: sortBy });
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    updateURL({ subcategory: selectedSubcategory, price: selectedPrice, size: selectedSize, color, sort: sortBy });
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    updateURL({ subcategory: selectedSubcategory, price: selectedPrice, size: selectedSize, color: selectedColor, sort });
  };

  const fetchSubcategories = async () => {
    try {
      const res = await api.get('/subcategories?parent=womenswear');
      setSubcategories(res.data.subcategories || res.data || []);
    } catch (error) {
      console.error('Failed to fetch subcategories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = '/products?category=womenswear&limit=20';
      
      if (selectedSubcategory) url += `&subcategory=${selectedSubcategory}`;
      if (selectedSize) url += `&size=${selectedSize}`;
      if (selectedColor) url += `&color=${selectedColor}`;
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
    setSelectedSubcategory('');
    setSelectedPrice('');
    setSelectedSize('');
    setSelectedColor('');
    setSortBy('newest');
    router.push('/womenswear', { scroll: false });
  };

  const hasActiveFilters = selectedSubcategory || selectedPrice || selectedSize || selectedColor;

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
              Womenswear
            </h1>
            <p style={{ fontSize: 14, color: '#6B7280', letterSpacing: 1 }}>
              Discover our collection of premium women's fashion
            </p>
          </div>

          {/* Subcategory Circles */}
          {subcategories.length > 0 && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: 16, 
              overflowX: 'auto',
              paddingBottom: 8,
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => handleSubcategoryChange('')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 8
                }}
              >
                <div style={{
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  backgroundColor: !selectedSubcategory ? '#0C0C0C' : '#F3F4F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}>
                  <span style={{ fontSize: 11, fontWeight: 500, color: !selectedSubcategory ? '#FFFFFF' : '#6B7280' }}>All</span>
                </div>
                <span style={{ fontSize: 11, color: !selectedSubcategory ? '#0C0C0C' : '#6B7280', fontWeight: !selectedSubcategory ? 600 : 400 }}>
                  All Items
                </span>
              </button>
              
              {subcategories.map((sub) => (
                <SubcategoryCircle
                  key={sub._id}
                  subcategory={sub}
                  isActive={selectedSubcategory === sub.slug}
                  onClick={() => handleSubcategoryChange(sub.slug)}
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

              <FilterDropdown
                label="Size"
                options={sizeOptions}
                value={selectedSize}
                onChange={handleSizeChange}
                isOpen={openFilter === 'size'}
                onToggle={() => setOpenFilter(openFilter === 'size' ? '' : 'size')}
              />

              <FilterDropdown
                label="Color"
                options={colorOptions}
                value={selectedColor}
                onChange={handleColorChange}
                isOpen={openFilter === 'color'}
                onToggle={() => setOpenFilter(openFilter === 'color' ? '' : 'color')}
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
            <ShoppingBag size={64} style={{ color: '#D0D0D0', marginBottom: 24 }} />
            <h2 style={{ fontSize: 20, fontWeight: 500, color: '#0C0C0C', marginBottom: 12 }}>
              No products found
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
          .womenswear-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .womenswear-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}

// Export with Suspense
export default function WomenswearPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <WomenswearContent />
    </Suspense>
  );
}
