import { Suspense } from 'react';
import OrderSuccessContent from './OrderSuccessContent';

export const dynamic = 'force-dynamic';

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
