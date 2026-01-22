'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useCartStore from '@/store/cartStore';

// --- ICONS (Same as before) ---
const SearchIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2" : "1.5"}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
  </svg>
);

const BagIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "0" : "1.5"}>
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18M16 10a4 4 0 01-8 0" />
  </svg>
);

const HomeIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "0" : "1.5"}>
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path d="M9 22V12h6v10" />
  </svg>
);

const UserIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "0" : "1.5"}>
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

  const isAdminPage = pathname?.startsWith('/admin');
  const isCheckoutPage = pathname === '/checkout';

  useEffect(() => {
    setMounted(true);
    if (pathname === '/') setActiveTab('home');
    else if (pathname === '/cart') setActiveTab('cart');
    else if (pathname === '/account' || pathname === '/login') setActiveTab('profile');
    else if (pathname?.includes('/search')) setActiveTab('search');
  }, [pathname]);

  // --- FAST SCROLL LOGIC ---
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Always show at the very top (safeguard)
      if (currentScrollY < 10) {
        setVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      const scrollDifference = currentScrollY - lastScrollY.current;

      // Sensitivity: 
      // Scroll Down (> 5px): Hide immediately
      // Scroll Up (< 0px): Show immediately
      if (scrollDifference > 5) { 
        setVisible(false);
      } else if (scrollDifference < 0) {
        setVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Do not render on Admin/Checkout
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
      {/* Spacer to prevent content from hiding behind nav */}
      <div className="md:hidden" style={{ height: 90 }} />

      <nav
        // "flex" & "md:hidden" classes ensure it works on mobile but hides on desktop
        className="flex md:hidden" 
        style={{
          position: 'fixed',
          bottom: 20, // Slightly floating from bottom
          left: 16,   // Margin from left
          right: 16,  // Margin from right (Makes it wide)
          height: 64, // Sleek height
          
          // Fast Animation Logic
          transform: visible ? 'translateY(0)' : 'translateY(130%)',
          opacity: visible ? 1 : 0,
          
          zIndex: 999,
          backgroundColor: 'rgba(255, 255, 255, 0.9)', // Clean White
          backdropFilter: 'blur(15px)', // Premium Glass Effect
          borderRadius: '20px', // Soft rounded corners (Luxury feel)
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)', // High-end soft shadow
          border: '1px solid rgba(255, 255, 255, 0.4)',
          
          // Snappy Transition (0.2s)
          transition: 'transform 0.2s ease-out, opacity 0.2s ease-out', 
          
          alignItems: 'center',
          justifyContent: 'space-between', // Distribute space evenly
          padding: '0 20px' // Internal spacing
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
                width: 48,
                height: 48,
                position: 'relative',
                color: isActive ? '#1A1A1A' : '#9CA3AF', // Jet Black (Active) vs Cool Grey (Inactive)
                textDecoration: 'none',
                // Remove tap highlight on mobile
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <Icon active={isActive} />
              
              {/* Cart Badge with NUMBER */}
              {item.badge > 0 && (
                <span style={{
                  position: 'absolute',
                  top: 2,
                  right: 0,
                  backgroundColor: '#B08B5C', // Luxury Gold Color
                  color: '#FFFFFF',
                  fontSize: '10px',
                  fontWeight: '700',
                  height: '16px',
                  minWidth: '16px',
                  padding: '0 4px',
                  borderRadius: '10px', // Pill shape for numbers
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #FFFFFF', // White border to pop out
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
