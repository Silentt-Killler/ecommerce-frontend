'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ShoppingBag, Home, User } from 'lucide-react';
import useCartStore from '@/store/cartStore';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { getItemCount } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const lastScrollY = useRef(0);

  const isAdminPage = pathname?.startsWith('/admin');
  const isCheckoutPage = pathname === '/checkout';

  useEffect(() => {
    setMounted(true);
    
    // Set active tab based on pathname
    if (pathname === '/') setActiveTab('home');
    else if (pathname === '/cart') setActiveTab('cart');
    else if (pathname === '/account' || pathname === '/login') setActiveTab('profile');
    else if (pathname?.includes('/search')) setActiveTab('search');
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 10) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        // Scrolling down
        setVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        // Scrolling up
        setVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide on admin and checkout pages
  if (isAdminPage || isCheckoutPage) return null;

  const cartCount = mounted ? getItemCount() : 0;

  const navItems = [
    { id: 'search', icon: Search, href: '/search', label: 'Search' },
    { id: 'cart', icon: ShoppingBag, href: '/cart', label: 'Cart', badge: cartCount },
    { id: 'home', icon: Home, href: '/', label: 'Home', isCenter: true },
    { id: 'profile', icon: User, href: '/account', label: 'Profile' },
  ];

  return (
    <nav
      className="md:hidden"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: '#0C0C0C',
        borderTop: '1px solid #1a1a1a',
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s ease',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        height: 65,
        paddingBottom: 8
      }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          if (item.isCenter) {
            // Center Home button - elevated
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  marginTop: -20,
                  transition: 'transform 0.2s ease'
                }}
              >
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  backgroundColor: isActive ? '#B08B5C' : '#1a1a1a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '3px solid #0C0C0C',
                  transform: isActive ? 'translateY(-4px)' : 'translateY(0)',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 4px 12px rgba(176, 139, 92, 0.4)' : 'none'
                }}>
                  <Icon 
                    size={24} 
                    strokeWidth={isActive ? 2 : 1.5}
                    style={{ color: '#FFFFFF' }}
                  />
                </div>
                <span style={{
                  fontSize: 10,
                  marginTop: 4,
                  color: isActive ? '#B08B5C' : '#666666',
                  fontWeight: isActive ? 500 : 400,
                  letterSpacing: 0.5
                }}>
                  {item.label}
                </span>
              </Link>
            );
          }

          // Regular nav items
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                textDecoration: 'none',
                padding: '8px 16px',
                position: 'relative',
                transform: isActive ? 'translateY(-4px)' : 'translateY(0)',
                transition: 'transform 0.2s ease'
              }}
            >
              <div style={{ position: 'relative' }}>
                <Icon 
                  size={22} 
                  strokeWidth={isActive ? 2 : 1.5}
                  style={{ 
                    color: isActive ? '#FFFFFF' : '#666666',
                    transition: 'color 0.2s ease'
                  }}
                />
                {/* Cart Badge */}
                {item.badge > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: -6,
                    right: -8,
                    minWidth: 16,
                    height: 16,
                    backgroundColor: '#B08B5C',
                    color: '#FFFFFF',
                    fontSize: 9,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                    padding: '0 4px'
                  }}>
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span style={{
                fontSize: 10,
                marginTop: 4,
                color: isActive ? '#FFFFFF' : '#666666',
                fontWeight: isActive ? 500 : 400,
                letterSpacing: 0.5,
                transition: 'color 0.2s ease'
              }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
