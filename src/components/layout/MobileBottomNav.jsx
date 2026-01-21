'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useCartStore from '@/store/cartStore';

// Icons remain same, just tweaked sizing slightly for the pill shape
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

  // Scroll logic for Pinterest-style hide/show
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Always show at very top
      if (currentScrollY < 50) {
        setVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      const scrollDifference = currentScrollY - lastScrollY.current;

      // Hide on scroll down, Show on scroll up
      if (scrollDifference > 10) { 
        setVisible(false);
      } else if (scrollDifference < -10) {
        setVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isAdminPage || isCheckoutPage) return null;

  const cartCount = mounted ? getItemCount() : 0;

  const navItems = [
    { id: 'home', Icon: HomeIcon, href: '/' }, // Pinterest usually puts Home first
    { id: 'search', Icon: SearchIcon, href: '/search' },
    { id: 'cart', Icon: BagIcon, href: '/cart', badge: cartCount },
    { id: 'profile', Icon: UserIcon, href: '/account' },
  ];

  return (
    <>
      {/* This empty div acts as a spacer so your content doesn't get hidden 
        behind the floating nav at the very bottom of the page.
      */}
      <div className="md:hidden" style={{ height: 100 }} />

      <nav
        className="md:hidden"
        style={{
          position: 'fixed',
          bottom: 24, // Floating above bottom edge
          left: '50%', // Center align
          width: 'auto', // Auto width based on content (or use fixed percentage like 90%)
          minWidth: '280px',
          maxWidth: '90%',
          
          // The Magic Transformation
          transform: visible 
            ? 'translateX(-50%) translateY(0) scale(1)' 
            : 'translateX(-50%) translateY(150%) scale(0.9)', 
          
          zIndex: 100,
          backgroundColor: 'rgba(255, 255, 255, 0.85)', // Glass effect
          backdropFilter: 'blur(12px)', // Blurs content behind the nav
          borderRadius: '50px', // Pill shape
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)', // Premium Luxury Shadow
          border: '1px solid rgba(255, 255, 255, 0.5)',
          
          padding: '8px 24px',
          paddingBottom: '8px', // Override safe-area for the pill look
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', // Smooth luxury animation
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px'
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
                alignItems: 'center',
                justifyContent: 'center',
                width: 44,
                height: 44,
                position: 'relative',
                color: isActive ? '#111111' : '#888888', // Darker black for active luxury feel
                textDecoration: 'none',
                borderRadius: '50%',
                backgroundColor: isActive ? 'rgba(0,0,0,0.04)' : 'transparent', // Subtle active background
                transition: 'all 0.3s ease'
              }}
            >
              <Icon active={isActive} />
              
              {/* Cart Badge - Redesigned for Luxury */}
              {item.badge > 0 && (
                <span style={{
                  position: 'absolute',
                  top: 8,
                  right: 6,
                  minWidth: 8,
                  height: 8,
                  backgroundColor: '#C5A572', // Gold/Luxury accent color
                  borderRadius: '50%',
                  border: '2px solid white', // Creates a cutout effect
                  display: 'block'
                }} />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
