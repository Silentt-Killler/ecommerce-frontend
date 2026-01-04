'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircle, Package, Truck, Phone, Mail, 
  Download, ArrowRight, Home, Clock, MapPin 
} from 'lucide-react';
import api from '@/lib/api';

// Loading component
function LoadingSpinner() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F7F7' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #B08B5C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );
}

// Main content
function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const [mounted, setMounted] = useState(false);
  const [order, setOrder] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Clear cart from localStorage after successful order
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cart-storage');
    }

    // Fetch order details & settings
    fetchData();
  }, [orderNumber]);

  const fetchData = async () => {
    try {
      // Fetch order by order number
      if (orderNumber) {
        try {
          const orderRes = await api.get(`/orders/track/${orderNumber}`);
          setOrder(orderRes.data);
        } catch (e) {
          console.log('Could not fetch order details');
        }
      }

      // Fetch site settings for contact info
      try {
        const settingsRes = await api.get('/settings');
        setSettings(settingsRes.data);
      } catch (e) {
        console.log('Could not fetch settings');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      // Open invoice in new tab (backend will generate PDF)
      window.open(`/api/orders/invoice/${orderNumber}`, '_blank');
    } catch (error) {
      console.error('Failed to download invoice');
    }
  };

  if (!mounted || loading) {
    return <LoadingSpinner />;
  }

  const formatPrice = (price) => '৳' + (price || 0).toLocaleString();

  return (
    <div style={{ backgroundColor: '#F7F7F7', minHeight: '100vh', paddingTop: 100, paddingBottom: 60 }}>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 20px' }}>
        
        {/* Success Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ 
            width: 80, 
            height: 80, 
            backgroundColor: '#D1FAE5', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <CheckCircle size={40} style={{ color: '#059669' }} />
          </div>
          
          <h1 style={{ fontSize: 26, fontWeight: 600, color: '#0C0C0C', marginBottom: 8 }}>
            Order Placed Successfully!
          </h1>
          
          <p style={{ fontSize: 15, color: '#666', lineHeight: 1.6 }}>
            Thank you for your order. We've received your order and will process it shortly.
          </p>
        </div>

        {/* Order Number Card */}
        <div style={{ 
          backgroundColor: '#FFFFFF', 
          borderRadius: 12, 
          padding: 24, 
          textAlign: 'center',
          marginBottom: 20,
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
        }}>
          <p style={{ fontSize: 12, color: '#919191', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            Order Number
          </p>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#0C0C0C', letterSpacing: 2, fontFamily: 'monospace' }}>
            {orderNumber || 'N/A'}
          </p>
          <p style={{ fontSize: 12, color: '#919191', marginTop: 8 }}>
            Please save this number for tracking your order
          </p>
        </div>

        {/* Order Details */}
        {order && (
          <div style={{ 
            backgroundColor: '#FFFFFF', 
            borderRadius: 12, 
            overflow: 'hidden',
            marginBottom: 20,
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F0F0F0', backgroundColor: '#FAFAFA' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0C0C0C' }}>Order Summary</h3>
            </div>
            
            {/* Products */}
            <div style={{ padding: 20 }}>
              {order.items?.map((item, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  gap: 12, 
                  padding: '10px 0',
                  borderBottom: index < order.items.length - 1 ? '1px solid #F0F0F0' : 'none'
                }}>
                  <div style={{ 
                    width: 50, 
                    height: 50, 
                    backgroundColor: '#F5F5F5', 
                    borderRadius: 6,
                    overflow: 'hidden',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Package size={20} style={{ color: '#D0D0D0' }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#0C0C0C' }}>{item.name}</p>
                    <p style={{ fontSize: 12, color: '#919191' }}>Qty: {item.quantity}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#0C0C0C' }}>
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}

              {/* Totals */}
              <div style={{ borderTop: '1px solid #F0F0F0', marginTop: 12, paddingTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: '#666' }}>Subtotal</span>
                  <span style={{ fontSize: 13, color: '#0C0C0C' }}>{formatPrice(order.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: '#666' }}>Delivery</span>
                  <span style={{ fontSize: 13, color: order.delivery_charge === 0 ? '#059669' : '#0C0C0C' }}>
                    {order.delivery_charge === 0 ? 'FREE' : formatPrice(order.delivery_charge)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px dashed #E0E0E0' }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#0C0C0C' }}>Total</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#0C0C0C' }}>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delivery Address */}
        {order?.shipping_address && (
          <div style={{ 
            backgroundColor: '#FFFFFF', 
            borderRadius: 12, 
            padding: 20,
            marginBottom: 20,
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <MapPin size={18} style={{ color: '#B08B5C' }} />
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0C0C0C' }}>Delivery Address</h3>
            </div>
            <p style={{ fontSize: 14, color: '#0C0C0C', marginBottom: 4 }}>{order.shipping_address.name}</p>
            <p style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>{order.shipping_address.phone}</p>
            <p style={{ fontSize: 13, color: '#666' }}>
              {order.shipping_address.address}, {order.shipping_address.area}, {order.shipping_address.district}
            </p>
          </div>
        )}

        {/* What's Next */}
        <div style={{ 
          backgroundColor: '#FFFFFF', 
          borderRadius: 12, 
          padding: 20,
          marginBottom: 20,
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0C0C0C', marginBottom: 16 }}>What happens next?</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ 
                width: 36, 
                height: 36, 
                backgroundColor: '#D1FAE5', 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <CheckCircle size={18} style={{ color: '#059669' }} />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#0C0C0C' }}>Order Confirmed</p>
                <p style={{ fontSize: 12, color: '#919191' }}>Your order has been received and confirmed</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ 
                width: 36, 
                height: 36, 
                backgroundColor: '#FEF3C7', 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Clock size={18} style={{ color: '#D97706' }} />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#0C0C0C' }}>Processing</p>
                <p style={{ fontSize: 12, color: '#919191' }}>We'll prepare your order for shipping</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ 
                width: 36, 
                height: 36, 
                backgroundColor: '#E0E7FF', 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Truck size={18} style={{ color: '#4F46E5' }} />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#0C0C0C' }}>Shipping</p>
                <p style={{ fontSize: 12, color: '#919191' }}>Your order will be shipped within 1-2 business days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Download */}
        <div style={{ 
          backgroundColor: '#FFFFFF', 
          borderRadius: 12, 
          padding: 20,
          marginBottom: 24,
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0C0C0C', marginBottom: 16 }}>Need Help?</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 10,
              padding: 12,
              backgroundColor: '#FAFAFA',
              borderRadius: 8
            }}>
              <Phone size={18} style={{ color: '#B08B5C' }} />
              <div>
                <p style={{ fontSize: 11, color: '#919191' }}>Call Us</p>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#0C0C0C' }}>
                  {settings?.contact_phone || '+880 1XXX-XXXXXX'}
                </p>
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 10,
              padding: 12,
              backgroundColor: '#FAFAFA',
              borderRadius: 8
            }}>
              <Mail size={18} style={{ color: '#B08B5C' }} />
              <div>
                <p style={{ fontSize: 11, color: '#919191' }}>Email Us</p>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#0C0C0C' }}>
                  {settings?.contact_email || 'support@prismin.com'}
                </p>
              </div>
            </div>
          </div>

          {/* Download Invoice */}
          <button
            onClick={handleDownloadInvoice}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px',
              backgroundColor: 'transparent',
              border: '1px solid #E0E0E0',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
              color: '#0C0C0C'
            }}
          >
            <Download size={16} />
            Download Invoice (PDF)
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Link
            href="/account/orders"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '14px',
              backgroundColor: '#0C0C0C',
              color: '#FFFFFF',
              textDecoration: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500
            }}
          >
            <Package size={18} />
            Track Order
          </Link>

          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '14px',
              backgroundColor: '#B08B5C',
              color: '#FFFFFF',
              textDecoration: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500
            }}
          >
            <Home size={18} />
            Back to Home
          </Link>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Export with Suspense
export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <OrderSuccessContent />
    </Suspense>
  );
}
