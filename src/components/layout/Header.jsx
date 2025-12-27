'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, User, Search, Menu, X } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import SearchOverlay from './SearchOverlay';
import MenuOverlay from './MenuOverlay';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { getItemCount } = useCartStore();
  const { user, isAuthenticated, logout, isInitialized } = useAuthStore();
  
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const isHomePage = pathname === '/';
  const isAdminPage = pathname?.startsWith('/admin');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowUserDropdown(false);
    if (showUserDropdown) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserDropdown]);

  if (isAdminPage) return null;

  const cartCount = mounted ? getItemCount() : 0;

  // Header style based on page and scroll
  const headerBg = isHomePage && !isScrolled 
    ? 'bg-transparent' 
    : 'bg-white border-b border-gray-100';
  
  const textColor = isHomePage && !isScrolled 
    ? 'text-white' 
    : 'text-gray-900';

  const iconColor = isHomePage && !isScrolled
    ? 'text-white hover:text-gray-200'
    : 'text-gray-700 hover:text-gray-900';

  const handleLogout = () => {
    logout();
    setShowUserDropdown(false);
    router.push('/');
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${headerBg}`}>
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            
            {/* Left - Logo */}
            <Link 
              href="/" 
              className={`text-xl tracking-[0.3em] font-light transition-colors ${textColor}`}
            >
              PRISMIN
            </Link>

            {/* Right - Icons */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button
                onClick={() => setShowSearch(true)}
                className={`p-3 rounded-full transition-colors ${iconColor}`}
              >
                <Search size={22} />
              </button>

              {/* User / Account */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!mounted || !isInitialized) return;
                    if (isAuthenticated) {
                      setShowUserDropdown(!showUserDropdown);
                    } else {
                      router.push('/login');
                    }
                  }}
                  className={`p-3 rounded-full transition-colors ${iconColor}`}
                >
                  <User size={22} />
                </button>

                {/* User Dropdown */}
                {showUserDropdown && isAuthenticated && (
                  <div 
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                    
                    {user?.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setShowUserDropdown(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Admin Panel
                      </Link>
                    )}
                    
                    <Link
                      href="/orders"
                      onClick={() => setShowUserDropdown(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      My Orders
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>

              {/* Cart */}
              <Link
                href="/cart"
                className={`p-3 rounded-full transition-colors relative ${iconColor}`}
              >
                <ShoppingBag size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#B08B5C] text-white text-xs font-medium rounded-full flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Menu */}
              <button
                onClick={() => setShowMenu(true)}
                className={`p-3 rounded-full transition-colors flex items-center gap-2 ${iconColor}`}
              >
                <Menu size={22} />
                <span className={`text-sm font-medium tracking-wide hidden sm:inline ${textColor}`}>
                  MENU
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      <SearchOverlay 
        isOpen={showSearch} 
        onClose={() => setShowSearch(false)} 
      />

      {/* Menu Overlay */}
      <MenuOverlay 
        isOpen={showMenu} 
        onClose={() => setShowMenu(false)} 
      />
    </>
  );
}
