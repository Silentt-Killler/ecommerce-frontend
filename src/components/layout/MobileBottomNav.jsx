'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useCartStore from '@/store/cartStore';
import MenuOverlay from './MenuOverlay';

// Premium Icons
const HomeIcon = ({ isActive }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isActive ? "#0C0C0C" : "#888"} strokeWidth={isActive ? "1.8" : "1.2"}>
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path d="M9 22V12h6v10" />
  </svg>
);

const MenuIcon = ({ isActive }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isActive ? "#0C0C0C" : "#888"} strokeWidth={isActive ? "1.8" : "1.2"}>
    <line x1="4" y1="6" x2="20" y2="6" strokeLinecap="round" />
    <line x1="4" y1="12" x2="20" y2="12" strokeLinecap="round" />
    <line x1="4" y1="18" x2="20" y2="18" strokeLinecap="round" />
  </svg>
);

const BagIcon = ({ isActive }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isActive ? "#0C0C0C" : "#888"} strokeWidth={isActive ? "1.8" : "1.2"}>
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18M16 10a4 4 0 01-8 0" />
  </svg>
);

const UserIcon = ({ isActive }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isActive ? "#0C0C0C" : "#888"} strokeWidth={isActive ? "1.8" : "1.2"}>
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
    else if (pathname?.startsWith('/account') || pathname === '/login') setActiveTab('profile');
    else setActiveTab('');
  }, [pathname]);

  const isAdminPage = pathname?.startsWith('/admin');
  const isCheckoutPage = pathname === '/checkout';

  if (isAdminPage || isCheckoutPage) return null;

  const cartCount = mounted ? getItemCount() : 0;

  const navItems = [
    { id: 'home', Icon: HomeIcon, href: '/' },
    { id: 'menu', Icon: MenuIcon, href: null, isMenu: true },
    { id: 'cart', Icon: BagIcon, href: '/cart', badge: cartCount },
    { id: 'profile', Icon: UserIcon, href: '/account' },
  ];

  return (
    <>
      {/* Mobile-only spacer */}
      <div className="block md:hidden h-[70px]" />

      <nav
        className="md:hidden flex items-center justify-around"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          height: '65px',
          zIndex: 999,
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #f0f0f0',
          boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.05)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {navItems.map((item) => {
          const { Icon } = item;
          const isActive = activeTab === item.id;

          // Menu Button
          if (item.isMenu) {
            return (
              <button
                key={item.id}
                onClick={() => setShowMenu(true)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                  height: '100%',
                  position: 'relative',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <div style={{ transition: 'transform 0.2s ease' }}>
                  <Icon isActive={false} />
                </div>
                <div style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  backgroundColor: 'black',
                  marginTop: '5px',
                  opacity: 0,
                  transition: 'all 0.3s ease'
                }} />
              </button>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                height: '100%',
                position: 'relative',
                textDecoration: 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <div style={{
                transition: 'transform 0.2s ease',
                transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
              }}>
                <Icon isActive={isActive} />
              </div>

              {/* Active Indicator Dot */}
              <div style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                backgroundColor: 'black',
                marginTop: '5px',
                opacity: isActive ? 1 : 0,
                transition: 'all 0.3s ease'
              }} />

              {/* Cart Badge */}
              {item.badge > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '12px',
                  right: 'calc(50% - 15px)',
                  backgroundColor: '#B08B5C',
                  color: '#FFFFFF',
                  fontSize: '9px',
                  minWidth: '15px',
                  height: '15px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  border: '2px solid #ffffff'
                }}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Menu Overlay */}
      <MenuOverlay isOpen={showMenu} onClose={() => setShowMenu(false)} />
    </>
  );
}
