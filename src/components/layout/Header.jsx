'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, User, Search, Menu, X, Plus } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import useCartStore from '@/store/cartStore';
import MenuOverlay from './MenuOverlay';
import SearchOverlay from './SearchOverlay';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { getItemCount } = useCartStore();
  
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const dropdownRef = useRef(null);
  const dropdownTimeoutRef = useRef(null);

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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  // Hide header on admin pages
  if (isAdminPage) return null;

  const cartCount = mounted ? getItemCount() : 0;

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    router.push('/');
  };

  // Dropdown hover handlers with delay
  const handleDropdownEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setShowDropdown(true);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setShowDropdown(false);
    }, 150); // Small delay to allow moving to dropdown
  };

  // Get text/icon color based on scroll state and page
  const getColor = () => {
    if (isHomePage && !isScrolled) return '#FFFFFF';
    return '#0C0C0C';
  };

  return (
    <>
      {/* Main Header */}
      <header 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          transition: 'all 0.3s ease',
          backgroundColor: isHomePage && !isScrolled ? 'transparent' : 'rgba(255,255,255,0.98)',
          backdropFilter: isScrolled || !isHomePage ? 'blur(10px)' : 'none',
          borderBottom: isScrolled || !isHomePage ? '1px solid #E0E0E0' : 'none'
        }}
      >
        {/* Container */}
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: '0 40px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            height: 60
          }}>
            
            {/* Left - Contact Us (Desktop only) */}
            <div style={{ flex: 1 }} className="hidden md:block">
              <Link 
                href="/contact" 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  letterSpacing: 1,
                  color: getColor(),
                  textDecoration: 'none',
                  transition: 'color 0.3s'
                }}
              >
                <Plus size={12} />
                <span>Contact Us</span>
              </Link>
            </div>

            {/* Center - Logo */}
            <Link 
              href="/"
              style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 22,
                fontWeight: 300,
                letterSpacing: 6,
                color: getColor(),
                textDecoration: 'none',
                transition: 'color 0.3s'
              }}
            >
              PRISMIN
            </Link>

            {/* Right - Icons + MENU */}
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'flex-end',
              gap: 18 
            }}>
              {/* Cart */}
              <Link 
                href="/cart" 
                style={{ 
                  position: 'relative',
                  color: getColor(),
                  transition: 'color 0.3s',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ShoppingBag size={20} strokeWidth={1.5} />
                {mounted && cartCount > 0 && (
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
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User Icon with Dropdown */}
              {mounted && isAuthenticated ? (
                <div 
                  ref={dropdownRef}
                  style={{ position: 'relative' }}
                  onMouseEnter={handleDropdownEnter}
                  onMouseLeave={handleDropdownLeave}
                >
                  <button 
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer',
                      color: getColor(),
                      transition: 'color 0.3s',
                      padding: 4,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <User size={20} strokeWidth={1.5} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div 
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '100%',
                      paddingTop: 8, // Gap for hover transition
                      opacity: showDropdown ? 1 : 0,
                      visibility: showDropdown ? 'visible' : 'hidden',
                      transform: showDropdown ? 'translateY(0)' : 'translateY(-10px)',
                      transition: 'all 0.2s ease',
                      zIndex: 100
                    }}
                    onMouseEnter={handleDropdownEnter}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <div style={{
                      width: 200,
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                      borderRadius: 8,
                      overflow: 'hidden',
                      border: '1px solid #E8E8E8'
                    }}>
                      {/* User Info */}
                      <div style={{ 
                        padding: '14px 16px', 
                        borderBottom: '1px solid #E8E8E8',
                        backgroundColor: '#FAFAFA'
                      }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#0C0C0C', margin: 0 }}>
                          {user?.name || 'User'}
                        </p>
                        <p style={{ fontSize: 12, color: '#919191', margin: '4px 0 0 0' }}>
                          {user?.email}
                        </p>
                      </div>
                      
                      {/* Menu Items */}
                      <div style={{ padding: '8px 0' }}>
                        <Link 
                          href="/account" 
                          style={{ 
                            display: 'block', 
                            padding: '10px 16px', 
                            fontSize: 14, 
                            color: '#0C0C0C', 
                            textDecoration: 'none',
                            transition: 'background 0.2s'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#F5F5F5'}
                          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          My Profile
                        </Link>
                        
                        <Link 
                          href="/account/orders" 
                          style={{ 
                            display: 'block', 
                            padding: '10px 16px', 
                            fontSize: 14, 
                            color: '#0C0C0C', 
                            textDecoration: 'none',
                            transition: 'background 0.2s'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#F5F5F5'}
                          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          My Orders
                        </Link>
                        
                        {/* Admin Link - Only for admins */}
                        {user?.role === 'admin' && (
                          <Link 
                            href="/admin" 
                            style={{ 
                              display: 'block', 
                              padding: '10px 16px', 
                              fontSize: 14, 
                              color: '#B08B5C', 
                              fontWeight: 500,
                              textDecoration: 'none',
                              transition: 'background 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#F5F5F5'}
                            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            Admin Panel
                          </Link>
                        )}
                        
                        {/* Divider */}
                        <div style={{ height: 1, backgroundColor: '#E8E8E8', margin: '8px 0' }} />
                        
                        {/* Logout */}
                        <button
                          onClick={handleLogout}
                          style={{ 
                            display: 'block', 
                            width: '100%', 
                            textAlign: 'left',
                            padding: '10px 16px', 
                            fontSize: 14, 
                            color: '#DC2626',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#FEF2F2'}
                          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link 
                  href="/login" 
                  style={{ 
                    color: getColor(),
                    transition: 'color 0.3s',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <User size={20} strokeWidth={1.5} />
                </Link>
              )}

              {/* Search Button */}
              <button 
                onClick={() => setShowSearch(true)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  color: getColor(),
                  transition: 'color 0.3s',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Search size={20} strokeWidth={1.5} />
              </button>

              {/* Menu Toggle - Desktop only */}
              <button 
                onClick={() => setShowMenu(true)}
                className="hidden md:flex"
                style={{ 
                  alignItems: 'center',
                  gap: 6,
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  color: getColor(),
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
      </header>

      {/* Search Overlay Component */}
      <SearchOverlay isOpen={showSearch} onClose={() => setShowSearch(false)} />

      {/* Menu Overlay Component */}
      <MenuOverlay isOpen={showMenu} onClose={() => setShowMenu(false)} />
    </>
  );
}
