'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Eye,
  Clock
} from 'lucide-react';
import api from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch products
      const productsRes = await api.get('/products?limit=100');
      const products = productsRes.data.products || [];
      const lowStock = products.filter(p => p.stock <= 5 && p.stock > 0);
      const outOfStock = products.filter(p => p.stock === 0);

      // Fetch orders
      const ordersRes = await api.get('/orders/admin/all?limit=100');
      const orders = ordersRes.data.orders || [];
      const pendingOrders = orders.filter(o => o.status === 'pending');
      const totalRevenue = orders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + (o.total || 0), 0);

      // Fetch categories count
      const categoriesRes = await api.get('/categories');
      const categories = categoriesRes.data || [];

      setStats({
        totalProducts: productsRes.data.total || products.length,
        totalOrders: orders.length,
        totalCustomers: new Set(orders.map(o => o.user_id)).size,
        totalRevenue: totalRevenue,
        pendingOrders: pendingOrders.length,
        lowStockProducts: lowStock.length + outOfStock.length
      });

      setRecentOrders(orders.slice(0, 5));
      setLowStockItems(lowStock.slice(0, 5));

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return '৳' + (amount || 0).toLocaleString();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-blue-100 text-blue-700',
      processing: 'bg-purple-100 text-purple-700',
      shipped: 'bg-indigo-100 text-indigo-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-light tracking-wide mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Revenue */}
        <div className="bg-white p-6 border border-primary-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign size={24} className="text-green-600" />
            </div>
            <TrendingUp size={20} className="text-green-500" />
          </div>
          <p className="text-2xl font-light mb-1">{formatCurrency(stats.totalRevenue)}</p>
          <p className="text-sm text-muted">Total Revenue</p>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 border border-primary-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <ShoppingCart size={24} className="text-blue-600" />
            </div>
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
              {stats.pendingOrders} pending
            </span>
          </div>
          <p className="text-2xl font-light mb-1">{stats.totalOrders}</p>
          <p className="text-sm text-muted">Total Orders</p>
        </div>

        {/* Total Products */}
        <div className="bg-white p-6 border border-primary-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Package size={24} className="text-purple-600" />
            </div>
            {stats.lowStockProducts > 0 && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                {stats.lowStockProducts} low stock
              </span>
            )}
          </div>
          <p className="text-2xl font-light mb-1">{stats.totalProducts}</p>
          <p className="text-sm text-muted">Total Products</p>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-6 border border-primary-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center">
              <Users size={24} className="text-gold" />
            </div>
          </div>
          <p className="text-2xl font-light mb-1">{stats.totalCustomers}</p>
          <p className="text-sm text-muted">Total Customers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white border border-primary-200">
          <div className="flex items-center justify-between p-4 border-b border-primary-200">
            <h2 className="font-medium">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-gold hover:underline">
              View All
            </Link>
          </div>
          
          {recentOrders.length > 0 ? (
            <div className="divide-y divide-primary-100">
              {recentOrders.map((order) => (
                <div key={order._id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">#{order.order_number || order._id.slice(-8)}</p>
                    <p className="text-xs text-muted flex items-center gap-1 mt-1">
                      <Clock size={12} />
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{formatCurrency(order.total)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted">
              <ShoppingCart size={32} className="mx-auto mb-2 opacity-50" />
              <p>No orders yet</p>
            </div>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white border border-primary-200">
          <div className="flex items-center justify-between p-4 border-b border-primary-200">
            <h2 className="font-medium flex items-center gap-2">
              <AlertTriangle size={18} className="text-yellow-500" />
              Low Stock Alert
            </h2>
            <Link href="/admin/products" className="text-sm text-gold hover:underline">
              View All
            </Link>
          </div>
          
          {lowStockItems.length > 0 ? (
            <div className="divide-y divide-primary-100">
              {lowStockItems.map((product) => (
                <div key={product._id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded overflow-hidden">
                      {product.images?.[0]?.url ? (
                        <img 
                          src={product.images[0].url} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={16} className="text-muted" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                      <p className="text-xs text-muted">{product.category}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${product.stock === 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                    {product.stock === 0 ? 'Out of Stock' : `${product.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted">
              <Package size={32} className="mx-auto mb-2 opacity-50" />
              <p>All products in stock</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link 
          href="/admin/products/new"
          className="bg-white p-4 border border-primary-200 text-center hover:border-gold transition-colors"
        >
          <Package size={24} className="mx-auto mb-2 text-gold" />
          <p className="text-sm">Add Product</p>
        </Link>
        <Link 
          href="/admin/orders"
          className="bg-white p-4 border border-primary-200 text-center hover:border-gold transition-colors"
        >
          <ShoppingCart size={24} className="mx-auto mb-2 text-gold" />
          <p className="text-sm">View Orders</p>
        </Link>
        <Link 
          href="/admin/sliders"
          className="bg-white p-4 border border-primary-200 text-center hover:border-gold transition-colors"
        >
          <Eye size={24} className="mx-auto mb-2 text-gold" />
          <p className="text-sm">Edit Sliders</p>
        </Link>
        <Link 
          href="/admin/coupons"
          className="bg-white p-4 border border-primary-200 text-center hover:border-gold transition-colors"
        >
          <DollarSign size={24} className="mx-auto mb-2 text-gold" />
          <p className="text-sm">Manage Coupons</p>
        </Link>
      </div>
    </div>
  );
}
