'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, X, ShoppingBag, ArrowLeft, Lock } from 'lucide-react';
import useCartStore from '@/store/cartStore';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getSubtotal, getItemCount } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const formatPrice = (price) => '৳' + (price || 0).toLocaleString();

  if (!mounted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #B08B5C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  // Empty Cart
  if (items.length === 0) {
    return (
      <div style={{ backgroundColor: '#F7F7F7', minHeight: '100vh', paddingTop: isMobile ? 80 : 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '80px 20px 40px' : '120px 24px 60px' }}>
        <ShoppingBag size={isMobile ? 48 : 64} style={{ color: '#D0D0D0', marginBottom: 24 }} />
        <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 500, color: '#0C0C0C', marginBottom: 12, textAlign: 'center' }}>Your cart is empty</h1>
        <p style={{ fontSize: isMobile ? 14 : 15, color: '#919191', marginBottom: 32, textAlign: 'center' }}>Looks like you haven't added anything to your cart yet</p>
        <Link href="/" style={{ padding: isMobile ? '14px 36px' : '16px 48px', backgroundColor: '#0C0C0C', color: '#FFFFFF', textDecoration: 'none', fontSize: 14, fontWeight: 500, letterSpacing: 1, borderRadius: 6 }}>
          CONTINUE SHOPPING
        </Link>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const itemCount = getItemCount();

  // ========== MOBILE LAYOUT ==========
  if (isMobile) {
    return (
      <div style={{ backgroundColor: '#F7F7F7', minHeight: '100vh', paddingTop: 70, paddingBottom: 100 }}>
        <div style={{ padding: '20px 16px' }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: 2, textAlign: 'center', marginBottom: 20, color: '#0C0C0C', textTransform: 'uppercase' }}>
            Shopping Cart
          </h1>

          {/* Cart Items */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
            {items.map((item, index) => (
              <div key={item.productId + '-' + index} style={{ padding: 16, borderBottom: index < items.length - 1 ? '1px solid #F0F0F0' : 'none' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  {/* Image */}
                  <div style={{ width: 80, height: 100, backgroundColor: '#F5F5F5', borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                    {item.image ? (
                      <Image src={item.image} alt={item.name} width={80} height={100} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShoppingBag size={24} style={{ color: '#D0D0D0' }} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ fontSize: 14, fontWeight: 500, color: '#0C0C0C', margin: 0, paddingRight: 8, lineHeight: 1.4 }}>{item.name}</h3>
                      <button onClick={() => removeItem(item.productId, item.variant)} style={{ padding: 4, background: 'none', border: 'none', color: '#B0B0B0' }}>
                        <X size={18} />
                      </button>
                    </div>

                    {item.variant && (
                      <p style={{ fontSize: 12, color: '#919191', marginTop: 4 }}>
                        {item.variant.size && 'Size: ' + item.variant.size}
                        {item.variant.color && ' • ' + item.variant.color}
                      </p>
                    )}

                    <div style={{ marginTop: 'auto', paddingTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {/* Quantity */}
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E0E0E0', borderRadius: 6 }}>
                        <button onClick={() => item.quantity > 1 && updateQuantity(item.productId, item.quantity - 1, item.variant)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', backgroundColor: 'transparent' }}>
                          <Minus size={14} color="#666" />
                        </button>
                        <span style={{ width: 32, textAlign: 'center', fontSize: 14, fontWeight: 500, color: '#0C0C0C' }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variant)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', backgroundColor: 'transparent' }}>
                          <Plus size={14} color="#666" />
                        </button>
                      </div>

                      {/* Price */}
                      <span style={{ fontSize: 15, fontWeight: 600, color: '#0C0C0C' }}>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0C0C0C', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #E8E8E8' }}>
              Order Summary
            </h2>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 14, color: '#666' }}>Subtotal ({itemCount} items)</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#0C0C0C' }}>{formatPrice(subtotal)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #E8E8E8' }}>
              <span style={{ fontSize: 14, color: '#666' }}>Shipping</span>
              <span style={{ fontSize: 13, color: '#919191' }}>Calculated at checkout</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#0C0C0C' }}>Total</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#0C0C0C' }}>{formatPrice(subtotal)}</span>
            </div>

            <Link href="/checkout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '16px 24px', backgroundColor: '#B08B5C', color: '#FFFFFF', fontSize: 14, fontWeight: 600, letterSpacing: 1, textDecoration: 'none', borderRadius: 8, textTransform: 'uppercase' }}>
              Proceed to Checkout
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14 }}>
              <Lock size={14} style={{ color: '#B08B5C' }} />
              <span style={{ fontSize: 12, color: '#919191' }}>Secure Checkout</span>
            </div>
          </div>

          {/* Continue Shopping */}
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#0C0C0C', textDecoration: 'none', marginTop: 20 }}>
            <ArrowLeft size={16} />
            Continue Shopping
          </Link>
        </div>

        <style jsx global>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ========== DESKTOP LAYOUT ==========
  return (
    <div style={{ backgroundColor: '#F7F7F7', minHeight: '100vh', paddingTop: 100, paddingBottom: 60 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 400, letterSpacing: 6, textAlign: 'center', marginBottom: 40, color: '#0C0C0C', textTransform: 'uppercase' }}>
          Shopping Cart
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' }}>
          {/* Cart Items */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 100px 140px 100px 40px', padding: '14px 20px', backgroundColor: '#FAFAFA', borderBottom: '1px solid #E8E8E8', fontSize: 11, fontWeight: 600, color: '#919191', textTransform: 'uppercase', letterSpacing: 1 }}>
              <span>Product</span>
              <span style={{ textAlign: 'center' }}>Price</span>
              <span style={{ textAlign: 'center' }}>Quantity</span>
              <span style={{ textAlign: 'right' }}>Total</span>
              <span></span>
            </div>

            {items.map((item, index) => (
              <div key={item.productId + '-' + index} style={{ display: 'grid', gridTemplateColumns: '2fr 100px 140px 100px 40px', alignItems: 'center', padding: '16px 20px', borderBottom: index < items.length - 1 ? '1px solid #F0F0F0' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 70, height: 70, backgroundColor: '#F5F5F5', borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
                    {item.image ? (
                      <Image src={item.image} alt={item.name} width={70} height={70} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShoppingBag size={24} style={{ color: '#D0D0D0' }} /></div>
                    )}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 500, color: '#0C0C0C', marginBottom: 4 }}>{item.name}</h3>
                    {item.variant && <p style={{ fontSize: 12, color: '#919191' }}>{item.variant.size && 'Size: ' + item.variant.size}{item.variant.color && ' • ' + item.variant.color}</p>}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}><span style={{ fontSize: 14, color: '#0C0C0C' }}>{formatPrice(item.price)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E0E0E0', borderRadius: 4 }}>
                    <button onClick={() => item.quantity > 1 && updateQuantity(item.productId, item.quantity - 1, item.variant)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#666' }}><Minus size={14} /></button>
                    <span style={{ width: 36, textAlign: 'center', fontSize: 14, fontWeight: 500, color: '#0C0C0C', borderLeft: '1px solid #E0E0E0', borderRight: '1px solid #E0E0E0', height: 32, lineHeight: '32px' }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variant)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#666' }}><Plus size={14} /></button>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}><span style={{ fontSize: 14, fontWeight: 600, color: '#0C0C0C' }}>{formatPrice(item.price * item.quantity)}</span></div>
                <button onClick={() => removeItem(item.productId, item.variant)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#B0B0B0' }} onMouseOver={(e) => e.currentTarget.style.color = '#DC2626'} onMouseOut={(e) => e.currentTarget.style.color = '#B0B0B0'}><X size={18} /></button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 8, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', position: 'sticky', top: 90 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0C0C0C', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #E8E8E8' }}>Order Summary</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 14, color: '#666' }}>Subtotal ({itemCount} items)</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#0C0C0C' }}>{formatPrice(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #E8E8E8' }}>
              <span style={{ fontSize: 14, color: '#666' }}>Shipping</span>
              <span style={{ fontSize: 13, color: '#919191' }}>Calculated at checkout</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#0C0C0C' }}>Total</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#0C0C0C' }}>{formatPrice(subtotal)}</span>
            </div>
            <Link href="/checkout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '16px 24px', backgroundColor: '#B08B5C', color: '#FFFFFF', fontSize: 14, fontWeight: 600, letterSpacing: 1, textDecoration: 'none', borderRadius: 6, textTransform: 'uppercase', transition: 'background 0.2s' }}>
              Proceed to Checkout
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16 }}>
              <Lock size={14} style={{ color: '#B08B5C' }} />
              <span style={{ fontSize: 12, color: '#919191' }}>Secure Checkout</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#0C0C0C', textDecoration: 'none' }}>
            <ArrowLeft size={16} />
            Continue Shopping
          </Link>
        </div>
      </div>

      <style jsx global>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
