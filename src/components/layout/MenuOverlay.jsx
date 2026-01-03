'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, ChevronDown, ChevronRight } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import api from '@/lib/api';

// Main categories with their routes
const CATEGORIES = [
  { 
    name: 'Menswear', 
    slug: 'menswear',
    href: '/menswear'
  },
  { 
    name: 'Womenswear', 
    slug: 'womenswear',
    href: '/womenswear'
  },
  { 
    name: 'Watches', 
    slug: 'watch',
    href: '/watch'
  },
  { 
    name: 'Accessories', 
    slug: 'accessories',
    href: '/accessories'
  },
  { 
    name: 'Beauty & Care', 
    slug: 'beauty',
    href: '/beauty'
  }
];

export default function MenuOverlay({ isOpen, onClose }) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [subcategories, setSubcategories] = useState({});
  const [loadingSubcategories, setLoadingSubcategories] = useState({});

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setExpandedCategory(null); // Reset expanded state on close
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Fetch subcategories for a category
  const fetchSubcategories = async (categorySlug) => {
    if (subcategories[categorySlug]) return; // Already fetched
    
    setLoadingSubcategories(prev => ({ ...prev, [categorySlug]: true }));
    try {
      const res = await api.get(`/subcategories?parent=${categorySlug}&is_active=true`);
      setSubcategories(prev => ({
        ...prev,
        [categorySlug]: res.data.subcategories || []
      }));
    } catch (error) {
      console.error('Failed to fetch subcategories:', error);
      setSubcategories(prev => ({ ...prev, [categorySlug]: [] }));
    } finally {
      setLoadingSubcategories(prev => ({ ...prev, [categorySlug]: false }));
    }
  };

  // Handle category click - expand/collapse
  const handleCategoryClick = (category) => {
    if (expandedCategory === category.slug) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(category.slug);
      fetchSubcategories(category.slug);
    }
  };

  // Handle View All click
  const handleViewAll = (category) => {
    onClose();
    router.push(category.href);
  };

  // Handle subcategory click
  const handleSubcategoryClick = (category, subcategory) => {
    onClose();
    router.push(`${category.href}?subcategory=${subcategory.slug}`);
  };

  // Handle navigation
  const handleNavigation = (href) => {
    onClose();
    router.push(href);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with blur */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.3s ease'
        }}
      />

      {/* Menu Panel - Left Side */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '100%',
          maxWidth: 420,
          zIndex: 51,
          backgroundColor: '#FFFFFF',
          boxShadow: '4px 0 30px rgba(0, 0, 0, 0.15)',
          animation: 'slideInLeft 0.4s ease',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 28px',
          borderBottom: '1px solid #E0E0E0'
        }}>
          <Link 
            href="/" 
            onClick={onClose}
            style={{
              fontSize: 20,
              fontWeight: 300,
              letterSpacing: 5,
              color: '#0C0C0C',
              textDecoration: 'none'
            }}
          >
            PRISMIN
          </Link>
          
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F5F5F5'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 0'
        }}>
          {/* Categories */}
          <nav>
            {CATEGORIES.map((category, index) => (
              <div 
                key={category.slug}
                style={{
                  animation: `fadeInUp 0.3s ease ${index * 0.05}s both`
                }}
              >
                {/* Category Header */}
                <button
                  onClick={() => handleCategoryClick(category)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 28px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FAFAFA'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span style={{
                    fontSize: 15,
                    fontWeight: 400,
                    color: '#0C0C0C',
                    letterSpacing: 0.5
                  }}>
                    {category.name}
                  </span>
                  
                  <ChevronDown 
                    size={18} 
                    strokeWidth={1.5}
                    style={{
                      color: '#919191',
                      transition: 'transform 0.3s ease',
                      transform: expandedCategory === category.slug ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                  />
                </button>

                {/* Subcategories - Expandable */}
                <div style={{
                  maxHeight: expandedCategory === category.slug ? 500 : 0,
                  overflow: 'hidden',
                  transition: 'max-height 0.4s ease',
                  backgroundColor: '#FAFAFA'
                }}>
                  {/* Loading State */}
                  {loadingSubcategories[category.slug] && (
                    <div style={{ padding: '12px 28px 12px 44px' }}>
                      <span style={{ fontSize: 13, color: '#919191' }}>Loading...</span>
                    </div>
                  )}

                  {/* Subcategory List */}
                  {subcategories[category.slug]?.map((sub) => (
                    <button
                      key={sub.slug}
                      onClick={() => handleSubcategoryClick(category, sub)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '12px 28px 12px 44px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F0F0F0'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <ChevronRight size={14} strokeWidth={1.5} style={{ color: '#B08B5C' }} />
                      <span style={{
                        fontSize: 13,
                        color: '#4A4A4A',
                        fontWeight: 400
                      }}>
                        {sub.name}
                      </span>
                    </button>
                  ))}

                  {/* View All Button */}
                  {expandedCategory === category.slug && !loadingSubcategories[category.slug] && (
                    <button
                      onClick={() => handleViewAll(category)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '14px 28px 14px 44px',
                        background: 'none',
                        border: 'none',
                        borderTop: '1px solid #E8E8E8',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.2s',
                        marginTop: 4
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F0F0F0'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <span style={{
                        fontSize: 13,
                        color: '#B08B5C',
                        fontWeight: 500,
                        letterSpacing: 0.5
                      }}>
                        View All {category.name}
                      </span>
                      <ChevronRight size={14} strokeWidth={2} style={{ color: '#B08B5C' }} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </nav>

          {/* Divider */}
          <div style={{
            height: 1,
            backgroundColor: '#E0E0E0',
            margin: '16px 28px'
          }} />

          {/* All Products Link */}
          <button
            onClick={() => handleNavigation('/shop')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 28px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FAFAFA'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <span style={{
              fontSize: 15,
              fontWeight: 500,
              color: '#0C0C0C',
              letterSpacing: 0.5
            }}>
              All Products
            </span>
            <ChevronRight size={18} strokeWidth={1.5} style={{ color: '#919191' }} />
          </button>
        </div>

        {/* Footer - Fixed at bottom */}
        <div style={{
          borderTop: '1px solid #E0E0E0',
          padding: '20px 28px',
          backgroundColor: '#FAFAFA'
        }}>
          {/* Sign In / My Profile */}
          <button
            onClick={() => handleNavigation(isAuthenticated ? '/account' : '/login')}
            style={{
              width: '100%',
              padding: '12px 0',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              borderBottom: '1px solid #E8E8E8'
            }}
          >
            <span style={{
              fontSize: 14,
              color: '#0C0C0C',
              fontWeight: 400,
              textDecoration: 'underline',
              textUnderlineOffset: 3
            }}>
              {isAuthenticated ? 'My Profile' : 'Sign In'}
            </span>
          </button>

          {/* My Orders */}
          <button
            onClick={() => handleNavigation(isAuthenticated ? '/account/orders' : '/login')}
            style={{
              width: '100%',
              padding: '12px 0',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              borderBottom: '1px solid #E8E8E8'
            }}
          >
            <span style={{
              fontSize: 14,
              color: '#0C0C0C',
              fontWeight: 400,
              textDecoration: 'underline',
              textUnderlineOffset: 3
            }}>
              My Orders
            </span>
          </button>

          {/* Contact Us */}
          <button
            onClick={() => handleNavigation('/contact')}
            style={{
              width: '100%',
              padding: '12px 0',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <span style={{
              fontSize: 14,
              color: '#0C0C0C',
              fontWeight: 400,
              textDecoration: 'underline',
              textUnderlineOffset: 3
            }}>
              Contact Us
            </span>
          </button>
        </div>
      </div>

      {/* Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInLeft {
          from { 
            transform: translateX(-100%);
            opacity: 0;
          }
          to { 
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes fadeInUp {
          from { 
            opacity: 0;
            transform: translateY(10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
