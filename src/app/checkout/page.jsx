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
  
  // Mobile 3 Steps
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

  // OTP
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

  // Compact input style
  const inputStyle = {
    width: '100%',
    height: 46,
    padding: '0 14px',
    backgroundColor: '#FAFAFA',
    border: '1px solid #EBEBEB',
    borderRadius: 8,
    fontSize: 14,
    color: '#1a1a1a',
    outline: 'none',
    boxSizing: 'border-box'
  };

  // ====================== MOBILE 3-STEP ======================
  if (isMobile) {
    return (
      <div style={{ backgroundColor: '#FFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Fixed Header */}
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          zIndex: 50, 
          backgroundColor: '#FFF',
          borderBottom: '1px solid #F0F0F0'
        }}>
          {/* Title Bar */}
          <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {step < 3 ? (
              <button onClick={() => step === 1 ? router.back() : setStep(step - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <ChevronLeft size={22} style={{ color: '#1a1a1a' }} />
              </button>
            ) : <div style={{ width: 30 }} />}
            <span style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>
              {step === 1 ? 'Delivery' : step === 2 ? 'Payment' : 'Order Placed'}
            </span>
            <div style={{ width: 30 }} />
          </div>

          {/* Progress Steps */}
          {step < 3 && (
            <div style={{ padding: '8px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
              {/* Step 1 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: '#B08B5C', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>1</div>
                <span style={{ fontSize: 11, fontWeight: 500, color: '#1a1a1a' }}>Address</span>
              </div>
              
              <div style={{ width: 24, height: 1, backgroundColor: step >= 2 ? '#B08B5C' : '#E0E0E0', margin: '0 6px' }} />
              
              {/* Step 2 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: step >= 2 ? '#B08B5C' : '#E0E0E0', color: step >= 2 ? '#FFF' : '#999', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>2</div>
                <span style={{ fontSize: 11, fontWeight: 500, color: step >= 2 ? '#1a1a1a' : '#999' }}>Payment</span>
              </div>
              
              <div style={{ width: 24, height: 1, backgroundColor: step >= 3 ? '#B08B5C' : '#E0E0E0', margin: '0 6px' }} />
              
              {/* Step 3 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: step >= 3 ? '#B08B5C' : '#E0E0E0', color: step >= 3 ? '#FFF' : '#999', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>3</div>
                <span style={{ fontSize: 11, fontWeight: 500, color: step >= 3 ? '#1a1a1a' : '#999' }}>Done</span>
              </div>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, paddingTop: step < 3 ? 100 : 56, paddingBottom: step < 3 ? 80 : 20, overflowY: 'auto' }}>
          
          {/* ===== STEP 1: ADDRESS ===== */}
          {step === 1 && (
            <div style={{ padding: '16px 16px' }}>
              {/* Receiver Details */}
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', marginBottom: 10 }}>Receiver Details</h3>
                
                {/* Phone */}
                <div style={{ position: 'relative', marginBottom: 8 }}>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Phone Number"
                    disabled={otpVerified}
                    style={{ ...inputStyle, paddingRight: 65, backgroundColor: otpVerified ? '#F0FDF4' : '#FAFAFA', borderColor: otpVerified ? '#86EFAC' : '#EBEBEB' }}
                  />
                  {otpVerified ? (
                    <CheckCircle size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#22C55E' }} />
                  ) : (
                    <button onClick={sendOtp} disabled={otpSending} style={{ position: 'absolute', right: 5, top: '50%', transform: 'translateY(-50%)', padding: '6px 10px', backgroundColor: '#1a1a1a', color: '#FFF', fontSize: 11, fontWeight: 600, border: 'none', borderRadius: 5, cursor: 'pointer' }}>
                      {otpSending ? '...' : 'Verify'}
                    </button>
                  )}
                </div>

                {/* Name */}
                <div style={{ marginBottom: 8 }}>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Receiver's Name" style={inputStyle} />
                </div>

                {/* Email */}
                <div>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email (optional)" style={inputStyle} />
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', marginBottom: 10 }}>Delivery Address</h3>
                
                {/* District & Area */}
                <div 
                  onClick={() => { setShowLocationModal(true); setLocationStep('district'); setLocationSearch(''); }} 
                  style={{ ...inputStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: 8 }}
                >
                  <span style={{ color: formData.district ? '#1a1a1a' : '#999', fontSize: 14 }}>
                    {formData.district && formData.area ? `${formData.district} › ${formData.area}` : 'District & Area'}
                  </span>
                  <MapPin size={16} style={{ color: '#B08B5C' }} />
                </div>

                {/* Full Address */}
                <div style={{ marginBottom: 8 }}>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter full address"
                    rows={2}
                    style={{ ...inputStyle, height: 'auto', padding: '10px 14px', resize: 'none', lineHeight: 1.4 }}
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
            <div style={{ padding: '16px 16px' }}>
              {/* Order Summary */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>Order Summary</h3>
                  <span style={{ fontSize: 11, color: '#888' }}>{items.length} items</span>
                </div>
                <div style={{ backgroundColor: '#FAFAFA', borderRadius: 8, padding: 10 }}>
                  {items.slice(0, 2).map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: i < 1 && items.length > 1 ? 8 : 0 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 6, backgroundColor: '#FFF', overflow: 'hidden', position: 'relative', flexShrink: 0, border: '1px solid #EBEBEB' }}>
                        {item.image ? <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} /> : <Package size={14} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: '#CCC' }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 500, color: '#1a1a1a', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                        <p style={{ fontSize: 11, color: '#888', margin: 0 }}>৳{item.price} × {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  {items.length > 2 && <p style={{ fontSize: 11, color: '#B08B5C', marginTop: 6, textAlign: 'center' }}>+{items.length - 2} more</p>}
                </div>
              </div>

              {/* Coupon */}
              <div style={{ marginBottom: 16 }}>
                {appliedCoupon ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: '#F0FDF4', borderRadius: 6, border: '1px solid #BBF7D0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Tag size={12} style={{ color: '#22C55E' }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#22C55E' }}>{appliedCoupon.code}</span>
                      <span style={{ fontSize: 11, color: '#888' }}>-৳{discount}</span>
                    </div>
                    <button onClick={() => { setAppliedCoupon(null); setDiscount(0); setCouponCode(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}><X size={14} style={{ color: '#EF4444' }} /></button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Promo Code" style={{ ...inputStyle, flex: 1, height: 42 }} />
                    <button onClick={handleApplyCoupon} disabled={couponLoading} style={{ padding: '0 14px', height: 42, backgroundColor: '#1a1a1a', color: '#FFF', fontSize: 12, fontWeight: 600, border: 'none', borderRadius: 8, cursor: 'pointer' }}>{couponLoading ? '...' : 'Apply'}</button>
                  </div>
                )}
              </div>

              {/* Pricing */}
              <div style={{ backgroundColor: '#FAFAFA', borderRadius: 8, padding: 12, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ fontSize: 12, color: '#888' }}>Subtotal</span><span style={{ fontSize: 12, color: '#1a1a1a' }}>৳{subtotal.toLocaleString()}</span></div>
                {discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ fontSize: 12, color: '#22C55E' }}>Discount</span><span style={{ fontSize: 12, color: '#22C55E' }}>-৳{discount}</span></div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ fontSize: 12, color: '#888' }}>Delivery</span><span style={{ fontSize: 12, color: paymentType === 'full' ? '#22C55E' : '#1a1a1a' }}>{paymentType === 'full' ? 'Free' : '৳' + deliveryCharge}</span></div>
                <div style={{ height: 1, backgroundColor: '#E5E5E5', margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>Total</span><span style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>৳{total.toLocaleString()}</span></div>
              </div>

              {/* Payment Type */}
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', marginBottom: 8 }}>Payment Type</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button onClick={() => setPaymentType('partial')} style={{ padding: 10, backgroundColor: paymentType === 'partial' ? '#FEF7F0' : '#FAFAFA', border: paymentType === 'partial' ? '1.5px solid #B08B5C' : '1px solid #EBEBEB', borderRadius: 8, cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a' }}>COD</span>
                      {paymentType === 'partial' && <CheckCircle size={14} style={{ color: '#B08B5C' }} />}
                    </div>
                    <p style={{ fontSize: 10, color: '#888', margin: 0 }}>৳{deliveryCharge} advance</p>
                  </button>
                  <button onClick={() => setPaymentType('full')} style={{ padding: 10, backgroundColor: paymentType === 'full' ? '#FEF7F0' : '#FAFAFA', border: paymentType === 'full' ? '1.5px solid #B08B5C' : '1px solid #EBEBEB', borderRadius: 8, cursor: 'pointer', textAlign: 'left', position: 'relative' }}>
                    <span style={{ position: 'absolute', top: -5, right: 6, padding: '2px 5px', backgroundColor: '#22C55E', color: '#FFF', fontSize: 7, fontWeight: 600, borderRadius: 3 }}>FREE DELIVERY</span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a' }}>Full Pay</span>
                      {paymentType === 'full' && <CheckCircle size={14} style={{ color: '#B08B5C' }} />}
                    </div>
                    <p style={{ fontSize: 10, color: '#888', margin: 0 }}>৳{(subtotal - discount).toLocaleString()}</p>
                  </button>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', marginBottom: 8 }}>Payment Method</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[{ id: 'bkash', name: 'bKash', color: '#E2136E' }, { id: 'nagad', name: 'Nagad', color: '#F6921E' }].map(m => (
                    <button key={m.id} onClick={() => setPaymentMethod(m.id)} style={{ flex: 1, padding: 10, backgroundColor: paymentMethod === m.id ? (m.id === 'bkash' ? '#FDF2F8' : '#FFF7ED') : '#FAFAFA', border: paymentMethod === m.id ? `1.5px solid ${m.color}` : '1px solid #EBEBEB', borderRadius: 8, cursor: 'pointer' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: m.color }}>{m.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== STEP 3: SUCCESS ===== */}
          {step === 3 && (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ width: 70, height: 70, borderRadius: '50%', backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle size={35} style={{ color: '#22C55E' }} />
              </div>
              
              <h1 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a1a', marginBottom: 6 }}>Order Placed!</h1>
              <p style={{ fontSize: 13, color: '#888', marginBottom: 24, lineHeight: 1.5 }}>We'll call you shortly to confirm.</p>

              <div style={{ backgroundColor: '#FAFAFA', borderRadius: 10, padding: 16, marginBottom: 20 }}>
                <p style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>Order Number</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', letterSpacing: 1 }}>{orderNumber}</span>
                  <button onClick={copyOrder} style={{ padding: 5, backgroundColor: '#FFF', border: '1px solid #EBEBEB', borderRadius: 5, cursor: 'pointer', display: 'flex' }}>
                    {copied ? <CheckCircle size={14} style={{ color: '#22C55E' }} /> : <Copy size={14} style={{ color: '#888' }} />}
                  </button>
                </div>
              </div>

              <div style={{ backgroundColor: '#FAFAFA', borderRadius: 10, padding: 14, marginBottom: 24, textAlign: 'left' }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#FEF7F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Phone size={14} style={{ color: '#B08B5C' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>Confirmation Call</p>
                    <p style={{ fontSize: 11, color: '#888', margin: 0 }}>Within 2 hours</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Gift size={14} style={{ color: '#22C55E' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>Delivery</p>
                    <p style={{ fontSize: 11, color: '#888', margin: 0 }}>2-4 business days</p>
                  </div>
                </div>
              </div>

              <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px 20px', backgroundColor: '#B08B5C', color: '#FFF', fontSize: 13, fontWeight: 600, borderRadius: 8, textDecoration: 'none' }}>
                <Home size={16} /> Back to Home
              </Link>
            </div>
          )}
        </div>

        {/* Fixed Bottom Button */}
        {step < 3 && (
          <div style={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            backgroundColor: '#FFF', 
            padding: '10px 16px', 
            paddingBottom: 'calc(10px + env(safe-area-inset-bottom))',
            borderTop: '1px solid #F0F0F0'
          }}>
            {step === 1 ? (
              <button 
                onClick={() => canProceed() ? setStep(2) : toast.error('Fill all fields & verify phone')} 
                style={{ 
                  width: '100%', 
                  height: 48, 
                  backgroundColor: canProceed() ? '#B08B5C' : '#E5E5E5', 
                  color: canProceed() ? '#FFF' : '#999', 
                  fontSize: 14, 
                  fontWeight: 600, 
                  border: 'none', 
                  borderRadius: 10, 
                  cursor: canProceed() ? 'pointer' : 'not-allowed', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: 4 
                }}
              >
                Payment <ChevronRight size={16} />
              </button>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: '#888' }}>Pay Now</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>৳{advanceAmount.toLocaleString()}</span>
                </div>
                <button 
                  onClick={handleSubmit} 
                  disabled={loading} 
                  style={{ 
                    width: '100%', 
                    height: 48, 
                    backgroundColor: '#B08B5C', 
                    color: '#FFF', 
                    fontSize: 14, 
                    fontWeight: 600, 
                    border: 'none', 
                    borderRadius: 10, 
                    cursor: loading ? 'not-allowed' : 'pointer', 
                    opacity: loading ? 0.7 : 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: 4 
                  }}
                >
                  {loading ? 'Processing...' : 'Place Order'} <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* OTP Modal */}
        {showOtpModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end' }}>
            <div style={{ backgroundColor: '#FFF', borderRadius: '16px 16px 0 0', padding: '24px 20px', paddingBottom: 'calc(24px + env(safe-area-inset-bottom))', width: '100%', textAlign: 'center' }}>
              <div style={{ width: 32, height: 4, backgroundColor: '#E5E5E5', borderRadius: 2, margin: '0 auto 18px' }} />
              <div style={{ width: 50, height: 50, borderRadius: '50%', backgroundColor: '#FEF7F0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <Phone size={22} style={{ color: '#B08B5C' }} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a', marginBottom: 4 }}>Verify Phone</h3>
              <p style={{ fontSize: 12, color: '#888', marginBottom: 20 }}>Enter 6-digit code sent to <strong>{formData.phone}</strong></p>
              
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 20 }}>
                {otpValues.map((val, i) => (
                  <input key={i} ref={el => otpRefs.current[i] = el} type="text" inputMode="numeric" maxLength={1} value={val} onChange={(e) => handleOtpChange(i, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(i, e)} style={{ width: 42, height: 46, textAlign: 'center', fontSize: 18, fontWeight: 600, border: `1.5px solid ${val ? '#B08B5C' : '#E5E5E5'}`, borderRadius: 8, outline: 'none', backgroundColor: val ? '#FEF7F0' : '#FAFAFA' }} />
                ))}
              </div>

              <button onClick={verifyOtp} disabled={loading} style={{ width: '100%', height: 46, backgroundColor: '#B08B5C', color: '#FFF', fontSize: 14, fontWeight: 600, border: 'none', borderRadius: 8, cursor: 'pointer', marginBottom: 12 }}>
                {loading ? 'Verifying...' : 'Verify'}
              </button>

              <p style={{ fontSize: 12, color: '#888' }}>
                {otpTimer > 0 ? `Resend in ${otpTimer}s` : <button onClick={sendOtp} style={{ background: 'none', border: 'none', color: '#B08B5C', fontWeight: 600, cursor: 'pointer' }}>Resend OTP</button>}
              </p>
            </div>
          </div>
        )}

        {/* Location Modal */}
        {showLocationModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: '#FFF' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => locationStep === 'area' ? (setLocationStep('district'), setLocationSearch('')) : setShowLocationModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <ChevronLeft size={22} />
              </button>
              <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>{locationStep === 'district' ? 'Select District' : 'Select Area'}</span>
            </div>
            <div style={{ padding: 12 }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                <input value={locationSearch} onChange={(e) => setLocationSearch(e.target.value)} placeholder="Search..." style={{ ...inputStyle, paddingLeft: 38 }} autoFocus />
              </div>
            </div>
            <div style={{ height: 'calc(100vh - 110px)', overflowY: 'auto' }}>
              {locationStep === 'district' ? (
                districts.filter(d => d.name.toLowerCase().includes(locationSearch.toLowerCase())).map(d => (
                  <div key={d.id} onClick={() => selectDistrict(d)} style={{ padding: '12px 16px', borderBottom: '1px solid #FAFAFA', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 14, color: '#1a1a1a' }}>{d.name}</span>
                    <ChevronRight size={16} style={{ color: '#CCC' }} />
                  </div>
                ))
              ) : (
                availableAreas.filter(a => a.name.toLowerCase().includes(locationSearch.toLowerCase())).map(a => (
                  <div key={a.id} onClick={() => selectArea(a)} style={{ padding: '12px 16px', borderBottom: '1px solid #FAFAFA' }}>
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

  // ====================== DESKTOP SINGLE PAGE ======================
  return (
    <div style={{ backgroundColor: '#FAFAFA', minHeight: '100vh', paddingTop: 90, paddingBottom: 60 }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 300, letterSpacing: 4, textAlign: 'center', marginBottom: 36, color: '#1a1a1a', textTransform: 'uppercase' }}>Checkout</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
          {/* Left */}
          <div>
            {/* Contact */}
            <div style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 22, marginBottom: 14, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 16 }}>Receiver Details</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div style={{ position: 'relative' }}>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone Number" disabled={otpVerified} style={{ ...inputStyle, paddingRight: 75, backgroundColor: otpVerified ? '#F0FDF4' : '#FAFAFA', borderColor: otpVerified ? '#86EFAC' : '#EBEBEB' }} />
                  {otpVerified ? <CheckCircle size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#22C55E' }} /> : <button onClick={sendOtp} disabled={otpSending} style={{ position: 'absolute', right: 5, top: '50%', transform: 'translateY(-50%)', padding: '6px 12px', backgroundColor: '#1a1a1a', color: '#FFF', fontSize: 11, fontWeight: 600, border: 'none', borderRadius: 5, cursor: 'pointer' }}>{otpSending ? '...' : 'Verify'}</button>}
                </div>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Receiver's Name" style={inputStyle} />
              </div>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email (optional)" style={inputStyle} />
            </div>

            {/* Address */}
            <div style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 22, marginBottom: 14, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 16 }}>Delivery Address</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div onClick={() => { setShowLocationModal(true); setLocationStep('district'); setLocationSearch(''); }} style={{ ...inputStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <span style={{ color: formData.district ? '#1a1a1a' : '#999', fontSize: 14 }}>{formData.district && formData.area ? `${formData.district} › ${formData.area}` : 'District & Area'}</span>
                  <MapPin size={16} style={{ color: '#B08B5C' }} />
                </div>
                <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Full Address" style={inputStyle} />
              </div>
              <input type="text" name="note" value={formData.note} onChange={handleInputChange} placeholder="Delivery note (optional)" style={inputStyle} />
            </div>

            {/* Payment */}
            <div style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 22, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 16 }}>Payment</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <button onClick={() => setPaymentType('partial')} style={{ padding: 14, backgroundColor: paymentType === 'partial' ? '#FEF7F0' : '#FAFAFA', border: paymentType === 'partial' ? '1.5px solid #B08B5C' : '1px solid #EBEBEB', borderRadius: 10, cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>Cash on Delivery</span>{paymentType === 'partial' && <CheckCircle size={16} style={{ color: '#B08B5C' }} />}</div>
                  <p style={{ fontSize: 11, color: '#888', margin: 0 }}>Pay ৳{deliveryCharge} advance</p>
                </button>
                <button onClick={() => setPaymentType('full')} style={{ padding: 14, backgroundColor: paymentType === 'full' ? '#FEF7F0' : '#FAFAFA', border: paymentType === 'full' ? '1.5px solid #B08B5C' : '1px solid #EBEBEB', borderRadius: 10, cursor: 'pointer', textAlign: 'left', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: -7, right: 10, padding: '2px 6px', backgroundColor: '#22C55E', color: '#FFF', fontSize: 8, fontWeight: 600, borderRadius: 3 }}>FREE DELIVERY</span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>Full Payment</span>{paymentType === 'full' && <CheckCircle size={16} style={{ color: '#B08B5C' }} />}</div>
                  <p style={{ fontSize: 11, color: '#888', margin: 0 }}>Pay ৳{(subtotal - discount).toLocaleString()} now</p>
                </button>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {[{ id: 'bkash', name: 'bKash', color: '#E2136E' }, { id: 'nagad', name: 'Nagad', color: '#F6921E' }].map(m => (
                  <button key={m.id} onClick={() => setPaymentMethod(m.id)} style={{ flex: 1, padding: 12, backgroundColor: paymentMethod === m.id ? (m.id === 'bkash' ? '#FDF2F8' : '#FFF7ED') : '#FAFAFA', border: paymentMethod === m.id ? `1.5px solid ${m.color}` : '1px solid #EBEBEB', borderRadius: 10, cursor: 'pointer' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: m.color }}>{m.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Summary */}
          <div style={{ position: 'sticky', top: 100 }}>
            <div style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 14 }}>Order Summary</h2>
              
              <div style={{ maxHeight: 140, overflowY: 'auto', marginBottom: 14 }}>
                {items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 6, backgroundColor: '#FAFAFA', overflow: 'hidden', position: 'relative', flexShrink: 0, border: '1px solid #EBEBEB' }}>
                      {item.image ? <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} /> : <Package size={16} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: '#CCC' }} />}
                      <span style={{ position: 'absolute', top: -3, right: -3, width: 16, height: 16, backgroundColor: '#B08B5C', color: '#FFF', fontSize: 9, fontWeight: 600, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.quantity}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 500, color: '#1a1a1a', margin: 0, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                      <p style={{ fontSize: 12, color: '#888', margin: 0 }}>৳{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div style={{ paddingTop: 10, paddingBottom: 10, borderTop: '1px solid #F0F0F0', borderBottom: '1px solid #F0F0F0', marginBottom: 10 }}>
                {appliedCoupon ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: '#F0FDF4', borderRadius: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Tag size={12} style={{ color: '#22C55E' }} /><span style={{ fontSize: 12, fontWeight: 600, color: '#22C55E' }}>{appliedCoupon.code}</span><span style={{ fontSize: 11, color: '#888' }}>-৳{discount}</span></div>
                    <button onClick={() => { setAppliedCoupon(null); setDiscount(0); setCouponCode(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={12} style={{ color: '#EF4444' }} /></button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Promo code" style={{ ...inputStyle, flex: 1, height: 38, fontSize: 12 }} />
                    <button onClick={handleApplyCoupon} disabled={couponLoading} style={{ padding: '0 12px', height: 38, backgroundColor: '#1a1a1a', color: '#FFF', fontSize: 11, fontWeight: 600, border: 'none', borderRadius: 6, cursor: 'pointer' }}>{couponLoading ? '...' : 'Apply'}</button>
                  </div>
                )}
              </div>

              {/* Pricing */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ fontSize: 12, color: '#888' }}>Subtotal</span><span style={{ fontSize: 12, color: '#1a1a1a' }}>৳{subtotal.toLocaleString()}</span></div>
                {discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ fontSize: 12, color: '#22C55E' }}>Discount</span><span style={{ fontSize: 12, color: '#22C55E' }}>-৳{discount}</span></div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}><span style={{ fontSize: 12, color: '#888' }}>Delivery</span><span style={{ fontSize: 12, color: paymentType === 'full' ? '#22C55E' : '#1a1a1a' }}>{paymentType === 'full' ? 'Free' : '৳' + deliveryCharge}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid #F0F0F0' }}><span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>Total</span><span style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>৳{total.toLocaleString()}</span></div>
              </div>

              {/* Pay Summary */}
              <div style={{ backgroundColor: '#FAFAFA', borderRadius: 8, padding: 10, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}><span style={{ fontSize: 11, color: '#888' }}>Pay Now ({paymentMethod})</span><span style={{ fontSize: 13, fontWeight: 700, color: '#B08B5C' }}>৳{advanceAmount.toLocaleString()}</span></div>
                {paymentType === 'partial' && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 11, color: '#888' }}>Pay on Delivery</span><span style={{ fontSize: 11, color: '#1a1a1a' }}>৳{codAmount.toLocaleString()}</span></div>}
              </div>

              <button onClick={handleSubmit} disabled={loading || !otpVerified} style={{ width: '100%', height: 44, backgroundColor: otpVerified ? '#B08B5C' : '#E5E5E5', color: otpVerified ? '#FFF' : '#999', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 8, cursor: (loading || !otpVerified) ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Processing...' : (otpVerified ? 'Place Order' : 'Verify Phone First')}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 12 }}>
                <Shield size={12} style={{ color: '#22C55E' }} />
                <span style={{ fontSize: 10, color: '#999' }}>Secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop OTP Modal */}
      {showOtpModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 32, width: 360, textAlign: 'center', position: 'relative' }}>
            <button onClick={() => setShowOtpModal(false)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} style={{ color: '#999' }} /></button>
            <div style={{ width: 54, height: 54, borderRadius: '50%', backgroundColor: '#FEF7F0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><Phone size={24} style={{ color: '#B08B5C' }} /></div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1a1a1a', marginBottom: 6 }}>Verify Phone</h3>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>Enter 6-digit code sent to<br /><strong>{formData.phone}</strong></p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
              {otpValues.map((val, i) => (
                <input key={i} ref={el => otpRefs.current[i] = el} type="text" inputMode="numeric" maxLength={1} value={val} onChange={(e) => handleOtpChange(i, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(i, e)} style={{ width: 44, height: 48, textAlign: 'center', fontSize: 20, fontWeight: 600, border: `1.5px solid ${val ? '#B08B5C' : '#E5E5E5'}`, borderRadius: 8, outline: 'none', backgroundColor: val ? '#FEF7F0' : '#FAFAFA' }} />
              ))}
            </div>
            <button onClick={verifyOtp} disabled={loading} style={{ width: '100%', height: 44, backgroundColor: '#B08B5C', color: '#FFF', fontSize: 14, fontWeight: 600, border: 'none', borderRadius: 8, cursor: 'pointer', marginBottom: 12 }}>{loading ? 'Verifying...' : 'Verify'}</button>
            <p style={{ fontSize: 12, color: '#888' }}>{otpTimer > 0 ? `Resend in ${otpTimer}s` : <button onClick={sendOtp} style={{ background: 'none', border: 'none', color: '#B08B5C', fontWeight: 600, cursor: 'pointer' }}>Resend OTP</button>}</p>
          </div>
        </div>
      )}

      {/* Desktop Location Modal */}
      {showLocationModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#FFF', borderRadius: 12, width: 400, maxHeight: '60vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: 10 }}>
              {locationStep === 'area' && <button onClick={() => { setLocationStep('district'); setLocationSearch(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><ChevronLeft size={18} /></button>}
              <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>{locationStep === 'district' ? 'Select District' : 'Select Area'}</span>
              <button onClick={() => setShowLocationModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ padding: 10 }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                <input value={locationSearch} onChange={(e) => setLocationSearch(e.target.value)} placeholder="Search..." style={{ ...inputStyle, paddingLeft: 36 }} autoFocus />
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {locationStep === 'district' ? (
                districts.filter(d => d.name.toLowerCase().includes(locationSearch.toLowerCase())).map(d => (
                  <div key={d.id} onClick={() => selectDistrict(d)} style={{ padding: '12px 18px', borderBottom: '1px solid #FAFAFA', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: '#1a1a1a' }}>{d.name}</span>
                    <ChevronRight size={14} style={{ color: '#CCC' }} />
                  </div>
                ))
              ) : (
                availableAreas.filter(a => a.name.toLowerCase().includes(locationSearch.toLowerCase())).map(a => (
                  <div key={a.id} onClick={() => selectArea(a)} style={{ padding: '12px 18px', borderBottom: '1px solid #FAFAFA', cursor: 'pointer' }}>
                    <span style={{ fontSize: 13, color: '#1a1a1a' }}>{a.name}</span>
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
