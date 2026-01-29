'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Package, CheckCircle, Tag, X, Search, MapPin, Phone, Shield, Home, Gift, Copy } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import { districts } from '@/data/bangladesh-locations';
import api from '@/lib/api';
import toast from 'react-hot-toast';

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
  
  // 3 Steps
  const [step, setStep] = useState(1);
  const [orderNumber, setOrderNumber] = useState('');
  const [copied, setCopied] = useState(false);
  
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
        notes: formData.note
      };
      const res = await api.post('/orders/guest', orderData);
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

  // Compact input style - Pathao like
  const inputStyle = {
    width: '100%',
    height: 48,
    padding: '0 16px',
    backgroundColor: '#FAFAFA',
    border: '1px solid #EAEAEA',
    borderRadius: 10,
    fontSize: 14,
    color: '#1a1a1a',
    outline: 'none',
    boxSizing: 'border-box'
  };

  // ====================== MOBILE 3-STEP ======================
  if (isMobile) {
    return (
      <div style={{ backgroundColor: '#FFF', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, backgroundColor: '#FFF', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F5F5F5' }}>
          {step < 3 ? (
            <button onClick={() => step === 1 ? router.back() : setStep(step - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <ChevronLeft size={22} style={{ color: '#1a1a1a' }} />
            </button>
          ) : <div style={{ width: 30 }} />}
          <span style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a' }}>
            {step === 1 ? 'Delivery' : step === 2 ? 'Payment' : 'Confirmed'}
          </span>
          <div style={{ width: 30 }} />
        </div>

        {/* Progress - 3 Steps */}
        {step < 3 && (
          <div style={{ paddingTop: 60, padding: '60px 20px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: '#B08B5C', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>1</div>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#1a1a1a' }}>Address</span>
              </div>
              <div style={{ width: 30, height: 1.5, backgroundColor: step >= 2 ? '#B08B5C' : '#E5E7EB' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: step >= 2 ? '#B08B5C' : '#E5E7EB', color: step >= 2 ? '#FFF' : '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>2</div>
                <span style={{ fontSize: 12, fontWeight: 500, color: step >= 2 ? '#1a1a1a' : '#9CA3AF' }}>Payment</span>
              </div>
              <div style={{ width: 30, height: 1.5, backgroundColor: step >= 3 ? '#B08B5C' : '#E5E7EB' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: step >= 3 ? '#B08B5C' : '#E5E7EB', color: step >= 3 ? '#FFF' : '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>3</div>
                <span style={{ fontSize: 12, fontWeight: 500, color: step >= 3 ? '#1a1a1a' : '#9CA3AF' }}>Done</span>
              </div>
            </div>
          </div>
        )}

        {/* ===== STEP 1: ADDRESS ===== */}
        {step === 1 && (
          <div style={{ padding: '8px 20px 100px' }}>
            {/* Receiver Details */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 12 }}>Receiver Details</h3>
              
              {/* Phone */}
              <div style={{ position: 'relative', marginBottom: 10 }}>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone Number"
                  disabled={otpVerified}
                  style={{ ...inputStyle, paddingRight: 70, backgroundColor: otpVerified ? '#F0FDF4' : '#FAFAFA', borderColor: otpVerified ? '#86EFAC' : '#EAEAEA' }}
                />
                {otpVerified ? (
                  <CheckCircle size={18} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#22C55E' }} />
                ) : (
                  <button onClick={sendOtp} disabled={otpSending} style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', padding: '8px 12px', backgroundColor: '#1a1a1a', color: '#FFF', fontSize: 11, fontWeight: 600, border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                    {otpSending ? '...' : 'Verify'}
                  </button>
                )}
              </div>

              {/* Name */}
              <div style={{ marginBottom: 10 }}>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Receiver's Name" style={inputStyle} />
              </div>

              {/* Email */}
              <div>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email (optional)" style={inputStyle} />
              </div>
            </div>

            {/* Delivery Address */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 12 }}>Delivery Address</h3>
              
              {/* District & Area - Pathao Style */}
              <div onClick={() => { setShowLocationModal(true); setLocationStep('district'); setLocationSearch(''); }} style={{ ...inputStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: 10, height: 48 }}>
                <span style={{ color: formData.district ? '#1a1a1a' : '#9CA3AF', fontSize: 14 }}>
                  {formData.district && formData.area ? `${formData.district} › ${formData.area}` : 'District & Area'}
                </span>
                <MapPin size={18} style={{ color: '#B08B5C' }} />
              </div>

              {/* Full Address */}
              <div style={{ marginBottom: 10 }}>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter full address"
                  rows={2}
                  style={{ ...inputStyle, height: 'auto', padding: '12px 16px', resize: 'none', lineHeight: 1.4 }}
                />
              </div>

              {/* Delivery Note */}
              <div>
                <input type="text" name="note" value={formData.note} onChange={handleInputChange} placeholder="Delivery note (optional)" style={inputStyle} />
              </div>
            </div>
          </div>
        )}

        {/* ===== STEP 2: PAYMENT ===== */}
        {step === 2 && (
          <div style={{ padding: '8px 20px 160px' }}>
            {/* Order Summary */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>Order Summary</h3>
                <span style={{ fontSize: 12, color: '#6B7280' }}>{items.length} items</span>
              </div>
              <div style={{ backgroundColor: '#FAFAFA', borderRadius: 10, padding: 12 }}>
                {items.slice(0, 2).map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < 1 && items.length > 1 ? 10 : 0 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 8, backgroundColor: '#FFF', overflow: 'hidden', position: 'relative', flexShrink: 0, border: '1px solid #EAEAEA' }}>
                      {item.image ? <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} /> : <Package size={16} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: '#D1D5DB' }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                      <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>৳{item.price} × {item.quantity}</p>
                    </div>
                  </div>
                ))}
                {items.length > 2 && <p style={{ fontSize: 12, color: '#B08B5C', marginTop: 8, textAlign: 'center' }}>+{items.length - 2} more</p>}
              </div>
            </div>

            {/* Coupon */}
            <div style={{ marginBottom: 20 }}>
              {appliedCoupon ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: '#F0FDF4', borderRadius: 8, border: '1px solid #BBF7D0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Tag size={14} style={{ color: '#22C55E' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#22C55E' }}>{appliedCoupon.code}</span>
                    <span style={{ fontSize: 12, color: '#6B7280' }}>-৳{discount}</span>
                  </div>
                  <button onClick={() => { setAppliedCoupon(null); setDiscount(0); setCouponCode(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}><X size={16} style={{ color: '#EF4444' }} /></button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Promo Code" style={{ ...inputStyle, flex: 1 }} />
                  <button onClick={handleApplyCoupon} disabled={couponLoading} style={{ padding: '0 16px', height: 48, backgroundColor: '#1a1a1a', color: '#FFF', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 10, cursor: 'pointer' }}>{couponLoading ? '...' : 'Apply'}</button>
                </div>
              )}
            </div>

            {/* Pricing */}
            <div style={{ backgroundColor: '#FAFAFA', borderRadius: 10, padding: 14, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ fontSize: 13, color: '#6B7280' }}>Subtotal</span><span style={{ fontSize: 13, color: '#1a1a1a' }}>৳{subtotal.toLocaleString()}</span></div>
              {discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ fontSize: 13, color: '#22C55E' }}>Discount</span><span style={{ fontSize: 13, color: '#22C55E' }}>-৳{discount}</span></div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}><span style={{ fontSize: 13, color: '#6B7280' }}>Delivery</span><span style={{ fontSize: 13, color: paymentType === 'full' ? '#22C55E' : '#1a1a1a' }}>{paymentType === 'full' ? 'Free' : '৳' + deliveryCharge}</span></div>
              <div style={{ height: 1, backgroundColor: '#E5E7EB', margin: '10px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>Total</span><span style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>৳{total.toLocaleString()}</span></div>
            </div>

            {/* Payment Type */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 10 }}>Payment Type</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button onClick={() => setPaymentType('partial')} style={{ padding: 12, backgroundColor: paymentType === 'partial' ? '#FEF7F0' : '#FAFAFA', border: paymentType === 'partial' ? '1.5px solid #B08B5C' : '1px solid #EAEAEA', borderRadius: 10, cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>COD</span>
                    {paymentType === 'partial' && <CheckCircle size={16} style={{ color: '#B08B5C' }} />}
                  </div>
                  <p style={{ fontSize: 11, color: '#6B7280', margin: 0 }}>৳{deliveryCharge} advance</p>
                </button>
                <button onClick={() => setPaymentType('full')} style={{ padding: 12, backgroundColor: paymentType === 'full' ? '#FEF7F0' : '#FAFAFA', border: paymentType === 'full' ? '1.5px solid #B08B5C' : '1px solid #EAEAEA', borderRadius: 10, cursor: 'pointer', textAlign: 'left', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: -6, right: 8, padding: '2px 6px', backgroundColor: '#22C55E', color: '#FFF', fontSize: 8, fontWeight: 600, borderRadius: 4 }}>FREE DELIVERY</span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>Full Pay</span>
                    {paymentType === 'full' && <CheckCircle size={16} style={{ color: '#B08B5C' }} />}
                  </div>
                  <p style={{ fontSize: 11, color: '#6B7280', margin: 0 }}>৳{(subtotal - discount).toLocaleString()}</p>
                </button>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 10 }}>Payment Method</h3>
              <div style={{ display: 'flex', gap: 10 }}>
                {[{ id: 'bkash', name: 'bKash', color: '#E2136E' }, { id: 'nagad', name: 'Nagad', color: '#F6921E' }].map(m => (
                  <button key={m.id} onClick={() => setPaymentMethod(m.id)} style={{ flex: 1, padding: 12, backgroundColor: paymentMethod === m.id ? (m.id === 'bkash' ? '#FDF2F8' : '#FFF7ED') : '#FAFAFA', border: paymentMethod === m.id ? `1.5px solid ${m.color}` : '1px solid #EAEAEA', borderRadius: 10, cursor: 'pointer' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: m.color }}>{m.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== STEP 3: SUCCESS ===== */}
        {step === 3 && (
          <div style={{ padding: '80px 24px 40px', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CheckCircle size={40} style={{ color: '#22C55E' }} />
            </div>
            
            <h1 style={{ fontSize: 22, fontWeight: 600, color: '#1a1a1a', marginBottom: 8 }}>Order Placed!</h1>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28, lineHeight: 1.5 }}>Your order has been placed.<br />We'll call you shortly to confirm.</p>

            <div style={{ backgroundColor: '#FAFAFA', borderRadius: 12, padding: 20, marginBottom: 24 }}>
              <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>Order Number</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', letterSpacing: 1 }}>{orderNumber}</span>
                <button onClick={copyOrder} style={{ padding: 6, backgroundColor: '#FFF', border: '1px solid #EAEAEA', borderRadius: 6, cursor: 'pointer', display: 'flex' }}>
                  {copied ? <CheckCircle size={16} style={{ color: '#22C55E' }} /> : <Copy size={16} style={{ color: '#6B7280' }} />}
                </button>
              </div>
            </div>

            <div style={{ backgroundColor: '#FAFAFA', borderRadius: 12, padding: 16, marginBottom: 28, textAlign: 'left' }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#FEF7F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Phone size={16} style={{ color: '#B08B5C' }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>Confirmation Call</p>
                  <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>Within 2 hours</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Gift size={16} style={{ color: '#22C55E' }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>Delivery</p>
                  <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>2-4 business days</p>
                </div>
              </div>
            </div>

            <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 24px', backgroundColor: '#B08B5C', color: '#FFF', fontSize: 14, fontWeight: 600, borderRadius: 10, textDecoration: 'none' }}>
              <Home size={18} /> Back to Home
            </Link>
          </div>
        )}

        {/* Bottom Button - Step 1 & 2 */}
        {step < 3 && (
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', padding: '12px 20px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))', borderTop: '1px solid #F5F5F5' }}>
            {step === 1 ? (
              <button onClick={() => canProceed() ? setStep(2) : toast.error('Fill all fields & verify phone')} style={{ width: '100%', height: 50, backgroundColor: canProceed() ? '#B08B5C' : '#E5E7EB', color: '#FFF', fontSize: 15, fontWeight: 600, border: 'none', borderRadius: 12, cursor: canProceed() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                Payment <ChevronRight size={18} />
              </button>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>Pay Now</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>৳{advanceAmount.toLocaleString()}</span>
                </div>
                <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', height: 50, backgroundColor: '#B08B5C', color: '#FFF', fontSize: 15, fontWeight: 600, border: 'none', borderRadius: 12, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {loading ? 'Processing...' : 'Place Order'} <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* OTP Modal */}
        {showOtpModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end' }}>
            <div style={{ backgroundColor: '#FFF', borderRadius: '20px 20px 0 0', padding: '28px 24px', paddingBottom: 'calc(28px + env(safe-area-inset-bottom))', width: '100%', textAlign: 'center' }}>
              <div style={{ width: 36, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, margin: '0 auto 20px' }} />
              <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#FEF7F0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Phone size={24} style={{ color: '#B08B5C' }} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1a1a1a', marginBottom: 6 }}>Verify Phone</h3>
              <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 24 }}>Enter 6-digit code sent to <strong>{formData.phone}</strong></p>
              
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
                {otpValues.map((val, i) => (
                  <input key={i} ref={el => otpRefs.current[i] = el} type="text" inputMode="numeric" maxLength={1} value={val} onChange={(e) => handleOtpChange(i, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(i, e)} style={{ width: 44, height: 48, textAlign: 'center', fontSize: 20, fontWeight: 600, border: `1.5px solid ${val ? '#B08B5C' : '#E5E7EB'}`, borderRadius: 10, outline: 'none', backgroundColor: val ? '#FEF7F0' : '#FAFAFA' }} />
                ))}
              </div>

              <button onClick={verifyOtp} disabled={loading} style={{ width: '100%', height: 48, backgroundColor: '#B08B5C', color: '#FFF', fontSize: 15, fontWeight: 600, border: 'none', borderRadius: 10, cursor: 'pointer', marginBottom: 14 }}>
                {loading ? 'Verifying...' : 'Verify'}
              </button>

              <p style={{ fontSize: 13, color: '#6B7280' }}>
                {otpTimer > 0 ? `Resend in ${otpTimer}s` : <button onClick={sendOtp} style={{ background: 'none', border: 'none', color: '#B08B5C', fontWeight: 600, cursor: 'pointer' }}>Resend OTP</button>}
              </p>
            </div>
          </div>
        )}

        {/* Location Modal */}
        {showLocationModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: '#FFF' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #F5F5F5', display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => locationStep === 'area' ? (setLocationStep('district'), setLocationSearch('')) : setShowLocationModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <ChevronLeft size={22} />
              </button>
              <span style={{ flex: 1, fontSize: 16, fontWeight: 600, color: '#1a1a1a' }}>{locationStep === 'district' ? 'Select District' : 'Select Area'}</span>
            </div>
            <div style={{ padding: 12 }}>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input value={locationSearch} onChange={(e) => setLocationSearch(e.target.value)} placeholder="Search..." style={{ ...inputStyle, paddingLeft: 42 }} autoFocus />
              </div>
            </div>
            <div style={{ height: 'calc(100vh - 120px)', overflowY: 'auto' }}>
              {locationStep === 'district' ? (
                districts.filter(d => d.name.toLowerCase().includes(locationSearch.toLowerCase())).map(d => (
                  <div key={d.id} onClick={() => selectDistrict(d)} style={{ padding: '14px 16px', borderBottom: '1px solid #FAFAFA', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 14, color: '#1a1a1a' }}>{d.name}</span>
                    <ChevronRight size={16} style={{ color: '#D1D5DB' }} />
                  </div>
                ))
              ) : (
                availableAreas.filter(a => a.name.toLowerCase().includes(locationSearch.toLowerCase())).map(a => (
                  <div key={a.id} onClick={() => selectArea(a)} style={{ padding: '14px 16px', borderBottom: '1px solid #FAFAFA' }}>
                    <span style={{ fontSize: 14, color: '#1a1a1a' }}>{a.name}</span>
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

  // ====================== DESKTOP (Same logic, different layout) ======================
  return (
    <div style={{ backgroundColor: '#FAFAFA', minHeight: '100vh', paddingTop: 90, paddingBottom: 60 }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px' }}>
        
        {/* Progress */}
        {step < 3 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#B08B5C', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>1</div>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>Address</span>
            </div>
            <div style={{ width: 60, height: 2, backgroundColor: step >= 2 ? '#B08B5C' : '#E5E7EB' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: step >= 2 ? '#B08B5C' : '#E5E7EB', color: step >= 2 ? '#FFF' : '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>2</div>
              <span style={{ fontSize: 13, fontWeight: 500, color: step >= 2 ? '#1a1a1a' : '#9CA3AF' }}>Payment</span>
            </div>
            <div style={{ width: 60, height: 2, backgroundColor: step >= 3 ? '#B08B5C' : '#E5E7EB' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: step >= 3 ? '#B08B5C' : '#E5E7EB', color: step >= 3 ? '#FFF' : '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>3</div>
              <span style={{ fontSize: 13, fontWeight: 500, color: step >= 3 ? '#1a1a1a' : '#9CA3AF' }}>Done</span>
            </div>
          </div>
        )}

        {step === 3 ? (
          // Success Page Desktop
          <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center', paddingTop: 40 }}>
            <div style={{ width: 100, height: 100, borderRadius: '50%', backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <CheckCircle size={50} style={{ color: '#22C55E' }} />
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 300, letterSpacing: 3, color: '#1a1a1a', marginBottom: 12, textTransform: 'uppercase' }}>Order Confirmed</h1>
            <p style={{ fontSize: 15, color: '#6B7280', marginBottom: 32 }}>Thank you! We'll call you shortly to confirm.</p>
            
            <div style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 28, marginBottom: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Order Number</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                <span style={{ fontSize: 26, fontWeight: 700, color: '#1a1a1a', letterSpacing: 2 }}>{orderNumber}</span>
                <button onClick={copyOrder} style={{ padding: 8, backgroundColor: '#FAFAFA', border: '1px solid #EAEAEA', borderRadius: 8, cursor: 'pointer', display: 'flex' }}>
                  {copied ? <CheckCircle size={18} style={{ color: '#22C55E' }} /> : <Copy size={18} style={{ color: '#6B7280' }} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <Link href="/account/orders" style={{ padding: '14px 28px', backgroundColor: '#B08B5C', color: '#FFF', fontSize: 14, fontWeight: 600, borderRadius: 10, textDecoration: 'none' }}>View Orders</Link>
              <Link href="/" style={{ padding: '14px 28px', backgroundColor: '#FFF', color: '#1a1a1a', fontSize: 14, fontWeight: 600, borderRadius: 10, textDecoration: 'none', border: '1px solid #EAEAEA' }}>Continue Shopping</Link>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
            {/* Left */}
            <div>
              {step === 1 && (
                <>
                  {/* Contact */}
                  <div style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 24, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', marginBottom: 20 }}>Receiver Details</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <div style={{ position: 'relative' }}>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone Number" disabled={otpVerified} style={{ ...inputStyle, paddingRight: 80, backgroundColor: otpVerified ? '#F0FDF4' : '#FAFAFA', borderColor: otpVerified ? '#86EFAC' : '#EAEAEA' }} />
                        {otpVerified ? <CheckCircle size={18} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#22C55E' }} /> : <button onClick={sendOtp} disabled={otpSending} style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', padding: '8px 14px', backgroundColor: '#1a1a1a', color: '#FFF', fontSize: 11, fontWeight: 600, border: 'none', borderRadius: 6, cursor: 'pointer' }}>{otpSending ? '...' : 'Verify'}</button>}
                      </div>
                      <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Receiver's Name" style={inputStyle} />
                    </div>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email (optional)" style={inputStyle} />
                  </div>

                  {/* Address */}
                  <div style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', marginBottom: 20 }}>Delivery Address</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <div onClick={() => { setShowLocationModal(true); setLocationStep('district'); setLocationSearch(''); }} style={{ ...inputStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                        <span style={{ color: formData.district ? '#1a1a1a' : '#9CA3AF', fontSize: 14 }}>{formData.district && formData.area ? `${formData.district} › ${formData.area}` : 'District & Area'}</span>
                        <MapPin size={18} style={{ color: '#B08B5C' }} />
                      </div>
                      <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Full Address" style={inputStyle} />
                    </div>
                    <input type="text" name="note" value={formData.note} onChange={handleInputChange} placeholder="Delivery note (optional)" style={inputStyle} />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  {/* Payment Type */}
                  <div style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 24, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', marginBottom: 20 }}>Payment Type</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <button onClick={() => setPaymentType('partial')} style={{ padding: 16, backgroundColor: paymentType === 'partial' ? '#FEF7F0' : '#FAFAFA', border: paymentType === 'partial' ? '1.5px solid #B08B5C' : '1px solid #EAEAEA', borderRadius: 12, cursor: 'pointer', textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>Cash on Delivery</span>{paymentType === 'partial' && <CheckCircle size={18} style={{ color: '#B08B5C' }} />}</div>
                        <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>Pay ৳{deliveryCharge} advance</p>
                      </button>
                      <button onClick={() => setPaymentType('full')} style={{ padding: 16, backgroundColor: paymentType === 'full' ? '#FEF7F0' : '#FAFAFA', border: paymentType === 'full' ? '1.5px solid #B08B5C' : '1px solid #EAEAEA', borderRadius: 12, cursor: 'pointer', textAlign: 'left', position: 'relative' }}>
                        <span style={{ position: 'absolute', top: -8, right: 12, padding: '3px 8px', backgroundColor: '#22C55E', color: '#FFF', fontSize: 9, fontWeight: 600, borderRadius: 4 }}>FREE DELIVERY</span>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>Full Payment</span>{paymentType === 'full' && <CheckCircle size={18} style={{ color: '#B08B5C' }} />}</div>
                        <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>Pay ৳{(subtotal - discount).toLocaleString()} now</p>
                      </button>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', marginBottom: 20 }}>Payment Method</h2>
                    <div style={{ display: 'flex', gap: 12 }}>
                      {[{ id: 'bkash', name: 'bKash', color: '#E2136E' }, { id: 'nagad', name: 'Nagad', color: '#F6921E' }].map(m => (
                        <button key={m.id} onClick={() => setPaymentMethod(m.id)} style={{ flex: 1, padding: 14, backgroundColor: paymentMethod === m.id ? (m.id === 'bkash' ? '#FDF2F8' : '#FFF7ED') : '#FAFAFA', border: paymentMethod === m.id ? `1.5px solid ${m.color}` : '1px solid #EAEAEA', borderRadius: 12, cursor: 'pointer' }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: m.color }}>{m.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right - Summary */}
            <div style={{ position: 'sticky', top: 100 }}>
              <div style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', marginBottom: 16 }}>Order Summary</h2>
                
                <div style={{ maxHeight: 160, overflowY: 'auto', marginBottom: 16 }}>
                  {items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: '#FAFAFA', overflow: 'hidden', position: 'relative', flexShrink: 0, border: '1px solid #EAEAEA' }}>
                        {item.image ? <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} /> : <Package size={18} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: '#D1D5DB' }} />}
                        <span style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, backgroundColor: '#B08B5C', color: '#FFF', fontSize: 10, fontWeight: 600, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.quantity}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a', margin: 0, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>৳{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
                <div style={{ paddingTop: 12, paddingBottom: 12, borderTop: '1px solid #F5F5F5', borderBottom: '1px solid #F5F5F5', marginBottom: 12 }}>
                  {appliedCoupon ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: '#F0FDF4', borderRadius: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Tag size={14} style={{ color: '#22C55E' }} /><span style={{ fontSize: 13, fontWeight: 600, color: '#22C55E' }}>{appliedCoupon.code}</span><span style={{ fontSize: 12, color: '#6B7280' }}>-৳{discount}</span></div>
                      <button onClick={() => { setAppliedCoupon(null); setDiscount(0); setCouponCode(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={14} style={{ color: '#EF4444' }} /></button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Promo code" style={{ ...inputStyle, flex: 1, height: 42 }} />
                      <button onClick={handleApplyCoupon} disabled={couponLoading} style={{ padding: '0 14px', height: 42, backgroundColor: '#1a1a1a', color: '#FFF', fontSize: 12, fontWeight: 600, border: 'none', borderRadius: 8, cursor: 'pointer' }}>{couponLoading ? '...' : 'Apply'}</button>
                    </div>
                  )}
                </div>

                {/* Pricing */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ fontSize: 13, color: '#6B7280' }}>Subtotal</span><span style={{ fontSize: 13, color: '#1a1a1a' }}>৳{subtotal.toLocaleString()}</span></div>
                  {discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ fontSize: 13, color: '#22C55E' }}>Discount</span><span style={{ fontSize: 13, color: '#22C55E' }}>-৳{discount}</span></div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}><span style={{ fontSize: 13, color: '#6B7280' }}>Delivery</span><span style={{ fontSize: 13, color: paymentType === 'full' ? '#22C55E' : '#1a1a1a' }}>{paymentType === 'full' ? 'Free' : '৳' + deliveryCharge}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #F5F5F5' }}><span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>Total</span><span style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>৳{total.toLocaleString()}</span></div>
                </div>

                {/* Button */}
                {step === 1 ? (
                  <button onClick={() => canProceed() ? setStep(2) : toast.error('Fill all fields & verify phone')} style={{ width: '100%', height: 48, backgroundColor: canProceed() ? '#B08B5C' : '#E5E7EB', color: '#FFF', fontSize: 14, fontWeight: 600, border: 'none', borderRadius: 10, cursor: canProceed() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    Continue to Payment <ChevronRight size={18} />
                  </button>
                ) : (
                  <div>
                    <div style={{ backgroundColor: '#FAFAFA', borderRadius: 10, padding: 12, marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ fontSize: 12, color: '#6B7280' }}>Pay Now ({paymentMethod})</span><span style={{ fontSize: 14, fontWeight: 700, color: '#B08B5C' }}>৳{advanceAmount.toLocaleString()}</span></div>
                      {paymentType === 'partial' && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 12, color: '#6B7280' }}>Pay on Delivery</span><span style={{ fontSize: 12, color: '#1a1a1a' }}>৳{codAmount.toLocaleString()}</span></div>}
                    </div>
                    <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', height: 48, backgroundColor: '#B08B5C', color: '#FFF', fontSize: 14, fontWeight: 600, border: 'none', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                      {loading ? 'Processing...' : 'Place Order'}
                    </button>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14 }}>
                  <Shield size={14} style={{ color: '#22C55E' }} />
                  <span style={{ fontSize: 11, color: '#9CA3AF' }}>Secure checkout</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* OTP Modal Desktop */}
      {showOtpModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#FFF', borderRadius: 20, padding: 36, width: 380, textAlign: 'center', position: 'relative' }}>
            <button onClick={() => setShowOtpModal(false)} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} style={{ color: '#9CA3AF' }} /></button>
            <div style={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: '#FEF7F0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}><Phone size={26} style={{ color: '#B08B5C' }} /></div>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a1a', marginBottom: 8 }}>Verify Phone</h3>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28 }}>Enter 6-digit code sent to<br /><strong>{formData.phone}</strong></p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 28 }}>
              {otpValues.map((val, i) => (
                <input key={i} ref={el => otpRefs.current[i] = el} type="text" inputMode="numeric" maxLength={1} value={val} onChange={(e) => handleOtpChange(i, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(i, e)} style={{ width: 48, height: 52, textAlign: 'center', fontSize: 22, fontWeight: 600, border: `1.5px solid ${val ? '#B08B5C' : '#E5E7EB'}`, borderRadius: 10, outline: 'none', backgroundColor: val ? '#FEF7F0' : '#FAFAFA' }} />
              ))}
            </div>
            <button onClick={verifyOtp} disabled={loading} style={{ width: '100%', height: 48, backgroundColor: '#B08B5C', color: '#FFF', fontSize: 15, fontWeight: 600, border: 'none', borderRadius: 10, cursor: 'pointer', marginBottom: 16 }}>{loading ? 'Verifying...' : 'Verify'}</button>
            <p style={{ fontSize: 13, color: '#6B7280' }}>{otpTimer > 0 ? `Resend in ${otpTimer}s` : <button onClick={sendOtp} style={{ background: 'none', border: 'none', color: '#B08B5C', fontWeight: 600, cursor: 'pointer' }}>Resend OTP</button>}</p>
          </div>
        </div>
      )}

      {/* Location Modal Desktop */}
      {showLocationModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#FFF', borderRadius: 16, width: 420, maxHeight: '65vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F5F5F5', display: 'flex', alignItems: 'center', gap: 12 }}>
              {locationStep === 'area' && <button onClick={() => { setLocationStep('district'); setLocationSearch(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><ChevronLeft size={20} /></button>}
              <span style={{ flex: 1, fontSize: 16, fontWeight: 600, color: '#1a1a1a' }}>{locationStep === 'district' ? 'Select District' : 'Select Area'}</span>
              <button onClick={() => setShowLocationModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ padding: 12 }}>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input value={locationSearch} onChange={(e) => setLocationSearch(e.target.value)} placeholder="Search..." style={{ ...inputStyle, paddingLeft: 42 }} autoFocus />
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {locationStep === 'district' ? (
                districts.filter(d => d.name.toLowerCase().includes(locationSearch.toLowerCase())).map(d => (
                  <div key={d.id} onClick={() => selectDistrict(d)} style={{ padding: '14px 20px', borderBottom: '1px solid #FAFAFA', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 14, color: '#1a1a1a' }}>{d.name}</span>
                    <ChevronRight size={16} style={{ color: '#D1D5DB' }} />
                  </div>
                ))
              ) : (
                availableAreas.filter(a => a.name.toLowerCase().includes(locationSearch.toLowerCase())).map(a => (
                  <div key={a.id} onClick={() => selectArea(a)} style={{ padding: '14px 20px', borderBottom: '1px solid #FAFAFA', cursor: 'pointer' }}>
                    <span style={{ fontSize: 14, color: '#1a1a1a' }}>{a.name}</span>
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
