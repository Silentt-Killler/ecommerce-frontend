'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, X, Package, SlidersHorizontal } from 'lucide-react';
import api from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';

// Mobile Filter Panel
function MobileFilterPanel({ isOpen, onClose, subcategories, selectedSubcategory, onSubcategoryChange, selectedSize, onSizeChange, selectedColor, onColorChange, selectedPrice, onPriceChange, onClear }) {
  const sizeOptions = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];
  const colorOptions = ['Black', 'White', 'Navy', 'Gray', 'Blue', 'Brown', 'Green', 'Red'];
  const priceOptions = ['Under ৳1000', '৳1000 - ৳2000', '৳2000 - ৳5000', 'Above ৳5000'];

  if (!isOpen) return null;

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100 }} onClick={onClose} />
      <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '85%', maxWidth: 320, backgroundColor: '#FFFFFF', zIndex: 101, display: 'flex', flexDirection: 'column', transform: isOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #E5E7EB' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0C0C0C', margin: 0 }}>Filters</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={24} color="#0C0C0C" /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {/* Subcategory */}
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#0C0C0C', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Category</h3>
            {[{ slug: '', name: 'All Items' }, ...subcategories].map((sub) => (
              <button key={sub.slug || 'all'} onClick={() => onSubcategoryChange(sub.slug)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', background: 'none', border: 'none', borderBottom: '1px solid #F3F4F6', cursor: 'pointer', width: '100%' }}>
                <span style={{ fontSize: 14, color: selectedSubcategory === sub.slug ? '#B08B5C' : '#374151', fontWeight: selectedSubcategory === sub.slug ? 600 : 400 }}>{sub.name}</span>
                {selectedSubcategory === sub.slug && <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#B08B5C' }} />}
              </button>
            ))}
          </div>

          {/* Size */}
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#0C0C0C', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Size</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {sizeOptions.map((size) => (
                <button key={size} onClick={() => onSizeChange(selectedSize === size ? '' : size)} style={{ padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', backgroundColor: selectedSize === size ? '#0C0C0C' : '#F3F4F6', color: selectedSize === size ? '#FFFFFF' : '#374151' }}>{size}</button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#0C0C0C', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Color</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {colorOptions.map((color) => (
                <button key={color} onClick={() => onColorChange(selectedColor === color ? '' : color)} style={{ padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', backgroundColor: selectedColor === color ? '#0C0C0C' : '#F3F4F6', color: selectedColor === color ? '#FFFFFF' : '#374151' }}>{color}</button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#0C0C0C', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Price</h3>
            {[{ value: '', label: 'All Prices' }, ...priceOptions.map(p => ({ value: p, label: p }))].map((price) => (
              <button key={price.value || 'all'} onClick={() => onPriceChange(price.value)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', background: 'none', border: 'none', borderBottom: '1px solid #F3F4F6', cursor: 'pointer', width: '100%' }}>
                <span style={{ fontSize: 14, color: selectedPrice === price.value ? '#B08B5C' : '#374151', fontWeight: selectedPrice === price.value ? 600 : 400 }}>{price.label}</span>
                {selectedPrice === price.value && <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#B08B5C' }} />}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '16px 20px', borderTop: '1px solid #E5E7EB', display: 'flex', gap: 12 }}>
          <button onClick={onClear} style={{ flex: 1, padding: '14px', backgroundColor: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: 8, fontSize: 14, fontWeight: 500, color: '#374151', cursor: 'pointer' }}>Clear All</button>
          <button onClick={onClose} style={{ flex: 1, padding: '14px', backgroundColor: '#0C0C0C', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, color: '#FFFFFF', cursor: 'pointer' }}>Apply</button>
        </div>
      </div>
    </>
  );
}

// Desktop Filter Dropdown
function FilterDropdown({ label, options, value, onChange, isOpen, onToggle }) {
  return (
    <div style={{ position: 'relative', zIndex: isOpen ? 100 : 1 }}>
      <button onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', border: value ? '1px solid #0C0C0C' : '1px solid #D1D5DB', borderRadius: 20, fontSize: 13, fontWeight: 500, backgroundColor: value ? '#0C0C0C' : '#FFFFFF', color: value ? '#FFFFFF' : '#374151', cursor: 'pointer' }}>
        {label}{value && `: ${value}`}
        <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }} />
      </button>
      {isOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={onToggle} />
          <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 8, width: 200, backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, boxShadow: '0 10px 40px rgba(0,0,0,0.15)', zIndex: 100, padding: '8px 0', maxHeight: 280, overflowY: 'auto' }}>
            <button onClick={() => { onChange(''); onToggle(); }} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', fontSize: 13, color: !value ? '#B08B5C' : '#374151', fontWeight: !value ? 600 : 400, backgroundColor: !value ? '#FDF8F3' : 'transparent', border: 'none', cursor: 'pointer' }}>All {label}</button>
            {options.map((opt) => (
              <button key={opt} onClick={() => { onChange(opt); onToggle(); }} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', fontSize: 13, color: value === opt ? '#B08B5C' : '#374151', fontWeight: value === opt ? 600 : 400, backgroundColor: value === opt ? '#FDF8F3' : 'transparent', border: 'none', cursor: 'pointer' }}>{opt}</button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Subcategory Circle
function SubcategoryCircle({ subcategory, isActive, onClick, isMobile }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: isMobile ? 60 : 80, background: 'none', border: 'none', cursor: 'pointer' }}>
      <div style={{ width: isMobile ? 50 : 70, height: isMobile ? 50 : 70, borderRadius: '50%', overflow: 'hidden', border: isActive ? '2px solid #B08B5C' : '2px solid transparent', transition: 'border-color 0.2s' }}>
        {subcategory.image_url ? (
          <Image src={subcategory.image_url} alt={subcategory.name} width={isMobile ? 50 : 70} height={isMobile ? 50 : 70} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #E5E7EB 0%, #D1D5DB 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={isMobile ? 18 : 24} style={{ color: '#9CA3AF' }} />
          </div>
        )}
      </div>
      <span style={{ fontSize: isMobile ? 10 : 12, color: isActive ? '#B08B5C' : '#6B7280', fontWeight: isActive ? 600 : 400, textAlign: 'center' }}>{subcategory.name}</span>
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
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

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

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setSelectedSubcategory(searchParams.get('subcategory') || '');
    setSelectedSize(searchParams.get('size') || '');
    setSelectedColor(searchParams.get('color') || '');
    setSelectedPrice(searchParams.get('price') || '');
    setSortBy(searchParams.get('sort') || 'newest');
  }, [searchParams]);

  useEffect(() => { fetchSubcategories(); }, []);
  useEffect(() => { fetchProducts(); }, [selectedSubcategory, selectedSize, selectedColor, selectedPrice, sortBy]);

  const updateURL = (filters) => {
    const params = new URLSearchParams();
    if (filters.subcategory) params.set('subcategory', filters.subcategory);
    if (filters.size) params.set('size', filters.size);
    if (filters.color) params.set('color', filters.color);
    if (filters.price) params.set('price', filters.price);
    if (filters.sort && filters.sort !== 'newest') params.set('sort', filters.sort);
    router.push(`/menswear${params.toString() ? '?' + params.toString() : ''}`, { scroll: false });
  };

  const handleSubcategoryChange = (slug) => {
    const newSub = selectedSubcategory === slug ? '' : slug;
    setSelectedSubcategory(newSub);
    updateURL({ subcategory: newSub, size: selectedSize, color: selectedColor, price: selectedPrice, sort: sortBy });
  };

  const handleSizeChange = (size) => { setSelectedSize(size); setOpenFilter(''); updateURL({ subcategory: selectedSubcategory, size, color: selectedColor, price: selectedPrice, sort: sortBy }); };
  const handleColorChange = (color) => { setSelectedColor(color); setOpenFilter(''); updateURL({ subcategory: selectedSubcategory, size: selectedSize, color, price: selectedPrice, sort: sortBy }); };
  const handlePriceChange = (price) => { setSelectedPrice(price); setOpenFilter(''); updateURL({ subcategory: selectedSubcategory, size: selectedSize, color: selectedColor, price, sort: sortBy }); };
  const handleSortChange = (sort) => { setSortBy(sort); updateURL({ subcategory: selectedSubcategory, size: selectedSize, color: selectedColor, price: selectedPrice, sort }); };

  const fetchSubcategories = async () => {
    try {
      const res = await api.get('/subcategories?parent=menswear&is_active=true');
      setSubcategories(res.data.subcategories || []);
    } catch (error) { console.error('Failed to fetch subcategories:', error); }
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
    } catch (error) { console.error('Failed to fetch products:', error); }
    finally { setLoading(false); }
  };

  const clearAllFilters = () => {
    setSelectedSubcategory(''); setSelectedSize(''); setSelectedColor(''); setSelectedPrice(''); setSortBy('newest'); setOpenFilter('');
    router.push('/menswear', { scroll: false });
  };

  const hasActiveFilters = selectedSubcategory || selectedSize || selectedColor || selectedPrice;
  const activeFilterCount = [selectedSubcategory, selectedSize, selectedColor, selectedPrice].filter(Boolean).length;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', paddingBottom: isMobile ? 90 : 0 }}>
      <div style={{ height: isMobile ? 56 : 60 }} />

      <MobileFilterPanel 
        isOpen={showMobileFilter} 
        onClose={() => setShowMobileFilter(false)} 
        subcategories={subcategories} 
        selectedSubcategory={selectedSubcategory} 
        onSubcategoryChange={handleSubcategoryChange} 
        selectedSize={selectedSize} 
        onSizeChange={handleSizeChange} 
        selectedColor={selectedColor} 
        onColorChange={handleColorChange} 
        selectedPrice={selectedPrice} 
        onPriceChange={handlePriceChange} 
        onClear={clearAllFilters} 
      />

      {!isMobile && (
        <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #F3F4F6' }}>
          <div style={{ maxWidth: 1600, margin: '0 auto', padding: '16px 40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <Link href="/" style={{ color: '#6B7280', textDecoration: 'none' }}>Home</Link>
              <span style={{ color: '#D1D5DB' }}>/</span>
              <span style={{ color: '#0C0C0C', fontWeight: 500 }}>Menswear</span>
            </div>
          </div>
        </div>
      )}

      <div style={{ backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: isMobile ? '20px 16px' : '32px 40px' }}>
          <h1 style={{ fontSize: isMobile ? 24 : 36, fontWeight: 300, letterSpacing: isMobile ? 3 : 6, color: '#0C0C0C', margin: 0, textTransform: 'uppercase', textAlign: isMobile ? 'center' : 'left' }}>Menswear</h1>
        </div>
      </div>

      {/* Subcategory Circles */}
      {subcategories.length > 0 && (
        <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #F3F4F6' }}>
          <div style={{ maxWidth: 1600, margin: '0 auto', padding: isMobile ? '16px' : '20px 40px' }}>
            <div style={{ display: 'flex', gap: isMobile ? 16 : 24, overflowX: 'auto', paddingBottom: 8 }} className="hide-scrollbar">
              <button onClick={() => handleSubcategoryChange('')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: isMobile ? 60 : 80, background: 'none', border: 'none', cursor: 'pointer' }}>
                <div style={{ width: isMobile ? 50 : 70, height: isMobile ? 50 : 70, borderRadius: '50%', backgroundColor: !selectedSubcategory ? '#B08B5C' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', border: !selectedSubcategory ? '2px solid #B08B5C' : '2px solid transparent' }}>
                  <span style={{ fontSize: isMobile ? 10 : 11, fontWeight: 500, color: !selectedSubcategory ? '#FFFFFF' : '#6B7280' }}>All</span>
                </div>
                <span style={{ fontSize: isMobile ? 10 : 12, color: !selectedSubcategory ? '#B08B5C' : '#6B7280', fontWeight: !selectedSubcategory ? 600 : 400 }}>All Items</span>
              </button>
              {subcategories.map((sub) => (
                <SubcategoryCircle key={sub._id} subcategory={sub} isActive={selectedSubcategory === sub.slug} onClick={() => handleSubcategoryChange(sub.slug)} isMobile={isMobile} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #F3F4F6', position: 'sticky', top: isMobile ? 56 : 60, zIndex: 50 }}>
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: isMobile ? '12px 16px' : '16px 40px' }}>
          {isMobile ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button onClick={() => setShowMobileFilter(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
                <SlidersHorizontal size={16} />Filters
                {activeFilterCount > 0 && <span style={{ backgroundColor: '#B08B5C', color: '#FFFFFF', fontSize: 11, fontWeight: 600, padding: '2px 6px', borderRadius: 10 }}>{activeFilterCount}</span>}
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: '#6B7280' }}>Sort:</span>
                <select value={sortBy} onChange={(e) => handleSortChange(e.target.value)} style={{ padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, fontWeight: 500, color: '#374151', backgroundColor: '#FFFFFF', cursor: 'pointer', outline: 'none' }}>
                  {sortOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <SlidersHorizontal size={18} style={{ color: '#9CA3AF' }} />
                <FilterDropdown label="Price" options={priceOptions} value={selectedPrice} onChange={handlePriceChange} isOpen={openFilter === 'price'} onToggle={() => setOpenFilter(openFilter === 'price' ? '' : 'price')} />
                <FilterDropdown label="Size" options={sizeOptions} value={selectedSize} onChange={handleSizeChange} isOpen={openFilter === 'size'} onToggle={() => setOpenFilter(openFilter === 'size' ? '' : 'size')} />
                <FilterDropdown label="Color" options={colorOptions} value={selectedColor} onChange={handleColorChange} isOpen={openFilter === 'color'} onToggle={() => setOpenFilter(openFilter === 'color' ? '' : 'color')} />
                {hasActiveFilters && <button onClick={clearAllFilters} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px', fontSize: 13, color: '#DC2626', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}><X size={14} />Clear</button>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 13, color: '#6B7280' }}>{total} items</span>
                <select value={sortBy} onChange={(e) => handleSortChange(e.target.value)} style={{ padding: '10px 16px', border: '1px solid #D1D5DB', borderRadius: 20, fontSize: 13, fontWeight: 500, color: '#374151', backgroundColor: '#FFFFFF', cursor: 'pointer', outline: 'none' }}>
                  {sortOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: isMobile ? '20px 16px 40px' : '40px 40px 60px' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{ width: 40, height: 40, border: '2px solid #B08B5C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : products.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? 16 : 30 }}>
            {products.map((product) => <ProductCard key={product._id} product={product} isMobile={isMobile} />)}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Package size={48} style={{ color: '#D1D5DB', marginBottom: 16 }} />
            <h3 style={{ fontSize: 18, fontWeight: 500, color: '#1F2937', marginBottom: 8 }}>No products found</h3>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>Try adjusting your filters</p>
            <button onClick={clearAllFilters} style={{ padding: '12px 24px', backgroundColor: '#0C0C0C', color: '#FFFFFF', fontSize: 13, fontWeight: 500, borderRadius: 8, border: 'none', cursor: 'pointer' }}>Clear Filters</button>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

export default function MenswearPage() {
  return <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 40, height: 40, border: '2px solid #B08B5C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /></div>}><MenswearContent /></Suspense>;
}
