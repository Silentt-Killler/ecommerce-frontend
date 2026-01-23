'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronDown, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
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
  
  // Dropdown states
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [districtSearch, setDistrictSearch] = useState('');
  const [areaSearch, setAreaSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [areas, setAreas] = useState([]);
  const [deliveryCharge, setDeliveryCharge] = useState(60);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    if (user) setFormData(prev => ({ ...prev, name: user.name || '', phone: user.phone || '', email: user.email || '' }));
    return () => window.removeEventListener('resize', checkMobile);
  }, [user]);

  useEffect(() => {
    if (selectedDistrict) {
      setAreas(selectedDistrict.areas || []);
      const zone = selectedDistrict.delivery_zone;
      if (zone === 'inside_dhaka') setDeliveryCharge(60);
      else if (zone === 'dhaka_suburban') setDeliveryCharge(80);
      else if (zone === 'chittagong_city') setDeliveryCharge(100);
      else setDeliveryCharge(120);
    }
  }, [selectedDistrict]);

  const subtotal = getSubtotal();
  const finalDeliveryCharge = paymentType === 'full' ? 0 : deliveryCharge;
  const total = subtotal - discount + finalDeliveryCharge;
  const advanceAmount = paymentType === 'full' ? (subtotal - discount) : deliveryCharge;
  
  const handleDistrictSelect = (d) => { setSelectedDistrict(d); setFormData(p => ({ ...p, district: d.name, area: '' })); setDistrictSearch(d.name); setShowDistrictDropdown(false); setAreaSearch(''); };
  const handleAreaSelect = (a) => { setFormData(p => ({ ...p, area: a.name })); setAreaSearch(a.name); setShowAreaDropdown(false); };
  const handleInputChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

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
    if (!formData.name || !formData.phone || !formData.district || !formData.address) { toast.error('Please fill required fields'); return; }
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

  // --- PREMIUM STYLES ---
  const inputContainer = { marginBottom: 24 };
  const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8, color: '#333' };
  
  // New Input Style: Cleaner, Taller, Subtle Border
  const inputStyle = { 
    width: '100%', 
    height: 52, // Taller for premium feel
    padding: '0 16px', 
    fontSize: 14, 
    border: '1px solid #E5E5E5', // Very subtle default border
    borderRadius: 0, 
    outline: 'none', 
    backgroundColor: '#fff', // White background
    color: '#111', 
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  };

  // Helper to handle focus style via inline function wasn't ideal, using onFocus/onBlur in JSX or simple CSS class would be better.
  // Here I'll use inline styles with state would be complex for all inputs. 
  // Instead, I will rely on a simple cleaner look. *Note: In a real CSS file, I'd add :focus { border-color: #000 }*
  // For inline, I will keep it clean gray.

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

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, ...inputContainer }}>
                <div style={{ position: 'relative' }}>
                   <label style={labelStyle}>District</label>
                   <div style={{ position: 'relative' }}>
                      <input value={districtSearch} onChange={(e) => { setDistrictSearch(e.target.value); setShowDistrictDropdown(true); }} onFocus={() => setShowDistrictDropdown(true)} style={{...inputStyle, paddingRight: 30}} placeholder="Select District" />
                      <ChevronDown size={16} style={{ position: 'absolute', right: 12, top: 18, color: '#999', pointerEvents: 'none' }} />
                   </div>
                   {showDistrictDropdown && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, maxHeight: 220, overflowY: 'auto', background: '#FFF', border: '1px solid #E5E5E5', zIndex: 50, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                         {districts.filter(d => d.name.toLowerCase().includes(districtSearch.toLowerCase())).map(d => (
                           <div key={d.id} onClick={() => handleDistrictSelect(d)} style={{ padding: '12px 16px', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid #FAFAFA', transition: 'background 0.2s' }} onMouseOver={(e)=>e.currentTarget.style.background='#F9F9F9'} onMouseOut={(e)=>e.currentTarget.style.background='#FFF'}>{d.name}</div>
                         ))}
                      </div>
                   )}
                </div>
                <div style={{ position: 'relative' }}>
                   <label style={labelStyle}>Area</label>
                   <div style={{ position: 'relative' }}>
                      <input value={areaSearch} onChange={(e) => { setAreaSearch(e.target.value); setShowAreaDropdown(true); }} onFocus={() => setShowAreaDropdown(true)} style={{...inputStyle, opacity: selectedDistrict ? 1 : 0.6}} placeholder="Select Area" disabled={!selectedDistrict} />
                      <ChevronDown size={16} style={{ position: 'absolute', right: 12, top: 18, color: '#999', pointerEvents: 'none' }} />
                   </div>
                   {showAreaDropdown && selectedDistrict && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, maxHeight: 220, overflowY: 'auto', background: '#FFF', border: '1px solid #E5E5E5', zIndex: 50, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                         {areas.filter(a => a.name.toLowerCase().includes(areaSearch.toLowerCase())).map(a => (
                           <div key={a.id} onClick={() => handleAreaSelect(a)} style={{ padding: '12px 16px', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid #FAFAFA' }} onMouseOver={(e)=>e.currentTarget.style.background='#F9F9F9'} onMouseOut={(e)=>e.currentTarget.style.background='#FFF'}>{a.name}</div>
                         ))}
                      </div>
                   )}
                </div>
              </div>

              <div style={inputContainer}>
                <label style={labelStyle}>Address</label>
                <input name="address" value={formData.address} onChange={handleInputChange} style={inputStyle} placeholder="House, Road, Block etc." required />
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
      
      {(showDistrictDropdown || showAreaDropdown) && <div onClick={() => { setShowDistrictDropdown(false); setShowAreaDropdown(false); }} style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'transparent' }} />}
    </div>
  );
}

export default function CheckoutPage() {
  return <Suspense fallback={<LoadingFallback />}><CheckoutContent /></Suspense>;
}
