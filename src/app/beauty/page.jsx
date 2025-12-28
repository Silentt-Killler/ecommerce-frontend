'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, X, Sparkles, SlidersHorizontal } from 'lucide-react';
import api from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';

// Filter Dropdown Component
function FilterDropdown({ label, options, value, onChange, isOpen, onToggle }) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 px-4 py-2.5 border rounded-full text-sm font-medium transition-colors ${
          value ? 'border-[#0C0C0C] bg-[#0C0C0C] text-white' : 'border-gray-300 text-gray-700 hover:border-gray-400'
        }`}
      >
        {label}
        {value && `: ${value}`}
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={onToggle} />
          <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-2 max-h-64 overflow-auto">
            <button
              onClick={() => { onChange(''); onToggle(); }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${!value ? 'text-[#B08B5C] font-medium' : 'text-gray-700'}`}
            >
              All {label}
            </button>
            {options.map((option) => (
              <button
                key={option}
                onClick={() => { onChange(option); onToggle(); }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${value === option ? 'text-[#B08B5C] font-medium' : 'text-gray-700'}`}
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

// Subcategory Item Component
function SubcategoryItem({ subcategory, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 min-w-[70px] sm:min-w-[80px] transition-all ${
        isActive ? 'opacity-100' : 'opacity-70 hover:opacity-100'
      }`}
    >
      <div className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 transition-colors ${
        isActive ? 'border-[#B08B5C]' : 'border-transparent'
      }`}>
        {subcategory.image_url ? (
          <Image
            src={subcategory.image_url}
            alt={subcategory.name}
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
            <Sparkles size={20} className="text-purple-300 sm:w-6 sm:h-6" />
          </div>
        )}
      </div>
      <span className={`text-[11px] sm:text-xs md:text-sm font-medium text-center leading-tight ${
        isActive ? 'text-[#0C0C0C]' : 'text-gray-600'
      }`}>
        {subcategory.name}
      </span>
    </button>
  );
}

// Main Content Component
function BeautyContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  
  // Filters
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  // Dropdown states
  const [openFilter, setOpenFilter] = useState('');

  // Filter options - Beauty specific
  const typeOptions = ['Face', 'Body', 'Hair', 'Lips', 'Eyes', 'Nails', 'Fragrance', 'Skincare', 'Makeup'];
  const priceOptions = ['Under ৳500', '৳500 - ৳1000', '৳1000 - ৳2000', '৳2000 - ৳5000', 'Above ৳5000'];
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
  }, [selectedSubcategory, selectedType, selectedPrice, sortBy]);

  const fetchSubcategories = async () => {
    try {
      const res = await api.get('/subcategories?parent=beauty&is_active=true');
      setSubcategories(res.data.subcategories || []);
    } catch (error) {
      console.error('Failed to fetch subcategories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = '/products?category=beauty&limit=20';
      
      if (selectedSubcategory) url += `&subcategory=${selectedSubcategory}`;
      if (selectedType) url += `&type=${selectedType}`;
      if (sortBy) url += `&sort=${sortBy}`;
      
      // Price filter
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
    setSelectedSubcategory('');
    setSelectedType('');
    setSelectedPrice('');
    setSortBy('newest');
  };

  const hasActiveFilters = selectedSubcategory || selectedType || selectedPrice;

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Spacer for fixed header */}
      <div className="h-16 md:h-20" />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: '16px 40px' }}>
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link>
            <span className="text-gray-300">/</span>
            <span className="text-[#0C0C0C] font-medium">Beauty & Care</span>
          </div>
        </div>
      </div>

      {/* Page Title */}
      <div className="bg-white">
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: '32px 40px' }}>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-[0.15em] text-[#0C0C0C] uppercase">
            Beauty & Care
          </h1>
        </div>
      </div>

      {/* Subcategories Bar */}
      {subcategories.length > 0 && (
        <div className="bg-white border-b border-gray-100">
          <div style={{ maxWidth: 1600, margin: '0 auto', padding: '20px 40px' }}>
            <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-2 scrollbar-hide">
              {/* All Option */}
              <SubcategoryItem
                subcategory={{ name: 'All', image_url: null }}
                isActive={!selectedSubcategory}
                onClick={() => setSelectedSubcategory('')}
              />
              
              {/* Subcategories */}
              {subcategories.map((sub) => (
                <SubcategoryItem
                  key={sub._id}
                  subcategory={sub}
                  isActive={selectedSubcategory === sub.slug}
                  onClick={() => setSelectedSubcategory(sub.slug)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white border-b border-gray-100 sticky top-16 md:top-20 z-30">
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: '16px 40px' }}>
          <div className="flex items-center justify-between gap-4">
            {/* Left - Filters */}
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto">
              <SlidersHorizontal size={18} className="text-gray-400 flex-shrink-0" />
              
              <FilterDropdown
                label="Price"
                options={priceOptions}
                value={selectedPrice}
                onChange={setSelectedPrice}
                isOpen={openFilter === 'price'}
                onToggle={() => setOpenFilter(openFilter === 'price' ? '' : 'price')}
              />
              
              <FilterDropdown
                label="Type"
                options={typeOptions}
                value={selectedType}
                onChange={setSelectedType}
                isOpen={openFilter === 'type'}
                onToggle={() => setOpenFilter(openFilter === 'type' ? '' : 'type')}
              />

              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:text-red-700 whitespace-nowrap"
                >
                  <X size={14} />
                  Clear
                </button>
              )}
            </div>

            {/* Right - Sort & Count */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <span className="text-sm text-gray-500 hidden sm:inline">
                {total} items
              </span>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 bg-white focus:outline-none focus:border-gray-400 cursor-pointer"
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
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-[#B08B5C] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Sparkles size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No products found</h3>
            <p className="text-gray-500 text-sm mb-6">
              Try adjusting your filters or browse all products
            </p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-3 bg-[#0C0C0C] text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Loading Fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[#B08B5C] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// Main Page Export
export default function BeautyPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <BeautyContent />
    </Suspense>
  );
}
