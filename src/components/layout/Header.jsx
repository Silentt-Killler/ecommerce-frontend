'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ShoppingBag, User, Search } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import useCartStore from '@/store/cartStore';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const { isAuthenticated, user, logout } = useAuthStore();
  const { items } = useCartStore();
  
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="bg-white border-b border-primary-200 sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Logo */}
          <Link href="/" className="font-heading text-2xl md:text-3xl text-focus">
            BRAND
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/shop" className="text-focus hover:text-gold transition-colors">
              Shop
            </Link>
            <Link href="/categories" className="text-focus hover:text-gold transition-colors">
              Categories
            </Link>
            <Link href="/about" className="text-focus hover:text-gold transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-focus hover:text-gold transition-colors">
              Contact
            </Link>
          </nav>

          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 hover:text-gold transition-colors"
            >
              <Search size={20} />
            </button>

            {/* User */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="p-2 hover:text-gold transition-colors">
                  <User size={20} />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white border border-primary-200 shadow-lg 
                                opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="p-3 border-b border-primary-200">
                    <p className="font-medium truncate">{user?.name}</p>
                    <p className="text-sm text-muted truncate">{user?.email}</p>
                  </div>
                  <Link href="/account" className="block px-3 py-2 hover:bg-primary-100">
                    My Account
                  </Link>
                  <Link href="/orders" className="block px-3 py-2 hover:bg-primary-100">
                    Orders
                  </Link>
                  <button 
                    onClick={logout}
                    className="w-full text-left px-3 py-2 hover:bg-primary-100 text-red-600"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/login" className="p-2 hover:text-gold transition-colors">
                <User size={20} />
              </Link>
            )}

            {/* Cart */}
            <Link href="/cart" className="p-2 hover:text-gold transition-colors relative">
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold text-white text-xs w-5 h-5 
                                 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 md:hidden"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="py-4 border-t border-primary-200">
            <form action="/shop" method="GET" className="relative">
              <input
                type="text"
                name="search"
                placeholder="Search products..."
                className="input-field pr-12"
              />
              <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2">
                <Search size={20} className="text-muted" />
              </button>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-primary-200">
            <div className="flex flex-col space-y-3">
              <Link href="/shop" className="py-2 text-focus hover:text-gold">
                Shop
              </Link>
              <Link href="/categories" className="py-2 text-focus hover:text-gold">
                Categories
              </Link>
              <Link href="/about" className="py-2 text-focus hover:text-gold">
                About
              </Link>
              <Link href="/contact" className="py-2 text-focus hover:text-gold">
                Contact
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
