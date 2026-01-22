'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useCartStore from '@/store/cartStore';

// --- PREMIUM ICONS (Fine-tuned Stroke) ---
const SearchIcon = ({ isActive }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isActive ? "black" : "#666"} strokeWidth={isActive ? "2" : "1.5"}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
  </svg>
);

const BagIcon = ({ isActive }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isActive ? "black" : "#666"} strokeWidth={isActive ? "2" : "1.5"}>
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18M16 10a4 4 0 01-8 0" />
  </svg>
);

const HomeIcon = ({ isActive }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isActive ? "black" : "#666"} strokeWidth={isActive ? "2" : "1.5"}>
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path d="M9 22V12h6v10" />
  </svg>
);

const UserIcon = ({ isActive }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isActive ? "black" : "#666"} strokeWidth={isActive ? "2" : "1.5"}>
    <circle cx="12" cy="8" r="4" />
    <path d="M20 21a8 8 0 10-16 0" />
  </svg>
);

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { getItemCount } = useCartStore();
  const [visible, setVisible] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const lastScrollY = useRef(0);

  useEffect(() => {
    // Path check logic
    if (pathname === '/') setActiveTab('home');
    else if (pathname === '/cart') setActiveTab('cart');
    else if (pathname?.startsWith('/account') || pathname === '/login') setActiveTab('profile');
    else if (pathname?.includes('/search')) setActiveTab('search');
  }, [pathname]);

  // --- PINTEREST SCROLL LOGIC ---
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // একদম উপরে থাকলে সবসময় দেখাবে
      if (currentScrollY < 10) {
        setVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      const diff = currentScrollY - lastScrollY.current;

      // নিচে স্ক্রল করলে (Scroll Down) -> হাইড হবে
      if (diff > 10) {
        setVisible(false);
      } 
      // উপরে স্ক্রল করলে (Scroll Up) -> শো করবে
      else if (diff < -5) {
        setVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAdminPage = pathname?.startsWith('/admin');
  const isCheckoutPage = pathname === '/checkout';
  if (isAdminPage || isCheckoutPage) return null;

  const cartCount = getItemCount();

  const navItems = [
    { id: 'home', Icon: HomeIcon, href: '/' },
    { id: 'search', Icon: SearchIcon, href: '/search' },
    { id: 'cart', Icon: BagIcon, href: '/cart', badge: cartCount },
    { id: 'profile', Icon: UserIcon, href: '/account' },
  ];

  return (
    <>
      {/* Spacer div যাতে ফুটারের কন্টেন্ট ঢাকা না পড়ে */}
      <div className="md:hidden h-[60px]" />

      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          height: '65px', // স্ট্যান্ডার্ড হাইট
          zIndex: 999,
          
          // --- ডিজাইন: সাদা ব্যাকগ্রাউন্ড + শ্যাডো ---
          backgroundColor: 'rgba(255, 255, 255, 0.95)', // একদম সলিড সাদা নয়, হালকা গ্লাস ফিল
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          
          // উপরে চিকন বর্ডার + নিচে শ্যাডো (Separation এর জন্য)
          borderTop: '1px solid rgba(0,0,0,0.05)',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.04)', // হালকা শ্যাডো যাতে সাদার ওপর ভেসে থাকে

          // --- এনিমেশন (Slide Down/Up) ---
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
          
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around', // আইকনগুলো সমান দূরত্বে থাকবে
          paddingBottom: 'env(safe-area-inset-bottom)', // আইফোন ইউজারদের জন্য সেফ এরিয়া
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
              {/* আইকন কন্টেইনার */}
              <div style={{
                position: 'relative',
                transition: 'transform 0.2s ease',
                transform: isActive ? 'translateY(-2px)' : 'translateY(0)', // একটিভ হলে সামান্য উপরে উঠবে
              }}>
                <Icon isActive={isActive} />
              </div>

              {/* একটিভ ডট ইন্ডিকেটর (Active Dot) */}
              <div style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                backgroundColor: 'black',
                marginTop: '4px',
                opacity: isActive ? 1 : 0,
                transform: isActive ? 'scale(1)' : 'scale(0)',
                transition: 'all 0.3s ease'
              }} />

              {/* কার্ট ব্যাজ (Cart Badge) */}
              {item.badge > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '10px',
                  right: 'calc(50% - 14px)', // সেন্টারের একটু ডানে
                  backgroundColor: '#000000',
                  color: '#FFFFFF',
                  fontSize: '9px',
                  minWidth: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  border: '2px solid #ffffff'
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
