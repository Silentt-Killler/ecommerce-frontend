'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, X, ArrowRight, Trash2 } from 'lucide-react';
import useCartStore from '@/store/cartStore';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getSubtotal } = useCartStore();
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

  if (!mounted) return null;

  // --- EMPTY STATE DESIGN ---
  if (items.length === 0) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF' }}>
        <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 32, fontWeight: 400, color: '#111', marginBottom: 12 }}>Your Bag is Empty</h1>
        <p style={{ fontSize: 13, color: '#666', marginBottom: 32, letterSpacing: '0.5px' }}>Looks like you haven&apos;t made your choice yet.</p>
        <Link href="/" style={{ borderBottom: '1px solid #111', paddingBottom: 6, fontSize: 12, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: '#111', textDecoration: 'none' }}>
          Start Shopping
        </Link>
      </div>
    );
  }

  const subtotal = getSubtotal();

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', paddingTop: isMobile ? 80 : 120, paddingBottom: 100 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '0 20px' : '0 50px' }}>
        
        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: isMobile ? 40 : 70 }}>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: isMobile ? 28 : 42, fontWeight: 400, color: '#111', margin: 0, letterSpacing: '-0.5px' }}>SHOPPING BAG</h1>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '2px', color: '#999', textTransform: 'uppercase', display: 'block', marginTop: 10 }}>
            {items.length} {items.length === 1 ? 'Item' : 'Items'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2.5fr 1fr', gap: isMobile ? 50 : 80, alignItems: 'start' }}>
          
          {/* LEFT: CART ITEMS */}
          <div>
            {!isMobile && (
              <div style={{ display: 'grid', gridTemplateColumns: '4fr 1fr 1fr 1fr', paddingBottom: 20, borderBottom: '1px solid #E5E5E5', marginBottom: 20, fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#999' }}>
                <span>Product</span>
                <span style={{ textAlign: 'center' }}>Price</span>
                <span style={{ textAlign: 'center' }}>Quantity</span>
                <span style={{ textAlign: 'right' }}>Total</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {items.map((item, index) => (
                <div key={`${item.productId}-${index}`} style={{ 
                  padding: '30px 0', 
                  borderBottom: '1px solid #F0F0F0',
                  position: 'relative' // Needed for absolute positioning on mobile
                }}>
                  
                  {/* --- MOBILE LAYOUT --- */}
                  {isMobile ? (
                    <div style={{ display: 'flex', gap: 16 }}>
                      {/* Image */}
                      <div style={{ width: 90, height: 110, backgroundColor: '#F9F9F9', position: 'relative', flexShrink: 0 }}>
                        {item.image && <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />}
                      </div>
                      
                      {/* Info */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ paddingRight: 30 }}> {/* Space for remove button */}
                             <h3 style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0, lineHeight: 1.4, color: '#111' }}>{item.name}</h3>
                          </div>
                          {item.variant && (
                            <div style={{ fontSize: 11, color: '#666', marginTop: 6, lineHeight: 1.4 }}>
                               {item.variant.size && <span>Size: {item.variant.size} </span>}
                               {item.variant.color && <span>/ {item.variant.color}</span>}
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E0E0E0' }}>
                             <button onClick={() => item.quantity > 1 && updateQuantity(item.productId, item.quantity - 1, item.variant)} style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none' }}><Minus size={12}/></button>
                             <span style={{ fontSize: 12, fontWeight: 500, minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                             <button onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variant)} style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none' }}><Plus size={12}/></button>
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      </div>

                      {/* FIXED MOBILE REMOVE BUTTON */}
                      <button 
                        onClick={() => removeItem(item.productId, item.variant)} 
                        style={{ 
                          position: 'absolute', 
                          top: 30, 
                          right: 0, 
                          width: 30, 
                          height: 30, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          background: 'none', 
                          border: 'none',
                          color: '#999'
                        }}
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ) : (
                    /* --- DESKTOP LAYOUT --- */
                    <div style={{ display: 'grid', gridTemplateColumns: '4fr 1fr 1fr 1fr', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                        <div style={{ width: 80, height: 100, backgroundColor: '#F9F9F9', position: 'relative', flexShrink: 0 }}>
                          {item.image && <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />}
                        </div>
                        <div>
                          <h3 style={{ fontSize: 14, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 6px 0', color: '#111' }}>{item.name}</h3>
                          {item.variant && <p style={{ fontSize: 12, color: '#777', margin: 0 }}>{item.variant.size} {item.variant.color && `/ ${item.variant.color}`}</p>}
                          <button onClick={() => removeItem(item.productId, item.variant)} style={{ background: 'none', border: 'none', padding: 0, marginTop: 12, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #CCC', cursor: 'pointer', color: '#666' }}>Remove</button>
                        </div>
                      </div>
                      <div style={{ textAlign: 'center', fontSize: 14, color: '#333' }}>{formatPrice(item.price)}</div>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                         <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E5E5E5', height: 36 }}>
                            <button onClick={() => item.quantity > 1 && updateQuantity(item.productId, item.quantity - 1, item.variant)} style={{ width: 32, height: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}><Minus size={12} /></button>
                            <span style={{ width: 32, textAlign: 'center', fontSize: 13, fontWeight: 500 }}>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variant)} style={{ width: 32, height: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}><Plus size={12} /></button>
                         </div>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: 15, fontWeight: 600, color: '#111' }}>{formatPrice(item.price * item.quantity)}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div style={{ backgroundColor: '#FDFDFD', padding: isMobile ? '30px 20px' : '40px', border: '1px solid #F0F0F0' }}>
            <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 20, color: '#111', marginBottom: 25, letterSpacing: '0.5px' }}>SUMMARY</h2>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15, fontSize: 13, color: '#555' }}>
              <span>Subtotal</span>
              <span style={{ color: '#111', fontWeight: 500 }}>{formatPrice(subtotal)}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 30, fontSize: 13, color: '#555' }}>
              <span>Estimated Delivery</span>
              <span style={{ fontStyle: 'italic', fontSize: 12 }}>Calculated at checkout</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 30, paddingTop: 20, borderTop: '1px solid #E5E5E5' }}>
              <span style={{ fontSize: 15, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Total</span>
              <span style={{ fontSize: 18, fontWeight: 700 }}>{formatPrice(subtotal)}</span>
            </div>

            <Link href="/checkout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: 52, backgroundColor: '#111', color: '#FFF', fontSize: 12, fontWeight: 600, letterSpacing: '2px', textDecoration: 'none', textTransform: 'uppercase', transition: '0.3s' }}>
              Proceed to Checkout
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
