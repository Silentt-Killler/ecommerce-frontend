'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Truck, Phone, Mail, ArrowRight } from 'lucide-react';

// Loading component
function LoadingSpinner() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #B08B5C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// Main content component that uses useSearchParams
function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Clear cart from localStorage after successful order
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cart-storage');
    }
  }, []);

  if (!mounted) {
    return <LoadingSpinner />;
  }

  return (
    <div style={{ backgroundColor: '#F7F7F7', minHeight: '100vh', paddingTop: 60, paddingBottom: 80 }}>
      <div style={{ maxWidth: 650, margin: '0 auto', padding: '0 24px' }}>
        
        {/* Success Icon */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 100,
            height: 100,
            backgroundColor: '#D1FAE5',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <CheckCircle size={50} style={{ color: '#059669' }} />
          </div>
          
          <h1 style={{ 
            fontSize: 32, 
            fontWeight: 600, 
            color: '#0C0C0C',
            marginBottom: 12
          }}>
            Order Placed Successfully!
          </h1>
          
          <p style={{ 
            fontSize: 16, 
            color: '#666',
            lineHeight: 1.6
          }}>
            Thank you for your order. We've received your order and will process it shortly.
          </p>
        </div>

        {/* Order Number Card */}
        <div style={{ 
          backgroundColor: '#FFFFFF', 
          padding: 32,
          textAlign: 'center',
          marginBottom: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <p style={{ fontSize: 14, color: '#919191', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
            Order Number
          </p>
          <p style={{ 
            fontSize: 28, 
            fontWeight: 700, 
            color: '#0C0C0C',
            letterSpacing: 2,
            fontFamily: 'monospace'
          }}>
            {orderNumber || 'N/A'}
          </p>
          <p style={{ fontSize: 13, color: '#919191', marginTop: 12 }}>
            Please save this number for tracking your order
          </p>
        </div>

        {/* Order Timeline */}
        <div style={{ 
          backgroundColor: '#FFFFFF', 
          padding: 32,
          marginBottom: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0C0C0C', marginBottom: 24 }}>
            What happens next?
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Step 1 */}
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{
                width: 44,
                height: 44,
                backgroundColor: '#D1FAE5',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <CheckCircle size={22} style={{ color: '#059669' }} />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0C0C0C', marginBottom: 4 }}>
                  Order Confirmed
                </h3>
                <p style={{ fontSize: 14, color: '#666' }}>
                  Your order has been received and confirmed
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{
                width: 44,
                height: 44,
                backgroundColor: '#FEF3C7',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Package size={22} style={{ color: '#D97706' }} />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0C0C0C', marginBottom: 4 }}>
                  Processing
                </h3>
                <p style={{ fontSize: 14, color: '#666' }}>
                  We are preparing your order for shipment
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{
                width: 44,
                height: 44,
                backgroundColor: '#E0E7FF',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Truck size={22} style={{ color: '#4F46E5' }} />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0C0C0C', marginBottom: 4 }}>
                  Out for Delivery
                </h3>
                <p style={{ fontSize: 14, color: '#666' }}>
                  Your order will be delivered within 2-5 business days
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div style={{ 
          backgroundColor: '#FFFFFF', 
          padding: 32,
          marginBottom: 32,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0C0C0C', marginBottom: 20 }}>
            Need Help?
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Phone size={18} style={{ color: '#B08B5C' }} />
              <div>
                <p style={{ fontSize: 14, color: '#666' }}>Call us at</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#0C0C0C' }}>+880 1XXX-XXXXXX</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Mail size={18} style={{ color: '#B08B5C' }} />
              <div>
                <p style={{ fontSize: 14, color: '#666' }}>Email us at</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#0C0C0C' }}>support@prismin.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 16 }}>
          <Link
            href="/shop"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '16px 24px',
              backgroundColor: '#FFFFFF',
              color: '#0C0C0C',
              border: '1px solid #0C0C0C',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: 0.5,
              transition: 'all 0.2s'
            }}
          >
            Continue Shopping
          </Link>
          
          <Link
            href="/"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '16px 24px',
              backgroundColor: '#0C0C0C',
              color: '#FFFFFF',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: 0.5,
              transition: 'all 0.2s'
            }}
          >
            Back to Home
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* WhatsApp Support */}
        <div style={{ 
          marginTop: 32, 
          padding: 24, 
          backgroundColor: '#D1FAE5', 
          borderRadius: 12,
          textAlign: 'center'
        }}>
          <p style={{ fontSize: 14, color: '#065F46', marginBottom: 12 }}>
            💬 Questions about your order?
          </p>
          <a
            href="https://wa.me/880XXXXXXXXXX"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 24px',
              backgroundColor: '#25D366',
              color: '#FFFFFF',
              textDecoration: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Chat on WhatsApp
          </a>
        </div>

      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <OrderSuccessContent />
    </Suspense>
  );
}
