'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronDown, Check, Lock, ArrowRight } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import { districts } from '@/data/bangladesh-locations';
import api from '@/lib/api';
import toast from 'react-hot-toast';

function LoadingFallback() {
  return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF' }}><div style={{ width: 40, height: 40, border: '1px solid #000', borderRadius: '50%', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }}/></div>;
}

function CheckoutContent() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // States
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', district: '', area: '', address: '', note: '' });
  const [paymentType, setPaymentType] = useState('partial'); // 'partial' | 'full'
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  
  // Dropdown Logic
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

  // Delivery Logic
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
  
  // Handlers
  const handleDistrictSelect = (d) => { setSelectedDistrict(d); setFormData(p => ({ ...p, district: d.name, area: '' })); setDistrictSearch(d.name); setShowDistrictDropdown(false); setAreaSearch(''); };
  const handleAreaSelect = (a) => { setFormData(p => ({ ...p, area: a.name })); setAreaSearch(a.name); setShowAreaDropdown(false); };
  const handleInputChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  // Coupon
  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      const res = await api.post('/coupons/validate', { code: couponCode.toUpperCase(), subtotal });
      const coupon = res.data;
      setAppliedCoupon(coupon);
      let disc = coupon.type === 'percentage' ? (subtotal * coupon.value) / 100 : coupon.value;
      if (coupon.max_discount && disc > coupon.max_discount) disc = coupon.max_discount;
      setDiscount(disc);
      toast.success('Code applied');
    } catch (err) { toast.error('Invalid code'); setDiscount(0); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.district || !formData.address) { toast.error('Please fill all required fields'); return; }
    setLoading(true);
    try {
      const orderData = { 
        items: items.map(i => ({ product_id: i.productId, quantity: i.quantity, variant: i.variant, price: i.price, name: i.name, image: i.image })),
        shipping_address: formData, customer_phone: formData.phone, subtotal, discount, delivery_charge: finalDeliveryCharge, total, payment_type: paymentType, payment_method: paymentMethod, advance_paid: advanceAmount, cod_amount: paymentType === 'full' ? 0 : (total - advanceAmount), notes: formData.note 
      };
      const res = await api.post('/orders/guest', orderData);
      clearCart();
      router.push(`/order-success?order=${res.data.order_number}`);
    } catch (err) { toast.error('Order failed. Try again.'); } finally { setLoading(false); }
  };

  if (!mounted) return <LoadingFallback />;
  if (items.length === 0) { router.push('/cart'); return null; }

  // STYLES
  const inputStyle = { width: '100%', height: 50, padding: '0 16px', fontSize: 14, border: '1px solid #E0E0E0', borderRadius: 0, outline: 'none', backgroundColor: '#FFF', color: '#000', transition: 'border 0.2s', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8, color: '#000' };
  const sectionTitle = { fontFamily: '"Playfair Display", serif', fontSize: 22, color: '#000', marginBottom: 30, borderBottom: '1px solid #000', paddingBottom: 10 };

  return (
    <div style={{ backgroundColor: '#FFF', minHeight: '100vh', paddingTop: isMobile ? 80 : 100 }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', minHeight: '100vh' }}>
        
        {/* LEFT SIDE: Form (Scrollable) */}
        <div style={{ flex: 1, padding: isMobile ? '30px 20px' : '50px 80px', paddingBottom: 100 }}>
           <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 32, marginBottom: 50, letterSpacing: '-0.5px' }}>CHECKOUT</h1>
           
           {/* Contact & Shipping */}
           <div style={{ marginBottom: 60 }}>
              <h2 style={sectionTitle}>Shipping Details</h2>
              
              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Full Name</label>
                <input name="name" value={formData.name} onChange={handleInputChange} style={inputStyle} placeholder="Enter your name" required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                <div>
                   <label style={labelStyle}>Phone Number</label>
                   <input name="phone" value={formData.phone} onChange={handleInputChange} style={inputStyle} placeholder="01XXXXXXXXX" required />
                </div>
                <div>
                   <label style={labelStyle}>Email (Optional)</label>
                   <input name="email" value={formData.email} onChange={handleInputChange} style={inputStyle} placeholder="email@example.com" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                <div style={{ position: 'relative' }}>
                   <label style={labelStyle}>District</label>
                   <input value={districtSearch} onChange={(e) => { setDistrictSearch(e.target.value); setShowDistrictDropdown(true); }} onFocus={() => setShowDistrictDropdown(true)} style={inputStyle} placeholder="Select District" />
                   {showDistrictDropdown && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, maxHeight: 250, overflowY: 'auto', background: '#FFF', border: '1px solid #000', zIndex: 50 }}>
                         {districts.filter(d => d.name.toLowerCase().includes(districtSearch.toLowerCase())).map(d => (
                           <div key={d.id} onClick={() => handleDistrictSelect(d)} style={{ padding: '12px 16px', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid #F0F0F0', '&:hover': { background: '#F5F5F5'} }}>{d.name}</div>
                         ))}
                      </div>
                   )}
                </div>
                <div style={{ position: 'relative' }}>
                   <label style={labelStyle}>Area</label>
                   <input value={areaSearch} onChange={(e) => { setAreaSearch(e.target.value); setShowAreaDropdown(true); }} onFocus={() => setShowAreaDropdown(true)} style={inputStyle} placeholder="Select Area" disabled={!selectedDistrict} />
                   {showAreaDropdown && selectedDistrict && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, maxHeight: 250, overflowY: 'auto', background: '#FFF', border: '1px solid #000', zIndex: 50 }}>
                         {areas.filter(a => a.name.toLowerCase().includes(areaSearch.toLowerCase())).map(a => (
                           <div key={a.id} onClick={() => handleAreaSelect(a)} style={{ padding: '12px 16px', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid #F0F0F0' }}>{a.name}</div>
                         ))}
                      </div>
                   )}
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Street Address</label>
                <input name="address" value={formData.address} onChange={handleInputChange} style={inputStyle} placeholder="House no, Road no, Flat info..." required />
              </div>
              
              <div>
                <label style={labelStyle}>Note (Optional)</label>
                <input name="note" value={formData.note} onChange={handleInputChange} style={inputStyle} placeholder="Any special instructions" />
              </div>
           </div>

           {/* Payment Method */}
           <div>
              <h2 style={sectionTitle}>Payment</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, marginBottom: 30 }}>
                 <div onClick={() => setPaymentType('partial')} style={{ border: paymentType === 'partial' ? '1px solid #000' : '1px solid #E0E0E0', padding: 25, cursor: 'pointer', background: paymentType === 'partial' ? '#FAFAFA' : '#FFF' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase', marginBottom: 5 }}>Advance Payment</div>
                    <div style={{ fontSize: 12, color: '#666' }}>Pay ৳{deliveryCharge} delivery charge now. Rest on delivery.</div>
                 </div>
                 <div onClick={() => setPaymentType('full')} style={{ border: paymentType === 'full' ? '1px solid #000' : '1px solid #E0E0E0', padding: 25, cursor: 'pointer', background: paymentType === 'full' ? '#FAFAFA' : '#FFF', position: 'relative' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase', marginBottom: 5 }}>Full Payment</div>
                    <div style={{ fontSize: 12, color: '#666' }}>Pay full amount. Free Delivery.</div>
                    <span style={{ position: 'absolute', top: 0, right: 0, background: '#000', color: '#FFF', fontSize: 10, padding: '4px 8px', textTransform: 'uppercase', fontWeight: 600 }}>Best Value</span>
                 </div>
              </div>

              <div style={{ display: 'flex', gap: 15 }}>
                 {['bkash', 'nagad', 'upay'].map(m => (
                    <div key={m} onClick={() => setPaymentMethod(m)} style={{ flex: 1, padding: 12, border: paymentMethod === m ? '1px solid #000' : '1px solid #E0E0E0', textAlign: 'center', cursor: 'pointer', textTransform: 'uppercase', fontSize: 12, fontWeight: 600, background: paymentMethod === m ? '#000' : '#FFF', color: paymentMethod === m ? '#FFF' : '#000' }}>
                       {m}
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* RIGHT SIDE: Summary (Sticky) */}
        <div style={{ width: isMobile ? '100%' : 450, backgroundColor: '#F9F9F9', padding: isMobile ? '40px 20px' : '50px 40px', borderLeft: isMobile ? 'none' : '1px solid #E5E5E5' }}>
           <div style={{ position: 'sticky', top: 120 }}>
              <h3 style={{ fontSize: 16, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 30 }}>Your Order</h3>
              
              <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 30, paddingRight: 10 }}>
                 {items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 15, marginBottom: 20 }}>
                       <div style={{ position: 'relative', width: 60, height: 75, background: '#FFF' }}>
                          {item.image && <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />}
                          <span style={{ position: 'absolute', top: -8, right: -8, background: '#000', color: '#FFF', fontSize: 10, width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.quantity}</span>
                       </div>
                       <div>
                          <p style={{ fontSize: 13, fontWeight: 500, margin: 0, lineHeight: 1.4 }}>{item.name}</p>
                          <p style={{ fontSize: 12, color: '#666', marginTop: 4 }}>৳{(item.price * item.quantity).toLocaleString()}</p>
                       </div>
                    </div>
                 ))}
              </div>

              <div style={{ borderTop: '1px solid #E0E0E0', borderBottom: '1px solid #E0E0E0', padding: '20px 0', marginBottom: 30 }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13 }}>
                    <span style={{ color: '#666' }}>Subtotal</span>
                    <span>৳{subtotal.toLocaleString()}</span>
                 </div>
                 {discount > 0 && (
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13 }}>
                      <span style={{ color: '#666' }}>Discount</span>
                      <span>- ৳{discount.toLocaleString()}</span>
                   </div>
                 )}
                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#666' }}>Shipping</span>
                    <span>{paymentType === 'full' ? 'FREE' : `৳${deliveryCharge}`}</span>
                 </div>
              </div>
              
              {/* Coupon */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 30 }}>
                <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="COUPON CODE" style={{ ...inputStyle, height: 40, background: '#FFF', fontSize: 12, letterSpacing: '1px', textTransform: 'uppercase' }} />
                <button type="button" onClick={handleApplyCoupon} style={{ padding: '0 20px', background: '#000', color: '#FFF', border: 'none', fontSize: 11, textTransform: 'uppercase', cursor: 'pointer', letterSpacing: '1px' }}>Apply</button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 30 }}>
                 <span style={{ fontSize: 16, fontWeight: 600, textTransform: 'uppercase' }}>Total</span>
                 <span style={{ fontSize: 20, fontWeight: 600 }}>৳{total.toLocaleString()}</span>
              </div>

              <button type="submit" disabled={loading} style={{ width: '100%', height: 55, backgroundColor: '#000', color: '#FFF', fontSize: 13, fontWeight: 600, letterSpacing: '2px', border: 'none', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                 {loading ? 'PROCESSING...' : (
                   <>
                     <span>PLACE ORDER</span>
                     <ArrowRight size={16} />
                   </>
                 )}
              </button>
              
              <div style={{ textAlign: 'center', marginTop: 15, fontSize: 11, color: '#999', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                 <Lock size={12}/> Secure SSL Payment
              </div>
           </div>
        </div>

      </form>
      
      {/* Overlay for dropdowns */}
      {(showDistrictDropdown || showAreaDropdown) && <div onClick={() => { setShowDistrictDropdown(false); setShowAreaDropdown(false); }} style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'transparent' }} />}
    </div>
  );
}

export default function CheckoutPage() {
  return <Suspense fallback={<LoadingFallback />}><CheckoutContent /></Suspense>;
}
