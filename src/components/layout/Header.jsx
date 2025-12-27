'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, User, Search, Menu, X } from 'lucide-react';
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

  // Prevent body scroll when menu/search is open
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

  // Menu Items
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
  ];

  return (
    <>
      {/* Main Header */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${headerBg}`}>
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            
            {/* Left - Contact (Desktop) */}
            <div className="hidden md:flex items-center">
              <Link href="/contact" className={`text-sm tracking-wide hover:opacity-70 transition-opacity ${textColor}`}>
                + Contact Us
              </Link>
            </div>

            {/* Center - Logo */}
            <Link 
              href="/" 
              className={`absolute left-1/2 transform -translate-x-1/2 text-xl md:text-2xl tracking-[0.4em] font-light transition-colors ${textColor}`}
            >
              PRISMIN
            </Link>

            {/* Right - Icons */}
            <div className="flex items-center gap-1 md:gap-2 ml-auto">
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

      {/* Search Overlay - Full Screen */}
      {showSearch && (
        <div className="fixed inset-0 z-50 bg-white">
          {/* Search Header */}
          <div className="border-b border-gray-200">
            <div className="max-w-[1400px] mx-auto px-6">
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

          {/* Trending Searches */}
          <div className="max-w-[1400px] mx-auto px-6 py-10">
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

      {/* Menu Overlay - Right Side (Gucci Style) */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu Panel */}
          <div 
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl overflow-y-auto"
            style={{ animation: 'slideInRight 0.3s ease' }}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowMenu(false)}
              className="absolute top-4 right-4 p-3 hover:bg-gray-100 rounded-full transition-colors z-10"
            >
              <X size={24} />
            </button>

            {/* Menu Content */}
            <div className="pt-20 pb-10 px-8">
              {/* Main Menu */}
              <nav className="mb-12">
                {menuItems.map((item, index) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setShowMenu(false)}
                    className="block py-4 text-xl md:text-2xl font-light text-[#0C0C0C] hover:text-[#B08B5C] transition-colors border-b border-gray-100"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Secondary Links */}
              <div className="mb-12">
                {secondaryLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setShowMenu(false)}
                    className="block py-3 text-base text-gray-600 hover:text-[#0C0C0C] transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              {/* Account Section */}
              <div className="pt-6 border-t border-gray-200">
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/orders"
                      onClick={() => setShowMenu(false)}
                      className="block py-3 text-base text-gray-600 hover:text-[#0C0C0C] transition-colors"
                    >
                      My Orders
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setShowMenu(false)}
                        className="block py-3 text-base text-gray-600 hover:text-[#0C0C0C] transition-colors"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => { handleLogout(); setShowMenu(false); }}
                      className="block py-3 text-base text-red-600 hover:text-red-700 transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setShowMenu(false)}
                      className="block py-3 text-base font-medium text-[#0C0C0C] hover:text-[#B08B5C] transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setShowMenu(false)}
                      className="block py-3 text-base text-gray-600 hover:text-[#0C0C0C] transition-colors"
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* CSS Animation */}
      <style jsx global>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
