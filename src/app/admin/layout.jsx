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
  { name: 'Admin Roles', href: '/admin/roles', icon: Shield }
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, checkAuth, isLoading } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuth();
      setIsChecking(false);
    };
    verifyAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isChecking && !isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.role !== 'admin') {
        router.push('/');
      }
    }
  }, [isChecking, isLoading, isAuthenticated, user, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActive = (href) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  if (isChecking || isLoading) {
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

  if (!isAuthenticated || user?.role !== 'admin') {
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
      {/* Full Page Admin Container - Fixed Position */}
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
            className="lg:hidden"
          />
        )}

        {/* Sidebar */}
        <aside style={{
          position: 'fixed',
          top: 0,
          left: sidebarOpen ? 0 : -280,
          width: 220,
          height: '100vh',
          backgroundColor: '#1f2937',
          zIndex: 50,
          transition: 'left 0.3s ease',
          display: 'flex',
          flexDirection: 'column'
        }} className="sidebar-mobile">
          
          {/* Logo */}
          <div style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            borderBottom: '1px solid #374151'
          }}>
            <span style={{ 
              fontSize: 18, 
              fontWeight: 700, 
              color: '#fff',
              letterSpacing: '0.05em'
            }}>
              PRISMIN ADMIN
            </span>
            <button 
              onClick={() => setSidebarOpen(false)}
              style={{ color: '#9ca3af', display: 'none' }}
              className="mobile-close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav style={{ 
            flex: 1, 
            overflowY: 'auto',
            padding: '16px 12px'
          }}>
            {menuItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    marginBottom: 4,
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 500,
                    textDecoration: 'none',
                    backgroundColor: active ? '#3b82f6' : 'transparent',
                    color: active ? '#fff' : '#9ca3af',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = '#374151';
                      e.currentTarget.style.color = '#fff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#9ca3af';
                    }
                  }}
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div style={{
            padding: 16,
            borderTop: '1px solid #374151'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 12
            }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 600,
                fontSize: 16
              }}>
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ 
                  fontSize: 14, 
                  fontWeight: 500, 
                  color: '#fff',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {user?.name || 'Admin'}
                </p>
                <p style={{ 
                  fontSize: 12, 
                  color: '#6b7280',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 16px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: '#374151',
                color: '#9ca3af',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#4b5563';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#374151';
                e.currentTarget.style.color = '#9ca3af';
              }}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Desktop Sidebar - Always Visible */}
        <aside style={{
          width: 220,
          height: '100vh',
          backgroundColor: '#1f2937',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column'
        }} className="desktop-sidebar">
          
          {/* Logo */}
          <div style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            borderBottom: '1px solid #374151'
          }}>
            <span style={{ 
              fontSize: 18, 
              fontWeight: 700, 
              color: '#fff',
              letterSpacing: '0.05em'
            }}>
              PRISMIN ADMIN
            </span>
          </div>

          {/* Navigation */}
          <nav style={{ 
            flex: 1, 
            overflowY: 'auto',
            padding: '16px 12px'
          }}>
            {menuItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    marginBottom: 4,
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 500,
                    textDecoration: 'none',
                    backgroundColor: active ? '#3b82f6' : 'transparent',
                    color: active ? '#fff' : '#9ca3af',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = '#374151';
                      e.currentTarget.style.color = '#fff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#9ca3af';
                    }
                  }}
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div style={{
            padding: 16,
            borderTop: '1px solid #374151'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 12
            }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 600,
                fontSize: 16
              }}>
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ 
                  fontSize: 14, 
                  fontWeight: 500, 
                  color: '#fff',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {user?.name || 'Admin'}
                </p>
                <p style={{ 
                  fontSize: 12, 
                  color: '#6b7280',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 16px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: '#374151',
                color: '#9ca3af',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#4b5563';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#374151';
                e.currentTarget.style.color = '#9ca3af';
              }}
            >
              <LogOut size={18} />
              <span>Logout</span>
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
          <div style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            backgroundColor: '#1f2937',
            borderBottom: '1px solid #374151'
          }} className="mobile-header">
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
