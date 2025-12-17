'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, User, Search, Menu, X, Plus } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import useCartStore from '@/store/cartStore';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { getItemCount } = useCartStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const itemCount = getItemCount();

  useEffect(() => {
    const handleScroll = () => {
      // Very sensitive - just 20px scroll shows logo in navbar
      setIsScrolled(window.scrollY > 20);
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
      {/* Fixed Header */}
      <header 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          transition: 'all 0.3s ease',
          backgroundColor: isScrolled ? '#FFFFFF' : 'transparent',
          borderBottom: isScrolled ? '1px solid #E0E0E0' : 'none'
        }}
      >
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: '0 40px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            height: 60
          }}>
            
            {/* Left - Contact */}
            <div style={{ flex: 1 }}>
              <Link 
                href="/contact" 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  letterSpacing: 1,
                  color: isScrolled ? '#0C0C0C' : '#FFFFFF',
                  textDecoration: 'none',
                  transition: 'color 0.3s'
                }}
              >
                <Plus size={12} />
                <span>Contact Us</span>
              </Link>
            </div>

            {/* Center - Logo (appears on scroll) */}
            <Link 
              href="/"
              style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                opacity: isScrolled ? 1 : 0,
                transition: 'opacity 0.3s ease',
                pointerEvents: isScrolled ? 'auto' : 'none'
              }}
            >
              <h1 style={{ 
                fontSize: 22, 
                fontWeight: 300, 
                letterSpacing: 6,
                color: '#0C0C0C',
                margin: 0
              }}>
                PRISMIN
              </h1>
            </Link>

            {/* Right - Icons */}
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'flex-end',
              gap: 20 
            }}>
              {/* Cart */}
              <Link 
                href="/cart" 
                style={{ 
                  position: 'relative',
                  color: isScrolled ? '#0C0C0C' : '#FFFFFF',
                  transition: 'color 0.3s'
                }}
              >
                <ShoppingBag size={20} strokeWidth={1.5} />
                {itemCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    width: 16,
                    height: 16,
                    backgroundColor: '#B08B5C',
                    color: '#FFFFFF',
                    fontSize: 9,
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%'
                  }}>
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* User */}
              {isAuthenticated ? (
                <div style={{ position: 'relative' }} className="user-dropdown">
                  <button style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    color: isScrolled ? '#0C0C0C' : '#FFFFFF',
                    transition: 'color 0.3s',
                    padding: 0
                  }}>
                    <User size={20} strokeWidth={1.5} />
                  </button>
                  <div className="dropdown-menu" style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    marginTop: 10,
                    width: 180,
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    opacity: 0,
                    visibility: 'hidden',
                    transition: 'all 0.2s'
                  }}>
                    <div style={{ padding: '8px 0' }}>
                      <p style={{ padding: '8px 16px', fontSize: 12, color: '#888', borderBottom: '1px solid #E0E0E0' }}>
                        {user?.name}
                      </p>
                      <Link href="/account" style={{ display: 'block', padding: '10px 16px', fontSize: 12, color: '#0C0C0C', textDecoration: 'none' }}>
                        My Account
                      </Link>
                      <Link href="/orders" style={{ display: 'block', padding: '10px 16px', fontSize: 12, color: '#0C0C0C', textDecoration: 'none' }}>
                        My Orders
                      </Link>
                      {user?.role === 'admin' && (
                        <Link href="/admin" style={{ display: 'block', padding: '10px 16px', fontSize: 12, color: '#0C0C0C', textDecoration: 'none' }}>
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={() => logout()}
                        style={{ 
                          display: 'block', 
                          width: '100%', 
                          textAlign: 'left',
                          padding: '10px 16px', 
                          fontSize: 12, 
                          color: '#B00020',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link 
                  href="/login" 
                  style={{ 
                    color: isScrolled ? '#0C0C0C' : '#FFFFFF',
                    transition: 'color 0.3s'
                  }}
                >
                  <User size={20} strokeWidth={1.5} />
                </Link>
              )}

              {/* Search */}
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  color: isScrolled ? '#0C0C0C' : '#FFFFFF',
                  transition: 'color 0.3s',
                  padding: 0
                }}
              >
                <Search size={20} strokeWidth={1.5} />
              </button>

              {/* Menu Toggle */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  color: isScrolled ? '#0C0C0C' : '#FFFFFF',
                  transition: 'color 0.3s',
                  padding: 0
                }}
              >
                <Menu size={20} strokeWidth={1.5} />
                <span style={{ fontSize: 12, letterSpacing: 1 }}>MENU</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{
          overflow: 'hidden',
          maxHeight: isSearchOpen ? 60 : 0,
          transition: 'max-height 0.3s ease',
          backgroundColor: '#FFFFFF',
          borderTop: isSearchOpen ? '1px solid #E0E0E0' : 'none'
        }}>
          <div style={{ maxWidth: 1600, margin: '0 auto', padding: '12px 40px' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid #E0E0E0',
                  padding: '8px 0',
                  fontSize: 13,
                  outline: 'none'
                }}
              />
              <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <Search size={18} />
              </button>
              <button type="button" onClick={() => setIsSearchOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <X size={18} />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Full Screen Menu */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        backgroundColor: '#FFFFFF',
        transform: isMenuOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.5s ease'
      }}>
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: '0 40px', height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Menu Header */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            height: 60,
            borderBottom: '1px solid #E0E0E0'
          }}>
            <Link href="/" onClick={() => setIsMenuOpen(false)}>
              <h1 style={{ fontSize: 22, fontWeight: 300, letterSpacing: 6, color: '#0C0C0C', margin: 0 }}>
                PRISMIN
              </h1>
            </Link>
            <button 
              onClick={() => setIsMenuOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <X size={24} strokeWidth={1.5} />
            </button>
          </div>

          {/* Menu Content */}
          <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { name: 'MENSWEAR', href: '/menswear' },
                { name: 'WOMENSWEAR', href: '/womenswear' },
                { name: 'WATCHES', href: '/watch' },
                { name: 'ACCESSORIES', href: '/shop?category=accessories' },
                { name: 'ALL PRODUCTS', href: '/shop' }
              ].map((item, index) => (
                <li key={index} style={{ marginBottom: 20 }}>
                  <Link 
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                      fontSize: 38,
                      fontWeight: 300,
                      letterSpacing: 3,
                      color: '#0C0C0C',
                      textDecoration: 'none',
                      transition: 'opacity 0.3s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = '0.5'}
                    onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Menu Footer */}
          <div style={{ borderTop: '1px solid #E0E0E0', padding: '20px 0' }}>
            <div style={{ display: 'flex', gap: 20, fontSize: 12, letterSpacing: 1 }}>
              <Link href="/about" onClick={() => setIsMenuOpen(false)} style={{ color: '#0C0C0C', textDecoration: 'none' }}>About</Link>
              <Link href="/contact" onClick={() => setIsMenuOpen(false)} style={{ color: '#0C0C0C', textDecoration: 'none' }}>Contact</Link>
              <Link href="/faq" onClick={() => setIsMenuOpen(false)} style={{ color: '#0C0C0C', textDecoration: 'none' }}>FAQ</Link>
              <Link href="/shipping" onClick={() => setIsMenuOpen(false)} style={{ color: '#0C0C0C', textDecoration: 'none' }}>Shipping</Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .user-dropdown:hover .dropdown-menu {
          opacity: 1 !important;
          visibility: visible !important;
        }
      `}</style>
    </>
  );
}
