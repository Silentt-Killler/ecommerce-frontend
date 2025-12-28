'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, User, Search, Menu, Plus } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import MenuOverlay from './MenuOverlay';
import SearchOverlay from './SearchOverlay';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { getItemCount } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  
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

  useEffect(() => {
    const handleClickOutside = () => setShowUserDropdown(false);
    if (showUserDropdown) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserDropdown]);

  // Hide header on admin pages
  if (isAdminPage) return null;

  const cartCount = mounted ? getItemCount() : 0;

  const handleLogout = () => {
    logout();
    setShowUserDropdown(false);
    router.push('/');
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
          backgroundColor: isHomePage && !isScrolled ? 'transparent' : 'rgba(255,255,255,0.95)',
          backdropFilter: isScrolled ? 'blur(8px)' : 'none',
          borderBottom: isScrolled ? '1px solid #E0E0E0' : 'none'
        }}
      >
        {/* Container - Gucci style 1600px with 40px padding */}
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: '0 40px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            height: 60
          }}>
            
            {/* Left - Contact Us (Desktop only) */}
            <div style={{ flex: 1 }}>
              <Link 
                href="/contact" 
                className="hidden md:inline-flex"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  letterSpacing: 1,
                  color: isHomePage && !isScrolled ? '#FFFFFF' : '#0C0C0C',
                  textDecoration: 'none',
                  transition: 'color 0.3s'
                }}
              >
                <Plus size={12} />
                <span>Contact Us</span>
              </Link>
            </div>

            {/* Center - Logo (absolute positioned) */}
            <Link 
              href="/"
              style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 22,
                fontWeight: 300,
                letterSpacing: 6,
                color: isHomePage && !isScrolled ? '#FFFFFF' : '#0C0C0C',
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
              gap: 16 
            }}>
              {/* Cart */}
              <Link 
                href="/cart" 
                style={{ 
                  position: 'relative',
                  color: isHomePage && !isScrolled ? '#FFFFFF' : '#0C0C0C',
                  transition: 'color 0.3s'
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
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* User */}
              {mounted && isAuthenticated ? (
                <div 
                  style={{ position: 'relative' }}
                  onMouseEnter={() => setShowUserDropdown(true)}
                  onMouseLeave={() => setShowUserDropdown(false)}
                >
                  <button style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    color: isHomePage && !isScrolled ? '#FFFFFF' : '#0C0C0C',
                    transition: 'color 0.3s',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <User size={20} strokeWidth={1.5} />
                  </button>
                  
                  {/* User Dropdown */}
                  {showUserDropdown && (
                    <div style={{
                      position: 'absolute',
                      right: 0,
                      top: '100%',
                      marginTop: 8,
                      width: 200,
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                      borderRadius: 8,
                      overflow: 'hidden',
                      zIndex: 100
                    }}>
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
                      
                      <div style={{ padding: '8px 0' }}>
                        <Link 
                          href="/orders" 
                          style={{ 
                            display: 'block', 
                            padding: '10px 16px', 
                            fontSize: 14, 
                            color: '#0C0C0C', 
                            textDecoration: 'none'
                          }}
                        >
                          My Orders
                        </Link>
                        
                        {user?.role === 'admin' && (
                          <Link 
                            href="/admin" 
                            style={{ 
                              display: 'block', 
                              padding: '10px 16px', 
                              fontSize: 14, 
                              color: '#B08B5C', 
                              fontWeight: 500,
                              textDecoration: 'none'
                            }}
                          >
                            Admin Panel
                          </Link>
                        )}
                        
                        <div style={{ height: 1, backgroundColor: '#E8E8E8', margin: '8px 0' }} />
                        
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
                            cursor: 'pointer'
                          }}
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link 
                  href="/login" 
                  style={{ 
                    color: isHomePage && !isScrolled ? '#FFFFFF' : '#0C0C0C',
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
                  color: isHomePage && !isScrolled ? '#FFFFFF' : '#0C0C0C',
                  transition: 'color 0.3s',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Search size={20} strokeWidth={1.5} />
              </button>

              {/* Menu Toggle - Gucci style with icon + MENU text */}
              <button 
                onClick={() => setShowMenu(true)}
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  color: isHomePage && !isScrolled ? '#FFFFFF' : '#0C0C0C',
                  transition: 'color 0.3s',
                  padding: 0
                }}
              >
                <Menu size={20} strokeWidth={1.5} />
                <span style={{ fontSize: 12, letterSpacing: 1 }} className="hidden sm:inline">MENU</span>
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
