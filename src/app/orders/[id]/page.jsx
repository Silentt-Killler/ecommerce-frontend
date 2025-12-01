'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, Truck, CheckCircle, XCircle } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const statusSteps = [
  { key: 'pending', label: 'Pending', icon: Package },
  { key: 'confirmed', label: 'Confirmed', icon: Package },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

const statusColors = {
  pending: 'text-yellow-600',
  confirmed: 'text-blue-600',
  processing: 'text-purple-600',
  shipped: 'text-indigo-600',
  delivered: 'text-green-600',
  cancelled: 'text-red-600',
  refunded: 'text-gray-600'
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${params.id}`);
        setOrder(response.data);
      } catch (error) {
        toast.error('Order not found');
        router.push('/orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [isAuthenticated, params.id, router]);

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      await api.post(`/orders/${params.id}/cancel`);
      toast.success('Order cancelled');
      setOrder({ ...order, status: 'cancelled' });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to cancel order');
    }
  };

  const getStatusIndex = (status) => {
    return statusSteps.findIndex(s => s.key === status);
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="container-custom py-16 text-center">
        <p className="text-muted">Loading order...</p>
      </div>
    );
  }

  if (!order) return null;

  const currentStatusIndex = getStatusIndex(order.status);
  const isCancelled = order.status === 'cancelled' || order.status === 'refunded';

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/orders" className="p-2 hover:bg-primary-100 rounded">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Order {order.order_number}</h1>
          <p className="text-muted text-sm">
            Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Status Tracker */}
          {!isCancelled && (
            <div className="bg-white shadow-sm p-6">
              <h2 className="font-bold mb-6">Order Status</h2>
              <div className="relative">
                <div className="flex justify-between">
                  {statusSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isCompleted = index <= currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;

                    return (
                      <div key={step.key} className="flex flex-col items-center relative z-10">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isCompleted
                              ? 'bg-gold text-white'
                              : 'bg-primary-200 text-muted'
                          } ${isCurrent ? 'ring-4 ring-gold/30' : ''}`}
                        >
                          <Icon size={20} />
                        </div>
                        <span className={`text-xs mt-2 ${isCompleted ? 'text-gold font-medium' : 'text-muted'}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {/* Progress Line */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-primary-200">
                  <div
                    className="h-full bg-gold transition-all"
                    style={{ width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Cancelled Status */}
          {isCancelled && (
            <div className="bg-red-50 border border-red-200 p-6 rounded">
              <div className="flex items-center gap-3">
                <XCircle size={24} className="text-red-600" />
                <div>
                  <h2 className="font-bold text-red-600">Order {order.status}</h2>
                  <p className="text-red-600 text-sm">
                    This order has been {order.status}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="bg-white shadow-sm p-6">
            <h2 className="font-bold mb-4">Order Items</h2>
            <div className="divide-y">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between py-4">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted">
                      ৳{item.price.toLocaleString()} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">৳{item.subtotal.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white shadow-sm p-6">
            <h2 className="font-bold mb-4">Shipping Address</h2>
            <div className="text-muted">
              <p>{order.shipping_address.street}</p>
              <p>{order.shipping_address.city}, {order.shipping_address.state}</p>
              <p>{order.shipping_address.postal_code}, {order.shipping_address.country}</p>
              <p className="mt-3 font-medium text-focus">
                Phone: {order.shipping_address.phone}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white shadow-sm p-6">
            <h2 className="font-bold mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span>৳{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Shipping</span>
                <span>{order.shipping_cost === 0 ? 'Free' : `৳${order.shipping_cost}`}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-৳{order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-3 border-t">
                <span>Total</span>
                <span className="text-gold">৳{order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white shadow-sm p-6">
            <h2 className="font-bold mb-4">Payment</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Method</span>
                <span className="capitalize">{order.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Status</span>
                <span className={`capitalize ${
                  order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {order.payment_status}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {(order.status === 'pending' || order.status === 'confirmed') && (
            <button
              onClick={handleCancelOrder}
              className="w-full py-3 border border-red-500 text-red-500 hover:bg-red-50 transition-colors"
            >
              Cancel Order
            </button>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="bg-white shadow-sm p-6">
              <h2 className="font-bold mb-4">Order Notes</h2>
              <p className="text-muted text-sm">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
