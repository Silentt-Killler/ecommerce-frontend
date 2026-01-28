'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Truck, CreditCard, Shield, ChevronDown, Package, CheckCircle, Tag, X, Search, ChevronLeft, MapPin, Phone, Lock, ArrowRight } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import { districts } from '@/data/bangladesh-locations';
import api from '@/lib/api';
import toast from 'react-hot-toast';

function LoadingFallback() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #B08B5C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
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
  
  // Mobile Steps: 1 = Shipping, 2 = Payment
  const [mobileStep, setMobileStep] = useState(1);
  
  // Form Data
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', district: '', area: '', address: '', note: '' });
  
  // OTP States
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
  
  // Location Modal
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

  // OTP Timer
  useEffect(() => {
    if (otpTimer > 0) {
      const interval = setInterval(() => setOtpTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [otpTimer]);

  // Delivery Charge Logic
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
      toast.error('Please enter a valid phone number');
      return;
    }
    setOtpSending(true);
    try {
      // API call to send OTP
      await api.post('/auth/send-otp', { phone: formData.phone });
      toast.success('OTP sent to ' + formData.phone);
      setShowOtpModal(true);
      setOtpTimer(60);
      setOtpValues(['', '', '', '', '', '']);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send OTP');
    } finally {
      setOtpSending(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpValues];
    newOtp[index] = value.slice(-1);
    setOtpValues(newOtp);
    
    // Auto focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = async () => {
    const otp = otpValues.join('');
    if (otp.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { phone: formData.phone, otp });
      setOtpVerified(true);
      setShowOtpModal(false);
      toast.success('Phone verified successfully!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // Location Functions
  const openLocationSelector = () => {
    setShowLocationModal(true);
    setLocationStep('district');
    setLocationSearch('');
  };

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

  // Coupon Functions
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) { toast.error('Please enter a coupon code'); return; }
    setCouponLoading(true);
    try {
      const res = await api.post('/coupons/validate', { code: couponCode.toUpperCase(), subtotal });
      const coupon = res.data;
      setAppliedCoupon(coupon);
      let discountAmount = coupon.type === 'percentage' ? (subtotal * coupon.value) / 100 : coupon.value;
      if (coupon.type === 'percentage' && coupon.max_discount && discountAmount > coupon.max_discount) discountAmount = coupon.max_discount;
      setDiscount(discountAmount);
      toast.success('Coupon applied!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid coupon');
      setAppliedCoupon(null);
      setDiscount(0);
    } finally { setCouponLoading(false); }
  };

  const handleRemoveCoupon = () => { setAppliedCoupon(null); setCouponCode(''); setDiscount(0); };

  const subtotal = getSubtotal();
  const finalDeliveryCharge = paymentType === 'full' ? 0 : deliveryCharge;
  const total = subtotal - discount + finalDeliveryCharge;
  const advanceAmount = paymentType === 'full' ? (subtotal - discount) : deliveryCharge;
  const codAmount = paymentType === 'full' ? 0 : (subtotal - discount);

  // Mobile Step 1 Validation
  const canProceedToPayment = () => {
    return formData.name && formData.phone && formData.district && formData.area && formData.address && otpVerified;
  };

  // Submit Order
  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!otpVerified) { toast.error('Please verify your phone number'); return; }
    if (!formData.name || !formData.phone || !formData.district || !formData.area || !formData.address) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const orderData = {
        items: items.map(item => ({ product_id: item.productId, name: item.name, image: item.image, price: item.price, quantity: item.quantity, variant: item.variant })),
        shipping_address: { name: formData.name, phone: formData.phone, email: formData.email, district: formData.district, area: formData.area, address: formData.address },
        customer_phone: formData.phone,
        subtotal, discount,
        coupon_code: appliedCoupon?.code || null,
        delivery_charge: finalDeliveryCharge,
        total, payment_type: paymentType,
        payment_method: paymentMethod,
        advance_paid: advanceAmount,
        cod_amount: codAmount,
        notes: formData.note
      };
      const res = await api.post('/orders/guest', orderData);
      clearCart();
      router.push('/order-success?order=' + res.data.order_number);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to place order');
    } finally { setLoading(false); }
  };

  if (!mounted) return <LoadingFallback />;
  if (items.length === 0) { router.push('/cart'); return null; }

  // ====================== MOBILE 2-STEP CHECKOUT ======================
  if (isMobile) {
    return (
      <div style={{ backgroundColor: '#F9FAFB', minHeight: '100vh', paddingTop: 56 }}>
        {/* Progress Bar */}
        <div style={{ backgroundColor: '#FFF', padding: '16px 20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: mobileStep >= 1 ? '#B08B5C' : '#E5E7EB', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>1</div>
              <span style={{ fontSize: 13, fontWeight: 500, color: mobileStep >= 1 ? '#0C0C0C' : '#9CA3AF' }}>Shipping</span>
            </div>
            <div style={{ width: 40, height: 2, backgroundColor: mobileStep >= 2 ? '#B08B5C' : '#E5E7EB' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: mobileStep >= 2 ? '#B08B5C' : '#E5E7EB', color: mobileStep >= 2 ? '#FFF' : '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>2</div>
              <span style={{ fontSize: 13, fontWeight: 500, color: mobileStep >= 2 ? '#0C0C0C' : '#9CA3AF' }}>Payment</span>
            </div>
          </div>
        </div>

        {/* Step 1: Shipping */}
        {mobileStep === 1 && (
          <div style={{ padding: 16 }}>
            <div style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0C0C0C', marginBottom: 20 }}>Contact Information</h2>
              
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Full Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter your name" style={{ width: '100%', padding: '14px 16px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Phone Number *</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="01XXX-XXXXXX" disabled={otpVerified} style={{ width: '100%', padding: '14px 16px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 15, outline: 'none', boxSizing: 'border-box', backgroundColor: otpVerified ? '#F0FDF4' : '#FFF' }} />
                    {otpVerified && <CheckCircle size={18} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#10B981' }} />}
                  </div>
                  {!otpVerified && (
                    <button type="button" onClick={sendOtp} disabled={otpSending} style={{ padding: '14px 20px', backgroundColor: '#0C0C0C', color: '#FFF', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 10, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      {otpSending ? '...' : 'Verify'}
                    </button>
                  )}
                </div>
                {otpVerified && <p style={{ fontSize: 12, color: '#10B981', marginTop: 6 }}>✓ Phone verified</p>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Email (Optional)</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="your@email.com" style={{ width: '100%', padding: '14px 16px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <Truck size={20} style={{ color: '#B08B5C' }} />
                <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0C0C0C', margin: 0 }}>Delivery Address</h2>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>District & Area *</label>
                <div onClick={openLocationSelector} style={{ width: '100%', padding: '14px 16px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 15, backgroundColor: '#FAFAFA', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                  {formData.district ? (
                    <span style={{ color: '#0C0C0C' }}>{formData.district}{formData.area ? ' → ' + formData.area : ''}</span>
                  ) : (
                    <span style={{ color: '#9CA3AF' }}>Select District & Area</span>
                  )}
                  <MapPin size={18} style={{ color: '#B08B5C' }} />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Full Address *</label>
                <textarea name="address" value={formData.address} onChange={handleInputChange} placeholder="House no, Road, Building, Landmark..." rows={3} style={{ width: '100%', padding: '14px 16px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 15, outline: 'none', boxSizing: 'border-box', resize: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Delivery Note (Optional)</label>
                <input type="text" name="note" value={formData.note} onChange={handleInputChange} placeholder="Special instructions..." style={{ width: '100%', padding: '14px 16px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            {/* Next Button */}
            <button onClick={() => canProceedToPayment() ? setMobileStep(2) : toast.error('Please fill all fields and verify phone')} style={{ width: '100%', marginTop: 20, padding: '16px', backgroundColor: canProceedToPayment() ? '#B08B5C' : '#D1D5DB', color: '#FFF', fontSize: 15, fontWeight: 600, border: 'none', borderRadius: 12, cursor: canProceedToPayment() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              Continue to Payment <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Step 2: Payment */}
        {mobileStep === 2 && (
          <div style={{ padding: 16, paddingBottom: 100 }}>
            {/* Back Button */}
            <button onClick={() => setMobileStep(1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6B7280', fontSize: 14, marginBottom: 16, cursor: 'pointer' }}>
              <ChevronLeft size={18} /> Back to Shipping
            </button>

            {/* Order Summary */}
            <div style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0C0C0C', marginBottom: 16 }}>Order Summary</h2>
              
              <div style={{ maxHeight: 150, overflowY: 'auto', marginBottom: 16 }}>
                {items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 50, height: 50, borderRadius: 8, backgroundColor: '#F3F4F6', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                      {item.image ? <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} /> : <Package size={20} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: '#D1D5DB' }} />}
                      <span style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, backgroundColor: '#B08B5C', color: '#FFF', fontSize: 10, fontWeight: 600, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.quantity}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#0C0C0C', margin: 0 }}>{item.name}</p>
                      <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>৳{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div style={{ paddingTop: 16, borderTop: '1px solid #E5E7EB' }}>
                {appliedCoupon ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, backgroundColor: '#F0FDF4', borderRadius: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Tag size={16} style={{ color: '#10B981' }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#10B981' }}>{appliedCoupon.code}</span>
                      <span style={{ fontSize: 12, color: '#6B7280' }}>-৳{discount.toLocaleString()}</span>
                    </div>
                    <button onClick={handleRemoveCoupon} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} style={{ color: '#EF4444' }} /></button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Coupon code" style={{ flex: 1, padding: '12px 14px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14, outline: 'none' }} />
                    <button onClick={handleApplyCoupon} disabled={couponLoading} style={{ padding: '12px 18px', backgroundColor: '#0C0C0C', color: '#FFF', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 8, cursor: 'pointer' }}>{couponLoading ? '...' : 'Apply'}</button>
                  </div>
                )}
              </div>

              {/* Price Summary */}
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #E5E7EB' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ color: '#6B7280', fontSize: 14 }}>Subtotal</span><span style={{ color: '#0C0C0C', fontSize: 14 }}>৳{subtotal.toLocaleString()}</span></div>
                {discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ color: '#10B981', fontSize: 14 }}>Discount</span><span style={{ color: '#10B981', fontSize: 14 }}>-৳{discount.toLocaleString()}</span></div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}><span style={{ color: '#6B7280', fontSize: 14 }}>Delivery</span><span style={{ color: paymentType === 'full' ? '#10B981' : '#0C0C0C', fontSize: 14 }}>{paymentType === 'full' ? 'FREE' : '৳' + deliveryCharge}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #E5E7EB' }}><span style={{ fontWeight: 600, fontSize: 16, color: '#0C0C0C' }}>Total</span><span style={{ fontWeight: 700, fontSize: 18, color: '#0C0C0C' }}>৳{total.toLocaleString()}</span></div>
              </div>
            </div>

            {/* Payment Type */}
            <div style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0C0C0C', marginBottom: 16 }}>Payment Type</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <button type="button" onClick={() => setPaymentType('partial')} style={{ padding: 14, border: paymentType === 'partial' ? '2px solid #B08B5C' : '1px solid #E5E7EB', borderRadius: 10, backgroundColor: paymentType === 'partial' ? '#FEF3E7' : '#FFF', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#0C0C0C' }}>COD</span>
                    {paymentType === 'partial' && <CheckCircle size={18} style={{ color: '#B08B5C' }} />}
                  </div>
                  <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>৳{deliveryCharge} advance</p>
                </button>
                <button type="button" onClick={() => setPaymentType('full')} style={{ padding: 14, border: paymentType === 'full' ? '2px solid #B08B5C' : '1px solid #E5E7EB', borderRadius: 10, backgroundColor: paymentType === 'full' ? '#FEF3E7' : '#FFF', cursor: 'pointer', textAlign: 'left', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: -8, right: 8, padding: '3px 8px', backgroundColor: '#10B981', color: '#FFF', fontSize: 9, fontWeight: 600, borderRadius: 4 }}>FREE DELIVERY</span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#0C0C0C' }}>Full Pay</span>
                    {paymentType === 'full' && <CheckCircle size={18} style={{ color: '#B08B5C' }} />}
                  </div>
                  <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>৳{(subtotal - discount).toLocaleString()}</p>
                </button>
              </div>
            </div>

            {/* Payment Method */}
            <div style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0C0C0C', marginBottom: 16 }}>Payment Method</h2>
              <div style={{ display: 'flex', gap: 10 }}>
                {[{ id: 'bkash', name: 'bKash', color: '#E2136E' }, { id: 'nagad', name: 'Nagad', color: '#F6921E' }].map(m => (
                  <button key={m.id} type="button" onClick={() => setPaymentMethod(m.id)} style={{ flex: 1, padding: 14, border: paymentMethod === m.id ? '2px solid ' + m.color : '1px solid #E5E7EB', borderRadius: 10, backgroundColor: paymentMethod === m.id ? m.color + '10' : '#FFF', cursor: 'pointer' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: m.color }}>{m.name}</span>
                  </button>
                ))}
              </div>
              
              {/* Payment Breakdown */}
              <div style={{ marginTop: 16, padding: 14, backgroundColor: '#F9FAFB', borderRadius: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: '#6B7280' }}>Pay Now ({paymentMethod})</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#B08B5C' }}>৳{advanceAmount.toLocaleString()}</span>
                </div>
                {paymentType === 'partial' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: '#6B7280' }}>Pay on Delivery</span>
                    <span style={{ fontSize: 13, color: '#0C0C0C' }}>৳{codAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Place Order Button */}
            <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', marginTop: 20, padding: '18px', backgroundColor: '#B08B5C', color: '#FFF', fontSize: 16, fontWeight: 600, border: 'none', borderRadius: 12, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Processing...' : 'Pay ৳' + advanceAmount.toLocaleString() + ' & Place Order'}
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14 }}>
              <Shield size={14} style={{ color: '#10B981' }} />
              <span style={{ fontSize: 12, color: '#6B7280' }}>Secure & encrypted payment</span>
            </div>
          </div>
        )}

        {/* OTP Modal */}
        {showOtpModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 24, width: '100%', maxWidth: 360, textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: '#FEF3E7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Phone size={28} style={{ color: '#B08B5C' }} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#0C0C0C', marginBottom: 8 }}>Verify Phone</h3>
              <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>Enter 6-digit code sent to<br /><strong>{formData.phone}</strong></p>
              
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
                {otpValues.map((val, i) => (
                  <input key={i} ref={el => otpRefs.current[i] = el} type="text" inputMode="numeric" maxLength={1} value={val} onChange={(e) => handleOtpChange(i, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(i, e)} style={{ width: 45, height: 50, textAlign: 'center', fontSize: 20, fontWeight: 600, border: '2px solid ' + (val ? '#B08B5C' : '#E5E7EB'), borderRadius: 10, outline: 'none' }} />
                ))}
              </div>

              <button onClick={verifyOtp} disabled={loading} style={{ width: '100%', padding: '14px', backgroundColor: '#B08B5C', color: '#FFF', fontSize: 15, fontWeight: 600, border: 'none', borderRadius: 10, cursor: 'pointer', marginBottom: 16 }}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <p style={{ fontSize: 13, color: '#6B7280' }}>
                {otpTimer > 0 ? ('Resend in ' + otpTimer + 's') : (
                  <button onClick={sendOtp} style={{ background: 'none', border: 'none', color: '#B08B5C', fontWeight: 600, cursor: 'pointer' }}>Resend OTP</button>
                )}
              </p>
              
              <button onClick={() => setShowOtpModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} style={{ color: '#9CA3AF' }} /></button>
            </div>
          </div>
        )}

        {/* Location Modal */}
        {showLocationModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: '#FFF' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 12 }}>
              {locationStep === 'area' ? (
                <button onClick={() => { setLocationStep('district'); setLocationSearch(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><ChevronLeft size={22} /></button>
              ) : <div style={{ width: 22 }} />}
              <span style={{ flex: 1, textAlign: 'center', fontWeight: 600, fontSize: 16 }}>{locationStep === 'district' ? 'Select District' : 'Select Area'}</span>
              <button onClick={() => setShowLocationModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={22} /></button>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input value={locationSearch} onChange={(e) => setLocationSearch(e.target.value)} placeholder="Search..." style={{ width: '100%', padding: '14px 14px 14px 44px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 15, outline: 'none', boxSizing: 'border-box' }} autoFocus />
              </div>
            </div>
            <div style={{ height: 'calc(100vh - 140px)', overflowY: 'auto' }}>
              {locationStep === 'district' ? (
                districts.filter(d => d.name.toLowerCase().includes(locationSearch.toLowerCase())).map(d => (
                  <div key={d.id} onClick={() => selectDistrict(d)} style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 15 }}>{d.name}</span>
                    <ChevronLeft size={16} style={{ transform: 'rotate(180deg)', color: '#D1D5DB' }} />
                  </div>
                ))
              ) : (
                availableAreas.filter(a => a.name.toLowerCase().includes(locationSearch.toLowerCase())).map(a => (
                  <div key={a.id} onClick={() => selectArea(a)} style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6' }}>
                    <span style={{ fontSize: 15 }}>{a.name}</span>
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

  // ====================== DESKTOP PREMIUM SINGLE PAGE ======================
  return (
    <div style={{ backgroundColor: '#F9FAFB', minHeight: '100vh', paddingTop: 80, paddingBottom: 60 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 300, letterSpacing: 6, textAlign: 'center', marginBottom: 40, color: '#0C0C0C', textTransform: 'uppercase' }}>Secure Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 30, alignItems: 'start' }}>
            
            {/* Left Column - Form */}
            <div>
              {/* Contact Information */}
              <div style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 28, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <h2 style={{ fontSize: 17, fontWeight: 600, color: '#0C0C0C', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#FEF3E7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 13, fontWeight: 700, color: '#B08B5C' }}>1</span></div>
                  Contact Information
                </h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 8 }}>Full Name *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter your name" style={{ width: '100%', padding: '14px 16px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s' }} onFocus={(e) => e.target.style.borderColor = '#B08B5C'} onBlur={(e) => e.target.style.borderColor = '#E5E7EB'} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 8 }}>Email (Optional)</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="your@email.com" style={{ width: '100%', padding: '14px 16px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s' }} onFocus={(e) => e.target.style.borderColor = '#B08B5C'} onBlur={(e) => e.target.style.borderColor = '#E5E7EB'} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 8 }}>Phone Number *</label>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="01XXX-XXXXXX" disabled={otpVerified} style={{ width: '100%', padding: '14px 16px', border: '1px solid ' + (otpVerified ? '#10B981' : '#E5E7EB'), borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', backgroundColor: otpVerified ? '#F0FDF4' : '#FFF' }} />
                      {otpVerified && <CheckCircle size={18} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#10B981' }} />}
                    </div>
                    {!otpVerified && (
                      <button type="button" onClick={sendOtp} disabled={otpSending} style={{ padding: '14px 28px', backgroundColor: '#0C0C0C', color: '#FFF', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 10, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s' }} onMouseOver={(e) => e.target.style.backgroundColor = '#1F2937'} onMouseOut={(e) => e.target.style.backgroundColor = '#0C0C0C'}>
                        {otpSending ? 'Sending...' : 'Send OTP'}
                      </button>
                    )}
                  </div>
                  {otpVerified && <p style={{ fontSize: 12, color: '#10B981', marginTop: 8, fontWeight: 500 }}>✓ Phone number verified</p>}
                </div>
              </div>

              {/* Delivery Address */}
              <div style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 28, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <h2 style={{ fontSize: 17, fontWeight: 600, color: '#0C0C0C', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#FEF3E7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 13, fontWeight: 700, color: '#B08B5C' }}>2</span></div>
                  Delivery Address
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 8 }}>District & Area *</label>
                    <div onClick={openLocationSelector} style={{ width: '100%', padding: '14px 16px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 14, backgroundColor: '#FAFAFA', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxSizing: 'border-box', transition: 'border 0.2s' }} onMouseOver={(e) => e.currentTarget.style.borderColor = '#B08B5C'} onMouseOut={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}>
                      {formData.district ? (
                        <span style={{ color: '#0C0C0C' }}>{formData.district}{formData.area ? ' → ' + formData.area : ''}</span>
                      ) : (
                        <span style={{ color: '#9CA3AF' }}>Select District & Area</span>
                      )}
                      <MapPin size={18} style={{ color: '#B08B5C' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 8 }}>Full Address *</label>
                    <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="House, Road, Building, Landmark..." style={{ width: '100%', padding: '14px 16px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s' }} onFocus={(e) => e.target.style.borderColor = '#B08B5C'} onBlur={(e) => e.target.style.borderColor = '#E5E7EB'} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 8 }}>Delivery Note (Optional)</label>
                  <input type="text" name="note" value={formData.note} onChange={handleInputChange} placeholder="Special delivery instructions..." style={{ width: '100%', padding: '14px 16px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s' }} onFocus={(e) => e.target.style.borderColor = '#B08B5C'} onBlur={(e) => e.target.style.borderColor = '#E5E7EB'} />
                </div>
              </div>

              {/* Payment Type */}
              <div style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <h2 style={{ fontSize: 17, fontWeight: 600, color: '#0C0C0C', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#FEF3E7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 13, fontWeight: 700, color: '#B08B5C' }}>3</span></div>
                  Payment
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                  <button type="button" onClick={() => setPaymentType('partial')} style={{ padding: 18, border: paymentType === 'partial' ? '2px solid #B08B5C' : '1px solid #E5E7EB', borderRadius: 12, backgroundColor: paymentType === 'partial' ? '#FEF3E7' : '#FFF', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: '#0C0C0C' }}>Cash on Delivery</span>
                      {paymentType === 'partial' && <CheckCircle size={20} style={{ color: '#B08B5C' }} />}
                    </div>
                    <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Pay ৳{deliveryCharge} advance, rest on delivery</p>
                  </button>
                  <button type="button" onClick={() => setPaymentType('full')} style={{ padding: 18, border: paymentType === 'full' ? '2px solid #B08B5C' : '1px solid #E5E7EB', borderRadius: 12, backgroundColor: paymentType === 'full' ? '#FEF3E7' : '#FFF', cursor: 'pointer', textAlign: 'left', position: 'relative', transition: 'all 0.2s' }}>
                    <span style={{ position: 'absolute', top: -10, right: 12, padding: '4px 10px', backgroundColor: '#10B981', color: '#FFF', fontSize: 10, fontWeight: 600, borderRadius: 4 }}>FREE DELIVERY</span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: '#0C0C0C' }}>Full Payment</span>
                      {paymentType === 'full' && <CheckCircle size={20} style={{ color: '#B08B5C' }} />}
                    </div>
                    <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Pay ৳{(subtotal - discount).toLocaleString()} now</p>
                  </button>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 12 }}>Payment Method</label>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {[{ id: 'bkash', name: 'bKash', color: '#E2136E' }, { id: 'nagad', name: 'Nagad', color: '#F6921E' }].map(m => (
                      <button key={m.id} type="button" onClick={() => setPaymentMethod(m.id)} style={{ flex: 1, padding: 14, border: paymentMethod === m.id ? '2px solid ' + m.color : '1px solid #E5E7EB', borderRadius: 10, backgroundColor: paymentMethod === m.id ? m.color + '10' : '#FFF', cursor: 'pointer', transition: 'all 0.2s' }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: m.color }}>{m.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div style={{ position: 'sticky', top: 100 }}>
              <div style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <h2 style={{ fontSize: 17, fontWeight: 600, color: '#0C0C0C', marginBottom: 20 }}>Order Summary</h2>

                {/* Products */}
                <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 20 }}>
                  {items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
                      <div style={{ width: 56, height: 56, borderRadius: 10, backgroundColor: '#F3F4F6', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                        {item.image ? <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} /> : <Package size={22} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: '#D1D5DB' }} />}
                        <span style={{ position: 'absolute', top: -5, right: -5, width: 20, height: 20, backgroundColor: '#B08B5C', color: '#FFF', fontSize: 11, fontWeight: 600, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.quantity}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 500, color: '#0C0C0C', margin: 0, marginBottom: 4 }}>{item.name}</p>
                        <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>৳{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
                <div style={{ paddingTop: 16, paddingBottom: 16, borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB', marginBottom: 16 }}>
                  {appliedCoupon ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, backgroundColor: '#F0FDF4', borderRadius: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Tag size={16} style={{ color: '#10B981' }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#10B981' }}>{appliedCoupon.code}</span>
                        <span style={{ fontSize: 13, color: '#6B7280' }}>-৳{discount.toLocaleString()}</span>
                      </div>
                      <button type="button" onClick={handleRemoveCoupon} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} style={{ color: '#EF4444' }} /></button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 10 }}>
                      <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Coupon code" style={{ flex: 1, padding: '12px 14px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, outline: 'none' }} />
                      <button type="button" onClick={handleApplyCoupon} disabled={couponLoading} style={{ padding: '12px 20px', backgroundColor: '#0C0C0C', color: '#FFF', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 8, cursor: 'pointer' }}>{couponLoading ? '...' : 'Apply'}</button>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}><span style={{ fontSize: 14, color: '#6B7280' }}>Subtotal</span><span style={{ fontSize: 14, color: '#0C0C0C' }}>৳{subtotal.toLocaleString()}</span></div>
                  {discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}><span style={{ fontSize: 14, color: '#10B981' }}>Discount</span><span style={{ fontSize: 14, color: '#10B981' }}>-৳{discount.toLocaleString()}</span></div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}><span style={{ fontSize: 14, color: '#6B7280' }}>Delivery</span><span style={{ fontSize: 14, color: paymentType === 'full' ? '#10B981' : '#0C0C0C' }}>{paymentType === 'full' ? 'FREE' : '৳' + deliveryCharge}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid #E5E7EB' }}><span style={{ fontSize: 16, fontWeight: 600, color: '#0C0C0C' }}>Total</span><span style={{ fontSize: 20, fontWeight: 700, color: '#0C0C0C' }}>৳{total.toLocaleString()}</span></div>
                </div>

                {/* Payment Summary */}
                <div style={{ backgroundColor: '#F9FAFB', borderRadius: 10, padding: 16, marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: '#6B7280' }}>Pay Now ({paymentMethod})</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#B08B5C' }}>৳{advanceAmount.toLocaleString()}</span>
                  </div>
                  {paymentType === 'partial' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, color: '#6B7280' }}>Pay on Delivery</span>
                      <span style={{ fontSize: 13, color: '#0C0C0C' }}>৳{codAmount.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Submit */}
                <button type="submit" disabled={loading || !otpVerified} style={{ width: '100%', padding: 18, backgroundColor: otpVerified ? '#B08B5C' : '#D1D5DB', color: '#FFF', fontSize: 15, fontWeight: 600, border: 'none', borderRadius: 12, cursor: (loading || !otpVerified) ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>
                  {loading ? 'Processing...' : (otpVerified ? 'Pay ৳' + advanceAmount.toLocaleString() + ' & Place Order' : 'Verify Phone to Continue')}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 }}>
                  <Lock size={14} style={{ color: '#10B981' }} />
                  <span style={{ fontSize: 12, color: '#6B7280' }}>Secure checkout · Encrypted payment</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* OTP Modal - Desktop */}
      {showOtpModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#FFF', borderRadius: 20, padding: 36, width: 400, textAlign: 'center', position: 'relative' }}>
            <button onClick={() => setShowOtpModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer' }}><X size={22} style={{ color: '#9CA3AF' }} /></button>
            
            <div style={{ width: 70, height: 70, borderRadius: '50%', backgroundColor: '#FEF3E7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Phone size={32} style={{ color: '#B08B5C' }} />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 600, color: '#0C0C0C', marginBottom: 8 }}>Verify Your Phone</h3>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28 }}>Enter the 6-digit code sent to<br /><strong style={{ color: '#0C0C0C' }}>{formData.phone}</strong></p>
            
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 28 }}>
              {otpValues.map((val, i) => (
                <input key={i} ref={el => otpRefs.current[i] = el} type="text" inputMode="numeric" maxLength={1} value={val} onChange={(e) => handleOtpChange(i, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(i, e)} style={{ width: 50, height: 56, textAlign: 'center', fontSize: 22, fontWeight: 600, border: '2px solid ' + (val ? '#B08B5C' : '#E5E7EB'), borderRadius: 12, outline: 'none', transition: 'border 0.2s' }} onFocus={(e) => e.target.style.borderColor = '#B08B5C'} />
              ))}
            </div>

            <button onClick={verifyOtp} disabled={loading} style={{ width: '100%', padding: 16, backgroundColor: '#B08B5C', color: '#FFF', fontSize: 15, fontWeight: 600, border: 'none', borderRadius: 12, cursor: 'pointer', marginBottom: 16, transition: 'background 0.2s' }} onMouseOver={(e) => e.target.style.backgroundColor = '#9A7A4F'} onMouseOut={(e) => e.target.style.backgroundColor = '#B08B5C'}>
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>

            <p style={{ fontSize: 14, color: '#6B7280' }}>
              Didn't receive code? {otpTimer > 0 ? <span>Resend in {otpTimer}s</span> : <button onClick={sendOtp} disabled={otpSending} style={{ background: 'none', border: 'none', color: '#B08B5C', fontWeight: 600, cursor: 'pointer' }}>Resend OTP</button>}
            </p>
          </div>
        </div>
      )}

      {/* Location Modal - Desktop */}
      {showLocationModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#FFF', borderRadius: 16, width: 480, maxHeight: '70vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 14 }}>
              {locationStep === 'area' ? (
                <button onClick={() => { setLocationStep('district'); setLocationSearch(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><ChevronLeft size={22} /></button>
              ) : <div style={{ width: 22 }} />}
              <span style={{ flex: 1, textAlign: 'center', fontWeight: 600, fontSize: 16 }}>{locationStep === 'district' ? 'Select District' : 'Select Area in ' + formData.district}</span>
              <button onClick={() => setShowLocationModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={22} /></button>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input value={locationSearch} onChange={(e) => setLocationSearch(e.target.value)} placeholder={locationStep === 'district' ? 'Search district...' : 'Search area...'} style={{ width: '100%', padding: '14px 14px 14px 44px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} autoFocus />
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {locationStep === 'district' ? (
                districts.filter(d => d.name.toLowerCase().includes(locationSearch.toLowerCase())).map(d => (
                  <div key={d.id} onClick={() => selectDistrict(d)} style={{ padding: '14px 24px', borderBottom: '1px solid #F3F4F6', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.15s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FFF'}>
                    <span style={{ fontSize: 14 }}>{d.name}</span>
                    <ChevronLeft size={16} style={{ transform: 'rotate(180deg)', color: '#D1D5DB' }} />
                  </div>
                ))
              ) : (
                availableAreas.filter(a => a.name.toLowerCase().includes(locationSearch.toLowerCase())).map(a => (
                  <div key={a.id} onClick={() => selectArea(a)} style={{ padding: '14px 24px', borderBottom: '1px solid #F3F4F6', cursor: 'pointer', transition: 'background 0.15s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FFF'}>
                    <span style={{ fontSize: 14 }}>{a.name}</span>
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
