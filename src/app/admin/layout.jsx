'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Image,
  Tag,
  Ticket,
  Shield,
  Settings,
  Menu,
  X,
  LogOut,
  FolderOpen
} from 'lucide-react';
import useAuthStore from '@/store/authStore';

const menuItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Home Sliders', href: '/admin/sliders', icon: Image },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Categories', href: '/admin/categories', icon: FolderOpen },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Brands', href: '/admin/brands', icon: Tag },
  { name: 'Coupons', href: '/admin/coupons', icon: Ticket },
  { name: 'Admin Roles', href: '/admin/roles', icon: Shield },
  { name: 'Settings', href: '/admin/settings', icon: Settings }
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, checkAuth, isLoading, isInitialized } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check auth on mount
  useEffect(() => {
    if (mounted && !isInitialized) {
      checkAuth();
    }
  }, [mounted, isInitialized, checkAuth]);

  // Redirect logic - only after initialized
  useEffect(() => {
    if (mounted && isInitialized && !isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user && user.role !== 'admin') {
        router.push('/');
      }
    }
  }, [mounted, isInitialized, isLoading, isAuthenticated, user, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActive = (href) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  // Show loading while not mounted or not initialized
  if (!mounted || !isInitialized || isLoading) {
    return (
      <div style={{ 
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#111827'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40,
            height: 40,
            border: '3px solid #3b82f6',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#9ca3af' }}>Loading...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Not authenticated or not admin
  if (!isAuthenticated || !user || user.role !== 'admin') {
    return (
      <div style={{ 
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#111827'
      }}>
        <p style={{ color: '#9ca3af' }}>Redirecting...</p>
      </div>
    );
  }

  return (
    <>
      {/* Full Page Admin Container */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        backgroundColor: '#111827'
      }}>
        
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 40
            }}
            className="sidebar-mobile"
          />
        )}

        {/* Sidebar - Desktop */}
        <aside 
          className="desktop-sidebar"
          style={{
            width: 260,
            backgroundColor: '#1f2937',
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid #374151'
          }}
        >
          {/* Logo */}
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #374151'
          }}>
            <h1 style={{ 
              fontSize: 20, 
              fontWeight: 700, 
              color: '#fff',
              letterSpacing: 2
            }}>
              PRISMIN
            </h1>
            <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Admin Panel</p>
          </div>

          {/* Menu */}
          <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    marginBottom: 4,
                    borderRadius: 8,
                    color: active ? '#fff' : '#9ca3af',
                    backgroundColor: active ? '#3b82f6' : 'transparent',
                    textDecoration: 'none',
                    fontSize: 14,
                    fontWeight: active ? 600 : 400,
                    transition: 'all 0.2s'
                  }}
                >
                  <Icon size={20} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User & Logout */}
          <div style={{
            padding: '16px 12px',
            borderTop: '1px solid #374151'
          }}>
            <div style={{ 
              padding: '12px 16px', 
              marginBottom: 8,
              backgroundColor: '#374151',
              borderRadius: 8
            }}>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{user?.name}</p>
              <p style={{ fontSize: 12, color: '#9ca3af' }}>{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                width: '100%',
                padding: '12px 16px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: 8,
                color: '#ef4444',
                fontSize: 14,
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#374151'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </aside>

        {/* Sidebar - Mobile */}
        <aside 
          className="sidebar-mobile"
          style={{
            position: 'fixed',
            top: 0,
            left: sidebarOpen ? 0 : -280,
            width: 280,
            height: '100%',
            backgroundColor: '#1f2937',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            transition: 'left 0.3s ease',
            borderRight: '1px solid #374151'
          }}
        >
          {/* Close Button */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid #374151'
          }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>PRISMIN</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                padding: 8,
                color: '#9ca3af',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
              className="mobile-close"
            >
              <X size={24} />
            </button>
          </div>

          {/* Mobile Menu */}
          <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    marginBottom: 4,
                    borderRadius: 8,
                    color: active ? '#fff' : '#9ca3af',
                    backgroundColor: active ? '#3b82f6' : 'transparent',
                    textDecoration: 'none',
                    fontSize: 14
                  }}
                >
                  <Icon size={20} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Logout */}
          <div style={{ padding: '16px 12px', borderTop: '1px solid #374151' }}>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                width: '100%',
                padding: '12px 16px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: 8,
                color: '#ef4444',
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          backgroundColor: '#111827'
        }}>
          {/* Mobile Header */}
          <div 
            className="mobile-header"
            style={{
              height: 64,
              display: 'flex',
              alignItems: 'center',
              padding: '0 24px',
              backgroundColor: '#1f2937',
              borderBottom: '1px solid #374151'
            }}
          >
            <button 
              onClick={() => setSidebarOpen(true)}
              style={{
                padding: 8,
                color: '#9ca3af',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
              className="menu-btn"
            >
              <Menu size={24} />
            </button>
          </div>

          {/* Page Content */}
          <div style={{ padding: 24 }}>
            {children}
          </div>
        </main>
      </div>

      <style jsx global>{`
        @media (min-width: 1024px) {
          .sidebar-mobile { display: none !important; }
          .mobile-header { display: none !important; }
          .desktop-sidebar { display: flex !important; }
        }
        @media (max-width: 1023px) {
          .desktop-sidebar { display: none !important; }
          .sidebar-mobile { display: flex !important; }
          .mobile-header { display: flex !important; }
          .mobile-close { display: block !important; }
        }
      `}</style>
    </>
  );
}
