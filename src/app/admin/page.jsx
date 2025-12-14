'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Box,
  ClipboardList,
  BarChart3
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

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      confirmed: 'bg-blue-500/20 text-blue-400',
      processing: 'bg-purple-500/20 text-purple-400',
      shipped: 'bg-indigo-500/20 text-indigo-400',
      delivered: 'bg-green-500/20 text-green-400',
      cancelled: 'bg-red-500/20 text-red-400'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white mb-8">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#232a3b] rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Users</p>
              <p className="text-2xl font-semibold text-white mt-1">{stats.totalUsers}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Users size={24} className="text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-[#232a3b] rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Products</p>
              <p className="text-2xl font-semibold text-white mt-1">{stats.totalProducts}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Package size={24} className="text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-[#232a3b] rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Orders</p>
              <p className="text-2xl font-semibold text-white mt-1">{stats.totalOrders}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <ShoppingCart size={24} className="text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-[#232a3b] rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Revenue</p>
              <p className="text-2xl font-semibold text-white mt-1">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <DollarSign size={24} className="text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/admin/products" className="bg-[#232a3b] rounded-lg p-5 hover:bg-[#2a3347] transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Box size={24} className="text-blue-400" />
            </div>
            <div>
              <p className="text-white font-medium">Manage Products</p>
              <p className="text-gray-500 text-sm">Add, edit, or remove products</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/orders" className="bg-[#232a3b] rounded-lg p-5 hover:bg-[#2a3347] transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <ClipboardList size={24} className="text-green-400" />
            </div>
            <div>
              <p className="text-white font-medium">View Orders</p>
              <p className="text-gray-500 text-sm">Track and manage customer orders</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/products" className="bg-[#232a3b] rounded-lg p-5 hover:bg-[#2a3347] transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <BarChart3 size={24} className="text-purple-400" />
            </div>
            <div>
              <p className="text-white font-medium">Inventory</p>
              <p className="text-gray-500 text-sm">Check stock levels</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Revenue Chart */}
      <div className="bg-[#232a3b] rounded-lg p-5 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-medium">Revenue Overview</h2>
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <TrendingUp size={16} />
            <span>+15% from last month</span>
          </div>
        </div>
        
        {/* Simple Bar Chart */}
        <div className="flex items-end justify-between h-32 gap-2">
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, index) => (
            <div key={month} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className="w-full bg-blue-500 rounded-t"
                style={{ height: `${30 + Math.random() * 70}%` }}
              ></div>
              <span className="text-gray-500 text-xs">{month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-[#232a3b] rounded-lg overflow-hidden">
        <div className="p-5 border-b border-gray-700">
          <h2 className="text-white font-medium">Recent Orders</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-4 text-gray-400 text-sm font-medium">Order ID</th>
                <th className="text-left p-4 text-gray-400 text-sm font-medium">Customer</th>
                <th className="text-left p-4 text-gray-400 text-sm font-medium">Amount</th>
                <th className="text-left p-4 text-gray-400 text-sm font-medium">Status</th>
                <th className="text-left p-4 text-gray-400 text-sm font-medium">Date</th>
                <th className="text-right p-4 text-gray-400 text-sm font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-700/50 hover:bg-white/5">
                    <td className="p-4 text-white text-sm font-mono">
                      #{order.order_number || order._id.slice(-8)}
                    </td>
                    <td className="p-4 text-gray-300 text-sm">
                      {order.shipping_address?.name || 'N/A'}
                    </td>
                    <td className="p-4 text-white text-sm font-medium">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="p-4 text-right">
                      <Link 
                        href={`/admin/orders?id=${order._id}`}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
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
