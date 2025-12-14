'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Eye
} from 'lucide-react';
import api from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const productsRes = await api.get('/products?limit=1');
      const ordersRes = await api.get('/orders/admin/all?limit=10');
      const orders = ordersRes.data.orders || [];
      
      const totalRevenue = orders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + (o.total || 0), 0);

      setStats({
        totalUsers: new Set(orders.map(o => o.user_id)).size,
        totalProducts: productsRes.data.total || 0,
        totalOrders: orders.length,
        totalRevenue: totalRevenue
      });

      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => '৳' + (amount || 0).toLocaleString();

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusStyle = (status) => {
    const styles = {
      pending: { bg: '#fef3c7', color: '#d97706' },
      confirmed: { bg: '#dbeafe', color: '#2563eb' },
      processing: { bg: '#e9d5ff', color: '#9333ea' },
      shipped: { bg: '#c7d2fe', color: '#4f46e5' },
      delivered: { bg: '#d1fae5', color: '#059669' },
      cancelled: { bg: '#fee2e2', color: '#dc2626' }
    };
    return styles[status] || { bg: '#f1f5f9', color: '#64748b' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: '#3b82f6',
      bgColor: '#3b82f620',
      change: '+12%',
      up: true
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: '#10b981',
      bgColor: '#10b98120',
      change: '+5%',
      up: true
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: '#8b5cf6',
      bgColor: '#8b5cf620',
      change: '+18%',
      up: true
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: '#f59e0b',
      bgColor: '#f59e0b20',
      change: '+24%',
      up: true
    }
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
        <p style={{ color: '#64748b' }}>Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <div 
            key={index}
            className="rounded-xl p-6"
            style={{ backgroundColor: '#1e293b' }}
          >
            <div className="flex items-start justify-between mb-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: stat.bgColor }}
              >
                <stat.icon size={24} style={{ color: stat.color }} />
              </div>
              <div 
                className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
                style={{ 
                  backgroundColor: stat.up ? '#10b98120' : '#ef444420',
                  color: stat.up ? '#10b981' : '#ef4444'
                }}
              >
                {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.change}
              </div>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-sm" style={{ color: '#64748b' }}>{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <div 
          className="lg:col-span-2 rounded-xl p-6"
          style={{ backgroundColor: '#1e293b' }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Revenue Overview</h2>
              <p className="text-sm" style={{ color: '#64748b' }}>Monthly revenue statistics</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: '#10b98120' }}>
              <TrendingUp size={16} style={{ color: '#10b981' }} />
              <span className="text-sm font-medium" style={{ color: '#10b981' }}>+15%</span>
            </div>
          </div>
          
          {/* Chart Bars */}
          <div className="flex items-end justify-between h-48 gap-3 pt-4">
            {[
              { month: 'Jan', height: 60 },
              { month: 'Feb', height: 80 },
              { month: 'Mar', height: 65 },
              { month: 'Apr', height: 90 },
              { month: 'May', height: 75 },
              { month: 'Jun', height: 95 },
              { month: 'Jul', height: 85 }
            ].map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full rounded-t-lg transition-all hover:opacity-80"
                  style={{ 
                    height: `${item.height}%`,
                    backgroundColor: index === 5 ? '#3b82f6' : '#334155'
                  }}
                ></div>
                <span className="text-xs" style={{ color: '#64748b' }}>{item.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div 
          className="rounded-xl p-6"
          style={{ backgroundColor: '#1e293b' }}
        >
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/admin/products/new"
              className="flex items-center gap-3 p-4 rounded-lg transition-colors"
              style={{ backgroundColor: '#334155' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#475569'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#334155'}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#3b82f620' }}>
                <Package size={20} style={{ color: '#3b82f6' }} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Add Product</p>
                <p className="text-xs" style={{ color: '#64748b' }}>Create new product</p>
              </div>
            </Link>

            <Link
              href="/admin/orders"
              className="flex items-center gap-3 p-4 rounded-lg transition-colors"
              style={{ backgroundColor: '#334155' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#475569'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#334155'}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#10b98120' }}>
                <ShoppingCart size={20} style={{ color: '#10b981' }} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">View Orders</p>
                <p className="text-xs" style={{ color: '#64748b' }}>Manage orders</p>
              </div>
            </Link>

            <Link
              href="/admin/customers"
              className="flex items-center gap-3 p-4 rounded-lg transition-colors"
              style={{ backgroundColor: '#334155' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#475569'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#334155'}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#8b5cf620' }}>
                <Users size={20} style={{ color: '#8b5cf6' }} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Customers</p>
                <p className="text-xs" style={{ color: '#64748b' }}>View all customers</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div 
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: '#1e293b' }}
      >
        <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid #334155' }}>
          <div>
            <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
            <p className="text-sm" style={{ color: '#64748b' }}>Latest customer orders</p>
          </div>
          <Link 
            href="/admin/orders"
            className="text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            style={{ backgroundColor: '#334155', color: '#94a3b8' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#3b82f6';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#334155';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            View All
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#0f172a' }}>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase" style={{ color: '#64748b' }}>Order ID</th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase" style={{ color: '#64748b' }}>Customer</th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase" style={{ color: '#64748b' }}>Amount</th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase" style={{ color: '#64748b' }}>Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase" style={{ color: '#64748b' }}>Date</th>
                <th className="text-right px-6 py-4 text-xs font-semibold uppercase" style={{ color: '#64748b' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length > 0 ? (
                recentOrders.map((order, index) => {
                  const statusStyle = getStatusStyle(order.status);
                  return (
                    <tr 
                      key={order._id} 
                      style={{ borderBottom: index < recentOrders.length - 1 ? '1px solid #334155' : 'none' }}
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-white">#{order.order_number || order._id.slice(-8)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-white">{order.shipping_address?.name || 'N/A'}</p>
                        <p className="text-xs" style={{ color: '#64748b' }}>{order.shipping_address?.phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-white">{formatCurrency(order.total)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span 
                          className="text-xs font-medium px-3 py-1 rounded-full capitalize"
                          style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm" style={{ color: '#94a3b8' }}>{formatDate(order.created_at)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/admin/orders?id=${order._id}`}
                          className="inline-flex items-center gap-1 text-sm font-medium transition-colors"
                          style={{ color: '#3b82f6' }}
                        >
                          <Eye size={16} />
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center" style={{ color: '#64748b' }}>
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
