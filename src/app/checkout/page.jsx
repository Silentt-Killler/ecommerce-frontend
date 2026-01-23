'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronRight, ChevronLeft, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
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
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', district: '', area: '', address: '', note: '' });
  const [paymentType, setPaymentType] = useState('partial');
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  
  // Locations
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [deliveryCharge, setDeliveryCharge] = useState(60);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    if (user) setFormData(p => ({ ...p, name: user.name || '', phone: user.phone || '', email: user.email || '' }));
    return () => window.removeEventListener('resize', checkMobile);
  }, [user]);

  const subtotal = getSubtotal();
  const total = subtotal + (paymentType === 'full' ? 0 : deliveryCharge);

  const handleInputChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const nextStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.phone || !formData.district || !formData.address) {
        toast.error('Please complete shipping details');
        return;
      }
    }
    setStep(step + 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const orderData = { 
        items, shipping_address: formData, subtotal, 
        delivery_charge: (paymentType === 'full' ? 0 : deliveryCharge), 
        total, payment_type: paymentType, payment_method: paymentMethod 
      };
      const res = await api.post('/orders/guest', orderData);
      clearCart();
      router.push(`/order-success?order=${res.data.order_number}`);
    } catch (err) { toast.error('Failed to place order'); } finally { setLoading(false); }
  };

  if (!mounted) return <LoadingFallback />;

  // Styles
  const inputStyle = { width: '100%', height: 55, border: 'none', borderBottom: '1.5px solid #E5E5E5', fontSize: '15px', outline: 'none', marginBottom: 25, transition: '0.3s' };
  const labelStyle = { fontSize: '10px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', color: '#999', marginBottom: 5, display: 'block' };

  return (
    <div style={{ backgroundColor: '#FFF', minHeight: '100vh', color: '#111' }}>
      
      {/* TOP PROGRESS BAR */}
      <div style={{ paddingTop: 60, paddingBottom: 20, textAlign: 'center', borderBottom: '1px solid #F5F5F5', position: 'sticky', top: 0, background: '#FFF', zIndex: 100 }}>
         <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 15 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: step >= 1 ? '#000' : '#CCC' }}>ADDRESS</span>
            <ChevronRight size={14} color="#CCC" />
            <span style={{ fontSize: 11, fontWeight: 700, color: step >= 2 ? '#000' : '#CCC' }}>PAYMENT</span>
            <ChevronRight size={14} color="#CCC" />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#CCC' }}>CONFIRM</span>
         </div>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 20px' }}>
        
        {/* STEP 1: SHIPPING */}
        {step === 1 && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <h2 style={{ fontFamily: 'serif', fontSize: 28, marginBottom: 40 }}>Shipping Details</h2>
            
            <label style={labelStyle}>Full Name</label>
            <input name="name" value={formData.name} onChange={handleInputChange} style={inputStyle} placeholder="Full Name" />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <label style={labelStyle}>Phone</label>
                <input name="phone" value={formData.phone} onChange={handleInputChange} style={inputStyle} placeholder="017..." />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input name="email" value={formData.email} onChange={handleInputChange} style={inputStyle} placeholder="optional" />
              </div>
            </div>

            <label style={labelStyle}>Full Address</label>
            <input name="address" value={formData.address} onChange={handleInputChange} style={inputStyle} placeholder="House, Road, Area" />
            
            <button onClick={nextStep} style={{ width: '100%', height: 60, background: '#000', color: '#FFF', border: 'none', fontWeight: 600, fontSize: 13, letterSpacing: '2px', marginTop: 20, cursor: 'pointer' }}>
              CONTINUE TO PAYMENT
            </button>
          </div>
        )}

        {/* STEP 2: PAYMENT */}
        {step === 2 && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <div onClick={() => setStep(1)} style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 20, cursor: 'pointer', fontSize: 12, color: '#999' }}>
               <ChevronLeft size={14}/> Back to Address
            </div>
            <h2 style={{ fontFamily: 'serif', fontSize: 28, marginBottom: 40 }}>Payment Method</h2>

            {/* Payment Options (Premium Cards) */}
            <div style={{ display: 'grid', gap: 15, marginBottom: 40 }}>
               <div onClick={() => setPaymentType('partial')} style={{ padding: 25, border: paymentType === 'partial' ? '2px solid #000' : '1px solid #EEE', transition: '0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>ADVANCE PAYMENT</span>
                    {paymentType === 'partial' && <CheckCircle2 size={18} />}
                  </div>
                  <p style={{ fontSize: 12, color: '#666', marginTop: 10 }}>Pay only delivery charge ৳{deliveryCharge} to confirm.</p>
               </div>
               
               <div onClick={() => setPaymentType('full')} style={{ padding: 25, border: paymentType === 'full' ? '2px solid #000' : '1px solid #EEE', transition: '0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>FULL PAYMENT</span>
                    {paymentType === 'full' && <CheckCircle2 size={18} />}
                  </div>
                  <p style={{ fontSize: 12, color: '#009900', marginTop: 10 }}>Pay full amount & get Free Delivery.</p>
               </div>
            </div>

            {/* Gateway */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 40 }}>
               {['bkash', 'nagad', 'upay'].map(m => (
                 <button key={m} onClick={() => setPaymentMethod(m)} style={{ flex: 1, height: 50, border: '1px solid #EEE', background: paymentMethod === m ? '#000' : '#FFF', color: paymentMethod === m ? '#FFF' : '#000', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>{m}</button>
               ))}
            </div>

            {/* Order Final Box */}
            <div style={{ padding: 25, background: '#F9F9F9', marginBottom: 30 }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14 }}>
                  <span>Total Payable</span>
                  <span style={{ fontWeight: 700 }}>৳{total.toLocaleString()}</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#009900' }}>
                  <span>To Pay Now</span>
                  <span style={{ fontWeight: 700 }}>৳{(paymentType === 'full' ? total : deliveryCharge).toLocaleString()}</span>
               </div>
            </div>

            <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', height: 60, background: '#000', color: '#FFF', border: 'none', fontWeight: 600, fontSize: 13, letterSpacing: '2px', cursor: 'pointer' }}>
              {loading ? 'PROCESSING...' : 'PLACE ORDER NOW'}
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

export default function CheckoutPage() {
  return <Suspense fallback={<LoadingFallback />}><CheckoutContent /></Suspense>;
}
