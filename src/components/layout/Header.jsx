'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, User, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Handle scroll for showing brand name
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);

    // Get cart count
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cart.reduce((acc, item) => acc + item.quantity, 0));

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: scrolled ? '#FFFFFF' : 'transparent',
        transition: 'all 0.4s ease',
        borderBottom: scrolled ? '1px solid #E0E0E0' : 'none'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 40px',
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Left Section - Contact */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center'
          }}>
            <Link 
              href="/contact"
              style={{
                fontSize: '12px',
                letterSpacing: '1px',
                color: scrolled ? '#919191' : '#FFFFFF',
                textDecoration: 'none',
                transition: 'color 0.3s ease',
                fontWeight: 400
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = scrolled ? '#0C0C0C' : '#F7F7F7';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = scrolled ? '#919191' : '#FFFFFF';
              }}
            >
              + Contact Us
            </Link>
          </div>

          {/* Center - Logo/Brand Name */}
          <Link 
            href="/"
            style={{ 
              textDecoration: 'none',
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }}
          >
            <h1 style={{
              fontSize: scrolled ? '28px' : '0px',
              fontWeight: 300,
              letterSpacing: scrolled ? '8px' : '0px',
              color: '#0C0C0C',
              margin: 0,
              opacity: scrolled ? 1 : 0,
              transition: 'all 0.4s ease'
            }}>
              PRISMIN
            </h1>
          </Link>

          {/* Right Section - Icons */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '24px'
          }}>
            {/* Cart */}
            <Link 
              href="/cart"
              style={{
                position: 'relative',
                textDecoration: 'none',
                color: scrolled ? '#0C0C0C' : '#FFFFFF',
                transition: 'color 0.3s ease'
              }}
            >
              <ShoppingBag size={22} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  backgroundColor: '#B08B5C',
                  color: '#FFFFFF',
                  fontSize: '10px',
                  fontWeight: 500,
                  padding: '2px 6px',
                  borderRadius: '10px',
                  minWidth: '18px',
                  textAlign: 'center'
                }}>
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Account */}
            <Link 
              href="/account"
              style={{
                textDecoration: 'none',
                color: scrolled ? '#0C0C0C' : '#FFFFFF',
                transition: 'color 0.3s ease'
              }}
            >
              <User size={22} strokeWidth={1.5} />
            </Link>

            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: scrolled ? '#0C0C0C' : '#FFFFFF',
                padding: 0,
                transition: 'color 0.3s ease'
              }}
            >
              <Search size={22} strokeWidth={1.5} />
            </button>

            {/* Menu */}
            <button
              onClick={() => setIsMenuOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: scrolled ? '#0C0C0C' : '#FFFFFF',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                letterSpacing: '2px',
                fontWeight: 400,
                transition: 'color 0.3s ease'
              }}
            >
              <Menu size={22} strokeWidth={1.5} />
              <span>MENU</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{
          overflow: 'hidden',
          maxHeight: isSearchOpen ? '80px' : '0',
          transition: 'max-height 0.3s ease',
          backgroundColor: '#FFFFFF',
          borderBottom: isSearchOpen ? '1px solid #E0E0E0' : 'none'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '20px 40px'
          }}>
            <form onSubmit={handleSearch} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid #E0E0E0',
                  padding: '8px 0',
                  fontSize: '14px',
                  outline: 'none',
                  color: '#0C0C0C'
                }}
              />
              <button 
                type="submit"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#0C0C0C'
                }}
              >
                <Search size={20} />
              </button>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#919191'
                }}
              >
                <X size={20} />
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
        transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 40px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Menu Header */}
          <div style={{
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #E0E0E0'
          }}>
            <Link 
              href="/" 
              onClick={() => setIsMenuOpen(false)}
              style={{ textDecoration: 'none' }}
            >
              <h1 style={{
                fontSize: '28px',
                fontWeight: 300,
                letterSpacing: '8px',
                color: '#0C0C0C',
                margin: 0
              }}>
                PRISMIN
              </h1>
            </Link>
            <button
              onClick={() => setIsMenuOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#0C0C0C',
                padding: 0
              }}
            >
              <X size={28} strokeWidth={1.5} />
            </button>
          </div>

          {/* Menu Content */}
          <nav style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingBottom: '100px'
          }}>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              {[
                { name: 'MENSWEAR', href: '/menswear' },
                { name: 'WOMENSWEAR', href: '/womenswear' },
                { name: 'WATCHES', href: '/watch' },
                { name: 'ACCESSORIES', href: '/accessories' },
                { name: 'ALL PRODUCTS', href: '/shop' }
              ].map((item, index) => (
                <li key={index} style={{ marginBottom: '40px' }}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                      fontSize: '48px',
                      fontWeight: 200,
                      letterSpacing: '4px',
                      color: '#0C0C0C',
                      textDecoration: 'none',
                      transition: 'opacity 0.3s ease',
                      display: 'inline-block'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.5';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
