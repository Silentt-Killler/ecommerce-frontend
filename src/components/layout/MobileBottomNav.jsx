'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useCartStore from '@/store/cartStore';

// --- Premium Icons ---
const HomeIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "0" : "2"}>
    <path d="M3 9.5L12 2.5L21 9.5V20.5C21 21.0523 20.5523 21.5 20 21.5H15V14.5H9V21.5H4C3.44772 21.5 3 21.0523 3 20.5V9.5Z" />
  </svg>
);

const SearchIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "3" : "2"}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20L16 16" strokeLinecap="round" />
  </svg>
);

const BagIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "0" : "2"}>
    {active ? (
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18M16 10a4 4 0 01-8 0" />
    ) : (
      <>
        <path d="M6 2L3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6L18 2H6Z" strokeLinejoin="round" />
        <path d="M3 6H21" strokeLinejoin="round" />
        <path d="M16 10C16 12.2091 14.2091 14 12 14C9.79086 14 8 12.2091 8 10" strokeLinecap="round" strokeLinejoin="round" />
      </>
    )}
  </svg>
);

const UserIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "0" : "2"}>
    <path d="M20 21C20 18.2386 16.4183 16 12 16C7.58172 16 4 18.2386 4 21" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { getItemCount } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  
  // স্ক্রল লজিকের জন্য স্টেট
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  const isAdminPage = pathname?.startsWith('/admin');
  const isCheckoutPage = pathname === '/checkout';

  useEffect(() => {
    setMounted(true);
    if (pathname === '/') setActiveTab('home');
    else if (pathname?.includes('/search')) setActiveTab('search');
    else if (pathname === '/cart') setActiveTab('cart');
    else if (pathname?.includes('/account')) setActiveTab('account');
  }, [pathname]);

  // স্ক্রল হ্যান্ডলার: নিচে নামলে মেনু লুকাবে, উপরে উঠলে মেনু দেখাবে
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // একদম উপরে থাকলে সবসময় দেখাবে
      if (currentScrollY < 10) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      // নিচে স্ক্রল করলে (Scrolling Down) -> Hide
      if (currentScrollY > lastScrollY.current + 10) {
        setIsVisible(false);
      } 
      // উপরে স্ক্রল করলে (Scrolling Up) -> Show
      else if (currentScrollY < lastScrollY.current - 5) {
        setIsVisible(true);
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
    { id: 'account', Icon: UserIcon, href: '/account' },
  ];

  return (
    <div className="md:hidden flex justify-center w-full pointer-events-none fixed bottom-8 z-50">
      <nav
        className={`
          pointer-events-auto
          flex items-center justify-between px-6 py-4
          bg-white text-black
          shadow-[0_8px_30px_rgb(0,0,0,0.12)]
          rounded-full
          transition-all duration-300 ease-in-out
          ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-24 opacity-0 scale-95'}
        `}
        style={{
            // এই Width-এর কারণেই এটি "Floating Pill" এর মতো দেখাবে
            width: '280px', 
            // Backdrop blur অপশনাল, যদি গ্লাস ইফেক্ট চান
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)'
        }}
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setActiveTab(item.id)}
              className="relative flex items-center justify-center w-10 h-10"
            >
              <div 
                className={`transition-all duration-200 ${
                  isActive ? 'text-black scale-110' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <item.Icon active={isActive} />
              </div>

              {/* Minimal Dot Badge for Cart */}
              {item.badge > 0 && (
                <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full border border-white" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
