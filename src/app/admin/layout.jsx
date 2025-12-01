'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, FolderOpen, ShoppingCart, LogOut } from 'lucide-react';
import useAuthStore from '@/store/authStore';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: FolderOpen },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout, checkAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuth();
      setIsChecking(false);
    };
    
    verifyAuth();
  }, [checkAuth]);

  useEffect(() => {
    // Only redirect after loading is complete
    if (!isChecking && !isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      
      if (user && user.role !== 'admin') {
        router.push('/');
        return;
      }
    }
  }, [isAuthenticated, user, router, isLoading, isChecking]);

  // Show loading while checking auth
  if (isChecking || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-100">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated or not admin
  if (!isAuthenticated || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-100">
        <div className="text-center">
          <p className="text-muted">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-100">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-focus text-white min-h-screen fixed left-0 top-0">
          <div className="p-6 border-b border-primary-800">
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>
          
          <nav className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded transition-colors ${
                        isActive 
                          ? 'bg-gold text-white' 
                          : 'text-primary-400 hover:bg-primary-800 hover:text-white'
                      }`}
                    >
                      <Icon size={20} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary-800">
            <div className="text-sm text-primary-400 mb-2 px-4">
              {user?.name}
            </div>
            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="flex items-center gap-3 px-4 py-3 text-primary-400 hover:text-white w-full"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
