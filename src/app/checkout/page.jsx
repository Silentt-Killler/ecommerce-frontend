'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Truck, CreditCard, Shield, ChevronDown, Package, CheckCircle } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import { districts } from '@/data/bangladesh-locations';
import api from '@/lib/api';
import toast from 'react-hot-toast';

// Loading fallback
function LoadingFallback() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #B08B5C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );
}

// Main checkout content
function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, getSubtotal, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    district: '',
    area: '',
    address: '',
    note: ''
  });
  
  // Payment
  const [paymentType, setPaymentType] = useState('partial'); // partial or full
  const [paymentMethod, setPaymentMethod] = useState('bkash'); // bkash, nagad, upay
  
  // Location
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [districtSearch, setDistrictSearch] = useState('');
  const [areaSearch, setAreaSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [areas, setAreas] = useState([]);
  
  // Delivery charge
  const [deliveryCharge, setDeliveryCharge] = useState(60);

  useEffect(() => {
    setMounted(true);
    
    // Pre-fill user data
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    if (selectedDistrict) {
      setAreas(selectedDistrict.areas || []);
      // Calculate delivery charge based on zone
      const zone = selectedDistrict.delivery_zone;
      if (zone === 'inside_dhaka') setDeliveryCharge(60);
      else if (zone === 'dhaka_suburban') setDeliveryCharge(80);
      else if (zone === 'chittagong_city') setDeliveryCharge(100);
      else setDeliveryCharge(120);
    }
  }, [selectedDistrict]);

  // Filter districts
  const filteredDistricts = districts.filter(d => 
    d.name.toLowerCase().includes(districtSearch.toLowerCase()) ||
    d.bn_name?.includes(districtSearch)
  );

  // Filter areas
  const filteredAreas = areas.filter(a => 
    a.name.toLowerCase().includes(areaSearch.toLowerCase()) ||
    a.bn_name?.includes(areaSearch)
  );

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

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const subtotal = getSubtotal();
  const total = subtotal + deliveryCharge;
  const advanceAmount = deliveryCharge;
  const codAmount = subtotal;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.district || !formData.area || !formData.address) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        items: items.map(item => ({
          product_id: item.productId,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
          variant: item.variant
        })),
        shipping_address: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          district: formData.district,
          area: formData.area,
          address: formData.address
        },
        subtotal,
        delivery_charge: deliveryCharge,
        total,
        payment_type: paymentType,
        payment_method: paymentMethod,
        advance_paid: paymentType === 'full' ? total : advanceAmount,
        cod_amount: paymentType === 'full' ? 0 : codAmount,
        notes: formData.note
      };

      const res = await api.post('/orders/guest', orderData);
      
      clearCart();
      router.push(`/order-success?order=${res.data.order_number}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return <LoadingFallback />;

  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  return (
    <div style={{ backgroundColor: '#F7F7F7', minHeight: '100vh', paddingTop: 90, paddingBottom: 40 }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 20px' }}>
        
        {/* Title */}
        <h1 style={{ 
          fontSize: 24, 
          fontWeight: 400, 
          letterSpacing: 4, 
          textAlign: 'center',
          marginBottom: 30,
          color: '#0C0C0C',
          textTransform: 'uppercase'
        }}>
          Checkout
        </h1>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
            
            {/* Left Column */}
            <div>
              {/* Customer Information */}
              <div style={{ 
                backgroundColor: '#FFFFFF', 
                borderRadius: 8, 
                padding: '20px 24px',
                marginBottom: 16,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0C0C0C', marginBottom: 16 }}>
                  Customer Information
                </h2>
                
                {/* Name */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#0C0C0C', marginBottom: 6 }}>
                    Full Name <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name as it appears on your ID"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #E0E0E0',
                      borderRadius: 6,
                      fontSize: 14,
                      outline: 'none'
                    }}
                  />
                  <p style={{ fontSize: 11, color: '#919191', marginTop: 4 }}>
                    Enter your name as it appears on your ID for accurate delivery
                  </p>
                </div>

                {/* Phone & Email */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 0 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#0C0C0C', marginBottom: 6 }}>
                      Phone Number <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="01XXX-XXXXXX"
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1px solid #E0E0E0',
                        borderRadius: 6,
                        fontSize: 14,
                        outline: 'none'
                      }}
                    />
                    <p style={{ fontSize: 11, color: '#919191', marginTop: 4 }}>
                      Delivery partner will contact you
                    </p>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#0C0C0C', marginBottom: 6 }}>
                      Email Address <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1px solid #E0E0E0',
                        borderRadius: 6,
                        fontSize: 14,
                        outline: 'none'
                      }}
                    />
                    <p style={{ fontSize: 11, color: '#919191', marginTop: 4 }}>
                      We'll send order confirmation here
                    </p>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div style={{ 
                backgroundColor: '#FFFFFF', 
                borderRadius: 8, 
                padding: '20px 24px',
                marginBottom: 16,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Truck size={18} style={{ color: '#B08B5C' }} />
                  <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0C0C0C' }}>
                    Delivery Address
                  </h2>
                </div>

                {/* District & Area */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  {/* District */}
                  <div style={{ position: 'relative' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#0C0C0C', marginBottom: 6 }}>
                      District <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={districtSearch}
                        onChange={(e) => {
                          setDistrictSearch(e.target.value);
                          setShowDistrictDropdown(true);
                        }}
                        onFocus={() => setShowDistrictDropdown(true)}
                        placeholder="Type to search district..."
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          paddingRight: 36,
                          border: '1px solid #E0E0E0',
                          borderRadius: 6,
                          fontSize: 14,
                          outline: 'none'
                        }}
                      />
                      <ChevronDown size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#919191' }} />
                    </div>
                    
                    {showDistrictDropdown && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        maxHeight: 200,
                        overflowY: 'auto',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E0E0E0',
                        borderRadius: 6,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        zIndex: 20,
                        marginTop: 4
                      }}>
                        {filteredDistricts.slice(0, 10).map((d) => (
                          <button
                            type="button"
                            key={d.id}
                            onClick={() => handleDistrictSelect(d)}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              textAlign: 'left',
                              border: 'none',
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              fontSize: 13,
                              borderBottom: '1px solid #F0F0F0'
                            }}
                          >
                            {d.name}
                          </button>
                        ))}
                      </div>
                    )}
                    <p style={{ fontSize: 11, color: '#919191', marginTop: 4 }}>
                      Select your district to calculate shipping fee
                    </p>
                  </div>

                  {/* Area */}
                  <div style={{ position: 'relative' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#0C0C0C', marginBottom: 6 }}>
                      Area / Upazila <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={areaSearch}
                        onChange={(e) => {
                          setAreaSearch(e.target.value);
                          setShowAreaDropdown(true);
                        }}
                        onFocus={() => setShowAreaDropdown(true)}
                        placeholder={selectedDistrict ? 'Select area...' : 'Select district first'}
                        disabled={!selectedDistrict}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          paddingRight: 36,
                          border: '1px solid #E0E0E0',
                          borderRadius: 6,
                          fontSize: 14,
                          outline: 'none',
                          backgroundColor: selectedDistrict ? '#FFFFFF' : '#F5F5F5'
                        }}
                      />
                      <ChevronDown size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#919191' }} />
                    </div>
                    
                    {showAreaDropdown && selectedDistrict && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        maxHeight: 200,
                        overflowY: 'auto',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E0E0E0',
                        borderRadius: 6,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        zIndex: 20,
                        marginTop: 4
                      }}>
                        {filteredAreas.map((a) => (
                          <button
                            type="button"
                            key={a.id}
                            onClick={() => handleAreaSelect(a)}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              textAlign: 'left',
                              border: 'none',
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              fontSize: 13,
                              borderBottom: '1px solid #F0F0F0'
                            }}
                          >
                            {a.name}
                          </button>
                        ))}
                      </div>
                    )}
                    <p style={{ fontSize: 11, color: '#919191', marginTop: 4 }}>
                      Choose your area for faster delivery
                    </p>
                  </div>
                </div>

                {/* Street Address */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#0C0C0C', marginBottom: 6 }}>
                    Street Address <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="House number, road name, building, landmark..."
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #E0E0E0',
                      borderRadius: 6,
                      fontSize: 14,
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Note */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#0C0C0C', marginBottom: 6 }}>
                    Delivery Note (Optional)
                  </label>
                  <input
                    type="text"
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    placeholder="Any special instructions for delivery..."
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #E0E0E0',
                      borderRadius: 6,
                      fontSize: 14,
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Payment Options */}
              <div style={{ 
                backgroundColor: '#FFFFFF', 
                borderRadius: 8, 
                padding: '20px 24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <CreditCard size={18} style={{ color: '#B08B5C' }} />
                  <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0C0C0C' }}>
                    Payment Options
                  </h2>
                </div>

                {/* Payment Type Selection */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  {/* Partial Payment */}
                  <button
                    type="button"
                    onClick={() => setPaymentType('partial')}
                    style={{
                      padding: '14px 16px',
                      border: paymentType === 'partial' ? '2px solid #B08B5C' : '1px solid #E0E0E0',
                      borderRadius: 8,
                      backgroundColor: paymentType === 'partial' ? '#FDF8F3' : '#FFFFFF',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0C0C0C' }}>Pay Advance (COD)</span>
                      {paymentType === 'partial' && <CheckCircle size={16} style={{ color: '#B08B5C' }} />}
                    </div>
                    <p style={{ fontSize: 12, color: '#919191', marginBottom: 4 }}>
                      Pay ৳{deliveryCharge} now, rest on delivery
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#B08B5C' }}>
                      Pay Now: ৳{deliveryCharge}
                    </p>
                  </button>

                  {/* Full Payment */}
                  <button
                    type="button"
                    onClick={() => setPaymentType('full')}
                    style={{
                      padding: '14px 16px',
                      border: paymentType === 'full' ? '2px solid #B08B5C' : '1px solid #E0E0E0',
                      borderRadius: 8,
                      backgroundColor: paymentType === 'full' ? '#FDF8F3' : '#FFFFFF',
                      cursor: 'pointer',
                      textAlign: 'left',
                      position: 'relative'
                    }}
                  >
                    {/* Free Delivery Badge */}
                    <span style={{
                      position: 'absolute',
                      top: -8,
                      right: 8,
                      padding: '2px 8px',
                      backgroundColor: '#059669',
                      color: '#FFFFFF',
                      fontSize: 10,
                      fontWeight: 600,
                      borderRadius: 4
                    }}>
                      FREE DELIVERY
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0C0C0C' }}>Full Payment</span>
                      {paymentType === 'full' && <CheckCircle size={16} style={{ color: '#B08B5C' }} />}
                    </div>
                    <p style={{ fontSize: 12, color: '#919191', marginBottom: 4 }}>
                      Pay full amount, free delivery
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#B08B5C' }}>
                      Pay Now: ৳{subtotal}
                    </p>
                  </button>
                </div>

                {/* Payment Method */}
                <div>
                  <p style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 10 }}>
                    Select Payment Method
                  </p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {/* Bkash */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bkash')}
                      style={{
                        flex: 1,
                        padding: '12px',
                        border: paymentMethod === 'bkash' ? '2px solid #E2136E' : '1px solid #E0E0E0',
                        borderRadius: 8,
                        backgroundColor: paymentMethod === 'bkash' ? '#FDF2F8' : '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#E2136E' }}>bKash</span>
                    </button>

                    {/* Nagad */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('nagad')}
                      style={{
                        flex: 1,
                        padding: '12px',
                        border: paymentMethod === 'nagad' ? '2px solid #F6921E' : '1px solid #E0E0E0',
                        borderRadius: 8,
                        backgroundColor: paymentMethod === 'nagad' ? '#FFF7ED' : '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#F6921E' }}>Nagad</span>
                    </button>

                    {/* Upay */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upay')}
                      style={{
                        flex: 1,
                        padding: '12px',
                        border: paymentMethod === 'upay' ? '2px solid #00A651' : '1px solid #E0E0E0',
                        borderRadius: 8,
                        backgroundColor: paymentMethod === 'upay' ? '#F0FDF4' : '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#00A651' }}>Upay</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div style={{ 
              backgroundColor: '#FFFFFF', 
              borderRadius: 8, 
              padding: 20,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              position: 'sticky',
              top: 90
            }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0C0C0C', marginBottom: 16 }}>
                Order Summary
              </h2>

              {/* Products */}
              <div style={{ marginBottom: 16, maxHeight: 200, overflowY: 'auto' }}>
                {items.map((item, index) => (
                  <div key={index} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                    <div style={{ 
                      position: 'relative',
                      width: 50, 
                      height: 50, 
                      backgroundColor: '#F5F5F5', 
                      borderRadius: 6,
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Package size={20} style={{ color: '#D0D0D0' }} />
                        </div>
                      )}
                      <span style={{
                        position: 'absolute',
                        top: -4,
                        right: -4,
                        width: 18,
                        height: 18,
                        backgroundColor: '#B08B5C',
                        color: '#FFFFFF',
                        fontSize: 10,
                        fontWeight: 600,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {item.quantity}
                      </span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#0C0C0C', marginBottom: 2 }}>
                        {item.name}
                      </p>
                      <p style={{ fontSize: 12, color: '#919191' }}>
                        ৳{item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid #E8E8E8', paddingTop: 12 }}>
                {/* Subtotal */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: '#666' }}>Subtotal</span>
                  <span style={{ fontSize: 13, color: '#0C0C0C' }}>৳{subtotal.toLocaleString()}</span>
                </div>

                {/* Delivery */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, color: '#666' }}>Delivery</span>
                  <span style={{ fontSize: 13, color: paymentType === 'full' ? '#059669' : '#B08B5C' }}>
                    {paymentType === 'full' ? 'FREE' : `৳${deliveryCharge}`}
                  </span>
                </div>

                <div style={{ borderTop: '1px solid #E8E8E8', paddingTop: 12, marginBottom: 12 }}>
                  {/* Total */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#0C0C0C' }}>Total</span>
                    <span style={{ fontSize: 17, fontWeight: 700, color: '#0C0C0C' }}>
                      ৳{paymentType === 'full' ? subtotal.toLocaleString() : total.toLocaleString()}
                    </span>
                  </div>

                  {/* Payment Breakdown */}
                  <div style={{ backgroundColor: '#FAFAFA', borderRadius: 6, padding: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: '#666' }}>Pay Now ({paymentMethod})</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#B08B5C' }}>
                        ৳{paymentType === 'full' ? subtotal.toLocaleString() : deliveryCharge}
                      </span>
                    </div>
                    {paymentType === 'partial' && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12, color: '#666' }}>Pay on Delivery</span>
                        <span style={{ fontSize: 12, color: '#0C0C0C' }}>৳{subtotal.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '14px',
                    backgroundColor: '#B08B5C',
                    color: '#FFFFFF',
                    fontSize: 14,
                    fontWeight: 600,
                    border: 'none',
                    borderRadius: 6,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    textTransform: 'uppercase',
                    letterSpacing: 1
                  }}
                >
                  {loading ? 'Processing...' : `Pay ৳${paymentType === 'full' ? subtotal : deliveryCharge} & Place Order`}
                </button>

                {/* Security Note */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: 6,
                  marginTop: 12
                }}>
                  <Shield size={14} style={{ color: '#059669' }} />
                  <span style={{ fontSize: 11, color: '#919191' }}>
                    Your payment information is secure and encrypted
                  </span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Click outside to close dropdowns */}
      {(showDistrictDropdown || showAreaDropdown) && (
        <div 
          onClick={() => {
            setShowDistrictDropdown(false);
            setShowAreaDropdown(false);
          }}
          style={{ position: 'fixed', inset: 0, zIndex: 10 }}
        />
      )}

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Export with Suspense
export default function CheckoutPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CheckoutContent />
    </Suspense>
  );
}
