'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useCartStore from '@/store/cartStore';
import MenuOverlay from './MenuOverlay';
import { Home, Menu, ShoppingBag, User } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { getItemCount } = useCartStore();
  const [showMenu, setShowMenu] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  
  if (pathname?.startsWith('/admin') || pathname === '/checkout') return null;

  const cartCount = mounted ? getItemCount() : 0;

  const navItems = [
    { id: 'home', icon: Home, href: '/' },
    { id: 'menu', icon: Menu, isMenu: true },
    { id: 'cart', icon: ShoppingBag, href: '/cart', badge: cartCount },
    { id: 'profile', icon: User, href: '/account' },
  ];

  return (
    <>
      <div className="block md:hidden h-[70px]" />
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: '65px', zIndex: 9000, backgroundColor: '#FFFFFF',
        borderTop: '1px solid #f0f0f0', display: 'flex',
        boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.05)',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.isMenu ? showMenu : pathname === item.href;

          const content = (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
               <Icon size={24} strokeWidth={isActive ? 2 : 1.5} color={isActive ? "#0C0C0C" : "#888"} />
               <div style={{
                 width: '4px', height: '4px', borderRadius: '50%',
                 backgroundColor: '#0C0C0C', marginTop: '4px',
                 opacity: isActive ? 1 : 0, transition: '0.3s'
               }} />
               {item.badge > 0 && (
                 <span style={{
                   position: 'absolute', top: '-2px', right: '20%',
                   backgroundColor: '#B08B5C', color: '#fff', fontSize: '10px',
                   minWidth: '16px', height: '16px', borderRadius: '50%',
                   display: 'flex', alignItems: 'center', justifyContent: 'center',
                   border: '2px solid #fff', fontWeight: 'bold'
                 }}>{item.badge}</span>
               )}
            </div>
          );

          return item.isMenu ? (
            <button key={item.id} onClick={() => setShowMenu(true)} style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer' }}>{content}</button>
          ) : (
            <Link key={item.id} href={item.href} style={{ flex: 1, display: 'flex', textDecoration: 'none' }}>{content}</Link>
          );
        })}
      </nav>
      <MenuOverlay isOpen={showMenu} onClose={() => setShowMenu(false)} />
    </>
  );
}
