'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, User, Search, Menu, X, Plus } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import useCartStore from '@/store/cartStore';

export default function Header() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { getItemCount } = useCartStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const itemCount = getItemCount();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-sm' : 'bg-white'
      }`}>
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 md:h-20">
            
            {/* Left - Contact */}
            <div className="hidden md:flex items-center">
              <Link 
                href="/contact" 
                className="flex items-center gap-1 text-sm tracking-wide hover:opacity-70 transition-opacity"
              >
                <Plus size={14} />
                <span>Contact Us</span>
              </Link>
            </div>

            {/* Center - Logo */}
            <Link href="/" className="absolute left-1/2 transform -translate-x-1/2">
              <h1 className="text-2xl md:text-3xl tracking-[0.3em] font-light">
                PRISMIN
              </h1>
            </Link>

            {/* Right - Icons */}
            <div className="flex items-center gap-4 md:gap-6 ml-auto">
              {/* Cart */}
              <Link href="/cart" className="relative hover:opacity-70 transition-opacity">
                <ShoppingBag size={22} strokeWidth={1.5} />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-focus text-white text-xs flex items-center justify-center rounded-full">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* User */}
              {isAuthenticated ? (
                <div className="relative group">
                  <button className="hover:opacity-70 transition-opacity">
                    <User size={22} strokeWidth={1.5} />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div className="py-2">
                      <p className="px-4 py-2 text-sm text-muted border-b">{user?.name}</p>
                      <Link href="/account" className="block px-4 py-2 text-sm hover:bg-primary-50">
                        My Account
                      </Link>
                      <Link href="/orders" className="block px-4 py-2 text-sm hover:bg-primary-50">
                        My Orders
                      </Link>
                      {user?.role === 'admin' && (
                        <Link href="/admin" className="block px-4 py-2 text-sm hover:bg-primary-50">
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={() => logout()}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-primary-50 text-red-600"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link href="/login" className="hover:opacity-70 transition-opacity">
                  <User size={22} strokeWidth={1.5} />
                </Link>
              )}

              {/* Search */}
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="hover:opacity-70 transition-opacity"
              >
                <Search size={22} strokeWidth={1.5} />
              </button>

              {/* Menu Toggle */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 hover:opacity-70 transition-opacity"
              >
                <Menu size={22} strokeWidth={1.5} />
                <span className="hidden md:inline text-sm tracking-wide">MENU</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className={`border-t overflow-hidden transition-all duration-300 ${
          isSearchOpen ? 'max-h-20' : 'max-h-0'
        }`}>
          <div className="container-custom py-4">
            <form onSubmit={handleSearch} className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-b border-focus/20 py-2 focus:border-focus outline-none text-sm"
              />
              <button type="submit" className="hover:opacity-70">
                <Search size={20} />
              </button>
              <button type="button" onClick={() => setIsSearchOpen(false)} className="hover:opacity-70">
                <X size={20} />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Full Screen Menu */}
      <div className={`fixed inset-0 z-[60] bg-white transition-transform duration-500 ${
        isMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="container-custom h-full flex flex-col">
          {/* Menu Header */}
          <div className="flex items-center justify-between h-16 md:h-20 border-b">
            <Link href="/" onClick={() => setIsMenuOpen(false)}>
              <h1 className="text-2xl md:text-3xl tracking-[0.3em] font-light">PRISMIN</h1>
            </Link>
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="hover:opacity-70 transition-opacity"
            >
              <X size={28} strokeWidth={1.5} />
            </button>
          </div>

          {/* Menu Content */}
          <nav className="flex-1 flex flex-col justify-center">
            <ul className="space-y-6 md:space-y-8">
              <li>
                <Link 
                  href="/shop?category=menswear"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-3xl md:text-5xl font-light tracking-wide hover:opacity-50 transition-opacity"
                >
                  MENSWEAR
                </Link>
              </li>
              <li>
                <Link 
                  href="/shop?category=womenswear"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-3xl md:text-5xl font-light tracking-wide hover:opacity-50 transition-opacity"
                >
                  WOMENSWEAR
                </Link>
              </li>
              <li>
                <Link 
                  href="/shop?category=winter-collection"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-3xl md:text-5xl font-light tracking-wide hover:opacity-50 transition-opacity"
                >
                  WINTER COLLECTION
                </Link>
              </li>
              <li>
                <Link 
                  href="/shop?category=watch"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-3xl md:text-5xl font-light tracking-wide hover:opacity-50 transition-opacity"
                >
                  WATCH
                </Link>
              </li>
              <li>
                <Link 
                  href="/shop"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-3xl md:text-5xl font-light tracking-wide hover:opacity-50 transition-opacity"
                >
                  ALL PRODUCTS
                </Link>
              </li>
            </ul>
          </nav>

          {/* Menu Footer */}
          <div className="border-t py-6">
            <div className="flex flex-wrap gap-6 text-sm tracking-wide">
              <Link href="/about" onClick={() => setIsMenuOpen(false)} className="hover:opacity-50">
                About
              </Link>
              <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="hover:opacity-50">
                Contact
              </Link>
              <Link href="/faq" onClick={() => setIsMenuOpen(false)} className="hover:opacity-50">
                FAQ
              </Link>
              <Link href="/shipping" onClick={() => setIsMenuOpen(false)} className="hover:opacity-50">
                Shipping
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-16 md:h-20"></div>
    </>
  );
}
