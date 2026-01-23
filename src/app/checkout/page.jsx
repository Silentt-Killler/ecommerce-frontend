'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronDown, ArrowRight, Lock, CheckCircle2, MapPin, ChevronLeft, Search, X } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import { districts } from '@/data/bangladesh-locations';
import api from '@/lib/api';
import toast from 'react-hot-toast';

function LoadingFallback() {
  return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF' }}><div style={{ width: 40, height: 40, border: '1px solid #111', borderRadius: '50%', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }}/></div>;
}

function CheckoutContent() {
  const router = useRouter();
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
  const [discount, setDiscount] = useState(0);
  
  // --- NEW LOCATION SELECTOR STATES ---
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationStep, setLocationStep] = useState('district'); // 'district' or 'area'
  const [locationSearch, setLocationSearch] = useState('');
  const [selectedDistrictObj, setSelectedDistrictObj] = useState(null);
  const [availableAreas, setAvailableAreas] = useState([]);
  const [deliveryCharge, setDeliveryCharge] = useState(60);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    if (user) setFormData(prev => ({ ...prev, name: user.name || '', phone: user.phone || '', email: user.email || '' }));
    return () => window.removeEventListener('resize', checkMobile);
  }, [user]);

  // Delivery Charge Calculation logic based on District Zone
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

  const subtotal = getSubtotal();
  const finalDeliveryCharge = paymentType === 'full' ? 0 : deliveryCharge;
  const total = subtotal - discount + finalDeliveryCharge;
  const advanceAmount = paymentType === 'full' ? (subtotal - discount) : deliveryCharge;
  
  const handleInputChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  // --- NEW LOCATION HANDLERS ---
  const openLocationSelector = () => {
    setShowLocationModal(true);
    setLocationStep('district');
    setLocationSearch('');
  };

  const selectDistrict = (d) => {
    setSelectedDistrictObj(d);
    setFormData(p => ({ ...p, district: d.name, area: '' }));
    setLocationStep('area');
    setLocationSearch(''); // Reset search for area step
  };

  const selectArea = (a) => {
    setFormData(p => ({ ...p, area: a.name }));
    setShowLocationModal(false);
  };

  const handleBackStep = () => {
    setLocationStep('district');
    setLocationSearch('');
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      const res = await api.post('/coupons/validate', { code: couponCode.toUpperCase(), subtotal });
      setAppliedCoupon(res.data);
      let disc = res.data.type === 'percentage' ? (subtotal * res.data.value) / 100 : res.data.value;
      if (res.data.max_discount && disc > res.data.max_discount) disc = res.data.max_discount;
      setDiscount(disc);
      toast.success('Code applied');
    } catch (err) { toast.error('Invalid code'); setDiscount(0); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.district || !formData.area || !formData.address) { 
        toast.error('Please fill all required fields'); 
        return; 
    }
    setLoading(true);
    try {
      const orderData = { 
        items: items.map(i => ({ product_id: i.productId, quantity: i.quantity, variant: i.variant, price: i.price, name: i.name, image: i.image })),
        shipping_address: formData, customer_phone: formData.phone, subtotal, discount, delivery_charge: finalDeliveryCharge, total, payment_type: paymentType, payment_method: paymentMethod, advance_paid: advanceAmount, cod_amount: paymentType === 'full' ? 0 : (total - advanceAmount), notes: formData.note 
      };
      const res = await api.post('/orders/guest', orderData);
      clearCart();
      router.push(`/order-success?order=${res.data.order_number}`);
    } catch (err) { toast.error('Order failed'); } finally { setLoading(false); }
  };

  if (!mounted) return <LoadingFallback />;
  if (items.length === 0) { router.push('/cart'); return null; }

  // --- STYLES ---
  const inputContainer = { marginBottom: 24 };
  const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8, color: '#333' };
  
  const inputStyle = { 
    width: '100%', 
    height: 52, 
    padding: '0 16px', 
    fontSize: 14, 
    border: '1px solid #E5E5E5', 
    borderRadius: 0, 
    outline: 'none', 
    backgroundColor: '#fff', 
    color: '#111', 
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  };

  // Pathao Style Location Box
  const locationBoxStyle = {
    ...inputStyle,
    backgroundColor: '#F3F4F6', // Light gray background like Pathao
    border: '1px solid #E5E7EB',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    color: formData.district ? '#111' : '#6B7280', // Dark text if selected, gray if placeholder
    fontWeight: formData.district ? 500 : 400
  };

  const sectionTitle = { fontFamily: '"Playfair Display", serif', fontSize: 24, color: '#111', marginBottom: 32, paddingBottom: 12, borderBottom: '1px solid #F0F0F0' };

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', paddingTop: isMobile ? 80 : 110 }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', maxWidth: 1400, margin: '0 auto' }}>
        
        {/* LEFT: FORM AREA */}
        <div style={{ flex: 1, padding: isMobile ? '30px 20px' : '0 80px 100px' }}>
           <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 36, marginBottom: 50, letterSpacing: '-0.5px' }}>CHECKOUT</h1>
           
           {/* Section: Shipping */}
           <div style={{ marginBottom: 60 }}>
              <h2 style={sectionTitle}>Shipping Address</h2>
              
              <div style={inputContainer}>
                <label style={labelStyle}>Full Name</label>
                <input name="name" value={formData.name} onChange={handleInputChange} style={inputStyle} placeholder="e.g. John Doe" required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, ...inputContainer }}>
                <div>
                   <label style={labelStyle}>Phone Number</label>
                   <input name="phone" value={formData.phone} onChange={handleInputChange} style={inputStyle} placeholder="01XXXXXXXXX" required />
                </div>
                <div>
                   <label style={labelStyle}>Email (Optional)</label>
                   <input name="email" value={formData.email} onChange={handleInputChange} style={inputStyle} placeholder="john@example.com" />
                </div>
              </div>

              {/* --- PATHAO STYLE LOCATION SELECTOR --- */}
              <div style={inputContainer}>
                <label style={labelStyle}>Delivery Area</label>
                <div onClick={openLocationSelector} style={locationBoxStyle}>
                    {formData.district ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                             <span>{formData.district}</span>
                             <ChevronDown size={14} style={{ transform: 'rotate(-90deg)', color: '#9CA3AF' }} />
                             <span style={{ color: formData.area ? '#111' : '#9CA3AF' }}>{formData.area || 'Select Area'}</span>
                        </div>
                    ) : (
                        <span>City &gt; Zone &gt; Area</span>
                    )}
                </div>

                {/* Location Selection Modal / Dropdown */}
                {showLocationModal && (
                    <div style={{ 
                        position: 'fixed', inset: 0, zIndex: 100, 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 
                    }}>
                        <div style={{ 
                            width: '100%', maxWidth: 450, backgroundColor: '#FFF', 
                            borderRadius: 8, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                            height: '80vh', display: 'flex', flexDirection: 'column'
                        }}>
                            {/* Header */}
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: 12 }}>
                                {locationStep === 'area' ? (
                                    <button type="button" onClick={handleBackStep} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><ChevronLeft size={20}/></button>
                                ) : (
                                    <div style={{ width: 28 }} /> // Spacer
                                )}
                                <span style={{ flex: 1, textAlign: 'center', fontWeight: 600, fontSize: 15 }}>
                                    {locationStep === 'district' ? 'Select City' : `Select Area in ${formData.district}`}
                                </span>
                                <button type="button" onClick={() => setShowLocationModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={20}/></button>
                            </div>

                            {/* Search */}
                            <div style={{ padding: 12, borderBottom: '1px solid #F0F0F0' }}>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <Search size={16} style={{ position: 'absolute', left: 12, color: '#999' }} />
                                    <input 
                                        autoFocus
                                        value={locationSearch}
                                        onChange={(e) => setLocationSearch(e.target.value)}
                                        placeholder={locationStep === 'district' ? "Search city..." : "Search area..."}
                                        style={{ width: '100%', height: 40, paddingLeft: 36, paddingRight: 12, border: '1px solid #E5E5E5', borderRadius: 6, outline: 'none', fontSize: 13 }}
                                    />
                                </div>
                            </div>

                            {/* List */}
                            <div style={{ flex: 1, overflowY: 'auto' }}>
                                {locationStep === 'district' ? (
                                    // District List
                                    districts
                                        .filter(d => d.name.toLowerCase().includes(locationSearch.toLowerCase()))
                                        .map(d => (
                                            <div 
                                                key={d.id} 
                                                onClick={() => selectDistrict(d)}
                                                style={{ padding: '14px 20px', borderBottom: '1px solid #FAFAFA', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                                onMouseOver={(e) => e.currentTarget.style.background = '#F9F9F9'}
                                                onMouseOut={(e) => e.currentTarget.style.background = '#FFF'}
                                            >
                                                <span style={{ fontSize: 14 }}>{d.name}</span>
                                                <ChevronDown size={14} style={{ transform: 'rotate(-90deg)', color: '#CCC' }} />
                                            </div>
                                        ))
                                ) : (
                                    // Area List
                                    availableAreas
                                        .filter(a => a.name.toLowerCase().includes(locationSearch.toLowerCase()))
                                        .map(a => (
                                            <div 
                                                key={a.id} 
                                                onClick={() => selectArea(a)}
                                                style={{ padding: '14px 20px', borderBottom: '1px solid #FAFAFA', cursor: 'pointer' }}
                                                onMouseOver={(e) => e.currentTarget.style.background = '#F9F9F9'}
                                                onMouseOut={(e) => e.currentTarget.style.background = '#FFF'}
                                            >
                                                <span style={{ fontSize: 14 }}>{a.name}</span>
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
              </div>
              {/* --- END LOCATION SELECTOR --- */}

              <div style={inputContainer}>
                <label style={labelStyle}>Address Details</label>
                <input name="address" value={formData.address} onChange={handleInputChange} style={inputStyle} placeholder="Enter full address" required />
              </div>
              
              <div style={inputContainer}>
                <label style={labelStyle}>Note (Optional)</label>
                <input name="note" value={formData.note} onChange={handleInputChange} style={inputStyle} placeholder="Special delivery instructions" />
              </div>
           </div>

           {/* Section: Payment Type */}
           <div>
              <h2 style={sectionTitle}>Payment Preference</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, marginBottom: 40 }}>
                 {/* Partial Card */}
                 <div 
                    onClick={() => setPaymentType('partial')} 
                    style={{ 
                      border: paymentType === 'partial' ? '2px solid #111' : '1px solid #E5E5E5', 
                      padding: '24px', 
                      cursor: 'pointer', 
                      backgroundColor: paymentType === 'partial' ? '#FFF' : '#FCFCFC',
                      transition: 'all 0.2s'
                    }}
                 >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                       <span style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Advance Payment</span>
                       {paymentType === 'partial' && <CheckCircle2 size={18} color="#111" />}
                    </div>
                    <p style={{ fontSize: 13, color: '#666', margin: 0, lineHeight: 1.5 }}>Pay only ৳{deliveryCharge} now to confirm order.</p>
                 </div>

                 {/* Full Payment Card */}
                 <div 
                    onClick={() => setPaymentType('full')} 
                    style={{ 
                      border: paymentType === 'full' ? '2px solid #111' : '1px solid #E5E5E5', 
                      padding: '24px', 
                      cursor: 'pointer', 
                      backgroundColor: paymentType === 'full' ? '#FFF' : '#FCFCFC',
                      position: 'relative',
                      transition: 'all 0.2s'
                    }}
                 >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                       <span style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Full Payment</span>
                       {paymentType === 'full' && <CheckCircle2 size={18} color="#111" />}
                    </div>
                    <p style={{ fontSize: 13, color: '#666', margin: 0, lineHeight: 1.5 }}>Pay full amount. <span style={{ color: '#009900', fontWeight: 600 }}>Get Free Delivery.</span></p>
                 </div>
              </div>

              {/* Gateway Selection */}
              <div style={{ marginBottom: 40 }}>
                 <label style={labelStyle}>Select Method</label>
                 <div style={{ display: 'flex', gap: 12 }}>
                    {['bkash', 'nagad', 'upay'].map(m => (
                       <button 
                          key={m} 
                          type="button"
                          onClick={() => setPaymentMethod(m)} 
                          style={{ 
                             flex: 1, 
                             height: 48,
                             border: paymentMethod === m ? '1px solid #111' : '1px solid #E5E5E5', 
                             backgroundColor: paymentMethod === m ? '#111' : '#FFF', 
                             color: paymentMethod === m ? '#FFF' : '#111',
                             cursor: 'pointer', 
                             textTransform: 'uppercase', 
                             fontSize: 12, 
                             fontWeight: 600, 
                             letterSpacing: '1px',
                             transition: 'all 0.2s'
                          }}
                       >
                          {m}
                       </button>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* RIGHT: ORDER SUMMARY (STICKY) */}
        <div style={{ width: isMobile ? '100%' : 420, backgroundColor: '#FAFAFA', borderLeft: isMobile ? 'none' : '1px solid #E5E5E5' }}>
           <div style={{ position: isMobile ? 'relative' : 'sticky', top: 0, padding: isMobile ? '40px 20px' : '50px 40px', height: '100%' }}>
              <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: 20, marginBottom: 30, letterSpacing: '0.5px' }}>YOUR ORDER</h3>
              
              <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 30, paddingRight: 5 }}>
                 {items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                       <div style={{ position: 'relative', width: 60, height: 75, background: '#FFF', border: '1px solid #F0F0F0', flexShrink: 0 }}>
                          {item.image && <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />}
                          <span style={{ position: 'absolute', top: -6, right: -6, background: '#111', color: '#FFF', fontSize: 10, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.quantity}</span>
                       </div>
                       <div>
                          <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 4px 0', lineHeight: 1.3, color: '#111' }}>{item.name}</p>
                          <p style={{ fontSize: 12, color: '#666', margin: 0 }}>৳{(item.price * item.quantity).toLocaleString()}</p>
                       </div>
                    </div>
                 ))}
              </div>

              <div style={{ borderTop: '1px solid #E5E5E5', borderBottom: '1px solid #E5E5E5', padding: '24px 0', marginBottom: 24 }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13 }}>
                    <span style={{ color: '#555' }}>Subtotal</span>
                    <span style={{ fontWeight: 500 }}>৳{subtotal.toLocaleString()}</span>
                 </div>
                 {discount > 0 && (
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13 }}>
                      <span style={{ color: '#555' }}>Discount</span>
                      <span style={{ color: '#111' }}>- ৳{discount.toLocaleString()}</span>
                   </div>
                 )}
                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#555' }}>Shipping</span>
                    <span>{paymentType === 'full' ? 'FREE' : `৳${deliveryCharge}`}</span>
                 </div>
              </div>
              
              <div style={{ display: 'flex', gap: 10, marginBottom: 30 }}>
                <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="COUPON CODE" style={{ ...inputStyle, height: 44, fontSize: 12, textTransform: 'uppercase', letterSpacing: '1px' }} />
                <button type="button" onClick={handleApplyCoupon} style={{ padding: '0 20px', background: '#111', color: '#FFF', border: 'none', fontSize: 11, textTransform: 'uppercase', cursor: 'pointer', letterSpacing: '1px', fontWeight: 600 }}>Apply</button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 30 }}>
                 <span style={{ fontSize: 16, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Total</span>
                 <span style={{ fontSize: 20, fontWeight: 700 }}>৳{total.toLocaleString()}</span>
              </div>

              <div style={{ backgroundColor: '#FFF', padding: 16, border: '1px solid #E5E5E5', marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
                  <span style={{ color: '#666', textTransform: 'uppercase' }}>To Pay Now</span>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>৳{advanceAmount.toLocaleString()}</span>
                </div>
                {paymentType === 'partial' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#666', textTransform: 'uppercase' }}>Cash on Delivery</span>
                    <span>৳{(total - advanceAmount).toLocaleString()}</span>
                  </div>
                )}
              </div>

              <button type="submit" disabled={loading} style={{ width: '100%', height: 56, backgroundColor: '#111', color: '#FFF', fontSize: 13, fontWeight: 600, letterSpacing: '2px', border: 'none', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, transition: 'background 0.3s' }}>
                 {loading ? 'PROCESSING...' : (
                   <>
                     <span>PLACE ORDER</span>
                     <ArrowRight size={16} />
                   </>
                 )}
              </button>
              
              <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: '#999', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                 <Lock size={12}/> Secure SSL Encryption
              </div>
           </div>
        </div>

      </form>
      
      {showLocationModal && <div style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowLocationModal(false)} />}
    </div>
  );
}

export default function CheckoutPage() {
  return <Suspense fallback={<LoadingFallback />}><CheckoutContent /></Suspense>;
}
