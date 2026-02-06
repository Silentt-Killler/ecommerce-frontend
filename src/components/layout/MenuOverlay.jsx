'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { X, ChevronRight } from 'lucide-react';
import useAuthStore from '@/store/authStore';

// ============================================================================
// CATEGORY CONFIGURATION - Easily maintainable
// ============================================================================

const CATEGORIES = [
  { 
    name: 'Original Pakistani', 
    slug: 'original-pakistani',
    href: '/original-pakistani'
  },
  { 
    name: 'Inspired Pakistani', 
    slug: 'inspired-pakistani',
    href: '/inspired-pakistani'
  },
  { 
    name: 'Premium Bag', 
    slug: 'premium-bag',
    href: '/premium-bag'
  },
  { 
    name: 'Beauty & Care', 
    slug: 'beauty',
    href: '/beauty'
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

  // Navigation handler
  const handleNavigation = (path) => {
    router.push(path);
    onClose();
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
          padding: isMobile ? '20px 24px' : '24px 28px',
          borderBottom: '1px solid #F0F0F0',
          backgroundColor: '#FAFAFA'
        }}>
          <span style={{
            fontSize: isMobile ? 13 : 14,
            fontWeight: 600,
            letterSpacing: 2.5,
            textTransform: 'uppercase',
            color: '#999'
          }}>
            Menu
          </span>
          
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
          padding: isMobile ? '24px 24px 16px' : '28px 28px 20px'
        }}>
          
          {/* Main Categories Section */}
          <nav aria-label="Main categories">
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? '4px' : '6px'
            }}>
              {CATEGORIES.map((category, index) => (
                <button
                  key={category.slug}
                  onClick={() => handleNavigation(category.href)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: isMobile ? '14px 16px' : '16px 18px',
                    background: 'none',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color 0.2s ease',
                    animation: `fadeInUp 0.3s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.05}s both`
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FAFAFA'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span style={{
                    fontSize: isMobile ? 17 : 18,
                    fontWeight: 500,
                    color: '#0C0C0C',
                    letterSpacing: 0.3
                  }}>
                    {category.name}
                  </span>
                  <ChevronRight 
                    size={18} 
                    strokeWidth={1.8} 
                    style={{ 
                      color: '#CCC',
                      transition: 'transform 0.2s ease'
                    }} 
                  />
                </button>
              ))}
            </div>
          </nav>

          {/* Divider */}
          <div style={{
            height: '1px',
            backgroundColor: '#F0F0F0',
            margin: isMobile ? '20px 0' : '24px 0'
          }} />

          {/* Secondary Links Section */}
          <nav aria-label="Additional links">
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? '4px' : '6px'
            }}>
              {/* Shop All - Highlighted */}
              <button
                onClick={() => handleNavigation('/shop')}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  padding: isMobile ? '12px 16px' : '14px 18px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FAFAFA'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <span style={{
                  fontSize: isMobile ? 16 : 17,
                  fontWeight: 600,
                  color: '#0C0C0C',
                  letterSpacing: 1,
                  textTransform: 'uppercase'
                }}>
                  Shop All
                </span>
              </button>

              {/* Conditional Links based on auth */}
              {!isAuthenticated ? (
                <button
                  onClick={() => handleNavigation('/login')}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    padding: isMobile ? '12px 16px' : '14px 18px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FAFAFA'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span style={{
                    fontSize: isMobile ? 15 : 16,
                    fontWeight: 400,
                    color: '#555'
                  }}>
                    Login / Register
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => handleNavigation('/account')}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    padding: isMobile ? '12px 16px' : '14px 18px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FAFAFA'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span style={{
                    fontSize: isMobile ? 15 : 16,
                    fontWeight: 400,
                    color: '#555'
                  }}>
                    My Account
                  </span>
                </button>
              )}

              {/* Track Order */}
              {isAuthenticated && (
                <button
                  onClick={() => handleNavigation('/account/orders')}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    padding: isMobile ? '12px 16px' : '14px 18px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FAFAFA'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span style={{
                    fontSize: isMobile ? 15 : 16,
                    fontWeight: 400,
                    color: '#555'
                  }}>
                    My Orders
                  </span>
                </button>
              )}
            </div>
          </nav>
        </div>

        {/* ===== FOOTER SECTION ===== */}
        <footer style={{
          borderTop: '1px solid #F0F0F0',
          padding: isMobile ? '20px 24px' : '24px 28px',
          backgroundColor: '#FAFAFA'
        }}>
          <button
            onClick={() => handleNavigation('/contact')}
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              padding: '8px 0',
              marginBottom: '12px'
            }}
          >
            <span style={{
              fontSize: isMobile ? 14 : 15,
              fontWeight: 500,
              color: '#0C0C0C',
              letterSpacing: 0.8,
              textTransform: 'uppercase'
            }}>
              Contact Us
            </span>
          </button>
          
          <p style={{
            fontSize: 11,
            color: '#999',
            margin: 0,
            letterSpacing: 0.5
          }}>
            © {new Date().getFullYear()} PRISMIN
          </p>
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
