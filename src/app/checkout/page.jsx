'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Check, Truck, CreditCard, Banknote } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const deliveryOptions = [
  { id: 'inside_dhaka', label: 'Inside Dhaka', price: 70 },
  { id: 'dhaka_suburban', label: 'Dhaka Suburban', price: 100 },
  { id: 'outside_dhaka', label: 'Outside Dhaka', price: 130 }
];

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getItemCount, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    deliveryZone: 'inside_dhaka',
    paymentMethod: 'cod',
    notes: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Pre-fill if user is logged in
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryCharge = deliveryOptions.find(d => d.id === formData.deliveryZone)?.price || 70;
  const total = subtotal + deliveryCharge;

  const formatPrice = (price) => '৳' + price?.toLocaleString('en-BD');

  // Lead capture function - called when user fills form
  const captureLead = useCallback(
    debounce(async (data) => {
      // Only capture if we have phone number and at least name or address
      if (!data.phone || data.phone.length < 10) return;
      if (!data.fullName && !data.address) return;

      try {
        await api.post('/orders/leads/capture', {
          name: data.fullName,
          phone: data.phone,
          email: data.email,
          address: data.address,
          delivery_zone: data.deliveryZone,
          cart_items: items.map(item => ({
            product_id: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })),
          cart_total: subtotal,
          source: 'checkout'
        });
        setLeadCaptured(true);
        console.log('Lead captured successfully');
      } catch (error) {
        console.log('Lead capture failed:', error);
      }
    }, 2000), // 2 second debounce
    [items, subtotal]
  );

  // Handle form change with lead capture
  const handleChange = (e) => {
    const newData = { ...formData, [e.target.name]: e.target.value };
    setFormData(newData);
    
    // Capture lead when user fills form
    captureLead(newData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!formData.fullName || !formData.phone || !formData.address) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        customer_name: formData.fullName,
        customer_phone: formData.phone,
        customer_email: formData.email || null,
        shipping_address: {
          street: formData.address,
          city: formData.city || 'Dhaka',
          state: formData.deliveryZone,
          postal_code: '',
          country: 'Bangladesh',
          phone: formData.phone
        },
        delivery_zone: formData.deliveryZone,
        delivery_charge: deliveryCharge,
        payment_method: formData.paymentMethod,
        notes: formData.notes || null,
        items: items.map(item => ({
          product_id: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          variant: item.variant || null
        })),
        subtotal: subtotal,
        total: total
      };

      const response = await api.post('/orders/guest', orderData);
      
      // Clear cart after successful order
      if (clearCart) {
        clearCart();
      }
      localStorage.removeItem('cart-storage');
      
      toast.success('Order placed successfully!');
      router.push(`/order-success?order=${response.data.order_number || response.data._id}`);
      
    } catch (error) {
      console.error('Order error:', error);
      toast.error(error.response?.data?.detail || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

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
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <h2 style={{ fontSize: 24, fontWeight: 500, marginBottom: 16, color: '#0C0C0C' }}>Your cart is empty</h2>
        <p style={{ color: '#919191', marginBottom: 24 }}>Add some products to checkout</p>
        <Link 
          href="/shop"
          style={{
            padding: '14px 40px',
            backgroundColor: '#0C0C0C',
            color: '#FFFFFF',
            textDecoration: 'none',
            fontSize: 14,
            letterSpacing: 1
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
          Checkout
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 40 }}>
          
          {/* Left - Form */}
          <div>
            <form onSubmit={handleSubmit}>
              
              {/* Customer Information */}
              <div style={{ 
                backgroundColor: '#FFFFFF', 
                padding: 32, 
                marginBottom: 24,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}>
                <h2 style={{ 
                  fontSize: 18, 
                  fontWeight: 600, 
                  color: '#0C0C0C',
                  marginBottom: 24,
                  paddingBottom: 16,
                  borderBottom: '1px solid #E8E8E8'
                }}>
                  Customer Information
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  {/* Full Name */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0C0C0C', marginBottom: 8 }}>
                      Full Name <span style={{ color: '#B00020' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        border: '1px solid #E0E0E0',
                        borderRadius: 6,
                        fontSize: 14,
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#0C0C0C'}
                      onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0C0C0C', marginBottom: 8 }}>
                      Phone Number <span style={{ color: '#B00020' }}>*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="01XXX-XXXXXX"
                      required
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        border: '1px solid #E0E0E0',
                        borderRadius: 6,
                        fontSize: 14,
                        outline: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#0C0C0C'}
                      onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0C0C0C', marginBottom: 8 }}>
                      Email <span style={{ color: '#919191', fontWeight: 400 }}>(Optional)</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        border: '1px solid #E0E0E0',
                        borderRadius: 6,
                        fontSize: 14,
                        outline: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#0C0C0C'}
                      onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                    />
                  </div>

                  {/* Address */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0C0C0C', marginBottom: 8 }}>
                      Full Address <span style={{ color: '#B00020' }}>*</span>
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="House, Road, Area, District"
                      required
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        border: '1px solid #E0E0E0',
                        borderRadius: 6,
                        fontSize: 14,
                        outline: 'none',
                        resize: 'vertical'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#0C0C0C'}
                      onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Zone */}
              <div style={{ 
                backgroundColor: '#FFFFFF', 
                padding: 32, 
                marginBottom: 24,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}>
                <h2 style={{ 
                  fontSize: 18, 
                  fontWeight: 600, 
                  color: '#0C0C0C',
                  marginBottom: 24,
                  paddingBottom: 16,
                  borderBottom: '1px solid #E8E8E8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}>
                  <Truck size={20} />
                  Delivery Zone
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {deliveryOptions.map((option) => (
                    <label
                      key={option.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 20px',
                        border: formData.deliveryZone === option.id ? '2px solid #0C0C0C' : '1px solid #E0E0E0',
                        borderRadius: 8,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        backgroundColor: formData.deliveryZone === option.id ? '#FAFAFA' : '#FFFFFF'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          border: formData.deliveryZone === option.id ? '6px solid #0C0C0C' : '2px solid #CCC',
                          transition: 'all 0.2s'
                        }} />
                        <span style={{ fontSize: 15, fontWeight: 500, color: '#0C0C0C' }}>
                          {option.label}
                        </span>
                      </div>
                      <span style={{ 
                        fontSize: 15, 
                        fontWeight: 600, 
                        color: '#B08B5C'
                      }}>
                        {formatPrice(option.price)}
                      </span>
                      <input
                        type="radio"
                        name="deliveryZone"
                        value={option.id}
                        checked={formData.deliveryZone === option.id}
                        onChange={handleChange}
                        style={{ display: 'none' }}
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div style={{ 
                backgroundColor: '#FFFFFF', 
                padding: 32, 
                marginBottom: 24,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}>
                <h2 style={{ 
                  fontSize: 18, 
                  fontWeight: 600, 
                  color: '#0C0C0C',
                  marginBottom: 24,
                  paddingBottom: 16,
                  borderBottom: '1px solid #E8E8E8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}>
                  <CreditCard size={20} />
                  Payment Method
                </h2>

                <div style={{ display: 'flex', gap: 16 }}>
                  {/* COD */}
                  <label
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '24px 20px',
                      border: formData.paymentMethod === 'cod' ? '2px solid #0C0C0C' : '1px solid #E0E0E0',
                      borderRadius: 8,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: formData.paymentMethod === 'cod' ? '#FAFAFA' : '#FFFFFF'
                    }}
                  >
                    <Banknote size={32} style={{ marginBottom: 12, color: formData.paymentMethod === 'cod' ? '#0C0C0C' : '#919191' }} />
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#0C0C0C', marginBottom: 4 }}>
                      Cash on Delivery
                    </span>
                    <span style={{ fontSize: 12, color: '#919191' }}>
                      Pay when you receive
                    </span>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleChange}
                      style={{ display: 'none' }}
                    />
                  </label>

                  {/* Online Payment */}
                  <label
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '24px 20px',
                      border: formData.paymentMethod === 'online' ? '2px solid #0C0C0C' : '1px solid #E0E0E0',
                      borderRadius: 8,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: formData.paymentMethod === 'online' ? '#FAFAFA' : '#FFFFFF'
                    }}
                  >
                    <CreditCard size={32} style={{ marginBottom: 12, color: formData.paymentMethod === 'online' ? '#0C0C0C' : '#919191' }} />
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#0C0C0C', marginBottom: 4 }}>
                      Full Payment
                    </span>
                    <span style={{ fontSize: 12, color: '#919191' }}>
                      bKash / Nagad / Card
                    </span>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={formData.paymentMethod === 'online'}
                      onChange={handleChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>

              {/* Order Notes */}
              <div style={{ 
                backgroundColor: '#FFFFFF', 
                padding: 32,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}>
                <h2 style={{ 
                  fontSize: 18, 
                  fontWeight: 600, 
                  color: '#0C0C0C',
                  marginBottom: 20
                }}>
                  Order Notes <span style={{ color: '#919191', fontWeight: 400, fontSize: 14 }}>(Optional)</span>
                </h2>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any special instructions for your order..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '1px solid #E0E0E0',
                    borderRadius: 6,
                    fontSize: 14,
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

            </form>
          </div>

          {/* Right - Order Summary */}
          <div>
            <div style={{ 
              backgroundColor: '#FFFFFF', 
              padding: 32,
              position: 'sticky',
              top: 100,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
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

              {/* Products */}
              <div style={{ marginBottom: 24 }}>
                {items.map((item, index) => (
                  <div 
                    key={index}
                    style={{ 
                      display: 'flex', 
                      gap: 16, 
                      paddingBottom: 16,
                      marginBottom: 16,
                      borderBottom: index < items.length - 1 ? '1px solid #F0F0F0' : 'none'
                    }}
                  >
                    {/* Product Image */}
                    <div style={{ 
                      width: 70, 
                      height: 88, 
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
                      {/* Quantity Badge */}
                      <div style={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        width: 22,
                        height: 22,
                        backgroundColor: '#0C0C0C',
                        color: '#FFFFFF',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 600
                      }}>
                        {item.quantity}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        fontSize: 14, 
                        fontWeight: 500, 
                        color: '#0C0C0C',
                        marginBottom: 4,
                        lineHeight: 1.4
                      }}>
                        {item.name}
                      </h4>
                      {item.variant?.size && (
                        <p style={{ fontSize: 12, color: '#919191' }}>
                          Size: {item.variant.size}
                          {item.variant.color && ` / ${item.variant.color}`}
                        </p>
                      )}
                      <p style={{ 
                        fontSize: 14, 
                        fontWeight: 600, 
                        color: '#0C0C0C',
                        marginTop: 8
                      }}>
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div style={{ borderTop: '1px solid #E8E8E8', paddingTop: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 14, color: '#666' }}>Subtotal</span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#0C0C0C' }}>{formatPrice(subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ fontSize: 14, color: '#666' }}>Delivery</span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#B08B5C' }}>{formatPrice(deliveryCharge)}</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  paddingTop: 16,
                  borderTop: '2px solid #0C0C0C'
                }}>
                  <span style={{ fontSize: 18, fontWeight: 600, color: '#0C0C0C' }}>Total</span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: '#0C0C0C' }}>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '18px',
                  marginTop: 24,
                  backgroundColor: '#B08B5C',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: 15,
                  fontWeight: 600,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#8B6B3D')}
                onMouseOut={(e) => e.target.style.backgroundColor = '#B08B5C'}
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>

              {/* Secure Checkout Note */}
              <p style={{ 
                textAlign: 'center', 
                fontSize: 12, 
                color: '#919191',
                marginTop: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}>
                <Check size={14} />
                Secure Checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
