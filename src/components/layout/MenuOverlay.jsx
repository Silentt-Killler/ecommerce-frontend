'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { X, ChevronDown, ChevronRight } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import api from '@/lib/api';

// ============================================================================
// CATEGORIES CONFIGURATION
// ============================================================================

const CATEGORIES = [
  { 
    name: 'Original Pakistani', 
    slug: 'original-pakistani',
    href: '/original-pakistani',
    type: 'subcategory'
  },
  { 
    name: 'Inspired Pakistani', 
    slug: 'inspired-pakistani',
    href: '/inspired-pakistani',
    type: 'subcategory'
  },
  { 
    name: 'Premium Bag', 
    slug: 'premium-bag',
    href: '/premium-bag',
    type: 'subcategory'
  },
  { 
    name: 'Beauty & Care', 
    slug: 'beauty',
    href: '/beauty',
    type: 'subcategory'
  }
];

// ============================================================================
// MENU OVERLAY COMPONENT - Professional Grade
// ============================================================================

export default function MenuOverlay({ isOpen, onClose }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const [isMobile, setIsMobile] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [subcategories, setSubcategories] = useState({});
  const [loading, setLoading] = useState({});

  // Detect screen size
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setExpandedCategory(null);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Auto-close menu on route change (Back button, navigation)
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [pathname]);

  // Fetch subcategories for a category
  const fetchSubcategories = async (categorySlug) => {
    if (subcategories[categorySlug]) return;
    
    setLoading(prev => ({ ...prev, [categorySlug]: true }));
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
      setLoading(prev => ({ ...prev, [categorySlug]: false }));
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
      {/* Backdrop Overlay */}
      <div 
        onClick={onClose}
        role="presentation"
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 60,
          animation: 'fadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />

      {/* Menu Drawer Panel */}
      <aside 
        role="dialog"
        aria-label="Navigation menu"
        aria-modal="true"
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: isMobile ? 0 : 'auto',
          right: isMobile ? 'auto' : 0,
          width: isMobile ? '85vw' : '420px',
          maxWidth: isMobile ? '340px' : '420px',
          backgroundColor: '#FFFFFF',
          zIndex: 61,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isMobile 
            ? '4px 0 24px rgba(0, 0, 0, 0.12)' 
            : '-4px 0 24px rgba(0, 0, 0, 0.12)',
          animation: isMobile 
            ? 'slideInLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
            : 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* ===== HEADER SECTION ===== */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '18px 24px' : '20px 28px',
          borderBottom: '1px solid #E0E0E0'
        }}>
          <Link 
            href="/" 
            onClick={onClose}
            style={{
              fontSize: isMobile ? 22 : 24,
              fontWeight: 300,
              letterSpacing: isMobile ? 5 : 6,
              color: '#0C0C0C',
              textDecoration: 'none'
            }}
          >
            PRISMIN
          </Link>
          
          <button 
            onClick={onClose}
            aria-label="Close menu"
            style={{
              background: 'none',
              border: 'none',
              padding: 8,
              margin: -8,
              cursor: 'pointer',
              color: '#0C0C0C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F5F5F5'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={24} strokeWidth={1.8} />
          </button>
        </header>

        {/* ===== SCROLLABLE CONTENT ===== */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: isMobile ? '8px 0' : '12px 0'
        }}>
          
          {/* Main Categories with Subcategories */}
          <nav aria-label="Main categories">
            {CATEGORIES.map((category, index) => (
              <div 
                key={category.slug}
                style={{
                  animation: `fadeInUp 0.3s ease ${index * 0.05}s both`
                }}
              >
                {/* Category Header (Expandable) */}
                <button
                  onClick={() => handleCategoryClick(category)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: isMobile ? '14px 24px' : '16px 28px',
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
                    fontSize: isMobile ? 16 : 17,
                    fontWeight: 500,
                    color: '#0C0C0C',
                    letterSpacing: 0.5
                  }}>
                    {category.name}
                  </span>
                  <ChevronDown 
                    size={isMobile ? 18 : 20} 
                    strokeWidth={1.5}
                    style={{
                      color: '#919191',
                      transform: expandedCategory === category.slug ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'transform 0.3s ease'
                    }}
                  />
                </button>

                {/* Expanded Content - Subcategories */}
                <div style={{
                  maxHeight: expandedCategory === category.slug ? '500px' : '0',
                  overflow: 'hidden',
                  transition: 'max-height 0.3s ease',
                  backgroundColor: '#FAFAFA'
                }}>
                  {/* Loading State */}
                  {loading[category.slug] && (
                    <div style={{ padding: isMobile ? '12px 24px 12px 40px' : '12px 28px 12px 44px' }}>
                      <span style={{ fontSize: 14, color: '#919191' }}>Loading...</span>
                    </div>
                  )}

                  {/* Subcategories List */}
                  {subcategories[category.slug]?.map((sub) => (
                    <button
                      key={sub.slug}
                      onClick={() => handleSubcategoryClick(category, sub)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: isMobile ? '12px 24px 12px 40px' : '12px 28px 12px 44px',
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
                        fontSize: 14,
                        color: '#4A4A4A',
                        fontWeight: 400
                      }}>
                        {sub.name}
                      </span>
                    </button>
                  ))}

                  {/* View All Button */}
                  {expandedCategory === category.slug && !loading[category.slug] && (
                    <button
                      onClick={() => handleViewAll(category)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: isMobile ? '13px 24px 13px 40px' : '14px 28px 14px 44px',
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
                        fontSize: 14,
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
            margin: isMobile ? '14px 24px' : '16px 28px'
          }} />

          {/* All Products Link */}
          <button
            onClick={() => handleNavigation('/shop')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: isMobile ? '14px 24px' : '16px 28px',
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
              fontSize: isMobile ? 16 : 17,
              fontWeight: 500,
              color: '#0C0C0C',
              letterSpacing: 0.5
            }}>
              All Products
            </span>
            <ChevronRight size={isMobile ? 18 : 20} strokeWidth={1.5} style={{ color: '#919191' }} />
          </button>
        </div>

        {/* ===== FOOTER SECTION ===== */}
        <footer style={{
          borderTop: '1px solid #E0E0E0',
          padding: isMobile ? '16px 24px' : '20px 28px',
          backgroundColor: '#FAFAFA'
        }}>
          {/* Sign In / My Profile */}
          <button
            onClick={() => handleNavigation(isAuthenticated ? '/account' : '/login')}
            style={{
              width: '100%',
              padding: isMobile ? '11px 0' : '12px 0',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              borderBottom: '1px solid #E8E8E8'
            }}
          >
            <span style={{
              fontSize: 15,
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
              padding: isMobile ? '11px 0' : '12px 0',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              borderBottom: '1px solid #E8E8E8'
            }}
          >
            <span style={{
              fontSize: 15,
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
              padding: isMobile ? '11px 0' : '12px 0',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <span style={{
              fontSize: 15,
              color: '#0C0C0C',
              fontWeight: 400,
              textDecoration: 'underline',
              textUnderlineOffset: 3
            }}>
              Contact Us
            </span>
          </button>
        </footer>
      </aside>

      {/* ===== ANIMATIONS ===== */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { 
            opacity: 0; 
          }
          to { 
            opacity: 1; 
          }
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

        @keyframes slideInRight {
          from { 
            transform: translateX(100%);
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
            transform: translateY(12px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Smooth scrolling for menu content */
        aside[aria-label="Navigation menu"] > div {
          scrollbar-width: thin;
          scrollbar-color: #E0E0E0 transparent;
        }

        aside[aria-label="Navigation menu"] > div::-webkit-scrollbar {
          width: 6px;
        }

        aside[aria-label="Navigation menu"] > div::-webkit-scrollbar-track {
          background: transparent;
        }

        aside[aria-label="Navigation menu"] > div::-webkit-scrollbar-thumb {
          background-color: #E0E0E0;
          border-radius: 3px;
        }
      `}</style>
    </>
  );
}
