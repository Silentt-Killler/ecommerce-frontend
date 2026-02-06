'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useCartStore from '@/store/cartStore';
import MenuOverlay from './MenuOverlay';

// ============================================================================
// PREMIUM SVG ICONS - Optimized & Scalable
// ============================================================================

const HomeIcon = ({ isActive }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={isActive ? "#0C0C0C" : "#888"} 
    strokeWidth={isActive ? "2" : "1.5"}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path d="M9 22V12h6v10" />
  </svg>
);

const MenuIcon = ({ isActive }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={isActive ? "#0C0C0C" : "#888"} 
    strokeWidth={isActive ? "2" : "1.5"}
    strokeLinecap="round"
  >
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </svg>
);

const CartIcon = ({ isActive }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={isActive ? "#0C0C0C" : "#888"} 
    strokeWidth={isActive ? "2" : "1.5"}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
);

// ============================================================================
// MOBILE BOTTOM NAVIGATION COMPONENT
// ============================================================================

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { getItemCount } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Hydration fix - prevent SSR mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-close menu on navigation
  useEffect(() => {
    if (showMenu) {
      setShowMenu(false);
    }
  }, [pathname]);

  // Hide on specific pages
  const isAdminPage = pathname?.startsWith('/admin');
  const isCheckoutPage = pathname === '/checkout';
  
  if (isAdminPage || isCheckoutPage) return null;

  // Safe cart count (prevents hydration issues)
  const cartCount = mounted ? getItemCount() : 0;

  // Navigation items configuration
  const navItems = [
    { 
      id: 'home',
      icon: HomeIcon, 
      href: '/',
      ariaLabel: 'Home'
    },
    { 
      id: 'menu',
      icon: MenuIcon,
      isButton: true,
      ariaLabel: 'Menu',
      onClick: () => setShowMenu(prev => !prev)
    },
    { 
      id: 'cart',
      icon: CartIcon,
      href: '/cart',
      badge: cartCount,
      ariaLabel: `Shopping cart with ${cartCount} items`
    }
  ];

  return (
    <>
      {/* Spacer for fixed navbar - Mobile only */}
      <div 
        className="mobile-nav-spacer" 
        style={{ 
          display: 'block',
          height: '70px' 
        }} 
      />

      {/* Bottom Navigation Bar */}
      <nav
        role="navigation"
        aria-label="Mobile bottom navigation"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '65px',
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(0, 0, 0, 0.06)',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          zIndex: 50,
          boxShadow: '0 -2px 12px rgba(0, 0, 0, 0.04)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          WebkitTapHighlightColor: 'transparent'
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.id === 'menu' && showMenu);

          // Menu Button
          if (item.isButton) {
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                aria-label={item.ariaLabel}
                aria-pressed={showMenu}
                style={{
                  background: 'none',
                  border: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  flex: 1,
                  height: '100%',
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                  transition: 'opacity 0.2s ease'
                }}
                onMouseDown={(e) => e.currentTarget.style.opacity = '0.6'}
                onMouseUp={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <div style={{
                  transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                  transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                  <Icon isActive={isActive} />
                </div>
                
                {/* Active Indicator Dot */}
                <div style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  backgroundColor: '#0C0C0C',
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? 'scale(1)' : 'scale(0.5)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }} />
              </button>
            );
          }

          // Link Buttons (Home, Cart)
          return (
            <Link
              key={item.id}
              href={item.href}
              aria-label={item.ariaLabel}
              aria-current={isActive ? 'page' : undefined}
              style={{
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                flex: 1,
                height: '100%',
                position: 'relative',
                WebkitTapHighlightColor: 'transparent',
                transition: 'opacity 0.2s ease'
              }}
              onMouseDown={(e) => e.currentTarget.style.opacity = '0.6'}
              onMouseUp={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <div style={{
                transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative'
              }}>
                <Icon isActive={isActive} />
                
                {/* Cart Badge */}
                {item.badge > 0 && (
                  <span 
                    aria-label={`${item.badge} items in cart`}
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-8px',
                      backgroundColor: '#B08B5C',
                      color: '#FFFFFF',
                      fontSize: '10px',
                      fontWeight: '700',
                      minWidth: '18px',
                      height: '18px',
                      borderRadius: '9px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #FFFFFF',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      animation: item.badge > 0 ? 'badgePulse 0.3s ease' : 'none'
                    }}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              {/* Active Indicator Dot */}
              <div style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                backgroundColor: '#0C0C0C',
                opacity: isActive ? 1 : 0,
                transform: isActive ? 'scale(1)' : 'scale(0.5)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }} />
            </Link>
          );
        })}
      </nav>

      {/* Menu Overlay */}
      <MenuOverlay isOpen={showMenu} onClose={() => setShowMenu(false)} />

      {/* Global Styles */}
      <style jsx global>{`
        /* Hide mobile nav on desktop */
        @media (min-width: 768px) {
          .mobile-nav-spacer {
            display: none !important;
          }
          nav[aria-label="Mobile bottom navigation"] {
            display: none !important;
          }
        }

        /* Badge pulse animation */
        @keyframes badgePulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        /* Smooth transitions */
        * {
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </>
  );
}
