'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Truck, ChevronDown, Check, X, Shield, CreditCard } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import { districts } from '@/data/bangladesh-locations';
import api from '@/lib/api';
import toast from 'react-hot-toast';

function LoadingFallback() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
      <div style={{ width: 40, height: 40, border: '1px solid #A68A6C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style jsx global>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [districtSearch, setDistrictSearch] = useState('');
  const [areaSearch, setAreaSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [areas, setAreas] = useState([]);
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
    if (selectedDistrict) {
      setAreas(selectedDistrict.areas || []);
      const zone = selectedDistrict.delivery_zone;
      if (zone === 'inside_dhaka') setDeliveryCharge(60);
      else if (zone === 'dhaka_suburban') setDeliveryCharge(80);
      else if (zone === 'chittagong_city') setDeliveryCharge(100);
      else setDeliveryCharge(120);
    }
  }, [selectedDistrict]);

  const filteredDistricts = districts.filter(d => d.name.toLowerCase().includes(districtSearch.toLowerCase()) || d.bn_name?.includes(districtSearch));
  const filteredAreas = areas.filter(a => a.name.toLowerCase().includes(areaSearch.toLowerCase()) || a.bn_name?.includes(areaSearch));

  const handleDistrictSelect = (district) => {
    setSelectedDistrict(district);
    setFormData(prev => ({ ...prev, district: district.name, area: '' }));
    setDistrictSearch(district.name);
    setShowDistrictDropdown(false);
    setAreaSearch('');
  };

  const handleAreaSelect = (area) => {
    setFormData(prev => ({ ...prev, area: area.name }));
    setAreaSearch(area.name);
    setShowAreaDropdown(false);
  };

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

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
      toast.success('Coupon applied');
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
    if (!formData.name || !formData.phone || !formData.district || !formData.area || !formData.address) { toast.error('Please fill all required fields'); return; }
    setLoading(true);
    try {
      const orderData = {
        items: items.map(item => ({ product_id: item.productId, name: item.name, image: item.image, price: item.price, quantity: item.quantity, variant: item.variant })),
        shipping_address: { name: formData.name, phone: formData.phone, email: formData.email, district: formData.district, area: formData.area, address: formData.address },
        customer_phone: formData.phone, subtotal, discount, coupon_code: appliedCoupon?.code || null, delivery_charge: finalDeliveryCharge, total, payment_type: paymentType, payment_method: paymentMethod, advance_paid: advanceAmount, cod_amount: codAmount, notes: formData.note
      };
      const res = await api.post('/orders/guest', orderData);
      clearCart();
      router.push('/order-success?order=' + res.data.order_number);
    } catch (error) { toast.error(error.response?.data?.detail || 'Failed to place order'); } 
    finally { setLoading(false); }
  };

  if (!mounted) return <LoadingFallback />;
  if (items.length === 0) { router.push('/cart'); return null; }

  // STYLES
  const serifFont = { fontFamily: '"Playfair Display", "Times New Roman", serif' };
  const inputContainerStyle = { marginBottom: 20 };
  const labelStyle = { display: 'block', fontSize: 11, fontWeight: 600, color: '#666', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '1px' };
  const inputStyle = { 
    width: '100%', 
    padding: '16px', 
    border: '1px solid #E5E5E5', 
    borderRadius: 0, // Sharp corners
    fontSize: 14, 
    outline: 'none', 
    boxSizing: 'border-box',
    backgroundColor: '#FFF',
    transition: 'border-color 0.2s',
    color: '#111'
  };
  
  const sectionHeaderStyle = { ...serifFont, fontSize: 18, color: '#111', marginBottom: 24, paddingBottom: 12, borderBottom: '1px solid #F0F0F0' };

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', paddingTop: isMobile ? 80 : 100, paddingBottom: 60 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: isMobile ? '0 16px' : '0 40px' }}>
        
        <h1 style={{ ...serifFont, fontSize: isMobile ? 24 : 36, textAlign: 'center', marginBottom: isMobile ? 30 : 50, color: '#111', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Secure Checkout
        </h1>

        <form onSubmit={handleSubmit}>
          <div style={{ display: isMobile ? 'flex' : 'grid', flexDirection: 'column', gridTemplateColumns: '1.5fr 1fr', gap: 60, alignItems: 'start' }}>
            
            {/* LEFT COLUMN: Form */}
            <div style={{ width: '100%' }}>
              
              {/* Shipping Address */}
              <div style={{ marginBottom: 40 }}>
                <h2 style={sectionHeaderStyle}>Shipping Address</h2>
                
                <div style={inputContainerStyle}>
                  <label style={labelStyle}>Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter full name" required style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#111'} onBlur={(e) => e.target.style.borderColor = '#E5E5E5'} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, marginBottom: 20 }}>
                  <div>
                    <label style={labelStyle}>Phone</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="01XXX-XXXXXX" required style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#111'} onBlur={(e) => e.target.style.borderColor = '#E5E5E5'} />
                  </div>
                  <div>
                    <label style={labelStyle}>Email (Optional)</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="name@example.com" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#111'} onBlur={(e) => e.target.style.borderColor = '#E5E5E5'} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, marginBottom: 20 }}>
                  <div style={{ position: 'relative' }}>
                    <label style={labelStyle}>District</label>
                    <div style={{ position: 'relative' }}>
                      <input type="text" value={districtSearch} onChange={(e) => { setDistrictSearch(e.target.value); setShowDistrictDropdown(true); }} onFocus={() => { setShowDistrictDropdown(true); }} placeholder="Select District" style={{ ...inputStyle, paddingRight: 36 }} />
                      <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                    </div>
                    {showDistrictDropdown && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, maxHeight: 200, overflowY: 'auto', backgroundColor: '#FFFFFF', border: '1px solid #111', zIndex: 20 }}>
                        {filteredDistricts.slice(0, 10).map((d) => (
                          <button type="button" key={d.id} onClick={() => handleDistrictSelect(d)} style={{ width: '100%', padding: '12px', textAlign: 'left', border: 'none', backgroundColor: '#FFF', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid #F5F5F5', transition: 'background 0.2s' }} onMouseOver={e => e.target.style.backgroundColor = '#F9F9F9'} onMouseOut={e => e.target.style.backgroundColor = '#FFF'}>
                            {d.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div style={{ position: 'relative' }}>
                    <label style={labelStyle}>Area</label>
                    <div style={{ position: 'relative' }}>
                      <input type="text" value={areaSearch} onChange={(e) => { setAreaSearch(e.target.value); setShowAreaDropdown(true); }} onFocus={() => setShowAreaDropdown(true)} placeholder={selectedDistrict ? "Select Area" : "Select District First"} disabled={!selectedDistrict} style={{ ...inputStyle, paddingRight: 36, opacity: selectedDistrict ? 1 : 0.5 }} />
                      <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                    </div>
                    {showAreaDropdown && selectedDistrict && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, maxHeight: 200, overflowY: 'auto', backgroundColor: '#FFFFFF', border: '1px solid #111', zIndex: 20 }}>
                        {filteredAreas.map((a) => (
                          <button type="button" key={a.id} onClick={() => handleAreaSelect(a)} style={{ width: '100%', padding: '12px', textAlign: 'left', border: 'none', backgroundColor: '#FFF', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid #F5F5F5' }} onMouseOver={e => e.target.style.backgroundColor = '#F9F9F9'} onMouseOut={e => e.target.style.backgroundColor = '#FFF'}>
                            {a.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div style={inputContainerStyle}>
                  <label style={labelStyle}>Street Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="House, Road, Block..." required style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#111'} onBlur={(e) => e.target.style.borderColor = '#E5E5E5'} />
                </div>
                
                <div style={inputContainerStyle}>
                  <label style={labelStyle}>Note (Optional)</label>
                  <input type="text" name="note" value={formData.note} onChange={handleInputChange} placeholder="Special instructions for delivery..." style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#111'} onBlur={(e) => e.target.style.borderColor = '#E5E5E5'} />
                </div>
              </div>

              {/* Payment Options */}
              <div style={{ marginBottom: 40 }}>
                <h2 style={sectionHeaderStyle}>Payment Preference</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
                  {/* Partial Payment Card */}
                  <div 
                    onClick={() => setPaymentType('partial')}
                    style={{ 
                      padding: 20, 
                      border: paymentType === 'partial' ? '1px solid #111' : '1px solid #E5E5E5', 
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: paymentType === 'partial' ? '#FAFAFA' : '#FFF'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#111', textTransform: 'uppercase', letterSpacing: '1px' }}>Advance Payment</span>
                      {paymentType === 'partial' && <div style={{ width: 8, height: 8, backgroundColor: '#111', borderRadius: '50%' }} />}
                    </div>
                    <p style={{ fontSize: 12, color: '#666', margin: 0 }}>Pay ৳{deliveryCharge} delivery charge now to confirm.</p>
                  </div>

                  {/* Full Payment Card */}
                  <div 
                    onClick={() => setPaymentType('full')}
                    style={{ 
                      padding: 20, 
                      border: paymentType === 'full' ? '1px solid #111' : '1px solid #E5E5E5', 
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: paymentType === 'full' ? '#FAFAFA' : '#FFF',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#111', textTransform: 'uppercase', letterSpacing: '1px' }}>Full Payment</span>
                      {paymentType === 'full' && <div style={{ width: 8, height: 8, backgroundColor: '#111', borderRadius: '50%' }} />}
                    </div>
                    <p style={{ fontSize: 12, color: '#666', margin: 0 }}>Pay full amount now.</p>
                    <span style={{ position: 'absolute', top: -10, right: 10, backgroundColor: '#A68A6C', color: '#FFF', fontSize: 10, padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Free Delivery</span>
                  </div>
                </div>

                {/* Gateway Selection */}
                <div style={{ marginTop: 24 }}>
                  <label style={labelStyle}>Select Method</label>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {['bkash', 'nagad', 'upay'].map((method) => (
                      <button 
                        key={method}
                        type="button" 
                        onClick={() => setPaymentMethod(method)} 
                        style={{ 
                          flex: 1, 
                          padding: '12px', 
                          border: paymentMethod === method ? '1px solid #111' : '1px solid #E5E5E5', 
                          backgroundColor: paymentMethod === method ? '#111' : '#FFF', 
                          color: paymentMethod === method ? '#FFF' : '#111',
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                          fontSize: 12,
                          letterSpacing: '1px',
                          fontWeight: 500,
                          transition: 'all 0.2s'
                        }}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Summary */}
            <div style={{ 
              backgroundColor: '#FAFAFA', 
              padding: isMobile ? 24 : 32, 
              border: '1px solid #F0F0F0',
              position: isMobile ? 'relative' : 'sticky', 
              top: 100 
            }}>
              <h2 style={{ ...serifFont, fontSize: 20, color: '#111', marginBottom: 20 }}>Your Order</h2>

              {/* Items */}
              <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #E5E5E5' }}>
                {items.map((item, index) => (
                  <div key={index} style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                    <div style={{ position: 'relative', width: 50, height: 60, backgroundColor: '#FFF', border: '1px solid #F5F5F5', flexShrink: 0 }}>
                      {item.image && <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />}
                      <span style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, backgroundColor: '#111', color: '#FFF', fontSize: 10, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.quantity}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#111', marginBottom: 4, lineHeight: 1.3 }}>{item.name}</p>
                      <p style={{ fontSize: 12, color: '#666' }}>৳{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div style={{ marginBottom: 24 }}>
                {appliedCoupon ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#F0F0F0', border: '1px solid #E5E5E5' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                       <span style={{ fontSize: 12, fontWeight: 600, color: '#111', letterSpacing: '1px' }}>{appliedCoupon.code}</span>
                       <span style={{ fontSize: 12, color: '#666' }}>(-৳{discount})</span>
                    </div>
                    <button type="button" onClick={handleRemoveCoupon} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><X size={14} /></button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', border: '1px solid #E5E5E5' }}>
                    <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="COUPON CODE" style={{ flex: 1, padding: '12px', border: 'none', fontSize: 12, outline: 'none', backgroundColor: '#FFF', letterSpacing: '1px', textTransform: 'uppercase' }} />
                    <button type="button" onClick={handleApplyCoupon} disabled={couponLoading} style={{ padding: '0 16px', backgroundColor: '#111', color: '#FFF', fontSize: 11, border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px' }}>Apply</button>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, color: '#666' }}>Subtotal</span>
                  <span style={{ fontSize: 13, color: '#111' }}>৳{subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontSize: 13, color: '#A68A6C' }}>Discount</span>
                    <span style={{ fontSize: 13, color: '#A68A6C' }}>-৳{discount.toLocaleString()}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ fontSize: 13, color: '#666' }}>Shipping</span>
                  <span style={{ fontSize: 13, color: paymentType === 'full' ? '#A68A6C' : '#111' }}>{paymentType === 'full' ? 'FREE' : '৳' + deliveryCharge}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid #E5E5E5' }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: '#111', textTransform: 'uppercase', letterSpacing: '1px' }}>Total</span>
                  <span style={{ fontSize: 18, fontWeight: 600, color: '#111' }}>৳{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Breakdown Box */}
              <div style={{ padding: 16, backgroundColor: '#FFF', border: '1px solid #E5E5E5', marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: '#666', textTransform: 'uppercase' }}>Pay Now via {paymentMethod}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#A68A6C' }}>৳{advanceAmount.toLocaleString()}</span>
                </div>
                {paymentType === 'partial' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: '#666', textTransform: 'uppercase' }}>Cash on Delivery</span>
                    <span style={{ fontSize: 12, color: '#111' }}>৳{codAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <button type="submit" disabled={loading} style={{ width: '100%', padding: '18px', backgroundColor: '#111', color: '#FFFFFF', fontSize: 13, fontWeight: 600, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1, textTransform: 'uppercase', letterSpacing: '2px', transition: 'background 0.3s' }} onMouseOver={e => !loading && (e.target.style.backgroundColor = '#333')} onMouseOut={e => !loading && (e.target.style.backgroundColor = '#111')}>
                {loading ? 'Processing...' : 'Place Order'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16 }}>
                <Shield size={12} color="#666" />
                <span style={{ fontSize: 11, color: '#666', letterSpacing: '0.5px' }}>Encrypted Payment</span>
              </div>
            </div>

          </div>
        </form>
      </div>

      {(showDistrictDropdown || showAreaDropdown) && <div onClick={() => { setShowDistrictDropdown(false); setShowAreaDropdown(false); }} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />}
    </div>
  );
}

export default function CheckoutPage() {
  return <Suspense fallback={<LoadingFallback />}><CheckoutContent /></Suspense>;
}
