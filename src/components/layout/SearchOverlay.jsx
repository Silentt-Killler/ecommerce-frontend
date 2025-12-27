'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import api from '@/lib/api';

export default function SearchOverlay({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);

  // Popular/Trending searches (static for now)
  const trendingSearches = ['Watch', 'Formal Shirt', 'Saree', 'Sneakers', 'Perfume'];

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      // Load recent searches from localStorage
      const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      setRecentSearches(recent.slice(0, 5));
    }
  }, [isOpen]);

  useEffect(() => {
    const searchProducts = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const res = await api.get(`/products?search=${encodeURIComponent(query)}&limit=8`);
        setResults(res.data.products || []);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) return;
    
    // Save to recent searches
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const updated = [searchTerm, ...recent.filter(s => s !== searchTerm)].slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    
    // Navigate to shop with search
    window.location.href = `/shop?search=${encodeURIComponent(searchTerm)}`;
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const clearRecentSearches = () => {
    localStorage.removeItem('recentSearches');
    setRecentSearches([]);
  };

  const formatPrice = (price) => '৳' + (price || 0).toLocaleString('en-BD');

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-white"
      style={{ animation: 'fadeIn 0.2s ease' }}
    >
      {/* Header with Search Input */}
      <div className="border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center h-20 gap-4">
            {/* Search Icon */}
            <Search size={24} className="text-gray-400 flex-shrink-0" />
            
            {/* Input */}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search for products..."
              className="flex-1 text-xl font-light outline-none placeholder-gray-300"
              style={{ letterSpacing: '0.5px' }}
            />
            
            {/* Clear / Close */}
            {query && (
              <button 
                onClick={() => setQuery('')}
                className="p-2 hover:bg-gray-100 rounded-full mr-2"
              >
                <X size={18} className="text-gray-400" />
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-3 hover:bg-gray-100 rounded-full"
            >
              <X size={24} className="text-gray-800" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-10 overflow-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
        
        {/* No Query - Show Trending & Recent */}
        {!query && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Trending Searches */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp size={18} className="text-[#B08B5C]" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                  Trending Searches
                </h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {trendingSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setQuery(term);
                      handleSearch(term);
                    }}
                    className="px-5 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-full transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-gray-400" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                      Recent Searches
                    </h3>
                  </div>
                  <button 
                    onClick={clearRecentSearches}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-2">
                  {recentSearches.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setQuery(term);
                        handleSearch(term);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 rounded-lg text-left transition-colors"
                    >
                      <Clock size={16} className="text-gray-300" />
                      <span className="text-gray-700">{term}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#B08B5C] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Search Results */}
        {query && !loading && results.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <p className="text-sm text-gray-500">
                <span className="font-medium text-gray-800">{results.length}</span> results for "{query}"
              </p>
              <button
                onClick={() => handleSearch(query)}
                className="flex items-center gap-2 text-sm font-medium text-[#B08B5C] hover:underline"
              >
                View All Results
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {results.map((product) => (
                <Link
                  key={product._id}
                  href={`/product/${product.slug}`}
                  onClick={onClose}
                  className="group"
                >
                  <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-3">
                    {product.images?.[0]?.url ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        No Image
                      </div>
                    )}
                  </div>
                  <h4 className="text-sm font-medium text-gray-800 mb-1 line-clamp-1">
                    {product.name}
                  </h4>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatPrice(product.price)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {query && !loading && results.length === 0 && (
          <div className="text-center py-20">
            <Search size={48} className="mx-auto text-gray-200 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No results found</h3>
            <p className="text-gray-500 text-sm">
              Try searching with different keywords
            </p>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
