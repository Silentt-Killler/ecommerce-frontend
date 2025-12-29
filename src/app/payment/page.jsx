'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');
  const amount = searchParams.get('amount');

  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('bkash');
  const [orderDetails, setOrderDetails] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const res = await api.get(`/orders/${orderId}`);
      setOrderDetails(res.data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
    }
  };

  const formatPrice = (price) => '৳' + Number(price)?.toLocaleString('en-BD');

  const handlePayment = async () => {
    setLoading(true);
    setPaymentStatus('processing');

    try {
      const paymentData = {
        order_id: orderId,
        amount: Number(amount),
        payment_method: selectedMethod,
        callback_url: `${window.location.origin}/payment/callback`,
        cancel_url: `${window.location.origin}/payment?order=${orderId}&amount=${amount}`
      };

      if (selectedMethod === 'bkash') {
        const response = await api.post('/payments/bkash/create', paymentData);
        if (response.data.bkashURL) {
          window.location.href = response.data.bkashURL;
        } else {
          throw new Error('Failed to initiate bKash payment');
        }
      } else if (selectedMethod === 'nagad') {
        const response = await api.post('/payments/nagad/create', paymentData);
        if (response.data.nagadURL) {
          window.location.href = response.data.nagadURL;
        } else {
          throw new Error('Failed to initiate Nagad payment');
        }
      }

    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      
      // Demo mode - Payment API not configured
      if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
        toast('Payment gateway not configured. Using demo mode.', { icon: '⚠️' });
        setTimeout(() => simulatePaymentSuccess(), 1500);
      } else {
        toast.error(error.response?.data?.detail || 'Payment failed');
        setLoading(false);
      }
    }
  };

  // Demo function - remove in production
  const simulatePaymentSuccess = async () => {
    try {
      setPaymentStatus('processing');
      
      await api.patch(`/orders/${orderId}/payment`, {
        payment_status: 'paid',
        payment_method: selectedMethod,
        transaction_id: `DEMO-${Date.now()}`,
        paid_amount: Number(amount)
      });

      setPaymentStatus('success');
      toast.success('Payment successful!');
      localStorage.removeItem('cart-storage');
      
      setTimeout(() => {
        router.push(`/order-success?order=${orderId}`);
      }, 2000);
      
    } catch (error) {
      // Still redirect for demo
      localStorage.removeItem('cart-storage');
      router.push(`/order-success?order=${orderId}`);
    }
  };

  // Invalid request
  if (!orderId || !amount) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <AlertCircle size={48} style={{ color: '#B00020' }} />
        <p style={{ color: '#666' }}>Invalid payment request</p>
        <button
          onClick={() => router.push('/cart')}
          style={{ padding: '12px 24px', backgroundColor: '#0C0C0C', color: '#FFFFFF', border: 'none', cursor: 'pointer' }}
        >
          Return to Cart
        </button>
      </div>
    );
  }

  // Success state
  if (paymentStatus === 'success') {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <CheckCircle size={64} style={{ color: '#1E7F4F' }} />
        <h2 style={{ fontSize: 24, fontWeight: 600, color: '#0C0C0C' }}>Payment Successful!</h2>
        <p style={{ color: '#666' }}>Redirecting to order confirmation...</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F7F7F7', minHeight: '100vh', paddingTop: 40, paddingBottom: 80 }}>
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '0 24px' }}>
        
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: 14,
            color: '#666',
            marginBottom: 24
          }}
        >
          <ArrowLeft size={18} />
          Back to Checkout
        </button>

        {/* Payment Card */}
        <div style={{ backgroundColor: '#FFFFFF', padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid #E8E8E8' }}>
            <h1 style={{ fontSize: 24, fontWeight: 600, color: '#0C0C0C', marginBottom: 8 }}>
              Complete Payment
            </h1>
            <p style={{ fontSize: 14, color: '#666' }}>
              Order ID: {orderId?.slice(-8)?.toUpperCase()}
            </p>
          </div>

          {/* Amount Display */}
          <div style={{
            backgroundColor: '#F7F7F7',
            padding: 24,
            textAlign: 'center',
            marginBottom: 32,
            borderRadius: 8
          }}>
            <p style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>Amount to Pay</p>
            <p style={{ fontSize: 36, fontWeight: 700, color: '#0C0C0C' }}>
              {formatPrice(amount)}
            </p>
          </div>

          {/* Payment Methods */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0C0C0C', marginBottom: 16 }}>
              Select Payment Method
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* bKash */}
              <label
                onClick={() => setSelectedMethod('bkash')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '16px 20px',
                  border: selectedMethod === 'bkash' ? '2px solid #E2136E' : '1px solid #E0E0E0',
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: selectedMethod === 'bkash' ? '#FFF5F8' : '#FFFFFF'
                }}
              >
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  border: selectedMethod === 'bkash' ? '7px solid #E2136E' : '2px solid #CCC',
                  transition: 'all 0.2s'
                }} />
                <div style={{
                  width: 60,
                  height: 36,
                  backgroundColor: '#E2136E',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 700 }}>bKash</span>
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 15, fontWeight: 500, color: '#0C0C0C' }}>bKash</span>
                  <p style={{ fontSize: 12, color: '#666' }}>Pay with bKash mobile wallet</p>
                </div>
              </label>

              {/* Nagad */}
              <label
                onClick={() => setSelectedMethod('nagad')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '16px 20px',
                  border: selectedMethod === 'nagad' ? '2px solid #F6921E' : '1px solid #E0E0E0',
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: selectedMethod === 'nagad' ? '#FFF8F0' : '#FFFFFF'
                }}
              >
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  border: selectedMethod === 'nagad' ? '7px solid #F6921E' : '2px solid #CCC',
                  transition: 'all 0.2s'
                }} />
                <div style={{
                  width: 60,
                  height: 36,
                  backgroundColor: '#F6921E',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 700 }}>Nagad</span>
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 15, fontWeight: 500, color: '#0C0C0C' }}>Nagad</span>
                  <p style={{ fontSize: 12, color: '#666' }}>Pay with Nagad mobile wallet</p>
                </div>
              </label>
            </div>
          </div>

          {/* Pay Button */}
          <button
            onClick={handlePayment}
            disabled={loading}
            style={{
              width: '100%',
              padding: '18px',
              backgroundColor: selectedMethod === 'bkash' ? '#E2136E' : '#F6921E',
              color: '#FFFFFF',
              border: 'none',
              fontSize: 16,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              borderRadius: 8,
              transition: 'all 0.2s'
            }}
          >
            {loading ? (
              <>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                Processing...
              </>
            ) : (
              <>
                Pay {formatPrice(amount)} with {selectedMethod === 'bkash' ? 'bKash' : 'Nagad'}
              </>
            )}
          </button>

          {/* Security Note */}
          <div style={{
            marginTop: 24,
            padding: 16,
            backgroundColor: '#F7F7F7',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12
          }}>
            <Shield size={20} style={{ color: '#1E7F4F', flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontSize: 13, color: '#0C0C0C', fontWeight: 500, marginBottom: 4 }}>
                Secure Payment
              </p>
              <p style={{ fontSize: 12, color: '#666', lineHeight: 1.5 }}>
                Your payment is secured with 256-bit SSL encryption. 
                We never store your payment credentials.
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div style={{ marginTop: 24, padding: 16, border: '1px dashed #E0E0E0', borderRadius: 8 }}>
            <p style={{ fontSize: 13, color: '#0C0C0C', fontWeight: 500, marginBottom: 12 }}>
              How to pay with {selectedMethod === 'bkash' ? 'bKash' : 'Nagad'}:
            </p>
            <ol style={{ fontSize: 12, color: '#666', paddingLeft: 16, margin: 0, lineHeight: 1.8 }}>
              <li>Click the "Pay" button above</li>
              <li>You'll be redirected to {selectedMethod === 'bkash' ? 'bKash' : 'Nagad'} payment page</li>
              <li>Enter your {selectedMethod === 'bkash' ? 'bKash' : 'Nagad'} number and PIN</li>
              <li>Confirm the payment</li>
              <li>You'll be redirected back after successful payment</li>
            </ol>
          </div>
        </div>

        {/* Footer Note */}
        <p style={{ textAlign: 'center', fontSize: 12, color: '#919191', marginTop: 24 }}>
          Having trouble? Contact us at support@prismin.com
        </p>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Loading fallback
function PaymentLoading() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #B08B5C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<PaymentLoading />}>
      <PaymentContent />
    </Suspense>
  );
}
