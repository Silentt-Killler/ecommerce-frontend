'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Package, CheckCircle, Tag, X, Search, MapPin, Phone, Shield, Home, Gift, Copy, ShoppingCart, Lock } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import { districts } from '@/data/bangladesh-locations';
import api from '@/lib/api';
import toast from 'react-hot-toast';

// Debounce hook for lead capture
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

function LoadingFallback() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF' }}>
      <div style={{ width: 28, height: 28, border: '2px solid #E5E7EB', borderTopColor: '#B08B5C', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Mobile 3 Steps
  const [step, setStep] = useState(1);
  const [orderNumber, setOrderNumber] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Form
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', district: '', area: '', address: '', note: '' });
  
  // Lead tracking
  const [leadId, setLeadId] = useState(null);
  const debouncedFormData = useDebounce(formData, 1500); // 1.5 second delay
  
  // OTP
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const otpRefs = useRef([]);
  
  // Payment
  const [paymentType, setPaymentType] = useState('partial');
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  
  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  
  // Location
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationStep, setLocationStep] = useState('district');
  const [locationSearch, setLocationSearch] = useState('');
  const [selectedDistrictObj, setSelectedDistrictObj] = useState(null);
  const [availableAreas, setAvailableAreas] = useState([]);
  const [deliveryCharge, setDeliveryCharge] = useState(60);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    if (user) setFormData(prev => ({ ...prev, name: user.name || '', phone: user.phone || '', email: user.email || '' }));
    return () => window.removeEventListener('resize', checkMobile);
  }, [user]);

  // Lead Capture - Auto save when user types
  useEffect(() => {
    const saveLead = async () => {
      // Only save if we have phone number (minimum requirement)
      if (!debouncedFormData.phone || debouncedFormData.phone.length < 11) return;
      
      try {
        const leadData = {
          name: debouncedFormData.name || '',
          phone: debouncedFormData.phone || '',
          email: debouncedFormData.email || '',
          district: debouncedFormData.district || '',
          area: debouncedFormData.area || '',
          address: debouncedFormData.address || '',
          source: 'checkout',
          cart_items: items.map(item => ({
            product_id: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })),
          cart_total: getSubtotal()
        };

        // Use /leads/capture endpoint (public, no auth required)
        const res = await api.post('/leads/capture', leadData);
        if (res.data?.id) {
          setLeadId(res.data.id);
        }
      } catch (error) {
        // Silently fail - don't interrupt user
        console.log('Lead capture error:', error);
      }
    };

    saveLead();
  }, [debouncedFormData, items]);

  useEffect(() => {
    if (otpTimer > 0) {
      const interval = setInterval(() => setOtpTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [otpTimer]);

  useEffect(() => {
    if (selectedDistrictObj) {
      setAvailableAreas(selectedDistrictObj.areas || []);
      const zone = selectedDistrictObj.delivery_zone;
      if (zone === 'inside_dhaka') setDeliveryCharge(60);
      else if (zone === 'dhaka_suburban') setDeliveryCharge(80);
      else if (zone === 'chittagong_city') setDeliveryCharge(100);
      else setDeliveryCharge(120);
    }
  }, [selectedDistrictObj]);

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // OTP Functions
  const sendOtp = async () => {
    if (!formData.phone || formData.phone.length < 11) { toast.error('Enter valid phone'); return; }
    setOtpSending(true);
    try {
      await api.post('/auth/send-otp', { phone: formData.phone });
      toast.success('OTP sent!');
      setShowOtpModal(true);
      setOtpTimer(60);
      setOtpValues(['', '', '', '', '', '']);
    } catch (error) {
      toast.error('Failed to send OTP');
    } finally {
      setOtpSending(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpValues];
    newOtp[index] = value.slice(-1);
    setOtpValues(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const verifyOtp = async () => {
    const otp = otpValues.join('');
    if (otp.length !== 6) { toast.error('Enter complete OTP'); return; }
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { phone: formData.phone, otp });
      setOtpVerified(true);
      setShowOtpModal(false);
      toast.success('Verified!');
    } catch (error) {
      toast.error('Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // Location
  const selectDistrict = (d) => {
    setSelectedDistrictObj(d);
    setFormData(prev => ({ ...prev, district: d.name, area: '' }));
    setLocationStep('area');
    setLocationSearch('');
  };

  const selectArea = (a) => {
    setFormData(prev => ({ ...prev, area: a.name }));
    setShowLocationModal(false);
  };

  // Coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await api.post('/coupons/validate', { code: couponCode.toUpperCase(), subtotal });
      setAppliedCoupon(res.data);
      let disc = res.data.type === 'percentage' ? (subtotal * res.data.value) / 100 : res.data.value;
      if (res.data.max_discount && disc > res.data.max_discount) disc = res.data.max_discount;
      setDiscount(disc);
      toast.success('Applied!');
    } catch { toast.error('Invalid coupon'); }
    finally { setCouponLoading(false); }
  };

  const subtotal = getSubtotal();
  const finalDeliveryCharge = paymentType === 'full' ? 0 : deliveryCharge;
  const total = subtotal - discount + finalDeliveryCharge;
  const advanceAmount = paymentType === 'full' ? (subtotal - discount) : deliveryCharge;
  const codAmount = paymentType === 'full' ? 0 : (subtotal - discount);

  const canProceed = () => formData.name && formData.phone && formData.district && formData.area && formData.address && otpVerified;

  const handleSubmit = async () => {
    if (!otpVerified) { toast.error('Verify phone first'); return; }
    if (!formData.name || !formData.phone || !formData.district || !formData.area || !formData.address) { toast.error('Fill all fields'); return; }
    setLoading(true);
    try {
      const orderData = {
        items: items.map(item => ({ product_id: item.productId, name: item.name, image: item.image, price: item.price, quantity: item.quantity, variant: item.variant })),
        shipping_address: { name: formData.name, phone: formData.phone, email: formData.email, district: formData.district, area: formData.area, address: formData.address },
        customer_phone: formData.phone, subtotal, discount,
        coupon_code: appliedCoupon?.code || null,
        delivery_charge: finalDeliveryCharge, total,
        payment_type: paymentType, payment_method: paymentMethod,
        advance_paid: advanceAmount, cod_amount: codAmount,
        notes: formData.note,
        lead_id: leadId // Link to lead
      };
      const res = await api.post('/orders/guest', orderData);
      
      // Update lead status to converted
      if (leadId) {
        try {
          await api.put(`/leads/${leadId}`, { status: 'converted', order_id: res.data._id || res.data.order_number });
        } catch (e) {}
      }
      
      clearCart();
      setOrderNumber(res.data.order_number);
      setStep(3);
    } catch (error) {
      toast.error('Order failed');
    } finally {
      setLoading(false);
    }
  };

  const copyOrder = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!mounted) return <LoadingFallback />;
  if (items.length === 0 && step !== 3) { router.push('/cart'); return null; }

  // Input styles
  const inputStyle = {
    width: '100%',
    height: 50,
    padding: '0 16px',
    backgroundColor: '#FFF',
    border: '1px solid #E5E5E5',
    borderRadius: 12,
    fontSize: 15,
    color: '#1a1a1a',
    outline: 'none',
    boxSizing: 'border-box'
  };

  // ====================== MOBILE ======================
  if (isMobile) {
    return (
      <div style={{ backgroundColor: '#FFF', minHeight: '100vh' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #F0F0F0' }}>
          <Link href="/" style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', textDecoration: 'none', letterSpacing: 2 }}>PRISMIN</Link>
          <Link href="/cart"><ShoppingCart size={22} style={{ color: '#1a1a1a' }} /></Link>
        </div>

        {/* Progress Steps */}
        {step < 3 && (
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F0F0F0', backgroundColor: '#FAFAFA' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#B08B5C', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>1</div>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>Address</span>
              </div>
              <div style={{ width: 40, height: 2, backgroundColor: step >= 2 ? '#B08B5C' : '#E0E0E0', margin: '0 12px' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: step >= 2 ? '#B08B5C' : '#E0E0E0', color: step >= 2 ? '#FFF' : '#999', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>2</div>
                <span style={{ fontSize: 13, fontWeight: 500, color: step >= 2 ? '#1a1a1a' : '#999' }}>Payment</span>
              </div>
              <div style={{ width: 40, height: 2, backgroundColor: step >= 3 ? '#B08B5C' : '#E0E0E0', margin: '0 12px' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: step >= 3 ? '#B08B5C' : '#E0E0E0', color: step >= 3 ? '#FFF' : '#999', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>3</div>
                <span style={{ fontSize: 13, fontWeight: 500, color: step >= 3 ? '#1a1a1a' : '#999' }}>Done</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: ADDRESS */}
        {step === 1 && (
          <>
            <div style={{ padding: '24px 20px', paddingBottom: 100 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 14 }}>Receiver Details</p>
              
              {/* Phone */}
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone Number" disabled={otpVerified} style={{ ...inputStyle, paddingRight: 75, backgroundColor: otpVerified ? '#F0FFF4' : '#FFF', borderColor: otpVerified ? '#86EFAC' : '#E5E5E5' }} />
                {otpVerified ? (
                  <CheckCircle size={20} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: '#22C55E' }} />
                ) : (
                  <button onClick={sendOtp} disabled={otpSending} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', padding: '8px 14px', backgroundColor: '#1a1a1a', color: '#FFF', fontSize: 12, fontWeight: 600, border: 'none', borderRadius: 8, cursor: 'pointer' }}>{otpSending ? '...' : 'Verify'}</button>
                )}
              </div>

              <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Receiver's Name" style={{ ...inputStyle, marginBottom: 12 }} />
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email (optional)" style={{ ...inputStyle, marginBottom: 28 }} />

              <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 14 }}>Delivery Address</p>

              <div onClick={() => { setShowLocationModal(true); setLocationStep('district'); setLocationSearch(''); }} style={{ ...inputStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: 12 }}>
                <span style={{ color: formData.district ? '#1a1a1a' : '#999' }}>{formData.district && formData.area ? `${formData.district} › ${formData.area}` : 'District & Area'}</span>
                <MapPin size={18} style={{ color: '#B08B5C' }} />
              </div>

              <textarea name="address" value={formData.address} onChange={handleInputChange} placeholder="Enter full address" rows={2} style={{ ...inputStyle, height: 'auto', padding: '14px 16px', resize: 'none', lineHeight: 1.5, marginBottom: 12 }} />
              <input type="text" name="note" value={formData.note} onChange={handleInputChange} placeholder="Delivery note (optional)" style={inputStyle} />
            </div>

            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 20px', backgroundColor: '#FFF', borderTop: '1px solid #F0F0F0' }}>
              <button onClick={() => canProceed() ? setStep(2) : toast.error('Fill all fields & verify phone')} style={{ width: '100%', height: 52, backgroundColor: canProceed() ? '#B08B5C' : '#E5E5E5', color: '#FFF', fontSize: 15, fontWeight: 600, border: 'none', borderRadius: 26, cursor: canProceed() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                Payment <ChevronRight size={18} />
              </button>
            </div>
          </>
        )}

        {/* STEP 2: PAYMENT */}
        {step === 2 && (
          <>
            <div style={{ padding: '24px 20px', paddingBottom: 140 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 14 }}>Payment Type</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                <button onClick={() => setPaymentType('partial')} style={{ padding: 16, backgroundColor: paymentType === 'partial' ? '#FFF9F5' : '#FFF', border: paymentType === 'partial' ? '2px solid #B08B5C' : '1px solid #E5E5E5', borderRadius: 12, cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>Cash on Delivery</span>{paymentType === 'partial' && <CheckCircle size={18} style={{ color: '#B08B5C' }} />}</div>
                  <p style={{ fontSize: 12, color: '#666', margin: 0 }}>৳{deliveryCharge} advance</p>
                </button>
                <button onClick={() => setPaymentType('full')} style={{ padding: 16, backgroundColor: paymentType === 'full' ? '#FFF9F5' : '#FFF', border: paymentType === 'full' ? '2px solid #B08B5C' : '1px solid #E5E5E5', borderRadius: 12, cursor: 'pointer', textAlign: 'left', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: -8, right: 8, padding: '3px 8px', backgroundColor: '#22C55E', color: '#FFF', fontSize: 9, fontWeight: 600, borderRadius: 4 }}>FREE DELIVERY</span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>Full Payment</span>{paymentType === 'full' && <CheckCircle size={18} style={{ color: '#B08B5C' }} />}</div>
                  <p style={{ fontSize: 12, color: '#666', margin: 0 }}>৳{(subtotal - discount).toLocaleString()}</p>
                </button>
              </div>

              <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 14 }}>Payment Method</p>
              <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                {[{ id: 'bkash', name: 'bKash', color: '#E2136E', bg: '#FFF0F6' }, { id: 'nagad', name: 'Nagad', color: '#F6921E', bg: '#FFF8F0' }].map(m => (
                  <button key={m.id} onClick={() => setPaymentMethod(m.id)} style={{ flex: 1, padding: 14, backgroundColor: paymentMethod === m.id ? m.bg : '#FFF', border: paymentMethod === m.id ? `2px solid ${m.color}` : '1px solid #E5E5E5', borderRadius: 12, cursor: 'pointer' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: m.color }}>{m.name}</span>
                  </button>
                ))}
              </div>

              <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 14 }}>Promo Code</p>
              {appliedCoupon ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', backgroundColor: '#F0FFF4', borderRadius: 12, border: '1px solid #86EFAC', marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Tag size={16} style={{ color: '#22C55E' }} /><span style={{ fontSize: 14, fontWeight: 600, color: '#22C55E' }}>{appliedCoupon.code}</span><span style={{ fontSize: 13, color: '#666' }}>-৳{discount}</span></div>
                  <button onClick={() => { setAppliedCoupon(null); setDiscount(0); setCouponCode(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} style={{ color: '#EF4444' }} /></button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
                  <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Enter code" style={{ ...inputStyle, flex: 1 }} />
                  <button onClick={handleApplyCoupon} disabled={couponLoading} style={{ padding: '0 20px', height: 50, backgroundColor: '#1a1a1a', color: '#FFF', fontSize: 14, fontWeight: 600, border: 'none', borderRadius: 12, cursor: 'pointer' }}>{couponLoading ? '...' : 'Apply'}</button>
                </div>
              )}

              <div style={{ borderTop: '1px solid #F0F0F0', paddingTop: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}><span style={{ fontSize: 14, color: '#666' }}>Subtotal</span><span style={{ fontSize: 14, color: '#1a1a1a' }}>৳{subtotal.toLocaleString()}</span></div>
                {discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}><span style={{ fontSize: 14, color: '#22C55E' }}>Discount</span><span style={{ fontSize: 14, color: '#22C55E' }}>-৳{discount}</span></div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}><span style={{ fontSize: 14, color: '#666' }}>Delivery</span><span style={{ fontSize: 14, color: paymentType === 'full' ? '#22C55E' : '#1a1a1a' }}>{paymentType === 'full' ? 'Free' : '৳' + deliveryCharge}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid #F0F0F0' }}><span style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a' }}>Total</span><span style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a' }}>৳{total.toLocaleString()}</span></div>
              </div>
            </div>

            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 20px', backgroundColor: '#FFF', borderTop: '1px solid #F0F0F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}><span style={{ fontSize: 14, color: '#666' }}>Pay Now</span><span style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a' }}>৳{advanceAmount.toLocaleString()}</span></div>
              <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', height: 52, backgroundColor: '#B08B5C', color: '#FFF', fontSize: 15, fontWeight: 600, border: 'none', borderRadius: 26, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {loading ? 'Processing...' : 'Place Order'} <ChevronRight size={18} />
              </button>
            </div>
          </>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 3 && (
          <div style={{ padding: '60px 24px', textAlign: 'center', minHeight: 'calc(100vh - 60px)' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: '#F0FFF4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <CheckCircle size={40} style={{ color: '#22C55E' }} />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 600, color: '#1a1a1a', marginBottom: 8 }}>Successful!</h1>
            <p style={{ fontSize: 15, color: '#666', marginBottom: 8 }}>Your order number is <span style={{ color: '#B08B5C', fontWeight: 600 }}>#{orderNumber}</span></p>
            <p style={{ fontSize: 14, color: '#888', marginBottom: 40 }}>You will receive the order<br/>confirmation call shortly.</p>
            <p style={{ fontSize: 15, color: '#1a1a1a', marginBottom: 40 }}>Thank you for shopping with us</p>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', maxWidth: 300, height: 52, backgroundColor: '#B08B5C', color: '#FFF', fontSize: 15, fontWeight: 600, border: 'none', borderRadius: 26, textDecoration: 'none' }}>Continue Shopping</Link>
          </div>
        )}

        {/* OTP Modal */}
        {showOtpModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end' }}>
            <div style={{ backgroundColor: '#FFF', borderRadius: '20px 20px 0 0', padding: '28px 24px 40px', width: '100%', textAlign: 'center' }}>
              <div style={{ width: 40, height: 4, backgroundColor: '#E5E5E5', borderRadius: 2, margin: '0 auto 24px' }} />
              <div style={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: '#FFF5EB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><Phone size={26} style={{ color: '#B08B5C' }} /></div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1a1a1a', marginBottom: 6 }}>Verify Phone</h3>
              <p style={{ fontSize: 14, color: '#666', marginBottom: 24 }}>Enter 6-digit code sent to <strong>{formData.phone}</strong></p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
                {otpValues.map((val, i) => (
                  <input key={i} ref={el => otpRefs.current[i] = el} type="text" inputMode="numeric" maxLength={1} value={val} onChange={(e) => handleOtpChange(i, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(i, e)} style={{ width: 48, height: 54, textAlign: 'center', fontSize: 22, fontWeight: 600, border: `2px solid ${val ? '#B08B5C' : '#E5E5E5'}`, borderRadius: 12, outline: 'none', backgroundColor: val ? '#FFF9F5' : '#FFF' }} />
                ))}
              </div>
              <button onClick={verifyOtp} disabled={loading} style={{ width: '100%', height: 52, backgroundColor: '#B08B5C', color: '#FFF', fontSize: 15, fontWeight: 600, border: 'none', borderRadius: 26, cursor: 'pointer', marginBottom: 16 }}>{loading ? 'Verifying...' : 'Verify'}</button>
              <p style={{ fontSize: 14, color: '#666' }}>{otpTimer > 0 ? `Resend in ${otpTimer}s` : <button onClick={sendOtp} style={{ background: 'none', border: 'none', color: '#B08B5C', fontWeight: 600, cursor: 'pointer' }}>Resend OTP</button>}</p>
            </div>
          </div>
        )}

        {/* Location Modal */}
        {showLocationModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: '#FFF' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => locationStep === 'area' ? (setLocationStep('district'), setLocationSearch('')) : setShowLocationModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><ChevronLeft size={24} /></button>
              <span style={{ flex: 1, fontSize: 17, fontWeight: 600, color: '#1a1a1a' }}>{locationStep === 'district' ? 'Select District' : 'Select Area'}</span>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                <input value={locationSearch} onChange={(e) => setLocationSearch(e.target.value)} placeholder="Search..." style={{ ...inputStyle, paddingLeft: 44 }} autoFocus />
              </div>
            </div>
            <div style={{ height: 'calc(100vh - 140px)', overflowY: 'auto' }}>
              {locationStep === 'district' ? districts.filter(d => d.name.toLowerCase().includes(locationSearch.toLowerCase())).map(d => (
                <div key={d.id} onClick={() => selectDistrict(d)} style={{ padding: '16px 20px', borderBottom: '1px solid #F8F8F8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontSize: 15, color: '#1a1a1a' }}>{d.name}</span><ChevronRight size={18} style={{ color: '#CCC' }} /></div>
              )) : availableAreas.filter(a => a.name.toLowerCase().includes(locationSearch.toLowerCase())).map(a => (
                <div key={a.id} onClick={() => selectArea(a)} style={{ padding: '16px 20px', borderBottom: '1px solid #F8F8F8' }}><span style={{ fontSize: 15, color: '#1a1a1a' }}>{a.name}</span></div>
              ))}
            </div>
          </div>
        )}

        <style jsx global>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ====================== DESKTOP - SINGLE PAGE ======================
  return (
    <div style={{ backgroundColor: '#F5F5F5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#FFF', borderBottom: '1px solid #E5E5E5', padding: '20px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', textDecoration: 'none', letterSpacing: 3 }}>PRISMIN</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#22C55E' }}><Lock size={16} /><span style={{ fontSize: 13, fontWeight: 500 }}>Secure Checkout</span></div>
        </div>
      </div>

      {/* Main */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: '#1a1a1a', marginBottom: 32, textAlign: 'center' }}>Checkout</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 40 }}>
          {/* Left */}
          <div>
            {/* Contact */}
            <div style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 32, marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1a1a1a', marginBottom: 24 }}>Contact Information</h2>
              
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#333', marginBottom: 8 }}>Phone Number *</label>
                <div style={{ position: 'relative' }}>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="01XXXXXXXXX" disabled={otpVerified} style={{ width: '100%', height: 52, padding: '0 110px 0 16px', backgroundColor: otpVerified ? '#F0FFF4' : '#FFF', border: `1px solid ${otpVerified ? '#86EFAC' : '#E0E0E0'}`, borderRadius: 8, fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
                  {otpVerified ? (
                    <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 6, color: '#22C55E' }}><CheckCircle size={18} /><span style={{ fontSize: 13, fontWeight: 500 }}>Verified</span></div>
                  ) : (
                    <button onClick={sendOtp} disabled={otpSending} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', padding: '10px 16px', backgroundColor: '#1a1a1a', color: '#FFF', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 6, cursor: 'pointer' }}>{otpSending ? 'Sending...' : 'Send OTP'}</button>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#333', marginBottom: 8 }}>Full Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter your name" style={{ width: '100%', height: 52, padding: '0 16px', backgroundColor: '#FFF', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#333', marginBottom: 8 }}>Email (Optional)</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Enter your email" style={{ width: '100%', height: 52, padding: '0 16px', backgroundColor: '#FFF', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
            </div>

            {/* Shipping */}
            <div style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 32, marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1a1a1a', marginBottom: 24 }}>Shipping Address</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#333', marginBottom: 8 }}>District & Area *</label>
                  <div onClick={() => { setShowLocationModal(true); setLocationStep('district'); setLocationSearch(''); }} style={{ width: '100%', height: 52, padding: '0 16px', backgroundColor: '#FFF', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxSizing: 'border-box' }}>
                    <span style={{ color: formData.district ? '#1a1a1a' : '#999' }}>{formData.district && formData.area ? `${formData.district} › ${formData.area}` : 'Select location'}</span>
                    <MapPin size={18} style={{ color: '#B08B5C' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#333', marginBottom: 8 }}>Street Address *</label>
                  <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="House, road, building" style={{ width: '100%', height: 52, padding: '0 16px', backgroundColor: '#FFF', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#333', marginBottom: 8 }}>Delivery Note (Optional)</label>
                <input type="text" name="note" value={formData.note} onChange={handleInputChange} placeholder="Any special instructions" style={{ width: '100%', height: 52, padding: '0 16px', backgroundColor: '#FFF', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            {/* Payment */}
            <div style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 32 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1a1a1a', marginBottom: 24 }}>Payment Method</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <button onClick={() => setPaymentType('partial')} style={{ padding: 20, backgroundColor: paymentType === 'partial' ? '#FFF9F5' : '#FFF', border: paymentType === 'partial' ? '2px solid #B08B5C' : '1px solid #E0E0E0', borderRadius: 10, cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>Cash on Delivery</span>{paymentType === 'partial' && <CheckCircle size={20} style={{ color: '#B08B5C' }} />}</div>
                  <p style={{ fontSize: 13, color: '#666', margin: 0 }}>Pay ৳{deliveryCharge} advance, rest on delivery</p>
                </button>
                <button onClick={() => setPaymentType('full')} style={{ padding: 20, backgroundColor: paymentType === 'full' ? '#FFF9F5' : '#FFF', border: paymentType === 'full' ? '2px solid #B08B5C' : '1px solid #E0E0E0', borderRadius: 10, cursor: 'pointer', textAlign: 'left', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: -10, right: 12, padding: '4px 10px', backgroundColor: '#22C55E', color: '#FFF', fontSize: 11, fontWeight: 600, borderRadius: 4 }}>FREE DELIVERY</span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>Full Payment</span>{paymentType === 'full' && <CheckCircle size={20} style={{ color: '#B08B5C' }} />}</div>
                  <p style={{ fontSize: 13, color: '#666', margin: 0 }}>Pay full amount now</p>
                </button>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                {[{ id: 'bkash', name: 'bKash', color: '#E2136E', bg: '#FFF0F6' }, { id: 'nagad', name: 'Nagad', color: '#F6921E', bg: '#FFF8F0' }].map(m => (
                  <button key={m.id} onClick={() => setPaymentMethod(m.id)} style={{ flex: 1, padding: 16, backgroundColor: paymentMethod === m.id ? m.bg : '#FFF', border: paymentMethod === m.id ? `2px solid ${m.color}` : '1px solid #E0E0E0', borderRadius: 10, cursor: 'pointer' }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: m.color }}>{m.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Summary */}
          <div>
            <div style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 32, position: 'sticky', top: 40 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1a1a1a', marginBottom: 24 }}>Order Summary</h2>
              
              <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 24 }}>
                {items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 8, backgroundColor: '#F5F5F5', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                      {item.image ? <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} /> : <Package size={24} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: '#CCC' }} />}
                      <span style={{ position: 'absolute', top: -6, right: -6, width: 22, height: 22, backgroundColor: '#B08B5C', color: '#FFF', fontSize: 11, fontWeight: 600, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.quantity}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', margin: 0, marginBottom: 4 }}>{item.name}</p>
                      <p style={{ fontSize: 14, color: '#666', margin: 0 }}>৳{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div style={{ paddingBottom: 20, borderBottom: '1px solid #F0F0F0', marginBottom: 20 }}>
                {appliedCoupon ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#F0FFF4', borderRadius: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Tag size={16} style={{ color: '#22C55E' }} /><span style={{ fontSize: 14, fontWeight: 600, color: '#22C55E' }}>{appliedCoupon.code}</span><span style={{ fontSize: 13, color: '#666' }}>-৳{discount}</span></div>
                    <button onClick={() => { setAppliedCoupon(null); setDiscount(0); setCouponCode(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} style={{ color: '#EF4444' }} /></button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Discount code" style={{ flex: 1, height: 48, padding: '0 16px', backgroundColor: '#FFF', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                    <button onClick={handleApplyCoupon} disabled={couponLoading} style={{ padding: '0 20px', height: 48, backgroundColor: '#1a1a1a', color: '#FFF', fontSize: 14, fontWeight: 600, border: 'none', borderRadius: 8, cursor: 'pointer' }}>{couponLoading ? '...' : 'Apply'}</button>
                  </div>
                )}
              </div>

              {/* Pricing */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}><span style={{ fontSize: 14, color: '#666' }}>Subtotal</span><span style={{ fontSize: 14, color: '#1a1a1a' }}>৳{subtotal.toLocaleString()}</span></div>
                {discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}><span style={{ fontSize: 14, color: '#22C55E' }}>Discount</span><span style={{ fontSize: 14, color: '#22C55E' }}>-৳{discount}</span></div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}><span style={{ fontSize: 14, color: '#666' }}>Shipping</span><span style={{ fontSize: 14, color: paymentType === 'full' ? '#22C55E' : '#1a1a1a' }}>{paymentType === 'full' ? 'Free' : '৳' + deliveryCharge}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid #F0F0F0' }}><span style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a' }}>Total</span><span style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a' }}>৳{total.toLocaleString()}</span></div>
              </div>

              {/* Pay Info */}
              <div style={{ backgroundColor: '#F8F8F8', borderRadius: 8, padding: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ fontSize: 14, color: '#666' }}>Pay Now ({paymentMethod})</span><span style={{ fontSize: 16, fontWeight: 700, color: '#B08B5C' }}>৳{advanceAmount.toLocaleString()}</span></div>
                {paymentType === 'partial' && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 13, color: '#888' }}>Pay on Delivery</span><span style={{ fontSize: 13, color: '#1a1a1a' }}>৳{codAmount.toLocaleString()}</span></div>}
              </div>

              {/* Submit */}
              <button onClick={handleSubmit} disabled={loading || !otpVerified} style={{ width: '100%', height: 56, backgroundColor: otpVerified ? '#B08B5C' : '#E0E0E0', color: '#FFF', fontSize: 16, fontWeight: 600, border: 'none', borderRadius: 8, cursor: (loading || !otpVerified) ? 'not-allowed' : 'pointer', marginBottom: 16 }}>
                {loading ? 'Processing...' : (otpVerified ? `Pay ৳${advanceAmount.toLocaleString()} & Place Order` : 'Verify Phone to Continue')}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Shield size={16} style={{ color: '#22C55E' }} /><span style={{ fontSize: 13, color: '#888' }}>Your payment is secure and encrypted</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop OTP Modal */}
      {showOtpModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 40, width: 420, textAlign: 'center', position: 'relative' }}>
            <button onClick={() => setShowOtpModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer' }}><X size={22} style={{ color: '#999' }} /></button>
            <div style={{ width: 70, height: 70, borderRadius: '50%', backgroundColor: '#FFF5EB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}><Phone size={32} style={{ color: '#B08B5C' }} /></div>
            <h3 style={{ fontSize: 22, fontWeight: 600, color: '#1a1a1a', marginBottom: 8 }}>Verify Your Phone</h3>
            <p style={{ fontSize: 15, color: '#666', marginBottom: 32 }}>Enter the 6-digit code sent to<br /><strong>{formData.phone}</strong></p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 32 }}>
              {otpValues.map((val, i) => (
                <input key={i} ref={el => otpRefs.current[i] = el} type="text" inputMode="numeric" maxLength={1} value={val} onChange={(e) => handleOtpChange(i, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(i, e)} style={{ width: 52, height: 60, textAlign: 'center', fontSize: 24, fontWeight: 600, border: `2px solid ${val ? '#B08B5C' : '#E0E0E0'}`, borderRadius: 10, outline: 'none', backgroundColor: val ? '#FFF9F5' : '#FFF' }} />
              ))}
            </div>
            <button onClick={verifyOtp} disabled={loading} style={{ width: '100%', height: 54, backgroundColor: '#B08B5C', color: '#FFF', fontSize: 16, fontWeight: 600, border: 'none', borderRadius: 8, cursor: 'pointer', marginBottom: 20 }}>{loading ? 'Verifying...' : 'Verify & Continue'}</button>
            <p style={{ fontSize: 14, color: '#666' }}>{otpTimer > 0 ? `Resend code in ${otpTimer}s` : <button onClick={sendOtp} style={{ background: 'none', border: 'none', color: '#B08B5C', fontWeight: 600, cursor: 'pointer' }}>Resend OTP</button>}</p>
          </div>
        </div>
      )}

      {/* Desktop Location Modal */}
      {showLocationModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#FFF', borderRadius: 12, width: 480, maxHeight: '70vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: 14 }}>
              {locationStep === 'area' && <button onClick={() => { setLocationStep('district'); setLocationSearch(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><ChevronLeft size={22} /></button>}
              <span style={{ flex: 1, fontSize: 18, fontWeight: 600, color: '#1a1a1a' }}>{locationStep === 'district' ? 'Select District' : 'Select Area'}</span>
              <button onClick={() => setShowLocationModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={22} /></button>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ position: 'relative' }}>
                <Search size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                <input value={locationSearch} onChange={(e) => setLocationSearch(e.target.value)} placeholder="Search..." style={{ width: '100%', height: 52, padding: '0 16px 0 48px', backgroundColor: '#FFF', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 15, outline: 'none', boxSizing: 'border-box' }} autoFocus />
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {locationStep === 'district' ? districts.filter(d => d.name.toLowerCase().includes(locationSearch.toLowerCase())).map(d => (
                <div key={d.id} onClick={() => selectDistrict(d)} style={{ padding: '16px 24px', borderBottom: '1px solid #F8F8F8', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontSize: 15, color: '#1a1a1a' }}>{d.name}</span><ChevronRight size={18} style={{ color: '#CCC' }} /></div>
              )) : availableAreas.filter(a => a.name.toLowerCase().includes(locationSearch.toLowerCase())).map(a => (
                <div key={a.id} onClick={() => selectArea(a)} style={{ padding: '16px 24px', borderBottom: '1px solid #F8F8F8', cursor: 'pointer' }}><span style={{ fontSize: 15, color: '#1a1a1a' }}>{a.name}</span></div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function CheckoutPage() {
  return <Suspense fallback={<LoadingFallback />}><CheckoutContent /></Suspense>;
}
