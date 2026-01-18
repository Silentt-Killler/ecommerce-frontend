'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, X, Watch, SlidersHorizontal } from 'lucide-react';
import api from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';

// Mobile Filter Slide Panel
function MobileFilterPanel({ isOpen, onClose, brands, selectedBrand, onBrandChange, selectedPrice, onPriceChange, onClear }) {
  const priceOptions = ['Under ৳500', '৳500 - ৳1000', '৳1000 - ৳2000', '৳2000 - ৳5000', 'Above ৳5000'];

  if (!isOpen) return null;

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100 }} onClick={onClose} />
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: '85%', maxWidth: 320,
        backgroundColor: '#FFFFFF', zIndex: 101, display: 'flex', flexDirection: 'column',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #E5E7EB' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0C0C0C', margin: 0 }}>Filters</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={24} color="#0C0C0C" /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {/* Brand Filter */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0C0C0C', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Brand</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <button onClick={() => onBrandChange('')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', background: 'none', border: 'none', borderBottom: '1px solid #F3F4F6', cursor: 'pointer', width: '100%' }}>
                <span style={{ fontSize: 14, color: !selectedBrand ? '#B08B5C' : '#374151', fontWeight: !selectedBrand ? 600 : 400 }}>All Brands</span>
                {!selectedBrand && <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#B08B5C' }} />}
              </button>
              {brands.map((brand) => (
                <button key={brand._id} onClick={() => onBrandChange(brand.slug)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', background: 'none', border: 'none', borderBottom: '1px solid #F3F4F6', cursor: 'pointer', width: '100%' }}>
                  <span style={{ fontSize: 14, color: selectedBrand === brand.slug ? '#B08B5C' : '#374151', fontWeight: selectedBrand === brand.slug ? 600 : 400 }}>{brand.name}</span>
                  {selectedBrand === brand.slug && <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#B08B5C' }} />}
                </button>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0C0C0C', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Price</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <button onClick={() => onPriceChange('')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', background: 'none', border: 'none', borderBottom: '1px solid #F3F4F6', cursor: 'pointer', width: '100%' }}>
                <span style={{ fontSize: 14, color: !selectedPrice ? '#B08B5C' : '#374151', fontWeight: !selectedPrice ? 600 : 400 }}>All Prices</span>
                {!selectedPrice && <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#B08B5C' }} />}
              </button>
              {priceOptions.map((price) => (
                <button key={price} onClick={() => onPriceChange(price)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', background: 'none', border: 'none', borderBottom: '1px solid #F3F4F6', cursor: 'pointer', width: '100%' }}>
                  <span style={{ fontSize: 14, color: selectedPrice === price ? '#B08B5C' : '#374151', fontWeight: selectedPrice === price ? 600 : 400 }}>{price}</span>
                  {selectedPrice === price && <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#B08B5C' }} />}
                </button>
              ))}
            </div>
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
        <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
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

function WatchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  
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
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setSelectedBrand(searchParams.get('brand') || '');
    setSelectedPrice(searchParams.get('price') || '');
    setSortBy(searchParams.get('sort') || 'newest');
  }, [searchParams]);

  useEffect(() => { fetchBrands(); }, []);
  useEffect(() => { fetchProducts(); }, [selectedBrand, selectedPrice, sortBy]);

  const updateURL = (brand, price, sort) => {
    const params = new URLSearchParams();
    if (brand) params.set('brand', brand);
    if (price) params.set('price', price);
    if (sort && sort !== 'newest') params.set('sort', sort);
    router.push(`/watch${params.toString() ? '?' + params.toString() : ''}`, { scroll: false });
  };

  const handleBrandChange = (brandSlug) => {
    const newBrand = selectedBrand === brandSlug ? '' : brandSlug;
    setSelectedBrand(newBrand);
    updateURL(newBrand, selectedPrice, sortBy);
  };

  const handlePriceChange = (price) => { setSelectedPrice(price); setOpenFilter(''); updateURL(selectedBrand, price, sortBy); };
  const handleSortChange = (sort) => { setSortBy(sort); updateURL(selectedBrand, selectedPrice, sort); };

  const fetchBrands = async () => {
    try {
      const res = await api.get('/brands?category=watch');
      setBrands(res.data || []);
    } catch (e) { console.error(e); }
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
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const clearAllFilters = () => { setSelectedBrand(''); setSelectedPrice(''); setSortBy('newest'); setOpenFilter(''); router.push('/watch', { scroll: false }); };
  const hasActiveFilters = selectedBrand || selectedPrice;
  const activeFilterCount = [selectedBrand, selectedPrice].filter(Boolean).length;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', paddingBottom: isMobile ? 90 : 0 }}>
      <div style={{ height: isMobile ? 56 : 60 }} />

      <MobileFilterPanel isOpen={showMobileFilter} onClose={() => setShowMobileFilter(false)} brands={brands} selectedBrand={selectedBrand} onBrandChange={handleBrandChange} selectedPrice={selectedPrice} onPriceChange={handlePriceChange} onClear={clearAllFilters} />

      {!isMobile && (
        <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #F3F4F6' }}>
          <div style={{ maxWidth: 1600, margin: '0 auto', padding: '16px 40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <Link href="/" style={{ color: '#6B7280', textDecoration: 'none' }}>Home</Link>
              <span style={{ color: '#D1D5DB' }}>/</span>
              <span style={{ color: '#0C0C0C', fontWeight: 500 }}>Watches</span>
            </div>
          </div>
        </div>
      )}

      <div style={{ backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: isMobile ? '20px 16px' : '32px 40px' }}>
          <h1 style={{ fontSize: isMobile ? 24 : 36, fontWeight: 300, letterSpacing: isMobile ? 3 : 6, color: '#0C0C0C', margin: 0, textTransform: 'uppercase', textAlign: isMobile ? 'center' : 'left' }}>Watches</h1>
        </div>
      </div>

      {/* Brand Pills - Desktop Only */}
      {!isMobile && brands.length > 0 && (
        <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #F3F4F6' }}>
          <div style={{ maxWidth: 1600, margin: '0 auto', padding: '16px 40px' }}>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
              <button onClick={() => handleBrandChange('')} style={{ padding: '10px 20px', borderRadius: 20, fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', border: 'none', cursor: 'pointer', backgroundColor: !selectedBrand ? '#0C0C0C' : '#FFFFFF', color: !selectedBrand ? '#FFFFFF' : '#374151', boxShadow: !selectedBrand ? 'none' : '0 0 0 1px #D1D5DB' }}>All Brands</button>
              {brands.map((brand) => (
                <button key={brand._id} onClick={() => handleBrandChange(brand.slug)} style={{ padding: '10px 20px', borderRadius: 20, fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', border: 'none', cursor: 'pointer', backgroundColor: selectedBrand === brand.slug ? '#0C0C0C' : '#FFFFFF', color: selectedBrand === brand.slug ? '#FFFFFF' : '#374151', boxShadow: selectedBrand === brand.slug ? 'none' : '0 0 0 1px #D1D5DB' }}>{brand.name}</button>
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
            <Watch size={48} style={{ color: '#D1D5DB', marginBottom: 16 }} />
            <h3 style={{ fontSize: 18, fontWeight: 500, color: '#1F2937', marginBottom: 8 }}>No watches found</h3>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>Try adjusting your filters</p>
            <button onClick={clearAllFilters} style={{ padding: '12px 24px', backgroundColor: '#0C0C0C', color: '#FFFFFF', fontSize: 13, fontWeight: 500, borderRadius: 8, border: 'none', cursor: 'pointer' }}>Clear Filters</button>
          </div>
        )}
      </div>

      <style jsx global>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function WatchPage() {
  return <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 40, height: 40, border: '2px solid #B08B5C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /></div>}><WatchContent /></Suspense>;
}
