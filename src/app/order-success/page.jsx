import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const OrderSuccessContent = dynamic(
  () => import('./OrderSuccessContent'),
  { 
    ssr: false,
    loading: () => (
      <div className="container-custom py-16 text-center">
        <p className="text-muted">Loading...</p>
      </div>
    )
  }
);

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="container-custom py-16 text-center"><p>Loading...</p></div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
