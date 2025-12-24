'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Truck, Phone, Mail, ArrowRight } from 'lucide-react';

// Loading component
function LoadingSpinner() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-10 h-10 border-3 border-[#B08B5C] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// Main content component that uses useSearchParams
function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Clear cart from localStorage after successful order
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cart-storage');
    }
  }, []);

  if (!mounted) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-[#F7F7F7] min-h-screen pt-16 pb-20">
      <div className="max-w-[650px] mx-auto px-6">
        
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-[#D1FAE5] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={50} className="text-[#059669]" />
          </div>
          
          <h1 className="text-3xl font-semibold text-[#0C0C0C] mb-3">
            Order Placed Successfully!
          </h1>
          
          <p className="text-base text-[#666] leading-relaxed">
            Thank you for your order. We've received your order and will process it shortly.
          </p>
        </div>

        {/* Order Number Card */}
        <div className="bg-white p-8 text-center mb-6 shadow-sm">
          <p className="text-sm text-[#919191] mb-2 uppercase tracking-wider">
            Order Number
          </p>
          <p className="text-3xl font-bold text-[#0C0C0C] tracking-wider font-mono">
            {orderNumber || 'N/A'}
          </p>
          <p className="text-[13px] text-[#919191] mt-3">
            Please save this number for tracking your order
          </p>
        </div>

        {/* Order Timeline */}
        <div className="bg-white p-8 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0C0C0C] mb-6">
            What happens next?
          </h2>
          
          <div className="flex flex-col gap-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="w-11 h-11 bg-[#D1FAE5] rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle size={22} className="text-[#059669]" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-[#0C0C0C] mb-1">
                  Order Confirmed
                </h3>
                <p className="text-sm text-[#666]">
                  Your order has been received and confirmed
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="w-11 h-11 bg-[#FEF3C7] rounded-full flex items-center justify-center flex-shrink-0">
                <Package size={22} className="text-[#D97706]" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-[#0C0C0C] mb-1">
                  Processing
                </h3>
                <p className="text-sm text-[#666]">
                  We are preparing your order for shipment
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="w-11 h-11 bg-[#E0E7FF] rounded-full flex items-center justify-center flex-shrink-0">
                <Truck size={22} className="text-[#4F46E5]" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-[#0C0C0C] mb-1">
                  Out for Delivery
                </h3>
                <p className="text-sm text-[#666]">
                  Your order will be delivered within 2-5 business days
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white p-8 mb-8 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0C0C0C] mb-5">
            Need Help?
          </h2>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Phone size={18} className="text-[#B08B5C]" />
              <div>
                <p className="text-sm text-[#666]">Call us at</p>
                <p className="text-[15px] font-semibold text-[#0C0C0C]">+880 1XXX-XXXXXX</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-[#B08B5C]" />
              <div>
                <p className="text-sm text-[#666]">Email us at</p>
                <p className="text-[15px] font-semibold text-[#0C0C0C]">support@prismin.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link
            href="/shop"
            className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-white text-[#0C0C0C] border border-[#0C0C0C] text-sm font-semibold tracking-wide hover:bg-[#0C0C0C] hover:text-white transition-colors"
          >
            Continue Shopping
          </Link>
          
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-[#0C0C0C] text-white text-sm font-semibold tracking-wide hover:bg-[#333] transition-colors"
          >
            Back to Home
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* WhatsApp Support */}
        <div className="mt-8 p-6 bg-[#D1FAE5] rounded-xl text-center">
          <p className="text-sm text-[#065F46] mb-3">
            💬 Questions about your order?
          </p>
          <a
            href="https://wa.me/880XXXXXXXXXX"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-lg text-sm font-semibold hover:bg-[#1da851] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Chat on WhatsApp
          </a>
        </div>

      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <OrderSuccessContent />
    </Suspense>
  );
}
