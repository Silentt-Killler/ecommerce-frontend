'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
// Added Search, ChevronLeft, MapPin for the new modal
import { Truck, CreditCard, Shield, ChevronDown, Package, CheckCircle, Tag, X, Search, ChevronLeft, MapPin } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import { districts } from '@/data/bangladesh-locations';
import api from '@/lib/api';
import toast from 'react-hot-toast';

function LoadingFallback() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #B08B5C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, getSubtotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', district: '', area: '', address: '', note: '' });
  const [paymentType, setPaymentType] = useState('partial');
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [discount, setDiscount] = useState(0);

  // --- NEW PATHAO STYLE STATES ---
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationStep, setLocationStep] = useState('district'); // 'district' or 'area'
  const [locationSearch, setLocationSearch] = useState('');
  const [selectedDistrictObj, setSelectedDistrictObj] = useState(null);
  const [availableAreas, setAvailableAreas] = useState([]);
  const [deliveryCharge, setDeliveryCharge] = useState(60);
  // -------------------------------

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    if (user) setFormData(prev => ({ ...prev, name: user.name || '', phone: user.phone || '', email: user.email || '' }));
    return () => window.removeEventListener('resize', checkMobile);
  }, [user]);

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

  // --- NEW LOCATION HANDLERS ---
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

  const handleBackStep = () => {
    setLocationStep('district');
    setLocationSearch('');
  };
  // -----------------------------

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
      toast.success('Coupon applied! You saved ৳' + discountAmount.toLocaleString());
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid coupon code');
      setAppliedCoupon(null);
      setDiscount(0);
    } finally { setCouponLoading(false); }
  };

  const handleRemoveCoupon = () => { setAppliedCoupon(null); setCouponCode(''); setDiscount(0); toast.success('Coupon removed'); };

  const subtotal = getSubtotal();
  const finalDeliveryCharge = paymentType === 'full' ? 0 : deliveryCharge;
  const total = subtotal - discount + finalDeliveryCharge;
  const advanceAmount = paymentType === 'full' ? (subtotal - discount) : deliveryCharge;
  const codAmount = paymentType === 'full' ? 0 : (subtotal - discount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validating District and Area from formData
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
        subtotal, 
        discount, 
        coupon_code: appliedCoupon?.code || null, // Keeping your logic
        delivery_charge: finalDeliveryCharge, 
        total, 
        payment_type: paymentType, 
        payment_method: paymentMethod, 
        advance_paid: advanceAmount, 
        cod_amount: codAmount, 
        notes: formData.note
      };
      const res = await api.post('/orders/guest', orderData);
      clearCart();
      router.push('/order-success?order=' + res.data.order_number);
    } catch (error) { toast.error(error.response?.data?.detail || 'Failed to place order'); } 
    finally { setLoading(false); }
  };

  if (!mounted) return <LoadingFallback />;
  if (items.length === 0) { router.push('/cart'); return null; }

  const inputStyle = { width: '100%', padding: isMobile ? '12px 14px' : '10px 14px', border: '1px solid #E0E0E0', borderRadius: 6, fontSize: 14, outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 500, color: '#0C0C0C', marginBottom: 6 };

  // Pathao Style Box CSS
  const locationBoxStyle = {
    ...inputStyle,
    cursor: 'pointer',
    backgroundColor: '#FAFAFA', // Slightly different bg to indicate interactable
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: formData.district ? '#0C0C0C' : '#9CA3AF'
  };

  return (
    <div style={{ backgroundColor: '#F7F7F7', minHeight: '100vh', paddingTop: isMobile ? 70 : 90, paddingBottom: isMobile ? 40 : 40 }}>
      <div style={{ maxWidth: 1050, margin: '0 auto', padding: isMobile ? '0 16px' : '0 20px' }}>
        <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: isMobile ? 600 : 400, letterSpacing: isMobile ? 2 : 4, textAlign: 'center', marginBottom: isMobile ? 20 : 30, color: '#0C0C0C', textTransform: 'uppercase' }}>Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div style={{ display: isMobile ? 'flex' : 'grid', flexDirection: 'column', gridTemplateColumns: '1fr 380px', gap: isMobile ? 16 : 24, alignItems: 'start' }}>
            
            {/* Left Column */}
            <div style={{ width: '100%' }}>
              {/* Customer Info */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: isMobile ? '16px' : '20px 24px', marginBottom: 16 }}>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0C0C0C', marginBottom: 16 }}>Customer Information</h2>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Full Name <span style={{ color: '#DC2626' }}>*</span></label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter your name" required style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Phone Number <span style={{ color: '#DC2626' }}>*</span></label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="01XXX-XXXXXX" required style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="your@email.com" style={inputStyle} />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: isMobile ? '16px' : '20px 24px', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Truck size={18} style={{ color: '#B08B5C' }} />
                  <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0C0C0C', margin: 0 }}>Delivery Address</h2>
                </div>

                {/* --- PATHAO STYLE LOCATION SELECTOR START --- */}
                <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Delivery Area <span style={{ color: '#DC2626' }}>*</span></label>
                    <div onClick={openLocationSelector} style={locationBoxStyle}>
                        {formData.district ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 600 }}>{formData.district}</span>
                                <ChevronDown size={14} style={{ transform: 'rotate(-90deg)', color: '#B08B5C' }} />
                                <span style={{ color: formData.area ? '#0C0C0C' : '#9CA3AF' }}>{formData.area || 'Select Area'}</span>
                            </div>
                        ) : (
                            <span>City &gt; Zone &gt; Area</span>
                        )}
                        <MapPin size={16} style={{ color: '#B08B5C' }} />
                    </div>
                </div>

                {/* MODAL FOR SELECTION */}
                {showLocationModal && (
                    <div style={{ 
                        position: 'fixed', inset: 0, zIndex: 100, 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        backgroundColor: 'rgba(0,0,0,0.5)', padding: 16 
                    }}>
                        <div style={{ 
                            width: '100%', maxWidth: 450, backgroundColor: '#FFF', 
                            borderRadius: 12, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                            height: '70vh', display: 'flex', flexDirection: 'column'
                        }}>
                            {/* Modal Header */}
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: 12 }}>
                                {locationStep === 'area' ? (
                                    <button type="button" onClick={handleBackStep} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><ChevronLeft size={20}/></button>
                                ) : (
                                    <div style={{ width: 28 }} /> 
                                )}
                                <span style={{ flex: 1, textAlign: 'center', fontWeight: 600, fontSize: 15, color: '#111' }}>
                                    {locationStep === 'district' ? 'Select City' : `Select Area in ${formData.district}`}
                                </span>
                                <button type="button" onClick={() => setShowLocationModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={20}/></button>
                            </div>

                            {/* Search Bar */}
                            <div style={{ padding: 12, borderBottom: '1px solid #F0F0F0' }}>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <Search size={16} style={{ position: 'absolute', left: 12, color: '#999' }} />
                                    <input 
                                        autoFocus
                                        value={locationSearch}
                                        onChange={(e) => setLocationSearch(e.target.value)}
                                        placeholder={locationStep === 'district' ? "Search city..." : "Search area..."}
                                        style={{ width: '100%', height: 40, paddingLeft: 36, paddingRight: 12, border: '1px solid #E5E5E5', borderRadius: 8, outline: 'none', fontSize: 14 }}
                                    />
                                </div>
                            </div>

                            {/* List */}
                            <div style={{ flex: 1, overflowY: 'auto' }}>
                                {locationStep === 'district' ? (
                                    // District List
                                    districts
                                        .filter(d => d.name.toLowerCase().includes(locationSearch.toLowerCase()) || d.bn_name?.includes(locationSearch))
                                        .map(d => (
                                            <div 
                                                key={d.id} 
                                                onClick={() => selectDistrict(d)}
                                                style={{ padding: '14px 20px', borderBottom: '1px solid #FAFAFA', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                                onMouseOver={(e) => e.currentTarget.style.background = '#F9F9F9'}
                                                onMouseOut={(e) => e.currentTarget.style.background = '#FFF'}
                                            >
                                                <span style={{ fontSize: 14, color: '#333' }}>{d.name}</span>
                                                <ChevronDown size={14} style={{ transform: 'rotate(-90deg)', color: '#CCC' }} />
                                            </div>
                                        ))
                                ) : (
                                    // Area List
                                    availableAreas
                                        .filter(a => a.name.toLowerCase().includes(locationSearch.toLowerCase()) || a.bn_name?.includes(locationSearch))
                                        .map(a => (
                                            <div 
                                                key={a.id} 
                                                onClick={() => selectArea(a)}
                                                style={{ padding: '14px 20px', borderBottom: '1px solid #FAFAFA', cursor: 'pointer' }}
                                                onMouseOver={(e) => e.currentTarget.style.background = '#F9F9F9'}
                                                onMouseOut={(e) => e.currentTarget.style.background = '#FFF'}
                                            >
                                                <span style={{ fontSize: 14, color: '#333' }}>{a.name}</span>
                                            </div>
                                        ))
                                )}
                                {/* Empty State */}
                                {((locationStep === 'district' && districts.length === 0) || (locationStep === 'area' && availableAreas.length === 0)) && (
                                    <div style={{ padding: 20, textAlign: 'center', color: '#999', fontSize: 13 }}>No results found</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                {/* --- PATHAO STYLE LOCATION SELECTOR END --- */}

                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Street Address <span style={{ color: '#DC2626' }}>*</span></label>
                  <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="House, road, building, landmark..." required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Delivery Note (Optional)</label>
                  <input type="text" name="note" value={formData.note} onChange={handleInputChange} placeholder="Special instructions..." style={inputStyle} />
                </div>
              </div>

              {/* Payment Type */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: isMobile ? '16px' : '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <CreditCard size={18} style={{ color: '#B08B5C' }} />
                  <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0C0C0C', margin: 0 }}>Payment Type</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <button type="button" onClick={() => setPaymentType('partial')} style={{ padding: isMobile ? '12px' : '14px 16px', border: paymentType === 'partial' ? '2px solid #B08B5C' : '1px solid #E0E0E0', borderRadius: 8, backgroundColor: paymentType === 'partial' ? '#FDF8F3' : '#FFFFFF', cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: isMobile ? 12 : 13, fontWeight: 600, color: '#0C0C0C' }}>Pay Advance</span>
                      {paymentType === 'partial' && <CheckCircle size={16} style={{ color: '#B08B5C' }} />}
                    </div>
                    <p style={{ fontSize: 11, color: '#919191', margin: 0 }}>৳{deliveryCharge} now</p>
                  </button>
                  <button type="button" onClick={() => setPaymentType('full')} style={{ padding: isMobile ? '12px' : '14px 16px', border: paymentType === 'full' ? '2px solid #B08B5C' : '1px solid #E0E0E0', borderRadius: 8, backgroundColor: paymentType === 'full' ? '#FDF8F3' : '#FFFFFF', cursor: 'pointer', textAlign: 'left', position: 'relative' }}>
                    <span style={{ position: 'absolute', top: -8, right: 8, padding: '2px 6px', backgroundColor: '#059669', color: '#FFFFFF', fontSize: 9, fontWeight: 600, borderRadius: 4 }}>FREE DELIVERY</span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: isMobile ? 12 : 13, fontWeight: 600, color: '#0C0C0C' }}>Full Payment</span>
                      {paymentType === 'full' && <CheckCircle size={16} style={{ color: '#B08B5C' }} />}
                    </div>
                    <p style={{ fontSize: 11, color: '#919191', margin: 0 }}>৳{(subtotal - discount).toLocaleString()} now</p>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: isMobile ? 16 : 24, width: '100%', position: isMobile ? 'relative' : 'sticky', top: isMobile ? 'auto' : 90 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0C0C0C', marginBottom: 16 }}>Order Summary</h2>

              {/* Products */}
              <div style={{ marginBottom: 16, maxHeight: isMobile ? 120 : 160, overflowY: 'auto' }}>
                {items.map((item, index) => (
                  <div key={index} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                    <div style={{ position: 'relative', width: 48, height: 48, backgroundColor: '#F5F5F5', borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
                      {item.image ? <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={18} style={{ color: '#D0D0D0' }} /></div>}
                      <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, backgroundColor: '#B08B5C', color: '#FFFFFF', fontSize: 9, fontWeight: 600, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.quantity}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#0C0C0C', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                      <p style={{ fontSize: 12, color: '#919191', margin: 0 }}>৳{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #E8E8E8' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#0C0C0C', marginBottom: 8 }}>Have a coupon?</label>
                {appliedCoupon ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: '#F0FDF4', borderRadius: 6, border: '1px solid #BBF7D0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Tag size={16} style={{ color: '#059669' }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#059669' }}>{appliedCoupon.code}</span>
                      <span style={{ fontSize: 12, color: '#666' }}>(-৳{discount.toLocaleString()})</span>
                    </div>
                    <button type="button" onClick={handleRemoveCoupon} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={16} style={{ color: '#DC2626' }} /></button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Enter code" style={{ flex: 1, padding: '10px 12px', border: '1px solid #E0E0E0', borderRadius: 6, fontSize: 13, outline: 'none', fontFamily: 'monospace' }} />
                    <button type="button" onClick={handleApplyCoupon} disabled={couponLoading} style={{ padding: '10px 16px', backgroundColor: '#0C0C0C', color: '#FFFFFF', fontSize: 12, fontWeight: 500, border: 'none', borderRadius: 6, cursor: couponLoading ? 'not-allowed' : 'pointer', opacity: couponLoading ? 0.7 : 1 }}>{couponLoading ? '...' : 'Apply'}</button>
                  </div>
                )}
              </div>

              {/* Pricing */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: '#666' }}>Subtotal</span>
                  <span style={{ fontSize: 13, color: '#0C0C0C' }}>৳{subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: '#059669' }}>Discount</span>
                    <span style={{ fontSize: 13, color: '#059669' }}>-৳{discount.toLocaleString()}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, color: '#666' }}>Delivery</span>
                  <span style={{ fontSize: 13, color: paymentType === 'full' ? '#059669' : '#0C0C0C' }}>{paymentType === 'full' ? 'FREE' : '৳' + deliveryCharge}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #E8E8E8' }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#0C0C0C' }}>Total</span>
                  <span style={{ fontSize: 17, fontWeight: 700, color: '#0C0C0C' }}>৳{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 10 }}>Payment Method</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={() => setPaymentMethod('bkash')} style={{ flex: 1, padding: '10px', border: paymentMethod === 'bkash' ? '2px solid #E2136E' : '1px solid #E0E0E0', borderRadius: 6, backgroundColor: paymentMethod === 'bkash' ? '#FDF2F8' : '#FFFFFF', cursor: 'pointer' }}><span style={{ fontSize: 12, fontWeight: 600, color: '#E2136E' }}>bKash</span></button>
                  <button type="button" onClick={() => setPaymentMethod('nagad')} style={{ flex: 1, padding: '10px', border: paymentMethod === 'nagad' ? '2px solid #F6921E' : '1px solid #E0E0E0', borderRadius: 6, backgroundColor: paymentMethod === 'nagad' ? '#FFF7ED' : '#FFFFFF', cursor: 'pointer' }}><span style={{ fontSize: 12, fontWeight: 600, color: '#F6921E' }}>Nagad</span></button>
                  <button type="button" onClick={() => setPaymentMethod('upay')} style={{ flex: 1, padding: '10px', border: paymentMethod === 'upay' ? '2px solid #00A651' : '1px solid #E0E0E0', borderRadius: 6, backgroundColor: paymentMethod === 'upay' ? '#F0FDF4' : '#FFFFFF', cursor: 'pointer' }}><span style={{ fontSize: 12, fontWeight: 600, color: '#00A651' }}>Upay</span></button>
                </div>
              </div>

              {/* Payment Breakdown */}
              <div style={{ backgroundColor: '#FAFAFA', borderRadius: 6, padding: 12, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: '#666' }}>Pay Now ({paymentMethod})</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#B08B5C' }}>৳{advanceAmount.toLocaleString()}</span>
                </div>
                {paymentType === 'partial' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: '#666' }}>Pay on Delivery</span>
                    <span style={{ fontSize: 12, color: '#0C0C0C' }}>৳{codAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', backgroundColor: '#B08B5C', color: '#FFFFFF', fontSize: 14, fontWeight: 600, border: 'none', borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, textTransform: 'uppercase', letterSpacing: 1 }}>
                {loading ? 'Processing...' : 'Pay ৳' + advanceAmount.toLocaleString() + ' & Place Order'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12 }}>
                <Shield size={14} style={{ color: '#059669' }} />
                <span style={{ fontSize: 11, color: '#919191' }}>Secure & encrypted payment</span>
              </div>
            </div>
          </div>
        </form>
      </div>

      {showLocationModal && <div style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowLocationModal(false)} />}
      <style jsx global>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function CheckoutPage() {
  return <Suspense fallback={<LoadingFallback />}><CheckoutContent /></Suspense>;
}
