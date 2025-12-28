'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, X, ShoppingBag, SlidersHorizontal } from 'lucide-react';
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

// Subcategory Circle
function SubcategoryCircle({ subcategory, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        minWidth: 80,
        background: 'none',
        border: 'none',
        cursor: 'pointer'
      }}
    >
      <div style={{
        width: 70,
        height: 70,
        borderRadius: '50%',
        overflow: 'hidden',
        border: isActive ? '2px solid #B08B5C' : '2px solid transparent',
        transition: 'border-color 0.2s'
      }}>
        {subcategory.image_url ? (
          <Image
            src={subcategory.image_url}
            alt={subcategory.name}
            width={70}
            height={70}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ 
            width: '100%', 
            height: '100%', 
            background: 'linear-gradient(135deg, #FECDD3 0%, #FBCFE8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShoppingBag size={24} style={{ color: '#F472B6' }} />
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
function WomenswearContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [openFilter, setOpenFilter] = useState('');

  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
  const colorOptions = ['Black', 'White', 'Red', 'Blue', 'Pink', 'Purple', 'Yellow', 'Orange', 'Beige', 'Brown', 'Green'];
  const priceOptions = ['Under ৳1000', '৳1000 - ৳2000', '৳2000 - ৳5000', '৳5000 - ৳10000', 'Above ৳10000'];
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' }
  ];

  useEffect(() => {
    fetchSubcategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedSubcategory, selectedSize, selectedColor, selectedPrice, sortBy]);

  const fetchSubcategories = async () => {
    try {
      const res = await api.get('/subcategories?parent=womenswear&is_active=true');
      setSubcategories(res.data.subcategories || []);  // ✅ FIXED
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
      
      if (selectedPrice) {
        if (selectedPrice === 'Under ৳1000') url += '&max_price=1000';
        else if (selectedPrice === '৳1000 - ৳2000') url += '&min_price=1000&max_price=2000';
        else if (selectedPrice === '৳2000 - ৳5000') url += '&min_price=2000&max_price=5000';
        else if (selectedPrice === '৳5000 - ৳10000') url += '&min_price=5000&max_price=10000';
        else if (selectedPrice === 'Above ৳10000') url += '&min_price=10000';
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
  };

  const hasActiveFilters = selectedSubcategory || selectedSize || selectedColor || selectedPrice;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F7F7' }}>
      {/* Spacer */}
      <div style={{ height: 60 }} />

      {/* Breadcrumb */}
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: '16px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <Link href="/" style={{ color: '#6B7280', textDecoration: 'none' }}>Home</Link>
            <span style={{ color: '#D1D5DB' }}>/</span>
            <span style={{ color: '#0C0C0C', fontWeight: 500 }}>Womenswear</span>
          </div>
        </div>
      </div>

      {/* Title */}
      <div style={{ backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: '32px 40px' }}>
          <h1 style={{ fontSize: 36, fontWeight: 300, letterSpacing: 6, color: '#0C0C0C', margin: 0, textTransform: 'uppercase' }}>
            Womenswear
          </h1>
        </div>
      </div>

      {/* Subcategories */}
      {subcategories.length > 0 && (
        <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #F3F4F6' }}>
          <div style={{ maxWidth: 1600, margin: '0 auto', padding: '20px 40px' }}>
            <div style={{ display: 'flex', gap: 24, overflowX: 'auto', paddingBottom: 8 }}>
              <button
                onClick={() => setSelectedSubcategory('')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  minWidth: 80,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  backgroundColor: !selectedSubcategory ? '#B08B5C' : '#F3F4F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: !selectedSubcategory ? '2px solid #B08B5C' : '2px solid transparent'
                }}>
                  <span style={{ fontSize: 11, fontWeight: 500, color: !selectedSubcategory ? '#FFFFFF' : '#6B7280' }}>All</span>
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
                  onClick={() => setSelectedSubcategory(selectedSubcategory === sub.slug ? '' : sub.slug)}
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
              
              <FilterDropdown label="Price" options={priceOptions} value={selectedPrice} onChange={setSelectedPrice} isOpen={openFilter === 'price'} onToggle={() => setOpenFilter(openFilter === 'price' ? '' : 'price')} />
              <FilterDropdown label="Size" options={sizeOptions} value={selectedSize} onChange={setSelectedSize} isOpen={openFilter === 'size'} onToggle={() => setOpenFilter(openFilter === 'size' ? '' : 'size')} />
              <FilterDropdown label="Color" options={colorOptions} value={selectedColor} onChange={setSelectedColor} isOpen={openFilter === 'color'} onToggle={() => setOpenFilter(openFilter === 'color' ? '' : 'color')} />

              {hasActiveFilters && (
                <button onClick={clearAllFilters} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px', fontSize: 13, color: '#DC2626', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>
                  <X size={14} />Clear
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
              <span style={{ fontSize: 13, color: '#6B7280' }}>{total} items</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '10px 16px', border: '1px solid #D1D5DB', borderRadius: 20, fontSize: 13, fontWeight: 500, color: '#374151', backgroundColor: '#FFFFFF', cursor: 'pointer', outline: 'none' }}>
                {sortOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '40px 40px 60px' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{ width: 40, height: 40, border: '2px solid #B08B5C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : products.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 30 }}>
            {products.map((product) => <ProductCard key={product._id} product={product} />)}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <ShoppingBag size={48} style={{ color: '#D1D5DB', marginBottom: 16 }} />
            <h3 style={{ fontSize: 18, fontWeight: 500, color: '#1F2937', marginBottom: 8 }}>No products found</h3>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>Try adjusting your filters</p>
            <button onClick={clearAllFilters} style={{ padding: '12px 24px', backgroundColor: '#0C0C0C', color: '#FFFFFF', fontSize: 13, fontWeight: 500, borderRadius: 20, border: 'none', cursor: 'pointer' }}>
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F7F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '2px solid #B08B5C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );
}

export default function WomenswearPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <WomenswearContent />
    </Suspense>
  );
}
