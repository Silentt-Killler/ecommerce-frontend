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
  ChevronDown
} from 'lucide-react';
import useAuthStore from '@/store/authStore';

const menuItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Home Sliders', href: '/admin/sliders', icon: Image },
  { name: 'Products', href: '/admin/products', icon: Package },
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
      <div className="min-h-screen flex items-center justify-center bg-[#1a1f2e]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1f2e]">
        <p className="text-gray-400">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1f2e]">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#232a3b] flex items-center justify-between px-4 z-50 border-b border-gray-700">
        <button onClick={() => setSidebarOpen(true)} className="text-gray-400">
          <Menu size={24} />
        </button>
        <span className="text-lg font-semibold text-white tracking-wide">PRISMIN ADMIN</span>
        <div className="w-6"></div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-[200px] bg-[#232a3b] z-50
        transform transition-transform duration-300
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700">
          <Link href="/admin" className="text-lg font-bold text-white tracking-wide">
            PRISMIN ADMIN
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400">
            <X size={20} />
          </button>
        </div>

        {/* Menu */}
        <nav className="py-4 overflow-y-auto h-[calc(100vh-8rem)]">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-3 text-sm transition-colors
                ${isActive(item.href) 
                  ? 'text-white bg-blue-600/20 border-r-2 border-blue-500' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'}
              `}
            >
              <item.icon size={18} />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-700 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-400 hover:text-white border border-gray-600 hover:border-gray-500 rounded transition-colors"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-[200px] min-h-screen pt-16 lg:pt-0">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
