'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Menu, X, User } from 'lucide-react';
// import { useCart } from '@/contexts/CartContext';  // COMMENTED OUT
// import { useAuth } from '@/contexts/AuthContext';  // COMMENTED OUT

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Temporary values - context commented out
  const cartCount = 0;  // const { cartItems } = useCart();
  const user = null;    // const { user, logout } = useAuth();

  // Handle scroll to show/hide PRISMIN in nav
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-[#E0E0E0] z-40">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Left Menu */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-[#0C0C0C]"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="/shop?category=watch" className="text-sm tracking-[0.15em] text-[#0C0C0C] hover:text-[#B08B5C] transition-colors uppercase">
                Watch
              </Link>
              <Link href="/shop?category=menswear" className="text-sm tracking-[0.15em] text-[#0C0C0C] hover:text-[#B08B5C] transition-colors uppercase">
                Menswear
              </Link>
            </nav>
          </div>

          {/* Center Logo - Shows when scrolled */}
          <Link 
            href="/" 
            className={`absolute left-1/2 transform -translate-x-1/2 transition-all duration-500 ${
              scrolled ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <h1 className="text-2xl md:text-3xl font-light tracking-[0.3em] text-[#0C0C0C]">
              PRISMIN
            </h1>
          </Link>

          {/* Right Menu */}
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/shop?category=womenswear" className="text-sm tracking-[0.15em] text-[#0C0C0C] hover:text-[#B08B5C] transition-colors uppercase">
                Womenswear
              </Link>
              <Link href="/shop?category=accessories" className="text-sm tracking-[0.15em] text-[#0C0C0C] hover:text-[#B08B5C] transition-colors uppercase">
                Accessories
              </Link>
            </nav>

            {/* Icons */}
            <div className="flex items-center gap-4">
              <button className="text-[#0C0C0C] hover:text-[#B08B5C] transition-colors">
                <Search size={20} />
              </button>
              
              {user ? (
                <div className="relative group">
                  <button className="text-[#0C0C0C] hover:text-[#B08B5C] transition-colors">
                    <User size={20} />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link href="/account" className="block px-4 py-2 text-sm hover:bg-[#F7F7F7]">
                      My Account
                    </Link>
                    <Link href="/orders" className="block px-4 py-2 text-sm hover:bg-[#F7F7F7]">
                      Orders
                    </Link>
                    {user.is_admin && (
                      <Link href="/admin" className="block px-4 py-2 text-sm hover:bg-[#F7F7F7]">
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-[#F7F7F7]"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link href="/login" className="text-[#0C0C0C] hover:text-[#B08B5C] transition-colors">
                  <User size={20} />
                </Link>
              )}

              <Link href="/cart" className="relative text-[#0C0C0C] hover:text-[#B08B5C] transition-colors">
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#B08B5C] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-[#E0E0E0]">
            <Link href="/shop?category=watch" className="block py-2 text-sm tracking-[0.15em] text-[#0C0C0C] uppercase">
              Watch
            </Link>
            <Link href="/shop?category=menswear" className="block py-2 text-sm tracking-[0.15em] text-[#0C0C0C] uppercase">
              Menswear
            </Link>
            <Link href="/shop?category=womenswear" className="block py-2 text-sm tracking-[0.15em] text-[#0C0C0C] uppercase">
              Womenswear
            </Link>
            <Link href="/shop?category=accessories" className="block py-2 text-sm tracking-[0.15em] text-[#0C0C0C] uppercase">
              Accessories
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
