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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
        <div style={{ width: 40, height: 40, border: '1px solid #A68A6C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style jsx global>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Empty Cart Design
  if (items.length === 0) {
    return (
      <div style={{ backgroundColor: '#FFFFFF', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 20px' }}>
        <ShoppingBag size={48} strokeWidth={1} style={{ color: '#ccc', marginBottom: 24 }} />
        <h1 style={{ fontFamily: 'serif', fontSize: 28, color: '#111', marginBottom: 12, letterSpacing: '0.05em' }}>Your Bag is Empty</h1>
        <p style={{ fontSize: 14, color: '#666', marginBottom: 32, letterSpacing: '0.02em' }}>You have no items in your shopping bag.</p>
        <Link href="/" style={{ padding: '16px 40px', backgroundColor: '#111', color: '#FFF', textDecoration: 'none', fontSize: 12, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', transition: '0.3s' }}>
          Start Shopping
        </Link>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const itemCount = getItemCount();

  // Shared Styles
  const containerStyle = { maxWidth: 1200, margin: '0 auto', padding: isMobile ? '0 20px' : '0 40px' };
  const serifFont = { fontFamily: '"Playfair Display", "Times New Roman", serif' };
  const btnReset = { background: 'none', border: 'none', cursor: 'pointer', padding: 0 };

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', paddingTop: isMobile ? 80 : 120, paddingBottom: 100 }}>
      <div style={containerStyle}>
        
        {/* Header */}
        <div style={{ marginBottom: isMobile ? 40 : 60, textAlign: 'center' }}>
          <h1 style={{ ...serifFont, fontSize: isMobile ? 28 : 42, fontWeight: 400, color: '#111', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Shopping Bag
          </h1>
          <p style={{ fontSize: 13, color: '#666', letterSpacing: '1px', textTransform: 'uppercase' }}>
            {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 400px', gap: isMobile ? 40 : 80, alignItems: 'start' }}>
          
          {/* LEFT: Cart Items List */}
          <div>
            {/* Desktop Header Row */}
            {!isMobile && (
              <div style={{ display: 'grid', gridTemplateColumns: '4fr 1fr 1fr 1fr', paddingBottom: 16, borderBottom: '1px solid #111', marginBottom: 24, fontSize: 11, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: '#111' }}>
                <span>Product</span>
                <span style={{ textAlign: 'center' }}>Price</span>
                <span style={{ textAlign: 'center' }}>Qty</span>
                <span style={{ textAlign: 'right' }}>Total</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 32 : 24 }}>
              {items.map((item, index) => (
                <div key={item.productId + '-' + index} style={{ 
                  display: isMobile ? 'flex' : 'grid', 
                  gridTemplateColumns: '4fr 1fr 1fr 1fr', 
                  alignItems: 'center', 
                  gap: isMobile ? 20 : 0,
                  paddingBottom: 24, 
                  borderBottom: '1px solid #E5E5E5' 
                }}>
                  
                  {/* Product Info */}
                  <div style={{ display: 'flex', gap: 20 }}>
                    <div style={{ width: isMobile ? 100 : 100, height: isMobile ? 130 : 130, backgroundColor: '#F9F9F9', position: 'relative', flexShrink: 0 }}>
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShoppingBag size={20} color="#ccc" /></div>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '4px 0' }}>
                      <div>
                        <h3 style={{ fontSize: 14, fontWeight: 500, color: '#111', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8, lineHeight: 1.4 }}>{item.name}</h3>
                        {item.variant && (
                          <div style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>
                            {item.variant.size && <div style={{ textTransform: 'capitalize' }}>Size: {item.variant.size}</div>}
                            {item.variant.color && <div style={{ textTransform: 'capitalize' }}>Color: {item.variant.color}</div>}
                          </div>
                        )}
                      </div>
                      
                      {isMobile && (
                        <div style={{ marginTop: 12 }}>
                           <span style={{ fontSize: 14, color: '#111' }}>{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      )}

                      {!isMobile && (
                        <button onClick={() => removeItem(item.productId, item.variant)} style={{ ...btnReset, textAlign: 'left', fontSize: 10, textTransform: 'uppercase', borderBottom: '1px solid #999', width: 'fit-content', color: '#666', marginTop: 12 }}>
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Desktop Columns */}
                  {!isMobile && (
                    <>
                      <div style={{ textAlign: 'center', fontSize: 14, color: '#666' }}>{formatPrice(item.price)}</div>
                      
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                         <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E5E5E5', height: 36 }}>
                            <button onClick={() => item.quantity > 1 && updateQuantity(item.productId, item.quantity - 1, item.variant)} style={{ width: 32, height: '100%', ...btnReset, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={12} /></button>
                            <span style={{ width: 32, textAlign: 'center', fontSize: 13 }}>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variant)} style={{ width: 32, height: '100%', ...btnReset, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={12} /></button>
                         </div>
                      </div>

                      <div style={{ textAlign: 'right', fontSize: 14, fontWeight: 500 }}>{formatPrice(item.price * item.quantity)}</div>
                    </>
                  )}

                  {/* Mobile Controls */}
                  {isMobile && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', height: 130, padding: '4px 0' }}>
                       <button onClick={() => removeItem(item.productId, item.variant)} style={btnReset}><X size={18} strokeWidth={1} /></button>
                       
                       <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E5E5E5', height: 32 }}>
                          <button onClick={() => item.quantity > 1 && updateQuantity(item.productId, item.quantity - 1, item.variant)} style={{ width: 28, height: '100%', ...btnReset, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={12} /></button>
                          <span style={{ width: 28, textAlign: 'center', fontSize: 12 }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variant)} style={{ width: 28, height: '100%', ...btnReset, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={12} /></button>
                       </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 40 }}>
              <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 12, fontWeight: 500, color: '#111', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px' }}>
                <ArrowLeft size={16} strokeWidth={1.5} />
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* RIGHT: Order Summary */}
          <div style={{ backgroundColor: '#FAFAFA', padding: isMobile ? 24 : 40, border: '1px solid #F0F0F0', position: isMobile ? 'relative' : 'sticky', top: 120 }}>
            <h2 style={{ ...serifFont, fontSize: 22, color: '#111', marginBottom: 24, borderBottom: '1px solid #E5E5E5', paddingBottom: 16 }}>Order Summary</h2>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subtotal</span>
              <span style={{ fontSize: 13, color: '#111' }}>{formatPrice(subtotal)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #E5E5E5' }}>
              <span style={{ fontSize: 13, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Shipping</span>
              <span style={{ fontSize: 12, color: '#999', fontStyle: 'italic' }}>Calculated at checkout</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
              <span style={{ fontSize: 16, fontWeight: 500, color: '#111', textTransform: 'uppercase', letterSpacing: '1px' }}>Total</span>
              <span style={{ fontSize: 18, fontWeight: 600, color: '#111' }}>{formatPrice(subtotal)}</span>
            </div>

            <Link href="/checkout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '18px', backgroundColor: '#111', color: '#FFFFFF', fontSize: 12, fontWeight: 600, letterSpacing: '2px', textDecoration: 'none', textTransform: 'uppercase', border: '1px solid #111', transition: 'all 0.3s' }}>
              Checkout Now
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20 }}>
              <Lock size={12} color="#999" />
              <span style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: '1px' }}>Secure Checkout</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
