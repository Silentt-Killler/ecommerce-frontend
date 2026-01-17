'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Search, X, ArrowLeft, TrendingUp } from 'lucide-react';
import api from '@/lib/api';

export default function SearchPage() {
  const router = useRouter();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
    
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const searchProducts = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const res = await api.get(`/products?search=${encodeURIComponent(query)}&limit=10`);
        setResults(res.data.products || []);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSearch = (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    // Save to recent searches
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    
    router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const getProductLink = (product) => {
    if (product.category === 'beauty') return `/beauty/${product.slug}`;
    if (product.category === 'watch') return `/watch/${product.slug}`;
    return `/product/${product.slug}`;
  };

  const formatPrice = (price) => '৳' + (price || 0).toLocaleString('en-BD');

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#FFFFFF',
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 80 // Space for bottom nav
    }}>
      {/* Search Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E8E8E8',
        padding: '12px 16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => router.back()}
            style={{
              background: 'none',
              border: 'none',
              padding: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ArrowLeft size={22} color="#0C0C0C" />
          </button>
          
          <div style={{ 
            flex: 1, 
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#F5F5F5',
            borderRadius: 8,
            padding: '0 12px'
          }}>
            <Search size={18} color="#919191" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              placeholder="Search products..."
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                background: 'transparent',
                fontSize: 15,
                color: '#0C0C0C',
                outline: 'none'
              }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 4,
                  cursor: 'pointer'
                }}
              >
                <X size={18} color="#919191" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px' }}>
        {/* Recent Searches */}
        {!query && recentSearches.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: 12
            }}>
              <h3 style={{ 
                fontSize: 14, 
                fontWeight: 600, 
                color: '#0C0C0C',
                letterSpacing: 1,
                textTransform: 'uppercase'
              }}>
                Recent Searches
              </h3>
              <button
                onClick={clearRecentSearches}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 12,
                  color: '#919191',
                  cursor: 'pointer'
                }}
              >
                Clear All
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {recentSearches.map((search, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSearch(search)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    backgroundColor: '#F5F5F5',
                    border: 'none',
                    borderRadius: 20,
                    fontSize: 13,
                    color: '#0C0C0C',
                    cursor: 'pointer'
                  }}
                >
                  <TrendingUp size={14} color="#919191" />
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{
              width: 30,
              height: 30,
              border: '2px solid #E0E0E0',
              borderTopColor: '#B08B5C',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto'
            }} />
          </div>
        )}

        {/* Search Results */}
        {!loading && results.length > 0 && (
          <div>
            <p style={{ fontSize: 13, color: '#919191', marginBottom: 16 }}>
              {results.length} results for "{query}"
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {results.map((product) => (
                <Link
                  key={product._id}
                  href={getProductLink(product)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: 12,
                    backgroundColor: '#FAFAFA',
                    borderRadius: 8,
                    textDecoration: 'none'
                  }}
                >
                  <div style={{
                    width: 60,
                    height: 80,
                    position: 'relative',
                    backgroundColor: '#F0F0F0',
                    borderRadius: 4,
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    {product.images?.[0]?.url && (
                      <Image
                        src={product.images[0].url}
                        alt={product.name}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: '#0C0C0C',
                      marginBottom: 4,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {product.name}
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#B08B5C' }}>
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && query.length >= 2 && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Search size={48} color="#E0E0E0" style={{ marginBottom: 16 }} />
            <p style={{ fontSize: 16, fontWeight: 500, color: '#0C0C0C', marginBottom: 8 }}>
              No products found
            </p>
            <p style={{ fontSize: 14, color: '#919191' }}>
              Try different keywords or browse our categories
            </p>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
