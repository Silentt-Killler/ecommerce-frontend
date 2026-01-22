'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useCartStore from '@/store/cartStore';

// --- PREMIUM THIN ICONS ---
// আইকন সবসময় চিকন থাকবে, সিলেক্ট হলেও মোটা হবে না, শুধু কালার চেঞ্জ হবে। এটিই মডার্ন লাক্সারি।
const SearchIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
  </svg>
);

const BagIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18M16 10a4 4 0 01-8 0" />
  </svg>
);

const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path d="M9 22V12h6v10" />
  </svg>
);

const UserIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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

  // --- ULTRA FAST SCROLL LOGIC ---
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 10) {
        setVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      const scrollDifference = currentScrollY - lastScrollY.current;

      // খুবই সেনসিটিভ স্ক্রল ডিটেকশন
      if (scrollDifference > 5) { 
        setVisible(false);
      } else if (scrollDifference < -2) { // একটু উপরে উঠালেই শো করবে
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
    { id: 'home', Icon: HomeIcon, href: '/' },
    { id: 'search', Icon: SearchIcon, href: '/search' },
    { id: 'cart', Icon: BagIcon, href: '/cart', badge: cartCount },
    { id: 'profile', Icon: UserIcon, href: '/account' },
  ];

  return (
    <>
      <div className="md:hidden" style={{ height: 100 }} />

      <nav
        className="flex md:hidden" 
        style={{
          position: 'fixed',
          bottom: 30, // নিচ থেকে একটু বেশি উপরে (Floating Feel)
          left: '50%', // সেন্টারে আনার জন্য
          transform: visible 
            ? 'translateX(-50%) translateY(0) scale(1)' 
            : 'translateX(-50%) translateY(150%) scale(0.95)',
          
          width: 'auto',
          minWidth: '280px', // খুব ছোট হবে না
          maxWidth: '340px', // খুব বড়ও হবে না (Perfect Compact Size)
          height: 60,
          
          zIndex: 999,
          // Glassmorphism (Heavy Blur)
          backgroundColor: 'rgba(255, 255, 255, 0.85)', 
          backdropFilter: 'blur(20px)', 
          WebkitBackdropFilter: 'blur(20px)',
          
          borderRadius: '30px', // একদম ক্যাপসুল শেপ
          
          // Premium Shadow: নিচ থেকে হালকা শ্যাডো, খুব কড়া কালো নয়
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255,255,255,0.5) inset',
          
          transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 10px' 
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
                width: 60, // টাচ এরিয়া বড় রাখা হয়েছে
                height: '100%',
                position: 'relative',
                textDecoration: 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {/* Active Indicator Background (Soft Pill) */}
              <div style={{
                position: 'absolute',
                width: isActive ? '50px' : '0px',
                height: '40px',
                backgroundColor: isActive ? '#000000' : 'transparent', // একটিভ হলে কালো ব্যাকগ্রাউন্ড
                borderRadius: '25px',
                transition: 'all 0.3s ease',
                opacity: isActive ? 0.05 : 0, // খুব হালকা কালো শেড (Subtle)
                zIndex: -1
              }} />

              {/* Icon Container */}
              <div style={{
                position: 'relative',
                color: isActive ? '#000000' : '#999999', // একটিভ হলে একদম কালো, ইনএকটিভ হলে হালকা ছাই
                transform: isActive ? 'scale(1.05)' : 'scale(1)', // একটিভ হলে সামান্য বড় হবে
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon />
                
                {/* Active Dot Indicator (নিচে ছোট ডট) - Optional Luxury Touch */}
                {isActive && (
                  <span style={{
                    position: 'absolute',
                    bottom: -8,
                    width: 4,
                    height: 4,
                    backgroundColor: '#000000',
                    borderRadius: '50%'
                  }} />
                )}
              </div>

              {/* Cart Badge - Elegant Style */}
              {item.badge > 0 && (
                <span style={{
                  position: 'absolute',
                  top: 10,
                  right: 10, // পজিশন একটু অ্যাডজাস্ট করা হয়েছে
                  backgroundColor: '#000000', // গোল্ডের বদলে কালো বেশি ক্লাসি লাগে (অথবা গোল্ড রাখতে চাইলে #C5A572 দাও)
                  color: '#FFFFFF',
                  fontSize: '9px',
                  fontWeight: '600',
                  height: '14px',
                  minWidth: '14px',
                  padding: '0 3px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid #FFFFFF',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
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
