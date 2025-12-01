import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const ShopContent = dynamic(
  () => import('./ShopContent'),
  { 
    ssr: false,
    loading: () => (
      <div className="container-custom py-8">
        <div className="text-center py-16">
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    )
  }
);

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="container-custom py-8 text-center"><p>Loading...</p></div>}>
      <ShopContent />
    </Suspense>
  );
}
