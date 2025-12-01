'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');

  return (
    <div className="container-custom py-16">
      <div className="max-w-md mx-auto text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={48} className="text-green-600" />
        </div>

        <h1 className="text-3xl font-bold mb-4">Order Placed!</h1>
        
        <p className="text-muted mb-2">Thank you for your order.</p>
        
        {orderNumber && (
          <p className="text-lg mb-6">
            Order Number: <span className="font-bold text-gold">{orderNumber}</span>
          </p>
        )}

        <p className="text-sm text-muted mb-8">
          We'll send you an update when your order is on its way.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/orders" className="btn-primary">
            View My Orders
          </Link>
          <Link href="/shop" className="btn-secondary">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container-custom py-16 text-center">
        <p className="text-muted">Loading...</p>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
