'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, X, ShoppingBag, ArrowRight } from 'lucide-react';
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

  if (!mounted) return null;

  // Empty Cart State
  if (items.length === 0) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF' }}>
        <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 32, color: '#000', marginBottom: 16 }}>YOUR BAG IS EMPTY</h1>
        <p style={{ fontSize: 13, color: '#666', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 40 }}>Add some items to get started</p>
        <Link href="/" style={{ borderBottom: '1px solid #000', paddingBottom: 4, fontSize: 13, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: '#000', textDecoration: 'none' }}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  const subtotal = getSubtotal();

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', paddingTop: isMobile ? 80 : 120, paddingBottom: 100, color: '#000' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '0 20px' : '0 50px' }}>
        
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 60, borderBottom: '1px solid #000', paddingBottom: 20 }}>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: isMobile ? 28 : 42, fontWeight: 400, margin: 0, letterSpacing: '-0.5px' }}>
            SHOPPING BAG
          </h1>
          <span style={{ fontSize: 13, letterSpacing: '1px', fontWeight: 500 }}>{items.length} ITEMS</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2.5fr 1fr', gap: isMobile ? 50 : 80 }}>
          
          {/* LEFT: Items List */}
          <div>
            {/* Desktop Table Header */}
            {!isMobile && (
              <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', paddingBottom: 15, borderBottom: '1px solid #E5E5E5', marginBottom: 20, fontSize: 11, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: '#999' }}>
                <span>Product</span>
                <span style={{ textAlign: 'center' }}>Price</span>
                <span style={{ textAlign: 'center' }}>Quantity</span>
                <span style={{ textAlign: 'right' }}>Total</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {items.map((item, index) => (
                <div key={index} style={{ 
                  display: isMobile ? 'flex' : 'grid', 
                  gridTemplateColumns: '3fr 1fr 1fr 1fr', 
                  alignItems: 'center', 
                  padding: '30px 0', 
                  borderBottom: '1px solid #E5E5E5',
                  gap: isMobile ? 20 : 0
                }}>
                  
                  {/* Product Details */}
                  <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                    <div style={{ width: isMobile ? 90 : 100, height: isMobile ? 120 : 130, backgroundColor: '#F5F5F5', position: 'relative', flexShrink: 0 }}>
                      {item.image && <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />}
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', margin: 0, lineHeight: 1.4 }}>{item.name}</h3>
                      <div style={{ fontSize: 12, color: '#666', lineHeight: 1.6, textTransform: 'capitalize' }}>
                        {item.variant?.size && <span>Size: {item.variant.size}<br/></span>}
                        {item.variant?.color && <span>Color: {item.variant.color}</span>}
                      </div>
                      
                      {/* Mobile Only Controls */}
                      {isMobile && (
                        <div style={{ marginTop: 12 }}>
                           <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>{formatPrice(item.price * item.quantity)}</div>
                           <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #DDD', width: 'fit-content' }}>
                              <button onClick={() => item.quantity > 1 && updateQuantity(item.productId, item.quantity - 1, item.variant)} style={{ padding: '6px 10px', background: 'none', border: 'none' }}><Minus size={14}/></button>
                              <span style={{ padding: '0 8px', fontSize: 13 }}>{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variant)} style={{ padding: '6px 10px', background: 'none', border: 'none' }}><Plus size={14}/></button>
                           </div>
                        </div>
                      )}

                      {!isMobile && (
                        <button onClick={() => removeItem(item.productId, item.variant)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left', fontSize: 10, textTransform: 'uppercase', borderBottom: '1px solid #999', width: 'fit-content', color: '#666', marginTop: 12, letterSpacing: '1px' }}>
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Desktop Columns: Price, Qty, Total */}
                  {!isMobile && (
                    <>
                      <div style={{ textAlign: 'center', fontSize: 14, fontFamily: 'serif' }}>{formatPrice(item.price)}</div>
                      
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                         <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #DDD', height: 40 }}>
                            <button onClick={() => item.quantity > 1 && updateQuantity(item.productId, item.quantity - 1, item.variant)} style={{ width: 36, height: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={12} /></button>
                            <span style={{ width: 30, textAlign: 'center', fontSize: 13 }}>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variant)} style={{ width: 36, height: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={12} /></button>
                         </div>
                      </div>

                      <div style={{ textAlign: 'right', fontSize: 15, fontWeight: 500 }}>{formatPrice(item.price * item.quantity)}</div>
                    </>
                  )}
                  
                  {isMobile && (
                    <button onClick={() => removeItem(item.productId, item.variant)} style={{ position: 'absolute', right: 0, top: 0, padding: 10, background: 'none', border: 'none' }}>
                      <X size={18} strokeWidth={1} color="#666" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Summary */}
          <div style={{ paddingTop: isMobile ? 0 : 50 }}>
             <div style={{ backgroundColor: '#FAFAFA', padding: '40px 30px', border: '1px solid #E5E5E5' }}>
                <h2 style={{ fontSize: 18, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 30, borderBottom: '1px solid #000', paddingBottom: 15 }}>Order Summary</h2>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                  <span style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '1px', color: '#666' }}>Subtotal</span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{formatPrice(subtotal)}</span>
                </div>
                
                <p style={{ fontSize: 12, color: '#999', fontStyle: 'italic', marginBottom: 30 }}>Shipping & taxes calculated at checkout.</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 30, paddingTop: 20, borderTop: '1px solid #DDD' }}>
                  <span style={{ fontSize: 15, fontWeight: 600, textTransform: 'uppercase' }}>Total</span>
                  <span style={{ fontSize: 18, fontWeight: 600 }}>{formatPrice(subtotal)}</span>
                </div>

                <Link href="/checkout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: 50, backgroundColor: '#000', color: '#FFF', fontSize: 13, fontWeight: 600, letterSpacing: '2px', textDecoration: 'none', textTransform: 'uppercase', transition: 'opacity 0.3s' }}>
                  Checkout
                </Link>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
