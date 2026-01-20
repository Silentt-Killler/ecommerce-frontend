'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useCartStore from '@/store/cartStore';

// ১. আইকনগুলোকে একটু মোটা এবং স্পষ্ট করা হয়েছে (Pinterest Style)
const HomeIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "black" : "none"} stroke="currentColor" strokeWidth={active ? "2" : "2"}>
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
  </svg>
);

const SearchIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
  </svg>
);

const CartIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "black" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18M16 10a4 4 0 01-8 0" />
  </svg>
);

const UserIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "black" : "none"} stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="4" />
    <path d="M20 21a8 8 0 10-16 0" />
  </svg>
);

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { getItemCount } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  // অ্যাডমিন বা চেকআউট পেজে এই মেনু দেখাবে না
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

  // ২. মেনুর সিরিয়াল ঠিক করা হয়েছে: Home -> Search -> Cart -> Account
  const navItems = [
    { id: 'home', label: 'Home', Icon: HomeIcon, href: '/' },
    { id: 'search', label: 'Search', Icon: SearchIcon, href: '/search' },
    { id: 'cart', label: 'Cart', Icon: CartIcon, href: '/cart', badge: cartCount },
    { id: 'account', label: 'Account', Icon: UserIcon, href: '/account' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center justify-center w-full h-full space-y-1"
            >
              <div className="relative">
                {/* আইকন কালার: Active হলে কালো, না হলে ধূসর */}
                <div className={`${isActive ? 'text-black' : 'text-gray-500'}`}>
                    <item.Icon active={isActive} />
                </div>

                {/* ৩. লাল রঙের নোটিফিকেশন ব্যাজ (স্ক্রিনশটের মতো) */}
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-white">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              {/* ৪. আইকনের নিচে লেখা (Label) যোগ করা হয়েছে */}
              <span className={`text-[10px] font-medium ${isActive ? 'text-black' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
