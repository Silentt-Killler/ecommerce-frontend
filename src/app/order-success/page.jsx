'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Truck, Phone, Copy, ArrowRight, Home, ShoppingBag } from 'lucide-react';

function LoadingFallback() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #B08B5C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );
}

function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const copyOrderNumber = () => {
    if (orderNumber) {
      navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!mounted) return <LoadingFallback />;

  // ====================== MOBILE LAYOUT ======================
  if (isMobile) {
    return (
      <div style={{ backgroundColor: '#F9FAFB', minHeight: '100vh', paddingTop: 56, paddingBottom: 100 }}>
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          
          {/* Success Icon */}
          <div style={{ 
            width: 100, 
            height: 100, 
            borderRadius: '50%', 
            backgroundColor: '#ECFDF5', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 24px',
            animation: 'scaleIn 0.5s ease'
          }}>
            <CheckCircle size={50} style={{ color: '#10B981' }} />
          </div>

          {/* Title */}
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0C0C0C', marginBottom: 8 }}>
            Order Placed!
          </h1>
          <p style={{ fontSize: 15, color: '#6B7280', marginBottom: 32, lineHeight: 1.6 }}>
            Thank you for your order. We'll send you a confirmation shortly.
          </p>

          {/* Order Number Card */}
          <div style={{ 
            backgroundColor: '#FFF', 
            borderRadius: 16, 
            padding: 24, 
            marginBottom: 20,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 8 }}>Order Number</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: '#0C0C0C', letterSpacing: 2 }}>
                {orderNumber || 'N/A'}
              </span>
              <button 
                onClick={copyOrderNumber}
                style={{ 
                  padding: 8, 
                  backgroundColor: '#F3F4F6', 
                  border: 'none', 
                  borderRadius: 8, 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {copied ? <CheckCircle size={18} style={{ color: '#10B981' }} /> : <Copy size={18} style={{ color: '#6B7280' }} />}
              </button>
            </div>
            {copied && <p style={{ fontSize: 12, color: '#10B981', marginTop: 8 }}>Copied!</p>}
          </div>

          {/* What's Next */}
          <div style={{ 
            backgroundColor: '#FFF', 
            borderRadius: 16, 
            padding: 24, 
            marginBottom: 20,
            textAlign: 'left',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0C0C0C', marginBottom: 20 }}>What's Next?</h3>
            
            <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#FEF3E7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Phone size={20} style={{ color: '#B08B5C' }} />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#0C0C0C', marginBottom: 4 }}>Confirmation Call</p>
                <p style={{ fontSize: 13, color: '#6B7280', margin: 0, lineHeight: 1.5 }}>Our team will call you within 2 hours to confirm your order</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Package size={20} style={{ color: '#6366F1' }} />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#0C0C0C', marginBottom: 4 }}>Order Processing</p>
                <p style={{ fontSize: 13, color: '#6B7280', margin: 0, lineHeight: 1.5 }}>We'll prepare and pack your items with care</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Truck size={20} style={{ color: '#10B981' }} />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#0C0C0C', marginBottom: 4 }}>Fast Delivery</p>
                <p style={{ fontSize: 13, color: '#6B7280', margin: 0, lineHeight: 1.5 }}>Expected delivery within 2-4 business days</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link href="/account/orders" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 8,
              padding: '16px 24px', 
              backgroundColor: '#B08B5C', 
              color: '#FFF', 
              fontSize: 15, 
              fontWeight: 600, 
              borderRadius: 12, 
              textDecoration: 'none'
            }}>
              Track Order <ArrowRight size={18} />
            </Link>
            
            <Link href="/" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 8,
              padding: '16px 24px', 
              backgroundColor: '#FFF', 
              color: '#0C0C0C', 
              fontSize: 15, 
              fontWeight: 600, 
              borderRadius: 12, 
              textDecoration: 'none',
              border: '1px solid #E5E7EB'
            }}>
              <Home size={18} /> Continue Shopping
            </Link>
          </div>

          {/* Support */}
          <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 32 }}>
            Need help? Call us at <a href="tel:+8801XXXXXXXXX" style={{ color: '#B08B5C', textDecoration: 'none', fontWeight: 600 }}>+8801XXXXXXXXX</a>
          </p>
        </div>

        <style jsx global>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes scaleIn { 
            from { transform: scale(0); opacity: 0; } 
            to { transform: scale(1); opacity: 1; } 
          }
        `}</style>
      </div>
    );
  }

  // ====================== DESKTOP LAYOUT ======================
  return (
    <div style={{ backgroundColor: '#F9FAFB', minHeight: '100vh', paddingTop: 100, paddingBottom: 80 }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
        
        {/* Success Icon */}
        <div style={{ 
          width: 120, 
          height: 120, 
          borderRadius: '50%', 
          backgroundColor: '#ECFDF5', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 32px',
          animation: 'scaleIn 0.5s ease'
        }}>
          <CheckCircle size={60} style={{ color: '#10B981' }} />
        </div>

        {/* Title */}
        <h1 style={{ fontSize: 32, fontWeight: 300, letterSpacing: 4, color: '#0C0C0C', marginBottom: 12, textTransform: 'uppercase' }}>
          Order Confirmed
        </h1>
        <p style={{ fontSize: 16, color: '#6B7280', marginBottom: 40, lineHeight: 1.7 }}>
          Thank you for shopping with PRISMIN.<br />Your order has been successfully placed.
        </p>

        {/* Order Number Card */}
        <div style={{ 
          backgroundColor: '#FFF', 
          borderRadius: 20, 
          padding: 32, 
          marginBottom: 32,
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
        }}>
          <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 2 }}>Order Number</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: '#0C0C0C', letterSpacing: 3 }}>
              {orderNumber || 'N/A'}
            </span>
            <button 
              onClick={copyOrderNumber}
              style={{ 
                padding: 10, 
                backgroundColor: '#F3F4F6', 
                border: 'none', 
                borderRadius: 10, 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
            >
              {copied ? <CheckCircle size={20} style={{ color: '#10B981' }} /> : <Copy size={20} style={{ color: '#6B7280' }} />}
            </button>
          </div>
          {copied && <p style={{ fontSize: 13, color: '#10B981', marginTop: 12 }}>Copied to clipboard!</p>}
        </div>

        {/* Timeline */}
        <div style={{ 
          backgroundColor: '#FFF', 
          borderRadius: 20, 
          padding: 32, 
          marginBottom: 32,
          textAlign: 'left',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#0C0C0C', marginBottom: 28, textAlign: 'center' }}>What Happens Next?</h3>
          
          <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: '#FEF3E7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Phone size={24} style={{ color: '#B08B5C' }} />
            </div>
            <div style={{ paddingTop: 4 }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#0C0C0C', marginBottom: 6 }}>Confirmation Call</p>
              <p style={{ fontSize: 14, color: '#6B7280', margin: 0, lineHeight: 1.6 }}>Our team will call you within 2 hours to confirm your order details and delivery schedule.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Package size={24} style={{ color: '#6366F1' }} />
            </div>
            <div style={{ paddingTop: 4 }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#0C0C0C', marginBottom: 6 }}>Order Processing</p>
              <p style={{ fontSize: 14, color: '#6B7280', margin: 0, lineHeight: 1.6 }}>We'll carefully prepare and pack your items to ensure they arrive in perfect condition.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Truck size={24} style={{ color: '#10B981' }} />
            </div>
            <div style={{ paddingTop: 4 }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#0C0C0C', marginBottom: 6 }}>Fast Delivery</p>
              <p style={{ fontSize: 14, color: '#6B7280', margin: 0, lineHeight: 1.6 }}>Your order will be delivered within 2-4 business days. You'll receive tracking updates via SMS.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <Link href="/account/orders" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 10,
            padding: '16px 32px', 
            backgroundColor: '#B08B5C', 
            color: '#FFF', 
            fontSize: 14, 
            fontWeight: 600, 
            borderRadius: 12, 
            textDecoration: 'none',
            transition: 'background 0.2s'
          }}>
            <ShoppingBag size={18} /> View My Orders
          </Link>
          
          <Link href="/" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 10,
            padding: '16px 32px', 
            backgroundColor: '#FFF', 
            color: '#0C0C0C', 
            fontSize: 14, 
            fontWeight: 600, 
            borderRadius: 12, 
            textDecoration: 'none',
            border: '1px solid #E5E7EB',
            transition: 'all 0.2s'
          }}>
            <Home size={18} /> Continue Shopping
          </Link>
        </div>

        {/* Support */}
        <p style={{ fontSize: 14, color: '#9CA3AF', marginTop: 40 }}>
          Questions about your order? Contact us at{' '}
          <a href="tel:+8801XXXXXXXXX" style={{ color: '#B08B5C', textDecoration: 'none', fontWeight: 600 }}>+8801XXXXXXXXX</a>
          {' '}or{' '}
          <a href="mailto:support@prismin.com" style={{ color: '#B08B5C', textDecoration: 'none', fontWeight: 600 }}>support@prismin.com</a>
        </p>
      </div>

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes scaleIn { 
          from { transform: scale(0); opacity: 0; } 
          to { transform: scale(1); opacity: 1; } 
        }
      `}</style>
    </div>
  );
}

export default function OrderSuccessPage() {
  return <Suspense fallback={<LoadingFallback />}><OrderSuccessContent /></Suspense>;
}
