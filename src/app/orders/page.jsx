'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import api from '@/lib/api';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800'
};

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders');
        setOrders(response.data.orders || []);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="container-custom py-16 text-center">
        <p className="text-muted">Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container-custom py-16 text-center">
        <Package size={64} className="mx-auto text-muted mb-4" />
        <h1 className="text-2xl font-bold mb-4">No Orders Yet</h1>
        <p className="text-muted mb-6">You haven't placed any orders.</p>
        <Link href="/shop" className="btn-primary inline-block">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="bg-white shadow-sm p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <p className="font-bold">{order.order_number}</p>
                <p className="text-sm text-muted">
                  {new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <span className={`px-3 py-1 text-sm rounded-full capitalize ${statusColors[order.status]}`}>
                {order.status}
              </span>
            </div>

            <div className="border-t pt-4">
              <div className="flex flex-wrap gap-4 mb-4">
                {order.items.slice(0, 3).map((item, index) => (
                  <div key={index} className="text-sm">
                    <span className="text-muted">{item.name}</span>
                    <span className="text-muted"> × {item.quantity}</span>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <span className="text-sm text-muted">
                    +{order.items.length - 3} more items
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="font-bold text-gold">
                  Total: ৳{order.total.toLocaleString()}
                </p>
                <Link 
                  href={`/orders/${order._id}`}
                  className="text-gold hover:underline text-sm"
                >
                  View Details →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
