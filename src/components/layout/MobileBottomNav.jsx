'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useCartStore from '@/store/cartStore';
import MenuOverlay from './MenuOverlay';

// Premium Icons
const HomeIcon = ({ isActive }) => (
  <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke={isActive ? "#0C0C0C" : "#888"} strokeWidth={isActive ? "1.8" : "1.3"}>
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path d="M9 22V12h6v10" />
  </svg>
);

const MenuIcon = ({ isActive }) => (
  <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke={isActive ? "#0C0C0C" : "#888"} strokeWidth={isActive ? "1.8" : "1.3"}>
    <line x1="4" y1="6" x2="20" y2="6" strokeLinecap="round" />
    <line x1="4" y1="12" x2="20" y2="12" strokeLinecap="round" />
    <line x1="4" y1="18" x2="20" y2="18" strokeLinecap="round" />
  </svg>
);

const BagIcon = ({ isActive }) => (
  <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke={isActive ? "#0C0C0C" : "#888"} strokeWidth={isActive ? "1.8" : "1.3"}>
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18M16 10a4 4 0 01-8 0" />
  </svg>
);

const UserIcon = ({ isActive }) => (
  <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke={isActive ? "#0C0C0C" : "#888"} strokeWidth={isActive ? "1.8" : "1.3"}>
    <circle cx="12" cy="8" r="4" />
    <path d="M20 21a8 8 0 10-16 0" />
  </svg>
);

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { getItemCount } = useCartStore();
  const [activeTab, setActiveTab] = useState('home');
  const [mounted, setMounted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (pathname === '/') setActiveTab('home');
    else if (pathname === '/cart') setActiveTab('cart');
    else if (pathname?.startsWith('/account') || pathname === '/login') setActiveTab('account');
    else setActiveTab('');
  }, [pathname]);

  const isAdminPage = pathname?.startsWith('/admin');
  const isCheckoutPage = pathname === '/checkout';

  if (isAdminPage || isCheckoutPage) return null;

  const cartCount = mounted ? getItemCount() : 0;

  return (
    <>
      {/* Spacer */}
      <div className="block md:hidden" style={{ height: 70 }} />

      {/* Bottom Navigation */}
      <nav
        className="md:hidden"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          height: 65,
          zIndex: 999,
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #f0f0f0',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}
      >
        {/* Home */}
        <Link
          href="/"
          onClick={() => setActiveTab('home')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            height: '100%',
            textDecoration: 'none',
            WebkitTapHighlightColor: 'transparent',
            position: 'relative'
          }}
        >
          <div style={{ transition: 'transform 0.2s', transform: activeTab === 'home' ? 'translateY(-2px)' : 'translateY(0)' }}>
            <HomeIcon isActive={activeTab === 'home'} />
          </div>
          <span style={{ fontSize: 10, marginTop: 4, color: activeTab === 'home' ? '#0C0C0C' : '#888', fontWeight: activeTab === 'home' ? 600 : 400 }}>
            Home
          </span>
          {activeTab === 'home' && <div style={{ position: 'absolute', bottom: 8, width: 4, height: 4, borderRadius: '50%', backgroundColor: '#0C0C0C' }} />}
        </Link>

        {/* Menu */}
        <button
          onClick={() => setShowMenu(true)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            height: '100%',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          <div style={{ transition: 'transform 0.2s' }}>
            <MenuIcon isActive={false} />
          </div>
          <span style={{ fontSize: 10, marginTop: 4, color: '#888', fontWeight: 400 }}>
            Menu
          </span>
        </button>

        {/* Cart */}
        <Link
          href="/cart"
          onClick={() => setActiveTab('cart')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            height: '100%',
            textDecoration: 'none',
            WebkitTapHighlightColor: 'transparent',
            position: 'relative'
          }}
        >
          <div style={{ transition: 'transform 0.2s', transform: activeTab === 'cart' ? 'translateY(-2px)' : 'translateY(0)', position: 'relative' }}>
            <BagIcon isActive={activeTab === 'cart'} />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: -6,
                right: -10,
                backgroundColor: '#B08B5C',
                color: '#FFFFFF',
                fontSize: 9,
                minWidth: 16,
                height: 16,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                border: '2px solid #FFFFFF'
              }}>
                {cartCount}
              </span>
            )}
          </div>
          <span style={{ fontSize: 10, marginTop: 4, color: activeTab === 'cart' ? '#0C0C0C' : '#888', fontWeight: activeTab === 'cart' ? 600 : 400 }}>
            Cart
          </span>
          {activeTab === 'cart' && <div style={{ position: 'absolute', bottom: 8, width: 4, height: 4, borderRadius: '50%', backgroundColor: '#0C0C0C' }} />}
        </Link>

        {/* Account */}
        <Link
          href="/account"
          onClick={() => setActiveTab('account')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            height: '100%',
            textDecoration: 'none',
            WebkitTapHighlightColor: 'transparent',
            position: 'relative'
          }}
        >
          <div style={{ transition: 'transform 0.2s', transform: activeTab === 'account' ? 'translateY(-2px)' : 'translateY(0)' }}>
            <UserIcon isActive={activeTab === 'account'} />
          </div>
          <span style={{ fontSize: 10, marginTop: 4, color: activeTab === 'account' ? '#0C0C0C' : '#888', fontWeight: activeTab === 'account' ? 600 : 400 }}>
            Account
          </span>
          {activeTab === 'account' && <div style={{ position: 'absolute', bottom: 8, width: 4, height: 4, borderRadius: '50%', backgroundColor: '#0C0C0C' }} />}
        </Link>
      </nav>

      {/* Menu Overlay */}
      <MenuOverlay isOpen={showMenu} onClose={() => setShowMenu(false)} />
    </>
  );
}
