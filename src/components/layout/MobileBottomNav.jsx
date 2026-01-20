'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useCartStore from '@/store/cartStore';

// --- Premium Icons (Filled vs Outlined) ---

const HomeIcon = ({ active }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "0" : "1.8"}>
    <path d="M3 9.5L12 2.5L21 9.5V20.5C21 21.0523 20.5523 21.5 20 21.5H15V14.5H9V21.5H4C3.44772 21.5 3 21.0523 3 20.5V9.5Z" />
  </svg>
);

const SearchIcon = ({ active }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.5" : "1.8"}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20L16 16" strokeLinecap="round" />
  </svg>
);

// প্রিমিয়াম ব্র্যান্ডে "Cart" এর বদলে "Shopping Bag" আইকন বেশি মানানসই
const BagIcon = ({ active }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "0" : "1.8"}>
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
  <svg width="26" height="26" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "0" : "1.8"}>
    <path d="M20 21C20 18.2386 16.4183 16 12 16C7.58172 16 4 18.2386 4 21" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { getItemCount } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  const isAdminPage = pathname?.startsWith('/admin');
  const isCheckoutPage = pathname === '/checkout';

  useEffect(() => {
    setMounted(true);
    if (pathname === '/') setActiveTab('home');
    else if (pathname?.includes('/search')) setActiveTab('search');
    else if (pathname === '/cart') setActiveTab('cart');
    else if (pathname === '/account' || pathname === '/login') setActiveTab('account');
  }, [pathname]);

  if (isAdminPage || isCheckoutPage) return null;

  const cartCount = mounted ? getItemCount() : 0;

  const navItems = [
    { id: 'home', Icon: HomeIcon, href: '/' },
    { id: 'search', Icon: SearchIcon, href: '/search' },
    { id: 'cart', Icon: BagIcon, href: '/cart', badge: cartCount },
    { id: 'account', Icon: UserIcon, href: '/account' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-100 pb-[env(safe-area-inset-bottom)] md:hidden shadow-[0_-5px_10px_rgba(0,0,0,0.02)]">
      <div className="flex justify-around items-center h-[70px]"> {/* হাইট একটু বাড়ানো হয়েছে প্রিমিয়াম লুকের জন্য */}
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setActiveTab(item.id)}
              className="relative flex items-center justify-center w-16 h-16 transition-all duration-200"
            >
              {/* Active হলে কালো (Black), Inactive হলে হালকা ধূসর (Dark Gray) */}
              <div className={`transition-transform duration-200 ${isActive ? 'text-black scale-105' : 'text-gray-400 hover:text-gray-600'}`}>
                <item.Icon active={isActive} />
              </div>

              {/* Minimalist Cart Badge */}
              {item.badge > 0 && (
                <span className="absolute top-4 right-3 bg-black text-white text-[10px] font-medium h-4 w-4 flex items-center justify-center rounded-full border border-white">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
