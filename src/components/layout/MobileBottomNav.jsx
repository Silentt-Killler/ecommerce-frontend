'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useCartStore from '@/store/cartStore';

// --- PREMIUM THIN ICONS ---
const SearchIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
  </svg>
);

const BagIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18M16 10a4 4 0 01-8 0" />
  </svg>
);

const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path d="M9 22V12h6v10" />
  </svg>
);

const UserIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
    <circle cx="12" cy="8" r="4" />
    <path d="M20 21a8 8 0 10-16 0" />
  </svg>
);

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { getItemCount } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const lastScrollY = useRef(0);

  useEffect(() => {
    setMounted(true);
    // Pathname matching logic
    if (pathname === '/') setActiveTab('home');
    else if (pathname === '/cart') setActiveTab('cart');
    else if (pathname?.startsWith('/account') || pathname === '/login') setActiveTab('profile');
    else if (pathname?.includes('/search')) setActiveTab('search');
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 20) {
        setVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }
      const diff = currentScrollY - lastScrollY.current;
      if (diff > 10) setVisible(false); // Scroll Down -> Hide
      else if (diff < -15) setVisible(true); // Scroll Up -> Show
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAdminPage = pathname?.startsWith('/admin');
  const isCheckoutPage = pathname === '/checkout';
  if (isAdminPage || isCheckoutPage) return null;

  const cartCount = mounted ? getItemCount() : 0;

  const navItems = [
    { id: 'home', Icon: HomeIcon, href: '/' },
    { id: 'search', Icon: SearchIcon, href: '/search' },
    { id: 'cart', Icon: BagIcon, href: '/cart', badge: cartCount },
    { id: 'profile', Icon: UserIcon, href: '/account' },
  ];

  return (
    <>
      {/* Spacer to prevent content overlap at bottom */}
      <div className="md:hidden h-20" />

      <nav
        style={{
          position: 'fixed',
          bottom: 25,
          left: '50%',
          transform: visible 
            ? 'translateX(-50%) translateY(0)' 
            : 'translateX(-50%) translateY(120%) scale(0.9)',
          width: '90%',
          maxWidth: '320px',
          height: '64px',
          zIndex: 999,
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          borderRadius: '40px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.04)',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '0 10px',
          pointerEvents: visible ? 'auto' : 'none',
        }}
      >
        {navItems.map((item) => {
          const { Icon } = item;
          const isActive = activeTab === item.id;
          
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
                flex: 1,
                height: '100%',
                position: 'relative',
                textDecoration: 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <div style={{
                color: isActive ? '#000000' : '#888888',
                transition: 'color 0.3s ease, transform 0.3s ease',
                transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <Icon />
                {/* Minimal Active Indicator */}
                <div style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  backgroundColor: '#000000',
                  marginTop: '6px',
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? 'scale(1)' : 'scale(0)',
                  transition: 'all 0.3s ease'
                }} />
              </div>

              {/* Cart Badge */}
              {item.badge > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '12px',
                  right: '20%',
                  backgroundColor: '#000000',
                  color: '#FFFFFF',
                  fontSize: '9px',
                  minWidth: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #FFFFFF',
                  fontWeight: '600'
                }}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
