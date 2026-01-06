'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronDown, X, SlidersHorizontal, Shirt } from 'lucide-react';
import api from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';

// Filter Dropdown Component - FIXED
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
            width: 180,
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 20,
            padding: '8px 0',
            maxHeight: 240,
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
                key={option}
                onClick={() => { onChange(option); onToggle(); }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 16px',
                  fontSize: 13,
                  color: value === option ? '#B08B5C' : '#374151',
                  fontWeight: value === option ? 600 : 400,
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
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
        padding: '8px',
        opacity: isActive ? 1 : 0.7,
        transition: 'opacity 0.2s'
      }}
    >
      <div style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        overflow: 'hidden',
        border: isActive ? '2px solid #B08B5C' : '2px solid transparent',
        backgroundColor: '#F3F4F6'
      }}>
        {subcategory.image_url ? (
          <Image
            src={subcategory.image_url}
            alt={subcategory.name}
            width={64}
            height={64}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: '#E5E7EB'
          }}>
            <Shirt size={24} style={{ color: '#9CA3AF' }} />
          </div>
        )}
      </div>
      <span style={{ 
        fontSize: 12, 
        color: isActive ? '#B08B5C' : '#6B7280',
        fontWeight: isActive ? 600 : 400,
        textAlign: 'center'
      }}>
        {subcategory.name}
      </span>
    </button>
  );
}

// Main Content
function MenswearContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  
  // ✅ FIX: Read initial values from URL
  const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get('subcategory') || '');
  const [selectedSize, setSelectedSize] = useState(searchParams.get('size') || '');
  const [selectedColor, setSelectedColor] = useState(searchParams.get('color') || '');
  const [selectedPrice, setSelectedPrice] = useState(searchParams.get('price') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [openFilter, setOpenFilter] = useState('');

  const sizeOptions = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];
  const colorOptions = ['Black', 'White', 'Navy', 'Gray', 'Blue', 'Brown', 'Green', 'Red'];
  const priceOptions = ['Under ৳1000', '৳1000 - ৳2000', '৳2000 - ৳5000', 'Above ৳5000'];
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' }
  ];

  // ✅ FIX: Update state when URL changes
  useEffect(() => {
    setSelectedSubcategory(searchParams.get('subcategory') || '');
    setSelectedSize(searchParams.get('size') || '');
    setSelectedColor(searchParams.get('color') || '');
    setSelectedPrice(searchParams.get('price') || '');
    setSortBy(searchParams.get('sort') || 'newest');
  }, [searchParams]);

  useEffect(() => {
    fetchSubcategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedSubcategory, selectedSize, selectedColor, selectedPrice, sortBy]);

  // ✅ FIX: Update URL when filter changes
  const updateURL = (filters) => {
    const params = new URLSearchParams();
    if (filters.subcategory) params.set('subcategory', filters.subcategory);
    if (filters.size) params.set('size', filters.size);
    if (filters.color) params.set('color', filters.color);
    if (filters.price) params.set('price', filters.price);
    if (filters.sort && filters.sort !== 'newest') params.set('sort', filters.sort);
    
    const queryString = params.toString();
    router.push(`/menswear${queryString ? '?' + queryString : ''}`, { scroll: false });
  };

  const handleSubcategoryChange = (slug) => {
    const newSub = selectedSubcategory === slug ? '' : slug;
    setSelectedSubcategory(newSub);
    updateURL({ subcategory: newSub, size: selectedSize, color: selectedColor, price: selectedPrice, sort: sortBy });
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    updateURL({ subcategory: selectedSubcategory, size, color: selectedColor, price: selectedPrice, sort: sortBy });
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    updateURL({ subcategory: selectedSubcategory, size: selectedSize, color, price: selectedPrice, sort: sortBy });
  };

  const handlePriceChange = (price) => {
    setSelectedPrice(price);
    updateURL({ subcategory: selectedSubcategory, size: selectedSize, color: selectedColor, price, sort: sortBy });
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    updateURL({ subcategory: selectedSubcategory, size: selectedSize, color: selectedColor, price: selectedPrice, sort });
  };

  const fetchSubcategories = async () => {
    try {
      const res = await api.get('/subcategories?parent=menswear&is_active=true');
      setSubcategories(res.data.subcategories || []);
    } catch (error) {
      console.error('Failed to fetch subcategories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = '/products?category=menswear&limit=20';
      
      if (selectedSubcategory) url += `&subcategory=${selectedSubcategory}`;
      if (selectedSize) url += `&size=${selectedSize}`;
      if (selectedColor) url += `&color=${selectedColor}`;
      if (sortBy) url += `&sort=${sortBy}`;
      
      if (selectedPrice) {
        if (selectedPrice === 'Under ৳1000') url += '&max_price=1000';
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
    setSelectedSubcategory('');
    setSelectedSize('');
    setSelectedColor('');
    setSelectedPrice('');
    setSortBy('newest');
    router.push('/menswear', { scroll: false });
  };

  const hasActiveFilters = selectedSubcategory || selectedSize || selectedColor || selectedPrice;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
      {/* Spacer */}
      <div style={{ height: 60 }} />

      {/* Breadcrumb */}
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: '16px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6B7280' }}>
            <a href="/" style={{ color: '#6B7280', textDecoration: 'none' }}>Home</a>
            <span>/</span>
            <span style={{ color: '#0C0C0C' }}>Menswear</span>
          </div>
        </div>
      </div>

      {/* Subcategory Circles */}
      {subcategories.length > 0 && (
        <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #F3F4F6', padding: '24px 0' }}>
          <div style={{ maxWidth: 1600, margin: '0 auto', padding: '0 40px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: 16, 
              overflowX: 'auto',
              justifyContent: 'center'
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
                  padding: '8px',
                  opacity: !selectedSubcategory ? 1 : 0.7
                }}
              >
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  backgroundColor: !selectedSubcategory ? '#0C0C0C' : '#F3F4F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: !selectedSubcategory ? '2px solid #B08B5C' : '2px solid transparent'
                }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: !selectedSubcategory ? '#FFFFFF' : '#6B7280' }}>All</span>
                </div>
                <span style={{ fontSize: 12, color: !selectedSubcategory ? '#B08B5C' : '#6B7280', fontWeight: !selectedSubcategory ? 600 : 400 }}>
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
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #F3F4F6', position: 'sticky', top: 60, zIndex: 20 }}>
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: '16px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
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

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
              <span style={{ fontSize: 13, color: '#6B7280' }}>{total} items</span>
              
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
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '32px 40px 60px' }}>
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
            <Shirt size={48} style={{ color: '#D1D5DB', marginBottom: 16 }} />
            <h3 style={{ fontSize: 18, fontWeight: 500, color: '#1F2937', marginBottom: 8 }}>No products found</h3>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>Try adjusting your filters</p>
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

export default function MenswearPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MenswearContent />
    </Suspense>
  );
}
