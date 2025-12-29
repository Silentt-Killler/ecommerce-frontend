'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Check, Truck, CreditCard, Banknote, ChevronDown, Search, X, Shield, Gift } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';

// Bangladesh Districts & Areas Data
import { districts, getAreasByDistrict, getDeliveryCharge } from '@/data/bangladesh-locations';

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Autocomplete Dropdown Component
function AutocompleteInput({ 
  label, 
  placeholder, 
  options, 
  value, 
  onChange, 
  searchKeys = ['name', 'bn_name'],
  required = false,
  microcopy,
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (searchTerm) {
      const filtered = options.filter(option => 
        searchKeys.some(key => 
          option[key]?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [searchTerm, options, searchKeys]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setSearchTerm(option.name);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    if (!e.target.value) {
      onChange(null);
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0C0C0C', marginBottom: 8 }}>
        {label} {required && <span style={{ color: '#B00020' }}>*</span>}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            width: '100%',
            padding: '14px 40px 14px 16px',
            border: '1px solid #E0E0E0',
            borderRadius: 6,
            fontSize: 14,
            outline: 'none',
            transition: 'border-color 0.2s',
            backgroundColor: disabled ? '#F5F5F5' : '#FFFFFF'
          }}
        />
        <Search size={18} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#919191' }} />
      </div>
      
      {microcopy && (
        <p style={{ fontSize: 12, color: '#919191', marginTop: 6 }}>{microcopy}</p>
      )}

      {isOpen && filteredOptions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: 4,
          backgroundColor: '#FFFFFF',
          border: '1px solid #E0E0E0',
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          maxHeight: 250,
          overflowY: 'auto',
          zIndex: 100
        }}>
          {filteredOptions.slice(0, 20).map((option, index) => (
            <button
              key={option.id || index}
              type="button"
              onClick={() => handleSelect(option)}
              style={{
                width: '100%',
                padding: '12px 16px',
                textAlign: 'left',
                border: 'none',
                borderBottom: index < filteredOptions.length - 1 ? '1px solid #F3F4F6' : 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                transition: 'background-color 0.15s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#F7F7F7'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <span style={{ fontSize: 14, color: '#0C0C0C' }}>{option.name}</span>
              {option.bn_name && (
                <span style={{ fontSize: 13, color: '#919191', marginLeft: 8 }}>({option.bn_name})</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getItemCount, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [availableAreas, setAvailableAreas] = useState([]);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    district: null,
    area: null,
    address: '',
    paymentOption: 'advance', // 'advance' or 'full'
    notes: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Pre-fill if user is logged in
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  // Update areas when district changes
  useEffect(() => {
    if (formData.district) {
      const areas = getAreasByDistrict(formData.district.name);
      setAvailableAreas(areas);
      setFormData(prev => ({ ...prev, area: null }));
    } else {
      setAvailableAreas([]);
    }
  }, [formData.district]);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const baseDeliveryCharge = formData.district ? getDeliveryCharge(formData.district.name) : 60;
  
  // Payment option logic
  const isFullPayment = formData.paymentOption === 'full';
  const deliveryCharge = isFullPayment ? 0 : baseDeliveryCharge; // Free delivery for full payment
  const total = subtotal + deliveryCharge;
  const advanceAmount = isFullPayment ? total : baseDeliveryCharge;
  const codAmount = isFullPayment ? 0 : subtotal;

  const formatPrice = (price) => '৳' + price?.toLocaleString('en-BD');

  // Lead capture function - called when user fills form
  const captureLead = useCallback(
    debounce(async (data) => {
      // Only capture if we have phone number and at least name or address
      if (!data.phone || data.phone.length < 10) return;
      if (!data.fullName && !data.address) return;

      try {
        await api.post('/orders/leads/capture', {
          name: data.fullName,
          phone: data.phone,
          email: data.email,
          district: data.district?.name || '',
          area: data.area?.name || '',
          address: data.address,
          payment_option: data.paymentOption,
          cart_items: items.map(item => ({
            product_id: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })),
          cart_total: subtotal,
          source: 'checkout'
        });
        setLeadCaptured(true);
        console.log('Lead captured successfully');
      } catch (error) {
        console.log('Lead capture failed:', error);
      }
    }, 2000),
    [items, subtotal]
  );

  // Handle form change with lead capture
  const handleChange = (e) => {
    const newData = { ...formData, [e.target.name]: e.target.value };
    setFormData(newData);
    captureLead(newData);
  };

  // Handle autocomplete changes
  const handleDistrictChange = (district) => {
    const newData = { ...formData, district, area: null };
    setFormData(newData);
    captureLead(newData);
  };

  const handleAreaChange = (area) => {
    const newData = { ...formData, area };
    setFormData(newData);
    captureLead(newData);
  };

  // Handle payment option change
  const handlePaymentOptionChange = (option) => {
    const newData = { ...formData, paymentOption: option };
    setFormData(newData);
    captureLead(newData);
  };

  // Validate form
  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast.error('Please enter your full name');
      return false;
    }
    if (!formData.phone || formData.phone.length < 11) {
      toast.error('Please enter a valid 11-digit phone number');
      return false;
    }
    if (!formData.email || !formData.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (!formData.district) {
      toast.error('Please select your district');
      return false;
    }
    if (!formData.area) {
      toast.error('Please select your area');
      return false;
    }
    if (!formData.address.trim()) {
      toast.error('Please enter your full address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Create order data
      const orderData = {
        customer_name: formData.fullName,
        customer_phone: formData.phone,
        customer_email: formData.email,
        shipping_address: {
          district: formData.district.name,
          area: formData.area.name,
          address: formData.address,
          full_address: `${formData.address}, ${formData.area.name}, ${formData.district.name}`,
          country: 'Bangladesh',
          phone: formData.phone
        },
        delivery_zone: formData.district.delivery_zone,
        delivery_charge: deliveryCharge,
        payment_option: formData.paymentOption,
        advance_amount: advanceAmount,
        cod_amount: codAmount,
        notes: formData.notes || null,
        items: items.map(item => ({
          product_id: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          variant: item.variant || null
        })),
        subtotal: subtotal,
        total: total,
        // Courier data (for backend to use)
        courier_data: {
          recipient_name: formData.fullName,
          recipient_phone: formData.phone,
          recipient_address: `${formData.address}, ${formData.area.name}, ${formData.district.name}`,
          cod_amount: codAmount,
          district: formData.district.name,
          area: formData.area.name,
          pathao_city_id: formData.district.pathao_city_id,
          pathao_zone_id: formData.area.pathao_zone_id
        }
      };

      // If advance payment, redirect to payment gateway
      if (formData.paymentOption === 'advance' || formData.paymentOption === 'full') {
        // Save order as pending payment
        const response = await api.post('/orders/create-pending', orderData);
        const orderId = response.data.order_id || response.data._id;
        
        // Redirect to payment page
        router.push(`/payment?order=${orderId}&amount=${advanceAmount}`);
      } else {
        // Direct order (full COD - but we're not using this now)
        const response = await api.post('/orders/guest', orderData);
        
        if (clearCart) clearCart();
        localStorage.removeItem('cart-storage');
        
        toast.success('Order placed successfully!');
        router.push(`/order-success?order=${response.data.order_number || response.data._id}`);
      }
      
    } catch (error) {
      console.error('Order error:', error);
      toast.error(error.response?.data?.detail || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (!mounted) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #B08B5C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <h2 style={{ fontSize: 24, fontWeight: 500, marginBottom: 16, color: '#0C0C0C' }}>Your cart is empty</h2>
        <p style={{ color: '#919191', marginBottom: 24 }}>Add some products to checkout</p>
        <Link 
          href="/shop"
          style={{
            padding: '14px 40px',
            backgroundColor: '#0C0C0C',
            color: '#FFFFFF',
            textDecoration: 'none',
            fontSize: 14,
            letterSpacing: 1
          }}
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F7F7F7', minHeight: '100vh', paddingTop: 40, paddingBottom: 80 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        
        {/* Page Title */}
        <h1 style={{ 
          fontSize: 32, 
          fontWeight: 400, 
          letterSpacing: 4, 
          textAlign: 'center',
          marginBottom: 50,
          color: '#0C0C0C',
          textTransform: 'uppercase'
        }}>
          Checkout
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 40 }}>
          
          {/* Left - Form */}
          <div>
            <form onSubmit={handleSubmit}>
              
              {/* Customer Information */}
              <div style={{ 
                backgroundColor: '#FFFFFF', 
                padding: 32, 
                marginBottom: 24,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}>
                <h2 style={{ 
                  fontSize: 18, 
                  fontWeight: 600, 
                  color: '#0C0C0C',
                  marginBottom: 24,
                  paddingBottom: 16,
                  borderBottom: '1px solid #E8E8E8'
                }}>
                  Customer Information
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  {/* Full Name */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0C0C0C', marginBottom: 8 }}>
                      Full Name <span style={{ color: '#B00020' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        border: '1px solid #E0E0E0',
                        borderRadius: 6,
                        fontSize: 14,
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#0C0C0C'}
                      onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                    />
                    <p style={{ fontSize: 12, color: '#919191', marginTop: 6 }}>
                      Enter your name as it appears on your ID for accurate delivery
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0C0C0C', marginBottom: 8 }}>
                      Phone Number <span style={{ color: '#B00020' }}>*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="01XXX-XXXXXX"
                      required
                      maxLength={11}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        border: '1px solid #E0E0E0',
                        borderRadius: 6,
                        fontSize: 14,
                        outline: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#0C0C0C'}
                      onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                    />
                    <p style={{ fontSize: 12, color: '#919191', marginTop: 6 }}>
                      Our delivery partner will contact you on this number
                    </p>
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0C0C0C', marginBottom: 8 }}>
                      Email Address <span style={{ color: '#B00020' }}>*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      required
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        border: '1px solid #E0E0E0',
                        borderRadius: 6,
                        fontSize: 14,
                        outline: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#0C0C0C'}
                      onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                    />
                    <p style={{ fontSize: 12, color: '#919191', marginTop: 6 }}>
                      We'll send your order confirmation and invoice here
                    </p>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div style={{ 
                backgroundColor: '#FFFFFF', 
                padding: 32, 
                marginBottom: 24,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}>
                <h2 style={{ 
                  fontSize: 18, 
                  fontWeight: 600, 
                  color: '#0C0C0C',
                  marginBottom: 24,
                  paddingBottom: 16,
                  borderBottom: '1px solid #E8E8E8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}>
                  <Truck size={20} />
                  Delivery Address
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  {/* District */}
                  <AutocompleteInput
                    label="District"
                    placeholder="Type to search district..."
                    options={districts}
                    value={formData.district}
                    onChange={handleDistrictChange}
                    required={true}
                    microcopy="Select your district to calculate shipping fee"
                  />

                  {/* Area */}
                  <AutocompleteInput
                    label="Area / Upazila"
                    placeholder={formData.district ? "Type to search area..." : "Select district first"}
                    options={availableAreas}
                    value={formData.area}
                    onChange={handleAreaChange}
                    required={true}
                    disabled={!formData.district}
                    microcopy="Choose your area for faster delivery"
                  />

                  {/* Full Address */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0C0C0C', marginBottom: 8 }}>
                      Street Address <span style={{ color: '#B00020' }}>*</span>
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="House number, road name, building, landmark..."
                      required
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        border: '1px solid #E0E0E0',
                        borderRadius: 6,
                        fontSize: 14,
                        outline: 'none',
                        resize: 'vertical'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#0C0C0C'}
                      onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
                    />
                    <p style={{ fontSize: 12, color: '#919191', marginTop: 6 }}>
                      Include house number, road name, and nearby landmark for smooth delivery
                    </p>
                  </div>
                </div>

                {/* Delivery Charge Display */}
                {formData.district && (
                  <div style={{
                    marginTop: 20,
                    padding: '16px 20px',
                    backgroundColor: '#F7F7F7',
                    borderRadius: 8,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: 14, color: '#666' }}>
                      Delivery to <strong>{formData.district.name}</strong>
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 600, color: '#B08B5C' }}>
                      {formatPrice(baseDeliveryCharge)}
                    </span>
                  </div>
                )}
              </div>

              {/* Payment Options */}
              <div style={{ 
                backgroundColor: '#FFFFFF', 
                padding: 32, 
                marginBottom: 24,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}>
                <h2 style={{ 
                  fontSize: 18, 
                  fontWeight: 600, 
                  color: '#0C0C0C',
                  marginBottom: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}>
                  <CreditCard size={20} />
                  Payment Options
                </h2>
                <p style={{ fontSize: 13, color: '#919191', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #E8E8E8' }}>
                  Choose your preferred payment method
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  
                  {/* Option 1: Advance Payment */}
                  <label
                    onClick={() => handlePaymentOptionChange('advance')}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 16,
                      padding: '20px 24px',
                      border: formData.paymentOption === 'advance' ? '2px solid #0C0C0C' : '1px solid #E0E0E0',
                      borderRadius: 8,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: formData.paymentOption === 'advance' ? '#FAFAFA' : '#FFFFFF'
                    }}
                  >
                    <div style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      border: formData.paymentOption === 'advance' ? '7px solid #0C0C0C' : '2px solid #CCC',
                      transition: 'all 0.2s',
                      flexShrink: 0,
                      marginTop: 2
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <Banknote size={20} style={{ color: formData.paymentOption === 'advance' ? '#0C0C0C' : '#919191' }} />
                        <span style={{ fontSize: 16, fontWeight: 600, color: '#0C0C0C' }}>
                          Pay Delivery Charge Now
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: '#666', marginBottom: 10 }}>
                        Pay {formatPrice(baseDeliveryCharge)} advance via bKash/Nagad. 
                        Pay remaining {formatPrice(subtotal)} to rider on delivery.
                      </p>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <Image src="/images/bkash.png" alt="bKash" width={50} height={20} style={{ objectFit: 'contain' }} onError={(e) => e.target.style.display = 'none'} />
                        <Image src="/images/nagad.png" alt="Nagad" width={50} height={20} style={{ objectFit: 'contain' }} onError={(e) => e.target.style.display = 'none'} />
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ fontSize: 18, fontWeight: 700, color: '#B08B5C' }}>
                        {formatPrice(baseDeliveryCharge)}
                      </span>
                      <p style={{ fontSize: 11, color: '#919191' }}>advance</p>
                    </div>
                  </label>

                  {/* Option 2: Full Payment */}
                  <label
                    onClick={() => handlePaymentOptionChange('full')}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 16,
                      padding: '20px 24px',
                      border: formData.paymentOption === 'full' ? '2px solid #0C0C0C' : '1px solid #E0E0E0',
                      borderRadius: 8,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: formData.paymentOption === 'full' ? '#FAFAFA' : '#FFFFFF',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Free Delivery Badge */}
                    <div style={{
                      position: 'absolute',
                      top: 12,
                      right: -30,
                      backgroundColor: '#1E7F4F',
                      color: '#FFFFFF',
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '4px 35px',
                      transform: 'rotate(45deg)'
                    }}>
                      FREE DELIVERY
                    </div>

                    <div style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      border: formData.paymentOption === 'full' ? '7px solid #0C0C0C' : '2px solid #CCC',
                      transition: 'all 0.2s',
                      flexShrink: 0,
                      marginTop: 2
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <CreditCard size={20} style={{ color: formData.paymentOption === 'full' ? '#0C0C0C' : '#919191' }} />
                        <span style={{ fontSize: 16, fontWeight: 600, color: '#0C0C0C' }}>
                          Pay Full Amount
                        </span>
                        <Gift size={16} style={{ color: '#1E7F4F' }} />
                      </div>
                      <p style={{ fontSize: 13, color: '#666', marginBottom: 10 }}>
                        Complete payment now via bKash/Nagad and enjoy <strong style={{ color: '#1E7F4F' }}>FREE delivery</strong>!
                      </p>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <Image src="/images/bkash.png" alt="bKash" width={50} height={20} style={{ objectFit: 'contain' }} onError={(e) => e.target.style.display = 'none'} />
                        <Image src="/images/nagad.png" alt="Nagad" width={50} height={20} style={{ objectFit: 'contain' }} onError={(e) => e.target.style.display = 'none'} />
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ fontSize: 18, fontWeight: 700, color: '#0C0C0C' }}>
                        {formatPrice(subtotal)}
                      </span>
                      <p style={{ fontSize: 11, color: '#1E7F4F', fontWeight: 500 }}>Save {formatPrice(baseDeliveryCharge)}</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Order Notes */}
              <div style={{ 
                backgroundColor: '#FFFFFF', 
                padding: 32,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}>
                <h2 style={{ 
                  fontSize: 18, 
                  fontWeight: 600, 
                  color: '#0C0C0C',
                  marginBottom: 20
                }}>
                  Order Notes <span style={{ color: '#919191', fontWeight: 400, fontSize: 14 }}>(Optional)</span>
                </h2>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any special instructions for your order..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '1px solid #E0E0E0',
                    borderRadius: 6,
                    fontSize: 14,
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
                <p style={{ fontSize: 12, color: '#919191', marginTop: 6 }}>
                  Special delivery instructions or product preferences
                </p>
              </div>

            </form>
          </div>

          {/* Right - Order Summary */}
          <div>
            <div style={{ 
              backgroundColor: '#FFFFFF', 
              padding: 32,
              position: 'sticky',
              top: 100,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <h2 style={{ 
                fontSize: 18, 
                fontWeight: 600, 
                color: '#0C0C0C',
                marginBottom: 24,
                paddingBottom: 16,
                borderBottom: '1px solid #E8E8E8'
              }}>
                Order Summary
              </h2>

              {/* Products */}
              <div style={{ marginBottom: 24 }}>
                {items.map((item, index) => (
                  <div 
                    key={index}
                    style={{ 
                      display: 'flex', 
                      gap: 16, 
                      paddingBottom: 16,
                      marginBottom: 16,
                      borderBottom: index < items.length - 1 ? '1px solid #F0F0F0' : 'none'
                    }}
                  >
                    {/* Product Image */}
                    <div style={{ 
                      width: 70, 
                      height: 88, 
                      backgroundColor: '#F5F5F5',
                      position: 'relative',
                      flexShrink: 0
                    }}>
                      {item.image && (
                        <Image 
                          src={item.image} 
                          alt={item.name}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      )}
                      {/* Quantity Badge */}
                      <div style={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        width: 22,
                        height: 22,
                        backgroundColor: '#0C0C0C',
                        color: '#FFFFFF',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 600
                      }}>
                        {item.quantity}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        fontSize: 14, 
                        fontWeight: 500, 
                        color: '#0C0C0C',
                        marginBottom: 4,
                        lineHeight: 1.4
                      }}>
                        {item.name}
                      </h4>
                      {item.variant?.size && (
                        <p style={{ fontSize: 12, color: '#919191' }}>
                          Size: {item.variant.size}
                          {item.variant.color && ` / ${item.variant.color}`}
                        </p>
                      )}
                      <p style={{ 
                        fontSize: 14, 
                        fontWeight: 600, 
                        color: '#0C0C0C',
                        marginTop: 8
                      }}>
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div style={{ borderTop: '1px solid #E8E8E8', paddingTop: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 14, color: '#666' }}>Subtotal</span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#0C0C0C' }}>{formatPrice(subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 14, color: '#666' }}>Delivery</span>
                  {isFullPayment ? (
                    <span style={{ fontSize: 14, fontWeight: 500 }}>
                      <span style={{ textDecoration: 'line-through', color: '#919191', marginRight: 8 }}>{formatPrice(baseDeliveryCharge)}</span>
                      <span style={{ color: '#1E7F4F' }}>FREE</span>
                    </span>
                  ) : (
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#B08B5C' }}>{formatPrice(deliveryCharge)}</span>
                  )}
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  paddingTop: 16,
                  borderTop: '2px solid #0C0C0C'
                }}>
                  <span style={{ fontSize: 18, fontWeight: 600, color: '#0C0C0C' }}>Total</span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: '#0C0C0C' }}>{formatPrice(total)}</span>
                </div>

                {/* Payment Breakdown */}
                <div style={{ 
                  marginTop: 16, 
                  padding: '16px', 
                  backgroundColor: '#F7F7F7', 
                  borderRadius: 8 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: '#666' }}>Pay Now ({formData.paymentOption === 'full' ? 'Full' : 'Advance'})</span>
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#B08B5C' }}>{formatPrice(advanceAmount)}</span>
                  </div>
                  {codAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, color: '#666' }}>Pay on Delivery</span>
                      <span style={{ fontSize: 15, fontWeight: 600, color: '#0C0C0C' }}>{formatPrice(codAmount)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '18px',
                  marginTop: 24,
                  backgroundColor: '#B08B5C',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: 15,
                  fontWeight: 600,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#8B6B3D')}
                onMouseOut={(e) => e.target.style.backgroundColor = '#B08B5C'}
              >
                {loading ? 'Processing...' : `Pay ${formatPrice(advanceAmount)} & Place Order`}
              </button>

              {/* Security Note */}
              <div style={{ 
                textAlign: 'center', 
                marginTop: 16,
                padding: '12px',
                backgroundColor: '#F7F7F7',
                borderRadius: 6
              }}>
                <p style={{ 
                  fontSize: 12, 
                  color: '#666',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}>
                  <Shield size={14} style={{ color: '#1E7F4F' }} />
                  Your payment information is secure and encrypted
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
