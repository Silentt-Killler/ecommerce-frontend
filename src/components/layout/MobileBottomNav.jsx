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
  const [clickedTab, setClickedTab] = useState(null);
  const lastScrollY = useRef(0);

  const isAdminPage = pathname?.startsWith('/admin');
  const isCheckoutPage = pathname === '/checkout';

  useEffect(() => {
    setMounted(true);
    
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
        lastScrollY.current = currentScrollY;
        return;
      }
      
      const scrollDifference = currentScrollY - lastScrollY.current;
      
      // Scrolling down - hide
      if (scrollDifference > 5 && currentScrollY > 100) {
        setVisible(false);
      }
      // Scrolling up - show
      else if (scrollDifference < -5) {
        setVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle click animation
  const handleClick = (id) => {
    setClickedTab(id);
    setActiveTab(id);
    setTimeout(() => setClickedTab(null), 150);
  };

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
        backgroundColor: '#F9F9F9',
        borderTop: '1px solid #E8E8E8',
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s ease',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        height: 66,
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))'
      }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isClicked = clickedTab === item.id;
          
          if (item.isCenter) {
            // Center Home button - elevated circle
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => handleClick(item.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  marginTop: -24,
                  transform: isClicked ? 'scale(1.1)' : 'scale(1)',
                  transition: 'transform 0.15s ease'
                }}
              >
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  backgroundColor: isActive ? '#B08B5C' : '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: isActive ? 'none' : '1px solid #E0E0E0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'all 0.2s ease'
                }}>
                  <Icon 
                    size={22} 
                    strokeWidth={isActive ? 2 : 1.5}
                    color={isActive ? '#FFFFFF' : '#949494'}
                  />
                </div>
                <span style={{
                  fontSize: 10,
                  marginTop: 4,
                  color: isActive ? '#B08B5C' : '#949494',
                  fontWeight: isActive ? 500 : 400,
                  letterSpacing: 0.3
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
              onClick={() => handleClick(item.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                textDecoration: 'none',
                padding: '8px 20px',
                position: 'relative',
                transform: isClicked ? 'scale(1.1)' : 'scale(1)',
                transition: 'transform 0.15s ease'
              }}
            >
              <div style={{ position: 'relative' }}>
                <Icon 
                  size={22} 
                  strokeWidth={isActive ? 1.2 : 1}
                  color={isActive ? '#B08B5C' : '#949494'}
                  style={{ transition: 'all 0.2s ease' }}
                />
                {/* Cart Badge */}
                {item.badge > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: -5,
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
                color: isActive ? '#B08B5C' : '#949494',
                fontWeight: isActive ? 500 : 400,
                letterSpacing: 0.3,
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
