'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, User, Search, Menu, X, ChevronRight } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';

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
  const [searchQuery, setSearchQuery] = useState('');

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

  useEffect(() => {
    const handleClickOutside = () => setShowUserDropdown(false);
    if (showUserDropdown) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserDropdown]);

  useEffect(() => {
    if (showMenu || showSearch) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showMenu, showSearch]);

  if (isAdminPage) return null;

  const cartCount = mounted ? getItemCount() : 0;

  const headerBg = isHomePage && !isScrolled 
    ? 'bg-transparent' 
    : 'bg-white/95 backdrop-blur-sm border-b border-gray-100';
  
  const textColor = isHomePage && !isScrolled ? 'text-white' : 'text-[#0C0C0C]';
  const iconColor = isHomePage && !isScrolled ? 'text-white' : 'text-[#0C0C0C]';

  const handleLogout = () => {
    logout();
    setShowUserDropdown(false);
    router.push('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  const menuItems = [
    { name: 'Menswear', href: '/menswear' },
    { name: 'Womenswear', href: '/womenswear' },
    { name: 'Watches', href: '/watch' },
    { name: 'Beauty & Care', href: '/beauty' },
    { name: 'All Products', href: '/shop' },
  ];

  const secondaryLinks = [
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Shipping', href: '/shipping' },
  ];

  return (
    <>
      {/* Main Header */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${headerBg}`}>
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            
            {/* Left - Contact (Desktop) */}
            <div className="hidden md:flex items-center w-[200px]">
              <Link href="/contact" className={`text-sm tracking-wide hover:opacity-70 transition-opacity ${textColor}`}>
                + Contact Us
              </Link>
            </div>

            {/* Center - Logo */}
            <Link 
              href="/" 
              className={`text-xl md:text-2xl tracking-[0.4em] font-light transition-colors ${textColor}`}
            >
              PRISMIN
            </Link>

            {/* Right - Icons */}
            <div className="flex items-center justify-end gap-1 md:gap-2 w-[200px]">
              {/* Cart */}
              <Link
                href="/cart"
                className={`p-2 md:p-3 rounded-full transition-opacity hover:opacity-70 relative ${iconColor}`}
              >
                <ShoppingBag size={20} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-[#B08B5C] text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* User */}
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
                  className={`p-2 md:p-3 rounded-full transition-opacity hover:opacity-70 ${iconColor}`}
                >
                  <User size={20} strokeWidth={1.5} />
                </button>

                {showUserDropdown && isAuthenticated && (
                  <div 
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    {user?.role === 'admin' && (
                      <Link href="/admin" onClick={() => setShowUserDropdown(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        Admin Panel
                      </Link>
                    )}
                    <Link href="/orders" onClick={() => setShowUserDropdown(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      My Orders
                    </Link>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                      Logout
                    </button>
                  </div>
                )}
              </div>

              {/* Search */}
              <button
                onClick={() => setShowSearch(true)}
                className={`p-2 md:p-3 rounded-full transition-opacity hover:opacity-70 ${iconColor}`}
              >
                <Search size={20} strokeWidth={1.5} />
              </button>

              {/* Menu */}
              <button
                onClick={() => setShowMenu(true)}
                className={`p-2 md:p-3 rounded-full transition-opacity hover:opacity-70 flex items-center gap-2 ${iconColor}`}
              >
                <Menu size={20} strokeWidth={1.5} />
                <span className={`text-sm tracking-wide hidden md:inline ${textColor}`}>MENU</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      {showSearch && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="border-b border-gray-200">
            <div className="max-w-[1280px] mx-auto px-6">
              <form onSubmit={handleSearch} className="flex items-center h-16 md:h-20 gap-4">
                <Search size={22} className="text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products..."
                  autoFocus
                  className="flex-1 text-lg md:text-xl font-light outline-none placeholder:text-gray-300"
                />
                <button type="button" onClick={() => setShowSearch(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={24} className="text-gray-800" />
                </button>
              </form>
            </div>
          </div>

          <div className="max-w-[1280px] mx-auto px-6 py-10">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Trending Searches</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {['Watch', 'Formal Shirt', 'Saree', 'Sneakers', 'Perfume'].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    router.push(`/shop?search=${encodeURIComponent(term)}`);
                    setShowSearch(false);
                  }}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-full transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Menu Overlay - Gucci Style Right Panel */}
      {showMenu && (
        <>
          {/* Backdrop with blur */}
          <div 
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu Panel */}
          <div 
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[420px] bg-white shadow-2xl flex flex-col"
            style={{ animation: 'slideInRight 0.3s ease' }}
          >
            {/* Header with Close */}
            <div className="flex items-center justify-end p-4 border-b border-gray-100">
              <button
                onClick={() => setShowMenu(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={28} strokeWidth={1.5} />
              </button>
            </div>

            {/* Menu Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Main Navigation */}
              <nav className="py-6">
                {menuItems.map((item, index) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setShowMenu(false)}
                    className="flex items-center justify-between px-8 py-5 text-[22px] font-light text-[#0C0C0C] hover:bg-gray-50 transition-colors group"
                  >
                    <span className="group-hover:text-[#B08B5C] transition-colors">{item.name}</span>
                    <ChevronRight size={20} className="text-gray-300 group-hover:text-[#B08B5C] group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </nav>

              {/* Divider */}
              <div className="mx-8 border-t border-gray-200" />

              {/* Secondary Links */}
              <div className="py-6">
                {secondaryLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setShowMenu(false)}
                    className="block px-8 py-3 text-[15px] text-gray-600 hover:text-[#0C0C0C] hover:bg-gray-50 transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              {/* Divider */}
              <div className="mx-8 border-t border-gray-200" />

              {/* Account Section */}
              <div className="py-6">
                {isAuthenticated ? (
                  <>
                    <div className="px-8 py-3">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Account</p>
                      <p className="text-sm font-medium text-[#0C0C0C]">{user?.name || 'User'}</p>
                    </div>
                    <Link
                      href="/orders"
                      onClick={() => setShowMenu(false)}
                      className="block px-8 py-3 text-[15px] text-gray-600 hover:text-[#0C0C0C] hover:bg-gray-50 transition-colors"
                    >
                      My Orders
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setShowMenu(false)}
                        className="block px-8 py-3 text-[15px] text-gray-600 hover:text-[#0C0C0C] hover:bg-gray-50 transition-colors"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => { handleLogout(); setShowMenu(false); }}
                      className="block w-full text-left px-8 py-3 text-[15px] text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setShowMenu(false)}
                      className="block px-8 py-3 text-[15px] font-medium text-[#0C0C0C] hover:bg-gray-50 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setShowMenu(false)}
                      className="block px-8 py-3 text-[15px] text-gray-600 hover:text-[#0C0C0C] hover:bg-gray-50 transition-colors"
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 p-6">
              <p className="text-xs text-gray-400 text-center">
                © 2024 PRISMIN. All rights reserved.
              </p>
            </div>
          </div>
        </>
      )}

      <style jsx global>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
