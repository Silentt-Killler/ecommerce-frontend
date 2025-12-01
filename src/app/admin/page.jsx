'use client';

import { useState, useEffect } from 'react';
import { Package, FolderOpen, ShoppingCart, Users } from 'lucide-react';
import api from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    orders: 0,
    pendingOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, categoriesRes, ordersRes] = await Promise.all([
          api.get('/products?limit=1'),
          api.get('/categories'),
          api.get('/orders/admin/all?limit=5')
        ]);

        setStats({
          products: productsRes.data.total || 0,
          categories: categoriesRes.data?.length || 0,
          orders: ordersRes.data.total || 0,
          pendingOrders: ordersRes.data.orders?.filter(o => o.status === 'pending').length || 0
        });

        setRecentOrders(ordersRes.data.orders || []);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Products', value: stats.products, icon: Package, color: 'bg-blue-500' },
    { label: 'Categories', value: stats.categories, icon: FolderOpen, color: 'bg-green-500' },
    { label: 'Total Orders', value: stats.orders, icon: ShoppingCart, color: 'bg-purple-500' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: Users, color: 'bg-orange-500' },
  ];

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-bold">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-50">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-muted">Order #</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-muted">Date</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-muted">Status</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-muted">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-primary-50">
                    <td className="px-6 py-4 font-medium">{order.order_number}</td>
                    <td className="px-6 py-4 text-muted">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full capitalize
                        ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : ''}
                        ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : ''}
                        ${order.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">৳{order.total.toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted">
                    No orders yet
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
