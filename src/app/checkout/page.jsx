'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Package, CheckCircle, Tag, X, Search, MapPin, Phone, Shield, ShoppingBag } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import { districts } from '@/data/bangladesh-locations';
import api from '@/lib/api';
import toast from 'react-hot-toast';

function LoadingFallback() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #F3F4F6', borderTopColor: '#B08B5C', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
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
  
  // Mobile Steps
  const [mobileStep, setMobileStep] = useState(1);
  
  // Form
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', district: '', area: '', address: '', note: '' });
  
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
    if (!formData.phone || formData.phone.length < 11) {
      toast.error('Enter valid phone number');
      return;
    }
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
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
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
      toast.success('Coupon applied!');
    } catch {
      toast.error('Invalid coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const subtotal = getSubtotal();
  const finalDeliveryCharge = paymentType === 'full' ? 0 : deliveryCharge;
  const total = subtotal - discount + finalDeliveryCharge;
  const advanceAmount = paymentType === 'full' ? (subtotal - discount) : deliveryCharge;
  const codAmount = paymentType === 'full' ? 0 : (subtotal - discount);

  const canProceed = () => formData.name && formData.phone && formData.district && formData.area && formData.address && otpVerified;

  const handleSubmit = async () => {
    if (!otpVerified) { toast.error('Verify phone first'); return; }
    if (!formData.name || !formData.phone || !formData.district || !formData.area || !formData.address) {
      toast.error('Fill all fields'); return;
    }
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
        notes: formData.note
      };
      const res = await api.post('/orders/guest', orderData);
      clearCart();
      router.push('/order-success?order=' + res.data.order_number);
    } catch (error) {
      toast.error('Order failed');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return <LoadingFallback />;
  if (items.length === 0) { router.push('/cart'); return null; }

  // Styles
  const inputStyle = {
    width: '100%',
    padding: '16px 18px',
    backgroundColor: '#F9FAFB',
    border: '1.5px solid #F0F0F0',
    borderRadius: 14,
    fontSize: 15,
    color: '#1F2937',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease'
  };

  const inputFocusStyle = {
    borderColor: '#B08B5C',
    backgroundColor: '#FFFBF7'
  };

  // ====================== MOBILE 2-STEP ======================
  if (isMobile) {
    return (
      <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          backgroundColor: '#FFFFFF', 
          padding: '16px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid #F3F4F6'
        }}>
          <button onClick={() => mobileStep === 1 ? router.back() : setMobileStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <ChevronLeft size={24} style={{ color: '#1F2937' }} />
          </button>
          <span style={{ fontSize: 17, fontWeight: 600, color: '#1F2937' }}>
            {mobileStep === 1 ? 'Delivery' : 'Payment'}
          </span>
          <div style={{ width: 32 }} />
        </div>

        {/* Progress Indicator */}
        <div style={{ paddingTop: 70, padding: '70px 24px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ 
                width: 32, height: 32, borderRadius: '50%', 
                backgroundColor: '#B08B5C', 
                color: '#FFF', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontSize: 13, fontWeight: 600 
              }}>1</div>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#1F2937' }}>Address</span>
            </div>
            <div style={{ width: 50, height: 2, backgroundColor: mobileStep >= 2 ? '#B08B5C' : '#E5E7EB', borderRadius: 2 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ 
                width: 32, height: 32, borderRadius: '50%', 
                backgroundColor: mobileStep >= 2 ? '#B08B5C' : '#E5E7EB', 
                color: mobileStep >= 2 ? '#FFF' : '#9CA3AF', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontSize: 13, fontWeight: 600 
              }}>2</div>
              <span style={{ fontSize: 13, fontWeight: 500, color: mobileStep >= 2 ? '#1F2937' : '#9CA3AF' }}>Payment</span>
            </div>
          </div>
        </div>

        {/* Step 1: Address */}
        {mobileStep === 1 && (
          <div style={{ padding: '8px 20px 120px' }}>
            {/* Receiver Details */}
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1F2937', marginBottom: 16 }}>Receiver Details</h3>
              
              {/* Phone with OTP */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Phone Number"
                    disabled={otpVerified}
                    style={{ 
                      ...inputStyle, 
                      paddingRight: otpVerified ? 50 : 90,
                      backgroundColor: otpVerified ? '#F0FDF4' : '#F9FAFB',
                      borderColor: otpVerified ? '#86EFAC' : '#F0F0F0'
                    }}
                  />
                  {otpVerified ? (
                    <CheckCircle size={22} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: '#22C55E' }} />
                  ) : (
                    <button
                      onClick={sendOtp}
                      disabled={otpSending}
                      style={{
                        position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                        padding: '10px 14px',
                        backgroundColor: '#1F2937',
                        color: '#FFF',
                        fontSize: 12,
                        fontWeight: 600,
                        border: 'none',
                        borderRadius: 10,
                        cursor: 'pointer'
                      }}
                    >
                      {otpSending ? '...' : 'Verify'}
                    </button>
                  )}
                </div>
              </div>

              {/* Name */}
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Receiver's Name"
                  style={inputStyle}
                  onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                  onBlur={(e) => { e.target.style.borderColor = '#F0F0F0'; e.target.style.backgroundColor = '#F9FAFB'; }}
                />
              </div>
            </div>

            {/* Delivery Address - Pathao Style */}
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1F2937', marginBottom: 16 }}>Delivery Address</h3>
              
              {/* Location Selector */}
              <div 
                onClick={() => { setShowLocationModal(true); setLocationStep('district'); setLocationSearch(''); }}
                style={{
                  ...inputStyle,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  marginBottom: 14
                }}
              >
                {formData.district ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#1F2937' }}>
                    <span>{formData.district}</span>
                    <ChevronRight size={14} style={{ color: '#B08B5C' }} />
                    <span style={{ color: formData.area ? '#1F2937' : '#9CA3AF' }}>{formData.area || 'Area'}</span>
                  </div>
                ) : (
                  <span style={{ color: '#9CA3AF' }}>City › Zone › Area</span>
                )}
                <MapPin size={20} style={{ color: '#B08B5C' }} />
              </div>

              {/* Full Address */}
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter full address"
                rows={3}
                style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => { e.target.style.borderColor = '#F0F0F0'; e.target.style.backgroundColor = '#F9FAFB'; }}
              />
            </div>

            {/* Delivery Note */}
            <div style={{ marginBottom: 20 }}>
              <input
                type="text"
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                placeholder="Delivery note (optional)"
                style={inputStyle}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => { e.target.style.borderColor = '#F0F0F0'; e.target.style.backgroundColor = '#F9FAFB'; }}
              />
            </div>
          </div>
        )}

        {/* Step 2: Payment */}
        {mobileStep === 2 && (
          <div style={{ padding: '8px 20px 180px' }}>
            {/* Order Summary */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1F2937', margin: 0 }}>Order Summary</h3>
                <span style={{ fontSize: 13, color: '#6B7280' }}>{items.length} items</span>
              </div>
              
              <div style={{ backgroundColor: '#F9FAFB', borderRadius: 16, padding: 16 }}>
                {items.slice(0, 2).map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < Math.min(items.length, 2) - 1 ? 12 : 0 }}>
                    <div style={{ width: 50, height: 50, borderRadius: 10, backgroundColor: '#FFF', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                      {item.image ? <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} /> : <Package size={20} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: '#D1D5DB' }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#1F2937', margin: 0 }}>{item.name}</p>
                      <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>৳{item.price.toLocaleString()} × {item.quantity}</p>
                    </div>
                  </div>
                ))}
                {items.length > 2 && (
                  <p style={{ fontSize: 13, color: '#B08B5C', marginTop: 12, textAlign: 'center' }}>+{items.length - 2} more items</p>
                )}
              </div>
            </div>

            {/* Coupon */}
            <div style={{ marginBottom: 24 }}>
              {appliedCoupon ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 14, backgroundColor: '#F0FDF4', borderRadius: 12, border: '1px solid #BBF7D0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Tag size={18} style={{ color: '#22C55E' }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#22C55E' }}>{appliedCoupon.code}</span>
                    <span style={{ fontSize: 13, color: '#6B7280' }}>-৳{discount.toLocaleString()}</span>
                  </div>
                  <button onClick={() => { setAppliedCoupon(null); setDiscount(0); setCouponCode(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} style={{ color: '#EF4444' }} /></button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Promo Code"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                    style={{
                      padding: '16px 20px',
                      backgroundColor: '#1F2937',
                      color: '#FFF',
                      fontSize: 14,
                      fontWeight: 600,
                      border: 'none',
                      borderRadius: 14,
                      cursor: 'pointer'
                    }}
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div style={{ backgroundColor: '#F9FAFB', borderRadius: 16, padding: 18, marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 14, color: '#6B7280' }}>Subtotal</span>
                <span style={{ fontSize: 14, color: '#1F2937' }}>৳{subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 14, color: '#22C55E' }}>Discount</span>
                  <span style={{ fontSize: 14, color: '#22C55E' }}>-৳{discount.toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontSize: 14, color: '#6B7280' }}>Delivery</span>
                <span style={{ fontSize: 14, color: paymentType === 'full' ? '#22C55E' : '#1F2937' }}>{paymentType === 'full' ? 'Free' : '৳' + deliveryCharge}</span>
              </div>
              <div style={{ height: 1, backgroundColor: '#E5E7EB', margin: '14px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: '#1F2937' }}>Total</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#1F2937' }}>৳{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Type */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1F2937', marginBottom: 14 }}>Payment Type</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <button
                  onClick={() => setPaymentType('partial')}
                  style={{
                    padding: 16,
                    backgroundColor: paymentType === 'partial' ? '#FFFBF7' : '#F9FAFB',
                    border: paymentType === 'partial' ? '2px solid #B08B5C' : '1.5px solid #F0F0F0',
                    borderRadius: 14,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#1F2937' }}>COD</span>
                    {paymentType === 'partial' && <CheckCircle size={18} style={{ color: '#B08B5C' }} />}
                  </div>
                  <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>৳{deliveryCharge} advance</p>
                </button>
                <button
                  onClick={() => setPaymentType('full')}
                  style={{
                    padding: 16,
                    backgroundColor: paymentType === 'full' ? '#FFFBF7' : '#F9FAFB',
                    border: paymentType === 'full' ? '2px solid #B08B5C' : '1.5px solid #F0F0F0',
                    borderRadius: 14,
                    cursor: 'pointer',
                    textAlign: 'left',
                    position: 'relative'
                  }}
                >
                  <span style={{ position: 'absolute', top: -8, right: 10, padding: '4px 8px', backgroundColor: '#22C55E', color: '#FFF', fontSize: 9, fontWeight: 600, borderRadius: 6 }}>FREE DELIVERY</span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#1F2937' }}>Full Pay</span>
                    {paymentType === 'full' && <CheckCircle size={18} style={{ color: '#B08B5C' }} />}
                  </div>
                  <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>৳{(subtotal - discount).toLocaleString()}</p>
                </button>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1F2937', marginBottom: 14 }}>Payment Method</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                {[
                  { id: 'bkash', name: 'bKash', color: '#E2136E', bg: '#FDF2F8' },
                  { id: 'nagad', name: 'Nagad', color: '#F6921E', bg: '#FFF7ED' }
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    style={{
                      flex: 1,
                      padding: 16,
                      backgroundColor: paymentMethod === m.id ? m.bg : '#F9FAFB',
                      border: paymentMethod === m.id ? `2px solid ${m.color}` : '1.5px solid #F0F0F0',
                      borderRadius: 14,
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 600, color: m.color }}>{m.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Button */}
        <div style={{ 
          position: 'fixed', bottom: 0, left: 0, right: 0, 
          backgroundColor: '#FFF', 
          padding: '16px 20px', 
          paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
          borderTop: '1px solid #F3F4F6'
        }}>
          {mobileStep === 1 ? (
            <button
              onClick={() => canProceed() ? setMobileStep(2) : toast.error('Fill all fields & verify phone')}
              style={{
                width: '100%',
                padding: '18px',
                backgroundColor: canProceed() ? '#B08B5C' : '#E5E7EB',
                color: '#FFF',
                fontSize: 16,
                fontWeight: 600,
                border: 'none',
                borderRadius: 14,
                cursor: canProceed() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              Payment <ChevronRight size={20} />
            </button>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: '#6B7280' }}>Pay Now</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: '#1F2937' }}>৳{advanceAmount.toLocaleString()}</span>
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '18px',
                  backgroundColor: '#B08B5C',
                  color: '#FFF',
                  fontSize: 16,
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: 14,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                {loading ? 'Processing...' : 'Place Order'} <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {/* OTP Modal */}
        {showOtpModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <div style={{ backgroundColor: '#FFF', borderRadius: '24px 24px 0 0', padding: '32px 24px', paddingBottom: 'calc(32px + env(safe-area-inset-bottom))', width: '100%', textAlign: 'center' }}>
              <div style={{ width: 40, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, margin: '0 auto 24px' }} />
              
              <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#FEF3E7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Phone size={28} style={{ color: '#B08B5C' }} />
              </div>
              
              <h3 style={{ fontSize: 20, fontWeight: 600, color: '#1F2937', marginBottom: 8 }}>Verify Phone</h3>
              <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28 }}>Enter 6-digit code sent to <strong>{formData.phone}</strong></p>
              
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 28 }}>
                {otpValues.map((val, i) => (
                  <input
                    key={i}
                    ref={el => otpRefs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={val}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    style={{
                      width: 48,
                      height: 54,
                      textAlign: 'center',
                      fontSize: 22,
                      fontWeight: 600,
                      border: `2px solid ${val ? '#B08B5C' : '#E5E7EB'}`,
                      borderRadius: 12,
                      outline: 'none',
                      backgroundColor: val ? '#FFFBF7' : '#F9FAFB'
                    }}
                  />
                ))}
              </div>

              <button
                onClick={verifyOtp}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '18px',
                  backgroundColor: '#B08B5C',
                  color: '#FFF',
                  fontSize: 16,
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: 14,
                  cursor: 'pointer',
                  marginBottom: 16
                }}
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>

              <p style={{ fontSize: 14, color: '#6B7280' }}>
                {otpTimer > 0 ? `Resend in ${otpTimer}s` : (
                  <button onClick={sendOtp} style={{ background: 'none', border: 'none', color: '#B08B5C', fontWeight: 600, cursor: 'pointer' }}>Resend OTP</button>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Location Modal - Full Screen */}
        {showLocationModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: '#FFF' }}>
            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: 14 }}>
              {locationStep === 'area' ? (
                <button onClick={() => { setLocationStep('district'); setLocationSearch(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <ChevronLeft size={24} />
                </button>
              ) : (
                <button onClick={() => setShowLocationModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <ChevronLeft size={24} />
                </button>
              )}
              <span style={{ flex: 1, fontSize: 17, fontWeight: 600, color: '#1F2937' }}>
                {locationStep === 'district' ? 'Select City' : `Select Area`}
              </span>
            </div>

            {/* Search */}
            <div style={{ padding: 16 }}>
              <div style={{ position: 'relative' }}>
                <Search size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  placeholder={locationStep === 'district' ? 'Search city...' : 'Search area...'}
                  style={{ ...inputStyle, paddingLeft: 48 }}
                  autoFocus
                />
              </div>
            </div>

            {/* List */}
            <div style={{ height: 'calc(100vh - 140px)', overflowY: 'auto' }}>
              {locationStep === 'district' ? (
                districts.filter(d => d.name.toLowerCase().includes(locationSearch.toLowerCase())).map(d => (
                  <div
                    key={d.id}
                    onClick={() => selectDistrict(d)}
                    style={{ padding: '18px 20px', borderBottom: '1px solid #F9FAFB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <span style={{ fontSize: 15, color: '#1F2937' }}>{d.name}</span>
                    <ChevronRight size={18} style={{ color: '#D1D5DB' }} />
                  </div>
                ))
              ) : (
                availableAreas.filter(a => a.name.toLowerCase().includes(locationSearch.toLowerCase())).map(a => (
                  <div
                    key={a.id}
                    onClick={() => selectArea(a)}
                    style={{ padding: '18px 20px', borderBottom: '1px solid #F9FAFB' }}
                  >
                    <span style={{ fontSize: 15, color: '#1F2937' }}>{a.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <style jsx global>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ====================== DESKTOP ======================
  return (
    <div style={{ backgroundColor: '#FAFAFA', minHeight: '100vh', paddingTop: 90, paddingBottom: 60 }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 300, letterSpacing: 5, textAlign: 'center', marginBottom: 40, color: '#1F2937', textTransform: 'uppercase' }}>Checkout</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 28, alignItems: 'start' }}>
          
          {/* Left */}
          <div>
            {/* Contact */}
            <div style={{ backgroundColor: '#FFF', borderRadius: 20, padding: 28, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1F2937', marginBottom: 24 }}>Contact Information</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#6B7280', marginBottom: 8 }}>Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter name" style={inputStyle} onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)} onBlur={(e) => { e.target.style.borderColor = '#F0F0F0'; e.target.style.backgroundColor = '#F9FAFB'; }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#6B7280', marginBottom: 8 }}>Email (Optional)</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email address" style={inputStyle} onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)} onBlur={(e) => { e.target.style.borderColor = '#F0F0F0'; e.target.style.backgroundColor = '#F9FAFB'; }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#6B7280', marginBottom: 8 }}>Phone Number</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="01XXX-XXXXXX" disabled={otpVerified} style={{ ...inputStyle, backgroundColor: otpVerified ? '#F0FDF4' : '#F9FAFB', borderColor: otpVerified ? '#86EFAC' : '#F0F0F0' }} />
                    {otpVerified && <CheckCircle size={20} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: '#22C55E' }} />}
                  </div>
                  {!otpVerified && (
                    <button onClick={sendOtp} disabled={otpSending} style={{ padding: '16px 28px', backgroundColor: '#1F2937', color: '#FFF', fontSize: 14, fontWeight: 600, border: 'none', borderRadius: 14, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      {otpSending ? 'Sending...' : 'Send OTP'}
                    </button>
                  )}
                </div>
                {otpVerified && <p style={{ fontSize: 13, color: '#22C55E', marginTop: 8 }}>✓ Phone verified</p>}
              </div>
            </div>

            {/* Address */}
            <div style={{ backgroundColor: '#FFF', borderRadius: 20, padding: 28, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1F2937', marginBottom: 24 }}>Delivery Address</h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#6B7280', marginBottom: 8 }}>District & Area</label>
                  <div onClick={() => { setShowLocationModal(true); setLocationStep('district'); setLocationSearch(''); }} style={{ ...inputStyle, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {formData.district ? (
                      <span style={{ color: '#1F2937' }}>{formData.district}{formData.area ? ' → ' + formData.area : ''}</span>
                    ) : (
                      <span style={{ color: '#9CA3AF' }}>Select location</span>
                    )}
                    <MapPin size={18} style={{ color: '#B08B5C' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#6B7280', marginBottom: 8 }}>Full Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="House, Road, Landmark..." style={inputStyle} onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)} onBlur={(e) => { e.target.style.borderColor = '#F0F0F0'; e.target.style.backgroundColor = '#F9FAFB'; }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#6B7280', marginBottom: 8 }}>Delivery Note (Optional)</label>
                <input type="text" name="note" value={formData.note} onChange={handleInputChange} placeholder="Special instructions..." style={inputStyle} onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)} onBlur={(e) => { e.target.style.borderColor = '#F0F0F0'; e.target.style.backgroundColor = '#F9FAFB'; }} />
              </div>
            </div>

            {/* Payment */}
            <div style={{ backgroundColor: '#FFF', borderRadius: 20, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1F2937', marginBottom: 24 }}>Payment</h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <button onClick={() => setPaymentType('partial')} style={{ padding: 20, backgroundColor: paymentType === 'partial' ? '#FFFBF7' : '#F9FAFB', border: paymentType === 'partial' ? '2px solid #B08B5C' : '1.5px solid #F0F0F0', borderRadius: 16, cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#1F2937' }}>Cash on Delivery</span>
                    {paymentType === 'partial' && <CheckCircle size={20} style={{ color: '#B08B5C' }} />}
                  </div>
                  <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Pay ৳{deliveryCharge} advance</p>
                </button>
                <button onClick={() => setPaymentType('full')} style={{ padding: 20, backgroundColor: paymentType === 'full' ? '#FFFBF7' : '#F9FAFB', border: paymentType === 'full' ? '2px solid #B08B5C' : '1.5px solid #F0F0F0', borderRadius: 16, cursor: 'pointer', textAlign: 'left', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: -10, right: 14, padding: '5px 10px', backgroundColor: '#22C55E', color: '#FFF', fontSize: 10, fontWeight: 600, borderRadius: 6 }}>FREE DELIVERY</span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#1F2937' }}>Full Payment</span>
                    {paymentType === 'full' && <CheckCircle size={20} style={{ color: '#B08B5C' }} />}
                  </div>
                  <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Pay ৳{(subtotal - discount).toLocaleString()} now</p>
                </button>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#6B7280', marginBottom: 12 }}>Payment Method</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  {[{ id: 'bkash', name: 'bKash', color: '#E2136E', bg: '#FDF2F8' }, { id: 'nagad', name: 'Nagad', color: '#F6921E', bg: '#FFF7ED' }].map(m => (
                    <button key={m.id} onClick={() => setPaymentMethod(m.id)} style={{ flex: 1, padding: 16, backgroundColor: paymentMethod === m.id ? m.bg : '#F9FAFB', border: paymentMethod === m.id ? `2px solid ${m.color}` : '1.5px solid #F0F0F0', borderRadius: 14, cursor: 'pointer' }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: m.color }}>{m.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right - Summary */}
          <div style={{ position: 'sticky', top: 100 }}>
            <div style={{ backgroundColor: '#FFF', borderRadius: 20, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1F2937', marginBottom: 20 }}>Order Summary</h2>

              <div style={{ maxHeight: 180, overflowY: 'auto', marginBottom: 20 }}>
                {items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
                    <div style={{ width: 54, height: 54, borderRadius: 12, backgroundColor: '#F9FAFB', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                      {item.image ? <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} /> : <Package size={20} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: '#D1D5DB' }} />}
                      <span style={{ position: 'absolute', top: -4, right: -4, width: 20, height: 20, backgroundColor: '#B08B5C', color: '#FFF', fontSize: 11, fontWeight: 600, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.quantity}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#1F2937', margin: 0, marginBottom: 4 }}>{item.name}</p>
                      <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>৳{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div style={{ paddingTop: 16, paddingBottom: 16, borderTop: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6', marginBottom: 16 }}>
                {appliedCoupon ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 14, backgroundColor: '#F0FDF4', borderRadius: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Tag size={16} style={{ color: '#22C55E' }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#22C55E' }}>{appliedCoupon.code}</span>
                      <span style={{ fontSize: 13, color: '#6B7280' }}>-৳{discount.toLocaleString()}</span>
                    </div>
                    <button onClick={() => { setAppliedCoupon(null); setDiscount(0); setCouponCode(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} style={{ color: '#EF4444' }} /></button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Promo code" style={{ ...inputStyle, flex: 1, padding: '14px 16px' }} />
                    <button onClick={handleApplyCoupon} disabled={couponLoading} style={{ padding: '14px 20px', backgroundColor: '#1F2937', color: '#FFF', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 12, cursor: 'pointer' }}>{couponLoading ? '...' : 'Apply'}</button>
                  </div>
                )}
              </div>

              {/* Pricing */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}><span style={{ fontSize: 14, color: '#6B7280' }}>Subtotal</span><span style={{ fontSize: 14, color: '#1F2937' }}>৳{subtotal.toLocaleString()}</span></div>
                {discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}><span style={{ fontSize: 14, color: '#22C55E' }}>Discount</span><span style={{ fontSize: 14, color: '#22C55E' }}>-৳{discount.toLocaleString()}</span></div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}><span style={{ fontSize: 14, color: '#6B7280' }}>Delivery</span><span style={{ fontSize: 14, color: paymentType === 'full' ? '#22C55E' : '#1F2937' }}>{paymentType === 'full' ? 'Free' : '৳' + deliveryCharge}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid #F3F4F6' }}><span style={{ fontSize: 16, fontWeight: 600, color: '#1F2937' }}>Total</span><span style={{ fontSize: 20, fontWeight: 700, color: '#1F2937' }}>৳{total.toLocaleString()}</span></div>
              </div>

              {/* Pay Summary */}
              <div style={{ backgroundColor: '#F9FAFB', borderRadius: 14, padding: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: '#6B7280' }}>Pay Now ({paymentMethod})</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#B08B5C' }}>৳{advanceAmount.toLocaleString()}</span>
                </div>
                {paymentType === 'partial' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: '#6B7280' }}>Pay on Delivery</span>
                    <span style={{ fontSize: 13, color: '#1F2937' }}>৳{codAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Submit */}
              <button onClick={handleSubmit} disabled={loading || !otpVerified} style={{ width: '100%', padding: '18px', backgroundColor: otpVerified ? '#B08B5C' : '#E5E7EB', color: '#FFF', fontSize: 15, fontWeight: 600, border: 'none', borderRadius: 14, cursor: (loading || !otpVerified) ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Processing...' : (otpVerified ? 'Pay ৳' + advanceAmount.toLocaleString() + ' & Place Order' : 'Verify Phone First')}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 }}>
                <Shield size={14} style={{ color: '#22C55E' }} />
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>Secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Modal Desktop */}
      {showOtpModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#FFF', borderRadius: 24, padding: 40, width: 400, textAlign: 'center', position: 'relative' }}>
            <button onClick={() => setShowOtpModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer' }}><X size={22} style={{ color: '#9CA3AF' }} /></button>
            
            <div style={{ width: 70, height: 70, borderRadius: '50%', backgroundColor: '#FEF3E7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Phone size={32} style={{ color: '#B08B5C' }} />
            </div>
            
            <h3 style={{ fontSize: 22, fontWeight: 600, color: '#1F2937', marginBottom: 8 }}>Verify Phone</h3>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 32 }}>Enter 6-digit code sent to<br /><strong>{formData.phone}</strong></p>
            
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 32 }}>
              {otpValues.map((val, i) => (
                <input key={i} ref={el => otpRefs.current[i] = el} type="text" inputMode="numeric" maxLength={1} value={val} onChange={(e) => handleOtpChange(i, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(i, e)} style={{ width: 52, height: 58, textAlign: 'center', fontSize: 24, fontWeight: 600, border: `2px solid ${val ? '#B08B5C' : '#E5E7EB'}`, borderRadius: 14, outline: 'none', backgroundColor: val ? '#FFFBF7' : '#F9FAFB' }} />
              ))}
            </div>

            <button onClick={verifyOtp} disabled={loading} style={{ width: '100%', padding: '18px', backgroundColor: '#B08B5C', color: '#FFF', fontSize: 16, fontWeight: 600, border: 'none', borderRadius: 14, cursor: 'pointer', marginBottom: 20 }}>
              {loading ? 'Verifying...' : 'Verify'}
            </button>

            <p style={{ fontSize: 14, color: '#6B7280' }}>
              {otpTimer > 0 ? `Resend in ${otpTimer}s` : <button onClick={sendOtp} style={{ background: 'none', border: 'none', color: '#B08B5C', fontWeight: 600, cursor: 'pointer' }}>Resend OTP</button>}
            </p>
          </div>
        </div>
      )}

      {/* Location Modal Desktop */}
      {showLocationModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#FFF', borderRadius: 20, width: 460, maxHeight: '70vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: 14 }}>
              {locationStep === 'area' && <button onClick={() => { setLocationStep('district'); setLocationSearch(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><ChevronLeft size={22} /></button>}
              <span style={{ flex: 1, fontSize: 17, fontWeight: 600, color: '#1F2937' }}>{locationStep === 'district' ? 'Select District' : 'Select Area'}</span>
              <button onClick={() => setShowLocationModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={22} /></button>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input value={locationSearch} onChange={(e) => setLocationSearch(e.target.value)} placeholder="Search..." style={{ ...inputStyle, paddingLeft: 48 }} autoFocus />
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {locationStep === 'district' ? (
                districts.filter(d => d.name.toLowerCase().includes(locationSearch.toLowerCase())).map(d => (
                  <div key={d.id} onClick={() => selectDistrict(d)} style={{ padding: '16px 24px', borderBottom: '1px solid #F9FAFB', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 15, color: '#1F2937' }}>{d.name}</span>
                    <ChevronRight size={18} style={{ color: '#D1D5DB' }} />
                  </div>
                ))
              ) : (
                availableAreas.filter(a => a.name.toLowerCase().includes(locationSearch.toLowerCase())).map(a => (
                  <div key={a.id} onClick={() => selectArea(a)} style={{ padding: '16px 24px', borderBottom: '1px solid #F9FAFB', cursor: 'pointer' }}>
                    <span style={{ fontSize: 15, color: '#1F2937' }}>{a.name}</span>
                  </div>
                ))
              )}
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
