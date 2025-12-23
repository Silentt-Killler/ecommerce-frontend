'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, X, ShoppingBag } from 'lucide-react';
import useCartStore from '@/store/cartStore';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getSubtotal } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatPrice = (price) => '৳' + (price || 0).toLocaleString('en-BD');

  const subtotal = mounted ? getSubtotal() : 0;

  // Loading state
  if (!mounted) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #B08B5C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <div style={{ 
        minHeight: '60vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: 40
      }}>
        <ShoppingBag size={64} strokeWidth={1} style={{ color: '#CCC', marginBottom: 24 }} />
        <h2 style={{ fontSize: 24, fontWeight: 500, marginBottom: 12, color: '#0C0C0C' }}>
          Your cart is empty
        </h2>
        <p style={{ color: '#919191', marginBottom: 32, textAlign: 'center' }}>
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link 
          href="/shop"
          style={{
            padding: '16px 48px',
            backgroundColor: '#0C0C0C',
            color: '#FFFFFF',
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: 1,
            textTransform: 'uppercase'
          }}
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F7F7F7', minHeight: '100vh', paddingTop: 40, paddingBottom: 80 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        
        {/* Page Title */}
        <h1 style={{ 
          fontSize: 32, 
          fontWeight: 400, 
          letterSpacing: 4, 
          textAlign: 'center',
          marginBottom: 50,
          color: '#0C0C0C',
          textTransform: 'uppercase'
        }}>
          Shopping Cart
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 40 }}>
          
          {/* Left - Cart Items */}
          <div>
            <div style={{ 
              backgroundColor: '#FFFFFF', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              {/* Header */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '2fr 1fr 1fr 1fr 40px',
                padding: '16px 24px',
                borderBottom: '1px solid #E8E8E8',
                fontSize: 12,
                fontWeight: 600,
                color: '#919191',
                textTransform: 'uppercase',
                letterSpacing: 1
              }}>
                <span>Product</span>
                <span style={{ textAlign: 'center' }}>Price</span>
                <span style={{ textAlign: 'center' }}>Quantity</span>
                <span style={{ textAlign: 'right' }}>Total</span>
                <span></span>
              </div>

              {/* Items */}
              {items.map((item, index) => (
                <div 
                  key={`${item.productId}-${JSON.stringify(item.variant)}-${index}`}
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 40px',
                    alignItems: 'center',
                    padding: '24px',
                    borderBottom: index < items.length - 1 ? '1px solid #F0F0F0' : 'none'
                  }}
                >
                  {/* Product Info */}
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ 
                      width: 80, 
                      height: 100, 
                      backgroundColor: '#F5F5F5',
                      position: 'relative',
                      flexShrink: 0
                    }}>
                      {item.image && (
                        <Image 
                          src={item.image} 
                          alt={item.name}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      )}
                    </div>
                    <div>
                      <h3 style={{ 
                        fontSize: 15, 
                        fontWeight: 500, 
                        color: '#0C0C0C',
                        marginBottom: 6
                      }}>
                        {item.name}
                      </h3>
                      {item.variant?.size && (
                        <p style={{ fontSize: 13, color: '#919191' }}>
                          Size: {item.variant.size}
                        </p>
                      )}
                      {item.variant?.color && (
                        <p style={{ fontSize: 13, color: '#919191' }}>
                          Color: {item.variant.color}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: 15, color: '#0C0C0C' }}>
                      {formatPrice(item.price)}
                    </span>
                  </div>

                  {/* Quantity */}
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      border: '1px solid #E0E0E0'
                    }}>
                      <button
                        onClick={() => {
                          if (item.quantity > 1) {
                            updateQuantity(item.productId, item.quantity - 1, item.variant);
                          }
                        }}
                        style={{
                          width: 36,
                          height: 36,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: 'none',
                          backgroundColor: 'transparent',
                          cursor: 'pointer'
                        }}
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ 
                        width: 40, 
                        textAlign: 'center', 
                        fontSize: 14,
                        fontWeight: 500
                      }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variant)}
                        style={{
                          width: 36,
                          height: 36,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: 'none',
                          backgroundColor: 'transparent',
                          cursor: 'pointer'
                        }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Total */}
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#0C0C0C' }}>
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.productId, item.variant)}
                    style={{
                      width: 36,
                      height: 36,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      color: '#919191'
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>

            {/* Continue Shopping */}
            <div style={{ marginTop: 24 }}>
              <Link 
                href="/shop"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 14,
                  color: '#0C0C0C',
                  textDecoration: 'none'
                }}
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* Right - Order Summary */}
          <div>
            <div style={{ 
              backgroundColor: '#FFFFFF', 
              padding: 32,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              position: 'sticky',
              top: 100
            }}>
              <h2 style={{ 
                fontSize: 18, 
                fontWeight: 600, 
                color: '#0C0C0C',
                marginBottom: 24,
                paddingBottom: 16,
                borderBottom: '1px solid #E8E8E8'
              }}>
                Order Summary
              </h2>

              {/* Subtotal */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontSize: 15, color: '#666' }}>Subtotal ({items.length} items)</span>
                <span style={{ fontSize: 15, fontWeight: 500, color: '#0C0C0C' }}>{formatPrice(subtotal)}</span>
              </div>

              {/* Shipping Note */}
              <div style={{ 
                padding: '12px 16px', 
                backgroundColor: '#F7F7F7', 
                borderRadius: 6,
                marginBottom: 24
              }}>
                <p style={{ fontSize: 13, color: '#666' }}>
                  Shipping calculated at checkout
                </p>
              </div>

              {/* Total */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                paddingTop: 16,
                borderTop: '2px solid #0C0C0C',
                marginBottom: 24
              }}>
                <span style={{ fontSize: 18, fontWeight: 600, color: '#0C0C0C' }}>Total</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: '#0C0C0C' }}>{formatPrice(subtotal)}</span>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '18px',
                  backgroundColor: '#B08B5C',
                  color: '#FFFFFF',
                  textAlign: 'center',
                  textDecoration: 'none',
                  fontSize: 15,
                  fontWeight: 600,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  transition: 'background-color 0.2s'
                }}
              >
                Proceed to Checkout
              </Link>

              {/* Secure Note */}
              <p style={{ 
                textAlign: 'center', 
                fontSize: 12, 
                color: '#919191',
                marginTop: 16
              }}>
                🔒 Secure Checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
